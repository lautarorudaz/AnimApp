# AnimApp — PLAN FINALIZACION TFI (operativo R3)

**Versión:** R3.0 | **Fecha:** 13/11/2026 | **Fuente:** Plan R2 Codex del 12/11/2026, adaptado a decisiones del equipo.

## Cómo usar este archivo

- **R2** fue una revisión del plan, no la tarea FB-001. R2 definió 33 tareas con emuladores.
- **R3** conserva el alcance funcional y los IDs pero NO utiliza FB-002/003 como parte del flujo elegido y trabaja en `main` sin ramas. No se crea una numeración nueva.
- **FB-001** = contrato técnico redactado, no implementación ni validación; ratificación de compañeros y conformidad académica pendientes.
- **FB-002** = descartada de modalidad; FB-003 = implementación de aislamiento local no adoptada en el flujo compartido. No se declaran ejecutadas en `main`.
- **FB-004...FB-033** = 30 tareas activas. **Ninguna tarea funcional puede darse por cerrada únicamente por existir este documento.**
- Todos los criterios de aceptación indicados abajo vienen de R2; se conserva su sentido. Donde R2 exigía emulador, R3 permite construir/probar partes puras sin red, pero deja la **integración real PENDIENTE** hasta una validación segura autorizada.
- Las cifras **210 horas-persona** eran la estimación BASE R2 antes de retirar FB-002/003; NO son la estimación vigente del trabajo pendiente. Descontar mecánicamente 18 h (FB-001/002/003) daría 192 h, pero **NO es una nueva estimación**, porque los costes de verificación y coordinación sin emuladores cambian. Reestimar tras las primeras integraciones.
- El estado real de producción, los deploys y el HEAD actual de GitHub no fueron verificados al preparar R3. La auditoría adjunta es una foto histórica.

## Dependencias e integración

En la tabla se excluyen FB-001 (contrato de referencia), FB-002 y FB-003 como gates de programación. Se mantienen todas las demás dependencias técnicas de R2. La documentación se presupone disponible en `docs/tfi/` de `main` antes de comenzar tareas.

**Distinción:** un equipo puede avanzar código puro antes de una dependencia, pero una tarea que requiere operar un módulo ajeno NO se marca implementada/validada hasta que los módulos compatibles estén integrados. Ningún ID anterior se considera ejecutado porque un Codex lo haya anunciado; se verifica `main`, tests y `docs/tfi/progreso/`.

**Restricción de despliegue:** ningún commit autoriza deploy remoto de Rules, Functions, Hosting, cambios de Auth, migraciones, importaciones, borrados, secretos ni gastos en Blaze. Ver `DECISIONES_EQUIPO_R3.md`.

## Backlog activo resumido

| ID | Dueño | Prioridad | Tarea | Dependencias activas | O/B/C h (R2; históricas) |
|---|---|---|---|---|---|
| FB-004 | Lautaro | Crítica | Rules de lecturas y CRUD permitido | Ninguna técnica (FB-001 vigente) | 6/8/11 |
| FB-005 | Lautaro | Crítica | Base callable y Proxy confiable | Ninguna técnica (FB-001 vigente) | 5/6/8 |
| FB-006 | Lautaro | Crítica | Modelo de rutina y estados | Ninguna técnica (FB-001 vigente) | 6/8/11 |
| FB-007 | Lautaro | Crítica | Asignación callable transaccional | FB-005, FB-006, FB-004 | 5/6/8 |
| FB-008 | Lautaro | Crítica | Edición activa y contrato de consultas | FB-007 | 5/6/8 |
| FB-009 | Lautaro | Crítica | Seguridad y concurrencia integradas | FB-004, FB-007, FB-008, FB-013, FB-015 | 6/8/11 |
| FB-010 | Lautaro | Alta | Compatibilidad y reparación explícita | FB-006, FB-011, FB-013 | 5/6/8 |
| FB-011 | Ulises | Crítica | Retirar backfills destructivos | Ninguna técnica (FB-001 vigente) | 5/6/8 |
| FB-012 | Ulises | Crítica | Callable de aprovisionamiento | FB-005 | 8/10/14 |
| FB-013 | Ulises | Crítica | Estado y cambios privilegiados de cuenta | FB-012, FB-006 | 6/8/11 |
| FB-014 | Ulises | Alta | Paneles y edición Firebase consistente | FB-011, FB-012, FB-013, FB-004, FB-020 | 5/6/8 |
| FB-015 | Ulises | Crítica | Asignación Web transaccional | FB-014, FB-006, FB-004 | 5/6/8 |
| FB-016 | Ulises | Alta | Fuente institucional y panel admin | FB-004, FB-020 | 6/8/11 |
| FB-017 | Ulises | Alta | Regresión cuentas y recepción | FB-014, FB-015, FB-018 | 5/6/8 |
| FB-018 | Ulises | Alta | Sesión y perfil activo | FB-004, FB-020 | 5/6/8 |
| FB-019 | Ulises | Alta | Guías operativas y de uso | FB-017, FB-016 | 5/6/8 |
| FB-020 | Juan Pablo | Alta | Adaptadores SDK/callables mínimos | Ninguna técnica (FB-001 vigente) | 3/4/6 |
| FB-021 | Juan Pablo | Crítica | Activa real del alumno | FB-006, FB-008, FB-004, FB-020 | 6/8/11 |
| FB-022 | Juan Pablo | Crítica | Historial alumno solo lectura | FB-021 | 5/6/8 |
| FB-023 | Juan Pablo | Crítica | Editor profesor y ciclo de vida | FB-007, FB-008, FB-020 | 6/8/11 |
| FB-024 | Juan Pablo | Crítica | Callable IA segura | FB-005, FB-016 | 6/8/11 |
| FB-025 | Juan Pablo | Alta | Widget IA integrado | FB-024, FB-020 | 5/6/8 |
| FB-026 | Juan Pablo | Alta | Landing y sedes vigentes | FB-016, FB-020 | 5/6/8 |
| FB-027 | Juan Pablo | Alta | QA de usabilidad/adaptabilidad | FB-014, FB-016, FB-021, FB-022, FB-023, FB-025 | 5/6/8 |
| FB-028 | Juan Pablo | Alta | Calidad IA, abuso y latencia | FB-024, FB-025, FB-016 | 5/6/8 |
| FB-029 | Juan Pablo | Crítica | E2E integral | FB-009, FB-017, FB-022, FB-023, FB-025, FB-026 | 5/6/8 |
| FB-030 | Juan Pablo | Alta | Demo y cierre | FB-027, FB-028, FB-029, FB-032, FB-033 | 3/4/6 |
| FB-031 | Lautaro | Alta | CI sin emuladores: build/lint/unitarias/contratos sin red | FB-009, FB-017 | 3/4/6 |
| FB-032 | Ulises | Alta | Trazabilidad y acuerdo académico | FB-019, FB-029 | 5/6/8 |
| FB-033 | Lautaro | Alta | Despliegue controlado y smoke | FB-031, FB-029, FB-019 | 3/4/6 |

## Primeras tareas posibles en paralelo

- **Ulises:** FB-011 (eliminar backfills peligrosos de administración/recepción, sin abrir esas pantallas contra `animappv1`).
- **Lautaro:** FB-006 (dominio y State de rutinas, con pruebas unitarias sin red).
- **Juan Pablo:** FB-020 (adaptadores mínimos SDK/callables, pruebas con dobles sin red).

FB-011, FB-006 y FB-020 pueden programarse sin esperarse entre sí. Su integración no autoriza aún pruebas remotas. Para FB-012 se requiere FB-005 integrado; para los alumnos reales FB-021 requiere FB-006/008/004/020; para IA FB-024 requiere FB-005 y FB-016.

## Fichas individuales con criterios del plan R2

### Responsable: Ulises

**Orden sugerido (no sustituye dependencias):** FB-011 → FB-012 → FB-013 → FB-014 → FB-015 → FB-016 → FB-018 → FB-017 → FB-019 → FB-032

#### FB-011 — Retirar backfills destructivos

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** Contrato FB-001 y documentación compartida.
- **Archivos/módulos sugeridos:** AdminDashboard.jsx, RecepcionDashboard.jsx y tests/users/backfill propuestos.
- **Implementación:** Quitar escrituras automáticas de listeners y mostrar inconsistencia sin repararla al visitar; conservar lecturas/formularios.
- **Aceptación técnica R2:** Abrir/recargar/cambiar sede no escribe; dos pestañas/listeners demorados no reemplazan fichas.
- **Pruebas previstas en R2:** Emulador con datos existentes ficticios y conteo cero de writes al navegar.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises exclusivo AD/RD; integrar este commit antes de otros cambios de paneles. No modificar módulos ajenos sin acuerdo explícito.

#### FB-012 — Callable de aprovisionamiento

- **Prioridad:** Crítica. **Esfuerzo R2:** 8/10/14 h O/B/C (reestimar).
- **Dependencias activas:** FB-005.
- **Archivos/módulos sugeridos:** functions/src/accounts/provision y tests propuestos.
- **Implementación:** Saga: reserva idempotente, Auth inicialmente deshabilitado, revalidación y perfil/ficha, habilitación; recuperación y bootstrap separado; nunca contraseñas en logs.
- **Aceptación técnica R2:** Recepción solo alumno de sede; admin roles autorizados; sesión operador intacta; ningún huérfano habilitado sin perfil ni borrado de cuenta ajena por email.
- **Pruebas previstas en R2:** Fallo inducido en cada paso, duplicado/reintento y revocación durante alta.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises dueño accounts; Lautaro export/revisión seguridad. No modificar módulos ajenos sin acuerdo explícito.

#### FB-013 — Estado y cambios privilegiados de cuenta

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-012, FB-006.
- **Archivos/módulos sugeridos:** functions/src/accounts/manage y tests propuestos.
- **Implementación:** Acciones explícitas rol/sede/estado; bloquear datos antes de sincronizar Auth; preservar historia y coherencia de relaciones; política último admin.
- **Aceptación técnica R2:** Desactivar deniega nuevas operaciones, reactivar coherente; traslado/cambio rol no borra historia; fallo Auth queda recuperable.
- **Pruebas previstas en R2:** Token vigente inactivo, traslado con rutina, carrera y fallo updateUser.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Interfaz rutinas acordada con Lautaro, no editar su dominio en paralelo. No modificar módulos ajenos sin acuerdo explícito.

#### FB-014 — Paneles y edición Firebase consistente

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-011, FB-012, FB-013, FB-004, FB-020.
- **Archivos/módulos sugeridos:** AD/RD, src/services/accounts/students propuestos.
- **Implementación:** Sustituir altas/acciones privilegiadas por callables; conservar listeners/CRUD simple; batch/tx para copias coherentes y Rules; mejorar errores sin rediseño.
- **Aceptación técnica R2:** Alta/edición/estado operativos, nombres/teléfonos consistentes y email Auth no divergente; ninguna escritura al abrir.
- **Pruebas previstas en R2:** UI+SDK/callable por roles, errores/red y vacíos.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises AD/RD; App.jsx solo JP. No modificar módulos ajenos sin acuerdo explícito.

#### FB-015 — Asignación Web transaccional

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-014, FB-006, FB-004.
- **Archivos/módulos sugeridos:** src/services/students/assignment, RD y tests propuestos.
- **Implementación:** Leer actor/alumno/profesor, versión esperada y misma sede/actividad; cambiar solo relación/version; Rules comprueba referencias y estado final.
- **Aceptación técnica R2:** No autoasignación alumno; profesor inválido/ajeno/inactivo rechazado; P1 pierde y P2 obtiene acceso sin cambiar historia.
- **Pruebas previstas en R2:** SDK malicioso y carrera con assign/edit; positivos y negativos Rules.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises servicio; Lautaro incorpora Rules en ventana coordinada. No modificar módulos ajenos sin acuerdo explícito.

#### FB-016 — Fuente institucional y panel admin

- **Prioridad:** Alta. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-004, FB-020.
- **Archivos/módulos sugeridos:** AdminInstitutional.jsx, src/services/institutional, DTO propuestos.
- **Implementación:** Documento público separado con cinco categorías/dos sedes; escritura admin validada/versionada; datos confirmados y metadatos no sensibles.
- **Aceptación técnica R2:** Actualizar y recargar conserva; siguiente consulta usa versión nueva sin build; otros no escriben; sin datos inventados.
- **Pruebas previstas en R2:** Rules/UI de campos inválidos, conflicto y cinco categorías.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises componente, JP registra ruta, Lautaro Rules. No modificar módulos ajenos sin acuerdo explícito.

#### FB-018 — Sesión y perfil activo

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-004, FB-020.
- **Archivos/módulos sugeridos:** AuthContext.jsx, ProtectedRoute.jsx, Login.jsx.
- **Implementación:** Conservar Auth SDK; observar perfil autorizado, invalidar sesión en revocación, evitar races/perfil anterior, carga/error y diagnóstico sin demos.
- **Aceptación técnica R2:** Cambio de actividad/rol no mantiene permisos/UI stale; login/logout/refresh correctos.
- **Pruebas previstas en R2:** Sesión válida/incorrecta, perfil ausente/inactivo, cambio rápido y error Rules.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises contexto; Lautaro conexión config; JP no toca sesión. No modificar módulos ajenos sin acuerdo explícito.

#### FB-017 — Regresión cuentas y recepción

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-014, FB-015, FB-018.
- **Archivos/módulos sugeridos:** tests/accounts/students propuestos.
- **Implementación:** Probar altas, coherencia, reactivación, roles/sedes/asignación y recuperación; solo fixtures demo.
- **Aceptación técnica R2:** Evidencia funcional RF-01–08 y fallos recuperables; sin reparación al navegar.
- **Pruebas previstas en R2:** Emuladores+UI por roles y negativos pertinentes.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** No sustituye suite independiente FB-009. No modificar módulos ajenos sin acuerdo explícito.

#### FB-019 — Guías operativas y de uso

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-017, FB-016.
- **Archivos/módulos sugeridos:** README y documentación futura.
- **Implementación:** Documentar instalación sin emuladores, variables sin secretos, bootstrap/recuperación, entorno real explícito, controles de pruebas seguras y manual por rol.
- **Aceptación técnica R2:** Compañero instala clon limpio siguiendo guía y distingue demo de real.
- **Pruebas previstas en R2:** Ensayo cruzado y revisión contra comportamiento.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises coordina; dueños revisan sus módulos. No modificar módulos ajenos sin acuerdo explícito.

#### FB-032 — Trazabilidad y acuerdo académico

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-019, FB-029.
- **Archivos/módulos sugeridos:** ADR/modelos/diagramas/Jira/Figma futuros.
- **Implementación:** Actualizar BaaS/NoSQL/State/Proxy y matriz RF→FB→commit→prueba; registrar aceptación docente real.
- **Aceptación técnica R2:** Documentos alineados o excepción explícita; no afirmar implementación/aprobación inexistente.
- **Pruebas previstas en R2:** Revisión cruzada y decisión cátedra registrada.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ulises coordina, dueños validan evidencias. No modificar módulos ajenos sin acuerdo explícito.

### Responsable: Lautaro

**Orden sugerido (no sustituye dependencias):** FB-006 → FB-005 → FB-004 → FB-007 → FB-008 → FB-010 → FB-009 → FB-031 → FB-033

#### FB-006 — Modelo de rutina y estados

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** Contrato FB-001 y documentación compartida.
- **Archivos/módulos sugeridos:** functions/src/routines/domain y tests propuestos.
- **Implementación:** ID por rutina, puntero, versión, autor/titular, contenido semanas/días/etapas; Active/HistoricalState con edit/archive; validación de límites y snapshots.
- **Aceptación técnica R2:** Histórica rechaza mutaciones; estado no es solo booleano; esquema inválido rechazado.
- **Pruebas previstas en R2:** Unitarias de transiciones y límites/estructura legacy.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP consume DTO, no cambia dominio. No modificar módulos ajenos sin acuerdo explícito.

#### FB-005 — Base callable y Proxy confiable

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** Contrato FB-001 y documentación compartida.
- **Archivos/módulos sugeridos:** functions/src/index/config/security propuestos.
- **Implementación:** Exports acotados, identidad callable y proxy que revalida perfil/relación en transacción; separar App Check de permiso; restringir acceso al repositorio.
- **Aceptación técnica R2:** Privadas rechazan actor ausente/inactivo/ajeno; repositorio no recibe llamada después de denegación.
- **Pruebas previstas en R2:** Unitarias e integración de identidad, revocación y delegación.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Lautaro registra exports; Ulises/JP entregan módulos separados. No modificar módulos ajenos sin acuerdo explícito.

#### FB-004 — Rules de lecturas y CRUD permitido

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** Contrato FB-001 y documentación compartida.
- **Archivos/módulos sugeridos:** firestore.rules, firestore.indexes.json, tests/rules propuestos.
- **Implementación:** Corregir inactivos, UID/roles/sedes/allowlists; proteger referencias/getAfter; denegar escritura SDK de rutinas/punteros/privilegios; conservar biblioteca e institucional autorizado.
- **Aceptación técnica R2:** Positivos pasan y bypass por UID/campos no; consultas compatibles; público sin datos privados.
- **Pruebas previstas en R2:** Matriz SDK get/list/create/update/delete e índices, campos/IDs forjados.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Único dueño Rules; Ulises aporta casos institucional/perfiles. No modificar módulos ajenos sin acuerdo explícito.

#### FB-007 — Asignación callable transaccional

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-005, FB-006, FB-004.
- **Archivos/módulos sugeridos:** functions/src/routines/assign y tests propuestos.
- **Implementación:** Leer actor/ficha/perfiles/puntero/operación; comparar versión/asignación; archivar, crear nueva y actualizar puntero/idempotencia atómicamente.
- **Aceptación técnica R2:** Una activa, histórico conservado, reintento mismo resultado; conflictos no sobrescriben intención ajena.
- **Pruebas previstas en R2:** Primera/segunda asignación, doble envío, clave con payload distinto y concurrencia.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Lautaro escritura dominio; JP adaptación UI. No modificar módulos ajenos sin acuerdo explícito.

#### FB-008 — Edición activa y contrato de consultas

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-007.
- **Archivos/módulos sugeridos:** functions/src/routines/edit, tests y contrato queries propuestos.
- **Implementación:** Editar solo activa apuntada con versión esperada; autor separado de permiso actual; definir queries SDK de activa/historial e índices.
- **Aceptación técnica R2:** Profesor reasignado opera y anterior no; histórico/IDs inmutables; no callable innecesaria de lectura.
- **Pruebas previstas en R2:** Conflictos, histórica, titular ajeno y consultas propias/listas.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP implementa listeners, Lautaro Rules/índices. No modificar módulos ajenos sin acuerdo explícito.

#### FB-010 — Compatibilidad y reparación explícita

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-006, FB-011, FB-013.
- **Archivos/módulos sugeridos:** scripts locales de diagnóstico/migración y tests/legacy propuestos.
- **Implementación:** Dry-run de aliases/huérfanos/rutina actual; adaptación idempotente en datos sintéticos; respaldo/revisión para futura ejecución autorizada; no inventar históricos.
- **Aceptación técnica R2:** No escribe por defecto; repetir no duplica ni reemplaza historia; reporta irrecuperable.
- **Pruebas previstas en R2:** Fixtures legacy, duplicados/faltantes y guardas demo.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Lautaro migración; Ulises contrato de cuentas; ningún trigger automático. No modificar módulos ajenos sin acuerdo explícito.

#### FB-009 — Seguridad y concurrencia integradas

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-004, FB-007, FB-008, FB-013, FB-015.
- **Archivos/módulos sugeridos:** tests/security y tests/routines/concurrency propuestos.
- **Implementación:** Cubrir H-01–H-09 por SDK/callables: cuentas inactivas, dos editores, cambios de permiso/reasignación durante operación y escrituras maliciosas.
- **Aceptación técnica R2:** Todos los negativos denegados, positivos válidos; sin dos activas, pérdida histórica ni autorización obsoleta.
- **Pruebas previstas en R2:** Emuladores con concurrencia controlada y comparación de documentos.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Defectos accounts vuelven a Ulises; suites por dueño. No modificar módulos ajenos sin acuerdo explícito.

#### FB-031 — CI sin emuladores: controles sin red

- **Prioridad:** Alta. **Esfuerzo R2:** 3/4/6 h O/B/C (reestimar).
- **Dependencias activas:** FB-009, FB-017.
- **Archivos/módulos sugeridos:** .github/workflows y scripts propuestos.
- **Implementación:** Configurar CI seguro para build/lint, pruebas unitarias y contratos con dobles sin secretos ni conexión a nube; registrar explícitamente pruebas de permisos/integración pendientes.
- **Aceptación técnica R2:** Los commits sobre main no disparan deploy; los controles locales/CI sin nube fallan ante una regresión demostrable. Los permisos reales NO quedan certificados por CI de mocks.
- **Pruebas previstas en R2:** Ejecutar pipeline sin secretos y caso negativo local controlado. Sin emulador; autorizar por separado cualquier integración real.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Lautaro dueño dependencias/workflows. No modificar módulos ajenos sin acuerdo explícito.

#### FB-033 — Despliegue controlado y smoke

- **Prioridad:** Alta. **Esfuerzo R2:** 3/4/6 h O/B/C (reestimar).
- **Dependencias activas:** FB-031, FB-029, FB-019.
- **Archivos/módulos sugeridos:** Configuración y runbook futuros.
- **Implementación:** Revisar región/Blaze/cuotas/secrets/IAM, release compatible cliente/Rules/Functions y rollback; ejecutar solo con autorización posterior.
- **Aceptación técnica R2:** HTTPS/deep links/callables/permisos y rollback funcionan; costos revisados, smoke sin datos reales.
- **Pruebas previstas en R2:** Primero proyecto de prueba autorizado; cold start alimenta FB-028.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Lautaro operador; equipo autoriza gasto/deploy por separado. No modificar módulos ajenos sin acuerdo explícito.

### Responsable: Juan Pablo

**Orden sugerido (no sustituye dependencias):** FB-020 → FB-021 → FB-022 → FB-023 → FB-024 → FB-025 → FB-026 → FB-027 → FB-028 → FB-029 → FB-030

#### FB-020 — Adaptadores SDK/callables mínimos

- **Prioridad:** Alta. **Esfuerzo R2:** 3/4/6 h O/B/C (reestimar).
- **Dependencias activas:** Contrato FB-001 y documentación compartida.
- **Archivos/módulos sugeridos:** src/services/callables/firebaseErrors y App.jsx propuestos.
- **Implementación:** Wrappers finos de errores/cancelación/listeners y contrato callable; no cliente REST ni reescritura indiscriminada del SDK.
- **Aceptación técnica R2:** Errores distinguibles; no ocultar permission-denied; unsubscribe/cancelación correctos.
- **Pruebas previstas en R2:** Unitarias y smoke callable emulada.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP App/adaptadores; Lautaro config/export; Ulises cuentas. No modificar módulos ajenos sin acuerdo explícito.

#### FB-021 — Activa real del alumno

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-006, FB-008, FB-004, FB-020.
- **Archivos/módulos sugeridos:** AlumnoDashboard.jsx, src/services/routines/read y componentes alumno propuestos.
- **Implementación:** Eliminar demo, consultar propia y mostrar semanas/días/etapas/indicaciones; loading/vacío/error.
- **Aceptación técnica R2:** A/B ven datos persistidos distintos; sin rutina muestra vacío, nunca ejemplo.
- **Pruebas previstas en R2:** UI+Rules, recarga/error y acceso ajeno.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP dashboard; contrato de Lautaro no se cambia en UI. No modificar módulos ajenos sin acuerdo explícito.

#### FB-022 — Historial alumno solo lectura

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-021.
- **Archivos/módulos sugeridos:** componentes alumno/history y queries propuestos.
- **Implementación:** Lista/detalle histórica y distinción activa, paginación simple si necesaria.
- **Aceptación técnica R2:** R1/R2 correctas; sin controles de mutación ni datos cruzados.
- **Pruebas previstas en R2:** Varias rutinas, vacío/recarga/permiso denegado.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP; índices coordinados con Lautaro. No modificar módulos ajenos sin acuerdo explícito.

#### FB-023 — Editor profesor y ciclo de vida

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-007, FB-008, FB-020.
- **Archivos/módulos sugeridos:** RoutineWorkspace.jsx, src/services/routines/write propuestos.
- **Implementación:** Conservar builder/biblioteca/plantillas y listeners; nueva/editar/historial separados; enviar versiones y tratar conflictos.
- **Aceptación técnica R2:** Nueva archiva anterior; editar preserva historia; P2 opera/P1 no; loading/error correctos.
- **Pruebas previstas en R2:** UI end-to-end módulo y guardado obsoleto.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP RW, Lautaro Functions rutinas. No modificar módulos ajenos sin acuerdo explícito.

#### FB-024 — Callable IA segura

- **Prioridad:** Crítica. **Esfuerzo R2:** 6/8/11 h O/B/C (reestimar).
- **Dependencias activas:** FB-005, FB-016.
- **Archivos/módulos sugeridos:** functions/src/chat y tests/chat/unit propuestos.
- **Implementación:** Proveedor aprobado, solo fuente pública versionada, Secret Manager, visitante sin login, App Check/abuso/longitudes/tokens, timeout, fuera de alcance; cero acceso a privados.
- **Aceptación técnica R2:** Contexto sin privados, prompt no decide colecciones, dato ausente no inventado; test sin red.
- **Pruebas previstas en R2:** Doble de proveedor, injection, fuente actualizada/vacía, secreto ausente, límites y cancelación.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP chat; Lautaro export/config; Ulises fuente. No modificar módulos ajenos sin acuerdo explícito.

#### FB-025 — Widget IA integrado

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-024, FB-020.
- **Archivos/módulos sugeridos:** ArevalitoChat.jsx y servicio chat propuesto.
- **Implementación:** Cambiar regex por callable manteniendo widget; sede, loading/error, cancelación y doble envío.
- **Aceptación técnica R2:** Visitante/autenticado consultan; cambiar sede no mezcla respuestas; sin fallback ficticio.
- **Pruebas previstas en R2:** UI demora/fallo/cambio sede/teclado y callable emulada.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP exclusivo widget/estilos acotados. No modificar módulos ajenos sin acuerdo explícito.

#### FB-026 — Landing y sedes vigentes

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-016, FB-020.
- **Archivos/módulos sugeridos:** Landing.jsx, appData.js, SedeSwitcher.jsx y servicios públicos.
- **Implementación:** Separar roles/IDs de datos institucionales, fuente pública única; dos sedes según política de compatibilidad, sin borrar datos legacy.
- **Aceptación técnica R2:** Contenido consistente con admin/bot, sin build ni inventar dirección/precio; fuente caída se informa.
- **Pruebas previstas en R2:** Cambio de contenido/ausencia sin acceso privado.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** JP constantes/rutas; Ulises proporciona DTO/datos. No modificar módulos ajenos sin acuerdo explícito.

#### FB-027 — QA de usabilidad/adaptabilidad

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-014, FB-016, FB-021, FB-022, FB-023, FB-025.
- **Archivos/módulos sugeridos:** CSS y tests/ui propuestos.
- **Implementación:** Tareas por rol en 360/768/1366, zoom/teclado y usuarios; corregir bloqueantes sin rediseño.
- **Aceptación técnica R2:** Formularios/editor/tablas/historial/chat utilizables y evidencia de usuarios.
- **Pruebas previstas en R2:** Capturas/tareas observadas y retest.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Ventana CSS global JP; defectos cuentas vuelven a Ulises. No modificar módulos ajenos sin acuerdo explícito.

#### FB-028 — Calidad IA, abuso y latencia

- **Prioridad:** Alta. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-024, FB-025, FB-016.
- **Archivos/módulos sugeridos:** tests/chat/evaluation y evidencia futura.
- **Implementación:** Corpus 30 consultas cinco categorías/fuera de alcance/injection; medir tiempo total, cold start/carga y tokens/costo; real solo autorizado.
- **Aceptación técnica R2:** Respuestas útiles correctas ≤20 s en escenario acordado; timeout cuenta fallo, no cumplimiento; privacidad y límites pasan.
- **Pruebas previstas en R2:** Proveedor falso local y real posterior autorizado, registrar máximo/errores/tokens sin privados.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Gate real requiere despliegue de prueba autorizado de FB-033; no gasto hoy. No modificar módulos ajenos sin acuerdo explícito.

#### FB-029 — E2E integral

- **Prioridad:** Crítica. **Esfuerzo R2:** 5/6/8 h O/B/C (reestimar).
- **Dependencias activas:** FB-009, FB-017, FB-022, FB-023, FB-025, FB-026.
- **Archivos/módulos sugeridos:** tests/e2e y matriz RF/RNF propuestos.
- **Implementación:** Alta→asignación→R1→alumno→R2/historial→editar→reasignar→desactivar/reactivar; admin actualiza→chat; derivar defectos a dueño.
- **Aceptación técnica R2:** 16 RF con evidencia pertinente, críticos/altos corregidos; fixture no oculta fallo funcional.
- **Pruebas previstas en R2:** E2E demo y negativos pertinentes.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** No editar módulos ajenos en paralelo. No modificar módulos ajenos sin acuerdo explícito.

#### FB-030 — Demo y cierre

- **Prioridad:** Alta. **Esfuerzo R2:** 3/4/6 h O/B/C (reestimar).
- **Dependencias activas:** FB-027, FB-028, FB-029, FB-032, FB-033.
- **Archivos/módulos sugeridos:** Guion/evidencias futuros.
- **Implementación:** Cada autor explica código/tests propios; consolidar checklist y limitaciones opcionales.
- **Aceptación técnica R2:** Demo reproducible, contribuciones verificables, sin autoría inventada.
- **Pruebas previstas en R2:** Ensayo conjunto y validación final según disponibilidad.
- **R3 — prueba segura:** implementar las pruebas que no requieran red con fixtures/dobles; si se necesitan Auth/Rules/Functions/IA reales, dejar VALIDACIÓN REMOTA PENDIENTE, documentar protocolo de prueba y pedir autorización específica antes de ejecutarla.
- **Coordinación:** Congelar salvo defectos aceptados; no inflar commits. No modificar módulos ajenos sin acuerdo explícito.

## Regla de estados por tarea

- **PENDIENTE:** sin modificación implementada verificada en GitHub.
- **EN_DESARROLLO:** código local o integración parcial, sin commit/push aceptado.
- **IMPLEMENTADA / VALIDACIÓN PENDIENTE:** commit en `main` con pruebas unitarias/static, pero integración real necesaria sin ejecutar.
- **VERIFICADA:** criterios de aceptación completos con evidencia real y permisos/safety relevantes comprobados; ningún test faltante disimulado.
- **BLOQUEADA:** no hay forma segura/autorizada de cumplir un gate (por ejemplo, Cloud Functions que requieren Blaze y deploy autorizado).

Cada Codex escribe su informe en `docs/tfi/progreso/FB-XXX.md` y hace commit/push junto al código si los gates de Git lo permiten. Si no puede publicar por conflicto/CI/CD o seguridad, avisa y no afirma éxito.

## Seguridad y validación que sigue siendo obligatoria

Los 16 RF y 4 RNF mantienen su definición original. Es crucial verificar altas de Auth recuperables, aislamiento de alumnos, rol/sede, inactivos con sesión vigente, asignación profesor válida, una rutina activa bajo concurrencia, historial inmutable, IA sin privados y RNF-04 < o = 20 s de respuesta útil. Los tests simulados por sí solos nunca validan esas garantías. El equipo deberá autorizar un entorno/protocolo de pruebas integrales antes de declarar el TFI concluido.

## Integración secuencial recomendada

1. Subir documentación R3 a `main` (sin incluir archivos locales no relacionados).
2. FB-011, FB-006 y FB-020 en paralelo, todos sobre contratos fijos.
3. FB-005 y FB-004 de Lautaro; habilitan provisión de cuentas y consultas seguras.
4. FB-012/013 de Ulises y FB-007/008 de Lautaro; integrar consumidor de alumno y editor cuando se verifiquen contratos.
5. FB-014/015/018/016 de Ulises y FB-021/022/023/024/025/026 de Juan Pablo, según dependencias exactas.
6. FB-009/010/017/027/028/029/031; completar garantías, migración solo con aprobación, evaluación funcional y calidad.
7. FB-019/032/033/030: manuales, aceptación académica, despliegue autorizado y demo.

**No interpretar el orden narrativo como autorización de correr operaciones que afectan Firebase real.**
