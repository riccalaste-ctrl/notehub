import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { jwtVerify } from 'jose';

const ADMIN_JWT_COOKIE = 'notehub_admin_jwt';
const DEV_JWT_SECRET = 'development-secret-key-min-32-chars-long';

function getJwtSecretBytes() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === 'production') return null;
    return new TextEncoder().encode(DEV_JWT_SECRET);
  }

  if (secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

function isUnsafeMethod(method: string) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const jwtSecret = getJwtSecretBytes();
    if (!jwtSecret) return false;

    const { payload } = await jwtVerify(token, jwtSecret);
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
  const isCookieBackedMutation =
    isUnsafeMethod(request.method) &&
    (
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/user') ||
      pathname === '/api/auth/logout'
    );

  if (isCookieBackedMutation && !hasSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (pathname.startsWith('/api/admin') && !isPublicAdminAPI) {
    const adminToken = request.cookies.get(ADMIN_JWT_COOKIE);

    if (!adminToken || !(await verifyAdminToken(adminToken.value))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  if (pathname === '/admin') {
    const adminToken = request.cookies.get(ADMIN_JWT_COOKIE);

    if (!adminToken || !(await verifyAdminToken(adminToken.value))) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('auth_required', '1');
      return NextResponse.redirect(loginUrl);
    }
  }

  const isPublicPath =
    pathname === '/login' ||
    pathname === '/auth/callback' ||
    pathname === '/privacy-policy' ||
    pathname === '/cookie-policy' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
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
    '/api/auth/logout',
    '/api/admin/:path*',
    '/admin',
  ],
};
