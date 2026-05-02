# GUIDA DEFINITIVA - DA ZERO A SITO ONLINE

## PARTE 1: PREPARE IL CODICE

### 1.1 Verifica la cartella

 Vai sul tuo Desktop e assicurati di avere una cartella chiamata **ESATTAMENTE**:

```
New project
```

(Senza spazi extra, senza "1")

Se hai dubbi, rinominala così.

---

### 1.2 Apri il progetto in VS Code

 1. Apri **Visual Studio Code**
 2. Clicca **File** > **Open Folder**
 3. Seleziona la cartella `New project` sul desktop
 4. Verifica che nella sidebar a sinistra vedi tanti file (package.json, src, ecc.)

---

## PARTE 2: GITHUB

### 2.1 Crea account GitHub (se non ce l'hai)

 1. Vai su **[github.com](https://github.com)**
 2. Clicca **Sign up**
 3. Inserisci email, password, username
 4. Segui le istruzioni

---

### 2.2 Crea il repository

 1. Loggati su GitHub.com
 2. Clicca **"+"** in alto a destra > **New repository**
 3. Compila:
    - **Repository name**: `notehub` (tutto minuscolo)
    - **Description**: `Piattaforma appunti scolastici`
 4. **NON** spuntare nulla di opzionale
 5. Clicca **Create repository**
 6. **NON chiudere questa pagina!** Lasciala aperta.

---

### 2.3 Collega il codice a GitHub

 1. Apri **GitHub Desktop** (sul PC)
 2. Clicca **Clone a repository**
 3. Clicca **URL** (in basso)
 4. Nella pagina GitHub che hai lasciato aperta:
    - Clicca il pulsante **verde "Code"**
    - Clicca l'icona **copia** accanto all'URL
 5. In GitHub Desktop, incolla l'URL
 6. Per **Local path**, clicca **Choose** e seleziona la cartella `New project` sul desktop
 7. Clicca **Clone**

---

### 2.4 Pubblica il codice

 1. In GitHub Desktop vedrai tutti i file
 2. In basso a sinistra, dove dice **Summary**, scrivi: `Primo commit`
 3. Clicca **Commit to main** (pulsante blu)
 4. Clicca **Publish repository** (in alto a destra)
 5. **Togli** la spunta da "Keep this code private"
 6. Clicca **Publish repository**

---

## PARTE 3: SUPABASE

### 3.1 Crea account Supabase

 1. Vai su **[supabase.com](https://supabase.com)**
 2. Clicca **Start your project**
 3. Clicca **Sign up with GitHub**
 4. Autorizza

---

### 3.2 Crea il progetto

 1. Clicca **New project**
 2. Compila:
    - **Organization**: lascia come sta
    - **Name**: `notehub`
    - **Database Password**: `NoteHub2026!`
    - **Confirm**: `NoteHub2026!`
    - **Region**: scegli **Frankfurt**
 3. Clicca **Create new project**
 4. **Aspetta 2 minuti**

---

### 3.3 Crea le tabelle

 1. Nella sidebar, clicca **SQL Editor**
 2. Clicca **New query**
 3. Apri il file `scripts/supabase-schema.sql` sul desktop
 4. Copia tutto il contenuto
 5. Incollalo nella casella bianca di Supabase
 6. Clicca **Run** (pulsante blu in basso)
 7. Vedrai messaggi verdi

---

### 3.4 Copia le credenziali

 1. Clicca **Settings** (ingranaggio) > **API**
 2. Trova **Project URL** e copia (senza /rest/v1/)
    - Esempio: `https://xxxxx.supabase.co`
  3. Sotto **Project API keys**, copia:
    - La chiave **anon public**
    - La chiave **service_role** (clicca "Reveal" se necessario)
 4. Salva tutto in un file di testo

---

## PARTE 4: VERCEL

### 4.1 Crea account Vercel

 1. Vai su **[vercel.com](https://vercel.com)**
 2. Clicca **Sign up**
 3. Clicca **Continue with GitHub**
 4. Autorizza

---

### 4.2 Importa il progetto

 1. Clicca **Add New** > **Project**
 2. Cerca `notehub` nella lista
 3. Clicca **Import** accanto a notehub

---

### 4.3 Configura il deploy

 Nella pagina che appare:

 1. **Project Name**: `notehub`
 2. Framework: deve dire **Next.js**
 3. **Environment Variables**: qui aggiungi le variabili

#### Aggiungi le variabili UNA PER UNA:

**Prima variabile:**
- KEY: `NEXT_PUBLIC_SUPABASE_URL`
- VALUE: `https://xxxxx.supabase.co` (il tuo URL da Supabase)
- Clicca **Add**

**Seconda variabile:**
- KEY: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- VALUE: (incolla la chiave anon da Supabase)
- Clicca **Add**

**Terza variabile:**
- KEY: `SUPABASE_SERVICE_ROLE_KEY`
- VALUE: (incolla la chiave service_role da Supabase)
- Clicca **Add**

**Quarta variabile:**
- KEY: `ADMIN_PASSWORD`
- VALUE: `NoteHub2026!`
- Clicca **Add**

 4. Clicca **Deploy** (pulsante viola in basso)

 5. **Aspetta 3 minuti** - vedrai una barra che avanza

---

### 4.4 Trova l'URL

 Quando finiscie, in alto vedrai:
 ```
 🔗 https://notehub-xxxxx.vercel.app
 ```

 **COPIA QUESTO URL!**

---

## PARTE 5: VERIFICA

 1. Apri l'URL che hai copiato
 2. Prova ad andare su: `TUO_URL/admin/login`
 3. Password: `NoteHub2026!`

 Se funziona, il sito è online!

---

## PASSO SUCCESSIVO

Il sito funziona ma serve configurare Google Drive per i file. Per ora puoi:
- Aggiungere materie nell'admin (senza bridge funzionerà solo parzialmente)

---

**SEGUI OGNI PASSO NUMERATO. NON SALTARE NULLA.**

**QUANDO SEI A UN PASSO, DIMMI COSA SUCCEDE PRIMA DI ANDARE AVANTI.**