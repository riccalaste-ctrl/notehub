'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileCard from '@/components/FileCard';
import { FileListSkeleton } from '@/components/Skeleton';
import UploadModal from '@/components/UploadModal';
import Toast, { useToast } from '@/components/Toast';
import CommandBar from '@/components/CommandBar';

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

const gradientClasses = [
  'gradient-sage',
  'gradient-lavender',
  'gradient-peach',
];

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    subjectId: '',
    professorId: '',
  });
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.subjectId) params.set('subject_id', filters.subjectId);
      if (filters.professorId) params.set('professor_id', filters.professorId);
      params.set('limit', '50');

      const res = await fetch(`/api/files?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUploads(data.uploads || []);
      } else {
        showToast(data.error || 'Errore nel caricamento file', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Errore di connessione', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [subjectsRes, professorsRes, subjectProfessorsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/subject-professors'),
      ]);

      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (professorsRes.ok) setProfessors(await professorsRes.json());
      if (subjectProfessorsRes.ok) setSubjectProfessors(await subjectProfessorsRes.json());
    } catch (error) {
      console.error('Metadata fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, fetchData, refreshKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProfessors = useMemo(() => {
    if (!filters.subjectId) return professors;
    const prof_ids = subjectProfessors
      .filter((sp) => sp.subject_id === filters.subjectId)
      .map((sp) => sp.professor_id);
    return professors.filter((p) => prof_ids.includes(p.id));
  }, [filters.subjectId, professors, subjectProfessors]);

  const handleCommandSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setCommandBarOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header onOpenUpload={() => setUploadModalOpen(true)} breadcrumbs={[{ label: 'Materie', href: '/' }, { label: 'Dashboard' }]} />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mb-12 mt-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
              <div>
                <h1 className="leading-tight font-extrabold text-4xl tracking-tight text-stone-800">
                  Esplora gli Appunti
                </h1>
                <p className="text-base text-stone-500 mt-2">
                  Seleziona una disciplina per accedere ai documenti
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <div className="font-medium rounded-full text-xs px-3 h-8 flex items-center gap-1.5 glass-input text-stone-600">
                  <Clock className="size-3.5 text-sage-dark" />
                  {uploads.length} documenti
                </div>
                <div className="font-medium rounded-full text-xs px-3 h-8 flex items-center gap-1.5 glass-input text-stone-600">
                  <Users className="size-3.5 text-lavender" />
                  {subjects.filter(s => s.enabled).length} materie
                </div>
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <button
                onClick={() => setFilters({ search: '', subjectId: '', professorId: '' })}
                className={`transition-all duration-300 ease-out font-medium rounded-full text-sm px-4 h-9 whitespace-nowrap ${
                  !filters.subjectId
                    ? 'gradient-primary border border-white/60 shadow-lavender text-white'
                    : 'glass-input text-stone-600 hover:text-stone-800'
                }`}
              >
                Tutti
              </button>
              {subjects.filter(s => s.enabled).map((subject, i) => (
                <button
                  key={subject.id}
                  onClick={() => setFilters((prev) => ({ ...prev, subjectId: prev.subjectId === subject.id ? '' : subject.id, professorId: '' }))}
                  className={`transition-all duration-300 ease-out font-medium rounded-full text-sm px-4 h-9 whitespace-nowrap ${
                    filters.subjectId === subject.id
                      ? `${gradientClasses[i % gradientClasses.length]} border border-white/60 text-white shadow-lg`
                      : 'glass-input text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="top-1/2 -translate-y-1/2 size-5 absolute left-4 text-lavender" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Cerca argomento, autore, file..."
                className="w-full text-sm pl-12 pr-4 py-3 rounded-2xl glass-input text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition"
              />
            </div>

            {/* Professor Filter */}
            {filters.subjectId && filteredProfessors.length > 0 && (
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <span className="text-sm text-stone-500 mr-2">Professore:</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, professorId: '' }))}
                  className={`transition-all duration-300 rounded-full text-xs px-3 h-7 whitespace-nowrap ${
                    !filters.professorId
                      ? 'bg-stone-800 text-white'
                      : 'glass-input text-stone-600'
                  }`}
                >
                  Tutti
                </button>
                {filteredProfessors.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setFilters((prev) => ({ ...prev, professorId: prof.id }))}
                    className={`transition-all duration-300 rounded-full text-xs px-3 h-7 whitespace-nowrap ${
                      filters.professorId === prof.id
                        ? 'bg-lavender text-white'
                        : 'glass-input text-stone-600'
                    }`}
                  >
                    {prof.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Files Grid */}
          <div>
            {loading ? (
              <FileListSkeleton />
            ) : uploads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploads.map((upload, index) => (
                  <FileCard key={upload.id} file={upload} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/50 flex items-center justify-center mx-auto mb-6 shadow-glass-sm">
                  <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Nessun file trovato</h3>
                <p className="text-sm text-stone-500 mb-8">Prova a modificare i filtri o carica il primo file!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 gradient-primary text-white rounded-full font-medium premium-transition shadow-lavender"
                >
                  <Plus className="size-4 mr-2" />
                  Carica il primo file
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </main>

      {/* Floating Upload Button */}
      <div className="fixed right-6 bottom-6 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-5 font-semibold rounded-full text-white h-14 gradient-tri border border-white/60 shadow-glass-lg premium-transition"
        >
          <Plus className="size-5 mr-2" />
          Carica Appunti
        </motion.button>
      </div>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
        subjects={subjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onSearch={handleCommandSearch}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
