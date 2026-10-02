'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export default function ServiceRulesPage() {
  const [project, setProject] = useState('NoteHub');
  useEffect(() => { fetch('/api/public/settings',{cache:'no-store'}).then(r=>r.json()).then(d=>setProject(d.settings?.legal_project_name||'NoteHub')).catch(()=>{}); }, []);
  return <main className="legal-stage">
    <article className="legal-card">
      <Link href="/" className="legal-back"><ArrowLeft className="size-4"/> Torna alla home</Link>
      <div className="legal-kicker"><ShieldCheck className="size-4"/> Regole della community</div>
      <h1>Regole del servizio di {project}</h1>
      <p className="legal-lead">Un insieme semplice di regole per mantenere lo spazio utile, sicuro e rispettoso per tutti.</p>
      <div className="legal-grid">
        <section><FileText/><h2>Prima di caricare</h2><ul><li>Carica solo materiale che hai creato o che puoi condividere legalmente.</li><li>Non inserire dati personali, password, contenuti offensivi o malware.</li><li>Indica informazioni accurate e scegli materia e professore corretti.</li></ul></section>
        <section><ShieldCheck/><h2>Moderazione</h2><p>Gli amministratori possono rimuovere contenuti illeciti, segnalati o non pertinenti e sospendere o bloccare account che violano queste regole.</p></section>
        <section><CheckCircle2/><h2>Accettazione</h2><p>L’accettazione richiesta durante l’upload riguarda queste regole del servizio e non costituisce automaticamente consenso al trattamento dei dati personali.</p></section>
      </div>
      <nav className="legal-nav"><Link href="/privacy-policy">Privacy Policy</Link><Link href="/cookie-policy">Cookie Policy</Link><Link href="/contact-reporting">Contatti e segnalazioni</Link></nav>
    </article>
  </main>;
}
