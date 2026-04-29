'use client';

import { motion } from 'framer-motion';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
          <path d="M8.5 15.5c0 .83-.67 1.5-1.5 1.5H5v-2h1.5c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5H5v-2h2c.83 0 1.5.67 1.5 1.5v1zm3 1.5c0 .83-.67 1.5-1.5 1.5h-2v-2h2v1c0 .28.22.5.5.5h1v-2h-1c-.83 0-1.5.67-1.5 1.5v1zm2-3.5c0-.83.67-1.5 1.5-1.5h1v2h-1c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5h1.5v2h-1.5c-.83 0-1.5-.67-1.5-1.5v-3zm6.5 2.5h-2v-2h2v1c0 .28.22.5.5.5h1v-2h-1c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h2v2h-2v-1c0-.28-.22-.5-.5-.5h-1v2h1c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    );
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
          <path d="M8 12h8v1H8zm0 2h8v1H8zm0 2h5v1H8z"/>
        </svg>
      </div>
    );
  }
  if (mimeType.includes('image')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-2xl bg-silk-700/50 flex items-center justify-center">
      <svg className="w-5 h-5 text-silk-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
      </svg>
    </div>
  );
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
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass bento-card p-5 group cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getFileIcon(file.mime_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate mb-2" title={file.original_filename}>
            {file.original_filename}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-silk-400">
            {file.subject_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl bg-cobalt/20 text-cobalt-light border border-cobalt/30">
                {file.subject_name}
              </span>
            )}
            {file.professor_name && (
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {file.professor_name}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-silk-500">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(file.created_at)}
            </span>
            <span>{formatFileSize(file.size_bytes)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex space-x-1 opacity-0 group-hover:opacity-100 premium-transition">
          {file.view_url && (
            <button
              onClick={handleView}
              className="p-2 text-silk-400 hover:text-white rounded-xl hover:bg-white/10 premium-transition"
              title="Visualizza"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          {file.download_url && (
            <button
              onClick={handleDownload}
              className="p-2 text-silk-400 hover:text-white rounded-xl hover:bg-white/10 premium-transition"
              title="Scarica"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
