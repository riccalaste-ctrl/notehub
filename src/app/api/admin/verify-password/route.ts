import { NextRequest, NextResponse } from 'next/server';
import { createJWT } from '@/lib/jwt';
import { serialize } from 'cookie';
import { logAuditEvent } from '@/lib/audit';
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  isAdminEmailAllowed,
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
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = body?.password;

    if (!email || !password || typeof password !== 'string' || !isAdminEmailAllowed(email)) {
      recordAdminLoginFailure(request);
      await logAuditEvent({ actor_email: email || 'unknown', action: 'admin_login_failed', target_type: 'admin_auth' });
      return NextResponse.json({ error: 'Email o password non valide' }, { status: 401 });
    }

    if (!(await verifyConfiguredAdminPassword(password))) {
      recordAdminLoginFailure(request);
      await logAuditEvent({ actor_email: email, action: 'admin_login_failed', target_type: 'admin_auth' });
      return NextResponse.json({ error: 'Email o password non valide' }, { status: 401 });
    }

    clearAdminLoginFailures(request);
    const adminEmail = email;
    const jwt = await createJWT(adminEmail, 'admin');

    const cookie = serialize(ADMIN_JWT_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')),
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
