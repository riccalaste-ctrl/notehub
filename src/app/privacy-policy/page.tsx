'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none text-foreground-light">
            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">1. Introduzione</h2>
            <p className="mb-4">
              NoteHub (&quot;Piattaforma&quot;) è impegnata nella protezione della privacy dei suoi utenti. 
              Questa Privacy Policy descrive come raccogliamo, utilizziamo e proteggiamo i vostri dati personali.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">2. Titolare del Trattamento</h2>
            <p className="mb-4">
              Il titolare del trattamento dei dati è l&apos;istituzione scolastica che gestisce questa installazione di NoteHub.
              Per informazioni specifiche, contattate gli amministratori tramite i recapiti forniti nell&apos;app.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">3. Dati Raccolti</h2>
            <p className="mb-4">
              Raccogliamo i seguenti dati:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Email e dominio scolastico dall&apos;autenticazione Google/Supabase</li>
              <li>Dati di profilo forniti volontariamente</li>
              <li>Metadati dei file caricati (nome, dimensione, tipo, timestamp)</li>
              <li>Log di accesso e attività per fini di sicurezza</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">4. Base Giuridica</h2>
            <p className="mb-4">
              Il trattamento è fondato sul consenso esplicito e su interessi legittimi nella gestione 
              della piattaforma educativa e nella sicurezza dei dati.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">5. Finalità del Trattamento</h2>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Fornire accesso alla piattaforma di condivisione note</li>
              <li>Autenticazione e autorizzazione utenti</li>
              <li>Gestione e archiviazione file</li>
              <li>Sicurezza e prevenzione abusi</li>
              <li>Comunicazioni tecniche e amministrative</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">6. Conservazione dei Dati</h2>
            <p className="mb-4">
              I dati sono conservati per la durata dell&apos;utilizzo della piattaforma e rimossi entro 12 mesi 
              dalla disattivazione dell&apos;account, salvo obblighi legali.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">7. Diritti degli Utenti</h2>
            <p className="mb-4">
              Avete diritto a:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Accedere ai vostri dati personali</li>
              <li>Richiedere la correzione di dati inesatti</li>
              <li>Richiedere l&apos;eliminazione (&quot;diritto all&apos;oblio&quot;)</li>
              <li>Limitare il trattamento</li>
              <li>Portabilità dei dati</li>
              <li>Opporvi al trattamento</li>
            </ul>
            <p className="mb-4">
              Per esercitare questi diritti, contattate gli amministratori della piattaforma.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">8. Trasferimenti Internazionali</h2>
            <p className="mb-4">
              I dati possono essere trasferiti a fornitori situati fuori dell&apos;UE/SEE 
              (ad es. Google, Supabase) che garantiscono adeguati livelli di protezione.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">9. Minori</h2>
            <p className="mb-4">
              La piattaforma è destinata a utenti scolastici. Se siete un minore, 
              i vostri genitori/tutori devono autorizzare l&apos;utilizzo.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">10. Modifiche alla Policy</h2>
            <p className="mb-4">
              Questa policy può essere aggiornata in qualunque momento. 
              Verranno notificate modifiche significative tramite la piattaforma.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">11. Contatti</h2>
            <p className="mb-4">
              Per domande sulla privacy, contattate gli amministratori della piattaforma.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-200 flex gap-4">
            <Link
              href="/cookie-policy"
              className="text-indigo-600 hover:underline font-medium"
            >
              Cookie Policy →
            </Link>
            <Link
              href="/"
              className="text-indigo-600 hover:underline font-medium"
            >
              Torna alla home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
