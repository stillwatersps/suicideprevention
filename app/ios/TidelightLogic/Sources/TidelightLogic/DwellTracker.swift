import Foundation

/// Decides when the person has stayed inside one of their own places for the dwell time.
///
/// The phone's region monitoring reports "entered" and "exited" for each place. This tracker keeps
/// the entry time per place and says what to schedule or cancel. It never reads a location, keeps
/// no history of visits, and knows nothing about why a place was chosen. The app stores it as JSON
/// on the phone so a relaunch in the background can carry on where it left off.
public struct DwellTracker: Codable, Equatable {
    /// What the app should do after an event.
    public enum Action: Equatable {
        /// Schedule the dwell notification for this place at this time.
        case schedule(placeId: String, fireAt: Date)
        /// Cancel any dwell notification for this place.
        case cancel(placeId: String)
    }

    /// An alert that is due: the person has been inside `placeId` since `since`.
    public struct DueAlert: Equatable {
        public let placeId: String
        public let since: Date
        public init(placeId: String, since: Date) {
            self.placeId = placeId
            self.since = since
        }
    }

    /// How long the person must stay before an alert, in seconds.
    public private(set) var dwell: TimeInterval
    /// Entry time per place the phone is currently inside.
    public private(set) var inside: [String: Date] = [:]
    /// Places where the person said "I'm okay" or sent their message during this visit. No second
    /// alert until the phone leaves the place.
    public private(set) var acknowledged: Set<String> = []

    public init(dwell: TimeInterval) {
        self.dwell = max(0, dwell)
    }

    /// The phone entered a place. Returns the notification to schedule, or nil when nothing changes
    /// (already inside, or already acknowledged for this visit).
    public mutating func entered(_ placeId: String, at now: Date) -> Action? {
        if inside[placeId] != nil { return nil }
        inside[placeId] = now
        if acknowledged.contains(placeId) { return nil }
        return .schedule(placeId: placeId, fireAt: now.addingTimeInterval(dwell))
    }

    /// The phone left a place. Returns the cancellation when a visit was in progress.
    public mutating func exited(_ placeId: String, at now: Date) -> Action? {
        acknowledged.remove(placeId)
        guard inside.removeValue(forKey: placeId) != nil else { return nil }
        return .cancel(placeId: placeId)
    }

    /// The person tapped "I'm okay" or sent their message. Nothing more happens until they leave.
    public mutating func acknowledge(_ placeId: String) -> Action {
        acknowledged.insert(placeId)
        return .cancel(placeId: placeId)
    }

    /// The alert that is due right now, if any: inside for at least the dwell time and not
    /// acknowledged. When several are due, the longest stay comes first.
    public func dueAlert(at now: Date) -> DueAlert? {
        inside
            .filter { !acknowledged.contains($0.key) && now.timeIntervalSince($0.value) >= dwell }
            .sorted { $0.value < $1.value }
            .first
            .map { DueAlert(placeId: $0.key, since: $0.value) }
    }

    /// The person changed the dwell time. Every visit in progress is rescheduled from its own
    /// entry time, so a longer dwell waits longer and a shorter one may be due at once.
    public mutating func setDwell(_ seconds: TimeInterval, at now: Date) -> [Action] {
        dwell = max(0, seconds)
        return inside.keys.sorted().compactMap { id in
            acknowledged.contains(id) ? nil : .schedule(placeId: id, fireAt: inside[id]!.addingTimeInterval(dwell))
        }
    }

    /// The person removed places or turned the feature off. Visits to places no longer watched end
    /// now, and their notifications are cancelled.
    public mutating func keepOnly(_ placeIds: Set<String>, at now: Date) -> [Action] {
        let gone = inside.keys.filter { !placeIds.contains($0) }.sorted()
        return gone.compactMap { exited($0, at: now) }
    }

    /// Everything ends: the feature is off or the person deleted everything.
    public mutating func reset() -> [Action] {
        let ids = inside.keys.sorted()
        inside = [:]
        acknowledged = []
        return ids.map { .cancel(placeId: $0) }
    }

    /// iOS monitors at most this many regions for one app.
    public static let maxMonitoredPlaces = 20
}
