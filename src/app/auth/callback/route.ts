import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isAllowedUserEmail } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  try {
    const parsed = new URL(value, 'https://notehub.local');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'));

  if (error) {
    console.log('[AUTH] OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.log('[AUTH] Exchange error:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', requestUrl.origin));
    }

    // Verify email is allowed
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email && !(await isAllowedUserEmail(user.email))) {
      console.log('[AUTH] User not allowed:', user.email);
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=invalid_domain', requestUrl.origin));
    }

    console.log('[AUTH] Auth successful, redirecting to:', next);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
