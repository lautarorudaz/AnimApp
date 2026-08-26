import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Check, Edit3, Eye, EyeOff, Film, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { db } from '../firebase/config';

const STAGES = ['Movilidad', 'Activación', 'Central'];
const BASE_ZONES = ['Cuerpo completo', 'Core', 'Espalda', 'Hombros', 'Pecho', 'Piernas', 'Brazos', 'Glúteos'];
const EMPTY_FORM = {
  nombre: '', etapa: 'Movilidad', zonaMuscular: '', privado: false,
  videoTipo: 'youtube', videoUrl: '', videoNombre: '', videoArchivo: null
};

const youtubeVideoId = (value = '') => {
  try {
    const url = new URL(value);
    let id = '';
    if (url.hostname.includes('youtu.be')) id = url.pathname.split('/').filter(Boolean)[0];
    if (url.hostname.includes('youtube.com')) {
      id = url.searchParams.get('v') || url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1] || '';
    }
    return id;
  } catch {
    return '';
  }
};

const ExerciseLibrary = ({ activeSedeId, currentUser, userProfile }) => {
  const [publicExercises, setPublicExercises] = useState([]);
  const [ownExercises, setOwnExercises] = useState([]);
  const [customZones, setCustomZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('todas');
  const [zoneFilter, setZoneFilter] = useState('todas');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingExercise, setEditingExercise] = useState(null);
  const [viewingExercise, setViewingExercise] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newZone, setNewZone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    const unsubscribePublic = onSnapshot(
      query(collection(db, 'ejercicios'), where('privado', '==', false)),
      (snapshot) => setPublicExercises(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      () => setError('No pudimos cargar la biblioteca pública de ejercicios.')
    );
    const unsubscribeOwn = onSnapshot(
      query(collection(db, 'ejercicios'), where('profesorId', '==', currentUser.uid)),
      (snapshot) => setOwnExercises(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      () => setError('No pudimos cargar tus ejercicios.')
    );
    const unsubscribeZones = onSnapshot(collection(db, 'zonasMusculares'),
      (snapshot) => setCustomZones(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      () => setError('No pudimos cargar las zonas musculares.'));
    return () => {
      unsubscribePublic();
      unsubscribeOwn();
      unsubscribeZones();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const exercises = useMemo(() => {
    const byId = new Map([...publicExercises, ...ownExercises].map((exercise) => [exercise.id, exercise]));
    return [...byId.values()].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
  }, [ownExercises, publicExercises]);

  const zones = useMemo(() => [...new Set([
    ...BASE_ZONES,
    ...customZones.map((zone) => zone.nombre),
    ...exercises.map((exercise) => exercise.zonaMuscular)
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')), [customZones, exercises]);

  const filteredExercises = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase('es');
    return exercises.filter((exercise) => (
      (!search || [exercise.nombre, exercise.etapa, exercise.zonaMuscular, exercise.profesorNombre]
        .some((value) => String(value || '').toLocaleLowerCase('es').includes(search)))
      && (stageFilter === 'todas' || exercise.etapa === stageFilter)
      && (zoneFilter === 'todas' || exercise.zonaMuscular === zoneFilter)
    ));
  }, [exercises, searchTerm, stageFilter, zoneFilter]);

  const openCreate = () => {
    setEditingExercise(null);
    setForm({ ...EMPTY_FORM, zonaMuscular: zones[0] || '' });
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (exercise) => {
    setEditingExercise(exercise);
    setForm({ ...EMPTY_FORM, ...exercise, videoArchivo: null });
    setError('');
    setIsFormOpen(true);
  };

  const saveExercise = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid) return;
    if (form.videoTipo === 'youtube' && !youtubeVideoId(form.videoUrl)) {
      setError('Ingresá un enlace válido de YouTube, YouTube Shorts o youtu.be.');
      return;
    }
    if (form.videoTipo === 'archivo' && !form.videoNombre && !editingExercise?.videoNombre) {
      setError('Seleccioná un archivo de video desde el dispositivo.');
      return;
    }
    setIsSaving(true);
    setError('');
    const payload = {
      nombre: form.nombre.trim(),
      etapa: form.etapa,
      zonaMuscular: form.zonaMuscular,
      privado: form.privado,
      videoTipo: form.videoTipo,
      videoUrl: form.videoTipo === 'youtube' ? form.videoUrl.trim() : '',
      videoNombre: form.videoTipo === 'archivo' ? form.videoNombre : '',
      videoPendiente: form.videoTipo === 'archivo',
      profesorId: currentUser.uid,
      profesorNombre: userProfile?.nombre || userProfile?.email || 'Profesor',
      sedeId: activeSedeId || '',
      updatedAt: serverTimestamp()
    };
    try {
      if (editingExercise) await updateDoc(doc(db, 'ejercicios', editingExercise.id), payload);
      else await setDoc(doc(collection(db, 'ejercicios')), { ...payload, createdAt: serverTimestamp() });
      setFeedback(editingExercise ? 'Ejercicio actualizado.' : 'Ejercicio agregado a la biblioteca.');
      setIsFormOpen(false);
    } catch (firebaseError) {
      console.error('Error al guardar ejercicio:', firebaseError);
      setError(firebaseError.code === 'permission-denied' ? 'Solo podés modificar tus propios ejercicios.' : 'No pudimos guardar el ejercicio.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeExercise = async (exercise) => {
    if (!window.confirm(`¿Eliminar el ejercicio “${exercise.nombre}”?`)) return;
    try {
      await deleteDoc(doc(db, 'ejercicios', exercise.id));
      setFeedback('Ejercicio eliminado.');
    } catch (firebaseError) {
      console.error('Error al eliminar ejercicio:', firebaseError);
      setError('No pudimos eliminar el ejercicio.');
    }
  };

  const addZone = async () => {
    const normalized = newZone.trim();
    if (!normalized || zones.some((zone) => zone.toLocaleLowerCase('es') === normalized.toLocaleLowerCase('es'))) return;
    setIsSaving(true);
    try {
      await setDoc(doc(collection(db, 'zonasMusculares')), {
        nombre: normalized,
        creadoPor: currentUser.uid,
        profesorNombre: userProfile?.nombre || '',
        createdAt: serverTimestamp()
      });
      setNewZone('');
      setForm((current) => ({ ...current, zonaMuscular: normalized }));
      setFeedback('Zona muscular agregada.');
    } catch (firebaseError) {
      console.error('Error al agregar zona muscular:', firebaseError);
      setError('No pudimos agregar la zona muscular.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="reception-header"><div><span>Biblioteca del profesor</span><h1>Ejercicios</h1><p>Creá ejercicios propios y reutilizá los ejercicios públicos de otros profesores.</p></div><button type="button" className="reception-primary" onClick={openCreate}><Plus size={19} /> Nuevo ejercicio</button></header>
      {error && !isFormOpen && <div className="reception-alert error" role="alert">{error}</div>}
      <section className="exercise-toolbar">
        <label className="reception-search"><Search size={18} /><span className="sr-only">Buscar ejercicio</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, músculo o profesor" /></label>
        <select aria-label="Filtrar por etapa" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="todas">Todas las etapas</option>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select>
        <select aria-label="Filtrar por zona muscular" value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}><option value="todas">Todas las zonas</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select>
      </section>
      <section className="exercise-grid">
        {filteredExercises.length === 0 ? <div className="professor-empty"><Film size={34} /><strong>No encontramos ejercicios</strong><span>Creá el primero o cambiá los filtros.</span></div> : filteredExercises.map((exercise) => {
          const isOwner = exercise.profesorId === currentUser?.uid;
          const videoId = youtubeVideoId(exercise.videoUrl);
          return <article className="exercise-card" key={exercise.id}>
            <div className="exercise-video">{videoId ? <button type="button" onClick={() => setViewingExercise(exercise)} aria-label={`Ver ${exercise.nombre}`}><img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt={exercise.nombre} loading="lazy" /></button> : <div><Upload size={28} /><strong>{exercise.videoNombre || 'Video pendiente'}</strong><span>{exercise.videoPendiente ? 'Se subirá al conectar Storage' : 'Sin video'}</span></div>}</div>
            <div className="exercise-card-body"><div className="exercise-badges"><span>{exercise.etapa}</span><span>{exercise.zonaMuscular}</span>{exercise.privado && <span className="private"><EyeOff size={13} /> Privado</span>}</div><h2>{exercise.nombre}</h2><p>Por {isOwner ? 'vos' : exercise.profesorNombre}</p>{isOwner && <footer><button type="button" onClick={() => openEdit(exercise)}><Edit3 size={16} /> Editar</button><button type="button" className="danger" onClick={() => removeExercise(exercise)}><Trash2 size={16} /> Eliminar</button></footer>}</div>
          </article>;
        })}
      </section>
      {isFormOpen && <div className="reception-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false); }}><section className="reception-modal exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-title"><header><div><span>Biblioteca de ejercicios</span><h2 id="exercise-title">{editingExercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h2></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Cerrar"><X size={21} /></button></header><form onSubmit={saveExercise}>{error && <div className="reception-alert error" role="alert">{error}</div>}<div className="reception-form-grid">
        <label className="wide"><span>Nombre *</span><input value={form.nombre ?? ''} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required autoFocus /></label>
        <label><span>Etapa *</span><select value={form.etapa ?? 'Movilidad'} onChange={(event) => setForm({ ...form, etapa: event.target.value })}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
        <label><span>Zona muscular *</span><select value={form.zonaMuscular ?? ''} onChange={(event) => setForm({ ...form, zonaMuscular: event.target.value })} required><option value="">Seleccionar</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
        <div className="wide exercise-add-zone"><span>Agregar zona muscular</span><div><input value={newZone} onChange={(event) => setNewZone(event.target.value)} placeholder="Ej.: Gemelos" /><button type="button" onClick={addZone} disabled={!newZone.trim() || isSaving}><Plus size={17} /> Agregar</button></div></div>
        <fieldset className="wide exercise-source"><legend>Video *</legend><div><button type="button" className={form.videoTipo === 'youtube' ? 'active' : ''} onClick={() => setForm({ ...form, videoTipo: 'youtube' })}><Film size={18} /> Enlace de YouTube</button><button type="button" className={form.videoTipo === 'archivo' ? 'active' : ''} onClick={() => setForm({ ...form, videoTipo: 'archivo' })}><Upload size={18} /> Desde dispositivo</button></div></fieldset>
        {form.videoTipo === 'youtube' ? <label className="wide"><span>URL de YouTube o Short *</span><input type="url" value={form.videoUrl ?? ''} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://youtube.com/shorts/..." required /></label> : <label className="wide exercise-file"><span>Archivo de video *</span><input type="file" accept="video/*" onChange={(event) => { const file = event.target.files?.[0]; setForm({ ...form, videoArchivo: file || null, videoNombre: file?.name || '' }); }} /><small><Upload size={14} /> {form.videoNombre || 'Seleccioná un archivo'}. Quedará pendiente hasta conectar Firebase Storage.</small></label>}
        <label className="wide reception-check"><input type="checkbox" checked={Boolean(form.privado)} onChange={(event) => setForm({ ...form, privado: event.target.checked })} /><span>{form.privado ? <EyeOff size={18} /> : <Eye size={18} />}<strong>Ejercicio privado</strong><small>Si lo activás, solamente vos podrás verlo.</small></span></label>
      </div><footer><button type="button" className="reception-secondary" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Cancelar</button><button type="submit" className="reception-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar ejercicio'}</button></footer></form></section></div>}
      {viewingExercise && <div className="reception-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingExercise(null); }}><section className="exercise-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-viewer-title"><header><div><span>{viewingExercise.etapa} · {viewingExercise.zonaMuscular}</span><h2 id="exercise-viewer-title">{viewingExercise.nombre}</h2></div><button type="button" onClick={() => setViewingExercise(null)} aria-label="Cerrar video"><X size={22} /></button></header><div className="exercise-viewer-video"><iframe src={`https://www.youtube.com/embed/${youtubeVideoId(viewingExercise.videoUrl)}?autoplay=1&rel=0`} title={viewingExercise.nombre} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><footer>Ejercicio creado por {viewingExercise.profesorId === currentUser?.uid ? 'vos' : viewingExercise.profesorNombre}</footer></section></div>}
      {feedback && <div className="reception-toast" role="status"><Check size={18} />{feedback}</div>}
    </>
  );
};

export default ExerciseLibrary;
