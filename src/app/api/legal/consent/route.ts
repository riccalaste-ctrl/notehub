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
    .eq('key', 'legal_policy_updated_at')
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
  if (!body?.accepted || body.policyAccepted !== true || body.cookiesAccepted !== true || body.version !== version) {
    return NextResponse.json({ error: 'Versione policy non valida' }, { status: 400 });
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
