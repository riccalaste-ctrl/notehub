import { NextResponse } from 'next/server';
import { clearUserSessionCookie } from '@/lib/user-session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearUserSessionCookie(response);
  return response;
}
