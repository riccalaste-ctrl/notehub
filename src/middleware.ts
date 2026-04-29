import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';
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

  // Protect all /admin page routes (but NOT /admin-login)
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdminRoute) {
    const adminToken = request.cookies.get(ADMIN_JWT_COOKIE);

    if (!adminToken || !(await verifyAdminToken(adminToken.value))) {
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Require authentication for admin API routes (excluding login and verify-password)
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
