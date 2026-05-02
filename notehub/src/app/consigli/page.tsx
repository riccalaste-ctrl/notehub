'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, Brain, BookOpen, Target, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';

interface Consiglio {
  id: string;
  title: string;
  content: string;
  professor_id: string;
  published: boolean;
  created_at: string;
  professor?: {
    id: string;
    name: string;
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  metodo: <Brain className="size-5 text-mint-dark" />,
  risorse: <BookOpen className="size-5 text-lavender-dark" />,
  organizzazione: <Target className="size-5 text-coral-dark" />,
};

const categoryColors: Record<string, string> = {
  metodo: 'bg-mint/20',
  risorse: 'bg-lavender/20',
  organizzazione: 'bg-coral/20',
};

function getCategoryFromContent(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('studio') || lower.includes('metodo') || lower.includes('tecnica')) return 'metodo';
  if (lower.includes('libro') || lower.includes('risorsa') || lower.includes('materiale')) return 'risorse';
  if (lower.includes('organizz') || lower.includes('pianif') || lower.includes('scadenz')) return 'organizzazione';
  return 'metodo';
}

export default function ConsigliPage() {
  const [consigli, setConsigli] = useState<Consiglio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetch('/api/consigli')
      .then((res) => {
        if (!res.ok) throw new Error('Errore nel caricamento');
        return res.json();
      })
      .then((data) => {
        setConsigli(data.consigli || []);
      })
      .catch((err) => {
        console.error('Consigli fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neu-base">
      <Header breadcrumbs={[{ label: 'Consigli' }]} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 mt-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-neu gradient-lavender flex items-center justify-center">
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

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neu-card p-6 animate-pulse">
                  <div className="h-4 bg-neu-base rounded w-1/3 mb-3" />
                  <div className="h-3 bg-neu-base rounded w-2/3 mb-2" />
                  <div className="h-3 bg-neu-base rounded w-full" />
                </div>
              ))}
            </div>
          ) : consigli.length > 0 ? (
            <div className="space-y-4">
              {consigli.map((consiglio, index) => {
                const category = getCategoryFromContent(consiglio.content);
                return (
                  <motion.div
                    key={consiglio.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="neu-card p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-neu flex items-center justify-center flex-shrink-0 ${categoryColors[category] || categoryColors.metodo}`}>
                        {categoryIcons[category] || categoryIcons.metodo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2">
                          {consiglio.title}
                        </h3>
                        <p className="text-sm text-foreground-light leading-relaxed whitespace-pre-line">
                          {consiglio.content}
                        </p>
                        <div className="flex items-center gap-3 mt-4 text-xs text-foreground-muted">
                          {consiglio.professor && (
                            <span className="flex items-center gap-1">
                              <User className="size-3" />
                              {consiglio.professor.name}
                            </span>
                          )}
                          <span>
                            {new Date(consiglio.created_at).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neu-card p-10 text-center"
            >
              <div className="w-16 h-16 rounded-neu-xl gradient-lavender flex items-center justify-center mx-auto mb-4 shadow-neu-lg">
                <Lightbulb className="size-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nessun consiglio disponibile
              </h2>
              <p className="text-sm text-foreground-light max-w-md mx-auto leading-relaxed">
                I consigli verranno aggiunti gradualmente dall&apos;amministrazione.
                Torna a visitare questa pagina per scoprire nuovi suggerimenti!
              </p>
            </motion.div>
          )}
        </div>

        <Footer />
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
