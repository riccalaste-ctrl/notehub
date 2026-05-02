'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface GoogleDriveUploaderProps {
  subjectId: string;
  professorId: string;
  uploaderName?: string;
  onSuccess: (upload: unknown) => void;
  onError: (error: string) => void;
}

interface UploadSessionResponse {
  sessionId: string;
  uploadUrl: string;
}

interface GoogleUploadResponse {
  id?: string;
}

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

function uploadFileToGoogle(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<GoogleUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 90) + 5);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : {});
        } catch {
          reject(new Error('Risposta Google Drive non valida'));
        }
        return;
      }

      let errorMsg = `Upload Google Drive non riuscito (${xhr.status})`;
      try {
        const errorData = JSON.parse(xhr.responseText);
        if (errorData.error?.message) {
          errorMsg += `: ${errorData.error.message}`;
        }
      } catch {
        if (xhr.responseText) errorMsg += `: ${xhr.responseText}`;
      }
      reject(new Error(errorMsg));
    });

    xhr.addEventListener('error', () => reject(new Error('Errore di rete durante l\'upload su Google Drive')));
    xhr.addEventListener('abort', () => reject(new Error('Upload annullato')));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

export default function GoogleDriveUploader({
  subjectId,
  professorId,
  uploaderName,
  onSuccess,
  onError,
}: GoogleDriveUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      onError('Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Seleziona un file da caricare');
      return;
    }

    setIsUploading(true);
    setUploadProgress(1);

    try {
      const sessionResponse = await fetch('/api/upload/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          professorId,
          uploaderName: uploaderName || undefined,
          originalFilename: selectedFile.name,
          mimeType: selectedFile.type,
          sizeBytes: selectedFile.size,
        }),
      });

      const sessionData = await sessionResponse.json();
      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || 'Impossibile preparare upload Drive');
      }

      const { sessionId, uploadUrl } = sessionData as UploadSessionResponse;
      const googleResult = await uploadFileToGoogle(uploadUrl, selectedFile, setUploadProgress);

      if (!googleResult.id) {
        throw new Error('Google Drive non ha restituito l\'ID del file');
      }

      setUploadProgress(96);

      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          driveFileId: googleResult.id,
        }),
      });

      const completeData = await completeResponse.json();
      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Impossibile salvare il file');
      }

      setUploadProgress(100);
      onSuccess(completeData.upload);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Errore durante upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile && (
        <div className="border-2 border-dashed border-foreground-light/20 rounded-neu p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="drive-file-input"
          />
          <label
            htmlFor="drive-file-input"
            className="cursor-pointer text-sm text-foreground-light hover:text-foreground premium-transition"
          >
            <UploadCloud className="size-8 mx-auto mb-2 text-lavender" />
            Clicca per selezionare un file<br />
            <span className="text-xs">PDF, DOC, DOCX, JPG, PNG</span>
          </label>
        </div>
      )}

      {selectedFile && (
        <div className="p-3 neu-surface-pressed rounded-neu">
          <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
          <p className="text-xs text-foreground-light">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-neu-base rounded-full h-2">
            <div
              className="bg-lavender h-2 rounded-full premium-transition"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-foreground-light">{uploadProgress}%</p>
        </div>
      )}

      {selectedFile && !isUploading && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="flex-1 py-2 text-sm font-semibold text-foreground neu-button rounded-neu premium-transition"
          >
            Cambia file
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="flex-1 py-2 text-sm font-semibold text-white gradient-primary rounded-neu premium-transition"
          >
            Carica
          </button>
        </div>
      )}
    </div>
  );
}
