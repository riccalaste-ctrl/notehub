import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback`;
  console.log('[AUTH] Starting Google OAuth. redirectTo:', redirectTo);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    console.error('[AUTH] OAuth start error:', error);
    return { error: error.message };
  }

  return { error: null };
}

export function buildInstitutionDisclaimer(supportEmail?: string) {
  const fallbackEmail = supportEmail || 'support@liceoscacchibari.it';
  return `Gli amministratori non sono responsabili dei file caricati ma si impegnano a rimuovere contenuti vietati segnalati alla mail ${fallbackEmail}.`;
}
