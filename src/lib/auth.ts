import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';
const USER_JWT_COOKIE = 'notehub_user_jwt';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_JWT_COOKIE)?.value;
  
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload !== null && payload.role === 'admin';
}

export async function isUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_JWT_COOKIE)?.value;

  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload !== null;
}

export async function getUserFromToken(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_JWT_COOKIE)?.value;
  const userToken = cookieStore.get(USER_JWT_COOKIE)?.value;
  const token = adminToken || userToken;

  if (!token) return null;

  return await verifyJWT(token);
}

export async function setAdminCookie(jwt: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_JWT_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_JWT_COOKIE);
  cookieStore.delete(USER_JWT_COOKIE);
}

export async function requireAdmin(): Promise<NextResponse | undefined> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
}

export async function requireAuth(): Promise<NextResponse | undefined> {
  const isAuth = (await isUserAuthenticated()) || (await isAdminAuthenticated());
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
