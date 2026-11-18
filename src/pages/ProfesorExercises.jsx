import { useEffect, useId, useState } from 'react';
import { Dumbbell, Edit, Play, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/auth';
import { archiveLibraryItem, saveExercise, watchExercises, watchMuscleZones } from '../features/routines/libraryData';
import { MUSCLE_ZONES, ownsItem, youtubeId } from '../features/routines/libraryModel';
import { STAGES, friendlyError } from '../features/routines/model';
import { Empty, Field, Modal, Notice, Workspace } from '../features/routines/Workspace';

function ExerciseForm({ exercise, actor, zones, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: exercise?.nombre || '', zonaMuscular: exercise?.zonaMuscular || '', etapa: exercise?.etapa || 'central', descripcion: exercise?.descripcion || '', videoUrl: exercise?.videoUrl || '', compartida: exercise?.privado !== true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const zoneListId = useId();
  const set = (key, value) => setForm({ ...form, [key]: value });
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await saveExercise(form, exercise, actor); onSaved('Ejercicio guardado en la biblioteca.'); onClose(); }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title={exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose} busy={busy}><form onSubmit={save}><Notice error>{error}</Notice><fieldset className="training-fieldset" disabled={busy}>
    <Field label="Nombre del ejercicio"><input className="form-input" maxLength={120} required value={form.nombre} onChange={(event) => set('nombre', event.target.value)} placeholder="Ej.: Press inclinado con mancuernas" /></Field>
    <div className="training-form-grid"><Field label="Zona muscular"><input className="form-input" list={zoneListId} maxLength={80} required value={form.zonaMuscular} onChange={(event) => set('zonaMuscular', event.target.value)} placeholder="Elegí o escribí una zona" /><datalist id={zoneListId}>{zones.map((zone) => <option key={zone} value={zone} />)}</datalist></Field>
      <Field label="Etapa"><select className="form-input" value={form.etapa} onChange={(event) => set('etapa', event.target.value)}>{STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></Field></div>
    <Field label="Descripción / técnica (opcional)"><textarea className="form-input" rows={3} maxLength={2000} value={form.descripcion} onChange={(event) => set('descripcion', event.target.value)} placeholder="Puntos a tener en cuenta al realizar el ejercicio" /></Field>
    <Field label="Video de YouTube (opcional)"><input className="form-input" type="url" maxLength={500} value={form.videoUrl} onChange={(event) => set('videoUrl', event.target.value)} placeholder="https://www.youtube.com/watch?v=…" /></Field>
    <label className="training-sharing"><input type="checkbox" checked={form.compartida} onChange={(event) => set('compartida', event.target.checked)} /><span><strong>Visible para otros profesores</strong><small>Si lo desactivás, el ejercicio será privado.</small></span></label>
  </fieldset><div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ejercicio'}</button></div></form></Modal>;
}

function ExerciseCard({ exercise, actor, onEdit, onRemove }) {
  const [playing, setPlaying] = useState(false);
  const videoId = youtubeId(exercise.videoUrl);
  const stage = STAGES.find((item) => item.id === exercise.etapa);
  return <article className="training-card exercise-card">
    <div className={`exercise-art exercise-art-${exercise.etapa || 'central'}`}>
      {playing && videoId ? <iframe title={`Video de ${exercise.nombre}`} src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <><Dumbbell size={44} strokeWidth={1.25} /><span>{exercise.zonaMuscular}</span>{videoId && <button className="exercise-play" onClick={() => setPlaying(true)} aria-label={`Ver video de ${exercise.nombre}`}><Play size={17} fill="currentColor" />Ver video</button>}</>}
    </div>
    <div className="exercise-card-body"><div className="training-catalog-badges"><span className="training-badge">{stage?.label || 'Etapa sin clasificar'}</span><span className="training-muted">{exercise.privado ? 'Privado' : 'Compartido'}</span></div>
      <h2>{exercise.nombre}</h2><p className="training-muted exercise-description">{exercise.descripcion || 'Sin indicaciones adicionales.'}</p>
      <div className="training-catalog-actions">{videoId && <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="training-text-button">Abrir en YouTube ↗</a>}
        {ownsItem(exercise, actor) && <div className="training-actions"><button className="training-icon" aria-label={`Editar ${exercise.nombre}`} onClick={() => onEdit(exercise)}><Edit size={16} /></button><button className="training-icon is-danger" aria-label={`Eliminar ${exercise.nombre}`} onClick={() => onRemove(exercise)}><Trash2 size={16} /></button></div>}
      </div>
    </div>
  </article>;
}

export default function ProfesorExercises() {
  const { userProfile } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [customZones, setCustomZones] = useState([]);
  const [zoneNotice, setZoneNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('');
  const [stage, setStage] = useState('');
  const [scope, setScope] = useState('todos');
  const [form, setForm] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const uid = userProfile.uid; const role = userProfile.rol;
  useEffect(() => watchExercises({ uid, rol: role }, (items) => { setExercises(items); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); }), [uid, role]);
  useEffect(() => watchMuscleZones(setCustomZones, () => setZoneNotice('No se pudieron cargar las zonas personalizadas. Podés seguir usando las zonas estándar o escribir una nueva.')), []);
  const zones = [...new Set([...MUSCLE_ZONES, ...customZones, ...exercises.map((exercise) => exercise.zonaMuscular)])].sort((a, b) => a.localeCompare(b, 'es'));
  const filtered = exercises.filter((exercise) => `${exercise.nombre} ${exercise.zonaMuscular}`.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')) && (!zone || exercise.zonaMuscular === zone) && (!stage || exercise.etapa === stage) && (scope !== 'mios' || exercise.profesorId === uid));
  const remove = async () => {
    setBusy(true); setError('');
    try { await archiveLibraryItem('ejercicios', removing, userProfile); setRemoving(null); setNotice('Ejercicio eliminado de la biblioteca. Las rutinas que ya lo usan se conservan.'); }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Workspace><header className="header-bar"><div><span className="training-eyebrow">BIBLIOTECA DE ENTRENAMIENTO</span><h1>Ejercicios</h1><p className="training-muted">Técnica, zona muscular y etapa. Todo en un mismo lugar.</p></div><button className="btn-primary" onClick={() => setForm({ exercise: null })}><Plus size={17} />Nuevo ejercicio</button></header>
    <Notice error>{error}</Notice><Notice>{notice || zoneNotice}</Notice>
    <div className="training-toolbar catalog-toolbar"><Field label="Buscar ejercicio"><div className="training-search"><Search size={17} /><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o zona muscular" /></div></Field><Field label="Zona muscular"><select className="form-input" value={zone} onChange={(event) => setZone(event.target.value)}><option value="">Todas las zonas</option>{zones.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Etapa"><select className="form-input" value={stage} onChange={(event) => setStage(event.target.value)}><option value="">Todas las etapas</option>{STAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Mostrar"><select className="form-input" value={scope} onChange={(event) => setScope(event.target.value)}><option value="todos">Todos los disponibles</option><option value="mios">Mis ejercicios</option></select></Field></div>
    <p className="training-results-count">{filtered.length} ejercicios disponibles</p>
    {loading ? <p role="status">Cargando biblioteca…</p> : error ? null : !filtered.length ? <Empty title="No hay ejercicios para mostrar">Creá un ejercicio o cambiá los filtros de búsqueda.</Empty> : <div className="exercise-grid">{filtered.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} actor={userProfile} onEdit={(item) => setForm({ exercise: item })} onRemove={setRemoving} />)}</div>}
    {form && <ExerciseForm exercise={form.exercise} actor={userProfile} zones={zones} onClose={() => setForm(null)} onSaved={setNotice} />}
    {removing && <Modal title="Eliminar ejercicio" busy={busy} onClose={() => setRemoving(null)}><p>¿Eliminar «{removing.nombre}» de la biblioteca? Se conservará en las rutinas que ya lo tienen asignado.</p><div className="training-modal-actions"><button className="btn-secondary" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</button><button className="btn-primary" disabled={busy} onClick={remove}>Eliminar ejercicio</button></div></Modal>}
  </Workspace>;
}
