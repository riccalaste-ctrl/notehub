import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAppUrl(request: NextRequest) {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase auth non configurato' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const redirectTo = `${getAppUrl(request)}/api/auth/google/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        hd: process.env.ALLOWED_EMAIL_DOMAIN || 'liceoscacchibari.it',
        prompt: 'select_account',
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL('/login?error=oauth_start_failed', request.url));
  }

  return NextResponse.redirect(data.url);
}
