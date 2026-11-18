export const MUSCLE_ZONES = ['Espalda', 'Pectoral', 'Hombros', 'Isquiotibiales', 'Pantorrillas', 'Cuádriceps', 'Bíceps', 'Tríceps', 'Glúteos', 'Abdominales', 'Core', 'Aductores', 'Cuerpo completo'];

export function youtubeId(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'youtube-nocookie.com'].includes(host)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : '';
    }
    return /^[\w-]{11}$/.test(id || '') ? id : '';
  } catch { return ''; }
}

export function normalizeExercise(data, id) {
  const aliases = { 'parte central': 'central', 'zona central': 'central', 'activación': 'activacion', 'movilidad': 'movilidad', 'activacion': 'activacion', 'central': 'central' };
  const rawStage = String(data.etapa || data.stage || '').toLocaleLowerCase('es');
  return {
    ...data, id,
    nombre: data.nombre || data.name || '',
    zonaMuscular: data.zonaMuscular || data.zonaMuscularNombre || data.grupoMuscular || data.categoria || data.category || 'Sin clasificar',
    categoria: data.zonaMuscular || data.zonaMuscularNombre || data.grupoMuscular || data.categoria || data.category || 'Sin clasificar',
    etapa: aliases[rawStage] || '',
    videoUrl: data.videoUrl || data.youtubeUrl || data.video || data.url || '',
    descripcion: data.descripcion || data.aclaraciones || ''
  };
}

export const ownsItem = (item, actor) => actor.rol === 'admin' || item.profesorId === actor.uid;
export const isShared = (item) => item.compartida === true || item.privado === false;
