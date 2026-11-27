# Deployment guide

## 1. Provision services

Provision a PostgreSQL database and a private S3-compatible bucket. The bucket must not allow public reads. Configure HTTPS for the web application and allow the web server to reach the storage endpoint.

## 2. Configure environment

Copy `.env.example` and configure:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET` (at least 32 random characters)
- `OWNER_BOOTSTRAP_EMAIL`
- `OWNER_BOOTSTRAP_PASSWORD` (at least 16 random characters)
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `BRIDGE_SHARED_SECRET` (at least 32 random characters)

Never commit production secrets. Use your hosting provider's secret manager.

## 3. Install and migrate

From the repository root:

```bash
pnpm install
pnpm --filter @cubesmp/web db:generate
pnpm --filter @cubesmp/web db:deploy
pnpm --filter @cubesmp/web db:seed
```

For production, generate and review a Prisma migration in a development environment, commit it, and run `prisma migrate deploy` during release.

## 4. Create the first Owner

Set `OWNER_BOOTSTRAP_EMAIL` and `OWNER_BOOTSTRAP_PASSWORD` in the web app environment, then run:

```bash
pnpm --filter @cubesmp/web owner:create
```

The script creates or promotes that email to Owner and rotates its password. Remove the bootstrap variables from the normal runtime environment after use.

## 5. Configure store and payment methods

Sign in as Owner, open Admin, then Store management. Set actual prices in PHP, review delivery commands, and enable products only after testing commands on a staging server.

Open Payment settings to configure GCash and Maya account names, numbers, instructions, and enable the methods. No payment gateway is connected: every payment remains pending until a human administrator checks the receipt and approves or rejects it.

## 6. Deploy the website

Build with `pnpm build` and run with `pnpm --filter @cubesmp/web start`. Configure your platform to expose the Next.js server over HTTPS. Keep the S3 bucket private and configure backups for PostgreSQL and uploaded proof objects.

## 7. Install CubeSMP Bridge

Build the plugin:

```bash
mvn -f apps/bridge/pom.xml package
```

Copy `apps/bridge/target/cubesmp-bridge-1.0.0.jar` into the Paper server's `plugins` directory and start the server once. Edit `plugins/CubeSMPBridge/config.yml`:

- `website.url`: public HTTPS origin of the CubeSMP website (no trailing slash).
- `website.api-key`: the same secret as `BRIDGE_SHARED_SECRET`.
- `delivery.check-interval`: polling interval in seconds.

Restart or use `/cubesmpbridge reload`.

## 8. Verify end-to-end

Use a staging product and a small test payment. Confirm the player can submit a proof, an administrator can review it, approval creates exactly one delivery job, the Paper plugin receives it, the configured command runs, and the backend records the result and credits the website points ledger when applicable.
