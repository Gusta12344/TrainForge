import mysql from 'mysql2/promise';

export function databaseConfig() {
  const port = Number(process.env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DB_PORT inválida.');
  const database = process.env.DB_NAME || 'trainforge';
  if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(database)) throw new Error('DB_NAME inválido.');
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database,
    charset: 'utf8mb4',
    timezone: 'Z',
  };
}

export function createDatabasePool() {
  return mysql.createPool({
    ...databaseConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60_000,
  });
}
