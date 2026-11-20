import heroLeft from '../assets/gym-hero-left.png';
import heroRight from '../assets/gym-hero-right.png';
import morenoImage from '../assets/sede-moreno.jpg';
import edisonImage from '../assets/sede-edison.jpg';
import generalSanMartinImage from '../assets/sede-general-san-martin.jpg';
import staffFuerza from '../assets/staff-fuerza.jpg';
import staffFuncional from '../assets/staff-funcional.jpg';
import staffMovilidad from '../assets/staff-movilidad.jpg';
import staffEntrenamiento from '../assets/staff-entrenamiento.jpg';
import rominaPhoto from '../../personal/romina-edison.png';
import alejandroPhoto from '../../personal/alejandro-edison.png';
import gonzaloPhoto from '../../personal/gonzalo.png';
import lionelPhoto from '../../personal/lionel.png';
import maiaPhoto from '../../personal/maia-moreno.png';
import leonardoPhoto from '../../personal/leonardo-moreno.png';

const staffMember = (nombre, foto, sede, horario = '', otraSede = '') => ({
  nombre,
  foto,
  fotoAlt: `Foto de ${nombre}, integrante del equipo de ${sede}`,
  especialidad: `Equipo AnimApp ${sede}`,
  horario: horario || 'Horario por confirmar',
  disponibilidad: horario ? 'Consultá en recepción los días de atención.' : 'Consultá la disponibilidad en recepción.',
  otraSede
});

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
    horarios: ['Lunes a viernes · 06:00 a 23:00 hs', 'Sábados · 09:00 a 18:00 hs'],
    precio: 'Planes mensuales y pases. Consultá el valor vigente para esta sede.',
    personal: ['Daniela · Gonzalo · Maia · Angus', 'Leonardo · Lionel'],
    equipoReal: true,
    equipo: [
      staffMember('Daniela', null, 'Moreno', '06:00 a 09:00 hs'),
      staffMember('Gonzalo', gonzaloPhoto, 'Moreno', '09:00 a 13:00 hs', 'Edison'),
      staffMember('Maia', maiaPhoto, 'Moreno', '13:00 a 18:00 hs'),
      staffMember('Angus', null, 'Moreno', '13:00 a 18:00 hs'),
      staffMember('Leonardo', leonardoPhoto, 'Moreno', '18:00 a 22:00 hs'),
      staffMember('Lionel', lionelPhoto, 'Moreno', '19:00 a 23:00 hs', 'Edison')
    ],
    servicios: ['Fuerza', 'Musculación', 'Seguimiento'],
    whatsapp: '',
    whatsappUrl: 'https://wa.link/nlykq7',
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
    horarios: ['Lunes a viernes · 06:00 a 23:00 hs', 'Sábados · 09:00 a 17:00 hs'],
    precio: 'Planes mensuales y pases. Consultá el valor vigente para esta sede.',
    personal: ['Romina · Alejandro', 'Gonzalo · Lionel'],
    equipoReal: true,
    equipo: [
      staffMember('Romina', rominaPhoto, 'Edison'),
      staffMember('Alejandro', alejandroPhoto, 'Edison'),
      staffMember('Gonzalo', gonzaloPhoto, 'Edison', '', 'Moreno'),
      staffMember('Lionel', lionelPhoto, 'Edison', '', 'Moreno')
    ],
    servicios: ['Rutinas guiadas', 'Evaluaciones', 'Funcional'],
    whatsapp: '',
    whatsappUrl: 'https://wa.link/bh9s3i',
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
  if (info.whatsappUrl) {
    try {
      const url = new URL(info.whatsappUrl);
      if (url.protocol === 'https:' && ['wa.link', 'wa.me', 'api.whatsapp.com'].includes(url.hostname)) return url.href;
    } catch { /* Keep the existing phone-number fallback for other branches. */ }
  }
  const phone = String(info.whatsapp || '').replace(/\D/g, '');
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(info.whatsappMessage)}`;
}
