'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Plus, ChevronRight, Search, ArrowLeft, Files, GraduationCap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileCard from '@/components/FileCard';
import { FileListSkeleton } from '@/components/Skeleton';
import UploadModal from '@/components/UploadModal';
import Toast, { useToast } from '@/components/Toast';
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
  professor_name?: string;
  created_at: string;
  mime_type: string;
  size_bytes: number;
  download_url?: string;
  view_url?: string;
}

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const fetchMetadata = useCallback(async () => {
    try {
      const response = await fetch('/api/public/catalog');
      if (!response.ok) return;

      const data = await response.json();
      const subjectsData = data.subjects || [];
      setAllSubjects(subjectsData);
      setProfessors(data.professors || []);
      setSubjectProfessors(data.subjectProfessors || []);

      if (subjectsData.length > 0) {
        const found = subjectsData.find((s: Subject) => s.slug === slug);
        if (found) setSubject(found);
      }
    } catch (error) {
      console.error('Metadata fetch error:', error);
    }
  }, [slug]);

  const fetchUploads = useCallback(async () => {
    if (!subject || !selectedProfessor) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set('subject_id', subject.id);
      p.set('professor_id', selectedProfessor.id);
      if (search) p.set('search', search);
      p.set('limit', '50');

      const res = await fetch(`/api/files?${p}`);
      const data = await res.json();
      if (res.ok) setUploads(data.uploads || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [subject, selectedProfessor, search]);

  useEffect(() => { fetchMetadata(); }, [fetchMetadata]);
  useEffect(() => {
    if (subject && selectedProfessor) {
      fetchUploads();
    }
  }, [subject, selectedProfessor, search, fetchUploads]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <BookOpen className="size-10 text-foreground-muted" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Materia non trovata</h1>
          <button onClick={() => router.push('/materie')} className="text-neon-purple hover:underline font-medium">
            Torna alle materie
          </button>
        </div>
      </div>
    );
  }

  const filteredProfs = subjectProfessors
    .filter((sp) => sp.subject_id === subject.id)
    .map((sp) => sp.professor)
    .filter(Boolean) as Professor[];

  const icon = getSubjectIcon(subject.slug);
  const gradient = getSubjectGradient(subject.slug);

  const getBreadcrumbs = () => {
    if (selectedProfessor) {
      return [
        { label: 'Materie', href: '/materie' },
        { label: subject.name, href: `/materie/${subject.slug}` },
        { label: selectedProfessor.name },
      ];
    }
    return [
      { label: 'Materie', href: '/materie' },
      { label: subject.name },
    ];
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Header breadcrumbs={getBreadcrumbs()} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subject Header */}
          <div className="flex items-center gap-4 mb-8 mt-6">
            <button
              onClick={() => router.push('/materie')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="size-5 text-foreground-muted" />
            </button>
            <div className={`size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white">
                {subject.name}
              </h1>
              <p className="text-sm text-foreground-muted flex items-center gap-2 mt-1">
                <Files className="size-4" />
                {filteredProfs.length} {filteredProfs.length === 1 ? 'professore' : 'professori'}
              </p>
            </div>
          </div>

          {/* Professor Selection */}
          {!selectedProfessor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-semibold text-white mb-4">Professori</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProfs.map((prof) => (
                  <motion.div key={prof.id} whileHover={{ scale: 1.02, y: -5 }}>
                    <button
                      onClick={() => setSelectedProfessor(prof)}
                      className="glass-panel p-6 text-left block w-full group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="size-12 rounded-xl bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <GraduationCap className="size-6 text-neon-blue" />
                        </div>
                        <ChevronRight className="size-5 text-foreground-muted group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1 relative z-10">
                        {prof.name}
                      </h3>
                      <p className="text-sm text-foreground-muted relative z-10">
                        Clicca per visualizzare i file
                      </p>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* All files for this subject */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-white mb-6">Tutti i file della materia</h2>
                <SubjectAllFiles subject={subject} />
              </div>
            </motion.div>
          )}

          {/* Files View (after professor selected) */}
          {selectedProfessor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => { setSelectedProfessor(null); setUploads([]); setSearch(''); }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ChevronRight className="size-5 text-foreground-muted rotate-180" />
                </button>
                <div className="size-12 rounded-2xl bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(67,97,238,0.2)]">
                  <GraduationCap className="size-6 text-neon-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedProfessor.name}
                  </h2>
                  <p className="text-sm text-foreground-muted mt-1">
                    {uploads.length} {uploads.length === 1 ? 'file' : 'file'}
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca file..."
                    className="w-full text-sm pl-12 pr-4 py-3 bg-black/50 border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple rounded-xl text-white placeholder-foreground-muted outline-none transition-all"
                  />
                </div>
              </div>

              {/* Files */}
              {loading ? (
                <FileListSkeleton />
              ) : uploads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploads.map((upload, index) => (
                    <FileCard key={upload.id} file={upload} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                    <FileText className="size-10 text-foreground-muted" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nessun file</h3>
                  <p className="text-sm text-foreground-muted mb-8">
                    Non ci sono file per questo professore
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(157, 78, 221, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue border border-white/20 shadow-lg text-white rounded-full text-sm font-semibold transition-all"
                  >
                    <Plus className="size-4 mr-1.5" />
                    Carica un file
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <Footer />
      </main>

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

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          if (selectedProfessor && subject) {
            fetchUploads();
          }
        }}
        subjects={allSubjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}

function SubjectAllFiles({ subject }: { subject: Subject }) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/files?subject_id=${subject.id}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        setUploads(data.uploads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject.id]);

  if (loading) return <FileListSkeleton />;
  if (uploads.length === 0) {
    return <p className="text-sm text-foreground-muted">Nessun file disponibile</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {uploads.map((upload, index) => (
        <FileCard key={upload.id} file={upload} index={index} />
      ))}
    </div>
  );
}
