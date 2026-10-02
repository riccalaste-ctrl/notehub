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
    <div className="page-shell min-h-screen">
      <Header breadcrumbs={[{ label: 'I miei appunti' }]} />
      <main className="lg:pl-[4.5rem] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-[.2em] text-cyan-300/75">Il tuo spazio</p><h1 className="text-4xl font-bold tracking-tight text-white mb-2">I miei appunti</h1>
          <p className="text-base text-foreground-muted mb-8 max-w-xl">
            Qui trovi solo i file caricati dal tuo account.
          </p>

          {loading ? (
            <p className="text-foreground-light">Caricamento in corso...</p>
          ) : uploads.length === 0 ? (
            <div className="empty-state-card text-center py-16">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
                <FileText className="size-8 text-cyan-200/70" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nessun appunto caricato</h3>
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
                    className="w-full rounded-xl border border-red-400/15 bg-red-400/5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
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
