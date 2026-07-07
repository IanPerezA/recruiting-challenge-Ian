# Turn 01 — Response (Claude Code)

## Confirmación de entendimiento

- Rol de sesión: asistente. Creo los entregables con estructura comentada y campos en
  blanco; el usuario redacta a mano (sin IA) los 4 documentos humanos. Dejo el espacio
  de declaratoria de autoría en cada uno.
- Gate: bloqueo el avance de código hasta que el usuario escriba a mano una decisión
  importante en cada modalidad.
- Bitácora: subcarpeta `deliverables/prompt-log/`, dos archivos por turno. Este mensaje
  es el turno 01.
- Commits: (1) estructura de entregables + bitácora [lo creado ahora], (2) refactor
  arquitectónico [encolado, no ejecutado].

## Seam señalado

`SUBMISSION.md` pide los 5 `.md` en la RAÍZ del fork; el usuario pidió carpeta
`deliverables/`. Recomendación: trabajar en la carpeta y copiar a la raíz al final.

## DUDA resuelta (SQLite / Docker / ORM)

- SQLite es embebido, sin servidor, sin Docker. `better-sqlite3` es síncrono.
- Compatible con todos los ORM de Node (Prisma, Drizzle, Kysely, TypeORM, Sequelize,
  MikroORM). Hoy no hay ORM instalado.
- Recomendación: Drizzle (type-safe, delgado sobre better-sqlite3, mantiene semántica
  síncrona). Prisma/Kysely son async → ripple a toda la cadena.
- Conclusión: Feature C viable con repositorio + services + dominio de objetos. Caveat:
  la capa de mappers (row → entidad) es trabajo real; acotar alcance.

## Revisión de código — hallazgos (insumo, no corregidos)

1. IDOR en `GET /api/orders/:id`: `getById(id)` sin filtro `merchant_id`.
2. Refunds contados como revenue positivo (`sumAmountByMerchant`, métricas, avg).
3. `metrics.ts` abre 2a conexión, esquiva el DAL, se rompe en tests `:memory:`.
4. Filtro de fechas string/half-open; `from` sin `to` se ignora en silencio.
5. Validación floja en `POST /api/orders`; `limit` sin tope ni saneo (NaN).

## Creado en este turno (commit 1, pendiente de que el usuario lo commitee)

- `deliverables/decision_log.md`
- `deliverables/validation_design.md`
- `deliverables/signoff.md`
- `deliverables/written_answers.md`
- `deliverables/prompt_history.md`
- `deliverables/prompt-log/README.md`
- `deliverables/prompt-log/turn-01-prompt.md`
- `deliverables/prompt-log/turn-01-response.md`
