import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createJWT } from '@/lib/jwt';
import { setAdminCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password richiesta' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'NoteHub2026!';

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Password non valida' }, { status: 401 });
    }

    const jwt = await createJWT('admin@notehub.local', 'admin');
    await setAdminCookie(jwt);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
