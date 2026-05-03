import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearUserSessionCookie, isAllowedUserEmail, setUserSessionCookie } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

function getAppUrl(request: NextRequest) {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    console.log('[AUTH] Missing code');
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[AUTH] Missing Supabase config');
    return NextResponse.redirect(new URL('/login?error=supabase_missing', request.url));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session?.access_token || !data.user) {
    console.log('[AUTH] OAuth exchange failed:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', request.url));
  }

  console.log('[AUTH] User email:', data.user.email);
  const isAllowed = await isAllowedUserEmail(data.user.email);
  console.log('[AUTH] Is allowed:', isAllowed);
  
  if (!isAllowed) {
    console.log('[AUTH] User not allowed');
    await supabase.auth.signOut();
    const response = NextResponse.redirect(new URL('/login?error=invalid_domain', request.url));
    clearUserSessionCookie(response);
    return response;
  }

  const response = NextResponse.redirect(new URL('/', getAppUrl(request)));
  setUserSessionCookie(response, data.session.access_token);
  console.log('[AUTH] Cookie set, redirecting to home');
  return response;
}
