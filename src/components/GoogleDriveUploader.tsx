'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, FileText, X, CheckCircle } from 'lucide-react';

const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_UPLOAD_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '50');
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const ALLOWED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

const CHUNK_SIZE = 3 * 1024 * 1024;

interface GoogleDriveUploaderProps {
  subjectId: string;
  professorId: string;
  serviceRulesAccepted: boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  driveFileId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function uploadChunkToServer(
  sessionId: string,
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  chunkStart: number,
  chunkEnd: number
): Promise<{ success: boolean; driveFileId: string | null; isComplete: boolean }> {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('chunkIndex', String(chunkIndex));
  formData.append('totalChunks', String(totalChunks));
  formData.append('chunkStart', String(chunkStart));
  formData.append('chunkEnd', String(chunkEnd));
  formData.append('chunk', chunk);

  const response = await fetch('/api/upload/chunk', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Caricamento del blocco non riuscito (${response.status})`);
  }

  return data;
}

async function uploadSingleFile(
  file: File,
  subjectId: string,
  professorId: string,
  serviceRulesAccepted: boolean,
  onProgress: (progress: number) => void
): Promise<string> {
  const sessionRes = await fetch('/api/upload/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subjectId,
      professorId,
      serviceRulesAccepted,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });

  const sessionData = await sessionRes.json();

  if (!sessionRes.ok) {
    throw new Error(sessionData.error || 'Impossibile creare la sessione di upload');
  }

  const { sessionId } = sessionData;

  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  let driveFileId: string | null = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunk = file.slice(start, end);

    const result = await uploadChunkToServer(sessionId, chunk, i, totalChunks, start, end);

    if (result.driveFileId) {
      driveFileId = result.driveFileId;
    }

    const pct = Math.round(((i + 1) / totalChunks) * 100);
    onProgress(pct);
  }

  if (!driveFileId) {
    throw new Error('Google Drive non ha restituito un ID file');
  }

  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      driveFileId,
      serviceRulesAccepted,
    }),
  });

  const completeData = await completeRes.json();

  if (!completeRes.ok) {
    throw new Error(completeData.error || 'Impossibile completare il salvataggio del file');
  }

  return driveFileId;
}

export default function GoogleDriveUploader({
  subjectId,
  professorId,
  serviceRulesAccepted,
  onSuccess,
  onError,
}: GoogleDriveUploaderProps) {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: QueuedFile[] = [];
    let hasError = false;

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        onError(`${file.name}: ${error}`);
        hasError = true;
        continue;
      }
      newFiles.push({
        file,
        id: generateId(),
        status: 'pending',
        progress: 0,
      });
    }

    if (!hasError && newFiles.length > 0) {
      setQueuedFiles(prev => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setQueuedFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = queuedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      onError('Nessun file da caricare');
      return;
    }

    setIsUploading(true);

    for (const queuedFile of pendingFiles) {
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === queuedFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      );

      try {
        const driveFileId = await uploadSingleFile(
          queuedFile.file,
          subjectId,
          professorId,
          serviceRulesAccepted,
          (progress) => {
            setQueuedFiles(prev =>
              prev.map(f =>
                f.id === queuedFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === queuedFile.id
              ? { ...f, status: 'completed' as const, progress: 100, driveFileId }
              : f
          )
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Caricamento non riuscito';
        console.error('[Upload] Error:', message);
        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === queuedFile.id
              ? { ...f, status: 'error' as const, error: message }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    const allCompleted = queuedFiles.every(f => f.status === 'completed' || f.status === 'error');
    if (allCompleted && queuedFiles.some(f => f.status === 'completed')) {
      setTimeout(() => onSuccess(), 500);
    }
  }, [queuedFiles, subjectId, professorId, serviceRulesAccepted, onSuccess, onError]);

  const hasPendingFiles = queuedFiles.some(f => f.status === 'pending');
  const hasUploadingFiles = queuedFiles.some(f => f.status === 'uploading');
  const allCompleted = queuedFiles.length > 0 && queuedFiles.every(f => f.status === 'completed');

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        multiple
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full px-4 py-8 neu-surface-pressed rounded-neu border-2 border-dashed border-neu-border premium-transition hover:border-[#FF8C42]/50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
      >
        {queuedFiles.length === 0 ? (
          <>
            <Upload className="size-8 text-foreground-muted" />
            <p className="text-sm font-semibold text-foreground">
              Seleziona file
            </p>
            <p className="text-xs text-foreground-muted">
              PDF, DOC, DOCX, JPG, PNG (max {formatFileSize(MAX_UPLOAD_SIZE_BYTES)} ciascuno)
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-neu-xl bg-mint/20 flex items-center justify-center">
              <FileText className="size-6 text-mint-dark" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {queuedFiles.length} file{queuedFiles.length !== 1 ? 'i' : ''} selezionato{queuedFiles.length !== 1 ? 'i' : ''}
              </p>
              <p className="text-xs text-foreground-light mt-1">
                {queuedFiles.filter(f => f.status === 'completed').length} completati, {queuedFiles.filter(f => f.status !== 'completed').length} in coda
              </p>
            </div>
          </>
        )}
      </button>

      {queuedFiles.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {queuedFiles.map((queuedFile) => (
            <div
              key={queuedFile.id}
              className="flex items-center gap-3 p-3 neu-surface-pressed rounded-neu border border-neu-border"
            >
              <div className="w-10 h-10 rounded-neu-xl bg-mint/20 flex items-center justify-center flex-shrink-0">
                {queuedFile.status === 'completed' ? (
                  <CheckCircle className="size-5 text-mint-dark" />
                ) : queuedFile.status === 'error' ? (
                  <X className="size-5 text-red-400" />
                ) : (
                  <FileText className="size-5 text-mint-dark" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{queuedFile.file.name}</p>
                <p className="text-xs text-foreground-muted">
                  {formatFileSize(queuedFile.file.size)}
                  {queuedFile.status === 'uploading' && ` • Caricamento... ${queuedFile.progress}%`}
                  {queuedFile.status === 'completed' && ' • Completato'}
                  {queuedFile.status === 'error' && ` • Errore: ${queuedFile.error}`}
                </p>
                {queuedFile.status === 'uploading' && (
                  <div className="w-full h-1.5 bg-neu-base rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] rounded-full premium-transition"
                      style={{ width: `${queuedFile.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {(queuedFile.status === 'pending' || queuedFile.status === 'error') && !isUploading && (
                <button
                  type="button"
                  onClick={() => removeFile(queuedFile.id)}
                  className="p-2 text-foreground-muted hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors flex-shrink-0"
                  aria-label="Rimuovi file"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {queuedFiles.some(f => f.status === 'completed') && (
        <button
          type="button"
          onClick={clearCompleted}
          className="w-full py-2 text-sm text-foreground-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          Pulisci completati
        </button>
      )}

      {(hasPendingFiles || hasUploadingFiles) && !allCompleted && (
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={isUploading || hasUploadingFiles}
          className="w-full py-3 text-sm font-semibold text-white gradient-primary rounded-neu premium-transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="size-4" />
          {isUploading || hasUploadingFiles ? 'Caricamento in corso...' : `Carica ${queuedFiles.filter(f => f.status === 'pending').length} file`}
        </button>
      )}

      {allCompleted && (
        <div className="text-center py-4 text-neon-green">
          <CheckCircle className="size-6 mx-auto mb-2" />
          <p className="font-semibold">Tutti i file caricati con successo!</p>
        </div>
      )}
    </div>
  );
}