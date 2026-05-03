import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectTo = `${window.location.origin}/api/auth/callback`;
  console.log('[AUTH] Starting Google OAuth. redirectTo:', redirectTo);
  const { error } = await supabaseClient.auth.signInWithOAuth({
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
