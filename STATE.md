# STATE — Stride Coach (the leading app clone, improved)

**App #1 of 30.** Autonomous build. This file = my resume point. Read it first on every wake-up.

## Mission
Build a running-coach app like **the leading app** (App Store id1594204443), but that **fixes the leading app's documented problems**. Research must be deep + detailed; every real complaint → a concrete fix in our app.

## Autonomous loop rules (set by Soumya 2026-07-19)
- Work continuously, no check-ins.
- When the Claude usage/session limit hits → STOP, wait for reset, RESUME from this file. Never lose place.
- Limit last hit: 2026-07-19 ~22:45 BST, resets 03:20 BST.

## Pipeline (update status as I go)
- [x] P0 — Folder + state scaffold
- [x] P1 — DEEP research: the leading app's issues (App Store, Google Play, support docs, injury reports, blogs) → `research/findings.md`
- [x] P2 — Competitor gap analysis (Nike Run Club, adidas, Coopah, TrainAsONE, Garmin Coach) → `research/competitors.md`
- [x] P3 — Build blueprint: features, our fixes, stack → `research/blueprint.md`
- [x] P4 — Build the app in `app/index.html` — MVP built + browser-verified (onboarding, SafeRamp plan w/ proven ≤10% cap, readiness, run tracker + auto-pause, adaptive RPE recalibration, persistence)
- [x] P5 — Updated root TRACKER.md, app #1 = DONE (MVP)

## ✅ APP #1 COMPLETE (MVP) — 2026-07-20 BST
Verified working in browser (playwright): plan cap holds ≤9.8% max jump, 0 violations; RPE "hard" → next week 16.8→15.6km; persistence OK.

## 🎨 UI REDESIGN — the leading app-style layout (2026-07-20, per Soumya's screenshot)
Rebuilt index.html to match the leading app's App Store aesthetic: dark theme, 3-step onboarding w/ progress bar, icon-row goal picker, 2×2 preferences grid, training CALENDAR (dated day-rows + colored workout dots), and Live-Audio-Coaching RUN screen (big green target, segment bar, lap stat grid, live SVG route trace from GPS, coaching bubble w/ waveform). All logic preserved + re-verified. Screenshots in app/screenshots/. Own branding, NOT a the leading app impersonation.

## 🩹 INJURY-RISK RADAR added (2026-07-20) — the real differentiator
Built ACWR (Acute:Chronic Workload Ratio) injury-risk gauge on the Today screen: color-banded gauge (0.5–2.0), sweet-spot 0.8–1.3, live marker + verdict (Optimal/Caution/High-risk/Recovery). Proves peak ACWR across the whole plan stays in the safe band (verified 1.13). This is the sports-science model the leading app doesn't have — makes "won't get you injured" tangible + quantified. Verified in browser (ACWR 0.98 Optimal, peak 1.13).

## 🧩 4 PARITY FEATURES + NEW THEME + GITHUB (2026-07-20)
Built & browser-verified 4 the leading app-parity features: (1) Workout library modal (8 run + 3 cross-training tiles); (2) Stats screen — weekly summary, 6-week volume chart, Personal Records (1K/5K/10K), activity history (22 seeded acts); (3) Calendar editing — done-ticks, +Add to rest days, per-week Reset (via persisted plan[].days); (4) Real audio coaching — lap-based intervals (14-lap interval session), SpeechSynthesis TTS voice + mute, full 2-row lap/total stat grid, Next-Lap button. Guarded PR calc against implausible paces.
NEW THEME "Neon Aurora": deep indigo bg, electric-tangerine brand accent, mint-green reserved for safety semantics only (ditched the leading app's black+lime). Verified all screens.
GITHUB: repo pushed → https://github.com/soumyadg/stride-coach (main + tag v0.1.0). README has 5 mermaid diagrams. Deferred (need backend): Community, 24/7 human support, native watch sync.
## 📲🗺️❤️ PWA + REAL MAP + BLUETOOTH HR (2026-07-20) — £0 on-device upgrades
Soumya chose the £0 path (no backend). Built + browser-verified:
- **PWA**: manifest.webmanifest + icon.svg + sw.js (offline shell + cache-first map tiles) + head meta + SW registration. Installable, standalone, works offline. Verified: manifest loads, SW registers.
- **Real map**: replaced stylized canvas with a self-built slippy-map (web-mercator project(), CartoDB dark tiles, no JS lib/API key) + tangerine route overlay + center marker + OSM/CARTO attribution. Verified: 6 tiles render real streets, 60-pt route drawn.
- **Bluetooth HR**: Web Bluetooth (heart_rate service/characteristic parse) + HR zones (Z1–5 vs maxHR 190) + zone-colored pill + simulated fallback when no device/BT. Verified: "142 Z3" pill renders.
Backend cost discussion: £0 until real users; Apple Dev $99/yr is the first real spend (distribution, not backend). Matches Soumya's spend-gating.
NOTE: app #2 is OFF the table until Soumya says app #1 is done — do NOT ask about app #2.
## ⬇ GPX EXPORT (2026-07-20) — sync-lite, no OAuth
Added GPX 1.1 export so users upload runs to Strava/Garmin manually (no backend/OAuth). buildGPX() emits valid GPX (metadata + trk/trkseg/trkpt w/ lat/lon/ISO time); downloadGPX() via Blob+anchor. Runs now store pts+startAt+hr in the activity; seeded activities get synthRoute() so all are exportable. UI: ⬇ button per Stats activity + on post-run card. Verified: valid XML (parses clean, root <gpx>), 82 trackpoints, filename stride-YYYYMMDD-HHMM-name.gpx.
## 💷 PRICING SCREEN + 🔤 FONT (2026-07-20)
Wired the Why screen with the full Free-vs-Pro split (after a freemium-strategy discussion): FREE forever (SafeRamp plan, injury-risk radar, tracking/map/auto-pause, stats/PRs, manual GPX) vs PRO £6.99/mo (auto-sync Strava/Garmin, live voice coaching, HR zones + full workout library, race/multiple plans, load analytics) + "MOST POPULAR" badge + 7-day-trial button (prototype note, no billing) + "safety promise always free" banner. Conversion logic: free proves the promise, Pro sells convenience+commitment (race signup = key trigger); ~2-5% convert, freemium is a volume game → don't build billing/backend until the free base is proven.
FONT: swapped to Space Grotesk (display/headings/big numbers) + Inter (body) via Google Fonts — "cooler & sexier" per Soumya. Verified both load.
## ✨ ONBOARDING ANIMATIONS (2026-07-20)
Added: staggered fade-up entrance of each onboarding step's content (playStep() flattens .rows/.grid2 so goal rows & pref tiles cascade), floaty brand logo, "Building your safe plan…" LOADER between build→app (spinning tangerine ring + staged messages: load limits → deload weeks → paces → safety-checks-passed, ~1.9s), and a subtle fade on every screen/tab switch (go() adds .fx). Respects prefers-reduced-motion. Verified in browser.
## 🏢 TREADMILL MODE (2026-07-20)
Added Outdoor/Treadmill toggle on the run screen. Treadmill mode: GPS off, map replaced by a speed dial (−/+ 0.5 km/h, 0.5–25) + incline control (0–15%); distance integrates from speed (speed/3.6 m/s per tick), no auto-pause. Verified: 10 km/h × 60s = 167m, avg pace derives to exactly 6:00/km. Lap intervals still advance by distance. Attribution hidden in treadmill mode.
## 🚀 DEPLOYED LIVE (2026-07-20) — https://soumyadg.github.io/stride-coach/
Deployed to GitHub Pages. GOTCHA: GitHub Actions is BILLING-LOCKED on soumyadg's account ("account is locked due to a billing issue") → the Actions-based Pages deploy fails. WORKAROUND: branch-based (legacy) Pages from `gh-pages` branch (app/ subfolder split to branch root). Pages build_type=legacy, source gh-pages:/. Verified live: index/manifest/sw/icon all HTTP 200, onboarding renders. HTTPS ✓ (so PWA/GPS/Bluetooth work).
REDEPLOY after changes: run `./deploy.sh` (subtree-splits app/ → gh-pages, force-push, triggers build). Do NOT rely on the pages.yml Actions workflow until billing is unlocked.
## 🔔 PUSH/LOCAL NOTIFICATIONS + 🌡️ WEATHER WET-BULB (2026-07-20)
- **Local notifications** (`@capacitor/local-notifications` v8, no backend): "Training reminders" toggle on Today schedules run-day nudges at 7:30am (next 14 days). Bridge: scheduleReminders/notify/cancelReminders; Android POST_NOTIFICATIONS+SCHEDULE_EXACT_ALARM. Honest: local only (remote push = FCM/APNs + backend, deferred).
- **Local weather + best-time-to-run** via Open-Meteo (free, no key, CORS, works web+native): fetches current + today's hourly temp/humidity, computes **wet-bulb temp (Stull approx)** per hour → recommends coolest-heat-stress daylight window today. Shows current temp/humidity/wet-bulb + risk pill (Ideal/Comfortable/Caution/High/Dangerous). "🔔 Notify me at HH:00" schedules a local push at the best window; also folded into training reminders. Verified live: 24°C/37%→wet-bulb 14.7°C, best 14:00. Formula validated (30/70→25.6, 35/50→26.6). Screenshot g5-weather.png.
## ✨ WELCOME SPLASH + 🌈 5-BUCKET WEATHER THEME + 💧 HYDRATION + 🥵 HEAT WARN (2026-07-20)
- **Welcome splash**: on app open, a glowing gradient route DRAWS itself (SVG stroke-dashoffset) with a bobbing runner-dot leading (CSS offset-path), then "Stride.Coach" wordmark + tagline reveal; auto-dismiss ~2.7s or tap-to-skip; reduced-motion safe. runBoot() runs under the fade → app appears. Screenshot s1-splash.png.
- **5 weather buckets** (was 3): applySafetyTheme() → data-safety = ideal(teal #22d3c4, wb<10) / good(tangerine, <18) / caution(amber, <23) / high(orange, <27) / danger(red, >=27). Whole app retints (accent+bg+buttons+top strip). Verified all 5 accents. Driven by area's wet-bulb via Open-Meteo geolocation.
- **Hydration** prompts on long runs (voice+bubble) every 20min / 15min in heat, no double-fire.
- **Run-screen heat warning** amber/red from current wet-bulb, spoken on start.
Next: keep improving app #1 (candidates: embed fonts offline, treadmill calibrate, workout-write to Health).

## 🌤️ WEATHER-OF-THE-DAY MOOD THEME (2026-07-20)
- **applySafetyTheme() narrowed to actual danger**: data-safety now only gets set for high/danger wet-bulb heat-stress (a genuine safety alert); ideal/good/caution no longer force the whole-app tint, so they don't fight with the new mood theme below.
- **applyWeatherMood()** → weatherMood(weather_code) maps today's WMO code to data-weather = sunny(gold)/cloudy(grey-blue)/fog(silver)/rain(blue)/snow(icy blue)/storm(violet). Retints accent+bg+surfaces+primary-button gradient every day, not just on hot days. CSS block sits before the run-safety block so a real high/danger heat alert still overrides the day's mood (verified: clear+34°C/70%RH → data-safety=danger wins over data-weather=sunny; clear+mild → data-weather=sunny shows through).
- Verified all 6 moods render correctly via mocked Open-Meteo responses (playwright, headless).

## Verified findings so far (from deep-research run, 3-vote adversarial pass)
1. Price: £15.99/mo or ~£9.99/mo annual ($19.99 / $119.99 US). No real free tier.
2. Owned by Strava (acq. Apr 2025); £119.99/yr Strava+the leading app bundle.
3. Integrations: Apple Watch, Garmin, COROS, Fitbit, Strava.
4. Plans: Couch-to-5K → marathon/ultra + triathlon; coach-built + adaptive.
### Verified WEAKNESSES (our opportunities)
- 🔴 Garmin sync chronically broken — the leading app's OWN support docs list 3 recurring failure modes (won't sync to watch / won't sync back). [support.runna.com]
- 🔴 "Feels automated / one-size-fits-all" — AI plans oversold as personalized. [outsideonline]
- 🔴 AI plans don't model injury risk or safe load ramp — burnout/injury risk for beginners. [outsideonline]
- 🔴 Hard paywall, no free tier = conversion barrier to undercut.
- 🔴 REFUTED claim: does NOT reliably push full structured workouts to all watches phone-free (ties to sync issues).

## Still to research (P1/P2)
- Reddit r/running + r/the leading appApp specific complaint threads (detailed quotes)
- Google Play 1–3 star reviews (Android parity bugs)
- the5krunner injury article specifics
- Strava-acquisition backlash / price changes
- Missing features users beg for (treadmill mode, heart-rate zones, nutrition, social)
