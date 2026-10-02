'use client';

import { motion } from 'framer-motion';
import { Download, Eye, FileText, HardDriveDownload, UserRound } from 'lucide-react';
import ReportButton from './ReportButton';

interface FileCardProps {
  file: {
    id: string;
    original_filename: string;
    subject_name?: string;
    subject_slug?: string;
    professor_name?: string;
    uploader_name?: string;
    created_at: string;
    mime_type: string;
    size_bytes: number;
    download_url?: string;
    view_url?: string;
  };
  index?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getFileKind(mimeType: string) {
  if (mimeType.includes('pdf')) return { label: 'PDF', className: 'bg-rose-400/10 text-rose-200 border-rose-300/20' };
  if (mimeType.includes('word') || mimeType.includes('document')) return { label: 'DOC', className: 'bg-violet-400/10 text-violet-200 border-violet-300/20' };
  if (mimeType.includes('image')) return { label: 'IMG', className: 'bg-cyan-400/10 text-cyan-200 border-cyan-300/20' };
  return { label: 'FILE', className: 'bg-white/5 text-white/70 border-white/10' };
}

export default function FileCard({ file, index = 0 }: FileCardProps) {
  const kind = getFileKind(file.mime_type);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.45 }}
      className="group relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.055]"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-violet-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-400/15 to-cyan-300/10 text-cyan-200">
            <FileText className="size-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {file.view_url && (
              <button onClick={() => window.open(file.view_url, '_blank')} aria-label={`Visualizza ${file.original_filename}`} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-200" title="Visualizza">
                <Eye className="size-4" />
              </button>
            )}
            {file.download_url && (
              <button onClick={() => window.open(file.download_url, '_blank')} aria-label={`Scarica ${file.original_filename}`} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-violet-300/25 hover:bg-violet-300/10 hover:text-violet-200" title="Scarica">
                <Download className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${kind.className}`}>{kind.label}</span>
            {file.subject_name && <span className="truncate text-[11px] font-semibold text-cyan-200/70">{file.subject_name}</span>}
          </div>
          <h3 className="truncate text-[1.02rem] font-bold tracking-tight text-white" title={file.original_filename}>{file.original_filename}</h3>

          {file.uploader_name && (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
              <UserRound className="size-3.5 text-cyan-300/70" />
              <span>Pubblicato da</span>
              <span className="truncate font-semibold text-white/75">{file.uploader_name}</span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/7 pt-4">
            <div className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-white/40">
              <span>{formatDate(file.created_at)}</span>
              <span>·</span>
              <span>{formatFileSize(file.size_bytes)}</span>
              {file.professor_name && <><span>·</span><span className="truncate">{file.professor_name}</span></>}
            </div>
            <ReportButton uploadId={file.id} fileName={file.original_filename} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
