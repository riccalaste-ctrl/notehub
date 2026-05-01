import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { createProfessorOAuthUrl, GoogleDriveConfigError } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const professorId = request.nextUrl.searchParams.get('professorId');

  if (!professorId) {
    return NextResponse.json({ error: 'Missing professorId' }, { status: 400 });
  }

  const { data: professor, error } = await supabaseAdmin
    .from('professors')
    .select('id')
    .eq('id', professorId)
    .maybeSingle();

  if (error) {
    console.error('Professor lookup error:', error);
    return NextResponse.json({ error: 'Unable to verify professor' }, { status: 500 });
  }

  if (!professor) {
    return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
  }

  try {
    return NextResponse.redirect(createProfessorOAuthUrl(professorId, request));
  } catch (error) {
    if (error instanceof GoogleDriveConfigError) {
      return NextResponse.json(
        { error: 'Google OAuth non configurato. Imposta GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET.' },
        { status: 500 }
      );
    }

    console.error('Google Drive connect error:', error);
    return NextResponse.json({ error: 'Unable to start Google OAuth flow' }, { status: 500 });
  }
}
