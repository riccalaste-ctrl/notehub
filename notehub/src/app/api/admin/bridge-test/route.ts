import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gasUrl = searchParams.get('url');

    if (!gasUrl) {
      return NextResponse.json(
        { error: 'Missing GAS URL' },
        { status: 400 }
      );
    }

    const response = await fetch(gasUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bridge test error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to bridge' },
      { status: 500 }
    );
  }
}