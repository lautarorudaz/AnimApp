import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Dumbbell,
  Handshake,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  Smartphone,
  Sparkles,
  UserRound,
  X
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import ArevalitoChat from '../components/ArevalitoChat';
import heroLeft from '../assets/gym-hero-left.png';
import heroRight from '../assets/gym-hero-right.png';
import { SEDES } from '../constants/appData';

const methodologySteps = [
  {
    title: 'Recepción',
    text: 'Te damos la bienvenida, registramos tus datos y conocemos tus objetivos para empezar con una base clara.',
    icon: ClipboardCheck
  },
  {
    title: 'Presentación',
    text: 'Te presentamos al profesor que será tu guía y referente durante todo tu proceso en el gimnasio.',
    icon: Handshake
  },
  {
    title: 'Rutina',
    text: 'Durante las primeras semanas, el profesor te acompaña con una rutina de adaptación y corrige cada ejercicio.',
    icon: Dumbbell
  },
  {
    title: 'Plataforma',
    text: 'Una vez que completás la adaptación, generamos tu rutina en la plataforma. Podés consultar tus datos en recepción.',
    icon: Smartphone
  }
];

const getWhatsAppHref = (sede) => {
  const message = encodeURIComponent(`Hola, quiero hacer una consulta sobre la sede ${sede.nombre}.`);
  const phone = sede.whatsapp.replace(/\D/g, '');

  return phone
    ? `https://wa.me/${phone}?text=${message}`
    : `https://api.whatsapp.com/send?text=${message}`;
};

const Landing = () => {
  const [selectedSede, setSelectedSede] = useState(null);
  const [activeProfessorIndex, setActiveProfessorIndex] = useState(0);

  useEffect(() => {
    if (!selectedSede) return undefined;

    const previousOverflow = document.body.style.overflow;
    const professorCount = selectedSede.profesores.length;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedSede(null);
      if (event.key === 'ArrowLeft') {
        setActiveProfessorIndex((current) => (current - 1 + professorCount) % professorCount);
      }
      if (event.key === 'ArrowRight') {
        setActiveProfessorIndex((current) => (current + 1) % professorCount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSede]);

  const openSede = (sede) => {
    setActiveProfessorIndex(0);
    setSelectedSede(sede);
  };

  const showPreviousProfessor = () => {
    setActiveProfessorIndex((current) => (
      current === 0 ? selectedSede.profesores.length - 1 : current - 1
    ));
  };

  const showNextProfessor = () => {
    setActiveProfessorIndex((current) => (
      current === selectedSede.profesores.length - 1 ? 0 : current + 1
    ));
  };

  const activeProfessor = selectedSede?.profesores[activeProfessorIndex];

  return (
    <div className="landing-page">
      <Navbar />

      <section id="inicio" className="hero landing-hero">
        <div className="hero-split-media" aria-hidden="true">
          <div className="hero-split-image hero-split-left" style={{ backgroundImage: `url(${heroLeft})` }} />
          <div className="hero-split-image hero-split-right" style={{ backgroundImage: `url(${heroRight})` }} />
        </div>

        <div className="container hero-center">
          <div className="hero-badge">
            <Sparkles size={16} /> Tu gimnasio, tu ritmo
          </div>
          <h1 className="hero-title">ANIMA SANA &amp; CORPRE SANO</h1>
          <p className="hero-description">
            Empezá hoy, entrená a tu ritmo y descubrí todo lo que tu cuerpo puede lograr.
          </p>
          <div className="hero-actions">
            <a href="#sedes" className="btn-primary">
              Ver sedes <MapPin size={18} />
            </a>
          </div>
        </div>
      </section>

      <section id="metodologia" className="features-section methodology-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Metodología de trabajo</span>
            <h2 className="section-title">Te acompañamos desde el primer día</h2>
            <p className="section-description">
              Un recorrido simple para que conozcas el gimnasio, entrenes con seguridad y avances con una rutina pensada para vos.
            </p>
          </div>

          <div className="methodology-flow">
            {methodologySteps.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <article className="methodology-step" key={step.title}>
                  <div className="methodology-step-header">
                    <span className="methodology-number">{String(index + 1).padStart(2, '0')}</span>
                    <div className="feature-icon">
                      <StepIcon size={27} />
                    </div>
                  </div>
                  <h3 className="feature-title">{step.title}</h3>
                  <p className="feature-text">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="sedes" className="sedes-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Ubicaciones</span>
            <h2 className="section-title">Nuestras sedes</h2>
            <p className="section-description">
              Elegí una sede para conocer sus horarios, ubicación, profesores y vías de contacto.
            </p>
          </div>

          <div className="sedes-grid">
            {SEDES.map((sede, index) => (
              <button
                type="button"
                className="sede-card"
                key={sede.id}
                style={{ '--sede-color': sede.color }}
                onClick={() => openSede(sede)}
                aria-label={`Ver información de la sede ${sede.nombre}`}
              >
                <div>
                  <span className="sede-badge">
                    SEDE {String(index + 1).padStart(2, '0')} · {sede.nombre.toUpperCase()}
                  </span>
                  <h3>AnimApp {sede.nombre}</h3>
                  <p>{sede.resumen}</p>
                </div>
                <div className="sede-card-footer">
                  <span>Ver información</span>
                  <ArrowRight size={19} aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="platform-access-section">
        <div className="container platform-access-content">
          <Lock size={40} color="var(--accent-orange)" />
          <h2>Acceso exclusivo a plataforma</h2>
          <p>Ingresá para gestionar alumnos, rutinas, staff y stock por sede.</p>
          <Link to="/login" className="btn-primary platform-access-button">
            Plataforma AnimApp <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
      <ArevalitoChat />

      {selectedSede && activeProfessor && (
        <div
          className="sede-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSede(null);
          }}
        >
          <section
            className="sede-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sede-modal-title"
          >
            <button
              type="button"
              className="sede-modal-close"
              onClick={() => setSelectedSede(null)}
              aria-label="Cerrar información de la sede"
              title="Cerrar"
            >
              <X size={22} />
            </button>

            <div className="sede-modal-scroll">
              <div className="sede-modal-hero">
                {selectedSede.foto ? (
                  <img src={selectedSede.foto} alt={`Interior de la sede ${selectedSede.nombre}`} />
                ) : (
                  <div className="media-placeholder sede-photo-placeholder">
                    <ImageIcon size={38} aria-hidden="true" />
                    <span>Foto de la sede</span>
                  </div>
                )}
                <div className="sede-modal-heading">
                  <span className="section-subtitle">AnimApp {selectedSede.nombre}</span>
                  <h2 id="sede-modal-title">Conocé la sede</h2>
                  <p>{selectedSede.resumen}</p>
                </div>
              </div>

              <div className="sede-info-grid">
                <div className="sede-info-item">
                  <Clock3 size={23} aria-hidden="true" />
                  <div>
                    <span>Horarios</span>
                    {selectedSede.horarios.map((horario) => <p key={horario}>{horario}</p>)}
                  </div>
                </div>
                <div className="sede-info-item">
                  <MapPin size={23} aria-hidden="true" />
                  <div>
                    <span>Ubicación</span>
                    <p>{selectedSede.direccion}</p>
                  </div>
                </div>
              </div>

              <div className="professors-section">
                <div className="professors-heading">
                  <div>
                    <span className="section-subtitle">Equipo</span>
                    <h3>Profesores de la sede</h3>
                  </div>
                  <span>{activeProfessorIndex + 1} / {selectedSede.profesores.length}</span>
                </div>

                <div className="professor-carousel" aria-live="polite">
                  <button
                    type="button"
                    className="carousel-control"
                    onClick={showPreviousProfessor}
                    aria-label="Profesor anterior"
                    title="Anterior"
                  >
                    <ChevronLeft size={23} />
                  </button>

                  <article className="professor-card" key={activeProfessor.id}>
                    {activeProfessor.foto ? (
                      <img src={activeProfessor.foto} alt={activeProfessor.nombre} />
                    ) : (
                      <div className="media-placeholder professor-photo-placeholder">
                        <UserRound size={42} aria-hidden="true" />
                        <span>Foto del profesor</span>
                      </div>
                    )}
                    <div className="professor-details">
                      <h4>{activeProfessor.nombre}</h4>
                      <p>{activeProfessor.horario}</p>
                    </div>
                  </article>

                  <button
                    type="button"
                    className="carousel-control"
                    onClick={showNextProfessor}
                    aria-label="Profesor siguiente"
                    title="Siguiente"
                  >
                    <ChevronRight size={23} />
                  </button>
                </div>

                <div className="carousel-dots" aria-label="Seleccionar profesor">
                  {selectedSede.profesores.map((profesor, index) => (
                    <button
                      type="button"
                      key={profesor.id}
                      className={index === activeProfessorIndex ? 'carousel-dot active' : 'carousel-dot'}
                      onClick={() => setActiveProfessorIndex(index)}
                      aria-label={`Ver a ${profesor.nombre}`}
                      aria-pressed={index === activeProfessorIndex}
                    />
                  ))}
                </div>
              </div>

              <a
                className="whatsapp-button"
                href={getWhatsAppHref(selectedSede)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={21} />
                Consultar por WhatsApp
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Landing;
