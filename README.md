# NoteHub

Piattaforma web gratuita per condividere appunti scolastici tra studenti.

## Caratteristiche

- Upload e download appunti senza login
- Organizzazione per materia e professore
- Ricerca e filtri avanzati
- Pannello admin per gestione
- Storage su Google Drive multipli
- Architettura serverless su Vercel

## Stack Tecnologico

- **Frontend + Backend**: Next.js 15 (App Router)
- **Database**: Supabase Free
- **Storage**: Google Drive (tramite Apps Script bridge)
- **Hosting**: Vercel Free
- **Styling**: Tailwind CSS

## Prerequisiti

- Node.js 20+
- Account Supabase
- Account Google (per Drive)

## Setup Locale

### 1. Clona il repository

```bash
git clone <repo-url>
cd notehub
```

### 2. Installa dipendenze

```bash
npm install
```

### 3. Configura variabili ambiente

Copia `.env.example` in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD_HASH=your_bcrypt_admin_password_hash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Database Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Vai in **SQL Editor**
3. Esegui il contenuto di `scripts/supabase-schema.sql`
4. Recupera le credenziali da **Settings > API**

### 5. Avvia server locale

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000)

## Deploy su Vercel

### 1. Push su GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuo-repo/notehub.git
git push -u origin main
```

### 2. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository
3. In **Environment Variables** aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (URL Vercel)
4. Clicca **Deploy**

Il deploy è automatico ad ogni push su main.

## Setup Google Apps Script Bridge

Per ogni materia che vuoi gestire su un account Drive separato:

### 1. Crea la cartella Drive

1. Apri [drive.google.com](https://drive.google.com)
2. Crea una cartella per gli appunti (es: "Appunti Matematica")
3. Copia l'ID dalla URL: `drive.google.com/drive/folders/QUESTO-QUESTO-QUESTO`

### 2. Crea Google Apps Script

1. Apri [script.google.com](https://script.google.com)
2. Crea nuovo progetto
3. Incolla il codice da `scripts/gas-bridge.js`
4. Modifica le variabili all'inizio:
   - `FOLDER_ID`: ID della cartella Drive
   - `SECRET`: password sicura per l'upload

### 3. Deploy Web App

1. Clicca **Deploy** > **New deployment**
2. Seleziona **Web app**
3. Compila:
   - Description: "NoteHub Bridge"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Clicca **Deploy**
5. Copia l'URL del web app

### 4. Configura la materia nell'admin

1. Accedi a `/admin`
2. Vai su **Materie**
3. Aggiungi la materia:
   - Nome: "Matematica"
   - Slug: "matematica"
   - GAS Web App URL: (URL ricevuto dal deploy)
   - GAS Secret: (Secret inserito nello script)
   - Abilitata: spuntato

## Struttura del Progetto

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── admin/
│   │   ├── page.tsx          # Dashboard admin
│   │   └── login/page.tsx    # Login admin
│   └── api/
│       ├── upload/           # Upload file
│       ├── files/            # Lista file
│       └── admin/
│           ├── subjects/     # CRUD materie
│           ├─��� professors/   # CRUD professori
│           ├── uploads/      # Gestione upload
│           └── ...
├── components/               # Componenti React
├── lib/                      # Utility (Supabase, auth)
└── types/                    # TypeScript interfaces
```

## Utilizzo

### Per gli studenti

1. Vai sulla homepage
2. Cerca appunti per nome, materia, professore o data
3. Clicca "Carica" per inviare i tuoi appunti
4. Puoi scaricare o visualizzare i file

### Per l'admin

1. Accedi a `/admin`
2. Inserisci la password
3. Gestisci materie, professori e associazioni
4. Monitora i file caricati

## Sicurezza

- File limit: 20MB
- Tipi consentiti: PDF, DOC, DOCX, JPG, PNG
- Secret richiesto per ogni upload via bridge
- Sessione admin con cookie httpOnly

## Note

- L'app è pensata per rimanere online sempre con Vercel Free
- I file sono salvati su Google Drive dell'insegnante/admin
- Non servono account utente per gli studenti
- Il database Supabase Free ha limiti adeguati per un uso scolastico

## Licenza

MIT
