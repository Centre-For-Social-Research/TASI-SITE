create extension if not exists pgcrypto;

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

alter table public.festival_ticket_users enable row level security;
alter table public.festival_tickets enable row level security;
alter table public.festival_payment_audit_log enable row level security;
alter table public.festival_admin_audit_log enable row level security;

notify pgrst, 'reload schema';
