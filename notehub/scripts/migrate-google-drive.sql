-- Migrazione per integrazione Google Drive OAuth
-- Data: 2026-04-30

-- 1. Aggiungere colonne per credenziali Google Drive alla tabella subjects
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS google_client_id TEXT,
  ADD COLUMN IF NOT EXISTS google_client_secret TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_refresh_token TEXT;

-- 2. Popolare con i valori attuali per le materie esistenti (da configurare poi dall'admin)
-- (Lasciare NULL inizialmente, l'admin dovrà configurarle)

-- 3. Rimuovere le vecchie colonne GAS (dopo aver verificato il funzionamento)
-- NOTA: non rimuovere subito, commentare dopo la migrazione completa
-- ALTER TABLE subjects DROP COLUMN IF EXISTS gas_url;
-- ALTER TABLE subjects DROP COLUMN IF EXISTS gas_secret;

-- 4. Verificare che la tabella uploads abbia tutti i campi necessari
-- (già presenti: drive_file_id, download_url, view_url, mime_type, size_bytes)

-- 5. Indice per migliorare le query su subjects abilitati
CREATE INDEX IF NOT EXISTS idx_subjects_enabled ON subjects(enabled);

-- Query di verifica:
-- SELECT id, name, slug, google_client_id, google_drive_folder_id, enabled FROM subjects;
