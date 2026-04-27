'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface Subject {
  id: string;
  name: string;
  slug: string;
  gas_url: string | null;
  gas_secret: string | null;
  enabled: boolean;
  created_at: string;
}

interface Professor {
  id: string;
  name: string;
}

interface SubjectProfessor {
  id: string;
  subject_id: string;
  professor_id: string;
  subject?: { id: string; name: string; slug: string };
  professor?: { id: string; name: string };
}

interface Upload {
  id: string;
  original_filename: string;
  subject?: { name: string };
  professor?: { name: string };
  created_at: string;
  size_bytes: number;
  mime_type: string;
}

type Tab = 'subjects' | 'professors' | 'associations' | 'uploads' | 'bridge';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [associations, setAssociations] = useState<SubjectProfessor[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [subjectForm, setSubjectForm] = useState({ name: '', slug: '', gas_url: '', gas_secret: '', enabled: true });
  const [professorForm, setProfessorForm] = useState({ name: '' });
  const [associationForm, setAssociationForm] = useState({ subject_id: '', professor_id: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subjects');
      if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subjectsRes, professorsRes, associationsRes, uploadsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/professors'),
        fetch('/api/admin/subject-professors'),
        fetch('/api/admin/uploads?limit=100'),
      ]);

      const subjectsData = await subjectsRes.json();
      const professorsData = await professorsRes.json();
      const associationsData = await associationsRes.json();
      const uploadsData = await uploadsRes.json();

      if (subjectsData.subjects) setSubjects(subjectsData.subjects);
      if (professorsData.professors) setProfessors(professorsData.professors);
      if (associationsData.associations) setAssociations(associationsData.associations);
      if (uploadsData.uploads) setUploads(uploadsData.uploads);
    } catch (error) {
      showToast('Errore nel caricamento dei dati', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? '/api/admin/subjects' : '/api/admin/subjects';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { id: editingId, ...subjectForm } 
        : subjectForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(editingId ? 'Materia aggiornata' : 'Materia creata', 'success');
        setSubjectForm({ name: '', slug: '', gas_url: '', gas_secret: '', enabled: true });
        setEditingId(null);
        fetchData();
      } else {
        showToast(data.error || 'Errore', 'error');
      }
    } catch (error) {
      showToast('Errore di connessione', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(professorForm),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Professore creato', 'success');
        setProfessorForm({ name: '' });
        fetchData();
      } else {
        showToast(data.error || 'Errore', 'error');
      }
    } catch (error) {
      showToast('Errore di connessione', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssociationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/subject-professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(associationForm),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Associazione creata', 'success');
        setAssociationForm({ subject_id: '', professor_id: '' });
        fetchData();
      } else {
        showToast(data.error || 'Errore', 'error');
      }
    } catch (error) {
      showToast('Errore di connessione', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Eliminare questa materia?')) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/subjects?id=${id}`, { method: 'DELETE' });
      showToast('Materia eliminata', 'success');
      fetchData();
    } catch {
      showToast('Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessor = async (id: string) => {
    if (!confirm('Eliminare questo professore?')) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/professors?id=${id}`, { method: 'DELETE' });
      showToast('Professore eliminato', 'success');
      fetchData();
    } catch {
      showToast('Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUpload = async (id: string) => {
    if (!confirm('Eliminare questo file?')) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/uploads?id=${id}`, { method: 'DELETE' });
      showToast('File eliminato', 'success');
      fetchData();
    } catch {
      showToast('Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssociation = async (id: string) => {
    if (!confirm('Eliminare questa associazione?')) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/subject-professors?id=${id}`, { method: 'DELETE' });
      showToast('Associazione eliminata', 'success');
      fetchData();
    } catch {
      showToast('Errore', 'error');
    } finally {
      setLoading(false);
    }
  };

  const editSubject = (subject: Subject) => {
    setSubjectForm({
      name: subject.name,
      slug: subject.slug,
      gas_url: subject.gas_url || '',
      gas_secret: subject.gas_secret || '',
      enabled: subject.enabled,
    });
    setEditingId(subject.id);
  };

  const toggleSubjectEnabled = async (subject: Subject) => {
    try {
      await fetch('/api/admin/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subject.id, enabled: !subject.enabled }),
      });
      fetchData();
    } catch {
      showToast('Errore', 'error');
    }
  };

  const testBridge = async (gasUrl: string) => {
    if (!gasUrl) {
      showToast('URL non configurato', 'error');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/bridge-test?url=${encodeURIComponent(gasUrl)}`);
      const data = await response.json();
      
      if (data.success) {
        showToast(`Bridge OK! ${data.files?.length || 0} file trovati`, 'success');
      } else {
        showToast(data.error || 'Bridge non risponde', 'error');
      }
    } catch {
      showToast('Errore di connessione al bridge', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'subjects' as const, label: 'Materie' },
    { id: 'professors' as const, label: 'Professori' },
    { id: 'associations' as const, label: 'Associazioni' },
    { id: 'uploads' as const, label: 'File caricati' },
    { id: 'bridge' as const, label: 'Test Bridge' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin NoteHub</h1>
          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500">
            Esci
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                {editingId ? 'Modifica materia' : 'Aggiungi materia'}
              </h2>
              <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome materia"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (es: matematica)"
                  value={subjectForm.slug}
                  onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="url"
                  placeholder=" GAS Web App URL"
                  value={subjectForm.gas_url}
                  onChange={(e) => setSubjectForm({ ...subjectForm, gas_url: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="GAS Secret"
                  value={subjectForm.gas_secret}
                  onChange={(e) => setSubjectForm({ ...subjectForm, gas_secret: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subjectForm.enabled}
                    onChange={(e) => setSubjectForm({ ...subjectForm, enabled: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Abilitata</span>
                </label>
                <div className="flex space-x-2">
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
                    {editingId ? 'Aggiorna' : 'Aggiungi'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setSubjectForm({ name: '', slug: '', gas_url: '', gas_secret: '', enabled: true }); }} className="px-4 py-2 bg-slate-500 text-white rounded-lg">
                      Annulla
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Bridge</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Stato</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{subject.slug}</td>
                      <td className="px-4 py-3 text-sm">
                        {subject.gas_url ? (
                          <button onClick={() => testBridge(subject.gas_url!)} className="text-primary-600 hover:underline text-xs">
                            Test
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Non configurato</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSubjectEnabled(subject)} className={`px-2 py-1 text-xs rounded ${subject.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {subject.enabled ? 'Attiva' : 'Disattiva'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => editSubject(subject)} className="text-primary-600 hover:text-primary-700 text-sm">Modifica</button>
                        <button onClick={() => deleteSubject(subject.id)} className="text-red-500 hover:text-red-600 text-sm">Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subjects.length === 0 && <p className="p-4 text-center text-slate-500">Nessuna materia</p>}
            </div>
          </div>
        )}

        {activeTab === 'professors' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Aggiungi professore</h2>
              <form onSubmit={handleProfessorSubmit} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nome professore"
                  value={professorForm.name}
                  onChange={(e) => setProfessorForm({ name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
                  Aggiungi
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Nome</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {professors.map((professor) => (
                    <tr key={professor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{professor.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteProfessor(professor.id)} className="text-red-500 hover:text-red-600 text-sm">Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {professors.length === 0 && <p className="p-4 text-center text-slate-500">Nessun professore</p>}
            </div>
          </div>
        )}

        {activeTab === 'associations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Collega professore a materia</h2>
              <form onSubmit={handleAssociationSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={associationForm.subject_id}
                  onChange={(e) => setAssociationForm({ ...associationForm, subject_id: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Seleziona materia</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select
                  value={associationForm.professor_id}
                  onChange={(e) => setAssociationForm({ ...associationForm, professor_id: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Seleziona professore</option>
                  {professors.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
                  Collega
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Materia</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Professore</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {associations.map((assoc) => (
                    <tr key={assoc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{assoc.subject?.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{assoc.professor?.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteAssociation(assoc.id)} className="text-red-500 hover:text-red-600 text-sm">Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {associations.length === 0 && <p className="p-4 text-center text-slate-500">Nessuna associazione</p>}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">File</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Materia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Professore</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Dimensione</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Data</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {uploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white max-w-xs truncate">{upload.original_filename}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{upload.subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{upload.professor?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatBytes(upload.size_bytes)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{new Date(upload.created_at).toLocaleDateString('it-IT')}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteUpload(upload.id)} className="text-red-500 hover:text-red-600 text-sm">Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {uploads.length === 0 && <p className="p-4 text-center text-slate-500">Nessun file caricato</p>}
          </div>
        )}

        {activeTab === 'bridge' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Test Bridge Google Apps Script</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Clicca &quot;Test&quot; accanto a una materia per verificare la connessione al bridge GAS.
              </p>
              <div className="grid gap-3">
                {subjects.filter(s => s.gas_url).map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{subject.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md">{subject.gas_url}</p>
                    </div>
                    <button onClick={() => testBridge(subject.gas_url!)} className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">
                      Test
                    </button>
                  </div>
                ))}
                {subjects.filter(s => s.gas_url).length === 0 && (
                  <p className="text-slate-500">Nessun bridge configurato</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}