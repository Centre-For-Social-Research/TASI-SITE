-- Keep this migration in sync with the admin audit events section in schema.sql.
-- Append-only record of admin actions that leave no other trace: deleting a
-- registration (which cascades away its status history), removing an admin or
-- reviewer email, and exporting personal data. Rows can be added and read but
-- never changed or removed, including by the service role.
create table if not exists public.admin_audit_events (
  id bigint generated always as identity primary key,
  action text not null,
  actor_email text,
  actor_user_id text,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_events_created
  on public.admin_audit_events (created_at desc, id desc);

alter table public.admin_audit_events enable row level security;

revoke all on public.admin_audit_events from anon, authenticated, service_role;
grant select, insert on public.admin_audit_events to service_role;
grant usage, select on all sequences in schema public to service_role;

create or replace function public.prevent_admin_audit_event_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'admin_audit_events is append-only';
end;
$$;

drop trigger if exists admin_audit_events_append_only
  on public.admin_audit_events;
create trigger admin_audit_events_append_only
  before update or delete on public.admin_audit_events
  for each row execute function public.prevent_admin_audit_event_change();

drop trigger if exists admin_audit_events_no_truncate
  on public.admin_audit_events;
create trigger admin_audit_events_no_truncate
  before truncate on public.admin_audit_events
  for each statement execute function public.prevent_admin_audit_event_change();

-- Carry existing grants over so the audit feed can read every grant from here.
insert into public.admin_audit_events
  (action, actor_email, target_type, target_id, details, created_at)
select
  'operator_email.granted',
  overrides.added_by,
  'operator_email',
  overrides.email,
  jsonb_build_object('role', overrides.role, 'backfilled', true),
  overrides.created_at
from public.admin_email_overrides overrides
where not exists (
  select 1
  from public.admin_audit_events existing
  where existing.action = 'operator_email.granted'
    and existing.target_id = overrides.email
);

notify pgrst, 'reload schema';
