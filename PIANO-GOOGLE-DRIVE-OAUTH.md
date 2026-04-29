# PIANO DI MIGRAZIONE: Upload/Download Client-side Google Drive OAuth

Data creazione: 29 Aprile 2026

---

## 0. ARCHITETTURA ATTUALE vs NUOVA

### ATTUALE (server-side, limitato):
```
Browser → Base64 → Vercel API (/api/upload) → Google Apps Script → Google Drive
                              ↓
                         Supabase (metadata)
```
- Limite 20MB per file (base64 + serverless timeout)
- Doppio hop (browser → Vercel → Drive)
- Dipendenza da Google Apps Script

### NUOVA (client-side, diretta):
```
Browser → OAuth Token → Google Drive API (upload diretto)
                    ↓
              Supabase (metadata + fileId + link)
```
- File va direttamente dal browser a Google Drive
- Niente limiti di dimensione oltre i 15GB del Drive
- Niente timeout serverless
- Google Apps Script non serve piu'

### Cosa scompare:
- Google Apps Script (GAS) per upload
- Base64 encoding dei file
- Hop server Vercel per il trasferimento file
- Limite 20MB di `/api/upload/route.ts`
- Campi `gas_url` e `gas_secret` dalla tabella `subjects`

### Cosa resta:
- Supabase per metadata (nomi, subject_id, drive_file_id, url)
- Vercel per hosting frontend + API routes leggere (metadata CRUD, token management)
- Google Drive per storage (15GB gratuiti)

---

## 1. SETUP GOOGLE CLOUD CONSOLE (una tantum)

### 1.1 Creare Progetto Google Cloud
1. Vai a https://console.cloud.google.com/
2. Crea nuovo progetto (es. "NoteHub-Drive")
3. Attiva Google Drive API

### 1.2 Configurare OAuth Consent Screen
- Tipo: Esterno (External)
- App name: NoteHub
- Support email: email dell'utente
- Scopes richiesti:
  - `https://www.googleapis.com/auth/drive.file` (solo file creati dall'app)
- Test users: aggiungere email degli studenti

### 1.3 Creare OAuth 2.0 Credentials
- Tipo: Web application
- Authorized JavaScript origins:
  - `http://localhost:3000` (sviluppo)
  - URL produzione Vercel
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback`
  - URL produzione + `/api/auth/callback`
- Salvare: `CLIENT_ID` e `CLIENT_SECRET`

### 1.4 Cartella Drive dedicata
1. Creare cartella su Google Drive (es. "NoteHub Uploads")
2. Copiare ID della cartella dall'URL
3. Salvare come `GOOGLE_DRIVE_FOLDER_ID`

### 1.5 Service Account (per token refresh lato server)
1. Google Cloud Console → IAM → Service Accounts → Crea nuovo
2. Creare chiave JSON → scaricare
3. Dalla chiave JSON estrarre: `client_email`, `private_key`
4. Condividere la cartella Drive "NoteHub Uploads" con l'email del service account (permessi di modifica)

### 1.6 Ottenere il Refresh Token (una tantum)
Eseguire script locale `scripts/get-drive-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('Apri questo URL nel browser:', authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Incolla il codice di autorizzazione: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) { console.error(err); return; }
    console.log('REFRESH_TOKEN:', token.refresh_token);
    rl.close();
  });
});
```

### 1.7 Variabili d'ambiente da aggiungere

In `.env.local` e nel dashboard Vercel:

```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_DRIVE_FOLDER_ID=1xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. NUOVI FILE DA CREARE

### 2.1 `src/lib/google-drive.ts` - Libreria client-side per Google Drive API

Responsabilita:
- Inizializzare gapi (Google API Client Library for JavaScript)
- Gestire il flow OAuth 2.0 nel browser
- Upload resumable diretto a Google Drive
- Generare link di download/view
- Gestire il token refresh automatico

Funzioni da implementare:

| Funzione | Cosa fa |
|----------|---------|
| `initGoogleApi()` | Carica gapi + gsi, ritorna Promise |
| `signInWithGoogle()` | Popup OAuth, ritorna access_token |
| `uploadFile(file, folderId)` | Upload diretto con resumable, ritorna {fileId, webViewLink, webContentLink} |
| `getDownloadLink(fileId)` | Genera URL di download diretto |
| `getPreviewUrl(fileId)` | Genera URL di anteprima nel browser |
| `deleteFile(fileId)` | Elimina file da Drive |

### 2.2 `src/app/api/auth/callback/route.ts` - Endpoint callback OAuth (server)

Cosa fa:
- Riceve il code dallo step OAuth del browser
- Scambia code per access_token + refresh_token
- Salva refresh_token in Supabase (tabella oauth_tokens)
- Restituisce access_token al frontend

### 2.3 `src/app/api/drive/refresh-token/route.ts` - Endpoint per refresh token (server)

Cosa fa:
- Quando il frontend ha un access_token scaduto, chiama questo endpoint
- Il server usa GOOGLE_DRIVE_REFRESH_TOKEN per ottenere un nuovo access_token
- Non espone mai il refresh_token al client

### 2.4 `src/components/GoogleDriveUploader.tsx` - Componente upload client-side

Stati UI:
- Stato 1: "Connetti Google Drive" (bottone OAuth)
- Stato 2: "Trascina file qui" (dropzone)
- Stato 3: Upload in corso (progress bar)
- Stato 4: Upload completato (check verde)

---

## 3. MODIFICHE AI FILE ESISTENTI

### 3.1 `src/app/api/upload/route.ts` - RIFARE COMPLETAMENTE

PRIMA: Riceve base64, forward a GAS, limite 20MB
DOPO: Riceve SOLO metadata (file e' gia' su Drive)

Nuovo schema:
```typescript
{
  subjectId: string (uuid),
  professorId?: string (uuid),
  uploaderName?: string,
  originalFilename: string,
  driveFileId: string,
  mimeType: string,
  sizeBytes: number,
  downloadUrl: string,
  viewUrl: string
}
```

### 3.2 `src/app/api/files/route.ts` - NESSUNA MODIFICA
Funziona gia bene. Querya Supabase per i metadata.

### 3.3 `public/index.html` - MODIFICARE SEZIONE UPLOAD
- Rimuovere: form upload attuale con input file + base64
- Sostituire con: GoogleDriveUploader component

### 3.4 `next.config.ts` - AGGIUNGERE DOMINI ESTERNI
Aggiungere a images.remotePatterns:
- `lh3.googleusercontent.com` (gia presente)
- `drive.google.com`
- `*.googleapis.com`

### 3.5 `package.json` - NUOVE DIPENDENZE
```
gapi-script: ^1.2.0
googleapis: ^144.0.0
```

---

## 4. DATABASE SUPABASE - NUOVE TABELLE / MODIFICHE

### 4.1 Tabella `oauth_tokens` (NUOVA)
```sql
CREATE TABLE oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'google_drive',
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4.2 Tabella `uploads` - CAMPI DA VERIFICARE
```sql
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS drive_file_id text;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS download_url text;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS view_url text;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS size_bytes bigint;
```

### 4.3 Tabella `subjects` - CAMPI DA RIMUOVERE (dopo migrazione)
```sql
-- gas_url text
-- gas_secret text
```

---

## 5. FLOW COMPLETI

### 5.1 Upload (nuovo)
1. Studente clicca "Carica"
2. Se non autenticato → Popup OAuth Google → access_token al frontend
3. Studente seleziona file
4. Frontend chiama Google Drive API DIRETTAMENTE (resumable upload)
5. Google ritorna: fileId, webViewLink, webContentLink
6. Frontend chiama `/api/upload` con SOLO i metadata
7. API salva in Supabase → ritorno OK
8. UI mostra successo

### 5.2 Download (nuovo)
1. Studente clicca "Scarica"
2. Frontend legge `webContentLink` da Supabase
3. Redirect diretto a: `https://drive.google.com/uc?id=FILE_ID&export=download`

### 5.3 Anteprima (nuovo)
1. Studente clicca "Anteprima"
2. Embed in iframe: `https://drive.google.com/file/d/FILE_ID/preview`

### 5.4 Token Refresh (automatico)
1. Access_token dura 1 ora
2. Dopo ~50 min, frontend chiama `/api/drive/refresh-token`
3. Server usa refresh_token → nuovo access_token → aggiorna Supabase
4. Frontend continua con nuovo token

---

## 6. ORDINE DI IMPLEMENTAZIONE

### Fase 1: Setup (1-2 ore)
- [ ] Creare progetto Google Cloud Console
- [ ] Attivare Drive API
- [ ] Configurare OAuth consent screen
- [ ] Creare OAuth credentials
- [ ] Creare cartella Drive, salvare folder_id
- [ ] Creare service account + ottenere refresh_token
- [ ] Aggiungere variabili d'ambiente a .env.local e Vercel

### Fase 2: Libreria Google Drive (2-3 ore)
- [ ] Creare src/lib/google-drive.ts
- [ ] Implementare initGoogleApi()
- [ ] Implementare signInWithGoogle()
- [ ] Implementare uploadFile() con resumable upload
- [ ] Implementare getDownloadLink() e getPreviewUrl()
- [ ] Test locale

### Fase 3: Backend API (1-2 ore)
- [ ] Creare src/app/api/auth/callback/route.ts
- [ ] Creare src/app/api/drive/refresh-token/route.ts
- [ ] Riscrivere src/app/api/upload/route.ts (solo metadata)
- [ ] Creare tabella oauth_tokens in Supabase
- [ ] Verificare schema uploads

### Fase 4: Frontend Upload (2-3 ore)
- [ ] Creare src/components/GoogleDriveUploader.tsx
- [ ] Integrare nella pagina principale
- [ ] UI: bottone OAuth → dropzone → progress bar → successo
- [ ] Collegare al salvataggio metadata in Supabase

### Fase 5: Download e Anteprima (1 ora)
- [ ] Modificare componente file card per usare link Drive diretti
- [ ] Test download diretto
- [ ] Test anteprima in iframe

### Fase 6: Migrazione e Cleanup (1 ora)
- [ ] Migrare file gia presenti (convertire vecchi fileId GAS)
- [ ] Rimuovere dipendenze GAS da subjects table
- [ ] Test end-to-end completo

### Fase 7: Deploy
- [ ] Push a GitHub
- [ ] Deploy su Vercel
- [ ] Verificare variabili d'ambiente su Vercel
- [ ] Test produzione

---

## 7. NOTE DI SICUREZZA

| Rischio | Mitigazione |
|---------|-------------|
| Client_ID esposto nel frontend | OK per OAuth pubblico, CLIENT_SECRET resta server-side |
| Access_token rubato | Dura 1 ora, scope limitato a drive.file |
| Refresh_token compromesso | Mai esposto al client, solo in env var + Supabase RLS |
| Upload malevoli | Validare mimeType e dimensione lato frontend prima dell'upload |
| Abuso Drive quota | 750GB/giorno, impossibile con 10-50 studenti |

---

## 8. STIMA TOTALE

| Fase | Tempo |
|------|-------|
| Setup Google Cloud | 1-2 ore |
| Libreria Drive | 2-3 ore |
| Backend API | 1-2 ore |
| Frontend Upload | 2-3 ore |
| Download/Anteprima | 1 ora |
| Migrazione/Cleanup | 1 ora |
| **TOTALE** | **8-12 ore** |
