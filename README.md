# CubeSMP

CubeSMP is a Minecraft server storefront and management platform with a Next.js web application, Supabase PostgreSQL and Storage, manual GCash/Maya verification, and a separate Paper plugin named CubeSMP Bridge.

## Repository layout

- `apps/web` — Next.js storefront, player accounts, admin screens, API routes.
- `apps/web/prisma` — PostgreSQL Prisma schema, migrations, and product seed.
- `apps/bridge` — Paper plugin that polls approved delivery jobs.
- `docs` — architecture, setup, operations, and security notes.

## Requirements

- Node.js 22+
- pnpm 10+
- Supabase project (PostgreSQL and Storage)
- Java 21 and Maven 3.9+

## Local setup

1. Copy `apps/web/.env.example` to `apps/web/.env` (or provide the variables in your web runtime).
2. Fill in `SUPABASE_URL`, the server-only `SUPABASE_SECRET_KEY`, `DATABASE_URL`, and `DIRECT_URL` from your CubeSMP Supabase project.
3. Generate long random `SESSION_SECRET` and `BRIDGE_SHARED_SECRET` values.
4. Install dependencies from the repository root: `pnpm install`.
5. Generate Prisma Client: `pnpm --filter @cubesmp/web db:generate`.
6. For the already-provisioned CubeSMP Supabase project, baseline Prisma migration history as described in [deployment](docs/DEPLOYMENT.md). Do not rerun the initial schema SQL against the populated project.
7. Seed the editable catalog: `pnpm --filter @cubesmp/web db:seed`.
8. Create the first Owner using the one-time bootstrap variables and command described in [deployment](docs/DEPLOYMENT.md).
9. Start the website: `pnpm dev`.

The starter catalog includes VIP, MVP, ELITE and 1,000 / 3,000 / 5,000 / 10,000 point packages with sample PHP prices. Change them in Admin → Store before launch. GCash and Maya remain disabled until the Owner configures real payment details.

## Build the Bridge plugin

Run `mvn -f apps/bridge/pom.xml package`. The plugin JAR is created under `apps/bridge/target/`. Install it on the target Paper server, edit `plugins/CubeSMPBridge/config.yml`, then restart the server.

See [deployment](docs/DEPLOYMENT.md), [operations](docs/OPERATIONS.md), and [architecture](docs/ARCHITECTURE.md).

## Current status

This is an active implementation branch, not yet a production-ready release. The remaining production controls and known delivery semantics are documented in [operations](docs/OPERATIONS.md). Do not use it for real payments until CI passes, the Supabase runtime secrets are configured, and the full purchase-to-delivery flow is tested on a staging server.
