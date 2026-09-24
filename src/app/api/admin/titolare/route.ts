import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/auth';
import { getPreviewTitolarData, recordPreviewTitolarAccess, updatePreviewTitolar, verifyTitolarToken, TITOLARE_COOKIE } from '@/lib/titolare-auth';

async function authorized() {
  const actor = await getUserFromToken();
  const titular = await verifyTitolarToken((await cookies()).get(TITOLARE_COOKIE)?.value);
  const preview = process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true';
  return titular && ((actor?.role === 'admin') || preview)
    ? { actor: actor || { email: titular.email, role: 'admin' }, titular }
    : null;
}
export async function GET(request: NextRequest) {
  const auth = await authorized();
  if (!auth) return NextResponse.json({ error: 'Password admin e password titolare richieste' }, { status: 401 });
  if (process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true') {
    recordPreviewTitolarAccess(auth.actor.email);
    const data = getPreviewTitolarData();
    if (request.nextUrl.searchParams.get('export') === 'json') return NextResponse.json({ ...data, exported_at: new Date().toISOString() });
    if (request.nextUrl.searchParams.get('export') === 'csv') {
      const rows = [['created_at', 'action', 'owner_email', 'actor_email', 'actor_account'], ...data.audit.map((x) => [x.created_at, x.action, x.owner_email, x.actor_email, x.actor_account])];
      return new NextResponse(rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="titolare-audit.csv"' } });
    }
    return NextResponse.json(data);
  }
  // Use the server-only service role for append-only access logging; never
  // import this branch in preview, where Supabase must remain untouched.
  const { supabaseAdmin: supabase } = await import('@/lib/supabase');
  const [owner, history, audit] = await Promise.all([
    supabase.from('titular_records').select('*').eq('is_current', true).single(),
    supabase.from('titular_history').select('*').order('valid_from', { ascending: false }),
    supabase.from('titular_audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
  ]);
  if (owner.error || history.error || audit.error) return NextResponse.json({ error: 'Tabelle titolare non disponibili: applicare la migrazione SQL manualmente.' }, { status: 503 });
  await supabase.from('titular_audit_logs').insert({
    action: request.nextUrl.searchParams.get('export') ? 'OWNER_EXPORTED' : 'OWNER_VIEWED',
    owner_id: owner.data?.id,
    owner_email: owner.data?.email,
    actor_email: auth.actor.email,
    actor_account: 'admin',
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    metadata: { access_log: true, export: request.nextUrl.searchParams.get('export') || null },
  });
  if (request.nextUrl.searchParams.get('export') === 'json') return NextResponse.json({ owner: owner.data, history: history.data, audit: audit.data, exported_at: new Date().toISOString() });
  if (request.nextUrl.searchParams.get('export') === 'csv') {
    const rows = [['created_at', 'action', 'owner_email', 'actor_email', 'actor_account'], ...(audit.data || []).map((x: any) => [x.created_at, x.action, x.owner_email, x.actor_email, x.actor_account])];
    return new NextResponse(rows.map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="titolare-audit.csv"' } });
  }
  return NextResponse.json({ owner: owner.data, history: history.data, audit: audit.data });
}

export async function POST(request: NextRequest) {
  const auth = await authorized();
  if (!auth) return NextResponse.json({ error: 'Password admin e password titolare richieste' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (displayName.length < 2 || displayName.length > 120) {
    return NextResponse.json({ error: 'Inserisci un nome titolare valido' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Inserisci un indirizzo email valido' }, { status: 400 });
  }

  if (process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true') {
    return NextResponse.json(updatePreviewTitolar(displayName, email, auth.actor.email));
  }

  const { supabaseAdmin: supabase } = await import('@/lib/supabase');
  const now = new Date().toISOString();
  const { data: current, error: currentError } = await supabase
    .from('titular_records')
    .select('*')
    .eq('is_current', true)
    .single();
  if (currentError) return NextResponse.json({ error: 'Titolare corrente non disponibile' }, { status: 503 });

  const { error: historyError } = await supabase.from('titular_history').insert({
    ...current,
    valid_to: now,
    changed_at: now,
  });
  if (historyError) return NextResponse.json({ error: 'Impossibile salvare lo storico precedente' }, { status: 503 });

  const { data: next, error: updateError } = await supabase
    .from('titular_records')
    .update({ display_name: displayName, email, valid_from: now, created_at: now })
    .eq('id', current.id)
    .select()
    .single();
  if (updateError) return NextResponse.json({ error: 'Impossibile aggiornare il titolare' }, { status: 503 });

  await supabase.from('titular_audit_logs').insert({
    action: 'OWNER_CHANGED',
    owner_id: next.id,
    owner_email: next.email,
    actor_email: auth.actor.email,
    actor_account: 'admin',
    metadata: { previous_owner_email: current.email, previous_owner_name: current.display_name },
  });
  return NextResponse.json({ owner: next });
}
