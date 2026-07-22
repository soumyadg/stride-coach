# 🌍 Community (anonymous & public)

Three social features, all **anonymous by design**:
- **"X people took this route"** — a privacy-safe count on the Route Finder.
- **A shared feed** — read & post what others share.
- **Milestones** — post birthdays & anniversaries.

Lives on the **Atlas** tab (a new *Community* card). Needs a signed-in account.

## Privacy model (why it's safe)
- **No names, ever.** Posts show "Someone near you" / "A Strivon mover" — never a person.
- **No exact locations.** We store only a **coarse geohash (~40km)** so the feed can say "near you", and route popularity uses a **~5km fuzzed cell + distance bucket** — never your start point, so home is never exposed.
- **Route popularity is a count only.** The `route_prints` table has **no client read access**; numbers come from a `security definer` function that returns an integer and never identities.
- **Opt-in.** Nothing is shared unless you're signed in and choose to post; route prints register only from your own completed activities.
- **Moderation.** Client-side length cap (280) + profanity block + a ⚑ Report button that writes to `post_reports` for review.

## One-time backend setup (you, ~2 min)
1. Open your Supabase project → **SQL Editor**.
2. Paste the contents of `supabase/migrations/0003_community.sql` and **Run**.
   (It creates `community_posts`, `route_prints`, `post_reports`, the `route_popularity()` function, and all the row-level-security policies.)
3. Done — the Community card goes live for signed-in users.

## Honest caveats
- **Cold-start:** counts and the feed are empty until you have users. Route popularity reads "1 person" (you) at first, and grows as people join — the plumbing is real, it just needs a crowd.
- **Moderation is light (v1):** length cap + profanity filter + report queue. If it grows, add a human review pass on `post_reports` (and consider Supabase Edge rate-limiting to stop spam).
- **Region "near you"** is derived from device GPS at post time; users who deny location still post, just without the "near you" grouping.
