# 🧪 Tests

Stride Coach is a single-file vanilla app, so the suite runs against the **real in-page functions** (no mocks or replicas → no drift).

## Run it
Open the app (local `python3 -m http.server` in `app/`, or the live site), then in the **DevTools Console**:
```js
// paste the contents of tests/battery.js, then:
await runStrideTests()
```
It console.tables each section and returns `{ total, pass, fail, verdict, failures }`.

## What it covers
| Layer | Checks |
|---|---|
| **Unit** (pure functions) | `paceStr` (incl. 5000-value :60 rollover fuzz), `wetBulb` (known values + finite over −10..45 °C × 1..100 %RH), `safetyBucket` (5 buckets), `heatRisk`, `haversine`, `buildLaps`, `makeSessions`, `wmo` |
| **Stress · SafeRamp** | **400 randomized plans** — asserts the ≤10 %/week cap never breaks, no NaN/zero volumes, deloads present, ACWR peak ≤ 1.35, zero generation errors |
| **Stress · run engine** | 8000-step run (distance monotonic, all 14 laps advance, pace never `:60`), GPS edge cases (real move adds distance, auto-pause on stop, **teleport rejected**), all activities → valid GPX |
| **Smoke · screens** | Every tab renders (Today/Plan/Run/Stats/Why), workout library, no competitor name in UI |

## Last run — 2026-07-20
```
UNIT · pure functions          25/25
STRESS · SafeRamp (400 plans)   5/5   (max weekly jump 10.00%, peak ACWR 1.15)
STRESS · run engine            10/10
SMOKE · screens                 7/7
────────────────────────────────────
✅ ALL PASS  45/45   ·   0 console errors
```
Plus a separate full-UI smoke drive (onboarding → build → readiness → calendar edit → run → RPE adaptive loop) — 16/16 (verified fresh-onboarding boots correctly).

**Mapper round-trip** (local ↔ Supabase rows) is unit-tested in Node — see `BACKEND.md`. The live cloud round-trip needs a Supabase project (not covered here).
