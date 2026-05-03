import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { google } from 'googleapis';
import { randomBytes } from 'crypto';
import { encryptSecret, decryptSecret, createSignedState, verifySignedState } from '@/lib/secure-tokens';
import { createGoogleOAuthClient, getGoogleOAuthRedirectUri, getDriveViewUrl, getDriveDownloadUrl, sanitizeDriveFileName, isAllowedUploadMimeType, ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, DriveNotConnectedError } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const CONSIGLI_DRIVE_ROOT = 'SKAKK-UP Consigli';
const DRIVE_OAUTH_SCOPES = ['https://www.googleapis.com/auth/drive.file', 'openid', 'email'];
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

interface ConsigliDriveConnection {
  id: string;
  google_email: string;
  encrypted_refresh_token: string | null;
  encrypted_access_token: string | null;
  access_token_expires_at: string | null;
  root_folder_id: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

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

  if (!created.data.id) throw new Error('No folder id returned');
  return created.data.id;
}

async function fetchConsigliDriveConnection(): Promise<ConsigliDriveConnection> {
  const { data, error } = await supabaseAdmin
    .from('consigli_drive_connections')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status !== 'connected' || !data.encrypted_refresh_token) {
    throw new DriveNotConnectedError('Drive non collegato per i consigli. Configuralo dalla sezione admin.');
  }

  return data as ConsigliDriveConnection;
}

async function getAuthorizedConsigliDrive() {
  const connection = await fetchConsigliDriveConnection();
  const oauth2Client = createGoogleOAuthClient(getGoogleOAuthRedirectUri());
  const refreshToken = decryptSecret(connection.encrypted_refresh_token!);
  const expiresAt = connection.access_token_expires_at
    ? new Date(connection.access_token_expires_at).getTime()
    : 0;

  if (connection.encrypted_access_token && expiresAt > Date.now() + TOKEN_REFRESH_WINDOW_MS) {
    const accessToken = decryptSecret(connection.encrypted_access_token);
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken, expiry_date: expiresAt });
    return { auth: oauth2Client, accessToken, connection };
  }

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const tokenResponse = await oauth2Client.getAccessToken();
  const accessToken = tokenResponse.token;
  if (!accessToken) throw new Error('No access token');

  const expiryDate = oauth2Client.credentials.expiry_date || Date.now() + 3600 * 1000;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from('consigli_drive_connections')
    .update({
      encrypted_access_token: encryptSecret(accessToken),
      access_token_expires_at: new Date(expiryDate).toISOString(),
      status: 'connected',
      last_error: null,
      updated_at: now,
    })
    .eq('id', connection.id);

  return { auth: oauth2Client, accessToken, connection };
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from('consigli_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ files: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const consiglioId = formData.get('consiglio_id') as string;

    if (!file || !consiglioId) {
      return NextResponse.json({ error: 'File e consiglio sono obbligatori' }, { status: 400 });
    }

    if (!isAllowedUploadMimeType(file.type)) {
      return NextResponse.json({ error: 'Tipo file non consentito' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: 'File troppo grande' }, { status: 400 });
    }

    const { auth, accessToken, connection } = await getAuthorizedConsigliDrive();

    let rootFolderId = connection.root_folder_id;
    if (!rootFolderId) {
      rootFolderId = await getOrCreateFolder(auth, CONSIGLI_DRIVE_ROOT);
      await supabaseAdmin
        .from('consigli_drive_connections')
        .update({ root_folder_id: rootFolderId, updated_at: new Date().toISOString() })
        .eq('id', connection.id);
    }

    const consiglioFolderId = await getOrCreateFolder(auth, `Consiglio ${consiglioId}`, rootFolderId);

    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
      name: sanitizeDriveFileName(file.name),
      mimeType: file.type,
      parents: [consiglioFolderId],
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveFile = await drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType: file.type, body: buffer as unknown as any },
      fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    });

    const fileId = driveFile.data.id!;
    await drive.permissions.create({
      fileId,
      requestBody: { type: 'anyone', role: 'reader', allowFileDiscovery: false },
      fields: 'id',
    });

    const { data: inserted, error } = await supabaseAdmin
      .from('consigli_files')
      .insert({
        consiglio_id: consiglioId,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        drive_file_id: fileId,
        download_url: getDriveDownloadUrl(fileId),
        view_url: getDriveViewUrl(fileId),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ file: inserted }, { status: 201 });
  } catch (error) {
    console.error('Upload consiglio file error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('file_id');

    if (!fileId) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const { data: fileData, error: fetchError } = await supabaseAdmin
      .from('consigli_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    try {
      const { auth } = await getAuthorizedConsigliDrive();
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.delete({ fileId: fileData.drive_file_id });
    } catch {
      console.warn('Failed to delete from Drive, continuing with DB delete');
    }

    const { error: deleteError } = await supabaseAdmin
      .from('consigli_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'connect') {
      const redirectUri = getGoogleOAuthRedirectUri();
      const oauth2Client = createGoogleOAuthClient(redirectUri);
      const state = createSignedState({
        type: 'consigli_drive',
        nonce: randomBytes(16).toString('base64url'),
        exp: Date.now() + 10 * 60 * 1000,
      });

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: DRIVE_OAUTH_SCOPES,
        state,
      });

      return NextResponse.json({ authUrl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
  }
}
