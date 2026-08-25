import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Check,
  ClipboardList,
  Dumbbell,
  Edit3,
  Home,
  LogOut,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  UserRound,
  Users,
  X
} from 'lucide-react';
import { ROLES, ROLE_LABELS, SEDES, getSedeLabel } from '../constants/appData';
import { useAuth } from '../context/auth';

const initialPeople = [
  { id: 'a-001', nombre: 'Gonzalo Perez', email: 'gonzalo@gmail.com', telefono: '+54 9 11 5555-1111', rol: ROLES.ALUMNO, sedes: ['moreno'], estado: 'Activo' },
  { id: 'a-002', nombre: 'Camila Torres', email: 'camila@gmail.com', telefono: '+54 9 11 5555-2222', rol: ROLES.ALUMNO, sedes: ['edison'], estado: 'Activo' },
  { id: 'a-003', nombre: 'Roberto Sanchez', email: 'roberto@gmail.com', telefono: '+54 9 11 5555-3333', rol: ROLES.ALUMNO, sedes: ['general-san-martin'], estado: 'Activo' },
  { id: 'a-004', nombre: 'Martina Acosta', email: 'martina@gmail.com', telefono: '+54 9 11 5555-4444', rol: ROLES.ALUMNO, sedes: ['moreno'], estado: 'Inactivo' },
  { id: 'p-001', nombre: 'Carlos Rodriguez', email: 'carlos@animapp.com', telefono: '+54 9 11 4444-1111', rol: ROLES.PROFESOR, sedes: ['moreno', 'edison'], estado: 'Activo' },
  { id: 'p-002', nombre: 'Esteban Benitez', email: 'esteban@animapp.com', telefono: '+54 9 11 4444-2222', rol: ROLES.PROFESOR, sedes: ['general-san-martin'], estado: 'Activo' },
  { id: 'r-001', nombre: 'Mariana Lopez', email: 'mariana@animapp.com', telefono: '+54 9 11 3333-1111', rol: ROLES.RECEPCIONISTA, sedes: ['moreno'], estado: 'Activo' },
  { id: 'r-002', nombre: 'Lucia Fernandez', email: 'lucia@animapp.com', telefono: '+54 9 11 3333-2222', rol: ROLES.RECEPCIONISTA, sedes: ['edison', 'general-san-martin'], estado: 'Activo' }
];

const roleFilters = [
  { id: 'todos', label: 'Todas', icon: Users },
  { id: ROLES.ALUMNO, label: 'Alumnos', icon: UserRound },
  { id: ROLES.PROFESOR, label: 'Profesores', icon: Dumbbell },
  { id: ROLES.RECEPCIONISTA, label: 'Recepcionistas', icon: ClipboardList }
];

const getEmptyPerson = (preferredSede = 'moreno') => ({
  nombre: '',
  email: '',
  telefono: '',
  rol: ROLES.ALUMNO,
  sedes: [preferredSede],
  estado: 'Activo'
});

const getInitials = (name) => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

const AdminDashboard = () => {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState(initialPeople);
  const [activeSedeFilter, setActiveSedeFilter] = useState('todas');
  const [activeRoleFilter, setActiveRoleFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [personForm, setPersonForm] = useState(() => getEmptyPerson());
  const [feedback, setFeedback] = useState('');

  const peopleForSelectedSede = useMemo(() => {
    if (activeSedeFilter === 'todas') return people;
    return people.filter((person) => person.sedes.includes(activeSedeFilter));
  }, [activeSedeFilter, people]);

  const roleCounts = useMemo(() => ({
    todos: peopleForSelectedSede.length,
    [ROLES.ALUMNO]: peopleForSelectedSede.filter((person) => person.rol === ROLES.ALUMNO).length,
    [ROLES.PROFESOR]: peopleForSelectedSede.filter((person) => person.rol === ROLES.PROFESOR).length,
    [ROLES.RECEPCIONISTA]: peopleForSelectedSede.filter((person) => person.rol === ROLES.RECEPCIONISTA).length
  }), [peopleForSelectedSede]);

  const filteredPeople = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return peopleForSelectedSede.filter((person) => {
      const matchesRole = activeRoleFilter === 'todos' || person.rol === activeRoleFilter;
      const matchesSearch = !query || [person.nombre, person.email, person.telefono]
        .some((value) => value.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });
  }, [activeRoleFilter, peopleForSelectedSede, searchTerm]);

  useEffect(() => {
    if (!isFormOpen && !personToDelete) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setIsFormOpen(false);
      setPersonToDelete(null);
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFormOpen, personToDelete]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeoutId = window.setTimeout(() => setFeedback(''), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const openCreateForm = () => {
    const defaultSede = activeSedeFilter === 'todas' ? SEDES[0].id : activeSedeFilter;
    setEditingPerson(null);
    setPersonForm(getEmptyPerson(defaultSede));
    setIsFormOpen(true);
  };

  const openEditForm = (person) => {
    setEditingPerson(person);
    setPersonForm({
      nombre: person.nombre,
      email: person.email,
      telefono: person.telefono,
      rol: person.rol,
      sedes: [...person.sedes],
      estado: person.estado
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPerson(null);
  };

  const handleRoleChange = (role) => {
    setPersonForm((current) => ({
      ...current,
      rol: role,
      sedes: role === ROLES.ALUMNO ? [current.sedes[0] || SEDES[0].id] : current.sedes
    }));
  };

  const handleSedeSelection = (sedeId) => {
    setPersonForm((current) => {
      if (current.rol === ROLES.ALUMNO) return { ...current, sedes: [sedeId] };

      const isSelected = current.sedes.includes(sedeId);
      if (isSelected && current.sedes.length === 1) return current;

      return {
        ...current,
        sedes: isSelected
          ? current.sedes.filter((id) => id !== sedeId)
          : [...current.sedes, sedeId]
      };
    });
  };

  const handleSavePerson = (event) => {
    event.preventDefault();
    const normalizedPerson = {
      ...personForm,
      nombre: personForm.nombre.trim(),
      email: personForm.email.trim(),
      telefono: personForm.telefono.trim()
    };

    if (editingPerson) {
      setPeople((current) => current.map((person) => (
        person.id === editingPerson.id ? { ...person, ...normalizedPerson } : person
      )));
      setFeedback('Los cambios se guardaron correctamente.');
    } else {
      setPeople((current) => [{ id: `person-${Date.now()}`, ...normalizedPerson }, ...current]);
      setFeedback('La persona se agregó correctamente.');
    }

    closeForm();
  };

  const confirmDeletePerson = () => {
    setPeople((current) => current.filter((person) => person.id !== personToDelete.id));
    setFeedback(`${personToDelete.nombre} fue eliminado.`);
    setPersonToDelete(null);
  };

  return (
    <div className="dashboard-layout admin-dashboard">
      <aside className="sidebar admin-sidebar">
        <div>
          <div className="admin-brand">
            <div className="logo-icon"><Shield size={20} /></div>
            <div>
              <strong>ANIMAPP</strong>
              <span>Administración</span>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Navegación del administrador">
            <button type="button" className="admin-nav-item active">
              <Users size={19} />
              <span>Personas</span>
            </button>
            <button type="button" className="admin-nav-item" onClick={() => navigate('/')}>
              <Home size={19} />
              <span>Sitio público</span>
            </button>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-summary">
            <div className="admin-profile-avatar">{getInitials(userProfile?.nombre || 'Administrador')}</div>
            <div>
              <strong>{userProfile?.nombre || 'Administrador'}</strong>
              <span>Acceso global</span>
            </div>
          </div>
          <button type="button" className="admin-logout-button" onClick={logout}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content admin-main-content">
        <header className="admin-page-header">
          <div>
            <span className="admin-eyebrow">Panel de administración</span>
            <h1>Gestión de personas</h1>
            <p>Administrá alumnos y personal de las tres sedes desde un solo lugar.</p>
          </div>
          <button type="button" className="btn-primary admin-create-button" onClick={openCreateForm}>
            <Plus size={19} />
            Nueva persona
          </button>
        </header>

        <section className="admin-sede-toolbar" aria-labelledby="sede-filter-title">
          <div className="admin-sede-label">
            <MapPin size={19} />
            <div>
              <strong id="sede-filter-title">Filtrar por sede</strong>
              <span>La información del panel se actualiza según tu selección.</span>
            </div>
          </div>
          <div className="admin-sede-segmented" role="group" aria-label="Sede seleccionada">
            <button
              type="button"
              className={activeSedeFilter === 'todas' ? 'active' : ''}
              onClick={() => setActiveSedeFilter('todas')}
              aria-pressed={activeSedeFilter === 'todas'}
            >
              <Building2 size={17} />
              Todas
            </button>
            {SEDES.map((sede) => (
              <button
                type="button"
                key={sede.id}
                className={activeSedeFilter === sede.id ? 'active' : ''}
                onClick={() => setActiveSedeFilter(sede.id)}
                aria-pressed={activeSedeFilter === sede.id}
              >
                {sede.nombre}
              </button>
            ))}
          </div>
        </section>

        <section className="admin-metrics" aria-label="Resumen de personas">
          {roleFilters.map((filter) => {
            const MetricIcon = filter.icon;
            return (
              <button
                type="button"
                key={filter.id}
                className={activeRoleFilter === filter.id ? 'admin-metric active' : 'admin-metric'}
                onClick={() => setActiveRoleFilter(filter.id)}
                aria-pressed={activeRoleFilter === filter.id}
              >
                <MetricIcon size={19} />
                <span>{filter.label}</span>
                <strong>{roleCounts[filter.id]}</strong>
              </button>
            );
          })}
        </section>

        <section className="admin-directory" aria-labelledby="people-table-title">
          <div className="admin-directory-toolbar">
            <div>
              <h2 id="people-table-title">Directorio</h2>
              <span>{filteredPeople.length} registros visibles</span>
            </div>
            <label className="admin-search">
              <Search size={18} />
              <span className="sr-only">Buscar personas</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, email o teléfono"
              />
            </label>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-people-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Rol</th>
                  <th>Sede</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-empty-state">
                      <Users size={28} />
                      <strong>No encontramos personas</strong>
                      <span>Probá cambiando la sede, el tipo de persona o la búsqueda.</span>
                    </td>
                  </tr>
                ) : filteredPeople.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="admin-person-cell">
                        <span className={`admin-person-avatar role-${person.rol}`}>{getInitials(person.nombre)}</span>
                        <div>
                          <strong>{person.nombre}</strong>
                          <span>{person.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-role-badge role-${person.rol}`}>
                        {ROLE_LABELS[person.rol]}
                      </span>
                    </td>
                    <td>
                      <div className="admin-sede-tags">
                        {person.sedes.map((sedeId) => <span key={sedeId}>{getSedeLabel(sedeId)}</span>)}
                      </div>
                    </td>
                    <td><span className="admin-phone">{person.telefono}</span></td>
                    <td>
                      <span className={person.estado === 'Activo' ? 'admin-status active' : 'admin-status'}>
                        <i /> {person.estado}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(person)}
                          aria-label={`Editar a ${person.nombre}`}
                          title="Editar"
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => setPersonToDelete(person)}
                          aria-label={`Eliminar a ${person.nombre}`}
                          title="Eliminar"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section className="admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="person-form-title">
            <header className="admin-modal-header">
              <div>
                <span>{editingPerson ? 'Editar registro' : 'Nuevo registro'}</span>
                <h2 id="person-form-title">{editingPerson ? editingPerson.nombre : 'Agregar persona'}</h2>
              </div>
              <button type="button" onClick={closeForm} aria-label="Cerrar formulario" title="Cerrar">
                <X size={21} />
              </button>
            </header>

            <form className="admin-person-form" onSubmit={handleSavePerson}>
              <div className="admin-form-grid">
                <label className="admin-field admin-field-wide">
                  <span>Nombre completo</span>
                  <input
                    type="text"
                    value={personForm.nombre}
                    onChange={(event) => setPersonForm({ ...personForm, nombre: event.target.value })}
                    placeholder="Nombre y apellido"
                    autoFocus
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={personForm.email}
                    onChange={(event) => setPersonForm({ ...personForm, email: event.target.value })}
                    placeholder="nombre@email.com"
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>Teléfono</span>
                  <input
                    type="tel"
                    value={personForm.telefono}
                    onChange={(event) => setPersonForm({ ...personForm, telefono: event.target.value })}
                    placeholder="+54 9 11..."
                    required
                  />
                </label>

                <label className="admin-field admin-field-wide">
                  <span>Tipo de persona</span>
                  <select value={personForm.rol} onChange={(event) => handleRoleChange(event.target.value)}>
                    <option value={ROLES.ALUMNO}>Alumno</option>
                    <option value={ROLES.PROFESOR}>Profesor</option>
                    <option value={ROLES.RECEPCIONISTA}>Recepcionista</option>
                  </select>
                </label>

                <fieldset className="admin-field admin-field-wide admin-sede-fieldset">
                  <legend>Sedes asignadas</legend>
                  <p>{personForm.rol === ROLES.ALUMNO ? 'Los alumnos pertenecen a una sede.' : 'Podés asignar más de una sede.'}</p>
                  <div>
                    {SEDES.map((sede) => {
                      const isSelected = personForm.sedes.includes(sede.id);
                      return (
                        <button
                          type="button"
                          key={sede.id}
                          className={isSelected ? 'active' : ''}
                          onClick={() => handleSedeSelection(sede.id)}
                          aria-pressed={isSelected}
                        >
                          {isSelected && <Check size={16} />}
                          {sede.nombre}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="admin-status-toggle admin-field-wide">
                  <span>
                    <strong>Persona activa</strong>
                    <small>Puede operar o entrenar normalmente en la sede.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={personForm.estado === 'Activo'}
                    onChange={(event) => setPersonForm({
                      ...personForm,
                      estado: event.target.checked ? 'Activo' : 'Inactivo'
                    })}
                  />
                  <i aria-hidden="true" />
                </label>
              </div>

              <footer className="admin-modal-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingPerson ? 'Guardar cambios' : 'Agregar persona'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {personToDelete && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPersonToDelete(null);
          }}
        >
          <section className="admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-person-title">
            <div className="admin-confirm-icon"><Trash2 size={23} /></div>
            <h2 id="delete-person-title">Eliminar persona</h2>
            <p>
              Vas a eliminar a <strong>{personToDelete.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPersonToDelete(null)}>Cancelar</button>
              <button type="button" className="admin-danger-button" onClick={confirmDeletePerson}>Eliminar</button>
            </div>
          </section>
        </div>
      )}

      {feedback && <div className="admin-toast" role="status"><Check size={18} /> {feedback}</div>}
    </div>
  );
};

export default AdminDashboard;
