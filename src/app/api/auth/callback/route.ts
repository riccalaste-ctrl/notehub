import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearUserSessionCookie, isAllowedUserEmail, setUserSessionCookie } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    console.log('[AUTH] Missing code');
    return NextResponse.redirect(new URL('/login?error=missing_code', request.nextUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[AUTH] Missing Supabase config');
    return NextResponse.redirect(new URL('/login?error=supabase_missing', request.nextUrl.origin));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session?.access_token || !data.user) {
    console.log('[AUTH] OAuth exchange failed:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', request.nextUrl.origin));
  }

  const email = data.user.email || '';
  console.log('[AUTH] User email:', email);
  const isAllowed = await isAllowedUserEmail(email);
  console.log('[AUTH] Is allowed:', isAllowed);
  
  if (!isAllowed) {
    console.log('[AUTH] User not allowed');
    await supabase.auth.signOut();
    const response = NextResponse.redirect(new URL('/login?error=invalid_domain', request.nextUrl.origin));
    clearUserSessionCookie(response);
    return response;
  }

  const origin = request.nextUrl.origin;
  console.log('[AUTH] Setting cookie, token length:', data.session.access_token.length, 'redirect to:', origin + '/');
  const response = NextResponse.redirect(new URL('/', origin));
  setUserSessionCookie(response, data.session.access_token);
  console.log('[AUTH] Cookie set, redirecting to home');
  return response;
}
