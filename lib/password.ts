import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const FORMAT_VERSION = 'scrypt-v1';

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return [FORMAT_VERSION, salt, derivedKey.toString('hex')].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
  const [version, salt, encodedKey] = storedHash.split('$');

  if (version !== FORMAT_VERSION || !salt || !encodedKey) return false;

  const storedKey = Buffer.from(encodedKey, 'hex');
  if (storedKey.length !== KEY_LENGTH) return false;

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return timingSafeEqual(storedKey, derivedKey);
}
