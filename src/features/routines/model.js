export const STAGES = [
  { id: 'movilidad', label: 'Movilidad', detail: 'Preparar el rango de movimiento' },
  { id: 'activacion', label: 'Activación', detail: 'Preparar los músculos para el esfuerzo' },
  { id: 'central', label: 'Parte central', detail: 'Trabajo principal del entrenamiento' }
];

export const newId = () => crypto.randomUUID();
export const emptyDay = (number = 1) => ({
  id: newId(), nombre: `Día ${number}`, etapas: Object.fromEntries(STAGES.map(({ id }) => [id, []]))
});
export const emptyWeek = (number = 1) => ({ id: newId(), nombre: `Semana ${number}`, dias: [emptyDay()] });
export const emptyRoutine = (student) => ({
  nombre: 'Rutina personalizada', objetivo: student?.objetivo || '', aclaraciones: '', semanas: [emptyWeek()]
});

// Older routines used one flat exercise list. Preserve it in the central stage.
export function normalizeRoutine(data, student) {
  if (!data) return emptyRoutine(student);
  return {
    nombre: data.nombre || '', objetivo: data.objetivo || student?.objetivo || '',
    aclaraciones: data.aclaraciones || '',
    semanas: (data.semanas || []).map((week) => ({
      ...week, id: week.id || newId(),
      dias: (week.dias || []).map((day) => ({
        ...day, id: day.id || newId(),
        etapas: Object.fromEntries(STAGES.map(({ id }) => [id,
          (day.etapas?.[id] || (id === 'central' ? day.ejercicios : []) || []).map((exercise) => ({
            ...exercise, id: exercise.id || newId(), nombre: exercise.nombre || '',
            series: String(exercise.series ?? ''), repeticiones: String(exercise.repeticiones ?? ''),
            peso: String(exercise.peso ?? ''), descanso: String(exercise.descanso ?? ''),
            aclaraciones: exercise.aclaraciones || exercise.observaciones || ''
          }))
        ]))
      }))
    }))
  };
}

export function duplicateNode(node) {
  const copy = structuredClone(node);
  const renew = (value) => {
    if (Array.isArray(value)) value.forEach(renew);
    else if (value && typeof value === 'object') {
      if ('id' in value) value.id = newId();
      Object.values(value).forEach(renew);
    }
  };
  renew(copy);
  copy.nombre = `${copy.nombre} (copia)`;
  return copy;
}

export function validateRoutine(routine, publishing = false) {
  if (!routine.nombre.trim()) return 'Ingresá un nombre para la rutina.';
  if (routine.nombre.length > 120) return 'El nombre admite hasta 120 caracteres.';
  if (!routine.semanas.length) return 'Agregá al menos una semana.';
  for (const week of routine.semanas) {
    if (!week.nombre.trim()) return 'Todas las semanas necesitan un nombre.';
    if (!week.dias.length) return `${week.nombre}: agregá al menos un día.`;
    for (const day of week.dias) {
      if (!day.nombre.trim()) return `${week.nombre}: completá el nombre del día.`;
      const exercises = STAGES.flatMap(({ id }) => day.etapas[id]);
      if (publishing && !exercises.length) return `${week.nombre}, ${day.nombre}: agregá ejercicios antes de publicar.`;
      for (const exercise of exercises) {
        if (!exercise.nombre.trim()) return `${week.nombre}, ${day.nombre}: hay un ejercicio sin nombre.`;
        if (publishing && (!exercise.series.trim() || !exercise.repeticiones.trim() || !exercise.peso.trim())) {
          return `${exercise.nombre}: completá series, repeticiones o duración y peso (podés indicar «sin carga»).`;
        }
        if (exercise.series && !/^[1-9]\d{0,2}$/.test(exercise.series)) return `${exercise.nombre}: las series deben ser un número entre 1 y 999.`;
      }
    }
  }
  if (new TextEncoder().encode(JSON.stringify(routine)).length > 800000) return 'La rutina es demasiado grande. Reducí el contenido antes de guardarla.';
  return '';
}

export const isStudentActive = (student) => student.activo !== false && student.active !== false && student.estado !== 'Inactivo' && student.estado !== 'Baja';
export const routineCounts = (routine) => ({
  semanas: routine.semanas.length,
  dias: routine.semanas.reduce((total, week) => total + week.dias.length, 0),
  ejercicios: routine.semanas.reduce((total, week) => total + week.dias.reduce((n, day) => n + STAGES.reduce((s, stage) => s + day.etapas[stage.id].length, 0), 0), 0)
});
export function formatDate(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : 'Sin fecha';
}
export function friendlyError(error) {
  if (error.code === 'permission-denied') return 'No tenés permiso para esta operación. Revisá tu asignación y las reglas de Firestore.';
  if (error.code === 'unavailable') return 'No se pudo conectar con Firebase. Verificá tu conexión e intentá nuevamente.';
  if (error.code === 'failed-precondition') return 'Firebase requiere configurar un índice o completar la configuración. Consultá la consola del navegador.';
  return error.message || 'No se pudo completar la operación.';
}
