import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'Failed to exchange code for tokens' }, { status: 500 });
  }
}
