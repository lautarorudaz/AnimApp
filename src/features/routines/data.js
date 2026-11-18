import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { isStudentActive, normalizeRoutine, validateRoutine } from './model';
import { watchExercises } from './libraryData';

export function watchStudents({ uid, sedeId, admin }, next, error) {
  const conditions = [where('sedeId', '==', sedeId)];
  if (!admin) conditions.push(where('profesorId', '==', uid));
  return onSnapshot(query(collection(db, 'alumnos'), ...conditions), (snapshot) => {
    next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
  }, error);
}

export function watchLibrary(actor, next, error) {
  return watchExercises(actor, next, error);
}

export function watchStudentRoutines(studentId, sedeId, next, error) {
  let publications;
  let draft;
  let draftLoaded = false;
  const emit = () => { if (publications && draftLoaded) next(draft ? [...publications, draft] : publications); };
  const stopPublications = onSnapshot(query(collection(db, 'rutinas'), where('alumnoId', '==', studentId), where('sedeId', '==', sedeId)),
    (snapshot) => { publications = snapshot.docs.map((item) => ({ ...item.data(), id: item.id })); emit(); }, error);
  const stopDraft = onSnapshot(doc(db, 'rutinasBorradores', studentId), (snapshot) => {
    draft = snapshot.exists() ? { ...snapshot.data(), id: `borrador_${studentId}` } : null;
    draftLoaded = true; emit();
  }, error);
  return () => { stopPublications(); stopDraft(); };
}

export function watchOwnStudents(uid, next, error) {
  return onSnapshot(query(collection(db, 'alumnos'), where('userId', '==', uid)),
    (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))), error);
}

export function watchPublishedRoutines(uid, next, error) {
  return onSnapshot(query(collection(db, 'rutinas'), where('alumnoUserId', '==', uid), where('estado', '==', 'publicada')),
    (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))), error);
}

function assertAssigned(student, actor) {
  if (actor.rol !== 'admin' && (student.profesorId !== actor.uid || !actor.sedes.includes(student.sedeId))) {
    throw new Error('Este alumno ya no está asignado a tu usuario en esta sede.');
  }
}

// Editing a student's profile never changes their authentication identity or assignment.
export async function updateStudent(studentId, changes, actor) {
  const ref = doc(db, 'alumnos', studentId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('El alumno ya no existe.');
    assertAssigned(snapshot.data(), actor);
    transaction.update(ref, { ...changes, actualizadoEn: serverTimestamp() });
  });
}

export async function saveRoutine({ student, actor, routine, publish, expectedRevision, sourceTemplateId }) {
  const validation = validateRoutine(routine, publish);
  if (validation) throw new Error(validation);
  const studentRef = doc(db, 'alumnos', student.id);
  const draftRef = doc(db, 'rutinasBorradores', student.id);
  const publishedRef = publish ? doc(collection(db, 'rutinas')) : null;
  await runTransaction(db, async (transaction) => {
    const pupilSnapshot = await transaction.get(studentRef);
    const draftSnapshot = await transaction.get(draftRef);
    const templateSnapshot = sourceTemplateId ? await transaction.get(doc(db, 'rutinasGenericas', sourceTemplateId)) : null;
    if (!pupilSnapshot.exists()) throw new Error('El alumno ya no existe.');
    const pupil = pupilSnapshot.data();
    assertAssigned(pupil, actor);
    if (!isStudentActive(pupil)) throw new Error('No se puede guardar una rutina para un alumno dado de baja.');
    if (publish && !pupil.userId) throw new Error('El administrador debe vincular la cuenta del alumno antes de publicar. Podés asignar la rutina como borrador.');
    if (sourceTemplateId) {
      if (!templateSnapshot.exists() || templateSnapshot.data().activo === false) throw new Error('La rutina genérica ya no está disponible.');
    }
    const revision = draftSnapshot.exists() ? draftSnapshot.data().revision || 0 : 0;
    if (revision !== expectedRevision) throw new Error('Otro editor actualizó el borrador. Cerrá y volvé a abrir la rutina para cargar la última versión. Tus cambios siguen en pantalla.');
    const payload = {
      ...normalizeRoutine(routine), alumnoId: student.id, alumnoUserId: pupil.userId || '',
      profesorId: pupil.profesorId, sedeId: pupil.sedeId, actualizadoPor: actor.uid,
      actualizadoEn: serverTimestamp(), revision: revision + 1,
      ...(sourceTemplateId ? { origenRutinaId: sourceTemplateId, origenRutinaRevision: templateSnapshot.data().revision || 0 } : {})
    };
    transaction.set(draftRef, { ...payload, estado: 'borrador' });
    if (publish) {
      transaction.set(publishedRef, { ...payload, estado: 'publicada', publicadoEn: serverTimestamp() });
      transaction.update(studentRef, { rutinaActivaId: publishedRef.id, actualizadoEn: serverTimestamp() });
    }
  });
  return { revision: expectedRevision + 1, rutinaActivaId: publishedRef?.id || '' };
}
