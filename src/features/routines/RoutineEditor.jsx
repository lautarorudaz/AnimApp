import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Eye, Plus, Save, Search, Send, Trash2 } from 'lucide-react';
import { saveRoutine, watchLibrary } from './data';
import { STAGES, duplicateNode, emptyDay, emptyWeek, friendlyError, newId, normalizeRoutine, validateRoutine } from './model';
import { Empty, Field, Modal, Notice } from './Workspace';
import RoutineViewer from './RoutineViewer';
import { saveGenericRoutine } from './libraryData';
import { isShared } from './libraryModel';

export default function RoutineEditor({
  student, actor, draft, published, onClose, onSaved, templateMode = false, template,
  assignmentMode = false, initialRoutine, initialRevision, sourceTemplateId = ''
}) {
  const [routine, setRoutine] = useState(() => normalizeRoutine(initialRoutine || template || draft || published || student?.rutinaActiva, student));
  const [revision, setRevision] = useState(initialRevision ?? (templateMode ? template?.revision : draft?.revision) ?? 0);
  const [templateId, setTemplateId] = useState(template?.id || '');
  const [shared, setShared] = useState(isShared(template || {}));
  const [dirty, setDirty] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState('');
  const [picker, setPicker] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const actorUid = actor.uid;
  const actorRole = actor.rol;
  useEffect(() => watchLibrary({ uid: actorUid, rol: actorRole }, (items) => { setLibrary(items); setLibraryLoading(false); }, (err) => { setLibraryError(friendlyError(err)); setLibraryLoading(false); }), [actorUid, actorRole]);
  useEffect(() => {
    const beforeUnload = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  const change = (next) => { setRoutine(next); setDirty(true); setNotice(''); setError(''); };
  const week = routine.semanas[weekIndex];
  const day = week?.dias[dayIndex];
  const changeWeek = (next) => change({ ...routine, semanas: routine.semanas.map((item, index) => index === weekIndex ? next : item) });
  const changeDay = (next) => changeWeek({ ...week, dias: week.dias.map((item, index) => index === dayIndex ? next : item) });
  const changeExercises = (stage, next) => changeDay({ ...day, etapas: { ...day.etapas, [stage]: next } });
  const changeExercise = (stage, id, key, value) => changeExercises(stage, day.etapas[stage].map((item) => item.id === id ? { ...item, [key]: value } : item));
  const close = () => { if (!busy && (!dirty || window.confirm('Tenés cambios sin guardar. ¿Querés salir y descartarlos?'))) onClose(); };
  const save = async (publish) => {
    const validation = validateRoutine(routine, publish || templateMode);
    if (validation) { setError(validation); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      if (templateMode) {
        const result = await saveGenericRoutine({ routine, shared, existing: templateId ? { id: templateId } : null, actor, expectedRevision: revision });
        setRevision(result.revision); setTemplateId(result.id); setDirty(false);
        const message = shared ? 'Rutina genérica guardada y compartida con los profesores.' : 'Rutina genérica privada guardada.';
        setNotice(message); onSaved(message); return;
      }
      const result = await saveRoutine({ student, actor, routine, publish, expectedRevision: revision, sourceTemplateId });
      setRevision(result.revision); setDirty(false);
      const message = assignmentMode
        ? publish ? 'Rutina adaptada, asignada y publicada para el alumno.' : 'Rutina adaptada y asignada como borrador.'
        : publish ? 'Rutina publicada. El alumno ya puede verla; la versión anterior queda en su historial.' : 'Borrador guardado. El alumno sigue viendo la última versión publicada.';
      setNotice(message); onSaved(message, { studentId: student.id, rutinaActivaId: result.rutinaActivaId, publish });
      if (assignmentMode) onClose();
    } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  const addExercise = (exercise) => {
    changeExercises(picker, [...day.etapas[picker], {
      id: newId(), ejercicioId: exercise.id, nombre: exercise.nombre,
      videoUrl: typeof exercise.videoUrl === 'string' ? exercise.videoUrl : '',
      series: '', repeticiones: '', peso: '', descanso: '', aclaraciones: ''
    }]);
    setPicker(null);
  };
  const removeWeek = () => {
    if (!window.confirm(`¿Eliminar «${week.nombre}» y sus días del borrador?`)) return;
    change({ ...routine, semanas: routine.semanas.filter((_, index) => index !== weekIndex) });
    setWeekIndex(Math.max(0, weekIndex - 1)); setDayIndex(0); setPicker(null);
  };
  const removeDay = () => {
    if (!window.confirm(`¿Eliminar «${day.nombre}» y sus ejercicios del borrador?`)) return;
    changeWeek({ ...week, dias: week.dias.filter((_, index) => index !== dayIndex) });
    setDayIndex(Math.max(0, dayIndex - 1)); setPicker(null);
  };
  const moveExercise = (stage, index, offset) => {
    const items = [...day.etapas[stage]];
    [items[index], items[index + offset]] = [items[index + offset], items[index]];
    changeExercises(stage, items);
  };
  const categories = [...new Set(library.map((item) => String(item.categoria)).filter(Boolean))];
  const filtered = library.filter((item) => (!item.etapa || item.etapa === picker) && `${item.nombre} ${item.categoria}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')) && (!category || String(item.categoria) === category));
  const title = templateMode ? templateId ? 'Editar rutina genérica' : 'Nueva rutina genérica' : assignmentMode ? `Adaptar rutina · ${student.nombre}` : `Rutina · ${student.nombre}`;
  return <Modal title={title} onClose={close} wide editor busy={busy}>
    <div className="training-editor-intro"><div className="training-editor-state"><span className="training-badge">{dirty ? 'Cambios sin guardar' : assignmentMode ? 'Copia lista para asignar' : 'Borrador de trabajo'}</span><span>{routine.semanas.length} {routine.semanas.length === 1 ? 'semana' : 'semanas'} · {week?.dias.length || 0} {(week?.dias.length || 0) === 1 ? 'día' : 'días'}</span></div><button className="btn-secondary" type="button" onClick={() => setPreview(!preview)}><Eye size={16} />{preview ? 'Volver al editor' : 'Vista del alumno'}</button></div>
    <Notice error>{error}</Notice><Notice>{notice}</Notice>
    {assignmentMode && <Notice>Podés cambiar cualquier parte de esta copia antes de asignarla. La rutina genérica original no se modificará.</Notice>}
    {!templateMode && !student.userId && <Notice>El alumno todavía no tiene una cuenta vinculada. Podés guardar el borrador, pero no publicarlo hasta que el administrador vincule su acceso.</Notice>}
    <fieldset disabled={busy} className="training-fieldset">
      {preview ? <RoutineViewer key={JSON.stringify(routine)} data={routine} /> : <>
        <section className="training-plan-details"><div className="training-panel-heading"><div><span className="training-eyebrow">CONFIGURACIÓN</span><h3>Datos del plan</h3></div><p>Información general que verá el alumno.</p></div>
          {templateMode && <label className="training-sharing"><input type="checkbox" checked={shared} onChange={(event) => { setShared(event.target.checked); setDirty(true); }} /><span><strong>Compartir con otros profesores</strong><small>{shared ? 'Otros profesores podrán verla y copiarla para sus alumnos.' : 'Solo vos podrás ver y asignar esta rutina.'}</small></span></label>}
          <div className="training-form-grid"><Field label="Nombre de la rutina"><input className="form-input" maxLength={120} value={routine.nombre} onChange={(event) => change({ ...routine, nombre: event.target.value })} /></Field>
            <Field label="Objetivo"><input className="form-input" maxLength={300} placeholder="Ej.: fuerza e hipertrofia" value={routine.objetivo} onChange={(event) => change({ ...routine, objetivo: event.target.value })} /></Field></div>
          <Field label="Aclaraciones generales (opcional)"><textarea className="form-input" rows={2} maxLength={2000} value={routine.aclaraciones} onChange={(event) => change({ ...routine, aclaraciones: event.target.value })} placeholder="Indicaciones para todo el plan" /></Field>
        </section>
        <section className="training-schedule-builder"><div className="training-section-label training-schedule-heading"><div><span className="training-eyebrow">PROGRAMACIÓN</span><h3>Semanas del plan</h3></div><button className="btn-secondary" onClick={() => { change({ ...routine, semanas: [...routine.semanas, emptyWeek(routine.semanas.length + 1)] }); setWeekIndex(routine.semanas.length); setDayIndex(0); setPicker(null); }}><Plus size={15} />Semana</button></div>
        <div className="training-tabs" role="group" aria-label="Semana a editar">{routine.semanas.map((item, index) => <button key={item.id} className={weekIndex === index ? 'is-selected' : ''} aria-pressed={weekIndex === index} onClick={() => { setWeekIndex(index); setDayIndex(0); setPicker(null); }}>{item.nombre || `Semana ${index + 1}`}</button>)}</div>
        {week && <section className="training-week-editor">
          <div className="training-editor-row"><Field label="Nombre de la semana"><input className="form-input" maxLength={100} value={week.nombre} onChange={(event) => changeWeek({ ...week, nombre: event.target.value })} /></Field>
            <button className="btn-secondary" onClick={() => { change({ ...routine, semanas: [...routine.semanas, duplicateNode(week)] }); setWeekIndex(routine.semanas.length); setDayIndex(0); setPicker(null); }}><Copy size={15} />Duplicar semana</button>
            <button className="training-icon is-danger" disabled={routine.semanas.length === 1} onClick={removeWeek} aria-label="Eliminar semana"><Trash2 size={17} /></button></div>
          <div className="training-section-label"><h3>Días de entrenamiento</h3><button className="btn-secondary" onClick={() => { changeWeek({ ...week, dias: [...week.dias, emptyDay(week.dias.length + 1)] }); setDayIndex(week.dias.length); setPicker(null); }}><Plus size={15} />Día</button></div>
          <div className="training-tabs training-days" role="group" aria-label="Día a editar">{week.dias.map((item, index) => <button key={item.id} className={dayIndex === index ? 'is-selected' : ''} aria-pressed={dayIndex === index} onClick={() => { setDayIndex(index); setPicker(null); }}>{item.nombre || `Día ${index + 1}`}</button>)}</div>
          {day && <><div className="training-editor-row"><Field label="Nombre del día"><input className="form-input" maxLength={120} value={day.nombre} onChange={(event) => changeDay({ ...day, nombre: event.target.value })} placeholder="Ej.: Día 1 · Tren superior" /></Field>
            <button className="btn-secondary" onClick={() => { changeWeek({ ...week, dias: [...week.dias, duplicateNode(day)] }); setDayIndex(week.dias.length); setPicker(null); }}><Copy size={15} />Duplicar día</button>
            <button className="training-icon is-danger" disabled={week.dias.length === 1} onClick={removeDay} aria-label="Eliminar día"><Trash2 size={17} /></button></div>
            {STAGES.map((stage, stageIndex) => <section className="training-card training-stage-editor" key={stage.id}>
              <div className="training-section-label"><div className="training-stage-title"><span className="training-stage-number">0{stageIndex + 1}</span><div><h3>{stage.label}</h3><p>{stage.detail}</p></div><span className="training-stage-count">{day.etapas[stage.id].length} {day.etapas[stage.id].length === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
                <button className="btn-secondary" onClick={() => { setPicker(picker === stage.id ? null : stage.id); setSearch(''); setCategory(''); }}><Plus size={16} />Ejercicio</button></div>
              {picker === stage.id && <div className="training-library"><h4>Biblioteca de ejercicios</h4><div className="training-form-grid"><Field label="Buscar ejercicio"><div className="training-search"><Search size={17} /><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o grupo muscular" /></div></Field>
                <Field label="Categoría"><select className="form-input" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorías</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field></div>
                <Notice error>{libraryError}</Notice>{libraryLoading ? <p role="status">Cargando biblioteca…</p> : !library.length ? <Empty title="Biblioteca sin ejercicios">No se encontraron ejercicios activos en la colección «ejercicios». Revisá la conexión o la carga de la biblioteca.</Empty> : <><p className="training-muted">{filtered.length} ejercicios encontrados</p><div className="training-library-results">{filtered.map((exercise) => <button key={exercise.id} onClick={() => addExercise(exercise)}><span><strong>{exercise.nombre}</strong><small>{String(exercise.categoria)}</small></span><Plus size={18} /></button>)}{!filtered.length && <p>No hay resultados con esos filtros.</p>}</div></>}
                <button className="training-text-button" onClick={() => setPicker(null)}>Cerrar biblioteca</button></div>}
              {!day.etapas[stage.id].length && <p className="training-stage-empty">Agregá ejercicios desde tu biblioteca para esta etapa.</p>}
              {day.etapas[stage.id].map((exercise, exerciseIndex) => <article className="training-exercise-editor" key={exercise.id}>
                <div className="training-section-label"><h4><span className="training-exercise-index" aria-hidden="true">{exerciseIndex + 1}</span>{exercise.nombre}</h4><div className="training-actions">
                  <button className="training-icon" aria-label={`Subir ${exercise.nombre}`} disabled={exerciseIndex === 0} onClick={() => moveExercise(stage.id, exerciseIndex, -1)}><ArrowUp size={16} /></button>
                  <button className="training-icon" aria-label={`Bajar ${exercise.nombre}`} disabled={exerciseIndex === day.etapas[stage.id].length - 1} onClick={() => moveExercise(stage.id, exerciseIndex, 1)}><ArrowDown size={16} /></button>
                  <button className="training-icon is-danger" aria-label={`Quitar ${exercise.nombre}`} onClick={() => changeExercises(stage.id, day.etapas[stage.id].filter((item) => item.id !== exercise.id))}><Trash2 size={16} /></button>
                </div></div>
                <div className="training-exercise-fields">{[
                  ['series', 'Series', 'Ej.: 3'], ['repeticiones', 'Reps / duración', 'Ej.: 8–12 o 30 s'], ['peso', 'Peso', 'Ej.: 20 kg o sin carga'], ['descanso', 'Descanso (opcional)', 'Ej.: 60 s']
                ].map(([key, label, placeholder]) => <Field className={`training-field training-prescription-field training-prescription-${key}`} label={label} key={key}><input className="form-input" maxLength={100} inputMode={key === 'series' ? 'numeric' : 'text'} value={exercise[key]} onChange={(event) => changeExercise(stage.id, exercise.id, key, event.target.value)} placeholder={placeholder} /></Field>)}</div>
                <Field className="training-field training-exercise-notes" label="Aclaraciones (opcional)"><textarea className="form-input" rows={2} maxLength={1000} value={exercise.aclaraciones} onChange={(event) => changeExercise(stage.id, exercise.id, 'aclaraciones', event.target.value)} placeholder="Técnica, ritmo o adaptaciones para el alumno" /></Field>
              </article>)}
            </section>)}
          </>}
        </section>}
        </section>
      </>}
    </fieldset>
    <footer className="training-editor-footer"><div><Check size={16} /><span>{busy ? 'Guardando en Firebase…' : templateMode ? 'Cada alumno recibe una copia independiente de esta rutina.' : assignmentMode ? 'Confirmá cuando la copia esté lista para el alumno.' : 'Solo las versiones publicadas son visibles para el alumno.'}</span></div><div className="training-actions"><button className="btn-secondary" disabled={busy} onClick={close}>Cerrar</button>{templateMode ? <button className="btn-primary" disabled={busy} onClick={() => save(false)}><Save size={16} />Guardar rutina genérica</button> : <><button className="btn-secondary" disabled={busy} onClick={() => save(false)}><Save size={16} />{assignmentMode ? 'Asignar borrador' : 'Guardar borrador'}</button><button className="btn-primary" disabled={busy || !student.userId} onClick={() => save(true)}><Send size={16} />{assignmentMode ? 'Asignar y publicar' : 'Publicar rutina'}</button></>}</div></footer>
  </Modal>;
}
