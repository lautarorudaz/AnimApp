import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app, { appCheck } from '../../firebase/config';
import { SEDES } from '../../constants/appData';
import { SEDE_INFO } from '../../constants/sedeInfo';
import { buildPublicGymContext, buildSystemInstruction, friendlyAiError, prepareConversation } from './assistant';

export const aiReady = Boolean(appCheck);
export const modelName = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
let model;
let pending = false;
let lastRequest = 0;
let requests = [];

export async function askGymAssistant(message, history = []) {
  if (!aiReady) throw new Error(import.meta.env.DEV
    ? 'Configurá VITE_FIREBASE_APPCHECK_SITE_KEY en .env.local y reiniciá el servidor para habilitar el asistente.'
    : 'El asistente no está disponible en este momento. Podés consultar a recepción por WhatsApp.');
  const contents = prepareConversation(history, message);
  const now = Date.now();
  requests = requests.filter((time) => now - time < 60 * 60 * 1000);
  if (pending) throw new Error('Esperá a que termine la consulta actual.');
  if (now - lastRequest < 6000) throw new Error('Esperá unos segundos antes de enviar otra consulta.');
  if (requests.length >= 20) throw new Error('Alcanzaste las 20 consultas de esta sesión durante la última hora. Podés continuar por WhatsApp.');
  pending = true; lastRequest = now; requests.push(now);
  try {
    if (!model) {
      const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
      model = getGenerativeModel(ai, {
        model: modelName,
        systemInstruction: buildSystemInstruction(buildPublicGymContext(SEDES, SEDE_INFO)),
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
      });
    }
    const result = await model.generateContent({ contents });
    const text = result.response.text().trim();
    if (!text) throw new Error('no-text');
    return text;
  } catch (error) {
    throw new Error(friendlyAiError(error, import.meta.env.DEV));
  } finally { pending = false; }
}
