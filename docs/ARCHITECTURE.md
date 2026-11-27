# CubeSMP Architecture

## Repository strategy

CubeSMP is a monorepo with two independently built applications:

- `apps/web`: Next.js + TypeScript storefront, player portal, admin dashboard, and server-side REST API.
- `apps/bridge`: Java Paper plugin (Maven) that polls the website for queued deliveries and reports execution results.
- `packages/database`: Prisma schema, migrations, and shared database documentation (consumed by the web app).

The current repository had no application code or framework to preserve. This document establishes the proposed architecture before implementation.

## Web application

- Next.js App Router with server components by default.
- TypeScript and Tailwind CSS for the responsive blue/black interface.
- PostgreSQL as the source of truth; Prisma for schema, migrations, and typed queries.
- Server-side session authentication with securely hashed passwords.
- Role-based authorization enforced in server actions/API handlers, not only in the UI.
- Private object storage for payment proofs; never expose storage credentials or public proof URLs.
- Product prices, rank benefits, payment instructions, and homepage content are database-managed.

## Core domain model

The initial relational model will cover:

- Users and sessions
- Roles and role assignments
- Product categories, products, ranks, and point packages
- Player point balances and immutable point ledger entries
- Orders and payment transactions
- Private payment proof metadata
- Delivery jobs and delivery attempt logs
- Website settings and announcements
- Administrative audit events

Money values must use integer minor units (for example, centavos), never floating-point values.

## Payment and delivery invariants

1. A submitted payment is always `PENDING`; uploaded proof is never treated as verification.
2. Only an authorized administrator can approve or reject a payment.
3. Approval is an atomic, idempotent server-side operation with an audit record.
4. Approval creates one durable delivery job using a unique order/idempotency key.
5. The Bridge claims queued jobs, executes configured commands, and reports a result.
6. A delivery job is never silently discarded when the game server is offline.
7. Retries must not create duplicate point credits or repeat non-idempotent commands without an explicit recovery policy.
8. Payment proof access is restricted to authorized reviewers and the owning player.

## Minecraft Bridge

The Paper plugin uses asynchronous HTTP I/O only. It authenticates to the backend using a per-server secret, requests work, executes commands on the server thread where required by the Paper API, and reports success/failure with the delivery job ID.

Secrets are stored in the plugin configuration and server environment, never in the browser. The backend stores only a secure representation or managed secret reference where feasible. The plugin supports configurable polling, bounded retries, timeouts, and structured logs.

## Admin authorization

- Owner: all configuration, user/role administration, payments, products, and audit history.
- Administrator: day-to-day store, payment, player, and content management; cannot manage Owners or transfer ownership.
- Moderator: limited support/player lookup and explicitly granted moderation actions; no payment approval or sensitive configuration by default.

Every privileged operation is authorized on the server and recorded in the audit log.

## Environments and deployment

Local development uses environment variables documented in `.env.example`. Production requires HTTPS, a managed PostgreSQL database, private object storage, secure session settings, backups, and a separately configured Paper server.

No real GCash/Maya gateway integration is assumed. The first release uses manual payment instructions and human verification only.

## Implementation order

1. Establish workspace, lint/type-check/build scripts, and design tokens.
2. Build the public storefront and responsive navigation.
3. Add database schema, migrations, authentication, and player dashboard.
4. Add catalog, cart/checkout, and manual payment submission.
5. Add role-protected admin CMS and payment review.
6. Implement durable delivery queue and REST API.
7. Implement and test the Paper Bridge plugin.
8. Add end-to-end tests, security review, and deployment documentation.

## Current status

Architecture only. No storefront, authentication, payment processing, database migrations, or plugin functionality is claimed to be implemented yet.
