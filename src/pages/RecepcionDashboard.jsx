import { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Check, Edit3, Home, LogOut, Package, Search, Trash2, UserCheck, UserPlus, UserRound, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SedeSwitcher from '../components/SedeSwitcher';
import { useAuth } from '../context/auth';
import { db } from '../firebase/config';

const EMPTY_STUDENT = {
  nombre: '', dni: '', fechaNacimiento: '', email: '', telefono: '', direccion: '',
  fechaIngreso: new Date().toISOString().slice(0, 10), profesorAsignado: 'Sin asignar',
  profesorId: '', activo: true, observaciones: ''
};

const getInitials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2)
  .map((part) => part[0]).join('').toUpperCase();

const getFirebaseError = (error, fallback) => {
  if (error?.code === 'permission-denied') return 'No tenés permisos para operar sobre esta sede.';
  if (error?.code === 'unavailable') return 'No hay conexión con Firebase. Revisá internet e intentá nuevamente.';
  return fallback;
};

const RecepcionDashboard = () => {
  const { activeSede, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [professorAccounts, setProfessorAccounts] = useState([]);
  const [professorLoadError, setProfessorLoadError] = useState('');
  const [studentAccounts, setStudentAccounts] = useState([]);
  const pendingBackfills = useRef(new Set());
  const activeSedeId = activeSede?.id;

  useEffect(() => {
    if (!activeSedeId) return undefined;
    setIsLoading(true);
    setError('');
    const studentsQuery = query(collection(db, 'alumnos'), where('sedeId', '==', activeSedeId));
    return onSnapshot(studentsQuery, (snapshot) => {
      const nextStudents = snapshot.docs.map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() }))
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
      setStudents(nextStudents);
      setIsLoading(false);
    }, (firebaseError) => {
      console.error('Error al cargar alumnos:', firebaseError);
      setStudents([]);
      setError(getFirebaseError(firebaseError, 'No pudimos cargar los alumnos de esta sede.'));
      setIsLoading(false);
    });
  }, [activeSedeId]);

  useEffect(() => {
    if (!activeSedeId) return undefined;
    const studentAccountsQuery = query(
      collection(db, 'users'),
      where('rol', '==', 'alumno'),
      where('activo', '==', true),
      where('sedeIds', 'array-contains', activeSedeId)
    );
    return onSnapshot(studentAccountsQuery, (snapshot) => {
      setStudentAccounts(snapshot.docs
        .map((accountDoc) => ({ id: accountDoc.id, ...accountDoc.data() }))
        .filter((account) => account.activo !== false && !account.eliminado));
    }, (firebaseError) => {
      console.error('Error al sincronizar cuentas de alumnos:', firebaseError);
      setStudentAccounts([]);
    });
  }, [activeSedeId]);

  useEffect(() => {
    if (!activeSedeId) return;
    const linkedUserIds = new Set(students.map((student) => student.userId || student.id));
    studentAccounts.filter((account) => (
      !linkedUserIds.has(account.id) && !pendingBackfills.current.has(account.id)
    )).forEach((account) => {
      pendingBackfills.current.add(account.id);
      setDoc(doc(db, 'alumnos', account.id), {
        userId: account.id,
        nombre: account.nombre,
        dni: '',
        email: account.email,
        telefono: account.telefono || '',
        direccion: '',
        fechaNacimiento: '',
        fechaIngreso: new Date().toISOString().slice(0, 10),
        profesorId: '',
        profesorAsignado: 'Sin asignar',
        activo: true,
        observaciones: 'Ficha sincronizada desde la cuenta creada por Administración.',
        sedeId: activeSedeId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile?.uid || ''
      }).catch((firebaseError) => {
        pendingBackfills.current.delete(account.id);
        console.error('Error al crear ficha faltante:', firebaseError);
        setError(getFirebaseError(firebaseError, `No pudimos sincronizar a ${account.nombre}.`));
      });
    });
  }, [activeSedeId, studentAccounts, students, userProfile?.uid]);

  useEffect(() => {
    if (!activeSedeId) return undefined;
    const professorsQuery = query(
      collection(db, 'users'),
      where('rol', '==', 'profesor'),
      where('activo', '==', true),
      where('sedeIds', 'array-contains', activeSedeId)
    );
    return onSnapshot(professorsQuery, (snapshot) => {
      setProfessorLoadError('');
      setProfessorAccounts(snapshot.docs
        .map((professorDoc) => ({ id: professorDoc.id, ...professorDoc.data() }))
        .filter((professor) => professor.activo !== false && !professor.eliminado)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    }, (firebaseError) => {
      console.error('Error al cargar profesores:', firebaseError);
      setProfessorAccounts([]);
      setProfessorLoadError('No pudimos cargar los profesores de esta sede.');
    });
  }, [activeSedeId]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeoutId = window.setTimeout(() => setFeedback(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (!isFormOpen && !studentToDelete) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event) => {
      if (event.key !== 'Escape' || isSaving) return;
      setIsFormOpen(false);
      setStudentToDelete(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFormOpen, isSaving, studentToDelete]);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase('es');
    return students.filter((student) => {
      const matchesStatus = statusFilter === 'todos'
        || (statusFilter === 'activos' ? student.activo !== false : student.activo === false);
      const matchesSearch = !search || [student.nombre, student.dni, student.email, student.telefono]
        .some((value) => String(value || '').toLocaleLowerCase('es').includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, statusFilter, students]);

  const metrics = useMemo(() => ({
    total: students.length,
    activos: students.filter((student) => student.activo !== false).length,
    sinProfesor: students.filter((student) => !student.profesorId).length
  }), [students]);

  const openCreateForm = () => {
    setEditingStudent(null);
    setStudentForm({ ...EMPTY_STUDENT, fechaIngreso: new Date().toISOString().slice(0, 10) });
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setStudentForm({ ...EMPTY_STUDENT, ...student, fechaNacimiento: student.fechaNacimiento || '', fechaIngreso: student.fechaIngreso || '' });
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    if (!activeSedeId) return;
    const normalizedDni = studentForm.dni.replace(/\D/g, '');
    if (students.some((student) => student.id !== editingStudent?.id && student.dni === normalizedDni)) {
      setError('Ya existe un alumno con ese DNI en esta sede.');
      return;
    }
    const payload = {
      nombre: studentForm.nombre.trim(), dni: normalizedDni,
      fechaNacimiento: studentForm.fechaNacimiento, email: studentForm.email.trim().toLocaleLowerCase('es'),
      telefono: studentForm.telefono.trim(), direccion: studentForm.direccion.trim(),
      fechaIngreso: studentForm.fechaIngreso,
      profesorId: studentForm.profesorId,
      profesorAsignado: professorAccounts.find((professor) => professor.id === studentForm.profesorId)?.nombre || 'Sin asignar',
      activo: studentForm.activo,
      observaciones: studentForm.observaciones.trim(), sedeId: activeSedeId,
      updatedAt: serverTimestamp(), updatedBy: userProfile?.uid || ''
    };
    setIsSaving(true);
    setError('');
    try {
      if (editingStudent) {
        await updateDoc(doc(db, 'alumnos', editingStudent.id), payload);
        setFeedback('Los datos del alumno se actualizaron correctamente.');
      } else {
        await addDoc(collection(db, 'alumnos'), { ...payload, createdAt: serverTimestamp(), createdBy: userProfile?.uid || '' });
        setFeedback('El alumno quedó registrado en la sede.');
      }
      setIsFormOpen(false);
      setEditingStudent(null);
    } catch (firebaseError) {
      console.error('Error al guardar alumno:', firebaseError);
      setError(getFirebaseError(firebaseError, 'No pudimos guardar el alumno. Revisá los datos e intentá nuevamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStudent = async () => {
    if (!studentToDelete) return;
    setIsSaving(true);
    setError('');
    try {
      await deleteDoc(doc(db, 'alumnos', studentToDelete.id));
      setFeedback(`${studentToDelete.nombre} fue eliminado de la sede.`);
      setStudentToDelete(null);
    } catch (firebaseError) {
      console.error('Error al eliminar alumno:', firebaseError);
      setError(getFirebaseError(firebaseError, 'No pudimos eliminar el alumno.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-layout reception-dashboard">
      <aside className="sidebar reception-sidebar">
        <div>
          <div className="reception-brand"><div className="logo-icon"><UserCheck size={21} /></div><div><strong>ANIMAPP</strong><span>Recepción</span></div></div>
          <nav className="reception-nav" aria-label="Navegación de recepción">
            <button type="button" className="reception-nav-item active"><Users size={19} /> Gestión de alumnos</button>
            <button type="button" className="reception-nav-item" disabled title="Próximamente"><Package size={19} /> Stock <small>Próximamente</small></button>
            <button type="button" className="reception-nav-item" onClick={() => navigate('/')}><Home size={19} /> Sitio informativo</button>
          </nav>
        </div>
        <div className="reception-session"><div className="reception-user"><span>{getInitials(userProfile?.nombre)}</span><div><strong>{userProfile?.nombre}</strong><small>{userProfile?.email}</small></div></div><button type="button" onClick={logout}><LogOut size={18} /> Cerrar sesión</button></div>
      </aside>

      <main className="main-content reception-main">
        {error && !isFormOpen && <div className="reception-alert error" role="alert">{error}</div>}
        <header className="reception-header"><div><span>Panel de recepción</span><h1>Gestión de alumnos</h1><p>Altas, datos de contacto y asignación de profesores de {activeSede?.titulo || 'la sede'}.</p></div><div className="reception-header-actions"><SedeSwitcher /><button type="button" className="reception-primary" onClick={openCreateForm}><UserPlus size={19} /> Nuevo alumno</button></div></header>

        <section className="reception-metrics" aria-label="Resumen de alumnos">
          <article><Users size={20} /><span>Total registrados</span><strong>{metrics.total}</strong></article>
          <article><UserCheck size={20} /><span>Alumnos activos</span><strong>{metrics.activos}</strong></article>
          <article className={metrics.sinProfesor ? 'warning' : ''}><UserRound size={20} /><span>Sin profesor</span><strong>{metrics.sinProfesor}</strong></article>
        </section>

        <section className="reception-directory">
          <div className="reception-toolbar"><label className="reception-search"><Search size={18} /><span className="sr-only">Buscar alumnos</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, DNI, correo o teléfono" /></label><div className="reception-filters" role="group" aria-label="Filtrar por estado">{[['todos', 'Todos'], ['activos', 'Activos'], ['inactivos', 'Inactivos']].map(([value, label]) => <button type="button" key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)} aria-pressed={statusFilter === value}>{label}</button>)}</div></div>
          <div className="reception-table-scroll"><table className="reception-table"><thead><tr><th>Alumno</th><th>Contacto</th><th>Ingreso</th><th>Profesor</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
            {isLoading ? <tr><td colSpan="6" className="reception-empty"><span className="reception-loader" />Cargando alumnos...</td></tr> : filteredStudents.length === 0 ? <tr><td colSpan="6" className="reception-empty"><Users size={30} /><strong>No hay alumnos para mostrar</strong><span>{students.length ? 'Probá cambiando la búsqueda o el filtro.' : 'Registrá el primer alumno de esta sede.'}</span></td></tr> : filteredStudents.map((student) => <tr key={student.id}><td><div className="reception-person"><span>{getInitials(student.nombre)}</span><div><strong>{student.nombre}</strong><small>DNI {student.dni}</small></div></div></td><td><strong className="reception-contact">{student.email || 'Sin correo'}</strong><small>{student.telefono || 'Sin teléfono'}</small></td><td>{student.fechaIngreso || 'Sin registrar'}</td><td>{student.profesorAsignado || 'Sin asignar'}</td><td><span className={student.activo === false ? 'reception-status' : 'reception-status active'}><i />{student.activo === false ? 'Inactivo' : 'Activo'}</span></td><td><div className="reception-row-actions"><button type="button" onClick={() => openEditForm(student)} aria-label={`Editar a ${student.nombre}`} title="Editar"><Edit3 size={17} /></button><button type="button" className="danger" onClick={() => setStudentToDelete(student)} aria-label={`Eliminar a ${student.nombre}`} title="Eliminar"><Trash2 size={17} /></button></div></td></tr>)}
          </tbody></table></div>
        </section>
      </main>

      {isFormOpen && <div className="reception-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}><section className="reception-modal" role="dialog" aria-modal="true" aria-labelledby="student-form-title"><header><div><span>{editingStudent ? 'Editar registro' : 'Nuevo registro'}</span><h2 id="student-form-title">{editingStudent ? editingStudent.nombre : 'Registrar alumno'}</h2></div><button type="button" onClick={closeForm} aria-label="Cerrar" title="Cerrar"><X size={21} /></button></header><form onSubmit={saveStudent}>{error && <div className="reception-alert error" role="alert">{error}</div>}<div className="reception-form-grid">
        <label className="wide"><span>Nombre y apellido *</span><input type="text" value={studentForm.nombre} onChange={(event) => setStudentForm({ ...studentForm, nombre: event.target.value })} required autoFocus /></label>
        <label><span>DNI *</span><input type="text" inputMode="numeric" pattern="[0-9. ]{7,12}" value={studentForm.dni} onChange={(event) => setStudentForm({ ...studentForm, dni: event.target.value })} placeholder="Sin puntos" required /></label>
        <label><span>Fecha de nacimiento</span><input type="date" value={studentForm.fechaNacimiento} onChange={(event) => setStudentForm({ ...studentForm, fechaNacimiento: event.target.value })} /></label>
        <label><span>Correo electrónico</span><input type="email" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} placeholder="nombre@email.com" /></label>
        <label><span>Teléfono *</span><input type="tel" value={studentForm.telefono} onChange={(event) => setStudentForm({ ...studentForm, telefono: event.target.value })} required /></label>
        <label className="wide"><span>Dirección</span><input type="text" value={studentForm.direccion} onChange={(event) => setStudentForm({ ...studentForm, direccion: event.target.value })} /></label>
        <label><span>Fecha de ingreso *</span><input type="date" value={studentForm.fechaIngreso} onChange={(event) => setStudentForm({ ...studentForm, fechaIngreso: event.target.value })} required /></label>
        <label><span>Profesor a cargo</span><select value={studentForm.profesorId || ''} onChange={(event) => setStudentForm({ ...studentForm, profesorId: event.target.value })}><option value="">Sin asignar</option>{professorAccounts.map((professor) => <option key={professor.id} value={professor.id}>{professor.nombre}</option>)}</select>{professorLoadError && <small className="reception-field-error">{professorLoadError}</small>}</label>
        <label className="reception-check"><input type="checkbox" checked={studentForm.activo} onChange={(event) => setStudentForm({ ...studentForm, activo: event.target.checked })} /><span><strong>Alumno activo</strong><small>Puede entrenar normalmente.</small></span></label>
        <label className="wide"><span>Observaciones</span><textarea rows="3" value={studentForm.observaciones} onChange={(event) => setStudentForm({ ...studentForm, observaciones: event.target.value })} placeholder="Información adicional relevante" /></label>
      </div><footer><button type="button" className="reception-secondary" onClick={closeForm} disabled={isSaving}>Cancelar</button><button type="submit" className="reception-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : editingStudent ? 'Guardar cambios' : 'Registrar alumno'}</button></footer></form></section></div>}

      {studentToDelete && <div className="reception-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setStudentToDelete(null); }}><section className="reception-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-student-title"><div><Trash2 size={23} /></div><h2 id="delete-student-title">Eliminar alumno</h2><p>Vas a eliminar a <strong>{studentToDelete.nombre}</strong> de {activeSede?.titulo}. Esta acción no se puede deshacer.</p><footer><button type="button" className="reception-secondary" onClick={() => setStudentToDelete(null)} disabled={isSaving}>Cancelar</button><button type="button" className="reception-danger" onClick={deleteStudent} disabled={isSaving}>{isSaving ? 'Eliminando...' : 'Eliminar'}</button></footer></section></div>}
      {feedback && <div className="reception-toast" role="status"><Check size={18} />{feedback}</div>}
    </div>
  );
};

export default RecepcionDashboard;
