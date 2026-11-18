import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

const password = 'TestAnimApp123!';
let environment;
const ids = {};

test.beforeAll(async () => {
  environment = await initializeTestEnvironment({ projectId: 'demo-animapp', firestore: { host: '127.0.0.1', port: 8080 } });
  await environment.clearFirestore();
  for (const role of ['admin', 'teacher', 'student', 'other', 'reception']) {
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${role}@animapp.test`, password, returnSecureToken: true })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    ids[role] = data.localId;
  }
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const role of Object.keys(ids)) {
      const rol = { teacher: 'profesor', other: 'profesor', student: 'alumno', admin: 'admin', reception: 'recepcionista' }[role];
      await setDoc(doc(db, 'users', ids[role]), { uid: ids[role], rol, nombre: { teacher: 'Profesor de prueba', student: 'Ana Prueba', other: 'Otro Profesor', admin: 'Administrador', reception: 'Recepción Prueba' }[role], email: `${role}@animapp.test`, sedes: ['moreno', 'edison'], sedeIds: ['moreno', 'edison'], activo: true });
    }
    await setDoc(doc(db, 'alumnos', 'ana'), { userId: ids.student, profesorId: ids.teacher, sedeId: 'moreno', nombre: 'Ana Prueba', email: 'student@animapp.test', dni: '12345678', objetivo: 'Fuerza', activo: true });
    await setDoc(doc(db, 'alumnos', 'other-pupil'), { userId: 'other-student', profesorId: ids.other, sedeId: 'moreno', nombre: 'Alumno ajeno', activo: true });
    await setDoc(doc(db, 'ejercicios', 'mobility'), { nombre: 'Movilidad de hombros', categoria: 'Movilidad', privado: false, profesorId: ids.teacher });
    await setDoc(doc(db, 'ejercicios', 'activation'), { nombre: 'Plancha', categoria: 'Core', privado: false, profesorId: ids.teacher });
    await setDoc(doc(db, 'ejercicios', 'press'), { nombre: 'Press banca', categoria: 'Pecho', privado: false, profesorId: ids.teacher });
    await setDoc(doc(db, 'users', 'edison-teacher'), { rol: 'profesor', nombre: 'Profesor solo Edison', sedes: ['edison'], sedeIds: ['edison'], activo: true });
    await setDoc(doc(db, 'users', 'inactive-teacher'), { rol: 'profesor', nombre: 'Profesor inactivo', sedes: ['moreno'], sedeIds: ['moreno'], activo: false });
  });
});
test.afterAll(async () => { await environment?.cleanup(); });

async function login(page, role) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(`${role}@animapp.test`);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Ingresar a Plataforma AnimApp' }).click();
  await expect(page).toHaveURL(new RegExp(`/${{ teacher: 'profesor', other: 'profesor', student: 'alumno', admin: 'admin', reception: 'recepcion' }[role]}$`));
}
async function addExercise(page, stage, name) {
  const section = page.locator('.training-stage-editor').filter({ has: page.getByRole('heading', { name: stage, exact: true }) });
  await section.getByRole('button', { name: 'Ejercicio', exact: true }).click();
  await section.getByRole('button').filter({ hasText: name }).click();
  await section.getByLabel('Series', { exact: true }).fill('3');
  await section.getByLabel('Reps / duración', { exact: true }).fill(stage === 'Parte central' ? '10' : '30 s');
  await section.getByLabel('Peso', { exact: true }).fill(stage === 'Parte central' ? '40 kg' : 'Sin carga');
}

test('professor drafts and publishes; student sees current routine and immutable history; admin assigns accounts', async ({ page, browser }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page, 'teacher');
  await expect(page.getByRole('heading', { name: 'Ana Prueba' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alumno ajeno' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear rutina', exact: true }).click();
  await page.getByLabel('Nombre de la rutina', { exact: true }).fill('Plan de fuerza');
  await addExercise(page, 'Movilidad', 'Movilidad de hombros');
  await addExercise(page, 'Activación', 'Plancha');
  await addExercise(page, 'Parte central', 'Press banca');
  await page.getByLabel('Aclaraciones (opcional)', { exact: true }).last().fill('Bajada controlada');
  await page.getByRole('button', { name: 'Duplicar día', exact: true }).click();
  await page.getByLabel('Nombre del día', { exact: true }).fill('Día 2 · Torso');
  await page.getByRole('button', { name: 'Duplicar semana', exact: true }).click();
  await page.getByLabel('Nombre de la semana', { exact: true }).fill('Semana 2');
  await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Borrador guardado');

  // Reopening loads the persisted draft; a stale second editor cannot overwrite it.
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: 'Crear rutina', exact: true }).click();
  await expect(page.getByLabel('Nombre de la rutina', { exact: true })).toHaveValue('Plan de fuerza');
  const secondTeacherContext = await browser.newContext();
  const secondTeacherPage = await secondTeacherContext.newPage();
  await login(secondTeacherPage, 'teacher');
  await secondTeacherPage.getByRole('button', { name: 'Crear rutina', exact: true }).click();
  await secondTeacherPage.getByLabel('Nombre de la rutina', { exact: true }).fill('Cambio desde otra pestaña');

  const studentContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const studentPage = await studentContext.newPage();
  await login(studentPage, 'student');
  await expect(studentPage.getByRole('heading', { name: 'Todavía no tenés una rutina activa' })).toBeVisible();

  await page.getByRole('button', { name: 'Vista del alumno', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Plan de fuerza', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Publicar rutina', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Rutina publicada');
  await secondTeacherPage.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await expect(secondTeacherPage.getByRole('alert')).toContainText('Otro editor actualizó el borrador');
  await expect(secondTeacherPage.getByLabel('Nombre de la rutina', { exact: true })).toHaveValue('Cambio desde otra pestaña');
  await secondTeacherContext.close();
  await expect(studentPage.getByRole('heading', { name: 'Plan de fuerza', exact: true })).toBeVisible();
  await expect(studentPage.getByRole('heading', { name: 'Press banca', exact: true })).toBeVisible();
  await expect(studentPage.getByText('Bajada controlada')).toBeVisible();
  await expect(studentPage.getByRole('button', { name: 'Guardar borrador' })).toHaveCount(0);
  expect(await studentPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await studentPage.screenshot({ path: 'test-results/alumno-mobile.png', fullPage: true });

  await page.getByRole('button', { name: 'Volver al editor', exact: true }).click();
  await page.getByLabel('Nombre de la rutina', { exact: true }).fill('Plan de fuerza · segunda versión');
  await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Borrador guardado');
  await studentPage.reload();
  await expect(studentPage.getByRole('heading', { name: 'Plan de fuerza', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Publicar rutina', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Rutina publicada');
  await expect(studentPage.getByRole('heading', { name: 'Plan de fuerza · segunda versión', exact: true })).toBeVisible();
  const options = await studentPage.getByLabel('Rutina e historial').locator('option').allTextContents();
  expect(options).toHaveLength(2);
  await studentPage.getByLabel('Rutina e historial').selectOption({ label: options.find((option) => option.startsWith('Anterior')) });
  await expect(studentPage.getByRole('heading', { name: 'Plan de fuerza', exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/profesor-editor-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: 'Editar alumno', exact: true }).click();
  await page.getByLabel('Teléfono', { exact: true }).fill('1122334455');
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Dar de baja', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar baja', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ana Prueba' })).toHaveCount(0);
  await page.getByLabel('Estado', { exact: true }).selectOption('baja');
  await expect(page.getByRole('heading', { name: 'Ana Prueba' })).toBeVisible();
  await expect(studentPage.getByRole('status')).toContainText('dada de baja');
  await expect(studentPage.getByRole('heading', { name: 'Plan de fuerza', exact: true })).toBeVisible();
  await studentContext.close();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();

  await login(page, 'admin');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByLabel('Rol', { exact: true }).selectOption('profesor');
  await page.getByLabel('Nombre completo', { exact: true }).fill('Profesora Nueva');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('new-teacher@animapp.test');
  await page.getByLabel('Contraseña inicial', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'Moreno', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Edison', exact: true }).check();
  await page.getByRole('dialog').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin$/);
  const card = page.locator('.training-card').filter({ has: page.getByRole('heading', { name: 'Ana Prueba', exact: true }) });
  await card.getByRole('button', { name: 'Asignar profesor' }).click();
  await page.getByLabel('Profesor asignado', { exact: true }).selectOption({ label: 'Profesora Nueva' });
  await page.getByRole('button', { name: 'Guardar asignación', exact: true }).click();
  await expect(card).toContainText('Profesora Nueva');

  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByLabel('Nombre completo', { exact: true }).fill('Alumno Nuevo');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('new-student@animapp.test');
  await page.getByLabel('Contraseña inicial', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'Moreno', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Edison', exact: true }).check();
  await page.getByLabel('Profesor · Moreno', { exact: true }).selectOption({ label: 'Profesora Nueva' });
  await page.getByLabel('Profesor · Edison', { exact: true }).selectOption({ label: 'Profesor de prueba' });
  await page.getByRole('dialog').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Alumno Nuevo', exact: true })).toHaveCount(2);
  await expect(page).toHaveURL(/\/admin$/);
  await environment.withSecurityRulesDisabled(async (context) => {
    const student = await getDoc(doc(context.firestore(), 'alumnos', 'ana'));
    expect(student.data().telefono).toBe('1122334455');
    expect(student.data().activo).toBe(false);
    expect(student.data().userId).toBe(ids.student);
  });
  await card.getByRole('button', { name: 'Reactivar alumno', exact: true }).click();
  await expect(card).toContainText('Alumno activo');
  expect(errors).toEqual([]);
});

test('reception chooses teachers by site and persists the assignment after reload', async ({ page }) => {
  await login(page, 'reception');
  await page.getByRole('button', { name: 'Nuevo alumno', exact: true }).click();
  const teachers = page.getByLabel('Profesor asignado', { exact: true });
  await expect(teachers).toBeEnabled();
  await expect(teachers.locator('option')).toContainText(['Sin asignar', 'Otro Profesor', 'Profesor de prueba', 'Profesora Nueva']);
  expect(await teachers.locator('option').allTextContents()).not.toContain('Profesor solo Edison');
  expect(await teachers.locator('option').allTextContents()).not.toContain('Profesor inactivo');
  await page.getByLabel('Nombre completo', { exact: true }).fill('Jorge Prueba');
  await page.getByLabel('DNI', { exact: true }).fill('20342564');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('jorge@animapp.test');
  await page.getByLabel('Teléfono', { exact: true }).fill('362477473');
  await teachers.selectOption({ label: 'Profesor de prueba' });
  await page.getByRole('button', { name: 'Guardar alumno', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  const row = page.getByRole('row').filter({ hasText: 'Jorge Prueba' });
  await expect(row).toContainText('Profesor de prueba');
  await row.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(teachers).toHaveValue(ids.teacher);
  await teachers.selectOption({ label: 'Profesora Nueva' });
  await page.getByRole('button', { name: 'Guardar alumno', exact: true }).click();
  await expect(row).toContainText('Profesora Nueva');
  await page.locator('.sede-switcher select').selectOption('edison');
  await expect(row).toHaveCount(0);
  await page.getByRole('button', { name: 'Nuevo alumno', exact: true }).click();
  await expect(teachers).toBeEnabled();
  expect(await teachers.locator('option').allTextContents()).toContain('Profesor solo Edison');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar sesion', exact: true }).click();
  await login(page, 'admin');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByLabel('Nombre completo', { exact: true }).fill('Jorge Prueba');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('jorge@animapp.test');
  await page.getByLabel('Contraseña inicial', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'Moreno', exact: true }).check();
  await page.getByRole('dialog').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Jorge Prueba', exact: true })).toHaveCount(1);
  await environment.withSecurityRulesDisabled(async (context) => {
    const rows = await getDocs(query(collection(context.firestore(), 'alumnos'), where('email', '==', 'jorge@animapp.test')));
    expect(rows.size).toBe(1);
    expect(rows.docs[0].data().userId).toBeTruthy();
    expect(rows.docs[0].data().dni).toBe('20342564');
    expect(rows.docs[0].data().profesorId).not.toBe(ids.teacher);
  });
});

test('exercise catalog, shared routine templates and independent student assignments work across teachers', async ({ page, browser }) => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'alumnos', 'library-pupil'), { nombre: 'Lucía Biblioteca', dni: '22334455', email: 'student@animapp.test', userId: ids.student, profesorId: ids.teacher, sedeId: 'moreno', activo: true });
  });
  await login(page, 'teacher');
  await page.setViewportSize({ width: 1600, height: 1000 });
  const pupilCard = page.locator('.training-student-row').filter({ hasText: 'Lucía Biblioteca' });
  await expect(pupilCard).toBeVisible();
  const bounds = await pupilCard.boundingBox();
  expect(bounds.width).toBeGreaterThan(bounds.height * 3);
  await page.screenshot({ path: 'test-results/alumnos-horizontal.png', fullPage: true });
  await page.getByRole('link', { name: 'Ejercicios', exact: true }).click();
  await expect(page).toHaveURL(/\/profesor\/ejercicios$/);
  await page.getByRole('button', { name: 'Nuevo ejercicio', exact: true }).click();
  await page.getByLabel('Nombre del ejercicio', { exact: true }).fill('Remo en polea');
  await page.getByRole('dialog').getByLabel('Zona muscular', { exact: true }).fill('Espalda');
  await page.getByRole('dialog').getByLabel('Etapa', { exact: true }).selectOption('central');
  await page.getByLabel('Video de YouTube (opcional)', { exact: true }).fill('https://youtu.be/M7lc1UVf-VE');
  await page.getByLabel('Descripción / técnica (opcional)', { exact: true }).fill('Mantener la espalda neutra.');
  await page.getByRole('button', { name: 'Guardar ejercicio', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Zona muscular', { exact: true }).selectOption('Espalda');
  await page.getByLabel('Etapa', { exact: true }).selectOption('central');
  await expect(page.getByRole('heading', { name: 'Remo en polea', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver video de Remo en polea', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/ejercicios-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Rutinas', exact: true }).click();
  await page.getByRole('button', { name: 'Nueva rutina', exact: true }).click();
  await page.getByLabel('Nombre de la rutina', { exact: true }).fill('Plan espalda reutilizable');
  await addExercise(page, 'Parte central', 'Remo en polea');
  await page.getByRole('button', { name: 'Guardar rutina genérica', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('privada guardada');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  const otherContext = await browser.newContext(); const otherPage = await otherContext.newPage();
  await login(otherPage, 'other');
  await otherPage.getByRole('link', { name: 'Rutinas', exact: true }).click();
  await expect(otherPage.getByRole('heading', { name: 'Plan espalda reutilizable', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Compartir con otros profesores' }).check();
  await page.getByRole('button', { name: 'Guardar rutina genérica', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('compartida');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(otherPage.getByRole('heading', { name: 'Plan espalda reutilizable', exact: true })).toBeVisible();
  await expect(otherPage.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Asignar a alumno', exact: true }).click();
  await page.getByLabel('Alumno · Moreno', { exact: true }).selectOption('library-pupil');
  await page.getByRole('button', { name: 'Asignar rutina', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const studentContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const studentPage = await studentContext.newPage(); await login(studentPage, 'student');
  await studentPage.getByLabel('Sede / ficha de alumno', { exact: true }).selectOption('library-pupil');
  await expect(studentPage.getByRole('heading', { name: 'Plan espalda reutilizable', exact: true })).toBeVisible();
  await expect(studentPage.getByRole('heading', { name: 'Remo en polea', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nombre de la rutina', { exact: true }).fill('Plan espalda actualizado');
  await page.getByRole('button', { name: 'Guardar rutina genérica', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('compartida');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await studentPage.reload();
  await studentPage.getByLabel('Sede / ficha de alumno', { exact: true }).selectOption('library-pupil');
  await expect(studentPage.getByRole('heading', { name: 'Plan espalda reutilizable', exact: true })).toBeVisible();
  await expect(otherPage.getByRole('heading', { name: 'Plan espalda actualizado', exact: true })).toBeVisible();
  await otherPage.getByRole('button', { name: 'Duplicar', exact: true }).click();
  await otherPage.getByLabel('Nombre de la rutina', { exact: true }).fill('Copia personal de espalda');
  await expect(otherPage.getByRole('checkbox', { name: 'Compartir con otros profesores' })).not.toBeChecked();
  await otherPage.getByRole('button', { name: 'Guardar rutina genérica', exact: true }).click();
  await expect(otherPage.getByRole('dialog').getByRole('status')).toContainText('privada guardada');
  await otherPage.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Copia personal de espalda', exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/rutinas-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Ejercicios', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/ejercicios-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Editar Remo en polea', exact: true }).click();
  await page.getByLabel('Nombre del ejercicio', { exact: true }).fill('Remo en polea con agarre neutro');
  await page.getByRole('button', { name: 'Guardar ejercicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Remo en polea con agarre neutro', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar Remo en polea con agarre neutro', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar ejercicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Remo en polea con agarre neutro', exact: true })).toHaveCount(0);
  await studentPage.reload();
  await studentPage.getByLabel('Sede / ficha de alumno', { exact: true }).selectOption('library-pupil');
  await expect(studentPage.getByRole('heading', { name: 'Remo en polea', exact: true })).toBeVisible();
  await studentContext.close(); await otherContext.close();
});
