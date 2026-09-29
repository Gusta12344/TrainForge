import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = join(projectRoot, 'database', 'local-mysql-data');
const basedir = process.env.MYSQL_BASEDIR || 'C:\\Program Files\\MySQL\\MySQL Server 8.0';
const executable = join(basedir, 'bin', 'mysqld.exe');

if (!existsSync(join(data, 'mysql'))) throw new Error('Os dados do MySQL local não foram encontrados.');
if (!existsSync(executable)) throw new Error(`MySQL não encontrado em ${executable}. Defina MYSQL_BASEDIR.`);

const child = spawn(executable, [
  '--no-defaults', `--basedir=${basedir}`, `--datadir=${data}`,
  '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF', '--console',
], { stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
