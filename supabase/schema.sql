create extension if not exists pgcrypto;

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
  recipient_email text not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'resent')),
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

create table if not exists public.entry_scans (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  entry_pass_id uuid references public.entry_passes(id) on delete set null,
  token text,
  scan_result text not null,
  desk_label text,
  notes text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_entry_scans_registration on public.entry_scans(registration_id, created_at desc);

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
alter table public.entry_scans enable row level security;
alter table public.badge_exports enable row level security;
alter table public.review_notes enable row level security;

drop policy if exists "Deny all newsletter anon" on public.newsletter_subscribers;
drop policy if exists "Deny all contact anon" on public.contact_messages;
drop policy if exists "Deny all registration confirmation anon" on public.registration_confirmation_requests;
drop policy if exists "Allow newsletter insert" on public.newsletter_subscribers;
drop policy if exists "Allow message insert" on public.contact_messages;
drop policy if exists "Allow registration confirmation insert" on public.registration_confirmation_requests;

create policy "Allow newsletter insert"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (true);

create policy "Allow message insert"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create policy "Allow registration confirmation insert"
on public.registration_confirmation_requests
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values ('registration-profile-photos', 'registration-profile-photos', false)
on conflict (id) do nothing;
