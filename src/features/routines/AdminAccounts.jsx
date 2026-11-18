import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { SEDES, getSedeLabel } from '../../constants/appData';
import { assignStudent, createAccount, linkExistingStudent, reactivateStudent, watchAdminCollection } from './adminData';
import { friendlyError, isStudentActive } from './model';
import { Empty, Field, Modal, Notice } from './Workspace';

function AccountForm({ users, student, onClose, onSaved }) {
  const isPendingStudent = Boolean(student);
  const [form, setForm] = useState({
    nombre: student?.nombre || '',
    email: student?.email || '',
    password: '',
    rol: 'alumno',
    sedes: student?.sedeId ? [student.sedeId] : [],
    profesores: student?.sedeId ? { [student.sedeId]: student.profesorId || '' } : {},
    dni: student?.dni || '',
    telefono: student?.telefono || ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!form.nombre.trim() || !form.sedes.length) { setError('Completá el nombre y elegí al menos una sede.'); return; }
    setBusy(true);
    try {
      await createAccount(form);
      onSaved(isPendingStudent ? 'Acceso creado y vinculado con la ficha del alumno.' : 'Cuenta y ficha creadas. La sesión del administrador sigue activa.');
      onClose();
    }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title={isPendingStudent ? `Crear acceso · ${student.nombre}` : 'Crear cuenta'} onClose={onClose} busy={busy}><form onSubmit={submit}><Notice error>{error}</Notice>{isPendingStudent && <p className="training-muted">Se creará la cuenta de Authentication y se vinculará con esta ficha de Firestore. El alumno podrá ingresar a su vista con este correo.</p>}<fieldset disabled={busy} className="training-fieldset">
    {!isPendingStudent && <Field label="Rol"><select className="form-input" value={form.rol} onChange={(event) => set('rol', event.target.value)}><option value="alumno">Alumno</option><option value="profesor">Profesor</option><option value="recepcionista">Recepcionista</option></select></Field>}
    <Field label="Nombre completo"><input required className="form-input" maxLength={120} value={form.nombre} onChange={(event) => set('nombre', event.target.value)} /></Field>
    <Field label="Correo electrónico"><input required readOnly={isPendingStudent} className="form-input" type="email" autoComplete="off" value={form.email} onChange={(event) => set('email', event.target.value)} /></Field>
    <Field label="Contraseña inicial"><input required className="form-input" type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => set('password', event.target.value)} /></Field>
    {form.rol === 'alumno' && <div className="training-form-grid"><Field label="DNI"><input className="form-input" maxLength={20} value={form.dni} onChange={(event) => set('dni', event.target.value)} /></Field><Field label="Teléfono"><input className="form-input" maxLength={50} value={form.telefono} onChange={(event) => set('telefono', event.target.value)} /></Field></div>}
    {isPendingStudent ? <p className="training-muted">Sede habilitada: <strong>{getSedeLabel(student.sedeId)}</strong></p> : <><p className="training-muted">Sedes habilitadas</p><div className="training-admin-sedes">{SEDES.map((sede) => <label key={sede.id}><input type="checkbox" checked={form.sedes.includes(sede.id)} onChange={(event) => set('sedes', event.target.checked ? [...form.sedes, sede.id] : form.sedes.filter((id) => id !== sede.id))} />{sede.nombre}</label>)}</div></>}
    {form.rol === 'alumno' && form.sedes.map((sedeId) => <Field key={sedeId} label={`Profesor · ${getSedeLabel(sedeId)}`}><select className="form-input" value={form.profesores[sedeId] || ''} onChange={(event) => set('profesores', { ...form.profesores, [sedeId]: event.target.value })}><option value="">Asignar después</option>{users.filter((user) => user.rol === 'profesor' && isStudentActive(user) && (user.sedes || user.sedeIds || []).includes(sedeId)).map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select></Field>)}
  </fieldset><div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy}>{busy ? 'Creando…' : isPendingStudent ? 'Crear acceso' : 'Crear cuenta'}</button></div></form></Modal>;
}

function AssignmentForm({ student, users, onClose, onSaved }) {
  const [teacherId, setTeacherId] = useState(student.profesorId || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const teachers = users.filter((user) => user.rol === 'profesor' && isStudentActive(user) && (user.sedes || user.sedeIds || []).includes(student.sedeId));
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await assignStudent(student, teacherId, users.find((user) => user.id === teacherId)); onSaved('Asignación actualizada.'); onClose(); }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title={`Asignar profesor · ${student.nombre}`} onClose={onClose} busy={busy}><form onSubmit={save}><Notice error>{error}</Notice><p className="training-muted">{getSedeLabel(student.sedeId)} · Las rutinas anteriores se conservan.</p><Field label="Profesor asignado"><select className="form-input" disabled={busy} value={teacherId} onChange={(event) => setTeacherId(event.target.value)}><option value="">Sin asignar</option>{teacherId && !teachers.some((teacher) => teacher.id === teacherId) && <option value={teacherId} disabled>Profesor actual no disponible</option>}{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nombre}</option>)}</select></Field><div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar asignación'}</button></div></form></Modal>;
}

function LinkStudentForm({ users, students, student, onClose, onSaved }) {
  const initialSedeId = student?.sedeId || SEDES[0].id;
  const normalizedStudentEmail = (student?.email || '').trim().toLowerCase();
  const canUseAtSite = (user, sedeId) => user.rol === 'alumno'
    && !students.some((item) => item.userId === user.id && item.sedeId === sedeId)
    && (!student || (user.email || '').trim().toLowerCase() === normalizedStudentEmail);
  const [userId, setUserId] = useState(users.find((user) => canUseAtSite(user, initialSedeId))?.id || '');
  const [sedeId, setSedeId] = useState(initialSedeId);
  const [teacherId, setTeacherId] = useState(student?.profesorId || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const available = users.filter((user) => canUseAtSite(user, sedeId));
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const user = available.find((item) => item.id === userId);
      if (!user) throw new Error('Elegí una cuenta de alumno para vincular.');
      await linkExistingStudent({ user, sedeId, profesorId: teacherId, dni: student?.dni || '', telefono: student?.telefono || '' });
      onSaved('Cuenta vinculada con su ficha de alumno.'); onClose();
    } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title={student ? `Vincular acceso · ${student.nombre}` : 'Vincular cuenta de alumno existente'} onClose={onClose} busy={busy}><form onSubmit={save}><Notice error>{error}</Notice><p className="training-muted">{student ? `Elegí el perfil de alumno que ya usa ${student.email}.` : 'Usá esta opción para cuentas que ya tienen perfil de alumno en «users» o para agregar otra sede.'}</p>{student && !available.length && <Notice error>No hay una cuenta de alumno con el mismo correo. Si todavía no existe, usá «Crear acceso».</Notice>}<fieldset className="training-fieldset" disabled={busy}>
    {student ? <p className="training-muted">Sede: <strong>{getSedeLabel(sedeId)}</strong></p> : <Field label="Sede"><select className="form-input" value={sedeId} onChange={(event) => { setSedeId(event.target.value); setTeacherId(''); setUserId(''); }}>{SEDES.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}</select></Field>}
    <Field label="Cuenta de alumno"><select className="form-input" required value={userId} onChange={(event) => setUserId(event.target.value)}><option value="">{available.length ? 'Seleccionar cuenta' : 'No hay cuentas disponibles'}</option>{available.map((user) => <option key={user.id} value={user.id}>{user.nombre} · {user.email}</option>)}</select></Field>
    <Field label="Profesor"><select className="form-input" value={teacherId} onChange={(event) => setTeacherId(event.target.value)}><option value="">Sin asignar</option>{users.filter((user) => user.rol === 'profesor' && isStudentActive(user) && (user.sedes || user.sedeIds || []).includes(sedeId)).map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select></Field>
  </fieldset><div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy || !userId}>{busy ? 'Vinculando…' : 'Vincular alumno'}</button></div></form></Modal>;
}

export default function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loaded, setLoaded] = useState({ users: false, students: false });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('students');
  const [dialog, setDialog] = useState(null);
  const [reactivating, setReactivating] = useState('');
  useEffect(() => {
    const stopUsers = watchAdminCollection('users', (items) => { setUsers(items); setLoaded((old) => ({ ...old, users: true })); }, (err) => setError(friendlyError(err)));
    const stopStudents = watchAdminCollection('alumnos', (items) => { setStudents(items); setLoaded((old) => ({ ...old, students: true })); }, (err) => setError(friendlyError(err)));
    return () => { stopUsers(); stopStudents(); };
  }, []);
  const rows = (tab === 'students' ? students : users.filter((user) => ['profesor', 'recepcionista'].includes(user.rol))).filter((item) => `${item.nombre || ''} ${item.email || ''} ${item.dni || ''}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')));
  const reactivate = async (studentId) => {
    setReactivating(studentId); setError('');
    try { await reactivateStudent(studentId); setNotice('Alumno reactivado. Se conservaron sus rutinas y asignación.'); }
    catch (err) { setError(friendlyError(err)); } finally { setReactivating(''); }
  };
  return <><header className="header-bar"><div><span className="training-eyebrow">ADMINISTRACIÓN</span><h1>Personas y asignaciones</h1><p className="training-muted">Administrá las cuentas y el vínculo entre alumnos, profesores y sedes.</p></div><div className="training-actions"><Link className="btn-secondary" to="/profesor">Ver panel profesor</Link><button className="btn-primary" onClick={() => setDialog({ mode: 'create' })}><Plus size={16} />Crear cuenta</button></div></header>
    <Notice error>{error}</Notice><Notice>{notice}</Notice><div className="training-tabs"><button className={tab === 'students' ? 'is-selected' : ''} onClick={() => setTab('students')}>Alumnos ({students.length})</button><button className={tab === 'staff' ? 'is-selected' : ''} onClick={() => setTab('staff')}>Personal ({users.filter((user) => ['profesor', 'recepcionista'].includes(user.rol)).length})</button></div>
    <div className="training-toolbar"><Field label="Buscar persona"><div className="training-search"><Search size={18} /><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, correo o DNI" /></div></Field>{tab === 'students' && <button className="btn-secondary" onClick={() => setDialog({ mode: 'link' })}>Vincular cuenta existente</button>}</div>
    {!loaded.users || !loaded.students ? !error && <p role="status">Cargando personas…</p> : !rows.length ? <Empty title="No hay personas para mostrar">Creá una cuenta o vinculá un alumno existente para comenzar.</Empty> : <div className="training-student-grid">{rows.map((item) => <article className="training-card" key={item.id}><Users size={20} className="training-accent" /><h2>{item.nombre || 'Sin nombre'}</h2><p className="training-muted">{item.email || 'Sin correo'}</p><div className="training-actions"><span className={`training-badge${tab === 'students' && !isStudentActive(item) ? ' is-inactive' : ''}`}>{tab === 'students' ? isStudentActive(item) ? 'Alumno activo' : 'Alumno de baja' : item.rol}</span>{tab === 'students' && <span className={`training-badge${item.userId ? '' : ' is-inactive'}`}>{item.userId ? 'Acceso vinculado' : 'Acceso pendiente'}</span>}</div>
      {tab === 'students' ? <><p className="training-muted">{getSedeLabel(item.sedeId)}</p><p className="training-assignment">Profesor: {users.find((user) => user.id === item.profesorId)?.nombre || (item.profesorId ? 'Cuenta no encontrada' : 'Sin asignar')}</p><div className="training-actions">{!item.userId && <><button className="btn-primary" onClick={() => setDialog({ mode: 'create-access', student: item })}>Crear acceso</button><button className="btn-secondary" onClick={() => setDialog({ mode: 'link', student: item })}>Vincular cuenta</button></>}<button className="btn-secondary" onClick={() => setDialog({ mode: 'assign', student: item })}>Asignar profesor</button>{!isStudentActive(item) && <button className="btn-secondary" disabled={!!reactivating} onClick={() => reactivate(item.id)}>{reactivating === item.id ? 'Guardando…' : 'Reactivar alumno'}</button>}</div></> : <p className="training-assignment">{(item.sedes || item.sedeIds || []).map(getSedeLabel).join(' · ') || 'Sin sedes asignadas'}</p>}
    </article>)}</div>}
    {dialog?.mode === 'create' && <AccountForm users={users} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'create-access' && <AccountForm users={users} student={dialog.student} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'assign' && <AssignmentForm student={dialog.student} users={users} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'link' && <LinkStudentForm users={users} students={students} student={dialog.student} onClose={() => setDialog(null)} onSaved={setNotice} />}
  </>;
}
