import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  CheckCircle, 
  Search,
  Filter,
  UserPlus,
  Home
} from 'lucide-react';

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [sedeFiltro, setSedeFiltro] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Estado de personal ficticio/simulado para demostración de ABM en tiempo real
  const [staffList, setStaffList] = useState([
    { id: '1', nombre: 'Carlos Rodríguez', email: 'carlos@apexgym.com', rol: 'profesor', sedes: ['sede_norte', 'sede_centro'], estado: 'Activo' },
    { id: '2', nombre: 'Mariana López', email: 'mariana@apexgym.com', rol: 'recepcionista', sedes: ['sede_norte'], estado: 'Activo' },
    { id: '3', nombre: 'Esteban Benítez', email: 'esteban@apexgym.com', rol: 'profesor', sedes: ['sede_sur'], estado: 'Activo' },
    { id: '4', nombre: 'Lucía Fernández', email: 'lucia@apexgym.com', rol: 'recepcionista', sedes: ['sede_centro', 'sede_sur'], estado: 'Activo' }
  ]);

  const [newStaff, setNewStaff] = useState({
    nombre: '',
    email: '',
    rol: 'profesor',
    sedes: ['sede_norte']
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.nombre || !newStaff.email) return;

    const created = {
      id: Date.now().toString(),
      ...newStaff,
      estado: 'Activo'
    };

    setStaffList([...staffList, created]);
    setNewStaff({ nombre: '', email: '', rol: 'profesor', sedes: ['sede_norte'] });
    setShowModal(false);
  };

  const handleDeleteStaff = (id) => {
    setStaffList(staffList.filter(item => item.id !== id));
  };

  const handleToggleSedeSelection = (sedeId) => {
    if (newStaff.sedes.includes(sedeId)) {
      setNewStaff({ ...newStaff, sedes: newStaff.sedes.filter(s => s !== sedeId) });
    } else {
      setNewStaff({ ...newStaff, sedes: [...newStaff.sedes, sedeId] });
    }
  };

  const filteredStaff = staffList.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSede = sedeFiltro === 'todas' || user.sedes.includes(sedeFiltro);
    return matchesSearch && matchesSede;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon">
              <Shield size={20} />
            </div>
            <span>PANEL<span style={{ color: 'var(--accent-orange)' }}>ADMIN</span></span>
          </div>

          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <Users size={18} /> Personal (Staff)
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
            <h1 style={{ fontSize: '1.8rem' }}>Gestión de Personal & Sedes</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Acceso Administrador Global a las 3 Sedes (Norte, Centro, Sur)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge-role badge-admin">Rol: Administrador</span>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <UserPlus size={18} /> Dar de Alta Personal
            </button>
          </div>
        </div>

        {/* Filtros y Métricas Rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Staff</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{staffList.length}</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Profesores</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
              {staffList.filter(s => s.rol === 'profesor').length}
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recepcionistas</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {staffList.filter(s => s.rol === 'recepcionista').length}
            </p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtro por Sede */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por nombre o email..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="form-input" 
            style={{ width: '200px' }}
            value={sedeFiltro}
            onChange={(e) => setSedeFiltro(e.target.value)}
          >
            <option value="todas">Todas las Sedes</option>
            <option value="sede_norte">Sede Norte</option>
            <option value="sede_centro">Sede Centro</option>
            <option value="sede_sur">Sede Sur</option>
          </select>
        </div>

        {/* Tabla de Personal */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Nombre / Email</th>
                <th style={{ padding: '1rem 1.5rem' }}>Rol</th>
                <th style={{ padding: '1rem 1.5rem' }}>Sedes Asignadas</th>
                <th style={{ padding: '1rem 1.5rem' }}>Estado</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron registros de personal con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge-role ${item.rol === 'profesor' ? 'badge-profesor' : 'badge-recepcion'}`}>
                        {item.rol.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {item.sedes.map(s => (
                          <span key={s} style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#e2e8f0' }}>
                            {s.replace('sede_', '').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ color: 'var(--accent-lime)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={14} /> {item.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteStaff(item.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem', borderRadius: '6px' }}
                        title="Dar de baja"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Alta de Staff */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Alta de Profesor / Recepcionista</h2>
              <form onSubmit={handleAddStaff}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: Marcos Valenzuela"
                    value={newStaff.nombre}
                    onChange={(e) => setNewStaff({ ...newStaff, nombre: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="marcos@apexgym.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rol Institucional</label>
                  <select 
                    className="form-input"
                    value={newStaff.rol}
                    onChange={(e) => setNewStaff({ ...newStaff, rol: e.target.value })}
                  >
                    <option value="profesor">Profesor / Instructor</option>
                    <option value="recepcionista">Recepcionista</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sedes Habilitadas (Puede seleccionar 1 o más)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {['sede_norte', 'sede_centro', 'sede_sur'].map(sedeId => {
                      const isSelected = newStaff.sedes.includes(sedeId);
                      return (
                        <button
                          key={sedeId}
                          type="button"
                          onClick={() => handleToggleSedeSelection(sedeId)}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-orange)' : 'var(--border-color)',
                            background: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-primary)',
                            color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {sedeId.replace('sede_', '').toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Guardar Registro
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

export default AdminDashboard;
