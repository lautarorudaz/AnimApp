import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Check, ClipboardList, Dumbbell, Edit3, Home, LogOut, Search, UserRound, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SedeSwitcher from '../components/SedeSwitcher';
import { useAuth } from '../context/auth';
import { db } from '../firebase/config';

const EMPTY_ROUTINE = {
  nombre: 'Rutina personalizada',
  objetivo: '',
  frecuenciaSemanal: '3',
  indicaciones: '',
  ejercicios: ''
};

const getInitials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2)
  .map((part) => part[0]).join('').toUpperCase();

const ProfesorDashboard = () => {
  const { activeSede, currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [routineForm, setRoutineForm] = useState(EMPTY_ROUTINE);
  const activeSedeId = activeSede?.id;

  useEffect(() => {
    if (!activeSedeId || !currentUser?.uid) return undefined;
    setIsLoading(true);
    setError('');
    const assignedStudentsQuery = query(
      collection(db, 'alumnos'),
      where('sedeId', '==', activeSedeId),
      where('profesorId', '==', currentUser.uid)
    );
    return onSnapshot(assignedStudentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setIsLoading(false);
    }, (firebaseError) => {
      console.error('Error al cargar alumnos asignados:', firebaseError);
      setError(firebaseError.code === 'permission-denied'
        ? 'No tenés permisos para consultar los alumnos de esta sede.'
        : 'No pudimos cargar tus alumnos asignados.');
      setIsLoading(false);
    });
  }, [activeSedeId, currentUser?.uid]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeoutId = window.setTimeout(() => setFeedback(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase('es');
    return students.filter((student) => !search || [student.nombre, student.dni, student.email]
      .some((value) => String(value || '').toLocaleLowerCase('es').includes(search)));
  }, [searchTerm, students]);

  const metrics = useMemo(() => ({
    assigned: students.length,
    withoutRoutine: students.filter((student) => !student.rutinaId).length,
    active: students.filter((student) => student.activo !== false).length
  }), [students]);

  const openRoutine = (student) => {
    setSelectedStudent(student);
    setError('');
    setRoutineForm({
      nombre: student.rutinaNombre || 'Rutina personalizada',
      objetivo: student.objetivo || '',
      frecuenciaSemanal: student.frecuenciaSemanal || '3',
      indicaciones: student.rutinaIndicaciones || '',
      ejercicios: student.rutinaEjercicios || ''
    });
  };

  const closeRoutine = () => {
    if (isSaving) return;
    setSelectedStudent(null);
  };

  const saveRoutine = async (event) => {
    event.preventDefault();
    if (!selectedStudent || !activeSedeId || !currentUser?.uid) return;
    const routineId = selectedStudent.id;
    const exerciseList = routineForm.ejercicios.split('\n').map((item) => item.trim()).filter(Boolean);
    setIsSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'rutinas', routineId), {
        alumnoId: selectedStudent.id,
        alumnoUserId: selectedStudent.userId || '',
        alumnoNombre: selectedStudent.nombre,
        profesorId: currentUser.uid,
        profesorNombre: userProfile?.nombre || userProfile?.email,
        sedeId: activeSedeId,
        nombre: routineForm.nombre.trim(),
        objetivo: routineForm.objetivo.trim(),
        frecuenciaSemanal: Number(routineForm.frecuenciaSemanal),
        indicaciones: routineForm.indicaciones.trim(),
        ejercicios: exerciseList,
        activa: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await updateDoc(doc(db, 'alumnos', selectedStudent.id), {
        rutinaId,
        rutinaNombre: routineForm.nombre.trim(),
        objetivo: routineForm.objetivo.trim(),
        frecuenciaSemanal: routineForm.frecuenciaSemanal,
        rutinaIndicaciones: routineForm.indicaciones.trim(),
        rutinaEjercicios: exerciseList.join('\n'),
        rutinaActualizadaAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });
      setFeedback(`La rutina de ${selectedStudent.nombre} quedó guardada.`);
      setSelectedStudent(null);
    } catch (firebaseError) {
      console.error('Error al guardar rutina:', firebaseError);
      setError(firebaseError.code === 'permission-denied'
        ? 'No tenés permisos para modificar la rutina de este alumno.'
        : 'No pudimos guardar la rutina. Intentá nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-layout reception-dashboard professor-dashboard">
      <aside className="sidebar reception-sidebar professor-sidebar">
        <div>
          <div className="reception-brand"><div className="logo-icon"><Dumbbell size={21} /></div><div><strong>ANIMAPP</strong><span>Profesor</span></div></div>
          <nav className="reception-nav" aria-label="Navegación del profesor">
            <button type="button" className="reception-nav-item active"><Users size={19} /> Mis alumnos</button>
            <button type="button" className="reception-nav-item" onClick={() => navigate('/')}><Home size={19} /> Sitio informativo</button>
          </nav>
        </div>
        <div className="reception-session"><div className="reception-user"><span>{getInitials(userProfile?.nombre)}</span><div><strong>{userProfile?.nombre}</strong><small>{userProfile?.email}</small></div></div><button type="button" onClick={logout}><LogOut size={18} /> Cerrar sesión</button></div>
      </aside>

      <main className="main-content reception-main professor-main">
        {error && !selectedStudent && <div className="reception-alert error" role="alert">{error}</div>}
        <header className="reception-header"><div><span>Panel del profesor</span><h1>Mis alumnos</h1><p>Alumnos asignados y rutinas de {activeSede?.titulo || 'la sede'}.</p></div><div className="reception-header-actions"><SedeSwitcher /></div></header>
        <section className="reception-metrics" aria-label="Resumen de alumnos"><article><Users size={20} /><span>Asignados</span><strong>{metrics.assigned}</strong></article><article><UserRound size={20} /><span>Activos</span><strong>{metrics.active}</strong></article><article className={metrics.withoutRoutine ? 'warning' : ''}><ClipboardList size={20} /><span>Sin rutina</span><strong>{metrics.withoutRoutine}</strong></article></section>

        <section className="professor-workspace">
          <div className="reception-toolbar"><label className="reception-search"><Search size={18} /><span className="sr-only">Buscar alumnos</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, DNI o correo" /></label></div>
          <div className="professor-student-grid">
            {isLoading ? <div className="professor-empty"><span className="reception-loader" />Cargando alumnos...</div> : filteredStudents.length === 0 ? <div className="professor-empty"><Users size={32} /><strong>No tenés alumnos asignados en esta sede</strong><span>Recepción debe seleccionar tu cuenta como profesor a cargo.</span></div> : filteredStudents.map((student) => <article className="professor-student-card" key={student.id}>
              <header><div className="reception-person"><span>{getInitials(student.nombre)}</span><div><strong>{student.nombre}</strong><small>DNI {student.dni || 'pendiente'}</small></div></div><span className={student.activo === false ? 'reception-status' : 'reception-status active'}><i />{student.activo === false ? 'Inactivo' : 'Activo'}</span></header>
              <div className="professor-student-data"><span>Contacto<strong>{student.telefono || student.email || 'Sin datos'}</strong></span><span>Objetivo<strong>{student.objetivo || 'A definir'}</strong></span></div>
              <div className={student.rutinaId ? 'professor-routine-state ready' : 'professor-routine-state'}><ClipboardList size={18} /><div><small>{student.rutinaId ? 'Rutina activa' : 'Pendiente'}</small><strong>{student.rutinaNombre || 'Sin rutina creada'}</strong></div></div>
              <button type="button" className="reception-primary" onClick={() => openRoutine(student)}><Edit3 size={17} /> {student.rutinaId ? 'Editar rutina' : 'Crear rutina'}</button>
            </article>)}
          </div>
        </section>
      </main>

      {selectedStudent && <div className="reception-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRoutine(); }}><section className="reception-modal professor-routine-modal" role="dialog" aria-modal="true" aria-labelledby="routine-title"><header><div><span>Plan de entrenamiento</span><h2 id="routine-title">Rutina de {selectedStudent.nombre}</h2></div><button type="button" onClick={closeRoutine} aria-label="Cerrar" title="Cerrar"><X size={21} /></button></header><form onSubmit={saveRoutine}>{error && <div className="reception-alert error" role="alert">{error}</div>}<div className="reception-form-grid">
        <label><span>Nombre de la rutina *</span><input value={routineForm.nombre} onChange={(event) => setRoutineForm({ ...routineForm, nombre: event.target.value })} required /></label>
        <label><span>Frecuencia semanal *</span><select value={routineForm.frecuenciaSemanal} onChange={(event) => setRoutineForm({ ...routineForm, frecuenciaSemanal: event.target.value })}>{['1', '2', '3', '4', '5', '6'].map((days) => <option key={days} value={days}>{days} {days === '1' ? 'día' : 'días'}</option>)}</select></label>
        <label className="wide"><span>Objetivo principal *</span><input value={routineForm.objetivo} onChange={(event) => setRoutineForm({ ...routineForm, objetivo: event.target.value })} placeholder="Ej.: fuerza e hipertrofia" required /></label>
        <label className="wide"><span>Ejercicios *</span><textarea rows="7" value={routineForm.ejercicios} onChange={(event) => setRoutineForm({ ...routineForm, ejercicios: event.target.value })} placeholder={'Un ejercicio por línea. Ejemplo:\nSentadilla — 4 x 10\nPress banca — 4 x 8'} required /></label>
        <label className="wide"><span>Indicaciones generales</span><textarea rows="3" value={routineForm.indicaciones} onChange={(event) => setRoutineForm({ ...routineForm, indicaciones: event.target.value })} placeholder="Descansos, técnica, progresión u observaciones" /></label>
      </div><footer><button type="button" className="reception-secondary" onClick={closeRoutine} disabled={isSaving}>Cancelar</button><button type="submit" className="reception-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar rutina'}</button></footer></form></section></div>}
      {feedback && <div className="reception-toast" role="status"><Check size={18} />{feedback}</div>}
    </div>
  );
};

export default ProfesorDashboard;
