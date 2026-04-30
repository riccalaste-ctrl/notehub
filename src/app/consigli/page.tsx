'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, BookOpen, Clock, Users, Target, MessageCircle, Plus, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';

interface Consiglio {
  id: number;
  categoria: 'studio' | 'professori' | 'organizzazione' | 'vita';
  titolo: string;
  contenuto: string;
  autore?: string;
  data: string;
  utile: number;
}

const consigliDemo: Consiglio[] = [
  {
    id: 1,
    categoria: 'professori',
    titolo: 'Come approcciarsi al prof. Rossi',
    contenuto: 'Il prof. Rossi apprezza molto gli studenti che fanno domande durante la lezione. Non abbiate paura di chiedere chiarimenti, preferisce l\'interazione alla passività.',
    autore: 'Marco B.',
    data: '15 Apr 2026',
    utile: 12,
  },
  {
    id: 2,
    categoria: 'studio',
    titolo: 'Tecnica del ripasso attivo',
    contenuto: 'Invece di rileggere gli appunti, provate a spiegare ad alta voce il concetto come se lo steste insegnando a qualcuno. Questo metodo attiva la memoria a lungo termine molto di più.',
    autore: 'Sara L.',
    data: '10 Apr 2026',
    utile: 23,
  },
  {
    id: 3,
    categoria: 'organizzazione',
    titolo: 'Il metodo delle 3 priorità',
    contenuto: 'Ogni sera scrivete le 3 cose più importanti da fare il giorno dopo. Concentratevi su quelle prima di tutto il resto. Evita di disperdere energie su task poco urgenti.',
    data: '5 Apr 2026',
    utile: 18,
  },
  {
    id: 4,
    categoria: 'vita',
    titolo: 'Bilanciare studio e vita sociale',
    contenuto: 'Il segreto è pianificare: dedicate blocchi di tempo allo studio (es. 9-12 e 14-17) e il resto della giornata è libera. Senza un piano, il tempo si disperde.',
    autore: 'Luca M.',
    data: '1 Apr 2026',
    utile: 31,
  },
  {
    id: 5,
    categoria: 'professori',
    titolo: 'Cosa si aspetta il prof. Verdi all\'esame',
    contenuto: 'All\'esame orale il prof. Verdi vuole sentire collegamenti tra gli argomenti, non solo definizioni. Preparatevi schemi che colleghino i concetti principali di ogni capitolo.',
    autore: 'Giulia P.',
    data: '28 Mar 2026',
    utile: 45,
  },
  {
    id: 6,
    categoria: 'studio',
    titolo: 'Mappe mentali per esami complessi',
    contenuto: 'Per materie con molti argomenti interconnessi, le mappe mentali sono essenziali. Partite dal concetto centrale e create rami per ogni macro-argomento. Usate colori diversi.',
    data: '20 Mar 2026',
    utile: 15,
  },
];

const categorie = [
  { id: 'tutti', label: 'Tutti', icon: Lightbulb },
  { id: 'studio', label: 'Studio', icon: BookOpen },
  { id: 'professori', label: 'Professori', icon: Users },
  { id: 'organizzazione', label: 'Organizzazione', icon: Target },
  { id: 'vita', label: 'Vita Scolastica', icon: MessageCircle },
];

const categoriaColors: Record<string, string> = {
  studio: 'bg-sage text-sage-dark',
  professori: 'bg-lavender/20 text-lavender-dark',
  organizzazione: 'bg-peach/20 text-orange-700',
  vita: 'bg-stone-200 text-stone-800',
};

const categoriaLabels: Record<string, string> = {
  studio: 'Studio',
  professori: 'Professori',
  organizzazione: 'Organizzazione',
  vita: 'Vita Scolastica',
};

export default function ConsigliPage() {
  const [filter, setFilter] = useState('tutti');
  const { toast, showToast, hideToast } = useToast();

  const filtered = filter === 'tutti' ? consigliDemo : consigliDemo.filter(c => c.categoria === filter);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header breadcrumbs={[{ label: 'Consigli' }]} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mt-6"
          >
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Consigli & Suggerimenti
            </h1>
            <p className="text-base text-stone-700 mt-2">
              Dalla community: trucchi per lo studio, info sui professori e consigli per organizzarsi al meglio
            </p>
          </motion.div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categorie.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 rounded-full text-sm px-4 h-9 whitespace-nowrap font-semibold premium-transition ${
                  filter === id
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {filtered.map((consiglio, i) => (
              <motion.div
                key={consiglio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card bento-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${categoriaColors[consiglio.categoria]}`}>
                        {categoriaLabels[consiglio.categoria]}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mb-1">
                      {consiglio.titolo}
                    </h3>
                    <p className="text-sm text-stone-800 leading-relaxed">
                      {consiglio.contenuto}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {consiglio.autore && (
                        <span className="text-xs text-stone-700 font-medium">
                          {consiglio.autore}
                        </span>
                      )}
                      <span className="text-xs text-stone-500">{consiglio.data}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 glass-card p-6 text-center"
          >
            <Lightbulb className="size-8 text-stone-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900 mb-2">
              Hai un consiglio da condividere?
            </h3>
            <p className="text-sm text-stone-700 mb-4">
              Contatta l&apos;amministrazione per contribuire con i tuoi suggerimenti
            </p>
            <a
              href="mailto:admin@notehub.local"
              className="inline-flex items-center px-5 py-2.5 gradient-primary text-white rounded-full text-sm font-semibold premium-transition"
            >
              <MessageCircle className="size-4 mr-1.5" />
              Contattaci
            </a>
          </motion.div>
        </div>

        <Footer />
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
