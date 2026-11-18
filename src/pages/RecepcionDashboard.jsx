import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit3,
  History,
  Home,
  LogOut,
  Package,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import SedeSwitcher from '../components/SedeSwitcher';
import { getSedeLabel } from '../constants/appData';
import { useAuth } from '../context/auth';
import { deactivateReceptionStudent, saveReceptionStudent, watchReceptionStudents, watchSedeTeachers } from '../features/routines/receptionData';
import { friendlyError, isStudentActive } from '../features/routines/model';
import { Field, Modal, Notice } from '../features/routines/Workspace';

const initialStock = [
  { id: 'p1', nombre: 'Lavandina', categoria: 'Limpieza', unidad: 'litros', sede: 'moreno', stockActual: 12, stockMinimo: 5 },
  { id: 'p2', nombre: 'Rollo de papel', categoria: 'Banos', unidad: 'unidades', sede: 'moreno', stockActual: 18, stockMinimo: 10 },
  { id: 'p3', nombre: 'Desinfectante', categoria: 'Limpieza', unidad: 'litros', sede: 'edison', stockActual: 4, stockMinimo: 6 },
  { id: 'p4', nombre: 'Bolsas de residuos', categoria: 'Deposito', unidad: 'paquetes', sede: 'general-san-martin', stockActual: 9, stockMinimo: 4 }
];

const initialMovimientos = [
  { id: 'm1', productoId: 'p1', productoNombre: 'Lavandina', sede: 'moreno', tipo: 'ingreso', cantidad: 6, usuario: 'Mariana Lopez', motivo: 'Compra semanal', fecha: '2026-08-16' },
  { id: 'm2', productoId: 'p3', productoNombre: 'Desinfectante', sede: 'edison', tipo: 'egreso', cantidad: 2, usuario: 'Lucia Fernandez', motivo: 'Reposicion vestuarios', fecha: '2026-08-17' }
];

const emptyAlumnoForm = {
  nombre: '',
  dni: '',
  email: '',
  telefono: '',
  profesorId: ''
};

const emptyProductForm = {
  nombre: '',
  categoria: 'Limpieza',
  unidad: 'unidades',
  stockActual: 0,
  stockMinimo: 0
};

const emptyMovementForm = {
  tipo: 'ingreso',
  cantidad: 1,
  motivo: ''
};

const RecepcionDashboard = () => {
  const { activeSede, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('alumnos');
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [teachersError, setTeachersError] = useState('');
  const [studentsError, setStudentsError] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentNotice, setStudentNotice] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState(emptyAlumnoForm);

  const [stockItems, setStockItems] = useState(initialStock);
  const [movimientos, setMovimientos] = useState(initialMovimientos);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementForm, setMovementForm] = useState(emptyMovementForm);

  const activeSedeId = activeSede?.id;

  useEffect(() => {
    setProfesores([]); setAlumnos([]); setTeachersError(''); setStudentsError('');
    setTeachersLoading(true); setStudentsLoading(true); setShowStudentModal(false);
    if (!activeSedeId) { setTeachersLoading(false); setStudentsLoading(false); return; }
    const stopTeachers = watchSedeTeachers(activeSedeId,
      (items) => { setProfesores(items); setTeachersLoading(false); },
      (error) => { setTeachersError(friendlyError(error)); setTeachersLoading(false); });
    const stopStudents = watchReceptionStudents(activeSedeId,
      (items) => { setAlumnos(items); setStudentsLoading(false); },
      (error) => { setStudentsError(friendlyError(error)); setStudentsLoading(false); });
    return () => { stopTeachers(); stopStudents(); };
  }, [activeSedeId]);

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((alumno) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query
        || (alumno.nombre || '').toLowerCase().includes(query)
        || String(alumno.dni || '').includes(query);
      const matchesSede = !activeSedeId || alumno.sedeId === activeSedeId;
      return matchesSearch && matchesSede && isStudentActive(alumno);
    });
  }, [activeSedeId, alumnos, searchTerm]);

  const stockBySede = useMemo(() => {
    return stockItems.filter((item) => item.sede === activeSedeId);
  }, [activeSedeId, stockItems]);

  const movimientosBySede = useMemo(() => {
    return movimientos.filter((movimiento) => movimiento.sede === activeSedeId);
  }, [activeSedeId, movimientos]);

  const stockBajoCount = stockBySede.filter((item) => item.stockActual <= item.stockMinimo).length;

  const handleOpenStudentModal = (student = null) => {
    setEditingStudent(student);
    setStudentForm(student ? {
      nombre: student.nombre || '',
      dni: student.dni || '',
      email: student.email || '',
      telefono: student.telefono || '',
      profesorId: student.profesorId || ''
    } : emptyAlumnoForm);
    setStudentError('');
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (event) => {
    event.preventDefault();
    if (!activeSedeId || teachersLoading || teachersError || savingStudent) return;
    if (studentForm.profesorId && !profesores.some((teacher) => teacher.id === studentForm.profesorId)) {
      setStudentError('Seleccioná un profesor activo de esta sede o dejá al alumno sin asignar.'); return;
    }
    setSavingStudent(true); setStudentError('');
    try {
      await saveReceptionStudent(studentForm, editingStudent?.id, activeSedeId);
      setStudentNotice('Alumno guardado. La asignación ya está disponible para el profesor.');
      setShowStudentModal(false); setEditingStudent(null);
    } catch (error) { setStudentError(friendlyError(error)); }
    finally { setSavingStudent(false); }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('¿Dar de baja a este alumno conservando sus datos y rutinas?')) return;
    try { await deactivateReceptionStudent(id, activeSedeId); setStudentNotice('Alumno dado de baja.'); }
    catch (error) { setStudentsError(friendlyError(error)); }
  };

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? {
      nombre: product.nombre,
      categoria: product.categoria,
      unidad: product.unidad,
      stockActual: product.stockActual,
      stockMinimo: product.stockMinimo
    } : emptyProductForm);
    setShowProductModal(true);
  };

  const handleSaveProduct = (event) => {
    event.preventDefault();
    const normalizedProduct = {
      ...productForm,
      stockActual: Number(productForm.stockActual),
      stockMinimo: Number(productForm.stockMinimo)
    };

    if (editingProduct) {
      setStockItems((current) => current.map((item) => (
        item.id === editingProduct.id ? { ...item, ...normalizedProduct } : item
      )));
    } else {
      setStockItems((current) => [
        ...current,
        {
          id: Date.now().toString(),
          ...normalizedProduct,
          sede: activeSedeId
        }
      ]);
    }

    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleOpenMovementModal = (product, tipo) => {
    setSelectedProduct(product);
    setMovementForm({ ...emptyMovementForm, tipo });
    setShowMovementModal(true);
  };

  const handleSaveMovement = (event) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const cantidad = Number(movementForm.cantidad);
    if (movementForm.tipo === 'egreso' && cantidad > selectedProduct.stockActual) {
      window.alert('No hay stock suficiente para registrar este egreso.');
      return;
    }

    const nextStock = movementForm.tipo === 'ingreso'
      ? selectedProduct.stockActual + cantidad
      : selectedProduct.stockActual - cantidad;

    setStockItems((current) => current.map((item) => (
      item.id === selectedProduct.id ? { ...item, stockActual: nextStock } : item
    )));

    setMovimientos((current) => [
      {
        id: Date.now().toString(),
        productoId: selectedProduct.id,
        productoNombre: selectedProduct.nombre,
        sede: selectedProduct.sede,
        tipo: movementForm.tipo,
        cantidad,
        usuario: userProfile?.nombre || userProfile?.email || 'Usuario',
        motivo: movementForm.motivo || 'Sin detalle',
        fecha: new Date().toISOString().split('T')[0]
      },
      ...current
    ]);

    setShowMovementModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Esta seguro de eliminar este producto del stock?')) {
      setStockItems((current) => current.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
              <UserCheck size={20} />
            </div>
            <span>PANEL<span style={{ color: 'var(--accent-cyan)' }}>RECEPCION</span></span>
          </div>

          <ul className="sidebar-menu">
            <li className={`sidebar-item ${activeSection === 'alumnos' ? 'active' : ''}`} onClick={() => setActiveSection('alumnos')}>
              <Users size={18} /> Alumnos
            </li>
            <li className={`sidebar-item ${activeSection === 'stock' ? 'active' : ''}`} onClick={() => setActiveSection('stock')}>
              <Package size={18} /> Stock limpieza
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
            <h1 style={{ fontSize: '1.8rem' }}>{activeSection === 'alumnos' ? 'Gestion de alumnos' : 'Stock de limpieza'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Trabajo actual en {activeSede?.titulo || 'sede asignada'}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <SedeSwitcher />
            <span className="badge-role badge-recepcion">Rol: Recepcion</span>
            {activeSection === 'alumnos' ? (
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }} onClick={() => handleOpenStudentModal()}>
                <UserPlus size={18} /> Nuevo alumno
              </button>
            ) : (
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }} onClick={() => handleOpenProductModal()}>
                <Package size={18} /> Nuevo producto
              </button>
            )}
          </div>
        </div>

        {activeSection === 'alumnos' && (
          <>
            <Notice error>{studentsError}</Notice><Notice>{studentNotice}</Notice>
            {studentsLoading && <p role="status">Cargando alumnos…</p>}
            <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '420px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por nombre o DNI..."
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>Alumno / DNI</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Contacto</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Sede</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Profesor</th>
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
                    filteredAlumnos.map((alumno) => (
                      <tr key={alumno.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{alumno.nombre}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DNI: {alumno.dni}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontSize: '0.85rem', color: '#fff' }}>{alumno.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alumno.telefono}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span className="badge-role" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                            {getSedeLabel(alumno.sedeId)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-orange)', fontWeight: 500 }}>
                          {profesores.find((teacher) => teacher.id === alumno.profesorId)?.nombre || (alumno.profesorId ? 'Profesor no disponible' : 'Sin asignar')}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenStudentModal(alumno)} className="btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                              <Edit3 size={15} /> Editar
                            </button>
                            <button onClick={() => handleDeleteStudent(alumno.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.45rem 0.6rem', borderRadius: '6px' }}>
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
          </>
        )}

        {activeSection === 'stock' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Productos</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stockBySede.length}</p>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Stock bajo</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: stockBajoCount > 0 ? '#f87171' : 'var(--accent-lime)' }}>{stockBajoCount}</p>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Movimientos</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{movimientosBySede.length}</p>
              </div>
            </div>

            <div className="stock-workspace">
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '1rem 1.5rem' }}>Producto</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Stock actual</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Minimo</th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockBySede.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No hay productos cargados en {activeSede?.titulo || 'esta sede'}.
                        </td>
                      </tr>
                    ) : (
                      stockBySede.map((item) => {
                        const isLow = item.stockActual <= item.stockMinimo;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{item.nombre}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.categoria} · {getSedeLabel(item.sede)}</div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <span style={{ color: isLow ? '#f87171' : 'var(--accent-lime)', fontWeight: 800 }}>
                                {item.stockActual} {item.unidad}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                              {item.stockMinimo} {item.unidad}
                            </td>
                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button onClick={() => handleOpenMovementModal(item, 'ingreso')} className="btn-secondary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}>
                                  <ArrowUpCircle size={15} /> Ingreso
                                </button>
                                <button onClick={() => handleOpenMovementModal(item, 'egreso')} className="btn-secondary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}>
                                  <ArrowDownCircle size={15} /> Egreso
                                </button>
                                <button onClick={() => handleOpenProductModal(item)} className="btn-secondary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}>
                                  <Edit3 size={15} />
                                </button>
                                <button onClick={() => handleDeleteProduct(item.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.45rem 0.6rem', borderRadius: '6px' }}>
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <aside style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} /> Historial
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '460px', overflowY: 'auto' }}>
                  {movimientosBySede.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Todavia no hay movimientos en esta sede.</p>
                  ) : (
                    movimientosBySede.map((movimiento) => (
                      <div key={movimiento.id} style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.3rem' }}>
                          <strong style={{ color: '#fff' }}>{movimiento.productoNombre}</strong>
                          <span style={{ color: movimiento.tipo === 'ingreso' ? 'var(--accent-lime)' : '#f87171', fontWeight: 800 }}>
                            {movimiento.tipo === 'ingreso' ? '+' : '-'}{movimiento.cantidad}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{movimiento.motivo}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.45rem' }}>
                          {movimiento.fecha} · {movimiento.usuario}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </>
        )}

        {showStudentModal && (
          <Modal title={editingStudent ? 'Editar alumno' : 'Inscribir alumno'} busy={savingStudent} onClose={() => setShowStudentModal(false)}>
              <form onSubmit={handleSaveStudent}>
                <Notice error>{studentError || teachersError}</Notice>
                <p className="training-muted" style={{ marginBottom: '1rem' }}>{activeSede?.titulo}</p>
                <fieldset className="training-fieldset" disabled={savingStudent}>
                  {[['nombre', 'Nombre completo'], ['dni', 'DNI'], ['email', 'Correo electrónico'], ['telefono', 'Teléfono']].map(([key, label]) => <Field key={key} label={label}><input type={key === 'email' ? 'email' : 'text'} className="form-input" maxLength={120} value={studentForm[key]} onChange={(event) => setStudentForm({ ...studentForm, [key]: event.target.value })} required /></Field>)}
                  <Field label="Profesor asignado"><select className="form-input" value={studentForm.profesorId} disabled={teachersLoading || !!teachersError} onChange={(event) => setStudentForm({ ...studentForm, profesorId: event.target.value })}>
                    <option value="">{teachersLoading ? 'Cargando profesores…' : 'Sin asignar'}</option>
                    {studentForm.profesorId && !profesores.some((teacher) => teacher.id === studentForm.profesorId) && <option value={studentForm.profesorId} disabled>Profesor anterior no disponible en esta sede</option>}
                    {profesores.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nombre || teacher.email}</option>)}
                  </select></Field>
                  {!teachersLoading && !teachersError && !profesores.length && <p className="training-muted">No hay profesores activos en esta sede. Podés guardar al alumno sin asignar y asignarlo después.</p>}
                  {!editingStudent && <p className="training-muted">Se creará la ficha del alumno. El administrador debe vincular su cuenta de acceso para que pueda consultar rutinas.</p>}
                </fieldset>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn-secondary" disabled={savingStudent} style={{ flex: 1 }} onClick={() => setShowStudentModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={savingStudent || teachersLoading || !!teachersError || !activeSedeId} style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
                    {savingStudent ? 'Guardando…' : 'Guardar alumno'}
                  </button>
                </div>
              </form>
          </Modal>
        )}

        {showProductModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
                <button onClick={() => setShowProductModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="form-group">
                  <label className="form-label">Producto</label>
                  <input className="form-input" value={productForm.nombre} onChange={(event) => setProductForm({ ...productForm, nombre: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <input className="form-input" value={productForm.categoria} onChange={(event) => setProductForm({ ...productForm, categoria: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <input className="form-input" value={productForm.unidad} onChange={(event) => setProductForm({ ...productForm, unidad: event.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stock actual</label>
                    <input type="number" min="0" className="form-input" value={productForm.stockActual} onChange={(event) => setProductForm({ ...productForm, stockActual: event.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock minimo</label>
                    <input type="number" min="0" className="form-input" value={productForm.stockMinimo} onChange={(event) => setProductForm({ ...productForm, stockMinimo: event.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowProductModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
                    Guardar producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMovementModal && selectedProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{movementForm.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de stock</h2>
                <button onClick={() => setShowMovementModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMovement}>
                <div style={{ background: '#111827', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <strong>{selectedProduct.nombre}</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Stock actual: {selectedProduct.stockActual} {selectedProduct.unidad}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de movimiento</label>
                  <select className="form-input" value={movementForm.tipo} onChange={(event) => setMovementForm({ ...movementForm, tipo: event.target.value })}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input type="number" min="1" className="form-input" value={movementForm.cantidad} onChange={(event) => setMovementForm({ ...movementForm, cantidad: event.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Motivo</label>
                  <input className="form-input" value={movementForm.motivo} onChange={(event) => setMovementForm({ ...movementForm, motivo: event.target.value })} placeholder="Ej: compra, reposicion, limpieza diaria" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowMovementModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
                    Registrar
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
