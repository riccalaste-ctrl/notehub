import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const envFile = '.env.local.preview';
const env = { ...process.env };

if (existsSync(envFile)) {
  for (const rawLine of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
}

env.NODE_ENV = 'development';
env.PREVIEW_BYPASS_AUTH = 'true';
env.VERCEL = '';
env.NETLIFY = '';

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(command, ['exec', '--', 'next', 'dev', '-p', '3001'], {
  env,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
