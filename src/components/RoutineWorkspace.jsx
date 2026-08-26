import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { CalendarDays, Check, ChevronDown, ChevronUp, ClipboardList, Copy, Edit3, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import SedeSwitcher from './SedeSwitcher';
import { db } from '../firebase/config';

const STAGES = ['Movilidad', 'Activación', 'Central'];
const stageClass = { Movilidad: 'mobility', Activación: 'activation', Central: 'central' };
const uid = () => crypto.randomUUID();
const clone = (value) => JSON.parse(JSON.stringify(value));
const emptyDay = (number = 1) => ({ id: uid(), nombre: `Día ${number}`, etapas: { Movilidad: [], Activación: [], Central: [] } });
const emptyWeek = (number = 1) => ({ id: uid(), nombre: `Semana ${number}`, dias: [emptyDay(1)] });
const emptyRoutine = () => ({ nombre: '', objetivo: '', semanas: [emptyWeek(1)] });

const RoutineWorkspace = ({ activeSede, currentUser, userProfile }) => {
  const activeSedeId = activeSede?.id;
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [publicExercises, setPublicExercises] = useState([]);
  const [ownExercises, setOwnExercises] = useState([]);
  const [view, setView] = useState('alumnos');
  const [searchTerm, setSearchTerm] = useState('');
  const [builder, setBuilder] = useState(null);
  const [routine, setRoutine] = useState(emptyRoutine);
  const [baseTemplateId, setBaseTemplateId] = useState('');
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!activeSedeId || !currentUser?.uid) return undefined;
    return onSnapshot(query(collection(db, 'alumnos'), where('sedeId', '==', activeSedeId), where('profesorId', '==', currentUser.uid)),
      (snapshot) => setStudents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
      () => setError('No pudimos cargar tus alumnos asignados.'));
  }, [activeSedeId, currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onSnapshot(query(collection(db, 'rutinasGenericas'), where('profesorId', '==', currentUser.uid)),
      (snapshot) => setTemplates(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
      () => setError('No pudimos cargar tus rutinas genéricas.'));
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    const offPublic = onSnapshot(query(collection(db, 'ejercicios'), where('privado', '==', false)),
      (snapshot) => setPublicExercises(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
    const offOwn = onSnapshot(query(collection(db, 'ejercicios'), where('profesorId', '==', currentUser.uid)),
      (snapshot) => setOwnExercises(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
    return () => { offPublic(); offOwn(); };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const exercises = useMemo(() => {
    const byId = new Map([...publicExercises, ...ownExercises].map((item) => [item.id, item]));
    return [...byId.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [ownExercises, publicExercises]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase('es');
    const source = view === 'alumnos' ? students : templates;
    return source.filter((item) => !search || [item.nombre, item.objetivo, item.dni, item.email]
      .some((value) => String(value || '').toLocaleLowerCase('es').includes(search)));
  }, [searchTerm, students, templates, view]);

  const openStudentBuilder = (student) => {
    setBuilder({ type: 'student', target: student });
    setRoutine(student.rutinaEstructura ? clone(student.rutinaEstructura) : { ...emptyRoutine(), nombre: student.rutinaNombre || `Rutina de ${student.nombre}`, objetivo: student.objetivo || '' });
    setBaseTemplateId('');
    setCollapsedWeeks(new Set());
    setError('');
  };

  const openTemplateBuilder = (template = null) => {
    setBuilder({ type: 'template', target: template });
    setRoutine(template ? { nombre: template.nombre, objetivo: template.objetivo || '', semanas: clone(template.semanas || [emptyWeek(1)]) } : emptyRoutine());
    setBaseTemplateId('');
    setCollapsedWeeks(new Set());
    setError('');
  };

  const applyTemplate = (templateId) => {
    setBaseTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setRoutine({ nombre: template.nombre, objetivo: template.objetivo || '', semanas: clone(template.semanas || [emptyWeek(1)]) });
  };

  const updateWeek = (weekIndex, updater) => setRoutine((current) => ({
    ...current,
    semanas: current.semanas.map((week, index) => index === weekIndex ? updater(week) : week)
  }));

  const addDay = (weekIndex) => updateWeek(weekIndex, (week) => ({ ...week, dias: [...week.dias, emptyDay(week.dias.length + 1)] }));
  const removeDay = (weekIndex, dayIndex) => updateWeek(weekIndex, (week) => ({ ...week, dias: week.dias.filter((_, index) => index !== dayIndex) }));

  const addExercise = (weekIndex, dayIndex, stage, exerciseId) => {
    const exercise = exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    updateWeek(weekIndex, (week) => ({
      ...week,
      dias: week.dias.map((day, index) => index === dayIndex ? {
        ...day,
        etapas: { ...day.etapas, [stage]: [...day.etapas[stage], { id: uid(), ejercicioId: exercise.id, nombre: exercise.nombre, zonaMuscular: exercise.zonaMuscular, series: '', repeticiones: '', peso: '', observacion: '' }] }
      } : day)
    }));
  };

  const updateExercise = (weekIndex, dayIndex, stage, exerciseIndex, field, value) => updateWeek(weekIndex, (week) => ({
    ...week,
    dias: week.dias.map((day, index) => index === dayIndex ? {
      ...day,
      etapas: { ...day.etapas, [stage]: day.etapas[stage].map((exercise, itemIndex) => itemIndex === exerciseIndex ? { ...exercise, [field]: value } : exercise) }
    } : day)
  }));

  const removeExercise = (weekIndex, dayIndex, stage, exerciseIndex) => updateWeek(weekIndex, (week) => ({
    ...week,
    dias: week.dias.map((day, index) => index === dayIndex ? { ...day, etapas: { ...day.etapas, [stage]: day.etapas[stage].filter((_, itemIndex) => itemIndex !== exerciseIndex) } } : day)
  }));

  const totalExercises = (data) => (data.semanas || []).reduce((total, week) => total + week.dias.reduce((dayTotal, day) => dayTotal + STAGES.reduce((stageTotal, stage) => stageTotal + (day.etapas?.[stage]?.length || 0), 0), 0), 0);

  const saveRoutine = async () => {
    if (!routine.nombre.trim()) { setError('Ingresá un nombre para la rutina.'); return; }
    if (!totalExercises(routine)) { setError('Agregá al menos un ejercicio desde la biblioteca.'); return; }
    setIsSaving(true);
    setError('');
    try {
      const batch = writeBatch(db);
      if (builder.type === 'template') {
        const templateRef = builder.target?.id ? doc(db, 'rutinasGenericas', builder.target.id) : doc(collection(db, 'rutinasGenericas'));
        batch.set(templateRef, { ...routine, profesorId: currentUser.uid, profesorNombre: userProfile?.nombre || '', updatedAt: serverTimestamp(), ...(builder.target ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
      } else {
        const student = builder.target;
        batch.set(doc(db, 'rutinas', student.id), {
          alumnoId: student.id, alumnoUserId: student.userId || '', alumnoNombre: student.nombre,
          profesorId: currentUser.uid, profesorNombre: userProfile?.nombre || '', sedeId: activeSedeId,
          ...routine, activa: true, plantillaOrigenId: baseTemplateId || '', updatedAt: serverTimestamp()
        }, { merge: true });
        batch.update(doc(db, 'alumnos', student.id), {
          rutinaId: student.id, rutinaNombre: routine.nombre, objetivo: routine.objetivo,
          rutinaEstructura: routine, rutinaActualizadaAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: currentUser.uid
        });
      }
      await batch.commit();
      setFeedback(builder.type === 'template' ? 'Rutina genérica guardada.' : `Rutina asignada a ${builder.target.nombre}.`);
      setBuilder(null);
    } catch (firebaseError) {
      console.error('Error al guardar rutina estructurada:', firebaseError);
      setError(firebaseError.code === 'permission-denied' ? 'No tenés permisos para guardar esta rutina.' : 'No pudimos guardar la rutina.');
    } finally { setIsSaving(false); }
  };

  const removeTemplate = async (template) => {
    if (!window.confirm(`¿Eliminar la rutina genérica “${template.nombre}”?`)) return;
    try { await deleteDoc(doc(db, 'rutinasGenericas', template.id)); setFeedback('Rutina genérica eliminada.'); }
    catch { setError('No pudimos eliminar la rutina genérica.'); }
  };

  return <>
    <header className="reception-header"><div><span>Planificación del profesor</span><h1>Rutinas</h1><p>Armá planes desde cero o reutilizá tus rutinas genéricas.</p></div><div className="reception-header-actions"><SedeSwitcher />{view === 'genericas' && <button type="button" className="reception-primary" onClick={() => openTemplateBuilder()}><Plus size={18} /> Nueva rutina genérica</button>}</div></header>
    {error && !builder && <div className="reception-alert error">{error}</div>}
    <div className="routine-view-tabs"><button type="button" className={view === 'alumnos' ? 'active' : ''} onClick={() => setView('alumnos')}><UserRound size={18} /> Alumnos asignados <strong>{students.length}</strong></button><button type="button" className={view === 'genericas' ? 'active' : ''} onClick={() => setView('genericas')}><Copy size={18} /> Rutinas genéricas <strong>{templates.length}</strong></button></div>
    <section className="routine-directory"><div className="reception-toolbar"><label className="reception-search"><Search size={18} /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={view === 'alumnos' ? 'Buscar alumno' : 'Buscar rutina genérica'} /></label></div><div className="routine-card-grid">
      {filteredItems.length === 0 ? <div className="professor-empty"><ClipboardList size={34} /><strong>{view === 'alumnos' ? 'No tenés alumnos asignados' : 'Todavía no creaste rutinas genéricas'}</strong></div> : view === 'alumnos' ? filteredItems.map((student) => <article className="routine-target-card" key={student.id}><header><span>{student.nombre.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><h2>{student.nombre}</h2><p>DNI {student.dni || 'pendiente'}</p></div></header><div className={student.rutinaId ? 'routine-status ready' : 'routine-status'}><CalendarDays size={18} /><div><small>{student.rutinaId ? 'Rutina asignada' : 'Sin rutina'}</small><strong>{student.rutinaNombre || 'Empezar planificación'}</strong></div></div><button type="button" className="reception-primary" onClick={() => openStudentBuilder(student)}><Edit3 size={17} /> {student.rutinaId ? 'Editar rutina' : 'Armar rutina'}</button></article>) : filteredItems.map((template) => <article className="routine-target-card generic" key={template.id}><header><span><Copy size={18} /></span><div><h2>{template.nombre}</h2><p>{template.objetivo || 'Sin objetivo especificado'}</p></div></header><div className="routine-template-stats"><span>{template.semanas?.length || 0}<small>semanas</small></span><span>{totalExercises(template)}<small>ejercicios</small></span></div><footer><button type="button" onClick={() => openTemplateBuilder(template)}><Edit3 size={16} /> Editar</button><button type="button" className="danger" onClick={() => removeTemplate(template)}><Trash2 size={16} /> Eliminar</button></footer></article>) }
    </div></section>

    {builder && <div className="routine-builder-backdrop"><section className="routine-builder"><header><div><span>{builder.type === 'template' ? 'Rutina genérica' : `Rutina para ${builder.target.nombre}`}</span><h2>{builder.target ? `Editar ${builder.target.nombre}` : 'Nueva rutina genérica'}</h2></div><button type="button" onClick={() => setBuilder(null)} aria-label="Cerrar"><X size={23} /></button></header><div className="routine-builder-body">
      {error && <div className="reception-alert error">{error}</div>}
      {builder.type === 'student' && templates.length > 0 && <div className="routine-base-selector"><div><Copy size={19} /><span><strong>Usar una rutina genérica como base</strong><small>Se copiará y luego podrás personalizarla para este alumno.</small></span></div><select value={baseTemplateId} onChange={(event) => applyTemplate(event.target.value)}><option value="">Empezar desde cero</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.nombre}</option>)}</select></div>}
      <div className="routine-main-fields"><label><span>Nombre de la rutina *</span><input value={routine.nombre} onChange={(event) => setRoutine({ ...routine, nombre: event.target.value })} /></label><label><span>Objetivo</span><input value={routine.objetivo} onChange={(event) => setRoutine({ ...routine, objetivo: event.target.value })} placeholder="Fuerza, hipertrofia, adaptación..." /></label></div>
      <div className="routine-weeks">{routine.semanas.map((week, weekIndex) => { const collapsed = collapsedWeeks.has(week.id); return <article className="routine-week" key={week.id}><header><button type="button" onClick={() => setCollapsedWeeks((current) => { const next = new Set(current); if (next.has(week.id)) next.delete(week.id); else next.add(week.id); return next; })}>{collapsed ? <ChevronDown size={19} /> : <ChevronUp size={19} />}</button><input value={week.nombre} onChange={(event) => updateWeek(weekIndex, (current) => ({ ...current, nombre: event.target.value }))} /><span>{week.dias.length} días · {week.dias.reduce((sum, day) => sum + STAGES.reduce((stageSum, stage) => stageSum + day.etapas[stage].length, 0), 0)} ejercicios</span>{routine.semanas.length > 1 && <button type="button" className="danger" onClick={() => setRoutine({ ...routine, semanas: routine.semanas.filter((_, index) => index !== weekIndex) })}><Trash2 size={17} /></button>}</header>{!collapsed && <div className="routine-days">{week.dias.map((day, dayIndex) => <article className="routine-day" key={day.id}><header><input value={day.nombre} onChange={(event) => updateWeek(weekIndex, (current) => ({ ...current, dias: current.dias.map((item, index) => index === dayIndex ? { ...item, nombre: event.target.value } : item) }))} />{week.dias.length > 1 && <button type="button" onClick={() => removeDay(weekIndex, dayIndex)}><Trash2 size={16} /></button>}</header>{STAGES.map((stage) => <section className={`routine-stage ${stageClass[stage]}`} key={stage}><header><div><i /> <strong>{stage}</strong><span>{day.etapas[stage].length} ejercicios</span></div><select value="" onChange={(event) => addExercise(weekIndex, dayIndex, stage, event.target.value)}><option value="">+ Agregar desde biblioteca</option>{exercises.filter((exercise) => exercise.etapa === stage).map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.nombre} · {exercise.zonaMuscular}</option>)}</select></header><div>{day.etapas[stage].length === 0 ? <p className="routine-stage-empty">Sin ejercicios en esta etapa.</p> : day.etapas[stage].map((exercise, exerciseIndex) => <article className="routine-exercise-row" key={exercise.id}><div className="routine-exercise-name"><strong>{exercise.nombre}</strong><small>{exercise.zonaMuscular}</small></div><label><span>Series</span><input value={exercise.series} onChange={(event) => updateExercise(weekIndex, dayIndex, stage, exerciseIndex, 'series', event.target.value)} placeholder="4" /></label><label><span>Repeticiones</span><input value={exercise.repeticiones} onChange={(event) => updateExercise(weekIndex, dayIndex, stage, exerciseIndex, 'repeticiones', event.target.value)} placeholder="10" /></label><label><span>Peso</span><input value={exercise.peso} onChange={(event) => updateExercise(weekIndex, dayIndex, stage, exerciseIndex, 'peso', event.target.value)} placeholder="70 kg" /></label><label className="observation"><span>Observación</span><input value={exercise.observacion} onChange={(event) => updateExercise(weekIndex, dayIndex, stage, exerciseIndex, 'observacion', event.target.value)} placeholder="Técnica, descanso..." /></label><button type="button" onClick={() => removeExercise(weekIndex, dayIndex, stage, exerciseIndex)}><Trash2 size={16} /></button></article>)}</div></section>)}</article>)}<button type="button" className="routine-add-day" onClick={() => addDay(weekIndex)}><Plus size={17} /> Agregar día</button></div>}</article>; })}</div>
      <button type="button" className="routine-add-week" onClick={() => setRoutine({ ...routine, semanas: [...routine.semanas, emptyWeek(routine.semanas.length + 1)] })}><Plus size={18} /> Agregar semana</button>
    </div><footer><div><strong>{routine.semanas.length}</strong> semanas · <strong>{totalExercises(routine)}</strong> ejercicios</div><span><button type="button" className="reception-secondary" onClick={() => setBuilder(null)} disabled={isSaving}>Cancelar</button><button type="button" className="reception-primary" onClick={saveRoutine} disabled={isSaving}>{isSaving ? 'Guardando...' : builder.type === 'template' ? 'Guardar rutina genérica' : 'Asignar rutina'}</button></span></footer></section></div>}
    {feedback && <div className="reception-toast" role="status"><Check size={18} />{feedback}</div>}
  </>;
};

export default RoutineWorkspace;
