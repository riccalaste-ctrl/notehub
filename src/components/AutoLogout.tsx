'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AutoLogout() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const handleBeforeUnload = () => {
      supabase.auth.signOut({ scope: 'local' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
