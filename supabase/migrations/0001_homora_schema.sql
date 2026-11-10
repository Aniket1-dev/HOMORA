-- HOMORA Discover - initial schema, RLS, booking RPC and storage policies.
-- RECONSTRUCTED from how the frontend uses the data (no export of the previous backend was available).
-- Review every column before applying to a database that holds real data.

-- ---------------------------------------------------------------- identity
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  display_name text,
  phone text,
  city text,
  organisation text,
  occupation text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','moderator')),
  primary key (user_id, role)
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','moderator'));
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------- properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  status text not null default 'draft' check (status in ('draft','pending','published','rejected','suspended','archived')),
  title text not null,
  category text, subtype text, description text,
  owner_name text, owner_type text, owner_phone text, owner_email text,
  city text, locality text, sublocality text, pincode text, address text, landmark text,
  lat double precision, lng double precision,
  bedrooms int, bathrooms int, balconies int, carpet_area numeric, built_up_area numeric,
  property_age int, floor int, total_floors int,
  furnishing text, gender text, sharing text,
  ac boolean not null default false, attached_bathroom boolean not null default false,
  food_included boolean not null default false, pet_friendly boolean not null default false,
  rent numeric, rent_unit text default 'month', deposit numeric, deposit_refundable boolean default true,
  maintenance numeric, electricity numeric, water numeric, food_charges numeric, wifi_charges numeric,
  laundry_charges numeric, parking_charges numeric, brokerage numeric,
  maintenance_deposit numeric, one_time_charges numeric, other_charges numeric, parking_capacity int,
  min_stay int, notice_period int, available_from date,
  amenities text[] not null default '{}', images text[] not null default '{}',
  rules text, curfew text, visitor_policy text,
  total_beds int not null default 0, available_beds int not null default 0,
  owner_verified boolean not null default false,
  property_verified boolean not null default false,
  property_verification_note text,
  rating numeric not null default 0, review_count int not null default 0, views int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.properties (status, city);
create index on public.properties (owner_id);
create index on public.properties (created_at desc);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_number text not null, floor int, room_type text,
  total_beds int not null default 1, available_beds int not null default 1,
  occupied_beds int not null default 0, reserved_beds int not null default 0,
  rent_per_bed numeric, ac boolean not null default false, attached_bathroom boolean not null default false,
  status text not null default 'available',
  created_at timestamptz not null default now()
);
create index on public.rooms (property_id);

create table public.beds (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  room_number text, bed_number text not null, monthly_rent numeric,
  status text not null default 'available' check (status in ('available','reserved','occupied','blocked')),
  created_at timestamptz not null default now()
);
create index on public.beds (property_id, status);

create or replace function public.owns_property(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.properties where id = pid and owner_id = auth.uid());
$$;

-- Owners cannot self-publish, self-verify or edit counters; only admins can.
create or replace function public.properties_guard() returns trigger
language plpgsql as $$
begin
  if auth.uid() is null or pg_trigger_depth() > 1 or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.owner_id := auth.uid();
    if new.status not in ('draft','pending') then new.status := 'draft'; end if;
    new.owner_verified := false; new.property_verified := false; new.property_verification_note := null;
    new.rating := 0; new.review_count := 0; new.views := 0;
  else
    new.owner_id := old.owner_id;
    new.owner_verified := old.owner_verified; new.property_verified := old.property_verified;
    new.property_verification_note := old.property_verification_note;
    new.rating := old.rating; new.review_count := old.review_count; new.views := old.views;
    if new.status is distinct from old.status then
      if old.status = 'suspended' or new.status not in ('draft','pending','archived') then
        raise exception 'status change not allowed';
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger properties_guard_t before insert or update on public.properties
  for each row execute function public.properties_guard();

-- Room/property bed counters are derived, never client-supplied.
create or replace function public.refresh_inventory(pid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.rooms r set
    total_beds = c.t, available_beds = c.a, occupied_beds = c.o, reserved_beds = c.r
  from (select room_id, count(*) t,
          count(*) filter (where status='available') a,
          count(*) filter (where status='occupied') o,
          count(*) filter (where status='reserved') r
        from public.beds where property_id = pid group by room_id) c
  where r.id = c.room_id and r.property_id = pid;
  update public.properties p set
    total_beds = coalesce((select count(*) from public.beds where property_id = pid), p.total_beds),
    available_beds = coalesce((select count(*) from public.beds where property_id = pid and status='available'), p.available_beds)
  where p.id = pid and exists (select 1 from public.beds where property_id = pid);
end $$;
create or replace function public.beds_changed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_inventory(coalesce(new.property_id, old.property_id));
  return null;
end $$;
create trigger beds_changed_t after insert or update or delete on public.beds
  for each row execute function public.beds_changed();

-- --------------------------------------------------------- engagement tables
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  property_id uuid not null references public.properties(id),
  property_title text, room_id uuid references public.rooms(id), bed_id uuid references public.beds(id),
  room_number text, bed_number text,
  tenant_id uuid references auth.users(id) default auth.uid(),
  tenant_name text not null, phone text not null, email text, move_in_date date,
  monthly_rent numeric not null default 0, deposit numeric not null default 0,
  status text not null default 'requested' check (status in ('requested','approved','rejected','confirmed','cancelled')),
  payment_status text not null default 'offline_pending',
  created_at timestamptz not null default now()
);
create index on public.bookings (property_id);
create index on public.bookings (tenant_id);
-- A bed can have only one active booking.
create unique index bookings_one_active_per_bed on public.bookings (bed_id)
  where bed_id is not null and status in ('requested','approved','confirmed');

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_title text, tenant_id uuid references auth.users(id) default auth.uid(),
  visitor_name text not null, phone text not null, email text,
  date date not null, time text, mode text default 'in_person', message text,
  status text not null default 'requested' check (status in ('requested','confirmed','rejected','rescheduled','completed','cancelled','no_show')),
  created_at timestamptz not null default now()
);
create index on public.visits (property_id);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_title text, tenant_id uuid references auth.users(id) default auth.uid(),
  name text not null, phone text not null, email text, message text, move_in_date date,
  status text not null default 'new' check (status in ('new','contacted','follow_up','converted','not_interested','closed')),
  owner_note text,
  created_at timestamptz not null default now()
);
create index on public.enquiries (property_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_title text, author_id uuid references auth.users(id) default auth.uid(),
  author_name text not null, overall int not null check (overall between 1 and 5), text text not null,
  status text not null default 'published' check (status in ('published','hidden','pending')),
  verified_visit boolean not null default false, verified_tenancy boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.reviews (property_id, status);

create or replace function public.reviews_recalc() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.property_id, old.property_id);
begin
  update public.properties set
    rating = coalesce((select round(avg(overall)::numeric,1) from public.reviews where property_id=pid and status='published'),0),
    review_count = (select count(*) from public.reviews where property_id=pid and status='published')
  where id = pid;
  return null;
end $$;
create trigger reviews_recalc_t after insert or update or delete on public.reviews
  for each row execute function public.reviews_recalc();

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) default auth.uid(), reporter_name text,
  target_type text not null, target_id uuid not null, target_title text,
  reason text not null, details text, priority text not null default 'medium',
  status text not null default 'open' check (status in ('open','investigating','resolved','dismissed')),
  admin_note text, created_at timestamptz not null default now()
);

create table public.owner_verifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users(id),
  owner_name text, business_name text, owner_type text, email text, phone text, city text,
  property_count int, document_type text,
  document_uri text,  -- path inside the PRIVATE 'verification-docs' bucket, never a public URL
  status text not null default 'pending' check (status in ('pending','approved','rejected','info_requested')),
  admin_note text, created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- roommates
create table public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null, age int, occupation text, organisation text, city text, locality text,
  preferred_category text, budget_min numeric, budget_max numeric, move_in_date date, stay_months int,
  sleep_schedule text, cleanliness text, social text, guest_frequency text, noise_tolerance text,
  food_habit text, cooking text, ac_usage text, smoker boolean default false, drinks boolean default false,
  pets boolean default false, wfh boolean default false, study_environment text, bio text,
  contact_email text,  -- hidden from other users until a connection is accepted
  paused boolean not null default false,
  created_at timestamptz not null default now()
);
create or replace function public.owns_roommate_profile(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.roommate_profiles where id = pid and owner_id = auth.uid());
$$;

create table public.roommate_connections (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.roommate_profiles(id) on delete cascade,
  from_name text, to_profile_id uuid not null references public.roommate_profiles(id) on delete cascade,
  to_name text, message text,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id), check (from_profile_id <> to_profile_id)
);

-- Contact emails: own profile + profiles with an ACCEPTED connection only.
create or replace function public.roommate_contact_emails()
returns table (profile_id uuid, contact_email text)
language sql stable security definer set search_path = public as $$
  select p.id, p.contact_email from public.roommate_profiles p
  where p.owner_id = auth.uid()
     or exists (select 1 from public.roommate_connections c
                join public.roommate_profiles me on me.owner_id = auth.uid()
                where c.status = 'accepted'
                  and ((c.from_profile_id = me.id and c.to_profile_id = p.id)
                    or (c.to_profile_id = me.id and c.from_profile_id = p.id)));
$$;

-- ------------------------------------------------------------ server RPCs
create or replace function public.booking_json(b public.bookings) returns jsonb
language sql immutable as $$
  select jsonb_build_object('id', b.id, 'reference', b.reference, 'propertyId', b.property_id,
    'propertyTitle', b.property_title, 'roomId', b.room_id, 'bedId', b.bed_id, 'roomNumber', b.room_number,
    'bedNumber', b.bed_number, 'tenantName', b.tenant_name, 'phone', b.phone, 'email', b.email,
    'moveInDate', b.move_in_date, 'monthlyRent', b.monthly_rent, 'deposit', b.deposit,
    'status', b.status, 'paymentStatus', b.payment_status, 'created_date', b.created_at);
$$;

-- All booking state changes run here, in one transaction, with row locks.
-- Prices come from the database, never from the client.
create or replace function public.manage_booking(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  act text := payload->>'action';
  b public.bookings; p public.properties; bed public.beds;
  bed_total int; digits text; mover date;
  allowed boolean;
begin
  if act = 'create' then
    select * into p from public.properties where id = (payload->>'propertyId')::uuid and status = 'published';
    if not found then return jsonb_build_object('error','This listing is not available for booking.'); end if;
    if length(trim(coalesce(payload->>'tenantName',''))) < 2 then return jsonb_build_object('error','Please enter your name.'); end if;
    digits := regexp_replace(coalesce(payload->>'phone',''), '\D', '', 'g');
    if length(digits) < 10 then return jsonb_build_object('error','Enter a valid 10-digit phone number.'); end if;
    mover := nullif(payload->>'moveInDate','')::date;
    if mover is not null and mover < current_date then return jsonb_build_object('error','Move-in date cannot be in the past.'); end if;
    select count(*) into bed_total from public.beds where property_id = p.id;
    if bed_total > 0 then
      if nullif(payload->>'bedId','') is null then return jsonb_build_object('error','Choose an available bed.'); end if;
      select * into bed from public.beds where id = (payload->>'bedId')::uuid and property_id = p.id for update;
      if not found or bed.status <> 'available' then
        return jsonb_build_object('error','That bed was just taken. Please choose another.');
      end if;
      update public.beds set status = 'reserved' where id = bed.id;
    end if;
    insert into public.bookings (reference, property_id, property_title, room_id, bed_id, room_number, bed_number,
      tenant_name, phone, email, move_in_date, monthly_rent, deposit)
    values ('HM-' || upper(substr(md5(gen_random_uuid()::text),1,8)), p.id, p.title,
      bed.room_id, bed.id, bed.room_number, bed.bed_number,
      trim(payload->>'tenantName'), digits, nullif(payload->>'email',''), mover,
      coalesce(bed.monthly_rent, p.rent, 0), coalesce(p.deposit, 0))
    returning * into b;
    return jsonb_build_object('booking', public.booking_json(b));
  end if;

  select * into b from public.bookings where id = (payload->>'bookingId')::uuid for update;
  if not found then return jsonb_build_object('error','Booking not found.'); end if;

  if act in ('approve','reject','confirm') then
    if not (public.owns_property(b.property_id) or public.is_admin()) then
      return jsonb_build_object('error','Not allowed.');
    end if;
    if act = 'approve' then
      if b.status <> 'requested' then return jsonb_build_object('error','Only requested bookings can be approved.'); end if;
      update public.bookings set status = 'approved' where id = b.id returning * into b;
    elsif act = 'reject' then
      if b.status <> 'requested' then return jsonb_build_object('error','Only requested bookings can be rejected.'); end if;
      update public.bookings set status = 'rejected' where id = b.id returning * into b;
      update public.beds set status = 'available' where id = b.bed_id and status = 'reserved';
    else
      if b.status <> 'approved' then return jsonb_build_object('error','Approve the booking first.'); end if;
      update public.bookings set status = 'confirmed' where id = b.id returning * into b;
      update public.beds set status = 'occupied' where id = b.bed_id;
    end if;
  elsif act = 'cancel' then
    allowed := public.owns_property(b.property_id) or public.is_admin()
      or (b.tenant_id is not null and b.tenant_id = auth.uid())
      or b.tenant_id is null;  -- guest bookings: the unguessable id is the credential
    if not allowed then return jsonb_build_object('error','Not allowed.'); end if;
    if b.status not in ('requested','approved','confirmed') then
      return jsonb_build_object('error','This booking can no longer be cancelled.');
    end if;
    if b.status = 'confirmed' and not (public.owns_property(b.property_id) or public.is_admin()) then
      return jsonb_build_object('error','Ask the owner to cancel a confirmed booking.');
    end if;
    update public.bookings set status = 'cancelled' where id = b.id returning * into b;
    update public.beds set status = 'available' where id = b.bed_id and status in ('reserved','occupied');
  else
    return jsonb_build_object('error','Unknown action.');
  end if;
  return jsonb_build_object('booking', public.booking_json(b));
end $$;
revoke all on function public.manage_booking(jsonb) from public;
grant execute on function public.manage_booking(jsonb) to anon, authenticated;

create or replace function public.get_my_requests(booking_ids uuid[], visit_ids uuid[], enquiry_ids uuid[])
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'bookings', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bookings x
       where x.id = any(coalesce(booking_ids,'{}')) or x.tenant_id = auth.uid()), '[]'),
    'visits', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.visits x
       where x.id = any(coalesce(visit_ids,'{}')) or x.tenant_id = auth.uid()), '[]'),
    'enquiries', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.enquiries x
       where x.id = any(coalesce(enquiry_ids,'{}')) or x.tenant_id = auth.uid()), '[]'));
$$;
grant execute on function public.get_my_requests(uuid[],uuid[],uuid[]) to anon, authenticated;

create or replace function public.cancel_visit(visit_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.visits set status = 'cancelled'
  where id = visit_id and status in ('requested','confirmed') and (tenant_id is null or tenant_id = auth.uid());
$$;
grant execute on function public.cancel_visit(uuid) to anon, authenticated;

create or replace function public.increment_property_views(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.properties set views = views + 1 where id = pid and status = 'published';
$$;
grant execute on function public.increment_property_views(uuid) to anon, authenticated;
grant execute on function public.roommate_contact_emails() to authenticated;

-- ------------------------------------------------------------ RLS policies
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.beds enable row level security;
alter table public.bookings enable row level security;
alter table public.visits enable row level security;
alter table public.enquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.owner_verifications enable row level security;
alter table public.roommate_profiles enable row level security;
alter table public.roommate_connections enable row level security;

create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy roles_self on public.user_roles for select using (user_id = auth.uid());

create policy properties_read on public.properties for select
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy properties_insert on public.properties for insert to authenticated
  with check (owner_id = auth.uid());
create policy properties_update on public.properties for update to authenticated
  using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

create policy rooms_read on public.rooms for select using (
  exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
  or public.owns_property(property_id) or public.is_admin());
create policy rooms_write on public.rooms for all to authenticated
  using (public.owns_property(property_id) or public.is_admin())
  with check (public.owns_property(property_id) or public.is_admin());
create policy beds_read on public.beds for select using (
  exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
  or public.owns_property(property_id) or public.is_admin());
create policy beds_write on public.beds for all to authenticated
  using (public.owns_property(property_id) or public.is_admin())
  with check (public.owns_property(property_id) or public.is_admin());

-- bookings: written ONLY through manage_booking(); owners/admins can read their own.
create policy bookings_read on public.bookings for select to authenticated
  using (tenant_id = auth.uid() or public.owns_property(property_id) or public.is_admin());

create policy visits_insert on public.visits for insert to anon, authenticated
  with check (status = 'requested' and exists (select 1 from public.properties p where p.id = property_id and p.status = 'published'));
create policy visits_read on public.visits for select to authenticated
  using (tenant_id = auth.uid() or public.owns_property(property_id) or public.is_admin());
create policy visits_update on public.visits for update to authenticated
  using (public.owns_property(property_id) or public.is_admin())
  with check (public.owns_property(property_id) or public.is_admin());

create policy enquiries_insert on public.enquiries for insert to anon, authenticated
  with check (status = 'new' and exists (select 1 from public.properties p where p.id = property_id and p.status = 'published'));
create policy enquiries_read on public.enquiries for select to authenticated
  using (tenant_id = auth.uid() or public.owns_property(property_id) or public.is_admin());
create policy enquiries_update on public.enquiries for update to authenticated
  using (public.owns_property(property_id) or public.is_admin())
  with check (public.owns_property(property_id) or public.is_admin());

create policy reviews_read on public.reviews for select using (status = 'published' or public.is_admin());
create policy reviews_insert on public.reviews for insert to anon, authenticated
  with check (status = 'published' and verified_visit = false and verified_tenancy = false
              and exists (select 1 from public.properties p where p.id = property_id and p.status = 'published'));
create policy reviews_admin on public.reviews for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy reports_insert on public.reports for insert to anon, authenticated with check (status = 'open');
create policy reports_admin_read on public.reports for select to authenticated using (public.is_admin());
create policy reports_admin_update on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy ov_read on public.owner_verifications for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy ov_insert on public.owner_verifications for insert to authenticated with check (owner_id = auth.uid() and status = 'pending');
create policy ov_update_own on public.owner_verifications for update to authenticated
  using (owner_id = auth.uid() and status in ('pending','rejected','info_requested'))
  with check (owner_id = auth.uid() and status = 'pending');
create policy ov_update_admin on public.owner_verifications for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy rp_read on public.roommate_profiles for select to authenticated using (paused = false or owner_id = auth.uid());
create policy rp_insert on public.roommate_profiles for insert to authenticated with check (owner_id = auth.uid());
create policy rp_update on public.roommate_profiles for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy rc_read on public.roommate_connections for select to authenticated
  using (public.owns_roommate_profile(from_profile_id) or public.owns_roommate_profile(to_profile_id));
create policy rc_insert on public.roommate_connections for insert to authenticated
  with check (status = 'pending' and public.owns_roommate_profile(from_profile_id));
create policy rc_update on public.roommate_connections for update to authenticated
  using (public.owns_roommate_profile(to_profile_id)) with check (public.owns_roommate_profile(to_profile_id));

-- ------------------------------------------------- column-level privileges
-- Owners may only edit status/notes on inbound requests, not the tenant's details.
revoke update on public.visits, public.enquiries, public.roommate_connections from authenticated;
grant update (status) on public.visits to authenticated;
grant update (status, owner_note) on public.enquiries to authenticated;
grant update (status) on public.roommate_connections to authenticated;
-- Roommate contact email is never selectable directly; use roommate_contact_emails().
revoke select on public.roommate_profiles from authenticated, anon;
grant select (id, owner_id, display_name, age, occupation, organisation, city, locality, preferred_category,
  budget_min, budget_max, move_in_date, stay_months, sleep_schedule, cleanliness, social, guest_frequency,
  noise_tolerance, food_habit, cooking, ac_usage, smoker, drinks, pets, wfh, study_environment, bio, paused, created_at)
  on public.roommate_profiles to authenticated;

-- ------------------------------------------------------------------ storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('listing-media', 'listing-media', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif']),
  ('verification-docs', 'verification-docs', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy listing_media_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy listing_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy verification_docs_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy verification_docs_read on storage.objects for select to authenticated
  using (bucket_id = 'verification-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
