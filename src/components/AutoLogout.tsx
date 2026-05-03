'use client';

import { useEffect } from 'react';

export default function AutoLogout() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      document.cookie
        .split(';')
        .forEach((c) => {
          const name = c.trim().split('=')[0];
          if (name.includes('supabase') || name.includes('sb-')) {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
          }
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
