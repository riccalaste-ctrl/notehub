import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const required = [
  ['src/middleware.ts', 'NODE_ENV !=='],
  ['src/lib/preview-data.ts', 'PREVIEW_BYPASS_AUTH'],
  ['src/app/api/upload/session/route.ts', 'serviceRulesAccepted'],
  ['src/app/api/upload/chunk/route.ts', 'isPreviewMode'],
  ['src/app/api/upload/complete/route.ts', 'isPreviewMode'],
  ['src/lib/titolare-auth.ts', 'TITOLARE_COOKIE'],
  ['src/app/api/admin/titolare/auth/route.ts', 'checkTitolarRateLimit'],
  ['src/app/api/admin/titolare/route.ts', 'export'],
  ['scripts/create-titolare-tables.sql', 'prevent_titular_audit_mutation'],
];
for (const [file, text] of required) {
  if (!readFileSync(file, 'utf8').includes(text)) throw new Error(`Preview check failed: ${file}`);
}
const middleware = readFileSync('src/middleware.ts', 'utf8');
if (!middleware.includes('pathname.startsWith(\'/api/admin\')') || !middleware.includes('verifyAdminToken')) {
  throw new Error('Admin protection check failed');
}
execFileSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
console.log('Preview isolation, upload protection, and build checks passed.');
