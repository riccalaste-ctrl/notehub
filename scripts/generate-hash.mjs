#!/usr/bin/env node
import bcrypt from 'bcryptjs';

const password = 'NoteHub2026!';

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('ADMIN_PASSWORD_HASH=' + hash);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateHash();
