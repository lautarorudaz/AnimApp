import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Dumbbell, 
  Users, 
  Shield, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section id="inicio" className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-badge">
              <Sparkles size={16} /> Sistema de Gestión Multi-Sede
            </div>
            <h1 className="hero-title">
              La Red de Gimnasios conectada en <span className="text-gradient">3 Sedes Integradas</span>
            </h1>
            <p className="hero-description">
              Optimizamos el rendimiento de los alumnos. Conecta Administradores, Profesores y Recepcionistas en una plataforma unificada y en tiempo real.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary">
                Plataforma AnimApp <ArrowRight size={18} />
              </Link>
              <a href="#sedes" className="btn-secondary">
                Ver Sedes Disponibles
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>
            <div className="visual-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: 700 }}>ESTADO DEL SISTEMA</span>
                <span className="badge-role badge-admin">3 SEDES ONLINE</span>
              </div>
              <div style={{ background: '#111827', padding: '1.2rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Alumnos Activos</span>
                  <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>+1,280</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--accent-orange), var(--accent-lime))' }}></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profesores</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>24 Staff</p>
                </div>
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rutinas Creadas</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>3,450+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología & Servicios Destacados */}
      <section id="metodologia" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Nuestra Metodología</span>
            <h2 className="section-title">Especialmente diseñado para cada Rol</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Nuestra arquitectura garantiza que cada miembro del equipo trabaje con las herramientas necesarias de forma fluida.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={28} />
              </div>
              <h3 className="feature-title">Panel Administrador</h3>
              <p className="feature-text">
                Control total de la organización. Alta, baja y edición de profesores y recepcionistas. Asignación multi-sede y supervisión global.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                <Dumbbell size={28} />
              </div>
              <h3 className="feature-title">Módulo Profesores</h3>
              <p className="feature-text">
                Gestión directa de alumnos asignados, creación de rutinas personalizadas por días, seguimiento de progreso e historial.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(132, 204, 22, 0.1)', color: 'var(--accent-lime)' }}>
                <Users size={28} />
              </div>
              <h3 className="feature-title">Módulo Recepción</h3>
              <p className="feature-text">
                Registro rápido de nuevos alumnos, visualización completa del listado de la sede, edición de datos de contacto y bajas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sedes del Gimnasio */}
      <section id="sedes" className="sedes-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Ubicaciones</span>
            <h2 className="section-title">Nuestras 3 Sedes Operativas</h2>
            <p style={{ color: 'var(--text-muted)' }}>Los profesores y recepcionistas pueden operar en 1 o más sedes según su asignación.</p>
          </div>

          <div className="sedes-grid">
            <div className="sede-card">
              <div>
                <span className="sede-badge">SEDE 01 - NORTE</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>AnimApp Norte</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Av. Libertador 4500. Área de musculación de 1000m², zona crossfit y piscina semiolímpica.
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Equipamiento Premium</span>
                <span style={{ color: 'var(--accent-orange)' }}>Operativa</span>
              </div>
            </div>

            <div className="sede-card">
              <div>
                <span className="sede-badge" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)' }}>SEDE 02 - CENTRO</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>AnimApp Centro</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Calle Corrientes 1250. Sede central con salas de spinning, entrenamiento funcional y evaluación física.
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Abierto 24/7</span>
                <span style={{ color: 'var(--accent-orange)' }}>Operativa</span>
              </div>
            </div>

            <div className="sede-card">
              <div>
                <span className="sede-badge" style={{ background: 'rgba(132, 204, 22, 0.1)', color: 'var(--accent-lime)' }}>SEDE 03 - SUR</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>AnimApp Sur</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Av. Hipólito Yrigoyen 890. Centro especializado en musculación pesada, rehabilitación y calistenia.
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Zona Calistenia</span>
                <span style={{ color: 'var(--accent-orange)' }}>Operativa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Call to Action */}
      <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px' }}>
          <Lock size={40} color="var(--accent-orange)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>Acceso Exclusivo a Plataforma</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Ingresa a la plataforma para gestionar rutinas, verificar asistencias o administrar el equipo de trabajo.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.1rem' }}>
            Plataforma AnimApp <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
