'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface ReportButtonProps {
  uploadId: string;
  fileName: string;
}

export default function ReportButton({ uploadId, fileName }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit() {
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossibile inviare la segnalazione.');
      setStatus('done');
      setMessage(data.warning || 'Segnalazione inviata agli amministratori.');
      setReason('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Impossibile inviare la segnalazione.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setStatus('idle'); setMessage(''); }}
        aria-label={`Segnala ${fileName}`}
        title="Segnala documento"
        className="inline-flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg bg-red-500/5 border border-red-400/10 text-red-300 hover:bg-red-500/10 transition-colors text-xs font-semibold"
      >
        <Flag className="size-3.5" />
        Segnala
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div role="dialog" aria-modal="true" aria-labelledby={`report-title-${uploadId}`} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111522] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id={`report-title-${uploadId}`} className="text-lg font-semibold text-white">Segnala documento</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="size-9 rounded-lg bg-white/5 text-white hover:bg-white/10">
                <X className="size-4 mx-auto" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">Documento: <strong>{fileName}</strong></p>
            <label className="block mt-5 text-sm font-medium text-white">
              Motivo della segnalazione
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-400/50" placeholder="Spiega brevemente il problema..." />
            </label>
            {message && <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5">Annulla</button>
              <button type="button" disabled={status === 'sending' || reason.trim().length < 5} onClick={submit} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {status === 'sending' ? 'Invio...' : 'Invia segnalazione'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
