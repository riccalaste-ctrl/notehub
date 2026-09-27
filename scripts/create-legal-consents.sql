-- NoteHub: persistent storage for privacy/cookie consent
-- Run this once in the Supabase SQL Editor for the production database.

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_snapshot text not null,
  policy_version text not null,
  privacy_accepted boolean not null default false,
  cookie_policy_accepted boolean not null default false,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, policy_version)
);

create index if not exists idx_legal_consents_user_id
  on public.legal_consents (user_id);

create index if not exists idx_legal_consents_accepted_at
  on public.legal_consents (accepted_at desc);

alter table public.legal_consents enable row level security;

drop policy if exists legal_consents_no_public_access on public.legal_consents;
create policy legal_consents_no_public_access
on public.legal_consents
for all
to anon, authenticated
using (false)
with check (false);
