import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, LogIn } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="landing-nav">
      <div className="container nav-container-centered">
        {/* Enlaces a la izquierda del logo */}
        <div className="nav-group-left">
          <a href="#inicio" className="nav-link">Inicio</a>
          <a href="#contacto" className="nav-link">Contacto</a>
        </div>

        {/* Logo en el centro */}
        <Link to="/" className="logo" style={{ margin: '0 1rem' }}>
          <div className="logo-icon">
            <Dumbbell size={22} />
          </div>
          <span>ANIM<span style={{ color: 'var(--accent-orange)' }}>APP</span></span>
        </Link>

        {/* Enlaces a la derecha del logo y botón Plataforma AnimApp */}
        <div className="nav-group-right">
          <a href="#metodologia" className="nav-link">Metodología</a>
          <a href="#sedes" className="nav-link">Nuestras sedes</a>
          
          <Link to="/login" className="btn-portal">
            <LogIn size={18} />
            Plataforma AnimApp
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
