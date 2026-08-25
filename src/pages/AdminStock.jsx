import { ArrowLeft, Boxes, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

const AdminStock = () => {
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();

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
            <button type="button" className="admin-nav-item" onClick={() => navigate('/admin')}>
              <ArrowLeft size={19} />
              <span>Gestión de personas</span>
            </button>
            <button type="button" className="admin-nav-item active">
              <Boxes size={19} />
              <span>Gestión de Stock</span>
            </button>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-summary">
            <div className="admin-profile-avatar">{(userProfile?.nombre || 'Administrador').slice(0, 2).toUpperCase()}</div>
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
            <h1>Gestión de Stock</h1>
            <p>Este espacio está preparado para desarrollar el control de stock de las sedes.</p>
          </div>
        </header>

        <section className="admin-directory admin-stock-placeholder">
          <Boxes size={44} />
          <h2>Próximamente</h2>
          <p>Acá vas a poder consultar productos, existencias y movimientos por sede.</p>
        </section>
      </main>
    </div>
  );
};

export default AdminStock;
