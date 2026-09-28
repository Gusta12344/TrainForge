import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { validateQuestionnaire } from '../questionnaire-validation.js';
import { initialAnswers, projectAnswers } from '../../frontend/src/js/questionario/model.js';

function completeAnswers() {
  const answers = {
    ...initialAnswers(), Q01: 'strength', Q05: '25', Q06: '175', Q07: '72,5',
    Q08: 'never', Q09: 'notstarted', Q11: 'none', Q14: 'no',
    Q15: ['0','2','4'], Q16: '3', times: { 0: '45', 2: '45', 4: '45' },
    Q19: 'gym', gear: { gym: ['dumbbells'] }, Q22: 'none',
  };
  return projectAnswers(answers);
}

function fakePool() {
  const users = [];
  const sessions = new Map();
  const profiles = new Map();
  return {
    users,
    async getConnection() {
      return {
        execute: (sql, params) => this.execute(sql, params),
        async beginTransaction() {}, async commit() {}, async rollback() {}, release() {},
      };
    },
    async query() { return [[{ ok: 1 }]]; },
    async execute(sql, params) {
      if (sql.startsWith('INSERT INTO users')) {
        if (users.some(user => user.email === params[1])) throw Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' });
        const id = users.length + 1;
        users.push({ id, name: params[0], email: params[1], password_hash: params[2], role: 'user' });
        return [{ insertId: id }];
      }
      if (sql.startsWith('INSERT INTO user_sessions')) {
        sessions.set(params[0].toString('hex'), { userId: params[1], expires: params[2] });
        return [{}];
      }
      if (sql.startsWith('SELECT u.id')) {
        const session = sessions.get(params[0].toString('hex'));
        const user = session && session.expires > new Date() && users.find(item => item.id === session.userId);
        return [user ? [user] : []];
      }
      if (sql.startsWith('SELECT id, name')) return [users.filter(user => user.email === params[0])];
      if (sql.startsWith('DELETE FROM user_sessions')) {
        sessions.delete(params[0].toString('hex'));
        return [{}];
      }
      if (sql.startsWith('INSERT INTO user_profiles')) {
        profiles.set(params[0], JSON.parse(params[1]));
        return [{}];
      }
      if (sql.startsWith('SELECT answers')) {
        const answers = profiles.get(params[0]);
        return [answers ? [{ answers, updated_at: new Date() }] : []];
      }
      throw new Error(`Consulta inesperada: ${sql}`);
    },
  };
}

test('cadastro, sessão, isolamento do perfil, login e logout', async () => {
  const pool = fakePool();
  const server = createApp(pool).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, options = {}, cookie) => fetch(base + path, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
  });
  try {
    const unauthorized = await request('/api/profile');
    assert.equal(unauthorized.status, 401);
    const registerA = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Ana', email: 'ANA@example.com', password: 'senha-longa-123' }) });
    assert.equal(registerA.status, 201);
    const cookieA = registerA.headers.get('set-cookie').split(';')[0];
    assert.match(cookieA, /trainforge_session=/);
    assert.equal(pool.users[0].email, 'ana@example.com');
    assert.ok(!pool.users[0].password_hash.includes('senha-longa-123'));
    const duplicate = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Outra', email: 'ana@example.com', password: 'senha-longa-123' }) });
    assert.equal(duplicate.status, 409);
    const registerB = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Bia', email: 'bia@example.com', password: 'senha-longa-456' }) });
    const cookieB = registerB.headers.get('set-cookie').split(';')[0];
    const answers = completeAnswers();
    const crossOrigin = await fetch(base + '/api/profile', {
      method: 'PUT',
      headers: { Origin: 'http://outro-site.example', 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify(answers),
    });
    assert.equal(crossOrigin.status, 403);
    const saved = await request('/api/profile', { method: 'PUT', body: JSON.stringify(answers) }, cookieA);
    assert.equal(saved.status, 200, JSON.stringify(await saved.json()));
    const own = await request('/api/profile', {}, cookieA);
    assert.deepEqual((await own.json()).answers, answers);
    const other = await request('/api/profile', {}, cookieB);
    assert.equal((await other.json()).answers, null);
    const wrongLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'ana@example.com', password: 'errada' }) });
    assert.equal(wrongLogin.status, 401);
    const logout = await request('/api/auth/logout', { method: 'POST' }, cookieA);
    assert.equal(logout.status, 204);
    assert.equal((await request('/api/profile', {}, cookieA)).status, 401);
    const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'ana@example.com', password: 'senha-longa-123' }) });
    assert.equal(login.status, 200);
    assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('servidor rejeita respostas adulteradas e incompletas', () => {
  const valid = completeAnswers();
  assert.deepEqual(validateQuestionnaire(valid), { answers: valid });
  assert.ok(validateQuestionnaire({ ...valid, Q16: '7' }).error);
  assert.ok(validateQuestionnaire({ ...valid, Q01: 'inventado' }).error);
  assert.ok(validateQuestionnaire({ ...valid, admin: true }).error);
  assert.ok(validateQuestionnaire({ ...valid, gear: { gym: ['none', 'barbell'] } }).error);
});

test('perfil com vôlei, jogo e horário compartilhado passa pela validação do servidor', () => {
  const answers = {
    ...initialAnswers(), Q01: 'sport', Q02: 'volleyball', Q03: 'none',
    Q05: '22', Q06: '180', Q07: '78', Q08: '1to2', Q09: 'regular',
    Q11: 'volleyball', Q12: 'training', Q14: 'no',
    sportEvents: [{
      id: '11111111-1111-4111-8111-111111111111', activity: 'volleyball',
      type: 'training', day: '0', minutes: '90', intensity: 'high',
    }],
    Q15: ['0','2'], Q16: '2', Q18: 'same', times: { 0: '60', 2: '60' },
    timing: { 0: 'after' }, Q19: 'gym', gear: { gym: ['barbell'] }, Q22: 'none',
  };
  const projected = projectAnswers(answers);
  assert.deepEqual(validateQuestionnaire(projected), { answers: projected });
});
