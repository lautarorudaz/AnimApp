# ANIMAPP — DECISIONES DEL EQUIPO R3

**Versión:** R3.0 | **Fecha:** 13/11/2026 | **Tipo:** decisiones operativas posteriores al plan R2.
**Estado:** decisiones comunicadas por Juan Pablo, pendientes de ratificación expresa de Ulises y Lautaro. No hay constancia de aprobación de la cátedra.

## 1. Por qué existe este documento

R2 es el diagnóstico y plan técnico de Codex (12/11/2026), basado en Firebase BaaS, 33 tareas, emuladores como prerequisito y ramas/PR. R3 es el conjunto de decisiones posteriores del equipo: mantener el contrato FB-001, no utilizar FB-002/003 como modalidad de trabajo e integrar directamente en GitHub `main`. **R3 no es una tarea FB ni una versión del código.** Es la versión de los acuerdos de trabajo.

Este archivo evita interpretar recomendaciones históricas de la auditoría R2 como órdenes vigentes de ejecución.

## 2. Decisiones adoptadas

1. **FB-001**: contrato técnico obligatorio para React/Vite + Firebase Authentication, Firestore Web SDK, Security Rules, Cloud Functions callable acotadas, Hosting en despliegue autorizado. Firestore es NoSQL. No se desarrolla backend Express general ni API REST propia.
2. **FB-002/FB-003**: no son prerequisitos ni tareas activas de la modalidad de trabajo. FB-003 fue realizada en una copia local en una sesión anterior, con 63 pruebas de aislamiento informadas; no se presupone integrada a `main` ni se incorporará inadvertidamente. No obliga a compañeros a instalar emuladores.
3. **Firebase**: Ulises y Lautaro desarrollarán con configuración habitual de `animappv1` (proyecto REMOTO y compartido). Esto no autoriza a ejecutar pruebas de escritura arbitraria sobre datos existentes; nadie presupone que su rama/copia de código aísla datos. Juan Pablo puede usar dobles locales de prueba.
4. **GitHub**: los tres trabajarán directamente sobre `main` mediante commits y push propios. Sin branches ni Pull Requests en el flujo adoptado. Deben sincronizar, asignar archivos, revisar diff, probar antes de push, verificar automatizaciones de deploy y detenerse ante conflictos.
5. **Tareas**: conservar IDs FB del R2 para trazabilidad. FB-001 = definida documentalmente; FB-002/003 = fuera de la modalidad, no 'implementadas en main'; FB-004..FB-033 = 30 tareas del backlog activo. El cierre operativo de FB-001 requiere además ratificación del equipo; aprobación docente es trámite externo pendiente.
6. **Autoría**: cada miembro escribe/revisa sus contribuciones y hace commits usando su identidad real de GitHub. Codex puede hacer commit y push en `main` para su tarea después de pasar controles, sin autoría ficticia.

## 3. Qué NO cambia

- Los 16 RF y cuatro RNF.
- Roles: admin, recepcionista, profesor, alumno; visitante para institucional/chat.
- Dos sedes canónicas: Moreno y Edison.
- Cada alumno tiene a lo sumo una rutina activa y su historial es inmutable desde operaciones ordinarias.
- Reasignar profesor no elimina historia; profesor anterior pierde acceso a ese alumno.
- La seguridad no se confía al frontend: Rules controla Web SDK; Cloud Functions con Admin SDK se autorizan en su propio Proxy.
- Arevalito usará IA real con contenido institucional aprobado, sin acceso a perfiles/rutinas privadas.
- Patrones State y Protection Proxy deben ser demostrables en código/pruebas.
- El proyecto académico original incluía Express/REST/estructura relacional: **la cátedra todavía debe aceptar el cambio a BaaS/NoSQL**.

## 4. Prioridad y jerarquía documental

Para evitar contradicciones, en caso de discrepancia:

1. `DECISIONES_EQUIPO_R3.md`: modalidad de Git, entorno, decisiones posteriores, puertas de seguridad.
2. `FB-001_ARQUITECTURA_Y_CONTRATOS.txt` versión 1.1 R3: definiciones de dominio, permisos, DTO y fronteras técnicas.
3. `PLAN_FINALIZACION_TFI.md` R3: tareas activas, secuencias, dependencias, criterios de aceptación.
4. `AUDITORIA_TFI.md` R2 con portada R3: evidencia histórica del código 398e42d; **no describe necesariamente la versión actual de GitHub**.

Ningún documento autoriza eliminar datos, desplegar reglas/Functions, modificar facturación, habilitar Blaze, importar datos reales a fixtures, ni publicar cambios a Firebase por el solo hecho de aceptar trabajo en main.

## 5. Política de desarrollo y verificación sin emuladores

- **Se puede programar** lógica, UI, validadores, Rules, Functions y ejecutar build, lint, pruebas unitarias sin red y dobles de repositorio.
- **No se puede acreditar** el comportamiento real de Firestore Security Rules, concurrencia distribuida, permisos remotos, aprovisionamiento Auth/Firestore, IA remota ni los tiempos RNF-04 solo mediante mocks, lint o build.
- Para tests de integración, acordar previamente cuentas de prueba, documentos identificados, listado exacto de operaciones, responsable, respaldos pertinentes, reversión y autorización; preferir un proyecto Firebase separado si fuese aceptado por el equipo. No crear ni borrar usuarios reales para experimentar.
- Hasta ese acuerdo: **validación remota PENDIENTE**. No marcar Hecho una tarea cuyo criterio de aceptación requiera una prueba no realizada.
- **FB-011 primero:** la auditoría señala listeners de Admin/Recepción que podrían sobrescribir fichas (`H-04`). No abrir dichos paneles contra documentos valiosos de `animappv1` antes de corregirlo y revisar la corrección.
- Git push no hace automáticamente deploy salvo que existan automatizaciones: revisar `.github/workflows`, integración Firebase/GitHub y cualquier pipeline antes del primer push.
- Cambios de `firestore.rules`, `firestore.indexes.json`, `functions/`, Firebase Auth admin, migraciones, Hosting, secretos o costos deben revisarse y desplegarse solo en una ventana autorizada. **Permiso de commit/push NO es permiso de despliegue.**

## 6. Distribución definitiva de superficies de trabajo

**Ulises:** FB-011..FB-019 y FB-032; admin/recepción, cuentas, asignaciones, institución, AuthContext/ProtectedRoute/Login, documentación.

**Lautaro:** FB-004..FB-010, FB-031 y FB-033; `firestore.rules`, índices, configuración, dependencias, Functions base/seguridad/rutinas, dominio State, CI, despliegue.

**Juan Pablo:** FB-020..FB-030; servicios/adaptadores, AlumnoDashboard, RoutineWorkspace, Arevalito/Functions chat, Landing, App.jsx, CSS global, E2E y demo.

Toda modificación de contrato compartido se conversa antes; el dueño del archivo coordina los cambios de entrada, exports o dependencias.

## 7. Reglas para trabajar DIRECTAMENTE en main

1. Un trabajo por vez por copia local, sin mezclar tareas. Cada miembro puede estar en una tarea distinta.
2. Antes de empezar: `git status --short`, `git branch --show-current`, `git fetch origin`, y solo si el árbol está limpio, `git pull --ff-only origin main`.
3. No descartar cambios locales anteriores, especialmente archivos FB-003 que pudieran existir en una sola computadora. Si está sucio, detenerse y resolver su procedencia conscientemente.
4. Codex modifica solo archivos propios o archivos compartidos previamente coordinados. Cada tarea requiere resultado técnico, pruebas reproducibles y reporte de limitaciones.
5. Antes de commit: `git diff --check`, revisar staging y secretos, y correr verificaciones que no afecten nube.
6. Antes de push: revisar si `main` avanzó. Si hay commits ajenos nuevos, integrarlos sin pisar nada y **repetir las pruebas relevantes**. Si aparecen conflictos no triviales, DETENERSE y coordinar.
7. No usar `git push --force`, `reset --hard`, `checkout --theirs/--ours` global ni borrado masivo de archivos. Nunca borrar el trabajo de otra persona para hacer que compile.
8. Codex tiene permiso de hacer commit y `git push origin main` **solo cuando estén satisfechos estos controles**. Si hay pipeline de despliegue automático vinculado a main, necesita autorización de release antes de hacer push.
9. Comentar en `docs/tfi/progreso/FB-XXX.md` el estado y evidencia de su tarea; usar archivo propio por tarea para evitar conflictos frecuentes.
10. Al concluir, informar: responsable, tarea y estado real, archivos, pruebas ejecutadas, hash, push confirmado o bloqueado y **quién puede ejecutar qué tarea siguiente**, según dependencias observadas, nunca supuestas.

## 8. Decisiones pendientes que no se deben inventar

- Ratificación de Ulises/Lautaro y aceptación de la cátedra para Firebase BaaS/NoSQL y los patrones.
- Protocolo de pruebas remotas seguras sobre datos aislados o entorno alternativo.
- Política concreta sobre email, DNI único, último admin, traslados de sede, alcance administrativo y datos legacy.
- Proveedor de IA, región de Functions, Blaze/facturación, App Check, cuotas, presupuesto y autorización de despliegue.
- Disponibilidad semanal del equipo, datos institucionales aprobados y evidencias finales de 16 RF/4 RNF.

**Este archivo es una decisión de trabajo y una instrucción para Codex, no evidencia de que el software haya implementado esas decisiones.**
