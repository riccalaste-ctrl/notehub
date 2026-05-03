'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface ConsiglioFile {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  download_url?: string;
  view_url?: string;
  created_at: string;
}

interface ConsiglioFilesProps {
  consiglioId: string;
  consigliTitle: string;
}

export default function ConsiglioFiles({ consiglioId, consigliTitle }: ConsiglioFilesProps) {
  const [files, setFiles] = useState<ConsiglioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [consiglioId]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/admin/consigli-files?consiglio_id=${consiglioId}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Fetch consiglio files error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('consiglio_id', consiglioId);

      const res = await fetch('/api/admin/consigli-files', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSelectedFile(null);
      await fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Eliminare questo file?')) return;
    try {
      const res = await fetch(`/api/admin/consigli-files?file_id=${fileId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileText className="size-4" />
        <span>File allegati ({files.length})</span>
      </div>

      {loading ? (
        <p className="text-sm text-foreground-light">Caricamento...</p>
      ) : (
        <>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-neu neu-surface"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-neu-sm bg-neu-base flex items-center justify-center flex-shrink-0">
                      <FileText className="size-4 text-foreground-light" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-foreground-light">
                        {formatSize(file.size_bytes)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-neu-sm transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${consiglioId}`}
            />
            <label
              htmlFor={`file-upload-${consiglioId}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 neu-surface-pressed rounded-neu border-2 border-dashed border-stone-300 cursor-pointer hover:border-[#FF8C42]/50 transition"
            >
              <Upload className="size-4 text-foreground-muted" />
              <span className="text-sm font-medium text-foreground-light">
                {selectedFile ? selectedFile.name : 'Seleziona un file'}
              </span>
            </label>
            {selectedFile && !uploading && (
              <button
                onClick={handleUpload}
                className="w-full py-2 text-sm font-semibold text-white bg-[#6366F1] rounded-neu transition"
              >
                Carica file
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
