# Turn 01 — Prompt

Contexto: archivo abierto en el IDE `public/app.js`. Fecha 2026-07-07.

---

Lee los archivos MD del proyecto para contextualizarnos sobre el mismo
te darás cuenta que nos solicitan una bitacora de prompts la cual empezaremos desde este momento
Nos solicitan un solo archivo .md para esto, sin embargo creo que será mejor hacer una carpeta en la que guardemos los turnos
con un .md de mi prompt y un .md de tu salida

A nivel sesion: Una vez que leas los MD de instrucciones, entenderas mejor esta regla
Actuaras como asistente durante esta sesion de trabajo
vas a crear los archivos de los entregables en los cuales yo debo redactar a mano
pero debes dejarme comentada la estructura o nomenclatura a seguir
tu labor como asistente sera bloquear mis indicaciones hasta que yo no haya escrito alguna toma de desicion importante en todas las modalidades que nos solicitan

deja el espacio para la declaratoria de autoría.
confirmame cuando esten creadas, las carpetas
carpeta principal del entregables (en ingles)
resto de archivos.md que requieren redaccion
para la bitacora de prompts , sera una subcarpeta dentro de la de entregables

ya que ese sera el primer commit que escribiré

A nivel codigo:
Primer paso, revisa el codigo y detecta posibles errores asociados al mismo
Mi primera desicion arquitectonica, es refactorizar el codigo, sobre todo, reorganizar el orden
vamos a seguir buenas practicas rest, y vamos a tener routers (ya existe), controllers, middlewares, services, y models

Este será mi segundo commit asi que estos cambios dejalos encolados

DUDA: tiene un rato que no trabajo con sqlite, no recuerdo como corre, si tengo que usar docker, pero lo que mas me interesa saber es si es compatible con algun ORM del stack del proyecto
SI es asi, elegiré el feature c, pero quitando la ejecucion de SQL y poniendo un repositorio de funciones de acceso a datos consumido desde services, quitando la necesidad de sql y migrando todo a un dominio de objetos

es claro todo lo que solicito?
