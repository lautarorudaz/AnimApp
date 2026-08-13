import React from 'react';
import { Dumbbell, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" style={{ background: '#070a12', padding: '4rem 0 2rem', borderTop: '1px solid var(--border-color)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <div className="logo" style={{ marginBottom: '1.2rem' }}>
            <div className="logo-icon">
              <Dumbbell size={22} />
            </div>
            <span>ANIM<span style={{ color: 'var(--accent-orange)' }}>APP</span></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Plataforma integral de gestión de sedes, seguimiento personalizado de alumnos y creación de rutinas dinámicas de alto rendimiento.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Nuestras Sedes</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--accent-orange)" /> <strong>Sede Norte:</strong> Av. Libertador 4500
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--accent-cyan)" /> <strong>Sede Centro:</strong> Calle Corrientes 1250
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--accent-lime)" /> <strong>Sede Sur:</strong> Av. Hipólito Yrigoyen 890
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Contacto & Soporte</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} color="var(--accent-orange)" /> +54 11 4000-8000
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} color="var(--accent-orange)" /> contacto@animapp.com
          </p>
        </div>
      </div>

      <div className="container" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} AnimApp Gimnasios - Sistema de Gestión de Sedes
      </div>
    </footer>
  );
};

export default Footer;
