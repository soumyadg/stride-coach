# 🏃 Stride Coach

> **The running coach that won't get you injured.**
> A running-plan & coaching app in the spirit of Runna — rebuilt to fix Runna's documented flaws: injury-unsafe ramps, no feedback loop, GPS undercount, and a hard paywall.

App **#1 of 30**. Single self-contained web prototype (`app/index.html`) — no build step, no backend.

<p align="center">
  <img src="app/screenshots/06-theme-today.png" width="30%" alt="Today — injury-risk radar">
  <img src="app/screenshots/08-theme-run.png" width="30%" alt="Run — live audio coaching">
  <img src="app/screenshots/07-theme-stats.png" width="30%" alt="Stats & PRs">
</p>

---

## Why it exists

Runna is excellent but has **verified, documented problems** (App Store / Google Play reviews, Runna's own support docs, PT reports — see [`research/`](research/)):

| Runna's problem | Stride's fix |
|---|---|
| Ramps load too fast → injuries (PTs report weekly cases) | **SafeRamp** — load mathematically cannot jump >10%/week |
| "Takes you at your word", no feedback loop | **Daily readiness** + **post-run RPE** recalibration |
| GPS undercounts 100–200m at corners | Smoothed distance, no undercount |
| Nags "speed up" at red lights | **Smart auto-pause** |
| No free tier, can't cancel in-app | Real free tier, £6.99 Pro, 1-tap cancel |
| **Doesn't model injury risk at all** | **ACWR injury-risk radar** (sports-science standard) |

---

## Feature map

```mermaid
mindmap
  root((Stride Coach))
    Plan
      SafeRamp generator
      Deload every 4th week
      Taper
      Editable calendar
    Safety
      ACWR injury-risk radar
      Daily readiness check
      Overtraining guardrail
    Run
      Lap-based intervals
      Live audio coaching TTS
      Smart auto-pause
      GPS route trace
    Progress
      Weekly stats
      Personal records
      Activity history
    Workouts
      Easy / Tempo / Intervals
      Hill / Long / Time trial
      Parkrun / Race
```

## App navigation

```mermaid
flowchart LR
    OB[Onboarding<br/>goal → about you → prefs] --> T
    subgraph Tabs
      T[☀️ Today<br/>risk radar + readiness]
      P[🗓️ Plan<br/>calendar + load curve]
      R[🏃 Run<br/>live coaching]
      S[📊 Stats<br/>PRs + history]
      W[✨ Why<br/>vs Runna + pricing]
    end
    T --> R
    R -->|choose workout| LIB[Workout library]
    LIB --> R
    R -->|finish + RPE| P
```

## The injury-safe adaptive loop (our moat)

```mermaid
sequenceDiagram
    actor U as Runner
    participant A as Stride
    participant E as SafeRamp + ACWR engine
    U->>A: Daily readiness (sleep/soreness/energy)
    A->>E: score
    E-->>A: green / amber (−20%) / red (rest)
    A-->>U: today's session, adjusted
    U->>A: Run + post-run RPE
    A->>E: RPE + actual load
    E-->>A: recalibrate next week (within ≤10% cap)
    Note over E: ACWR kept in 0.8–1.3 safe band every week
    A-->>U: updated plan — injury risk stays green
```

## SafeRamp — why an unsafe plan is impossible

```mermaid
flowchart TD
    A[Week N target] --> B{Deload or taper week?}
    B -- yes --> C[Cut volume 35–40%]
    B -- no --> D[min of: peak cap,<br/>4-wk avg × rampCap,<br/>lastWeek × 1.10]
    D --> E[FLOOR to 0.1km<br/>rounding can't exceed cap]
    C --> F[Store week]
    E --> F
    F --> G[Verify: peak build-week ACWR ≤ 1.3<br/>max weekly jump ≤ 10%]
```

---

## Run it

```bash
cd app
python3 -m http.server 8791
# open http://localhost:8791/index.html  (use a phone / mobile viewport)
```
Or open `app/index.html` directly (GPS tracking needs http/https + location permission; falls back to demo mode otherwise).

## Tech

- **Single-file** `app/index.html` — vanilla HTML/CSS/JS, `localStorage` persistence, zero dependencies.
- Web APIs: **Geolocation** (run tracking), **SpeechSynthesis** (live audio coaching), **SVG** (route trace).
- Theme: **"Neon Aurora"** — deep indigo canvas, electric-tangerine brand, mint green reserved for safety semantics only.
- Portable to Capacitor / React Native for a native app + real watch sync (phase 2).

## Roadmap

```mermaid
flowchart LR
    MVP[✅ MVP<br/>plan · safety · run · stats] --> P2[Phase 2<br/>native + Apple Watch/Garmin sync]
    P2 --> P3[Phase 3<br/>HR zones · nutrition · community · human coach]
```

## Repo layout

```
stride-coach/
├── app/
│   ├── index.html      # the whole app
│   ├── README.md       # app-level notes
│   └── screenshots/    # UI captures
├── research/           # Runna teardown, competitor analysis, blueprint
├── STATE.md            # autonomous-build resume log
└── README.md           # this file
```

---

*Prototype built autonomously as app #1 of a 30-app sprint. Stride Coach is its own brand — Runna-inspired UX patterns, not an impersonation.*
