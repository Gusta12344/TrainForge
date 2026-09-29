import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';
import mysql from 'mysql2/promise';

try {
  await access(new URL('../.env', import.meta.url));
  throw new Error('O arquivo .env já existe. A configuração inicial não será repetida.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const appPassword = randomBytes(30).toString('base64url');
const rootPassword = randomBytes(30).toString('base64url');
const connection = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '' });
try {
  await connection.query('CREATE DATABASE IF NOT EXISTS trainforge CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
  await connection.query(`CREATE USER 'trainforge_app'@'localhost' IDENTIFIED BY '${appPassword}'`);
  await connection.query("GRANT ALL PRIVILEGES ON trainforge.* TO 'trainforge_app'@'localhost'");
  await connection.query(`ALTER USER 'root'@'localhost' IDENTIFIED BY '${rootPassword}'`);
  await writeFile(new URL('../.env', import.meta.url), [
    'DB_HOST=127.0.0.1', 'DB_PORT=3307', 'DB_USER=trainforge_app',
    `DB_PASSWORD=${appPassword}`, 'DB_NAME=trainforge', 'API_PORT=43117', 'NODE_ENV=development', '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  await writeFile(new URL('../.env.mysql-root', import.meta.url), `DB_ROOT_PASSWORD=${rootPassword}\n`, { flag: 'wx', mode: 0o600 });
  console.log('Usuários locais preparados. As senhas foram gravadas apenas em arquivos ignorados pelo Git.');
} finally {
  await connection.end();
}
