import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
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

export async function deactivateReceptionStudent(studentId, sedeId) {
  const ref = doc(db, 'alumnos', studentId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || snapshot.data().sedeId !== sedeId) throw new Error('El alumno ya no pertenece a esta sede.');
    transaction.update(ref, { activo: false, active: false, estado: 'Baja', actualizadoEn: serverTimestamp() });
  });
}
