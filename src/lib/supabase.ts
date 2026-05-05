import { createClient } from '@supabase/supabase-js';
import { requireServerEnv } from '@/lib/env';

const supabaseUrl = requireServerEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = requireServerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceKey = requireServerEnv('SUPABASE_SERVICE_ROLE_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
