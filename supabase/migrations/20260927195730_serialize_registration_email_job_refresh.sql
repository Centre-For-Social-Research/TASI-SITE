-- Recompute registration email job counters under a parent-row lock. A second
-- worker waits, then reads the latest item states before writing its summary.
create or replace function public.refresh_registration_email_job(p_job_id uuid)
returns setof public.registration_email_jobs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_job public.registration_email_jobs%rowtype;
  v_total integer;
  v_queued integer;
  v_processing integer;
  v_sent integer;
  v_failed integer;
  v_retrying integer;
  v_status text;
begin
  select * into v_job
  from public.registration_email_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'Registration email job % not found', p_job_id
      using errcode = 'P0002';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status = 'queued')::integer,
    count(*) filter (where status = 'processing')::integer,
    count(*) filter (where status = 'sent')::integer,
    count(*) filter (where status = 'failed')::integer,
    count(*) filter (where status = 'retrying')::integer
  into v_total, v_queued, v_processing, v_sent, v_failed, v_retrying
  from public.registration_email_job_items
  where job_id = p_job_id;

  v_status := case
    when v_processing > 0 or v_retrying > 0 then 'processing'
    when v_queued > 0 then 'queued'
    when v_failed > 0 then 'failed'
    else 'completed'
  end;

  update public.registration_email_jobs
  set total_items = v_total,
      queued_items = v_queued,
      processing_items = v_processing,
      sent_items = v_sent,
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

revoke all on function public.refresh_registration_email_job(uuid) from public, anon, authenticated;
grant execute on function public.refresh_registration_email_job(uuid) to service_role;

-- Use item state for recovery when insertion succeeded but a counter refresh did not.
create or replace function public.get_next_registration_email_job(p_created_after timestamptz)
returns setof public.registration_email_jobs
language sql
stable
security invoker
set search_path = ''
as $$
  select job.*
  from public.registration_email_jobs as job
  where job.created_at >= p_created_after
    and exists (
      select 1
      from public.registration_email_job_items as item
      where item.job_id = job.id
        and item.status in ('queued', 'retrying')
    )
  order by job.created_at asc
  limit 1;
$$;

revoke all on function public.get_next_registration_email_job(timestamptz) from public, anon, authenticated;
grant execute on function public.get_next_registration_email_job(timestamptz) to service_role;

notify pgrst, 'reload schema';
