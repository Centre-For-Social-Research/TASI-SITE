-- Keep this migration in sync with the registration review RPC section in schema.sql.
-- A review click used to make eight sequential PostgREST calls (read, update,
-- history, notification, job, item, counter refresh). The app now reads one
-- snapshot, works out each row's new review fields, and calls
-- apply_registration_reviews once: every update, history row, notification
-- and email job item is written in a single transaction.

-- Same shape as baseRegistrationSelect() in src/lib/registration-db.js.
create or replace function public.registration_admin_json(r public.event_registrations)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', r.id,
    'registration_code', r.registration_code,
    'first_name', r.first_name,
    'last_name', r.last_name,
    'email', r.email,
    'phone', r.phone,
    'organization', r.organization,
    'designation', r.designation,
    'attendee_category', r.attendee_category,
    'city', r.city,
    'country', r.country,
    'linkedin_url', r.linkedin_url,
    'attendance_reason', r.attendance_reason,
    'priority_tier', r.priority_tier,
    'source', r.source,
    'status', r.status,
    'speaker_flag', r.speaker_flag,
    'vip_flag', r.vip_flag,
    'exception_badge_required', r.exception_badge_required,
    'badge_color_label', r.badge_color_label,
    'badge_color_hex', r.badge_color_hex,
    'profile_photo_path', r.profile_photo_path,
    'profile_photo_size_bytes', r.profile_photo_size_bytes,
    'profile_photo_width', r.profile_photo_width,
    'profile_photo_height', r.profile_photo_height,
    'qr_pass_issued_at', r.qr_pass_issued_at,
    'checked_in_at', r.checked_in_at,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'reviewed_at', r.reviewed_at,
    'reviewed_by_clerk_id', r.reviewed_by_clerk_id,
    'reviewed_by_email', r.reviewed_by_email,
    'review_notes', r.review_notes,
    'last_badge_export_batch_id', r.last_badge_export_batch_id
  ) || jsonb_build_object(
    'entry_passes', (
      select jsonb_build_object(
        'id', p.id,
        'token', p.token,
        'status', p.status,
        'issued_at', p.issued_at,
        'revoked_at', p.revoked_at
      )
      from public.entry_passes p
      where p.registration_id = r.id
    ),
    'registration_daily_check_ins', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_day', c.event_day,
        'checked_in_at', c.checked_in_at,
        'desk_label', c.desk_label,
        'actor_email', c.actor_email
      ) order by c.event_day)
      from public.registration_daily_check_ins c
      where c.registration_id = r.id
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.registration_admin_json(public.event_registrations) from public, anon, authenticated;
grant execute on function public.registration_admin_json(public.event_registrations) to service_role;

-- p_items: [{ id, expected_updated_at, review_notes, speaker_flag, vip_flag,
--             badge_color_label, badge_color_hex }]
-- A row whose updated_at no longer matches expected_updated_at is skipped and
-- reported in conflict_ids, so a stale snapshot never overwrites newer work.
create or replace function public.apply_registration_reviews(
  p_items jsonb,
  p_status text,
  p_exception_badge_required boolean,
  p_history_notes text,
  p_actor_clerk_id text,
  p_actor_email text,
  p_max_attempts integer default 3
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_item jsonb;
  v_id uuid;
  v_previous text;
  v_updated uuid[] := '{}';
  v_previous_statuses jsonb := '{}'::jsonb;
  v_conflicts text[] := '{}';
  v_email_ids uuid[] := '{}';
  v_email_count integer;
  v_job_id uuid;
begin
  if p_status not in ('pending', 'confirmed', 'waitlisted', 'rejected') then
    raise exception 'Unsupported registration status %', p_status
      using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_id := (v_item ->> 'id')::uuid;

    select status into v_previous
    from public.event_registrations
    where id = v_id
      and updated_at = (v_item ->> 'expected_updated_at')::timestamptz
    for update;

    if not found then
      v_conflicts := v_conflicts || v_id::text;
      continue;
    end if;

    update public.event_registrations
    set status = p_status,
        review_notes = nullif(v_item ->> 'review_notes', ''),
        speaker_flag = coalesce((v_item ->> 'speaker_flag')::boolean, false),
        vip_flag = coalesce((v_item ->> 'vip_flag')::boolean, false),
        badge_color_label = v_item ->> 'badge_color_label',
        badge_color_hex = v_item ->> 'badge_color_hex',
        reviewed_at = v_now,
        reviewed_by_clerk_id = p_actor_clerk_id,
        reviewed_by_email = p_actor_email,
        exception_badge_required = p_exception_badge_required,
        updated_at = v_now
    where id = v_id;

    insert into public.registration_status_history (
      registration_id, previous_status, next_status, action_type, notes,
      actor_clerk_id, actor_email, created_at
    ) values (
      v_id, v_previous, p_status, 'status_updated', nullif(p_history_notes, ''),
      p_actor_clerk_id, p_actor_email, v_now
    );

    v_updated := v_updated || v_id;
    v_previous_statuses := v_previous_statuses || jsonb_build_object(v_id::text, v_previous);

    -- Mirrors getReviewEmailTemplate in registration-review-email.cjs.
    if p_status in ('confirmed', 'waitlisted', 'rejected')
      and v_previous is distinct from p_status then
      v_email_ids := v_email_ids || v_id;
    end if;
  end loop;

  v_email_count := coalesce(array_length(v_email_ids, 1), 0);

  if v_email_count > 0 then
    insert into public.registration_email_jobs (
      status, template_type, total_items, queued_items,
      created_by_clerk_id, created_by_email, last_processed_at, updated_at
    ) values (
      'queued', p_status, v_email_count, v_email_count,
      p_actor_clerk_id, p_actor_email, v_now, v_now
    )
    returning id into v_job_id;

    with notifications as (
      insert into public.registration_notifications (
        registration_id, template_type, recipient_email, delivery_status,
        actor_clerk_id, actor_email, created_at, updated_at
      )
      select r.id, p_status, r.email, 'queued',
        p_actor_clerk_id, p_actor_email, v_now, v_now
      from public.event_registrations r
      where r.id = any(v_email_ids)
      returning id, registration_id
    )
    insert into public.registration_email_job_items (
      job_id, registration_id, notification_id, template_type, status,
      max_attempts, created_at, updated_at
    )
    select v_job_id, n.registration_id, n.id, p_status, 'queued',
      p_max_attempts, v_now, v_now
    from notifications n;
  end if;

  return jsonb_build_object(
    'registrations', coalesce((
      select jsonb_agg(public.registration_admin_json(r))
      from public.event_registrations r
      where r.id = any(v_updated)
    ), '[]'::jsonb),
    'previous_statuses', v_previous_statuses,
    'conflict_ids', to_jsonb(v_conflicts),
    'job_id', v_job_id,
    'email_count', v_email_count
  );
end;
$$;

revoke all on function public.apply_registration_reviews(jsonb, text, boolean, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.apply_registration_reviews(jsonb, text, boolean, text, text, text, integer) to service_role;

notify pgrst, 'reload schema';
