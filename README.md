# 🏃 Strivon

> **The running coach that won't get you injured.**
> An adaptive running-plan & coaching app built around injury-safety: load that can't ramp too fast, a real feedback loop, accurate GPS, wet-bulb heat awareness, and honest pricing.

App **#1 of 30**. Single self-contained web prototype (`app/index.html`) — no build step, no backend.

### 🔴 Live demo → **[soumyadg.github.io/stride-coach](https://soumyadg.github.io/stride-coach/)**  ·  installable PWA · works on mobile

<p align="center">
  <img src="docs/screenshots/today.png" width="24%" alt="Today — injury-risk radar + plans">
  <img src="docs/screenshots/insights.png" width="24%" alt="On-device AI — race predictions, VO₂max, form">
  <img src="docs/screenshots/coach.png" width="24%" alt="AI coach + race-specific plans">
  <img src="docs/screenshots/atlas.png" width="24%" alt="Atlas — life story map + time capsules">
</p>

### 🗺️ Where this is going → **[Product vision: Strivon Atlas](docs/vision.html)**
> Not just a tracker — a *geographical autobiography*: your journeys fused with memories, future-self time capsules, an AI companion, a real-world RPG and a legacy that outlives you. See [`docs/vision.html`](docs/vision.html) for the full 18-part strategy (open it in a browser).

---

## Screens

<table>
  <tr>
    <td width="33%"><img src="docs/screenshots/today.png" alt="Today"></td>
    <td width="33%"><img src="docs/screenshots/insights.png" alt="Smart insights"></td>
    <td width="33%"><img src="docs/screenshots/coach.png" alt="AI coach"></td>
  </tr>
  <tr>
    <td align="center"><b>Today</b><br><sub>Injury-risk radar + multi-plan</sub></td>
    <td align="center"><b>Smart insights</b><br><sub>On-device race predictions · VO₂max · form</sub></td>
    <td align="center"><b>AI coach + voice</b><br><sub>Claude, grounded in your data · mic input</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/atlas.png" alt="Atlas life story map"></td>
    <td><img src="app/screenshots/g3-run.png" alt="Live run coaching"></td>
    <td><img src="app/screenshots/g4-stats.png" alt="Stats and records"></td>
  </tr>
  <tr>
    <td align="center"><b>🗺️ Atlas</b><br><sub>Life story map · memories · time capsules</sub></td>
    <td align="center"><b>Live run coaching</b><br><sub>Real map · Bluetooth HR · voice</sub></td>
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

Most running apps optimise for a plan; **Strivon optimises so the plan won't injure you.** Every design choice targets a real, documented failure mode in mainstream running apps:

| Common failure mode | Strivon's fix |
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
  root((Strivon))
    Plan
      SafeRamp generator
      Deload + taper
      Editable calendar
      Running or Walking mode
    Safety
      ACWR injury-risk radar
      Daily readiness check
      Wet-bulb heat safety
      BMI-based pace for beginners
    Run
      Lap-based intervals
      Live audio coaching TTS
      In-run learning lessons
      Smart auto-pause
      Real map + Bluetooth HR
      Treadmill mode
    Progress
      Stats + personal records
      BMI + pace suggestion
      GPX export
    Platform
      Installable PWA offline
      Native iOS + Android Capacitor
      Cloud accounts + sync Supabase
      Weather-tinted splash
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
    participant A as Strivon
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

## What's built (all free & working)

| Area | Capabilities |
|---|---|
| **Plan** | SafeRamp generator (≤10%/wk, deloads, taper), editable calendar, **Running or Walking** mode |
| **Safety** | ACWR injury-risk radar, daily readiness, **wet-bulb heat** (5-bucket app theme + warnings), **BMI-based pace** for beginners |
| **Run** | Lap-based intervals, live voice coaching, **in-run learning lessons**, smart auto-pause, real dark map, **Bluetooth HR** zones, **treadmill** mode |
| **Progress** | Stats, personal records, **BMI**, one-tap **GPX export** |
| **Platform** | Installable **PWA** (offline), native **iOS + Android** (Capacitor), cloud **accounts + sync** (Supabase), weather-tinted splash |

> Everything above works today, for free. **Pro** (Stripe) and store distribution are set up but not switched on — see the docs below.

## Docs

- **[NATIVE.md](NATIVE.md)** — build the native iOS/Android app (Capacitor)
- **[BACKEND.md](BACKEND.md)** — Supabase schema + offline-first sync design
- **[PRO.md](PRO.md)** — Stripe subscriptions + Pro gating (web only; App Store needs IAP)
- **[tests/](tests/)** — unit + stress + smoke battery (`await runStrideTests()`)
- **[research/](research/)** — market research, competitor analysis, blueprint

## Run it

```bash
cd app && python3 -m http.server 8791
# open http://localhost:8791/index.html  (mobile viewport)
```
Live: **[soumyadg.github.io/stride-coach](https://soumyadg.github.io/stride-coach/)** · Landing: **[/landing.html](https://soumyadg.github.io/stride-coach/landing.html)**

## Tech

- **Single-file** `app/index.html` — vanilla HTML/CSS/JS, `localStorage`, plus optional Supabase sync.
- Web APIs: Geolocation, SpeechSynthesis, Web Bluetooth, SVG map tiles, Notifications.
- Theme **"Neon Aurora"**; brand mark + logo set in `app/brand/`.
- Native shell via **Capacitor** (`ios/`, `android/`).

## Repo layout

```
stride-coach/
├── app/
│   ├── index.html          # the whole app
│   ├── config.js           # Supabase + Stripe keys (blank = fully offline)
│   ├── sync.js             # offline-first cloud sync
│   ├── native-bridge.js    # native GPS / BLE / Health / notifications
│   ├── landing.html        # marketing landing page
│   ├── brand/              # runner logo set (mark, app-icon, wordmarks)
│   └── screenshots/
├── ios/  · android/         # Capacitor native projects
├── supabase/migrations/     # accounts + sync schema (SQL)
├── supabase/functions/      # Stripe checkout + webhook (edge functions)
├── tests/                   # unit + stress + smoke battery
├── research/                # market research + blueprint
├── NATIVE.md · BACKEND.md · PRO.md · STATE.md
└── README.md
```

---

*Prototype built autonomously as app #1 of a 30-app sprint. Strivon is its own brand and product.*
