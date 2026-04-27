'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import FileCard from '@/components/FileCard';
import FileListSkeleton from '@/components/Skeleton';
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
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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

      const response = await fetch(`/api/files?${params.toString()}`);
      const data = await response.json();
      
      if (data.uploads) {
        setUploads(data.uploads);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      showToast('Errore nel caricamento dei file', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [subjectsRes, professorsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
      ]);

      const subjectsData = await subjectsRes.json();
      const professorsData = await professorsRes.json();

      if (subjectsData.subjects) {
        setSubjects(subjectsData.subjects);
      }
      if (professorsData.professors) {
        setProfessors(professorsData.professors);
      }

      const associationsRes = await fetch('/api/admin/subject-professors');
      const associationsData = await associationsRes.json();
      if (associationsData.associations) {
        setSubjectProfessors(associationsData.associations);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      <Header onOpenUpload={() => setUploadModalOpen(true)} />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              NoteHub
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Condividi e trova appunti della scuola
            </p>
            <p className="text-primary-200 max-w-2xl mx-auto">
              Accedi gratuitamente a migliaia di appunti condivisi da studenti come te.
              Trova_materiale per ogni materia e professore.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SearchBar
            subjects={subjects}
            professors={professors}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {uploads.length > 0 
                ? `${uploads.length} file trovato${uploads.length !== 1 ? 'i' : ''}`
                : 'Nessun file'}
            </h2>
          </div>

          {loading ? (
            <FileListSkeleton count={5} />
          ) : uploads.length > 0 ? (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <FileCard key={upload.id} file={upload} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Nessun file trovato. Prova a modificare i filtri di ricerca.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        subjects={subjects}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </>
  );
}