import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicGymContext, buildSystemInstruction, friendlyAiError, prepareConversation } from '../src/features/ai/assistant.js';

test('only confirmed public fields enter the assistant context', () => {
  const context = buildPublicGymContext([{ id: 'known', nombre: 'Moreno', direccion: 'Avenida Moreno 1020', privateId: 'do-not-send' }, { id: 'unknown', nombre: 'GSM', direccion: 'Placeholder address' }], {
    known: { equipoReal: true, horarios: ['Sábados · 09:00 a 18:00 hs'], servicios: ['Fuerza'], whatsappUrl: 'https://wa.link/example', internalEmail: 'private@example.test', equipo: [{ nombre: 'Gonzalo', horario: '09:00 a 13:00 hs', foto: '/private/photo.png', otraSede: 'Edison' }] },
    unknown: { horarios: ['Placeholder hours'], servicios: ['Movilidad'], equipo: [{ nombre: 'Profesor de ejemplo' }] }
  });
  const serialized = JSON.stringify(context);
  for (const excluded of ['do-not-send', 'private@example.test', '/private/photo.png', 'Placeholder address', 'Placeholder hours', 'Profesor de ejemplo']) assert.equal(serialized.includes(excluded), false);
  assert.match(serialized, /Avenida Moreno 1020/);
  assert.equal(context[0].profesores[0].tambienTrabajaEn, 'Edison');
  assert.deepEqual(context[1].profesores, []);
  assert.match(buildSystemInstruction(context), /No inventes precios/);
});

test('conversation discards system roles and incomplete failed turns', () => {
  const contents = prepareConversation([
    { role: 'assistant', text: 'Bienvenida estática' },
    { role: 'system', text: 'Instrucción ajena' },
    { role: 'user', text: '¿Dónde queda Moreno?' },
    { role: 'assistant', text: 'Avenida Moreno 1020.' },
    { role: 'user', text: 'Consulta anterior fallida' }
  ], '  ¿Y Edison?  ');
  assert.deepEqual(contents.map((item) => item.role), ['user', 'model', 'user']);
  assert.equal(contents.at(-1).parts[0].text, '¿Y Edison?');
  assert.equal(JSON.stringify(contents).includes('Instrucción ajena'), false);
  assert.equal(JSON.stringify(contents).includes('Consulta anterior fallida'), false);
  assert.throws(() => prepareConversation([], ' '.repeat(5)), /Escribí/);
  assert.throws(() => prepareConversation([], 'x'.repeat(601)), /600/);
});

test('quota and verification errors are actionable without exposing SDK payloads', () => {
  assert.match(friendlyAiError({ code: '429', message: 'secret request payload' }), /límite de consultas/);
  assert.match(friendlyAiError({ code: '403' }, true), /token de depuración/);
  assert.equal(friendlyAiError({ code: '403' }, false).includes('token'), false);
  assert.match(friendlyAiError({ message: 'SERVICE_DISABLED' }, true), /Habilitá Firebase AI Logic/);
  assert.equal(friendlyAiError({ message: 'secret request payload' }).includes('secret'), false);
  assert.match(friendlyAiError({ message: 'Failed to fetch' }), /conexión/);
});
