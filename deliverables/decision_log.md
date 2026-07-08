# Decision Log — Ian Miztli Perez Aguirre

<!--
  ============================================================
  ESCRIBIR A MANO. SIN IA. (solo corrector ortográfico)
  Redactar con IA aquí = descalificación automática (ver SUBMISSION.md).
  Máx. 2 páginas. Específico > genérico. Confianza y desacuerdo cuentan.
  Borra estos comentarios <!-- --> antes de entregar.
  ============================================================
-->

## Authorship declaration

I USED AI Just for create this file in my local project and set the structure provided. The content wrote over here is 100%  mine



---

## Issues addressed

<!-- Llena TODOS los sub-campos de cada issue. Un campo vacío es peor señal que una respuesta torpe.
     Candidatos que ya detectamos (tú decides cuáles tomas y por qué):
       - IDOR en GET /api/orders/:id (getById sin merchant_id)
       - refunds contados como revenue positivo (sumAmountByMerchant / metrics)
       - metrics.ts abre 2a conexión y esquiva el DAL
       - filtro de fechas string/half-open + `from` solo ignorado
       - validación de input en POST /api/orders y limit sin tope
-->

- **Issue 1 — Weak file order**
  - What was wrong or weak:

  - Shape of my improvement:
    I always work API REST by using this layer structure:
     1. routers
     2. middlewares
     3. controllers
     4. services
     5. repositories
     6. models
     7. utils
  - **Confidence (1–10):**
  10
  - **What would falsify this fix:**
  Compilation problems caused by a domino effect
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

- **Issue 2 — Refunds computed as positive revenue**
  - What was wrong or weak: The `OrdersRepository` and data aggregation layers summed `total_amount` indiscriminately across all transactions. Because the database seeds refund amounts as positive integers, refunds were treated as sales, heavily inflating the total revenue, average order value, and top customer metrics.
  - Shape of my improvement: I refactored the data aggregation logic to evaluate the transaction `type`. The business layer now contextually processes the amounts: adding to the balance if the type is `'sale'` and subtracting if it is `'refund'`.
  - **Confidence (1–10):** 9
  - **What would falsify this fix:** If there are historical records in production where refunds were already manually flipped to negative numbers, which would cause my subtraction logic to double-invert the value into an accidental addition.
  - **I disagreed with Claude on:** *did not disagree* (The mathematical fix is deterministic, though I had to ensure Claude applied the subtraction rule uniformly across both the revenue service and the metrics breakdown).
  - Alternatives I considered and rejected: Inverting the amounts to negative numbers directly during the database seeding phase. Rejected because standard financial schemas store ledger entries as absolute values, leaving accounting sign-conventions to the business domain layer.

- **Issue 3 — Broken date-range filtering boundaries**
  - What was wrong or weak: The application compared `YYYY-MM-DD` date strings directly against full ISO-8601 strings stored in the database. Because it performed a simple string comparison and treated the `to` parameter as an exclusive half-open boundary, all transactions occurring on the `to` day itself were dropped (causing the dashboard's "30-day revenue" metric to miss today's actual numbers). Furthermore, providing a `from` filter without a `to` filter was silently ignored by the logic.
  - Shape of my improvement: I refactored the query boundary constraints to parse input strings into full-day timestamps. The `to` parameter is now programmatically extended to the end of its respective day (`23:59:59.999Z`) making it a clean inclusive boundary. Additionally, I modified the conditional logic to support partial range queries, allowing open-ended interval filtering when only `from` or `to` is supplied.
  - **Confidence (1–10):** 9
  - **What would falsify this fix:** If a frontend client sends a pre-formatted timestamp parameter that already includes timezone offsets or time segments, causing my end-of-day extension logic to accidentally push the target date into the next calendar day.
  - **I disagreed with Claude on:** *did not disagree* (Enforcing open-ended intervals and expanding the `to` string to a full-day time-boundary is the standard engineering pattern for absolute textual date stores).
  - Alternatives I considered and rejected: Forcing the frontend to always supply both dates with hours included. Rejected because it leaks database implementation details and validation logic overhead up to the UI layout clients.

- **Issue 4 — Missing runtime input validation and uncapped database limits**
  - What was weak: The application lacked validation controls on parameters crossing boundaries from the network down to database lookups. The `POST /api/orders` endpoint blindly accepted negative integer values, decimal floating-points, or massive values for `total_amount` while failing to check the transaction `type` value at runtime. Furthermore, global request query parameters like `limit` failed safely when parsing text strings (`Number('abc') === NaN`) and completely lacked a hard restriction ceiling, opening the system to a clean denial-of-service memory exploitation under large data scale.
  - Shape of my improvement: I integrated runtime schema checking inside the controllers layer. For the payload data, `total_amount` is structurally restricted to strict positive, non-zero integers with a realistic upper ceiling ($1,000,000,000$ cents) to eliminate data corruption vectors, and transaction types are enforced through strict value allowlists. For lookup limits, I enforced hard constraint boundaries (defaulting to 100 entries, with a physical maximum cap of 250 rows). Malformed or unparseable input structures now immediately break early with an expressive `400 Bad Request` response code.
  - **Confidence (1–10):** 10
  - **What would falsify this fix:** If a business use case requires a large enterprise client to legally process a multi-million dollar bulk settlement that exceeds our hard limit cap, which would result in our validation rule throwing an accidental block on legitimate business workflow actions.
  - **I disagreed with Claude on:** Claude initially suggested silently fallback-clampeing dynamic unparseable strings to a safe default limit. I rejected this pattern because hiding client anomalies leads to unpredictable debugging issues downstream; forcing a strict early fail via a `400 Bad Request` code keeps clear boundaries.
  - Alternatives I considered and rejected: Installing heavy external framework validation libraries like Zod or Joi. I rejected this choice to keep deployment binary dependencies at a minimum for this specific service budget, relying instead on clean, type-safe internal native assertions.

## Feature chosen

<!-- Tu plan actual: Feature C (order search) vía repositorio + services + dominio de objetos, sin SQL crudo. -->

- **Feature:** Feature C — Order search with filters

- **Why this one and not the others:** This feature allowed me to implement a robust Data Access Layer (DAL) repository pattern using Sequelize. other features are focused on infrastructure and I/O side-effects. Feature C, however, targets core query architecture, indexing, and input performance under scaling datasets, which perfectly leverages the newly introduced multi-layered domain architecture.
- **What I cut to ship it in budget:** I deferred complex query optimization benchmarks on SQLite to stay within the 24-hour time limit. Instead of spending hours performance-testing millions of simulated rows, I focused the engineering budget on rewriting the layer architecture, fixing the critical core logic issues, and polishing the frontend filter dashboard UI.
- **Confidence (1–10) that the shape I picked is the right one:** 8
- **What would change my mind:** If a performance profiling benchmark reveals that Sequelize’s runtime overhead on complex `Op.and`/`Op.between` abstraction significantly reduces throughput compared to highly optimized raw SQL queries under a production load of 1.5k RPS.


## Things I noticed but did NOT fix

<!-- Instancias que viste y decidiste no tocar. Nombra el motivo (scope / time / dependency / "needs a larger conversation"). -->

-

## Docs / code I left alone deliberately

-

## What I'd do with another 6 hours

-

## Where I felt uncertain

<!-- Mínimo TRES lugares donde no estuviste seguro. "No tuve dudas" es red flag. -->

-
-
-
