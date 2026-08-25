import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronLeft, Send, X } from 'lucide-react';
import { SEDES } from '../constants/appData';

const INITIAL_MESSAGE = {
  sender: 'bot',
  text: '¡Hola! Soy Arevalito, tu asistente personal. ¿Sobre qué sede estás interesado en preguntar?'
};

const QUICK_QUESTIONS = ['Precios y planes', 'Horarios', 'Profesores', 'Promociones', 'Actividades'];

const formatPrice = (value) => `$${value.toLocaleString('es-AR')}`;

const normalizeText = (text) => text
  .toLocaleLowerCase('es-AR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ');

const getPlansResponse = (sede, onlyPromotions = false) => {
  const plans = onlyPromotions ? sede.promociones : sede.planes;
  return {
    sender: 'bot',
    type: 'plans',
    text: onlyPromotions
      ? `Promociones familiares de ${sede.nombre}`
      : `Planes disponibles en ${sede.nombre}`,
    plans,
    note: onlyPromotions ? null : 'Los precios son los mismos en las tres sedes.'
  };
};

const formatActivities = (sede) => {
  if (!sede.actividades.length) {
    return `Por ahora no tengo actividades adicionales cargadas para ${sede.nombre}. Puedo ayudarte con musculación, planes, horarios o profesores.`;
  }

  return `Actividades especiales en ${sede.nombre}:\n\n${sede.actividades.map((activity) => {
    const schedule = activity.horarios.length ? `\n  ${activity.horarios.join(' · ')}` : '';
    return `• ${activity.nombre}${activity.detalle ? ` (${activity.detalle})` : ''}: ${formatPrice(activity.transferenciaDebito)} con transferencia/débito o ${formatPrice(activity.efectivo)} en efectivo.${schedule}`;
  }).join('\n')}`;
};

const answerQuestion = (question, sede) => {
  const text = normalizeText(question);

  if (/hola|buen dia|buenas|como estas/.test(text)) {
    return `¡Hola! Estoy listo para ayudarte con la sede ${sede.nombre}. Podés preguntarme por precios, horarios, profesores, promociones o actividades.`;
  }

  if (/promocion|promo|familiar/.test(text)) return getPlansResponse(sede, true);

  if (/jiu|jitsu|mma|actividad|clase/.test(text)) return formatActivities(sede);

  if (/precio|plan|cuota|arancel|cuanto|valor|pase|efectivo|transferencia|debito/.test(text)) {
    return getPlansResponse(sede);
  }

  if (/profesor|profe|entrenador|quien/.test(text)) {
    return `Profesores de ${sede.nombre}:\n\n${sede.profesores.map((profesor) => `• ${profesor.nombre}: ${profesor.horario}.`).join('\n')}`;
  }

  if (/horario|hora|abre|cierra|abierto/.test(text)) {
    return `Horarios de la sede ${sede.nombre}:\n\n${sede.horarios.map((horario) => `• ${horario}.`).join('\n')}`;
  }

  if (/direccion|ubicacion|donde|queda|llegar/.test(text)) {
    return `La sede ${sede.nombre} está en ${sede.direccion}.`;
  }

  return `Todavía no tengo una respuesta segura para esa consulta. Puedo ayudarte con precios, promociones, horarios, profesores, ubicación y actividades de ${sede.nombre}.`;
};

const ArevalitoChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState(null);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const responseTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  useEffect(() => () => clearTimeout(responseTimerRef.current), []);

  useEffect(() => {
    if (isOpen && selectedSede) inputRef.current?.focus();
  }, [isOpen, selectedSede]);

  const chooseSede = (sede) => {
    setSelectedSede(sede);
    setMessages([
      INITIAL_MESSAGE,
      { sender: 'user', text: sede.nombre },
      {
        sender: 'bot',
        text: `¡Perfecto! Elegiste ${sede.nombre}. Preguntame lo que quieras sobre precios, horarios, profesores, promociones o actividades.`
      }
    ]);
  };

  const changeSede = () => {
    clearTimeout(responseTimerRef.current);
    setIsTyping(false);
    setSelectedSede(null);
    setQuestion('');
    setMessages([INITIAL_MESSAGE]);
  };

  const sendQuestion = (textToSend) => {
    const cleanQuestion = textToSend.trim();
    if (!cleanQuestion || !selectedSede || isTyping) return;

    const answer = answerQuestion(cleanQuestion, selectedSede);
    const botMessage = typeof answer === 'string' ? { sender: 'bot', text: answer } : answer;
    const responseDelay = Math.min(1600, 700 + cleanQuestion.length * 18);

    setMessages((current) => [...current, { sender: 'user', text: cleanQuestion }]);
    setQuestion('');
    setIsTyping(true);

    responseTimerRef.current = setTimeout(() => {
      setMessages((current) => [...current, botMessage]);
      setIsTyping(false);
    }, responseDelay);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendQuestion(question);
  };

  return (
    <aside className="arevalito-widget" aria-label="Chat de ayuda Arevalito">
      {isOpen && (
        <section className="arevalito-panel" role="dialog" aria-modal="false" aria-labelledby="arevalito-title">
          <header className="arevalito-header">
            <div className="arevalito-avatar"><Bot size={24} /></div>
            <div>
              <strong id="arevalito-title">Arevalito</strong>
              <span>Asistente virtual</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat" title="Cerrar">
              <X size={20} />
            </button>
          </header>

          {selectedSede && (
            <div className="arevalito-context">
              <span>Sede {selectedSede.nombre}</span>
              <button type="button" onClick={changeSede}><ChevronLeft size={15} /> Cambiar sede</button>
            </div>
          )}

          <div className="arevalito-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`arevalito-message ${message.sender}${message.type ? ` ${message.type}` : ''}`}
                key={`${message.sender}-${index}`}
              >
                {message.type === 'plans' ? (
                  <>
                    <strong className="arevalito-response-title">{message.text}</strong>
                    <div className="arevalito-plan-list">
                      {message.plans.map((plan) => (
                        <article className="arevalito-plan-card" key={plan.id}>
                          <div className="arevalito-plan-heading">
                            <strong>{plan.nombre}</strong>
                            {plan.detalle && <span>{plan.detalle}</span>}
                          </div>
                          <dl>
                            <div>
                              <dt>Transferencia / débito</dt>
                              <dd>{formatPrice(plan.transferenciaDebito)}</dd>
                            </div>
                            <div>
                              <dt>Efectivo</dt>
                              <dd>{formatPrice(plan.efectivo)}</dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>
                    {message.note && <small className="arevalito-response-note">{message.note}</small>}
                    {!message.note && <small className="arevalito-response-note">Consultá en recepción las condiciones de la promoción.</small>}
                  </>
                ) : message.text}
              </div>
            ))}

            {isTyping && (
              <div className="arevalito-message bot arevalito-typing" aria-label="Arevalito está escribiendo">
                <span />
                <span />
                <span />
              </div>
            )}

            {!selectedSede && (
              <div className="arevalito-options">
                {SEDES.map((sede) => (
                  <button type="button" key={sede.id} onClick={() => chooseSede(sede)}>
                    {sede.nombre}
                  </button>
                ))}
              </div>
            )}

            {selectedSede && (
              <div className="arevalito-quick-questions">
                {QUICK_QUESTIONS.map((item) => (
                  <button type="button" key={item} disabled={isTyping} onClick={() => sendQuestion(item)}>{item}</button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedSede && (
            <form className="arevalito-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="arevalito-question">Escribí tu pregunta</label>
              <input
                id="arevalito-question"
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Escribí tu pregunta..."
                autoComplete="off"
                disabled={isTyping}
              />
              <button type="submit" disabled={!question.trim() || isTyping} aria-label="Enviar pregunta" title="Enviar">
                <Send size={19} />
              </button>
            </form>
          )}
        </section>
      )}

      <button
        type="button"
        className="arevalito-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar chat de Arevalito' : 'Abrir chat de Arevalito'}
      >
        {isOpen ? <X size={25} /> : <Bot size={31} />}
      </button>
    </aside>
  );
};

export default ArevalitoChat;
