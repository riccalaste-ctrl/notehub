-- Create consigli table
CREATE TABLE IF NOT EXISTS consigli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE consigli ENABLE ROW LEVEL SECURITY;

-- Public can read published consigli
CREATE POLICY "consigli_public_read" ON consigli
  FOR SELECT
  USING (published = true);

-- Service role can do everything (handled by supabase-admin client)

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_consigli_published ON consigli(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consigli_professor ON consigli(professor_id);
