import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Edit,
  Home,
  LogOut,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import SedeSwitcher from '../components/SedeSwitcher';
import { getSedeLabel } from '../constants/appData';
import { useAuth } from '../context/auth';

const initialAlumnos = [
  {
    id: 'a1',
    nombre: 'Gonzalo Perez',
    dni: '39444111',
    email: 'gonzalo@gmail.com',
    telefono: '+54 9 11 5555-1111',
    sede: 'moreno',
    objetivo: 'Fuerza e hipertrofia',
    rutinaActiva: {
      nombre: 'Volumen A',
      fecha: '2026-08-10',
      semanas: [
        {
          nombre: 'Semana 1',
          dias: [
            {
              nombre: 'Dia 1 - Pecho y triceps',
              ejercicios: [
                { nombre: 'Press banca', series: '4', repeticiones: '10', peso: '70 kg', observaciones: 'Sin asistencia' }
              ]
            },
            {
              nombre: 'Dia 2 - Espalda y biceps',
              ejercicios: [
                { nombre: 'Dominadas', series: '4', repeticiones: '8', peso: 'Corporal', observaciones: 'Rango completo' }
              ]
            }
          ]
        }
      ]
    },
    historial: [
      { fecha: '2026-08-12', nota: 'Completo 4 series de 70 kg en press banca sin asistencia.', estado: 'Excelente' },
      { fecha: '2026-08-05', nota: 'Aumento de peso corporal: +1.5 kg este mes.', estado: 'En progreso' }
    ]
  },
  {
    id: 'a2',
    nombre: 'Camila Torres',
    dni: '41222999',
    email: 'camila@gmail.com',
    telefono: '+54 9 11 5555-2222',
    sede: 'edison',
    objetivo: 'Acondicionamiento fisico',
    rutinaActiva: null,
    historial: []
  },
  {
    id: 'a3',
    nombre: 'Roberto Sanchez',
    dni: '38111222',
    email: 'roberto@gmail.com',
    telefono: '+54 9 11 5555-3333',
    sede: 'general-san-martin',
    objetivo: 'Recomposicion corporal',
    rutinaActiva: null,
    historial: []
  }
];

const emptyAlumnoForm = {
  nombre: '',
  dni: '',
  email: '',
  telefono: '',
  objetivo: 'Fuerza e hipertrofia',
  sede: 'moreno'
};

const defaultRoutineForm = (student) => ({
  nombre: student?.rutinaActiva?.nombre || 'Rutina personalizada',
  objetivo: student?.objetivo || 'Fuerza e hipertrofia',
  semanas: student?.rutinaActiva?.semanas || [
    {
      nombre: 'Semana 1',
      dias: [
        {
          nombre: 'Dia 1 - Full body',
          ejercicios: [
            { nombre: 'Sentadilla', series: '4', repeticiones: '10', peso: '60 kg', observaciones: 'Priorizar tecnica' }
          ]
        }
      ]
    }
  ]
});

const ProfesorDashboard = () => {
  const { activeSede, logout } = useAuth();
  const navigate = useNavigate();

  const [alumnos, setAlumnos] = useState(initialAlumnos);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentForm, setStudentForm] = useState(emptyAlumnoForm);
  const [routineForm, setRoutineForm] = useState(defaultRoutineForm(null));

  const activeSedeId = activeSede?.id;

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((alumno) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query
        || alumno.nombre.toLowerCase().includes(query)
        || alumno.dni.includes(query);
      const matchesSede = !activeSedeId || alumno.sede === activeSedeId;
      return matchesSearch && matchesSede;
    });
  }, [activeSedeId, alumnos, searchTerm]);

  const handleOpenStudentModal = (student = null) => {
    setEditingStudent(student);
    setStudentForm(student ? {
      nombre: student.nombre,
      dni: student.dni,
      email: student.email,
      telefono: student.telefono,
      objetivo: student.objetivo,
      sede: student.sede
    } : {
      ...emptyAlumnoForm,
      sede: activeSedeId || emptyAlumnoForm.sede
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = (event) => {
    event.preventDefault();

    if (editingStudent) {
      setAlumnos((current) => current.map((alumno) => (
        alumno.id === editingStudent.id ? { ...alumno, ...studentForm } : alumno
      )));
    } else {
      setAlumnos((current) => [
        ...current,
        {
          id: Date.now().toString(),
          ...studentForm,
          rutinaActiva: null,
          historial: []
        }
      ]);
    }

    setShowStudentModal(false);
    setEditingStudent(null);
  };

  const handleOpenRoutineModal = (student) => {
    setSelectedStudent(student);
    setRoutineForm(defaultRoutineForm(student));
    setShowRoutineModal(true);
  };

  const handleSaveRoutine = (event) => {
    event.preventDefault();
    if (!selectedStudent) return;

    setAlumnos((current) => current.map((alumno) => (
      alumno.id === selectedStudent.id
        ? {
            ...alumno,
            objetivo: routineForm.objetivo,
            rutinaActiva: {
              nombre: routineForm.nombre,
              fecha: new Date().toISOString().split('T')[0],
              semanas: routineForm.semanas
            }
          }
        : alumno
    )));

    setShowRoutineModal(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Esta seguro de eliminar este alumno?')) {
      setAlumnos((current) => current.filter((alumno) => alumno.id !== studentId));
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-orange), #ea580c)' }}>
              <Dumbbell size={20} />
            </div>
            <span>PANEL<span style={{ color: 'var(--accent-orange)' }}>PROFESOR</span></span>
          </div>

          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <Users size={18} /> Mis alumnos
            </li>
            <li className="sidebar-item" onClick={() => navigate('/')}>
              <Home size={18} /> Sitio informativo
            </li>
          </ul>
        </div>

        <button onClick={logout} className="sidebar-item" style={{ color: '#ef4444' }}>
          <LogOut size={18} /> Cerrar sesion
        </button>
      </aside>

      <main className="main-content">
        <div className="header-bar">
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Alumnos y rutinas</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Trabajo actual en {activeSede?.titulo || 'sede asignada'}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <SedeSwitcher />
            <span className="badge-role badge-profesor">Rol: Profesor</span>
            <button className="btn-primary" onClick={() => handleOpenStudentModal()}>
              <Plus size={18} /> Agregar alumno
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar alumno por nombre o DNI..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredAlumnos.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', color: 'var(--text-muted)' }}>
              No hay alumnos registrados para esta sede con los filtros actuales.
            </div>
          ) : (
            filteredAlumnos.map((student) => (
              <div key={student.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{student.nombre}</h3>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DNI: {student.dni}</span>
                  </div>
                  <span className="badge-role" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                    {getSedeLabel(student.sede)}
                  </span>
                </div>

                <div style={{ background: '#111827', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estado rutina</span>
                  {student.rutinaActiva ? (
                    <p style={{ color: 'var(--accent-lime)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {student.rutinaActiva.nombre} · creada {student.rutinaActiva.fecha}
                    </p>
                  ) : (
                    <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                      Sin rutina asignada
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenRoutineModal(student)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    <Edit size={15} /> {student.rutinaActiva ? 'Editar rutina' : 'Crear rutina'}
                  </button>
                  <button
                    onClick={() => handleOpenStudentModal(student)}
                    className="btn-secondary"
                    style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    <Edit size={15} /> Alumno
                  </button>
                  <button
                    onClick={() => { setSelectedStudent(student); setShowHistoryModal(true); }}
                    className="btn-secondary"
                    style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    <TrendingUp size={15} /> Progreso
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', borderRadius: 'var(--radius-full)' }}
                    title="Eliminar alumno"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showStudentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '540px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingStudent ? 'Editar alumno' : 'Agregar alumno'}</h2>
                <button onClick={() => setShowStudentModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent}>
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input className="form-input" value={studentForm.nombre} onChange={(event) => setStudentForm({ ...studentForm, nombre: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">DNI</label>
                  <input className="form-input" value={studentForm.dni} onChange={(event) => setStudentForm({ ...studentForm, dni: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electronico</label>
                  <input type="email" className="form-input" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefono</label>
                  <input className="form-input" value={studentForm.telefono} onChange={(event) => setStudentForm({ ...studentForm, telefono: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Objetivo</label>
                  <input className="form-input" value={studentForm.objetivo} onChange={(event) => setStudentForm({ ...studentForm, objetivo: event.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowStudentModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Guardar alumno
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRoutineModal && selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Rutina de {selectedStudent.nombre}</h2>
                <button onClick={() => setShowRoutineModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoutine}>
                <div className="form-group">
                  <label className="form-label">Nombre de la rutina</label>
                  <input
                    type="text"
                    className="form-input"
                    value={routineForm.nombre}
                    onChange={(event) => setRoutineForm({ ...routineForm, nombre: event.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Objetivo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={routineForm.objetivo}
                    onChange={(event) => setRoutineForm({ ...routineForm, objetivo: event.target.value })}
                    required
                  />
                </div>

                <div style={{ background: '#111827', padding: '1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '0.8rem', color: 'var(--accent-orange)' }}>Semanas, dias y ejercicios</h4>
                  {routineForm.semanas.map((semana) => (
                    <div key={semana.nombre} style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#fff' }}>{semana.nombre}</strong>
                      {semana.dias.map((dia) => (
                        <div key={dia.nombre} style={{ marginTop: '0.6rem', paddingLeft: '0.75rem', borderLeft: '2px solid var(--border-color)' }}>
                          <p style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{dia.nombre}</p>
                          <ul style={{ listStyle: 'none', marginTop: '0.4rem' }}>
                            {dia.ejercicios.map((ejercicio) => (
                              <li key={`${dia.nombre}-${ejercicio.nombre}`} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                {ejercicio.nombre}: {ejercicio.series} x {ejercicio.repeticiones} · {ejercicio.peso} · {ejercicio.observaciones}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRoutineModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Guardar rutina
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showHistoryModal && selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Progreso de {selectedStudent.nombre}</h2>
                <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {selectedStudent.historial.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  Todavia no hay registros de evolucion para este alumno.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedStudent.historial.map((item) => (
                    <div key={`${item.fecha}-${item.estado}`} style={{ background: '#111827', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-orange)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>{item.fecha}</span>
                        <span style={{ color: 'var(--accent-lime)' }}>{item.estado}</span>
                      </div>
                      <p style={{ color: '#fff', fontSize: '0.9rem' }}>{item.nota}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfesorDashboard;
