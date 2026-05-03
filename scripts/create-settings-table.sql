-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public read access for certain keys
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read admin_email and site_policy
CREATE POLICY "Public can read contact settings" ON app_settings
  FOR SELECT USING (key IN ('admin_email', 'site_policy'));

-- Only authenticated (admin) can update
CREATE POLICY "Only admin can update settings" ON app_settings
  FOR UPDATE USING (true);

-- Only admin can insert
CREATE POLICY "Only admin can insert settings" ON app_settings
  FOR INSERT WITH CHECK (true);

-- Insert default admin email setting
INSERT INTO app_settings (key, value, description)
VALUES ('admin_email', 'admin@notehub.local', 'Email di contatto per gli admin')
ON CONFLICT (key) DO NOTHING;

-- Insert policy text setting
INSERT INTO app_settings (key, value, description)
VALUES ('site_policy', 'Gli utenti sono i soli responsabili dei contenuti caricati. Gli amministratori del sito non si assumono responsabilità per i materiali caricati dagli utenti. Gli admin si riservano il diritto di rimuovere qualsiasi contenuto illecito, offensivo o inappropriato. Per problemi o segnalazioni, contattare gli admin all''indirizzo email indicato nel sito.', 'Policy del sito - responsabilità contenuti')
ON CONFLICT (key) DO NOTHING;
