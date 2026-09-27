'use client';

import { useCallback, useEffect, useState } from 'react';
import { Ban, Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';

type BlockedUser = { id: string; email: string; reason: string | null; created_at: string };

export default function BlockedUsersSection() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch('/api/admin/blocked-users', { credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossibile caricare i blocchi');
      setUsers(data.blockedUsers || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di connessione');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const block = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/blocked-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: normalized, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossibile bloccare l’account');
      setEmail('');
      setReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const unblock = async (user: BlockedUser) => {
    if (!confirm(`Revocare il blocco per ${user.email}?`)) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/blocked-users?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossibile revocare il blocco');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-400/25 flex items-center justify-center"><Ban className="size-5 text-red-300" /></div>
        <div><h2 className="text-2xl font-semibold text-white">Utenti bloccati</h2><p className="text-sm text-foreground-muted">Blocca o riabilita singoli indirizzi email. Il controllo avviene server-side durante l’accesso Google.</p></div>
      </div>
      <div className="glass-panel p-6 border border-red-400/20">
        <div className="flex items-start gap-3 mb-5"><ShieldAlert className="size-5 text-red-300 mt-0.5" /><div><h3 className="text-lg font-semibold text-white">Blocca un account</h3><p className="text-xs text-foreground-muted mt-1">Il blocco è reversibile e non elimina l’account Google.</p></div></div>
        <form onSubmit={block} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="control-input" placeholder="email@liceoscacchibari.it" required />
          <input type="text" value={reason} onChange={(event) => setReason(event.target.value)} className="control-input" placeholder="Motivo interno (facoltativo)" maxLength={500} />
          <button disabled={loading} className="px-5 py-3 rounded-xl bg-red-500/15 border border-red-400/25 text-red-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Plus size={17} />Blocca</button>
        </form>
        {error && <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
      </div>
      <div className="glass-panel overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-white">Bloccati ({users.length})</h3><p className="text-xs text-foreground-muted mt-1">Solo l’amministratore può visualizzare questa lista.</p></div><button onClick={() => void load()} disabled={loadingList} className="p-2 rounded-lg border border-white/10 text-foreground-muted hover:text-white disabled:opacity-50" title="Aggiorna"><RotateCcw size={16} /></button></div>
        {loadingList ? <div className="p-8 text-sm text-foreground-muted">Caricamento…</div> : users.length === 0 ? <div className="p-8 text-sm text-foreground-muted">Nessun indirizzo bloccato.</div> : (
          <div className="divide-y divide-white/5">{users.map((user) => (
            <div key={user.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><p className="font-semibold text-white break-all">{user.email}</p><p className="text-xs text-foreground-muted mt-1">Bloccato il {new Date(user.created_at).toLocaleString('it-IT')}{user.reason ? ` · ${user.reason}` : ''}</p></div>
              <button onClick={() => void unblock(user)} disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Trash2 size={15} />Revoca blocco</button>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
