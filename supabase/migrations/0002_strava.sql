-- Stride Coach — Strava import support.
-- Strava activity ids come in as 'strava-<id>' (deterministic → idempotent re-import,
-- no duplicate rows). Widen activities.id from uuid to text so both the app's own
-- uuid ids and the strava-prefixed ids share one primary key. Safe + reversible.

alter table activities alter column id type text using id::text;
