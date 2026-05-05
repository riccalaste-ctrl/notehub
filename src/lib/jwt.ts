import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

function getSigningSecret() {
  return new TextEncoder().encode(getJwtSecret());
}

interface JWTPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

export async function createJWT(email: string, role: 'admin' | 'user' = 'user'): Promise<string> {
  const jwt = await new SignJWT({ email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSigningSecret());

  return jwt;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, getSigningSecret());
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function refreshJWT(token: string): Promise<string | null> {
  const payload = await verifyJWT(token);
  if (!payload) return null;

  return createJWT(payload.email, payload.role);
}
