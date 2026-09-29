import test from 'node:test';
import assert from 'node:assert/strict';
import { destinationAfterAuth } from '../src/js/auth/flow.js';

test('cadastro leva ao questionário e login respeita a existência de perfil salvo', () => {
  assert.equal(destinationAfterAuth('register', { answers: {} }), '/questionario.html');
  assert.equal(destinationAfterAuth('login', { answers: null }), '/questionario.html');
  assert.equal(destinationAfterAuth('login', { answers: { Q01: 'strength' } }), '/treino.html');
});
