import express from 'express';
import { COOKIE_NAME, hashPassword, newSession, readSessionCookie, sessionCookie, sessionHash, verifyPassword } from './security.js';
import { validateQuestionnaire } from './questionnaire-validation.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = user => ({ id: String(user.id), name: user.name, email: user.email, role: user.role });
const secureCookie = request => request.secure;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function registrationError(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Dados de cadastro inválidos.';
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 120) return 'Informe um nome com até 120 caracteres.';
  const email = normalizeEmail(body.email);
  if (!email || email.length > 254 || !emailPattern.test(email)) return 'Informe um e-mail válido.';
  if (typeof body.password !== 'string' || !body.password.trim() || [...body.password].length < 12 || [...body.password].length > 128) return 'A senha deve ter entre 12 e 128 caracteres.';
  return null;
}

async function createLoginSession(pool, user) {
  const session = newSession();
  await pool.execute('INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', [session.hash, user.id, session.expires]);
  return session;
}

export function createApp(pool, { frontendOrigin = process.env.FRONTEND_ORIGIN } = {}) {
  const app = express();
  const trustedFrontendOrigin = frontendOrigin ? new URL(frontendOrigin).origin : null;
  app.disable('x-powered-by');
  app.use('/api', (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', (request, response, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return next();
    const origin = request.get('Origin');
    if (origin) {
      try {
        const requestOrigin = new URL(origin).origin;
        const apiOrigin = `${request.protocol}://${request.get('Host')}`;
        if (requestOrigin !== apiOrigin && requestOrigin !== trustedFrontendOrigin) return response.status(403).json({ error: 'Origem da solicitação inválida.' });
      } catch {
        return response.status(403).json({ error: 'Origem da solicitação inválida.' });
      }
    }
    if (request.method !== 'DELETE' && request.path !== '/auth/logout' && !request.is('application/json')) {
      return response.status(415).json({ error: 'Envie os dados em JSON.' });
    }
    next();
  });
  app.use('/api', express.json({ limit: '64kb', strict: true }));

  async function requireUser(request, response, next) {
    const token = readSessionCookie(request.get('Cookie'));
    if (!token) return response.status(401).json({ error: 'Entre na sua conta para continuar.' });
    const [rows] = await pool.execute(
      'SELECT u.id, u.name, u.email, u.role FROM user_sessions AS s JOIN users AS u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP(3) LIMIT 1',
      [sessionHash(token)],
    );
    if (!rows.length) return response.status(401).json({ error: 'Sua sessão expirou. Entre novamente.' });
    request.user = rows[0];
    next();
  }

  app.get('/api/health', async (_request, response) => {
    await pool.query('SELECT 1');
    response.json({ status: 'ok' });
  });

  app.post('/api/auth/register', async (request, response) => {
    const error = registrationError(request.body);
    if (error) return response.status(400).json({ error });
    const name = request.body.name.trim();
    const email = normalizeEmail(request.body.email);
    const passwordHash = await hashPassword(request.body.password);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, passwordHash]);
      const user = { id: result.insertId, name, email, role: 'user' };
      const session = await createLoginSession(connection, user);
      await connection.commit();
      response.setHeader('Set-Cookie', sessionCookie(session.token, secureCookie(request)));
      response.status(201).json({ user: publicUser(user) });
    } catch (databaseError) {
      await connection.rollback();
      if (databaseError.code === 'ER_DUP_ENTRY') return response.status(409).json({ error: 'Este e-mail já está cadastrado.', field: 'email' });
      throw databaseError;
    } finally {
      connection.release();
    }
  });

  app.post('/api/auth/login', async (request, response) => {
    const email = normalizeEmail(request.body?.email);
    const password = request.body?.password;
    if (!email || email.length > 254 || typeof password !== 'string' || password.length > 128) {
      return response.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const [rows] = await pool.execute('SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
      return response.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const session = await createLoginSession(pool, rows[0]);
    response.setHeader('Set-Cookie', sessionCookie(session.token, secureCookie(request)));
    response.json({ user: publicUser(rows[0]) });
  });

  app.post('/api/auth/logout', async (request, response) => {
    const token = readSessionCookie(request.get('Cookie'));
    if (token) await pool.execute('DELETE FROM user_sessions WHERE token_hash = ?', [sessionHash(token)]);
    response.setHeader('Set-Cookie', sessionCookie('', secureCookie(request)));
    response.status(204).end();
  });

  app.get('/api/auth/me', requireUser, (request, response) => {
    response.json({ user: publicUser(request.user) });
  });

  app.get('/api/profile', requireUser, async (request, response) => {
    const [rows] = await pool.execute('SELECT answers, updated_at FROM user_profiles WHERE user_id = ? LIMIT 1', [request.user.id]);
    if (!rows.length) return response.json({ answers: null });
    const answers = typeof rows[0].answers === 'string' ? JSON.parse(rows[0].answers) : rows[0].answers;
    response.json({ answers, updatedAt: rows[0].updated_at });
  });

  app.put('/api/profile', requireUser, async (request, response) => {
    const result = validateQuestionnaire(request.body);
    if (result.error) return response.status(400).json(result);
    const json = JSON.stringify(result.answers);
    await pool.execute(
      'INSERT INTO user_profiles (user_id, answers) VALUES (?, ?) ON DUPLICATE KEY UPDATE answers = ?',
      [request.user.id, json, json],
    );
    response.json({ saved: true });
  });

  app.use('/api', (_request, response) => response.status(404).json({ error: 'Rota não encontrada.' }));
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') return response.status(413).json({ error: 'Dados enviados são grandes demais.' });
    if (error instanceof SyntaxError && error.status === 400) return response.status(400).json({ error: 'JSON inválido.' });
    console.error(error);
    response.status(500).json({ error: 'Erro no servidor. Tente novamente.' });
  });
  return app;
}
