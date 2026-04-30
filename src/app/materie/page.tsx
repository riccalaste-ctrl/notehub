'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Users, Clock, ChevronRight, Plus, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
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

export default function MateriePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    professorId: '',
  });
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async (subjectId?: string) => {
    if (!subjectId) {
      setUploads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('subject_id', subjectId);
      if (filters.search) params.set('search', filters.search);
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
    if (selectedSubject) {
      const timer = setTimeout(() => {
        fetchData(selectedSubject.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSubject, filters, fetchData]);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setFilters({ search: '', professorId: '' });
  };

  const filteredProfessors = subjectProfessors
    .filter((sp) => selectedSubject && sp.subject_id === selectedSubject.id)
    .map((sp) => sp.professor)
    .filter(Boolean) as Professor[];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        onOpenUpload={() => setUploadModalOpen(true)}
        breadcrumbs={selectedSubject ? [
          { label: 'Materie', href: '/materie' },
          { label: selectedSubject.name },
        ] : [{ label: 'Materie' }]}
      />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedSubject ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-extrabold text-stone-900 mb-2 mt-6">
                Tutte le Materie
              </h1>
              <p className="text-base text-stone-700 mb-8">
                Seleziona una materia per visualizzare i file disponibili
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.filter(s => s.enabled).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="glass-card bento-card p-6 text-left block w-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-12 rounded-xl gradient-lavender flex items-center justify-center">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <ChevronRight className="size-5 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-stone-600">
                      Clicca per esplorare i file
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Subject Header */}
              <div className="flex items-center gap-4 mb-8 mt-6">
                <button
                  onClick={() => { setSelectedSubject(null); setUploads([]); }}
                  className="p-2 rounded-xl hover:bg-stone-200/50 premium-transition"
                >
                  <ChevronRight className="size-5 text-stone-700 rotate-180" />
                </button>
                <div className="size-14 rounded-xl gradient-sage flex items-center justify-center">
                  <BookOpen className="size-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-stone-900">
                    {selectedSubject.name}
                  </h1>
                  <p className="text-sm text-stone-700">
                    {uploads.length} {uploads.length === 1 ? 'file' : 'file'} disponibili
                  </p>
                </div>
              </div>

              {/* Professor Filter */}
              {filteredProfessors.length > 0 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  <span className="text-sm text-stone-700 mr-2 font-medium">Professore:</span>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, professorId: '' }))}
                    className={`rounded-full text-xs px-3 h-7 whitespace-nowrap font-medium premium-transition ${
                      !filters.professorId
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    Tutti
                  </button>
                  {filteredProfessors.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setFilters((prev) => ({ ...prev, professorId: prof.id }))}
                      className={`rounded-full text-xs px-3 h-7 whitespace-nowrap font-medium premium-transition ${
                        filters.professorId === prof.id
                          ? 'bg-lavender text-white'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      {prof.name}
                    </button>
                  ))}
                </div>
              )}

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
                  <div className="w-16 h-16 rounded-2xl bg-stone-200 flex items-center justify-center mx-auto mb-4">
                    <FileText className="size-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Nessun file</h3>
                  <p className="text-sm text-stone-700 mb-6">
                    Non ci sono file per questa materia
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center px-5 py-2.5 gradient-primary text-white rounded-full text-sm font-medium premium-transition"
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-5 font-semibold rounded-full text-white h-14 gradient-tri premium-transition"
        >
          <Plus className="size-5 mr-2" />
          Carica
        </motion.button>
      </div>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          if (selectedSubject) fetchData(selectedSubject.id);
        }}
        subjects={subjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
