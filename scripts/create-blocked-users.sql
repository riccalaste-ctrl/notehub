-- NoteHub: lista server-side degli indirizzi email bloccati.
-- Eseguire una volta nel Supabase SQL Editor.
create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists blocked_users_email_idx on public.blocked_users (lower(email));

alter table public.blocked_users enable row level security;

-- Nessun accesso diretto dal browser: le API Admin usano la service role key.
drop policy if exists "blocked_users_no_client_access" on public.blocked_users;
create policy "blocked_users_no_client_access"
  on public.blocked_users
  for all
  to anon, authenticated
  using (false)
  with check (false);
