import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  exchangeAndSaveProfessorTokens,
  getAppUrl,
  verifyProfessorOAuthState,
} from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

function redirectToAdmin(request: NextRequest, status: 'success' | 'error', message: string) {
  const url = new URL('/admin', getAppUrl(request));
  url.searchParams.set('drive', status);
  url.searchParams.set('message', message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const oauthError = request.nextUrl.searchParams.get('error');

  if (oauthError) {
    return redirectToAdmin(request, 'error', `Google OAuth: ${oauthError}`);
  }

  if (!code || !state) {
    return redirectToAdmin(request, 'error', 'Callback Google incompleta');
  }

  try {
    const { professorId } = verifyProfessorOAuthState(state);
    await exchangeAndSaveProfessorTokens(code, professorId, request);
    return redirectToAdmin(request, 'success', 'Drive collegato correttamente');
  } catch (error) {
    console.error('Google Drive OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Errore durante il collegamento Drive';
    return redirectToAdmin(request, 'error', message);
  }
}
