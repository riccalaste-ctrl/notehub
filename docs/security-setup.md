# NoteHub Security Setup

## 1) Google Cloud Console (OAuth)

1. Vai su [Google Cloud Console](https://console.cloud.google.com/) e crea/seleziona un progetto.
2. Apri **APIs & Services -> OAuth consent screen**:
   - User type: **External** (o Internal se disponibile nel tuo Workspace).
   - App name: `NoteHub`.
   - Aggiungi dominio autorizzato se richiesto.
3. Apri **Credentials -> Create Credentials -> OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URI locale: `http://localhost:3000/api/auth/callback`
   - Authorized redirect URI produzione: `https://<tuo-dominio>/api/auth/callback`
4. Copia `Client ID` e `Client Secret`.
5. In Supabase Dashboard:
   - Auth -> Providers -> Google -> abilita provider.
   - Inserisci Client ID/Secret di Google.
   - In Auth -> URL Configuration imposta Site URL e Redirect URLs coerenti con quelle sopra.

## 2) Variabili ambiente Vercel

Imposta queste variabili in Vercel (Production/Preview/Development):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (es. `https://notehub.vercel.app`)
- `APP_URL` (stesso valore in produzione)
- `ALLOWED_EMAIL_DOMAIN=liceoscacchibari.it`
- `ADMIN_PASSWORD`

Password admin consigliata (forte, pronta da incollare):

`Nh!2026#Admin$Secure%Panel^A9`

## 3) SQL Supabase (tabelle + RLS)

Esegui in SQL Editor il contenuto di:

- `scripts/security-auth-rls.sql`

Questo script crea/aggiorna:

- `site_settings`
- `audit_logs`
- `uploads.owner_id`
- `drive_upload_sessions.owner_id`
- Policy RLS owner-based su `uploads` e `drive_upload_sessions`

## 4) Verifica sicurezza

1. Login con account `@liceoscacchibari.it` -> accesso consentito.
2. Login con dominio diverso -> redirect con errore dominio.
3. Upload file con utente A.
4. Con utente B prova DELETE su `/api/user/my-uploads/{id}` del file A -> deve ricevere `403`.
5. Da admin:
   - aggiorna `support_email` in `/admin`;
   - scarica PDF audit log;
   - elimina globalmente un file.
