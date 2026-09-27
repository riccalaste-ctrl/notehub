import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { isPreviewMode, previewSettings } from '@/lib/preview-data';
import { supabaseAdmin } from '@/lib/supabase';

const CONSENT_COOKIE = 'notehub_privacy_consent';

async function getPolicyVersion() {
  if (isPreviewMode) return previewSettings.legal_policy_updated_at || 'preview-policy-v1';

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'privacy_policy_version')
    .maybeSingle();

  return data?.value?.trim() || 'policy-v1';
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  const version = await getPolicyVersion();
  const accepted = request.cookies.get(CONSENT_COOKIE)?.value === version;
  return NextResponse.json({ authenticated: true, accepted, version });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const version = await getPolicyVersion();
  // The server is authoritative for the current policy version. The client
  // may omit an old/missing version because the consent must never get stuck
  // simply because the public-settings/GET request was unavailable or stale.
  if (body?.accepted !== true || body.policyAccepted !== true || body.cookiesAccepted !== true) {
    return NextResponse.json({ error: 'È necessario accettare entrambe le policy' }, { status: 400 });
  }

  if (!isPreviewMode) {
    const { error } = await supabaseAdmin.from('legal_consents').upsert({
      user_id: user.id,
      email_snapshot: user.email || 'unknown',
      policy_version: version,
      privacy_accepted: true,
      cookie_policy_accepted: true,
      accepted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,policy_version' });
    if (error) {
      // A missing/outdated consent table must not make the whole site unusable.
      // The consent cookie below is still bound to the server-side policy version.
      console.error('[LEGAL CONSENT] Impossibile salvare il consenso nel database:', error);
    }
  }

  const response = NextResponse.json({ accepted: true, version });
  response.cookies.set(CONSENT_COOKIE, version, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')),
    sameSite: 'lax',
    path: '/',
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const origin = request.headers.get('origin');
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  if (!origin || (appUrl && origin !== appUrl)) {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 403 });
  }
  const response = NextResponse.json({ accepted: false });
  response.cookies.set(CONSENT_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || Boolean(process.env.APP_URL?.startsWith('https://')), sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
