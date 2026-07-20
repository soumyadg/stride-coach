<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="app/branding/logo-full-dark.svg">
    <img src="app/branding/logo-full-light.svg" alt="Stride.Coach" height="72">
  </picture>
</p>

> **The running coach that won't get you injured.**
> An adaptive running-plan & coaching app built around injury-safety: load that can't ramp too fast, a real feedback loop, accurate GPS, wet-bulb heat awareness, and honest pricing.

App **#1 of 30**. Single self-contained web prototype (`app/index.html`) — no build step, no backend.

### 🔴 Live demo → **[soumyadg.github.io/stride-coach](https://soumyadg.github.io/stride-coach/)**  ·  installable PWA · works on mobile

<p align="center">
  <img src="app/screenshots/g1-goal.png" width="30%" alt="Onboarding — pick your goal">
  <img src="app/screenshots/12-font-today.png" width="30%" alt="Today — injury-risk radar">
  <img src="app/screenshots/g3-run.png" width="30%" alt="Live run — real map + heart rate">
</p>

---

## Screens

<table>
  <tr>
    <td width="33%"><img src="app/screenshots/g1-goal.png" alt="Pick your goal"></td>
    <td width="33%"><img src="app/screenshots/12-font-today.png" alt="Injury-risk radar"></td>
    <td width="33%"><img src="app/screenshots/g2-calendar.png" alt="Training calendar"></td>
  </tr>
  <tr>
    <td align="center"><b>Pick your goal</b><br><sub>Animated onboarding</sub></td>
    <td align="center"><b>Injury-risk radar</b><br><sub>Live ACWR heat-stress gauge</sub></td>
    <td align="center"><b>Training calendar</b><br><sub>SafeRamp load + deloads</sub></td>
  </tr>
  <tr>
    <td><img src="app/screenshots/g3-run.png" alt="Live run coaching"></td>
    <td><img src="app/screenshots/14-treadmill.png" alt="Treadmill mode"></td>
    <td><img src="app/screenshots/g4-stats.png" alt="Stats and records"></td>
  </tr>
  <tr>
    <td align="center"><b>Live run coaching</b><br><sub>Real map · Bluetooth HR · voice</sub></td>
    <td align="center"><b>Treadmill mode</b><br><sub>Speed-integrated distance</sub></td>
    <td align="center"><b>Stats &amp; records</b><br><sub>PRs + one-tap GPX export</sub></td>
  </tr>
  <tr>
    <td><img src="app/screenshots/11-pricing.png" alt="Free vs Pro pricing"></td>
    <td><img src="app/screenshots/13-loader.png" alt="Building your safe plan loader"></td>
    <td></td>
  </tr>
  <tr>
    <td align="center"><b>Honest free vs Pro</b><br><sub>Safety promise always free</sub></td>
    <td align="center"><b>Plan-building animation</b><br><sub>Neon Aurora theme</sub></td>
    <td></td>
  </tr>
</table>

---

## Why it exists

Most running apps optimise for a plan; **Stride optimises so the plan won't injure you.** Every design choice targets a real, documented failure mode in mainstream running apps:

| Common failure mode | Stride's fix |
|---|---|
| Load ramps too fast → injuries | **SafeRamp** — load mathematically cannot jump >10%/week |
| One-time plan, no feedback loop | **Daily readiness** + **post-run RPE** recalibration |
| GPS undercounts 100–200m at corners | Smoothed distance, no undercount |
| Nags "speed up" at red lights | **Smart auto-pause** |
| No free tier, can't cancel in-app | Real free tier, £6.99 Pro, 1-tap cancel |
| No injury-risk or heat modelling | **ACWR radar** + **wet-bulb heat** safety (sports-science standard) |

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
      W[✨ Why<br/>differentiators + pricing]
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
├── research/           # market research, competitor analysis, blueprint
├── STATE.md            # autonomous-build resume log
└── README.md           # this file
```

---

*Prototype built autonomously as app #1 of a 30-app sprint. Stride Coach is its own brand and product.*
