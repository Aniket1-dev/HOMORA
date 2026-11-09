# HOMORA API — Railway deployment

The root of this repository is the Vite Discover frontend. The Railway API service should use repository root (`/`) as its service root and the Dockerfile path `server/Dockerfile`. The Dockerfile is written for repository-root build context; do not change the service root to `/server` unless you also change its COPY paths.

## Railway service settings
- Builder: Dockerfile
- Dockerfile path (repository-root deployment): `server/Dockerfile`
- Health check path: `/health`
- Required variable: `DATABASE_URL_POOLED` (Prisma Postgres pooled URL; application runtime queries)
- Required variable: `DATABASE_URL` (Prisma Postgres direct URL; Prisma CLI schema operations)
- Required variable: `JWT_ACCESS_SECRET` (long random secret, at least 32 characters)
- Optional variables: `NODE_ENV=production`, `CORS_ORIGINS` (comma-separated frontend origins), `PUBLIC_API_URL` (public API origin), `REQUIRE_VERIFIED_EMAIL=false`

Do not set the Railway API service's build command to `npm run build` at the repository root. That command builds the frontend, not the API.

The Dockerfile uses repository-root build context and copies the API package, Prisma schema and source from `server/`. The Vercel Prisma integration's variables do not automatically appear in Railway: add `DATABASE_URL_POOLED` and `DATABASE_URL` separately to Railway's service Variables. Use the pooled URL for `DATABASE_URL_POOLED` and the direct URL for `DATABASE_URL`. At container startup it runs `npx prisma db push` to create/update the initial schema, then starts Express. This is only a bootstrap strategy because this repository does not yet contain a reviewed migration history. Before accepting production data, create and commit a baseline Prisma migration and switch startup to `prisma migrate deploy`.

## Current backend limits
This is an initial migration foundation, not yet a production-complete system. Email OTP codes are logged only when not in production; production email delivery is not wired. Uploads use local disk and are not durable across ephemeral containers. Configure object storage before accepting real KYC/property documents. Add rate limiting, refresh-token rotation, authorization tests, audit logging, and booking race-condition tests before launch.
