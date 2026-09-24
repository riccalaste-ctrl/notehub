import Link from 'next/link';

export default function ServiceRulesPage() {
  return <main className="min-h-screen bg-background text-foreground px-6 py-12">
    <article className="prose prose-invert max-w-3xl mx-auto">
      <h1>Regole del servizio</h1>
      <p>NoteHub è un progetto indipendente di condivisione didattica, non un servizio ufficiale dell&apos;istituto scolastico.</p>
      <h2>Prima di caricare</h2>
      <ul><li>Carica solo materiale che hai creato o che puoi condividere legalmente.</li><li>Non inserire dati personali, password, contenuti offensivi o malware.</li><li>Indica informazioni accurate e scegli la materia e il professore corretti.</li></ul>
      <h2>Moderazione e rimozione</h2>
      <p>Gli amministratori possono rimuovere contenuti illeciti, segnalati o non pertinenti. Le segnalazioni vengono valutate senza garantire la conservazione del materiale.</p>
      <p><Link href="/contact-reporting">Contatti e segnalazioni</Link> · <Link href="/">Torna alla home</Link></p>
    </article>
  </main>;
}
