import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.includes('.');
  if (isStaticAsset) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options, maxAge: 0 });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.getSession();

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
    pathname === '/auth/callback' ||
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/auth/callback',
    '/materie/:path*',
    '/consigli',
    '/i-miei-appunti',
    '/api/files',
    '/api/upload/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
  ],
};
