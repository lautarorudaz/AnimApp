import { useState } from 'react';
import { CalendarDays, MessageSquareText } from 'lucide-react';
import { STAGES, normalizeRoutine, routineCounts } from './model';
import { Empty } from './Workspace';

function safeVideoUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}

export default function RoutineViewer({ data }) {
  const routine = normalizeRoutine(data);
  const [weekIndex, setWeekIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const week = routine.semanas[Math.min(weekIndex, routine.semanas.length - 1)];
  const day = week?.dias[Math.min(dayIndex, week.dias.length - 1)];
  const counts = routineCounts(routine);
  return <div className="routine-viewer">
    <section className="training-card training-routine-heading"><span className="training-eyebrow">PLAN DE ENTRENAMIENTO</span><h2>{routine.nombre}</h2>
      {routine.objetivo && <p>{routine.objetivo}</p>}
      <div className="training-chips"><span><CalendarDays size={15} />{counts.semanas} {counts.semanas === 1 ? 'semana' : 'semanas'}</span><span>{counts.dias} {counts.dias === 1 ? 'día' : 'días'} de entrenamiento</span><span>{counts.ejercicios} {counts.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
      {routine.aclaraciones && <p className="training-note"><MessageSquareText size={16} />{routine.aclaraciones}</p>}
    </section>
    {!week ? <Empty title="Sin semanas">Esta rutina todavía no tiene semanas cargadas.</Empty> : <>
      <div className="training-tabs" role="group" aria-label="Elegir semana">{routine.semanas.map((item, index) => <button key={item.id} className={weekIndex === index ? 'is-selected' : ''} aria-pressed={weekIndex === index} onClick={() => { setWeekIndex(index); setDayIndex(0); }}>{item.nombre}</button>)}</div>
      <div className="training-tabs training-days" role="group" aria-label="Elegir día">{week.dias.map((item, index) => <button key={item.id} className={dayIndex === index ? 'is-selected' : ''} aria-pressed={dayIndex === index} onClick={() => setDayIndex(index)}>{item.nombre}</button>)}</div>
      {day && <div className="training-stages">{STAGES.map((stage, index) => <section className="training-card" key={stage.id}>
        <div className="training-stage-title"><span className="training-stage-number">0{index + 1}</span><div><h3>{stage.label}</h3><p>{stage.detail}</p></div></div>
        {!day.etapas[stage.id].length ? <p className="training-muted">Sin ejercicios indicados para esta etapa.</p> : <div className="training-exercise-list">{day.etapas[stage.id].map((exercise) => <article className="training-exercise-view" key={exercise.id}>
          <h4>{exercise.nombre}</h4>
          <dl className="training-prescription"><div><dt>Series</dt><dd>{exercise.series || '—'}</dd></div><div><dt>Reps / duración</dt><dd>{exercise.repeticiones || '—'}</dd></div><div><dt>Peso</dt><dd>{exercise.peso || '—'}</dd></div>{exercise.descanso && <div><dt>Descanso</dt><dd>{exercise.descanso}</dd></div>}</dl>
          {exercise.aclaraciones && <p className="training-note"><MessageSquareText size={15} />{exercise.aclaraciones}</p>}
          {safeVideoUrl(exercise.videoUrl) && <a className="training-video" href={safeVideoUrl(exercise.videoUrl)} target="_blank" rel="noopener noreferrer">Ver demostración ↗</a>}
        </article>)}</div>}
      </section>)}</div>}
    </>}
  </div>;
}
