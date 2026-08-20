import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  Edit3,
  Home,
  LogOut,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import { ROLES, ROLE_LABELS, SEDES, getSedeLabel } from '../constants/appData';
import { useAuth } from '../context/auth';

const initialStaff = [
  { id: '1', nombre: 'Carlos Rodriguez', email: 'carlos@animapp.com', rol: ROLES.PROFESOR, sedes: ['moreno', 'edison'], estado: 'Activo' },
  { id: '2', nombre: 'Mariana Lopez', email: 'mariana@animapp.com', rol: ROLES.RECEPCIONISTA, sedes: ['moreno'], estado: 'Activo' },
  { id: '3', nombre: 'Esteban Benitez', email: 'esteban@animapp.com', rol: ROLES.PROFESOR, sedes: ['general-san-martin'], estado: 'Activo' },
  { id: '4', nombre: 'Lucia Fernandez', email: 'lucia@animapp.com', rol: ROLES.RECEPCIONISTA, sedes: ['edison', 'general-san-martin'], estado: 'Activo' }
];

const sedeMetrics = {
  moreno: { alumnos: 420, rutinasActivas: 305, stockAlertas: 2 },
  edison: { alumnos: 365, rutinasActivas: 271, stockAlertas: 1 },
  'general-san-martin': { alumnos: 318, rutinasActivas: 244, stockAlertas: 3 }
};

const emptyStaffForm = {
  nombre: '',
  email: '',
  rol: ROLES.PROFESOR,
  sedes: ['moreno']
};

const AdminDashboard = () => {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const [sedeFiltro, setSedeFiltro] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffList, setStaffList] = useState(initialStaff);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query
        || staff.nombre.toLowerCase().includes(query)
        || staff.email.toLowerCase().includes(query);
      const matchesSede = sedeFiltro === 'todas' || staff.sedes.includes(sedeFiltro);
      return matchesSearch && matchesSede;
    });
  }, [searchTerm, sedeFiltro, staffList]);

  const staffByRole = useMemo(() => {
    return {
      profesores: staffList.filter((staff) => staff.rol === ROLES.PROFESOR).length,
      recepcionistas: staffList.filter((staff) => staff.rol === ROLES.RECEPCIONISTA).length
    };
  }, [staffList]);

  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setStaffForm(emptyStaffForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      nombre: staff.nombre,
      email: staff.email,
      rol: staff.rol,
      sedes: staff.sedes
    });
    setShowModal(true);
  };

  const handleToggleSedeSelection = (sedeId) => {
    const isSelected = staffForm.sedes.includes(sedeId);
    if (isSelected && staffForm.sedes.length === 1) return;

    setStaffForm((current) => ({
      ...current,
      sedes: isSelected
        ? current.sedes.filter((id) => id !== sedeId)
        : [...current.sedes, sedeId]
    }));
  };

  const handleSaveStaff = (event) => {
    event.preventDefault();

    if (editingStaff) {
      setStaffList((current) => current.map((staff) => (
        staff.id === editingStaff.id ? { ...staff, ...staffForm } : staff
      )));
    } else {
      setStaffList((current) => [
        ...current,
        {
          id: Date.now().toString(),
          ...staffForm,
          estado: 'Activo'
        }
      ]);
    }

    setShowModal(false);
    setEditingStaff(null);
    setStaffForm(emptyStaffForm);
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Esta seguro de dar de baja este usuario del staff?')) {
      setStaffList((current) => current.filter((staff) => staff.id !== id));
    }
  };

  return (
    <div className="dashboard-layout">
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
              <Users size={18} /> Personal
            </li>
            <li className="sidebar-item">
              <Building2 size={18} /> Sedes
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
            <h1 style={{ fontSize: '1.8rem' }}>Gestion global de AnimApp</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {userProfile?.nombre || 'Administrador'} · control de staff, sedes, alumnos y rutinas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="badge-role badge-admin">Rol: Administrador</span>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              <UserPlus size={18} /> Alta de personal
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total staff</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{staffList.length}</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Profesores</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{staffByRole.profesores}</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recepcionistas</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{staffByRole.recepcionistas}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {SEDES.map((sede) => {
            const metrics = sedeMetrics[sede.id];
            const staffCount = staffList.filter((staff) => staff.sedes.includes(sede.id)).length;

            return (
              <div key={sede.id} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span className="sede-badge" style={{ color: sede.color }}>{sede.titulo}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginTop: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Alumnos</span>
                    <p style={{ color: '#fff', fontWeight: 700 }}>{metrics.alumnos}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rutinas</span>
                    <p style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>{metrics.rutinasActivas}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Staff</span>
                    <p style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{staffCount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nombre o email..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: '220px' }}
            value={sedeFiltro}
            onChange={(event) => setSedeFiltro(event.target.value)}
          >
            <option value="todas">Todas las sedes</option>
            {SEDES.map((sede) => (
              <option key={sede.id} value={sede.id}>{sede.titulo}</option>
            ))}
          </select>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Nombre / Email</th>
                <th style={{ padding: '1rem 1.5rem' }}>Rol</th>
                <th style={{ padding: '1rem 1.5rem' }}>Sedes asignadas</th>
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
                filteredStaff.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{staff.nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{staff.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge-role ${staff.rol === ROLES.PROFESOR ? 'badge-profesor' : 'badge-recepcion'}`}>
                        {ROLE_LABELS[staff.rol]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {staff.sedes.map((sedeId) => (
                          <span key={sedeId} style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#e2e8f0' }}>
                            {getSedeLabel(sedeId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ color: 'var(--accent-lime)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={14} /> {staff.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="btn-secondary"
                          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={15} /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem', borderRadius: '6px' }}
                          title="Dar de baja"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>
                {editingStaff ? 'Editar personal' : 'Alta de profesor / recepcionista'}
              </h2>

              <form onSubmit={handleSaveStaff}>
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Marcos Valenzuela"
                    value={staffForm.nombre}
                    onChange={(event) => setStaffForm({ ...staffForm, nombre: event.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo electronico</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="marcos@animapp.com"
                    value={staffForm.email}
                    onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-input"
                    value={staffForm.rol}
                    onChange={(event) => setStaffForm({ ...staffForm, rol: event.target.value })}
                  >
                    <option value={ROLES.PROFESOR}>Profesor</option>
                    <option value={ROLES.RECEPCIONISTA}>Recepcionista</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sedes habilitadas</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {SEDES.map((sede) => {
                      const isSelected = staffForm.sedes.includes(sede.id);
                      return (
                        <button
                          key={sede.id}
                          type="button"
                          onClick={() => handleToggleSedeSelection(sede.id)}
                          style={{
                            flex: '1 1 130px',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-orange)' : 'var(--border-color)',
                            background: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-primary)',
                            color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          {sede.nombre}
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
                    {editingStaff ? 'Guardar cambios' : 'Guardar personal'}
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
