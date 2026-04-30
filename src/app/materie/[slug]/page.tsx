'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Plus, ChevronRight, Search, Filter, ArrowLeft, Files, GraduationCap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileCard from '@/components/FileCard';
import { FileListSkeleton } from '@/components/Skeleton';
import UploadModal from '@/components/UploadModal';
import Toast, { useToast } from '@/components/Toast';

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
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [professorFilter, setProfessorFilter] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const fetchMetadata = useCallback(async () => {
    try {
      const [subjectsRes, professorsRes, subjectProfessorsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/subject-professors'),
      ]);

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setAllSubjects(data);
        const found = data.find((s: Subject) => s.slug === slug);
        if (found) setSubject(found);
      }
      if (professorsRes.ok) setProfessors(await professorsRes.json());
      if (subjectProfessorsRes.ok) setSubjectProfessors(await subjectProfessorsRes.json());
    } catch (error) {
      console.error('Metadata fetch error:', error);
    }
  }, [slug]);

  const fetchUploads = useCallback(async () => {
    if (!subject) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set('subject_id', subject.id);
      if (search) p.set('search', search);
      if (professorFilter) p.set('professor_id', professorFilter);
      p.set('limit', '50');

      const res = await fetch(`/api/files?${p}`);
      const data = await res.json();
      if (res.ok) setUploads(data.uploads || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [subject, search, professorFilter]);

  useEffect(() => { fetchMetadata(); }, [fetchMetadata]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchUploads(); }, 300);
    return () => clearTimeout(timer);
  }, [fetchUploads]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-neu-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-neu-xl neu-surface flex items-center justify-center mx-auto mb-4">
            <BookOpen className="size-8 text-foreground-muted" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Materia non trovata</h1>
          <button onClick={() => router.push('/materie')} className="text-lavender-dark hover:underline font-medium">
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

  const getBreadcrumbs = () => {
    if (professorFilter) {
      const prof = professors.find(p => p.id === professorFilter);
      return [
        { label: 'Materie', href: '/materie' },
        { label: subject.name, href: `/materie/${subject.slug}` },
        { label: prof?.name || 'Professore' },
      ];
    }
    return [
      { label: 'Materie', href: '/materie' },
      { label: subject.name },
    ];
  };

  return (
    <div className="min-h-screen bg-neu-base">
      <Header
        onOpenUpload={() => setUploadModalOpen(true)}
        breadcrumbs={getBreadcrumbs()}
      />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subject Header */}
          <div className="flex items-center gap-4 mb-8 mt-6">
            <button
              onClick={() => { setUploadModalOpen(false); router.push('/materie'); }}
              className="p-2 rounded-neu neu-button premium-transition"
            >
              <ArrowLeft className="size-5 text-foreground-light" />
            </button>
            <div className="size-14 rounded-neu gradient-lavender flex items-center justify-center shadow-neu">
              <BookOpen className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                {subject.name}
              </h1>
              <p className="text-sm text-foreground-light flex items-center gap-2">
                <Files className="size-4" />
                {uploads.length} {uploads.length === 1 ? 'file' : 'file'} disponibili
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Cerca in ${subject.name}...`}
                className="w-full text-sm pl-12 pr-4 py-3 rounded-neu neu-input text-foreground placeholder-foreground-muted outline-none premium-transition"
              />
            </div>

            {filteredProfs.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="size-4 text-foreground-light flex-shrink-0" />
                <span className="text-sm text-foreground-light font-medium flex-shrink-0">Professore:</span>
                <button
                  onClick={() => setProfessorFilter('')}
                  className={`rounded-neu text-xs px-4 h-10 whitespace-nowrap font-medium premium-transition ${
                    !professorFilter
                      ? 'shadow-neu-pressed text-lavender-dark bg-neu-surface'
                      : 'neu-button text-foreground-light hover:text-foreground'
                  }`}
                >
                  Tutti
                </button>
                {filteredProfs.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setProfessorFilter(prof.id)}
                    className={`rounded-neu text-xs px-4 h-10 whitespace-nowrap font-medium premium-transition flex items-center gap-1.5 ${
                      professorFilter === prof.id
                        ? 'shadow-neu-pressed text-lavender-dark bg-neu-surface'
                        : 'neu-button text-foreground-light hover:text-foreground'
                    }`}
                  >
                    <GraduationCap className="size-3" />
                    {prof.name}
                  </button>
                ))}
              </div>
            )}
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
              <div className="w-20 h-20 rounded-neu-xl neu-surface flex items-center justify-center mx-auto mb-6">
                <FileText className="size-10 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun file</h3>
              <p className="text-sm text-foreground-light mb-6">
                Non ci sono file per questa materia{professorFilter ? ' con questo professore' : ''}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-5 py-2.5 gradient-primary text-white rounded-neu text-sm font-medium premium-transition"
              >
                <Plus className="size-4 mr-1.5" />
                Carica un file
              </motion.button>
            </div>
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
        onClose={() => {
          setUploadModalOpen(false);
          fetchUploads();
        }}
        subjects={allSubjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
