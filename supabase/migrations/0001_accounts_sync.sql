-- Stride Coach — accounts + cloud sync (backend #1)
-- Run in the Supabase SQL editor (or `supabase db push`). Idempotent-ish; safe on a fresh project.

-- ---------- tables ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  goal text, goal_name text, weeks int, days_per_week int,
  experience text, pref text,
  max_hr int default 190,
  height_cm int,
  weight_kg numeric,
  units text default 'metric',
  reminders_on boolean default false,
  current_week int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text, goal_name text, weeks int, days int, experience text, pref text,
  start_date date,
  data jsonb not null,            -- == S.plan (weeks incl days/sessions)
  cur_week int default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists plans_user_active_idx on plans (user_id, is_active);

create table if not exists activities (
  id uuid primary key,            -- client-generated → idempotent upsert
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  started_at timestamptz not null,
  duration_s int, distance_km numeric, avg_pace numeric,
  avg_hr int, rpe text, wet_bulb numeric,
  source text default 'gps',
  route jsonb,
  created_at timestamptz default now()
);
create index if not exists activities_user_time_idx on activities (user_id, started_at desc);

create table if not exists readiness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int, level text,
  logged_on date not null,
  created_at timestamptz default now(),
  unique (user_id, logged_on)
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text, push_token text,
  last_seen timestamptz default now(),
  unique (user_id, push_token)
);

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text default 'free',
  store text, status text,
  current_period_end timestamptz,
  raw jsonb,
  updated_at timestamptz default now()
);

create table if not exists integrations (
  user_id uuid references auth.users(id) on delete cascade,
  provider text,
  access_token text, refresh_token text, expires_at timestamptz,
  athlete_id text,
  updated_at timestamptz default now(),
  primary key (user_id, provider)
);

-- ---------- updated_at auto-touch ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists t_profiles on profiles;
create trigger t_profiles before update on profiles for each row execute function set_updated_at();
drop trigger if exists t_plans on plans;
create trigger t_plans before update on plans for each row execute function set_updated_at();
drop trigger if exists t_subs on subscriptions;
create trigger t_subs before update on subscriptions for each row execute function set_updated_at();

-- ---------- auto-create a profile + free subscription on signup ----------
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
    on conflict (id) do nothing;
  insert into public.subscriptions (user_id, tier, status) values (new.id, 'free', 'active')
    on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Row-Level Security ----------
alter table profiles       enable row level security;
alter table plans          enable row level security;
alter table activities     enable row level security;
alter table readiness_logs enable row level security;
alter table devices        enable row level security;
alter table subscriptions  enable row level security;
alter table integrations   enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- one policy per user-owned table (user_id = auth.uid())
do $$
declare t text;
begin
  foreach t in array array['plans','activities','readiness_logs','devices','subscriptions'] loop
    execute format('drop policy if exists "own rows" on %I;', t);
    execute format('create policy "own rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- integrations: user can read connection status; tokens written only by edge functions (service_role bypasses RLS)
drop policy if exists "own integration status" on integrations;
create policy "own integration status" on integrations for select using (auth.uid() = user_id);
