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
    const loadData = async () => {
      fetch('/api/public/settings')
        .then((res) => res.json())
        .then((data) => setConsigliEmail(data.settings?.consigli_email || ''))
        .catch(() => {});

      const filesRes = await fetch('/api/public/consigli-files').catch(() => null);
      const consigliRes = await fetch('/api/consigli');

      if (consigliRes.ok) {
        const data = await consigliRes.json();
        const published = (data.consigli || []).filter((c: Consiglio) => c.published);
        setConsigli(published);

        if (filesRes?.ok) {
          const fd = await filesRes.json();
          const filesByConsiglio: Record<string, ConsiglioFile[]> = {};
          (fd.files || []).forEach((f: ConsiglioFile) => {
            if (!filesByConsiglio[f.consiglio_id]) filesByConsiglio[f.consiglio_id] = [];
            filesByConsiglio[f.consiglio_id].push(f);
          });
          setConsigliFiles(filesByConsiglio);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Header breadcrumbs={[{ label: 'Consigli' }]} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 mt-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_20px_rgba(157,78,221,0.4)]">
                <Lightbulb className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Consigli & Suggerimenti
              </h1>
            </div>
            <p className="text-base text-foreground-muted">
              Trucchi per lo studio, info sui professori e consigli per organizzarti al meglio
            </p>
            {consigliEmail ? (
              <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-neon-blue/10 border border-neon-blue/20">
                  <Mail className="size-5 text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Hai un consiglio da condividere?</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Scrivici a:{' '}
                    <a href={`mailto:${consigliEmail}`} className="text-neon-blue hover:text-white transition-colors font-medium">
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
                <div key={i} className="glass-panel p-6 animate-pulse border border-white/5">
                  <div className="h-4 bg-white/10 rounded-lg w-1/3 mb-4" />
                  <div className="h-3 bg-white/10 rounded-lg w-2/3 mb-2" />
                  <div className="h-3 bg-white/10 rounded-lg w-full" />
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
                    className="glass-panel p-6 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Lightbulb className="size-6 text-neon-purple" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {consiglio.title}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
                          {consiglio.content}
                        </p>
                        {files.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-white/10">
                            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-3">File allegati</p>
                            <div className="space-y-2">
                              {files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.view_url || file.download_url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-neon-blue/30 transition-all group/file"
                                >
                                  <FileText className="size-4 text-neon-blue group-hover/file:scale-110 transition-transform" />
                                  <span className="font-medium text-foreground-muted group-hover/file:text-white transition-colors truncate">
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
              className="glass-panel p-10 text-center border border-white/10"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Lightbulb className="size-10 text-foreground-muted" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Nessun consiglio disponibile
              </h2>
              <p className="text-sm text-foreground-muted max-w-md mx-auto leading-relaxed">
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
