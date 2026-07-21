# 📱 Native app (Capacitor)

Strivon is wrapped with [Capacitor](https://capacitorjs.com) so the **same `app/` web code** builds as a real **iOS + Android** app for the App Store / Play Store. No rewrite.

- **App ID:** `com.stridecoach.app`
- **App name:** Strivon
- **Web source:** `app/` (Capacitor `webDir`)
- Native projects: `ios/` (Xcode, uses Swift Package Manager — no CocoaPods needed) and `android/` (Gradle).

## Background GPS (the whole reason to go native)
A browser/PWA **cannot** track with the screen locked — iOS suspends JavaScript. The native shell fixes this via **`@capacitor-community/background-geolocation`**, which runs a real `CLLocationManager` (iOS) / foreground service (Android) that keeps streaming fixes while the phone is in your pocket, screen off.

- Wired in `app/native-bridge.js` → `startGeo()` prefers `BackgroundGeolocation.addWatcher`, normalises its location shape to the web `pos.coords` shape the app already consumes, and **falls back** to `@capacitor/geolocation` then web GPS — so nothing breaks if the plugin isn't synced.
- iOS: `Info.plist` has `UIBackgroundModes → location` + an always-on usage string (App Store review reads these).
- Android: manifest has `ACCESS_BACKGROUND_LOCATION` + `FOREGROUND_SERVICE_LOCATION`.
- **Verify on a real device:** start a run, lock the phone, walk ~200 m, unlock → the route/distance must have kept accruing. (Simulators don't reproduce background suspension — must be a physical phone.)

> ⚠️ `@perfood/capacitor-healthkit@1.3.2` is a Capacitor-4-era plugin in a Capacitor-8 project — installs need `--legacy-peer-deps` and it may not compile under Xcode 15+. Being replaced with a Cap-8 health plugin (roadmap item #5).

## After you change the web app
Copy the latest `app/` into the native projects:
```bash
npm run sync          # = npx cap sync
```

## Build & run on your iPhone (free, no store)
Needs **full Xcode** (install from the Mac App Store, then `sudo xcodebuild -runFirstLaunch`).
```bash
npm run sync
npm run open:ios      # opens ios/App/App.xcodeproj in Xcode
```
In Xcode: pick your iPhone as the target, set a free Apple ID signing team, press ▶. The app installs on your phone. (A free Apple ID lets you run on your own device for 7 days per build; the paid $99/yr Developer account is only needed to submit to the App Store.)

## Build & run on Android
Needs **Android Studio** + a JDK (17+).
```bash
npm run sync
npm run open:android  # opens android/ in Android Studio
```
Press ▶ with a device/emulator selected.

## Native plugins (installed + wired)
The app uses these when running natively, and falls back to web APIs in the browser (`app/native-bridge.js`):

| Plugin | Used for | Status |
|---|---|---|
| `@capacitor/geolocation` @8 | Native high-accuracy GPS run tracking (bg mode declared) | ✅ wired (GPS start/stop) |
| `@capacitor-community/bluetooth-le` @8 | Heart-rate strap over BLE — **works on iOS** (Web Bluetooth doesn't) | ✅ wired (best-effort, verify on device) |
| `@perfood/capacitor-healthkit` | Apple Health authorization / read | ⚠️ installed; see caveat |

**Permissions configured:** iOS `Info.plist` (location, bluetooth, health usage strings + background modes); Android `AndroidManifest.xml` (fine/background location, BLUETOOTH_SCAN/CONNECT, Health Connect).

### ⚠️ HealthKit build caveat
`@perfood/capacitor-healthkit` has **no `Package.swift`**, so it doesn't integrate with the iOS project's Swift Package Manager setup (Capacitor 8 default). To use HealthKit, at build time either:
1. switch the iOS project to **CocoaPods** (`npx cap add ios` after removing SPM), or
2. swap to a **SPM-compatible** health plugin, or
3. add the HealthKit capability + Health framework manually in Xcode.
Also: the HealthKit **capability/entitlement** must be enabled in Xcode (Signing & Capabilities → + HealthKit) before it works. GPS + BLE need no such step.

## Still to add later
- `@capacitor/push-notifications`
- native OAuth → one-tap Strava/Garmin sync
- writing completed workouts to Apple Health / Health Connect (needs a write-capable plugin)

## Prerequisites status (this machine, 2026-07-20)
- ✅ Node / npm, Capacitor project scaffolded
- ❌ Full **Xcode** — only Command Line Tools installed (needed for iOS)
- ❌ **Android Studio + JDK** (needed for Android)
Install those two to build. The web app also stays live as a PWA at https://soumyadg.github.io/stride-coach/.
