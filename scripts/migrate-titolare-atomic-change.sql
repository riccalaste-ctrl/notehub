-- Atomic Titolare change migration.
-- Adds server-side identity enforcement and mandatory assumption consent.

drop function if exists public.change_titular_owner(text, text, text, inet);

create or replace function public.change_titular_owner(
  p_display_name text,
  p_email text,
  p_actor_email text,
  p_ip inet default null,
  p_consent_accepted boolean default false
)
returns public.titular_records
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_owner public.titular_records%rowtype;
  next_owner public.titular_records%rowtype;
  actor_email_normalized text := lower(trim(p_actor_email));
  new_email_normalized text := lower(trim(p_email));
  now_at timestamptz := now();
begin
  if length(trim(p_display_name)) < 2 or length(trim(p_display_name)) > 120 then
    raise exception 'Invalid titular display name';
  end if;

  if new_email_normalized !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or length(new_email_normalized) > 254 then
    raise exception 'Invalid titular email';
  end if;

  if actor_email_normalized = '' then
    raise exception 'Missing authenticated actor email';
  end if;

  -- The developer account is the only explicit test exception.
  if actor_email_normalized <> 'riccalaste@gmail.com' and new_email_normalized <> actor_email_normalized then
    raise exception 'Titular email must match authenticated institutional account';
  end if;

  if coalesce(p_consent_accepted, false) is not true then
    raise exception 'Titular assumption consent is required';
  end if;

  select *
    into current_owner
    from public.titular_records
   where is_current = true
   for update;

  if not found then
    raise exception 'Current titular not found';
  end if;

  -- Never copy current_owner.id into history: titular_history has its own UUID.
  insert into public.titular_history (
    display_name,
    email,
    role,
    valid_from,
    is_current,
    created_at,
    valid_to,
    changed_at
  ) values (
    current_owner.display_name,
    current_owner.email,
    current_owner.role,
    current_owner.valid_from,
    false,
    current_owner.created_at,
    now_at,
    now_at
  );

  update public.titular_records
     set display_name = trim(p_display_name),
         email = new_email_normalized,
         valid_from = now_at,
         is_current = true
   where id = current_owner.id
  returning * into next_owner;

  insert into public.titular_audit_logs (
    action,
    owner_id,
    owner_email,
    actor_email,
    actor_account,
    ip,
    metadata
  ) values (
    'OWNER_CHANGED',
    next_owner.id,
    next_owner.email,
    actor_email_normalized,
    'institutional_user',
    p_ip,
    jsonb_build_object(
      'previous_owner_email', current_owner.email,
      'previous_owner_name', current_owner.display_name,
      'consent_accepted', true,
      'consent_version', 'titolare-assumption-v1'
    )
  );

  return next_owner;
end;
$$;

revoke all on function public.change_titular_owner(text, text, text, inet, boolean) from public, anon, authenticated;
grant execute on function public.change_titular_owner(text, text, text, inet, boolean) to service_role;

revoke all on table public.titular_records, public.titular_history, public.titular_audit_logs from anon, authenticated;

grant select, insert, update on public.titular_records to service_role;
grant select, insert on public.titular_history to service_role;
grant select, insert on public.titular_audit_logs to service_role;
