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
    profesores: [
      { id: 'carlos-rodriguez', nombre: 'Carlos Rodriguez', horario: 'Lunes a viernes de 6:00 a 14:00', foto: '' },
      { id: 'julieta-gomez', nombre: 'Julieta Gomez', horario: 'Lunes a viernes de 14:00 a 23:00', foto: '' }
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
    profesores: [
      { id: 'sofia-ramirez', nombre: 'Sofia Ramirez', horario: 'Lunes a viernes de 6:00 a 14:00', foto: '' },
      { id: 'matias-torres', nombre: 'Matias Torres', horario: 'Lunes a viernes de 14:00 a 23:00', foto: '' }
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
