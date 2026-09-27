'use client';

import { useState } from 'react';
import { Download, ExternalLink, KeyRound, Pencil, ShieldCheck, X } from 'lucide-react';

type Data = {
  owner: { display_name: string; email: string; role: string; valid_from: string } | null;
  history: Array<Record<string, string | null>>;
  audit: Array<Record<string, string>>;
};

const RESPONSIBILITY_GUIDE_URL = 'https://www.garanteprivacy.it/documents/10160/0/Regolamento+UE+2016+679.+Arricchito+con+riferimenti+alle+rettifiche+pubblicate+sulla+Gazzetta+Ufficiale+dell%27Unione+europea+127+del+23+maggio+2018';

export default function TitolareSection() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ display_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/admin/titolare/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error || 'Autenticazione non riuscita'); setLoading(false); return; }
    const result = await fetch('/api/admin/titolare');
    if (!result.ok) { setError((await result.json().catch(() => ({}))).error || 'Dati non disponibili'); setLoading(false); return; }
    const loaded = await result.json(); setData(loaded); setOwnerForm({ display_name: loaded.owner?.display_name || '', email: loaded.owner?.email || '' }); setPassword(''); setLoading(false);
  };

  const requestOwnerChange = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setConsentAccepted(false);
    setShowConsent(true);
  };

  const updateOwner = async () => {
    setLoading(true); setError('');
    const response = await fetch('/api/admin/titolare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ownerForm, consent_accepted: consentAccepted }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || 'Impossibile aggiornare il titolare'); setLoading(false); setShowConsent(false); return; }
    const refreshed = await fetch('/api/admin/titolare');
    if (refreshed.ok) {
      const loaded = await refreshed.json();
      setData(loaded);
      setOwnerForm({ display_name: loaded.owner?.display_name || '', email: loaded.owner?.email || '' });
    }
    setShowConsent(false);
    setConsentAccepted(false);
    setLoading(false);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/admin/titolare/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordForm),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || 'Impossibile cambiare password'); setLoading(false); return; }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmation: '' });
    setData(null);
    setError('Password aggiornata. Inserisci la nuova password per riaprire la sezione Titolare.');
    setLoading(false);
  };

  if (!data) return <div className="max-w-xl glass-panel p-8 border border-amber-400/20"><div className="flex gap-4 items-start mb-6"><div className="rounded-xl p-3 bg-amber-400/10"><KeyRound className="text-amber-300" /></div><div><h2 className="text-2xl font-semibold text-white">Area Titolare</h2><p className="text-sm text-foreground-muted mt-1">Inserisci la password Titolare aggiuntiva. La password non viene mai inviata al browser né registrata.</p></div></div><form onSubmit={authenticate} className="space-y-4"><label className="block text-sm font-semibold text-white">Password titolare<input className="mt-2 w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-amber-300" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>}<button className="w-full py-3 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 font-semibold disabled:opacity-50" disabled={loading}>{loading ? 'Verifica…' : 'Sblocca area Titolare'}</button></form></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><div className="flex items-center gap-3"><ShieldCheck className="text-amber-300" /><h2 className="text-3xl font-semibold text-white">Titolare</h2></div><p className="text-foreground-muted mt-2">Record corrente, storia temporale e audit immutabile-style.</p></div>
      <div className="flex gap-2"><a className="px-3 py-2 rounded-xl border border-white/10 text-sm text-white hover:bg-white/10 flex gap-2 items-center" href="/api/admin/titolare?export=json"><Download size={15} />JSON</a><a className="px-3 py-2 rounded-xl border border-white/10 text-sm text-white hover:bg-white/10 flex gap-2 items-center" href="/api/admin/titolare?export=csv"><Download size={15} />CSV</a></div>
    </div>

    <div className="glass-panel p-6 border border-amber-300/20">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-amber-200/70">Record corrente</p>{data.owner ? <><p className="text-2xl text-white font-semibold mt-2">{data.owner.display_name}</p><p className="text-foreground-muted">{data.owner.email} · {data.owner.role}</p><p className="text-xs text-foreground-muted mt-3">Valido dal {new Date(data.owner.valid_from).toLocaleDateString('it-IT')}</p></> : <p className="text-sm text-foreground-muted mt-2">Nessun Titolare ancora registrato. Il primo inserimento creerà il record corrente.</p>}</div><Pencil className="text-amber-300" size={20} /></div>
      <form onSubmit={requestOwnerChange} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 mt-6">
        <input aria-label="Nome e cognome del titolare" className="control-input" value={ownerForm.display_name} onChange={(e) => setOwnerForm({ ...ownerForm, display_name: e.target.value })} required />
        <input aria-label="Email del titolare" type="email" className="control-input" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} required />
        <button className="btn-primary" disabled={loading}>Continua</button>
      </form>
      {error && <p className="text-sm text-red-300 mt-3">{error}</p>}
    </div>

    <div className="glass-panel p-6 border border-amber-300/20"><h3 className="text-lg text-white font-semibold mb-4">Cambia password Titolare</h3><form onSubmit={changePassword} className="grid gap-3 md:grid-cols-3"><input aria-label="Password corrente" type="password" autoComplete="current-password" className="control-input" placeholder="Password corrente" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /><input aria-label="Nuova password" type="password" autoComplete="new-password" minLength={12} className="control-input" placeholder="Nuova password (min. 12 caratteri)" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required /><input aria-label="Conferma nuova password" type="password" autoComplete="new-password" minLength={12} className="control-input" placeholder="Conferma nuova password" value={passwordForm.confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, confirmation: e.target.value })} required /><button className="btn-primary md:col-span-3" disabled={loading}>Aggiorna password</button></form></div>

    <div className="grid lg:grid-cols-2 gap-6">
      <section className="glass-panel p-6 border border-white/10"><h3 className="text-lg text-white font-semibold mb-4">Storia temporale</h3>{data.history.length === 0 ? <p className="text-sm text-foreground-muted">Nessun precedente Titolare registrato.</p> : data.history.map((item) => <div key={item.id} className="border-l-2 border-amber-300/40 pl-4 mb-5"><p className="text-white font-medium">{item.display_name} · {item.email}</p><p className="text-xs text-foreground-muted">{item.valid_from} → {item.valid_to || 'in corso'}</p></div>)}</section>
      <section className="glass-panel p-6 border border-white/10"><h3 className="text-lg text-white font-semibold mb-4">Audit e accessi</h3>{data.audit.length === 0 ? <p className="text-sm text-foreground-muted">Nessuna operazione registrata.</p> : data.audit.map((item) => <div key={item.id} className="border-b border-white/10 pb-3 mb-3"><p className="text-white text-sm">{item.action}</p><p className="text-xs text-foreground-muted mt-1">Owner: {item.owner_email} · Attore: {item.actor_email} ({item.actor_account})</p><p className="text-xs text-foreground-muted">{new Date(item.created_at).toLocaleString('it-IT')}</p></div>)}</section>
    </div>

    {showConsent && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-300/30 bg-[#101116] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between gap-4 p-5 border-b border-white/10 bg-[#101116]">
          <div><p className="text-xs uppercase tracking-wider text-amber-200/70">Passaggio obbligatorio</p><h3 className="text-xl font-semibold text-white mt-1">Accordo di assunzione dell&apos;incarico di Titolare</h3></div>
          <button type="button" onClick={() => { setShowConsent(false); setConsentAccepted(false); }} className="p-2 rounded-lg text-foreground-muted hover:text-white hover:bg-white/10" aria-label="Chiudi"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4 text-sm leading-6 text-foreground-muted">
          <p><strong className="text-white">Dichiarante:</strong> stai effettuando questa operazione dal tuo account istituzionale autenticato. Salvo l&apos;account sviluppatore autorizzato esclusivamente per i test, la nuova email del Titolare deve coincidere esattamente con l&apos;account che sta eseguendo la modifica.</p>
          <p><strong className="text-white">Assunzione dell&apos;incarico.</strong> Con la conferma dichiari di voler assumere l&apos;incarico di Titolare del servizio NoteHub/SKAKK-UP e di accettare le responsabilità organizzative e di gestione associate al ruolo secondo le regole del servizio e gli obblighi di legge applicabili.</p>
          <p><strong className="text-white">Subentro.</strong> La registrazione del nuovo Titolare sostituisce il precedente Titolare nel registro corrente. Il precedente Titolare cessa di risultare titolare corrente a partire dal momento del cambio e il passaggio viene conservato nello storico del servizio.</p>
          <p><strong className="text-white">Responsabilità e collaborazione.</strong> Accetti di gestire il servizio con diligenza, di mantenere aggiornate le informazioni di responsabilità, di rispettare le regole di moderazione e le informative del sito e di adottare, per quanto di tua competenza, le misure organizzative e tecniche necessarie alla gestione del servizio e dei dati trattati.</p>
          <p><strong className="text-white">Tracciabilità.</strong> Accetti che il cambio venga registrato nell&apos;audit del servizio insieme all&apos;account istituzionale che lo ha effettuato e all&apos;avvenuta accettazione di questo accordo. L&apos;audit serve a documentare chi ha effettuato l&apos;operazione e non sostituisce eventuali adempimenti formali richiesti dalla legge.</p>
          <p><strong className="text-white">Approfondimento.</strong> Per comprendere meglio il concetto di responsabilizzazione (accountability) e gli obblighi del titolare del trattamento, consulta la documentazione ufficiale del Garante Privacy: <a href={RESPONSIBILITY_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline">approfondisci le responsabilità e gli obblighi <ExternalLink size={13} /></a>.</p>
          <p className="text-xs text-foreground-muted/80 border-t border-white/10 pt-4">Questo accordo disciplina il ruolo interno di Titolare del servizio e documenta la volontà dell&apos;utente di assumere l&apos;incarico. Non attribuisce da solo qualifiche giuridiche che la normativa riserva a soggetti determinati in base all&apos;effettivo assetto del trattamento.</p>
          <label className="flex items-start gap-3 p-4 rounded-xl border border-amber-300/20 bg-amber-300/5 cursor-pointer">
            <input type="checkbox" checked={consentAccepted} onChange={(e) => setConsentAccepted(e.target.checked)} className="mt-1 size-5 accent-amber-300" />
            <span className="text-white font-medium">Dichiaro di aver letto e compreso l&apos;accordo sopra riportato, di accettare l&apos;assunzione dell&apos;incarico e di voler diventare il nuovo Titolare.</span>
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-5 border-t border-white/10 bg-[#101116]">
          <button type="button" onClick={() => { setShowConsent(false); setConsentAccepted(false); }} className="px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/10">Annulla</button>
          <button type="button" onClick={updateOwner} disabled={!consentAccepted || loading} className="px-5 py-3 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">{loading ? 'Salvataggio…' : 'Accetto e divento Titolare'}</button>
        </div>
      </div>
    </div>}
  </div>;
}
