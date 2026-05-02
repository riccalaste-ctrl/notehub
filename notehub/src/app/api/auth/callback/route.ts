import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'Endpoint dismesso. Usa /api/admin/google-drive/callback.' },
    { status: 410 }
  );
}
