import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export function requireAuth() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}