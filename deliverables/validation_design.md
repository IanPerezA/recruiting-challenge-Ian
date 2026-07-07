# Validation design — <TU NOMBRE>

<!--
  ============================================================
  ESCRIBIR A MANO. SIN IA. (solo corrector ortográfico)
  Este artefacto mide TU criterio sobre cómo hacer seguro el código asistido por IA.
  ~300 palabras. Gates concretos y nombrados, no filosofía.
  1–3 gates REALES diseñados a propósito, no 10 genéricos.
  Borra estos comentarios antes de entregar.
  ============================================================
-->

## Authorship declaration

I USED AI Just for create this file in my local project and set the structure provided. The content wrote over here is 100%  mine



---

<!-- Para cada CLASE de bug (agrupa por clase, no por instancia).
     Formas de gate, de menor a mayor robustez:
       regression test < property/fuzz test < golden/contract test < CI/lint rule < type constraint < architecture/import rule < eval suite
     "Added a regression test" es el piso, no la respuesta. -->

### Class 1 — Multi-tenant authorization (IDOR)

- **Instances I fixed:**
    I identified a critical multi-tenant data leak in the `GET /api/orders/:id` endpoint. The original implementation fetched orders from the database using only the primary key (`id`), allowing any authenticated merchant to read any other merchant's orders by guessing the ID.

- **The gate I built (or would build):**
    After the architecture layer refactor, the `OrdersRepository` strictly enforces tenant isolation. I removed any single-argument lookup method from the data layer. The signature of the function now strictly requires the tenant context parameter: `findById(id: string, merchantId: string)`.

- **What this gate would catch that a regression test would miss:**
    A regression test only ensures that this specific endpoint is protected. It fails to prevent a teammate from creating a new endpoint tomorrow (like a cancel or delete order feature) and forgetting to check the tenant. By changing the repository signature, the TypeScript compiler acts as the gate; it becomes impossible to fetch data anywhere in the application without explicitly providing the `merchantId`.

- **Where to see the gate in the diff (file / commit / lines):**
    `src/repositories/orders-repository.ts` — inside the `findById` method. (Will append commit hash once merged).

- **If I did not build it, the reason (scope / time / dependency / "needs a wider conversation"):**
    N/A (Built and enforced during the data layer re-architecture).
### Class 2 — <nombra la clase>

- **Instances I fixed:**
- **The gate I built (or would build):**
- **What this gate would catch that a regression test would miss:**
- **Where to see the gate in the diff:**
- **If I did not build it, the reason:**

### Class 3 — <nombra la clase>

- **Instances I fixed:**
- **The gate I built (or would build):**
- **What this gate would catch that a regression test would miss:**
- **Where to see the gate in the diff:**
- **If I did not build it, the reason:**
