import { NextRequest, NextResponse } from 'next/server';
import { createJWT } from '@/lib/jwt';
import { serialize } from 'cookie';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password richiesta' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'NoteHub2026!';
    console.log('Password check:', password === adminPassword ? 'MATCH' : 'MISMATCH', 'ENV:', process.env.ADMIN_PASSWORD ? 'SET' : 'UNSET');

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Password non valida' }, { status: 401 });
    }

    const jwt = await createJWT('admin@notehub.local', 'admin');

    const cookie = serialize(ADMIN_JWT_COOKIE, jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    const response = NextResponse.json({ success: true, redirect: '/admin' }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });

    return response;
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
