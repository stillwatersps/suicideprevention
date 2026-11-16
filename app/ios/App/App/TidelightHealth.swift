import Foundation
import HealthKit

// Apple Health, and only if the person turns on "Add meditations to Apple Health" in Settings.
// Tidelight adds one kind of entry: mindful minutes, with when a meditation started and when it
// ended. It never adds a mood, a check-in, or a word, and it never reads anything from Health:
// no read access is ever asked for. It can remove the entries it added, and nothing else.
// A draft: no reviewer or lawyer has seen this.
final class TidelightHealth {
    static let shared = TidelightHealth()

    private let store: HKHealthStore? = HKHealthStore.isHealthDataAvailable() ? HKHealthStore() : nil
    private let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession)

    // "unavailable" (an iPad without Health, for example), "notDetermined", "allowed", or "denied".
    func status() -> String {
        guard let store = store, let type = mindful else { return "unavailable" }
        switch store.authorizationStatus(for: type) {
        case .sharingAuthorized: return "allowed"
        case .sharingDenied: return "denied"
        default: return "notDetermined"
        }
    }

    // The phone's own sheet asks the person. Write access to mindful minutes only; nothing to read.
    func ask(_ done: @escaping (String) -> Void) {
        guard let store = store, let type = mindful else { done("unavailable"); return }
        store.requestAuthorization(toShare: [type], read: []) { [weak self] _, _ in
            DispatchQueue.main.async { done(self?.status() ?? "unavailable") }
        }
    }

    func write(start: Date, end: Date, done: @escaping (Bool) -> Void) {
        guard let store = store, let type = mindful, status() == "allowed", end > start else { done(false); return }
        let sample = HKCategorySample(type: type, value: HKCategoryValue.notApplicable.rawValue, start: start, end: end)
        store.save(sample) { saved, _ in DispatchQueue.main.async { done(saved) } }
    }

    // Removes the mindful minutes this app added, and only those.
    func removeAll(done: @escaping (Bool, Int) -> Void) {
        guard let store = store, let type = mindful else { done(false, 0); return }
        let mine = HKQuery.predicateForObjects(from: HKSource.default())
        store.deleteObjects(of: type, predicate: mine) { removed, count, _ in
            DispatchQueue.main.async { done(removed, count) }
        }
    }
}
