'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Plus, FileText, GraduationCap } from 'lucide-react';
import Link from 'next/link';
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

  const getProfessorsForSubject = useCallback((subjectId: string) => {
    return subjectProfessors
      .filter((sp) => sp.subject_id === subjectId)
      .map((sp) => sp.professor)
      .filter(Boolean) as Professor[];
  }, [subjectProfessors]);

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
      const response = await fetch('/api/public/catalog');
      if (!response.ok) return;

      const data = await response.json();
      setSubjects(data.subjects || []);
      setProfessors(data.professors || []);
      setSubjectProfessors(data.subjectProfessors || []);
    } catch (error) {
      console.error('Metadata fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (selectedSubject && selectedProfessor) {
      fetchData(selectedSubject.id, selectedProfessor.id);
    }
  }, [selectedSubject, selectedProfessor, search, fetchData]);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedProfessor(null);
    setUploads([]);
    setSearch('');
  };

  const handleProfessorClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    setUploads([]);
    setSearch('');
  };

  const handleBackToSubjects = () => {
    setSelectedProfessor(null);
    setUploads([]);
    setSearch('');
  };

  const handleBackToRoot = () => {
    setSelectedSubject(null);
    setSelectedProfessor(null);
    setUploads([]);
    setSearch('');
  };

  const getBreadcrumbs = () => {
    if (selectedSubject && selectedProfessor) {
      return [
        { label: 'Materie', href: '/materie' },
        { label: selectedSubject.name, href: '/materie' },
        { label: selectedProfessor.name },
      ];
    }
    if (selectedSubject) {
      return [
        { label: 'Materie', href: '/materie' },
        { label: selectedSubject.name },
      ];
    }
    return [{ label: 'Materie' }];
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Header
        breadcrumbs={getBreadcrumbs().map(crumb => ({
          label: crumb.label,
          href: crumb.href,
        }))}
      />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Subject Cards */}
          {!selectedSubject && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-semibold text-white mb-2 mt-6">
                Materie
              </h1>
              <p className="text-foreground-muted mb-8">
                Seleziona una materia per visualizzare i professori
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {subjects.filter(s => s.enabled).map((subject) => {
                  const profs = getProfessorsForSubject(subject.id);
                  const icon = getSubjectIcon(subject.slug);
                  const gradient = getSubjectGradient(subject.slug);
                  return (
                    <motion.div key={subject.id} whileHover={{ scale: 1.03, y: -5 }}>
                      <button
                        onClick={() => handleSubjectClick(subject)}
                        className="glass-panel p-6 text-left block w-full relative overflow-hidden group"
                      >
                        <div className="absolute -right-6 -top-6 size-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors duration-500" />
                        <div className={`size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300`}>
                          {icon}
                        </div>
                        <h3 className="font-semibold text-white text-base mb-1">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-foreground-muted">
                          {profs.length} {profs.length === 1 ? 'professore' : 'professori'}
                        </p>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Professor Cards (after subject selected) */}
          {selectedSubject && !selectedProfessor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-8 mt-6">
                <button
                  onClick={handleBackToRoot}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ChevronRight className="size-5 text-foreground-muted rotate-180" />
                </button>
                <div className={`size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {getSubjectIcon(selectedSubject.slug)}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {selectedSubject.name}
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Seleziona un professore per visualizzare i file
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {getProfessorsForSubject(selectedSubject.id).map((professor) => (
                  <motion.div key={professor.id} whileHover={{ scale: 1.02, y: -5 }}>
                    <button
                      onClick={() => handleProfessorClick(professor)}
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
                        {professor.name}
                      </h3>
                      <p className="text-sm text-foreground-muted relative z-10">
                        Clicca per visualizzare i file
                      </p>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Files (after subject and professor selected) */}
          {selectedSubject && selectedProfessor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-8 mt-6">
                <button
                  onClick={handleBackToSubjects}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ChevronRight className="size-5 text-foreground-muted rotate-180" />
                </button>
                <div className="size-14 rounded-2xl bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(67,97,238,0.2)]">
                  <GraduationCap className="size-7 text-neon-blue" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {selectedProfessor.name}
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    {selectedSubject.name} · {uploads.length} {uploads.length === 1 ? 'file' : 'file'}
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
                  className="w-full max-w-md px-4 py-3 bg-black/50 border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple rounded-xl text-white placeholder-foreground-muted outline-none transition-all"
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

      {/* Floating Upload Button */}
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
