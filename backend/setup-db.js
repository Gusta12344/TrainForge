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
  console.log(`Banco ${config.database} preparado com sucesso.`);
} finally {
  await connection.end();
}
