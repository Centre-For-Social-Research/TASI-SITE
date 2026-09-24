-- Spot registrations are desk attendance records, separate from advance registrations.
-- A unique email/day pair prevents accidental double check-in and repeat email.
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
notify pgrst, 'reload schema';
