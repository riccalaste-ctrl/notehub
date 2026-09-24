'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isAllowedUserEmail, isPreviewAuthBypassEnabled } from '@/lib/user-session';

export async function getAuthenticatedUserFromCookies() {
  if (isPreviewAuthBypassEnabled) {
    return {
      id: 'preview-user',
      email: 'preview@liceoscacchibari.it',
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  if (!(await isAllowedUserEmail(session.user.email))) return null;

  return session.user;
}
