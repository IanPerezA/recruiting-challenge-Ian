# Turn 08 — Response (Claude Code)

## Decisiones del usuario (reglas estrictas)
- total_amount: entero > 0 (decision_log añade tope 1,000,000,000 centavos → lo implementé).
- limit inválido → 400 (sin clamp). Tope máximo 250.
- type fuera de {sale,refund} → 400.

## Verificación de entregables
- decision_log Issue 4: confianza 10, con desacuerdo real (Claude sugirió clampear; el
  usuario lo rechazó por fail-fast 400). Alineé el código.
- validation_design Class 4: el gate descrito es una "API contract testing layer contra
  endpoints HTTP con fuzz vectors". Para materializarlo, extraje createApp() y añadí un
  test de contrato HTTP real (in-process).

## Fix aplicado (commit propio)
- NUEVO src/lib/errors.ts: BadRequestError (status 400 + code) → un solo camino a 400.
- NUEVO src/lib/validation.ts: parseAmount (entero 1..1e9), parseOrderType (allowlist),
  parseLimit (entero 1..250, sin clamp). MAX_AMOUNT_CENTS, MAX_LIMIT.
- middlewares/error-handler.ts: mapea BadRequestError → 400 code; body JSON malformado
  (status 400 de express.json) → 400 invalid_json (antes 500).
- controllers/orders-controller.ts: create usa parseAmount/parseOrderType; list usa parseLimit(100).
- controllers/metrics-controller.ts: topCustomers usa parseLimit(5).
- NUEVO src/app.ts: createApp() (app testeable sin listen). server.ts adelgazado.
- NUEVO test/validation.test.ts: unit con vectores de fuzz.
- NUEVO test/http-contract.test.ts: dispara payloads malos contra el app real (in-process).
- docs/api.md: reglas de validación documentadas.

## Incidente resuelto en tests
El test de contrato falló primero: hooks `before/after` top-level de node:test no corren
fiablemente antes de los `test()` top-level. Solución: envolver en `describe()` (+
server.closeAllConnections() para evitar cuelgue por keep-alive de undici).

## Verificación
- tsc: OK
- npm test: 11/11 (5 lógica/repo + 3 validadores unit + 3 contrato HTTP)
- Smoke curl en vivo: neg/zero/float amount → 400 invalid_amount; type 'gift' → 400
  invalid_type; limit=abc/251 → 400 invalid_limit; body malformado → 400 invalid_json;
  orden válida → 201.

## Nota de criterio (para decision_log si quieres)
- Default de limit: orders=100, top-customers=5 (preservé el 5 histórico); ambos cap 250.
