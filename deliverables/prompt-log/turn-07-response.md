# Turn 07 — Response (Claude Code)

## Decisiones del usuario
1. Estándar → `to` inclusivo (todo el día).
2. `from` o `to` solos → filtro parcial (rango abierto).

## Verificación de entregables
- decision_log Issue 3 "Broken date-range filtering boundaries": sólido (confianza 9,
  falsación: cliente manda `to` con hora → mi extensión empuja al día siguiente).
- validation_design Class 3: completo, test de frontera con 3 invariantes. OK.

## Fix aplicado (commit propio)
- NUEVO src/repositories/date-range.ts: `whereCreatedAt(from?, to?)`. Semántica del rango
  en UN solo lugar. `to` → `<date>T23:59:59.999Z` (inclusivo). Usa solo la parte de fecha
  (robusto a hora/offset colado). Cota inferior = fecha desnuda (ordena antes de cualquier
  timestamp del día en AMBOS formatos: ISO con T y CURRENT_TIMESTAMP con espacio).
- orders-repository.listByMerchant: usa el helper (soporta parcial); quitada la rama
  `from && to`. sumAmountByMerchant (revenue): usa el helper → arregla la exclusión del día `to`.
- test/orders.test.ts: test de frontera (incluye 03-31T23:59:59.999, excluye 04-01T00:00,
  lone-from y lone-to parciales).
- docs/api.md: documentado rango inclusivo + parcial.

## Verificación
- tsc: OK
- npm test: 5/5 (incluye frontera)
- Smoke HTTP en vivo (BD aislada, escenario del dashboard): con `to=hoy`, una venta creada
  hoy (+12345) ahora SÍ cuenta (delta +12345; antes se caía). Lone-from (from=hoy) lista la
  orden nueva. Limpieza de huérfanos (excluido el `tsx watch` del usuario).
