'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileCard from '@/components/FileCard';
import { FileText } from 'lucide-react';

interface Upload {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  download_url?: string;
  view_url?: string;
  subject?: { name: string; slug: string };
  professor?: { name: string };
}

export default function MyNotesPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/my-uploads?limit=100')
      .then((res) => res.json())
      .then((data) => setUploads(data.uploads || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neu-base gray-cards">
      <Header breadcrumbs={[{ label: 'I miei appunti' }]} />
      <main className="lg:pl-56 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2 mt-6">I miei Appunti</h1>
          <p className="text-base text-foreground-light mb-8">
            Qui trovi solo i file caricati dal tuo account.
          </p>

          {loading ? (
            <p className="text-foreground-light">Caricamento in corso...</p>
          ) : uploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-neu-lg neu-surface flex items-center justify-center mx-auto mb-4">
                <FileText className="size-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun appunto caricato</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload, index) => (
                <div key={upload.id} className="space-y-2">
                  <FileCard
                    index={index}
                    file={{
                      ...upload,
                      subject_name: upload.subject?.name,
                      subject_slug: upload.subject?.slug,
                      professor_name: upload.professor?.name,
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (!confirm('Eliminare questo file?')) return;
                      const res = await fetch(`/api/user/my-uploads/${upload.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        setUploads((prev) => prev.filter((item) => item.id !== upload.id));
                      }
                    }}
                    className="w-full py-2 text-sm font-semibold text-[#EF4444] neu-button rounded-neu"
                  >
                    Elimina (solo autore)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
}
