import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth';
import { getSedeLabel } from '../constants/appData';
import { watchOwnStudents, watchPublishedRoutines } from '../features/routines/data';
import { formatDate, friendlyError, isStudentActive } from '../features/routines/model';
import { Empty, Field, Notice, Workspace } from '../features/routines/Workspace';
import RoutineViewer from '../features/routines/RoutineViewer';

export default function AlumnoDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [students, setStudents] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState('');
  useEffect(() => {
    const stopStudents = watchOwnStudents(currentUser.uid, (items) => { setStudents(items); setStudentsLoading(false); }, (err) => { setError(friendlyError(err)); setStudentsLoading(false); });
    const stopRoutines = watchPublishedRoutines(currentUser.uid, (items) => { setRoutines(items); setRoutinesLoading(false); }, (err) => { setError(friendlyError(err)); setRoutinesLoading(false); });
    return () => { stopStudents(); stopRoutines(); };
  }, [currentUser.uid]);
  const student = students.find((item) => item.id === selectedStudent) || students.find(isStudentActive) || students[0];
  const versions = routines.filter((item) => item.alumnoId === student?.id).sort((a, b) => (b.publicadoEn?.toMillis?.() || 0) - (a.publicadoEn?.toMillis?.() || 0));
  const active = versions.find((item) => item.id === student?.rutinaActivaId);
  const routine = versions.find((item) => item.id === selectedRoutine) || active;
  const loading = studentsLoading || routinesLoading;
  return <Workspace student><header className="header-bar"><div><span className="training-eyebrow">TU ESPACIO DE ENTRENAMIENTO</span><h1>Mi rutina</h1><p className="training-muted">Hola, {userProfile.nombre}. Cada entrenamiento, un paso más.</p></div><span className="training-badge">Alumno</span></header>
    <Notice error>{error}</Notice>
    {loading ? <p className="training-empty" role="status">Cargando tu plan de entrenamiento…</p> : error ? null : !student ? <Empty title="Tu perfil todavía no está vinculado">Pedile al administrador que vincule tu cuenta con tu ficha de alumno.</Empty> : <>
      <div className="training-toolbar">{students.length > 1 ? <Field label="Sede / ficha de alumno"><select className="form-input" value={student.id} onChange={(event) => { setSelectedStudent(event.target.value); setSelectedRoutine(''); }}>{students.map((item) => <option key={item.id} value={item.id}>{getSedeLabel(item.sedeId)}{!isStudentActive(item) ? ' · Baja' : ''}</option>)}</select></Field> : <p className="training-muted">{getSedeLabel(student.sedeId)}</p>}
        {!!versions.length && <Field label="Rutina e historial"><select className="form-input" value={routine?.id || ''} onChange={(event) => setSelectedRoutine(event.target.value)}>{!active && <option value="">Seleccioná una versión del historial</option>}{versions.map((item) => <option key={item.id} value={item.id}>{item.id === student.rutinaActivaId ? 'Activa' : 'Anterior'} · {item.nombre} · {formatDate(item.publicadoEn)} · {item.id.slice(-6)}</option>)}</select></Field>}</div>
      {!isStudentActive(student) && <Notice>Tu ficha está dada de baja. Podés consultar las rutinas que ya tenías publicadas. Consultá al administrador para reactivarla.</Notice>}
      {routine ? <><div className="training-publication"><span className="training-badge">{routine.id === student.rutinaActivaId ? 'Rutina activa' : 'Versión anterior'}</span><span>Publicada el {formatDate(routine.publicadoEn)}</span></div><RoutineViewer key={routine.id} data={routine} /></> : <Empty title="Todavía no tenés una rutina activa">Tu profesor está preparando tu plan. Cuando lo publique, vas a poder consultar las semanas, los días y cada etapa desde acá.</Empty>}
    </>}
  </Workspace>;
}
