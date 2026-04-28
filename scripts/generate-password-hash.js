#!/usr/bin/env node
/**
 * Script helper per generare password hash per Vercel
 * Utilizzo: npm run generate-password-hash
 */

import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n🔐 NoteHub Password Hash Generator\n');
  
  const password = await prompt('Inserisci password admin (min 8 caratteri): ');
  
  if (password.length < 8) {
    console.error('❌ La password deve avere almeno 8 caratteri');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n✅ Hash generato con successo!\n');
    console.log('📋 Copia questo valore in Vercel:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
    console.log('📍 Visita: https://vercel.com/dashboard/settings/environment-variables\n');
    
  } catch (error) {
    console.error('❌ Errore nella generazione dell\'hash:', error);
    process.exit(1);
  }
  
  rl.close();
}

main();
