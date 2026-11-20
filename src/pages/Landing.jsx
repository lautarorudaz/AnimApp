import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Dumbbell, Images, Lock, MapPin, MessageCircle, Shield, Sparkles, Users, X } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import heroLeft from '../assets/gym-hero-left.png';
import heroRight from '../assets/gym-hero-right.png';
import { SEDES } from '../constants/appData';
import { getSedeWhatsappUrl, SEDE_INFO } from '../constants/sedeInfo';
import GymAssistant from '../features/ai/GymAssistant';

const Landing = () => {
  const [selectedSede, setSelectedSede] = useState(null);
  const [staffIndex, setStaffIndex] = useState(0);
  const closeButtonRef = useRef(null);
  const selectedInfo = selectedSede ? SEDE_INFO[selectedSede.id] : null;

  useEffect(() => {
    if (!selectedSede) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelectedSede(null); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus();
    };
  }, [selectedSede]);

  const openSede = (sede) => {
    setStaffIndex(0);
    setSelectedSede(sede);
  };

  const moveStaffCarousel = (direction) => {
    const total = selectedInfo?.equipo?.length || 0;
    if (total < 2) return;
    setStaffIndex((current) => (current + direction + total) % total);
  };

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
              Conocé los espacios, servicios y propuestas de cada sede de AnimApp.
            </p>
          </div>

          <div className="sedes-grid">
            {SEDES.map((sede, index) => {
              const info = SEDE_INFO[sede.id];
              return (
                <article
                  className="sede-card"
                  key={sede.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver información de AnimApp ${sede.nombre}`}
                  onClick={() => openSede(sede)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openSede(sede);
                    }
                  }}
                >
                  <div className="sede-card-media">
                    <img src={info.imagen} alt={info.imagenAlt} loading="lazy" />
                    <span className="sede-card-index">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="sede-card-body">
                    <span className="sede-badge" style={{ color: sede.color }}>
                      SEDE {String(index + 1).padStart(2, '0')} · {sede.nombre.toUpperCase()}
                    </span>
                    <h3>AnimApp {sede.nombre}</h3>
                    <p>{info.resumen}</p>
                    <div className="sede-services" aria-label="Servicios principales">
                      {info.servicios.map((service) => <span key={service}>{service}</span>)}
                    </div>
                    {info.equipoReal && <div className="sede-card-hours"><Clock3 size={15} /><div>{info.horarios.map((horario) => <span key={horario}>{horario}</span>)}</div></div>}
                    <div className="sede-card-footer">
                      <span><MapPin size={15} />{sede.direccion}</span>
                      <strong>Conocer la sede <ArrowRight size={16} /></strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {selectedSede && selectedInfo && (
        <div
          className="sede-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSede(null);
          }}
        >
          <section className="sede-modal" role="dialog" aria-modal="true" aria-labelledby="sede-modal-title">
            <button ref={closeButtonRef} type="button" className="sede-modal-close" aria-label="Cerrar información de la sede" onClick={() => setSelectedSede(null)}>
              <X size={20} />
            </button>
            <div className="sede-modal-hero">
              <img src={selectedInfo.imagen} alt={selectedInfo.imagenAlt} />
              <div>
                <span className="sede-badge">SEDE ANIMAPP</span>
                <h2 id="sede-modal-title">{selectedSede.nombre}</h2>
                <p>{selectedInfo.resumen}</p>
              </div>
            </div>
            <div className="sede-modal-content">
              <div className="sede-detail-grid">
                <article className="sede-detail-card">
                  <div className="sede-detail-icon"><Clock3 size={19} /></div>
                  <div><span>Horarios</span>{selectedInfo.horarios.map((item) => <p key={item}>{item}</p>)}</div>
                </article>
                <article className="sede-detail-card">
                  <div className="sede-detail-icon"><CircleDollarSign size={19} /></div>
                  <div><span>Precio</span><p>{selectedInfo.precio}</p></div>
                </article>
                <article className="sede-detail-card">
                  <div className="sede-detail-icon"><Users size={19} /></div>
                  <div><span>Equipo de la sede</span>{selectedInfo.personal.map((item) => <p key={item}>{item}</p>)}</div>
                </article>
              </div>
              <section className="sede-staff-section" aria-labelledby="sede-staff-title">
                <div className="sede-staff-header">
                  <div>
                    <span>Personal de la sede</span>
                    <h3 id="sede-staff-title">Conocé al equipo</h3>
                    <p>{selectedInfo.equipoReal ? 'Conocé a quienes te acompañan en esta sede y consultá sus horarios de atención.' : 'Perfiles representativos. Los nombres y cronogramas reales se pueden cargar desde este mismo bloque.'}</p>
                  </div>
                  <div className="sede-staff-controls">
                    <span aria-live="polite">{staffIndex + 1} / {selectedInfo.equipo.length}</span>
                    <button type="button" aria-label="Ver profesor anterior" onClick={() => moveStaffCarousel(-1)}>
                      <ChevronLeft size={18} />
                    </button>
                    <button type="button" aria-label="Ver profesor siguiente" onClick={() => moveStaffCarousel(1)}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="sede-staff-viewport">
                  <div className="sede-staff-track" style={{ transform: `translateX(-${staffIndex * 100}%)` }}>
                    {selectedInfo.equipo.map((member, index) => (
                      <article className="sede-staff-slide" key={member.nombre} aria-hidden={index !== staffIndex}>
                        <div className="sede-staff-photo">
                          {member.foto ? <img src={member.foto} alt={member.fotoAlt} loading="lazy" /> : <div className="sede-staff-photo-pending" role="img" aria-label={`Foto de ${member.nombre} pendiente`}><Users size={44} strokeWidth={1.25} /><strong>{member.nombre}</strong></div>}
                          <span>{selectedInfo.equipoReal ? member.foto ? 'Equipo de la sede' : 'Foto pendiente' : 'Perfil representativo'}</span>
                        </div>
                        <div className="sede-staff-info">
                          <span className="sede-staff-eyebrow">Equipo AnimApp</span>
                          <h4>{member.nombre}</h4>
                          <p>{member.especialidad}</p>
                          {member.otraSede && <p className="sede-staff-other-branch"><MapPin size={14} />También en sede {member.otraSede}</p>}
                          <div className="sede-staff-schedule">
                            <Clock3 size={18} />
                            <div>
                              <small>Horario operativo</small>
                              <strong>{member.horario}</strong>
                              <span>{member.disponibilidad}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="sede-staff-dots" aria-label="Seleccionar integrante del equipo">
                  {selectedInfo.equipo.map((member, index) => (
                    <button
                      type="button"
                      key={member.nombre}
                      className={index === staffIndex ? 'active' : ''}
                      aria-label={`Ver ${member.nombre}`}
                      aria-current={index === staffIndex ? 'true' : undefined}
                      onClick={() => setStaffIndex(index)}
                    />
                  ))}
                </div>
              </section>
              <div className="sede-gallery-heading">
                <div><Images size={18} /><h3>Conocé los espacios</h3></div>
                <small>Imágenes representativas de las áreas de entrenamiento.</small>
              </div>
              <div className="sede-gallery">
                {selectedInfo.galeria.map((photo, index) => <img key={`${photo.src}-${index}`} src={photo.src} alt={photo.alt} loading="lazy" />)}
              </div>
              <div className="sede-modal-actions">
                <div><MapPin size={17} /><span><small>Ubicación</small>{selectedSede.direccion}</span></div>
                <a className="btn-primary sede-whatsapp" href={getSedeWhatsappUrl(selectedInfo)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />Consultar por WhatsApp
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      <section style={{ background: 'linear-gradient(135deg, #0b1d33 0%, #102a47 100%)', padding: '4rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px' }}>
          <Lock size={40} color="var(--accent-orange)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', marginBottom: '0.8rem' }}>Acceso exclusivo a plataforma</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.4rem', fontSize: '1rem' }}>
            Ingrese para gestionar alumnos, rutinas, staff y stock por sede.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 1.4rem', fontSize: '0.95rem' }}>
            Plataforma AnimApp <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
      <GymAssistant />
    </div>
  );
};

export default Landing;
