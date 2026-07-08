# Turn 09 — Prompt

para el feature de filtrado necesito que seamos meticulosos
Aspectos a diseñar, considerar y analizar

Los params a nivel api
estoy considerando
1. customer-email
2.status
3.type
4.rango min y max del amount
5. rango de fechas from y to
6. page y limit como lo indica el standard ( limit + offset)

Tambien quiero que cuidemos la clean architecture respetando la capa de repositorio y la
del modelo, la capa del servicio y por ultimo la del controllador (con su middleware de
validacion de filtrado)

quiero que apliquemos tambien indices

como ultimo entregable del plan debes darme un prompt para claude design
con el fin de agrergar al pproyecto de diseño el modal para definir los criterios de
filtrado y lo referente a UX de manejo de resultados (errores, vacios, etc)

--- (plan mode; preguntas de diseño respondidas por el usuario:) ---
- Endpoint: dedicado GET /api/orders/search (envelope paginado propio)
- Email match: parcial case-insensitive (LIKE contains)
- Rango de monto: sobre el monto absoluto almacenado
- Sort: configurable con allowlist {created_at, total_amount} + {asc, desc}

--- (tras presentar el plan:) ---
adelante a ejecutar el plan con los detalles del feature de filtrado
