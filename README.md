# HOMORA Discover

HOMORA Discover is the tenant-facing property discovery application. It now uses the HOMORA API rather than the Base44 SDK. The API is a separately deployable modular monolith backed by PostgreSQL.

## Architecture
- `src/`: existing React + Vite Discover experience.
- `server/src/modules/`: custom API modules (identity, entity services, booking, uploads).
- `server/prisma/schema.prisma`: HOMORA relational data model.
- `server/docker-compose.yml`: local PostgreSQL for development.

## Local setup

### 1. Start PostgreSQL
```bash
cd server
cp .env.example .env
# Set DATABASE_URL and JWT_ACCESS_SECRET in server/.env
docker compose up -d postgres
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Start Discover
In another terminal, from the repository root:
```bash
cp .env.example .env
npm install
npm run dev
```
Vite serves the UI on `http://localhost:5173`; the API listens on `http://localhost:4000`. The Vite dev server proxies `/api` and `/uploads` to the API.

## Important configuration
- Set a long random `JWT_ACCESS_SECRET`; do not commit secrets.
- Configure `CORS_ORIGINS` and `PUBLIC_API_URL` for deployed domains.
- Email OTP codes are logged to the API console in development. Production email delivery is not configured yet; connect an SMTP provider before enabling `REQUIRE_VERIFIED_EMAIL=true`.
- Google OAuth, MFA, payment webhooks, chat delivery, and production object storage are not enabled in this first backend foundation.
- Local uploads are for development only. Configure S3-compatible private/public buckets and signed URLs before production.

## Deployment
Deploy `server/` as a persistent Node.js service/container with managed PostgreSQL. Deploy the Vite frontend as a static site and set `VITE_API_URL` to the API origin. Run Prisma migrations as a release step. Do not deploy the API as a collection of serverless functions; the modular monolith expects a long-running Node process.

## Security status
The API has JWT authentication and ownership/role checks on the initial entity routes. Before production, complete endpoint-specific authorization tests, rate limiting, email delivery, secure refresh-token rotation, audit events, upload malware scanning, and booking concurrency tests. Review the TODO/security checklist in `server/README.md`.
