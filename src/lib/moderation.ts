import { supabaseAdmin } from '@/lib/supabase';

export type ModerationState = {
  blocked: boolean;
  status: 'banned' | 'suspended' | null;
  reason?: string | null;
  expiresAt?: string | null;
};

export async function getModerationState(email?: string | null): Promise<ModerationState> {
  if (!email) return { blocked: true, status: 'banned', reason: 'Account senza email verificabile' };

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from('bans')
    .select('status, reason, expires_at')
    .eq('email', normalizedEmail)
    .in('status', ['banned', 'suspended'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Fail closed: moderation must never be bypassed because the moderation table
    // is unavailable or the schema has not yet been applied.
    throw new Error('Impossibile verificare lo stato di moderazione');
  }

  if (!data) return { blocked: false, status: null };

  const expired = data.expires_at && new Date(data.expires_at).getTime() <= Date.now();
  if (expired) return { blocked: false, status: null };

  return {
    blocked: true,
    status: data.status,
    reason: data.reason || null,
    expiresAt: data.expires_at || null,
  };
}

export function getUploaderDisplayName(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }) {
  const metadata = user.user_metadata || {};
  const fullName =
    (typeof metadata.full_name === 'string' && metadata.full_name.trim()) ||
    (typeof metadata.name === 'string' && metadata.name.trim());

  if (fullName) return fullName.slice(0, 100);

  const localPart = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return localPart ? localPart.slice(0, 100) : null;
}
