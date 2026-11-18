import heroLeft from '../assets/gym-hero-left.png';
import heroRight from '../assets/gym-hero-right.png';
import morenoImage from '../assets/sede-moreno.jpg';
import edisonImage from '../assets/sede-edison.jpg';
import generalSanMartinImage from '../assets/sede-general-san-martin.jpg';
import staffFuerza from '../assets/staff-fuerza.jpg';
import staffFuncional from '../assets/staff-funcional.jpg';
import staffMovilidad from '../assets/staff-movilidad.jpg';
import staffEntrenamiento from '../assets/staff-entrenamiento.jpg';

const STAFF_PROFILES = {
  fuerza: {
    nombre: 'Profesor/a de fuerza',
    especialidad: 'Fuerza, musculación y técnica de ejercicios',
    foto: staffFuerza,
    fotoAlt: 'Perfil representativo de un profesor de fuerza',
    horario: 'Días y horarios a confirmar',
    disponibilidad: 'Consultá los turnos disponibles en recepción'
  },
  funcional: {
    nombre: 'Profesor/a funcional',
    especialidad: 'Entrenamiento funcional y acondicionamiento',
    foto: staffFuncional,
    fotoAlt: 'Perfil representativo de una profesora de entrenamiento funcional',
    horario: 'Días y horarios a confirmar',
    disponibilidad: 'Consultá los turnos disponibles en recepción'
  },
  movilidad: {
    nombre: 'Profesor/a de movilidad',
    especialidad: 'Movilidad, rehabilitación y control técnico',
    foto: staffMovilidad,
    fotoAlt: 'Perfil representativo de una profesora de movilidad',
    horario: 'Días y horarios a confirmar',
    disponibilidad: 'Consultá los turnos disponibles en recepción'
  },
  entrenamiento: {
    nombre: 'Entrenador/a personal',
    especialidad: 'Planificación, seguimiento y técnica de movimiento',
    foto: staffEntrenamiento,
    fotoAlt: 'Perfil representativo de un entrenador personal',
    horario: 'Días y horarios a confirmar',
    disponibilidad: 'Consultá los turnos disponibles en recepción'
  }
};

export const SEDE_INFO = {
  moreno: {
    resumen: 'Entrenamiento de fuerza, musculación y seguimiento personalizado.',
    imagen: morenoImage,
    imagenAlt: 'Área de fuerza representativa de la sede Moreno',
    horarios: ['Lunes a viernes · Consultar franjas disponibles', 'Sábados · Consultar disponibilidad'],
    precio: 'Planes mensuales y pases. Consultá el valor vigente para esta sede.',
    personal: ['Profesores de fuerza y musculación', 'Recepción y seguimiento personalizado'],
    equipo: [STAFF_PROFILES.fuerza, STAFF_PROFILES.entrenamiento, STAFF_PROFILES.funcional],
    servicios: ['Fuerza', 'Musculación', 'Seguimiento'],
    whatsapp: '',
    whatsappMessage: 'Hola, quisiera recibir información sobre horarios, precios y disponibilidad de AnimApp Moreno.',
    galeria: [
      { src: morenoImage, alt: 'Área de fuerza representativa de AnimApp Moreno' },
      { src: heroLeft, alt: 'Sector de peso libre y racks de entrenamiento' },
      { src: heroRight, alt: 'Sector cardiovascular y entrenamiento funcional' }
    ]
  },
  edison: {
    resumen: 'Rutinas guiadas, evaluaciones físicas y clases para todos los niveles.',
    imagen: edisonImage,
    imagenAlt: 'Área funcional representativa de la sede Edison',
    horarios: ['Lunes a viernes · Consultar franjas disponibles', 'Sábados · Consultar disponibilidad'],
    precio: 'Planes mensuales y pases. Consultá el valor vigente para esta sede.',
    personal: ['Profesores de entrenamiento funcional', 'Evaluación y acompañamiento técnico'],
    equipo: [STAFF_PROFILES.funcional, STAFF_PROFILES.entrenamiento, STAFF_PROFILES.movilidad],
    servicios: ['Rutinas guiadas', 'Evaluaciones', 'Funcional'],
    whatsapp: '',
    whatsappMessage: 'Hola, quisiera recibir información sobre horarios, precios y disponibilidad de AnimApp Edison.',
    galeria: [
      { src: edisonImage, alt: 'Área funcional representativa de AnimApp Edison' },
      { src: heroRight, alt: 'Sector cardiovascular y entrenamiento funcional' },
      { src: heroLeft, alt: 'Sector de peso libre y racks de entrenamiento' }
    ]
  },
  'general-san-martin': {
    resumen: 'Musculación, rehabilitación y entrenamiento técnico supervisado.',
    imagen: generalSanMartinImage,
    imagenAlt: 'Área de movilidad representativa de la sede General San Martín',
    horarios: ['Lunes a viernes · Consultar franjas disponibles', 'Sábados · Consultar disponibilidad'],
    precio: 'Planes mensuales y pases. Consultá el valor vigente para esta sede.',
    personal: ['Profesores de musculación y técnica', 'Acompañamiento en movilidad y rehabilitación'],
    equipo: [STAFF_PROFILES.movilidad, STAFF_PROFILES.fuerza, STAFF_PROFILES.entrenamiento],
    servicios: ['Musculación', 'Movilidad', 'Técnica supervisada'],
    whatsapp: '',
    whatsappMessage: 'Hola, quisiera recibir información sobre horarios, precios y disponibilidad de AnimApp General San Martín.',
    galeria: [
      { src: generalSanMartinImage, alt: 'Área de movilidad representativa de AnimApp General San Martín' },
      { src: heroLeft, alt: 'Sector de peso libre y racks de entrenamiento' },
      { src: heroRight, alt: 'Sector cardiovascular y entrenamiento funcional' }
    ]
  }
};

export function getSedeWhatsappUrl(info) {
  const phone = String(info.whatsapp || '').replace(/\D/g, '');
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(info.whatsappMessage)}`;
}
