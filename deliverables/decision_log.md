# Decision Log — Ian Miztli Perez Aguirre

<!--
  ============================================================
  ESCRIBIR A MANO. SIN IA. (solo corrector ortográfico)
  Redactar con IA aquí = descalificación automática (ver SUBMISSION.md).
  Máx. 2 páginas. Específico > genérico. Confianza y desacuerdo cuentan.
  Borra estos comentarios <!-- --> antes de entregar.
  ============================================================
-->

## Authorship declaration

I USED AI Just for create this file in my local project and set the structure provided. The content wrote over here is 100%  mine



---

## Issues addressed

<!-- Llena TODOS los sub-campos de cada issue. Un campo vacío es peor señal que una respuesta torpe.
     Candidatos que ya detectamos (tú decides cuáles tomas y por qué):
       - IDOR en GET /api/orders/:id (getById sin merchant_id)
       - refunds contados como revenue positivo (sumAmountByMerchant / metrics)
       - metrics.ts abre 2a conexión y esquiva el DAL
       - filtro de fechas string/half-open + `from` solo ignorado
       - validación de input en POST /api/orders y limit sin tope
-->

- **Issue 1 — Weak file order**
  - What was wrong or weak:

  - Shape of my improvement:
    I always work API REST by using this layer structure:
     1. routers
     2. middlewares
     3. controllers
     4. services
     5. repositories
     6. models
     7. utils
  - **Confidence (1–10):**
  10
  - **What would falsify this fix:**
  Compilation problems caused by a domino effect
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

- **Issue 2 — <título corto>**
  - What was wrong or weak:
  - Shape of my improvement:
  - **Confidence (1–10):**
  - **What would falsify this fix:**
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

- **Issue 3 — <título corto>**
  - What was wrong or weak:
  - Shape of my improvement:
  - **Confidence (1–10):**
  - **What would falsify this fix:**
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

## Feature chosen

<!-- Tu plan actual: Feature C (order search) vía repositorio + services + dominio de objetos, sin SQL crudo. -->

- **Feature:**
- **Why this one and not the others:**
- **What I cut to ship it in budget:**
- **Confidence (1–10) that the shape I picked is the right one:**
- **What would change my mind:**

## Things I noticed but did NOT fix

<!-- Instancias que viste y decidiste no tocar. Nombra el motivo (scope / time / dependency / "needs a larger conversation"). -->

-

## Docs / code I left alone deliberately

-

## What I'd do with another 6 hours

-

## Where I felt uncertain

<!-- Mínimo TRES lugares donde no estuviste seguro. "No tuve dudas" es red flag. -->

-
-
-
