-- NoteHub security/redesign migration.
-- Apply this script in Supabase SQL editor before enabling the new moderation
-- and consent enforcement in production.

create table if not exists public.bans (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'banned' check (status in ('banned', 'suspended', 'active')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create unique index if not exists idx_bans_email on public.bans (lower(email));
create index if not exists idx_bans_status on public.bans (status);
create index if not exists idx_bans_expires_at on public.bans (expires_at);
alter table public.bans enable row level security;
drop policy if exists bans_no_public_access on public.bans;
create policy bans_no_public_access on public.bans for all to anon, authenticated using (false) with check (false);

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_snapshot text not null,
  policy_version text not null,
  privacy_accepted boolean not null default false,
  cookie_policy_accepted boolean not null default false,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, policy_version)
);

create index if not exists idx_legal_consents_user_id on public.legal_consents(user_id);
alter table public.legal_consents enable row level security;
drop policy if exists legal_consents_no_public_access on public.legal_consents;
create policy legal_consents_no_public_access on public.legal_consents for all to anon, authenticated using (false) with check (false);

insert into public.site_settings (key, value, description)
values
  ('privacy_policy_version', 'privacy-v1', 'Versione privacy mostrata agli utenti'),
  ('cookie_consent_version', 'cookie-v1', 'Versione cookie/consenso tecnico'),
  ('terms_version', 'terms-v1', 'Versione regole del servizio')
on conflict (key) do nothing;

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);


-- Document reporting
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null,
  reporter_email text not null,
  reason text not null,
  file_name text not null,
  uploader_name text,
  file_view_url text,
  file_download_url text,
  status text not null default 'pending' check (status in ('pending','dismissed','resolved_removed')),
  email_sent_at timestamptz,
  email_error text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_status_created_at on public.reports(status, created_at desc);
create index if not exists idx_reports_upload_id on public.reports(upload_id);
alter table public.reports enable row level security;
drop policy if exists reports_no_public_access on public.reports;
create policy reports_no_public_access on public.reports for all to anon, authenticated using (false) with check (false);

insert into public.site_settings (key,value,description) values
('reports_email','','Indirizzo destinatario delle segnalazioni documento'),
('privacy_policy_version','privacy-v1','Versione della Privacy Policy'),
('cookie_consent_version','cookie-v1','Versione della Cookie Policy'),
('terms_version','terms-v1','Versione delle regole del servizio')
on conflict (key) do nothing;
