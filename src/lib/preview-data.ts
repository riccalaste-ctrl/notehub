export const isPreviewMode =
  process.env.PREVIEW_BYPASS_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production' &&
  process.env.VERCEL !== '1';

/** Preview is deliberately a local-only fixture mode. Never use it in a deployed build. */
export const PREVIEW_NOTICE =
  'Modalità preview locale: dati dimostrativi, nessun collegamento a Supabase o Google Drive.';

export const previewSubjects = [
  { id: 'subject-matematica', name: 'Matematica', slug: 'matematica', enabled: true },
  { id: 'subject-fisica', name: 'Fisica', slug: 'fisica', enabled: true },
  { id: 'subject-informatica', name: 'Informatica', slug: 'informatica', enabled: true },
  { id: 'subject-italiano', name: 'Italiano', slug: 'italiano', enabled: true },
];

export const previewProfessors = [
  { id: 'prof-rossi', name: 'Prof. Rossi' },
  { id: 'prof-bianchi', name: 'Prof.ssa Bianchi' },
  { id: 'prof-verdi', name: 'Prof. Verdi' },
];

export const previewSubjectProfessors = [
  { id: 'association-1', subject_id: 'subject-matematica', professor_id: 'prof-rossi', professor: previewProfessors[0] },
  { id: 'association-2', subject_id: 'subject-fisica', professor_id: 'prof-bianchi', professor: previewProfessors[1] },
  { id: 'association-3', subject_id: 'subject-informatica', professor_id: 'prof-verdi', professor: previewProfessors[2] },
  { id: 'association-4', subject_id: 'subject-italiano', professor_id: 'prof-bianchi', professor: previewProfessors[1] },
];

const previewCreatedAt = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const previewUploads = [
  {
    id: 'upload-1',
    original_filename: 'Derivate e integrali - formulario.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1843200,
    created_at: previewCreatedAt(1),
    subject_id: 'subject-matematica',
    professor_id: 'prof-rossi',
    subject: { name: 'Matematica', slug: 'matematica' },
    professor: { name: 'Prof. Rossi' },
    subject_name: 'Matematica',
    subject_slug: 'matematica',
    professor_name: 'Prof. Rossi',
  },
  {
    id: 'upload-2',
    original_filename: 'Onde e oscillazioni - appunti.pdf',
    mime_type: 'application/pdf',
    size_bytes: 2465792,
    created_at: previewCreatedAt(3),
    subject_id: 'subject-fisica',
    professor_id: 'prof-bianchi',
    subject: { name: 'Fisica', slug: 'fisica' },
    professor: { name: 'Prof.ssa Bianchi' },
    subject_name: 'Fisica',
    subject_slug: 'fisica',
    professor_name: 'Prof.ssa Bianchi',
  },
  {
    id: 'upload-3',
    original_filename: 'Introduzione a Python.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 983040,
    created_at: previewCreatedAt(5),
    subject_id: 'subject-informatica',
    professor_id: 'prof-verdi',
    subject: { name: 'Informatica', slug: 'informatica' },
    professor: { name: 'Prof. Verdi' },
    subject_name: 'Informatica',
    subject_slug: 'informatica',
    professor_name: 'Prof. Verdi',
  },
  {
    id: 'upload-4',
    original_filename: 'Analisi del testo - guida rapida.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1310720,
    created_at: previewCreatedAt(8),
    subject_id: 'subject-italiano',
    professor_id: 'prof-bianchi',
    subject: { name: 'Italiano', slug: 'italiano' },
    professor: { name: 'Prof.ssa Bianchi' },
    subject_name: 'Italiano',
    subject_slug: 'italiano',
    professor_name: 'Prof.ssa Bianchi',
  },
];

export const previewSettings: Record<string, string> = {
  admin_email: 'admin@notehub.local',
  support_email: 'support@notehub.local',
  consigli_email: 'consigli@notehub.local',
  site_policy: 'NoteHub è un progetto indipendente creato per condividere materiale scolastico.',
  legal_project_name: 'NoteHub',
  legal_controller_name: '',
  legal_controller_email: '',
  legal_controller_address: '',
  legal_dpo_email: '',
  legal_hosting_provider: 'Hosting da configurare',
  legal_data_retention: 'Da definire dal gestore',
  legal_minimum_age: '14',
  legal_policy_updated_at: '2026-09-24',
};

export const previewConsigliFiles = [
  {
    id: 'consigli-file-1',
    consiglio_id: 'consiglio-1',
    original_filename: 'Metodo di studio efficace.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1572864,
    download_url: '#',
    view_url: '#',
    created_at: previewCreatedAt(2),
  },
];
