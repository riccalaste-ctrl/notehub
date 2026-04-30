'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initGoogleApi, signInWithGoogle, uploadFile, getAccessToken, signOutGoogle } from '@/lib/google-drive';

interface GoogleDriveUploaderProps {
  subjectId: string;
  professorId: string;
  uploaderName?: string;
  onSuccess: (upload: unknown) => void;
  onError: (error: string) => void;
}

export default function GoogleDriveUploader({
  subjectId,
  professorId,
  uploaderName,
  onSuccess,
  onError,
}: GoogleDriveUploaderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/admin/subjects');
        if (res.ok) {
          const subjects = await res.json();
          const subject = subjects.find((s: { id: string }) => s.id === subjectId);
          if (subject?.google_client_id) {
            setGoogleClientId(subject.google_client_id);
          } else {
            setGoogleClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
          }
          if (subject?.google_drive_folder_id) {
            setFolderId(subject.google_drive_folder_id);
          }
        }
      } catch {
        setGoogleClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
      }

      if (!isInitialized) {
        try {
          await initGoogleApi(googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
          setIsInitialized(true);
          if (getAccessToken()) {
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Failed to initialize Google API:', err);
        }
      }
    };
    if (subjectId) init();
  }, [subjectId, isInitialized, googleClientId]);

  const handleSignIn = async () => {
    try {
      const clientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
      await initGoogleApi(clientId);
      const token = await signInWithGoogle(clientId);
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Errore autenticazione Google');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      onError('Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !folderId) {
      onError('Seleziona un file e assicurati che la cartella Drive sia configurata');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const driveFile = await uploadFile(selectedFile, folderId, (percent) => {
        setUploadProgress(percent);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          professorId: professorId || undefined,
          uploaderName: uploaderName || undefined,
          originalFilename: selectedFile.name,
          driveFileId: driveFile.fileId,
          mimeType: selectedFile.type,
          sizeBytes: selectedFile.size,
          downloadUrl: driveFile.webContentLink,
          viewUrl: driveFile.webViewLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save metadata');
      }

      onSuccess(data.upload);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Errore durante upload');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleSignIn}
        className="w-full py-3 px-4 rounded-neu font-semibold text-white gradient-primary premium-transition"
      >
        Connetti Google Drive
      </button>
    );
  }

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
