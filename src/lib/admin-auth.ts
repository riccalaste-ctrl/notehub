import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { isProduction } from '@/lib/env';

const DEFAULT_DEV_ADMIN_PASSWORD = 'NoteHub2026!';
const DEFAULT_ADMIN_EMAIL = 'admin@notehub.local';
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || '8');

interface LoginAttempt {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

function hashForCompare(value: string) {
  return createHash('sha256').update(value).digest();
}

function timingSafeStringEqual(left: string, right: string) {
  return timingSafeEqual(hashForCompare(left), hashForCompare(right));
}

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'local';
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
}

export async function verifyConfiguredAdminPassword(password: string) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  const plainPassword = process.env.ADMIN_PASSWORD?.trim();
  if (plainPassword) {
    return timingSafeStringEqual(password, plainPassword);
  }

  if (isProduction()) {
    throw new Error('ADMIN_PASSWORD_HASH or ADMIN_PASSWORD must be configured');
  }

  return timingSafeStringEqual(password, DEFAULT_DEV_ADMIN_PASSWORD);
}

export function checkAdminLoginRateLimit(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((attempt.resetAt - now) / 1000)),
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

export function recordAdminLoginFailure(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }

  attempt.count += 1;
}

export function clearAdminLoginFailures(request: NextRequest) {
  loginAttempts.delete(getClientKey(request));
}
