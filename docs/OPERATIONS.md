# Operations and security checklist

## Before production

- [ ] Configure HTTPS, Supabase PostgreSQL backups, Storage retention/backup policy, and monitoring.
- [ ] Set long random session and bridge secrets; rotate them if exposed.
- [ ] Restrict Owner bootstrap command and remove bootstrap environment variables after use.
- [ ] Configure reverse-proxy rate limiting for login, registration, proof upload, and checkout endpoints.
- [ ] Configure Supabase Storage lifecycle and retention for payment evidence.
- [ ] Configure a malware scanning process and access policy for payment proofs.
- [ ] Review sample product prices, rank benefits, and delivery commands.
- [ ] Verify GCash/Maya details with the account owner.
- [ ] Test all delivery commands on staging and validate installed plugin command names.
- [ ] Restrict Paper server outbound access to the website and protect plugin config backups.
- [ ] Test failed delivery, server outage, API timeout, and manual recovery procedures.

## Supabase setup

- Set `SUPABASE_URL` to the CubeSMP project URL and `SUPABASE_SECRET_KEY` to a server-only project secret key. Never expose the secret key with a `NEXT_PUBLIC_` prefix.
- Set `DATABASE_URL` to the Supabase pooler connection string for application runtime and `DIRECT_URL` to the direct PostgreSQL connection string for Prisma migrations.
- Copy `apps/web/.env.example` and fill in the database password, Supabase server secret key, and application secrets.
- The existing CubeSMP tables were provisioned directly in Supabase. On first deployment only, baseline Prisma history without rerunning the already-applied SQL using the three `prisma migrate resolve --applied` commands in [DEPLOYMENT.md](DEPLOYMENT.md).
- Buckets `payment-proofs` (private), `product-images` (public), and `site-assets` (public) are provisioned.
- Application tables have RLS enabled and direct Data API grants revoked. Next.js accesses them through its server-side Prisma database connection. No browser client receives direct access to the application tables.

## Initial catalog

The Supabase project has seven enabled starter products with editable PHP prices: VIP ₱149, MVP ₱299, ELITE ₱499, Starter 1,000 points ₱49, Standard 3,000 points ₱129, Advanced 5,000 points ₱199, and Premium 10,000 points ₱349. These are sample prices only; change them in Admin → Store before launch. GCash and Maya payment methods remain disabled until the Owner configures real payment details.

## Payment review

Uploaded screenshots are evidence only. They are never automatically approved. Only Owner/Admin roles can approve or reject. The review endpoint changes only a PENDING payment; an approved payment creates one delivery job under a unique order constraint. Review actions are written to the audit log.

Payment proof objects are uploaded server-side to the private Supabase Storage `payment-proofs` bucket after validating JPEG, PNG, or WebP file signatures and a 5 MB size limit. They are stored under a per-user private object key. Admin proof links are short-lived signed URLs. Product images and site assets use public Supabase Storage buckets. The Supabase server secret key is required only on the server and must never be exposed to browser code.

## Delivery semantics and limitations

The Bridge executes configured console commands on the Paper main thread and performs HTTP calls asynchronously. The backend creates one delivery job per order and uses status transitions to avoid concurrent claims. The website point balance is credited in the same transaction that records a successful bridge result.

**Generic Minecraft console commands cannot provide mathematically guaranteed exactly-once side effects.** If the server executes a command and crashes before the success acknowledgement reaches the website, an operator must inspect the server and delivery log before manually retrying. Prefer idempotent commands and provider APIs with transaction IDs for production-grade fulfillment. The current Bridge reports whether Bukkit accepted the command, not whether every third-party plugin completed its internal operation.

## Current implementation boundaries

- Rate limiting is expected at the reverse proxy/hosting edge; the app does not yet include a distributed rate-limit store.
- Advanced navigation editing, theme presets, announcement scheduling, email notifications, and receipts remain to be completed. Logo upload, social links, editable brand colors, product images/categories, transaction search/filtering, player management, announcement create/edit/publish/delete, and homepage/support content settings are implemented.
- The Bridge currently polls and executes product delivery commands; configurable built-in LuckPerms/PlayerPoints adapters, persistent plugin-side receipt storage, and a lease-recovery admin workflow remain to be completed.
- Email notifications and automated receipts are not yet wired.
- Do not use this deployment for real payments until CI, security review, and full staging verification pass.
