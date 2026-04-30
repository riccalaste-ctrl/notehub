'use client';

import { useState, useEffect, useCallback } from 'react';
import Toast, { useToast } from '@/components/Toast';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, FileText, LayoutDashboard, Plus, Trash2, Edit, LogOut, Search, ChevronRight, Compass, Shield, Database, HardDrive, Activity, TrendingUp, School, UserCheck, FileCheck, BarChart3 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  enabled: boolean;
}

interface Professor {
  id: string;
  name: string;
}

interface Upload {
  id: string;
  original_filename: string;
  subject?: { name: string };
  created_at: string;
  size_bytes: number;
}

type Tab = 'dashboard' | 'subjects' | 'professors' | 'uploads';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const [subjectForm, setSubjectForm] = useState({ name: '', enabled: true });
  const [professorForm, setProfessorForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/subjects', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .catch(() => {});
  }, []);

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
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      showToast('Errore nel logout', 'error');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [subjectsRes, professorsRes, uploadsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/uploads?limit=20'),
      ]);

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(Array.isArray(data) ? data : data.subjects || []);
      }
      if (professorsRes.ok) {
        const data = await professorsRes.json();
        setProfessors(Array.isArray(data) ? data : data.professors || []);
      }
      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        setUploads(data.uploads || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Errore nel caricamento dei dati', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/subjects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId ? { id: editingId, ...subjectForm } : subjectForm
        ),
      });

      if (response.ok) {
        showToast(
          editingId ? 'Materia aggiornata' : 'Materia creata',
          'success'
        );
        setSubjectForm({ name: '', enabled: true });
        setEditingId(null);
        await fetchData();
      }
    } catch (error) {
      showToast('Errore', 'error');
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(professorForm),
      });

      if (response.ok) {
        showToast('Professore creato', 'success');
        setProfessorForm({ name: '' });
        await fetchData();
      }
    } catch (error) {
      showToast('Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Eliminare questa materia?')) return;

    try {
      await fetch(`/api/admin/subjects?id=${id}`, { method: 'DELETE' });
      showToast('Materia eliminata', 'success');
      await fetchData();
    } catch {
      showToast('Errore', 'error');
    }
  };

  const deleteProfessor = async (id: string) => {
    if (!confirm('Eliminare questo professore?')) return;

    try {
      await fetch(`/api/admin/professors?id=${id}`, { method: 'DELETE' });
      showToast('Professore eliminato', 'success');
      await fetchData();
    } catch {
      showToast('Errore', 'error');
    }
  };

  const deleteUpload = async (id: string) => {
    if (!confirm('Eliminare questo file?')) return;

    try {
      await fetch(`/api/admin/uploads?id=${id}`, { method: 'DELETE' });
      showToast('File eliminato', 'success');
      await fetchData();
    } catch {
      showToast('Errore', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neu-base px-4">
        <div className="max-w-md w-full">
          <div className="neu-modal p-8">
            <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-neu-xl bg-[#5B8DB8]/20 flex items-center justify-center mx-auto mb-4 shadow-neu-lg">
              <Shield className="size-8 text-[#5B8DB8]" />
            </div>
              <h1 className="text-3xl font-semibold text-foreground">
                SKAKK-UP Admin
              </h1>
              <p className="text-foreground-light mt-2 text-sm">
                Pannello di amministrazione
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
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
                <div className="px-4 py-3 bg-coral/10 border border-coral/20 text-coral-dark text-sm rounded-neu">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full py-3 bg-[#5B8DB8] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifica...
                  </>
                ) : (
                  'Accedi'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <p className="text-center text-sm text-foreground-light">
                Torna alla{' '}
                <Link href="/" className="text-lavender-dark hover:underline font-medium">
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
      {/* Header */}
      <header className="neu-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-neu flex items-center justify-center p-1">
              <img src="/logo.svg" alt="SKAKK-UP" className="w-full h-full" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">SKAKK-UP Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-foreground-light hover:text-coral-dark rounded-neu neu-button premium-transition"
          >
            <LogOut className="size-5" />
            <span className="text-sm font-semibold">Esci</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="neu-surface rounded-none border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
              { id: 'subjects' as const, label: 'Materie', icon: BookOpen },
              { id: 'professors' as const, label: 'Professori', icon: Users },
              { id: 'uploads' as const, label: 'File', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-lavender text-lavender-dark'
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

      {/* Content */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground-light text-sm font-medium">Materie</p>
                    <p className="text-3xl font-semibold text-foreground mt-1">{subjects.length}</p>
                  </div>
            <div className="w-12 h-12 rounded-neu bg-mint/20 flex items-center justify-center shadow-neu">
              <BookOpen className="size-6 text-mint-dark" />
            </div>
                </div>
              </div>

              <div className="neu-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground-light text-sm font-medium">Professori</p>
                    <p className="text-3xl font-semibold text-foreground mt-1">{professors.length}</p>
                  </div>
            <div className="w-12 h-12 rounded-neu bg-lavender/20 flex items-center justify-center shadow-neu">
              <Users className="size-6 text-lavender-dark" />
            </div>
                </div>
              </div>

              <div className="neu-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground-light text-sm font-medium">File Caricati</p>
                    <p className="text-3xl font-semibold text-foreground mt-1">{uploads.length}</p>
                  </div>
            <div className="w-12 h-12 rounded-neu bg-coral/20 flex items-center justify-center shadow-neu">
              <FileText className="size-6 text-coral-dark" />
            </div>
                </div>
              </div>

              <div className="neu-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground-light text-sm font-medium">Spazio Utilizzato</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {formatBytes(uploads.reduce((sum, u) => sum + u.size_bytes, 0))}
                    </p>
                  </div>
            <div className="w-12 h-12 rounded-neu bg-orange-400/20 flex items-center justify-center">
              <HardDrive className="size-6 text-orange-500" />
            </div>
                </div>
              </div>
            </div>

            <div className="neu-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="size-5 text-lavender-dark" />
                <h3 className="text-lg font-semibold text-foreground">Statistiche Rapide</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-neu neu-surface">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="size-4 text-mint-dark" />
                    <p className="text-sm font-semibold text-foreground">Materie Attive</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{subjects.filter(s => s.enabled).length}</p>
                </div>
                <div className="p-4 rounded-neu neu-surface">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="size-4 text-lavender-dark" />
                    <p className="text-sm font-semibold text-foreground">Professori Totali</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{professors.length}</p>
                </div>
                <div className="p-4 rounded-neu neu-surface">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="size-4 text-coral-dark" />
                    <p className="text-sm font-semibold text-foreground">File Totali</p>
                  </div>
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
                    {editingId ? 'Modifica Materia' : 'Aggiungi Materia'}
                  </h3>
                </div>

                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Nome Materia
                    </label>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: Matematica"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#52B788] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : (editingId ? 'Aggiorna' : 'Crea')}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setSubjectForm({ name: '', enabled: true });
                      }}
                      className="w-full py-3 bg-[#FFB5A0] hover:bg-[#FF9D85] text-white font-semibold rounded-neu premium-transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="size-5 text-lavender-dark" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Materie ({subjects.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-stone-200/50">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div key={subject.id} className="px-6 py-4 flex justify-between items-center hover:bg-neu-base/50 transition">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{subject.name}</p>
                          <p className="text-sm text-foreground-light">
                            {subject.enabled ? (
                              <span className="text-mint-dark font-medium">Attivo</span>
                            ) : (
                              <span className="text-coral-dark font-medium">Disattivato</span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSubjectForm({
                                name: subject.name,
                                enabled: subject.enabled,
                              });
                              setEditingId(subject.id);
                            }}
                            className="px-4 py-2 text-sm bg-lavender/10 hover:bg-lavender/20 text-lavender-dark rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                          >
                            <Edit className="size-3.5" />
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="px-4 py-2 text-sm bg-coral/10 hover:bg-coral/20 text-coral-dark rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                          >
                            <Trash2 className="size-3.5" />
                            Elimina
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-foreground-light">
                      <BookOpen className="size-12 text-stone-300 mx-auto mb-3" />
                      <p>Nessuna materia creata. Inizia a crearne una!</p>
                    </div>
                  )}
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
                    Aggiungi Professore
                  </h3>
                </div>

                <form onSubmit={handleProfessorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Nome Professore
                    </label>
                    <input
                      type="text"
                      value={professorForm.name}
                      onChange={(e) => setProfessorForm({ name: e.target.value })}
                      className="w-full px-4 py-3 neu-input rounded-neu text-foreground placeholder-foreground-muted outline-none premium-transition"
                      placeholder="Es: Prof. Rossi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#9B72B0] text-white font-semibold rounded-neu premium-transition shadow-neu disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : 'Crea'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="neu-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-lavender-dark" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Professori ({professors.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-stone-200/50">
                  {professors.length > 0 ? (
                    professors.map((professor) => (
                      <div key={professor.id} className="px-6 py-4 flex justify-between items-center hover:bg-neu-base/50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-neu bg-stone-200 flex items-center justify-center">
                            <Users className="size-5 text-foreground-light" />
                          </div>
                          <p className="font-semibold text-foreground">{professor.name}</p>
                        </div>
                        <button
                          onClick={() => deleteProfessor(professor.id)}
                          className="px-4 py-2 text-sm bg-coral/10 hover:bg-coral/20 text-coral-dark rounded-neu flex items-center gap-1.5 font-medium premium-transition"
                        >
                          <Trash2 className="size-3.5" />
                          Elimina
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-foreground-light">
                      <Users className="size-12 text-stone-300 mx-auto mb-3" />
                      <p>Nessun professore creato. Inizia a crearne uno!</p>
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
              <h2 className="text-2xl font-semibold text-foreground">
                File Caricati ({uploads.length})
              </h2>
            </div>

            <div className="neu-card overflow-hidden">
              {uploads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neu-base/50 border-b border-stone-200/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"><FileText className="size-4 inline mr-2" />Nome File</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"><BookOpen className="size-4 inline mr-2" />Materia</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"><HardDrive className="size-4 inline mr-2" />Dimensione</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"><TrendingUp className="size-4 inline mr-2" />Data</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/50">
                      {uploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-neu-base/50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{upload.original_filename}</td>
                          <td className="px-6 py-4 text-sm text-foreground-light">
                            {upload.subject?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground-light">
                            {formatBytes(upload.size_bytes)}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground-light">
                            {formatDate(upload.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUpload(upload.id)}
                              className="px-4 py-2 text-sm bg-coral/10 hover:bg-coral/20 text-coral-dark rounded-neu flex items-center gap-1.5 font-medium premium-transition"
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
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
