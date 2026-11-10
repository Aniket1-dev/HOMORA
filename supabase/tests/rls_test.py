import pgserver, psycopg2, uuid, threading, warnings
warnings.filterwarnings('ignore')
db=pgserver.get_server('/tmp/homora_pgdata', cleanup_mode=None)
db.psql('drop schema if exists public cascade; create schema public; drop schema if exists auth cascade; drop schema if exists storage cascade; drop role if exists anon; drop role if exists authenticated;')
db.psql(open('supabase/tests/supabase_shim.sql').read())
# Supabase grants everything to anon/authenticated by default; RLS + revokes in the migration do the restricting.
db.psql('grant usage on schema public to anon, authenticated; alter default privileges in schema public grant all on tables to anon, authenticated; alter default privileges in schema public grant execute on functions to anon, authenticated;')
db.psql(open('supabase/migrations/0001_homora_schema.sql').read())
db.psql('grant usage on schema storage to anon, authenticated; grant all on storage.objects, storage.buckets to anon, authenticated;')

def conn(): 
    c=psycopg2.connect(host='/tmp/homora_pgdata',dbname='postgres',user='postgres'); c.autocommit=True; return c
admin_c=conn()
def su(sql,*a):
    cur=admin_c.cursor(); cur.execute(sql,a)
    try: return cur.fetchall()
    except psycopg2.ProgrammingError: return None
def as_(role,uid,sql,*a,c=None):
    c=c or conn(); cur=c.cursor()
    cur.execute(f"set role {role}")
    cur.execute("select set_config('request.jwt.claim.sub', %s, false)",(uid or '',))
    try:
        q=sql
        if q.lstrip().lower().startswith(('update','delete','insert')) and 'returning' not in q.lower(): q=q+' returning 1'
        cur.execute(q,a)
        rows=cur.fetchall()
        return ('ok',rows if sql.lstrip().lower().startswith(('select','update','delete','insert')) and 'returning' in sql.lower() or sql.lstrip().lower().startswith('select') else len(rows))
    except Exception as e:
        return ('err',str(e).strip().splitlines()[0])
    finally:
        cur.execute("reset role")

A,B,ADM,T=[str(uuid.uuid4()) for _ in range(4)]
for u,e in ((A,'a@x'),(B,'b@x'),(ADM,'adm@x'),(T,'t@x')): su("insert into auth.users(id,email) values (%s,%s)",u,e)
su("insert into user_roles values (%s,'admin')",ADM)
results=[]
def check(name,cond,detail=''):
    results.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name,detail if not cond else '')

# --- properties: owner can't self-publish / self-verify; others can't edit
r=as_('authenticated',A,"insert into properties(title,status,owner_verified,rating,rent,city) values ('A-listing','published',true,5,5000,'Delhi') returning id,status,owner_verified,rating")
pa=r[1][0][0] if r[0]=='ok' else None
check('owner insert forced to draft / unverified / rating 0', r[0]=='ok' and r[1][0][1:]==('draft',False,0), r)
r=as_('authenticated',A,"update properties set status='published' where id=%s",pa); check('owner cannot self-publish', r[0]=='err', r)
r=as_('authenticated',A,"update properties set owner_verified=true, views=999 where id=%s returning owner_verified,views",pa)
check('owner cannot change verified/views (silently reset)', r[0]=='ok' and r[1][0]==(False,0), r)
r=as_('authenticated',B,"update properties set title='hacked' where id=%s",pa); check('other owner cannot edit property', r==('ok',0), r)
r=as_('authenticated',A,"update properties set status='pending' where id=%s",pa); check('owner can submit for review', r==('ok',1), r)
check('anon cannot see unpublished', as_('anon',None,"select id from properties where id=%s",pa)==('ok',[]))
r=as_('authenticated',ADM,"update properties set status='published' where id=%s",pa); check('admin can publish', r==('ok',1), r)
check('anon sees published', len(as_('anon',None,"select id from properties where id=%s",pa)[1])==1)
check('non-admin cannot select reports', as_('authenticated',A,"select 1 from reports")==('ok',[]))

# --- rooms/beds ownership
room=str(uuid.uuid4())
r=as_('authenticated',B,"insert into rooms(id,property_id,room_number) values (%s,%s,'1')",room,pa); check('other owner cannot add rooms', r[0]=='err', r)
r=as_('authenticated',A,"insert into rooms(id,property_id,room_number) values (%s,%s,'1')",room,pa); check('owner adds room', r[0]=='ok', r)
beds=[str(uuid.uuid4()) for _ in range(3)]
for i,b in enumerate(beds):
    as_('authenticated',A,"insert into beds(id,property_id,room_id,room_number,bed_number,monthly_rent) values (%s,%s,%s,'1',%s,6000)",b,pa,room,f'1-{chr(65+i)}')
r=su("select total_beds,available_beds from properties where id=%s",pa); check('bed counters derived by trigger', r==[(3,3)], r)

# --- booking RPC
import json
def book(uid,bed,name='Rahul Kumar',phone='9810012345'):
    return as_('anon' if not uid else 'authenticated',uid,"select manage_booking(%s::jsonb)",json.dumps({'action':'create','propertyId':pa,'bedId':bed,'tenantName':name,'phone':phone}))
r=book(None,beds[0]); b1=r[1][0][0]; check('guest can create booking', 'booking' in b1, r)
check('server-side price (6000 from bed, not client)', b1['booking']['monthlyRent']==6000)
r=book(None,beds[0],phone='9810099999'); check('same bed cannot be double booked', 'error' in r[1][0][0], r)
check('bed marked reserved, counters updated', su("select status from beds where id=%s",beds[0])==[('reserved',)] and su("select available_beds from properties where id=%s",pa)==[(2,)])
r=as_('anon',None,"select manage_booking(%s::jsonb)",json.dumps({'action':'create','propertyId':pa,'bedId':beds[1],'tenantName':'X','phone':'123'})); check('invalid phone rejected', 'error' in r[1][0][0])
bid=b1['booking']['id']
r=as_('authenticated',B,"select manage_booking(%s::jsonb)",json.dumps({'action':'approve','bookingId':bid})); check('non-owner cannot approve', r[1][0][0].get('error')=='Not allowed.', r)
r=as_('authenticated',A,"select manage_booking(%s::jsonb)",json.dumps({'action':'approve','bookingId':bid})); check('owner approves', r[1][0][0]['booking']['status']=='approved', r)
r=as_('authenticated',A,"select manage_booking(%s::jsonb)",json.dumps({'action':'confirm','bookingId':bid})); check('owner confirms -> bed occupied', su("select status from beds where id=%s",beds[0])==[('occupied',)], r)
r=as_('anon',None,"select manage_booking(%s::jsonb)",json.dumps({'action':'cancel','bookingId':bid})); check('guest cannot cancel a CONFIRMED booking', 'error' in r[1][0][0], r)
r=as_('authenticated',A,"select manage_booking(%s::jsonb)",json.dumps({'action':'cancel','bookingId':bid})); check('owner cancels -> bed released', su("select status from beds where id=%s",beds[0])==[('available',)], r)
check('anon cannot read bookings table', as_('anon',None,"select * from bookings")[0]=='err' or as_('anon',None,"select * from bookings")[1]==[])
check('tenant of other owner cannot read booking', as_('authenticated',B,"select id from bookings")==('ok',[]))
check('owner can read own bookings', len(as_('authenticated',A,"select id from bookings")[1])==1)
check('direct booking insert denied', as_('authenticated',B,"insert into bookings(reference,property_id,tenant_name,phone) values ('X',%s,'a','1')",pa)[0]=='err')
check('direct booking update denied', as_('authenticated',A,"update bookings set status='confirmed' where id=%s",bid)[0]=='err' or as_('authenticated',A,"update bookings set status='confirmed' where id=%s",bid)[1]==0)

# --- concurrency: 8 simultaneous attempts on one bed
target=beds[2]; outcomes=[]
def worker(i):
    outcomes.append(book(None,target,phone=f'98100000{i:02d}')[1][0][0])
ts=[threading.Thread(target=worker,args=(i,)) for i in range(8)]; [t.start() for t in ts]; [t.join() for t in ts]
wins=[o for o in outcomes if 'booking' in o]; check('concurrency: exactly 1 of 8 simultaneous bookings wins', len(wins)==1, f'{len(wins)} won')
check('concurrency: one active booking row for the bed', su("select count(*) from bookings where bed_id=%s and status in ('requested','approved','confirmed')",target)==[(1,)])

# --- visits / enquiries / reviews / reports
v=str(uuid.uuid4())
r=as_('anon',None,"insert into visits(id,property_id,visitor_name,phone,date) values (%s,%s,'V','9810012345','2030-01-01')",v,pa); check('anon can request visit', r[0]=='ok', r)
check('anon cannot read visits', as_('anon',None,"select id from visits")[0]=='err' or as_('anon',None,"select id from visits")[1]==[])
check('owner sees visit on own property', len(as_('authenticated',A,"select id from visits")[1])==1)
check('other owner cannot see visit', as_('authenticated',B,"select id from visits")[1]==[])
r=as_('authenticated',A,"update visits set status='confirmed' where id=%s",v); check('owner can confirm visit', r==('ok',1), r)
r=as_('authenticated',A,"update visits set phone='000' where id=%s",v); check('owner cannot edit visitor phone (column privilege)', r[0]=='err', r)
r=as_('anon',None,"insert into visits(id,property_id,visitor_name,phone,date,status) values (%s,%s,'V','9810012345','2030-01-01','confirmed')",str(uuid.uuid4()),pa); check('anon cannot self-confirm a visit', r[0]=='err', r)
r=as_('anon',None,"select cancel_visit(%s)",v); check('guest cancel RPC works on its id', su("select status from visits where id=%s",v)==[('cancelled',)], r)
e=str(uuid.uuid4())
check('anon can send enquiry', as_('anon',None,"insert into enquiries(id,property_id,name,phone) values (%s,%s,'E','9810012345')",e,pa)[0]=='ok')
check('owner cannot edit enquiry phone', as_('authenticated',A,"update enquiries set phone='1' where id=%s",e)[0]=='err')
check('owner can set enquiry status/note', as_('authenticated',A,"update enquiries set status='contacted', owner_note='called' where id=%s",e)==('ok',1))
r=as_('anon',None,"insert into reviews(property_id,author_name,overall,text) values (%s,'R',4,'nice place')",pa); check('anon review accepted', r[0]=='ok', r)
as_('anon',None,"insert into reviews(property_id,author_name,overall,text) values (%s,'R2',5,'great place')",pa)
check('rating recalculated', su("select rating,review_count from properties where id=%s",pa)==[(4.5,2)])
check('anon cannot post verified review', as_('anon',None,"insert into reviews(property_id,author_name,overall,text,verified_tenancy) values (%s,'R',4,'nice place',true)",pa)[0]=='err')
check('anon can report', as_('anon',None,"insert into reports(target_type,target_id,reason) values ('property',%s,'spam')",pa)[0]=='ok')
check('admin reads reports', len(as_('authenticated',ADM,"select id from reports")[1])==1)
check('views RPC increments', as_('anon',None,"select increment_property_views(%s)",pa)[0]=='ok' and su("select views from properties where id=%s",pa)==[(1,)])
r=as_('anon',None,"select get_my_requests(%s::uuid[],%s::uuid[],%s::uuid[])",[bid],[v],[e]); d=r[1][0][0]
check('get_my_requests returns only the ids given', len(d['bookings'])==1 and len(d['visits'])==1 and len(d['enquiries'])==1, r)

# --- roommates: contact email privacy
pr_a,pr_b=str(uuid.uuid4()),str(uuid.uuid4())
as_('authenticated',A,"insert into roommate_profiles(id,display_name,contact_email) values (%s,'Asha','asha@secret.com')",pr_a)
as_('authenticated',B,"insert into roommate_profiles(id,display_name,contact_email) values (%s,'Bala','bala@secret.com')",pr_b)
check('cannot select contact_email directly', as_('authenticated',B,"select contact_email from roommate_profiles")[0]=='err')
check('cannot select * (column privilege)', as_('authenticated',B,"select * from roommate_profiles")[0]=='err')
check('can select non-sensitive columns of others', len(as_('authenticated',B,"select id,display_name from roommate_profiles")[1])==2)
check('anon cannot read roommate profiles', as_('anon',None,"select id from roommate_profiles")[0]=='err')
check('contact RPC before connection: only own email', [x[1] for x in as_('authenticated',B,"select * from roommate_contact_emails()")[1]]==['bala@secret.com'])
c=str(uuid.uuid4())
check('B can send connection request', as_('authenticated',B,"insert into roommate_connections(id,from_profile_id,to_profile_id) values (%s,%s,%s)",c,pr_b,pr_a)[0]=='ok')
check('B cannot forge request as A', as_('authenticated',B,"insert into roommate_connections(from_profile_id,to_profile_id) values (%s,%s)",pr_a,pr_b)[0]=='err')
check('sender cannot accept own request', as_('authenticated',B,"update roommate_connections set status='accepted' where id=%s",c)==('ok',0))
check('recipient accepts', as_('authenticated',A,"update roommate_connections set status='accepted' where id=%s",c)==('ok',1))
check('contact RPC after accept shares email', sorted(x[1] for x in as_('authenticated',B,"select * from roommate_contact_emails()")[1])==['asha@secret.com','bala@secret.com'])
check('stranger sees no connection', as_('authenticated',T,"select id from roommate_connections")[1]==[])

# --- verification docs
ov=str(uuid.uuid4())
check('owner can submit verification', as_('authenticated',A,"insert into owner_verifications(id,owner_name,status) values (%s,'A','pending')",ov)[0]=='ok')
check('owner cannot self-approve', as_('authenticated',A,"update owner_verifications set status='approved' where id=%s",ov)[0]=='err' or as_('authenticated',A,"update owner_verifications set status='approved' where id=%s",ov)[1]==0)
check('other user cannot read verification', as_('authenticated',B,"select id from owner_verifications")[1]==[])
check('admin approves verification', as_('authenticated',ADM,"update owner_verifications set status='approved' where id=%s",ov)==('ok',1))
check('storage: user can upload only into own folder', as_('authenticated',A,"insert into storage.objects(bucket_id,name) values ('verification-docs',%s)",f'{A}/doc.pdf')[0]=='ok' and as_('authenticated',A,"insert into storage.objects(bucket_id,name) values ('verification-docs',%s)",f'{B}/doc.pdf')[0]=='err')
check('storage: other user cannot read my KYC doc', as_('authenticated',B,"select name from storage.objects where bucket_id='verification-docs'")[1]==[])
check('storage: admin can read KYC docs', len(as_('authenticated',ADM,"select name from storage.objects where bucket_id='verification-docs'")[1])==1)

p=sum(1 for _,ok in results if ok); print(f"\n{p}/{len(results)} passed")
