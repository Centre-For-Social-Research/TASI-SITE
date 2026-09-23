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
  if p_outcome not in ('accepted', 'failed') then
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
notify pgrst, 'reload schema';
