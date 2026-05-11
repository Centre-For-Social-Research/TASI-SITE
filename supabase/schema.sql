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

create table if not exists public.festival_ticket_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  organization text,
  job_title text,
  country text not null,
  phone text,
  billing_name text,
  billing_email text,
  billing_phone text,
  billing_address_line1 text,
  billing_address_line2 text,
  billing_city text,
  billing_state_or_province text,
  billing_postal_code text,
  billing_country text,
  tax_id_number text,
  gstin text,
  passport_or_national_id text,
  no_refund_acknowledged_at timestamptz,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_festival_ticket_users_country
on public.festival_ticket_users(country);

create table if not exists public.festival_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.festival_ticket_users(id) on delete cascade,
  ticket_number text not null unique,
  ticket_type text not null check (ticket_type in ('domestic', 'international')),
  payment_stream text not null check (payment_stream in ('domestic', 'fcra')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'checked_in')),
  base_amount_minor integer not null,
  tax_amount_minor integer not null default 0,
  total_amount_minor integer not null,
  currency char(3) not null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  invoice_number text,
  badge_number text,
  qr_payload text,
  idempotency_key text not null unique,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_festival_tickets_status
on public.festival_tickets(status, created_at desc);

create index if not exists idx_festival_tickets_stream
on public.festival_tickets(payment_stream, status, created_at desc);

create table if not exists public.festival_ticket_daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.festival_tickets(id) on delete cascade,
  event_day smallint not null check (event_day in (1, 2)),
  checked_in_at timestamptz not null default now(),
  token text,
  desk_label text,
  notes text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ticket_id, event_day)
);

create index if not exists idx_festival_ticket_daily_check_ins_ticket
on public.festival_ticket_daily_check_ins(ticket_id, event_day);

create index if not exists idx_festival_ticket_daily_check_ins_day_checked
on public.festival_ticket_daily_check_ins(event_day, checked_in_at desc);

insert into public.festival_ticket_daily_check_ins (
  ticket_id,
  event_day,
  checked_in_at,
  desk_label,
  notes,
  created_at,
  updated_at
)
select
  id,
  1,
  checked_in_at,
  null,
  'Imported from legacy checked_in_at value.',
  checked_in_at,
  checked_in_at
from public.festival_tickets
where checked_in_at is not null
on conflict (ticket_id, event_day) do nothing;

create table if not exists public.festival_payment_audit_log (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.festival_tickets(id) on delete set null,
  user_id uuid references public.festival_ticket_users(id) on delete set null,
  event_type text not null,
  payment_stream text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_festival_payment_audit_log_ticket
on public.festival_payment_audit_log(ticket_id, created_at desc);

create table if not exists public.festival_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.festival_tickets(id) on delete set null,
  action_type text not null,
  actor_clerk_id text,
  actor_email text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_festival_admin_audit_log_ticket
on public.festival_admin_audit_log(ticket_id, created_at desc);

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
alter table public.festival_ticket_users enable row level security;
alter table public.festival_tickets enable row level security;
alter table public.festival_ticket_daily_check_ins enable row level security;
alter table public.festival_payment_audit_log enable row level security;
alter table public.festival_admin_audit_log enable row level security;

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

insert into storage.buckets (id, name, public)
values ('registration-profile-photos', 'registration-profile-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('registration-pass-images', 'registration-pass-images', true)
on conflict (id) do nothing;

create table if not exists public.ticket_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  venue text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Asia/Kolkata',
  currency text not null default 'INR',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  ui_variant text not null default 'reception',
  hero_label text,
  created_by_clerk_id text,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ticket_events(id) on delete cascade,
  tier_key text not null,
  name text not null,
  description text,
  ticket_mode text not null check (ticket_mode in ('free', 'paid', 'donation')),
  price_paise integer check (price_paise is null or price_paise >= 0),
  min_donation_paise integer check (min_donation_paise is null or min_donation_paise >= 0),
  capacity integer not null check (capacity >= 0),
  per_order_limit integer not null default 10 check (per_order_limit > 0),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  is_active boolean not null default true,
  display_order integer not null default 0,
  badge_pattern text not null default 'default',
  short_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, tier_key),
  unique (event_id, name)
);

create table if not exists public.ticket_customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  normalized_email text not null,
  normalized_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ticket_customers_lookup
on public.ticket_customers(normalized_email, normalized_phone);

create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  public_order_code text not null unique,
  event_id uuid not null references public.ticket_events(id) on delete cascade,
  customer_id uuid not null references public.ticket_customers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'payment_pending', 'paid', 'failed', 'expired', 'cancelled')),
  currency text not null default 'INR',
  subtotal_paise integer not null default 0 check (subtotal_paise >= 0),
  donation_paise integer not null default 0 check (donation_paise >= 0),
  total_paise integer not null default 0 check (total_paise >= 0),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  normalized_buyer_email text not null,
  normalized_buyer_phone text not null,
  payment_provider text,
  provider_order_id text unique,
  hold_expires_at timestamptz,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ticket_orders_event_status
on public.ticket_orders(event_id, status, created_at desc);

create index if not exists idx_ticket_orders_buyer_lookup
on public.ticket_orders(normalized_buyer_email, normalized_buyer_phone, created_at desc);

create table if not exists public.ticket_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ticket_orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_amount_paise integer not null check (unit_amount_paise >= 0),
  line_total_paise integer not null check (line_total_paise >= 0),
  ticket_mode text not null check (ticket_mode in ('free', 'paid', 'donation')),
  donation_paise integer not null default 0 check (donation_paise >= 0),
  attendee_payload jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_order_items_order
on public.ticket_order_items(order_id);

create index if not exists idx_ticket_order_items_ticket_type
on public.ticket_order_items(ticket_type_id);

create table if not exists public.ticket_inventory_holds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ticket_orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_inventory_holds_ticket_expiry
on public.ticket_inventory_holds(ticket_type_id, expires_at desc);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ticket_orders(id) on delete cascade,
  event_id uuid not null references public.ticket_events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  ticket_code text not null unique,
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text not null,
  normalized_attendee_email text not null,
  normalized_attendee_phone text not null,
  status text not null default 'issued' check (status in ('issued', 'checked_in', 'cancelled', 'refunded')),
  qr_token text not null unique,
  qr_payload text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tickets_order
on public.tickets(order_id);

create index if not exists idx_tickets_attendee_lookup
on public.tickets(normalized_attendee_email, normalized_attendee_phone, created_at desc);

create table if not exists public.ticket_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ticket_orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text unique,
  provider_signature text,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'authorized', 'captured', 'failed', 'webhook_confirmed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ticket_payments_order
on public.ticket_payments(order_id, created_at desc);

create table if not exists public.ticket_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  provider_event_id text,
  dedupe_key text not null unique,
  event_type text not null,
  signature_valid boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_webhook_events_provider_event
on public.ticket_webhook_events(provider, provider_event_id);

alter table public.ticket_events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.ticket_customers enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.ticket_order_items enable row level security;
alter table public.ticket_inventory_holds enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_payments enable row level security;
alter table public.ticket_webhook_events enable row level security;

-- Festival ticket user: LinkedIn URL and profile photo (added for paid attendee profile)
alter table public.festival_ticket_users
  add column if not exists linkedin_url text,
  add column if not exists profile_photo_path text,
  add column if not exists profile_photo_size_bytes integer,
  add column if not exists profile_photo_width integer,
  add column if not exists profile_photo_height integer;

insert into storage.buckets (id, name, public)
values ('festival-ticket-photos', 'festival-ticket-photos', false)
on conflict (id) do nothing;

-- Admin email overrides (managed via admin console Settings page)
create table if not exists public.admin_email_overrides (
  id bigint generated always as identity primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'reviewer')),
  added_by text not null,
  created_at timestamptz not null default now()
);

notify pgrst, 'reload schema';
