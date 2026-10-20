-- Keep this migration in sync with the attendee certificates section in schema.sql.
-- One reminder email for attendees who were emailed but have not downloaded.
-- The database enforces the rules, so a double click or two open admin tabs
-- can never remind someone twice.
alter table public.attendee_certificates
  add column if not exists reminder_count integer not null default 0
    check (reminder_count between 0 and 1),
  add column if not exists last_reminded_at timestamptz;

alter table public.attendee_certificate_deliveries
  add column if not exists kind text not null default 'certificate'
    check (kind in ('certificate', 'reminder'));

alter table public.attendee_certificate_events
  drop constraint if exists attendee_certificate_events_event_type_check;
alter table public.attendee_certificate_events
  add constraint attendee_certificate_events_event_type_check
  check (event_type in ('issued', 'emailed', 'email_failed', 'link_reissued',
    'name_changed', 'name_confirmed', 'code_sent', 'code_verified',
    'code_failed', 'reminded', 'downloaded', 'revoked', 'reinstated'));

drop function if exists public.claim_attendee_certificate_send(uuid, timestamptz, text, text);

create or replace function public.claim_attendee_certificate_send(
  p_certificate_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_clerk_id text,
  p_actor_email text,
  p_kind text default 'certificate'
)
returns public.attendee_certificate_deliveries
language plpgsql security invoker set search_path = ''
as $$
declare
  v_cert public.attendee_certificates;
  v_attempt public.attendee_certificate_deliveries;
begin
  if p_kind is null or p_kind not in ('certificate', 'reminder') then
    raise exception 'Invalid certificate send kind.' using errcode = '22023';
  end if;

  update public.attendee_certificates
  set email_status = 'sending', last_error = null, updated_at = now()
  where id = p_certificate_id
    and status = 'active'
    and updated_at = p_expected_updated_at
    and (
      (p_kind = 'certificate' and email_status in ('draft', 'sent', 'failed'))
      or (p_kind = 'reminder' and email_status = 'sent'
        and download_count = 0 and reminder_count = 0)
    )
  returning * into v_cert;
  if not found then
    raise exception 'Certificate changed or is already being sent.' using errcode = 'P0001';
  end if;

  insert into public.attendee_certificate_deliveries (
    certificate_id, delivery_status, recipient_email, actor_clerk_id, actor_email, kind
  ) values (
    v_cert.id, 'sending', v_cert.email, p_actor_clerk_id, p_actor_email, p_kind
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
  v_reminder boolean;
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
  v_reminder := v_attempt.kind = 'reminder';

  -- A failed reminder leaves the certificate as sent: the first email still
  -- reached them, and the reminder can be tried again.
  update public.attendee_certificates
  set email_status = case
        when p_outcome = 'accepted' or v_reminder then 'sent' else 'failed' end,
      send_count = send_count + case when p_outcome = 'accepted' then 1 else 0 end,
      reminder_count = reminder_count
        + case when p_outcome = 'accepted' and v_reminder then 1 else 0 end,
      last_reminded_at = case
        when p_outcome = 'accepted' and v_reminder then v_now else last_reminded_at end,
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
  values (v_cert.id,
    case when p_outcome = 'failed' then 'email_failed'
      when v_reminder then 'reminded' else 'emailed' end,
    jsonb_build_object('attempt_id', p_attempt_id, 'kind', v_attempt.kind),
    v_attempt.actor_email);
  return v_cert;
end;
$$;

revoke all on function public.claim_attendee_certificate_send(uuid, timestamptz, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_attendee_certificate_send(uuid, timestamptz, text, text, text) to service_role;
revoke all on function public.finish_attendee_certificate_send(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.finish_attendee_certificate_send(uuid, text, text, text) to service_role;

notify pgrst, 'reload schema';
