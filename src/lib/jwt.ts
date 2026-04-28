import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-key-min-32-chars-long'
);

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
    .sign(secret);

  return jwt;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function refreshJWT(token: string): Promise<string | null> {
  const payload = await verifyJWT(token);
  if (!payload) return null;

  return createJWT(payload.email, payload.role);
}
