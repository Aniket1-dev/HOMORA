# AGENTS.md

HOMORA Discover: React + Vite frontend on Supabase (Auth, Postgres + RLS, Storage). See `README.md` for setup.

- Database access goes through `src/services/*`; do not scatter raw Supabase queries through components.
- Schema/policies live in `supabase/migrations/`. Change the database via new migration files, and keep RLS in step with UI changes.
- Never expose service-role keys in the browser; only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public.
- Route guards are UX only; enforce permissions with RLS and server-side functions.
