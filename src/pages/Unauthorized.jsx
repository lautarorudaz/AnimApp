import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <ShieldAlert size={56} color="#f87171" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: '#fff' }}>Acceso No Autorizado</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Su perfil institucional no posee los permisos necesarios para ingresar a este módulo o sede.
        </p>
        <Link to="/" className="btn-primary btn-full">
          <ArrowLeft size={18} /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
