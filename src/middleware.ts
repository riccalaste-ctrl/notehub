import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteggi le route admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('notehub_admin_jwt');

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Reindirizza POST non autorizzati verso logout
  if (pathname.startsWith('/api/admin') && request.method === 'POST') {
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
    // Match admin routes
    '/admin/:path*',
    // Match API admin routes
    '/api/admin/:path*',
  ],
};
