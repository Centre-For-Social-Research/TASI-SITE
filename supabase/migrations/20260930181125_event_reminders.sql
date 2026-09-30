-- Keep this migration in sync with the event reminders section in schema.sql.
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
