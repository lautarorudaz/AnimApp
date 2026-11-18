import { Children, cloneElement, isValidElement, useEffect, useId, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, CalendarDays, Dumbbell, Home, LogOut, Users, X } from 'lucide-react';
import { useAuth } from '../../context/auth';
import './routines.css';

export function Workspace({ children, student = false, admin = false }) {
  const { logout } = useAuth();
  return <div className="dashboard-layout training-workspace">
    <aside className="sidebar">
      <div><Link className="logo" to="/"><div className="logo-icon"><Dumbbell size={20} /></div><span>ANIM<span className="training-accent">APP</span></span></Link>
        <p className="training-sidebar-caption">Espacio del {admin ? 'administrador' : student ? 'alumno' : 'profesor'}</p>
        <nav className="sidebar-menu" aria-label="Navegación del panel">
          {admin || student ? <NavLink className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to={admin ? '/admin' : '/alumno'}>{student ? <CalendarDays size={18} /> : <Users size={18} />}{admin ? 'Personas y asignaciones' : 'Mi entrenamiento'}</NavLink> : <>
            <NavLink end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to="/profesor"><Users size={18} />Alumnos</NavLink>
            <NavLink className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to="/profesor/rutinas"><BookOpen size={18} />Rutinas</NavLink>
            <NavLink className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to="/profesor/ejercicios"><Dumbbell size={18} />Ejercicios</NavLink>
          </>}
          <Link className="sidebar-item" to="/"><Home size={18} />Sitio informativo</Link>
        </nav>
      </div>
      <button className="sidebar-item training-logout" onClick={() => logout().catch(() => window.alert('No se pudo cerrar la sesión. Intentá nuevamente.'))}><LogOut size={18} />Cerrar sesión</button>
    </aside>
    <main className="main-content">{children}</main>
  </div>;
}

export function Modal({ title, onClose, children, wide = false, editor = false, busy = false }) {
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape' && !busy) { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = [...panel.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]')];
      const first = nodes[0]; const last = nodes.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [busy]);
  return <div className="training-overlay"><section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`training-modal ${wide ? 'training-modal-wide' : ''} ${editor ? 'training-modal-editor' : ''}`}>
    <header className="training-modal-header"><h2 id={titleId}>{title}</h2><button type="button" className="training-icon" aria-label="Cerrar ventana" disabled={busy} onClick={onClose}><X size={21} /></button></header>
    {children}
  </section></div>;
}

export function Field({ label, children, ...props }) {
  const fieldId = useId();
  const connectLabel = (node) => {
    if (!isValidElement(node)) return node;
    if (['input', 'select', 'textarea'].includes(node.type)) return cloneElement(node, { id: fieldId });
    return node.props.children ? cloneElement(node, {}, Children.map(node.props.children, connectLabel)) : node;
  };
  return <div className="training-field" {...props}><label htmlFor={fieldId}>{label}</label>{Children.map(children, connectLabel)}</div>;
}
export function Notice({ children, error = false }) {
  return children ? <div className={`training-notice ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div> : null;
}
export function Empty({ title, children }) {
  return <div className="training-empty"><Dumbbell size={30} /><h3>{title}</h3><p>{children}</p></div>;
}
