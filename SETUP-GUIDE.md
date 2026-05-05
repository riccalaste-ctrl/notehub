# NOTEHUB - GUIDA COMPLETA AL DEPLOY E CONFIGURAZIONE

Questa guida ti spiega passo per passo come mettere online NoteHub e far funzionare tutto. Ogni click, ogni operazione, tutto quanto.

---

## FASE 1: PREPARE IL PROGETTO

### 1.1 Crea account GitHub (se non hai)

1. Vai su **[github.com](https://github.com)**
2. Clicca **"Sign up"** in alto a destra
3. Inserisci:
   - Email (quella che usi di solito)
   - Password (minimo 8 caratteri)
   - Username (il tuo nome online, es: `notehub-scuola`)
4. Clicca **"Create account"**
5. Rispondi alle domande che ti fanno (puoi saltare)
6. Verifica la tua email cliccando il link che ti hanno mandato

### 1.2 Carica il progetto su GitHub

1. Ora vai su **[github.com/new](https://github.com/new)**
2. Dove dice **"Repository name"** scrivi: `notehub`
3. Dove dice **"Description"** scrivi: "Piattaforma per condividere appunti scolastici"
4. Lascia tutto il resto come sta
5. Clicca il pulsante verde **"Create repository"**
6. Arrivato nella pagina vuota del repository, scrolla in basso
7. Vedrai un riquadro che dice **"push an existing repository from command line"**
8. Apri il terminale (PowerShell) sul tuo computer
9. Nella cartella del progetto NoteHub, esegui questi comandi (uno alla volta):

```powershell
git init
git add .
git commit -m "Primo commit - NoteHub"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/notehub.git
git push -u origin main
```

**ATTENZIONE: Al posto di "TUO_USERNAME" metti il tuo username GitHub!**

10. Refresha la pagina GitHub e vedrai tutti i file caricati!

---

## FASE 2: CREA ACCOUNT SUPABASE

### 2.1 Registrati a Supabase

1. Vai su **[supabase.com](https://supabase.com)**
2. Clicca **"Start your project"** (pulsante grande in centro)
3. Clicca il bottone **"Sign up with GitHub"**
4. Nella finestra che appare, autorizza Supabase cliccando **"Authorize"**

### 2.2 Crea un nuovo progetto

1. Nella dashboard che appare, clicca **"New project"** (pulsante blu)
2. Compila i campi uno per uno:
   
   - **Organization**: lascia quella che c'è già (il tuo username GitHub)
   
   - **Name**: scrivi `notehub` (tutto minuscolo)
   
   - **Database Password**: genera una password forte e conservala in modo sicuro
   
   - **Confirm Database Password**: riscrivi la password forte scelta
   
   - **Region**: clicca e scegli **Frankfurt (eu-central-1)** (è il più vicino all'Italia)

3. Clicca **"Create new project"** in basso
4. **ASPETTA 2-3 MINUTI** - vedrai una barra che carica, non chiudere la pagina!
5. Quando appare la dashboard, il progetto è pronto!

### 2.3 Recupera le credenziali (molto importante!)

1. Nella sidebar a sinistra, clicca l'**icona dell'ingranaggio** (Settings)
2. Nel menu che appare, clicca **API**
3. Vedrai tre campi con delle chiavi lunghe. Copiale tutte e incollale in un file di testo:

   - **Project URL** (il primo) → è il tuo `NEXT_PUBLIC_SUPABASE_URL`
   
   - **anon public** (in basso sotto "Project API keys") → è il tuo `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   - **service_role** (sotto anon, clicca prima su "Reveal" per vedere la chiave) → è il tuo `SUPABASE_SERVICE_ROLE_KEY`

4. Salva tutto in un file di testo, ti serviranno dopo!

### 2.4 Crea le tabelle del database

1. Nella sidebar a sinistra, clicca **SQL Editor** (icona con due parentesi > <)
2. Clicca **"New query"** (pulsante rosso in basso a destra)
3. Apri sul tuo computer il file `scripts/supabase-schema.sql` con il blocco note
4. Copia tutto il codice
5. Incollalo nella casella bianca di Supabase
6. Clicca il pulsante **"Run"** (pulsante blu in basso a destra della casella)
7. Vedrai tanti messaggi verdi che dicono "Success"
8. Per verificare che è andato a buon fine, nella sidebar clicca **Table Editor** (icona della tabella)
9. Vedrai elencate le tabelle: subjects, professors, subject_professors, uploads

---

## FASE 3: DEPLOY SU VERCEL

### 3.1 Registrati a Vercel

1. Vai su **[vercel.com](https://vercel.com)**
2. Clicca **"Sign up"**
3. Clicca **"Continue with GitHub"**
4. Autorizza Vercel cliccando **"Authorize"**

### 3.2 Importa il progetto

1. Nella dashboard Vercel, clicca **"Add New..."** in alto (vicino al logo Vercel)
2. Clicca **"Project"**
3. Nella casella di ricerca, scrivi `notehub` e premi invio
4. Clicca sul progetto **notehub** quando appare

### 3.3 Configura le variabili ambientali

Nella pagina che appare (Project Settings):

1. Scrolla in basso dove dice **"Environment Variables"**
2. Vedrai 5 righe vuote. Compilale una alla volta:

   **Riga 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: incolla il Project URL che hai copiato (es: `https://xxxxxx.supabase.co`)
   - Clicca il pulsante **Add** sulla destra

   **Riga 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: incolla la chiave anon public
   - Clicca **Add**

   **Riga 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: incolla la chiave service_role
   - Clicca **Add**

   **Riga 4:**
   - Name: `ADMIN_PASSWORD`
   - Value: l'hash generato con `npm run generate-password-hash`
   - Clicca **Add**

   **Riga 5:**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: (lascia vuoto, Vercel lo metterà da solo)
   - Clicca **Add**

3. Scrolla in basso e clicca **"Deploy"** (pulsante viola in basso)

### 3.4 Aspetta il deploy

1. Vedrai una schermata blu con una barra di progresso
2. **Aspetta 2-3 minuti** - non chiudere la pagina!
3. Quando appare il messaggio verde con il ticker "Ready", il sito è online!
4. Clicca il link in alto (qualcosa come `https://notehub-vercel-app.vercel.app`)
5. Prova ad aprire il sito - dovrebbe funzionare!

---

## FASE 4: CREA GLI ACCOUNT GOOGLE DRIVE

Per ogni materia che vuoi gestire, ti serve un account Google separato con una cartella Drive. Questo è il sistema Multi-Drive richiesto.

### 4.1 Creare un account Google (se non hai già)

1. Vai su **[accounts.google.com](https://accounts.google.com)**
2. Clicca **"Crea un account"**
3. Compila:
   - Nome: `NoteHub Fisica` (o il nome della materia)
   - Cognome: `Scuola`
   - Email: scegli `@gmail.com` e scrivi una email nuova (es: `notehubfisica@gmail.com`)
   - Password: scrivila e ricordala!
4. Segui i passaggi per verificare il numero di telefono

### 4.2 Creare la cartella Drive

1. Ora vai su **[drive.google.com](https://drive.google.com)** ed effettua l'accesso con il nuovo account
2. Sul lato sinistro trovi **"+ Nuovo"** (vicino a "Il mio Drive")
3. Clicca **"+ Nuovo"**
4. Clicca **"Nuova cartella"** nel menu
5. Dagli un nome: `Appunti Fisica` (usa il nome della materia)
6. Clicca **"Crea"**
7. **Fai doppio click** sulla cartella per aprirla
8. Oraguarda l'URL in alto nel browser:
   - L'URL sarà simile a: `https://drive.google.com/drive/folders/1abc123def456789`
   - La parte dopo `folders/` e prima di `?` è l'ID: `1abc123def456789`
9. **COPIA E SALVA QUESTO ID** - ti servirà dopo per configurare il bridge!

Ripeti questa fase (4.1 e 4.2) per ogni materia che vuoi aggiungere, creando ogni volta un account Google diverso.

---

## FASE 5: CREA GOOGLE APPS SCRIPT (IL BRIDGE)

Il bridge è il "traduttore" tra il tuo sito e Google Drive. Senza questo, i file non possono essere caricati.

### 5.1 Accedi a Google Apps Script

1. Apri una nuova scheda nel browser
2. Vai su **[script.google.com](https://script.google.com)**
3. Se non hai mai usato Apps Script, clicca **"Go to Apps Script"**
4. Clicca il pulsante blu **"Nuovo progetto"** in alto a sinistra

### 5.2 Inserisci il codice

1. Nella pagina che appare, vedrai un file chiamato `Code.gs` con del codice dentro
2. **Seleziona tutto** il codice esistente e **cancialo** (clicca dentro, poi Ctrl+A, poi Canc)
3. Apri sul tuo computer il file `scripts/gas-bridge.js` con il blocco note
4. **Copia tutto** il codice
5. **Incollalo** nella pagina di Apps Script

### 5.3 Configura le due variabili (fondamentale!)

Nel codice che hai incollato, proprio all'inizio, trovi queste due righe:

```javascript
const FOLDER_ID = 'LA_TUA_CARTELLA_ID_QUI';
const SECRET = 'il_tuo_segreto_sicuro_qui';
```

Devi modifica queste due righe con i tuoi dati:

**Prima riga ('LA_TUA_CARTELLA_ID_QUI'):**
- Al posto di `'LA_TUA_CARTELLA_ID_QUI'` metti l'ID della cartella Drive che hai copiato prima
- Esempio: `const FOLDER_ID = '1abc123def456789';`

**Seconda riga ('il_tuo_segreto_sicuro_qui'):**
- Al posto di `'il_tuo_segreto_sicuro_qui'` metti una password sicura (tue in maiuscole/minuscole, numeri)
- Esempio: `const SECRET = 'Fisica2026SuperSicuro!';`

**IMPORTANTE: Ricorda questa password SECRET, ti servirà dopo nell'admin!**

### 5.4 Deploy come Web App

1. In alto a destra,trovi un pulsante blu **"Deploy"** (accanto all'icona dell'orologio)
2. Clicca **"Deploy"**
3. Nel menu che appare, clicca **"New deployment"**
4. A sinistra, clicca l'**icona dell'ingranaggio** accanto a "Select type"
5. Nel menu, clicca **"Web app"**
6. Compila i campi:

   - **Description**: scrivi `NoteHub Bridge - Fisica` (o il nome della materia)
   
   - **Execute as**: clicca e scegli **"Me"**
   
   - **Who has access**: clicca e scegli **"Anyone"**

7. Clicca il pulsante blu **"Deploy"** in basso
8. Compare una finestra con un link - **COPIA QUESTO LINK!**
9. Clicca **"Done"** per chiudere

**Hai creato il bridge per la prima materia!**

### 5.5 Ripeti per altre materie

Se hai altre materie (es: Matematica, Informatica), ripeti dalla Fase 4 per creare un nuovo account Google + cartella, poi ripeti questa Fase 5 per creare un altro bridge con:
- FOLDER_ID diverso (corrispondente alla nuova cartella Drive)
- SECRET diverso (una password nuova)
- Nuovo URL di deploy

Ogni materia avrà il suo bridge separato!

---

## FASE 6: CONFIGURA IL SITO (AREA ADMIN)

Ora devi dire al sito come raggiungere i tuoi bridge e quali materie usare.

### 6.1 Accedi all'admin

1. Apri il tuo sito (quello su Vercel)
2. Nell'URL, aggiungi `/admin/login` alla fine
   - Esempio: `https://notehub-vercel-app.vercel.app/admin/login`
3. Vedrai una pagina di login
4. Password: usa la password admin forte scelta da voi
5. Clicca **"Accedi"**

### 6.2 Aggiungi le materie

1. Sei nella dashboard admin, già sulla tab **"Materie"**
2. Compila il modulo "Aggiungi materia":
   
   - **Nome materia**: scrivi `Fisica` (o il nome della materia)
   
   - **Slug**: scrivi `fisica` (tutto minuscolo, senza spazi, solo lettere e trattini)
   
   - **GAS Web App URL**: incolla l'URL del bridge che hai creato prima (quello di Apps Script che finisce con `/exec`)
   
   - **GAS Secret**: incolla la password SECRET che hai messo nel codice (`Fisica2026SuperSicuro!`)
   
   - **Abilitata**: spunta la casella

3. Clicca il pulsante **"Aggiungi"**

Ripeti per tutte le altre materie!

### 6.3 Aggiungi i professori

1. In alto, clicca sulla tab **"Professori"**
2. Nel modulo "Aggiungi professore":
   - **Nome**: scrivi `Prof. Rossi` (o il nome del professore)
3. Clicca **"Aggiungi"**

Ripeti per tutti i professori!

### 6.4 Collega professori alle materie

1. Clicca sulla tab **"Associazioni"**
2. Nel modulo:
   - **Seleziona materia**: scegli la materia dal menu
   - **Seleziona professore**: scegli il professore dal menu
3. Clicca **"Collega"**

Ripeti per tutte le coppie materia-professore!

### 6.5 Test del bridge

1. Clicca sulla tab **"Test Bridge"**
2. Vedrai l'elenco delle materie che hai configurato
3. Accanto ad ogni materia, clicca il pulsante **"Test"**
4. Se tutto funziona, vedrai un messaggio verde con scritto "Bridge OK!" e il numero di file

Se invece ricevi un errore, controlla che:
- L'URL del bridge sia corretto
- Il SECRET sia corretto
- Il bridge sia stato deploytato con accesso "Anyone"

---

## FASE 7: PROVA TUTTO!

### 7.1 Prova come studente

1. Torna alla home del sito (senza /admin)
2. Vedrai la homepage con la lista degli appunti (sarà vuota all'inizio)
3. Clicca il pulsante **"Carica"** in alto a destra
4. Si apre una finestra (modal):
   - **Il tuo nome**: scrivi il tuo nome (oppure lascia vuoto)
   - **Materia**: scegli una materia dal menu
   - **Professore**: scegli un professore (se hai creato associazioni)
   - **File**: clicca "Scegli file" e seleziona un file PDF, DOC, DOCX, JPG o PNG (max 20MB)
5. Clicca **"Carica"**
6. Aspetta qualche secondo - vedrai una scritta "Caricamento..."
7. Quando appare "Upload completato!", chiudi la finestra
8. Il file apparirà nella lista!

### 7.2 Verifica che il file sia su Drive

1. Vai su **[drive.google.com](https://drive.google.com)**
2. Accedi con l'account Google della materia
3. Apri la cartella degli appunti
4. Dovresti vedere il file che hai appena caricato!

### 7.3 Verifica nell'admin

1. Torna su `/admin`
2. Clicca sulla tab **"File caricati"**
3. Vedrai il file elencato con tutti i dettagli
4. Da qui puoi eliminarlo se necessario (pulsante "Elimina")

---

## DOMANDE FREQUENTI

### Come cambio la password admin?

1. Vai su **[vercel.com](https://vercel.com)** e accedi
2. Clicca sul tuo progetto NoteHub
3. Clicca **Settings** (icona dell'ingranaggio)
4. Clicca **Environment Variables** nel menu
5. Trova la riga `ADMIN_PASSWORD`
6. Clicca i tre puntini sulla destra e poi **Edit**
7. Cambia la password
8. Clicca **Save**
9. Vercel farà il redeploy automaticamente

### Devo fare qualcosa per mantenere il sito online?

**No!** Il sito rimane online da solo con Vercel Free. Non devi pagare nulla e non devi fare manutenzione.

### Posso usare un dominio mio invece di vercel.app?

**Sì!** In Vercel puoi collegare un dominio personalizzato (es: `appunti.miosito.it`). Devi:
1. Comprare il dominio (da Register.it, Aruba, Google Domains, ecc.)
2. In Vercel, andare su Settings > Domains
3. Aggiungere il dominio e seguire le istruzioni per configurare i DNS

### Quanto posso caricare?

- Ogni singolo file: **massimo 20MB**
- Tipi di file permessi: **PDF, DOC, DOCX, JPG, PNG**

---

## HAI FINITO!

Ora hai un sito completamente funzionante. Gli studenti possono:
- ✓ Caricare appunti
- ✓ Cercare appunti per nome, materia, professore
- ✓ Scaricare i file

E tu puoi gestire tutto dall'area admin:
- ✓ Aggiungere/modificare/eliminare materie
- ✓ Aggiungere/modificare/eliminare professori
- ✓ Collegare professori alle materie
- ✓ Vedere tutti i file caricati
- ✓ Eliminare file

Il sito rimarrà online per sempre all'indirizzo che ti ha dato Vercel. Gli aggiornamenti futuri (se vorrai fare modifiche estetiche o funzionali) basterà caricarli su GitHub e Vercel farà il deploy automaticamente!
