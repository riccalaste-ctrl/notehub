-- Migrazione per aggiungere credenziali Google Drive alla tabella professors
-- Data: 2026-04-30

-- 1. Aggiungere colonne per credenziali Google Drive alla tabella professors
ALTER TABLE professors
  ADD COLUMN IF NOT EXISTS google_client_id TEXT,
  ADD COLUMN IF NOT EXISTS google_client_secret TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_refresh_token TEXT;

-- 2. Rimuovere le colonne dalla tabella subjects (ora stanno su professors)
-- Le lasciamo per ora per compatibilità, decommenta dopo aver verificato
-- ALTER TABLE subjects DROP COLUMN IF EXISTS google_client_id;
-- ALTER TABLE subjects DROP COLUMN IF EXISTS google_client_secret;
-- ALTER TABLE subjects DROP COLUMN IF EXISTS google_drive_folder_id;
-- ALTER TABLE subjects DROP COLUMN IF EXISTS google_drive_refresh_token;

-- Query di verifica:
-- SELECT id, name, google_client_id, google_drive_folder_id FROM professors;
