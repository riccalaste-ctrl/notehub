'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type LegalSettings = {
  legal_project_name?: string;
  legal_controller_name?: string;
  legal_controller_email?: string;
  legal_controller_address?: string;
  legal_dpo_email?: string;
  legal_hosting_provider?: string;
  legal_data_retention?: string;
  legal_minimum_age?: string;
  legal_policy_updated_at?: string;
  support_email?: string;
  admin_email?: string;
  site_policy?: string;
};

const missing = 'VERIFICA UMANA NECESSARIA';

export default function PrivacyPolicyPage() {
  const [settings, setSettings] = useState<LegalSettings>({});

  useEffect(() => {
    fetch('/api/public/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => setSettings({}));
  }, []);

  const project = settings.legal_project_name || 'NoteHub';
  const controller = settings.legal_controller_name || missing;
  const controllerEmail = settings.legal_controller_email || missing;
  const supportEmail = settings.support_email || settings.admin_email || missing;
  const retention = settings.legal_data_retention || missing;
  const minimumAge = settings.legal_minimum_age || '14';

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 text-foreground">
        <p className="text-sm text-stone-500 mb-2">Informativa aggiornata: {settings.legal_policy_updated_at || missing}</p>
        <h1 className="text-4xl font-bold mb-8">Privacy Policy di {project}</h1>
        <div className="prose prose-sm prose-headings:text-black prose-p:text-black prose-li:text-black max-w-none text-black">
          <h2>1. Natura del progetto e titolare</h2>
          <p>{project} è un progetto indipendente e non è gestito, posseduto o approvato dall&apos;istituto scolastico usato come contesto della comunità.</p>
          <p><strong>Titolare del trattamento:</strong> {controller}<br />
            <strong>Contatto privacy:</strong> {controllerEmail}<br />
            <strong>Recapito:</strong> {settings.legal_controller_address || missing}</p>
          <p>Il nome e i recapiti sopra indicati sono configurabili dall&apos;amministratore del servizio. Se mostrano la dicitura di verifica, il sito non è ancora pronto per l&apos;uso pubblico.</p>

          <h2>2. Dati trattati</h2>
          <ul>
            <li>identificativo, nome, cognome ed email restituiti dall&apos;autenticazione Google, nei limiti necessari ad autenticare l&apos;account;</li>
            <li>nome visualizzato come autore e metadati dei file caricati;</li>
            <li>dati tecnici strettamente necessari a sicurezza, sessione e funzionamento;</li>
            <li>eventi amministrativi e di sicurezza minimizzati, inclusa l&apos;email dell&apos;account autore delle modifiche nella sezione Titolare.</li>
          </ul>
          <p>Non sono richiesti numero di telefono, posizione, fingerprint o profili comportamentali. L&apos;eventuale verifica dell&apos;età serve solo a verificare il requisito scelto dal servizio ({minimumAge} anni) e non implica la conservazione dell&apos;anno di nascita.</p>

          <h2>3. Finalità e base giuridica</h2>
          <p>I dati sono trattati per autenticazione Google, gestione degli upload, attribuzione dell&apos;autore, moderazione, sicurezza e gestione delle richieste degli interessati. La base giuridica applicabile deve essere confermata dal titolare con una verifica professionale in base al contesto concreto; questa pagina non costituisce parere legale.</p>

          <h2>4. Condivisione e fornitori</h2>
          <p>L&apos;autenticazione utilizza Google tramite Supabase. L&apos;hosting e gli eventuali trasferimenti internazionali devono essere verificati in base alla configurazione effettiva: {settings.legal_hosting_provider || missing}.</p>
          <p>Il nome e il cognome dell&apos;autore possono essere mostrati agli utenti autenticati per attribuire il file; l&apos;email completa resta riservata alle funzioni amministrative e di moderazione quando necessaria.</p>

          <h2>5. Conservazione e sicurezza</h2>
          <p>Periodo di conservazione configurato: <strong>{retention}</strong>. I tempi effettivi devono essere definiti dal gestore e applicati anche a database, storage e log. Sono previste autenticazione server-side, controllo dei ruoli, protezione degli upload e accesso separato alla sezione Titolare.</p>

          <h2>6. Diritti</h2>
          <p>Gli interessati possono chiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione nei limiti applicabili, scrivendo a {controllerEmail} o {supportEmail}. Le richieste e i presupposti giuridici devono essere valutati dal titolare.</p>

          <h2>7. Minori e contenuti</h2>
          <p>Il servizio richiede almeno {minimumAge} anni come condizione scelta dal progetto. Le regole vietano contenuti illegali, malware, molestie, discriminazioni e materiale non pertinente. I contenuti possono essere rimossi e gli account sospesi o bannati.</p>

          <h2>8. Modifiche</h2>
          <p>{settings.site_policy || 'Le informazioni legali devono essere completate dal gestore prima dell’uso pubblico.'}</p>
        </div>
        <div className="mt-8 pt-8 border-t border-stone-200 flex gap-4 flex-wrap">
          <Link href="/cookie-policy" className="text-indigo-600 hover:underline font-medium">Cookie Policy →</Link>
          <Link href="/service-rules" className="text-indigo-600 hover:underline font-medium">Regole del servizio →</Link>
          <Link href="/" className="text-indigo-600 hover:underline font-medium">Torna alla home</Link>
        </div>
      </article>
    </main>
  );
}
