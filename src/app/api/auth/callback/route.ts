import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/';
  const url = new URL('/auth/callback', request.nextUrl.origin);
  url.search = request.nextUrl.search;
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}
