import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { createTitolarToken, checkTitolarRateLimit, clearTitolarFailures, recordTitolarFailure, verifyTitolarPassword, TITOLARE_COOKIE } from '@/lib/titolare-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isAllowedUserEmail } from '@/lib/user-session';

export async function POST(request: NextRequest) {
  const limit = checkTitolarRateLimit(request);
  if (limit.limited) return NextResponse.json({ error: 'Troppi tentativi. Riprova più tardi.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== 'string') {
    recordTitolarFailure(request);
    return NextResponse.json({ error: 'Inserisci la password Titolare.' }, { status: 400 });
  }

  try {
    // The actor must be the real institutional account currently authenticated
    // with Google/Supabase. Never accept actor identity from the client or an
    // environment variable, because that would make the audit falsifiable.
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const actorEmail = user?.email?.trim().toLowerCase() || '';
    if (!actorEmail || !(await isAllowedUserEmail(actorEmail))) {
      return NextResponse.json({ error: 'Accedi con il tuo account istituzionale prima di entrare nella sezione Titolare.' }, { status: 401 });
    }

    if (!(await verifyTitolarPassword(body.password))) {
      recordTitolarFailure(request);
      return NextResponse.json({ error: 'Credenziali Titolare non valide.' }, { status: 401 });
    }
    clearTitolarFailures(request);
    const token = await createTitolarToken(actorEmail);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', serialize(TITOLARE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')),
      sameSite: 'strict',
      maxAge: 1800,
      path: '/',
    }));
    return response;
  } catch (error) {
    console.error('Titolare authentication failed:', error);
    return NextResponse.json({ error: 'Autenticazione Titolare temporaneamente non disponibile.' }, { status: 503 });
  }
}
