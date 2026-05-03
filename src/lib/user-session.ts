import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const USER_SESSION_COOKIE = 'notehub_user_jwt';
export const INSTITUTION_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'liceoscacchibari.it';
const DEFAULT_ALLOWED_TEST_EMAILS = ['riccalaste@gmail.com'];

function getEnvAllowedEmails() {
  const configuredTestEmails = (process.env.ALLOWED_TEST_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set([
    ...DEFAULT_ALLOWED_TEST_EMAILS,
    ...configuredTestEmails,
  ]);
}

async function getDbAllowedEmails() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'allowed_external_emails')
    .maybeSingle();

  const value = data?.value || '';
  return value
    .split(',')
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAllowedUserEmail(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail.endsWith(`@${INSTITUTION_DOMAIN}`)) return true;

  const allowedEmails = getEnvAllowedEmails();
  try {
    const dbAllowedEmails = await getDbAllowedEmails();
    dbAllowedEmails.forEach((item) => allowedEmails.add(item));
  } catch {
    // Keep env fallback if DB lookup fails.
  }

  return allowedEmails.has(normalizedEmail);
}

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  if (!(await isAllowedUserEmail(data.user.email))) return null;

  return data.user;
}

export function setUserSessionCookie(response: NextResponse, accessToken: string) {
  response.cookies.set(USER_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
}

export function clearUserSessionCookie(response: NextResponse) {
  response.cookies.delete(USER_SESSION_COOKIE);
}
