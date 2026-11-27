# CubeSMP

CubeSMP is a Minecraft server storefront and management platform with a Next.js web application, PostgreSQL database, manual GCash/Maya verification, and a separate Paper plugin named CubeSMP Bridge.

## Repository layout

- `apps/web` — Next.js storefront, player accounts, admin screens, API routes.
- `apps/web/prisma` — PostgreSQL Prisma schema and initial product seed.
- `apps/bridge` — Paper plugin that polls approved delivery jobs.
- `docs` — architecture, setup, operations, and security notes.

## Requirements

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+
- Java 21 and Maven 3.9+
- S3-compatible private object storage for payment proofs

## Local setup

1. Copy `.env.example` to `apps/web/.env` (or provide variables in the web app runtime).
2. Set `DATABASE_URL` to a PostgreSQL database.
3. Generate long random `SESSION_SECRET` and `BRIDGE_SHARED_SECRET` values.
4. Configure private S3 storage values.
5. Install dependencies from the repository root: `pnpm install`.
6. Generate Prisma Client: `pnpm --filter @cubesmp/web db:generate`.
7. Apply the schema in development: `pnpm --filter @cubesmp/web db:migrate -- --name init`.
8. Seed the initial disabled catalog: `pnpm --filter @cubesmp/web db:seed`.
9. Create the first Owner using the one-time bootstrap variables and command described in [deployment](docs/DEPLOYMENT.md).
10. Start the website: `pnpm dev`.

The seeded VIP, MVP, ELITE and 1,000 / 3,000 / 5,000 / 10,000 point packages are disabled and have no price until the Owner configures them. This avoids publishing accidental free products or inventing prices.

## Build the Bridge plugin

Run `mvn -f apps/bridge/pom.xml package`. The plugin JAR is created under `apps/bridge/target/`. Install it on the target Paper server, edit `plugins/CubeSMPBridge/config.yml`, then restart the server.

See [deployment](docs/DEPLOYMENT.md), [operations](docs/OPERATIONS.md), and [architecture](docs/ARCHITECTURE.md).

## Current status

This is an active implementation branch, not yet a production-ready release. The remaining production controls and known delivery semantics are documented in [operations](docs/OPERATIONS.md). Do not use it for real payments until CI passes, a real PostgreSQL/S3 deployment is configured, and the full purchase-to-delivery flow is tested on a staging server.
