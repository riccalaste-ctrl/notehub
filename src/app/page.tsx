'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileCard from '@/components/FileCard';
import { FileListSkeleton } from '@/components/Skeleton';
import UploadModal from '@/components/UploadModal';
import Toast, { useToast } from '@/components/Toast';
import CommandBar from '@/components/CommandBar';
import ThreeBackground from '@/components/ThreeBackground';

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
    dateFrom: '',
    dateTo: '',
  });
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.subjectId) params.set('subject_id', filters.subjectId);
      if (filters.professorId) params.set('professor_id', filters.professorId);
      if (filters.dateFrom) params.set('date_from', filters.dateFrom);
      if (filters.dateTo) params.set('date_to', filters.dateTo);
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
    <div className="min-h-screen flex flex-col bg-navy relative">
      <ThreeBackground />

      <div className="relative z-10">
        <Header onOpenUpload={() => setUploadModalOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mb-16 mt-8"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-cobalt to-cobalt-light rounded-3xl flex items-center justify-center shadow-2xl shadow-cobalt/25 mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                SKAKK-<span className="text-cobalt-light">UP</span>
              </h1>
              <p className="text-base sm:text-lg text-silk-400 max-w-2xl mx-auto leading-relaxed px-4">
                Il Caveau Digitale della Conoscenza.
                <br className="hidden sm:block" />Precisione, velocità, eleganza per professionisti dello studio.
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-cobalt hover:bg-cobalt-light text-white rounded-2xl font-semibold premium-transition shadow-2xl shadow-cobalt/30 relative overflow-hidden group text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full premium-transition" />
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative z-10">Carica File</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCommandBarOpen(true)}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-silk-700 text-silk-300 hover:border-cobalt hover:text-white rounded-2xl font-semibold premium-transition hover:bg-cobalt/10 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cerca (⌘K)
              </motion.button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            id="filtri"
            className="glass rounded-3xl p-4 sm:p-6 mb-8 border border-white/10"
          >
            <div className="mb-4">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Cerca file..."
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-silk-500 outline-none focus:border-cobalt/50 focus:ring-1 focus:ring-cobalt/50 premium-transition text-sm sm:text-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <select
                value={filters.subjectId}
                onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value, professorId: '' }))}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cobalt/50 premium-transition [&>option]:bg-navy text-sm sm:text-base"
              >
                <option value="">Tutte le materie</option>
                {subjects.filter((s) => s.enabled).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.professorId}
                onChange={(e) => setFilters((prev) => ({ ...prev, professorId: e.target.value }))}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cobalt/50 premium-transition [&>option]:bg-navy text-sm sm:text-base"
              >
                <option value="">Tutti i professori</option>
                {filteredProfessors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {(filters.search || filters.subjectId || filters.professorId) && (
                <button
                  onClick={() => setFilters({ search: '', subjectId: '', professorId: '', dateFrom: '', dateTo: '' })}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-white/5 hover:bg-white/10 text-silk-300 rounded-2xl premium-transition border border-white/10 text-sm sm:text-base"
                >
                  Ripristina Filtri
                </button>
              )}
            </div>
          </motion.div>

          {/* Files Grid */}
          <div>
            {loading ? (
              <FileListSkeleton />
            ) : uploads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-silk-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Nessun file trovato</h3>
                <p className="text-sm sm:text-base text-silk-400 mb-8 px-4">Prova a modificare i filtri o carica il primo file!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-cobalt hover:bg-cobalt-light text-white rounded-2xl premium-transition shadow-lg shadow-cobalt/25 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Carica il primo file
                </motion.button>
              </motion.div>
            )}
          </div>
        </main>

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
        <Footer />
      </div>
    </div>
  );
}
