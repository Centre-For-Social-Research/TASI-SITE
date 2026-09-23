-- Keep this migration in sync with the guest invitation section in schema.sql.
-- Guest invitations remain separate from public registrations and entry passes.
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
  on public.guest_invitations (status, created_at desc);

create table if not exists public.guest_invitation_deliveries (
  id uuid primary key default gen_random_uuid(),
  guest_invitation_id uuid not null
    references public.guest_invitations(id) on delete cascade,
  delivery_status text not null check (delivery_status in ('accepted', 'failed')),
  recipient_email text not null,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_guest_invitation_deliveries_invitation
  on public.guest_invitation_deliveries (guest_invitation_id, created_at desc);
create index if not exists idx_guest_invitation_deliveries_provider
  on public.guest_invitation_deliveries (provider_message_id);

alter table public.guest_invitations enable row level security;
alter table public.guest_invitation_deliveries enable row level security;

drop policy if exists "Deny guest invitations api access"
  on public.guest_invitations;
create policy "Deny guest invitations api access"
  on public.guest_invitations
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "Deny guest invitation deliveries api access"
  on public.guest_invitation_deliveries;
create policy "Deny guest invitation deliveries api access"
  on public.guest_invitation_deliveries
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on public.guest_invitations, public.guest_invitation_deliveries from anon, authenticated;
grant select, insert, update, delete on public.guest_invitations, public.guest_invitation_deliveries to service_role;
