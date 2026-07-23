# 🚀 Strivon — launch checklist (web/PWA)

Status as of this build: **backend connected, registration open.** People *can* sign up now. These steps make it fully launch-ready.

## 1. Run the two pending database migrations  ⚠️ required
The app is live but two features (two-profile cloud sync + community/dog-spots) need their tables.

1. Supabase → your project → **SQL Editor** → **New query**
2. Paste the whole of **`supabase/RUN_BEFORE_LAUNCH.sql`** and press **Run**
   (it contains `0003_community.sql` + `0004_profile_state.sql`)
3. Done — those features now persist server-side.

_Already run earlier: `0001_accounts_sync.sql` (accounts) — verified live._

## 2. Decide the sign-up flow  ⚠️ decision
Right now **email confirmation is ON** (users must click a link before first sign-in).
- Supabase → **Authentication → Providers → Email**
- Keep **"Confirm email" ON** = safer, less spam (recommended for public launch), **or**
- Turn it **OFF** = instant sign-in, more friction-free (fine for a soft/beta launch).

## 3. Email deliverability  ⚠️ before any volume
Supabase's built-in email sender is rate-limited (~a few per hour) — fine for testing, **not** for real signups.
- Supabase → **Authentication → Emails / SMTP** → add a **custom SMTP** (Resend, SendGrid, Postmark, Mailgun…)
- Also customise the confirmation + reset email templates with Strivon branding.

## 4. Verify end-to-end (5 min)
- Open **strivon.run/app** → Why tab → create a test account → confirm the email → sign in
- Check it syncs: build a plan, sign in on another browser, confirm it restores
- Post to the community feed; add a dog poop-spot on the walk profile — confirm they save

## 5. Legal & trust  ✅ done, review advised
- Privacy Policy (GDPR + CCPA) + Terms (incl. "Data we collect") are live and linked in the footer.
- **Have a solicitor review them** before relying on them commercially (health + location + a public feed raise the bar). They're solid drafts, not vetted legal advice.
- Set up real inboxes: **hello@strivon.run**, **privacy@strivon.run**.

## 6. Pro payments (optional at launch)
- Stripe Payment Link is wired (`config.js` → `STRIPE_PAYMENT_LINK`). The webhook edge function updates the `subscriptions` table → unlocks Pro.
- Confirm the webhook secret is set in Supabase and a test purchase flips a test account to Pro.

## 7. Native apps (later)
- iOS/Android via Capacitor + the Apple Watch app are **code-ready** but need **full Xcode installed** to build/submit (see `NATIVE.md`, `WATCH.md`). Not required for the web/PWA launch.

---
### TL;DR to go live today
Run step 1 (SQL), pick step 2 (email confirm on/off), do a step-4 test signup. That's the minimum. Steps 3/5/6 matter as you scale.
