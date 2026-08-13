import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  TrendingUp, 
  Calendar, 
  Search, 
  Eye, 
  CheckSquare,
  Home,
  X
} from 'lucide-react';

const ProfesorDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Alumnos simulados del profesor
  const [alumnos, setAlumnos] = useState([
    {
      id: 'a1',
      nombre: 'Gonzalo Pérez',
      dni: '39444111',
      sede: 'sede_norte',
      objetivo: 'Fuerza e Hipertrofia',
      rutinaActiva: {
        nombre: 'Rutina Volumen A',
        fecha: '2026-08-10',
        dias: [
          { dia: 'Día 1: Pecho y Tríceps', ejercicios: [{ nombre: 'Press Banca', series: '4', repeticiones: '10', peso: '70kg' }] },
          { dia: 'Día 2: Espalda y Biceps', ejercicios: [{ nombre: 'Dominadas', series: '4', repeticiones: '8', peso: 'Corporal' }] }
        ]
      },
      historial: [
        { fecha: '2026-08-12', nota: 'Completó 4 series de 70kg en Press Banca sin asistencia.', estado: 'Excelente' },
        { fecha: '2026-08-05', nota: 'Aumento de peso corporal: +1.5kg este mes.', estado: 'En progreso' }
      ]
    },
    {
      id: 'a2',
      nombre: 'Camila Torres',
      dni: '41222999',
      sede: 'sede_centro',
      objetivo: 'Acondicionamiento Físico',
      rutinaActiva: null,
      historial: []
    }
  ]);

  // Formulario para armar/editar rutina
  const [rutinaForm, setRutinaForm] = useState({
    nombreRutina: '',
    objetivo: 'Hipertrofia',
    ejercicioNombre: '',
    series: '4',
    repeticiones: '12',
    peso: '10kg',
    diasList: [
      { dia: 'Día 1: Torso', ejercicios: [{ nombre: 'Press Militar', series: '4', repeticiones: '12', peso: '20kg' }] }
    ]
  });

  const handleOpenRoutineModal = (student) => {
    setSelectedStudent(student);
    if (student.rutinaActiva) {
      setRutinaForm({
        nombreRutina: student.rutinaActiva.nombre,
        objetivo: student.objetivo,
        ejercicioNombre: '',
        series: '4',
        repeticiones: '12',
        peso: '10kg',
        diasList: student.rutinaActiva.dias
      });
    } else {
      setRutinaForm({
        nombreRutina: 'Rutina Personalizada 1',
        objetivo: student.objetivo,
        ejercicioNombre: '',
        series: '4',
        repeticiones: '12',
        peso: '10kg',
        diasList: [{ dia: 'Día 1: Full Body', ejercicios: [] }]
      });
    }
    setShowRoutineModal(true);
  };

  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updatedAlumnos = alumnos.map(item => {
      if (item.id === selectedStudent.id) {
        return {
          ...item,
          rutinaActiva: {
            nombre: rutinaForm.nombreRutina,
            fecha: new Date().toISOString().split('T')[0],
            dias: rutinaForm.diasList
          }
        };
      }
      return item;
    });

    setAlumnos(updatedAlumnos);
    setShowRoutineModal(false);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('¿Está seguro de eliminar este alumno de su lista?')) {
      setAlumnos(alumnos.filter(a => a.id !== studentId));
    }
  };

  const filteredAlumnos = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.dni.includes(searchTerm)
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
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
              <Users size={18} /> Mis Alumnos
            </li>
            <li className="sidebar-item" onClick={() => navigate('/')}>
              <Home size={18} /> Sitio Informativo
            </li>
          </ul>
        </div>

        <button onClick={logout} className="sidebar-item" style={{ color: '#ef4444' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header-bar">
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Mis Alumnos & Rutinas Personalizadas</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Gestión e historial de entrenamiento para alumnos asignados
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge-role badge-profesor">Rol: Profesor / Instructor</span>
          </div>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar alumno por nombre o DNI..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Alumnos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredAlumnos.map(student => (
            <div key={student.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{student.nombre}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DNI: {student.dni}</span>
                </div>
                <span className="badge-role" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                  {student.sede.replace('sede_', '').toUpperCase()}
                </span>
              </div>

              <div style={{ background: '#111827', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estado Rutina:</span>
                {student.rutinaActiva ? (
                  <p style={{ color: 'var(--accent-lime)', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✓ {student.rutinaActiva.nombre} (Creada: {student.rutinaActiva.fecha})
                  </p>
                ) : (
                  <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                    ⚠️ Sin rutina asignada
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleOpenRoutineModal(student)} 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                >
                  <Edit size={15} /> {student.rutinaActiva ? 'Editar Rutina' : 'Crear Rutina'}
                </button>
                <button 
                  onClick={() => { setSelectedStudent(student); setShowHistoryModal(true); }}
                  className="btn-secondary" 
                  style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                  title="Ver Progreso e Historial"
                >
                  <TrendingUp size={15} /> Progreso
                </button>
                <button 
                  onClick={() => handleDeleteStudent(student.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', borderRadius: 'var(--radius-full)' }}
                  title="Eliminar Alumno"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Crear / Editar Rutina */}
        {showRoutineModal && selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Armar Rutina: {selectedStudent.nombre}</h2>
                <button onClick={() => setShowRoutineModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoutine}>
                <div className="form-group">
                  <label className="form-label">Nombre de la Rutina</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={rutinaForm.nombreRutina}
                    onChange={(e) => setRutinaForm({ ...rutinaForm, nombreRutina: e.target.value })}
                    required 
                  />
                </div>

                <div style={{ background: '#111827', padding: '1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '0.8rem', color: 'var(--accent-orange)' }}>Días y Ejercicios</h4>
                  {rutinaForm.diasList.map((d, index) => (
                    <div key={index} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                      <strong style={{ color: '#fff' }}>{d.dia}</strong>
                      <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
                        {d.ejercicios.map((ej, ejIdx) => (
                          <li key={ejIdx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            • {ej.nombre}: {ej.series} series x {ej.repeticiones} reps ({ej.peso})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRoutineModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Guardar Rutina
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Historial y Progreso */}
        {showHistoryModal && selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '550px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Historial & Progreso: {selectedStudent.nombre}</h2>
                <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {selectedStudent.historial.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No hay registros de evolución en el historial de este alumno aún.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedStudent.historial.map((h, i) => (
                    <div key={i} style={{ background: '#111827', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-orange)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Fecha: {h.fecha}</span>
                        <span style={{ color: 'var(--accent-lime)' }}>{h.estado}</span>
                      </div>
                      <p style={{ color: '#fff', fontSize: '0.9rem' }}>{h.nota}</p>
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
