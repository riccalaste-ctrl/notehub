import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function requireAuth(): Promise<NextResponse | undefined> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
