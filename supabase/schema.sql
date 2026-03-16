create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  status text not null default 'active',
  source text,
  subscribed_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  email text not null,
  message text not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Deny all newsletter anon" on public.newsletter_subscribers;
drop policy if exists "Deny all contact anon" on public.contact_messages;
drop policy if exists "Allow newsletter insert" on public.newsletter_subscribers;
drop policy if exists "Allow message insert" on public.contact_messages;

create policy "Allow newsletter insert"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (true);

create policy "Allow message insert"
on public.contact_messages
for insert
to anon, authenticated
with check (true);