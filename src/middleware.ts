import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';
const USER_JWT_COOKIE = 'notehub_user_jwt';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-key-min-32-chars-long'
);

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.includes('.');
  if (isStaticAsset) {
    return NextResponse.next();
  }

  const isPublicAdminAPI = pathname === '/api/admin/login' || pathname === '/api/admin/verify-password';
  if (pathname.startsWith('/api/admin') && !isPublicAdminAPI) {
    const adminToken = request.cookies.get(ADMIN_JWT_COOKIE);

    if (!adminToken || !(await verifyAdminToken(adminToken.value))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  const isPublicPath =
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/admin') ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/verify-password';
  const needsUserAuth =
    pathname === '/' ||
    pathname === '/materie' ||
    pathname.startsWith('/materie/') ||
    pathname === '/consigli' ||
    pathname === '/i-miei-appunti' ||
    pathname === '/api/files' ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/user/');

  if (needsUserAuth && !isPublicPath) {
    const userToken = request.cookies.get(USER_JWT_COOKIE)?.value;
    if (!userToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/materie/:path*',
    '/consigli',
    '/i-miei-appunti',
    '/api/files',
    '/api/upload/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
  ],
};
