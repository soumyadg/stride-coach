# 🧠 AI Running Coach (Pro feature)

A chat coach powered by Claude that answers "should I run today?", explains workouts, and adjusts training — grounded in the athlete's own plan, runs, readiness, training form and the live weather. It's the flagship Pro feature.

**Requires the Supabase backend** (accounts + `subscriptions`) — see [BACKEND.md](BACKEND.md). Pro is enforced **server-side** (the edge function checks the user's subscription tier), so it can't be unlocked by faking the client.

## How it works
```
App (Pro, signed in) → POST /functions/v1/ai-coach  { question, context, history }
  → function verifies Supabase JWT + checks subscriptions.tier == 'pro'
  → calls Claude (Anthropic API) with a coach system-prompt + the athlete's context
  → returns a short, personalised reply
```
The athlete context (plan, recent runs, readiness, form, predictions, weather, AQI) is assembled **on the client** and sent per message — the function stays stateless. Your Anthropic key lives **only** in Supabase secrets.

## Setup (one-time, ~5 min)

### 1. Get an Anthropic API key
- Go to **https://console.anthropic.com** → **API Keys** → create a key (`sk-ant-…`).
- Add a little credit (this coach uses **Claude Haiku** by default — fractions of a penny per message).

### 2. Deploy the edge function
Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**
- Name: `ai-coach`
- Paste `supabase/functions/ai-coach/index.ts`
- **Verify JWT: OFF** (the function verifies the user + Pro tier itself)
- Deploy

### 3. Add the secret
Edge Functions → **Secrets** → add:
| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your `sk-ant-…` key |

*(Optional: `AI_COACH_MODEL` to change the model — default `claude-haiku-4-5-20251001`. Use a Sonnet id for richer answers at higher cost.)*
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-provided — don't add them.

### 4. Done
Signed-in **Pro** users see the **🧠 AI running coach** card under **Why**. No app redeploy needed — the client already points at `/functions/v1/ai-coach`.

## Cost & safety
- Default model **Haiku** keeps replies well under a penny each; `max_tokens` is capped at 500.
- Server-side Pro gate + JWT check prevent non-subscribers from using your API credit.
- The system prompt forbids medical advice and hype, caps replies to ~110 words, and won't invent data.

## Note on the App Store build
Same edge function works for native — the app just needs the user signed in. Keep Pro on native behind Apple/Google IAP (Stripe web subscription doesn't unlock native).
