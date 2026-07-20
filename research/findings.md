# the leading app — Issues Found (research in progress)

Sources: App Store page, Google Play (com.runbuddy.prod), web search of reviews/Reddit/blogs, the leading app's own support docs. **Deeper pass (Reddit threads, 1-star dumps, injury reports) happens after 03:20 limit reset.**

## Ratings
- **iOS:** 4.8★, 24,000+ ratings
- **Android:** 4.7★ (Google Play, com.runbuddy.prod)
- **Pricing:** £15.99/mo or ~£9.99/mo annual ($19.99 / $119.99). No real free tier. Strava-owned (Apr 2025).

## 🔴 CONFIRMED COMPLAINTS → our app must fix each

### A. GPS / distance accuracy (Android reviews)
- Map "cuts huge corners"; recorded distance **100–200m short** vs watch.
- Pace shows **slower than actual** because distance is undercounted.
- **FIX:** high-accuracy GPS with Kalman/smoothing + snap-to-path; reconcile against watch as source of truth; never undercount.

### B. Pace callouts are dumb
- Doesn't detect when you **stop at a traffic light** → keeps yelling "speed up." Grating on long runs.
- **FIX:** auto-pause detection (accelerometer + speed=0); context-aware, calm coaching cues; user-tunable callout frequency.

### C. Training plan ramps too fast / rigid
- **Ignores the 10% rule**, cranks distance up too fast → injury risk.
- Generates plan up front and **doesn't recalibrate** as you progress.
- **FIX:** enforce safe load ramp (ACWR / 10% cap), true adaptive recalibration each week from actual runs, "not feeling 100%" deload.

### D. Watch sync broken (the leading app's OWN support docs)
- 3 documented Garmin failure modes: won't sync app→Garmin, won't appear on watch, won't sync back.
- **FIX:** rock-solid two-way sync, sync-status visibility, retry/queue, offline workout on watch.

### E. Subscription / support friction
- **Can't cancel in-app**; redemption codes broken; **customer service answers once a day** at odd hours.
- **FIX:** in-app cancel, transparent billing, real free tier + fair pricing, fast/AI-assisted support.

### F. "Feels automated / one-size-fits-all"
- Experts: AI plans oversold as personalized; not like a human coach; ignore injury + burnout risk.
- **FIX:** genuine individualization (fatigue, HR, sleep, history), injury-aware, optional human-coach touchpoints.

## To dig deeper after reset (P1 cont.)
- Reddit r/running + the app's own subreddit exact quotes
- the5krunner injury article specifics + PT reports
- Google Play 1-star dump via browser (playwright) — JS-rendered, needs headless browser
- Strava-acquisition price/backlash
- Most-requested MISSING features (treadmill mode, HR zones, nutrition, social/clubs, music)
