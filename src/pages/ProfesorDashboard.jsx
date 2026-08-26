import { useState } from 'react';
import { BookOpen, ClipboardList, Dumbbell, LogOut } from 'lucide-react';
import ExerciseLibrary from '../components/ExerciseLibrary';
import RoutineWorkspace from '../components/RoutineWorkspace';
import { useAuth } from '../context/auth';

const getInitials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2)
  .map((part) => part[0]).join('').toUpperCase();

const ProfesorDashboard = () => {
  const { activeSede, currentUser, logout, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('rutinas');

  return (
    <div className="dashboard-layout reception-dashboard professor-dashboard">
      <aside className="sidebar reception-sidebar professor-sidebar">
        <div>
          <div className="reception-brand"><div className="logo-icon"><Dumbbell size={21} /></div><div><strong>ANIMAPP</strong><span>Profesor</span></div></div>
          <nav className="reception-nav" aria-label="Navegación del profesor">
            <button type="button" className={activeSection === 'ejercicios' ? 'reception-nav-item active' : 'reception-nav-item'} onClick={() => setActiveSection('ejercicios')}><BookOpen size={19} /> Ejercicios</button>
            <button type="button" className={activeSection === 'rutinas' ? 'reception-nav-item active' : 'reception-nav-item'} onClick={() => setActiveSection('rutinas')}><ClipboardList size={19} /> Rutinas</button>
          </nav>
        </div>
        <div className="reception-session"><div className="reception-user"><span>{getInitials(userProfile?.nombre)}</span><div><strong>{userProfile?.nombre}</strong><small>{userProfile?.email}</small></div></div><button type="button" onClick={logout}><LogOut size={18} /> Cerrar sesión</button></div>
      </aside>
      <main className="main-content reception-main professor-main">
        {activeSection === 'ejercicios'
          ? <ExerciseLibrary activeSedeId={activeSede?.id} currentUser={currentUser} userProfile={userProfile} />
          : <RoutineWorkspace activeSede={activeSede} currentUser={currentUser} userProfile={userProfile} />}
      </main>
    </div>
  );
};

export default ProfesorDashboard;
