import { NextRequest, NextResponse } from 'next/server';
import { createJWT } from '@/lib/jwt';
import { serialize } from 'cookie';
import { logAuditEvent } from '@/lib/audit';
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  getAdminEmail,
  recordAdminLoginFailure,
  verifyConfiguredAdminPassword,
} from '@/lib/admin-auth';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkAdminLoginRateLimit(request);
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra poco.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password richiesta' }, { status: 400 });
    }

    if (!(await verifyConfiguredAdminPassword(password))) {
      recordAdminLoginFailure(request);
      await logAuditEvent({
        actor_email: 'unknown',
        action: 'admin_login_failed',
        target_type: 'admin_auth',
      });
      return NextResponse.json({ error: 'Password non valida' }, { status: 401 });
    }

    clearAdminLoginFailures(request);
    const adminEmail = getAdminEmail();
    const jwt = await createJWT(adminEmail, 'admin');

    const cookie = serialize(ADMIN_JWT_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    const response = NextResponse.json({ success: true, redirect: '/admin' }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });

    await logAuditEvent({
      actor_email: adminEmail,
      action: 'admin_login_success',
      target_type: 'admin_auth',
    });

    return response;
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
