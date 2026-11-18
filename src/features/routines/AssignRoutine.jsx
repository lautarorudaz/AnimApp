import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/auth';
import { saveRoutine, watchStudents } from './data';
import { watchVisibleItems } from './libraryData';
import { friendlyError, isStudentActive, normalizeRoutine } from './model';
import { Empty, Field, Modal, Notice } from './Workspace';

export default function AssignRoutine({ template, student: initialStudent, onClose, onSaved }) {
  const { userProfile, activeSede } = useAuth();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(initialStudent?.id || '');
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uid = userProfile.uid; const admin = userProfile.rol === 'admin'; const sedeId = activeSede?.id;
  useEffect(() => {
    if (!sedeId) { setLoading(false); return; }
    return watchStudents({ uid, admin, sedeId }, (items) => { setStudents(items.filter(isStudentActive)); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); });
  }, [uid, admin, sedeId]);
  useEffect(() => {
    setDraftLoading(true); setRevision(0);
    if (!selected) { setDraftLoading(false); return; }
    return onSnapshot(doc(db, 'rutinasBorradores', selected), (snapshot) => { setRevision(snapshot.data()?.revision || 0); setDraftLoading(false); }, (err) => { setError(friendlyError(err)); setDraftLoading(false); });
  }, [selected]);
  const student = students.find((item) => item.id === selected);
  const assign = async (event) => {
    event.preventDefault(); if (!student) { setError('Elegí un alumno de tu sede.'); return; }
    setBusy(true); setError('');
    try {
      await saveRoutine({ student, actor: userProfile, routine: normalizeRoutine(template), sourceTemplateId: template.id, publish, expectedRevision: revision });
      onSaved(publish ? 'Rutina asignada y publicada para el alumno.' : 'Rutina asignada como borrador. Podés adaptarla antes de publicar.'); onClose();
    } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  };
  return <Modal title="Asignar rutina a un alumno" onClose={onClose} busy={busy}><form onSubmit={assign}><Notice error>{error}</Notice><div className="training-assignment-summary"><span className="training-eyebrow">RUTINA GENÉRICA</span><h3>{template.nombre}</h3><p className="training-muted">Se copiará el plan completo. La plantilla original no cambia.</p></div>
    {loading ? <p role="status">Cargando alumnos de {activeSede?.nombre}…</p> : !students.length ? <Empty title="Sin alumnos activos">No tenés alumnos asignados en la sede activa. Cambiá de sede desde Alumnos.</Empty> : <fieldset className="training-fieldset" disabled={busy}>
      <Field label={`Alumno · ${activeSede?.nombre || ''}`}><select className="form-input" required value={selected} onChange={(event) => { setSelected(event.target.value); setError(''); }}><option value="">Seleccioná un alumno</option>{students.map((item) => <option key={item.id} value={item.id}>{item.nombre} · DNI {item.dni || 'sin registrar'}</option>)}</select></Field>
      <label className="training-sharing"><input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} /><span><strong>Publicar al asignar</strong><small>Desactivalo si querés adaptar la copia como borrador antes de que la vea el alumno.</small></span></label>
      {!!revision && <Notice>Se reemplazará el borrador de trabajo del alumno. Las publicaciones anteriores se conservarán en el historial.</Notice>}
      {student?.rutinaActivaId && publish && <p className="training-muted">Esta publicación pasará a ser la rutina activa del alumno.</p>}
      {student && !student.userId && <Notice>El alumno todavía no tiene cuenta de acceso vinculada. Asigná como borrador o pedí al administrador que vincule su cuenta antes de publicar.</Notice>}
    </fieldset>}
    <div className="training-modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy || loading || draftLoading || !student || (publish && !student.userId)}>{busy ? 'Asignando…' : 'Asignar rutina'}</button></div>
  </form></Modal>;
}

export function PickGenericRoutine({ student, actor, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const uid = actor.uid; const role = actor.rol;
  useEffect(() => watchVisibleItems('rutinasGenericas', { uid, rol: role }, (rows) => { setItems(rows); setLoading(false); }, (err) => { setError(friendlyError(err)); setLoading(false); }), [uid, role]);
  const template = items.find((item) => item.id === selected);
  if (template) return <AssignRoutine template={template} student={student} onClose={onClose} onSaved={onSaved} />;
  const filtered = items.filter((item) => `${item.nombre} ${item.objetivo}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')));
  return <Modal title={`Elegir rutina · ${student.nombre}`} onClose={onClose}><Notice error>{error}</Notice><Field label="Buscar rutina genérica"><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre u objetivo" /></Field>
    {loading ? <p role="status">Cargando rutinas…</p> : !filtered.length ? <Empty title="Sin rutinas disponibles">Creá una rutina genérica desde la sección Rutinas o cambiá la búsqueda.</Empty> : <div className="training-template-options">{filtered.map((item) => <button className="training-template-option" key={item.id} onClick={() => setSelected(item.id)}><strong>{item.nombre}</strong><span>{item.objetivo || 'Sin objetivo definido'}</span><small>{item.profesorId === actor.uid ? 'Propia' : `Compartida por ${item.autorNombre || 'otro profesor'}`}</small></button>)}</div>}
  </Modal>;
}
