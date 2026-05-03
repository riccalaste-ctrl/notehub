'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, FileText, User, Mail } from 'lucide-react';
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

interface ConsiglioFile {
  id: string;
  consiglio_id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  download_url?: string;
  view_url?: string;
}

export default function ConsigliPage() {
  const [consigli, setConsigli] = useState<Consiglio[]>([]);
  const [consigliFiles, setConsigliFiles] = useState<Record<string, ConsiglioFile[]>>({});
  const [loading, setLoading] = useState(true);
  const [consigliEmail, setConsigliEmail] = useState<string>('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setConsigliEmail(data.settings?.consigli_email || ''))
      .catch(() => {});

    Promise.all([
      fetch('/api/consigli'),
      fetch('/api/public/consigli-files').catch(() => ({ ok: false })),
    ])
      .then(([consigliRes, filesRes]) => {
        if (consigliRes.ok) {
          return consigliRes.json().then((data) => {
            const published = (data.consigli || []).filter((c: Consiglio) => c.published);
            setConsigli(published);
            if (filesRes.ok) {
              return filesRes.json().then((fd: any) => {
                const filesByConsiglio: Record<string, ConsiglioFile[]> = {};
                (fd.files || []).forEach((f: ConsiglioFile) => {
                  if (!filesByConsiglio[f.consiglio_id]) filesByConsiglio[f.consiglio_id] = [];
                  filesByConsiglio[f.consiglio_id].push(f);
                });
                setConsigliFiles(filesByConsiglio);
              });
            }
          });
        }
      })
      .catch((err) => {
        console.error('Consigli fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neu-base gray-cards">
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
              Trucchi per lo studio, info sui professori e consigli per organizzarti al meglio
            </p>
            {consigliEmail ? (
              <div className="mt-4 p-4 rounded-neu gray-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-neu flex items-center justify-center flex-shrink-0 bg-[#6366F1]/10">
                  <Mail className="size-5 text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Hai un consiglio da condividere?</p>
                  <p className="text-sm text-foreground-light">
                    Scrivici a:{' '}
                    <a href={`mailto:${consigliEmail}`} className="text-[#6366F1] hover:underline font-semibold">
                      {consigliEmail}
                    </a>
                  </p>
                </div>
              </div>
            ) : null}
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
                const files = consigliFiles[consiglio.id] || [];
                return (
                  <motion.div
                    key={consiglio.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="neu-card p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-neu gradient-lavender flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="size-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2">
                          {consiglio.title}
                        </h3>
                        <p className="text-sm text-foreground-light leading-relaxed whitespace-pre-line">
                          {consiglio.content}
                        </p>
                        {files.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-stone-200/30">
                            <p className="text-xs font-semibold text-foreground mb-2">File allegati</p>
                            <div className="space-y-1">
                              {files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.view_url || file.download_url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-neu-sm neu-surface text-xs hover:bg-[#6366F1]/10 transition"
                                >
                                  <FileText className="size-3 text-[#6366F1]" />
                                  <span className="font-medium text-foreground-light hover:text-foreground truncate">
                                    {file.original_filename}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
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
