# HOMORA Discover — Agent Guide

This repository contains the HOMORA tenant-facing Discover frontend and a separately deployable custom Node.js API in `server/`.

## Project conventions
- Preserve existing Discover UI and workflows unless the user requests a redesign.
- Keep frontend API access behind `src/api/base44Client.js` during the compatibility migration; the filename is temporary and should be renamed to `homoraClient.js` after all imports are migrated.
- Backend modules belong under `server/src/modules/`; keep domain logic out of the Express entrypoint.
- PostgreSQL schema changes belong in `server/prisma/schema.prisma` and committed Prisma migrations.
- Never expose JWT secrets, database credentials, or privileged storage credentials to the browser.
- Enforce ownership and role checks on the server; client-side route guards are not security controls.
