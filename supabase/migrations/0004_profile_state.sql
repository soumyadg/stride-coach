-- Strivon — two-profile cloud sync (Run + Walk)
-- Each profile is stored as one JSON blob keyed by (user_id, mode) so both
-- profiles round-trip across devices. Run in the Supabase SQL editor.

create table if not exists profile_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text not null,                 -- 'run' | 'walk'
  data       jsonb not null,                -- full local profile blob (plan, plans, activities, memories, capsules, readiness…)
  updated_at timestamptz default now(),
  primary key (user_id, mode)
);
alter table profile_state enable row level security;
drop policy if exists "own profile_state read"   on profile_state;
drop policy if exists "own profile_state write"   on profile_state;
drop policy if exists "own profile_state update"  on profile_state;
create policy "own profile_state read"   on profile_state for select using (auth.uid() = user_id);
create policy "own profile_state write"  on profile_state for insert with check (auth.uid() = user_id);
create policy "own profile_state update" on profile_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- role privileges (RLS still restricts rows)
grant select, insert, update, delete on profile_state to authenticated;
