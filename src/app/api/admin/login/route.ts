import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createJWT } from '@/lib/jwt';
import { setAdminCookie } from '@/lib/auth';
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  getAdminEmail,
  recordAdminLoginFailure,
  verifyConfiguredAdminPassword,
} from '@/lib/admin-auth';
import { logAdminLogin, logSecurityEvent } from '@/lib/audit-logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkAdminLoginRateLimit(request);
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const adminEmail = getAdminEmail();

    if (email !== adminEmail || !(await verifyConfiguredAdminPassword(password))) {
      recordAdminLoginFailure(request);
      await logSecurityEvent('ADMIN_LOGIN_FAILED', {
        email,
        reason: 'invalid_credentials',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      }, email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    clearAdminLoginFailures(request);
    const jwt = await createJWT(email, 'admin');
    await setAdminCookie(jwt);

    await logAdminLogin(email, true);

    return NextResponse.json({ 
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
