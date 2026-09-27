-- Atomic Titolare change migration.
-- Apply this script once in the Supabase SQL editor.
-- It fixes the previous history error caused by copying titular_records.id
-- into titular_history, and makes history + current owner + audit one transaction.

create or replace function public.change_titular_owner(
  p_display_name text,
  p_email text,
  p_actor_email text,
  p_ip inet default null
)
returns public.titular_records
language plpgsql
security definer
set search_path = public
as $$
declare
  current_owner public.titular_records%rowtype;
  next_owner public.titular_records%rowtype;
  now_at timestamptz := now();
begin
  if length(trim(p_display_name)) < 2 or length(trim(p_display_name)) > 120 then
    raise exception 'Invalid titular display name';
  end if;

  if trim(p_email) !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or length(trim(p_email)) > 254 then
    raise exception 'Invalid titular email';
  end if;

  if trim(p_actor_email) = '' then
    raise exception 'Missing authenticated actor email';
  end if;

  select *
    into current_owner
    from public.titular_records
   where is_current = true
   for update;

  if not found then
    raise exception 'Current titular not found';
  end if;

  -- IMPORTANT: never copy current_owner.id into history.
  -- titular_history has its own generated UUID primary key.
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
         email = lower(trim(p_email)),
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
    lower(trim(p_actor_email)),
    'institutional_user',
    p_ip,
    jsonb_build_object(
      'previous_owner_email', current_owner.email,
      'previous_owner_name', current_owner.display_name
    )
  );

  return next_owner;
end;
$$;

revoke all on function public.change_titular_owner(text, text, text, inet) from public, anon, authenticated;
grant execute on function public.change_titular_owner(text, text, text, inet) to service_role;

-- Keep the service-role application path private.
revoke all on table public.titular_records, public.titular_history, public.titular_audit_logs from anon, authenticated;

-- Ensure the application can continue to read/write through the server-only service role.
grant select, insert, update on public.titular_records to service_role;
grant select, insert on public.titular_history to service_role;
grant select, insert on public.titular_audit_logs to service_role;
