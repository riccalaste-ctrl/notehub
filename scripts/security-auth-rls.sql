-- ============================================
-- NoteHub Security Upgrade (Auth + RLS + Audit)
-- ============================================

-- 1) Settings table for dynamic support email/disclaimer
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value, description)
values
  ('support_email', 'support@liceoscacchibari.it', 'Email usata per segnalazioni e disclaimer'),
  ('admin_email', 'admin@notehub.local', 'Compatibilita legacy'),
  ('allowed_external_emails', 'riccalaste@gmail.com', 'Whitelist email esterne temporanee separate da virgola'),
  ('site_policy', 'Gli amministratori non sono responsabili dei file caricati ma si impegnano a rimuovere contenuti vietati segnalati alla mail support@liceoscacchibari.it.', 'Policy/disclaimer sito')
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
on public.site_settings
for select
to anon, authenticated
using (key in ('support_email', 'admin_email', 'site_policy', 'allowed_external_emails'));

-- 2) Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs (action);

alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_no_public_access on public.audit_logs;
create policy audit_logs_no_public_access
on public.audit_logs
for select
to authenticated
using (false);

-- 3) Ownership columns
alter table public.uploads
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public.drive_upload_sessions
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists idx_uploads_owner_id on public.uploads (owner_id);
create index if not exists idx_drive_upload_sessions_owner_id on public.drive_upload_sessions (owner_id);

-- 4) RLS on uploads
alter table public.uploads enable row level security;

drop policy if exists uploads_read_authenticated on public.uploads;
create policy uploads_read_authenticated
on public.uploads
for select
to authenticated
using (true);

drop policy if exists uploads_insert_owner on public.uploads;
create policy uploads_insert_owner
on public.uploads
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists uploads_update_owner_only on public.uploads;
create policy uploads_update_owner_only
on public.uploads
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists uploads_delete_owner_only on public.uploads;
create policy uploads_delete_owner_only
on public.uploads
for delete
to authenticated
using (owner_id = auth.uid());

-- 5) RLS on upload sessions
alter table public.drive_upload_sessions enable row level security;

drop policy if exists drive_upload_sessions_owner_read on public.drive_upload_sessions;
create policy drive_upload_sessions_owner_read
on public.drive_upload_sessions
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists drive_upload_sessions_owner_insert on public.drive_upload_sessions;
create policy drive_upload_sessions_owner_insert
on public.drive_upload_sessions
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists drive_upload_sessions_owner_update on public.drive_upload_sessions;
create policy drive_upload_sessions_owner_update
on public.drive_upload_sessions
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
