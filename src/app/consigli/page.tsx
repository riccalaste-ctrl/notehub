'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, Lightbulb, Mail, UserRound } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast, { useToast } from '@/components/Toast';

interface Consiglio {
  id: string;
  title: string;
  content: string;
  professor_id: string;
  published: boolean;
  created_at: string;
  professor?: { id: string; name: string };
}
interface ConsiglioFile {
  id: string;
  consiglio_id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  download_url?: string;
  view_url?: string;
}

export default function ConsigliPage() {
  const [consigli, setConsigli] = useState<Consiglio[]>([]);
  const [consigliFiles, setConsigliFiles] = useState<Record<string, ConsiglioFile[]>>({});
  const [loading, setLoading] = useState(true);
  const [consigliEmail, setConsigliEmail] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      fetch('/api/public/settings').then((res) => res.json()).then((data) => setConsigliEmail(data.settings?.consigli_email || '')).catch(() => {});
      const filesRes = await fetch('/api/public/consigli-files').catch(() => null);
      const consigliRes = await fetch('/api/consigli');
      if (consigliRes.ok) {
        const data = await consigliRes.json();
        setConsigli((data.consigli || []).filter((c: Consiglio) => c.published));
        if (filesRes?.ok) {
          const fd = await filesRes.json();
          const grouped: Record<string, ConsiglioFile[]> = {};
          (fd.files || []).forEach((f: ConsiglioFile) => { if (!grouped[f.consiglio_id]) grouped[f.consiglio_id] = []; grouped[f.consiglio_id].push(f); });
          setConsigliFiles(grouped);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="page-shell">
      <Header breadcrumbs={[{ label: 'Consigli' }]} />
      <main className="lg:pl-[4.5rem] pt-16">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_100px_rgba(0,0,0,.2)] sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 size-52 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-pink-300/15 bg-pink-300/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-pink-200"><Lightbulb className="size-3.5" /> Editoriale SKAKK-UP</span>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-.04em] text-white sm:text-5xl">Idee che aiutano a studiare meglio.</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Trucchi per lo studio, informazioni sui professori e suggerimenti pratici per organizzare il tuo lavoro.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4 lg:w-72">
                <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-white/35">In evidenza</p>
                <p className="mt-2 text-2xl font-bold text-white">{consigli.length}</p>
                <p className="text-xs text-white/40">contenuti pubblicati</p>
              </div>
            </div>
          </motion.section>

          {consigliEmail && (
            <a href={`mailto:${consigliEmail}`} className="group mb-8 flex items-center justify-between gap-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06]">
              <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/10"><Mail className="size-5 text-cyan-200" /></div><div><p className="text-sm font-bold text-white">Hai un consiglio da condividere?</p><p className="text-xs text-white/40">Scrivici a <span className="font-semibold text-cyan-200">{consigliEmail}</span></p></div></div>
              <ArrowUpRight className="size-5 text-white/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-200" />
            </a>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map((i)=><div key={i} className="h-64 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.035]" />)}</div>
          ) : consigli.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {consigli.map((consiglio,index) => {
                const files=consigliFiles[consiglio.id]||[];
                return <motion.article key={consiglio.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:index*.06}} className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-300/25">
                  <div className="absolute -right-16 -top-16 size-40 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/15" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4"><div className="grid size-11 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200"><Lightbulb className="size-5"/></div><span className="text-[10px] font-bold uppercase tracking-wider text-white/25">{new Date(consiglio.created_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'})}</span></div>
                    <h2 className="mt-5 text-xl font-bold tracking-tight text-white">{consiglio.title}</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/50">{consiglio.content}</p>
                    {files.length>0&&<div className="mt-5 space-y-2 border-t border-white/8 pt-4">{files.map(file=><a key={file.id} href={file.view_url||file.download_url||'#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-white/7 bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]"><span className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-cyan-200"/><span className="truncate text-xs font-semibold text-white/60">{file.original_filename}</span></span><ArrowUpRight className="size-4 shrink-0 text-white/25"/></a>)}</div>}
                    <div className="mt-5 flex items-center gap-3 text-[11px] text-white/35">{consiglio.professor&&<span className="flex items-center gap-1.5"><UserRound className="size-3.5"/>{consiglio.professor.name}</span>}<span className="h-1 w-1 rounded-full bg-white/20"/></div>
                  </div>
                </motion.article>;
              })}
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-white/10 bg-white/[0.025] px-6 py-16 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><Lightbulb className="size-7 text-white/25"/></div><h2 className="mt-5 text-xl font-bold text-white">Nessun consiglio disponibile</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">I contenuti verranno aggiunti gradualmente dall'amministrazione.</p></div>
          )}
        </div>
        <Footer />
      </main>
      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
