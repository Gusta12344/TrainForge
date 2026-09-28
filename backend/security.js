import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export const SESSION_DAYS = 7;
export const COOKIE_NAME = 'trainforge_session';

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString('base64url')}:${key.toString('base64url')}`;
}

export async function verifyPassword(password, encoded) {
  const [algorithm, saltText, keyText] = String(encoded).split(':');
  if (algorithm !== 'scrypt' || !saltText || !keyText) return false;
  const key = Buffer.from(keyText, 'base64url');
  if (key.length !== 64) return false;
  const actual = await scrypt(password, Buffer.from(saltText, 'base64url'), key.length);
  return timingSafeEqual(key, actual);
}

export function newSession() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: sessionHash(token), expires: new Date(Date.now() + SESSION_DAYS * 86_400_000) };
}

export function sessionHash(token) {
  return createHash('sha256').update(token).digest();
}

export function readSessionCookie(header = '') {
  const entry = header.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  const token = entry?.slice(COOKIE_NAME.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export function sessionCookie(token, secure = false) {
  const attributes = [`${COOKIE_NAME}=${token}`, 'HttpOnly', 'SameSite=Lax', 'Path=/'];
  attributes.push(token ? `Max-Age=${SESSION_DAYS * 86_400}` : 'Max-Age=0');
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}
