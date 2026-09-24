import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { getJwtSecret } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';

export const TITOLARE_COOKIE = 'notehub_titolare_session';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = Number(process.env.TITOLARE_LOGIN_MAX_ATTEMPTS || '5');
const attempts = new Map<string, { count: number; resetAt: number }>();
const scrypt = promisify(nodeScrypt);
let previewPassword = process.env.TITOLARE_PASSWORD?.trim() || '';

const previewOwner = {
  id: 'owner-preview',
  display_name: 'Riccardo Laste',
  email: 'titolare@notehub.local',
  role: 'Titolare',
  valid_from: '2025-09-01T00:00:00.000Z',
  source: 'preview',
};

export type TitolarRecord = typeof previewOwner;
export type TitolarAudit = {
  id: string;
  action: string;
  owner_id: string;
  owner_email: string;
  actor_email: string;
  actor_account: string;
  created_at: string;
  ip?: string;
  metadata?: Record<string, unknown>;
};

const previewHistory = [
  { ...previewOwner, id: 'owner-history-1', valid_to: null, changed_at: '2025-09-01T00:00:00.000Z' },
  { id: 'owner-history-0', display_name: 'NoteHub founding team', email: 'team@notehub.local', role: 'Titolare', valid_from: '2025-01-15T00:00:00.000Z', valid_to: '2025-08-31T23:59:59.999Z', changed_at: '2025-08-31T23:59:59.999Z', source: 'preview' },
];
const previewAudit: TitolarAudit[] = [
  {
    id: 'titolare-audit-1',
    action: 'OWNER_VIEWED',
    owner_id: previewOwner.id,
    owner_email: previewOwner.email,
    actor_email: 'admin@notehub.local',
    actor_account: 'admin',
    created_at: new Date().toISOString(),
    metadata: { source: 'preview' },
  },
];

function previewEnabled() {
  return process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
}
function key(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
}
function safeEqual(a: string, b: string) {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}
async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}
async function verifyHash(password: string, encoded: string) {
  const [, saltHex, hashHex] = encoded.split('$');
  if (!saltHex || !hashHex) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), 64) as Buffer;
  return timingSafeEqual(derived, Buffer.from(hashHex, 'hex'));
}
async function configuredPasswordHash() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'titolare_password_hash')
    .maybeSingle();
  return data?.value?.startsWith('scrypt$') ? data.value : null;
}
export function checkTitolarRateLimit(request: NextRequest) {
  const now = Date.now();
  const attempt = attempts.get(key(request));
  if (!attempt || attempt.resetAt <= now) {
    attempts.set(key(request), { count: 0, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }
  return attempt.count >= MAX_ATTEMPTS
    ? { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((attempt.resetAt - now) / 1000)) }
    : { limited: false, retryAfterSeconds: 0 };
}
export function recordTitolarFailure(request: NextRequest) {
  const now = Date.now();
  const item = attempts.get(key(request));
  if (!item || item.resetAt <= now) attempts.set(key(request), { count: 1, resetAt: now + WINDOW_MS });
  else item.count += 1;
}
export function clearTitolarFailures(request: NextRequest) { attempts.delete(key(request)); }
export async function verifyTitolarPassword(password: string) {
  const storedHash = await configuredPasswordHash();
  if (storedHash) return verifyHash(password, storedHash);
  if (!previewPassword) throw new Error('TITOLARE_PASSWORD must be configured server-side');
  return safeEqual(password, previewPassword);
}
export async function changeTitolarPassword(currentPassword: string, nextPassword: string) {
  if (!(await verifyTitolarPassword(currentPassword))) return false;
  const nextHash = await hashPassword(nextPassword);
  if (previewEnabled()) {
    previewPassword = nextPassword;
    return true;
  }
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'titolare_password_hash', value: nextHash, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
  return true;
}
export async function createTitolarToken(actorEmail: string) {
  return new SignJWT({ email: actorEmail, role: 'titolare' })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(actorEmail).setIssuedAt().setExpirationTime('30m').sign(new TextEncoder().encode(getJwtSecret()));
}
export async function verifyTitolarToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()));
    return payload.role === 'titolare' ? { email: String(payload.email || payload.sub || '') } : null;
  } catch { return null; }
}
export function getPreviewTitolarData() {
  return { owner: previewOwner, history: previewHistory, audit: previewAudit };
}
export function recordPreviewTitolarAccess(actorEmail: string, action = 'OWNER_VIEWED') {
  previewAudit.unshift({
    id: `titolare-audit-${Date.now()}`,
    action,
    owner_id: previewOwner.id,
    owner_email: previewOwner.email,
    actor_email: actorEmail,
    actor_account: 'admin',
    created_at: new Date().toISOString(),
    metadata: { source: 'preview', access_log: true },
  });
}

export function updatePreviewTitolar(
  displayName: string,
  email: string,
  actorEmail: string,
) {
  const now = new Date().toISOString();
  const previous = { ...previewOwner, valid_to: now, changed_at: now };
  previewHistory.unshift(previous);
  previewOwner.display_name = displayName;
  previewOwner.email = email;
  previewOwner.valid_from = now;
  previewAudit.unshift({
    id: `titolare-audit-${Date.now()}`,
    action: 'OWNER_CHANGED',
    owner_id: previewOwner.id,
    owner_email: email,
    actor_email: actorEmail,
    actor_account: 'admin',
    created_at: now,
    metadata: {
      source: 'preview',
      previous_owner_email: previous.email,
      previous_owner_name: previous.display_name,
    },
  });
  return { owner: previewOwner, history: previewHistory, audit: previewAudit };
}
