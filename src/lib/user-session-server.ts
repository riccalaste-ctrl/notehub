'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { USER_SESSION_COOKIE, isAllowedUserEmail } from '@/lib/user-session';

export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  if (!(await isAllowedUserEmail(data.user.email))) return null;

  return data.user;
}
