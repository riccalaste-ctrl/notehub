-- Apply manually in Supabase SQL editor before enabling the production section.
create table if not exists public.titular_records (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text not null,
  role text not null default 'Titolare',
  valid_from timestamptz not null default now(),
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists one_current_titular on public.titular_records (is_current) where is_current;
create table if not exists public.titular_history (like public.titular_records including all);
alter table public.titular_history add column if not exists valid_to timestamptz;
alter table public.titular_history add column if not exists changed_at timestamptz not null default now();
alter table public.titular_records enable row level security;
alter table public.titular_history enable row level security;
revoke all on table public.titular_records, public.titular_history from anon, authenticated;
create table if not exists public.titular_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  owner_id uuid not null,
  owner_email text not null,
  actor_email text not null,
  actor_account text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  created_at timestamptz not null default now()
);
alter table public.titular_audit_logs enable row level security;
create policy "admins can read titular audit" on public.titular_audit_logs for select using (auth.jwt() ->> 'role' = 'admin');
create or replace function public.prevent_titular_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'titular audit logs are append-only'; end; $$;
drop trigger if exists titular_audit_immutable on public.titular_audit_logs;
create trigger titular_audit_immutable before update or delete on public.titular_audit_logs
for each row execute function public.prevent_titular_audit_mutation();
