'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Plus, FileText, Users } from 'lucide-react';
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
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [search, setSearch] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const getSubjectsForProfessor = useCallback((professorId: string) => {
    return subjectProfessors
      .filter((sp) => sp.professor_id === professorId)
      .map((sp) => {
        const subject = subjects.find(s => s.id === sp.subject_id);
        return subject;
      })
      .filter(Boolean) as Subject[];
  }, [subjectProfessors, subjects]);

  const fetchData = useCallback(async (subjectId: string, professorId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('subject_id', subjectId);
      params.set('professor_id', professorId);
      if (search) params.set('search', search);
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
  }, [search, showToast]);

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
    if (selectedSubject && selectedProfessor) {
      const timer = setTimeout(() => {
        fetchData(selectedSubject.id, selectedProfessor.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSubject, selectedProfessor, search, fetchData]);

  const handleProfessorClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    setSelectedSubject(null);
    setUploads([]);
    setSearch('');
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToProfessors = () => {
    setSelectedProfessor(null);
    setSelectedSubject(null);
    setUploads([]);
    setSearch('');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setUploads([]);
    setSearch('');
  };

  const getBreadcrumbs = () => {
    if (selectedSubject && selectedProfessor) {
      return [
        { label: 'Materie', href: '/materie' },
        { label: selectedProfessor.name, href: '#', onClick: handleBackToSubjects },
        { label: selectedSubject.name },
      ];
    }
    if (selectedProfessor) {
      return [
        { label: 'Materie', href: '/materie' },
        { label: selectedProfessor.name },
      ];
    }
    return [{ label: 'Materie' }];
  };

  return (
    <div className="min-h-screen bg-neu-base">
      <Header
        onOpenUpload={() => setUploadModalOpen(true)}
        breadcrumbs={getBreadcrumbs().map(crumb => ({
          label: crumb.label,
          href: crumb.href,
        }))}
      />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Professor Selection View */}
          {!selectedProfessor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-semibold text-foreground mb-2 mt-6">
                Tutti i Professori
              </h1>
              <p className="text-base text-foreground-light mb-8">
                Seleziona un professore per visualizzare le materie e i file disponibili
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {professors.map((professor) => {
                  const professorSubjects = getSubjectsForProfessor(professor.id);
                  return (
                    <button
                      key={professor.id}
                      onClick={() => handleProfessorClick(professor)}
                      className="neu-card p-6 text-left block w-full"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="size-12 rounded-neu gradient-lavender flex items-center justify-center">
                          <Users className="size-6 text-white" />
                        </div>
                        <ChevronRight className="size-5 text-foreground-muted" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {professor.name}
                      </h3>
                      <p className="text-sm text-foreground-light">
                        {professorSubjects.length} {professorSubjects.length === 1 ? 'materia' : 'materie'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Subject Selection View (after professor selected) */}
          {selectedProfessor && !selectedSubject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-8 mt-6">
                <button
                  onClick={handleBackToProfessors}
                  className="p-2 rounded-neu neu-button premium-transition"
                >
                  <ChevronRight className="size-5 text-foreground-light rotate-180" />
                </button>
                <div className="size-14 rounded-neu gradient-lavender flex items-center justify-center">
                  <Users className="size-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {selectedProfessor.name}
                  </h1>
                  <p className="text-sm text-foreground-light">
                    Seleziona una materia
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSubjectsForProfessor(selectedProfessor.id).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="neu-card p-6 text-left block w-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-12 rounded-neu gradient-mint flex items-center justify-center">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <ChevronRight className="size-5 text-foreground-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-foreground-light">
                      Clicca per visualizzare i file
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Files View (after professor and subject selected) */}
          {selectedProfessor && selectedSubject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Subject Header */}
              <div className="flex items-center gap-4 mb-8 mt-6">
                <button
                  onClick={handleBackToSubjects}
                  className="p-2 rounded-neu neu-button premium-transition"
                >
                  <ChevronRight className="size-5 text-foreground-light rotate-180" />
                </button>
                <div className="size-14 rounded-neu gradient-mint flex items-center justify-center">
                  <BookOpen className="size-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {selectedSubject.name}
                  </h1>
                  <p className="text-sm text-foreground-light">
                    {selectedProfessor.name} · {uploads.length} {uploads.length === 1 ? 'file' : 'file'}
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca file..."
                  className="w-full max-w-md px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                />
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
                  <div className="w-16 h-16 rounded-neu-lg neu-surface flex items-center justify-center mx-auto mb-4">
                    <FileText className="size-8 text-foreground-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nessun file</h3>
                  <p className="text-sm text-foreground-light mb-6">
                    Non ci sono file per questa materia
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
        onClose={() => {
          setUploadModalOpen(false);
          if (selectedSubject && selectedProfessor) {
            fetchData(selectedSubject.id, selectedProfessor.id);
          }
        }}
        subjects={subjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
