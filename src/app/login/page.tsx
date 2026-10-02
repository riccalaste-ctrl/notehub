'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { buildInstitutionDisclaimer, signInWithGoogle } from '@/lib/user-session-client';

interface SettingsResponse { settings?: { support_email?: string; admin_email?: string } }

export default function LoginPage() {
  const [supportEmail, setSupportEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/settings').then((res) => res.json()).then((data: SettingsResponse) => {
      setSupportEmail(data.settings?.support_email || data.settings?.admin_email || '');
    }).catch(() => {});
    const errorParam = new URLSearchParams(window.location.search).get('error');
    if (errorParam) {
      setError(
        errorParam === 'invalid_domain' ? 'La tua email non è autorizzata all’accesso.'
        : errorParam === 'oauth_exchange_failed' ? 'Errore durante il login. Riprova.'
        : errorParam === 'policy_required' ? 'Leggi e accetta Privacy Policy e Regole del servizio per continuare.'
        : 'Errore di autenticazione. Riprova.'
      );
    }
  }, []);

  return (
    <main className="auth-stage min-h-screen px-4 py-8 sm:px-6">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="hidden lg:block">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-white">
            <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles className="size-5 text-cyan-200" />
            </span>
            SKAKK-UP
          </Link>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-cyan-200/70">Il tuo spazio di studio</p>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-[-.04em] text-white xl:text-6xl">
            Entra nel tuo
            <span className="text-gradient-purple"> workspace.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-foreground-muted">
            Accedi per ritrovare i tuoi appunti, esplorare le risorse e contribuire alla raccolta condivisa.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            {[
              ['01','Accesso istituzionale'],['02','Risorse organizzate'],['03','Upload guidato'],['04','Spazio personale']
            ].map(([n,label]) => (
              <div key={n} className="auth-feature">
                <span>{n}</span><strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card">
          <div className="mb-8">
            <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-cyan-300/10 shadow-[0_0_35px_rgba(139,92,246,.16)]">
              <LockKeyhole className="size-6 text-cyan-100" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-violet-200/70">Accesso sicuro</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">Bentornato.</h2>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">
              Usa il tuo account Google istituzionale <span className="font-semibold text-white/80">@liceoscacchibari.it</span>.
            </p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true); setError(null);
              const { error: signInError } = await signInWithGoogle();
              if (signInError) { setError(signInError); setLoading(false); }
            }}
            className="auth-google-btn"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white text-sm font-bold text-slate-700">G</span>
            <span>{loading ? 'Reindirizzamento…' : 'Continua con Google'}</span>
            {!loading && <ArrowRight className="ml-auto size-4" />}
          </button>

          {process.env.NEXT_PUBLIC_PREVIEW_BYPASS_AUTH === 'true' && (
            <Link href="/" className="mt-3 flex w-full items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/5 py-3 text-sm font-bold text-violet-100 transition hover:bg-violet-300/10">
              Entra nella preview
            </Link>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
            <p className="text-xs leading-5 text-foreground-muted">{buildInstitutionDisclaimer(supportEmail)}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <Link href="/privacy-policy" className="text-foreground-muted hover:text-white">Privacy</Link>
            <Link href="/service-rules" className="text-foreground-muted hover:text-white">Regole</Link>
            <Link href="/admin" className="font-semibold text-violet-200 hover:text-white">Area admin →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
