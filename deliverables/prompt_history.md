Prompt history — Ian Miztli Perez Aguirre

Note on format: I keep the raw transcript as one file per turn in ./prompt-log/ (each turn = turn-NN-prompt.md + turn-NN-response.md), instead of pasting it all here. SUBMISSION.md asks for a single .md, so this is a deliberate deviation. The index below keeps it traceable.

Tool(s) used

- [x] Claude Code
- [ ] Claude.ai
- [ ] Cursor
- [ ] Copilot
- [ ] ChatGPT
- [ ] Aider
- [ ] Other:

How much of the work was AI-assisted

- [x] Most of it
- [ ] About half
- [ ] Less than half — used it for specific tasks
- [ ] None at all

Sessions

The raw transcript lives in ./prompt-log/, one turn per pair of files, in order. It is not pasted here on purpose (see the note above). Index:

| Turno | Prompt | Respuesta | Tema |
|---|---|---|---|
| 01 | prompt | respuesta | Contexto + reglas de la bitácora + DUDA SQLite/ORM + primera revisión de código |
| 02 | prompt | respuesta | Confirmar carpeta deliverables/ + primer commit |
| 03 | prompt | respuesta | Refactor a capas route/controller/service/repository |
| 04 | prompt | respuesta | Fix IDOR (findById(id, merchantId)) |
| 05 | prompt | respuesta | Plan de 4 tareas + migración a Sequelize |
| 06 | prompt | respuesta | Fix refunds (revenue neto) |
| 07 | prompt | respuesta | Fix rango de fechas (inclusivo + parcial) |
| 08 | prompt | respuesta | Validación de input + contrato HTTP |
| 09 | prompt | respuesta | Feature C — búsqueda de pedidos |
| 10 | prompt | respuesta | Rediseño UI desde Claude Design |
| 11 | prompt | respuesta | Lista de pendientes de redacción |

What Claude (or your AI tool) got wrong

Example 1
- **The prompt:** I asked to add input validation to POST /api/orders and to the limit params.
- **What Claude returned:** It offered to silently clamp an out-of-range or unparseable limit to a safe default instead of rejecting it.
- **What was wrong with it (technically):** Silent clamping hides a broken client. A request for limit=999 or limit=abc would quietly return a different result set than asked for, which is hard to debug later.
- **How I caught it:** I had decided the rules up front (positive-int amount, limit 1..250) and told it to fail fast, not guess.
- **What I did instead (y dónde verlo en el diff):** parseLimit throws BadRequestError('invalid_limit') → 400. See src/lib/validation.ts, commit 2a1b1a5.

Example 2
- **The prompt:** I asked for an HTTP contract test that drives the real app for the validation feature.
- **What Claude returned:** A test file using top-level before/after hooks from node:test around top-level test() calls.
- **What was wrong with it:** Those top-level hooks did not run before the tests, so base/server were undefined and every test threw "Failed to parse URL from undefined/…".
- **How I caught it:** The test run failed. npm test showed the URL-parse errors.
- **What I did instead:** I rewrote the file and wrapped everything in a describe() block (where the hooks run) plus server.closeAllConnections(). See test/http-contract.test.ts.

Example 3
- **The prompt:** Same HTTP contract test work.
- **What Claude returned:** server = app.listen(0, resolve) — it passed the promise resolve directly as the listen callback.
- **What was wrong with it:** Type mismatch. The listen callback signature is not (error?) => void, so it did not type-check with resolve.
- **How I caught it:** The IDE/tsc flagged it right away.
- **What I did instead:** I wrapped it as app.listen(0, () => resolve()).
