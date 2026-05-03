'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { buildInstitutionDisclaimer } from '@/lib/user-session-client';

interface SettingsResponse {
  settings?: {
    support_email?: string;
    admin_email?: string;
  };
}

export default function LoginPage() {
  const [supportEmail, setSupportEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data: SettingsResponse) => {
        const email = data.settings?.support_email || data.settings?.admin_email || '';
        setSupportEmail(email);
      })
      .catch(() => {});
  }, []);

  const errorParam =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') : null;
  const errorMessage =
    errorParam === 'invalid_domain'
      ? 'Accesso consentito solo con email @liceoscacchibari.it.'
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neu-base px-4">
      <div className="max-w-md w-full neu-modal p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-neu-xl bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="size-8 text-[#6366F1]" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Accesso NoteHub</h1>
          <p className="text-foreground-light mt-2 text-sm">
            Accedi con Google istituzionale ({' '}
            <span className="font-semibold">@liceoscacchibari.it</span> )
          </p>
        </div>

        {errorMessage && (
          <div className="px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-neu mb-4">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            window.location.href = '/api/auth/google/login';
          }}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white font-semibold rounded-neu premium-transition disabled:opacity-60"
        >
          {loading ? 'Reindirizzamento...' : 'Accedi con Google'}
        </button>

        <p className="mt-6 text-xs text-foreground-light text-center leading-relaxed">
          {buildInstitutionDisclaimer(supportEmail)}
        </p>

        <div className="mt-4 text-center">
          <Link href="/admin" className="text-sm text-[#6366F1] hover:underline font-medium">
            Vai all&apos;area admin
          </Link>
        </div>
      </div>
    </div>
  );
}
