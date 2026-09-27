import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { changeTitolarPassword, verifyTitolarToken, TITOLARE_COOKIE } from '@/lib/titolare-auth';
import { supabaseAdmin } from '@/lib/supabase';

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

    // The actor is taken exclusively from the signed Titolare session, which
    // was created from the authenticated institutional Supabase account.
    // Never accept an actor email from the request body or the client.
    const actorEmail = titular.email.trim().toLowerCase();
    if (process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true') {
      return NextResponse.json({ success: true });
    }

    const { data: owner } = await supabaseAdmin
      .from('titular_records')
      .select('id, email')
      .eq('is_current', true)
      .single();
    await supabaseAdmin.from('titular_audit_logs').insert({
      action: 'TITOLARE_PASSWORD_CHANGED',
      owner_id: owner?.id || null,
      owner_email: owner?.email || null,
      actor_email: actorEmail,
      actor_account: 'institutional_user',
      metadata: { credential_change: true },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(TITOLARE_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')), sameSite: 'strict', path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    console.error('Unable to change titular password:', error);
    return NextResponse.json({ error: 'Impossibile aggiornare la password' }, { status: 503 });
  }
}
