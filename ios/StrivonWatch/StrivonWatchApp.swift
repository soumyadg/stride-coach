//
//  StrivonWatchApp.swift
//  Strivon Watch — standalone run/walk tracker for Apple Watch.
//
//  It records a workout with GPS + heart rate using HealthKit, shows live
//  metrics on the wrist (keeps tracking with the wrist down), and SAVES the
//  finished workout to Apple Health. Your Strivon iPhone app then reads those
//  workouts from Health — so the watch needs no direct pairing plumbing for v1.
//

import SwiftUI

@main
struct StrivonWatchApp: App {
    // One shared workout engine for the whole app.
    @StateObject private var workout = WorkoutManager()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                StartView()
            }
            .environmentObject(workout)
        }
    }
}
