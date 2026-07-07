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

<!-- Escribe UNA:
     - "I wrote this validation design entirely without AI assistance. The only tool I used was spell-check."
     - "I used AI on this validation design for the following limited purposes: <lista>. Everything else is mine."
     ESCRIBE TU LÍNEA AQUÍ ↓ -->



---

<!-- Para cada CLASE de bug (agrupa por clase, no por instancia).
     Formas de gate, de menor a mayor robustez:
       regression test < property/fuzz test < golden/contract test < CI/lint rule < type constraint < architecture/import rule < eval suite
     "Added a regression test" es el piso, no la respuesta. -->

### Class 1 — <nombra la clase, p.ej. "Multi-tenant authorization (IDOR)">

- **Instances I fixed:**
- **The gate I built (or would build):**
- **What this gate would catch that a regression test would miss:**
- **Where to see the gate in the diff (file / commit / lines):**
- **If I did not build it, the reason (scope / time / dependency / "needs a wider conversation"):**

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
