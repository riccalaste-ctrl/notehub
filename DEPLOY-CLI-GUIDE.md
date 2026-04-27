# DEPLOY CON VERCEL CLI - GUIDA PASSO PASSO

Questa guida ti porta da zero a sito online, senza toccare GitHub.

---

## PASSO 1: Verifica di avere Node.js

1. Apri PowerShell
2. Scrivi questo comando:
```powershell
node --version
```

3. Se vedi qualcosa come `v20.x.x`, è installato - vai al **PASSO 2**

4. Se dice errore, devi installare Node.js:
   - Vai su **[nodejs.org](https://nodejs.org)**
   - Clicca il pulsante verde **"20.x.x LTS"** (Recommended for most users)
   - Installalo
   - Riapri PowerShell
   - Riprova `node --version`

---

## PASSO 2: Installa Vercel CLI

1. In PowerShell, scrivi:
```powershell
npm install -g vercel
```

2. Aspetta che finisca (vedrai il cursore che gira)

3. Per verificare, scrivi:
```powershell
vercel --version
```

Se funziona, vedrai qualcosa come `vercel 37.x.x`

---

## PASSO 3: Accedi a Vercel

1. In PowerShell, scrivi:
```powershell
vercel login
```

2. Si aprirà una pagina nel browser
3. Scegli come accedere (GitHub, email, ecc.)
4. Autorizza l'accesso
5. Torna su PowerShell - dovrebbe dire `Logged in successfully`

---

## PASSO 4: Prepara le credenziali Supabase

Prima di fare il deploy, devi avere queste 4 informazioni da Supabase:

1. Vai su **[supabase.com](https://supabase.com)**
2. Accedi al tuo progetto
3. Clicca **Settings** (ingranaggio) > **API**
4. Copia questi tre valori:

```
A) Project URL (es: https://xxxxx.supabase.co)
B) anon public key
C) service_role key
```

5. La password admin sarà: `NoteHub2026!`

---

## PASSO 5: Fai il deploy!

Ora sei pronto. Esegui questi passaggi:

### 5.1 Vai nella cartella del progetto

```powershell
cd "C:\Users\Utente1\Desktop\New project"
```

### 5.2 Esegui vercel

```powershell
vercel
```

### 5.3 Rispondi alle domande

**Q1: "Set up and deploy?"**
- Scrivi: `Y`
- Premi Invio

**Q2: "Which scope?"**
- Seleziona il tuo account Vercel (o creane uno se non c'è)
- Premi Invio

**Q3: "Link to existing project?"**
- Scrivi: `N`
- Premi Invio

**Q4: "What's your project's name?"**
- Scrivi: `notehub`
- Premi Invio

**Q5: "In which directory is your project?"**
- Scrivi: `.`
- Premi Invio

**Q6: "Want to modify these settings?"**
- Scrivi: `N`
- Premi Invio

### 5.4 Aspetta il deploy

Vedrai una barra che avanza. Aspetta 1-2 minuti.

Se tutto va bene, vedrai:
```
🔗  Deployment URL: https://notehub-xxxx.vercel.app
```

**COPIA E SALVA QUESTO URL!**

---

## PASSO 6: Configura le variabili ambiente

Il sito è deployato, ma non si connette ancora al database. Devi aggiungere le credenziali:

### 6.1 Vai su Vercel

1. Vai su **[vercel.com](https://vercel.com)**
2. Accedi
3. Clicca sul progetto **notehub**
4. Clicca **Settings** nel menu in alto

### 6.2 Aggiungi le variabili

1. Nel menu a sinistra, clicca **Environment Variables**

2. Aggiungi una alla volta:

**Variabile 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: il tuo Project URL di Supabase (senza virgolette)
- Click **Add**

**Variabile 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: la chiave anon public
- Click **Add**

**Variabile 3:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: la chiave service_role
- Click **Add**

**Variabile 4:**
- Name: `ADMIN_PASSWORD`
- Value: `NoteHub2026!`
- Click **Add**

3. In basso, clicca **Save**

### 6.3 Fai il redeploy

1. Vai su **Deployments** nel menu in alto
2. Clicca sui **tre punti** accanto al deploy più recente
3. Clicca **Redeploy**
4. Aspetta 1-2 minuti

---

## PASSO 7: Verifica che funziona

1. Apri il tuo URL: `https://notehub-xxxx.vercel.app`
2. Dovresti vedere la homepage di NoteHub
3. Prova ad andare su `https://notehub-xxxx.vercel.app/admin/login`
4. Login con password: `NoteHub2026!`

---

## SEGUI IL DEPLOY LOCALE (opzionale)

Se vuoi anche testare il sito in locale:

```powershell
vercel dev
```

Poi apri `http://localhost:3000`

---

## PROSSIMI PASSI

Ora che il sito è online:
1. Segui la guida `SETUP-GUIDE.md` per configurare le materie su Google Drive
2. Crea i bridge Apps Script per ogni materia
3. Configura tutto nell'admin

---

**Problemi?** Fammi sapere cosa succede a ogni passaggio!