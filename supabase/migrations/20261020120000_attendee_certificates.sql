-- Keep this migration in sync with the attendee certificates section in schema.sql.
-- One certificate per attendee registration per edition. The public
-- certificate code is printed on the PDF and used for verification; the
-- download link carries a separate secret token, stored only as a hash.
create table if not exists public.attendee_certificates (
  id uuid primary key default gen_random_uuid(),
  edition text not null default '2026',
  registration_id uuid
    references public.event_registrations(id) on delete set null,
  code text not null unique
    check (code ~ '^TASI[0-9]{2}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$'),
  claim_token_hash text not null unique,
  recipient_name text not null
    check (char_length(recipient_name) between 2 and 80),
  original_name text not null,
  name_change_count integer not null default 0
    check (name_change_count between 0 and 2),
  email text not null,
  source text not null default 'check-in'
    check (source in ('check-in', 'manual')),
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  revoked_reason text,
  revoked_at timestamptz,
  revoked_by_email text,
  issued_at timestamptz not null default now(),
  download_count integer not null default 0 check (download_count >= 0),
  first_downloaded_at timestamptz,
  last_downloaded_at timestamptz,
  email_status text not null default 'draft'
    check (email_status in ('draft', 'sending', 'sent', 'failed')),
  send_count integer not null default 0 check (send_count >= 0),
  last_sent_at timestamptz,
  last_provider_message_id text,
  last_error text,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_attendee_certificates_edition_registration
  on public.attendee_certificates (edition, registration_id)
  where registration_id is not null;
create index if not exists idx_attendee_certificates_edition_email
  on public.attendee_certificates (edition, lower(email));

-- Every change to a certificate, including each download and name change.
create table if not exists public.attendee_certificate_events (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null
    references public.attendee_certificates(id) on delete cascade,
  event_type text not null
    check (event_type in ('issued', 'emailed', 'email_failed', 'link_reissued',
      'name_changed', 'downloaded', 'revoked', 'reinstated')),
  detail jsonb not null default '{}'::jsonb,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendee_certificate_events_certificate
  on public.attendee_certificate_events (certificate_id, created_at desc);

-- A delivery row is the durable send attempt; its id is the Resend
-- idempotency key, created before contacting the provider.
create table if not exists public.attendee_certificate_deliveries (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null
    references public.attendee_certificates(id) on delete cascade,
  delivery_status text not null
    check (delivery_status in ('sending', 'accepted', 'failed')),
  recipient_email text not null,
  request_sha256 text,
  provider_message_id text,
  failure_reason text,
  actor_clerk_id text,
  actor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_attendee_certificate_deliveries_certificate
  on public.attendee_certificate_deliveries (certificate_id, created_at desc);
create unique index if not exists idx_attendee_certificate_one_active_send
  on public.attendee_certificate_deliveries (certificate_id)
  where delivery_status = 'sending';

alter table public.attendee_certificates enable row level security;
alter table public.attendee_certificate_events enable row level security;
alter table public.attendee_certificate_deliveries enable row level security;

drop policy if exists "Deny attendee certificates api access" on public.attendee_certificates;
create policy "Deny attendee certificates api access"
  on public.attendee_certificates for all to anon, authenticated
  using (false) with check (false);
drop policy if exists "Deny attendee certificate events api access" on public.attendee_certificate_events;
create policy "Deny attendee certificate events api access"
  on public.attendee_certificate_events for all to anon, authenticated
  using (false) with check (false);
drop policy if exists "Deny attendee certificate deliveries api access" on public.attendee_certificate_deliveries;
create policy "Deny attendee certificate deliveries api access"
  on public.attendee_certificate_deliveries for all to anon, authenticated
  using (false) with check (false);

revoke all on public.attendee_certificates, public.attendee_certificate_events,
  public.attendee_certificate_deliveries from anon, authenticated;
grant select, insert, update, delete on public.attendee_certificates,
  public.attendee_certificate_events, public.attendee_certificate_deliveries
  to service_role;

-- Everyone eligible for an attendee certificate: confirmed, checked in on at
-- least one day, and not a speaker. Walk-ins live in spot_registrations and
-- are never in this list.
create or replace view public.attendee_certificate_eligible
with (security_invoker = true) as
select r.id as registration_id, r.first_name, r.last_name, r.email,
  r.organization, r.attended_days, r.checked_in_at
from public.event_registrations r
where r.status = 'confirmed'
  and (r.checked_in_at is not null or cardinality(r.attended_days) > 0)
  and r.speaker_flag = false
  and r.priority_tier <> 'Speakers'
  and r.source <> 'tasi-2026-speaker-import';

revoke all on public.attendee_certificate_eligible from anon, authenticated;
grant select on public.attendee_certificate_eligible to service_role;

create or replace function public.claim_attendee_certificate_send(
  p_certificate_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_clerk_id text,
  p_actor_email text
)
returns public.attendee_certificate_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_cert public.attendee_certificates;
  v_attempt public.attendee_certificate_deliveries;
begin
  update public.attendee_certificates
  set email_status = 'sending', last_error = null, updated_at = now()
  where id = p_certificate_id
    and status = 'active'
    and email_status in ('draft', 'sent', 'failed')
    and updated_at = p_expected_updated_at
  returning * into v_cert;
  if not found then
    raise exception 'Certificate changed or is already being sent.' using errcode = 'P0001';
  end if;

  insert into public.attendee_certificate_deliveries (
    certificate_id, delivery_status, recipient_email, actor_clerk_id, actor_email
  ) values (
    v_cert.id, 'sending', v_cert.email, p_actor_clerk_id, p_actor_email
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_attendee_certificate_send(
  p_attempt_id uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns public.attendee_certificates
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attempt public.attendee_certificate_deliveries;
  v_cert public.attendee_certificates;
  v_now timestamptz := now();
begin
  if p_outcome is null or p_outcome not in ('accepted', 'failed') then
    raise exception 'Invalid certificate send outcome.' using errcode = '22023';
  end if;
  if p_outcome = 'accepted' and nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Accepted certificate send requires a provider message ID.' using errcode = '22023';
  end if;

  select * into v_attempt from public.attendee_certificate_deliveries
  where id = p_attempt_id for update;
  if not found then
    raise exception 'Certificate send attempt not found.' using errcode = 'P0002';
  end if;
  if v_attempt.delivery_status = 'accepted' and p_outcome = 'accepted'
    and v_attempt.provider_message_id = p_provider_message_id then
    select * into v_cert from public.attendee_certificates where id = v_attempt.certificate_id;
    return v_cert;
  end if;
  if v_attempt.delivery_status <> 'sending' then
    raise exception 'Certificate send attempt is already resolved.' using errcode = 'P0001';
  end if;

  update public.attendee_certificates
  set email_status = case when p_outcome = 'accepted' then 'sent' else 'failed' end,
      send_count = send_count + case when p_outcome = 'accepted' then 1 else 0 end,
      last_sent_at = case when p_outcome = 'accepted' then v_now else last_sent_at end,
      last_provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else last_provider_message_id end,
      last_error = case when p_outcome = 'accepted' then null else left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) end,
      updated_at = v_now
  where id = v_attempt.certificate_id and email_status = 'sending'
  returning * into v_cert;
  if not found then
    raise exception 'Certificate is no longer sending.' using errcode = 'P0001';
  end if;

  update public.attendee_certificate_deliveries
  set delivery_status = p_outcome,
      provider_message_id = case when p_outcome = 'accepted' then p_provider_message_id else null end,
      failure_reason = case when p_outcome = 'failed' then left(coalesce(p_failure_reason, 'Email was not sent.'), 1000) else null end,
      updated_at = v_now
  where id = p_attempt_id;

  insert into public.attendee_certificate_events (certificate_id, event_type, detail, actor_email)
  values (v_cert.id, case when p_outcome = 'accepted' then 'emailed' else 'email_failed' end,
    jsonb_build_object('attempt_id', p_attempt_id), v_attempt.actor_email);
  return v_cert;
end;
$$;

-- A name change by the attendee: at most two, each one logged.
create or replace function public.change_attendee_certificate_name(
  p_token_hash text,
  p_new_name text
)
returns public.attendee_certificates
language plpgsql security invoker set search_path = ''
as $$
declare
  v_cert public.attendee_certificates;
  v_old text;
begin
  select * into v_cert from public.attendee_certificates
  where claim_token_hash = p_token_hash for update;
  if not found then
    raise exception 'Certificate not found.' using errcode = 'P0002';
  end if;
  if v_cert.status <> 'active' then
    raise exception 'This certificate is no longer active.' using errcode = 'P0001';
  end if;
  if v_cert.recipient_name = p_new_name then
    return v_cert;
  end if;
  if v_cert.name_change_count >= 2 then
    raise exception 'This name has already been changed twice. Write to us to change it again.' using errcode = 'P0001';
  end if;
  v_old := v_cert.recipient_name;
  update public.attendee_certificates
  set recipient_name = p_new_name, name_change_count = name_change_count + 1, updated_at = now()
  where id = v_cert.id
  returning * into v_cert;
  insert into public.attendee_certificate_events (certificate_id, event_type, detail)
  values (v_cert.id, 'name_changed', jsonb_build_object('from', v_old, 'to', p_new_name));
  return v_cert;
end;
$$;

revoke all on function public.claim_attendee_certificate_send(uuid, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.finish_attendee_certificate_send(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.change_attendee_certificate_name(text, text) from public, anon, authenticated;
grant execute on function public.claim_attendee_certificate_send(uuid, timestamptz, text, text) to service_role;
grant execute on function public.finish_attendee_certificate_send(uuid, text, text, text) to service_role;
grant execute on function public.change_attendee_certificate_name(text, text) to service_role;

notify pgrst, 'reload schema';
