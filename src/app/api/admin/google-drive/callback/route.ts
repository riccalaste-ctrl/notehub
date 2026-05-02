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
  url.searchParams.set('message', encodeURIComponent(message));
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const oauthError = request.nextUrl.searchParams.get('error');
  const errorDescription = request.nextUrl.searchParams.get('error_description');

  if (oauthError) {
    let message = `Google OAuth Error: ${oauthError}`;
    if (errorDescription) {
      message = decodeURIComponent(errorDescription);
    }
    return redirectToAdmin(request, 'error', message);
  }

  if (!code || !state) {
    return redirectToAdmin(request, 'error', 'Callback Google incompleta: codice o state mancante');
  }

  try {
    const { professorId } = verifyProfessorOAuthState(state);
    await exchangeAndSaveProfessorTokens(code, professorId, request);
    return redirectToAdmin(request, 'success', 'Drive collegato correttamente');
  } catch (error) {
    console.error('Google Drive OAuth callback error:', error);
    const message = error instanceof Error 
      ? error.message 
      : 'Errore sconosciuto durante il collegamento di Google Drive. Riprova.';
    return redirectToAdmin(request, 'error', message);
  }
}
