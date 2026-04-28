/**
 * Utilities per autenticazione e JWT
 */

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { AuthenticationError, AuthorizationError } from './errors';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production-min-32-chars'
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'NoteHub2026!';
const COOKIE_NAME = 'admin_session';
const COOKIE_TTL_MS = 1000 * 60 * 60 * 24; // 24 ore

export interface AdminSession {
  iat: number;
  exp: number;
  role: 'admin';
}

/**
 * Crea un JWT token per sessione admin
 */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verifica e decodifica JWT token
 */
export async function verifySessionToken(token: string): Promise<AdminSession> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as AdminSession;
  } catch (error) {
    throw new AuthenticationError('Token non valido o scaduto');
  }
}

/**
 * Verifica password admin
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Imposta cookie sessione
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_TTL_MS / 1000, // in secondi
    path: '/',
  });
}

/**
 * Legge cookie sessione
 */
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value || null;
}

/**
 * Cancella cookie sessione
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Middleware per verificare admin auth
 */
export async function requireAdminAuth(): Promise<AdminSession> {
  const token = await getSessionCookie();
  
  if (!token) {
    throw new AuthenticationError('Sessione non trovata');
  }

  return verifySessionToken(token);
}

/**
 * Genera CSRF token (semplice)
 */
export function generateCSRFToken(): string {
  return Buffer.from(Math.random().toString()).toString('base64');
}
