import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { encryptSecret, verifySignedState } from '@/lib/secure-tokens';
import { createGoogleOAuthClient, getGoogleOAuthRedirectUri } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function getOrCreateFolder(auth: InstanceType<typeof google.auth.OAuth2>, name: string, parentId?: string | null): Promise<string> {
  const drive = google.drive({ version: 'v3', auth });
  const escaped = name.replace(/'/g, "\\'");
  const parentClause = parentId ? `'${parentId}' in parents` : "'root' in parents";

  const existing = await drive.files.list({
    q: `mimeType='${FOLDER_MIME}' and name='${escaped}' and trashed=false and ${parentClause}`,
    fields: 'files(id)',
    pageSize: 1,
  });

  const folder = existing.data.files?.[0];
  if (folder?.id) return folder.id;

  const created = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: parentId ? [parentId] : undefined },
    fields: 'id',
  });

  return created.data.id!;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/admin?tab=consigli&error=oauth_failed', requestUrl.origin));
  }

  try {
    const payload = verifySignedState<{ type: string }>(state);
    if (payload.type !== 'consigli_drive') {
      throw new Error('Invalid state type');
    }

    const redirectUri = getGoogleOAuthRedirectUri();
    const oauth2Client = createGoogleOAuthClient(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    let refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      const { data: existing } = await supabaseAdmin
        .from('consigli_drive_connections')
        .select('encrypted_refresh_token')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.encrypted_refresh_token) {
        const { decryptSecret } = await import('@/lib/secure-tokens');
        refreshToken = decryptSecret(existing.encrypted_refresh_token);
      }
    }

    if (!refreshToken) {
      throw new Error('No refresh token. Revoke app access from Google and retry.');
    }

    oauth2Client.setCredentials({ ...tokens, refresh_token: refreshToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) throw new Error('No email from Google');

    const rootFolderId = await getOrCreateFolder(oauth2Client, 'SKAKK-UP Consigli');
    const now = new Date().toISOString();

    const { data: existingConn } = await supabaseAdmin
      .from('consigli_drive_connections')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let connection;
    if (existingConn) {
      const { data } = await supabaseAdmin
        .from('consigli_drive_connections')
        .update({
          google_email: userInfo.email,
          encrypted_refresh_token: encryptSecret(refreshToken),
          encrypted_access_token: tokens.access_token ? encryptSecret(tokens.access_token) : null,
          access_token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          root_folder_id: rootFolderId,
          status: 'connected',
          last_error: null,
          updated_at: now,
        })
        .eq('id', existingConn.id)
        .select()
        .single();
      connection = data;
    } else {
      const { data } = await supabaseAdmin
        .from('consigli_drive_connections')
        .insert({
          google_email: userInfo.email,
          encrypted_refresh_token: encryptSecret(refreshToken),
          encrypted_access_token: tokens.access_token ? encryptSecret(tokens.access_token) : null,
          access_token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          root_folder_id: rootFolderId,
          status: 'connected',
          last_error: null,
          connected_at: now,
          updated_at: now,
        })
        .select()
        .single();
      connection = data;
    }

    return NextResponse.redirect(new URL('/admin?tab=consigli&drive_connected=true', requestUrl.origin));
  } catch (error) {
    console.error('Consigli Drive callback error:', error);
    return NextResponse.redirect(new URL(`/admin?tab=consigli&error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown')}`, requestUrl.origin));
  }
}
