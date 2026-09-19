import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAuth } from '../src/js/auth/validation.js';

test('cadastro exige nome, e-mail e senha, mesmo com campos em branco', () => {
  const errors = validateAuth({ name: '  ', email: '', password: '' }, 'register');
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'password']);
});

test('rejeita e-mail sem domínio e espaços internos', () => {
  for (const email of ['pessoa@', 'pessoa exemplo@teste.com', 'pessoa']) {
    assert.ok(validateAuth({ email, password: 'qualquer' }, 'login').email);
  }
});

test('cadastro aceita nome com acento e e-mail com espaços externos', () => {
  assert.deepEqual(validateAuth({
    name: 'João', email: ' joao@example.com ', password: 'Treino de teste 2026!',
  }, 'register'), {});
});

test('cadastro rejeita senha curta ou excessivamente longa', () => {
  for (const password of ['12345678901', 'a'.repeat(129), ' '.repeat(12)]) {
    assert.ok(validateAuth({ name: 'João', email: 'joao@example.com', password }, 'register').password);
  }
});

test('login não impõe a regra de nova senha nem exige nome', () => {
  assert.deepEqual(validateAuth({ email: 'joao@example.com', password: 'antiga' }, 'login'), {});
  assert.ok(validateAuth({ email: 'joao@example.com', password: '' }, 'login').password);
});
