# Deployment guide

## 1. Supabase project

Use the existing CubeSMP Supabase project. PostgreSQL schema, initial catalog, and Storage buckets have already been provisioned.

- `payment-proofs`: private; only the server can upload and create signed review URLs.
- `product-images`: public read-only images; uploads are server-side.
- `site-assets`: public read-only site branding; uploads are server-side.

## 2. Configure environment

Copy `apps/web/.env.example` to `apps/web/.env` and configure:

- `SUPABASE_URL`: CubeSMP project URL.
- `SUPABASE_SECRET_KEY`: server-only Supabase secret key from Project Settings → API Keys. Never expose this key to the browser or use a `NEXT_PUBLIC_` prefix.
- `DATABASE_URL`: Supabase pooler connection string for application runtime.
- `DIRECT_URL`: direct PostgreSQL connection string for Prisma migrations.
- `APP_URL`: public web application origin.
- `SESSION_SECRET`: at least 32 random characters.
- `OWNER_BOOTSTRAP_EMAIL`, `OWNER_BOOTSTRAP_PASSWORD`, and `OWNER_BOOTSTRAP_MINECRAFT_NAME`.
- `BRIDGE_SHARED_SECRET`: at least 32 random characters; must match the Paper plugin config.

Use the database password you configured for the Supabase project. The connector does not expose database passwords or server secret keys. Store all production values in your hosting provider's secret manager, never in Git.

## 3. Install and baseline Prisma

From the repository root:

```bash
pnpm install
pnpm --filter @cubesmp/web db:generate
```

The CubeSMP Supabase database was provisioned directly before the web runtime was connected. On its first deployment only, baseline Prisma's migration history without rerunning the initial SQL:

```bash
pnpm --filter @cubesmp/web exec prisma migrate resolve --applied 20261127000000_init
pnpm --filter @cubesmp/web exec prisma migrate resolve --applied 20261127150000_supabase_storage_security
pnpm --filter @cubesmp/web exec prisma migrate resolve --applied 20261127160000_supabase_index_and_function_hardening
```

After the baseline, use `pnpm --filter @cubesmp/web db:deploy` for future committed migrations. Do not run `prisma migrate dev` against production.

## 4. Create the first Owner

Set `OWNER_BOOTSTRAP_EMAIL`, `OWNER_BOOTSTRAP_PASSWORD`, and `OWNER_BOOTSTRAP_MINECRAFT_NAME` in the web app environment, then run:

```bash
pnpm --filter @cubesmp/web owner:create
```

Remove the bootstrap variables from the normal runtime environment after use.

## 5. Configure store and payment methods

Sign in as Owner, open Admin → Store management, and edit the sample PHP prices, product benefits, images, and delivery commands. The starter values are examples only.

Open Payment settings to configure GCash and Maya account names, numbers, QR codes, and instructions, then enable the methods. No payment gateway is connected: each payment remains pending until a human administrator checks the receipt and approves or rejects it.

## 6. Deploy the website

Build with `pnpm --filter @cubesmp/web build` and run with `pnpm --filter @cubesmp/web start`. Configure HTTPS and provide all runtime environment variables. Keep `SUPABASE_SECRET_KEY` server-side only. Configure Supabase database backups and Storage retention for uploaded proof objects.

## 7. Install CubeSMP Bridge

Build the plugin:

```bash
mvn -f apps/bridge/pom.xml package
```

Copy `apps/bridge/target/cubesmp-bridge-1.0.0.jar` into the Paper server's `plugins` directory and start the server once. Edit `plugins/CubeSMPBridge/config.yml`:

- `website.url`: public HTTPS origin of the CubeSMP website (no trailing slash).
- `website.api-key`: the same value as `BRIDGE_SHARED_SECRET`.
- `delivery.check-interval`: polling interval in seconds.

Restart or use `/cubesmpbridge reload`.

## 8. Verify end-to-end

Use a staging product and a small test payment. Confirm the player can submit a proof, an administrator can review it, approval creates one delivery job, the Paper plugin receives it, the configured command runs, and the backend records the result and credits the website points ledger when applicable.
