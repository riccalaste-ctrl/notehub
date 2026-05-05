'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Shield } from 'lucide-react';
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

export default function UploadModal({ isOpen, onClose, subjects, professors, subjectProfessors }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProfessor('');
      setSelectedSubject('');
      setUploaderName('');
      setError('');
      setSuccess(false);
      setStep(1);
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

  const handleContinue = () => {
    setError('');
    if (step === 1) {
      if (!selectedProfessor) {
        setError('Seleziona un professore');
        return;
      }
      if (filteredSubjects.length === 0) {
        setError('Nessuna materia associata a questo professore');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSubject) {
        setError('Seleziona una materia');
        return;
      }
      setStep(3);
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="glass-panel w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Carica Appunti
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-foreground-muted hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Admin deletion notice */}
              <div className="mb-5 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-start gap-3">
                  <Shield className="size-5 text-neon-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ogni file caricato viene associato al tuo account
                    </p>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                      Solo l&apos;autore puÃ² modificarlo o eliminarlo; l&apos;admin puÃ² rimuovere globalmente file segnalati.
                    </p>
                  </div>
                </div>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-neon-green/20 border border-neon-green/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,214,160,0.3)]">
                    <Check className="size-10 text-neon-green" />
                  </div>
                  <p className="text-neon-green text-lg font-semibold">Upload completato!</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Step indicator */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`w-10 h-1.5 rounded-full transition-colors duration-300 ${s <= step ? 'bg-neon-purple shadow-[0_0_10px_rgba(157,78,221,0.5)]' : 'bg-white/10'}`} />
                    ))}
                  </div>

                  {step === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                          Il tuo nome <span className="text-foreground-muted/50 font-normal">(facoltativo)</span>
                        </label>
                        <input
                          type="text"
                          value={uploaderName}
                          onChange={(e) => setUploaderName(e.target.value)}
                          placeholder="Anonimo"
                          maxLength={100}
                          className="w-full px-4 py-3 bg-black/50 border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple rounded-xl text-white placeholder-foreground-muted outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                          Professore <span className="text-neon-pink font-normal">*</span>
                        </label>
                        <select
                          value={selectedProfessor}
                          onChange={(e) => {
                             setSelectedProfessor(e.target.value);
                             setSelectedSubject('');
                          }}
                          required
                          className="w-full px-4 py-3 bg-black/50 border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple rounded-xl text-white outline-none transition-all [&>option]:bg-[#111]"
                        >
                          <option value="">Seleziona professore</option>
                          {professors.map((professor) => (
                            <option key={professor.id} value={professor.id}>
                              {professor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Materia <span className="text-neon-pink font-normal">*</span>
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple rounded-xl text-white outline-none transition-all [&>option]:bg-[#111]"
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

                  {step === 3 && selectedSubject && (
                    <GoogleDriveUploader
                      subjectId={selectedSubject}
                      professorId={selectedProfessor}
                      uploaderName={uploaderName}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between pt-4 mt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-sm font-semibold text-foreground-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                      Annulla
                    </button>
                    {step < 3 && (
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all"
                      >
                        Continua
                      </button>
                    )}
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
