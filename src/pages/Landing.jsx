import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Dumbbell, Lock, Shield, Sparkles, Users } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import heroLeft from '../assets/gym-hero-left.png';
import heroRight from '../assets/gym-hero-right.png';
import { SEDES } from '../constants/appData';

const sedeHighlights = {
  moreno: 'Entrenamiento de fuerza, musculacion y seguimiento personalizado.',
  edison: 'Rutinas guiadas, evaluaciones fisicas y clases para todos los niveles.',
  'general-san-martin': 'Musculacion, rehabilitacion y entrenamiento tecnico supervisado.'
};

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section id="inicio" className="hero landing-hero">
        <div className="hero-split-media" aria-hidden="true">
          <div className="hero-split-image hero-split-left" style={{ backgroundImage: `url(${heroLeft})` }} />
          <div className="hero-split-image hero-split-right" style={{ backgroundImage: `url(${heroRight})` }} />
        </div>

        <div className="container hero-center">
          <div className="hero-badge">
            <Sparkles size={16} /> Sistema de gestion multi-sede
          </div>
          <h1 className="hero-title">
            Entrena con seguimiento real en cada sede
          </h1>
          <p className="hero-description">
            AnimApp conecta profesores, recepcion, administracion y alumnos para que cada rutina tenga continuidad, datos claros y trabajo coordinado.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">
              Plataforma AnimApp <ArrowRight size={18} />
            </Link>
            <a href="#sedes" className="btn-secondary">
              Ver sedes
            </a>
          </div>
        </div>
      </section>

      <section id="metodologia" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Metodologia</span>
            <h2 className="section-title">Cada rol trabaja con su panel</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              La plataforma separa permisos y responsabilidades para que cada sede pueda operar con orden.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={28} />
              </div>
              <h3 className="feature-title">Administracion</h3>
              <p className="feature-text">
                Control global de sedes, staff, alumnos, rutinas activas y permisos por usuario.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(87, 158, 224, 0.12)', color: 'var(--brand-200)' }}>
                <Dumbbell size={28} />
              </div>
              <h3 className="feature-title">Profesores</h3>
              <p className="feature-text">
                Gestion de alumnos, ejercicios, semanas, dias de entrenamiento y evolucion.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(76, 142, 203, 0.14)', color: 'var(--brand-300)' }}>
                <Users size={28} />
              </div>
              <h3 className="feature-title">Recepcion</h3>
              <p className="feature-text">
                Inscripcion de alumnos y control de stock de limpieza con ingresos, egresos e historial.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(46, 113, 179, 0.18)', color: 'var(--brand-100)' }}>
                <Bot size={28} />
              </div>
              <h3 className="feature-title">Chatbot</h3>
              <p className="feature-text">
                Asistente para responder preguntas frecuentes sobre sedes, horarios, metodologia y servicios.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="sedes" className="sedes-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Ubicaciones</span>
            <h2 className="section-title">Nuestras sedes</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Profesores y recepcionistas pueden trabajar en una o mas sedes segun su asignacion.
            </p>
          </div>

          <div className="sedes-grid">
            {SEDES.map((sede, index) => (
              <div className="sede-card" key={sede.id}>
                <div>
                  <span className="sede-badge" style={{ color: sede.color }}>
                    SEDE {String(index + 1).padStart(2, '0')} - {sede.nombre.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>AnimApp {sede.nombre}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {sedeHighlights[sede.id]}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>Atencion personalizada</span>
                  <span style={{ color: 'var(--accent-orange)' }}>Operativa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #0b1d33 0%, #102a47 100%)', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px' }}>
          <Lock size={40} color="var(--accent-orange)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>Acceso exclusivo a plataforma</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Ingrese para gestionar alumnos, rutinas, staff y stock por sede.
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
