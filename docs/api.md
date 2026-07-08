# API reference

> Quick-and-dirty. Not complete.

All endpoints require the `X-Merchant-Id` header.

## `GET /api/health`
No auth. Returns `{ ok: true }`.

## `GET /api/orders`
List orders for the authenticated merchant. Optional query: `from`, `to`, `limit`.
`from`/`to` are `YYYY-MM-DD` and define an **inclusive** day range (`to` covers the whole
day). Either bound may be omitted for an open-ended range.

## `GET /api/orders/search`
Filtered, paginated order search for the authenticated merchant. All params optional;
invalid input fails fast with `400` + an `error` code.

| Param | Rule | Behavior |
|---|---|---|
| `customer_email` | non-empty string | partial, case-insensitive match (contains) |
| `status` | non-empty string | exact match |
| `type` | `sale` \| `refund` | exact match; else `400 invalid_type` |
| `min_amount` / `max_amount` | integer cents `0..1_000_000_000` | inclusive bounds on the stored amount; `min > max` → `400 invalid_amount_range` |
| `from` / `to` | `YYYY-MM-DD` | inclusive day range (`to` covers the whole day); `from > to` → `400 invalid_date_range` |
| `sort_by` | `created_at` (default) \| `total_amount` | else `400 invalid_sort` |
| `order` | `desc` (default) \| `asc` | else `400 invalid_order` |
| `limit` | integer `1..250`, default `50` | else `400 invalid_limit` |
| `offset` | integer `>= 0`, default `0` | else `400 invalid_offset` |

Response:

```json
{ "data": [ /* orders */ ], "pagination": { "total": 123, "limit": 50, "offset": 0 } }
```

`pagination.total` counts **all** matching rows (ignoring `limit`/`offset`) so clients can
build page controls.

## `GET /api/orders/:id`
Get a single order by ID, **scoped to the authenticated merchant**. Returns `404 not_found`
if the order does not exist *or* belongs to another merchant (no cross-tenant reads).

## `POST /api/orders`
Body: `{ customer_email, total_amount, type? }`.
- `total_amount`: integer **cents**, `1 .. 1_000_000_000`. A refund is `type: "refund"`,
  not a negative amount.
- `type`: `"sale"` (default) or `"refund"`.
Invalid input fails fast with `400` and an `error` code (`invalid_body`, `invalid_amount`,
`invalid_type`). The `limit` query param (here and on metrics) must be an integer `1..250`,
else `400 invalid_limit`.

## `GET /api/revenue?from=...&to=...`
**Net** revenue for the merchant in the date range: sales add, refunds subtract
(`Σ sales − Σ refunds`). Same sign rule applies to `avg_order_value` and top-customer
`total_spent` in the metrics endpoints.

## `GET /api/metrics/summary`
TODO: document fields.

## `GET /api/metrics/top-customers`
TODO: document fields.
