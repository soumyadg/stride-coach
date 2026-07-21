# 💷 Pro subscription (Stripe)

> **Web only.** Apple & Google **forbid Stripe** for in-app digital subscriptions — the native App Store / Play Store versions must use **In-App Purchase** (StoreKit / Play Billing), which take 15–30%. Everything here is for the **web / PWA** version.

## What's built
- **Go Pro** button on the pricing card → opens your Stripe checkout.
- `isPro()` gating hook + `S.pro` / synced `subscription.tier` — ready to gate any future Pro feature.
- **Webhook edge function** (`supabase/functions/stripe-webhook/`) → unlocks Pro for the right account, server-side.
- Optimistic client unlock on the `?pro=success` return (so the buyer sees Pro immediately; the webhook confirms it).

## ⚡ Fastest path (works today, no server)
1. Stripe → **Payment Links** → New → create a **recurring** price **£6.99/mo** (product "Stride Pro").
2. Copy the link (`https://buy.stripe.com/…`).
3. Paste it into **`app/config.js`** → `STRIPE_PAYMENT_LINK`, then `./deploy.sh`.
4. Done — the **Go Pro** button now opens Stripe checkout. Stripe bills them monthly and handles cancellation.

At this level, Pro unlocks **locally** on the success redirect. Good enough for a soft launch, but a savvy user could fake it — add the webhook (below) for a real, server-verified unlock.

## 🔒 Full path (server-verified unlock)
Requires the Supabase backend (see [BACKEND.md](BACKEND.md)) to be live.
1. Run the migration (`supabase/migrations/0001_accounts_sync.sql`) — includes the `subscriptions` table.
2. Deploy the webhook:
   ```bash
   supabase functions deploy stripe-webhook --no-verify-jwt
   supabase secrets set STRIPE_SECRET_KEY=sk_live_… STRIPE_WEBHOOK_SECRET=whsec_… \
     SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=…
   ```
3. Stripe → **Developers → Webhooks** → add endpoint `https://<project>.functions.supabase.co/stripe-webhook`, events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. In the Payment Link settings, set the **success URL** back to the app. The app already passes `client_reference_id=<user id>` so the webhook unlocks the correct account.

Now Pro is driven by `subscriptions.tier` synced from the server — the client can't fake it.

## ⚠️ Before you actually charge
The headline Pro features (auto-sync to Strava/Garmin, multiple plans, advanced analytics) **aren't built yet** — they need the backend. So today Pro is effectively a **supporter / early-access** tier: the checkout works and bills, but nothing is taken away from the (excellent) free app. Gate real Pro features with `isPro()` as they ship:
```js
if (!isPro()) { goPro(); return; }   // wrap a Pro-only action
```
Per the project's discipline: **collect Pro only once there's real Pro value.** The plumbing is ready for that day.
