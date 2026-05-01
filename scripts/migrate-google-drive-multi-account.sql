-- SKAKK-UP Google Drive multi-account OAuth migration
-- Run in Supabase SQL Editor before enabling the new Drive flow.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS professor_drive_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL,
  google_account_id TEXT,
  encrypted_refresh_token TEXT,
  encrypted_access_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  root_folder_id TEXT,
  status TEXT NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'error')),
  last_error TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professor_id)
);

CREATE TABLE IF NOT EXISTS professor_drive_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES professor_drive_connections(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, subject_id)
);

CREATE TABLE IF NOT EXISTS drive_upload_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  drive_connection_id UUID NOT NULL REFERENCES professor_drive_connections(id) ON DELETE CASCADE,
  drive_folder_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploader_name TEXT,
  upload_uri_encrypted TEXT NOT NULL,
  drive_file_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uploads
  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_connection_id UUID REFERENCES professor_drive_connections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_professor_drive_connections_professor
  ON professor_drive_connections(professor_id);

CREATE INDEX IF NOT EXISTS idx_professor_drive_connections_status
  ON professor_drive_connections(status);

CREATE INDEX IF NOT EXISTS idx_professor_drive_folders_professor_subject
  ON professor_drive_folders(professor_id, subject_id);

CREATE INDEX IF NOT EXISTS idx_drive_upload_sessions_status_expires
  ON drive_upload_sessions(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_uploads_drive_connection
  ON uploads(drive_connection_id);

DROP TRIGGER IF EXISTS trg_professor_drive_connections_updated_at ON professor_drive_connections;
CREATE TRIGGER trg_professor_drive_connections_updated_at
  BEFORE UPDATE ON professor_drive_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_professor_drive_folders_updated_at ON professor_drive_folders;
CREATE TRIGGER trg_professor_drive_folders_updated_at
  BEFORE UPDATE ON professor_drive_folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_drive_upload_sessions_updated_at ON drive_upload_sessions;
CREATE TRIGGER trg_drive_upload_sessions_updated_at
  BEFORE UPDATE ON drive_upload_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE professor_drive_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_drive_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_upload_sessions ENABLE ROW LEVEL SECURITY;

-- No RLS policies are created intentionally: these tables must be reachable
-- only through server-side Supabase service role calls.
