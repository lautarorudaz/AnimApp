import { test } from 'node:test';
import assert from 'node:assert/strict';
import { duplicateNode, emptyRoutine, isStudentActive, normalizeRoutine, validateRoutine } from '../src/features/routines/model.js';
import { normalizeExercise, youtubeId } from '../src/features/routines/libraryModel.js';

test('legacy flat exercises survive normalization in the central stage', () => {
  const legacy = { nombre: 'Anterior', semanas: [{ nombre: 'Semana 1', dias: [{ nombre: 'Torso', ejercicios: [{ nombre: 'Remo', series: 3, repeticiones: 12, peso: '20 kg', observaciones: 'Controlar bajada' }] }] }] };
  const result = normalizeRoutine(legacy);
  const day = result.semanas[0].dias[0];
  assert.equal(day.etapas.central[0].aclaraciones, 'Controlar bajada');
  assert.equal(day.etapas.central[0].series, '3');
  assert.deepEqual(day.etapas.movilidad, []);
  assert.equal(validateRoutine(result, true), '');
});

test('draft can be incomplete but publication requires exercises and prescription', () => {
  const routine = emptyRoutine({ objetivo: 'Fuerza' });
  assert.equal(validateRoutine(routine), '');
  assert.match(validateRoutine(routine, true), /agregá ejercicios/);
  routine.semanas[0].dias[0].etapas.activacion.push({ id: 'exercise', nombre: 'Plancha', series: '3', repeticiones: '30 s', peso: '', aclaraciones: '' });
  assert.match(validateRoutine(routine, true), /completá/);
  routine.semanas[0].dias[0].etapas.activacion[0].peso = 'Sin carga';
  assert.equal(validateRoutine(routine, true), '');
  routine.semanas[0].dias[0].etapas.activacion[0].series = '-2';
  assert.match(validateRoutine(routine, true), /series/);
});

test('duplicated weeks and exercises have independent identifiers and values', () => {
  const routine = emptyRoutine();
  routine.semanas[0].dias[0].etapas.central.push({ id: 'exercise', nombre: 'Press', peso: '20 kg' });
  const original = routine.semanas[0];
  const copy = duplicateNode(original);
  assert.notEqual(copy.id, original.id);
  assert.notEqual(copy.dias[0].id, original.dias[0].id);
  assert.notEqual(copy.dias[0].etapas.central[0].id, original.dias[0].etapas.central[0].id);
  copy.dias[0].etapas.central[0].peso = '30 kg';
  assert.equal(original.dias[0].etapas.central[0].peso, '20 kg');
});

test('all supported soft deletion fields disable a student', () => {
  for (const student of [{ activo: false }, { active: false }, { estado: 'Baja' }, { estado: 'Inactivo' }]) assert.equal(isStudentActive(student), false);
  assert.equal(isStudentActive({ nombre: 'Alumno anterior' }), true);
});

test('YouTube links accept video variants and reject unrelated or executable URLs', () => {
  for (const value of ['https://www.youtube.com/watch?v=M7lc1UVf-VE', 'https://youtu.be/M7lc1UVf-VE?t=5', 'https://www.youtube.com/shorts/M7lc1UVf-VE', 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE']) assert.equal(youtubeId(value), 'M7lc1UVf-VE');
  for (const value of ['', 'javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=M7lc1UVf-VE', 'https://youtu.be/not-valid', 'https://example.com/M7lc1UVf-VE']) assert.equal(youtubeId(value), '');
});

test('existing exercise fields and stage aliases remain usable', () => {
  const exercise = normalizeExercise({ nombre: 'Remo', grupoMuscular: 'Espalda', etapa: 'Zona central', youtubeUrl: 'https://youtu.be/M7lc1UVf-VE' }, 'legacy');
  assert.equal(exercise.zonaMuscular, 'Espalda'); assert.equal(exercise.etapa, 'central'); assert.equal(exercise.videoUrl, 'https://youtu.be/M7lc1UVf-VE');
});
