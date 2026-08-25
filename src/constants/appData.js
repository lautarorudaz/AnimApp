export const ROLES = {
  ADMIN: 'admin',
  PROFESOR: 'profesor',
  RECEPCIONISTA: 'recepcionista',
  ALUMNO: 'alumno'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.PROFESOR]: 'Profesor',
  [ROLES.RECEPCIONISTA]: 'Recepcionista',
  [ROLES.ALUMNO]: 'Alumno'
};

export const ROLE_HOME_PATH = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.PROFESOR]: '/profesor',
  [ROLES.RECEPCIONISTA]: '/recepcion',
  [ROLES.ALUMNO]: '/alumno'
};

export const MEMBERSHIP_PLANS = [
  {
    id: 'pase-libre',
    nombre: 'Pase libre',
    detalle: 'Todos los días de la semana',
    transferenciaDebito: 65000,
    efectivo: 60000
  },
  {
    id: 'tres-dias',
    nombre: '3 días a la semana',
    detalle: 'Plan mensual',
    transferenciaDebito: 64000,
    efectivo: 59000
  },
  {
    id: 'quince-dias',
    nombre: '15 días',
    transferenciaDebito: 40000,
    efectivo: 37000
  },
  {
    id: 'semanal',
    nombre: 'Por semana',
    transferenciaDebito: 30000,
    efectivo: 27000
  },
  {
    id: 'diario',
    nombre: 'Por día',
    transferenciaDebito: 10000,
    efectivo: 10000
  }
];

export const FAMILY_PROMOTIONS = [
  {
    id: 'familiar-tres-dias',
    nombre: 'Promo familiar 3 días a la semana',
    detalle: 'Plan mensual',
    transferenciaDebito: 60000,
    efectivo: 56000
  },
  {
    id: 'familiar-pase-libre',
    nombre: 'Promo familiar pase libre',
    transferenciaDebito: 61000,
    efectivo: 57000
  }
];

export const EDISON_ACTIVITIES = [
  {
    id: 'bjj-mma',
    nombre: 'Brazilian Jiu Jitsu y MMA',
    horarios: ['Lunes y miércoles: 14:00 y 20:00', 'Viernes: 14:00 y 19:30'],
    transferenciaDebito: 48000,
    efectivo: 45000
  },
  {
    id: 'jiu-jitsu-kids',
    nombre: 'Jiu Jitsu Kids',
    detalle: 'De 4 a 12 años',
    horarios: ['Martes y jueves: 17:00'],
    transferenciaDebito: 48000,
    efectivo: 45000
  },
  {
    id: 'mma',
    nombre: 'MMA',
    horarios: ['Lunes y miércoles: 19:00'],
    transferenciaDebito: 48000,
    efectivo: 45000
  },
  {
    id: 'jiu-jitsu-mma-musculacion',
    nombre: 'Jiu Jitsu/MMA + musculación',
    horarios: [],
    transferenciaDebito: 75000,
    efectivo: 70000
  }
];

export const SEDES = [
  {
    id: 'moreno',
    nombre: 'Moreno',
    titulo: 'Sede Moreno',
    direccion: 'Moreno',
    color: 'var(--accent-orange)',
    resumen: 'Entrenamiento de fuerza, musculacion y seguimiento personalizado.',
    horarios: ['Lunes a viernes de 6:00 a 23:00', 'Sabados de 9:00 a 18:00'],
    foto: '',
    whatsapp: '',
    planes: MEMBERSHIP_PLANS,
    promociones: FAMILY_PROMOTIONS,
    actividades: [],
    profesores: [
      { id: 'daniela', nombre: 'Daniela', horario: '6:00 a 9:00', foto: '' },
      { id: 'gonzalo', nombre: 'Gonzalo', horario: '9:00 a 13:00', foto: '/profesores/moreno/Gonzalo.jpeg' },
      { id: 'maia', nombre: 'Maia', horario: '13:00 a 18:00', foto: '/profesores/moreno/Maia.jpeg' },
      { id: 'leonardo', nombre: 'Leonardo', horario: '18:00 a 22:00', foto: '/profesores/moreno/Leonardo.jpeg' },
      { id: 'lionel', nombre: 'Lionel', horario: '19:00 a 23:00', foto: '/profesores/moreno/Lionel.jpeg' }
    ]
  },
  {
    id: 'edison',
    nombre: 'Edison',
    titulo: 'Sede Edison',
    direccion: 'Edison 46',
    color: 'var(--accent-cyan)',
    resumen: 'Rutinas guiadas, evaluaciones fisicas y clases para todos los niveles.',
    horarios: ['Lunes a viernes de 6:00 a 23:00', 'Sabados de 9:00 a 18:00'],
    foto: '',
    whatsapp: '',
    planes: MEMBERSHIP_PLANS,
    promociones: FAMILY_PROMOTIONS,
    actividades: EDISON_ACTIVITIES,
    profesores: [
      { id: 'romina', nombre: 'Romina', horario: '6:00 a 12:00', foto: '/profesores/edison/Romina.jpeg' },
      { id: 'leito', nombre: 'Leito', horario: '12:00 a 15:00', foto: '/profesores/moreno/Leonardo.jpeg' },
      { id: 'gonza', nombre: 'Gonza', horario: '15:00 a 18:00', foto: '/profesores/moreno/Gonzalo.jpeg' },
      { id: 'romi', nombre: 'Romi', horario: '18:00 a 20:00', foto: '/profesores/edison/Romina.jpeg' },
      { id: 'ale', nombre: 'Ale', horario: '20:00 a 23:00', foto: '/profesores/edison/Alejandro.jpeg' }
    ]
  },
  {
    id: 'general-san-martin',
    nombre: 'General San Martin',
    titulo: 'Sede General San Martin',
    direccion: 'General San Martin',
    color: 'var(--accent-lime)',
    resumen: 'Musculacion, rehabilitacion y entrenamiento tecnico supervisado.',
    horarios: ['Lunes a viernes de 6:00 a 23:00', 'Sabados de 9:00 a 18:00'],
    foto: '',
    whatsapp: '',
    planes: MEMBERSHIP_PLANS,
    promociones: FAMILY_PROMOTIONS,
    actividades: [],
    profesores: [
      { id: 'valentina-lopez', nombre: 'Valentina Lopez', horario: 'Lunes a viernes de 6:00 a 15:00', foto: '' },
      { id: 'nicolas-perez', nombre: 'Nicolas Perez', horario: 'Lunes a viernes de 15:00 a 23:00', foto: '' }
    ]
  }
];

export const SEDE_IDS = SEDES.map((sede) => sede.id);

const LEGACY_SEDE_IDS = {
  sede_norte: 'moreno',
  sede_centro: 'edison',
  sede_sur: 'general-san-martin'
};

export const normalizeSedeId = (sedeId) => LEGACY_SEDE_IDS[sedeId] || sedeId;

export const normalizeSedeIds = (sedes = []) => {
  const list = Array.isArray(sedes) ? sedes : [sedes];
  return list
    .map((sedeId) => normalizeSedeId(sedeId))
    .filter((sedeId) => SEDE_IDS.includes(sedeId));
};

export const getSedeById = (sedeId) => SEDES.find((sede) => sede.id === normalizeSedeId(sedeId));

export const getSedeLabel = (sedeId) => getSedeById(sedeId)?.nombre || sedeId;

export const getRoleHomePath = (role) => ROLE_HOME_PATH[role] || '/unauthorized';
