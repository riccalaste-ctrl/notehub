'use client';

import { useState } from 'react';
import { Download, KeyRound, Pencil, ShieldCheck } from 'lucide-react';

type Data = { owner: { display_name: string; email: string; role: string; valid_from: string }; history: Array<Record<string, string | null>>; audit: Array<Record<string, string>> };

export default function TitolareSection() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ display_name: '', email: '' });
  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/admin/titolare/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error || 'Autenticazione non riuscita'); setLoading(false); return; }
    const result = await fetch('/api/admin/titolare');
    if (!result.ok) { setError((await result.json().catch(() => ({}))).error || 'Dati non disponibili'); setLoading(false); return; }
    const loaded = await result.json(); setData(loaded); setOwnerForm({ display_name: loaded.owner.display_name, email: loaded.owner.email }); setPassword(''); setLoading(false);
  };
  const updateOwner = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/admin/titolare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ownerForm) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || 'Impossibile aggiornare il titolare'); setLoading(false); return; }
    const refreshed = await fetch('/api/admin/titolare');
    if (refreshed.ok) { const loaded = await refreshed.json(); setData(loaded); setOwnerForm({ display_name: loaded.owner.display_name, email: loaded.owner.email }); }
    setLoading(false);
  };
  if (!data) return <div className="max-w-xl glass-panel p-8 border border-amber-400/20"><div className="flex gap-4 items-start mb-6"><div className="rounded-xl p-3 bg-amber-400/10"><KeyRound className="text-amber-300" /></div><div><h2 className="text-2xl font-semibold text-white">Area Titolare</h2><p className="text-sm text-foreground-muted mt-1">Inserisci la password Titolare aggiuntiva. La password non viene mai inviata al browser né registrata.</p></div></div><form onSubmit={authenticate} className="space-y-4"><label className="block text-sm font-semibold text-white">Password titolare<input className="mt-2 w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-amber-300" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>}<button className="w-full py-3 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 font-semibold disabled:opacity-50" disabled={loading}>{loading ? 'Verifica…' : 'Sblocca area Titolare'}</button></form></div>;
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-3"><ShieldCheck className="text-amber-300" /><h2 className="text-3xl font-semibold text-white">Titolare</h2></div><p className="text-foreground-muted mt-2">Record corrente, storia temporale e audit immutabile-style.</p></div><div className="flex gap-2"><a className="px-3 py-2 rounded-xl border border-white/10 text-sm text-white hover:bg-white/10 flex gap-2 items-center" href="/api/admin/titolare?export=json"><Download size={15} />JSON</a><a className="px-3 py-2 rounded-xl border border-white/10 text-sm text-white hover:bg-white/10 flex gap-2 items-center" href="/api/admin/titolare?export=csv"><Download size={15} />CSV</a></div></div><div className="glass-panel p-6 border border-amber-300/20"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-amber-200/70">Record corrente</p><p className="text-2xl text-white font-semibold mt-2">{data.owner.display_name}</p><p className="text-foreground-muted">{data.owner.email} · {data.owner.role}</p><p className="text-xs text-foreground-muted mt-3">Valido dal {new Date(data.owner.valid_from).toLocaleDateString('it-IT')}</p></div><Pencil className="text-amber-300" size={20} /></div><form onSubmit={updateOwner} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 mt-6"><input aria-label="Nome e cognome del titolare" className="control-input" value={ownerForm.display_name} onChange={(e) => setOwnerForm({ ...ownerForm, display_name: e.target.value })} required /><input aria-label="Email del titolare" type="email" className="control-input" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} required /><button className="btn-primary" disabled={loading}>Salva titolare</button></form>{error && <p className="text-sm text-red-300 mt-3">{error}</p>}</div><div className="grid lg:grid-cols-2 gap-6"><section className="glass-panel p-6 border border-white/10"><h3 className="text-lg text-white font-semibold mb-4">Storia temporale</h3>{data.history.map((item) => <div key={item.id} className="border-l-2 border-amber-300/40 pl-4 mb-5"><p className="text-white font-medium">{item.display_name} · {item.email}</p><p className="text-xs text-foreground-muted">{item.valid_from} → {item.valid_to || 'in corso'}</p></div>)}</section><section className="glass-panel p-6 border border-white/10"><h3 className="text-lg text-white font-semibold mb-4">Audit e accessi</h3>{data.audit.map((item) => <div key={item.id} className="border-b border-white/10 pb-3 mb-3"><p className="text-white text-sm">{item.action}</p><p className="text-xs text-foreground-muted mt-1">Owner: {item.owner_email} · Attore: {item.actor_email} ({item.actor_account})</p><p className="text-xs text-foreground-muted">{new Date(item.created_at).toLocaleString('it-IT')}</p></div>)}</section></div></div>;
}
