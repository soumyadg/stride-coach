-- Strivon — Community (anonymous & public feed + route popularity)
-- Run in the Supabase SQL editor (or `supabase db push`). Idempotent-ish.
--
-- Privacy model: PUBLIC READ, but nothing identifies a person. Posts carry no
-- name; locations are stored only as a COARSE region key (~20-40km cell) so we
-- can say "near you" without ever exposing where someone lives. Route popularity
-- is a COUNT only — the API never returns who took a route.

-- ---------- community feed ----------
create table if not exists community_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null default 'share',           -- 'share' | 'birthday' | 'anniversary' | 'route'
  body       text check (body is null or char_length(body) <= 280),
  region     text,                                     -- coarse geohash (~4 chars) for "near you"; NEVER exact
  km         numeric,                                  -- optional activity distance
  created_at timestamptz default now()
);
alter table community_posts enable row level security;
drop policy if exists "public read posts"  on community_posts;
drop policy if exists "insert own posts"   on community_posts;
drop policy if exists "delete own posts"   on community_posts;
create policy "public read posts" on community_posts for select using (true);
create policy "insert own posts"  on community_posts for insert with check (auth.uid() = user_id);
create policy "delete own posts"  on community_posts for delete using (auth.uid() = user_id);
create index if not exists community_posts_created_idx on community_posts (created_at desc);
create index if not exists community_posts_region_idx  on community_posts (region);

-- ---------- route popularity (coarse, anonymous) ----------
create table if not exists route_prints (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  route_key  text not null,                            -- coarse: startGeohash5 + '|' + distanceBucket
  created_at timestamptz default now(),
  unique (user_id, route_key)                          -- one print per user per route
);
alter table route_prints enable row level security;
drop policy if exists "insert own prints" on route_prints;
create policy "insert own prints" on route_prints for insert with check (auth.uid() = user_id);
-- NOTE: no SELECT policy on purpose — rows (which contain user_id) are never
-- readable by clients. Counts come only from the function below.

-- count distinct people on a route — returns a NUMBER, never identities
create or replace function route_popularity(key text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct user_id)::int from route_prints where route_key = key;
$$;
grant execute on function route_popularity(text) to anon, authenticated;

-- ---------- moderation ----------
create table if not exists post_reports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references community_posts(id) on delete cascade,
  reporter   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table post_reports enable row level security;
drop policy if exists "insert reports" on post_reports;
create policy "insert reports" on post_reports for insert with check (auth.uid() = reporter);
