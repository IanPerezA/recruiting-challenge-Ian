# Prompt log (bitácora de prompts)

Método de trabajo por turnos. Cada turno de la sesión con Claude Code se guarda como
**dos archivos**:

- `turn-NN-prompt.md`   → mi prompt, verbatim (lo que YO escribí).
- `turn-NN-response.md` → la salida de Claude en ese turno.

Donde `NN` es el número de turno con cero a la izquierda (`01`, `02`, ...).

## Por qué una carpeta y no un solo archivo

`SUBMISSION.md` pide un único `prompt_history.md` raw. Esta carpeta es mi método de
trabajo; al final del reto **se ensambla** concatenando los turnos en orden dentro de
`../prompt_history.md`. Así conservo el orden por turnos sin incumplir el requisito.

## Reglas

- **Raw. Sin curar.** No borrar falsos comienzos ni prompts malos: son señal.
- No editar respuestas viejas; si algo cambió, es un turno nuevo.
- La sección obligatoria "What Claude got wrong" vive en `../prompt_history.md` y la
  redacto yo (con mi juicio, no copia del transcript).
