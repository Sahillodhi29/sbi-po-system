-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key     text not null,
  value   jsonb not null,
  t       bigint not null default 0,   -- client timestamp (ms) used to resolve sync conflicts
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

drop policy if exists "owner full access" on public.user_data;
create policy "owner full access" on public.user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
