import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import app, { db } from '../../firebase/config';
import { isStudentActive } from './model';

export function watchAdminCollection(name, next, error) {
  return onSnapshot(collection(db, name), (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))), error);
}

export async function createAccount(form) {
  const pending = form.rol === 'alumno' ? (await getDocs(query(collection(db, 'alumnos'), where('email', '==', form.email.trim().toLowerCase())))).docs.filter((item) => !item.data().userId) : [];
  if (form.sedes.some((sedeId) => pending.filter((item) => item.data().sedeId === sedeId).length > 1)) throw new Error('Hay varias fichas pendientes con ese correo en una sede. Revisalas antes de crear la cuenta.');
  // A secondary app creates the account without replacing the administrator's session.
  const secondary = initializeApp(app.options, `admin-create-${crypto.randomUUID()}`);
  const secondaryAuth = getAuth(secondary);
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') connectAuthEmulator(secondaryAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
  let createdUser;
  let saved = false;
  try {
    const result = await createUserWithEmailAndPassword(secondaryAuth, form.email.trim(), form.password);
    createdUser = result.user;
    const batch = writeBatch(db);
    const profile = {
      uid: createdUser.uid, nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(),
      rol: form.rol, role: form.rol, sedes: form.sedes, sedeIds: form.sedes,
      activo: true, active: true, creadoEn: serverTimestamp()
    };
    batch.set(doc(db, 'users', createdUser.uid), profile);
    if (form.rol === 'alumno') {
      for (const sedeId of form.sedes) {
        const existing = pending.find((item) => item.data().sedeId === sedeId);
        batch.set(existing?.ref || doc(collection(db, 'alumnos')), {
          nombre: profile.nombre, email: profile.email, userId: createdUser.uid,
          sedeId, profesorId: form.profesores[sedeId] || existing?.data().profesorId || '',
          dni: form.dni.trim() || existing?.data().dni || '', telefono: form.telefono.trim() || existing?.data().telefono || '',
          ...(existing ? { actualizadoEn: serverTimestamp() } : { objetivo: '', activo: true, active: true, estado: 'Activo', creadoEn: serverTimestamp() })
        }, { merge: true });
      }
    }
    await batch.commit();
    saved = true;
  } catch (err) {
    if (createdUser && !saved) {
      try { await deleteUser(createdUser); }
      catch { throw new Error('La ficha no se guardó y no se pudo revertir el alta de Authentication. Revisá esa cuenta desde la consola de Firebase antes de reintentar.'); }
    }
    if (err.code === 'auth/email-already-in-use') throw new Error('Ese correo ya tiene una cuenta. Si ya existe en Firebase, vinculá su UID en lugar de crear otra.');
    if (err.code === 'auth/weak-password' || err.code === 'auth/password-does-not-meet-requirements') throw new Error('La contraseña no cumple la política de Firebase. Usá una contraseña más fuerte.');
    throw err;
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondary);
  }
}

export async function assignStudent(student, profesorId, teacher) {
  if (profesorId && (!teacher || !isStudentActive(teacher) || teacher.rol !== 'profesor' || !(teacher.sedes || teacher.sedeIds || []).includes(student.sedeId))) {
    throw new Error('El profesor debe estar activo y pertenecer a la sede del alumno.');
  }
  const batch = writeBatch(db);
  batch.update(doc(db, 'alumnos', student.id), { profesorId, actualizadoEn: serverTimestamp() });
  await batch.commit();
}

export async function linkExistingStudent({ user, sedeId, profesorId, dni, telefono }) {
  const matches = (await getDocs(query(collection(db, 'alumnos'), where('email', '==', (user.email || '').trim().toLowerCase()), where('sedeId', '==', sedeId)))).docs;
  if (matches.some((item) => item.data().userId)) throw new Error('Ya existe una ficha vinculada con ese correo en esta sede.');
  if (matches.length > 1) throw new Error('Hay varias fichas pendientes con ese correo en esta sede. Revisalas antes de vincular.');
  const existing = matches[0];
  const ref = existing?.ref || doc(collection(db, 'alumnos'));
  const batch = writeBatch(db);
  batch.set(ref, {
    userId: user.uid || user.id, nombre: user.nombre || '', email: user.email || '',
    sedeId, profesorId: profesorId || existing?.data().profesorId || '', dni: dni.trim() || existing?.data().dni || '', telefono: telefono.trim() || existing?.data().telefono || '',
    ...(existing ? { actualizadoEn: serverTimestamp() } : { objetivo: '', activo: true, active: true, estado: 'Activo', creadoEn: serverTimestamp() })
  }, { merge: true });
  const sedes = [...new Set([...(user.sedes || user.sedeIds || []), sedeId])];
  batch.update(doc(db, 'users', user.id), { sedes, sedeIds: sedes });
  await batch.commit();
}

export async function reactivateStudent(studentId) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'alumnos', studentId), { activo: true, active: true, estado: 'Activo', actualizadoEn: serverTimestamp() });
  await batch.commit();
}
