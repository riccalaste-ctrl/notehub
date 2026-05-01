import { google } from 'googleapis';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { createSignedState, decryptSecret, encryptSecret, verifySignedState } from '@/lib/secure-tokens';

export const DRIVE_ROOT_FOLDER_NAME = 'SKAKK-UP';

export const DRIVE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'openid',
  'email',
];

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024;

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;
const UPLOAD_SESSION_TTL_MS = 60 * 60 * 1000;

export class DriveNotConnectedError extends Error {
  constructor(message = 'Drive non collegato per questo professore. Contatta l\'amministratore.') {
    super(message);
    this.name = 'DriveNotConnectedError';
  }
}

export class GoogleDriveConfigError extends Error {
  constructor(message = 'Google OAuth non configurato') {
    super(message);
    this.name = 'GoogleDriveConfigError';
  }
}

interface OAuthState {
  professorId: string;
  nonce: string;
  exp: number;
}

interface DriveConnection {
  id: string;
  professor_id: string;
  google_email: string;
  google_account_id: string | null;
  encrypted_refresh_token: string | null;
  encrypted_access_token: string | null;
  access_token_expires_at: string | null;
  root_folder_id: string | null;
  status: 'connected' | 'disconnected' | 'error';
  last_error: string | null;
}

interface AuthorizedDrive {
  auth: InstanceType<typeof google.auth.OAuth2>;
  accessToken: string;
  connection: DriveConnection;
}

interface SubjectFolderInput {
  professorId: string;
  subjectId: string;
  subjectName: string;
  authorized: AuthorizedDrive;
}

interface ResumableUploadInput {
  accessToken: string;
  folderId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export function isAllowedUploadMimeType(mimeType: string): boolean {
  return ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType);
}

export function sanitizeDriveFileName(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || `file-${Date.now()}`;
}

export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${encodeURIComponent(fileId)}&export=download`;
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

export function getAppUrl(request?: Request): string {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  const forwardedHost = request?.headers.get('x-forwarded-host');
  const host = forwardedHost || request?.headers.get('host');
  if (host) {
    const proto = request?.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}

export function getGoogleOAuthRedirectUri(request?: Request): string {
  return `${getAppUrl(request)}/api/admin/google-drive/callback`;
}

export function createGoogleOAuthClient(redirectUri: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GoogleDriveConfigError();
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function createProfessorOAuthUrl(professorId: string, request: Request): string {
  const redirectUri = getGoogleOAuthRedirectUri(request);
  const oauth2Client = createGoogleOAuthClient(redirectUri);
  const state = createSignedState({
    professorId,
    nonce: randomBytes(16).toString('base64url'),
    exp: Date.now() + 10 * 60 * 1000,
  });

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: DRIVE_OAUTH_SCOPES,
    state,
  });
}

export function verifyProfessorOAuthState(state: string): OAuthState {
  const payload = verifySignedState<OAuthState>(state);

  if (!payload.professorId || typeof payload.professorId !== 'string') {
    throw new Error('Invalid OAuth state professor');
  }

  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error('OAuth state expired');
  }

  return payload;
}

function getDrive(auth: InstanceType<typeof google.auth.OAuth2>) {
  return google.drive({ version: 'v3', auth });
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function getOrCreateFolder(
  auth: InstanceType<typeof google.auth.OAuth2>,
  name: string,
  parentId?: string | null
): Promise<string> {
  const drive = getDrive(auth);
  const escapedName = escapeDriveQueryValue(name);
  const parentClause = parentId ? `'${parentId}' in parents` : "'root' in parents";

  const existing = await drive.files.list({
    q: `mimeType='${FOLDER_MIME_TYPE}' and name='${escapedName}' and trashed=false and ${parentClause}`,
    fields: 'files(id, name)',
    pageSize: 1,
  });

  const existingFolder = existing.data.files?.[0];
  if (existingFolder?.id) return existingFolder.id;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME_TYPE,
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  });

  if (!created.data.id) {
    throw new Error('Google Drive did not return a folder id');
  }

  return created.data.id;
}

export async function exchangeAndSaveProfessorTokens(
  code: string,
  professorId: string,
  request: Request
): Promise<DriveConnection> {
  const redirectUri = getGoogleOAuthRedirectUri(request);
  const oauth2Client = createGoogleOAuthClient(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);

  let refreshToken = tokens.refresh_token || null;

  if (!refreshToken) {
    const { data: existing } = await supabaseAdmin
      .from('professor_drive_connections')
      .select('encrypted_refresh_token')
      .eq('professor_id', professorId)
      .maybeSingle();

    if (existing?.encrypted_refresh_token) {
      refreshToken = decryptSecret(existing.encrypted_refresh_token);
    }
  }

  if (!refreshToken) {
    throw new Error('Google non ha restituito un refresh token. Revoca l\'accesso dell\'app dal tuo account Google e riprova.');
  }

  oauth2Client.setCredentials({
    ...tokens,
    refresh_token: refreshToken,
  });

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();

  if (!userInfo.email) {
    throw new Error('Account Google non valido: email mancante');
  }

  const rootFolderId = await getOrCreateFolder(oauth2Client, DRIVE_ROOT_FOLDER_NAME);
  const now = new Date().toISOString();

  const { data: connection, error } = await supabaseAdmin
    .from('professor_drive_connections')
    .upsert(
      {
        professor_id: professorId,
        google_email: userInfo.email,
        google_account_id: userInfo.id || null,
        encrypted_refresh_token: encryptSecret(refreshToken),
        encrypted_access_token: tokens.access_token ? encryptSecret(tokens.access_token) : null,
        access_token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        root_folder_id: rootFolderId,
        status: 'connected',
        last_error: null,
        connected_at: now,
        disconnected_at: null,
        updated_at: now,
      },
      { onConflict: 'professor_id' }
    )
    .select('*')
    .single();

  if (error) throw error;

  return connection as DriveConnection;
}

async function fetchDriveConnection(professorId: string): Promise<DriveConnection> {
  const { data, error } = await supabaseAdmin
    .from('professor_drive_connections')
    .select('*')
    .eq('professor_id', professorId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status !== 'connected' || !data.encrypted_refresh_token) {
    throw new DriveNotConnectedError();
  }

  return data as DriveConnection;
}

export async function getAuthorizedDriveForProfessor(professorId: string): Promise<AuthorizedDrive> {
  const connection = await fetchDriveConnection(professorId);
  const oauth2Client = createGoogleOAuthClient(getGoogleOAuthRedirectUri());
  const refreshToken = decryptSecret(connection.encrypted_refresh_token!);
  const expiresAt = connection.access_token_expires_at
    ? new Date(connection.access_token_expires_at).getTime()
    : 0;

  if (
    connection.encrypted_access_token &&
    expiresAt > Date.now() + TOKEN_REFRESH_WINDOW_MS
  ) {
    const accessToken = decryptSecret(connection.encrypted_access_token);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiresAt,
    });

    return { auth: oauth2Client, accessToken, connection };
  }

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const tokenResponse = await oauth2Client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error('Google did not return an access token');
    }

    const expiryDate = oauth2Client.credentials.expiry_date || Date.now() + 3600 * 1000;
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('professor_drive_connections')
      .update({
        encrypted_access_token: encryptSecret(accessToken),
        access_token_expires_at: new Date(expiryDate).toISOString(),
        status: 'connected',
        last_error: null,
        updated_at: now,
      })
      .eq('id', connection.id);

    connection.encrypted_access_token = encryptSecret(accessToken);
    connection.access_token_expires_at = new Date(expiryDate).toISOString();
    connection.status = 'connected';
    connection.last_error = null;

    return { auth: oauth2Client, accessToken, connection };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to refresh Google token';

    await supabaseAdmin
      .from('professor_drive_connections')
      .update({
        status: 'error',
        last_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    throw new DriveNotConnectedError('Collegamento Drive non valido o scaduto. Ricollega Drive dal pannello admin.');
  }
}

export async function getOrCreateSubjectFolder({
  subjectId,
  subjectName,
  authorized,
}: SubjectFolderInput): Promise<string> {
  const { auth, connection } = authorized;
  let rootFolderId = connection.root_folder_id;

  if (!rootFolderId) {
    rootFolderId = await getOrCreateFolder(auth, DRIVE_ROOT_FOLDER_NAME);
    await supabaseAdmin
      .from('professor_drive_connections')
      .update({
        root_folder_id: rootFolderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
    connection.root_folder_id = rootFolderId;
  }

  const { data: cachedFolder } = await supabaseAdmin
    .from('professor_drive_folders')
    .select('id, folder_id')
    .eq('connection_id', connection.id)
    .eq('subject_id', subjectId)
    .maybeSingle();

  if (cachedFolder?.folder_id) {
    try {
      const drive = getDrive(auth);
      const existing = await drive.files.get({
        fileId: cachedFolder.folder_id,
        fields: 'id, trashed',
      });

      if (existing.data.id && !existing.data.trashed) {
        return cachedFolder.folder_id;
      }
    } catch {
      // Recreate below if the cached folder was removed from Drive.
    }
  }

  const folderId = await getOrCreateFolder(auth, sanitizeDriveFileName(subjectName), rootFolderId);

  await supabaseAdmin
    .from('professor_drive_folders')
    .upsert(
      {
        connection_id: connection.id,
        professor_id: connection.professor_id,
        subject_id: subjectId,
        folder_id: folderId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'connection_id,subject_id' }
    );

  return folderId;
}

export async function createResumableUploadSession({
  accessToken,
  folderId,
  filename,
  mimeType,
  sizeBytes,
}: ResumableUploadInput): Promise<string> {
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,webContentLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': String(sizeBytes),
      },
      body: JSON.stringify({
        name: sanitizeDriveFileName(filename),
        mimeType,
        parents: [folderId],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to create Google upload session (${response.status})`);
  }

  const uploadUrl = response.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Google did not return a resumable upload URL');
  }

  return uploadUrl;
}

export function getUploadSessionExpiry(): string {
  return new Date(Date.now() + UPLOAD_SESSION_TTL_MS).toISOString();
}

export async function verifyAndShareDriveFile(
  auth: InstanceType<typeof google.auth.OAuth2>,
  fileId: string,
  folderId: string,
  expectedSizeBytes: number
) {
  const drive = getDrive(auth);
  const file = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink, parents, trashed',
  });

  if (!file.data.id || file.data.trashed) {
    throw new Error('File Drive non trovato');
  }

  if (!file.data.parents?.includes(folderId)) {
    throw new Error('Il file caricato non appartiene alla cartella prevista');
  }

  if (file.data.size && Number(file.data.size) !== expectedSizeBytes) {
    throw new Error('La dimensione del file Drive non coincide con la sessione');
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'anyone',
      role: 'reader',
      allowFileDiscovery: false,
    },
    fields: 'id',
  });

  const sharedFile = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  });

  return sharedFile.data;
}

export async function revokeProfessorDriveConnection(professorId: string): Promise<void> {
  const { data: connection } = await supabaseAdmin
    .from('professor_drive_connections')
    .select('*')
    .eq('professor_id', professorId)
    .maybeSingle();

  if (!connection) return;

  if (connection.encrypted_refresh_token) {
    try {
      const oauth2Client = createGoogleOAuthClient(getGoogleOAuthRedirectUri());
      await oauth2Client.revokeToken(decryptSecret(connection.encrypted_refresh_token));
    } catch (error) {
      console.warn('Unable to revoke Google token:', error);
    }
  }

  await supabaseAdmin
    .from('drive_upload_sessions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('professor_id', professorId)
    .eq('status', 'pending');

  await supabaseAdmin
    .from('professor_drive_connections')
    .update({
      encrypted_refresh_token: null,
      encrypted_access_token: null,
      access_token_expires_at: null,
      status: 'disconnected',
      last_error: null,
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);
}
