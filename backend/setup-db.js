import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { databaseConfig } from './db.js';

const config = databaseConfig();
const connection = await mysql.createConnection({
  ...config,
  database: undefined,
  multipleStatements: true,
});

try {
  const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  await connection.query(`USE \`${config.database}\``);
  await connection.query(schema);
  const [columns] = await connection.execute(
    'SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ? LIMIT 1',
    [config.database, 'programs', 'content_snapshot'],
  );
  if (!columns.length) {
    const [[{ total }]] = await connection.query('SELECT COUNT(*) AS total FROM programs');
    if (total) throw new Error('A tabela programs já contém dados. Revise a migração do histórico antes de acrescentar content_snapshot.');
    const migration = await readFile(new URL('../database/migrations/001_program_snapshot.sql', import.meta.url), 'utf8');
    await connection.query(migration);
  }
  console.log(`Banco ${config.database} preparado com sucesso.`);
} finally {
  await connection.end();
}
