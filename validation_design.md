Validation design — Ian Miztli Perez Aguirre

Authorship declaration

I used AI only to create this file and set up the given structure. The content is 100% mine.

Class 1 — Multi-tenant authorization (IDOR)

- **Instances I fixed:** GET /api/orders/:id fetched orders by id only, so any merchant could read another merchant's orders by guessing the ID.
- **The gate I built:** The repository has no single-argument lookup anymore; the signature is now findById(id, merchantId), so tenant context is always required.
- **What this gate catches that a regression test misses:** The compiler becomes the gate — no code anywhere can fetch data without a merchantId, not just this one endpoint.
- **Where to see it:** src/repositories/orders-repository.ts (findById), commit 9cfbee8.

Class 2 — Refund counted as revenue

- **Instances I fixed:** sumAmountByMerchant ignored the transaction type, so refunds were added to revenue and avg_order_value.
- **The gate I built:** One signedAmount() function adds sales and subtracts refunds, and every money aggregation must use it.
- **What this gate catches that a regression test misses:** A new metric can't re-introduce "refunds as positive" without bypassing that one definition; the invariant revenue == Σsales − Σrefunds guards the math.
- **Where to see it:** src/repositories/order-amount.ts (signedAmount()), used by orders + metrics repos; test in test/orders.test.ts, commit e302aca.

Class 3 — Date boundary and partial ranges

- **Instances I fixed:** String date comparison dropped transactions on the to day, and a from without to was silently ignored (orders-repository.ts).
- **The gate I built:** A boundary test: a record at 23:59:59.999 on to is included, only from opens the upper bound, and 00:00:00.000 the next day is excluded.
- **What this gate catches that a regression test misses:** It checks the exact time edges where off-by-one and timezone bugs hide, not just a mid-month order.
- **Where to see it:** test/orders.test.ts (confirm hash — no standalone date commit; fix looks folded into 2a1b1a5).

Class 4 — Input validation and resource bounds

- **Instances I fixed:** Unbounded payloads in orders-controller.ts and missing limit checks in metrics-controller.ts.
- **The gate I built:** An HTTP contract test sends bad payloads (decimals, zero, symbols, huge integers, missing fields, oversized limit) and expects real 400s at the boundary.
- **What this gate catches that a regression test misses:** It stops bad values like NaN reaching an SQL LIMIT at the gateway, not just checking that a valid body saves.
- **Where to see it:** src/lib/validation.ts + src/lib/errors.ts (BadRequestError), test/http-contract.test.ts, commit 2a1b1a5.
