'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookiePolicyPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/public/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => setSettings({}));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 text-foreground">
        <p className="text-sm text-stone-500 mb-2">Informativa aggiornata: {settings.legal_policy_updated_at || 'VERIFICA UMANA NECESSARIA'}</p>
        <h1 className="text-4xl font-bold mb-8">Cookie Policy di {settings.legal_project_name || 'NoteHub'}</h1>
        <div className="prose prose-sm prose-headings:text-black prose-p:text-black prose-li:text-black max-w-none text-black">
          <h2>1. Cookie e strumenti utilizzati</h2>
          <p>Il sito utilizza cookie e storage strettamente necessari per autenticazione Google/Supabase, sessione, sicurezza e accesso amministrativo. Non risultano configurati cookie di profilazione, advertising o analytics non necessari.</p>
          <ul>
            <li>cookie di sessione Supabase per mantenere l&apos;autenticazione;</li>
            <li>cookie HttpOnly per l&apos;accesso admin e per la seconda autenticazione Titolare;</li>
            <li>storage tecnico del browser usato dall&apos;interfaccia, senza inserirvi password o secret.</li>
          </ul>
          <h2>2. Consenso</h2>
          <p>Per i soli strumenti tecnici necessari non viene richiesto un consenso separato, perché il loro blocco impedirebbe il funzionamento del servizio. Se in futuro saranno aggiunti strumenti non necessari, il gestore dovrà aggiornarne la configurazione e introdurre un meccanismo di consenso prima dell&apos;attivazione.</p>
          <h2>3. Durata e contatti</h2>
          <p>La durata dei cookie dipende dalla sessione e dalla configurazione di sicurezza. Per domande: {settings.legal_controller_email || settings.support_email || 'VERIFICA UMANA NECESSARIA'}.</p>
          <p>Fornitori collegati: Google per OAuth, Supabase per autenticazione/dati e {settings.legal_hosting_provider || 'VERIFICA UMANA NECESSARIA'} per l&apos;hosting.</p>
        </div>
        <div className="mt-8 pt-8 border-t border-stone-200 flex gap-4 flex-wrap">
          <Link href="/privacy-policy" className="text-indigo-600 hover:underline font-medium">← Privacy Policy</Link>
          <Link href="/" className="text-indigo-600 hover:underline font-medium">Torna alla home</Link>
        </div>
      </article>
    </main>
  );
}
