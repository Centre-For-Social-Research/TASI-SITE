create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  status text not null default 'active',
  source text,
  subscribed_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  email text not null,
  message text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.registration_confirmation_requests (
  id bigint generated always as identity primary key,
  email text not null,
  source text,
  requested_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_code text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  organization text not null,
  designation text not null,
  attendee_category text not null,
  city text not null,
  country text not null,
  linkedin_url text not null,
  attendance_reason text,
  priority_tier text not null,
  source text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'waitlisted', 'rejected')),
  speaker_flag boolean not null default false,
  vip_flag boolean not null default false,
  exception_badge_required boolean not null default false,
  badge_color_label text not null,
  badge_color_hex text not null,
  profile_photo_path text,
  profile_photo_size_bytes integer,
  profile_photo_width integer,
  profile_photo_height integer,
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by_clerk_id text,
  reviewed_by_email text,
  qr_pass_issued_at timestamptz,
  checked_in_at timestamptz,
  last_badge_export_batch_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_registrations_status on public.event_registrations(status);
create index if not exists idx_event_registrations_category on public.event_registrations(attendee_category);
create index if not exists idx_event_registrations_priority on public.event_registrations(priority_tier);
create index if not exists idx_event_registrations_created_at on public.event_registrations(created_at desc);
create index if not exists idx_event_registrations_status_created on public.event_registrations(status, created_at desc);
create index if not exists idx_event_registrations_qr_issued on public.event_registrations(qr_pass_issued_at desc);
create index if not exists idx_event_registrations_checked_in on public.event_registrations(checked_in_at desc);
create index if not exists idx_event_registrations_country on public.event_registrations(country);
create index if not exists idx_event_registrations_city on public.event_registrations(city);
create index if not exists idx_event_registrations_organization on public.event_registrations(organization);
create index if not exists idx_event_registrations_first_name_trgm on public.event_registrations using gin (first_name gin_trgm_ops);
create index if not exists idx_event_registrations_last_name_trgm on public.event_registrations using gin (last_name gin_trgm_ops);
create index if not exists idx_event_registrations_email_trgm on public.event_registrations using gin (email gin_trgm_ops);
create index if not exists idx_event_registrations_registration_code_trgm on public.event_registrations using gin (registration_code gin_trgm_ops);
create index if not exists idx_event_registrations_organization_trgm on public.event_registrations using gin (organization gin_trgm_ops);

create or replace function public.get_registration_queue_summary(
  p_search text default '',
  p_status text default 'all',
  p_category text default 'all',
  p_priority_tier text default 'all',
  p_country text default '',
  p_city text default '',
  p_organization text default '',
  p_speaker_flag text default '',
  p_late_confirmation text default ''
)
returns table (
  total bigint,
  pending bigint,
  confirmed bigint,
  waitlisted bigint,
  rejected bigint,
  qr_issued bigint,
  checked_in bigint,
  exception_badges bigint
)
language sql
security invoker
set search_path = public
as $$
  with filtered as (
    select *
    from public.event_registrations
    where (coalesce(nullif(trim(p_status), ''), 'all') = 'all' or status = trim(p_status))
      and (coalesce(nullif(trim(p_category), ''), 'all') = 'all' or attendee_category = trim(p_category))
      and (coalesce(nullif(trim(p_priority_tier), ''), 'all') = 'all' or priority_tier = trim(p_priority_tier))
      and (coalesce(trim(p_country), '') = '' or country ilike '%' || trim(p_country) || '%')
      and (coalesce(trim(p_city), '') = '' or city ilike '%' || trim(p_city) || '%')
      and (coalesce(trim(p_organization), '') = '' or organization ilike '%' || trim(p_organization) || '%')
      and (trim(p_speaker_flag) <> 'yes' or speaker_flag is true)
      and (trim(p_late_confirmation) <> 'yes' or exception_badge_required is true)
      and (
        coalesce(trim(p_search), '') = ''
        or first_name ilike '%' || trim(p_search) || '%'
        or last_name ilike '%' || trim(p_search) || '%'
        or email ilike '%' || trim(p_search) || '%'
        or registration_code ilike '%' || trim(p_search) || '%'
        or organization ilike '%' || trim(p_search) || '%'
      )
  )
  select
    count(*)::bigint as total,
    count(*) filter (where status = 'pending')::bigint as pending,
    count(*) filter (where status = 'confirmed')::bigint as confirmed,
    count(*) filter (where status = 'waitlisted')::bigint as waitlisted,
    count(*) filter (where status = 'rejected')::bigint as rejected,
    count(*) filter (where qr_pass_issued_at is not null)::bigint as qr_issued,
    count(*) filter (where checked_in_at is not null)::bigint as checked_in,
    count(*) filter (where exception_badge_required is true)::bigint as exception_badges
  from filtered;
$$;

revoke all on function public.get_registration_queue_summary(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.get_registration_queue_summary(text, text, text, text, text, text, text, text, text) to service_role;

create table if not exists public.registration_assets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  asset_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_registration_assets_registration on public.registration_assets(registration_id);

create table if not exists public.registration_status_history (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  previous_status text,
  next_status text,
  action_type text not null,
  notes text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_registration_status_history_registration on public.registration_status_history(registration_id, created_at desc);

create table if not exists public.registration_notifications (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  template_type text not null,
  delivery_channel text not null default 'email' check (delivery_channel in ('email', 'whatsapp')),
  recipient_email text,
  recipient_phone text,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'resent', 'skipped')),
  provider_message_id text,
  provider_payload jsonb,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_registration_notifications_registration on public.registration_notifications(registration_id, created_at desc);
create index if not exists idx_registration_notifications_provider_message on public.registration_notifications(provider_message_id);
create index if not exists idx_registration_notifications_status on public.registration_notifications(delivery_status, created_at desc);
create index if not exists idx_registration_notifications_channel on public.registration_notifications(delivery_channel, delivery_status, created_at desc);

alter table public.registration_notifications
  add column if not exists delivery_channel text not null default 'email',
  add column if not exists recipient_phone text;

alter table public.registration_notifications
  alter column recipient_email drop not null;

do $$
begin
  alter table public.registration_notifications
    drop constraint if exists registration_notifications_delivery_channel_check;
  alter table public.registration_notifications
    add constraint registration_notifications_delivery_channel_check
    check (delivery_channel in ('email', 'whatsapp'));

  alter table public.registration_notifications
    drop constraint if exists registration_notifications_delivery_status_check;
  alter table public.registration_notifications
    add constraint registration_notifications_delivery_status_check
    check (delivery_status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'resent', 'skipped'));
end $$;

create table if not exists public.entry_passes (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.event_registrations(id) on delete cascade,
  token text not null unique,
  status text not null default 'issued' check (status in ('issued', 'revoked')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  issued_by_clerk_id text,
  issued_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entry_passes_token on public.entry_passes(token);
create index if not exists idx_entry_passes_registration_status on public.entry_passes(registration_id, status);

create table if not exists public.registration_daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  event_day smallint not null check (event_day in (1, 2)),
  checked_in_at timestamptz not null default now(),
  entry_pass_id uuid references public.entry_passes(id) on delete set null,
  token text,
  desk_label text,
  notes text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, event_day)
);

create index if not exists idx_registration_daily_check_ins_registration
on public.registration_daily_check_ins(registration_id, event_day);

create index if not exists idx_registration_daily_check_ins_day_checked
on public.registration_daily_check_ins(event_day, checked_in_at desc);

insert into public.registration_daily_check_ins (
  registration_id,
  event_day,
  checked_in_at,
  entry_pass_id,
  desk_label,
  notes,
  created_at,
  updated_at
)
select
  registration.id,
  1,
  registration.checked_in_at,
  pass.id,
  null,
  'Imported from legacy checked_in_at value.',
  registration.checked_in_at,
  registration.checked_in_at
from public.event_registrations registration
left join lateral (
  select id
  from public.entry_passes
  where registration_id = registration.id
  order by issued_at desc
  limit 1
) pass on true
where registration.checked_in_at is not null
on conflict (registration_id, event_day) do nothing;

create table if not exists public.entry_scans (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  entry_pass_id uuid references public.entry_passes(id) on delete set null,
  token text,
  event_day smallint not null default 1 check (event_day in (1, 2)),
  scan_result text not null,
  desk_label text,
  notes text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

alter table public.entry_scans
  add column if not exists event_day smallint not null default 1;

do $$
begin
  alter table public.entry_scans
    drop constraint if exists entry_scans_event_day_check;
  alter table public.entry_scans
    add constraint entry_scans_event_day_check
    check (event_day in (1, 2));
end $$;

create index if not exists idx_entry_scans_registration on public.entry_scans(registration_id, created_at desc);
create index if not exists idx_entry_scans_created_at on public.entry_scans(created_at desc);
create index if not exists idx_entry_scans_event_day_created on public.entry_scans(event_day, created_at desc);

create table if not exists public.pass_issue_email_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  selection_mode text not null default 'filtered' check (selection_mode in ('filtered', 'selected')),
  filters jsonb not null default '{}'::jsonb,
  resend_existing boolean not null default false,
  total_items integer not null default 0,
  queued_items integer not null default 0,
  processing_items integer not null default 0,
  sent_items integer not null default 0,
  skipped_items integer not null default 0,
  failed_items integer not null default 0,
  retrying_items integer not null default 0,
  created_by_clerk_id text,
  created_by_email text,
  completed_at timestamptz,
  last_processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pass_issue_email_jobs_status on public.pass_issue_email_jobs(status, created_at desc);

create table if not exists public.pass_issue_email_job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pass_issue_email_jobs(id) on delete cascade,
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'skipped', 'failed', 'retrying')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  failure_reason text,
  notification_id uuid references public.registration_notifications(id) on delete set null,
  pass_id uuid references public.entry_passes(id) on delete set null,
  token text,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, registration_id)
);

create index if not exists idx_pass_issue_email_job_items_job on public.pass_issue_email_job_items(job_id, status, created_at asc);
create index if not exists idx_pass_issue_email_job_items_registration on public.pass_issue_email_job_items(registration_id, created_at desc);
create index if not exists idx_pass_issue_email_job_items_status on public.pass_issue_email_job_items(status, updated_at desc);

create table if not exists public.registration_email_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  template_type text not null,
  total_items integer not null default 0,
  queued_items integer not null default 0,
  processing_items integer not null default 0,
  sent_items integer not null default 0,
  failed_items integer not null default 0,
  retrying_items integer not null default 0,
  created_by_clerk_id text,
  created_by_email text,
  completed_at timestamptz,
  last_processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_registration_email_jobs_status on public.registration_email_jobs(status, created_at desc);

create table if not exists public.registration_email_job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.registration_email_jobs(id) on delete cascade,
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  notification_id uuid references public.registration_notifications(id) on delete set null,
  template_type text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed', 'retrying')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  failure_reason text,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, registration_id, template_type)
);

create index if not exists idx_registration_email_job_items_job on public.registration_email_job_items(job_id, status, created_at asc);
create index if not exists idx_registration_email_job_items_registration on public.registration_email_job_items(registration_id, created_at desc);
create index if not exists idx_registration_email_job_items_status on public.registration_email_job_items(status, updated_at desc);

-- Keep job counters consistent when automatic, manual, and scheduled workers overlap.
create or replace function public.refresh_registration_email_job(p_job_id uuid)
returns setof public.registration_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_job public.registration_email_jobs%rowtype;
  v_total integer;
  v_queued integer;
  v_processing integer;
  v_sent integer;
  v_failed integer;
  v_retrying integer;
  v_status text;
begin
  select * into v_job
  from public.registration_email_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'Registration email job % not found', p_job_id
      using errcode = 'P0002';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status = 'queued')::integer,
    count(*) filter (where status = 'processing')::integer,
    count(*) filter (where status = 'sent')::integer,
    count(*) filter (where status = 'failed')::integer,
    count(*) filter (where status = 'retrying')::integer
  into v_total, v_queued, v_processing, v_sent, v_failed, v_retrying
  from public.registration_email_job_items
  where job_id = p_job_id;

  v_status := case
    when v_processing > 0 or v_retrying > 0 then 'processing'
    when v_queued > 0 then 'queued'
    when v_failed > 0 then 'failed'
    else 'completed'
  end;

  update public.registration_email_jobs
  set total_items = v_total,
      queued_items = v_queued,
      processing_items = v_processing,
      sent_items = v_sent,
      failed_items = v_failed,
      retrying_items = v_retrying,
      status = v_status,
      completed_at = case when v_status in ('failed', 'completed') then clock_timestamp() else null end,
      last_processed_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_job_id
  returning * into v_job;

  return next v_job;
  return;
end;
$$;

revoke all on function public.refresh_registration_email_job(uuid) from public, anon, authenticated;
grant execute on function public.refresh_registration_email_job(uuid) to service_role;

-- Select real queued items so a failed counter refresh cannot hide a new job.
create or replace function public.get_next_registration_email_job(p_created_after timestamptz)
returns setof public.registration_email_jobs
language sql
stable
security invoker
set search_path = ''
as $$
  select job.*
  from public.registration_email_jobs as job
  where job.created_at >= p_created_after
    and exists (
      select 1
      from public.registration_email_job_items as item
      where item.job_id = job.id
        and item.status in ('queued', 'retrying')
    )
  order by job.created_at asc
  limit 1;
$$;

revoke all on function public.get_next_registration_email_job(timestamptz) from public, anon, authenticated;
grant execute on function public.get_next_registration_email_job(timestamptz) to service_role;

create table if not exists public.badge_exports (
  id uuid primary key default gen_random_uuid(),
  export_format text not null check (export_format in ('csv', 'xlsx', 'pdf')),
  total_registrations integer not null default 0,
  frozen_at timestamptz not null,
  created_by_clerk_id text,
  created_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.review_notes (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  note text not null,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.registration_confirmation_requests enable row level security;
alter table public.event_registrations enable row level security;
alter table public.registration_assets enable row level security;
alter table public.registration_status_history enable row level security;
alter table public.registration_notifications enable row level security;
alter table public.entry_passes enable row level security;
alter table public.registration_daily_check_ins enable row level security;
alter table public.entry_scans enable row level security;
alter table public.pass_issue_email_jobs enable row level security;
alter table public.pass_issue_email_job_items enable row level security;
alter table public.registration_email_jobs enable row level security;
alter table public.registration_email_job_items enable row level security;
alter table public.badge_exports enable row level security;
alter table public.review_notes enable row level security;

-- Guest invitations are intentionally separate from public registrations,
-- entry passes, and check-in. They are a manual, invitation-only workflow.
create table if not exists public.guest_invitations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  email text not null,
  designation text,
  organization text,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'failed', 'withdrawn')),
  template_version text not null default 'guest_invitation_v1',
  send_count integer not null default 0 check (send_count >= 0),
  first_sent_at timestamptz,
  last_sent_at timestamptz,
  last_provider_message_id text,
  last_error text,
  created_by_clerk_id text,
  created_by_email text,
  last_sent_by_clerk_id text,
  last_sent_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_guest_invitations_email_lower
on public.guest_invitations (lower(email));
create index if not exists idx_guest_invitations_status_created
on public.guest_invitations(status, created_at desc);

create table if not exists public.guest_invitation_deliveries (
  id uuid primary key default gen_random_uuid(),
  guest_invitation_id uuid not null references public.guest_invitations(id) on delete cascade,
  delivery_status text not null check (delivery_status in ('accepted', 'failed')),
  recipient_email text not null,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_guest_invitation_deliveries_invitation
on public.guest_invitation_deliveries(guest_invitation_id, created_at desc);
create index if not exists idx_guest_invitation_deliveries_provider
on public.guest_invitation_deliveries(provider_message_id);

alter table public.guest_invitations enable row level security;
alter table public.guest_invitation_deliveries enable row level security;

drop policy if exists "Deny registration email jobs api access" on public.registration_email_jobs;
drop policy if exists "Deny registration email job items api access" on public.registration_email_job_items;
drop policy if exists "Deny all newsletter anon" on public.newsletter_subscribers;
drop policy if exists "Deny all contact anon" on public.contact_messages;
drop policy if exists "Deny all registration confirmation anon" on public.registration_confirmation_requests;
drop policy if exists "Allow newsletter insert" on public.newsletter_subscribers;
drop policy if exists "Allow message insert" on public.contact_messages;
drop policy if exists "Allow registration confirmation insert" on public.registration_confirmation_requests;

create policy "Deny registration email jobs api access"
on public.registration_email_jobs
for all
to anon, authenticated
using (false)
with check (false);

create policy "Deny registration email job items api access"
on public.registration_email_job_items
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Deny guest invitations api access" on public.guest_invitations;
create policy "Deny guest invitations api access"
on public.guest_invitations
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Deny guest invitation deliveries api access" on public.guest_invitation_deliveries;
create policy "Deny guest invitation deliveries api access"
on public.guest_invitation_deliveries
for all
to anon, authenticated
using (false)
with check (false);

insert into storage.buckets (id, name, public)
values ('registration-profile-photos', 'registration-profile-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('registration-pass-images', 'registration-pass-images', true)
on conflict (id) do nothing;

-- Admin email overrides (managed via admin console Settings page)
create table if not exists public.admin_email_overrides (
  id bigint generated always as identity primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'reviewer')),
  added_by text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_email_overrides enable row level security;

-- Supabase Data API access is now opt-in via grants. This app uses
-- server-side supabase-js with SUPABASE_SERVICE_ROLE_KEY, not direct
-- browser access, so only expose tables and identity sequences to service_role.
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

notify pgrst, 'reload schema';

-- Desk registrations do not create advance registrations or QR entry passes.
create table if not exists public.spot_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  designation text,
  organization text,
  event_day smallint not null check (event_day in (1, 2)),
  desk_label text,
  checked_in_at timestamptz not null default now(),
  email_status text not null default 'sending'
    check (email_status in ('sending', 'sent', 'needs_review', 'not_required')),
  provider_message_id text,
  last_email_error text,
  created_by_clerk_id text,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_spot_registrations_email_day
  on public.spot_registrations (lower(email), event_day);
create index if not exists idx_spot_registrations_day_checked
  on public.spot_registrations (event_day, checked_in_at desc);
alter table public.spot_registrations enable row level security;
revoke all on public.spot_registrations from anon, authenticated;
grant select, insert, update on public.spot_registrations to service_role;

-- Guest invitation send attempt migration, also applied by the dated migration.
revoke all on public.guest_invitations, public.guest_invitation_deliveries from anon, authenticated;
-- A delivery row is also the durable send attempt. Its id is the Resend
-- idempotency key, created before contacting the provider.
alter table public.guest_invitation_deliveries
  drop constraint if exists guest_invitation_deliveries_delivery_status_check;
alter table public.guest_invitation_deliveries
  add constraint guest_invitation_deliveries_delivery_status_check
  check (delivery_status in ('sending', 'accepted', 'failed'));
alter table public.guest_invitation_deliveries
  add column if not exists guest_name text,
  add column if not exists request_sha256 text,
  add column if not exists updated_at timestamptz not null default now();
create unique index if not exists idx_guest_invitation_one_active_send
  on public.guest_invitation_deliveries (guest_invitation_id)
  where delivery_status = 'sending';

create or replace function public.claim_guest_invitation_send(
  p_invitation_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_clerk_id text,
  p_actor_email text
)
returns public.guest_invitation_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_invitation public.guest_invitations;
  v_attempt public.guest_invitation_deliveries;
begin
  update public.guest_invitations
  set status = 'sending', last_error = null, updated_at = now()
  where id = p_invitation_id
    and status in ('draft', 'sent', 'failed')
    and updated_at = p_expected_updated_at
  returning * into v_invitation;
  if not found then
    raise exception 'Guest invitation changed or is already being sent.' using errcode = 'P0001';
  end if;

  insert into public.guest_invitation_deliveries (
    guest_invitation_id, delivery_status, recipient_email, guest_name,
    actor_clerk_id, actor_email
  ) values (
    v_invitation.id, 'sending', v_invitation.email, v_invitation.guest_name,
    p_actor_clerk_id, p_actor_email
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_guest_invitation_send(
  p_attempt_id uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns public.guest_invitations
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attempt public.guest_invitation_deliveries;
  v_invitation public.guest_invitations;
  v_now timestamptz := now();
begin
  if p_outcome is null or p_outcome not in ('accepted', 'failed') then
    raise exception 'Invalid guest send outcome.' using errcode = '22023';
  end if;
  if p_outcome = 'accepted' and nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Accepted guest send requires a provider message ID.' using errcode = '22023';
  end if;

  select * into v_attempt from public.guest_invitation_deliveries
  where id = p_attempt_id for update;
  if not found then
    raise exception 'Guest send attempt not found.' using errcode = 'P0002';
  end if;
  if v_attempt.delivery_status = 'accepted' and p_outcome = 'accepted'
    and v_attempt.provider_message_id = p_provider_message_id then
    select * into v_invitation from public.guest_invitations
    where id = v_attempt.guest_invitation_id;
    return v_invitation;
  end if;
  if v_attempt.delivery_status <> 'sending' then
    raise exception 'Guest send attempt is already resolved.' using errcode = 'P0001';
  end if;

  update public.guest_invitations
  set status = case when p_outcome = 'accepted' then 'sent' else 'failed' end,
      send_count = send_count + case when p_outcome = 'accepted' then 1 else 0 end,
      first_sent_at = case when p_outcome = 'accepted' then coalesce(first_sent_at, v_now) else first_sent_at end,
      last_sent_at = case when p_outcome = 'accepted' then v_now else last_sent_at end,
      last_provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else last_provider_message_id end,
      last_sent_by_clerk_id = case when p_outcome = 'accepted' then v_attempt.actor_clerk_id else last_sent_by_clerk_id end,
      last_sent_by_email = case when p_outcome = 'accepted' then v_attempt.actor_email else last_sent_by_email end,
      last_error = case when p_outcome = 'accepted' then null else left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) end,
      updated_at = v_now
  where id = v_attempt.guest_invitation_id and status = 'sending'
  returning * into v_invitation;
  if not found then
    raise exception 'Guest invitation is no longer sending.' using errcode = 'P0001';
  end if;

  update public.guest_invitation_deliveries
  set delivery_status = p_outcome,
      provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else null end,
      failure_reason = case when p_outcome = 'failed' then left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) else null end,
      updated_at = v_now
  where id = p_attempt_id;
  return v_invitation;
end;
$$;

revoke all on function public.claim_guest_invitation_send(uuid, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.finish_guest_invitation_send(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_guest_invitation_send(uuid, timestamptz, text, text) to service_role;
grant execute on function public.finish_guest_invitation_send(uuid, text, text, text) to service_role;

-- Speaker communications: per-edition speaker badges, sent from the admin
-- Speaker Communications tab. Separate from registrations and entry passes.
-- One row per speaker per edition. Speakers are matched to badge files by
-- name_key, so a returning speaker gets a fresh row in each edition.
create table if not exists public.speaker_badges (
  id uuid primary key default gen_random_uuid(),
  edition text not null default '2026',
  speaker_name text not null,
  name_key text not null,
  emails text[] not null default '{}'
    check (cardinality(emails) <= 3),
  designation text,
  organization text,
  badge_path text,
  badge_content_type text,
  badge_sha256 text,
  badge_updated_at timestamptz,
  download_token text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'failed')),
  send_count integer not null default 0 check (send_count >= 0),
  first_sent_at timestamptz,
  last_sent_at timestamptz,
  last_sent_badge_sha256 text,
  last_provider_message_id text,
  last_error text,
  created_by_email text,
  last_sent_by_clerk_id text,
  last_sent_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_speaker_badges_edition_name_key
  on public.speaker_badges (edition, name_key);
create index if not exists idx_speaker_badges_edition_name
  on public.speaker_badges (edition, speaker_name);

-- A delivery row is also the durable send attempt. Its id is the Resend
-- idempotency key, created before contacting the provider.
create table if not exists public.speaker_badge_deliveries (
  id uuid primary key default gen_random_uuid(),
  speaker_badge_id uuid not null
    references public.speaker_badges(id) on delete cascade,
  template_key text not null default 'speaker_badge_v1',
  delivery_status text not null
    check (delivery_status in ('sending', 'accepted', 'failed')),
  recipient_emails text[] not null,
  speaker_name text not null,
  badge_sha256 text not null,
  request_sha256 text,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_speaker_badge_deliveries_badge
  on public.speaker_badge_deliveries (speaker_badge_id, created_at desc);
create index if not exists idx_speaker_badge_deliveries_provider
  on public.speaker_badge_deliveries (provider_message_id);
create unique index if not exists idx_speaker_badge_one_active_send
  on public.speaker_badge_deliveries (speaker_badge_id)
  where delivery_status = 'sending';

alter table public.speaker_badges enable row level security;
alter table public.speaker_badge_deliveries enable row level security;

drop policy if exists "Deny speaker badges api access" on public.speaker_badges;
create policy "Deny speaker badges api access"
  on public.speaker_badges
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "Deny speaker badge deliveries api access"
  on public.speaker_badge_deliveries;
create policy "Deny speaker badge deliveries api access"
  on public.speaker_badge_deliveries
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on public.speaker_badges, public.speaker_badge_deliveries from anon, authenticated;
grant select, insert, update, delete on public.speaker_badges, public.speaker_badge_deliveries to service_role;

create or replace function public.claim_speaker_badge_send(
  p_speaker_badge_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_clerk_id text,
  p_actor_email text
)
returns public.speaker_badge_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_badge public.speaker_badges;
  v_attempt public.speaker_badge_deliveries;
begin
  update public.speaker_badges
  set status = 'sending', last_error = null, updated_at = now()
  where id = p_speaker_badge_id
    and status in ('draft', 'sent', 'failed')
    and updated_at = p_expected_updated_at
    and cardinality(emails) > 0
    and badge_sha256 is not null
  returning * into v_badge;
  if not found then
    raise exception 'Speaker badge changed or is already being sent.' using errcode = 'P0001';
  end if;

  insert into public.speaker_badge_deliveries (
    speaker_badge_id, delivery_status, recipient_emails, speaker_name,
    badge_sha256, actor_clerk_id, actor_email
  ) values (
    v_badge.id, 'sending', v_badge.emails, v_badge.speaker_name,
    v_badge.badge_sha256, p_actor_clerk_id, p_actor_email
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_speaker_badge_send(
  p_attempt_id uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns public.speaker_badges
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attempt public.speaker_badge_deliveries;
  v_badge public.speaker_badges;
  v_now timestamptz := now();
begin
  if p_outcome is null or p_outcome not in ('accepted', 'failed') then
    raise exception 'Invalid speaker badge send outcome.' using errcode = '22023';
  end if;
  if p_outcome = 'accepted' and nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Accepted speaker badge send requires a provider message ID.' using errcode = '22023';
  end if;

  select * into v_attempt from public.speaker_badge_deliveries
  where id = p_attempt_id for update;
  if not found then
    raise exception 'Speaker badge send attempt not found.' using errcode = 'P0002';
  end if;
  if v_attempt.delivery_status = 'accepted' and p_outcome = 'accepted'
    and v_attempt.provider_message_id = p_provider_message_id then
    select * into v_badge from public.speaker_badges
    where id = v_attempt.speaker_badge_id;
    return v_badge;
  end if;
  if v_attempt.delivery_status <> 'sending' then
    raise exception 'Speaker badge send attempt is already resolved.' using errcode = 'P0001';
  end if;

  update public.speaker_badges
  set status = case when p_outcome = 'accepted' then 'sent' else 'failed' end,
      send_count = send_count + case when p_outcome = 'accepted' then 1 else 0 end,
      first_sent_at = case when p_outcome = 'accepted' then coalesce(first_sent_at, v_now) else first_sent_at end,
      last_sent_at = case when p_outcome = 'accepted' then v_now else last_sent_at end,
      last_sent_badge_sha256 = case when p_outcome = 'accepted' then v_attempt.badge_sha256 else last_sent_badge_sha256 end,
      last_provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else last_provider_message_id end,
      last_sent_by_clerk_id = case when p_outcome = 'accepted' then v_attempt.actor_clerk_id else last_sent_by_clerk_id end,
      last_sent_by_email = case when p_outcome = 'accepted' then v_attempt.actor_email else last_sent_by_email end,
      last_error = case when p_outcome = 'accepted' then null else left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) end,
      updated_at = v_now
  where id = v_attempt.speaker_badge_id and status = 'sending'
  returning * into v_badge;
  if not found then
    raise exception 'Speaker badge is no longer sending.' using errcode = 'P0001';
  end if;

  update public.speaker_badge_deliveries
  set delivery_status = p_outcome,
      provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else null end,
      failure_reason = case when p_outcome = 'failed' then left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) else null end,
      updated_at = v_now
  where id = p_attempt_id;
  return v_badge;
end;
$$;

revoke all on function public.claim_speaker_badge_send(uuid, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.finish_speaker_badge_send(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_speaker_badge_send(uuid, timestamptz, text, text) to service_role;
grant execute on function public.finish_speaker_badge_send(uuid, text, text, text) to service_role;

-- Badge images stay private. Speakers download theirs through /badge/<token>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaker-badges', 'speaker-badges', false, 3145728, array['image/png', 'image/jpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Speaker photo links: per-edition Google Drive folders of each speaker's
-- event photos, sent from the Photos tab of Speaker Communications. Separate
-- from speaker_badges so the badge tab and its send history stay as they are.
create table if not exists public.speaker_photo_links (
  id uuid primary key default gen_random_uuid(),
  edition text not null default '2026',
  speaker_name text not null,
  name_key text not null,
  emails text[] not null default '{}'
    check (cardinality(emails) <= 3),
  drive_url text,
  photo_count integer check (photo_count is null or photo_count >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'failed')),
  send_count integer not null default 0 check (send_count >= 0),
  first_sent_at timestamptz,
  last_sent_at timestamptz,
  last_sent_drive_url text,
  last_provider_message_id text,
  last_error text,
  created_by_email text,
  last_sent_by_clerk_id text,
  last_sent_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_speaker_photo_links_edition_name_key
  on public.speaker_photo_links (edition, name_key);

-- A delivery row is also the durable send attempt. Its id is the Resend
-- idempotency key, created before contacting the provider.
create table if not exists public.speaker_photo_deliveries (
  id uuid primary key default gen_random_uuid(),
  speaker_photo_link_id uuid not null
    references public.speaker_photo_links(id) on delete cascade,
  template_key text not null default 'speaker_photos_v1',
  delivery_status text not null
    check (delivery_status in ('sending', 'accepted', 'failed')),
  recipient_emails text[] not null,
  speaker_name text not null,
  drive_url text not null,
  request_sha256 text,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_speaker_photo_deliveries_link
  on public.speaker_photo_deliveries (speaker_photo_link_id, created_at desc);
create unique index if not exists idx_speaker_photo_one_active_send
  on public.speaker_photo_deliveries (speaker_photo_link_id)
  where delivery_status = 'sending';

alter table public.speaker_photo_links enable row level security;
alter table public.speaker_photo_deliveries enable row level security;

drop policy if exists "Deny speaker photo links api access" on public.speaker_photo_links;
create policy "Deny speaker photo links api access"
  on public.speaker_photo_links
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "Deny speaker photo deliveries api access"
  on public.speaker_photo_deliveries;
create policy "Deny speaker photo deliveries api access"
  on public.speaker_photo_deliveries
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on public.speaker_photo_links, public.speaker_photo_deliveries from anon, authenticated;
grant select, insert, update, delete on public.speaker_photo_links, public.speaker_photo_deliveries to service_role;

create or replace function public.claim_speaker_photo_send(
  p_speaker_photo_link_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_clerk_id text,
  p_actor_email text
)
returns public.speaker_photo_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_link public.speaker_photo_links;
  v_attempt public.speaker_photo_deliveries;
begin
  update public.speaker_photo_links
  set status = 'sending', last_error = null, updated_at = now()
  where id = p_speaker_photo_link_id
    and status in ('draft', 'sent', 'failed')
    and updated_at = p_expected_updated_at
    and cardinality(emails) > 0
    and nullif(trim(drive_url), '') is not null
  returning * into v_link;
  if not found then
    raise exception 'Speaker photos changed or are already being sent.' using errcode = 'P0001';
  end if;

  insert into public.speaker_photo_deliveries (
    speaker_photo_link_id, delivery_status, recipient_emails, speaker_name,
    drive_url, actor_clerk_id, actor_email
  ) values (
    v_link.id, 'sending', v_link.emails, v_link.speaker_name,
    v_link.drive_url, p_actor_clerk_id, p_actor_email
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_speaker_photo_send(
  p_attempt_id uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns public.speaker_photo_links
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attempt public.speaker_photo_deliveries;
  v_link public.speaker_photo_links;
  v_now timestamptz := now();
begin
  if p_outcome is null or p_outcome not in ('accepted', 'failed') then
    raise exception 'Invalid speaker photo send outcome.' using errcode = '22023';
  end if;
  if p_outcome = 'accepted' and nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Accepted speaker photo send requires a provider message ID.' using errcode = '22023';
  end if;

  select * into v_attempt from public.speaker_photo_deliveries
  where id = p_attempt_id for update;
  if not found then
    raise exception 'Speaker photo send attempt not found.' using errcode = 'P0002';
  end if;
  if v_attempt.delivery_status = 'accepted' and p_outcome = 'accepted'
    and v_attempt.provider_message_id = p_provider_message_id then
    select * into v_link from public.speaker_photo_links
    where id = v_attempt.speaker_photo_link_id;
    return v_link;
  end if;
  if v_attempt.delivery_status <> 'sending' then
    raise exception 'Speaker photo send attempt is already resolved.' using errcode = 'P0001';
  end if;

  update public.speaker_photo_links
  set status = case when p_outcome = 'accepted' then 'sent' else 'failed' end,
      send_count = send_count + case when p_outcome = 'accepted' then 1 else 0 end,
      first_sent_at = case when p_outcome = 'accepted' then coalesce(first_sent_at, v_now) else first_sent_at end,
      last_sent_at = case when p_outcome = 'accepted' then v_now else last_sent_at end,
      last_sent_drive_url = case when p_outcome = 'accepted' then v_attempt.drive_url else last_sent_drive_url end,
      last_provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else last_provider_message_id end,
      last_sent_by_clerk_id = case when p_outcome = 'accepted' then v_attempt.actor_clerk_id else last_sent_by_clerk_id end,
      last_sent_by_email = case when p_outcome = 'accepted' then v_attempt.actor_email else last_sent_by_email end,
      last_error = case when p_outcome = 'accepted' then null else left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) end,
      updated_at = v_now
  where id = v_attempt.speaker_photo_link_id and status = 'sending'
  returning * into v_link;
  if not found then
    raise exception 'Speaker photos are no longer sending.' using errcode = 'P0001';
  end if;

  update public.speaker_photo_deliveries
  set delivery_status = p_outcome,
      provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else null end,
      failure_reason = case when p_outcome = 'failed' then left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) else null end,
      updated_at = v_now
  where id = p_attempt_id;
  return v_link;
end;
$$;

revoke all on function public.claim_speaker_photo_send(uuid, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.finish_speaker_photo_send(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_speaker_photo_send(uuid, timestamptz, text, text) to service_role;
grant execute on function public.finish_speaker_photo_send(uuid, text, text, text) to service_role;

-- Personal touches for the speaker photo email: the sessions they spoke in,
-- one line they said on stage, and one featured photo shown in the email.
alter table public.speaker_photo_links
  add column if not exists session_titles text[] not null default '{}'
    check (cardinality(session_titles) <= 5),
  add column if not exists quote text
    check (quote is null or char_length(quote) <= 400),
  add column if not exists featured_photo_path text,
  add column if not exists featured_photo_sha256 text;

-- Featured photos stay private; the server embeds them in the email.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaker-photo-picks', 'speaker-photo-picks', false, 3145728, array['image/jpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;


-- Event reminders: T-minus reminder emails to confirmed registrants, sent
-- from the admin Reminders tab. Separate from registration email jobs.
-- A campaign is one reminder email (T-10, T-7, ...) with its own copy and
-- attachments. content_version goes up on every copy or attachment change,
-- so each delivery records exactly which version it sent.
create table if not exists public.reminder_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  subject text not null check (char_length(subject) between 1 and 200),
  body text not null check (char_length(body) between 1 and 10000),
  content_version integer not null default 1 check (content_version >= 1),
  created_by_email text,
  updated_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reminder_campaigns_created
  on public.reminder_campaigns (created_at);

create table if not exists public.reminder_campaign_attachments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null
    references public.reminder_campaigns(id) on delete cascade,
  filename text not null check (char_length(filename) between 1 and 160),
  storage_path text not null unique,
  content_type text not null
    check (content_type in ('application/pdf', 'image/png', 'image/jpeg')),
  size_bytes integer not null check (size_bytes > 0),
  sha256 text not null,
  created_by_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reminder_attachments_campaign
  on public.reminder_campaign_attachments (campaign_id, created_at);

-- A delivery row is also the durable send attempt. Its id is the Resend
-- idempotency key, created before contacting the provider. Campaigns with
-- deliveries cannot be deleted, so the send history always survives.
create table if not exists public.reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null
    references public.reminder_campaigns(id) on delete restrict,
  registration_id uuid
    references public.event_registrations(id) on delete set null,
  content_version integer not null,
  delivery_status text not null
    check (delivery_status in ('sending', 'accepted', 'failed')),
  recipient_email text not null,
  recipient_name text not null,
  request_sha256 text,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reminder_deliveries_campaign
  on public.reminder_deliveries (campaign_id, registration_id, created_at desc);
create index if not exists idx_reminder_deliveries_provider
  on public.reminder_deliveries (provider_message_id);
create unique index if not exists idx_reminder_one_active_send
  on public.reminder_deliveries (campaign_id, registration_id)
  where delivery_status = 'sending';

alter table public.reminder_campaigns enable row level security;
alter table public.reminder_campaign_attachments enable row level security;
alter table public.reminder_deliveries enable row level security;

drop policy if exists "Deny reminder campaigns api access" on public.reminder_campaigns;
create policy "Deny reminder campaigns api access"
  on public.reminder_campaigns
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "Deny reminder attachments api access"
  on public.reminder_campaign_attachments;
create policy "Deny reminder attachments api access"
  on public.reminder_campaign_attachments
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "Deny reminder deliveries api access" on public.reminder_deliveries;
create policy "Deny reminder deliveries api access"
  on public.reminder_deliveries
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on public.reminder_campaigns, public.reminder_campaign_attachments,
  public.reminder_deliveries from anon, authenticated;
grant select, insert, update, delete on public.reminder_campaigns,
  public.reminder_campaign_attachments, public.reminder_deliveries to service_role;

-- Claims one send to one confirmed registrant. Refuses when the copy changed
-- since the caller built the email, when the registrant is no longer
-- confirmed, or when they already have this reminder and p_resend is false.
create or replace function public.claim_reminder_send(
  p_campaign_id uuid,
  p_registration_id uuid,
  p_expected_content_version integer,
  p_resend boolean,
  p_actor_clerk_id text,
  p_actor_email text
)
returns public.reminder_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_campaign public.reminder_campaigns;
  v_registration public.event_registrations;
  v_attempt public.reminder_deliveries;
begin
  select * into v_campaign from public.reminder_campaigns
  where id = p_campaign_id for share;
  if not found then
    raise exception 'Reminder not found.' using errcode = 'P0002';
  end if;
  if v_campaign.content_version <> p_expected_content_version then
    raise exception 'The reminder changed while sending. Try again.' using errcode = 'P0001';
  end if;

  select * into v_registration from public.event_registrations
  where id = p_registration_id;
  if not found or v_registration.status <> 'confirmed' then
    raise exception 'This registrant is no longer confirmed.' using errcode = 'P0001';
  end if;

  if not coalesce(p_resend, false) and exists (
    select 1 from public.reminder_deliveries
    where campaign_id = p_campaign_id
      and registration_id = p_registration_id
      and delivery_status = 'accepted'
  ) then
    raise exception 'This registrant has already been sent this reminder.' using errcode = 'P0001';
  end if;

  insert into public.reminder_deliveries (
    campaign_id, registration_id, content_version, delivery_status,
    recipient_email, recipient_name, actor_clerk_id, actor_email
  ) values (
    p_campaign_id, p_registration_id, v_campaign.content_version, 'sending',
    lower(trim(v_registration.email)),
    trim(v_registration.first_name || ' ' || v_registration.last_name),
    p_actor_clerk_id, p_actor_email
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_reminder_send(
  p_attempt_id uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns public.reminder_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attempt public.reminder_deliveries;
begin
  if p_outcome is null or p_outcome not in ('accepted', 'failed') then
    raise exception 'Invalid reminder send outcome.' using errcode = '22023';
  end if;
  if p_outcome = 'accepted' and nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Accepted reminder send requires a provider message ID.' using errcode = '22023';
  end if;

  select * into v_attempt from public.reminder_deliveries
  where id = p_attempt_id for update;
  if not found then
    raise exception 'Reminder send attempt not found.' using errcode = 'P0002';
  end if;
  if v_attempt.delivery_status = 'accepted' and p_outcome = 'accepted'
    and v_attempt.provider_message_id = p_provider_message_id then
    return v_attempt;
  end if;
  if v_attempt.delivery_status <> 'sending' then
    raise exception 'Reminder send attempt is already resolved.' using errcode = 'P0001';
  end if;

  update public.reminder_deliveries
  set delivery_status = p_outcome,
      provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else null end,
      failure_reason = case when p_outcome = 'failed' then left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) else null end,
      updated_at = now()
  where id = p_attempt_id
  returning * into v_attempt;
  return v_attempt;
end;
$$;

revoke all on function public.claim_reminder_send(uuid, uuid, integer, boolean, text, text) from public, anon, authenticated;
revoke all on function public.finish_reminder_send(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_reminder_send(uuid, uuid, integer, boolean, text, text) to service_role;
grant execute on function public.finish_reminder_send(uuid, text, text, text) to service_role;

-- Attachments stay private; the server reads them when sending. 4 MB keeps
-- each upload under the hosting request-body limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reminder-attachments', 'reminder-attachments', false, 4194304,
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';

-- Public form settings (managed via admin console Settings page).
-- Admins open or close each public form. A form with no row here is open. form_setting_changes keeps every toggle for the audit trail.
create table if not exists public.form_settings (
  form_key text primary key check (
    form_key in (
      'registration',
      'speaker_application',
      'volunteer_application',
      'media_accreditation',
      'exhibition_enquiry'
    )
  ),
  is_open boolean not null default true,
  updated_by_email text,
  updated_at timestamptz not null default now()
);

create table if not exists public.form_setting_changes (
  id bigint generated always as identity primary key,
  form_key text not null,
  is_open boolean not null,
  changed_by_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_setting_changes_created
  on public.form_setting_changes (created_at desc, id desc);

alter table public.form_settings enable row level security;
alter table public.form_setting_changes enable row level security;

grant select, insert, update, delete on public.form_settings to service_role;
grant select, insert, update, delete on public.form_setting_changes to service_role;
grant usage, select on all sequences in schema public to service_role;

notify pgrst, 'reload schema';

-- Admin audit events (keep in sync with migrations/20261020120000_admin_audit_events.sql).
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

-- Registration review RPC (keep in sync with migrations/20261020130000_apply_registration_reviews.sql).
-- Same shape as baseRegistrationSelect() in src/lib/registration-db.js.
create or replace function public.registration_admin_json(r public.event_registrations)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', r.id,
    'registration_code', r.registration_code,
    'first_name', r.first_name,
    'last_name', r.last_name,
    'email', r.email,
    'phone', r.phone,
    'organization', r.organization,
    'designation', r.designation,
    'attendee_category', r.attendee_category,
    'city', r.city,
    'country', r.country,
    'linkedin_url', r.linkedin_url,
    'attendance_reason', r.attendance_reason,
    'priority_tier', r.priority_tier,
    'source', r.source,
    'status', r.status,
    'speaker_flag', r.speaker_flag,
    'vip_flag', r.vip_flag,
    'exception_badge_required', r.exception_badge_required,
    'badge_color_label', r.badge_color_label,
    'badge_color_hex', r.badge_color_hex,
    'profile_photo_path', r.profile_photo_path,
    'profile_photo_size_bytes', r.profile_photo_size_bytes,
    'profile_photo_width', r.profile_photo_width,
    'profile_photo_height', r.profile_photo_height,
    'qr_pass_issued_at', r.qr_pass_issued_at,
    'checked_in_at', r.checked_in_at,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'reviewed_at', r.reviewed_at,
    'reviewed_by_clerk_id', r.reviewed_by_clerk_id,
    'reviewed_by_email', r.reviewed_by_email,
    'review_notes', r.review_notes,
    'last_badge_export_batch_id', r.last_badge_export_batch_id
  ) || jsonb_build_object(
    'entry_passes', (
      select jsonb_build_object(
        'id', p.id,
        'token', p.token,
        'status', p.status,
        'issued_at', p.issued_at,
        'revoked_at', p.revoked_at
      )
      from public.entry_passes p
      where p.registration_id = r.id
    ),
    'registration_daily_check_ins', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_day', c.event_day,
        'checked_in_at', c.checked_in_at,
        'desk_label', c.desk_label,
        'actor_email', c.actor_email
      ) order by c.event_day)
      from public.registration_daily_check_ins c
      where c.registration_id = r.id
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.registration_admin_json(public.event_registrations) from public, anon, authenticated;
grant execute on function public.registration_admin_json(public.event_registrations) to service_role;

-- p_items: [{ id, expected_updated_at, review_notes, speaker_flag, vip_flag,
--             badge_color_label, badge_color_hex }]
-- A row whose updated_at no longer matches expected_updated_at is skipped and
-- reported in conflict_ids, so a stale snapshot never overwrites newer work.
create or replace function public.apply_registration_reviews(
  p_items jsonb,
  p_status text,
  p_exception_badge_required boolean,
  p_history_notes text,
  p_actor_clerk_id text,
  p_actor_email text,
  p_max_attempts integer default 3
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_item jsonb;
  v_id uuid;
  v_previous text;
  v_updated uuid[] := '{}';
  v_previous_statuses jsonb := '{}'::jsonb;
  v_conflicts text[] := '{}';
  v_email_ids uuid[] := '{}';
  v_email_count integer;
  v_job_id uuid;
begin
  if p_status not in ('pending', 'confirmed', 'waitlisted', 'rejected') then
    raise exception 'Unsupported registration status %', p_status
      using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_id := (v_item ->> 'id')::uuid;

    select status into v_previous
    from public.event_registrations
    where id = v_id
      and updated_at = (v_item ->> 'expected_updated_at')::timestamptz
    for update;

    if not found then
      v_conflicts := v_conflicts || v_id::text;
      continue;
    end if;

    update public.event_registrations
    set status = p_status,
        review_notes = nullif(v_item ->> 'review_notes', ''),
        speaker_flag = coalesce((v_item ->> 'speaker_flag')::boolean, false),
        vip_flag = coalesce((v_item ->> 'vip_flag')::boolean, false),
        badge_color_label = v_item ->> 'badge_color_label',
        badge_color_hex = v_item ->> 'badge_color_hex',
        reviewed_at = v_now,
        reviewed_by_clerk_id = p_actor_clerk_id,
        reviewed_by_email = p_actor_email,
        exception_badge_required = p_exception_badge_required,
        updated_at = v_now
    where id = v_id;

    insert into public.registration_status_history (
      registration_id, previous_status, next_status, action_type, notes,
      actor_clerk_id, actor_email, created_at
    ) values (
      v_id, v_previous, p_status, 'status_updated', nullif(p_history_notes, ''),
      p_actor_clerk_id, p_actor_email, v_now
    );

    v_updated := v_updated || v_id;
    v_previous_statuses := v_previous_statuses || jsonb_build_object(v_id::text, v_previous);

    -- Mirrors getReviewEmailTemplate in registration-review-email.cjs.
    if p_status in ('confirmed', 'waitlisted', 'rejected')
      and v_previous is distinct from p_status then
      v_email_ids := v_email_ids || v_id;
    end if;
  end loop;

  v_email_count := coalesce(array_length(v_email_ids, 1), 0);

  if v_email_count > 0 then
    insert into public.registration_email_jobs (
      status, template_type, total_items, queued_items,
      created_by_clerk_id, created_by_email, last_processed_at, updated_at
    ) values (
      'queued', p_status, v_email_count, v_email_count,
      p_actor_clerk_id, p_actor_email, v_now, v_now
    )
    returning id into v_job_id;

    with notifications as (
      insert into public.registration_notifications (
        registration_id, template_type, recipient_email, delivery_status,
        actor_clerk_id, actor_email, created_at, updated_at
      )
      select r.id, p_status, r.email, 'queued',
        p_actor_clerk_id, p_actor_email, v_now, v_now
      from public.event_registrations r
      where r.id = any(v_email_ids)
      returning id, registration_id
    )
    insert into public.registration_email_job_items (
      job_id, registration_id, notification_id, template_type, status,
      max_attempts, created_at, updated_at
    )
    select v_job_id, n.registration_id, n.id, p_status, 'queued',
      p_max_attempts, v_now, v_now
    from notifications n;
  end if;

  return jsonb_build_object(
    'registrations', coalesce((
      select jsonb_agg(public.registration_admin_json(r))
      from public.event_registrations r
      where r.id = any(v_updated)
    ), '[]'::jsonb),
    'previous_statuses', v_previous_statuses,
    'conflict_ids', to_jsonb(v_conflicts),
    'job_id', v_job_id,
    'email_count', v_email_count
  );
end;
$$;

revoke all on function public.apply_registration_reviews(jsonb, text, boolean, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.apply_registration_reviews(jsonb, text, boolean, text, text, text, integer) to service_role;

notify pgrst, 'reload schema';

-- Job item claims (keep in sync with migrations/20261020140000_claim_job_items.sql).

create or replace function public.claim_registration_email_job_items(
  p_job_id uuid,
  p_limit integer default 20
)
returns setof public.registration_email_job_items
language sql
security invoker
set search_path = ''
as $$
  with picked as (
    select id
    from public.registration_email_job_items
    where job_id = p_job_id
      and status in ('queued', 'retrying')
    order by created_at asc
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.registration_email_job_items item
  set status = 'processing',
      attempt_count = item.attempt_count + 1,
      last_attempt_at = clock_timestamp(),
      updated_at = clock_timestamp()
  from picked
  where item.id = picked.id
  returning item.*;
$$;

revoke all on function public.claim_registration_email_job_items(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_registration_email_job_items(uuid, integer) to service_role;

create or replace function public.claim_pass_issue_email_job_items(
  p_job_id uuid,
  p_limit integer default 20
)
returns setof public.pass_issue_email_job_items
language sql
security invoker
set search_path = ''
as $$
  with picked as (
    select id
    from public.pass_issue_email_job_items
    where job_id = p_job_id
      and status in ('queued', 'retrying')
    order by created_at asc
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.pass_issue_email_job_items item
  set status = 'processing',
      attempt_count = item.attempt_count + 1,
      last_attempt_at = clock_timestamp(),
      updated_at = clock_timestamp()
  from picked
  where item.id = picked.id
  returning item.*;
$$;

revoke all on function public.claim_pass_issue_email_job_items(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_pass_issue_email_job_items(uuid, integer) to service_role;

notify pgrst, 'reload schema';

-- QR pass job RPCs (keep in sync with migrations/20261020150000_pass_issue_job_rpcs.sql).

-- Counts item statuses under a row lock, so overlapping workers (admin tab,
-- after(), cron) never write stale counters. Mirrors
-- refresh_registration_email_job, plus the skipped state QR jobs have.
create or replace function public.refresh_pass_issue_email_job(p_job_id uuid)
returns setof public.pass_issue_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_job public.pass_issue_email_jobs%rowtype;
  v_total integer;
  v_queued integer;
  v_processing integer;
  v_sent integer;
  v_skipped integer;
  v_failed integer;
  v_retrying integer;
  v_status text;
begin
  select * into v_job
  from public.pass_issue_email_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'QR pass job % not found', p_job_id
      using errcode = 'P0002';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status = 'queued')::integer,
    count(*) filter (where status = 'processing')::integer,
    count(*) filter (where status = 'sent')::integer,
    count(*) filter (where status = 'skipped')::integer,
    count(*) filter (where status = 'failed')::integer,
    count(*) filter (where status = 'retrying')::integer
  into v_total, v_queued, v_processing, v_sent, v_skipped, v_failed, v_retrying
  from public.pass_issue_email_job_items
  where job_id = p_job_id;

  v_status := case
    when v_processing > 0 or v_retrying > 0 then 'processing'
    when v_queued > 0 then 'queued'
    when v_failed > 0 then 'failed'
    else 'completed'
  end;

  update public.pass_issue_email_jobs
  set total_items = v_total,
      queued_items = v_queued,
      processing_items = v_processing,
      sent_items = v_sent,
      skipped_items = v_skipped,
      failed_items = v_failed,
      retrying_items = v_retrying,
      status = v_status,
      completed_at = case when v_status in ('failed', 'completed') then clock_timestamp() else null end,
      last_processed_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_job_id
  returning * into v_job;

  return next v_job;
  return;
end;
$$;

revoke all on function public.refresh_pass_issue_email_job(uuid) from public, anon, authenticated;
grant execute on function public.refresh_pass_issue_email_job(uuid) to service_role;

-- Writes the job, one item per still-confirmed registration, and its counters
-- together. Registrations that are no longer confirmed are left out here
-- rather than in a separate lookup.
create or replace function public.create_pass_issue_email_job(
  p_registration_ids uuid[],
  p_selection_mode text,
  p_filters jsonb,
  p_resend_existing boolean,
  p_actor_clerk_id text,
  p_actor_email text,
  p_max_attempts integer default 3
)
returns setof public.pass_issue_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_job_id uuid;
begin
  insert into public.pass_issue_email_jobs (
    status, selection_mode, filters, resend_existing,
    created_by_clerk_id, created_by_email, updated_at
  ) values (
    'queued', p_selection_mode, coalesce(p_filters, '{}'::jsonb),
    coalesce(p_resend_existing, false), p_actor_clerk_id, p_actor_email, v_now
  )
  returning id into v_job_id;

  insert into public.pass_issue_email_job_items (
    job_id, registration_id, status, max_attempts, created_at, updated_at
  )
  select v_job_id, r.id, 'queued', p_max_attempts, v_now, v_now
  from public.event_registrations r
  where r.id = any(coalesce(p_registration_ids, '{}'::uuid[]))
    and r.status = 'confirmed'
  order by r.created_at asc;

  return query select * from public.refresh_pass_issue_email_job(v_job_id);
end;
$$;

revoke all on function public.create_pass_issue_email_job(uuid[], text, jsonb, boolean, text, text, integer) from public, anon, authenticated;
grant execute on function public.create_pass_issue_email_job(uuid[], text, jsonb, boolean, text, text, integer) to service_role;

notify pgrst, 'reload schema';
