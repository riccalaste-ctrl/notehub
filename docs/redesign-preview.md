# NoteHub redesign preview

La branch `redesign-preview` è isolata da `main`.

## Avvio locale

1. Copiare `.env.local.preview.example` in `.env.local.preview`.
2. Inserire solo credenziali demo/locali.
3. Eseguire `npm run preview`.
4. Aprire `http://localhost:3001`.

`PREVIEW_BYPASS_AUTH=true` viene accettato esclusivamente in sviluppo locale; middleware e API lo rifiutano su Vercel/Netlify/production.

## Verifica

`npm run verify:preview` esegue typecheck, i controlli di isolamento preview e la build Next.js.

## Sicurezza

- La password Admin resta distinta dalla password Titolare.
- La sessione Titolare usa un token HttpOnly separato e a durata breve.
- Il nome dell'autore viene derivato dall'identità Google autenticata, non da un campo client modificabile.
- Ban/sospensioni bloccano creazione, invio chunk e completamento upload.
- I log di audit vengono conservati per 90 giorni.
- Il cleanup automatico è schedulato ogni giorno tramite Vercel Cron e protetto da `CRON_SECRET`.

## Dati legali dinamici

I dati del titolare, i contatti e le versioni delle policy sono gestiti da `site_settings`. Le pagine legali li rileggono dinamicamente, quindi non serve modificare il codice quando i dati cambiano.

Prima dell'uso pubblico applicare `scripts/security-redesign.sql` al database Supabase e inserire i dati reali tramite l'area Admin.


## Segnalazioni documento
Per l'invio automatico delle segnalazioni è necessario configurare su Vercel `RESEND_API_KEY` e `RESEND_FROM_EMAIL`. L'indirizzo destinatario è invece modificabile dinamicamente dall'area Admin nel campo "Email per le segnalazioni".
