import express from 'express';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabasePool } from './db.js';
import { createApp } from './app.js';

const pool = createDatabasePool();
try {
  await pool.query('SELECT 1');
} catch (error) {
  console.error('Não foi possível conectar ao MySQL. Confira .env e execute npm run db:setup.');
  console.error(error.message);
  await pool.end();
  process.exit(1);
}

const app = createApp(pool);
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(dist)) app.use(express.static(dist));
const port = Number(process.env.API_PORT || 43117);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('API_PORT inválida.');
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`TrainForge disponível em http://127.0.0.1:${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
