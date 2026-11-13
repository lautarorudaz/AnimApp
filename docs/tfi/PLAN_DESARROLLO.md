# AnimApp — plan de desarrollo

Vigente: 13/11/2026. Complemento operativo de [CONTEXTO_ANIMAPP.md](CONTEXTO_ANIMAPP.md), que contiene todos los contratos FB-001. **30 tareas activas, FB-004 a FB-033**, sin renumerar ni declarar completadas por esta consolidación. FB-001 es el contrato obligatorio; FB-002/003 no son tareas ni dependencias del flujo elegido. No incorporar cambios locales ajenos.

## Uso y dependencias

Cada ficha fija responsable, prioridad, trabajo, aceptación, pruebas y módulos destino (confirmar rutas en HEAD). Las dependencias son módulos compatibles que deben estar implementados e integrados antes de completar el consumidor; **no se presupone que existan**. Se puede preparar código puro con dobles, sin declarar la integración terminada. Comprobar código, commits y `progreso/FB-XXX.md`; la numeración no determina el orden.

Sin autorización remota, ejecutar solo pruebas sin red/datos sintéticos y controles estáticos seguros. Las pruebas de cada ficha siguen siendo obligatorias para declarar VERIFICADA: mocks no acreditan Rules, transacciones distribuidas, Auth remoto, IA ni latencia. No ejecutar escrituras de prueba en `animappv1` para cerrar una ficha.

**Dependencia externa común:** antes de integración real (en particular FB-009/017/028/029), acordar y habilitar un entorno/protocolo autorizado según el contexto. Si requiere despliegue de prueba, Lautaro lo prepara con autorización específica; esto no exige declarar FB-033 completada ni habilita un despliegue final anticipado. FB-033 culmina con release/smoke/rollback después de E2E y CI. Esta distinción evita depender de un despliegue final ya verificado para realizar las pruebas que justamente lo habilitan. Proveedor IA, región, costos y autorización también condicionan FB-024/028/033.

## Propiedad y coordinación

| Responsable | Tareas | Superficies principales |
|---|---|---|
| Lautaro | FB-004…010, FB-031, FB-033 (9) | Rules/índices/configuración/dependencias, dominio State, `functions/src/routines/**`, `functions/src/security/**`, exports compartidos y CI/release |
| Ulises | FB-011…019, FB-032 (10) | Admin/Recepción, AuthContext/ProtectedRoute/Login, cuentas/alumnos/institucional, `functions/src/accounts/**`, guías/academia |
| Juan Pablo | FB-020…030 (11) | App/rutas, alumno/editor profesor, biblioteca y consumidores UI, landing/chat, adaptadores/rutinas/chat, `functions/src/chat/**`, CSS global y E2E |

Un dueño integra cada archivo compartido: Lautaro `src/firebase/config.js`, `package.json`/lock, Rules y exports Functions; Juan Pablo App/rutas/CSS; Ulises sesión/perfil. Juan Pablo define adaptadores comunes en FB-020; Ulises implementa los servicios de cuentas/alumnos/institucional; coordinar `sessionService` con Ulises. No reescribir el módulo de otro para hacer pasar una prueba. Cambios de contratos se acuerdan y registran en el contexto antes de integrar; pruebas de cada módulo pertenecen a su dueño.

## Backlog

### FB-004 — Rules de lecturas y CRUD permitido

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RNF-01; RF-01–13/16. **Depende de:** Contrato FB-001; sin dependencia de código previa.

- **Trabajo:** Corregir inactivos, UID/roles/sedes/allowlists; proteger referencias/getAfter; denegar escritura SDK de rutinas/punteros/privilegios; conservar biblioteca e institucional autorizado.
- **Aceptación:** Positivos pasan y bypass por UID/campos no; consultas compatibles; público sin datos privados.
- **Prueba:** Matriz SDK get/list/create/update/delete e índices, campos/IDs forjados.
- **Módulos:** firestore.rules, firestore.indexes.json, tests/rules propuestos.

### FB-005 — Base callable y Proxy confiable

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RNF-01; cuentas/rutinas/IA. **Depende de:** Contrato FB-001; sin dependencia de código previa.

- **Trabajo:** Exports acotados, identidad callable y proxy que revalida perfil/relación en transacción; separar App Check de permiso; restringir acceso al repositorio.
- **Aceptación:** Privadas rechazan actor ausente/inactivo/ajeno; repositorio no recibe llamada después de denegación.
- **Prueba:** Unitarias e integración de identidad, revocación y delegación.
- **Módulos:** functions/src/index/config/security propuestos.

### FB-006 — Modelo de rutina y estados

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RF-10–13; State. **Depende de:** Contrato FB-001; sin dependencia de código previa.

- **Trabajo:** ID por rutina, puntero, versión, autor/titular, contenido semanas/días/etapas; Active/HistoricalState con edit/archive; validación de límites y snapshots.
- **Aceptación:** Histórica rechaza mutaciones; estado no es solo booleano; esquema inválido rechazado.
- **Prueba:** Unitarias de transiciones y límites/estructura legacy.
- **Módulos:** functions/src/routines/domain y tests propuestos.

### FB-007 — Asignación callable transaccional

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RF-10/11/13; RNF-01. **Depende de:** FB-005, FB-006, FB-004.

- **Trabajo:** Leer actor/ficha/perfiles/puntero/operación; comparar versión/asignación; archivar, crear nueva y actualizar puntero/idempotencia atómicamente.
- **Aceptación:** Una activa, histórico conservado, reintento mismo resultado; conflictos no sobrescriben intención ajena.
- **Prueba:** Primera/segunda asignación, doble envío, clave con payload distinto y concurrencia.
- **Módulos:** functions/src/routines/assign y tests propuestos.

### FB-008 — Edición activa y contrato de consultas

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RF-11–13; RNF-01. **Depende de:** FB-007.

- **Trabajo:** Editar solo activa apuntada con versión esperada; autor separado de permiso actual; definir queries SDK de activa/historial e índices.
- **Aceptación:** Profesor reasignado opera y anterior no; histórico/IDs inmutables; no callable innecesaria de lectura.
- **Prueba:** Conflictos, histórica, titular ajeno y consultas propias/listas.
- **Módulos:** functions/src/routines/edit, tests y contrato queries propuestos.

### FB-009 — Seguridad y concurrencia integradas

**Responsable:** Lautaro. **Prioridad:** Crítica. **Alcance:** RNF-01; RF-01–13. **Depende de:** FB-004, FB-007, FB-008, FB-013, FB-015.

- **Trabajo:** Probar por SDK/callables aislamiento por rol/sede/titularidad, cuentas inactivas, referencias inmutables, altas parciales, dos editores, revocación/reasignación durante operación y escrituras maliciosas.
- **Aceptación:** Todos los negativos denegados, positivos válidos; sin dos activas, pérdida histórica ni autorización obsoleta.
- **Prueba:** Integración autorizada con concurrencia controlada y comparación de documentos; dobles solo para preparar casos sin red.
- **Módulos:** tests/security y tests/routines/concurrency propuestos.

### FB-010 — Compatibilidad y reparación explícita

**Responsable:** Lautaro. **Prioridad:** Alta. **Alcance:** Compatibilidad; RF-01–13. **Depende de:** FB-006, FB-011, FB-013.

- **Trabajo:** Dry-run de aliases/huérfanos/rutina actual; adaptación idempotente en datos sintéticos; respaldo/revisión para futura ejecución autorizada; no inventar históricos.
- **Aceptación:** No escribe por defecto; repetir no duplica ni reemplaza historia; reporta irrecuperable.
- **Prueba:** Fixtures sintéticos legacy, duplicados/faltantes y rechazo de ejecución de escritura sin autorización; dry-run por defecto.
- **Módulos:** scripts locales de diagnóstico/migración y tests/legacy propuestos.

### FB-011 — Retirar backfills destructivos

**Responsable:** Ulises. **Prioridad:** Crítica. **Alcance:** RF-02/04; integridad. **Depende de:** Contrato FB-001; sin dependencia de código previa.

- **Trabajo:** Quitar escrituras automáticas de listeners y mostrar inconsistencia sin repararla al visitar; conservar lecturas/formularios.
- **Aceptación:** Abrir/recargar/cambiar sede no escribe; dos pestañas/listeners demorados no reemplazan fichas.
- **Prueba:** Datos sintéticos y conteo cero de writes al navegar/recargar; dobles sin red, integración real solo autorizada.
- **Módulos:** AdminDashboard.jsx, RecepcionDashboard.jsx y tests/users/backfill propuestos.

### FB-012 — Callable de aprovisionamiento

**Responsable:** Ulises. **Prioridad:** Crítica. **Alcance:** RF-01/03; RNF-01. **Depende de:** FB-005.

- **Trabajo:** Saga: reserva idempotente, Auth inicialmente deshabilitado, revalidación y perfil/ficha, habilitación; recuperación y bootstrap separado; nunca contraseñas en logs.
- **Aceptación:** Recepción solo alumno de sede; admin roles autorizados; sesión operador intacta; ningún huérfano habilitado sin perfil ni borrado de cuenta ajena por email.
- **Prueba:** Fallo inducido en cada paso, duplicado/reintento y revocación durante alta.
- **Módulos:** functions/src/accounts/provision y tests propuestos.

### FB-013 — Estado y cambios privilegiados de cuenta

**Responsable:** Ulises. **Prioridad:** Crítica. **Alcance:** RF-02/06/07; RNF-01. **Depende de:** FB-012, FB-006.

- **Trabajo:** Acciones explícitas rol/sede/estado; bloquear datos antes de sincronizar Auth; preservar historia y coherencia de relaciones; política último admin.
- **Aceptación:** Desactivar deniega nuevas operaciones, reactivar coherente; traslado/cambio rol no borra historia; fallo Auth queda recuperable.
- **Prueba:** Token vigente inactivo, traslado con rutina, carrera y fallo updateUser.
- **Módulos:** functions/src/accounts/manage y tests propuestos.

### FB-014 — Paneles y edición Firebase consistente

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** RF-01–07; RNF-02. **Depende de:** FB-011, FB-012, FB-013, FB-004, FB-020.

- **Trabajo:** Sustituir altas/acciones privilegiadas por callables; conservar listeners/CRUD simple; batch/tx para copias coherentes y Rules; mejorar errores sin rediseño.
- **Aceptación:** Alta/edición/estado operativos, nombres/teléfonos consistentes y email Auth no divergente; ninguna escritura al abrir.
- **Prueba:** UI+SDK/callable por roles, errores/red y vacíos.
- **Módulos:** AD/RD, src/services/accounts/students propuestos.

### FB-015 — Asignación Web transaccional

**Responsable:** Ulises. **Prioridad:** Crítica. **Alcance:** RF-08/09; RNF-01. **Depende de:** FB-014, FB-006, FB-004.

- **Trabajo:** Leer actor/alumno/profesor, versión esperada y misma sede/actividad; cambiar solo relación/version; Rules comprueba referencias y estado final.
- **Aceptación:** No autoasignación alumno; profesor inválido/ajeno/inactivo rechazado; P1 pierde y P2 obtiene acceso sin cambiar historia.
- **Prueba:** SDK malicioso y carrera con assign/edit; positivos y negativos Rules.
- **Módulos:** src/services/students/assignment, RD y tests propuestos.

### FB-016 — Fuente institucional y panel admin

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** RF-15/16; RNF-02. **Depende de:** FB-004, FB-020.

- **Trabajo:** Documento público separado con cinco categorías/dos sedes; escritura admin validada/versionada; datos confirmados y metadatos no sensibles.
- **Aceptación:** Actualizar y recargar conserva; siguiente consulta usa versión nueva sin build; otros no escriben; sin datos inventados.
- **Prueba:** Rules/UI de campos inválidos, conflicto y cinco categorías.
- **Módulos:** AdminInstitutional.jsx, src/services/institutional, DTO propuestos.

### FB-017 — Regresión cuentas y recepción

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** RF-01–09; RNF-01. **Depende de:** FB-014, FB-015, FB-018.

- **Trabajo:** Probar altas, coherencia, reactivación, roles/sedes/asignación y recuperación; solo fixtures demo.
- **Aceptación:** Evidencia funcional RF-01–08 y fallos recuperables; sin reparación al navegar.
- **Prueba:** UI e integración autorizada por roles y negativos pertinentes; preparación local con dobles.
- **Módulos:** tests/accounts/students propuestos.

### FB-018 — Sesión y perfil activo

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** RF-05–07; RNF-01/02. **Depende de:** FB-004, FB-020.

- **Trabajo:** Conservar Auth SDK; observar perfil autorizado, invalidar sesión en revocación, evitar races/perfil anterior, carga/error y diagnóstico sin demos.
- **Aceptación:** Cambio de actividad/rol no mantiene permisos/UI stale; login/logout/refresh correctos.
- **Prueba:** Sesión válida/incorrecta, perfil ausente/inactivo, cambio rápido y error Rules.
- **Módulos:** AuthContext.jsx, ProtectedRoute.jsx, Login.jsx.

### FB-019 — Guías operativas y de uso

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** Entrega y operación. **Depende de:** FB-017, FB-016.

- **Trabajo:** Documentar instalación sin emuladores, variables sin secretos, bootstrap/recuperación, entorno real explícito, controles de pruebas seguras y manual por rol.
- **Aceptación:** Compañero instala clon limpio siguiendo guía y distingue demo de real.
- **Prueba:** Ensayo cruzado y revisión contra comportamiento.
- **Módulos:** README y documentación futura.

### FB-020 — Adaptadores SDK/callables mínimos

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** Integración transversal RF/RNF. **Depende de:** Contrato FB-001; sin dependencia de código previa.

- **Trabajo:** Wrappers finos de errores/cancelación/listeners y contrato callable; no cliente REST ni reescritura indiscriminada del SDK.
- **Aceptación:** Errores distinguibles; no ocultar permission-denied; unsubscribe/cancelación correctos.
- **Prueba:** Unitarias y contrato callable con doble sin red; smoke real pendiente hasta disponer de callable y entorno autorizados.
- **Módulos:** src/services/callables/firebaseErrors y App.jsx propuestos.

### FB-021 — Activa real del alumno

**Responsable:** Juan Pablo. **Prioridad:** Crítica. **Alcance:** RF-13; RNF-02. **Depende de:** FB-006, FB-008, FB-004, FB-020.

- **Trabajo:** Eliminar demo, consultar propia y mostrar semanas/días/etapas/indicaciones; loading/vacío/error.
- **Aceptación:** A/B ven datos persistidos distintos; sin rutina muestra vacío, nunca ejemplo.
- **Prueba:** UI+Rules, recarga/error y acceso ajeno.
- **Módulos:** AlumnoDashboard.jsx, src/services/routines/read y componentes alumno propuestos.

### FB-022 — Historial alumno solo lectura

**Responsable:** Juan Pablo. **Prioridad:** Crítica. **Alcance:** RF-13; RNF-01/02. **Depende de:** FB-021.

- **Trabajo:** Lista/detalle histórica y distinción activa, paginación simple si necesaria.
- **Aceptación:** R1/R2 correctas; sin controles de mutación ni datos cruzados.
- **Prueba:** Varias rutinas, vacío/recarga/permiso denegado.
- **Módulos:** componentes alumno/history y queries propuestos.

### FB-023 — Editor profesor y ciclo de vida

**Responsable:** Juan Pablo. **Prioridad:** Crítica. **Alcance:** RF-09–12; RNF-02. **Depende de:** FB-007, FB-008, FB-020.

- **Trabajo:** Conservar builder/biblioteca/plantillas y listeners; nueva/editar/historial separados; enviar versiones y tratar conflictos.
- **Aceptación:** Nueva archiva anterior; editar preserva historia; P2 opera/P1 no; loading/error correctos.
- **Prueba:** UI end-to-end módulo y guardado obsoleto.
- **Módulos:** RoutineWorkspace.jsx, src/services/routines/write propuestos.

### FB-024 — Callable IA segura

**Responsable:** Juan Pablo. **Prioridad:** Crítica. **Alcance:** RF-14/15; RNF-01/04. **Depende de:** FB-005, FB-016.

- **Trabajo:** Proveedor aprobado, solo fuente pública versionada, Secret Manager, visitante sin login, App Check/abuso/longitudes/tokens, timeout, fuera de alcance; cero acceso a privados.
- **Aceptación:** Contexto sin privados, prompt no decide colecciones, dato ausente no inventado; test sin red.
- **Prueba:** Doble de proveedor, injection, fuente actualizada/vacía, secreto ausente, límites y cancelación.
- **Módulos:** functions/src/chat y tests/chat/unit propuestos.

### FB-025 — Widget IA integrado

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** RF-14/15; RNF-02. **Depende de:** FB-024, FB-020.

- **Trabajo:** Cambiar regex por callable manteniendo widget; sede, loading/error, cancelación y doble envío.
- **Aceptación:** Visitante/autenticado consultan; cambiar sede no mezcla respuestas; sin fallback ficticio.
- **Prueba:** UI con demora/fallo/cambio sede/teclado y callable doble sin red; integración real autorizada para verificar servicio final.
- **Módulos:** ArevalitoChat.jsx y servicio chat propuesto.

### FB-026 — Landing y sedes vigentes

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** RF-15/16; RNF-02. **Depende de:** FB-016, FB-020.

- **Trabajo:** Separar roles/IDs de datos institucionales, fuente pública única; dos sedes según política de compatibilidad, sin borrar datos legacy.
- **Aceptación:** Contenido consistente con admin/bot, sin build ni inventar dirección/precio; fuente caída se informa.
- **Prueba:** Cambio de contenido/ausencia sin acceso privado.
- **Módulos:** Landing.jsx, appData.js, SedeSwitcher.jsx y servicios públicos.

### FB-027 — QA de usabilidad/adaptabilidad

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** RNF-02/03. **Depende de:** FB-014, FB-016, FB-021, FB-022, FB-023, FB-025.

- **Trabajo:** Tareas por rol en 360/768/1366, zoom/teclado y usuarios; corregir bloqueantes sin rediseño.
- **Aceptación:** Formularios/editor/tablas/historial/chat utilizables y evidencia de usuarios.
- **Prueba:** Capturas/tareas observadas y retest.
- **Módulos:** CSS y tests/ui propuestos.

### FB-028 — Calidad IA, abuso y latencia

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** RF-15; RNF-01/04. **Depende de:** FB-024, FB-025, FB-016.

- **Trabajo:** Corpus 30 consultas cinco categorías/fuera de alcance/injection; medir tiempo total, cold start/carga y tokens/costo; real solo autorizado.
- **Aceptación:** Respuestas útiles correctas ≤20 s en escenario acordado; timeout cuenta fallo, no cumplimiento; privacidad y límites pasan.
- **Prueba:** Proveedor falso local y real posterior autorizado, registrar máximo/errores/tokens sin privados.
- **Módulos:** tests/chat/evaluation y evidencia futura.

### FB-029 — E2E integral

**Responsable:** Juan Pablo. **Prioridad:** Crítica. **Alcance:** RF-01–16; RNF-01. **Depende de:** FB-009, FB-017, FB-022, FB-023, FB-025, FB-026.

- **Trabajo:** Alta→asignación→R1→alumno→R2/historial→editar→reasignar→desactivar/reactivar; admin actualiza→chat; derivar defectos a dueño.
- **Aceptación:** 16 RF con evidencia pertinente, críticos/altos corregidos; fixture no oculta fallo funcional.
- **Prueba:** E2E demo y negativos pertinentes.
- **Módulos:** tests/e2e y matriz RF/RNF propuestos.

### FB-030 — Demo y cierre

**Responsable:** Juan Pablo. **Prioridad:** Alta. **Alcance:** Entrega TFI. **Depende de:** FB-027, FB-028, FB-029, FB-032, FB-033.

- **Trabajo:** Cada autor explica código/tests propios; consolidar checklist y limitaciones opcionales.
- **Aceptación:** Demo reproducible, contribuciones verificables, sin autoría inventada.
- **Prueba:** Ensayo conjunto y validación final según disponibilidad.
- **Módulos:** Guion/evidencias futuros.

### FB-031 — CI: controles sin red

**Responsable:** Lautaro. **Prioridad:** Alta. **Alcance:** Calidad y seguridad de integración. **Depende de:** FB-009, FB-017.

- **Trabajo:** Configurar CI seguro para build/lint, pruebas unitarias y contratos con dobles sin secretos ni conexión a nube; registrar explícitamente pruebas de permisos/integración pendientes.
- **Aceptación:** Los commits sobre main no disparan deploy; los controles locales/CI sin nube fallan ante una regresión demostrable. Los permisos reales NO quedan certificados por CI de mocks.
- **Prueba:** Ejecutar pipeline sin secretos y caso negativo local controlado. Sin acceso a nube; autorizar por separado cualquier integración real.
- **Módulos:** .github/workflows y scripts propuestos.

### FB-032 — Trazabilidad y acuerdo académico

**Responsable:** Ulises. **Prioridad:** Alta. **Alcance:** Trazabilidad RF/RNF y aprobación académica. **Depende de:** FB-019, FB-029.

- **Trabajo:** Actualizar BaaS/NoSQL/State/Proxy y matriz RF→FB→commit→prueba; registrar aceptación docente real.
- **Aceptación:** Documentos alineados o excepción explícita; no afirmar implementación/aprobación inexistente.
- **Prueba:** Revisión cruzada y decisión cátedra registrada.
- **Módulos:** ADR/modelos/diagramas/Jira/Figma futuros.

### FB-033 — Despliegue controlado y smoke

**Responsable:** Lautaro. **Prioridad:** Alta. **Alcance:** Entrega y operación segura. **Depende de:** FB-031, FB-029, FB-019.

- **Trabajo:** Revisar región/Blaze/cuotas/secrets/IAM, release compatible cliente/Rules/Functions y rollback; ejecutar solo con autorización posterior.
- **Aceptación:** HTTPS/deep links/callables/permisos y rollback funcionan; costos revisados, smoke sin datos reales.
- **Prueba:** Primero proyecto de prueba autorizado; cold start alimenta FB-028.
- **Módulos:** Configuración y runbook futuros.

## Orden recomendado

1. **En paralelo:** Ulises FB-011; Lautaro FB-006 → FB-005 → FB-004; Juan Pablo FB-020. Preparar contratos/versiones pendientes indicados en el contexto. No abrir paneles remotos antes de revisar FB-011.
2. **Cuentas y rutinas:** Ulises FB-012 → FB-013; Lautaro FB-007 → FB-008; Juan Pablo prepara consumidores y completa FB-021 → FB-022 y FB-023 cuando estén sus dependencias.
3. **Administración e institución:** Ulises FB-014, luego FB-015; FB-018 y FB-016 según dependencias. Juan Pablo FB-024 → FB-025 y FB-026 cuando exista fuente institucional compatible. Lautaro FB-010 tras FB-011/013; la ejecución de reparación remota requiere autorización aparte.
4. **Verificación:** Ulises FB-017 y luego FB-019; Lautaro FB-009 y FB-031; Juan Pablo FB-027/028/029 al integrar sus dependencias. Coordinar previamente autorización/entorno real; documentar bloqueos en lugar de ocultarlos con mocks. Se pueden preparar suites/CI antes, pero no dar por cerrada su aceptación.
5. **Entrega:** Ulises FB-032; Lautaro FB-033; Juan Pablo FB-030 cuando todas sus dependencias tengan evidencia. Ningún orden narrativo anula dependencias de fichas ni autoriza operaciones cloud.

El camino que condiciona la entrega pasa por contratos/seguridad → cuentas/rutinas → consumidores → integración real autorizada → E2E/CI → release/academia/demo. Institucional → IA → calidad/latencia es otra cadena obligatoria. No hay plazo ni total de horas vigente validado: reestimar por trabajo observado y disponibilidad semanal, sin trasladar cifras históricas ni descontar pruebas necesarias.

## Protocolo Git común

1. Confirmar repositorio, `main`, `git status --short` e índice (`git diff --cached`). Revisar identidad real de autor. `git fetch origin`; con árbol limpio, `git pull --ff-only origin main`. No crear ramas ni PR.
2. Con cambios previos: identificarlos y preservarlos. Solo continuar si se puede aislar documentalmente el alcance autorizado y actualizar sin afectar ningún archivo ajeno; ante solapamiento, índice ajeno o integración insegura, detenerse. No stashes, descartes o mezclas automáticas para ocultar el problema.
3. Revisar workflows, hooks/integraciones y automatizaciones asociadas a main. Si el push activa despliegue no autorizado, detenerse. Si no se puede comprobar un vínculo de despliegue relevante, informar la limitación antes de publicar. Permiso Git no autoriza release ni facturación.
4. Una tarea por ejecución; verificar dependencias reales, acordar archivos compartidos, cambios mínimos y pruebas seguras. Revisar scripts antes de ejecutarlos: no disparar suites con nube o una modalidad distinta de la acordada. Build/lint no acreditan RF.
5. Crear/actualizar solo el informe propio `docs/tfi/progreso/FB-XXX.md`. Revisar diff, secretos y `git diff --check`; stage explícito de archivos propios, nunca `git add .`. `git diff --cached --check` y revisión de nombres/contenido antes de commit.
6. Autorizados commit y push propios a `origin/main` cuando se cumplen los controles. Antes de push, `git fetch origin` y comprobar avance: integrar sin sobrescribir y repetir verificaciones pertinentes. Si hay conflicto o divergencia sin solución segura, detenerse y coordinar. Nunca force push, `reset --hard`, `git clean` ni elección global ours/theirs. No falsificar autoría.
7. Confirmar hash y resultado real del push. Informar siguiente tarea/autor según dependencias comprobadas; no iniciarla automáticamente.

## Estado y evidencia de entrega

- **PENDIENTE:** sin implementación acreditada; **EN DESARROLLO:** trabajo local/parcial.
- **IMPLEMENTADA / VALIDACIÓN PENDIENTE:** código integrado y pruebas locales, pero falta integración/criterio requerido.
- **VERIFICADA:** todos los criterios y casos relevantes pasan con evidencia pertinente.
- **BLOQUEADA:** dependencia, permiso o entorno impide continuar/verificar de forma segura; explicar qué falta.

Cada informe registra tarea/responsable, commit y archivos, comportamiento, comandos/pruebas/resultados, casos no ejecutados, riesgos/decisiones, autorización remota si corresponde y siguiente tarea elegible. Conservar trazabilidad RF/RNF → FB → commit → prueba. Una documentación publicada no acredita implementación.

Cierre TFI: 16 RF verificados; 4 RNF satisfechos con pruebas pertinentes; reglas de rol/sede/asignación/actividad, única activa e historial inmutable probadas con concurrencia/fallos; IA real institucional sin privados y ≤20 s útil; compatibilidad validada; despliegue autorizado con smoke/rollback; guías, evidencia individual auténtica y aceptación académica o excepción formal documentada. No cerrar con pruebas pendientes ni con resultados inventados.
