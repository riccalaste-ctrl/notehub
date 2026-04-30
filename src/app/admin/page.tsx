'use client';

import { useState, useEffect, useCallback } from 'react';
import Toast, { useToast } from '@/components/Toast';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, FileText, LayoutDashboard, Plus, Trash2, Edit, LogOut, Search, ChevronRight, Compass } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 shadow-glass-lg">
            <div className="text-center mb-8">
              <div className="w-14 h-14 gradient-logo rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lavender">
                <GraduationCap className="size-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">
                SKAKK-UP Admin
              </h1>
              <p className="text-stone-500 mt-2 text-sm">
                Pannello di amministrazione
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
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
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-lavender/50 focus:border-transparent transition"
                  required
                  disabled={loginLoading}
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full py-3 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lavender"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifica...
                  </span>
                ) : (
                  'Accedi'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <p className="text-center text-sm text-stone-500">
                Torna alla{' '}
                <Link href="/" className="text-lavender hover:text-lavender-dark font-medium transition">
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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-logo rounded-xl flex items-center justify-center shadow-lavender">
              <GraduationCap className="size-6 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">SKAKK-UP Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut className="size-5" />
            <span>Esci</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="glass-header">
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
                      ? 'border-lavender text-lavender'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
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
            <h2 className="text-3xl font-bold text-stone-800 mb-8">Panoramica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 bento-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm">Materie</p>
                    <p className="text-3xl font-bold text-stone-800">{subjects.length}</p>
                  </div>
                  <div className="w-12 h-12 gradient-sage rounded-xl flex items-center justify-center shadow-sage">
                    <BookOpen className="size-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bento-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm">Professori</p>
                    <p className="text-3xl font-bold text-stone-800">{professors.length}</p>
                  </div>
                  <div className="w-12 h-12 gradient-lavender rounded-xl flex items-center justify-center shadow-lavender">
                    <Users className="size-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bento-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm">File Caricati</p>
                    <p className="text-3xl font-bold text-stone-800">{uploads.length}</p>
                  </div>
                  <div className="w-12 h-12 gradient-peach rounded-xl flex items-center justify-center shadow-peach">
                    <FileText className="size-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bento-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm">Spazio Utilizzato</p>
                    <p className="text-3xl font-bold text-stone-800">
                      {formatBytes(uploads.reduce((sum, u) => sum + u.size_bytes, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-stone-300 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="size-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-lavender">
              <p className="text-sm text-stone-600">
                Benvenuto nel pannello amministrativo di SKAKK-UP. Qui puoi gestire materie, professori e file caricati.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">
                  {editingId ? 'Modifica Materia' : 'Aggiungi Materia'}
                </h3>

                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Nome Materia
                    </label>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 focus:ring-2 focus:ring-lavender/50 focus:outline-none"
                      placeholder="Es: Matematica"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={subjectForm.enabled}
                      onChange={(e) => setSubjectForm({ ...subjectForm, enabled: e.target.checked })}
                      className="w-4 h-4 text-lavender rounded"
                    />
                    <label htmlFor="enabled" className="ml-2 text-sm text-stone-600">
                      Attivo
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 gradient-primary text-white font-medium rounded-xl transition disabled:opacity-50 shadow-lavender"
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
                      className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50">
                  <h3 className="text-lg font-semibold text-stone-800">
                    Materie ({subjects.length})
                  </h3>
                </div>

                <div className="divide-y divide-stone-100">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div key={subject.id} className="px-6 py-4 flex justify-between items-center hover:bg-stone-50/50 transition">
                        <div className="flex-1">
                          <p className="font-medium text-stone-800">{subject.name}</p>
                          <p className="text-sm text-stone-500">
                            {subject.enabled ? 'Attivo' : 'Disattivato'}
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
                            className="px-3 py-1 text-sm bg-lavender/10 hover:bg-lavender/20 text-lavender-dark rounded-xl transition flex items-center gap-1"
                          >
                            <Edit className="size-3.5" />
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex items-center gap-1"
                          >
                            <Trash2 className="size-3.5" />
                            Elimina
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-stone-500">
                      Nessuna materia creata. Inizia a crearne una!
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
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">
                  Aggiungi Professore
                </h3>

                <form onSubmit={handleProfessorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Nome Professore
                    </label>
                    <input
                      type="text"
                      value={professorForm.name}
                      onChange={(e) => setProfessorForm({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 focus:ring-2 focus:ring-lavender/50 focus:outline-none"
                      placeholder="Es: Prof. Rossi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 gradient-primary text-white font-medium rounded-xl transition disabled:opacity-50 shadow-lavender"
                  >
                    {loading ? 'Elaborazione...' : 'Crea'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200/50">
                  <h3 className="text-lg font-semibold text-stone-800">
                    Professori ({professors.length})
                  </h3>
                </div>

                <div className="divide-y divide-stone-100">
                  {professors.length > 0 ? (
                    professors.map((professor) => (
                      <div key={professor.id} className="px-6 py-4 flex justify-between items-center hover:bg-stone-50/50 transition">
                        <p className="font-medium text-stone-800">{professor.name}</p>
                        <button
                          onClick={() => deleteProfessor(professor.id)}
                          className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex items-center gap-1"
                        >
                          <Trash2 className="size-3.5" />
                          Elimina
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-stone-500">
                      Nessun professore creato. Inizia a crearne uno!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div>
            <h2 className="text-2xl font-bold text-stone-800 mb-6">
              File Caricati ({uploads.length})
            </h2>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50/50 border-b border-stone-200/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-800">Nome File</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-800">Materia</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-800">Dimensione</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-800">Data</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-800">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {uploads.length > 0 ? (
                      uploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-stone-50/50 transition">
                          <td className="px-6 py-4 text-sm text-stone-800">{upload.original_filename}</td>
                          <td className="px-6 py-4 text-sm text-stone-500">
                            {upload.subject?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-500">
                            {formatBytes(upload.size_bytes)}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-500">
                            {formatDate(upload.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUpload(upload.id)}
                              className="text-red-600 hover:text-red-700 transition flex items-center gap-1"
                            >
                              <Trash2 className="size-4" />
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                          Nessun file caricato
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}
