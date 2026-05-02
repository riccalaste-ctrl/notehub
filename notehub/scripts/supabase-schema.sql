-- NoteHub Database Schema for Supabase

-- Abilitare estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella materie
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  gas_url TEXT,
  gas_secret TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella professori
CREATE TABLE professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella associazioni materia-professore
CREATE TABLE subject_professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  UNIQUE(subject_id, professor_id)
);

-- Tabella upload/file
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professors(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  drive_file_id TEXT NOT NULL,
  download_url TEXT,
  view_url TEXT,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per migliorare le performance
CREATE INDEX idx_uploads_subject ON uploads(subject_id);
CREATE INDEX idx_uploads_professor ON uploads(professor_id);
CREATE INDEX idx_uploads_created ON uploads(created_at DESC);
CREATE INDEX idx_subject_professors_subject ON subject_professors(subject_id);
CREATE INDEX idx_subject_professors_professor ON subject_professors(professor_id);

-- Query di esempio per verifica
-- SELECT * FROM subjects WHERE enabled = true ORDER BY name;
-- SELECT * FROM professors ORDER BY name;
-- SELECT u.*, s.name as subject_name, p.name as professor_name 
-- FROM uploads u 
-- LEFT JOIN subjects s ON u.subject_id = s.id 
-- LEFT JOIN professors p ON u.professor_id = p.id 
-- ORDER BY u.created_at DESC LIMIT 20;