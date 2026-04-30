'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Shield, Mail } from 'lucide-react';

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

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  professors: Professor[];
  subjectProfessors: SubjectProfessor[];
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@notehub.local';

export default function UploadModal({ isOpen, onClose, subjects, professors, subjectProfessors }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSubject('');
      setSelectedProfessor('');
      setUploaderName('');
      setFile(null);
      setError('');
      setSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const filteredProfessors = subjectProfessors
    .filter((sp) => sp.subject_id === selectedSubject)
    .map((sp) => sp.professor)
    .filter(Boolean) as Professor[];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File troppo grande. Dimensione massima: 20MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !selectedSubject) {
      setError('Seleziona un file e una materia');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          professorId: selectedProfessor || undefined,
          uploaderName: uploaderName || undefined,
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-800/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card w-full max-w-lg p-6 shadow-glass-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-stone-900">
                  Carica Appunti
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 premium-transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Admin deletion notice */}
              <div className="mb-5 p-3 rounded-xl bg-stone-100 border border-stone-200">
                <div className="flex items-start gap-2">
                  <Shield className="size-4 text-stone-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      I file non possono essere eliminati dopo il caricamento
                    </p>
                    <p className="text-xs text-stone-700 mt-1">
                      Per richiedere la rimozione di un file, contatta l&apos;amministratore:
                    </p>
                    <a
                      href={`mailto:${ADMIN_EMAIL}`}
                      className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-lavender-dark hover:underline"
                    >
                      <Mail className="size-3" />
                      {ADMIN_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-3xl bg-sage/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="size-8 text-sage-dark" />
                  </div>
                  <p className="text-sage-dark font-medium">Upload completato!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-800 mb-1">
                      Il tuo nome <span className="text-stone-500 font-normal">(facoltativo)</span>
                    </label>
                    <input
                      type="text"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      placeholder="Anonimo"
                      maxLength={100}
                      className="w-full px-4 py-3 glass-input rounded-2xl text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-800 mb-1">
                      Materia <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSelectedProfessor('');
                      }}
                      required
                      className="w-full px-4 py-3 glass-input rounded-2xl text-stone-900 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition [&>option]:bg-white"
                    >
                      <option value="">Seleziona materia</option>
                      {subjects.filter(s => s.enabled).map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSubject && filteredProfessors.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-stone-800 mb-1">
                        Professore <span className="text-stone-500 font-normal">(facoltativo)</span>
                      </label>
                      <select
                        value={selectedProfessor}
                        onChange={(e) => setSelectedProfessor(e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-2xl text-stone-900 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition [&>option]:bg-white"
                      >
                        <option value="">Seleziona professore</option>
                        {filteredProfessors.map((professor) => (
                          <option key={professor.id} value={professor.id}>
                            {professor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-stone-800 mb-1">
                      File <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                      className="w-full px-4 py-3 glass-input rounded-2xl text-stone-900 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-lavender/20 file:text-lavender-dark file:text-sm file:cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-stone-600">
                      Max 20MB. Permessi: PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>

                  {file && (
                    <div className="p-3 glass-input rounded-2xl">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-stone-700">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-semibold text-stone-800 rounded-2xl hover:bg-stone-100 premium-transition"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file || !selectedSubject}
                      className="px-5 py-2.5 text-sm font-semibold text-white gradient-primary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center premium-transition"
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Caricamento...
                        </>
                      ) : (
                        <>
                          <Plus className="size-4 mr-1.5" />
                          Carica
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
