import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const origins = new Set([
  "https://homora-admin.vercel.app",
  "https://homorodemo.vercel.app",
  "https://homora-partner-connected.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173"
]);

const entities: Record<string, { table: string; module: string }> = {
  Property:{table:"properties",module:"properties"}, Room:{table:"rooms",module:"inventory"},
  Bed:{table:"beds",module:"inventory"}, Booking:{table:"bookings",module:"bookings"},
  Visit:{table:"visits",module:"visits"}, Enquiry:{table:"enquiries",module:"enquiries"},
  Review:{table:"reviews",module:"moderation"}, Report:{table:"reports",module:"moderation"},
  OwnerVerification:{table:"owner_verifications",module:"verification"},
  PartnerAccount:{table:"partner_accounts",module:"partners"},
  SupportTicket:{table:"support_tickets",module:"support"},
  AdminNotification:{table:"admin_notifications",module:"activity"},
  AuditLog:{table:"audit_logs",module:"activity"}, CmsContent:{table:"cms_content",module:"cms"},
  PlatformSetting:{table:"platform_settings",module:"settings"}
};
const readPermissions: Record<string,string[]> = {
  super_admin:["*"],
  operations_admin:["properties","partners","users","bookings","inventory","enquiries","visits","moderation","activity"],
  verification_admin:["verification","partners","activity"],
  support_admin:["support","enquiries","visits","users","moderation","activity"],
  read_only:["*"]
};
const writePermissions: Record<string,string[]> = {
  super_admin:["*"],
  operations_admin:["properties","partners","users","bookings","inventory","enquiries","visits","moderation","activity"],
  verification_admin:["verification","partners","activity"],
  support_admin:["support","enquiries","visits","users","moderation","activity"],
  read_only:[]
};
const fieldMaps: Record<string,Record<string,string>> = {
  Property:{name:"title",monthly_rent_min:"rent",submitted_at:"created_at"},
  Booking:{code:"reference",property_name:"property_title",tenant_phone:"phone",tenant_email:"email"},
  Visit:{property_name:"property_title",tenant_name:"visitor_name",tenant_phone:"phone",tenant_email:"email",requested_date:"date",time_slot:"time"},
  Enquiry:{property_name:"property_title",tenant_name:"name",tenant_phone:"phone",tenant_email:"email"},
  Review:{property_name:"property_title",rating:"overall",comment:"text"},
  Report:{target_name:"target_title",description:"details",category:"reason",resolution_notes:"admin_note"},
  OwnerVerification:{owner_email:"email",business_type:"owner_type"},
  PartnerAccount:{business_type:"account_type",account_status:"status"},
  SupportTicket:{resolution_notes:"resolution"},
  Room:{property_name:"properties.title",city:"properties.city"},
  Bed:{property_name:"properties.title",city:"properties.city",bed_label:"bed_number"}
};
const virtual = new Set(["created_date","updated_date","submitted_at","partner_name","property_name","owner_name","owner_email","properties_count","property_count","rooms_count","beds_count","active_bookings","member_count","verification_status","documents","document_uris","document_count","duration_months","source","flagged","requester_name","requester_type","requester_email"]);

function response(data:unknown,status=200,origin="") {
  const allowed = origin && (origins.has(origin) || /^https:\/\/(?:homora-admin|homorodemo|homora-partner-connected)(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) ? origin : "null";
  return new Response(JSON.stringify(data),{status,headers:{
    "Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowed,
    "Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods":"GET,POST,PATCH,PUT,DELETE,OPTIONS","Vary":"Origin","Cache-Control":"no-store"
  }});
}
function fail(message:string,status=400):never { const e=new Error(message) as Error & {status?:number}; e.status=status; throw e; }
function parse(value:string|null,fallback:any={}) { if(!value)return fallback; try{return JSON.parse(value)}catch{return fallback} }
function hasPermission(role:string,module:string,write=false) {
  const list=(write?writePermissions:readPermissions)[role]||[];
  return list.includes("*")||list.includes(module);
}
function column(entity:string,key:string) {
  const aliases:Record<string,string>={created_date:"created_at",updated_date:"updated_at",submitted_at:"created_at"};
  return fieldMaps[entity]?.[key]||aliases[key]||key;
}
function mapStatus(entity:string,key:string,value:any) {
  if(key==="status"||key==="account_status") {
    if((entity==="Booking"||entity==="Visit")&&value==="pending") return "requested";
    if(entity==="Property"&&value==="pending_review") return "pending";
    if(entity==="OwnerVerification"&&value==="resubmission_requested") return "info_requested";
    if(entity==="PartnerAccount"&&value==="pending") return "pending_verification";
    if(entity==="Report"&&value==="in_review") return "investigating";
    if(entity==="Bed"&&value==="unavailable") return "blocked";
  }
  if(key==="priority"&&entity==="SupportTicket"&&value==="medium") return "normal";
  if(key==="business_type"&&entity==="PartnerAccount") {
    const types:Record<string,string>={individual_owner:"property_owner",pg_operator:"pg_operator",hostel_operator:"hostel_operator",coliving_operator:"co_living_operator",property_management:"property_management_company"};
    return types[String(value)]||value;
  }
  return value;
}
function toDb(entity:string,input:any) {
  const out:any={};
  for(const [key,raw] of Object.entries(input||{})) {
    if(virtual.has(key))continue;
    out[column(entity,key)]=mapStatus(entity,key,raw);
  }
  return out;
}
function fromDb(entity:string,row:any) {
  if(!row)return row;
  const x={...row};
  const relation=(value:any)=>Array.isArray(value)?value[0]:value;
  x.created_date=row.created_at||row.at||null;
  x.updated_date=row.updated_at||row.created_at||row.at||null;
  if(entity==="Property"){
    x.name=row.title;x.monthly_rent_min=row.rent;x.submitted_at=row.created_at;
    x.partner_name=relation(row.partner_accounts)?.business_name||row.partner_name||"";
    if(row.status==="pending")x.status="pending_review";
  }
  if(entity==="Booking"){
    const property=relation(row.properties),partner=relation(property?.partner_accounts);
    x.code=row.reference;x.property_name=row.property_title||property?.title||"";
    x.city=property?.city||"";x.partner_name=partner?.business_name||"";
    x.tenant_phone=row.phone;x.tenant_email=row.email;x.bed_label=row.bed_number||"";
    if(row.status==="requested")x.status="pending";
    if(row.status==="approved")x.status="confirmed";
  }
  if(entity==="Visit"){
    const property=relation(row.properties),partner=relation(property?.partner_accounts);
    x.property_name=row.property_title||property?.title||"";x.city=property?.city||"";
    x.partner_name=partner?.business_name||"";x.requested_date=row.date;x.time_slot=row.time;
    x.tenant_name=row.visitor_name;x.tenant_phone=row.phone;x.tenant_email=row.email;x.notes=row.message||"";
    if(row.status==="requested")x.status="pending";
  }
  if(entity==="Enquiry"){
    const property=relation(row.properties),partner=relation(property?.partner_accounts);
    x.property_name=row.property_title||property?.title||"";x.city=property?.city||"";
    x.partner_name=partner?.business_name||"";x.source="Discover";
    x.tenant_name=row.name;x.tenant_phone=row.phone;x.tenant_email=row.email;
  }
  if(entity==="Review"){x.property_name=row.property_title;x.rating=row.overall;x.comment=row.text;}
  if(entity==="Report"){
    x.target_name=row.target_title;x.description=row.details;x.category=row.reason;
    x.resolution_notes=row.admin_note;x.reporter_email=row.reporter_email||"";
    if(row.status==="investigating")x.status="in_review";
  }
  if(entity==="OwnerVerification"){
    x.owner_email=row.email;x.business_type=row.owner_type;x.internal_notes=row.internal_notes||"";
    x.partner_name=relation(row.partner_accounts)?.business_name||"";
    x.documents=row.document_name?[row.document_name]:(row.document_uri?["Verification document"]:[]);
    x.document_uris=row.document_uri?[row.document_uri]:[];
    if(row.status==="info_requested")x.status="resubmission_requested";
  }
  if(entity==="PartnerAccount"){
    x.business_type=row.account_type;x.account_status=row.status==="pending_verification"?"pending":row.status;
    x.owner_email=row.owner_email||row.business_email;x.owner_name=row.owner_name||"";x.phone=row.business_phone;
    x.properties_count=row.properties_count??row.property_count??0;x.property_count=x.properties_count;
    x.rooms_count=row.rooms_count??0;x.beds_count=row.beds_count??0;
    x.active_bookings=row.active_bookings??0;x.member_count=row.member_count??0;
    x.verification_status=row.verification_status||"pending";
  }
  if(entity==="SupportTicket"){
    const profile=relation(row.requester_profile);
    x.description=row.message||"";x.resolution_notes=row.resolution||"";
    x.last_reply=row.last_reply||"";x.assigned_to=row.assigned_to||"";
    x.ticket_code=row.ticket_code||("HM-SUP-"+String(row.id||"").slice(0,8).toUpperCase());
    x.requester_name=profile?.full_name||profile?.display_name||"";
    x.requester_type=profile?.user_type||"user";x.requester_email=profile?.email||"";
    x.partner_name=relation(row.partner_accounts)?.business_name||"";
    if(x.priority==="normal")x.priority="medium";
  }
  if(entity==="Bed"&&row.status==="blocked")x.status="unavailable";
  if(entity==="Room"||entity==="Bed"){
    const property=relation(row.properties);
    x.property_name=property?.title||"";x.city=property?.city||"";
    if(entity==="Room")x.monthly_rent=row.rent_per_bed;
    if(entity==="Bed")x.bed_label=row.bed_number||"";
  }
  return x;
}async function authenticate(req:Request) {
  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\\s+/i,"").trim();
  if(!token)fail("Authentication required.",401);
  const {data,error}=await db.auth.getUser(token);
  if(error||!data.user)fail("Your session is invalid or has expired. Sign in again.",401);
  let claims:any={};
  try {
    const encoded=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    claims=JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length/4)*4,"=")));
  } catch { fail("Your administrator session could not be verified.",401); }
  if(claims.aal!=="aal2")fail("Complete multi-factor authentication before using the Admin dashboard.",403);
  const [{data:roles,error:roleError},{data:profile}]=await Promise.all([
    db.from("user_roles").select("role").eq("user_id",data.user.id),
    db.from("profiles").select("full_name,display_name,admin_role,account_status").eq("id",data.user.id).maybeSingle()
  ]);
  if(roleError)fail("Could not verify administrator permissions.",500);
  if(!(roles||[]).some((r:any)=>r.role==="admin"))fail("Administrator access is required.",403);
  if(profile?.account_status==="suspended")fail("This administrator account is suspended.",403);
  return {id:data.user.id,email:data.user.email||"",full_name:profile?.full_name||profile?.display_name||data.user.email||"Administrator",role:"admin",roles:(roles||[]).map((r:any)=>r.role),admin_role:profile?.admin_role||"read_only"};
}
function applyFilters(q:any,entity:string,filters:any) {
  let out=q;
  for(const [key,condition] of Object.entries(filters||{})) {
    const col=column(entity,key);
    const value=(v:any)=>mapStatus(entity,key,v);
    if(condition&&typeof condition==="object"&&!Array.isArray(condition)) {
      const c:any=condition;
      if("$regex"in c)out=out.ilike(col,"%"+String(c.$regex).replace(/[%_]/g,"\\$&")+"%");
      else if("$in"in c)out=out.in(col,(c.$in||[]).map(value));
      else if("$ne"in c)out=out.neq(col,value(c.$ne));
      else if("$gte"in c)out=out.gte(col,c.$gte);
      else if("$lte"in c)out=out.lte(col,c.$lte);
      else if("$gt"in c)out=out.gt(col,c.$gt);
      else if("$lt"in c)out=out.lt(col,c.$lt);
      else if("$is"in c)out=out.is(col,c.$is);
    } else out=out.eq(col,value(condition));
  }
  return out;
}
async function audit(actor:any,action:string,module:string,entity:string,id:string|null,previous:any,next:any) {
  const payload={actor_id:actor.id,actor_name:actor.full_name,actor_email:actor.email,action,module,resource_type:entity,resource_id:id,resource_name:next?.title||next?.business_name||next?.tenant_name||next?.reference||null,previous_values:previous||null,new_values:next||null};
  const {error}=await db.from("audit_logs").insert(payload);
  if(error)console.error("audit insert failed",error.message);
}
async function listUsers() {
  const {data,error}=await db.auth.admin.listUsers({page:1,perPage:1000});
  if(error)throw error;
  const users=data.users||[], ids=users.map((u:any)=>u.id);
  if(!ids.length)return [];
  const [{data:profiles},{data:roles},{data:props},{data:members}]=await Promise.all([
    db.from("profiles").select("*").in("id",ids),db.from("user_roles").select("user_id,role").in("user_id",ids),
    db.from("properties").select("owner_id").in("owner_id",ids),db.from("partner_memberships").select("user_id").in("user_id",ids)
  ]);
  const pm=new Map((profiles||[]).map((p:any)=>[p.id,p])), rm=new Map<string,string[]>();
  for(const r of roles||[])rm.set(r.user_id,[...(rm.get(r.user_id)||[]),r.role]);
  const owners=new Set((props||[]).map((p:any)=>p.owner_id)), partners=new Set((members||[]).map((m:any)=>m.user_id));
  return users.map((u:any)=>{
    const p:any=pm.get(u.id)||{}, r=rm.get(u.id)||[], admin=r.includes("admin");
    return {id:u.id,email:u.email,full_name:p.full_name||p.display_name||u.user_metadata?.full_name||"",phone:p.phone||"",city:p.city||"",user_type:admin?"admin":partners.has(u.id)?"partner_user":owners.has(u.id)?"owner":p.user_type||"tenant",admin_role:admin?p.admin_role||"read_only":null,role:admin?"admin":r[0]||"tenant",roles:r,account_status:p.account_status||(u.banned_until&&new Date(u.banned_until)>new Date()?"suspended":"active"),internal_notes:p.internal_notes||"",created_date:u.created_at,last_sign_in_at:u.last_sign_in_at};
  });
}
async function updateUser(id:string,input:any,actor:any) {
  if(input.admin_role!==undefined&&actor.admin_role!=="super_admin")fail("Only a Super Admin can change administrator roles.",403);
  const patch:any={};
  for(const k of ["full_name","phone","city","account_status","internal_notes","user_type","admin_role"])if(input[k]!==undefined)patch[k]=input[k];
  if(input.admin_role!==undefined&&input.admin_role!=="super_admin") {
    const {data:target,error:targetError}=await db.from("profiles").select("admin_role").eq("id",id).maybeSingle();
    if(targetError)throw targetError;
    if(target?.admin_role==="super_admin") {
      const {count,error}=await db.from("profiles").select("id",{count:"exact",head:true}).eq("admin_role","super_admin").neq("id",id);
      if(error)throw error;
      if(!count)fail("Assign another Super Admin before demoting the last Super Admin.",409);
    }
  }
  if(Object.keys(patch).length){const {error}=await db.from("profiles").upsert({id,...patch},{onConflict:"id"});if(error)throw error;}
  if(input.admin_role!==undefined) {
    if(input.admin_role){const {error}=await db.from("user_roles").upsert({user_id:id,role:"admin"},{onConflict:"user_id,role"});if(error)throw error;}
    else {const {error}=await db.from("user_roles").delete().eq("user_id",id).eq("role","admin");if(error)throw error;}
  }
  if(input.account_status==="suspended"){const {error}=await db.auth.admin.updateUserById(id,{ban_duration:"876000h"});if(error)throw error;}
  else if(input.account_status==="active"){const {error}=await db.auth.admin.updateUserById(id,{ban_duration:"none"});if(error)throw error;}
  const user=(await listUsers()).find((u:any)=>u.id===id);
  await audit(actor,"update","users","User",id,null,patch);
  return user||{id,...patch};
}
function relationOne(value:any) { return Array.isArray(value)?value[0]:value; }
async function enrichEntityRows(entity:string,rows:any[]) {
  if(!rows.length)return rows;
  if(entity==="PartnerAccount") {
    const accountIds=rows.map(r=>r.id);
    const ownerIds=[...new Set(rows.map(r=>r.owner_user_id).filter(Boolean))];
    const [{data:profiles,error:profileError},{data:propertyRows,error:propertyError},{data:memberships,error:membershipError},{data:verifications,error:verificationError}]=await Promise.all([
      ownerIds.length?db.from("profiles").select("id,full_name,display_name,email").in("id",ownerIds):Promise.resolve({data:[],error:null}),
      db.from("properties").select("id,partner_account_id").in("partner_account_id",accountIds),
      db.from("partner_memberships").select("partner_account_id").in("partner_account_id",accountIds),
      db.from("owner_verifications").select("partner_account_id,status,created_at").in("partner_account_id",accountIds).order("created_at",{ascending:false})
    ]);
    if(profileError)throw profileError;
    if(propertyError)throw propertyError;
    if(membershipError)throw membershipError;
    if(verificationError)throw verificationError;
    const propertyIds=(propertyRows||[]).map(p=>p.id);
    const [{data:beds,error:bedError},{data:rooms,error:roomError},{data:bookings,error:bookingError}]=await Promise.all([
      propertyIds.length?db.from("beds").select("property_id").in("property_id",propertyIds):Promise.resolve({data:[],error:null}),
      propertyIds.length?db.from("rooms").select("property_id").in("property_id",propertyIds):Promise.resolve({data:[],error:null}),
      propertyIds.length?db.from("bookings").select("property_id,status").in("property_id",propertyIds).in("status",["requested","approved","confirmed"]):Promise.resolve({data:[],error:null})
    ]);
    if(bedError)throw bedError;
    if(roomError)throw roomError;
    if(bookingError)throw bookingError;
    return rows.map(row=>{
      const profile=(profiles||[]).find((p:any)=>p.id===row.owner_user_id);
      const owned=(propertyRows||[]).filter(p=>p.partner_account_id===row.id);
      const ids=new Set(owned.map(p=>p.id));
      const latest=(verifications||[]).find(v=>v.partner_account_id===row.id);
      return {...row,
        owner_name:profile?.full_name||profile?.display_name||"",
        owner_email:profile?.email||row.business_email||"",
        properties_count:owned.length,
        property_count:owned.length,
        rooms_count:(rooms||[]).filter(r=>ids.has(r.property_id)).length,
        beds_count:(beds||[]).filter(b=>ids.has(b.property_id)).length,
        active_bookings:(bookings||[]).filter(b=>ids.has(b.property_id)).length,
        member_count:(memberships||[]).filter(m=>m.partner_account_id===row.id).length,
        verification_status:latest?.status||"pending"
      };
    });
  }
  if(entity==="SupportTicket") {
    const ids=[...new Set(rows.map(r=>r.user_id).filter(Boolean))];
    const partnerIds=[...new Set(rows.map(r=>r.partner_account_id).filter(Boolean))];
    const [{data:profiles,error:profileError},{data:partners,error:partnerError}]=await Promise.all([
      ids.length?db.from("profiles").select("id,full_name,display_name,email,user_type").in("id",ids):Promise.resolve({data:[],error:null}),
      partnerIds.length?db.from("partner_accounts").select("id,business_name").in("id",partnerIds):Promise.resolve({data:[],error:null})
    ]);
    if(profileError)throw profileError;if(partnerError)throw partnerError;
    const profileMap=new Map((profiles||[]).map((p:any)=>[p.id,p]));
    const partnerMap=new Map((partners||[]).map((p:any)=>[p.id,p.business_name]));
    return rows.map(row=>({...row,requester_profile:profileMap.get(row.user_id)||null,partner_name:partnerMap.get(row.partner_account_id)||""}));
  }
  return rows;
}
async function listEntity(entity:string,url:URL) {
  if(entity==="User") {
    let rows=await listUsers();
    const f=parse(url.searchParams.get("filter"),{});
    const matches=(row:any,key:string,condition:any)=>{
      const current=(row as any)[key];
      if(condition&&typeof condition==="object"&&!Array.isArray(condition)) {
        if("$regex" in condition)return String(current??"").toLowerCase().includes(String(condition.$regex??"").toLowerCase());
        if("$in" in condition)return (condition.$in||[]).includes(current);
        if("$ne" in condition)return current!==condition.$ne;
        if("$gte" in condition)return current!=null&&String(current)>=String(condition.$gte);
        if("$lte" in condition)return current!=null&&String(current)<=String(condition.$lte);
        return true;
      }
      return current===condition;
    };
    rows=rows.filter((row:any)=>Object.entries(f).every(([key,condition]:any)=>matches(row,key,condition)));
    const sort=url.searchParams.get("sort")||"-created_date";
    const desc=sort.startsWith("-");
    const field=desc?sort.slice(1):sort;
    rows.sort((left:any,right:any)=>{
      const a=left[field],b=right[field];
      if(a==null&&b==null)return 0;
      if(a==null)return desc?1:-1;
      if(b==null)return desc?-1:1;
      const av=typeof a==="number"?a:String(a).toLowerCase();
      const bv=typeof b==="number"?b:String(b).toLowerCase();
      if(av<bv)return desc?1:-1;
      if(av>bv)return desc?-1:1;
      return 0;
    });
    const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||1000),1),1000);
    const offset=Math.max(Number(url.searchParams.get("cursor")||0),0);
    return {items:rows.slice(offset,offset+limit),has_more:offset+limit<rows.length,next_cursor:offset+limit<rows.length?String(offset+limit):null,total:rows.length};
  }
  const cfg=entities[entity];if(!cfg)fail("Unknown entity.",404);
  const f=parse(url.searchParams.get("filter"),{}), sort=url.searchParams.get("sort")||"-created_at";
  const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||20),1),200), offset=Math.max(Number(url.searchParams.get("cursor")||0),0);
  const order=sort.startsWith("-"), col=column(entity,sort.replace(/^-/, ""));
  const selectByEntity:Record<string,string>={
    Property:"*,partner_accounts!properties_partner_account_id_fkey(business_name)",
    Booking:"*,properties!bookings_property_id_fkey(title,city,partner_accounts!properties_partner_account_id_fkey(business_name))",
    Visit:"*,properties!visits_property_id_fkey(title,city,partner_accounts!properties_partner_account_id_fkey(business_name))",
    Enquiry:"*,properties!enquiries_property_id_fkey(title,city,partner_accounts!properties_partner_account_id_fkey(business_name))",
    OwnerVerification:"*,partner_accounts!owner_verifications_partner_account_id_fkey(business_name)",
    Room:"*,properties!rooms_property_id_fkey(title,city)",
    Bed:"*,properties!beds_property_id_fkey(title,city)"
  };
  const select=selectByEntity[entity]||"*";
  const {data,error,count}=await applyFilters(db.from(cfg.table).select(select,{count:"exact"}),entity,f).order(col,{ascending:!order,nullsFirst:false}).range(offset,offset+limit-1);
  if(error)throw error;
  const enriched=await enrichEntityRows(entity,data||[]);
  const items=enriched.map((r:any)=>fromDb(entity,r));
  const more=offset+items.length<(count||0);
  return {items,has_more:more,next_cursor:more?String(offset+limit):null,total:count||0};
}
async function entityRoute(req:Request,url:URL,entity:string,tail:string[],actor:any) {
  if(entity==="User") {
    const userWrite=!["GET","HEAD"].includes(req.method);
    if(!hasPermission(actor.admin_role,"users",userWrite))fail("Your administrator role cannot access user records in this way.",403);
    if(req.method==="GET")return listEntity(entity,url);
    if(req.method==="PATCH"&&tail.length===1){
      const input=await req.json();
      if(input.admin_role!==undefined&&actor.admin_role!=="super_admin")fail("Only a Super Admin can change administrator roles.",403);
      if(input.account_status!==undefined&&actor.admin_role!=="super_admin"&&actor.admin_role!=="operations_admin")fail("Only a Super Admin or Operations Admin can change account status.",403);
      if(tail[0]===actor.id&&input.account_status==="suspended")fail("You cannot suspend your own administrator account.",409);
      return updateUser(tail[0],input,actor);
    }
    fail("Unsupported user action.",405);
  }
  const cfg=entities[entity];if(!cfg)fail("Unknown entity.",404);
  const write=![ "GET","HEAD" ].includes(req.method);
  if(!hasPermission(actor.admin_role,cfg.module,write))fail("Your administrator role cannot access this module in this way.",403);
  if(!write&&tail.length===1&&tail[0]==="count") {
    const {count,error}=await applyFilters(db.from(cfg.table).select("*",{count:"exact",head:true}),entity,parse(url.searchParams.get("filter"),{}));
    if(error)throw error;return {count:count||0};
  }
  if(!write&&tail.length===1&&tail[0]==="aggregate") {
    const group=url.searchParams.get("group_by")||"category";
    const {data,error}=await applyFilters(db.from(cfg.table).select("*").limit(2000),entity,parse(url.searchParams.get("filter"),{}));
    if(error)throw error;const sums=new Map<string,number>();for(const r of data||[]){const k=String((r as any)[column(entity,group)]??"Unknown");sums.set(k,(sums.get(k)||0)+1);}
    return {rows:[...sums.entries()].map(([k,count])=>({[group]:k,count}))};
  }
  if(req.method==="GET"&&tail.length===0)return listEntity(entity,url);
  if(req.method==="GET"&&tail.length===1) {
    const {data,error}=await db.from(cfg.table).select("*").eq("id",tail[0]).maybeSingle();if(error)throw error;if(!data)fail("Record not found.",404);return fromDb(entity,data);
  }
  if(req.method==="POST"&&tail.length===0) {
    const body=toDb(entity,await req.json());
    if(entity==="CmsContent")body.created_by=actor.id;
    if(entity==="AuditLog") {
      body.actor_id=actor.id;body.actor_name=actor.full_name;body.actor_email=actor.email;
      for(const field of ["previous_values","new_values"]) {
        if(typeof body[field]==="string") {
          if(!body[field].trim())body[field]=null;
          else { try { body[field]=JSON.parse(body[field]); } catch { body[field]={value:body[field]}; } }
        }
      }
      body.at=body.at||new Date().toISOString();
    }
    const {data,error}=await db.from(cfg.table).insert(body).select("*").single();if(error)throw error;
    if(entity!=="AuditLog")await audit(actor,"create",cfg.module,entity,data.id,null,data);
    return fromDb(entity,data);
  }
  if(["PATCH","PUT"].includes(req.method)&&tail.length===1&&tail[0]!=="bulk") {
    const input=await req.json(), body=toDb(entity,input);
    if(entity==="AuditLog")fail("Audit log records are immutable.",403);
    const {data:previous,error:preError}=await db.from(cfg.table).select("*").eq("id",tail[0]).maybeSingle();
    if(preError)throw preError;if(!previous)fail("Record not found.",404);
    if(entity==="Booking"&&["cancelled","confirmed","completed"].includes(String(input.status||""))) {
      if(input.status==="cancelled"&&previous.status!=="cancelled"){const {error}=await db.from("bookings").update({status:"cancelled",updated_at:new Date().toISOString()}).eq("id",tail[0]);if(error)throw error;if(previous.bed_id){const {error:e}=await db.from("beds").update({status:"available"}).eq("id",previous.bed_id).in("status",["reserved","occupied"]);if(e)throw e;}}
      else if(input.status==="confirmed"){const {error}=await db.from("bookings").update({status:"confirmed",updated_at:new Date().toISOString()}).eq("id",tail[0]);if(error)throw error;if(previous.bed_id){const {error:e}=await db.from("beds").update({status:"occupied"}).eq("id",previous.bed_id);if(e)throw e;}}
      else if(input.status==="completed"){const {error}=await db.from("bookings").update({status:"completed",updated_at:new Date().toISOString()}).eq("id",tail[0]);if(error)throw error;if(previous.bed_id){const {error:e}=await db.from("beds").update({status:"available"}).eq("id",previous.bed_id);if(e)throw e;}}
      delete body.status;
    }
    const {data,error}=await db.from(cfg.table).update({...body,...(["bookings","visits","cms_content","platform_settings"].includes(cfg.table)?{updated_at:new Date().toISOString()}:{})}).eq("id",tail[0]).select("*").single();
    if(error)throw error;await audit(actor,"update",cfg.module,entity,tail[0],previous,data);return fromDb(entity,data);
  }
  if(req.method==="PATCH"&&tail[0]==="bulk") {
    const b=await req.json(), patch=toDb(entity,b.update?.$set||b.update||{});
    if(entity==="AuditLog")fail("Audit log records are immutable.",403);
    const {data,error}=await applyFilters(db.from(cfg.table).update(patch).select("*"),entity,b.filter||{});
    if(error)throw error;for(const row of data||[])await audit(actor,"update",cfg.module,entity,row.id,null,row);
    return {items:(data||[]).map((r:any)=>fromDb(entity,r)),count:(data||[]).length};
  }
  fail("Unsupported entity operation.",405);
}
async function handleProfile(req:Request,actor:any) {
  const b=await req.json(), patch:any={};if(typeof b.full_name==="string")patch.full_name=b.full_name.trim();if(typeof b.phone==="string")patch.phone=b.phone.trim();
  if(typeof b.admin_role==="string"){if(actor.admin_role!=="super_admin")fail("Only a Super Admin can change administrator roles.",403);patch.admin_role=b.admin_role;}
  if(Object.keys(patch).length){const {error}=await db.from("profiles").upsert({id:actor.id,...patch},{onConflict:"id"});if(error)throw error;}
  const {data}=await db.from("profiles").select("full_name,display_name,phone,admin_role").eq("id",actor.id).maybeSingle();return {...actor,...data};
}
async function signDocument(req:Request) {
  const b=await req.json(),uri=String(b.file_uri||"");
  if(!uri)fail("A file URI is required.");
  const bucket="verification-docs",marker="/storage/v1/object/";
  let path=uri;
  try {
    if(/^https?:\/\//i.test(uri)) {
      const parsed=new URL(uri);
      const index=parsed.pathname.indexOf(marker);
      if(index>=0)path=parsed.pathname.slice(index+marker.length);
      else path=parsed.pathname.replace(/^\/+/, "");
    }
  } catch { fail("Invalid document URI."); }
  path=path.replace(/^(sign|public)\//,"");
  if(path.startsWith(bucket+"/"))path=path.slice(bucket.length+1);
  else if(path.startsWith(bucket+":"))path=path.slice(bucket.length+1);
  path=decodeURIComponent(path.replace(/^\/+/, ""));
  if(!path||path.includes(".."))fail("Invalid document path.");
  const {data,error}=await db.storage.from(bucket).createSignedUrl(path,Math.min(Math.max(Number(b.expires_in||180),30),600));
  if(error)fail("The requested document is unavailable.",404);
  return {signed_url:data.signedUrl};
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("Origin")||"";
  if(req.method==="OPTIONS")return response({ok:true},200,origin);
  try{
    const url=new URL(req.url);
    let path=url.pathname;
    for(const prefix of ["/functions/v1/admin-api","/admin-api"]) {
      if(path===prefix){path="/";break;}
      if(path.startsWith(prefix+"/")){path=path.slice(prefix.length);break;}
    }
    if(!path.startsWith("/"))path="/"+path;
    // Normalize a URL whose proxy has already removed the function prefix.
    if(path.startsWith("/functions/v1/admin-api/"))path=path.slice("/functions/v1/admin-api".length);
    if(path==="/health"&&req.method==="GET")return response({ok:true,service:"homora-admin-api"},200,origin);
    const actor=await authenticate(req);
    if(path==="/api/auth/profile"&&req.method==="PATCH")return response(await handleProfile(req,actor),200,origin);
    if(path==="/api/settings/public"&&req.method==="GET"){if(!hasPermission(actor.admin_role,"settings",false))fail("Your administrator role cannot view platform settings.",403);const {data,error}=await db.from("platform_settings").select("*").order("created_at",{ascending:false}).limit(1).maybeSingle();if(error)throw error;return response(data||{platform_name:"HOMORA",listing_completeness_threshold:80,booking_hold_hours:24},200,origin);}
    if(path==="/api/storage/signed-url"&&req.method==="POST"){if(!hasPermission(actor.admin_role,"verification",false))fail("Your administrator role cannot view verification files.",403);return response(await signDocument(req),200,origin);}
    const m=path.match(/^\/api\/admin\/entities\/([^/]+)(?:\/(.*))?$/);
    if(m){const entity=decodeURIComponent(m[1]),tail=m[2]?m[2].split("/").map(decodeURIComponent):[];return response(await entityRoute(req,url,entity,tail,actor),200,origin);}
    return response({error:{message:"Route not found."}},404,origin);
  }catch(e){const status=(e as any)?.status||((String((e as any)?.message||"").includes("JWT"))?401:500);console.error("admin-api error",(e as any)?.message||e);return response({error:{message:status>=500?"The administration service could not complete this request.":(e as any)?.message||"Request failed."}},status,origin);}
});