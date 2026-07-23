-- Strivon — table privileges for the Supabase auth roles.
-- RLS policies restrict WHICH rows; these GRANTs allow the role to touch the table at all.
-- (Raw-SQL tables don't auto-grant like dashboard-created ones do.)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profile_state  to authenticated;
grant select, insert, delete            on public.community_posts to authenticated;
grant select                            on public.community_posts to anon;          -- anonymous feed read
grant insert                            on public.route_prints    to authenticated;
grant insert                            on public.post_reports    to authenticated;
grant execute on function public.route_popularity(text) to anon, authenticated;
