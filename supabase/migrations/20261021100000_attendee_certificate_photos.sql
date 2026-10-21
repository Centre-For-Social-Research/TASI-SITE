-- Keep this migration in sync with the attendee certificates section in schema.sql.
-- Each attendee's festival photo folder (a Google Drive link), added to their
-- certificate email. Keyed by registration so it is ready before or after the
-- certificate is issued. Attendees without a row get the email without photos.
create table if not exists public.attendee_certificate_photos (
  registration_id uuid primary key,
  edition text not null default '2026',
  folder_url text not null
    check (folder_url ~ '^https://drive\.google\.com/drive/folders/[A-Za-z0-9_-]+$'),
  photo_count integer not null check (photo_count > 0),
  created_at timestamptz not null default now()
);

alter table public.attendee_certificate_photos enable row level security;
drop policy if exists "Deny attendee certificate photos api access" on public.attendee_certificate_photos;
create policy "Deny attendee certificate photos api access"
  on public.attendee_certificate_photos for all to anon, authenticated
  using (false) with check (false);
revoke all on public.attendee_certificate_photos from anon, authenticated;
grant select, insert, update, delete on public.attendee_certificate_photos to service_role;

notify pgrst, 'reload schema';
