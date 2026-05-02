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
    '/api/admin/:path*',
  ],
};
