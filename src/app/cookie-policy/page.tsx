'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
          
          <div className="prose prose-sm max-w-none text-foreground-light">
            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">1. Cosa sono i Cookie</h2>
            <p className="mb-4">
              I cookie sono piccoli file di testo memorizzati sul vostro dispositivo quando visitate un sito web. 
              Consentono al sito di ricordare informazioni su di voi durante la sessione e tra le visite successive.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">2. Cookie Utilizzati da NoteHub</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-5 mb-3">2.1 Cookie Tecnici (Necessari)</h3>
            <p className="mb-4">
              Questi cookie sono essenziali per il funzionamento della piattaforma:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li><strong>sb-*:</strong> Autenticazione Supabase e gestione sessione utente</li>
              <li><strong>notehub_admin_jwt:</strong> Token amministratore per accesso pannello admin (httpOnly, Secure)</li>
              <li><strong>Session cookies:</strong> Gestione dello stato di sessione</li>
            </ul>
            <p className="mb-4 text-sm text-stone-600">
              <strong>Durata:</strong> Per la durata della sessione (24 ore) o fino al logout.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-5 mb-3">2.2 Cookie di Sicurezza</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Prevenzione attacchi CSRF (Cross-Site Request Forgery)</li>
              <li>Protezione di forme e transazioni critiche</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">3. Cookie di Terze Parti</h2>
            <p className="mb-4">
              NoteHub non utilizza cookie di terze parti per tracciamento, analytics o advertising.
              Tuttavia, servizi integrati (Google OAuth, Supabase) possono impostare propri cookie.
              Consultate le loro politiche:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Privacy Policy</a></li>
              <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Supabase Privacy Policy</a></li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">4. Consenso e Controllo</h2>
            <p className="mb-4">
              I cookie tecnici e di sicurezza sono necessari per utilizzare la piattaforma. 
              Potete controllare i cookie attraverso le impostazioni del vostro browser:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Bloccare tutti i cookie</li>
              <li>Accettare cookie solo da siti specifici</li>
              <li>Eliminare i cookie alla chiusura del browser</li>
            </ul>
            <p className="mb-4 text-sm text-stone-600 font-medium">
              Nota: Bloccare cookie tecnici potrebbe impedire il corretto funzionamento di NoteHub.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">5. Conservazione</h2>
            <p className="mb-4">
              I cookie di sessione sono cancellati automaticamente al logout o scadono dopo il periodo di validità indicato.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">6. Modifiche alla Policy</h2>
            <p className="mb-4">
              Questa policy può essere aggiornata in qualunque momento. 
              La data dell&apos;ultimo aggiornamento è indicata a fondo pagina.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">7. Contatti</h2>
            <p className="mb-4">
              Per domande sui cookie, contattate gli amministratori della piattaforma.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-200 flex gap-4">
            <Link
              href="/privacy-policy"
              className="text-indigo-600 hover:underline font-medium"
            >
              ← Privacy Policy
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
