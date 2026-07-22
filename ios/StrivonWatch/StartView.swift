//
//  StartView.swift
//  Pick Run or Walk, then go. Mirrors the phone app's run/walk split.
//

import SwiftUI

struct StartView: View {
    @EnvironmentObject var workout: WorkoutManager

    var body: some View {
        VStack(spacing: 10) {
            Text("Strivon")
                .font(.system(size: 20, weight: .heavy, design: .rounded))
                .foregroundStyle(LinearGradient(colors: [Color(red: 1, green: 0.42, blue: 0.24),
                                                         Color(red: 0.18, green: 0.9, blue: 0.78)],
                                                startPoint: .leading, endPoint: .trailing))

            NavigationLink {
                MetricsView().onAppear { workout.start(mode: .run) }
            } label: {
                Label("Run", systemImage: "figure.run")
                    .frame(maxWidth: .infinity)
            }
            .tint(Color(red: 1, green: 0.42, blue: 0.24))

            NavigationLink {
                MetricsView().onAppear { workout.start(mode: .walk) }
            } label: {
                Label("Walk", systemImage: "figure.walk")
                    .frame(maxWidth: .infinity)
            }
            .tint(Color(red: 0.18, green: 0.9, blue: 0.78))

            if !workout.authorized {
                Text("Grant Health & Location access to track.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 6)
        .onAppear { workout.requestAuthorization() }
    }
}
