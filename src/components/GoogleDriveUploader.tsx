'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, FileText } from 'lucide-react';

const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_UPLOAD_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '4');
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const ALLOWED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

interface GoogleDriveUploaderProps {
  subjectId: string;
  professorId: string;
  uploaderName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function GoogleDriveUploader({
  subjectId,
  professorId,
  uploaderName,
  onSuccess,
  onError,
}: GoogleDriveUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.type)) {
      return 'Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG';
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `File troppo grande. Dimensione massima: ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      onError(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Seleziona un file da caricare');
      return;
    }

    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subjectId', subjectId);
    formData.append('professorId', professorId);
    formData.append('uploaderName', uploaderName);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 80) + 10;
          setProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          setTimeout(() => onSuccess(), 300);
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            onError(data.error || 'Upload fallito');
          } catch {
            onError('Upload fallito');
          }
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        onError('Errore di rete. Verifica la connessione e riprova.');
        setUploading(false);
      });

      xhr.addEventListener('abort', () => {
        onError('Upload annullato');
        setUploading(false);
      });

      xhr.open('POST', '/api/upload/direct');
      xhr.send(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload fallito';
      onError(message);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full px-4 py-8 neu-surface-pressed rounded-neu border-2 border-dashed border-neu-border premium-transition hover:border-[#FF8C42]/50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
      >
        {selectedFile ? (
          <>
            <div className="w-12 h-12 rounded-neu-xl bg-mint/20 flex items-center justify-center">
              <FileText className="size-6 text-mint-dark" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-foreground-light mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!uploading && (
              <p className="text-xs text-foreground-muted mt-1">
                Clicca per cambiare file
              </p>
            )}
          </>
        ) : (
          <>
            <Upload className="size-8 text-foreground-muted" />
            <p className="text-sm font-semibold text-foreground">
              Seleziona un file
            </p>
            <p className="text-xs text-foreground-muted">
              PDF, DOC, DOCX, JPG, PNG (max {formatFileSize(MAX_UPLOAD_SIZE_BYTES)})
            </p>
          </>
        )}
      </button>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground-light">
            <Loader2 className="size-4 animate-spin" />
            <span>Caricamento in corso... {progress}%</span>
          </div>
          <div className="w-full h-2 bg-neu-base rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] rounded-full premium-transition"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {selectedFile && !uploading && (
        <button
          type="button"
          onClick={handleUpload}
          className="w-full py-3 text-sm font-semibold text-white gradient-primary rounded-neu premium-transition flex items-center justify-center gap-2"
        >
          <Upload className="size-4" />
          Carica file
        </button>
      )}
    </div>
  );
}
