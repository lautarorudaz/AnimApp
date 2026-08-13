import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Search, 
  Filter,
  CheckCircle,
  Home,
  X
} from 'lucide-react';

const RecepcionDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [sedeSeleccionada, setSedeSeleccionada] = useState('sede_norte');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Lista de alumnos registrados en recepción
  const [alumnosList, setAlumnosList] = useState([
    { id: '1', nombre: 'Gonzalo Pérez', dni: '39444111', email: 'gonzalo@gmail.com', telefono: '+54 9 11 5555-1111', sede: 'sede_norte', profesorAsignado: 'Carlos Rodríguez', estado: 'Activo' },
    { id: '2', nombre: 'Camila Torres', dni: '41222999', email: 'camila@gmail.com', telefono: '+54 9 11 5555-2222', sede: 'sede_centro', profesorAsignado: 'Sin Asignar', estado: 'Activo' },
    { id: '3', nombre: 'Roberto Sánchez', dni: '38111222', email: 'roberto@gmail.com', telefono: '+54 9 11 5555-3333', sede: 'sede_sur', profesorAsignado: 'Esteban Benítez', estado: 'Activo' }
  ]);

  const [formAlumno, setFormAlumno] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    sede: 'sede_norte',
    profesorAsignado: 'Carlos Rodríguez'
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormAlumno({
      nombre: '',
      dni: '',
      email: '',
      telefono: '',
      sede: sedeSeleccionada,
      profesorAsignado: 'Carlos Rodríguez'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormAlumno({
      nombre: student.nombre,
      dni: student.dni,
      email: student.email,
      telefono: student.telefono,
      sede: student.sede,
      profesorAsignado: student.profesorAsignado
    });
    setShowModal(true);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();

    if (editingStudent) {
      // Modificar existente
      setAlumnosList(alumnosList.map(item => item.id === editingStudent.id ? { ...item, ...formAlumno } : item));
    } else {
      // Alta de nuevo alumno
      const created = {
        id: Date.now().toString(),
        ...formAlumno,
        estado: 'Activo'
      };
      setAlumnosList([...alumnosList, created]);
    }

    setShowModal(false);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('¿Está seguro de eliminar a este alumno del sistema de la sede?')) {
      setAlumnosList(alumnosList.filter(item => item.id !== id));
    }
  };

  const filteredAlumnos = alumnosList.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.dni.includes(searchTerm);
    const matchesSede = sedeSeleccionada === 'todas' || item.sede === sedeSeleccionada;
    return matchesSearch && matchesSede;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
              <UserCheck size={20} />
            </div>
            <span>PANEL<span style={{ color: 'var(--accent-cyan)' }}>RECEPCIÓN</span></span>
          </div>

          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <Users size={18} /> Alumnos de la Sede
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
            <h1 style={{ fontSize: '1.8rem' }}>Gestión de Inscripciones y Alumnos</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Alta de alumnos, edición de datos personales y asignación de profesores
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge-role badge-recepcion">Rol: Recepcionista</span>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }} onClick={handleOpenAddModal}>
              <UserPlus size={18} /> Inscribir Nuevo Alumno
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por nombre o DNI..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="form-input" 
            style={{ width: '220px' }}
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value)}
          >
            <option value="todas">Ver Todas las Sedes</option>
            <option value="sede_norte">Sede Norte</option>
            <option value="sede_centro">Sede Centro</option>
            <option value="sede_sur">Sede Sur</option>
          </select>
        </div>

        {/* Tabla de Alumnos */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Alumno / DNI</th>
                <th style={{ padding: '1rem 1.5rem' }}>Contacto</th>
                <th style={{ padding: '1rem 1.5rem' }}>Sede Inscrita</th>
                <th style={{ padding: '1rem 1.5rem' }}>Profesor Asignado</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay alumnos registrados en esta sede con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DNI: {item.dni}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#fff' }}>{item.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.telefono}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className="badge-role" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                        {item.sede.replace('sede_', '').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-orange)', fontWeight: 500 }}>
                      {item.profesorAsignado}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenEditModal(item)}
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={15} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(item.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Alta / Edición de Alumno */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingStudent ? 'Editar Alumno' : 'Inscribir Nuevo Alumno'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: Sofía Ramírez"
                    value={formAlumno.nombre}
                    onChange={(e) => setFormAlumno({ ...formAlumno, nombre: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DNI / Documento</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="40123456"
                    value={formAlumno.dni}
                    onChange={(e) => setFormAlumno({ ...formAlumno, dni: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="sofia@gmail.com"
                    value={formAlumno.email}
                    onChange={(e) => setFormAlumno({ ...formAlumno, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="+54 9 11 4444-5555"
                    value={formAlumno.telefono}
                    onChange={(e) => setFormAlumno({ ...formAlumno, telefono: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sede de Inscripción</label>
                  <select 
                    className="form-input"
                    value={formAlumno.sede}
                    onChange={(e) => setFormAlumno({ ...formAlumno, sede: e.target.value })}
                  >
                    <option value="sede_norte">Sede Norte</option>
                    <option value="sede_centro">Sede Centro</option>
                    <option value="sede_sur">Sede Sur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profesor Asignado</label>
                  <select 
                    className="form-input"
                    value={formAlumno.profesorAsignado}
                    onChange={(e) => setFormAlumno({ ...formAlumno, profesorAsignado: e.target.value })}
                  >
                    <option value="Carlos Rodríguez">Carlos Rodríguez (Sede Norte/Centro)</option>
                    <option value="Esteban Benítez">Esteban Benítez (Sede Sur)</option>
                    <option value="Sin Asignar">Sin Asignar Todavía</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
                    {editingStudent ? 'Actualizar Alumno' : 'Registrar Alumno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecepcionDashboard;
