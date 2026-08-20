import React from 'react';
import { Dumbbell, Mail, MapPin, Phone } from 'lucide-react';
import { SEDES } from '../constants/appData';

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
            Plataforma integral para sedes, alumnos, rutinas y stock operativo del gimnasio.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Nuestras sedes</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {SEDES.map((sede) => (
              <li key={sede.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color={sede.color} /> <strong>{sede.titulo}:</strong> {sede.direccion}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Contacto y soporte</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} color="var(--accent-orange)" /> +54 11 4000-8000
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} color="var(--accent-orange)" /> contacto@animapp.com
          </p>
        </div>
      </div>

      <div className="container" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} AnimApp Gimnasios - Sistema de gestion de sedes
      </div>
    </footer>
  );
};

export default Footer;
