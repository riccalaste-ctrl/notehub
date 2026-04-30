'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';

interface FileCardProps {
  file: {
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
  };
  index?: number;
}

const gradientClasses = [
  'gradient-sage shadow-sage',
  'gradient-lavender shadow-lavender',
  'gradient-peach shadow-peach',
];

function getFileGradient(mimeType: string) {
  if (mimeType.includes('pdf')) return 'gradient-peach shadow-peach';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'gradient-lavender shadow-lavender';
  if (mimeType.includes('image')) return 'gradient-sage shadow-sage';
  return 'bg-stone-300 shadow-glass-sm';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function FileCard({ file, index = 0 }: FileCardProps) {
  const handleDownload = () => {
    if (file.download_url) {
      window.open(file.download_url, '_blank');
    }
  };

  const handleView = () => {
    if (file.view_url) {
      window.open(file.view_url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="relative transition-all duration-500 ease-out p-5 overflow-hidden glass-card bento-card"
    >
      <div className="h-1/2 pointer-events-none absolute inset-x-0 top-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)' }} />

      <div className="relative">
        <div className="flex justify-between items-start">
          <div className={`size-10 rounded-xl flex justify-center items-center text-white ${getFileGradient(file.mime_type)}`}>
            <FileText className="size-5" />
          </div>
          <div className="flex gap-1">
            {file.view_url && (
              <button
                onClick={handleView}
                className="size-8 rounded-full flex justify-center items-center bg-white/60 border border-white/90 hover:bg-white/80 premium-transition"
                title="Visualizza"
              >
                <Eye className="size-3.5 text-lavender" />
              </button>
            )}
            {file.download_url && (
              <button
                onClick={handleDownload}
                className="size-8 rounded-full flex justify-center items-center bg-white/60 border border-white/90 hover:bg-white/80 premium-transition"
                title="Scarica"
              >
                <Download className="size-3.5 text-sage-dark" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-base text-stone-900 truncate mb-1" title={file.original_filename}>
            {file.original_filename}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {file.subject_name && (
              <span className={`font-bold rounded-full text-white text-[10px] px-2 py-0.5 ${gradientClasses[index % gradientClasses.length]}`}>
                {file.subject_name}
              </span>
            )}
            {file.professor_name && (
              <span className="text-stone-700 font-medium">{file.professor_name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-stone-700 font-medium">
            <span>{formatDate(file.created_at)}</span>
            <span>·</span>
            <span>{formatFileSize(file.size_bytes)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
