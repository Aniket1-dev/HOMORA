# HOMORA shared API and deployment pipeline

## Runtime topology

All three applications use the same Supabase project `aqljtajusjnhubcafbwr` as the single source of truth.

- Discover (`homorodemo.vercel.app`): public listing and customer experience; uses the Supabase Data API and transactional RPCs.
- Partner (`homora-partner-connected.vercel.app`): partner operations; uses the same Supabase Data API, RLS and `manage_booking` RPC.
- Admin (`homora-admin.vercel.app`): privileged operations; uses the `admin-api` Edge Function with JWT + MFA + role checks. It listens for changes through the same Supabase Realtime project.

Do not create separate production databases or mirror business records between apps. Write once to Postgres; all apps read the same canonical rows.

## Cross-app data flow

1. Partner creates or updates a property, room, bed, visit, enquiry or booking.
2. Postgres validates access through RLS and database guards/triggers.
3. The committed row becomes visible to the authorized Admin/Discover clients.
4. Supabase Realtime emits a change event for the table.
5. Each app invalidates its active query/list and reloads from the canonical database.
6. Admin moderation updates the same row; Discover and Partner receive the same event and reload.

Booking create/approve/reject/confirm/cancel flows should continue to use `manage_booking`, not a client-side sequence of independent writes.

## Realtime and security

Migration `20261112041642_homora_cross_app_realtime.sql` was applied to the live project and is committed here. It adds missing admin/content/Discover tables to `supabase_realtime` and adds read-only admin policies for event streams previously denied to browser clients. The admin predicate lives in the non-exposed `private` schema and only returns a boolean, avoiding public RPC exposure and RLS recursion. It does not grant browser write permissions. Existing RLS policies remain the row-level authorization boundary.

Admin uses the protected Edge Function for reads/writes; Realtime is only an invalidation signal. Partner already subscribes to core shared tables; its invalidation map now includes profile and support-ticket changes. Discover has one schema-level listener that invalidates active queries.

Realtime is an acceleration mechanism, not a durable queue. Apps also refetch on window focus/reconnect so a disconnected browser repairs stale views from Postgres.

## CI/CD

### Discover

- Git branch: `supabase` (current production branch for `homorodemo`).
- `.github/workflows/ci.yml` runs `npm ci`, lint and production build on PRs and pushes.
- Vercel Git integration builds/deploys Discover from the branch.
- `.github/workflows/supabase-migrations.yml` is gated. Add GitHub Actions secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`, then set repository variable `HOMORA_SUPABASE_MIGRATIONS_ENABLED=true` to enable automatic production migration deployment. CLI is pinned to v2.122.1 because CLI v3 changes hosted migration defaults/confirmation behavior.

### Admin and Partner

The current Admin and Partner projects are ZIP/deployment based rather than a verified shared Git monorepo. This package contains their source patches and the matching migration. Deploy each updated app through its existing Vercel project. For continuous deployment, connect each Vercel project to its own Git repository (or migrate all three into a tested monorepo with separate Vercel root directories); do not point two apps at the same root directory.

## Required environment contract

All apps must use:

- `https://aqljtajusjnhubcafbwr.supabase.co`
- the same Supabase publishable/anon key (never a service-role key in browser builds)

Admin additionally requires `VITE_API_BASE_URL=https://aqljtajusjnhubcafbwr.supabase.co/functions/v1/admin-api`.

Cross-app links are navigation only; data sharing is provided by the shared backend.

## Verification status

- Live project reports healthy and contains the shared business tables.
- The cross-app Realtime publication/policies were applied and must be rechecked after deployment.
- Local source syntax/ZIP integrity checks are included in the handoff.
- Full live write/read E2E tests (partner create → admin moderation → Discover listing, booking → partner/admin) must be run with dedicated test accounts and test data; production data was not modified for test purposes.
