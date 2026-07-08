# Validation design — Ian Miztli Perez Aguirre



## Authorship declaration

I USED AI Just for create this file in my local project and set the structure provided. The content wrote over here is 100%  mine


### Class 1 — Multi-tenant authorization (IDOR)

- **Instances I fixed:**
    I identified a critical multi-tenant data leak in the `GET /api/orders/:id` endpoint. The original implementation fetched orders from the database using only the primary key (`id`), allowing any authenticated merchant to read any other merchant's orders by guessing the ID.

- **The gate I built (or would build):**
    After the architecture layer refactor, the `OrdersRepository` strictly enforces tenant isolation. I removed any single-argument lookup method from the data layer. The signature of the function now strictly requires the tenant context parameter: `findById(id: string, merchantId: string)`.

- **What this gate would catch that a regression test would miss:**
    A regression test only ensures that this specific endpoint is protected. It fails to prevent a teammate from creating a new endpoint tomorrow (like a cancel or delete order feature) and forgetting to check the tenant. By changing the repository signature, the TypeScript compiler acts as the gate; it becomes impossible to fetch data anywhere in the application without explicitly providing the `merchantId`.

- **Where to see the gate in the diff (file / commit / lines):**
    `src/repositories/orders-repository.ts` — inside the `findById` method. (Will append commit hash once merged).

- **If I did not build it, the reason (scope / time / dependency / "needs a wider conversation"):**
    N/A (Built and enforced during the data layer re-architecture).
### Class 2 — Refund Issue

- **Instances I fixed:**
  the method sumAmountByMerchant was incorrect by a validation mistake, it doesnt chech the transaction type so, it was adding refund movements to the revenue and the avg_order_value field
- **The gate I built (or would build):**

  modify the logic in order to sum only sale transactions and less refund ones
- **Where to see the gate in the diff:**
  (update commit hash when it is done)

### Class 3 — Chronological Boundary and Partial Range Correctness

- **Instances I fixed:** Corrected string comparison truncation and silent filtering drops within the dates processing scope inside `src/repositories/orders-repository.ts` (affecting the revenue and orders lookup services).
- **The gate I built (or would build):** A parameterized boundary execution test. This gate evaluates three extreme temporal invariants: (1) A transaction recorded at exactly `23:59:59.999` on the `to` date must be included in the dataset, (2) providing only a `from` parameter must structurally translate into a lower-bounded query open on the upper end, and (3) a transaction at `00:00:00.000` on the day following the `to` boundary must be strictly excluded.
- **What this gate would catch that a regression test would miss:** A typical regression test passes as long as an order in the middle of the month is found. It misses subtle off-by-one errors introduced by edge timezones or server desynchronizations during minor internal database library updates. The boundary gate checks the literal edge cases of the time spectrum.
- **Where to see the gate in the diff:** `test/orders.test.ts`   (update commit hash when it is done)


### Class 4 — Input Sanitation, Contract Enforcement, and Resource Bounds

- **Instances I fixed:** Fixed unbounded payload parsing vulnerabilities inside `src/controllers/orders-controller.ts` and missing limit sanitizers inside `src/controllers/metrics-controller.ts`.
- **The gate I built (or would build):** An API contract testing layer. This quality gate executes automated fuzzing vectors against HTTP entry endpoints, evaluating payloads with fuzz variables (e.g., fractional numbers, zero sums, symbols, extreme integers, missing request values, and overflow limit sizes). The test suites guarantee that the server physically prevents the thread loop from routing past the middleware/controller boundary unless the contract constraints match perfectly.
- **What this gate would catch that a regression test would miss:** A standard regression test only checks if a correct JSON entity body writes safely into the SQLite row database. It completely misses edge cases where a downstream query fails later on because a string like `NaN` passed deep inside an internal SQL engine `LIMIT` clause during a nested lookup execution. This gate catches malicious data formats at the very gateway of the application lifecycle.
- **Where to see the gate in the diff:** 
  (update commit hash when it is done)