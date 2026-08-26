import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  Building2,
  Check,
  ClipboardList,
  Dumbbell,
  Edit3,
  LogOut,
  MapPin,
  PackageSearch,
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
import { auth, db } from '../firebase/config';

const roleFilters = [
  { id: 'todos', label: 'Todas', icon: Users },
  { id: ROLES.ALUMNO, label: 'Alumnos', icon: UserRound },
  { id: ROLES.PROFESOR, label: 'Profesores', icon: Dumbbell },
  { id: ROLES.RECEPCIONISTA, label: 'Recepcionistas', icon: ClipboardList }
];

const getEmptyPerson = (preferredSede = 'moreno') => ({
  nombre: '',
  email: '',
  password: '',
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
  const [accountPeople, setAccountPeople] = useState([]);
  const [studentRecords, setStudentRecords] = useState([]);
  const pendingBackfills = useRef(new Set());
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const [dataError, setDataError] = useState('');
  const [activeSedeFilter, setActiveSedeFilter] = useState('todas');
  const [activeRoleFilter, setActiveRoleFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [personForm, setPersonForm] = useState(() => getEmptyPerson());
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const people = useMemo(() => {
    const studentsByUserId = new Map(studentRecords.filter((student) => student.userId).map((student) => [student.userId, student]));
    const accountIds = new Set(accountPeople.map((person) => person.id));
    const accounts = accountPeople.map((person) => {
      const student = person.rol === ROLES.ALUMNO ? studentsByUserId.get(person.id) : null;
      return student ? {
        ...person,
        nombre: student.nombre || person.nombre,
        email: student.email || person.email,
        telefono: student.telefono || person.telefono,
        sedes: [student.sedeId],
        estado: student.activo === false ? 'Inactivo' : 'Activo',
        studentRecordId: student.id,
        recordType: 'account'
      } : { ...person, recordType: 'account' };
    });
    const receptionStudents = studentRecords
      .filter((student) => !student.userId || !accountIds.has(student.userId))
      .map((student) => ({
        id: student.id,
        nombre: student.nombre,
        email: student.email || '',
        telefono: student.telefono || '',
        rol: ROLES.ALUMNO,
        sedes: [student.sedeId],
        estado: student.activo === false ? 'Inactivo' : 'Activo',
        recordType: 'student'
      }));
    return [...accounts, ...receptionStudents].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
  }, [accountPeople, studentRecords]);

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
        .some((value) => (value || '').toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });
  }, [activeRoleFilter, peopleForSelectedSede, searchTerm]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const nextPeople = snapshot.docs
        .map((personDoc) => {
          const data = personDoc.data();
          return {
            id: personDoc.id,
            ...data,
            sedes: data.sedes || data.sedeIds || [],
            estado: data.activo === false ? 'Inactivo' : 'Activo'
          };
        })
        .filter((person) => person.rol !== ROLES.ADMIN && !person.eliminado)
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));

      setAccountPeople(nextPeople);
      setDataError('');
      setIsLoadingPeople(false);
    }, (error) => {
      console.error('Error al cargar personas desde Firestore:', error);
      setDataError('No pudimos cargar las personas. Revisá tu conexión o los permisos de Firebase.');
      setIsLoadingPeople(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'alumnos'), (snapshot) => {
      setStudentRecords(snapshot.docs.map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() })));
    }, (error) => {
      console.error('Error al cargar fichas de alumnos:', error);
      setDataError('No pudimos sincronizar las fichas operativas de alumnos.');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const linkedUserIds = new Set(studentRecords.map((student) => student.userId || student.id));
    const missingStudents = accountPeople.filter((person) => (
      person.rol === ROLES.ALUMNO
      && !linkedUserIds.has(person.id)
      && !pendingBackfills.current.has(person.id)
    ));

    missingStudents.forEach((person) => {
      pendingBackfills.current.add(person.id);
      setDoc(doc(db, 'alumnos', person.id), {
        userId: person.id,
        nombre: person.nombre,
        dni: '',
        email: person.email,
        telefono: person.telefono || '',
        direccion: '',
        fechaNacimiento: '',
        fechaIngreso: new Date().toISOString().slice(0, 10),
        profesorId: '',
        profesorAsignado: 'Sin asignar',
        activo: person.activo !== false,
        observaciones: 'Ficha sincronizada desde Administración. Completar datos en Recepción.',
        sedeId: person.sedes[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile?.uid || ''
      }).catch((error) => {
        pendingBackfills.current.delete(person.id);
        console.error('Error al sincronizar alumno existente:', error);
        setDataError(`No pudimos sincronizar la ficha de ${person.nombre}.`);
      });
    });
  }, [accountPeople, studentRecords, userProfile?.uid]);

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
    setDataError('');
    setEditingPerson(null);
    setPersonForm(getEmptyPerson(defaultSede));
    setIsFormOpen(true);
  };

  const openEditForm = (person) => {
    setDataError('');
    setEditingPerson(person);
    setPersonForm({
      nombre: person.nombre,
      email: person.email,
      password: '',
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

  const handleSavePerson = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setDataError('');
    const normalizedPerson = {
      nombre: personForm.nombre.trim(),
      email: personForm.email.trim(),
      telefono: personForm.telefono.trim(),
      rol: personForm.rol,
      role: personForm.rol,
      sedes: personForm.sedes,
      sedeIds: personForm.sedes,
      activo: personForm.estado === 'Activo',
      active: personForm.estado === 'Activo',
      eliminado: false
    };

    try {
      if (editingPerson) {
        if (editingPerson.recordType === 'student') {
          await updateDoc(doc(db, 'alumnos', editingPerson.id), {
            nombre: normalizedPerson.nombre,
            email: normalizedPerson.email,
            telefono: normalizedPerson.telefono,
            sedeId: normalizedPerson.sedes[0],
            activo: normalizedPerson.activo,
            updatedAt: serverTimestamp(),
            updatedBy: userProfile?.uid || ''
          });
        } else {
          const batch = writeBatch(db);
          batch.update(doc(db, 'users', editingPerson.id), {
            ...normalizedPerson,
            updatedAt: serverTimestamp()
          });

          if (normalizedPerson.rol === ROLES.ALUMNO) {
            batch.set(doc(db, 'alumnos', editingPerson.studentRecordId || editingPerson.id), {
              userId: editingPerson.id,
              nombre: normalizedPerson.nombre,
              email: normalizedPerson.email,
              telefono: normalizedPerson.telefono,
              sedeId: normalizedPerson.sedes[0],
              activo: normalizedPerson.activo,
              updatedAt: serverTimestamp(),
              updatedBy: userProfile?.uid || ''
            }, { merge: true });
          } else if (editingPerson.rol === ROLES.ALUMNO) {
            batch.delete(doc(db, 'alumnos', editingPerson.studentRecordId || editingPerson.id));
          }
          await batch.commit();
        }
        setFeedback('Los cambios se guardaron correctamente.');
      } else {
        const secondaryApp = initializeApp(auth.app.options, `create-user-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        let createdUser = null;

        try {
          const credential = await createUserWithEmailAndPassword(
            secondaryAuth,
            normalizedPerson.email,
            personForm.password
          );
          createdUser = credential.user;
          const batch = writeBatch(db);
          batch.set(doc(db, 'users', createdUser.uid), {
            ...normalizedPerson,
            uid: createdUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          if (normalizedPerson.rol === ROLES.ALUMNO) {
            batch.set(doc(db, 'alumnos', createdUser.uid), {
              userId: createdUser.uid,
              nombre: normalizedPerson.nombre,
              dni: '',
              email: normalizedPerson.email,
              telefono: normalizedPerson.telefono,
              direccion: '',
              fechaNacimiento: '',
              fechaIngreso: new Date().toISOString().slice(0, 10),
              profesorId: '',
              profesorAsignado: 'Sin asignar',
              activo: normalizedPerson.activo,
              observaciones: 'Cuenta creada desde Administración. Completar DNI y datos en Recepción.',
              sedeId: normalizedPerson.sedes[0],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: userProfile?.uid || ''
            });
          }
          await batch.commit();
        } catch (error) {
          if (createdUser) {
            await Promise.allSettled([
              deleteDoc(doc(db, 'users', createdUser.uid)),
              deleteDoc(doc(db, 'alumnos', createdUser.uid)),
              deleteUser(createdUser)
            ]);
          }
          throw error;
        } finally {
          await deleteApp(secondaryApp);
        }

        setFeedback('La cuenta se creó y ya puede iniciar sesión.');
      }

      closeForm();
    } catch (error) {
      console.error('Error al guardar la persona:', error);
      const message = error.code === 'auth/email-already-in-use'
        ? 'Ese correo ya tiene una cuenta registrada.'
        : error.code === 'auth/weak-password'
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : 'No pudimos guardar la persona. Revisá los datos y los permisos de Firebase.';
      setDataError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeletePerson = async () => {
    const person = personToDelete;
    setIsSaving(true);
    try {
      if (person.recordType === 'student') {
        await deleteDoc(doc(db, 'alumnos', person.id));
        setFeedback(`${person.nombre} fue eliminado.`);
        setPersonToDelete(null);
        return;
      }
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', person.id), {
        activo: false,
        active: false,
        eliminado: true,
        updatedAt: serverTimestamp()
      });
      if (person.rol === ROLES.ALUMNO) {
        batch.set(doc(db, 'alumnos', person.studentRecordId || person.id), {
          activo: false,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.uid || ''
        }, { merge: true });
      }
      await batch.commit();
      setFeedback(`${person.nombre} fue eliminado y ya no puede iniciar sesión.`);
      setPersonToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la persona:', error);
      setDataError('No pudimos eliminar la persona. Revisá los permisos de Firebase.');
    } finally {
      setIsSaving(false);
    }
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
            <button type="button" className="admin-nav-item" onClick={() => navigate('/admin/stock')}>
              <PackageSearch size={19} />
              <span>Gestión de Stock</span>
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
        {dataError && <div className="admin-data-error" role="alert">{dataError}</div>}
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
                {isLoadingPeople ? (
                  <tr>
                    <td colSpan="6" className="admin-empty-state">
                      <Users size={28} />
                      <strong>Cargando personas...</strong>
                    </td>
                  </tr>
                ) : filteredPeople.length === 0 ? (
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
              {dataError && <div className="admin-data-error" role="alert">{dataError}</div>}
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
                    disabled={Boolean(editingPerson)}
                    required
                  />
                  {editingPerson && <small>El correo de acceso no se puede cambiar desde este panel.</small>}
                </label>

                {!editingPerson && (
                  <label className="admin-field">
                    <span>Contraseña temporal</span>
                    <input
                      type="password"
                      value={personForm.password}
                      onChange={(event) => setPersonForm({ ...personForm, password: event.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      minLength="6"
                      required
                    />
                    <small>Compartila de forma privada con la persona.</small>
                  </label>
                )}

                <label className={editingPerson ? 'admin-field' : 'admin-field admin-field-wide'}>
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
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : editingPerson ? 'Guardar cambios' : 'Crear cuenta'}
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
              <button type="button" className="admin-danger-button" onClick={confirmDeletePerson} disabled={isSaving}>
                {isSaving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}

      {feedback && <div className="admin-toast" role="status"><Check size={18} /> {feedback}</div>}
    </div>
  );
};

export default AdminDashboard;
