import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { getJwtSecret } from '@/lib/env';

const ENCRYPTION_PREFIX = 'v1';

function getEncryptionKey(): Buffer {
  const rawKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim();

  if (!rawKey) {
    throw new Error('Missing GOOGLE_TOKEN_ENCRYPTION_KEY');
  }

  if (/^[a-f0-9]{64}$/i.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  try {
    const decoded = Buffer.from(rawKey, 'base64');
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // Fall through to passphrase-derived key.
  }

  if (rawKey.length < 32) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY must be at least 32 characters');
  }

  return createHash('sha256').update(rawKey).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

export function decryptSecret(payload: string): string {
  const [version, ivValue, tagValue, encryptedValue] = payload.split(':');

  if (version !== ENCRYPTION_PREFIX || !ivValue || !tagValue || !encryptedValue) {
    throw new Error('Invalid encrypted secret payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64url')
  );

  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function getStateSecret(): Buffer {
  return createHash('sha256')
    .update(getJwtSecret())
    .digest();
}

function signStatePayload(encodedPayload: string): string {
  return createHmac('sha256', getStateSecret()).update(encodedPayload).digest('base64url');
}

export function createSignedState(payload: Record<string, unknown>): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encodedPayload}.${signStatePayload(encodedPayload)}`;
}

export function verifySignedState<T extends object>(state: string): T {
  const [encodedPayload, signature] = state.split('.');

  if (!encodedPayload || !signature) {
    throw new Error('Invalid OAuth state');
  }

  const expected = signStatePayload(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid OAuth state signature');
  }

  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as T;
}
