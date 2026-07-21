// Stride Coach — Strava OAuth + activity import (Pro feature).
// ONE function, three actions:
//   • callback  — browser lands here after Strava consent (?code=&state=<supabase JWT>)
//                 → exchanges code for tokens, stores them, redirects back to the app
//   • import    — app calls with `Authorization: Bearer <supabase JWT>` (POST ?action=import)
//                 → refreshes token if needed, pulls recent runs/walks, upserts into activities
//   • status    — app asks "am I connected?" (GET ?action=status, Bearer JWT)
//
// Deploy with JWT verification OFF — this function verifies the Supabase JWT itself,
// and Strava's redirect carries no JWT at all.
//   supabase functions deploy strava-sync --no-verify-jwt   (or Dashboard → Verify JWT OFF)
// Secrets:  STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, APP_URL
//   (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are auto-provided by Supabase)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID')!;
const CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET')!;
const APP_URL = (Deno.env.get('APP_URL') || 'https://soumyadg.github.io/stride-coach/').replace(/\/?$/, '/');
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const back = (q: string) => Response.redirect(APP_URL + '?strava=' + q, 302);

async function uidFromJwt(jwt: string): Promise<string | null> {
  if (!jwt) return null;
  const { data, error } = await admin.auth.getUser(jwt);
  return error || !data.user ? null : data.user.id;
}

// return a valid (refreshed if needed) Strava access token for this user, or null
async function freshToken(uid: string): Promise<string | null> {
  const { data: row } = await admin.from('integrations')
    .select('*').eq('user_id', uid).eq('provider', 'strava').maybeSingle();
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  const exp = row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : 0;
  if (exp - 120 > now && row.access_token) return row.access_token;   // still valid
  const r = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: row.refresh_token }),
  });
  if (!r.ok) return null;
  const t = await r.json();
  await admin.from('integrations').upsert({
    user_id: uid, provider: 'strava',
    access_token: t.access_token, refresh_token: t.refresh_token,
    expires_at: new Date(t.expires_at * 1000).toISOString(), updated_at: new Date().toISOString(),
  });
  return t.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || (url.searchParams.get('code') || url.searchParams.get('error') ? 'callback' : '');
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

  try {
    // ---------- OAuth callback (browser redirect from Strava) ----------
    if (action === 'callback') {
      if (url.searchParams.get('error') || !url.searchParams.get('code')) return back('denied');
      const uid = await uidFromJwt(url.searchParams.get('state') || '');
      if (!uid) return back('autherror');
      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code: url.searchParams.get('code'), grant_type: 'authorization_code' }),
      });
      if (!r.ok) return back('exchangefail');
      const t = await r.json();
      await admin.from('integrations').upsert({
        user_id: uid, provider: 'strava',
        access_token: t.access_token, refresh_token: t.refresh_token,
        expires_at: new Date(t.expires_at * 1000).toISOString(),
        athlete_id: t.athlete ? String(t.athlete.id) : null, updated_at: new Date().toISOString(),
      });
      return back('connected');
    }

    // ---------- connection status ----------
    if (action === 'status') {
      const uid = await uidFromJwt(bearer);
      if (!uid) return json({ connected: false });
      const { data: row } = await admin.from('integrations')
        .select('athlete_id, updated_at').eq('user_id', uid).eq('provider', 'strava').maybeSingle();
      return json({ connected: !!row, athlete_id: row?.athlete_id || null, updated_at: row?.updated_at || null });
    }

    // ---------- import activities ----------
    if (action === 'import') {
      const uid = await uidFromJwt(bearer);
      if (!uid) return json({ error: 'unauthorized' }, 401);
      const token = await freshToken(uid);
      if (!token) return json({ error: 'not_connected' }, 400);
      const ar = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', { headers: { Authorization: `Bearer ${token}` } });
      if (!ar.ok) return json({ error: 'strava_fetch_failed', status: ar.status }, 502);
      const acts = await ar.json();
      const rows = (Array.isArray(acts) ? acts : [])
        .filter((a: any) => /run|walk/i.test(a.sport_type || a.type || ''))
        .map((a: any) => {
          const km = (a.distance || 0) / 1000;
          const secs = a.moving_time || a.elapsed_time || 0;
          return {
            id: 'strava-' + a.id,                 // deterministic → idempotent, no dupes
            user_id: uid,
            name: a.name || 'Strava activity',
            started_at: a.start_date || new Date().toISOString(),
            duration_s: secs,
            distance_km: +km.toFixed(3),
            avg_pace: km > 0 ? +((secs / 60) / km).toFixed(3) : 0,   // min/km
            avg_hr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
            rpe: null, wet_bulb: null, source: 'strava', route: null,
          };
        });
      if (rows.length) {
        const { error } = await admin.from('activities').upsert(rows, { onConflict: 'id' });
        if (error) return json({ error: 'save_failed', detail: error.message }, 500);
      }
      return json({ imported: rows.length });
    }

    return json({ ok: true, service: 'stride strava-sync' });
  } catch (e) {
    return json({ error: 'handler_error', detail: (e as Error).message }, 500);
  }
});
