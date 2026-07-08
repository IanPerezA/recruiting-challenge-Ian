Sign-off — Ian Miztli Perez Aguirre

Authorship declaration

I used AI only to create this file and set up the given structure. The content here is 100% mine.

Legend: ✅ = read it, I'd ship it. ⚠️ = read most, some doubts. ❌ = did not fully read, accepted with named risks.

Sign-offs

- ✅ 07db7241 — Only created the submission files; no src/ or test/ touched.
- ❌ 09fc16c2 — Did not read the generated code; I only checked the API still runs and the new folder layout.
- ⚠️ 9cfbee8 — Read most: verified findById(id) → findById(id, merchantId) across controller, service, and repository, plus the new regression test; unsure how the frontend handles the new 404.
- ❌ 1980bf3 (migrate to Sequelize) — Did not read line by line; accepted because the full test suite and a live smoke on a fresh seeded DB gave the same JSON shapes and IDOR/refund behavior. Risk I accept: async ripple and Sequelize edges (sync() vs migrations).
- ⚠️ e302aca (refunds net of sales) — Read it: checked signedAmount() and the invariant test 10000+20000−5000= 25000, and that avg and top-customers use the same rule; unsure about the AVG-of-signed reading for avg_order_value.
- ⚠️ 2a1b1a5 (input validation) — Read it: checked the parser rules (positive-int amount, limit 1..250, no silent clamp, type allowlist) and the HTTP contract test; want one more look at malformed-JSON → 400.
- ❌ 932187f (order search) — Did not fully read the search layer; accepted because the 8 repository tests and a live smoke passed. Risk I accept: LIKE '%x%' performance and deep offset paging.
- ⚠️ ea73918 — Did not fully read the ported UI JS; accepted because the page and assets load and the queries return correct results. Risk I accept: light/dark, mobile, and modal states.
