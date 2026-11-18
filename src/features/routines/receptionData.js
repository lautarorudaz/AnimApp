import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import app, { db } from '../../firebase/config';
import { isStudentActive } from './model';

export function watchReceptionStudents(sedeId, next, error) {
  return onSnapshot(query(collection(db, 'alumnos'), where('sedeId', '==', sedeId)),
    (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))), error);
}

export function watchSedeTeachers(sedeId, next, error) {
  return onSnapshot(query(collection(db, 'users'), where('rol', '==', 'profesor'), where('activo', '==', true), where('sedeIds', 'array-contains', sedeId)),
    (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).filter(isStudentActive)
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))), error);
}

export async function saveReceptionStudent(form, studentId, sedeId) {
  const ref = studentId ? doc(db, 'alumnos', studentId) : doc(collection(db, 'alumnos'));
  await runTransaction(db, async (transaction) => {
    const existing = studentId ? await transaction.get(ref) : null;
    if (studentId && (!existing.exists() || existing.data().sedeId !== sedeId)) throw new Error('La ficha del alumno cambió de sede o ya no existe.');
    if (form.profesorId) {
      const teacher = await transaction.get(doc(db, 'users', form.profesorId));
      if (!teacher.exists() || teacher.data().rol !== 'profesor' || !isStudentActive(teacher.data()) || !(teacher.data().sedeIds || teacher.data().sedes || []).includes(sedeId)) {
        throw new Error('El profesor seleccionado ya no está disponible en esta sede. Elegí otro.');
      }
    }
    const fields = {
      nombre: form.nombre.trim(), dni: form.dni.trim(), email: form.email.trim().toLowerCase(),
      telefono: form.telefono.trim(), profesorId: form.profesorId, actualizadoEn: serverTimestamp()
    };
    if (!fields.nombre) throw new Error('Ingresá el nombre completo del alumno.');
    if (studentId) transaction.update(ref, fields);
    else transaction.set(ref, { ...fields, sedeId, userId: '', objetivo: '', activo: true, active: true, estado: 'Activo', creadoEn: serverTimestamp() });
  });
}

export async function createReceptionStudentAccess(form, studentId, sedeId) {
  const nombre = form.nombre.trim();
  const email = form.email.trim().toLowerCase();
  if (!nombre) throw new Error('Ingresá el nombre completo del alumno.');
  if (!email) throw new Error('Ingresá el correo electrónico del alumno.');
  if (!form.password || form.password.length < 8) throw new Error('La contraseña inicial debe tener al menos 8 caracteres.');

  const studentRef = studentId ? doc(db, 'alumnos', studentId) : doc(collection(db, 'alumnos'));
  if (studentId) {
    const existing = await getDoc(studentRef);
    if (!existing.exists() || existing.data().sedeId !== sedeId) throw new Error('La ficha del alumno cambió de sede o ya no existe.');
    if (existing.data().userId) throw new Error('Este alumno ya tiene una cuenta de acceso vinculada.');
  }
  const duplicate = (await getDocs(query(collection(db, 'alumnos'), where('sedeId', '==', sedeId), where('email', '==', email))))
    .docs.find((item) => item.id !== studentId);
  if (duplicate) throw new Error('Ya existe otra ficha con ese correo en esta sede. Completá el acceso desde esa ficha.');

  const secondary = initializeApp(app.options, `reception-create-${crypto.randomUUID()}`);
  const secondaryAuth = getAuth(secondary);
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') connectAuthEmulator(secondaryAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
  let createdUser;
  let saved = false;
  try {
    const result = await createUserWithEmailAndPassword(secondaryAuth, email, form.password);
    createdUser = result.user;
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', createdUser.uid), {
      uid: createdUser.uid,
      nombre,
      email,
      rol: 'alumno',
      role: 'alumno',
      sedes: [sedeId],
      sedeIds: [sedeId],
      activo: true,
      active: true,
      creadoEn: serverTimestamp()
    });
    const fields = {
      nombre,
      dni: form.dni.trim(),
      email,
      telefono: form.telefono.trim(),
      profesorId: form.profesorId,
      userId: createdUser.uid,
      actualizadoEn: serverTimestamp()
    };
    if (studentId) batch.update(studentRef, fields);
    else batch.set(studentRef, {
      ...fields,
      sedeId,
      objetivo: '',
      activo: true,
      active: true,
      estado: 'Activo',
      creadoEn: serverTimestamp()
    });
    await batch.commit();
    saved = true;
  } catch (error) {
    if (createdUser && !saved) {
      try { await deleteUser(createdUser); }
      catch { throw new Error('La ficha no se guardó y no se pudo revertir el alta de Authentication. Revisá esa cuenta desde la consola de Firebase antes de reintentar.'); }
    }
    if (error.code === 'auth/email-already-in-use') throw new Error('Ese correo ya tiene una cuenta de acceso. Usá otra dirección o pedile a Administración que vincule la cuenta existente.');
    if (error.code === 'auth/weak-password' || error.code === 'auth/password-does-not-meet-requirements') throw new Error('La contraseña no cumple la política de Firebase. Usá una contraseña más fuerte.');
    throw error;
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondary);
  }
}

export async function deactivateReceptionStudent(studentId, sedeId) {
  const ref = doc(db, 'alumnos', studentId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || snapshot.data().sedeId !== sedeId) throw new Error('El alumno ya no pertenece a esta sede.');
    transaction.update(ref, { activo: false, active: false, estado: 'Baja', actualizadoEn: serverTimestamp() });
  });
}
