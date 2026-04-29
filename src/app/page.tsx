'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Adesso';
  if (minutes < 60) return `${minutes}m fa`;
  if (hours < 24) return `${hours}h fa`;
  if (days < 7) return `${days}g fa`;
  
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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

  const filteredProfessors = useMemo(() => {
    if (!filters.subjectId) return professors;
    const prof_ids = subjectProfessors
      .filter((sp) => sp.subject_id === filters.subjectId)
      .map((sp) => sp.professor_id);
    return professors.filter((p) => prof_ids.includes(p.id));
  }, [filters.subjectId, professors, subjectProfessors]);

  return (
    <div className="min-h-screen flex flex-col bg-lime-500">
      <Header onOpenUpload={() => setUploadModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Accedi ai vostri appunti
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              La piattaforma dove gli studenti condividono appunti, dispense e risorse scolastiche in modo ordinato e efficiente.
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Carica File
            </button>
            <a
              href="#filtri"
              className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-semibold transition-colors"
            >
              Sfoglia File
            </a>
          </div>
        </div>

        {/* Search and Filters */}
        <div id="filtri" className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="mb-4">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Cerca file..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value, professorId: '' }))}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
              >
                Ripristina Filtri
              </button>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div>
          {loading ? (
            <FileListSkeleton />
          ) : uploads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploads.map((upload) => (
                <FileCard key={upload.id} file={upload} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Nessun file trovato</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Prova a modificare i filtri o carica il primo file!</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Carica il primo file
              </button>
            </div>
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

      {toast && <Toast {...toast} onClose={hideToast} />}
      <Footer />
    </div>
  );
}
