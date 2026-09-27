export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function isLocalPreview() {
  return process.env.PREVIEW_BYPASS_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.VERCEL !== '1' &&
    process.env.NETLIFY !== 'true';
}

export function requireServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getJwtSecret(): string {
  const value = process.env.JWT_SECRET?.trim();

  if (value) {
    if (value.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    return value;
  }

  // Backward-compatible fallback for deployments that already have the
  // admin bcrypt hash configured but are missing the separate JWT secret.
  // The hash is server-only and is never sent to the client.
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (adminPasswordHash && adminPasswordHash.length >= 32) {
    return `notehub-admin-session:${adminPasswordHash}`;
  }

  throw new Error('Missing required environment variable: JWT_SECRET');
}
