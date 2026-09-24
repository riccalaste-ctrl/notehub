'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ServiceRulesPage() {
  const [project, setProject] = useState('NoteHub');

  useEffect(() => {
    fetch('/api/public/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setProject(data.settings?.legal_project_name || 'NoteHub'))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <article className="prose prose-invert max-w-3xl mx-auto">
        <h1>Regole del servizio di {project}</h1>
        <p>{project} è un progetto indipendente di condivisione didattica, non un servizio ufficiale dell&apos;istituto scolastico.</p>
        <h2>Prima di caricare</h2>
        <ul><li>Carica solo materiale che hai creato o che puoi condividere legalmente.</li><li>Non inserire dati personali, password, contenuti offensivi o malware.</li><li>Indica informazioni accurate e scegli la materia e il professore corretti.</li></ul>
        <h2>Moderazione e rimozione</h2>
        <p>Gli amministratori possono rimuovere contenuti illeciti, segnalati o non pertinenti e sospendere o bloccare account che violano queste regole. Il nome dell&apos;autore può essere mostrato agli utenti autenticati per attribuire il file.</p>
        <h2>Accettazione</h2>
        <p>L&apos;accettazione richiesta durante l&apos;upload riguarda queste regole del servizio e non costituisce automaticamente consenso al trattamento dei dati personali.</p>
        <p><Link href="/contact-reporting">Contatti e segnalazioni</Link> · <Link href="/privacy-policy">Privacy Policy</Link> · <Link href="/">Torna alla home</Link></p>
      </article>
    </main>
  );
}
