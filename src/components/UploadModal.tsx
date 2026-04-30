'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Shield, Mail } from 'lucide-react';
import GoogleDriveUploader from './GoogleDriveUploader';

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

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@notehub.local';

export default function UploadModal({ isOpen, onClose, subjects, professors, subjectProfessors }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploaderName, setUploaderName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedProfessor('');
      setSelectedSubject('');
      setUploaderName('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const filteredSubjects = subjectProfessors
    .filter((sp) => sp.professor_id === selectedProfessor)
    .map((sp) => {
      const subject = subjects.find(s => s.id === sp.subject_id);
      return subject;
    })
    .filter(Boolean) as Subject[];

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => onClose(), 1500);
  };

  const handleError = (err: string) => {
    setError(err);
    setUploading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="neu-modal w-full max-w-lg p-6 shadow-neu-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Carica Appunti
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-foreground-light rounded-neu neu-button premium-transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Admin deletion notice */}
                <div className="mb-5 p-3 rounded-neu neu-surface-pressed">
                <div className="flex items-start gap-2">
                  <Shield className="size-4 text-foreground-light mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      I file non possono essere eliminati dopo il caricamento
                    </p>
                    <p className="text-xs text-foreground-light mt-1">
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
                    <div className="w-16 h-16 rounded-neu-xl bg-mint/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="size-8 text-mint-dark" />
                  </div>
                  <p className="text-mint-dark font-medium">Upload completato!</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Il tuo nome <span className="text-foreground-muted font-normal">(facoltativo)</span>
                    </label>
                    <input
                      type="text"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      placeholder="Anonimo"
                      maxLength={100}
                       className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Professore <span className="text-coral-dark font-normal">*</span>
                    </label>
                    <select
                      value={selectedProfessor}
                      onChange={(e) => {
                        setSelectedProfessor(e.target.value);
                        setSelectedSubject('');
                      }}
                      required
                       className="w-full px-4 py-3 neu-input rounded-neu text-foreground outline-none premium-transition [&>option]:bg-neu-surface"
                     >
                       <option value="">Seleziona professore</option>
                      {professors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProfessor && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Materia <span className="text-coral-dark font-normal">*</span>
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                       className="w-full px-4 py-3 neu-input rounded-neu text-foreground outline-none premium-transition [&>option]:bg-neu-surface"
                       >
                         <option value="">Seleziona materia</option>
                        {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        )) : (
                          <option disabled>Nessuna materia disponibile per questo professore</option>
                        )}
                      </select>
                    </div>
                  )}

                  {selectedSubject && (
                    <GoogleDriveUploader
                      subjectId={selectedSubject}
                      professorId={selectedProfessor}
                      uploaderName={uploaderName}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  )}

                  {error && (
                      <div className="p-3 bg-coral/10 border border-coral/20 text-coral-dark text-sm rounded-neu">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                       className="px-5 py-2.5 text-sm font-semibold text-foreground neu-button rounded-neu premium-transition"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
