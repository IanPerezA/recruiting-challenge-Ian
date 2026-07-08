Decision Log — Ian Miztli Perez Aguirre

Authorship declaration

I used AI only to create this file and set up the given structure. The content here is 100% mine.

Issues addressed

- **Issue 1 — Weak file order**
  - What was wrong or weak: The original code was flat and mixed many jobs. Route handlers went straight to the database. metrics.ts opened a second SQLite connection and did not use the shared data layer. There was no clear split between HTTP, business logic, and data access. This works for three endpoints, but it does not scale, and every small change broke unrelated code.
  - Shape of my improvement: I always build a REST API with this layer structure:
     1. routers
     2. middlewares
     3. controllers
     4. services
     5. repositories
     6. models
     7. utils
  - **Confidence (1–10):** 10
  - **What would falsify this fix:** Compilation problems caused by a domino effect.
  - **I disagreed with Claude on:** I did not want to mix the file move and the metrics fix in one commit. I wanted the refactor to be only structural (moves, not fixes), so each bug fix could go in its own commit.
  - Alternatives I considered and rejected: I thought about a feature-based folder layout (all "orders" code in one folder). I rejected it because with only one resource I wanted the layer limits to be clear and easy to enforce.

- **Issue 2 — Refunds computed as positive revenue**
  - What was wrong or weak: The OrdersRepository and the aggregation layer summed total_amount for all transactions. The database saves refunds as positive numbers, so refunds were counted as sales. This inflated total revenue, average order value, and the top-customer metrics.
  - Shape of my improvement: I changed the aggregation logic to check the transaction type. Now the business layer adds the amount when the type is 'sale' and subtracts it when the type is 'refund'.
  - **Confidence (1–10):** 9
  - **What would falsify this fix:** If production has old records where refunds were already saved as negative numbers. Then my subtraction would flip them again and turn them into an addition.
  - **I disagreed with Claude on:** did not disagree (The math fix is simple. I only made sure Claude applied the subtraction rule in both the revenue service and the metrics breakdown.)
  - Alternatives I considered and rejected: Saving refunds as negative numbers during the database seed. I rejected it because financial schemas usually store amounts as absolute values and leave the sign rule to the business layer.

- **Issue 3 — Broken date-range filtering boundaries**
  - What was wrong or weak: The app compared YYYY-MM-DD strings directly with full ISO-8601 strings from the database. It was a plain string comparison and treated to as exclusive, so all transactions on the to day were dropped (the "30-day revenue" metric missed today). Also, a from filter without a to filter was silently ignored.
  - Shape of my improvement: I changed the query limits to turn the input into full-day timestamps. Now to is extended to the end of its day (23:59:59.999Z), so it is inclusive. I also changed the logic to support partial ranges, so filtering works when only from or only to is given.
  - **Confidence (1–10):** 9
  - **What would falsify this fix:** If a client sends a timestamp that already has a timezone or a time part. Then my end-of-day logic could push the date into the next day.
  - **I disagreed with Claude on:** did not disagree (Extending to to a full day and allowing open ranges is the standard pattern for text date fields.)
  - Alternatives I considered and rejected: Forcing the frontend to always send both dates with hours. I rejected it because it leaks database details and pushes validation work up to the UI.

- **Issue 4 — Missing runtime input validation and uncapped database limits**
  - What was weak: The app did not validate parameters from the network down to the database. POST /api/orders accepted negative values, decimals, or huge values for total_amount, and did not check the transaction type. Also, limit failed on text (Number('abc') === NaN) and had no maximum, which opened a denial-of-service risk with large data.
  - Shape of my improvement: I added runtime schema checks in the controllers. total_amount must be a positive, non-zero integer with a realistic maximum, and the transaction type must be in an allowlist. For limit, I set a default of 100 and a hard cap of 250. Bad input now fails fast with a 400 Bad Request.
  - **Confidence (1–10):** 10
  - **What would falsify this fix:** If a big client legally needs to process a bulk payment above my cap. Then my rule would block a valid business action.
  - **I disagreed with Claude on:** Claude wanted to silently clamp a bad limit to a safe default. I rejected this because hiding client errors makes debugging harder later. A strict 400 Bad Request keeps the limits clear.
  - Alternatives I considered and rejected: Using a heavy validation library like Zod or Joi. I rejected it to keep dependencies small for this service, and used clean, type-safe native checks instead.

Feature chosen

- **Feature:** Feature C — Order search with filters

- **Why this one and not the others:** This feature let me build a real Data Access Layer with the repository pattern using Sequelize. The other features focus on infrastructure and I/O side effects. Feature C is about query design, indexing, and input under bigger datasets, which fits the new multi-layer architecture well.
- **What I cut to ship it in budget:** I skipped deep query benchmarks on SQLite to stay inside the 24-hour limit. Instead of testing millions of rows, I spent the time on the layer architecture, the core logic fixes, and the frontend filter dashboard.
- **Confidence (1–10) that the shape I picked is the right one:** 8
- **What would change my mind:** If a benchmark shows that Sequelize's overhead on complex Op.and/Op.between queries is much slower than raw SQL under a production load of 1.5k RPS.

Things I noticed but did NOT fix

Auth uses an X-Merchant-Id header that anyone can fake (a placeholder for a signed token), so tenancy is only as strong as the header. I left it because real signed auth is a bigger topic, not a small change. @types/express@5 is installed against an express@4 runtime; this mismatch showed up as a req.params type error. I noted it but did not fix it. The new composite indexes are created with Sequelize sync(), not a real migration (fine for dev, not for production). The customer_email search uses LIKE '%x%', which cannot use a b-tree index (a within-tenant scan, ok at this size). And total_spent in top-customers can now be negative for a net-refunding customer — correct under the net rule, but a visible edge case.

Docs / code I left alone deliberately

I left the X-Merchant-Id auth as it is on purpose, because real signed tokens need a design talk first. I also did not touch the seed's use of Math.random, even though it makes the dataset change every time, because a stable golden dataset would be its own task.

What I'd do with another 6 hours

Replace the header auth with a signed token and add a middleware test that proves a fake or unsigned header is rejected. Add cursor pagination to search so large offsets do not get slow. Move the schema changes from sync() to a real migration tool. Add golden/contract tests on the metrics so the refund-sign rule cannot break in silence.

Where I felt uncertain

- I am not sure if extending to to 23:59:59.999Z is fully safe across the two stored created_at formats and any future input with a timezone.
- I am not sure if choosing Sequelize (async, weaker typing) over a synchronous typed query builder was the right call, because it makes the "compiler as a gate" idea from Class 1 a bit weaker.
- I am not sure if the amount range should filter on the absolute stored amount or on the net signed amount. I chose absolute for search, but I am not certain that matches how a merchant really thinks.
