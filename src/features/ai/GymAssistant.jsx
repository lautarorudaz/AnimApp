import { useEffect, useId, useRef, useState } from 'react';
import { Bot, LoaderCircle, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { askGymAssistant } from './service';
import { MAX_MESSAGE_LENGTH } from './assistant';
import { SEDES } from '../../constants/appData';
import { SEDE_INFO } from '../../constants/sedeInfo';
import './assistant.css';

const greeting = () => [{ role: 'assistant', text: '¡Hola! Soy el asistente de AnimApp. Puedo ayudarte con horarios, sedes, profesores y el acceso a la plataforma. ¿Qué querés consultar?' }];
const suggestions = ['¿A qué hora cierra Moreno los sábados?', '¿Dónde queda Edison?', '¿Cómo veo mi rutina?'];

export default function GymAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(greeting);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const logRef = useRef(null);
  const pendingRef = useRef(false);
  const panelId = useId();
  const close = () => { setOpen(false); toggleRef.current?.focus(); };

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, loading, error, open]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || pendingRef.current) return;
    pendingRef.current = true; setLoading(true); setError(''); setInput('');
    const history = messages;
    setMessages([...history, { role: 'user', text: question }]);
    try {
      const answer = await askGymAssistant(question, history);
      setMessages([...history, { role: 'user', text: question }, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages(history); setInput(question); setError(err.message || 'No se pudo enviar la consulta. Intentá nuevamente.');
    } finally { pendingRef.current = false; setLoading(false); }
  };

  return <div className="gym-assistant">
    {open && <section id={panelId} className="gym-assistant-panel" role="dialog" aria-label="Asistente virtual de AnimApp" onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <header className="gym-assistant-header"><div className="gym-assistant-avatar"><Bot size={23} /></div><div><h2>AnimApp te ayuda</h2><p>Asistente virtual con Gemini</p></div><button type="button" title="Nueva conversación" aria-label="Nueva conversación" disabled={loading} onClick={() => { setMessages(greeting()); setError(''); setInput(''); inputRef.current?.focus(); }}><RotateCcw size={17} /></button><button type="button" aria-label="Cerrar asistente" onClick={close}><X size={21} /></button></header>
      <div className="gym-assistant-messages" ref={logRef} role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => <article className={`gym-assistant-message is-${message.role}`} key={index}><span>{message.role === 'assistant' ? 'AnimApp IA' : 'Vos'}</span><p>{message.text}</p></article>)}
        {messages.length === 1 && !loading && <div className="gym-assistant-suggestions" aria-label="Consultas sugeridas">{suggestions.map((question) => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}</div>}
        {loading && <p className="gym-assistant-thinking" role="status"><LoaderCircle size={16} />Preparando respuesta…</p>}
        {error && <p className="gym-assistant-error" role="alert">{error}</p>}
      </div>
      <div className="gym-assistant-contacts"><span>También podés consultar por WhatsApp:</span>{SEDES.filter((sede) => SEDE_INFO[sede.id].whatsappUrl).map((sede) => <a key={sede.id} href={SEDE_INFO[sede.id].whatsappUrl} target="_blank" rel="noopener noreferrer">{sede.nombre} ↗</a>)}</div>
      <form className="gym-assistant-form" onSubmit={(event) => { event.preventDefault(); send(input); }}><label htmlFor={`${panelId}-input`} className="gym-assistant-sr-only">Tu consulta</label><textarea id={`${panelId}-input`} ref={inputRef} rows={2} maxLength={MAX_MESSAGE_LENGTH} value={input} disabled={loading} onChange={(event) => setInput(event.target.value)} placeholder="Preguntá por horarios, sedes o profesores…" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(input); } }} /><button type="submit" aria-label="Enviar consulta" disabled={loading || !input.trim()}>{loading ? <LoaderCircle className="is-spinning" size={19} /> : <Send size={19} />}</button></form>
      <footer className="gym-assistant-footer"><span>{input.length}/{MAX_MESSAGE_LENGTH}</span><p>Las consultas se envían a Google Gemini. Evitá compartir datos personales y confirmá la información importante con recepción.</p></footer>
    </section>}
    <button type="button" ref={toggleRef} className="gym-assistant-toggle" aria-label={open ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'} aria-expanded={open} aria-controls={panelId} onClick={() => open ? close() : setOpen(true)}>{open ? <X size={22} /> : <MessageCircle size={23} />}<span>{open ? 'Cerrar' : '¿Te ayudamos?'}</span></button>
  </div>;
}
