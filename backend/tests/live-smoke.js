import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createDatabasePool } from '../db.js';
import { initialAnswers, projectAnswers } from '../../frontend/src/js/questionario/model.js';
import { createApp } from '../app.js';

const marker = randomUUID().slice(0, 8);
const emails = [`teste-${marker}-a@example.com`, `teste-${marker}-b@example.com`];
const pool = createDatabasePool();
const server = createApp(pool).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

async function request(path, method = 'GET', body, cookie) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body && JSON.stringify(body),
  });
  return { response, data: response.status === 204 ? null : await response.json() };
}

try {
  assert.equal((await request('/api/health')).response.status, 200);
  const first = await request('/api/auth/register', 'POST', { name: 'Teste A', email: emails[0], password: 'senha-de-teste-123' });
  assert.equal(first.response.status, 201, JSON.stringify(first.data));
  const cookieA = first.response.headers.get('set-cookie').split(';')[0];
  const second = await request('/api/auth/register', 'POST', { name: 'Teste B', email: emails[1], password: 'senha-de-teste-456' });
  assert.equal(second.response.status, 201, JSON.stringify(second.data));
  const cookieB = second.response.headers.get('set-cookie').split(';')[0];
  const answers = projectAnswers({
    ...initialAnswers(), Q01: 'strength', Q05: '25', Q06: '175', Q07: '72,5', Q08: 'never', Q09: 'notstarted',
    Q11: 'none', Q14: 'no', Q15: ['0','2'], Q16: '2', times: { 0: '45', 2: '50' },
    Q19: 'gym', gear: { gym: ['dumbbells'] }, Q22: 'none',
  });
  assert.equal((await request('/api/profile', 'PUT', answers, cookieA)).response.status, 200);
  assert.deepEqual((await request('/api/profile', 'GET', null, cookieA)).data.answers, answers);
  assert.equal((await request('/api/profile', 'GET', null, cookieB)).data.answers, null);
  assert.equal((await request('/api/profile', 'PUT', { ...answers, Q16: '7' }, cookieA)).response.status, 400);
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE email = ?', [emails[0]]);
  assert.ok(rows.length && !rows[0].password_hash.includes('senha-de-teste-123'));
  assert.equal((await request('/api/auth/logout', 'POST', null, cookieA)).response.status, 204);
  assert.equal((await request('/api/profile', 'GET', null, cookieA)).response.status, 401);
  assert.equal((await request('/api/auth/login', 'POST', { email: emails[0], password: 'senha-de-teste-123' })).response.status, 200);
  console.log('Teste real concluído: contas, senhas, sessões, perfil e isolamento entre usuários.');
} finally {
  await pool.execute('DELETE FROM users WHERE email IN (?, ?)', emails);
  await new Promise(resolve => server.close(resolve));
  await pool.end();
}
