# Turn 04 — Response (Claude Code)

## Revisión de docs (gate)

- validation_design Class 1 (IDOR): escrita, con gate real = firma de repositorio que
  exige merchantId + compilador como candado. ✅
- decision_log Feature chosen: Feature C escrito, menciona Sequelize. ✅ (gate del feature)

## Desacuerdos señalados al usuario

1. El doc describía `findById(id, merchantId)` y "removed single-arg lookup", pero el
   código aún tenía `getById(id)`. Alineé el código al doc.
2. Sequelize (elección del usuario para Feature C) es async → rompe la cadena síncrona;
   y su tipado débil debilita el gate "compilador" de la Clase 1. Usuario decide mantener
   Sequelize para Feature C y adaptar asincronía ahí. Anotado.

## Fix IDOR aplicado (bug-fix commit)

- repositories/orders-repository.ts: `getById(id)` → `findById(id, merchantId)` con
  `WHERE id = ? AND merchant_id = ?`; `create` usa `findById`.
- services/orders-service.ts: `getOrder(id, merchantId)`.
- controllers/orders-controller.ts: pasa `req.merchantId!`.
- test/orders.test.ts: firma actualizada + test de regresión cross-tenant.
- docs/api.md: documentado scoping por merchant (404 si es de otro merchant).

## Verificación

- `npx tsc --noEmit`: OK
- `npm test`: 3/3 pass (incluye "findById is tenant-scoped (IDOR)").
- Smoke test vivo (PORT=3078): crear orden como m_acme → dueño la lee 200, m_bistro con el
  mismo id → 404 not_found. IDOR cerrado.

## Nota

El fix cambia comportamiento a propósito (es la corrección de seguridad): un id ajeno ahora
da 404 en vez de filtrar la orden.
