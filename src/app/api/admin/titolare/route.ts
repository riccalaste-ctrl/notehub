import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEVELOPER_EMAILS } from '@/lib/constants';
import { getPreviewTitolarData, recordPreviewTitolarAccess, updatePreviewTitolar, verifyTitolarToken, TITOLARE_COOKIE } from '@/lib/titolare-auth';

async function authorized() {
  const titular = await verifyTitolarToken((await cookies()).get(TITOLARE_COOKIE)?.value);
  if (!titular) return null;
  return { actor: { email: titular.email.trim().toLowerCase(), role: 'admin' as const }, titular };
}

export async function GET(request: NextRequest) {
  const auth = await authorized();
  if (!auth) return NextResponse.json({ error: 'Autenticazione Titolare richiesta' }, { status: 401 });

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

  const { supabaseAdmin: supabase } = await import('@/lib/supabase');
  const [owner, history, audit] = await Promise.all([
    supabase.from('titular_records').select('*').eq('is_current', true).maybeSingle(),
    supabase.from('titular_history').select('*').order('valid_from', { ascending: false }),
    supabase.from('titular_audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
  ]);
  if (owner.error || history.error || audit.error) {
    console.error('[titolare] Failed to load titular data', { owner: owner.error?.message, history: history.error?.message, audit: audit.error?.message });
    return NextResponse.json({ error: 'Tabelle titolare non disponibili: applicare la migrazione SQL manualmente.' }, { status: 503 });
  }

  await supabase.from('titular_audit_logs').insert({
    action: request.nextUrl.searchParams.get('export') ? 'OWNER_EXPORTED' : 'OWNER_VIEWED',
    owner_id: owner.data?.id,
    owner_email: owner.data?.email,
    actor_email: auth.actor.email,
    actor_account: 'institutional_user',
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
  if (!auth) return NextResponse.json({ error: 'Autenticazione Titolare richiesta' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const consentAccepted = body.consent_accepted === true;
  const actorEmail = auth.actor.email;
  const developerTestAccount = DEVELOPER_EMAILS.some((item) => item.toLowerCase() === actorEmail);

  if (displayName.length < 2 || displayName.length > 120) {
    return NextResponse.json({ error: 'Inserisci un nome titolare valido' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Inserisci un indirizzo email valido' }, { status: 400 });
  }

  if (!developerTestAccount && email !== actorEmail) {
    return NextResponse.json({
      error: 'Per assumere il ruolo di Titolare devi inserire la stessa email dell’account istituzionale con cui stai effettuando la modifica.',
    }, { status: 403 });
  }

  if (!consentAccepted) {
    return NextResponse.json({
      error: 'Devi leggere e accettare l’accordo di assunzione dell’incarico prima di confermare il nuovo Titolare.',
    }, { status: 400 });
  }

  if (process.env.PREVIEW_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true') {
    return NextResponse.json(updatePreviewTitolar(displayName, email, actorEmail, true));
  }

  const { supabaseAdmin: supabase } = await import('@/lib/supabase');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const { data: next, error } = await supabase.rpc('change_titular_owner', {
    p_display_name: displayName,
    p_email: email,
    p_actor_email: actorEmail,
    p_ip: ip,
    p_consent_accepted: true,
  });

  if (error) {
    console.error('[titolare] Atomic owner change failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json({ error: 'Impossibile aggiornare il Titolare. Lo storico precedente non è stato modificato.' }, { status: 503 });
  }

  return NextResponse.json({ owner: next });
}
