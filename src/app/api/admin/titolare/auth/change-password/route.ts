import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { changeTitolarPassword, verifyTitolarToken, TITOLARE_COOKIE } from '@/lib/titolare-auth';

export async function POST(request: NextRequest) {
  const titular = await verifyTitolarToken((await cookies()).get(TITOLARE_COOKIE)?.value);
  if (!titular) return NextResponse.json({ error: 'Autenticazione Titolare richiesta' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const confirmation = typeof body.confirmation === 'string' ? body.confirmation : '';
  if (newPassword.length < 12 || newPassword !== confirmation) {
    return NextResponse.json({ error: 'La nuova password deve avere almeno 12 caratteri e le conferme devono coincidere.' }, { status: 400 });
  }
  try {
    if (!(await changeTitolarPassword(currentPassword, newPassword))) {
      return NextResponse.json({ error: 'Password corrente non valida' }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(TITOLARE_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')), sameSite: 'strict', path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    console.error('Unable to change titular password:', error);
    return NextResponse.json({ error: 'Impossibile aggiornare la password' }, { status: 503 });
  }
}
