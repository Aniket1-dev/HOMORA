# HOMORA Discover — Claude Instructions

Maintain the current Discover experience while migrating all data/auth/file operations to the custom HOMORA API in `server/`. The API is a modular monolith (Express + Prisma + PostgreSQL), not a third-party backend-as-a-service.

Before changing a workflow, inspect its existing UI and API call sites. Add domain-specific backend behavior, input validation, ownership authorization, and tests. Do not implement booking or payment correctness in the browser. Use transactions for bed allocation and verified provider webhooks for payments. Never expose secrets in `VITE_*` variables.

Known migration gaps: production email delivery, OAuth, MFA, secure refresh-token rotation, S3-compatible storage, chat delivery, notifications, payment webhooks, PostGIS search, rate limiting, audit logs, and comprehensive automated tests. Do not claim these are complete.
