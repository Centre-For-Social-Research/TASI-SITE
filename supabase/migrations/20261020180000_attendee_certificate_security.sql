-- Keep this migration in sync with the attendee certificates section in schema.sql.
-- Claim security for attendee certificates:
--  * download links expire (token_expires_at);
--  * opening a link needs a one-time code sent to the attendee's email;
--  * the attendee confirms their name once, after which it is locked;
--  * the SHA-256 of the issued PDF is kept so a file can be checked later.
alter table public.attendee_certificates
  add column if not exists token_expires_at timestamptz,
  add column if not exists name_confirmed_at timestamptz,
  add column if not exists pdf_sha256 text;

create index if not exists idx_attendee_certificates_pdf_sha256
  on public.attendee_certificates (pdf_sha256)
  where pdf_sha256 is not null;

-- One-time email codes. Only a hash of each code is stored.
create table if not exists public.attendee_certificate_codes (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null
    references public.attendee_certificates(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 10),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendee_certificate_codes_certificate
  on public.attendee_certificate_codes (certificate_id, created_at desc);

alter table public.attendee_certificate_codes enable row level security;
drop policy if exists "Deny attendee certificate codes api access" on public.attendee_certificate_codes;
create policy "Deny attendee certificate codes api access"
  on public.attendee_certificate_codes for all to anon, authenticated
  using (false) with check (false);
revoke all on public.attendee_certificate_codes from anon, authenticated;
grant select, insert, update, delete on public.attendee_certificate_codes to service_role;

alter table public.attendee_certificate_events
  drop constraint if exists attendee_certificate_events_event_type_check;
alter table public.attendee_certificate_events
  add constraint attendee_certificate_events_event_type_check
  check (event_type in ('issued', 'emailed', 'email_failed', 'link_reissued',
    'name_changed', 'name_confirmed', 'code_sent', 'code_verified',
    'code_failed', 'downloaded', 'revoked', 'reinstated'));

-- Attendee name edits are allowed only until the name is confirmed.
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
  if v_cert.name_confirmed_at is not null then
    raise exception 'Your name is already confirmed. Write to tasi.comms@csrindia.org to change it.' using errcode = 'P0001';
  end if;
  if v_cert.recipient_name = p_new_name then
    return v_cert;
  end if;
  if v_cert.name_change_count >= 2 then
    raise exception 'This name has already been changed twice. Write to tasi.comms@csrindia.org to change it again.' using errcode = 'P0001';
  end if;
  v_old := v_cert.recipient_name;
  update public.attendee_certificates
  set recipient_name = p_new_name, name_change_count = name_change_count + 1,
      pdf_sha256 = null, updated_at = now()
  where id = v_cert.id
  returning * into v_cert;
  insert into public.attendee_certificate_events (certificate_id, event_type, detail)
  values (v_cert.id, 'name_changed', jsonb_build_object('from', v_old, 'to', p_new_name));
  return v_cert;
end;
$$;

-- Locks the name. The PDF fingerprint is stored on first download.
create or replace function public.confirm_attendee_certificate_name(
  p_token_hash text
)
returns public.attendee_certificates
language plpgsql security invoker set search_path = ''
as $$
declare
  v_cert public.attendee_certificates;
begin
  update public.attendee_certificates
  set name_confirmed_at = coalesce(name_confirmed_at, now()), updated_at = now()
  where claim_token_hash = p_token_hash and status = 'active'
  returning * into v_cert;
  if not found then
    raise exception 'Certificate not found.' using errcode = 'P0002';
  end if;
  insert into public.attendee_certificate_events (certificate_id, event_type, detail)
  values (v_cert.id, 'name_confirmed', jsonb_build_object('name', v_cert.recipient_name));
  return v_cert;
end;
$$;

revoke all on function public.confirm_attendee_certificate_name(text) from public, anon, authenticated;
grant execute on function public.confirm_attendee_certificate_name(text) to service_role;

notify pgrst, 'reload schema';
