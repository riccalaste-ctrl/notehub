'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Toast, { useToast } from '@/components/Toast';

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
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [subjectForm, setSubjectForm] = useState({ name: '', enabled: true });
  const [professorForm, setProfessorForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/subjects', { method: 'HEAD' });
        if (!cancelled) {
          if (res.status === 401 || res.status === 403) {
            setAuthStatus('unauthenticated');
            router.push('/admin/login');
          } else {
            setAuthStatus('authenticated');
          }
        }
      } catch {
        if (!cancelled) {
          setAuthStatus('unauthenticated');
          router.push('/admin/login');
        }
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

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
  }, [router, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      showToast('Errore nel logout', 'error');
    }
  };

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

  if (authStatus !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">NoteHub Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Esci</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard' as const, label: '📊 Dashboard' },
              { id: 'subjects' as const, label: '📚 Materie' },
              { id: 'professors' as const, label: '👨‍🏫 Professori' },
              { id: 'uploads' as const, label: '📁 File' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Panoramica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Materie</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{subjects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Professori</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{professors.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">File Caricati</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{uploads.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Spazio Utilizzato</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {formatBytes(uploads.reduce((sum, u) => sum + u.size_bytes, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💾</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ Benvenuto nel pannello amministrativo di NoteHub. Qui puoi gestire materie, professori e file caricati.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {editingId ? '✏️ Modifica Materia' : '➕ Aggiungi Materia'}
                </h3>

                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nome Materia
                    </label>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                      className="w-4 h-4 text-primary-600"
                    />
                    <label htmlFor="enabled" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                      Attivo
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
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
                      className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition"
                    >
                      Annulla
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Materie ({subjects.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div key={subject.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{subject.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {subject.enabled ? '✅ Attivo' : '❌ Disattivo'}
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
                            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded transition"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  ➕ Aggiungi Professore
                </h3>

                <form onSubmit={handleProfessorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nome Professore
                    </label>
                    <input
                      type="text"
                      value={professorForm.name}
                      onChange={(e) => setProfessorForm({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      placeholder="Es: Prof. Rossi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Elaborazione...' : 'Crea'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Professori ({professors.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {professors.length > 0 ? (
                    professors.map((professor) => (
                      <div key={professor.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <p className="font-medium text-slate-900 dark:text-white">{professor.name}</p>
                        <button
                          onClick={() => deleteProfessor(professor.id)}
                          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded transition"
                        >
                          Elimina
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              File Caricati ({uploads.length})
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nome File</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Materia</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Dimensione</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Data</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {uploads.length > 0 ? (
                      uploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{upload.original_filename}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {upload.subject?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatBytes(upload.size_bytes)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(upload.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUpload(upload.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
