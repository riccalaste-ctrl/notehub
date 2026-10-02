'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, FileUp, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import GoogleDriveUploader from './GoogleDriveUploader';

interface Subject { id: string; name: string; slug: string; enabled: boolean; }
interface Professor { id: string; name: string; }
interface SubjectProfessor { subject_id: string; professor_id: string; professor?: Professor; }

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  professors: Professor[];
  subjectProfessors: SubjectProfessor[];
}

export default function UploadModal({ isOpen, onClose, subjects, professors, subjectProfessors }: UploadModalProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [step, setStep] = useState(1);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProfessor(''); setSelectedSubject(''); setError(''); setSuccess(false); setStep(1); setRulesAccepted(false);
    }
  }, [isOpen]);

  const filteredSubjects = subjectProfessors
    .filter((sp) => sp.professor_id === selectedProfessor)
    .map((sp) => subjects.find((s) => s.id === sp.subject_id))
    .filter(Boolean) as Subject[];

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => onClose(), 1500);
  };

  const handleError = (err: string) => setError(err);

  const handleContinue = () => {
    setError('');
    if (step === 1) {
      if (!selectedProfessor) return setError('Seleziona un professore');
      if (!filteredSubjects.length) return setError('Nessuna materia associata a questo professore');
      setStep(2);
    } else if (step === 2) {
      if (!selectedSubject) return setError('Seleziona una materia');
      setStep(3);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-[#02030a]/80 backdrop-blur-xl" onClick={onClose} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: .97 }}
              transition={{ duration: .28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-modal-title"
              className="relative w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-violet-300/20 bg-[#0b1020]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.62)] backdrop-blur-2xl sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 size-56 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-cyan-200">
                    <FileUp className="size-3.5" /> Condividi una risorsa
                  </div>
                  <h2 id="upload-modal-title" className="text-2xl font-bold tracking-tight text-white">Carica appunti</h2>
                  <p className="mt-1 text-sm text-white/45">Tre passaggi. Nessun dato superfluo.</p>
                </div>
                <button aria-label="Chiudi finestra caricamento" onClick={onClose} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
              </div>

              <div className="relative my-6 grid grid-cols-3 gap-2">
                {[{n:1,label:'Professore'},{n:2,label:'Materia'},{n:3,label:'Conferma'}].map((item) => (
                  <div key={item.n} className={`rounded-xl border px-3 py-2.5 transition ${item.n <= step ? 'border-violet-300/30 bg-violet-400/10' : 'border-white/8 bg-white/[0.025]'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`grid size-6 place-items-center rounded-full text-[10px] font-black ${item.n <= step ? 'bg-gradient-to-br from-violet-400 to-cyan-300 text-[#070914]' : 'bg-white/8 text-white/40'}`}>{item.n}</span>
                      <span className={`hidden text-[11px] font-bold sm:block ${item.n <= step ? 'text-white' : 'text-white/35'}`}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mb-5 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cyan-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">Upload tracciato e protetto</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">Il file viene associato automaticamente al tuo account. Le operazioni di moderazione restano sotto il controllo dell&apos;amministrazione.</p>
                  </div>
                </div>
              </div>

              {success ? (
                <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="relative py-12 text-center">
                  <div className="mx-auto mb-5 grid size-20 place-items-center rounded-3xl border border-emerald-300/25 bg-emerald-400/10 shadow-[0_0_50px_rgba(74,222,154,.15)]"><Check className="size-9 text-emerald-300" /></div>
                  <p className="text-lg font-bold text-white">Risorsa caricata</p>
                  <p className="mt-1 text-sm text-white/45">La finestra si chiuderà automaticamente.</p>
                </motion.div>
              ) : (
                <div className="relative space-y-5">
                  {step === 1 && (
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[.12em] text-white/45">Professore <span className="text-pink-300">*</span></label>
                      <select value={selectedProfessor} onChange={(e) => { setSelectedProfessor(e.target.value); setSelectedSubject(''); }} className="control-input" required>
                        <option value="">Seleziona professore</option>
                        {professors.map((professor) => <option key={professor.id} value={professor.id}>{professor.name}</option>)}
                      </select>
                      <p className="mt-2 text-xs text-white/35">L&apos;autore mostrato viene ricavato dall&apos;account Google autenticato.</p>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[.12em] text-white/45">Materia <span className="text-pink-300">*</span></label>
                      <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="control-input" required>
                        <option value="">Seleziona materia</option>
                        {filteredSubjects.length ? filteredSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>) : <option disabled>Nessuna materia disponibile</option>}
                      </select>
                    </div>
                  )}

                  {step === 3 && selectedSubject && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-violet-300/15 bg-violet-400/5 p-4">
                        <p className="text-sm font-semibold text-white">Quasi fatto.</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">Conferma di poter condividere il materiale prima di procedere al caricamento su Google Drive.</p>
                      </div>
                      <label className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm text-white/60">
                        <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} className="mt-1 size-4 accent-purple-500" />
                        <span>Ho letto e accetto le <Link href="/service-rules" target="_blank" className="font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4">regole del servizio</Link> e dichiaro di poter condividere il materiale.</span>
                      </label>
                      {rulesAccepted && <GoogleDriveUploader subjectId={selectedSubject} professorId={selectedProfessor} serviceRulesAccepted={rulesAccepted} onSuccess={handleSuccess} onError={handleError} />}
                    </div>
                  )}

                  {error && <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-400/8 p-4 text-sm text-rose-200">{error}</div>}

                  <div className="flex items-center justify-between border-t border-white/8 pt-5">
                    <button type="button" onClick={step > 1 ? () => { setError(''); setStep(step - 1); } : onClose} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/8 hover:text-white">
                      {step > 1 && <ArrowLeft className="size-4" />} {step > 1 ? 'Indietro' : 'Annulla'}
                    </button>
                    {step < 3 && <button type="button" onClick={handleContinue} className="btn-primary"><span>Continua</span><ArrowRight className="size-4" /></button>}
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
