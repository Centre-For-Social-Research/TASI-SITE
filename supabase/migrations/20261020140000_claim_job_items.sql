-- Keep this migration in sync with the job item claim section in schema.sql.
-- Claiming a chunk of email job items used to be one SELECT plus one UPDATE
-- per item. These claim the whole chunk in one statement; SKIP LOCKED lets the
-- cron drain and an after() worker run side by side without taking the same
-- item twice.

create or replace function public.claim_registration_email_job_items(
  p_job_id uuid,
  p_limit integer default 20
)
returns setof public.registration_email_job_items
language sql
security invoker
set search_path = ''
as $$
  with picked as (
    select id
    from public.registration_email_job_items
    where job_id = p_job_id
      and status in ('queued', 'retrying')
    order by created_at asc
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.registration_email_job_items item
  set status = 'processing',
      attempt_count = item.attempt_count + 1,
      last_attempt_at = clock_timestamp(),
      updated_at = clock_timestamp()
  from picked
  where item.id = picked.id
  returning item.*;
$$;

revoke all on function public.claim_registration_email_job_items(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_registration_email_job_items(uuid, integer) to service_role;

create or replace function public.claim_pass_issue_email_job_items(
  p_job_id uuid,
  p_limit integer default 20
)
returns setof public.pass_issue_email_job_items
language sql
security invoker
set search_path = ''
as $$
  with picked as (
    select id
    from public.pass_issue_email_job_items
    where job_id = p_job_id
      and status in ('queued', 'retrying')
    order by created_at asc
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.pass_issue_email_job_items item
  set status = 'processing',
      attempt_count = item.attempt_count + 1,
      last_attempt_at = clock_timestamp(),
      updated_at = clock_timestamp()
  from picked
  where item.id = picked.id
  returning item.*;
$$;

revoke all on function public.claim_pass_issue_email_job_items(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_pass_issue_email_job_items(uuid, integer) to service_role;

notify pgrst, 'reload schema';
