const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

interface DriveFile {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export function initGoogleApi(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiInited) {
      resolve();
      return;
    }

    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: '',
          discoveryDocs: [DISCOVERY_DOC],
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: () => {},
        });

        gapiInited = true;
        resolve();
      });
    };
    script1.onerror = () => reject(new Error('Failed to load gapi script'));
    document.head.appendChild(script1);

    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script2 = document.createElement('script');
      script2.src = 'https://accounts.google.com/gsi/client';
      script2.onerror = () => reject(new Error('Failed to load GSI client'));
      document.head.appendChild(script2);
    }
  });
}

export function signInWithGoogle(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (resp: google.accounts.oauth2.TokenResponse) => {
          if (resp.error) {
            reject(new Error(resp.error));
            return;
          }
          resolve(resp.access_token);
        },
      });
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function getAccessToken(): string | null {
  return gapi.client.getToken()?.access_token || null;
}

export function signOutGoogle(): void {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken(null);
    });
  }
}

export async function uploadFile(
  file: File,
  folderId: string,
  onProgress?: (percent: number) => void
): Promise<DriveFile> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated with Google Drive');

  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          fileId: result.id,
          webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
          webContentLink: result.webContentLink || `https://drive.google.com/uc?id=${result.id}&export=download`,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.send(form);
  });
}

export function getDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}

export function getPreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export async function deleteFile(fileId: string): Promise<void> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated with Google Drive');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}
