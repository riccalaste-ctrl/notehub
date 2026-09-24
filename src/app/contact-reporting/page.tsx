import Link from 'next/link';

export default function ContactReportingPage() {
  return <main className="min-h-screen bg-background text-foreground px-6 py-12">
    <article className="prose prose-invert max-w-3xl mx-auto">
      <h1>Contatti e segnalazioni</h1>
      <p>Per assistenza, richieste privacy o segnalare un contenuto, scrivi a <a href="mailto:support@notehub.local">support@notehub.local</a> indicando il link alla risorsa e il motivo della segnalazione.</p>
      <p>Non allegare password o dati sensibili. Questo recapito è dimostrativo nella preview locale: sostituiscilo con un indirizzo gestito dal progetto prima di un eventuale uso pubblico.</p>
      <p><Link href="/service-rules">Regole del servizio</Link> · <Link href="/">Torna alla home</Link></p>
    </article>
  </main>;
}
