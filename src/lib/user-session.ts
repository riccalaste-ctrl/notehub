import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase';
import { DEVELOPER_EMAILS } from '@/lib/constants';

export const USER_SESSION_COOKIE = 'notehub_user_jwt';
export const INSTITUTION_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'liceoscacchibari.it';

function getEnvAllowedEmails() {
  const configuredTestEmails = (process.env.ALLOWED_TEST_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set([
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
  if (DEVELOPER_EMAILS.includes(normalizedEmail)) return true;

  const allowedEmails = getEnvAllowedEmails();
  try {
    const dbAllowedEmails = await getDbAllowedEmails();
    dbAllowedEmails.forEach((item: string) => allowedEmails.add(item));
  } catch {
    // Keep env fallback if DB lookup fails.
  }

  return allowedEmails.has(normalizedEmail);
}

export async function getUserFromRequest(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  if (!(await isAllowedUserEmail(session.user.email))) return null;

  return session.user;
}

// Deprecated: kept for backward compatibility with old API routes
export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  return getUserFromRequest(request);
}

export function setUserSessionCookie(response: NextResponse, accessToken: string) {
  // No longer needed - @supabase/ssr handles cookies automatically
  return;
}

export function clearUserSessionCookie(response: NextResponse) {
  // No longer needed - @supabase/ssr handles cookies automatically
  return;
}
