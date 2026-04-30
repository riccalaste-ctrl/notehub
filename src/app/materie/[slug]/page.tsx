'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Plus, ChevronRight, Search } from 'lucide-react';
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Materia non trovata</h1>
          <button onClick={() => router.push('/materie')} className="text-lavender hover:underline">
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

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        onOpenUpload={() => setUploadModalOpen(true)}
        breadcrumbs={[
          { label: 'Materie', href: '/materie' },
          { label: subject.name },
        ]}
      />

      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subject Header */}
          <div className="flex items-center gap-4 mb-8 mt-6">
            <div className="size-16 rounded-xl gradient-sage flex items-center justify-center">
              <BookOpen className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">{subject.name}</h1>
              <p className="text-stone-700">{uploads.length} {uploads.length === 1 ? 'file' : 'file'} disponibili</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="top-1/2 -translate-y-1/2 size-5 absolute left-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cerca in ${subject.name}...`}
              className="w-full text-sm pl-12 pr-4 py-3 rounded-2xl glass-input text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition"
            />
          </div>

          {/* Professor Filter */}
          {filteredProfs.length > 0 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <span className="text-sm text-stone-700 mr-2 font-medium">Professore:</span>
              <button
                onClick={() => setProfessorFilter('')}
                className={`rounded-full text-xs px-3 h-7 whitespace-nowrap font-medium premium-transition ${
                  !professorFilter ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Tutti
              </button>
              {filteredProfs.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setProfessorFilter(prof.id)}
                  className={`rounded-full text-xs px-3 h-7 whitespace-nowrap font-medium premium-transition ${
                    professorFilter === prof.id ? 'bg-lavender text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
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
              <p className="text-sm text-stone-700 mb-6">Non ci sono file per questa materia</p>
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
        onClose={() => setUploadModalOpen(false)}
        subjects={allSubjects.filter((s) => s.enabled)}
        professors={professors}
        subjectProfessors={subjectProfessors}
      />

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
