'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Toast, { useToast } from '@/components/Toast';
import ErrorAlert from '@/components/ErrorAlert';
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  Edit,
  FileCheck,
  FileText,
  HardDrive,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Mail,
  Plus,
  School,
  Shield,
  Trash2,
  UserCheck,
  Users,
  Link as LinkIcon,
  XCircle,
  Settings,
} from 'lucide-react';
import { buildInstitutionDisclaimer } from '@/lib/user-session';

interface Subject {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
}

interface Professor {
  id: string;
  name: string;
  drive_connection?: {
    id: string;
    google_email: string;
    status: 'connected' | 'disconnected' | 'error';
    root_folder_id?: string | null;
    connected_at?: string | null;
    disconnected_at?: string | null;
    last_error?: string | null;
  } | null;
}

interface Upload {
  id: string;
  original_filename: string;
  subject?: { name: string };
  professor?: { name: string };
  created_at: string;
  size_bytes: number;
}

interface Consiglio {
  id: string;
  title: string;
  content: string;
  professor_id: string;
  published: boolean;
  created_at: string;
  professor?: { id: string; name: string };
}

interface SubjectProfessor {
  id: string;
  subject_id: string;
  professor_id: string;
  subject?: { id: string; name: string; slug: string };
  professor?: { id: string; name: string };
}

interface AppSetting {
  key: string;
  value: string;
  description?: string;
}

interface AuditLog {
  id: string;
  actor_email?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  created_at: string;
}

type Tab = 'dashboard' | 'subjects' | 'professors' | 'uploads' | 'consigli' | 'subject-professors' | 'settings';

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, exponent)).toFixed(1)} ${units[exponent]}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function driveStatus(professor: Professor) {
  const connection = professor.drive_connection;

  if (connection?.status === 'connected') {
    return {
      label: `Drive collegato: ${connection.google_email}`,
      className: 'text-[#2D8A60]',
    };
  }

  if (connection?.status === 'error') {
    return {
      label: connection.last_error || 'Drive da ricollegare',
      className: 'text-[#EF4444]',
    };
  }

  return {
    label: 'Drive non collegato',
    className: 'text-foreground-light',
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [consigli, setConsigli] = useState<Consiglio[]>([]);
  const [subjectProfessors, setSubjectProfessors] = useState<SubjectProfessor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingProfessorId, setEditingProfessorId] = useState<string | null>(null);
  const [editingConsiglioId, setEditingConsiglioId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', slug: '', enabled: true });
  const [professorForm, setProfessorForm] = useState({ name: '' });
  const [consiglioForm, setConsiglioForm] = useState({ title: '', content: '', professor_id: '', published: true });
  const [spForm, setSpForm] = useState({ subject_id: '', professor_id: '' });
  const [criticalError, setCriticalError] = useState<{ title: string; message: string } | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsForm, setSettingsForm] = useState({ support_email: '', site_policy: '', allowed_external_emails: '' });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [subjectsRes, professorsRes, uploadsRes, consigliRes, spRes, settingsRes, auditRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/uploads?limit=100'),
        fetch('/api/admin/consigli'),
        fetch('/api/admin/subject-professors'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/audit-logs?limit=50'),
      ]);

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.subjects || []);
      }

      if (professorsRes.ok) {
        const data = await professorsRes.json();
        setProfessors(data.professors || []);
      }

      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        setUploads(data.uploads || []);
      }

      if (consigliRes.ok) {
        const data = await consigliRes.json();
        setConsigli(data.consigli || []);
      }

      if (spRes.ok) {
        const data = await spRes.json();
        setSubjectProfessors(data.associations || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || {});
        setSettingsForm({
          support_email: data.settings?.support_email || data.settings?.admin_email || '',
          site_policy: data.settings?.site_policy || '',
          allowed_external_emails: data.settings?.allowed_external_emails || '',
        });
      }

      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/subjects', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const driveStatusParam = params.get('drive');
    const message = params.get('message');

    if (driveStatusParam && message) {
      if (driveStatusParam === 'success') {
        showToast(message, 'success');
      } else {
        setCriticalError({
          title: 'Errore Connessione Google Drive',
          message: decodeURIComponent(message),
        });
      }
      window.history.replaceState(null, '', '/admin');
    }
  }, [showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Password non valida');
      }
    } catch {
      setLoginError('Errore di connessione');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectForm({ name: '', slug: '', enabled: true });
  };

  const resetProfessorForm = () => {
    setEditingProfessorId(null);
    setProfessorForm({ name: '' });
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.slug.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/subjects', {
        method: editingSubjectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingSubjectId ? { id: editingSubjectId, ...subjectForm } : subjectForm
        ),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Errore salvataggio materia');

      showToast(editingSubjectId ? 'Materia aggiornata' : 'Materia creata', 'success');
      resetSubjectForm();
      await fetchData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorForm.name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/professors', {
        method: editingProfessorId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingProfessorId ? { id: editingProfessorId, ...professorForm } : professorForm
        ),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Errore salvataggio professore');

      showToast(editingProfessorId ? 'Professore aggiornato' : 'Professore creato', 'success');
      resetProfessorForm();
      await fetchData();

      if (!editingProfessorId && data.professor?.id) {
        window.location.href = `/api/admin/google-drive/connect?professorId=${encodeURIComponent(data.professor.id)}`;
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Eliminare questa materia?')) return;
    await fetch(`/api/admin/subjects?id=${id}`, { method: 'DELETE' });
    showToast('Materia eliminata', 'success');
    await fetchData();
  };

  const deleteProfessor = async (id: string) => {
    if (!confirm('Eliminare questo professore?')) return;
    await fetch(`/api/admin/professors?id=${id}`, { method: 'DELETE' });
    showToast('Professore eliminato', 'success');
    await fetchData();
  };

  const resetConsiglioForm = () => {
    setEditingConsiglioId(null);
    setConsiglioForm({ title: '', content: '', professor_id: '', published: true });
  };

  const handleConsiglioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consiglioForm.title.trim() || !consiglioForm.content.trim() || !consiglioForm.professor_id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/consigli', {
        method: editingConsiglioId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingConsiglioId ? { id: editingConsiglioId, ...consiglioForm } : consiglioForm
        ),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Errore salvataggio consiglio');

      showToast(editingConsiglioId ? 'Consiglio aggiornato' : 'Consiglio creato', 'success');
      resetConsiglioForm();
      await fetchData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteConsiglio = async (id: string) => {
    if (!confirm('Eliminare questo consiglio?')) return;
    await fetch(`/api/admin/consigli?id=${id}`, { method: 'DELETE' });
    showToast('Consiglio eliminato', 'success');
    await fetchData();
  };

  const deleteUpload = async (id: string) => {
    if (!confirm('Eliminare questo file?')) return;
    await fetch(`/api/admin/uploads?id=${id}`, { method: 'DELETE' });
    showToast('File eliminato', 'success');
    await fetchData();
  };

  const connectDrive = (professorId: string) => {
    window.location.href = `/api/admin/google-drive/connect?professorId=${encodeURIComponent(professorId)}`;
  };

  const disconnectDrive = async (professorId: string) => {
    if (!confirm('Scollegare Google Drive per questo professore?')) return;

    try {
      const response = await fetch(`/api/admin/professors/${professorId}/drive`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Errore scollegamento Drive');

      showToast('Drive scollegato', 'success');
      await fetchData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore', 'error');
    }
  };

  const resetSpForm = () => {
    setSpForm({ subject_id: '', professor_id: '' });
  };

  const handleSpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spForm.subject_id || !spForm.professor_id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/subject-professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spForm),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Errore associazione');

      showToast('Professore associato alla materia', 'success');
      resetSpForm();
      await fetchData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSp = async (id: string) => {
    if (!confirm('Rimuovere questa associazione?')) return;
    await fetch(`/api/admin/subject-professors?id=${id}`, { method: 'DELETE' });
    showToast('Associazione rimossa', 'success');
    await fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neu-base px-4">
        <div className="max-w-md w-full">
          <div className="neu-modal p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-neu-xl bg-[#FF8C42]/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="size-8 text-[#FF8C42]" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground">SKAKK-UP Admin</h1>
              <p className="text-foreground-light mt-2 text-sm">Pannello di amministrazione</p>
              <p className="text-foreground-light mt-2 text-xs">
                {buildInstitutionDisclaimer(settingsForm.support_email)}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Inserisci la password admin"
                  className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                  required
                  disabled={loginLoading}
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-neu">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full py-3 bg-gradient-to-br from-[#FF8C42] to-[#E87000] text-white font-semibold rounded-neu premium-transition disabled:opacity-50"
              >
                {loginLoading ? 'Verifica...' : 'Accedi'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <p className="text-center text-sm text-foreground-light">
                Torna alla{' '}
                <Link href="/" className="text-[#6366F1] hover:underline font-medium">
                  home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-base">
      {criticalError && (
        <ErrorAlert
          title={criticalError.title}
          message={criticalError.message}
          onClose={() => setCriticalError(null)}
        />
      )}
      <header className="neu-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-neu bg-[#FF8C42]/10 flex items-center justify-center">
              <Shield className="size-5 text-[#FF8C42]" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">SKAKK-UP Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-foreground-light hover:text-[#EF4444] rounded-neu neu-button premium-transition"
          >
            <LogOut className="size-5" />
            <span className="text-sm font-semibold">Esci</span>
          </button>
        </div>
      </header>

      <div className="neu-surface rounded-none border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
              { id: 'subjects' as const, label: 'Materie', icon: BookOpen },
              { id: 'professors' as const, label: 'Professori', icon: Users },
              { id: 'subject-professors' as const, label: 'Associazioni', icon: LinkIcon },
              { id: 'uploads' as const, label: 'File', icon: FileText },
              { id: 'consigli' as const, label: 'Consigli', icon: Lightbulb },
              { id: 'settings' as const, label: 'Impostazioni', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#6366F1] text-[#6366F1]'
                      : 'border-transparent text-foreground-light hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-neu bg-stone-200 flex items-center justify-center">
                <Activity className="size-5 text-foreground" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground">Panoramica</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="neu-card p-6">
                <p className="text-foreground-light text-sm font-medium">Materie</p>
                <p className="text-3xl font-semibold text-foreground mt-1">{subjects.length}</p>
              </div>
              <div className="neu-card p-6">
                <p className="text-foreground-light text-sm font-medium">Professori</p>
                <p className="text-3xl font-semibold text-foreground mt-1">{professors.length}</p>
              </div>
              <div className="neu-card p-6">
                <p className="text-foreground-light text-sm font-medium">File Caricati</p>
                <p className="text-3xl font-semibold text-foreground mt-1">{uploads.length}</p>
              </div>
              <div className="neu-card p-6">
                <p className="text-foreground-light text-sm font-medium">Spazio Utilizzato</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {formatBytes(uploads.reduce((sum, upload) => sum + upload.size_bytes, 0))}
                </p>
              </div>
            </div>

            <div className="neu-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="size-5 text-[#6366F1]" />
                <h3 className="text-lg font-semibold text-foreground">Statistiche Rapide</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-neu neu-surface">
                  <School className="size-4 text-[#52B788] mb-2" />
                  <p className="text-sm font-semibold text-foreground">Materie Attive</p>
                  <p className="text-2xl font-bold text-foreground">{subjects.filter((s) => s.enabled).length}</p>
                </div>
                <div className="p-4 rounded-neu neu-surface">
                  <UserCheck className="size-4 text-[#6366F1] mb-2" />
                  <p className="text-sm font-semibold text-foreground">Drive Collegati</p>
                  <p className="text-2xl font-bold text-foreground">
                    {professors.filter((p) => p.drive_connection?.status === 'connected').length}
                  </p>
                </div>
                <div className="p-4 rounded-neu neu-surface">
                  <FileCheck className="size-4 text-[#F59E0B] mb-2" />
                  <p className="text-sm font-semibold text-foreground">File Totali</p>
                  <p className="text-2xl font-bold text-foreground">{uploads.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-neu gradient-mint flex items-center justify-center">
                    <Plus className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingSubjectId ? 'Modifica Materia' : 'Aggiungi Materia'}
                  </h3>
                </div>

                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Nome Materia</label>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: Matematica"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Slug</label>
                    <input
                      type="text"
                      value={subjectForm.slug}
                      onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: matematica"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#52B788] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : editingSubjectId ? 'Aggiorna' : 'Crea'}
                  </button>
                  {editingSubjectId && (
                    <button
                      type="button"
                      onClick={resetSubjectForm}
                      className="w-full py-3 bg-[#FFB5A0] text-white font-semibold rounded-neu premium-transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center gap-3">
                  <BookOpen className="size-5 text-[#6366F1]" />
                  <h3 className="text-lg font-semibold text-foreground">Materie ({subjects.length})</h3>
                </div>
                <div className="divide-y divide-stone-200/50">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="px-6 py-4 flex justify-between items-center hover:bg-neu-base/50 transition">
                      <div>
                        <p className="font-semibold text-foreground">{subject.name}</p>
                        <p className="text-sm text-foreground-light">
                          {subject.enabled ? 'Attivo' : 'Disattivato'}
                          {subject.slug && <span className="ml-2 font-mono text-xs">{subject.slug}</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSubjectForm(subject);
                            setEditingSubjectId(subject.id);
                          }}
                          className="px-4 py-2 text-sm bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                        >
                          <Edit className="size-3.5" />
                          Modifica
                        </button>
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="px-4 py-2 text-sm bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                        >
                          <Trash2 className="size-3.5" />
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'professors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-neu gradient-lavender flex items-center justify-center">
                    <Plus className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingProfessorId ? 'Modifica Professore' : 'Aggiungi Professore'}
                  </h3>
                </div>

                <form onSubmit={handleProfessorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Nome Professore</label>
                    <input
                      type="text"
                      value={professorForm.name}
                      onChange={(e) => setProfessorForm({ name: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: Prof. Rossi"
                      required
                    />
                  </div>
                  <div className="p-3 rounded-neu neu-surface-pressed flex items-start gap-2">
                    <HardDrive className="size-4 text-lavender mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground-light">
                      Le credenziali Google dell&apos;app stanno nelle variabili d&apos;ambiente. Il Drive si collega con OAuth dalla lista professori.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#9B72B0] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : editingProfessorId ? 'Aggiorna' : 'Crea'}
                  </button>
                  {editingProfessorId && (
                    <button
                      type="button"
                      onClick={resetProfessorForm}
                      className="w-full py-3 bg-[#FFB5A0] text-white font-semibold rounded-neu premium-transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center gap-3">
                  <Users className="size-5 text-[#6366F1]" />
                  <h3 className="text-lg font-semibold text-foreground">Professori ({professors.length})</h3>
                </div>
                <div className="divide-y divide-stone-200/50">
                  {professors.map((professor) => {
                    const status = driveStatus(professor);
                    const connected = professor.drive_connection?.status === 'connected';

                    return (
                      <div key={professor.id} className="px-6 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center hover:bg-neu-base/50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-neu bg-stone-200 flex items-center justify-center">
                            <Users className="size-5 text-foreground-light" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{professor.name}</p>
                            <p className={`text-xs font-medium ${status.className}`}>{status.label}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => connectDrive(professor.id)}
                            className="px-4 py-2 text-sm bg-[#52B788]/10 hover:bg-[#52B788]/20 text-[#2D8A60] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                          >
                            <HardDrive className="size-3.5" />
                            {connected ? 'Ricollega' : 'Connetti Drive'}
                          </button>
                          {connected && (
                            <button
                              onClick={() => disconnectDrive(professor.id)}
                              className="px-4 py-2 text-sm bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#B76B00] rounded-neu font-medium premium-transition"
                            >
                              Scollega
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setProfessorForm({ name: professor.name });
                              setEditingProfessorId(professor.id);
                            }}
                            className="px-4 py-2 text-sm bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                          >
                            <Edit className="size-3.5" />
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteProfessor(professor.id)}
                            className="px-4 py-2 text-sm bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                          >
                            <Trash2 className="size-3.5" />
                            Elimina
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subject-professors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-neu gradient-lavender flex items-center justify-center">
                    <LinkIcon className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Associa Professore a Materia</h3>
                </div>

                <form onSubmit={handleSpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Materia</label>
                    <select
                      value={spForm.subject_id}
                      onChange={(e) => setSpForm({ ...spForm, subject_id: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground outline-none premium-transition [&>option]:bg-neu-surface"
                      required
                    >
                      <option value="">Seleziona materia</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Professore</label>
                    <select
                      value={spForm.professor_id}
                      onChange={(e) => setSpForm({ ...spForm, professor_id: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground outline-none premium-transition [&>option]:bg-neu-surface"
                      required
                    >
                      <option value="">Seleziona professore</option>
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#6366F1] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : 'Associa'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center gap-3">
                  <LinkIcon className="size-5 text-[#6366F1]" />
                  <h3 className="text-lg font-semibold text-foreground">Associazioni ({subjectProfessors.length})</h3>
                </div>
                <div className="divide-y divide-stone-200/50">
                  {subjectProfessors.map((sp) => (
                    <div key={sp.id} className="px-6 py-4 flex justify-between items-center hover:bg-neu-base/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-neu bg-[#6366F1]/10 flex items-center justify-center">
                          <Users className="size-5 text-[#6366F1]" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{sp.professor?.name || '-'}</p>
                          <p className="text-sm text-foreground-light">→ {sp.subject?.name || '-'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSp(sp.id)}
                        className="px-4 py-2 text-sm bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                      >
                        <XCircle className="size-3.5" />
                        Rimuovi
                      </button>
                    </div>
                  ))}
                  {subjectProfessors.length === 0 && (
                    <div className="px-6 py-12 text-center text-foreground-light">
                      <LinkIcon className="size-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-sm">Nessuna associazione presente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-neu bg-stone-200 flex items-center justify-center">
                <Database className="size-5 text-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">File Caricati ({uploads.length})</h2>
            </div>

            <div className="neu-card overflow-hidden">
              {uploads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neu-base/50 border-b border-stone-200/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome File</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Materia</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Professore</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Dimensione</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/50">
                      {uploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-neu-base/50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{upload.original_filename}</td>
                          <td className="px-6 py-4 text-sm text-foreground-light">{upload.subject?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-foreground-light">{upload.professor?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-foreground-light">{formatBytes(upload.size_bytes)}</td>
                          <td className="px-6 py-4 text-sm text-foreground-light">{formatDate(upload.created_at)}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUpload(upload.id)}
                              className="px-4 py-2 text-sm bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                            >
                              <Trash2 className="size-4" />
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-16 text-center text-foreground-light">
                  <Database className="size-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Nessun file caricato</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'consigli' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-neu gradient-lavender flex items-center justify-center">
                    <Lightbulb className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingConsiglioId ? 'Modifica Consiglio' : 'Aggiungi Consiglio'}
                  </h3>
                </div>

                <form onSubmit={handleConsiglioSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Titolo</label>
                    <input
                      type="text"
                      value={consiglioForm.title}
                      onChange={(e) => setConsiglioForm({ ...consiglioForm, title: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: Come studiare meglio"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Contenuto</label>
                    <textarea
                      value={consiglioForm.content}
                      onChange={(e) => setConsiglioForm({ ...consiglioForm, content: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition resize-none"
                      rows={5}
                      placeholder="Scrivi il consiglio..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Professore</label>
                    <select
                      value={consiglioForm.professor_id}
                      onChange={(e) => setConsiglioForm({ ...consiglioForm, professor_id: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground outline-none premium-transition [&>option]:bg-neu-surface"
                      required
                    >
                      <option value="">Seleziona professore</option>
                      {professors.map((prof) => (
                        <option key={prof.id} value={prof.id}>{prof.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="consiglio-published"
                      checked={consiglioForm.published}
                      onChange={(e) => setConsiglioForm({ ...consiglioForm, published: e.target.checked })}
                      className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <label htmlFor="consiglio-published" className="text-sm font-medium text-foreground">Pubblicato</label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#9B72B0] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : editingConsiglioId ? 'Aggiorna' : 'Pubblica'}
                  </button>
                  {editingConsiglioId && (
                    <button
                      type="button"
                      onClick={resetConsiglioForm}
                      className="w-full py-3 bg-[#FFB5A0] text-white font-semibold rounded-neu premium-transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center gap-3">
                  <Lightbulb className="size-5 text-[#6366F1]" />
                  <h3 className="text-lg font-semibold text-foreground">Consigli ({consigli.length})</h3>
                </div>
                <div className="divide-y divide-stone-200/50">
                  {consigli.map((consiglio) => (
                    <div key={consiglio.id} className="px-6 py-4 hover:bg-neu-base/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{consiglio.title}</p>
                          <p className="text-xs text-foreground-light mt-1 line-clamp-2">{consiglio.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => {
                              setConsiglioForm({
                                title: consiglio.title,
                                content: consiglio.content,
                                professor_id: consiglio.professor_id,
                                published: consiglio.published,
                              });
                              setEditingConsiglioId(consiglio.id);
                            }}
                            className="px-3 py-1.5 text-xs bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] rounded-neu flex items-center gap-1 font-medium premium-transition"
                          >
                            <Edit className="size-3" />
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteConsiglio(consiglio.id)}
                            className="px-3 py-1.5 text-xs bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-neu flex items-center gap-1 font-medium premium-transition"
                          >
                            <Trash2 className="size-3" />
                            Elimina
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {consiglio.professor?.name || '-'}
                        </span>
                        <span>{consiglio.published ? 'Pubblicato' : 'Bozza'}</span>
                        <span>{new Date(consiglio.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                  {consigli.length === 0 && (
                    <div className="px-6 py-12 text-center text-foreground-light">
                      <Lightbulb className="size-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-sm">Nessun consiglio pubblicato</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-neu bg-stone-200 flex items-center justify-center">
                <Settings className="size-5 text-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Impostazioni Sito</h2>
            </div>

            <div className="space-y-6">
              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="size-5 text-[#6366F1]" />
                  Email di Contatto Admin
                </h3>
                <p className="text-sm text-foreground-light mb-4">
                  Questa email verrà visualizzata nel footer del sito per le segnalazioni.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={settingsForm.support_email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                    placeholder="admin@esempio.com"
                    className="flex-1 px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                  />
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key: 'support_email', value: settingsForm.support_email }),
                        });
                        if (res.ok) {
                          showToast('Email aggiornata', 'success');
                          fetchData();
                        }
                      } catch (error) {
                        showToast('Errore aggiornamento', 'error');
                      }
                    }}
                    className="px-6 py-3 bg-[#6366F1] text-white font-semibold rounded-neu premium-transition"
                  >
                    Salva
                  </button>
                </div>
              </div>

              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Policy & Responsabilità</h3>
                <p className="text-sm text-foreground-light mb-4">
                  Questo testo apparirà nella finestra della policy accessibile dal footer.
                </p>
                <textarea
                  value={settingsForm.site_policy}
                  onChange={(e) => setSettingsForm({ ...settingsForm, site_policy: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition resize-none"
                  placeholder="Inserisci la policy del sito..."
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'site_policy', value: settingsForm.site_policy }),
                      });
                      if (res.ok) {
                        showToast('Policy aggiornata', 'success');
                        fetchData();
                      }
                    } catch (error) {
                      showToast('Errore aggiornamento', 'error');
                    }
                  }}
                  className="mt-4 px-6 py-3 bg-[#6366F1] text-white font-semibold rounded-neu premium-transition"
                >
                  Salva Policy
                </button>
              </div>

              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Email esterne consentite (temporanee)</h3>
                <p className="text-sm text-foreground-light mb-4">
                  Inserisci email ospiti separate da virgola. Solo queste, oltre al dominio istituzionale, potranno accedere.
                </p>
                <textarea
                  value={settingsForm.allowed_external_emails}
                  onChange={(e) => setSettingsForm({ ...settingsForm, allowed_external_emails: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition resize-none"
                  placeholder="ospite1@gmail.com,ospite2@gmail.com"
                />
                <button
                  onClick={async () => {
                    try {
                      const sanitized = settingsForm.allowed_external_emails
                        .split(',')
                        .map((value) => value.trim().toLowerCase())
                        .filter(Boolean)
                        .join(',');

                      const res = await fetch('/api/admin/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'allowed_external_emails', value: sanitized }),
                      });
                      if (res.ok) {
                        showToast('Whitelist email esterne aggiornata', 'success');
                        fetchData();
                      }
                    } catch {
                      showToast('Errore aggiornamento whitelist', 'error');
                    }
                  }}
                  className="mt-4 px-6 py-3 bg-[#6366F1] text-white font-semibold rounded-neu premium-transition"
                >
                  Salva whitelist esterni
                </button>
              </div>

              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Audit Log</h3>
                <p className="text-sm text-foreground-light mb-4">
                  Scarica il report PDF con le ultime azioni sensibili registrate.
                </p>
                <button
                  onClick={() => window.open('/api/admin/audit-logs/pdf', '_blank')}
                  className="px-6 py-3 bg-[#6366F1] text-white font-semibold rounded-neu premium-transition"
                >
                  Scarica Audit PDF
                </button>
                <div className="mt-5 space-y-2 max-h-64 overflow-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-foreground-light">Nessun evento registrato</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-neu neu-surface text-xs text-foreground-light">
                        <p className="font-semibold text-foreground">
                          {log.action} · {log.target_type}
                        </p>
                        <p>{new Date(log.created_at).toLocaleString('it-IT')}</p>
                        <p>{log.actor_email || 'system'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
