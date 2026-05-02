/**
 * Costanti globali dell'applicazione
 */

export const APP_CONFIG = {
  NAME: 'NoteHub',
  VERSION: '2.0.0',
  DESCRIPTION: 'Piattaforma per condividere appunti scolastici',
  AUTHOR: 'NoteHub Team',
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 secondi
};

export const FILE_CONFIG = {
  MAX_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50'),
  MAX_SIZE_BYTES: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024),
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
  ],
  STORAGE_BUCKET: 'uploads',
};

export const AUTH_CONFIG = {
  COOKIE_NAME: 'admin_session',
  SESSION_TTL_MS: 1000 * 60 * 60 * 24, // 24 ore
  JWT_ALGORITHM: 'HS256',
};

export const SUBJECTS_DEFAULT = [
  { id: 'italiano', name: 'Italiano', color: '#ef4444', order: 0 },
  { id: 'matematica', name: 'Matematica', color: '#2563eb', order: 1 },
  { id: 'storia', name: 'Storia', color: '#f59e0b', order: 2 },
  { id: 'inglese', name: 'Inglese', color: '#14b8a6', order: 3 },
  { id: 'scienze', name: 'Scienze', color: '#22c55e', order: 4 },
  { id: 'fisica', name: 'Fisica', color: '#8b5cf6', order: 5 },
  { id: 'latino', name: 'Latino', color: '#ec4899', order: 6 },
];

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

export const ERRORS = {
  UNAUTHORIZED: 'Non autorizzato',
  FORBIDDEN: 'Accesso negato',
  NOT_FOUND: 'Risorsa non trovata',
  BAD_REQUEST: 'Richiesta non valida',
  SERVER_ERROR: 'Errore del server',
  INVALID_FILE: 'File non valido',
  FILE_TOO_LARGE: 'File troppo grande',
  UPLOAD_FAILED: 'Upload fallito',
};
