import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { createTitolarToken, checkTitolarRateLimit, clearTitolarFailures, recordTitolarFailure, verifyTitolarPassword, TITOLARE_COOKIE } from '@/lib/titolare-auth';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const limit = checkTitolarRateLimit(request);
  if (limit.limited) return NextResponse.json({ error: 'Troppi tentativi. Riprova più tardi.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  const actor = await getUserFromToken();
  const preview = process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
  if ((!actor || actor.role !== 'admin') && !preview) return NextResponse.json({ error: 'Password admin richiesta' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== 'string' || !verifyTitolarPassword(body.password)) {
    recordTitolarFailure(request);
    return NextResponse.json({ error: 'Credenziali titolare non valide' }, { status: 401 });
  }
  clearTitolarFailures(request);
  const actorEmail = actor?.email || process.env.TITOLARE_ACTOR_EMAIL?.trim() || 'titolare@notehub.local';
  const token = await createTitolarToken(actorEmail);
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', serialize(TITOLARE_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 1800, path: '/' }));
  return response;
}
