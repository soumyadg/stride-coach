# Strivon — MVP prototype

**The running coach that won't get you injured.** An adaptive, injury-safe running-plan app (design notes in `../research/`).

## Run it
```bash
cd stride-coach/app
python3 -m http.server 8791
# open http://localhost:8791/index.html  (best in mobile view / on a phone for GPS)
```
Or just open `index.html` in a browser (GPS run-tracking needs http/https + location permission).

## What's built (all working & verified)
- **Onboarding** → goal, current volume, days/week, experience.
- **SafeRamp plan generator** — provably obeys ≤10% weekly build cap (floored, verified 0 violations) + deload every 4th week + taper. The load curve is shown so the user *sees* it's safe.
- **Daily readiness check** — sleep/soreness/energy → green/amber/red → today's session auto-adjusts (amber −20%, red → rest). This is the feedback loop most apps lack.
- **Run tracker** — browser GPS, smoothed distance (no corner-cutting/undercount), **smart auto-pause** (won't nag at traffic lights), moving-time pace. Demo fallback when no GPS.
- **Adaptive recalibration** — post-run RPE trims/nudges next week within the safety cap (verified: "hard" → next week 16.8→15.6km).
- **Honest pricing / Why screen** — real free tier, £6.99 Pro vs the typical £15.99 no-free-tier wall.
- **Persistence** via localStorage.

## Each feature maps to a real, documented running-app problem
See `../research/findings.md` and `../research/blueprint.md` — every complaint has a shipped fix.

## Stack
Single self-contained `index.html` (vanilla JS/CSS, no build). Portable to Capacitor/React Native for a native app + real watch sync later.

## Not yet (phase 2)
Accounts/cloud, Apple Watch/Garmin sync, HR-zone training, treadmill mode, nutrition, social clubs, human-coach chat.
