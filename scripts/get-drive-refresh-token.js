/**
 * Script per ottenere il Google Drive Refresh Token
 * 
 * Istruzioni:
 * 1. Configura le variabili GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET sotto
 * 2. Esegui: node scripts/get-drive-refresh-token.js
 * 3. Apri l'URL nel browser e autorizza l'app
 * 4. Incolla il codice ricevuto per ottenere il refresh token
 * 
 * ? Come reperire i dati:
 * - Client ID e Secret: Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
 * - Redirect URI: http://localhost:3000/api/auth/callback
 */

const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n=== GOOGLE DRIVE REFRESH TOKEN GENERATOR ===\n');
console.log('1. Apri questo URL nel browser:');
console.log('\x1b[36m%s\x1b[0m', authUrl);
console.log('\n2. Autorizza l\'app e copia il codice dalla URL di redirect');
console.log('   (dopo ?code=)\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('3. Incolla il codice qui: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('\nErrore:', err.message);
      rl.close();
      return;
    }

    console.log('\n=== SUCCESSO ===\n');
    console.log('REFRESH_TOKEN:');
    console.log('\x1b[33m%s\x1b[0m', token.refresh_token);
    console.log('\nAggiungi questo token alle variabili d\'ambiente:');
    console.log('GOOGLE_DRIVE_REFRESH_TOKEN=' + token.refresh_token);
    console.log('\nAccess Token (scade tra ~1 ora):');
    console.log(token.access_token);

    rl.close();
  });
});
