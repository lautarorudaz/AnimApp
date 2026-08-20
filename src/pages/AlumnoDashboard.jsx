import React from 'react';
import { CalendarDays, Dumbbell, Home, LogOut, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSedeLabel } from '../constants/appData';
import { useAuth } from '../context/auth';

const rutinaDemo = {
  nombre: 'Rutina activa',
  objetivo: 'Fuerza e hipertrofia',
  semanas: [
    {
      nombre: 'Semana 1',
      dias: [
        {
          nombre: 'Dia 1 - Torso',
          ejercicios: [
            { nombre: 'Press banca', series: 4, repeticiones: 10, peso: '70 kg', observaciones: 'Tecnica controlada' },
            { nombre: 'Remo con barra', series: 4, repeticiones: 10, peso: '60 kg', observaciones: 'Espalda neutra' }
          ]
        },
        {
          nombre: 'Dia 2 - Piernas',
          ejercicios: [
            { nombre: 'Sentadilla', series: 4, repeticiones: 8, peso: '80 kg', observaciones: 'Rango completo' },
            { nombre: 'Peso muerto rumano', series: 3, repeticiones: 12, peso: '55 kg', observaciones: 'Bajada lenta' }
          ]
        }
      ]
    }
  ]
};

const AlumnoDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const sedeId = userProfile?.sedes?.[0] || userProfile?.sedeIds?.[0];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-lime), #65a30d)' }}>
              <Dumbbell size={20} />
            </div>
            <span>PANEL<span style={{ color: 'var(--accent-lime)' }}>ALUMNO</span></span>
          </div>

          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <CalendarDays size={18} /> Mi rutina
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
            <h1 style={{ fontSize: '1.8rem' }}>Mi rutina de entrenamiento</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {userProfile?.nombre} · {getSedeLabel(sedeId)}
            </p>
          </div>

          <span className="badge-role" style={{ background: 'rgba(132, 204, 22, 0.18)', color: 'var(--accent-lime)' }}>
            Rol: Alumno
          </span>
        </div>

        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Objetivo</span>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{rutinaDemo.nombre}</h2>
          <p style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>{rutinaDemo.objetivo}</p>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {rutinaDemo.semanas.map((semana) => (
            <section key={semana.nombre} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{semana.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {semana.dias.map((dia) => (
                  <div key={dia.nombre} style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>{dia.nombre}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {dia.ejercicios.map((ejercicio) => (
                        <div key={ejercicio.nombre} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <strong style={{ color: '#fff' }}>{ejercicio.nombre}</strong>
                          <div>{ejercicio.series} series x {ejercicio.repeticiones} reps · {ejercicio.peso}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <MessageSquareText size={14} /> {ejercicio.observaciones}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AlumnoDashboard;
