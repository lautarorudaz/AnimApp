import React from 'react';
import { Dumbbell, MapPin, MessageCircle } from 'lucide-react';
import { SEDES } from '../constants/appData';
import { getSedeWhatsappUrl, SEDE_INFO } from '../constants/sedeInfo';

const Footer = () => {
  return (
    <footer id="contacto" style={{ background: '#070a12', padding: '3rem 0 1.5rem', borderTop: '1px solid var(--border-color)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
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
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Consultas por WhatsApp</h4>
          {SEDES.filter((sede) => SEDE_INFO[sede.id].whatsappUrl).map((sede) => <a key={sede.id} href={getSedeWhatsappUrl(SEDE_INFO[sede.id])} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={16} color={sede.color} /> Consultar en {sede.nombre}
          </a>)}
        </div>
      </div>

      <div className="container" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} AnimApp Gimnasios - Sistema de gestion de sedes
      </div>
    </footer>
  );
};

export default Footer;
