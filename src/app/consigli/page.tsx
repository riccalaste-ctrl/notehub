'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Mail, Send, Sparkles, BookOpen, Brain, Target, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ConsigliPage() {
  return (
    <div className="min-h-screen bg-neu-base">
      <Header breadcrumbs={[{ label: 'Consigli' }]} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 mt-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-neu gradient-lavender flex items-center justify-center shadow-neu">
                <Lightbulb className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                Consigli & Suggerimenti
              </h1>
            </div>
            <p className="text-base text-foreground-light">
              Trucchi per lo studio, info sui professori e consigli per organizzarsi al meglio
            </p>
          </motion.div>

          {/* Tips Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="neu-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-neu bg-mint/20 flex items-center justify-center">
                  <Brain className="size-5 text-mint-dark" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Metodo di Studio</h3>
              </div>
              <p className="text-xs text-foreground-light">
                Scopri tecniche efficaci per ottimizzare il tuo tempo di studio
              </p>
            </div>

            <div className="neu-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-neu bg-lavender/20 flex items-center justify-center">
                  <BookOpen className="size-5 text-lavender-dark" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Risorse</h3>
              </div>
              <p className="text-xs text-foreground-light">
                Libri consigliati e materiali integrativi per ogni materia
              </p>
            </div>

            <div className="neu-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-neu bg-coral/20 flex items-center justify-center">
                  <Target className="size-5 text-coral-dark" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Organizzazione</h3>
              </div>
              <p className="text-xs text-foreground-light">
                Strategie per gestire scadenze e pianificare il lavoro
              </p>
            </div>
          </motion.div>

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neu-card p-10 text-center"
          >
            <div className="w-16 h-16 rounded-neu-xl gradient-lavender flex items-center justify-center mx-auto mb-4 shadow-neu-lg">
              <Sparkles className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nessun consiglio disponibile
            </h2>
            <p className="text-sm text-foreground-light max-w-md mx-auto leading-relaxed">
              I consigli verranno aggiunti gradualmente dall&apos;amministrazione.
              Torna a visitare questa pagina per scoprire nuovi suggerimenti!
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 neu-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-neu neu-surface-pressed flex items-center justify-center flex-shrink-0">
                <Mail className="size-5 text-foreground-light" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Vuoi contribuire?
                </h3>
                <p className="text-sm text-foreground-light leading-relaxed">
                  Se hai un consiglio da condividere, invialo alla email dell&apos;amministrazione.
                  Dopo una verifica, verrà pubblicato qui.
                </p>
                <div className="mt-3 p-3 rounded-neu neu-surface inline-block">
                  <p className="text-sm font-semibold text-foreground-light flex items-center gap-2">
                    <Send className="size-4 text-lavender-dark" />
                    <span className="text-foreground-muted">Email: admin@skakk-up.it</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
