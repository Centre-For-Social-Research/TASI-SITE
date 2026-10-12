-- Keep this migration in sync with the public form settings section in schema.sql.
-- Admins open or close each public form from Settings. A form with no row
-- here is open. form_setting_changes keeps every toggle for the audit trail.
create table if not exists public.form_settings (
  form_key text primary key check (
    form_key in (
      'registration',
      'speaker_application',
      'volunteer_application',
      'media_accreditation',
      'exhibition_enquiry'
    )
  ),
  is_open boolean not null default true,
  updated_by_email text,
  updated_at timestamptz not null default now()
);

create table if not exists public.form_setting_changes (
  id bigint generated always as identity primary key,
  form_key text not null,
  is_open boolean not null,
  changed_by_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_setting_changes_created
  on public.form_setting_changes (created_at desc, id desc);

alter table public.form_settings enable row level security;
alter table public.form_setting_changes enable row level security;

grant select, insert, update, delete on public.form_settings to service_role;
grant select, insert, update, delete on public.form_setting_changes to service_role;
grant usage, select on all sequences in schema public to service_role;

notify pgrst, 'reload schema';
