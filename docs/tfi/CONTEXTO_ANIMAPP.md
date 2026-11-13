# AnimApp — contexto operativo

Vigente: 13/11/2026. **Única fuente normativa técnica**, consolidación del contrato obligatorio FB-001 y las decisiones definitivas del equipo. [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md) define tareas y ejecución; los tres `CODEX_*.txt` son entradas por responsable. [historico/](historico/README.md) conserva antecedentes, **no instrucciones vigentes**. Los informes de verificación acreditan únicamente lo que probaron, no cambian estos contratos.

FB-001 está definido como contrato técnico; esto no demuestra implementación ni verificación de los RF. La aceptación académica de Firebase BaaS/NoSQL sigue pendiente. Un cambio de contrato exige acuerdo de afectados y actualización explícita aquí; no resolver discrepancias mediante variantes silenciosas en cada módulo.

## 1. Objetivo y alcance

TFI de la Tecnicatura Universitaria en Programación, UTN FR Resistencia. Equipo: Juan Pablo Lenain, Ulises Agustín Rudaz y Lautaro Martín Rudaz. Gimnasio Anima: centralizar usuarios y rutinas personalizadas y automatizar consultas institucionales con IA. Sedes canónicas: `moreno` (Av. Moreno 1020) y `edison` (Av. Edison 46), Resistencia. No agregar pagos, stock, subida de videos ni creación de rutinas por IA como requisitos. Conservar interfaces, biblioteca y plantillas existentes; corregir solo lo necesario.

| RF | Obligación |
|---|---|
| RF-01 | Administrador registra usuarios con rol y sucursal. |
| RF-02 | Administrador consulta y actualiza usuarios de todas las sucursales. |
| RF-03 | Recepcionista registra alumnos con rol Alumno automático. |
| RF-04 | Recepcionista consulta y actualiza alumnos de su sucursal. |
| RF-05 | Usuarios se autentican mediante credenciales. |
| RF-06 | Administrador activa y desactiva cuentas. |
| RF-07 | Recepcionista activa y desactiva alumnos de su sucursal. |
| RF-08 | Recepcionista asigna y reasigna profesor a alumnos de su sucursal. |
| RF-09 | Profesor consulta sus alumnos asignados. |
| RF-10 | Profesor crea y asigna rutinas personalizadas a sus alumnos asignados. |
| RF-11 | Profesor consulta activa e historial de sus alumnos asignados. |
| RF-12 | Profesor modifica la rutina activa de sus alumnos asignados. |
| RF-13 | Alumno consulta su activa e historial propios. |
| RF-14 | Visitantes y autenticados consultan al chatbot. |
| RF-15 | Chatbot responde sobre precios, planes, horarios, sucursales y modalidades. |
| RF-16 | Administrador actualiza la información institucional consumida por el chatbot. |

| RNF | Criterio y evidencia necesaria |
|---|---|
| RNF-01 | Seguridad efectiva por rol, sede, asignación y actividad; pruebas positivas/negativas de get/list/create/update/delete por SDK/callables, sin depender de UI. |
| RNF-02 | Navegación clara, consistente e intuitiva; tareas observadas por rol/visitante, estados de carga/vacío/error, teclado/foco y corrección de bloqueantes. |
| RNF-03 | Computadora, tablet y móvil; comprobar 360×800, 768×1024, 1366×768, zoom 200%, orientación y controles accesibles; dispositivo real si disponible. CSS no es evidencia suficiente. |
| RNF-04 | Respuesta útil del chatbot visible dentro de **20 s**, medida extremo a extremo, incluyendo cold start y carga acordada. Corpus mínimo de 30 preguntas, cinco categorías, fuera de alcance y fallos. Error/timeout debe controlarse, pero **no cuenta como respuesta útil ni cumplimiento**. Registrar tiempos, errores y tasa de éxito. |

## 2. Arquitectura y fronteras de confianza

React/Vite → Firebase Web SDK → Authentication/Firestore para autenticación, lecturas y CRUD simple protegido por **Security Rules**. React → **Cloud Functions callable acotadas** para altas administrativas, cambios privilegiados de identidad/rol/sede/estado, mutaciones de rutinas e IA. Functions → Admin SDK/Auth/Firestore y proveedor IA con secreto en servidor. Hosting solo mediante despliegue autorizado. **Sin Express ni API REST general; Firestore es documental/NoSQL.**

- React presenta, valida para usabilidad y solicita operaciones. `ProtectedRoute` y wrappers no son barreras de seguridad. No migrar todos los CRUD a Functions ni duplicar servicios existentes correctos.
- `users/{uid}` es la fuente canónica de autorización. Rules protege Web SDK; **Admin SDK omite Rules**, por lo que cada callable privilegiada debe autorizar mediante Proxy y validar/transaccionar en servidor.
- Web SDK no puede escribir `rutinas` ni `alumnos.rutinaActivaId`. Las consultas usan filtros e índices compatibles: Rules no filtra consultas amplias.
- Asignación de profesor y edición institucional pueden usar transacciones Web SDK + Rules completas. Si no puede demostrarse su protección, acordar callable manteniendo contrato. El cliente no elige una vía alternativa para eludir una denegación.
- Auth y Firestore no comparten una transacción: aprovisionamiento con reserva idempotente, Auth inicialmente deshabilitado, revalidación, perfil/ficha, habilitación y compensación/recuperación. No dejar cuenta huérfana habilitada ni borrar cuenta ajena por coincidencia de email. Primer administrador mediante bootstrap separado del registro público. Rules no impide por sí sola crear una identidad Auth por API pública: sin perfil activo aprovisionado esa identidad no obtiene acceso. Desactivación bloquea datos en Firestore antes de sincronizar Auth; fallo de Auth queda recuperable.

## 3. Modelo canónico de FB-001

Esquemas destino, no afirmación de datos ya migrados. `uid` = Firebase Auth UID; `users` y `alumnos` nuevos usan ese UID como documento. Referencias por IDs, nunca nombres. Fechas de auditoría: `Timestamp` de servidor. Campos de autoridad no se toman libremente de payloads.

```text
users/{uid} = {
  uid: string, nombre: string, email: string, telefono: string,
  rol: 'admin'|'recepcionista'|'profesor'|'alumno',
  sedeIds: string[], activo: boolean,
  createdAt: Timestamp, updatedAt: Timestamp
}

alumnos/{uid} = {
  userId: string, sedeId: 'moreno'|'edison', profesorId: string|null,
  dni: string, fechaNacimiento: string|null, fechaIngreso: string,
  direccion: string, observaciones: string, rutinaActivaId: string|null,
  createdAt: Timestamp, updatedAt: Timestamp, updatedBy: string
}

rutinas/{rutinaId} = {
  alumnoId: string, sedeId: string, autorId: string,
  estado: 'activa'|'historica', version: integer >= 1,
  nombre: string, objetivo: string,
  semanas: [{ id: string, nombre: string, dias: [{
    id: string, nombre: string, etapas: {
      'Movilidad': EjercicioSnapshot[],
      'Activación': EjercicioSnapshot[],
      'Central': EjercicioSnapshot[]
    }
  }] }],
  plantillaOrigenId: string|null,
  createdAt: Timestamp, updatedAt: Timestamp, archivedAt: Timestamp|null
}

EjercicioSnapshot = {
  id: string, ejercicioId: string|null, nombre: string,
  zonaMuscular: string, series: string, repeticiones: string,
  peso: string, observacion: string
}

institucional/publico = {
  sedes: [{ id, nombre, direccion, horarios: string[], modalidades: string[] }],
  planes: [{ id, sedeId, nombre, descripcion, precios: { ... } }],
  promociones: [ ... ], preguntasFrecuentes: [ ... ],
  version: integer >= 1, updatedAt: Timestamp, updatedBy: string
}
```

- `users`: identidad, nombre, email, teléfono, rol, actividad y sedes. Admin global puede tener `sedeIds=[]`; recepción y alumno exactamente una sede; profesor una o dos, sin acceso automático a todos sus alumnos. Sede de alumno coincide con ficha. Email debe concordar con Auth; cambios centralizados con recuperación.
- `alumnos`: ficha y profesor **actual**; `userId` coincide con documento/UID; el puntero refiere a la única activa de ese mismo alumno o es null. No mantener contenido de rutina duplicado como fuente editable.
- `rutinas`: ID propio por asignación; `autorId`, `alumnoId`, `sedeId` (snapshot de asignación) y `createdAt` inmutables. Acceso del profesor deriva de asignación/sede actuales, no del autor ni sede histórica. Series/repeticiones/peso siguen siendo strings; validar formato, magnitudes, longitudes y límites de estructura. `observacion` es singular; conservar acentos de etapas.
- Snapshots de ejercicios/plantillas no cambian al editar la biblioteca. `ejercicios`, `rutinasGenericas` y `zonasMusculares` se conservan con propiedad/visibilidad/validación existentes revisadas; plantilla no es historial. `stockItems`/`stockMovimientos` fuera de alcance.
- Institucional: fuente pública única para landing/bot, versionada, sin privados, secretos ni contactos personales no aprobados. Solo admin edita. Precios, horarios, actividades y contactos deben ser aprobados por el gimnasio; no inferir vigencia de constantes. `updatedBy` público no debe exponer identidad administrativa privada; definir metadatos públicos seguros y auditoría privada al concretar el DTO. Los `...` son campos aún por concretar, **no permiso para aceptar datos arbitrarios**; FB-016 acuerda DTO/validadores antes de integrar consumidores.
- DNI privado, validado y nunca ID de documento. No exigir unicidad global sin cambio formal de alcance. Alta por email respeta unicidad Auth; fichas por UID evitan duplicación de identidad.

## 4. Permisos e integridad de cuentas

Denegar por defecto. Toda operación privada exige identidad válida, `activo=true`, rol y relación/sede actuales. Excepción acotada: lectura del estado mínimo propio para explicar bloqueo de sesión. Un token vigente no habilita a un inactivo.

| Operación | Admin | Recepción | Profesor | Alumno / visitante |
|---|---|---|---|---|
| Usuarios: consultar/editar/activar | Todas las sedes, campos autorizados | Solo alumnos de su sede | Sin gestión general | Sin gestión general |
| Alta | Roles autorizados, incluido admin adicional | Solo alumno de su sede | No | No |
| Consultar ficha | Todas | Solo su sede | Solo asignados | Alumno propia; visitante no |
| Asignar/reasignar profesor | Sí, con controles | Solo su sede | No | No |
| Trasladar sede/cambiar rol | Sí, operación privilegiada | No | No | No |
| Crear/editar activa | No | No | Solo asignados vigentes | No |
| Leer activa/historia | No por defecto | No | Solo asignados vigentes | Alumno propia; visitante no |
| Mutar/reactivar/borrar histórica | No | No | No | No |
| Biblioteca/plantillas | Según permisos existentes revisados | No | Solo contenido permitido | No |
| Leer institucional/consultar IA | Sí | Sí | Sí | Sí, visitante incluido |
| Editar institucional | Sí | No | No | No |

- Recepción lee perfiles **mínimos** de profesores de su sede para asignar, no todos sus privados. Profesor de destino debe existir, estar activo, tener rol profesor y sede habilitada. Alumno nunca modifica rol/sede/profesor/rutina.
- Reasignación válida: profesor anterior pierde lectura/edición; nuevo accede a activa e historial; autoría e historia no cambian. Operación transaccional y Rules validan actor, alumno, profesor, referencias y campos finales, no solo UI.
- Traslado por admin conserva rutinas y deja `profesorId=null` atómicamente; alumno conserva acceso, profesores no editan hasta nueva asignación válida en destino.
- Desactivar profesor revoca permisos y deja asignaciones pendientes de reasignar, con aviso al personal, sin pérdida de rutinas. Desactivar usuario no borra datos ya descargados, pero deniega nuevos accesos privados.
- Cambio de rol de alumno preserva ficha/historia y desactiva relaciones incompatibles; rechazar con `failed-precondition` si no puede mantener integridad. Inactivar = `activo=false`, no `eliminado`; bajas legales/eliminaciones físicas son procesos excepcionales autorizados. Impedir quedar sin admin activo.
- No confiar en aliases ni permisos enviados por cliente; permitir solo campos explícitos. Perfil ausente no concede permisos. UI observa cambios de perfil, invalida operaciones nuevas y evita conservar datos/permisos de sesión anterior.

## 5. Rutinas, transacciones y patrones

`Sin rutina → asignar R1 → R1 activa`; `editar activa → misma identidad, version+1`; `asignar R2 → R1 histórica + R2 activa`; histórica solo permite consulta. No existe borrador persistente: el editor incompleto es local. Editar la activa no crea historial de cada pulsación.

Callable de asignación: dentro de la transacción leer actor/perfil, ficha, asignación/puntero y registro de operación; revalidar permisos actuales; archivar anterior, crear ID nuevo y cambiar puntero/registro idempotente **atómicamente**. Nunca dos activas, incluso con solicitudes concurrentes. Callable de edición: exige activa apuntada, alumno y profesor vigentes y `expectedVersion`; incrementa versión, rechaza conflictos con `aborted`. Reasignación o revocación concurrente invalida autorización obsoleta; leer las referencias relevantes dentro de la transacción para detectar cambios. Una operación legítimamente confirmada antes de una revocación no se invalida retroactivamente. No ejecutar Auth, correo o IA dentro de callbacks transaccionales reintentables. Una transacción cliente por sí sola no protege frente a escrituras maliciosas.

`operationId` único identifica un intento lógico; reintentar conserva el primer resultado, no crea otra rutina. No reutilizarlo para una nueva intención. Históricas no cambian contenido, estado o identificadores; no inventar historia que el código anterior haya perdido.

**State:** `RoutineContext` selecciona `ActiveRoutineState` (`edit`, `archive`) o `HistoricalRoutineState` (`read`, rechaza mutaciones). Estado inicializable/consultable y transiciones se prueban en dominio/servidor, no mediante un booleano de UI. Servicio aplica State tras autorización y ejecuta transacción.

**Protection Proxy:** `ProtectedRoutineService`/`ProtectedAccountService` verifican identidad, cargan perfil activo, comprueban rol/sede/titularidad/asignación y operación/estado, y solo entonces delegan al repositorio transaccional. Revalidación consistente con la transacción; respuesta DTO segura y registro mínimo sin secretos. Handlers no pueden saltar el Proxy. Matriz y casos de prueba comunes mantienen coherencia entre helpers Rules y autorización de Functions; no fingir que ambos ejecutan el mismo código. App Check es control adicional, no sustituto del permiso. Pruebas deben demostrar que una denegación no alcanza el repositorio.

## 6. Contratos de servicios

Rutas destino bajo `src/services/`; comprobar su existencia antes de implementar. IDs son strings UID/docID. `UserProfile` representa el perfil autorizado; `StudentDetail` compone perfil/ficha; summaries y demás DTO exponen solo campos permitidos. Timestamps Firestore se convierten consistentemente para UI/callables. Acordar validadores y formatos antes de integrar; no inventar campos faltantes por módulo. Los `subscribe...` liberan listeners y distinguen carga/vacío/error. Ningún error devuelve datos demo.

```text
sessionService.js
  getCurrentProfile() -> UserProfile|null
  subscribeCurrentProfile(onChange) -> unsubscribe

usersService.js
  createUserAccount({nombre,email,telefono,rol,sedeIds,...}) -> {uid}
  updateUser({uid,cambiosPermitidos,expectedVersion?}) -> {uid,...perfilActualizado}
  setUserActive({uid,activo}) -> {uid,activo}
  getUserById(uid) -> UserProfile permitido
  listUsersByScope(filtrosAutorizados) -> UserProfile[] permitido

studentsService.js
  getStudent(uid) -> StudentDetail permitido
  listStudentsBySede(sedeId) -> StudentSummary[] (admin/recepción)
  listAssignedStudents(profesorUid,sedeId) -> StudentSummary[] (profesor actual)
  updateStudent({alumnoId,cambiosPermitidos}) -> StudentDetail
  assignProfessor({alumnoId,profesorId}) -> {alumnoId,profesorId}
  transferStudent({alumnoId,destinoSedeId}) -> StudentDetail (admin)

routinesService.js
  createAssignedRoutine({alumnoId,nombre,objetivo,semanas,plantillaOrigenId?,operationId})
    -> {rutinaId,estado:'activa',version:1,anteriorArchivadaId:string|null}
  updateActiveRoutine({alumnoId,rutinaId,expectedVersion,nombre,objetivo,semanas,operationId})
    -> {rutinaId,estado:'activa',version:integer}
  getActiveRoutine(alumnoId) -> Routine|null
  subscribeActiveRoutine(alumnoId,onChange) -> unsubscribe
  listRoutineHistory(alumnoId) -> RoutineSummary[]
  getRoutineById(rutinaId) -> Routine permitido

libraryService.js
  listAvailableExercises({sedeId?}) -> Exercise[]
  createOrUpdateExercise(payload) -> Exercise
  listOwnTemplates() -> Template[]
  createOrUpdateTemplate(payload) -> Template

institutionalService.js
  getPublicInstitutionalInfo() -> InstitutionalInfo
  subscribePublicInstitutionalInfo(onChange) -> unsubscribe
  updateInstitutionalInfo({cambiosPermitidos,expectedVersion}) -> {version,updatedAt}

chatService.js
  askInstitutionalQuestion({sedeId,pregunta})
    -> {respuesta,fuenteVersion,requiereAtencionHumana:boolean}
```

Altas, estado y cambios privilegiados de usuarios: callable; edición simple solo con allowlist/Rules seguras. Traslado: operación privilegiada. Crear/editar rutinas: callable; lecturas: Web SDK autorizado, get y list restringidos. Biblioteca: conservar CRUD Web SDK. Institucional: lectura pública y escritura admin versionada mediante Rules o callable justificada. La capa de servicios no convierte un ID conocido en permiso.

**Precisión pendiente del contrato, no funcionalidad nueva:** FB-015 exige control de versión de asignación, pero la firma original `assignProfessor` y el esquema `alumnos` no nombran ese campo; FB-007 menciona comparar versión/intención al asignar, sin definir token en su DTO. Antes de implementar esos controles, Ulises/Lautaro acuerdan con Juan Pablo el campo/token y actualizan aquí firma, esquema y pruebas. No agregar un `version` ambiguo ni eliminar la protección contra concurrencia. `expectedVersion?` de cuentas requiere la misma definición si se utiliza. Estas decisiones no bloquean wrappers puros ni autorizan escrituras hasta resolverlas.

Errores comunes: `unauthenticated` (sin sesión), `permission-denied` (permiso insuficiente), `invalid-argument` (payload), `not-found` (referencia ausente), `failed-precondition` (relación/estado inválido), `already-exists` (duplicado), `aborted` (conflicto), `unavailable` (dependencia caída), `deadline-exceeded` (timeout). UI traduce mensajes sin ocultar causas ni repetir operaciones a ciegas. Passwords solo en flujo Auth seguro, nunca Firestore/logs.

### Chatbot y Functions de IA

Arevalito usa IA real mediante callable pública para visitante y autenticado, con validación de sede/pregunta/longitud, límites de abuso, tokens/costo, App Check cuando se configure, timeout y tratamiento de fallos. Clave privada solo en servidor/Secret Manager; jamás en Vite. Proveedor, región, cuotas, presupuesto y activación de servicios requieren decisión/autorización.

Contexto solo de `institucional/publico` aprobado y versionado. No enviar perfiles, rutinas, DNI, tokens personales ni otros privados al proveedor. Pregunta o prompt no elige colecciones ni amplía permisos. No registrar preguntas con posibles datos personales; usar metadatos mínimos/redactados. Los límites se aplican en servidor, sin confiar en identificadores del visitante; presupuesto y límites del proveedor se acuerdan antes de usarlo. Rechazar consultas fuera de alcance, no generar rutinas ni inventar información faltante; derivar a atención humana cuando corresponda. Al cambiar sede no mezclar respuestas. El widget conserva su diseño, evita doble envío y muestra carga/error/cancelación; un fallback ficticio no oculta un fallo. Medir RNF-04 real; una respuesta de error controlada no acredita calidad ni latencia de respuesta útil.

## 7. Compatibilidad, pruebas y restricciones

- Conservar los datos existentes. Aliases `role`, `active`, `sedes`, `sede` solo sirven a lectura de compatibilidad/migración; nunca fuente alternativa de permisos. `rutinas/{alumnoId}`, `rutinaEstructura`, `rutinaNombre`, `rutinaId` incrustados son legacy, no segunda fuente editable. Ficha ausente se informa, no se crea/repara al montar listeners.
- Reparación explícita: análisis/dry-run, registros de inconsistencias, respaldo, idempotencia, reversión y autorización antes de escribir. No inventar históricos perdidos ni borrar datos de una tercera sede; revisar compatibilidad primero. No rediseñar interfaces ni ampliar módulos opcionales.
- **No abrir Admin/Recepción contra datos valiosos antes de corregir y revisar FB-011**: riesgo de sobrescritura desde listeners. Revisar en HEAD otros riesgos antes de probar: permisos de inactivos/roles/referencias, sobrescritura de rutinas, sesión obsoleta, altas parciales y datos duplicados.
- Flujo elegido **sin emuladores**. Tests unitarios/contratos con dobles y datos sintéticos sin red; no usar datos reales como fixtures. `animappv1` es remoto compartido, no sandbox. `.env`, secretos, configuración/dependencias y archivos locales ajenos no se incorporan por accidente.
- Sin autorización específica: no escrituras de prueba, seed/reset, altas de prueba, borrados, migraciones, cambios remotos de Rules/Auth/Functions/Hosting, despliegues ni facturación. No consultar privados sin autorización. Programar archivos no equivale a desplegarlos; commit/push tampoco autoriza esos efectos.
- Validación real requiere acordar entorno/cuentas/documentos sintéticos aislados, operaciones exactas, responsable, respaldo/reversión y autorización. Si no existe una vía segura, registrar bloqueo; no declarar verificados Rules, concurrencia, Auth+Firestore o IA a partir de mocks/build/lint.
- Pruebas negativas obligatorias: alumno A contra B; profesor no asignado; recepción de otra sede; inactivo con token; autoescalado rol/sede/asignación; mutación/borrado de histórica; escritura directa SDK de rutina/puntero; visitante a privados; prompt injection/exposición IA. Positivas autorizadas también deben pasar; probar carreras, reintentos, fallos parciales y cambios de permisos durante operaciones.

Decisiones externas pendientes: conformidad académica BaaS/NoSQL, contenido institucional aprobado, proveedor IA/infraestructura/costos/App Check, protocolo de integración remota y disponibilidad del equipo. Las políticas de permisos y preservación de FB-001 ya fijadas aquí no se reabren como si fueran opcionales. Ver [plan](PLAN_DESARROLLO.md) para responsables, secuencia y cierre con evidencia.
