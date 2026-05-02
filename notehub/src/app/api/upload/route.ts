import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint dismesso. Usa /api/upload/session e /api/upload/complete.' },
    { status: 410 }
  );
}
