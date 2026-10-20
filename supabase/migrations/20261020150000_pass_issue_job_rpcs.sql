-- Keep this migration in sync with the QR pass job RPC section in schema.sql.
-- Creating a QR pass job used to take five sequential calls (list, job,
-- items, read every item status, update counters), and every chunk ended with
-- the same read-then-update refresh. These do each in one transaction.

-- Counts item statuses under a row lock, so overlapping workers (admin tab,
-- after(), cron) never write stale counters. Mirrors
-- refresh_registration_email_job, plus the skipped state QR jobs have.
create or replace function public.refresh_pass_issue_email_job(p_job_id uuid)
returns setof public.pass_issue_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_job public.pass_issue_email_jobs%rowtype;
  v_total integer;
  v_queued integer;
  v_processing integer;
  v_sent integer;
  v_skipped integer;
  v_failed integer;
  v_retrying integer;
  v_status text;
begin
  select * into v_job
  from public.pass_issue_email_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'QR pass job % not found', p_job_id
      using errcode = 'P0002';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status = 'queued')::integer,
    count(*) filter (where status = 'processing')::integer,
    count(*) filter (where status = 'sent')::integer,
    count(*) filter (where status = 'skipped')::integer,
    count(*) filter (where status = 'failed')::integer,
    count(*) filter (where status = 'retrying')::integer
  into v_total, v_queued, v_processing, v_sent, v_skipped, v_failed, v_retrying
  from public.pass_issue_email_job_items
  where job_id = p_job_id;

  v_status := case
    when v_processing > 0 or v_retrying > 0 then 'processing'
    when v_queued > 0 then 'queued'
    when v_failed > 0 then 'failed'
    else 'completed'
  end;

  update public.pass_issue_email_jobs
  set total_items = v_total,
      queued_items = v_queued,
      processing_items = v_processing,
      sent_items = v_sent,
      skipped_items = v_skipped,
      failed_items = v_failed,
      retrying_items = v_retrying,
      status = v_status,
      completed_at = case when v_status in ('failed', 'completed') then clock_timestamp() else null end,
      last_processed_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_job_id
  returning * into v_job;

  return next v_job;
  return;
end;
$$;

revoke all on function public.refresh_pass_issue_email_job(uuid) from public, anon, authenticated;
grant execute on function public.refresh_pass_issue_email_job(uuid) to service_role;

-- Writes the job, one item per still-confirmed registration, and its counters
-- together. Registrations that are no longer confirmed are left out here
-- rather than in a separate lookup.
create or replace function public.create_pass_issue_email_job(
  p_registration_ids uuid[],
  p_selection_mode text,
  p_filters jsonb,
  p_resend_existing boolean,
  p_actor_clerk_id text,
  p_actor_email text,
  p_max_attempts integer default 3
)
returns setof public.pass_issue_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_job_id uuid;
begin
  insert into public.pass_issue_email_jobs (
    status, selection_mode, filters, resend_existing,
    created_by_clerk_id, created_by_email, updated_at
  ) values (
    'queued', p_selection_mode, coalesce(p_filters, '{}'::jsonb),
    coalesce(p_resend_existing, false), p_actor_clerk_id, p_actor_email, v_now
  )
  returning id into v_job_id;

  insert into public.pass_issue_email_job_items (
    job_id, registration_id, status, max_attempts, created_at, updated_at
  )
  select v_job_id, r.id, 'queued', p_max_attempts, v_now, v_now
  from public.event_registrations r
  where r.id = any(coalesce(p_registration_ids, '{}'::uuid[]))
    and r.status = 'confirmed'
  order by r.created_at asc;

  return query select * from public.refresh_pass_issue_email_job(v_job_id);
end;
$$;

revoke all on function public.create_pass_issue_email_job(uuid[], text, jsonb, boolean, text, text, integer) from public, anon, authenticated;
grant execute on function public.create_pass_issue_email_job(uuid[], text, jsonb, boolean, text, text, integer) to service_role;

notify pgrst, 'reload schema';
