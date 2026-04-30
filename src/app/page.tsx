'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Users, Clock, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';
import UploadModal from '@/components/UploadModal';

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

const subjectIcons: Record<string, string> = {
  matematica: '∑',
  fisica: '⚛',
  chimica: '⬡',
  biologia: '🧬',
  italiano: '📖',
  latino: '🏛',
  storia: '📜',
  filosofia: '🧠',
  inglese: '🌍',
  informatica: '💻',
  arte: '🎨',
  scienze: '🔬',
};

const gradientClasses = [
  'gradient-mint',
  'gradient-lavender',
  'gradient-coral',
];

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, uploadsRes, professorsRes, subjectProfessorsRes] = await Promise.all([
          fetch('/api/admin/subjects'),
          fetch('/api/files?limit=10'),
          fetch('/api/admin/professors'),
          fetch('/api/admin/subject-professors'),
        ]);

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data.filter((s: Subject) => s.enabled));
        }

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

        if (professorsRes.ok) {
          const data = await professorsRes.json();
          setProfessors(data);
        }

        if (subjectProfessorsRes.ok) {
          const data = await subjectProfessorsRes.json();
          setSubjectProfessors(data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neu-base">
      <Header breadcrumbs={[{ label: 'Dashboard' }]} onOpenUpload={() => setUploadModalOpen(true)} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 mt-6"
          >
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Benvenuto su SKAKK-UP
            </h1>
            <p className="text-base text-foreground-light mt-2">
              Il tuo archivio condiviso per appunti e risorse scolastiche
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            <div className="neu-card p-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-neu gradient-mint flex items-center justify-center">
                  <BookOpen className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-xs text-foreground-light">Materie</p>
                </div>
              </div>
            </div>
            <div className="neu-card p-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-neu gradient-lavender flex items-center justify-center">
                  <FileText className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Object.values(uploadCounts).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-xs text-foreground-light">File totali</p>
                </div>
              </div>
            </div>
            <div className="neu-card p-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-neu gradient-coral flex items-center justify-center">
                  <Clock className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{recentUploads.length}</p>
                  <p className="text-xs text-foreground-light">Recenti</p>
                </div>
              </div>
            </div>
            <Link href="/consigli" className="neu-card p-5 bento-card block">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-neu bg-stone-300 flex items-center justify-center">
                  <TrendingUp className="size-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Consigli</p>
                  <p className="text-xs text-foreground-light">Scopri di più →</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Subjects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Materie</h2>
              <Link
                href="/materie"
                className="flex items-center gap-1 text-sm font-medium text-foreground-light hover:text-foreground premium-transition"
              >
                Vedi tutte <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map((subject, i) => {
                const icon = subjectIcons[subject.slug.toLowerCase()] || '📚';
                const count = uploadCounts[subject.slug] || 0;
                return (
                  <Link
                    key={subject.id}
                    href={`/materie/${subject.slug}`}
                    className="neu-card p-5 block group"
                  >
                    <div className={`size-12 rounded-neu-lg ${gradientClasses[i % gradientClasses.length]} flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg group-hover:scale-110 premium-transition`}>
                      {icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-foreground-light">
                      {count > 0 ? `${count} file` : 'Nessun file'}
                    </p>
                  </Link>
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
                <h2 className="text-xl font-semibold text-foreground">Ultimi caricamenti</h2>
                <Link
                  href="/materie"
                  className="flex items-center gap-1 text-sm font-medium text-foreground-light hover:text-foreground premium-transition"
                >
                  Esplora <ChevronRight className="size-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentUploads.slice(0, 5).map((upload) => (
                  <Link
                    key={upload.id}
                    href={upload.subject_slug ? `/materie/${upload.subject_slug}` : '/materie'}
                    className="neu-card p-4 flex items-center justify-between bento-card block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-neu-sm bg-neu-base flex items-center justify-center flex-shrink-0">
                        <FileText className="size-4 text-foreground-light" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {upload.original_filename}
                        </p>
                        {upload.subject_name && (
                          <p className="text-xs text-foreground-light">{upload.subject_name}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-foreground-muted flex-shrink-0 ml-4">
                      {new Date(upload.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <Footer />
      </main>

      {/* Floating Upload Button */}
      <div className="fixed right-6 bottom-6 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-5 font-semibold rounded-neu-lg text-white h-14 gradient-primary premium-transition shadow-lg"
        >
          <Plus className="size-5 mr-2" />
          Carica
        </motion.button>
      </div>

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
