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
Built ACWR (Acute:Chronic Workload Ratio) injury-risk gauge on the Today screen: color-banded gauge (0.5–2.0), sweet-spot 0.8–1.3, live marker + verdict (Optimal/Caution/High-risk/Recovery). Proves peak ACWR across the whole plan stays in the safe band (verified 1.13). This is the sports-science model Runna doesn't have — makes "won't get you injured" tangible + quantified. Verified in browser (ACWR 0.98 Optimal, peak 1.13).

## 🧩 4 PARITY FEATURES + NEW THEME + GITHUB (2026-07-20)
Built & browser-verified 4 Runna-parity features: (1) Workout library modal (8 run + 3 cross-training tiles); (2) Stats screen — weekly summary, 6-week volume chart, Personal Records (1K/5K/10K), activity history (22 seeded acts); (3) Calendar editing — done-ticks, +Add to rest days, per-week Reset (via persisted plan[].days); (4) Real audio coaching — lap-based intervals (14-lap interval session), SpeechSynthesis TTS voice + mute, full 2-row lap/total stat grid, Next-Lap button. Guarded PR calc against implausible paces.
NEW THEME "Neon Aurora": deep indigo bg, electric-tangerine brand accent, mint-green reserved for safety semantics only (ditched Runna's black+lime). Verified all screens.
GITHUB: repo pushed → https://github.com/soumyadg/stride-coach (main + tag v0.1.0). README has 5 mermaid diagrams. Deferred (need backend): Community, 24/7 human support, native watch sync.
## 📲🗺️❤️ PWA + REAL MAP + BLUETOOTH HR (2026-07-20) — £0 on-device upgrades
Soumya chose the £0 path (no backend). Built + browser-verified:
- **PWA**: manifest.webmanifest + icon.svg + sw.js (offline shell + cache-first map tiles) + head meta + SW registration. Installable, standalone, works offline. Verified: manifest loads, SW registers.
- **Real map**: replaced stylized canvas with a self-built slippy-map (web-mercator project(), CartoDB dark tiles, no JS lib/API key) + tangerine route overlay + center marker + OSM/CARTO attribution. Verified: 6 tiles render real streets, 60-pt route drawn.
- **Bluetooth HR**: Web Bluetooth (heart_rate service/characteristic parse) + HR zones (Z1–5 vs maxHR 190) + zone-colored pill + simulated fallback when no device/BT. Verified: "142 Z3" pill renders.
Backend cost discussion: £0 until real users; Apple Dev $99/yr is the first real spend (distribution, not backend). Matches Soumya's spend-gating.
NOTE: app #2 is OFF the table until Soumya says app #1 is done — do NOT ask about app #2.
Next: keep improving app #1 (candidates: GPX export, negative-split coaching, onboarding animations).

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
