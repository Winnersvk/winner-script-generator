-- Run in the dedicated Winner Script Generator Supabase project.
-- Accounts are provisioned by the owner; public sign-up must be disabled.
create table if not exists public.script_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  title text not null,
  input jsonb not null,
  output jsonb not null
);
create index if not exists script_history_user_created
  on public.script_history(user_id, created_at desc, id);
alter table public.script_history enable row level security;
revoke all on public.script_history from anon;
grant select, insert, delete on public.script_history to authenticated;
create policy history_read_own on public.script_history
  for select to authenticated using ((select auth.uid()) = user_id);
create policy history_insert_own on public.script_history
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy history_delete_own on public.script_history
  for delete to authenticated using ((select auth.uid()) = user_id);
