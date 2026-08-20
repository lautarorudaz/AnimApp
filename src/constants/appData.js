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
    color: 'var(--accent-orange)'
  },
  {
    id: 'edison',
    nombre: 'Edison',
    titulo: 'Sede Edison',
    direccion: 'Edison',
    color: 'var(--accent-cyan)'
  },
  {
    id: 'general-san-martin',
    nombre: 'General San Martin',
    titulo: 'Sede General San Martin',
    direccion: 'General San Martin',
    color: 'var(--accent-lime)'
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
