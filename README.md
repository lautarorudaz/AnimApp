
# AnimApp

Aplicación React + Vite con Firebase Authentication y Cloud Firestore. La landing se conserva; los paneles de profesor, alumno y administración usan datos persistentes.

## Ejecutar

```powershell
npm install
npm run dev
```

La configuración se toma de las variables `VITE_FIREBASE_*` ya previstas en `.env.local`. Habilitar el proveedor **Email/Password** en Firebase Authentication. No se guardan contraseñas en Firestore.

## Flujo de trabajo

1. El administrador inicia sesión en `/admin`, crea profesores y alumnos, habilita sus sedes y asigna el profesor correspondiente en cada sede. Crear una cuenta no cierra la sesión del administrador.
2. Una cuenta de alumno puede tener una ficha por sede, con un profesor diferente en cada una. «Vincular cuenta existente» permite usar perfiles de alumnos ya presentes en `users` o agregar una sede. La interfaz evita duplicar la misma cuenta y sede.
3. El profesor ve solo alumnos con su UID en `profesorId` y de su sede activa. Puede editar nombre, DNI, teléfono y objetivo; las cuentas, el correo de acceso, las sedes y las asignaciones son responsabilidad del administrador.
4. El editor permite crear, renombrar, duplicar y eliminar semanas y días; cada día tiene movilidad, activación y parte central. Los ejercicios se eligen de la biblioteca y se pueden quitar o reordenar. Se indican series, repeticiones o duración, peso, descanso opcional y aclaraciones opcionales.
5. «Guardar borrador» conserva un plan editable privado. «Publicar rutina» guarda una versión nueva y cambia la rutina activa en una transacción. Los cambios sin publicar no afectan la vista del alumno. Las publicaciones anteriores se conservan. Las fichas pendientes de cuenta de acceso admiten borradores; para publicar deben tener `userId` vinculado.
6. El alumno consulta su rutina por semana, día y etapa, con selector de sede e historial. No puede modificar el plan.
7. Dar de baja una ficha no elimina datos ni la cuenta de Authentication. Impide nuevas rutinas para esa ficha; el alumno puede seguir consultando publicaciones anteriores. Solo el administrador puede reactivarla.

Se advierte antes de salir del editor con cambios sin guardar. Los guardados tienen control de revisión: una pestaña desactualizada no pisa silenciosamente los cambios de otra.

## Datos existentes y biblioteca

**No se ejecutó ninguna migración ni se modificaron documentos del proyecto real durante el desarrollo.** Se verificó el esquema de la biblioteca existente y se desplegaron reglas e índices compatibles el 18/11/2026. No hay carga automática de ejercicios de ejemplo.

### `users/{uid}`

`nombre`, `email`, `rol` (`admin`, `profesor`, `alumno`, `recepcionista`), `sedes` (lista de IDs) y `activo` (booleano). Los IDs de sede actuales son `moreno`, `edison` y `general-san-martin`. El ID del documento debe coincidir con el UID de Authentication. El primer administrador debe existir previamente, con `rol: "admin"` y `activo: true`.

### `alumnos/{id}`

`userId` (UID de la cuenta del alumno), `profesorId` (UID del profesor asignado), `sedeId`, `nombre`, `email`, `dni`, `telefono`, `objetivo`, `activo`, `estado` y, después de publicar, `rutinaActivaId`.

Si los datos antiguos usan otro nombre para el vínculo al profesor o guardan alumnos únicamente en `users`, deben adaptarse o vincularse antes de usar el panel. No se intenta adivinar asignaciones a partir de nombres o correos. El formulario del profesor conserva los campos existentes que no edita.

### `ejercicios/{id}`

La biblioteca se lee de la colección existente `ejercicios`:

| Campo | Alternativas admitidas | Uso |
| --- | --- | --- |
| `nombre` | `name` | Nombre visible del ejercicio |
| `zonaMuscular` | `zonaMuscularNombre`, `grupoMuscular`, `categoria`, `category` | Zona muscular y filtro de biblioteca |
| `etapa` | `stage` | `movilidad`, `activacion` o `central` |
| `videoUrl` | `video`, `url` | Enlace opcional a demostración |
| `activo` | — | Si es `false`, no aparece en la biblioteca |
| `profesorId` | — | UID del autor |
| `privado` | — | `true`: solo autor y administrador; `false`: disponible para profesores |

Al incorporar un ejercicio al plan se copian su nombre y enlace, conservando `ejercicioId`. Las futuras modificaciones de la biblioteca no alteran publicaciones anteriores. El catálogo se administra desde **Ejercicios**. Los videos nuevos deben ser enlaces válidos de YouTube; se admiten `watch`, `youtu.be`, `shorts`, `live` y `embed`. El reproductor se carga al pulsar «Ver video», con opción de abrir YouTube en otra pestaña.

### Menú del profesor y rutinas genéricas

- `/profesor`: **Alumnos**, con tarjetas horizontales en escritorio y adaptación para celular. «Asignar genérica» permite elegir una plantilla propia o compartida.
- `/profesor/rutinas`: **Rutinas**, biblioteca de planes reutilizables con búsqueda y filtros. Los profesores pueden crear, editar, duplicar, consultar, eliminar y asignar sus planes. Los planes de otros profesores se pueden consultar y duplicar, pero solo el autor y el administrador pueden editar el original.
- `/profesor/ejercicios`: **Ejercicios**, catálogo en tarjetas con filtros por zona muscular, etapa y autor. Las zonas habituales están precargadas como opciones y se puede escribir una nueva; también se leen zonas personalizadas existentes en `zonasMusculares`.

`rutinasGenericas/{id}` almacena el plan completo, `profesorId`, `autorNombre`, `privado`, `compartida`, `revision` y fechas. El permiso de lectura se basa en el autor o en `privado: false`. Las nuevas plantillas son privadas por defecto; «Compartir con otros profesores» sincroniza `privado` y `compartida`.

Asignar crea una copia independiente en el borrador del alumno; se puede publicar en la misma operación o dejarla pendiente de adaptación. Se comprueban la asignación del alumno, sede, estado activo, revisión del borrador y acceso actual a la plantilla. No cambia el profesor asignado al alumno. Editar o eliminar una plantilla o ejercicio no modifica las copias ya asignadas. Las eliminaciones del catálogo son bajas lógicas (`activo: false`).

### Rutinas

`rutinasBorradores/{alumnoId}` contiene un borrador privado por ficha. `rutinas/{id}` contiene publicaciones, con `estado: "publicada"`, `alumnoId`, `alumnoUserId`, `profesorId`, `sedeId`, `revision`, `publicadoEn` y contenido del plan. `alumnos.rutinaActivaId` apunta a la versión actual. Las reglas impiden al profesor modificar o borrar publicaciones existentes y vincularlas con otro alumno.

El contenido usa `semanas[].dias[].etapas`, con las claves `movilidad`, `activacion` y `central`. Cada ejercicio conserva `nombre`, `series`, `repeticiones`, `peso`, `descanso` y `aclaraciones`. Las rutinas antiguas con `dias[].ejercicios` se pueden abrir en el editor: se interpretan como parte central, preservando `observaciones` como aclaraciones. Eso no las publica ni cambia su estado automáticamente.

## Reglas e índices

Las reglas e índices locales fueron probados y desplegados en **`animappv1` el 18/11/2026** para habilitar la biblioteca compartida y los borradores. Se preservaron los módulos de `zonasMusculares`, `rutinasGenericas`, stock y los permisos de compatibilidad para rutinas anteriores. Se guardó un respaldo previo de reglas en el directorio temporal del sistema (`animappv1-rules-before-libraries.json`). Para futuros despliegues, con la Firebase CLI autenticada y el ID del proyecto correcto:

```powershell
firebase deploy --only firestore:rules,firestore:indexes --project TU_PROJECT_ID
```

La cuenta de Firebase que ejecute este comando debe tener permiso de despliegue. Esperar a que los índices terminen de crearse antes de verificar consultas. No usar el ID `demo-animapp` para producción.

Referencias: [transacciones de Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions), [consultas y reglas de acceso](https://firebase.google.com/docs/firestore/security/rules-query) y [videos de YouTube](https://developers.google.com/youtube/player_parameters).

## Verificación local

```powershell
npm run lint
npm run build
npm test
npm run test:rules
npm run test:e2e
npm run test:integration
```

Las pruebas de reglas y navegador requieren Firebase CLI, Java compatible con el emulador y los puertos locales 8080/9099 disponibles. `test:integration` ejecuta ambas suites en una sola sesión de emuladores. La prueba de navegador usa Google Chrome instalado; se puede cambiar `channel` en `playwright.config.mjs` o instalar Chromium con Playwright. En Windows, si la CLI deja Java en ejecución al cerrar emuladores, verificar que el proceso corresponde al emulador `demo-animapp` antes de detenerlo para liberar 8080.

Los scripts de integración usan exclusivamente el proyecto ficticio `demo-animapp` y emuladores. `tests/start-vite.mjs` reemplaza la configuración Firebase por valores de prueba; no lee ni modifica credenciales reales. Las pruebas limpian solo el Firestore del emulador y crean cuentas de prueba en el emulador de Authentication. Las capturas quedan en `test-results/`, excluido del control de versiones.

Para usar manualmente emuladores, iniciar `firebase emulators:start --only auth,firestore --project demo-animapp` y el servidor de prueba `node tests/start-vite.mjs` en otra terminal. La aplicación de prueba se sirve en `http://127.0.0.1:5178`. La conexión al emulador solo se habilita en desarrollo con `VITE_USE_FIREBASE_EMULATORS=true`.

## Alcance

### Asistente informativo con Firebase AI Logic

La landing incluye un chat flotante con Gemini Developer API mediante `firebase/ai`. La implementación usa el proyecto Firebase existente, sin Cloud Functions ni servidor propio. No se cambia el plan de facturación desde el código. Para usar el nivel gratuito, el proyecto debe seguir en Spark, sin una cuenta de facturación vinculada, y respetar las cuotas del modelo elegido.

Configuración en `.env.local` (la clave de sitio es pública; no es la clave secreta de Gemini):

```dotenv
VITE_FIREBASE_APPCHECK_SITE_KEY=CLAVE_PUBLICA_DEL_SITIO
# Opcional; el valor predeterminado es gemini-3.5-flash-lite
VITE_GEMINI_MODEL=gemini-3.5-flash-lite
```

El modelo predeterminado figura con entrada y salida gratuitas en la tarifa Standard revisada el 20/11/2026. Verificar disponibilidad y cuotas del proyecto antes de cambiarlo. Referencias: [precios de Gemini](https://ai.google.dev/gemini-api/docs/pricing), [Firebase AI Logic](https://firebase.google.com/docs/ai-logic/get-started).

App Check se inicializa antes de Auth y Firestore cuando hay una clave de sitio. En desarrollo, exclusivamente en `localhost`, `127.0.0.1` o `[::1]`, usa el proveedor de depuración. En producción usa `ReCaptchaEnterpriseProvider`. El cliente de AI Logic solicita tokens de uso limitado. Las pruebas con emuladores omiten App Check y nunca deben llamar al modelo real.

Para completar la verificación local:

1. Habilitar Gemini Developer API dentro de Firebase AI Logic y registrar la aplicación web en App Check.
2. Guardar la clave pública del sitio en `.env.local` y reiniciar Vite si es necesario.
3. Abrir la aplicación en el navegador de uso habitual, abrir la consola con F12, recargar y buscar `App Check debug token`.
4. Copiar ese token privado directamente a Firebase → App Check → Aplicaciones → AnimApp → menú de tres puntos → Administrar tokens de depuración.
5. Recargar la aplicación y enviar una consulta desde el chat.

Cada navegador o computadora puede generar su propio token. No guardarlo en Git, en variables `VITE_*` ni compartirlo en capturas. Para un sitio publicado se autorizan sus dominios reales en reCAPTCHA; no se registra localhost como dominio de producción. Ver [proveedor de depuración](https://firebase.google.com/docs/app-check/web/debug-provider) y [protección de AI Logic](https://firebase.google.com/docs/ai-logic/app-check).

El asistente recibe solo una selección de los datos públicos de `SEDES` y `SEDE_INFO`: direcciones confirmadas, horarios, profesores y contactos. Omite imágenes y perfiles de ejemplo de GSM. Usa instrucciones para informar datos pendientes, limitar el tema a AnimApp y orientar a recepción; esas instrucciones no garantizan la exactitud de cada respuesta. No consulta Firestore ni accede a cuentas o rutinas privadas. Los mensajes quedan en memoria del componente y no se guardan en Firestore ni localStorage. Al enviar, Google procesa el contenido según las condiciones del nivel gratuito.

No hay solicitudes de generación automáticas al abrir el chat. La UI admite 600 caracteres por mensaje y envía hasta ocho mensajes anteriores; la salida se limita a 512 tokens. Hay una espera de seis segundos y un máximo local de 20 intentos por hora mientras la página permanece abierta, sin reintentos automáticos. Estos controles son de experiencia de usuario, se reinician al recargar y **no sustituyen las cuotas ni la protección del proveedor**.

Validación: `npm test` incluye pruebas de contexto público, historial y errores. `npx playwright test tests/e2e/assistant.spec.mjs` verifica la UI con el transporte de IA simulado, sin consumir cuota real. Eso no acredita una respuesta real de Gemini; la prueba real queda pendiente hasta registrar el token del navegador y enviar la primera consulta.

Recepción guarda las fichas de alumnos en Firestore y permite seleccionar profesores activos de la sede actual, editar asignaciones y dar de baja. Las fichas nuevas quedan pendientes de cuenta de acceso (`userId: ""`); el administrador puede crear la cuenta con el mismo correo y sede, o vincular una cuenta existente. Se reutiliza la ficha pendiente conservando su asignación y datos. El stock de recepción conserva el prototipo previo con datos en memoria.

La lista de profesores consulta `users` por `rol`, `activo` y `sedeIds`. Los profesores creados por administración incluyen tanto `sedes` como `sedeIds`. La aplicación valida que el profesor esté activo y pertenezca a la sede al guardar; las reglas locales también rechazan asignaciones a otra sede. Recepción no vincula cuentas de acceso ni cambia `userId` o la sede de una ficha existente.

Las reglas publicadas fueron comparadas con las locales después del despliegue de bibliotecas. Si se cambian permisos desde la consola, incorporar esos cambios antes de un futuro despliegue para no sobrescribirlos.

El administrador gestiona altas, fichas, asignaciones y reactivación de alumnos; la edición avanzada de cuentas de staff y el restablecimiento de contraseñas pueden realizarse desde Firebase. No se agregaron registros de entrenamiento, imágenes de ejercicios ni exportación PDF.
