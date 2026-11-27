# Operations and security checklist

## Before production

- [ ] Configure HTTPS, Supabase PostgreSQL backups, Storage retention/backup policy, and monitoring.
- [ ] Set long random session and bridge secrets; rotate them if exposed.
- [ ] Restrict Owner bootstrap command and remove bootstrap environment variables after use.
- [ ] Configure reverse-proxy rate limiting for login, registration, proof upload, and checkout endpoints.
- [ ] Configure Supabase Storage lifecycle and retention for payment evidence.
- [ ] Configure a malware scanning process and access policy for payment proofs.
- [ ] Set product prices, rank benefits, and delivery commands; keep products disabled until verified.
- [ ] Verify GCash/Maya details with the account owner.
- [ ] Test all delivery commands on staging and validate installed plugin command names.
- [ ] Restrict Paper server outbound access to the website and protect plugin config backups.
- [ ] Test failed delivery, server outage, API timeout, and manual recovery procedures.

## Supabase setup\n\n- Set `SUPABASE_URL` to the CubeSMP Supabase project URL and `SUPABASE_SECRET_KEY` to a server-only project secret key. Never expose the secret key with a `NEXT_PUBLIC_` prefix.\n- Set `DATABASE_URL` to the Supabase pooler connection string for application runtime and `DIRECT_URL` to the direct PostgreSQL connection string for Prisma migrations.\n- Copy `apps/web/.env.example` and fill in the database password and application secrets.\n- Buckets `payment-proofs` (private), `product-images` (public), and `site-assets` (public) are provisioned by the Supabase migration.\n- The application tables have RLS enabled and direct Data API grants revoked; Next.js accesses them through its server-side Prisma database connection.\n\n## Payment review

Uploaded screenshots are evidence only. They are never automatically approved. Only Owner/Admin roles can approve or reject. The review endpoint uses a database transaction and changes only a PENDING payment; an approved payment creates one delivery job under a unique order constraint. Review actions are written to the audit log.

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
