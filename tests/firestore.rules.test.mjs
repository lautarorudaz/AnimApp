import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, or, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { emptyRoutine } from '../src/features/routines/model.js';

let environment;
const projectId = 'demo-animapp';
const pupil = { nombre: 'Alumna de prueba', userId: 'student', profesorId: 'teacher', sedeId: 'moreno', activo: true };
before(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080, rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') } });
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [id, rol, sedes] of [['teacher', 'profesor', ['moreno', 'edison']], ['other', 'profesor', ['moreno']], ['student', 'alumno', ['moreno']], ['admin', 'admin', ['moreno']], ['inactive', 'profesor', ['moreno']], ['reception', 'recepcionista', ['moreno']], ['foreign-teacher', 'profesor', ['edison']]]) {
      await setDoc(doc(db, 'users', id), { rol, sedes, sedeIds: sedes, activo: id !== 'inactive' });
    }
    await setDoc(doc(db, 'alumnos', 'pupil'), pupil);
    await setDoc(doc(db, 'alumnos', 'unassigned'), { ...pupil, userId: 'other-student', profesorId: 'other' });
    await setDoc(doc(db, 'alumnos', 'other-site'), { ...pupil, sedeId: 'general-san-martin' });
    await setDoc(doc(db, 'alumnos', 'second-site'), { ...pupil, sedeId: 'edison' });
    await setDoc(doc(db, 'ejercicios', 'squat'), { nombre: 'Sentadilla', categoria: 'Piernas' });
  });
});
after(async () => { await environment?.cleanup(); });
const dbFor = (uid) => environment.authenticatedContext(uid).firestore();
const payload = (overrides = {}) => ({ ...emptyRoutine(), alumnoId: 'pupil', alumnoUserId: 'student', profesorId: 'teacher', sedeId: 'moreno', estado: 'borrador', actualizadoPor: 'teacher', actualizadoEn: serverTimestamp(), revision: 1, ...overrides });

test('reception lists active teachers only within its sites', async () => {
  const db = dbFor('reception');
  await assertSucceeds(getDocs(query(collection(db, 'users'), where('rol', '==', 'profesor'), where('activo', '==', true), where('sedeIds', 'array-contains', 'moreno'))));
  await assertFails(getDocs(collection(db, 'users')));
  await assertFails(getDocs(query(collection(db, 'users'), where('rol', '==', 'profesor'), where('activo', '==', true), where('sedeIds', 'array-contains', 'edison'))));
  await assertFails(getDoc(doc(db, 'users', 'inactive')));
  await assertFails(getDoc(doc(db, 'users', 'admin')));
});

test('reception persists assignment by UID and cannot assign outside the site or change login identity', async () => {
  const db = dbFor('reception');
  const data = { nombre: 'Jorge Prueba', dni: '20342564', email: 'jorge@example.test', telefono: '112233', profesorId: 'teacher', sedeId: 'moreno', userId: '', objetivo: '', activo: true, active: true, estado: 'Activo', creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() };
  await assertSucceeds(setDoc(doc(db, 'alumnos', 'reception-pupil'), data));
  await assertFails(setDoc(doc(db, 'alumnos', 'wrong-teacher'), { ...data, profesorId: 'foreign-teacher' }));
  await assertFails(setDoc(doc(db, 'alumnos', 'inactive-teacher'), { ...data, profesorId: 'inactive' }));
  await assertFails(setDoc(doc(db, 'alumnos', 'wrong-site'), { ...data, sedeId: 'edison' }));
  await assertFails(setDoc(doc(db, 'alumnos', 'fake-login'), { ...data, userId: 'student' }));
  await assertSucceeds(updateDoc(doc(db, 'alumnos', 'reception-pupil'), { profesorId: 'other', actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, 'alumnos', 'reception-pupil'), { profesorId: 'foreign-teacher', actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, 'alumnos', 'reception-pupil'), { userId: 'student', actualizadoEn: serverTimestamp() }));
});

test('professor lists only assigned students in an allowed site, including a second site', async () => {
  const db = dbFor('teacher');
  await assertSucceeds(getDocs(query(collection(db, 'alumnos'), where('profesorId', '==', 'teacher'), where('sedeId', '==', 'moreno'))));
  await assertSucceeds(getDocs(query(collection(db, 'alumnos'), where('profesorId', '==', 'teacher'), where('sedeId', '==', 'edison'))));
  await assertFails(getDocs(query(collection(db, 'alumnos'), where('sedeId', '==', 'moreno'))));
  await assertFails(getDoc(doc(db, 'alumnos', 'unassigned')));
  await assertFails(getDoc(doc(db, 'alumnos', 'other-site')));
});

test('professor can edit assigned profile but cannot change assignment or create accounts', async () => {
  const db = dbFor('teacher');
  await assertSucceeds(updateDoc(doc(db, 'alumnos', 'pupil'), { objetivo: 'Fuerza', actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, 'alumnos', 'pupil'), { profesorId: 'other', actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, 'alumnos', 'pupil'), { userId: 'someone-else', actualizadoEn: serverTimestamp() }));
  await assertFails(setDoc(doc(db, 'alumnos', 'new'), pupil));
  await assertFails(setDoc(doc(db, 'users', 'fake-user'), { rol: 'alumno', activo: true }));
});

test('draft is readable even before creation only by assigned professor or admin', async () => {
  await assertSucceeds(getDoc(doc(dbFor('teacher'), 'rutinasBorradores', 'pupil')));
  await assertFails(getDoc(doc(dbFor('other'), 'rutinasBorradores', 'pupil')));
  await assertFails(getDoc(doc(dbFor('student'), 'rutinasBorradores', 'pupil')));
  await assertSucceeds(setDoc(doc(dbFor('teacher'), 'rutinasBorradores', 'pupil'), payload()));
  await assertFails(getDoc(doc(dbFor('student'), 'rutinasBorradores', 'pupil')));
  await assertFails(setDoc(doc(dbFor('other'), 'rutinasBorradores', 'pupil'), payload({ actualizadoPor: 'other' })));
});

test('publication and active pointer are atomic; student sees publications only', async () => {
  const db = dbFor('teacher');
  await assertFails(setDoc(doc(db, 'rutinas', 'publication'), payload({ estado: 'publicada', publicadoEn: serverTimestamp() })));
  const batch = writeBatch(db);
  batch.set(doc(db, 'rutinas', 'publication'), payload({ estado: 'publicada', publicadoEn: serverTimestamp() }));
  batch.update(doc(db, 'alumnos', 'pupil'), { rutinaActivaId: 'publication', actualizadoEn: serverTimestamp() });
  await assertSucceeds(batch.commit());
  const studentDb = dbFor('student');
  await assertSucceeds(getDocs(query(collection(studentDb, 'rutinas'), where('alumnoUserId', '==', 'student'), where('estado', '==', 'publicada'))));
  await assertFails(getDocs(collection(studentDb, 'rutinas')));
  await assertSucceeds(getDocs(query(collection(db, 'rutinas'), where('alumnoId', '==', 'pupil'), where('sedeId', '==', 'moreno'))));
  await assertFails(getDoc(doc(dbFor('other'), 'rutinas', 'publication')));
  await assertFails(updateDoc(doc(db, 'rutinas', 'publication'), { nombre: 'Alterada' }));
  await assertFails(updateDoc(doc(studentDb, 'rutinas', 'publication'), { nombre: 'Alterada' }));
});

test('student cannot access another pupil or library when signed out', async () => {
  await assertSucceeds(getDocs(query(collection(dbFor('student'), 'alumnos'), where('userId', '==', 'student'))));
  await assertFails(getDoc(doc(dbFor('student'), 'alumnos', 'unassigned')));
  await assertFails(getDocs(collection(environment.unauthenticatedContext().firestore(), 'ejercicios')));
  await assertFails(getDocs(collection(dbFor('inactive'), 'ejercicios')));
});

test('soft deletion preserves publications and blocks new drafts; professor cannot reactivate', async () => {
  const db = dbFor('teacher');
  await assertSucceeds(updateDoc(doc(db, 'alumnos', 'pupil'), { activo: false, active: false, estado: 'Baja', actualizadoEn: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(dbFor('student'), 'rutinas', 'publication')));
  await assertFails(setDoc(doc(db, 'rutinasBorradores', 'pupil'), payload({ revision: 2 })));
  await assertFails(updateDoc(doc(db, 'alumnos', 'pupil'), { activo: true, active: true, estado: 'Activo', actualizadoEn: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(dbFor('admin'), 'alumnos', 'pupil'), { activo: true, active: true, estado: 'Activo' }));
});

test('reassigning a pupil revokes the former professor and lets the new one read history', async () => {
  await assertSucceeds(updateDoc(doc(dbFor('admin'), 'alumnos', 'pupil'), { profesorId: 'other' }));
  await assertFails(getDoc(doc(dbFor('teacher'), 'alumnos', 'pupil')));
  await assertFails(getDoc(doc(dbFor('teacher'), 'rutinasBorradores', 'pupil')));
  await assertFails(getDoc(doc(dbFor('teacher'), 'rutinas', 'publication')));
  await assertSucceeds(getDoc(doc(dbFor('other'), 'rutinas', 'publication')));
  await assertSucceeds(getDocs(query(collection(dbFor('other'), 'rutinas'), where('alumnoId', '==', 'pupil'), where('sedeId', '==', 'moreno'))));
});

test('private libraries stay private and shared plans are read-only for other teachers', async () => {
  const owner = dbFor('teacher'); const other = dbFor('other');
  for (const name of ['ejercicios', 'rutinasGenericas']) {
    await assertSucceeds(setDoc(doc(owner, name, 'private-item'), { nombre: 'Privado', profesorId: 'teacher', privado: true }));
    await assertSucceeds(setDoc(doc(owner, name, 'public-item'), { nombre: 'Compartido', profesorId: 'teacher', privado: false }));
    await assertSucceeds(getDoc(doc(owner, name, 'private-item')));
    await assertFails(getDoc(doc(other, name, 'private-item')));
    await assertSucceeds(getDoc(doc(other, name, 'public-item')));
    await assertSucceeds(getDocs(query(collection(other, name), or(where('profesorId', '==', 'other'), where('privado', '==', false)))));
    await assertFails(getDocs(collection(other, name)));
    await assertFails(updateDoc(doc(other, name, 'public-item'), { nombre: 'Alterado' }));
    await assertFails(updateDoc(doc(owner, name, 'private-item'), { profesorId: 'other' }));
    await assertFails(setDoc(doc(other, name, 'forged'), { profesorId: 'teacher', privado: false }));
    await assertSucceeds(updateDoc(doc(owner, name, 'public-item'), { privado: true }));
    await assertFails(getDoc(doc(other, name, 'public-item')));
    await assertFails(getDoc(doc(dbFor('student'), name, 'private-item')));
  }
});

test('legacy routines and existing muscle-zone permissions remain compatible', async () => {
  const teacher = dbFor('teacher');
  await assertSucceeds(setDoc(doc(teacher, 'rutinas', 'legacy'), { profesorId: 'teacher', alumnoId: 'second-site', alumnoUserId: 'student', sedeId: 'edison', nombre: 'Anterior' }));
  await assertSucceeds(updateDoc(doc(teacher, 'rutinas', 'legacy'), { nombre: 'Anterior actualizada' }));
  await assertSucceeds(updateDoc(doc(teacher, 'alumnos', 'second-site'), { rutinaNombre: 'Anterior actualizada', updatedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(doc(teacher, 'zonasMusculares', 'custom'), { nombre: 'Zona propia', creadoPor: 'teacher' }));
  await assertSucceeds(getDoc(doc(dbFor('student'), 'zonasMusculares', 'custom')));
  await assertFails(updateDoc(doc(dbFor('other'), 'zonasMusculares', 'custom'), { nombre: 'Alterada' }));
});
