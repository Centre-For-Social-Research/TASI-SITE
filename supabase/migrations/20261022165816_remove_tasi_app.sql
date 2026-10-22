-- Remove everything TASi-App added to the shared Supabase project. The app
-- plan is dropped and the website never used these objects. A full dump taken
-- before this migration (2026-10-22) holds their definitions and data.
--
-- Order matters. Postgres does not track function bodies as dependencies, so
-- the app triggers on event_registrations must go before the tables they
-- write to; otherwise every registration insert or update would fail.

-- 1. App hooks on the website's registrations table.
drop policy if exists "registrations: attendee can read own badge" on public.event_registrations;
drop trigger if exists event_registrations_role_sync on public.event_registrations;
drop trigger if exists event_registrations_push_confirmed on public.event_registrations;

-- 2. App views, then app tables. Dropping a table also drops its triggers,
-- policies and realtime publication entry.
drop view if exists public.v_directory;
drop view if exists public.v_user_full;

drop table if exists
  public.networking_messages,
  public.networking_reports,
  public.connections,
  public.networking_consents,
  public.networking_consent,
  public.session_qa_upvotes,
  public.session_qa,
  public.session_poll_votes,
  public.session_polls,
  public.saved_sessions,
  public.user_bookmarks,
  public.user_push_tokens,
  public.notification_jobs,
  public.speaker_emails,
  public.profiles,
  public.app_feedback,
  public.app_config,
  public.app_rate_limits;

-- 3. App functions. None of them is called by the website.
drop function if exists public.event_registrations_push_confirmed();
drop function if exists public.event_registrations_sync_profile_role();
drop function if exists public.networking_messages_push_trigger();
drop function if exists public.notify_push(text[], text, text, jsonb, text);
drop function if exists public.enqueue_notification_job(text[], text, text, jsonb, text);
drop function if exists public.wake_push_fanout_queue();
drop function if exists public.profiles_autolink_speaker_trigger();
drop function if exists public.profiles_set_role_trigger();
drop function if exists public.profiles_set_updated_at();
drop function if exists public.speaker_emails_sync_existing_profile();
drop function if exists public.speaker_emails_set_updated_at();
drop function if exists public.session_qa_upvotes_recount();
drop function if exists public.user_push_tokens_handoff_before_write();
drop function if exists public.compute_role_value(text, text, boolean, text);
drop function if exists public.clerk_user_id();
drop function if exists public.clerk_role();

-- 4. Chat attachment storage policies. The bucket and its files are removed
-- through the Storage API, since storage objects cannot be deleted in SQL.
drop policy if exists chat_attach_read on storage.objects;
drop policy if exists chat_attach_upload on storage.objects;
drop policy if exists chat_attach_delete on storage.objects;

-- 5. Push fan-out secrets used only by the app's Edge Function.
delete from vault.secrets where name in ('push_fanout_url', 'push_fanout_secret');
