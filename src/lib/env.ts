const DEV_JWT_SECRET = 'development-secret-key-min-32-chars-long';

export function isProduction() {
  return process.env.NODE_ENV === 'production';
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

  if (!value) {
    if (isProduction()) {
      throw new Error('Missing required environment variable: JWT_SECRET');
    }
    return DEV_JWT_SECRET;
  }

  if (value.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return value;
}
