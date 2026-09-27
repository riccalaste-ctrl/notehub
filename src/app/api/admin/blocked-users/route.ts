import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from('blocked_users')
    .select('id,email,reason,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Blocked users list error:', error.message);
    return NextResponse.json({ error: 'Impossibile caricare gli utenti bloccati' }, { status: 500 });
  }

  return NextResponse.json({ blockedUsers: data || [] });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : null;

  if (!email || !email.includes('@') || email.length > 320) {
    return NextResponse.json({ error: 'Inserisci un indirizzo email valido' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('blocked_users')
    .upsert({ email, reason }, { onConflict: 'email' });

  if (error) {
    console.error('Blocked user create error:', error.message);
    return NextResponse.json({ error: 'Impossibile bloccare questo indirizzo' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const email = normalizeEmail(new URL(request.url).searchParams.get('email'));
  if (!email) return NextResponse.json({ error: 'Email mancante' }, { status: 400 });

  const { error } = await supabaseAdmin.from('blocked_users').delete().eq('email', email);

  if (error) {
    console.error('Blocked user removal error:', error.message);
    return NextResponse.json({ error: 'Impossibile revocare il blocco' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
