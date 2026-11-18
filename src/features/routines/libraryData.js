import { collection, doc, onSnapshot, or, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { normalizeExercise, ownsItem, youtubeId } from './libraryModel';
import { normalizeRoutine, validateRoutine } from './model';

export function watchVisibleItems(name, actor, next, error) {
  const ref = collection(db, name);
  const source = actor.rol === 'admin' ? ref : query(ref, or(where('profesorId', '==', actor.uid), where('privado', '==', false)));
  return onSnapshot(source, (snapshot) => next(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))
    .filter((item) => item.activo !== false).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))), error);
}

export function watchExercises(actor, next, error) {
  return watchVisibleItems('ejercicios', actor, (items) => next(items.map((item) => normalizeExercise(item, item.id))), error);
}

export function watchMuscleZones(next, error) {
  return onSnapshot(collection(db, 'zonasMusculares'), (snapshot) => next(snapshot.docs.map((item) => item.data().nombre).filter((name) => typeof name === 'string')), error);
}

export async function saveExercise(form, existing, actor) {
  const nombre = form.nombre.trim();
  const zonaMuscular = form.zonaMuscular.trim();
  if (!nombre || !zonaMuscular || !['movilidad', 'activacion', 'central'].includes(form.etapa)) throw new Error('Completá nombre, zona muscular y etapa.');
  const id = youtubeId(form.videoUrl.trim());
  if (form.videoUrl.trim() && !id) throw new Error('Ingresá un enlace válido de YouTube (watch, youtu.be o Shorts).');
  const ref = existing ? doc(db, 'ejercicios', existing.id) : doc(collection(db, 'ejercicios'));
  await runTransaction(db, async (transaction) => {
    const snapshot = existing ? await transaction.get(ref) : null;
    if (existing && (!snapshot.exists() || !ownsItem(snapshot.data(), actor))) throw new Error('Solo podés editar tus propios ejercicios.');
    transaction.set(ref, {
      nombre, zonaMuscular, categoria: zonaMuscular, etapa: form.etapa,
      descripcion: form.descripcion.trim(), videoUrl: id ? `https://www.youtube.com/watch?v=${id}` : '',
      privado: !form.compartida, profesorId: snapshot?.data()?.profesorId || actor.uid,
      activo: true, actualizadoEn: serverTimestamp(),
      ...(!existing ? { creadoEn: serverTimestamp() } : {})
    }, { merge: true });
  });
}

export async function saveGenericRoutine({ routine, shared, existing, actor, expectedRevision }) {
  const content = normalizeRoutine(routine);
  const validation = validateRoutine(content, true);
  if (validation) throw new Error(validation);
  const ref = existing ? doc(db, 'rutinasGenericas', existing.id) : doc(collection(db, 'rutinasGenericas'));
  const revision = await runTransaction(db, async (transaction) => {
    const snapshot = existing ? await transaction.get(ref) : null;
    if (existing && (!snapshot.exists() || !ownsItem(snapshot.data(), actor))) throw new Error('Solo podés editar tus propias rutinas. Duplicá una compartida para adaptarla.');
    const previousRevision = snapshot?.data()?.revision || 0;
    if (existing && previousRevision !== expectedRevision) throw new Error('Esta rutina cambió en otra pestaña. Cerrá y volvé a abrirla para cargar la última versión.');
    transaction.set(ref, {
      ...content, profesorId: snapshot?.data()?.profesorId || actor.uid, autorNombre: snapshot?.data()?.autorNombre || actor.nombre,
      compartida: shared, privado: !shared, activo: true, revision: previousRevision + 1,
      actualizadoEn: serverTimestamp(), ...(!existing ? { creadoEn: serverTimestamp() } : {})
    }, { merge: true });
    return previousRevision + 1;
  });
  return { id: ref.id, revision };
}

export async function archiveLibraryItem(name, item, actor) {
  const ref = doc(db, name, item.id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || !ownsItem(snapshot.data(), actor)) throw new Error('Solo podés eliminar elementos propios.');
    transaction.update(ref, { activo: false, actualizadoEn: serverTimestamp() });
  });
}
