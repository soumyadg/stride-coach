//
//  WorkoutManager.swift
//  The engine: HealthKit live workout + GPS route + heart rate.
//
//  Standard watchOS pattern: HKWorkoutSession drives an HKLiveWorkoutBuilder,
//  which streams live statistics (HR, distance, energy) via its delegate. A
//  CLLocationManager feeds an HKWorkoutRouteBuilder so the route is saved too.
//

import Foundation
import HealthKit
import CoreLocation
import Combine

final class WorkoutManager: NSObject, ObservableObject {

    // MARK: Published live metrics (drive the SwiftUI views)
    @Published var isRunning = false
    @Published var isPaused  = false
    @Published var elapsed: TimeInterval = 0     // seconds
    @Published var distance: Double = 0          // metres
    @Published var heartRate: Double = 0         // bpm
    @Published var activeEnergy: Double = 0      // kcal
    @Published var mode: WorkoutMode = .run
    @Published var authorized = false
    @Published var lastError: String?

    enum WorkoutMode { case run, walk
        var hkActivity: HKWorkoutActivityType { self == .run ? .running : .walking }
        var title: String { self == .run ? "Run" : "Walk" }
    }

    private let healthStore = HKHealthStore()
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var routeBuilder: HKWorkoutRouteBuilder?
    private let locationManager = CLLocationManager()
    private var timer: Timer?
    private var startDate: Date?

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        locationManager.distanceFilter = 4
    }

    // MARK: Authorization
    func requestAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else { lastError = "Health data unavailable"; return }
        let typesToShare: Set = [
            HKQuantityType.workoutType(),
            HKSeriesType.workoutRoute()
        ]
        let typesToRead: Set = [
            HKQuantityType(.heartRate),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.distanceWalkingRunning),
            HKObjectType.activitySummaryType()
        ]
        healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { [weak self] ok, err in
            DispatchQueue.main.async {
                self?.authorized = ok
                if let err = err { self?.lastError = err.localizedDescription }
            }
        }
        locationManager.requestWhenInUseAuthorization()
    }

    // MARK: Start
    func start(mode: WorkoutMode) {
        self.mode = mode
        let config = HKWorkoutConfiguration()
        config.activityType = mode.hkActivity
        config.locationType = .outdoor

        do {
            session = try HKWorkoutSession(healthStore: healthStore, configuration: config)
            builder = session?.associatedWorkoutBuilder()
            builder?.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore, workoutConfiguration: config)
            routeBuilder = HKWorkoutRouteBuilder(healthStore: healthStore, device: nil)

            session?.delegate = self
            builder?.delegate = self

            let start = Date()
            startDate = start
            session?.startActivity(with: start)
            builder?.beginCollection(withStart: start) { [weak self] _, err in
                if let err = err { DispatchQueue.main.async { self?.lastError = err.localizedDescription } }
            }
            locationManager.startUpdatingLocation()
            startTimer()
            DispatchQueue.main.async { self.isRunning = true; self.isPaused = false }
        } catch {
            lastError = error.localizedDescription
        }
    }

    // MARK: Pause / resume
    func togglePause() {
        guard let session = session else { return }
        if isPaused { session.resume() } else { session.pause() }
    }

    // MARK: End
    func end() {
        locationManager.stopUpdatingLocation()
        session?.end()
        stopTimer()
    }

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self = self, let start = self.startDate, !self.isPaused else { return }
            self.elapsed = Date().timeIntervalSince(start)
        }
    }
    private func stopTimer() { timer?.invalidate(); timer = nil }

    // Pace in seconds per km (0 if not moving yet)
    var paceSecPerKm: Double {
        guard distance > 50, elapsed > 0 else { return 0 }
        return elapsed / (distance / 1000.0)
    }

    func reset() {
        isRunning = false; isPaused = false
        elapsed = 0; distance = 0; heartRate = 0; activeEnergy = 0
        session = nil; builder = nil; routeBuilder = nil; startDate = nil
    }
}

// MARK: - HKWorkoutSessionDelegate
extension WorkoutManager: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession,
                        didChangeTo toState: HKWorkoutSessionState,
                        from fromState: HKWorkoutSessionState,
                        date: Date) {
        DispatchQueue.main.async {
            self.isPaused = (toState == .paused)
            if toState == .running { self.isRunning = true }
        }
        // When the session ends, finalise the builder + route and save.
        if toState == .ended {
            builder?.endCollection(withEnd: date) { [weak self] _, _ in
                self?.builder?.finishWorkout { [weak self] workout, _ in
                    guard let self = self, let workout = workout else {
                        DispatchQueue.main.async { self?.isRunning = false }
                        return
                    }
                    // attach the GPS route to the saved workout
                    self.routeBuilder?.finishRoute(with: workout, metadata: nil) { _, _ in }
                    DispatchQueue.main.async { self.isRunning = false }
                }
            }
        }
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        DispatchQueue.main.async { self.lastError = error.localizedDescription; self.isRunning = false }
    }
}

// MARK: - HKLiveWorkoutBuilderDelegate (live metrics)
extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder,
                        didCollectDataOf collectedTypes: Set<HKSampleType>) {
        for type in collectedTypes {
            guard let qType = type as? HKQuantityType,
                  let stats = workoutBuilder.statistics(for: qType) else { continue }
            DispatchQueue.main.async {
                switch qType {
                case HKQuantityType(.heartRate):
                    let unit = HKUnit.count().unitDivided(by: .minute())
                    self.heartRate = stats.mostRecentQuantity()?.doubleValue(for: unit) ?? self.heartRate
                case HKQuantityType(.activeEnergyBurned):
                    self.activeEnergy = stats.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? self.activeEnergy
                case HKQuantityType(.distanceWalkingRunning):
                    self.distance = stats.sumQuantity()?.doubleValue(for: .meter()) ?? self.distance
                default: break
                }
            }
        }
    }
}

// MARK: - CLLocationManagerDelegate (GPS route)
extension WorkoutManager: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let good = locations.filter { $0.horizontalAccuracy >= 0 && $0.horizontalAccuracy <= 50 }
        guard !good.isEmpty else { return }
        routeBuilder?.insertRouteData(good) { _, _ in }
    }
}
