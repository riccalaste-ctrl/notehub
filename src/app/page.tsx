'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, FileText, GraduationCap, Sparkles, Users, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';
import UploadModal from '@/components/UploadModal';
import { getSubjectIcon } from '@/lib/subject-config';

interface Subject { id: string; name: string; slug: string; enabled: boolean; }
interface Professor { id: string; name: string; }
interface SubjectProfessor { subject_id: string; professor_id: string; professor?: Professor; }
interface Upload { id: string; original_filename: string; subject_name?: string; subject_slug?: string; created_at: string; }

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast, hideToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [catalogRes, uploadsRes] = await Promise.all([
          fetch('/api/public/catalog'),
          fetch('/api/files?limit=50'),
        ]);
        if (catalogRes.ok) {
          const data = await catalogRes.json();
          setSubjects(data.subjects || []);
          setProfessors(data.professors || []);
          setSubjectProfessors(data.subjectProfessors || []);
        }
        if (uploadsRes.ok) {
          const data = await uploadsRes.json();
          const uploads = data.uploads || [];
          setRecentUploads(uploads);
          const counts: Record<string, number> = {};
          uploads.forEach((u: Upload) => {
            if (u.subject_slug) counts[u.subject_slug] = (counts[u.subject_slug] || 0) + 1;
          });
          setUploadCounts(counts);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    };
    load();

    const handleOpenUpload = () => setUploadModalOpen(true);
    window.addEventListener('open-upload', handleOpenUpload);
    return () => window.removeEventListener('open-upload', handleOpenUpload);
  }, []);

  const totalFiles = Object.values(uploadCounts).reduce((sum, count) => sum + count, 0);
  const activeSubjects = subjects.filter((subject) => subject.enabled);

  return (
    <div className="page-shell">
      <Header breadcrumbs={[{ label: 'Dashboard' }]} onOpenUpload={() => setUploadModalOpen(true)} />

      <main className="lg:pl-[4.5rem] pt-16 pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_82%_18%,rgba(0,229,255,.18),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(168,85,247,.2),transparent_34%),rgba(10,10,18,.78)] p-7 sm:p-10 lg:p-12 shadow-[0_30px_100px_rgba(0,0,0,.28)]"
          >
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-cyan-300/10" />
            <div className="absolute -right-12 -top-12 size-48 rounded-full border border-pink-300/10" />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-cyan-200">
                <Sparkles className="size-3.5" /> Digital Agora
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-.04em] text-white sm:text-5xl lg:text-6xl">
                Tutto ciò che ti serve per <span className="text-gradient-purple">studiare meglio.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-muted sm:text-lg">
                Esplora materiali condivisi, trova il professore giusto e continua il tuo percorso senza perdere tempo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/materie" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5">
                  Esplora le materie <ArrowUpRight className="size-4" />
                </Link>
                <button onClick={() => setUploadModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10">
                  <Plus className="size-4" /> Condividi una risorsa
                </button>
              </div>
            </div>
          </motion.section>

          <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Materie', value: activeSubjects.length, icon: BookOpen, accent: 'text-cyan-300' },
              { label: 'Professori', value: professors.length, icon: GraduationCap, accent: 'text-violet-300' },
              { label: 'Risorse', value: totalFiles, icon: FileText, accent: 'text-pink-300' },
              { label: 'Connessioni', value: subjectProfessors.length, icon: Users, accent: 'text-emerald-300' },
            ].map(({ label, value, icon: Icon, accent }) => (
              <motion.div key={label} whileHover={{ y: -3 }} className="premium-card p-5">
                <Icon className={`mb-5 size-5 ${accent}`} />
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[.14em] text-foreground-muted">{label}</div>
              </motion.div>
            ))}
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-300/80">Catalogo</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Esplora per materia</h2>
              </div>
              <Link href="/materie" className="hidden items-center gap-1 text-sm font-semibold text-foreground-muted hover:text-white sm:flex">
                Vedi tutto <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {activeSubjects.map((subject, index) => (
                <motion.div key={subject.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }} whileHover={{ y: -4 }}>
                  <Link href={`/materie/${subject.slug}`} className="group relative block min-h-[150px] overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] p-5 transition-colors hover:border-cyan-300/20 hover:bg-white/[.06]">
                    <div className="absolute -right-8 -top-8 size-28 rounded-full bg-cyan-300/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-8 flex items-start justify-between">
                        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl shadow-inner">{getSubjectIcon(subject.slug)}</div>
                        <ArrowUpRight className="size-4 text-foreground-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      <h3 className="font-bold text-white">{subject.name}</h3>
                      <p className="mt-1 text-xs text-foreground-muted">{uploadCounts[subject.slug] || 0} risorse disponibili</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {recentUploads.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.18em] text-pink-300/80">Attività</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Ultime risorse</h2>
                </div>
                <Link href="/consigli" className="hidden items-center gap-1 text-sm font-semibold text-foreground-muted hover:text-white sm:flex">
                  Consigli <TrendingUp className="size-4" />
                </Link>
              </div>
              <div className="grid gap-3">
                {recentUploads.slice(0, 6).map((upload) => (
                  <Link key={upload.id} href={upload.subject_slug ? `/materie/${upload.subject_slug}` : '/materie'} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-4 transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[.05]">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <FileText className="size-4 text-cyan-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{upload.original_filename}</p>
                        <p className="mt-1 truncate text-xs text-foreground-muted">{upload.subject_name || 'Risorsa condivisa'}</p>
                      </div>
                    </div>
                    <time className="shrink-0 text-[11px] font-medium text-foreground-muted">{new Date(upload.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</time>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
        <Footer />
      </main>

      <motion.button
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: .98 }}
        onClick={() => setUploadModalOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-violet-600 to-cyan-500 px-5 font-bold text-white shadow-[0_14px_40px_rgba(0,0,0,.3)] lg:bottom-7 lg:right-7"
      >
        <Plus className="size-5" /> <span>Condividi</span>
      </motion.button>

      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} subjects={subjects} professors={professors} subjectProfessors={subjectProfessors} />
      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
