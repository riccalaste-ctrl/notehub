'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Settings = {
  legal_project_name?: string;
  legal_controller_name?: string;
  legal_controller_email?: string;
  legal_policy_updated_at?: string;
  legal_minimum_age?: string;
  site_policy?: string;
};

export default function PolicyConsentGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPolicyPage = pathname === '/privacy-policy' || pathname === '/cookie-policy' || pathname === '/service-rules';
  const [state, setState] = useState<'loading' | 'allowed' | 'required'>('loading');
  const [settings, setSettings] = useState<Settings>({});
  const [version, setVersion] = useState('');
  const [saving, setSaving] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    if (isPolicyPage) {
      setState('allowed');
      return;
    }
    let active = true;
    Promise.all([
      fetch('/api/auth/me', { cache: 'no-store' }),
      fetch('/api/public/settings', { cache: 'no-store' }),
    ])
      .then(async ([authResponse, settingsResponse]) => {
        const settingsData = await settingsResponse.json().catch(() => ({ settings: {} }));
        if (!active) return;
        setSettings(settingsData.settings || {});
        if (!authResponse.ok) {
          setState('allowed');
          return;
        }

        const consentResponse = await fetch('/api/legal/consent', { cache: 'no-store' });
        const consent = await consentResponse.json();
        if (!active) return;
        setVersion(consent.version || settingsData.settings?.legal_policy_updated_at || 'policy-v1');
        setState(consent.accepted ? 'allowed' : 'required');
      })
      .catch(() => {
        if (active) setState('required');
      });
    return () => {
      active = false;
    };
  }, [isPolicyPage]);

  async function accept() {
    setSaving(true);
    const response = await fetch('/api/legal/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepted: policyAccepted && cookiesAccepted, policyAccepted, cookiesAccepted, version }),
    });
    if (response.ok) setState('allowed');
    setSaving(false);
  }

  async function reject() {
    setSaving(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login?error=policy_required';
  }

  if (isPolicyPage || state !== 'required') return <>{children}</>;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none">{children}</div>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-consent-title"
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#111522] p-6 text-white shadow-2xl sm:p-8"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Accesso richiesto</p>
          <h1 id="policy-consent-title" className="text-2xl font-bold sm:text-3xl">
            Leggi e accetta le policy di {settings.legal_project_name || 'NoteHub'}
          </h1>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
            <p>{settings.site_policy || 'Prima di continuare devi leggere il riepilogo sulla privacy e sui cookie.'}</p>
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold text-white">Riepilogo Privacy Policy</summary>
              <p className="mt-3">
                Il servizio tratta i dati necessari all&apos;autenticazione Google, alla gestione degli appunti e alla sicurezza.
                Il nome dell&apos;autore può essere mostrato agli utenti autenticati. Età minima: {settings.legal_minimum_age || '14'} anni.
                Titolare: {settings.legal_controller_name || 'VERIFICA UMANA NECESSARIA'}.
                Contatto: {settings.legal_controller_email || 'VERIFICA UMANA NECESSARIA'}.
              </p>
            </details>
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold text-white">Riepilogo Cookie Policy</summary>
              <p className="mt-3">
                Sono utilizzati cookie tecnici necessari per autenticazione, sessione, sicurezza e accesso amministrativo.
                Non sono configurati cookie di profilazione o advertising non necessari.
              </p>
            </details>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/privacy-policy" target="_blank" className="text-cyan-300 underline">Leggi Privacy Policy</Link>
            <Link href="/cookie-policy" target="_blank" className="text-cyan-300 underline">Leggi Cookie Policy</Link>
            <Link href="/service-rules" target="_blank" className="text-cyan-300 underline">Leggi Regole del servizio</Link>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Devi confermare separatamente di aver letto Privacy Policy e Cookie Policy. Le pagine collegate contengono il testo completo e aggiornato.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <label className="flex gap-3"><input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} /> <span>Ho letto e accetto l&apos;informativa Privacy.</span></label>
            <label className="flex gap-3"><input type="checkbox" checked={cookiesAccepted} onChange={(event) => setCookiesAccepted(event.target.checked)} /> <span>Ho letto e accetto la Cookie Policy.</span></label>
          </div>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={reject} disabled={saving} className="rounded-xl border border-red-400/40 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50">
              Rifiuta ed esci
            </button>
            <button type="button" onClick={accept} disabled={saving || !policyAccepted || !cookiesAccepted} className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
              {saving ? 'Salvataggio...' : 'Accetto e continuo'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
