import { useEffect, useState } from 'react';
import { BookOpen, Copy, Edit, Eye, Lock, Plus, Search, Share2, Trash2, UserPlus } from 'lucide-react';
import SedeSwitcher from '../components/SedeSwitcher';
import { useAuth } from '../context/auth';
import { archiveLibraryItem, watchVisibleItems } from '../features/routines/libraryData';
import { isShared, ownsItem } from '../features/routines/libraryModel';
import { formatDate, friendlyError, normalizeRoutine, routineCounts } from '../features/routines/model';
import { Empty, Field, Modal, Notice, Workspace } from '../features/routines/Workspace';
import RoutineEditor from '../features/routines/RoutineEditor';
import RoutineViewer from '../features/routines/RoutineViewer';
import AssignRoutine from '../features/routines/AssignRoutine';

export default function ProfesorRoutines() {
  const { userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('todos');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const uid = userProfile.uid; const role = userProfile.rol;
  useEffect(() => watchVisibleItems('rutinasGenericas', { uid, rol: role }, (rows) => { setItems(rows); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); }), [uid, role]);
  const filtered = items.filter((item) => `${item.nombre} ${item.objetivo || ''}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')) && (scope === 'todos' || (scope === 'mias' ? item.profesorId === uid : item.profesorId !== uid && isShared(item))));
  const open = (mode, item = null) => setDialog({ mode, item });
  const duplicate = (item) => open('edit', { ...normalizeRoutine(item), nombre: `${item.nombre.slice(0, 110)} (copia)`, compartida: false, privado: true });
  const remove = async () => {
    setBusy(true); setError('');
    try { await archiveLibraryItem('rutinasGenericas', dialog.item, userProfile); setNotice('Rutina genérica eliminada. Las copias de los alumnos se conservaron.'); setDialog(null); }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Workspace><header className="header-bar"><div><span className="training-eyebrow">PLANES PARA VOLVER A USAR</span><h1>Rutinas</h1><p className="training-muted">Creá tus planes, compartilos y adaptalos a cada alumno.</p></div><div className="training-actions"><SedeSwitcher /><button className="btn-primary" onClick={() => open('edit')}><Plus size={17} />Nueva rutina</button></div></header>
    <Notice error>{error}</Notice><Notice>{notice}</Notice>
    <div className="training-toolbar"><Field label="Buscar rutina"><div className="training-search"><Search size={17} /><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre u objetivo del plan" /></div></Field><Field label="Mostrar rutinas"><select className="form-input" value={scope} onChange={(event) => setScope(event.target.value)}><option value="todos">Todas las disponibles</option><option value="mias">Mis rutinas</option><option value="compartidas">De otros profesores</option></select></Field></div>
    <p className="training-results-count">{filtered.length} rutinas disponibles</p>
    {loading ? <p role="status">Cargando rutinas…</p> : error ? null : !filtered.length ? <Empty title="Tu próxima rutina empieza acá">Creá una rutina genérica con semanas, días y etapas. Podrás usarla con varios alumnos.</Empty> : <div className="generic-routine-grid">{filtered.map((item) => {
      const counts = routineCounts(normalizeRoutine(item));
      const owned = ownsItem(item, userProfile); const shared = isShared(item);
      return <article className="training-card generic-routine-card" key={item.id}>
        <div className="training-section-label"><div className="training-catalog-icon"><BookOpen size={24} /></div><span className="training-badge">{shared ? <Share2 size={12} /> : <Lock size={12} />}{shared ? 'Compartida' : 'Privada'}</span></div>
        <h2>{item.nombre}</h2><p className="training-muted generic-routine-goal">{item.objetivo || 'Sin objetivo definido'}</p>
        <div className="training-chips"><span>{counts.semanas} {counts.semanas === 1 ? 'semana' : 'semanas'}</span><span>{counts.dias} {counts.dias === 1 ? 'día' : 'días'}</span><span>{counts.ejercicios} {counts.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
        <p className="training-template-author">{item.profesorId === uid ? 'Creada por vos' : `Por ${item.autorNombre || 'otro profesor'}`} · {formatDate(item.actualizadoEn || item.creadoEn)}</p>
        <div className="training-catalog-actions"><button className="btn-primary" onClick={() => open('assign', item)}><UserPlus size={15} />Asignar a alumno</button><button className="training-icon" onClick={() => open('view', item)} aria-label={`Ver ${item.nombre}`}><Eye size={16} /></button></div>
        <div className="generic-routine-secondary"><button className="training-text-button" onClick={() => duplicate(item)}><Copy size={14} />Duplicar</button>{owned && <><button className="training-text-button" onClick={() => open('edit', item)}><Edit size={14} />Editar</button><button className="training-text-button is-danger" onClick={() => open('remove', item)}><Trash2 size={14} />Eliminar</button></>}</div>
      </article>;
    })}</div>}
    {dialog?.mode === 'edit' && <RoutineEditor templateMode template={dialog.item} actor={userProfile} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'view' && <Modal title="Vista de la rutina" onClose={() => setDialog(null)} wide><RoutineViewer data={dialog.item} /></Modal>}
    {dialog?.mode === 'assign' && <AssignRoutine template={dialog.item} onClose={() => setDialog(null)} onSaved={setNotice} />}
    {dialog?.mode === 'remove' && <Modal title="Eliminar rutina genérica" busy={busy} onClose={() => setDialog(null)}><p>¿Eliminar «{dialog.item.nombre}»? Las rutinas que ya asignaste a alumnos no cambian.</p><div className="training-modal-actions"><button className="btn-secondary" disabled={busy} onClick={() => setDialog(null)}>Cancelar</button><button className="btn-primary" disabled={busy} onClick={remove}>Eliminar rutina</button></div></Modal>}
  </Workspace>;
}
