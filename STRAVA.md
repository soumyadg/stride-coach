# 🔗 Strava auto-import (Pro feature)

Pulls a signed-in Pro user's Strava runs & walks straight into Stride — populating their stats, history and personal records with no manual logging. This is the #1 thing users say competitors get wrong (broken sync), so it's our flagship Pro feature.

**Requires the Supabase backend** (accounts + `integrations` table) to be live — see [BACKEND.md](BACKEND.md). Free/offline users simply don't see the Strava card.

## How it works
```
App (Pro, signed in) → "Connect Strava" → Strava consent
  → redirect to  strava-sync edge function (?code, state=<user JWT>)
  → function swaps code for tokens, stores them in `integrations`
  → back to app ?strava=connected → app calls ?action=import
  → function fetches recent runs, upserts into `activities`
  → app syncs them down → Stats & PRs fill in
```
The Strava **client secret** and all tokens live **only** server-side in the edge function. The browser only ever holds the public Client ID.

## Setup (one-time, ~5 min)

### 1. Create a Strava API application
1. Go to **https://www.strava.com/settings/api**
2. Fill in: Application Name `Stride Coach`, Category `Training`, Website your app URL.
3. **Authorization Callback Domain:** `fvgtetbtppcxspvjbfie.supabase.co`  *(host only — no `https://`, no path)*
4. Create → note your **Client ID** (public) and **Client Secret** (keep private).

### 2. Deploy the edge function
Dashboard → **Edge Functions** → **Deploy a new function** → **Via Editor**
- Name: `strava-sync`
- Paste `supabase/functions/strava-sync/index.ts`
- **Verify JWT: OFF** (Strava's redirect carries no JWT; the function verifies the user itself)
- Deploy

### 3. Add the secrets
Edge Functions → **Secrets** → add:
| Name | Value |
|---|---|
| `STRAVA_CLIENT_ID` | your Strava Client ID |
| `STRAVA_CLIENT_SECRET` | your Strava Client Secret |
| `APP_URL` | `https://soumyadg.github.io/stride-coach/` |

*(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided — don't add them.)*

### 4. Run the migration
SQL Editor → run `supabase/migrations/0002_strava.sql` (widens `activities.id` to text so Strava ids can be deduped).

### 5. Add the public Client ID to the app
In `app/config.js` set `STRAVA_CLIENT_ID: '<your id>'`, then `./deploy.sh`. The Strava card now appears for signed-in Pro users under **Why → Strava**.

## Scope & privacy
- Scope requested: `activity:read_all` (reads the user's own runs, including private).
- Only `Run` / `Walk` activity types are imported; other sports are ignored.
- Re-import is idempotent (`id = strava-<activityId>`) — no duplicates.
- A user can revoke access anytime at https://www.strava.com/settings/apps.

## Note on the App Store build
The web/PWA OAuth flow above is fine. Native iOS/Android should use an in-app browser (`ASWebAuthenticationSession` / Chrome Custom Tabs) for the same flow — the edge function is unchanged.
