'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContactReportingPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/public/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setEmail(data.settings?.support_email || data.settings?.legal_controller_email || 'VERIFICA UMANA NECESSARIA'))
      .catch(() => setEmail('VERIFICA UMANA NECESSARIA'));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <article className="prose prose-invert max-w-3xl mx-auto">
        <h1>Contatti e segnalazioni</h1>
        <p>Per assistenza, richieste privacy o segnalare un contenuto, scrivi a <a href={email.includes('@') ? `mailto:${email}` : undefined}>{email}</a> indicando il link alla risorsa e il motivo della segnalazione.</p>
        <p>Non allegare password o dati sensibili. Il recapito viene letto dalle impostazioni pubbliche del servizio e deve essere verificato prima dell&apos;uso pubblico.</p>
        <p><Link href="/service-rules">Regole del servizio</Link> · <Link href="/privacy-policy">Privacy Policy</Link> · <Link href="/">Torna alla home</Link></p>
      </article>
    </main>
  );
}
