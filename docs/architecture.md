# Architecture (DRAFT — needs love)

> This file was started a while ago and hasn't been kept up to date.
> Treat as partial. Update what you change.

## Modules

The HTTP path flows through explicit layers: **route → middleware → controller →
service → repository → (db)**. Each layer only knows about the one below it.

- **`server.ts`** — Express bootstrapper. Wires routers to paths and mounts auth +
  the terminal error handler.
- **`db.ts`** — SQLite connection + schema init. Single shared `db` instance.
- **`middlewares/`** — cross-cutting request handling.
  - `auth.ts` — trusts `X-Merchant-Id` header (placeholder for a signed token).
  - `error-handler.ts` — terminal 500 handler; never leaks internals.
- **`routes/`** — Express routers, one file per resource (`*.routes.ts`). Thin: they
  only bind paths to controller methods.
- **`controllers/`** — HTTP layer. Read the request, delegate to a service, shape the
  response. No business logic or SQL.
- **`services/`** — business logic. No req/res, no SQL. Talk to repositories.
- **`repositories/`** — data-access layer. All queries route through here on the
  shared `db` connection — one place for auditing, caching, tenancy filters, and the
  seam for swapping the store (e.g. an ORM) later. `metricsRepository` now reads
  through this seam too (it previously opened its own connection).
- **`models/`** — domain/type definitions shared across layers.
- **`scripts/`** — one-off tasks (`seed.ts`).
- **`lib/`** — utilities. Reserved for shared helpers.

## Data model

Two tables: `merchants`, `orders`. See `db.ts` for the canonical DDL.

`orders.type` is one of `'sale' | 'refund'`. A refund row records that a sale
was reversed; it does not by itself reverse the sale row.

## Open items

- ~~Wire `dashboard.tsx` once we pick a frontend framework~~ — went with static HTML+fetch instead. Doc stale.
- Decide whether `analytics-events` is its own service or a route here.
- Audit logging — TBD where it lives.
