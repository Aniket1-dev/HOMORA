# HOMORA Discover

Accommodation marketplace (PGs, hostels, flats, rooms, roommates). React + Vite + Tailwind frontend on a Supabase backend
(Auth, PostgreSQL with Row Level Security, Storage).

## Setup

1. `npm install`
2. Create a Supabase project. In **SQL Editor**, run `supabase/migrations/0001_homora_schema.sql`
   (or `supabase db push` with the Supabase CLI).
3. `cp .env.example .env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings -> API).
4. Dashboard steps that SQL cannot do (see "Manual dashboard steps" below).
5. `npm run dev`

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Manual dashboard steps

- **Auth -> Providers -> Email**: enable; turn "Confirm email" on.
- **Auth -> Email Templates -> Confirm signup**: include `{{ .Token }}` so users receive the 6-digit code the sign-up screen asks for.
- **Auth -> URL Configuration**: set Site URL and add your domain(s) + `/reset-password` to Redirect URLs.
- **Auth -> Providers -> Google** (optional): add OAuth client ID/secret; the Google button needs it.
- **Auth -> Multi-Factor**: ensure TOTP is enabled (used by `/mfa`).
- **First admin**: sign up, then in SQL Editor run
  `insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';`
- Add rate limits / CAPTCHA for sign-up and OTP in Auth settings.

## Architecture

- `src/lib/supabase/client.js` - single browser client (anon key only).
- `src/services/entities.js` - table repositories (camelCase <-> snake_case, whitelisted columns).
- `src/services/bookings.js` - `manage_booking` RPC (transactional booking/bed allocation), visit cancel, view counter.
- `src/services/storage.js` - listing photos (public bucket) and KYC documents (private bucket, signed URLs).
- `src/lib/auth.js`, `src/lib/AuthContext.jsx` - Supabase sessions, sign-up/in, Google, reset, TOTP.
- `supabase/migrations/` - schema, RLS policies, RPCs, storage policies. Authorization lives here, not in route guards.

## Security notes

- Never put the service-role key in `VITE_*` variables or frontend code.
- Bookings can only be changed through `manage_booking`; prices and bed availability are decided in the database.
- Guest enquiries/visits/bookings are identified by their unguessable id (stored in the visitor's browser); consider requiring sign-in.

## Database tests

`supabase/tests/rls_test.py` applies the migration to a throwaway embedded Postgres (with a small Supabase shim) and checks
RLS, column privileges, server-side booking pricing, 8-way concurrent booking of one bed, roommate contact privacy and
storage policies. Run from the project root: `pip install pgserver psycopg2-binary && python supabase/tests/rls_test.py`.
It does not replace testing against a real Supabase project.

## Known limitations / decisions to review

- Schema is reconstructed from frontend usage, not recovered from the previous backend; review it before loading real data.
  No production data was migrated - there was no export.
- Two-step verification supports authenticator apps (TOTP) only. The old SMS-code option is not offered.
- The Roommates page now requires sign-in (profiles hold personal data). The host console (`/host`) requires sign-in; the
  admin tab additionally requires an `admin` row in `user_roles`.
- Guest enquiries, visits and bookings still work without an account; they are identified by an unguessable id kept in the
  visitor's browser. Add CAPTCHA/rate limits (Supabase Auth settings, or an Edge Function) before launch.
- Reviews publish immediately (unchanged behaviour); an admin can hide them (`reviews.status = 'hidden'`) but there is no UI yet.
- Payments are not implemented; booking payment status stays `offline_pending`.
- Saved homes / compare list remain in browser storage.


## HOMORA Partner integration

Discover and Partner are separate frontends using the same Supabase project, Auth identities and shared PostgreSQL records. Set `VITE_PARTNER_APP_URL` to the deployed Partner origin to enable owner entry points. Partner-created properties are stored in `public.properties`; only Admin-approved rows with `status = published` are visible to Discover. Rooms, beds, enquiries, visits, bookings and notifications are shared rows protected by RLS and signalled through Supabase Realtime. Auth identities are shared, but browser sessions are origin-scoped, so users may need to sign in once in each application.
