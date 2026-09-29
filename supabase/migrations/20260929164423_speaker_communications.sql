-- Keep this migration in sync with the speaker communications section in schema.sql.
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

notify pgrst, 'reload schema';
