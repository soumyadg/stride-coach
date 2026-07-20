# 📱 Native app (Capacitor)

Stride Coach is wrapped with [Capacitor](https://capacitorjs.com) so the **same `app/` web code** builds as a real **iOS + Android** app for the App Store / Play Store. No rewrite.

- **App ID:** `com.stridecoach.app`
- **App name:** Stride Coach
- **Web source:** `app/` (Capacitor `webDir`)
- Native projects: `ios/` (Xcode, uses Swift Package Manager — no CocoaPods needed) and `android/` (Gradle).

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

## Next: native superpowers (what web can't do)
These are Capacitor plugins to add when ready — they're also what makes Apple accept the app (not "just a website"):
- `@capacitor/geolocation` + background mode — GPS tracking with screen off
- native **Bluetooth LE** heart-rate (works on iOS, unlike Web Bluetooth)
- **HealthKit / Google Fit** sync
- `@capacitor/push-notifications`
- native OAuth → real one-tap Strava/Garmin sync

## Prerequisites status (this machine, 2026-07-20)
- ✅ Node / npm, Capacitor project scaffolded
- ❌ Full **Xcode** — only Command Line Tools installed (needed for iOS)
- ❌ **Android Studio + JDK** (needed for Android)
Install those two to build. The web app also stays live as a PWA at https://soumyadg.github.io/stride-coach/.
