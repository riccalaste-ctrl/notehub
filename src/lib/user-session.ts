import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export const USER_SESSION_COOKIE = 'notehub_user_jwt';
export const INSTITUTION_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'liceoscacchibari.it';

function hasInstitutionDomain(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${INSTITUTION_DOMAIN}`);
}

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  if (!hasInstitutionDomain(data.user.email)) return null;

  return data.user;
}

export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  if (!hasInstitutionDomain(data.user.email)) return null;

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

export function buildInstitutionDisclaimer(supportEmail?: string) {
  const fallbackEmail = supportEmail || 'support@liceoscacchibari.it';
  return `Gli amministratori non sono responsabili dei file caricati ma si impegnano a rimuovere contenuti vietati segnalati alla mail ${fallbackEmail}.`;
}
