-- Run this in Supabase → SQL Editor, once per project.

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

-- Allow anyone (anon key) to INSERT their email, but not read the list back.
create policy "anyone can join the waitlist"
  on waitlist for insert
  to anon
  with check (true);

-- No select policy is created on purpose: the public site can add emails,
-- only you (via the Supabase dashboard, using your own login) can read them.
