import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { createTitolarToken, checkTitolarRateLimit, clearTitolarFailures, recordTitolarFailure, verifyTitolarPassword, TITOLARE_COOKIE } from '@/lib/titolare-auth';

export async function POST(request: NextRequest) {
  const limit = checkTitolarRateLimit(request);
  if (limit.limited) return NextResponse.json({ error: 'Troppi tentativi. Riprova più tardi.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== 'string') {
    recordTitolarFailure(request);
    return NextResponse.json({ error: 'Inserisci la password Titolare.' }, { status: 400 });
  }

  try {
    if (!(await verifyTitolarPassword(body.password))) {
      recordTitolarFailure(request);
      return NextResponse.json({ error: 'Credenziali Titolare non valide.' }, { status: 401 });
    }
    clearTitolarFailures(request);
    const token = await createTitolarToken(process.env.TITOLARE_ACTOR_EMAIL?.trim() || 'titolare@notehub.local');
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
