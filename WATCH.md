# ⌚ Strivon Apple Watch app — build & test on your own watch

A **standalone** watchOS run/walk tracker (Swift/SwiftUI + HealthKit). It records a
workout with **GPS + heart rate**, shows live metrics on the wrist, keeps tracking
with the wrist down, and **saves each workout to Apple Health**. Your Strivon iPhone
app then reads those workouts from Health — so v1 needs no direct phone↔watch plumbing.

Source lives in `ios/StrivonWatch/`:
- `StrivonWatchApp.swift` — app entry
- `WorkoutManager.swift` — the engine (HKWorkoutSession + live builder + GPS route)
- `StartView.swift` — Run / Walk picker
- `MetricsView.swift` — live metrics + pause/end
- `Info.plist` — Health + Location usage strings, workout background mode

---

## Why the files aren't auto-added to the Xcode project
Adding a watchOS **target** rewrites Xcode's `project.pbxproj`, which is fragile to edit
by hand and easy to corrupt. So the safe path is: let **Xcode create the target** (30s),
then drop these ready-made files in. Steps below.

## One-time setup in Xcode (~5 min)
1. `cd ~/Desktop/apps/stride-coach && npx cap sync ios` — make sure the iOS project is current.
2. Open the project: `npm run open:ios` (opens `ios/App/App.xcodeproj`).
3. **File ▸ New ▸ Target…** → choose **watchOS ▸ App** → Next.
   - Product Name: **StrivonWatch**
   - Interface: **SwiftUI**, Language: **Swift**
   - "Embed in Companion Application": select **App** (the Strivon iOS app).
   - Finish. (If Xcode asks to activate the scheme, say Activate.)
4. Xcode generates a `StrivonWatch Watch App` group with placeholder `…App.swift` and
   `ContentView.swift`. **Delete those two placeholders** (Move to Trash).
5. **Drag the four `.swift` files** from `ios/StrivonWatch/` into the new watch group
   (check "Copy items if needed" and tick the **StrivonWatch** target).
6. Open the watch target's **Info** tab and add these keys (or replace its Info.plist
   with `ios/StrivonWatch/Info.plist`):
   - `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`,
     `NSLocationWhenInUseUsageDescription`
   - Background Modes → **Workout processing** (adds `WKBackgroundModes: workout-processing`).
7. Target **Signing & Capabilities** → set your Apple ID team (free personal team is fine)
   and add the **HealthKit** capability.

## Run it on your watch
1. On the watch: Settings ▸ (General) enable Developer Mode if prompted; keep it near/on-wrist.
2. In Xcode, pick the **StrivonWatch** scheme + your watch (or "Apple Watch via iPhone") as the destination.
3. Press ▶. First launch asks for Health + Location — allow both.
4. Tap **Run** or **Walk**, move around outdoors for a few minutes, then swipe to
   **End**. The workout saves to Apple Health.
5. Verify: open Apple Health ▸ Browse ▸ Workouts — your session is there. Then in the
   Strivon phone app it flows in via Health/import.

## Honest caveats
- **Standalone v1:** the watch app doesn't yet start/stop the *phone's* session or push
  live data to it — it saves to Health and the phone reads from there. Direct live sync
  (WatchConnectivity) is a v2 if you want the phone screen to mirror the watch in real time.
- **A real device is required** to verify GPS + HR + wrist-down tracking — the watch
  Simulator doesn't provide real sensors.
- **Free Apple ID** lets you run it on your own watch for 7 days per build; the paid
  ($99/yr) Developer account is only needed to ship to the App Store.
- Requires a paired **iPhone + Apple Watch** and Xcode 15+.
