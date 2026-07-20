# Stride Coach — Build Blueprint

A running-coach app **like Runna, but injury-safe, honestly adaptive, and fair-priced.**

## Positioning
> "The running coach that won't get you injured." Polished like Nike, adaptive like TrainAsONE, honest pricing unlike Runna.

## Core differentiators (each maps to a verified Runna complaint)
| # | Runna problem | Our fix (the feature) |
|---|---------------|------------------------|
| 1 | Ramps too fast → injuries | **SafeRamp engine**: enforce ≤10% weekly load ↑, ACWR 0.8–1.3 sweet-spot, mandatory deload every 4th week, hard cap on weekly intensity |
| 2 | "Takes runner at their word" | **Daily readiness check-in** (sleep, soreness, energy, HR) → auto-adjusts today's session. Never trust one-time self-assessment |
| 3 | No mid-cycle feedback loop | **After every run**: RPE + "how'd that feel" → next session recalibrates. Continuous, not up-front-only |
| 4 | GPS undercounts 100–200m | **Accurate tracking**: smoothing + distance reconciled to watch as source of truth; never undercount |
| 5 | Dumb pace callouts at lights | **Auto-pause** (speed≈0 + accel) + calm, context-aware voice cues; user-tunable frequency |
| 6 | Watch sync broken | **Reliable 2-way sync** w/ visible sync status + retry queue (phase 2) |
| 7 | Can't cancel, slow support | **In-app cancel, transparent billing, real free tier**, fast help |
| 8 | Ignores wearable data | **Overtraining watchdog** on HR/pace trends → flags risk before injury |

## MVP scope (this build — web app prototype)
Ship a working, self-contained web app demonstrating the differentiated core:
1. **Onboarding** → goal (5K/10K/half/marathon), current fitness, days/week, race date.
2. **SafeRamp plan generator** → generates a week-by-week plan that provably obeys the 10% rule + deload weeks. Show the load curve so users SEE it's safe.
3. **Daily readiness check-in** → adjusts today's session (green/amber/red).
4. **Run tracker** → browser geolocation, live distance/pace, **auto-pause**, post-run RPE.
5. **Adaptive recalibration** → next week's plan shifts based on RPE + readiness + missed runs.
6. **Honest pricing screen** → real free tier vs Runna's paywall.

## Stack (MVP)
- **Single-page web app**, self-contained: HTML + vanilla JS + CSS (no build step, runs by opening the file). Fast to ship, easy to demo, portable to Capacitor/React Native later.
- LocalStorage for persistence (no backend needed for prototype).
- Geolocation API for run tracking; Web Speech API for voice cues.
- Later (phase 2): React Native + real backend + watch sync + wearable APIs.

## Roadmap beyond MVP
- P2: React Native app, accounts, cloud sync, Apple Watch / Garmin integration.
- P3: HR-zone training, treadmill mode, nutrition/fueling, social clubs, human-coach add-on.
