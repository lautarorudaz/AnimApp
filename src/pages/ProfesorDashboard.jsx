import { useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, Edit, Search, Users } from 'lucide-react';
import SedeSwitcher from '../components/SedeSwitcher';
import { useAuth } from '../context/auth';
import { getSedeLabel } from '../constants/appData';
import { updateStudent, watchStudentRoutines, watchStudents } from '../features/routines/data';
import { formatDate, friendlyError, isStudentActive } from '../features/routines/model';
import { Empty, Field, Modal, Notice, Workspace } from '../features/routines/Workspace';
import RoutineEditor from '../features/routines/RoutineEditor';
import RoutineViewer from '../features/routines/RoutineViewer';
import { PickGenericRoutine } from '../features/routines/AssignRoutine';

function StudentForm({ student, actor, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: student.nombre || '', dni: student.dni || '', telefono: student.telefono || '', objetivo: student.objetivo || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) { setError('Ingresá el nombre del alumno.'); return; }
    setBusy(true); setError('');
    try { await updateStudent(student.id, Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])), actor); onSaved('Datos del alumno actualizados.'); onClose(); }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title="Editar alumno" onClose={onClose} busy={busy}><form onSubmit={save}><Notice error>{error}</Notice><p className="training-muted">Cuenta vinculada: {student.email || student.userId || 'Pendiente de vinculación por el administrador'}</p>
    <fieldset className="training-fieldset" disabled={busy}>{[['nombre', 'Nombre completo'], ['dni', 'DNI'], ['telefono', 'Teléfono'], ['objetivo', 'Objetivo']].map(([key, label]) => <Field key={key} label={label}><input className="form-input" required={key === 'nombre'} maxLength={key === 'objetivo' ? 300 : 120} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></Field>)}</fieldset>
    <div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div></form></Modal>;
}

function StudentRoutines({ student, actor, mode, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const studentId = student.id;
  const sedeId = student.sedeId;
  useEffect(() => watchStudentRoutines(studentId, sedeId, (rows) => { setItems(rows); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); }), [studentId, sedeId]);
  const published = items.filter((item) => item.estado === 'publicada').sort((a, b) => (b.publicadoEn?.toMillis?.() || 0) - (a.publicadoEn?.toMillis?.() || 0));
  if (loading || error) return <Modal title={`Rutinas · ${student.nombre}`} onClose={onClose}><Notice error>{error}</Notice>{loading && <p role="status">Cargando rutinas…</p>}</Modal>;
  if (mode === 'edit') return <RoutineEditor student={student} actor={actor} draft={items.find((item) => item.id === `borrador_${student.id}`)} published={published.find((item) => item.id === student.rutinaActivaId) || published[0]} onClose={onClose} onSaved={onSaved} />;
  const current = published.find((item) => item.id === selected) || published.find((item) => item.id === student.rutinaActivaId) || published[0];
  return <Modal title={`Historial · ${student.nombre}`} onClose={onClose} wide>{!published.length ? <Empty title="Todavía no hay publicaciones">Las rutinas aparecerán aquí después de publicarlas.</Empty> : <>
    <Field label="Versión publicada"><select className="form-input" value={current.id} onChange={(event) => setSelected(event.target.value)}>{published.map((item) => <option key={item.id} value={item.id}>{item.id === student.rutinaActivaId ? 'Activa · ' : ''}{item.nombre} · {formatDate(item.publicadoEn)} · {item.id.slice(-6)}</option>)}</select></Field><RoutineViewer key={current.id} data={current} /></>}</Modal>;
}

export default function ProfesorDashboard() {
  const { currentUser, userProfile, activeSede } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('activos');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const sedeId = activeSede?.id;
  const uid = currentUser.uid;
  const admin = userProfile.rol === 'admin';
  useEffect(() => {
    setStudents([]); setLoading(true); setError(''); setDialog(null);
    if (!sedeId) { setLoading(false); return; }
    return watchStudents({ uid, sedeId, admin }, (rows) => { setStudents(rows); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); });
  }, [uid, sedeId, admin]);
  const filtered = useMemo(() => students.filter((student) => {
    const matches = `${student.nombre || ''} ${student.dni || ''} ${student.email || ''}`.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'));
    return matches && (status === 'todos' || (status === 'activos' ? isStudentActive(student) : !isStudentActive(student)));
  }).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')), [students, search, status]);
  const open = (mode, student) => { setDialog({ mode, student }); setActionError(''); };
  const deactivate = async () => {
    setBusy(true); setActionError('');
    try { await updateStudent(dialog.student.id, { activo: false, active: false, estado: 'Baja' }, userProfile); setNotice('Alumno dado de baja. Sus datos y rutinas se conservaron.'); setDialog(null); }
    catch (err) { setActionError(friendlyError(err)); } finally { setBusy(false); }
  };
  const selectedCurrent = dialog && students.find((item) => item.id === dialog.student.id);
  const canEdit = selectedCurrent && isStudentActive(selectedCurrent);
  return <Workspace><header className="header-bar"><div><span className="training-eyebrow">PANEL DEL PROFESOR</span><h1>Alumnos</h1><p className="training-muted">Planificá cada etapa y acompañá su entrenamiento.</p></div><SedeSwitcher /></header>
    <Notice error>{error}</Notice><Notice>{notice}</Notice>
    <div className="training-stats"><section className="training-card"><Users size={21} /><strong>{students.filter(isStudentActive).length}</strong><span>Alumnos activos {admin ? 'en la sede' : 'asignados'}</span></section><section className="training-card"><BookOpen size={21} /><strong>{students.filter((item) => isStudentActive(item) && item.rutinaActivaId).length}</strong><span>Con rutina publicada</span></section><section className="training-card"><Archive size={21} /><strong>{students.filter((item) => !isStudentActive(item)).length}</strong><span>Alumnos dados de baja</span></section></div>
    <div className="training-toolbar"><Field label="Buscar alumno"><div className="training-search"><Search size={18} /><input className="form-input" placeholder="Nombre, DNI o correo" value={search} onChange={(event) => setSearch(event.target.value)} /></div></Field><Field label="Estado"><select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="activos">Activos</option><option value="baja">Dados de baja</option><option value="todos">Todos</option></select></Field><p className="training-muted">{getSedeLabel(sedeId) || 'Sin sede asignada'}</p></div>
    {loading ? <div className="training-empty" role="status">Cargando alumnos asignados…</div> : error ? null : !filtered.length ? <Empty title="No hay alumnos para mostrar">{search || status !== 'activos' ? 'Probá cambiando la búsqueda o el estado.' : 'El administrador debe asignarte alumnos en esta sede para comenzar.'}</Empty> : <div className="professor-student-list">{filtered.map((student) => <article className="training-card training-student training-student-row" key={student.id}>
      <div className="student-row-identity"><div className="training-avatar">{(student.nombre || 'A').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('')}</div><div><div className="student-row-name"><h2>{student.nombre || 'Alumno sin nombre'}</h2><span className={`training-badge ${!isStudentActive(student) ? 'is-inactive' : ''}`}>{isStudentActive(student) ? 'Activo' : 'Baja'}</span></div><p className="training-muted">DNI {student.dni || 'sin registrar'}</p><p className="training-student-email">{student.email || 'Correo sin registrar'}</p></div></div>
      <div className="student-row-plan"><div className="training-student-goal"><small>OBJETIVO</small><p>{student.objetivo || 'A definir con el alumno'}</p></div><div className="training-routine-status"><BookOpen size={16} />{student.rutinaActivaId ? 'Rutina publicada' : 'Sin rutina publicada'}</div></div>
      <div className="training-student-actions"><button className="btn-primary" disabled={!isStudentActive(student)} onClick={() => open('edit', student)}><Edit size={15} />{student.rutinaActivaId ? 'Editar rutina' : 'Crear rutina'}</button><button className="btn-secondary" disabled={!isStudentActive(student)} onClick={() => open('template', student)}><BookOpen size={15} />Asignar genérica</button><button className="btn-secondary" onClick={() => open('student', student)}>Editar alumno</button><button className="btn-secondary" onClick={() => open('history', student)}>Historial</button><button className="training-text-button is-danger" disabled={!isStudentActive(student)} onClick={() => open('deactivate', student)}>Dar de baja</button></div>
    </article>)}</div>}
    <p className="training-footnote">Podés crear una rutina propia o asignar una genérica y adaptarla a cada alumno.</p>
    {dialog?.mode === 'student' && selectedCurrent && <StudentForm student={selectedCurrent} actor={userProfile} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'template' && selectedCurrent && canEdit && <PickGenericRoutine student={selectedCurrent} actor={userProfile} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {['edit', 'history'].includes(dialog?.mode) && selectedCurrent && (dialog.mode === 'history' || canEdit) && <StudentRoutines student={selectedCurrent} actor={userProfile} mode={dialog.mode} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'edit' && selectedCurrent && !canEdit && <Modal title="Alumno dado de baja" onClose={() => setDialog(null)}><p>El alumno fue dado de baja. Sus rutinas se conservan en el historial.</p></Modal>}
    {dialog?.mode === 'deactivate' && selectedCurrent && <Modal title="Dar de baja al alumno" onClose={() => setDialog(null)} busy={busy}><Notice error>{actionError}</Notice><p>¿Querés dar de baja a <strong>{selectedCurrent.nombre}</strong>? Se conservarán sus datos e historial y no se podrán publicar nuevas rutinas mientras esté de baja.</p><div className="training-modal-actions"><button className="btn-secondary" disabled={busy} onClick={() => setDialog(null)}>Cancelar</button><button className="btn-primary" disabled={busy} onClick={deactivate}>{busy ? 'Guardando…' : 'Confirmar baja'}</button></div></Modal>}
  </Workspace>;
}
