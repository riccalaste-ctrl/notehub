import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isAllowedUserEmail } from '@/lib/user-session';
import { supabaseAdmin } from '@/lib/supabase';

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
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.log('[AUTH] Exchange error:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', requestUrl.origin));
    }

    // Verify email is allowed and not blocked by an administrator.
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const { data: blockedUser, error: blockedLookupError } = await supabaseAdmin
        .from('blocked_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (blockedLookupError) {
        console.error('[AUTH] Blocklist lookup failed:', blockedLookupError.message);
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=auth_unavailable', requestUrl.origin));
      }

      if (blockedUser) {
        console.log('[AUTH] Blocked user denied:', normalizedEmail);
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=account_blocked', requestUrl.origin));
      }

      if (!(await isAllowedUserEmail(normalizedEmail))) {
      console.log('[AUTH] User not allowed:', user.email);
      await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=invalid_domain', requestUrl.origin));
      }
    }

    console.log('[AUTH] Auth successful, redirecting to:', next);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
