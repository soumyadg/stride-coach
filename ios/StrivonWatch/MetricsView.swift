//
//  MetricsView.swift
//  Live wrist metrics + controls. Swipe between the metrics page and controls.
//

import SwiftUI

struct MetricsView: View {
    @EnvironmentObject var workout: WorkoutManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        TabView {
            metricsPage.tag(0)
            controlsPage.tag(1)
        }
        .tabViewStyle(.verticalPage)
        .navigationBarBackButtonHidden(true)
    }

    // Page 1 — the numbers
    private var metricsPage: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(timeString(workout.elapsed))
                .font(.system(size: 34, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(workout.mode == .run
                    ? Color(red: 1, green: 0.42, blue: 0.24)
                    : Color(red: 0.18, green: 0.9, blue: 0.78))

            metric(value: String(format: "%.2f", workout.distance / 1000.0), unit: "km")
            metric(value: paceString(workout.paceSecPerKm), unit: "/km")
            metric(value: workout.heartRate > 0 ? "\(Int(workout.heartRate))" : "--", unit: "bpm")
            metric(value: "\(Int(workout.activeEnergy))", unit: "kcal")

            if workout.isPaused {
                Text("PAUSED").font(.caption2).bold().foregroundStyle(.yellow)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 8)
    }

    // Page 2 — pause / end
    private var controlsPage: some View {
        VStack(spacing: 12) {
            Button {
                workout.togglePause()
            } label: {
                Label(workout.isPaused ? "Resume" : "Pause",
                      systemImage: workout.isPaused ? "play.fill" : "pause.fill")
                    .frame(maxWidth: .infinity)
            }
            .tint(.yellow)

            Button(role: .destructive) {
                workout.end()
                dismiss()
                workout.reset()
            } label: {
                Label("End", systemImage: "stop.fill").frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 8)
    }

    private func metric(value: String, unit: String) -> some View {
        HStack(alignment: .lastTextBaseline, spacing: 4) {
            Text(value).font(.system(size: 24, weight: .bold, design: .rounded)).monospacedDigit()
            Text(unit).font(.footnote).foregroundStyle(.secondary)
        }
    }

    private func timeString(_ s: TimeInterval) -> String {
        let t = Int(s); return String(format: "%d:%02d", t / 60, t % 60)
    }
    private func paceString(_ secPerKm: Double) -> String {
        guard secPerKm > 0, secPerKm.isFinite else { return "--:--" }
        let t = Int(secPerKm.rounded()); return String(format: "%d:%02d", t / 60, t % 60)
    }
}
