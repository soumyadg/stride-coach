# STATE — Stride Coach (Runna clone, improved)

**App #1 of 30.** Autonomous build. This file = my resume point. Read it first on every wake-up.

## Mission
Build a running-coach app like **Runna** (App Store id1594204443), but that **fixes Runna's documented problems**. Research must be deep + detailed; every real complaint → a concrete fix in our app.

## Autonomous loop rules (set by Soumya 2026-07-19)
- Work continuously, no check-ins.
- When the Claude usage/session limit hits → STOP, wait for reset, RESUME from this file. Never lose place.
- Limit last hit: 2026-07-19 ~22:45 BST, resets 03:20 BST.

## Pipeline (update status as I go)
- [x] P0 — Folder + state scaffold
- [x] P1 — DEEP research: Runna's issues (App Store, Google Play, support docs, injury reports, blogs) → `research/findings.md`
- [x] P2 — Competitor gap analysis (Nike Run Club, adidas, Coopah, TrainAsONE, Garmin Coach) → `research/competitors.md`
- [x] P3 — Build blueprint: features, our fixes, stack → `research/blueprint.md`
- [x] P4 — Build the app in `app/index.html` — MVP built + browser-verified (onboarding, SafeRamp plan w/ proven ≤10% cap, readiness, run tracker + auto-pause, adaptive RPE recalibration, persistence)
- [x] P5 — Updated root TRACKER.md, app #1 = DONE (MVP)

## ✅ APP #1 COMPLETE (MVP) — 2026-07-20 BST
Verified working in browser (playwright): plan cap holds ≤9.8% max jump, 0 violations; RPE "hard" → next week 16.8→15.6km; persistence OK.

## 🎨 UI REDESIGN — Runna-style layout (2026-07-20, per Soumya's screenshot)
Rebuilt index.html to match Runna's App Store aesthetic: dark theme, 3-step onboarding w/ progress bar, icon-row goal picker, 2×2 preferences grid, training CALENDAR (dated day-rows + colored workout dots), and Live-Audio-Coaching RUN screen (big green target, segment bar, lap stat grid, live SVG route trace from GPS, coaching bubble w/ waveform). All logic preserved + re-verified. Screenshots in app/screenshots/. Own branding, NOT a Runna impersonation.

## 🩹 INJURY-RISK RADAR added (2026-07-20) — the real differentiator
Built ACWR (Acute:Chronic Workload Ratio) injury-risk gauge on the Today screen: color-banded gauge (0.5–2.0), sweet-spot 0.8–1.3, live marker + verdict (Optimal/Caution/High-risk/Recovery). Proves peak ACWR across the whole plan stays in the safe band (verified 1.13). This is the sports-science model Runna doesn't have — makes "won't get you injured" tangible + quantified. Verified in browser (ACWR 0.98 Optimal, peak 1.13). Next: phase-2 native/watch-sync OR app #2.

## Verified findings so far (from deep-research run, 3-vote adversarial pass)
1. Price: £15.99/mo or ~£9.99/mo annual ($19.99 / $119.99 US). No real free tier.
2. Owned by Strava (acq. Apr 2025); £119.99/yr Strava+Runna bundle.
3. Integrations: Apple Watch, Garmin, COROS, Fitbit, Strava.
4. Plans: Couch-to-5K → marathon/ultra + triathlon; coach-built + adaptive.
### Verified WEAKNESSES (our opportunities)
- 🔴 Garmin sync chronically broken — Runna's OWN support docs list 3 recurring failure modes (won't sync to watch / won't sync back). [support.runna.com]
- 🔴 "Feels automated / one-size-fits-all" — AI plans oversold as personalized. [outsideonline]
- 🔴 AI plans don't model injury risk or safe load ramp — burnout/injury risk for beginners. [outsideonline]
- 🔴 Hard paywall, no free tier = conversion barrier to undercut.
- 🔴 REFUTED claim: does NOT reliably push full structured workouts to all watches phone-free (ties to sync issues).

## Still to research (P1/P2)
- Reddit r/running + r/RunnaApp specific complaint threads (detailed quotes)
- Google Play 1–3 star reviews (Android parity bugs)
- the5krunner injury article specifics
- Strava-acquisition backlash / price changes
- Missing features users beg for (treadmill mode, heart-rate zones, nutrition, social)
