import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Richiedi autenticazione per API admin (escluso login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const adminToken = request.cookies.get('notehub_admin_jwt');
    
    if (!adminToken) {
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
