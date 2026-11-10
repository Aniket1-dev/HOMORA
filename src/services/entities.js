import { supabase } from '@/lib/supabase/client';

// Table repositories. The UI works with camelCase records; the database uses snake_case.
// Only whitelisted columns are ever sent, so a record spread into a form can't write
// protected fields (id, created_at, counters...) - the database enforces this again via RLS/triggers.

const snake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const toRecord = (row) => {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) out[camel(key)] = value;
  out.created_date = row.created_at;
  return out;
};

class ServiceError extends Error {
  constructor(error, fallbackStatus) {
    super(error?.message || 'Request failed');
    this.status = error?.status || (error?.code === 'PGRST116' ? 404 : fallbackStatus);
    this.code = error?.code;
  }
}

const check = ({ data, error, count }, status) => {
  if (error) throw new ServiceError(error, status);
  return { data, count };
};

// Translate the Mongo-style filters used by the UI ($in, $ne, $gte, $lte, $regex, $or, $all) to PostgREST.
const quote = (value) => `"${String(value).replace(/"/g, '\\"')}"`;
const orTerm = (field, cond) => {
  const col = snake(field);
  if (cond && typeof cond === 'object' && '$regex' in cond) return `${col}.ilike.${quote(`%${cond.$regex}%`)}`;
  return `${col}.eq.${quote(cond)}`;
};

function applyFilter(query, filter = {}) {
  for (const [field, cond] of Object.entries(filter)) {
    if (field === '$or') {
      query = query.or(cond.flatMap((group) => Object.entries(group).map(([f, c]) => orTerm(f, c))).join(','));
      continue;
    }
    const col = snake(field);
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$in' in cond) query = query.in(col, cond.$in);
      if ('$ne' in cond) query = query.neq(col, cond.$ne);
      if ('$gte' in cond) query = query.gte(col, cond.$gte);
      if ('$lte' in cond) query = query.lte(col, cond.$lte);
      if ('$all' in cond) query = query.contains(col, cond.$all);
      if ('$regex' in cond) query = query.ilike(col, `%${cond.$regex}%`);
    } else {
      query = query.eq(col, cond);
    }
  }
  return query;
}

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return query.order(field === 'created_date' ? 'created_at' : snake(field), { ascending: !desc });
}

function createRepo(table, { columns, selectColumns }) {
  const allowed = new Set(columns.map(snake));
  const select = selectColumns || '*';
  const toRow = (data) => {
    const row = {};
    for (const [key, value] of Object.entries(data || {})) {
      const col = snake(key);
      if (allowed.has(col) && value !== undefined) row[col] = value;
    }
    return row;
  };
  const page = (rows, offset, limit, total) => ({
    items: (rows || []).map(toRecord),
    next_cursor: (rows || []).length === limit ? String(offset + limit) : null,
    has_more: (rows || []).length === limit && (total === undefined || offset + limit < total),
  });

  const repo = {
    async filter(filter = {}, { sort, limit = 50, cursor } = {}) {
      const offset = Number(cursor) || 0;
      let query = supabase.from(table).select(select, { count: 'exact' });
      query = applySort(applyFilter(query, filter), sort).range(offset, offset + limit - 1);
      const { data, count } = check(await query);
      return page(data, offset, limit, count ?? undefined);
    },
    async list({ sort, limit = 50, cursor, distinct } = {}) {
      if (distinct) {
        const { data } = check(await supabase.from(table).select(snake(distinct)).limit(1000));
        const values = [...new Set((data || []).map((row) => row[snake(distinct)]).filter(Boolean))].sort();
        return { items: values, next_cursor: null, has_more: false };
      }
      return repo.filter({}, { sort, limit, cursor });
    },
    async count(filter = {}) {
      const { count } = check(await applyFilter(supabase.from(table).select('id', { count: 'exact', head: true }), filter));
      return count || 0;
    },
    async get(id) {
      const { data } = check(await supabase.from(table).select(select).eq('id', id).maybeSingle());
      if (!data) throw Object.assign(new Error('Not found'), { status: 404 });
      return toRecord(data);
    },
    // The id and timestamp are created here so anonymous visitors (who may insert but not read back) still get a record.
    async create(data) {
      const id = crypto.randomUUID();
      check(await supabase.from(table).insert({ ...toRow(data), id }));
      return toRecord({ ...toRow(data), id, created_at: new Date().toISOString() });
    },
    async bulkCreate(items) {
      const rows = items.map((item) => ({ ...toRow(item), id: crypto.randomUUID() }));
      check(await supabase.from(table).insert(rows));
      return rows.map(toRecord);
    },
    async update(id, data) {
      const { data: row } = check(await supabase.from(table).update(toRow(data)).eq('id', id).select(select).maybeSingle());
      if (!row) throw Object.assign(new Error('Not found or not permitted'), { status: 403 });
      return toRecord(row);
    },
  };
  return repo;
}

const propertyColumns = [
  'status','title','category','subtype','description','ownerName','ownerType','ownerPhone','ownerEmail',
  'city','locality','sublocality','pincode','address','landmark','lat','lng','bedrooms','bathrooms','balconies',
  'carpetArea','builtUpArea','propertyAge','floor','totalFloors','furnishing','gender','sharing','ac',
  'attachedBathroom','foodIncluded','petFriendly','rent','rentUnit','deposit','depositRefundable','maintenance',
  'electricity','water','foodCharges','wifiCharges','laundryCharges','parkingCharges','brokerage',
  'maintenanceDeposit','oneTimeCharges','otherCharges','parkingCapacity','minStay','noticePeriod','availableFrom',
  'amenities','images','rules','curfew','visitorPolicy','ownerVerified','propertyVerified','propertyVerificationNote',
];
const roommateColumns = [
  'displayName','age','occupation','organisation','city','locality','preferredCategory','budgetMin','budgetMax',
  'moveInDate','stayMonths','sleepSchedule','cleanliness','social','guestFrequency','noiseTolerance','foodHabit',
  'cooking','acUsage','smoker','drinks','pets','wfh','studyEnvironment','bio','contactEmail','paused',
];
const roommateSelect = 'id,owner_id,display_name,age,occupation,organisation,city,locality,preferred_category,budget_min,budget_max,move_in_date,stay_months,sleep_schedule,cleanliness,social,guest_frequency,noise_tolerance,food_habit,cooking,ac_usage,smoker,drinks,pets,wfh,study_environment,bio,paused,created_at';

export const entities = {
  Property: createRepo('properties', { columns: propertyColumns }),
  Room: createRepo('rooms', { columns: ['propertyId','roomNumber','floor','roomType','totalBeds','availableBeds','occupiedBeds','reservedBeds','rentPerBed','ac','attachedBathroom','status'] }),
  Bed: createRepo('beds', { columns: ['propertyId','roomId','roomNumber','bedNumber','monthlyRent','status'] }),
  Booking: createRepo('bookings', { columns: [] }), // read-only here; writes go through manageBooking()
  Visit: createRepo('visits', { columns: ['propertyId','propertyTitle','visitorName','phone','email','date','time','mode','message','status'] }),
  Enquiry: createRepo('enquiries', { columns: ['propertyId','propertyTitle','name','phone','email','message','moveInDate','status','ownerNote'] }),
  Review: createRepo('reviews', { columns: ['propertyId','propertyTitle','authorName','overall','text','status','verifiedVisit','verifiedTenancy'] }),
  Report: createRepo('reports', { columns: ['targetType','targetId','targetTitle','reason','details','priority','status','adminNote','reporterName'] }),
  OwnerVerification: createRepo('owner_verifications', { columns: ['ownerName','businessName','ownerType','email','phone','city','propertyCount','documentType','documentUri','status','adminNote'] }),
  RoommateProfile: createRepo('roommate_profiles', { columns: roommateColumns, selectColumns: roommateSelect }),
  RoommateConnection: createRepo('roommate_connections', { columns: ['fromProfileId','fromName','toProfileId','toName','message','status'] }),
};

export { toRecord };
