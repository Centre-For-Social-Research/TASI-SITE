-- Keep this migration in sync with the speaker photo links section in schema.sql.
-- Personal touches for the speaker photo email: the sessions they spoke in,
-- one line they said on stage, and one featured photo shown in the email.
alter table public.speaker_photo_links
  add column if not exists session_titles text[] not null default '{}'
    check (cardinality(session_titles) <= 5),
  add column if not exists quote text
    check (quote is null or char_length(quote) <= 400),
  add column if not exists featured_photo_path text,
  add column if not exists featured_photo_sha256 text;

-- Featured photos stay private; the server embeds them in the email.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaker-photo-picks', 'speaker-photo-picks', false, 3145728, array['image/jpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
