# HOMORA API — Railway deployment

The root of this repository is the Vite Discover frontend. The Railway API service must use the repository root with the Dockerfile at `server/Dockerfile`, or deploy the `server` directory as its service root.

## Railway service settings
- Builder: Dockerfile
- Dockerfile path (repository-root deployment): `server/Dockerfile`
- Health check path: `/health`
- Required variable: `DATABASE_URL` (Railway PostgreSQL connection string)
- Required variable: `JWT_ACCESS_SECRET` (long random secret, at least 32 characters)
- Optional variables: `NODE_ENV=production`, `CORS_ORIGINS` (comma-separated frontend origins), `PUBLIC_API_URL` (public API origin), `REQUIRE_VERIFIED_EMAIL=false`

Do not set the Railway API service's build command to `npm run build` at the repository root. That command builds the frontend, not the API.

The container runs Prisma schema deployment before starting the Express API. This initial schema is managed with Prisma's `db push` because this repository does not yet contain a reviewed migration history. For production, convert this to committed Prisma migrations before using critical production data.

## Current backend limits
This is an initial migration foundation, not yet a production-complete system. Email OTP codes are logged only when not in production; production email delivery is not wired. Uploads use local disk and are not durable across ephemeral containers. Configure object storage before accepting real KYC/property documents. Add rate limiting, refresh-token rotation, authorization tests, audit logging, and booking race-condition tests before launch.
