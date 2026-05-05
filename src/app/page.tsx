'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Users, Clock, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';
import UploadModal from '@/components/UploadModal';
import { getSubjectIcon, getSubjectGradient } from '@/lib/subject-config';

interface Subject {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
}

interface Professor {
  id: string;
  name: string;
}

interface SubjectProfessor {
  subject_id: string;
  professor_id: string;
  professor?: Professor;
}

interface Upload {
  id: string;
  original_filename: string;
  subject_name?: string;
  subject_slug?: string;
  created_at: string;
}

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchCatalog = async () => {
    try {
      const catalogRes = await fetch('/api/public/catalog');
      if (catalogRes.ok) {
        const data = await catalogRes.json();
        setSubjects(data.subjects || []);
        setProfessors(data.professors || []);
        setSubjectProfessors(data.subjectProfessors || []);
      }
    } catch (error) {
      console.error('Catalog fetch error:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const uploadsRes = await fetch('/api/files?limit=50');
      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        setRecentUploads(data.uploads || []);

        const counts: Record<string, number> = {};
        (data.uploads || []).forEach((u: Upload) => {
          if (u.subject_slug) {
            counts[u.subject_slug] = (counts[u.subject_slug] || 0) + 1;
          }
        });
        setUploadCounts(counts);
      }
    } catch (error) {
      console.error('Uploads fetch error:', error);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchUploads();

    const handleOpenUpload = () => setUploadModalOpen(true);
    window.addEventListener('open-upload', handleOpenUpload);

    return () => {
      window.removeEventListener('open-upload', handleOpenUpload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Header breadcrumbs={[{ label: 'Dashboard' }]} onOpenUpload={() => setUploadModalOpen(true)} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="mb-10 mt-6"
          >
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
              Benvenuto su <span className="text-gradient-purple">SKAKK-UP</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl">
              Il tuo archivio condiviso per appunti e risorse scolastiche
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
          >
            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="premium-card p-5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="size-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <BookOpen className="size-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{subjects.length}</p>
                  <p className="text-sm text-foreground-muted">Materie</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="premium-card p-5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Users className="size-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{professors.length}</p>
                  <p className="text-sm text-foreground-muted">Professori</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="premium-card p-5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="size-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <FileText className="size-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {Object.values(uploadCounts).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-sm text-foreground-muted">File totali</p>
                </div>
              </div>
            </motion.div>

            <Link href="/consigli" className="block">
              <motion.div whileHover={{ scale: 1.02, y: -5 }} className="premium-card p-5 h-full group relative overflow-hidden border-neon-purple/30">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="size-12 rounded-2xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center shadow-neon-purple">
                    <TrendingUp className="size-6 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Consigli</p>
                    <p className="text-xs text-neon-purple mt-1 group-hover:translate-x-1 transition-transform">Scopri di più →</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Subjects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Esplora per Materia</h2>
              <Link
                href="/materie"
                className="flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-white transition-colors group"
              >
                Vedi tutte <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {subjects.map((subject) => {
                const icon = getSubjectIcon(subject.slug);
                const count = uploadCounts[subject.slug] || 0;
                // Add framer motion to link for 3D effect
                return (
                  <motion.div key={subject.id} whileHover={{ scale: 1.03, y: -5 }}>
                    <Link
                      href={`/materie/${subject.slug}`}
                      className="glass-panel p-6 block group h-full relative overflow-hidden"
                    >
                      <div className="absolute -right-6 -top-6 size-24 bg-white/5 rounded-full blur-xl group-hover:bg-neon-blue/10 transition-colors duration-500" />
                      <div className={`size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300`}>
                        {icon}
                      </div>
                      <h3 className="font-semibold text-white text-base mb-1">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-foreground-muted">
                        {count > 0 ? `${count} risorse` : 'Nessuna risorsa'}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Files */}
          {recentUploads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Ultimi caricamenti</h2>
                <Link
                  href="/materie"
                  className="flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-white transition-colors group"
                >
                  Esplora <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentUploads.slice(0, 5).map((upload) => (
                  <motion.div key={upload.id} whileHover={{ x: 5 }}>
                    <Link
                      href={upload.subject_slug ? `/materie/${upload.subject_slug}` : '/materie'}
                      className="glass-panel p-4 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-neon-blue/10 group-hover:border-neon-blue/30 transition-colors">
                          <FileText className="size-5 text-foreground-muted group-hover:text-neon-blue transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-medium text-white truncate">
                            {upload.original_filename}
                          </p>
                          {upload.subject_name && (
                            <p className="text-sm text-foreground-muted">{upload.subject_name}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-foreground-muted flex-shrink-0 ml-4 bg-white/5 px-2 py-1 rounded-md">
                        {new Date(upload.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <Footer />

        {/* Floating Upload Button */}
        <div className="fixed right-6 bottom-6 z-30">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(157, 78, 221, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center px-6 font-semibold rounded-full text-white h-14 bg-gradient-to-r from-neon-purple to-neon-blue border border-white/20 shadow-lg"
          >
            <Plus className="size-5 mr-2" />
            Carica Risorsa
          </motion.button>
        </div>
      </main>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        subjects={subjects}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
