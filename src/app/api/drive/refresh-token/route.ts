import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json({ error: 'Missing subjectId' }, { status: 400 });
    }

    const { data: subject, error } = await supabaseAdmin
      .from('subjects')
      .select('google_client_id, google_client_secret, google_drive_refresh_token')
      .eq('id', subjectId)
      .single();

    if (error || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (!subject.google_client_id || !subject.google_client_secret || !subject.google_drive_refresh_token) {
      return NextResponse.json({ error: 'Google Drive not configured for this subject' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      subject.google_client_id,
      subject.google_client_secret,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    );

    oauth2Client.setCredentials({
      refresh_token: subject.google_drive_refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    return NextResponse.json({
      access_token: credentials.access_token,
      expires_in: credentials.expiry_date
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
        : 3600,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
