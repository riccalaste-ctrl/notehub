-- Fix RLS policies for public read access
-- Run in Supabase SQL Editor

-- Subjects: allow public read of enabled subjects
DROP POLICY IF EXISTS subjects_public_read ON subjects;
CREATE POLICY subjects_public_read ON subjects
  FOR SELECT
  USING (enabled = true);

-- Professors: allow public read (no sensitive data)
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS professors_public_read ON professors;
CREATE POLICY professors_public_read ON professors
  FOR SELECT
  USING (true);

-- Subject_professors: allow public read
ALTER TABLE subject_professors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subject_professors_public_read ON subject_professors;
CREATE POLICY subject_professors_public_read ON subject_professors
  FOR SELECT
  USING (true);

-- Consigli: allow public read of published
ALTER TABLE consigli ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS consigli_public_read ON consigli;
CREATE POLICY consigli_public_read ON consigli
  FOR SELECT
  USING (published = true);
