# HOMORA API

Node.js/Express modular monolith with Prisma and PostgreSQL. Modules are organized by business capability so they can be extracted into separate services later only if scale requires it.

## Modules
- `auth`: password hashing, JWT access tokens, verification/reset code lifecycle.
- `entities`: initial CRUD service for properties, rooms, beds, bookings, visits, enquiries, reviews, owner verification, reports and roommate matching records.
- `bookings`: booking request/approval/rejection/cancellation and atomic bed reservation.
- `uploads`: authenticated local development upload endpoint.

## Run
```bash
cp .env.example .env
# set DATABASE_URL and JWT_ACCESS_SECRET
docker compose up -d postgres
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Production hardening still required
1. Use Prisma migrations (`prisma migrate dev` locally, `prisma migrate deploy` in releases) instead of `db push`.
2. Add SMTP delivery and abuse/rate limiting for registration, verification, password reset and login.
3. Add refresh-token rotation/revocation, MFA and OAuth provider integration.
4. Replace local uploads with S3-compatible storage, private KYC objects, signed URLs and malware scanning.
5. Expand authorization tests for every entity and role; audit all admin/moderator actions.
6. Add payment intents and signed webhook verification; never trust browser payment redirects.
7. Add transactional concurrency tests and reservation expiry/cleanup.
8. Add chat/message persistence, notifications, search indexing, PostGIS radius search and observability.
9. Add pagination cursors, query allowlists and per-route validation.
