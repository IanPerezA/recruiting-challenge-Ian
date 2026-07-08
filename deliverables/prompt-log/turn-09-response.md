# Turn 09 — Response (Claude Code)

## Feature C implementado (commit propio) — GET /api/orders/search

Capas (clean architecture, como pidió el usuario):
- models/order.model.ts: índices compuestos tenant-first:
  (merchant_id,created_at), (merchant_id,total_amount), (merchant_id,status),
  (merchant_id,type). Documentada la limitación: LIKE '%x%' no usa b-tree (leading
  wildcard) → scan dentro del tenant; FTS/trigram sería el fix real a escala.
  NOTA: sync() solo crea índices en BD nueva; en prod sería una migración real.
- NUEVO models/order-search.ts: OrderSearchFilters, OrderSearchResult, allowlists
  ORDER_SORT_FIELDS / SORT_DIRECTIONS.
- lib/validation.ts: + parseAmountBound (0 permitido), parseOffset, parseEnum,
  parseDateOnly. Reutiliza parseLimit/MAX_LIMIT/MAX_AMOUNT_CENTS.
- NUEVO middlewares/validate-order-search.ts: valida query → req.orderSearch tipado;
  fail-fast 400 con códigos: invalid_sort, invalid_order, invalid_limit, invalid_offset,
  invalid_email_filter, invalid_status_filter, invalid_type, invalid_amount,
  invalid_amount_range, invalid_date, invalid_date_range. Default limit=50.
- repositories/orders-repository.ts: search() con findAndCountAll; email LIKE %x%
  (case-insensitive en SQLite ASCII); reutiliza whereCreatedAt (rango inclusivo);
  amount con Op.gte/lte sobre monto absoluto; sort por allowlist. total = matches totales.
- services/orders-service.ts: searchOrders() (seam de negocio).
- controllers/orders-controller.ts: search() → { data, pagination:{total,limit,offset} }.
- routes/orders.routes.ts: /search registrado ANTES de /:id (si no, lo captura como id).

## Tests
- NUEVO test/order-search.test.ts (8 tests): cada filtro, combinados, sort asc/desc,
  paginación con total estable, tenancy (m_other nunca aparece).
- test/http-contract.test.ts: +3 tests (envelope 200, 10 queries inválidas → 400, 401 sin auth).
- Fix menor: app.listen(0, () => resolve()) — el IDE marcaba mismatch de tipos con resolve directo.

## Docs
- docs/api.md: spec completa del endpoint (tabla de params + envelope).

## Entregable de diseño
- deliverables/claude-design/filter-modal-prompt.md: prompt listo para Claude Design
  (modal de filtros + 5 estados de resultados: tabla/chips/paginación, loading skeleton,
  empty, error con retry y 400 por campo, responsive), alineado 1:1 con el contrato real.

## Verificación
- tsc: OK
- npm test: 22/22 (11 previos + 8 search + 3 contrato)
- Smoke en vivo (BD aislada PORT 3084): sin params total=40; email=ana→14; type=refund→8;
  amount 5000..9000 asc → orden ascendente; limit=3&offset=3 con total=40 estable;
  m_bistro solo ve sus filas; 5 vectores inválidos → 400 con código correcto;
  /orders/9999-not-an-order → 404 (no rompe /:id); 4 índices creados en la BD nueva.
- Limpieza de procesos huérfanos y BDs temporales.
