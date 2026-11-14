import Foundation
import CoreLocation
import UserNotifications

// "Places that are hard for me" (idea E1), native side. Draft, not reviewed, never run on a phone.
//
// The person chooses their own places in the app. This object asks iOS to watch those places
// (region monitoring, at most 20) and, when the phone has stayed inside one for the dwell time,
// shows a notification from the phone itself. Nothing here reads a location continuously, keeps a
// history of visits, or sends anything anywhere. Everything is stored on the phone, in the app's
// own defaults. The words it shows all come from the app's text files, through the plugin.

struct WatchedPlace: Codable, Equatable {
    var id: String
    var name: String
    var latitude: Double
    var longitude: Double
    var radius: Double
}

struct TrustedContact: Codable, Equatable {
    var name: String
    var phone: String
}

/// Every word the notification can show. Filled from app/src/text/*.html, never from here.
struct PlaceWords: Codable, Equatable {
    var title = "Tidelight"
    var body = ""              // neutral, for the lock screen
    var bodyWithPlace = ""     // "{place}" and "{minutes}" are filled in
    var okay = ""
    var send = ""
    var call988 = ""
    var call911 = ""
}

struct PlacesConfig: Codable, Equatable {
    var enabled = false
    var dwellMinutes = 20
    var countdownSeconds = 30
    var message = ""
    var showPlaceOnLockScreen = false
    var places: [WatchedPlace] = []
    var contacts: [TrustedContact] = []
    var words = PlaceWords()
}

/// What the app shows when an alert is due.
struct DueAlertInfo {
    let placeId: String
    let placeName: String
    let since: Date
    let minutes: Int
    var asDictionary: [String: Any] {
        ["placeId": placeId, "placeName": placeName, "since": since.timeIntervalSince1970 * 1000, "minutes": minutes]
    }
}

final class PlaceWatcher: NSObject, CLLocationManagerDelegate {
    static let shared = PlaceWatcher()
    static let placeCategory = "TIDELIGHT_PLACE"
    static let actionOkay = "TIDELIGHT_OKAY"
    static let actionSend = "TIDELIGHT_SEND"
    static let action988 = "TIDELIGHT_988"
    static let action911 = "TIDELIGHT_911"
    static let notificationPrefix = "tidelight.place."
    static let regionPrefix = "tidelight.place."

    private let manager = CLLocationManager()
    private let defaults = UserDefaults.standard
    private let configKey = "tidelight.places.config.v1"
    private let trackerKey = "tidelight.places.tracker.v1"

    private(set) var config = PlacesConfig()
    private(set) var tracker = DwellTracker(dwell: 20 * 60)
    private(set) var lastLocation: CLLocation?
    private(set) var monitoringFailures: [String: String] = [:]
    private var started = false

    /// The plugin sets this to tell the page when an alert comes due while the app is open.
    var onAlertDue: ((DueAlertInfo) -> Void)?
    /// The plugin sets this to learn when location permission changes.
    var onAuthorizationChange: (() -> Void)?

    private override init() {
        super.init()
        if let data = defaults.data(forKey: configKey), let saved = try? JSONDecoder().decode(PlacesConfig.self, from: data) {
            config = saved
        }
        if let data = defaults.data(forKey: trackerKey), let saved = try? JSONDecoder().decode(DwellTracker.self, from: data) {
            tracker = saved
        } else {
            tracker = DwellTracker(dwell: TimeInterval(config.dwellMinutes * 60))
        }
    }

    // MARK: - Starting

    /// Called from the app delegate at every launch, including a launch in the background caused by
    /// a region event, so the location manager exists before iOS delivers the event.
    func start() {
        guard !started else { return }
        started = true
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        manager.pausesLocationUpdatesAutomatically = true
        syncRegions()
        registerCategories()
    }

    // MARK: - Configuration from the page

    func apply(_ newConfig: PlacesConfig) {
        var next = newConfig
        if next.places.count > DwellTracker.maxMonitoredPlaces {
            next.places = Array(next.places.prefix(DwellTracker.maxMonitoredPlaces))
        }
        let now = Date()
        config = next
        saveConfig()
        var actions: [DwellTracker.Action] = []
        if !config.enabled {
            actions += tracker.reset()
        } else {
            actions += tracker.keepOnly(Set(config.places.map { $0.id }), at: now)
            actions += tracker.setDwell(TimeInterval(config.dwellMinutes * 60), at: now)
        }
        saveTracker()
        perform(actions)
        registerCategories()
        syncRegions()
    }

    func status() -> [String: Any] {
        let auth: String
        switch manager.authorizationStatus {
        case .notDetermined: auth = "notDetermined"
        case .restricted: auth = "restricted"
        case .denied: auth = "denied"
        case .authorizedAlways: auth = "always"
        case .authorizedWhenInUse: auth = "whenInUse"
        @unknown default: auth = "unknown"
        }
        return [
            "locationAuthorization": auth,
            "monitoringAvailable": CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self),
            "monitoredCount": manager.monitoredRegions.filter { $0.identifier.hasPrefix(PlaceWatcher.regionPrefix) }.count,
            "maxPlaces": DwellTracker.maxMonitoredPlaces,
            "enabled": config.enabled,
            "monitoringProblems": monitoringFailures,
        ]
    }

    func requestWhenInUse() { manager.requestWhenInUseAuthorization() }
    func requestAlways() { manager.requestAlwaysAuthorization() }
    func requestOneLocation() { manager.requestLocation() }

    // MARK: - Alerts

    func pendingAlert(at now: Date = Date()) -> DueAlertInfo? {
        guard config.enabled, let due = tracker.dueAlert(at: now) else { return nil }
        return info(for: due.placeId, since: due.since, now: now)
    }

    /// "I'm okay", or the message was sent: nothing more until the phone leaves the place.
    func acknowledge(placeId: String) {
        perform([tracker.acknowledge(placeId)])
        saveTracker()
    }

    func place(withId id: String) -> WatchedPlace? { config.places.first { $0.id == id } }

    /// The coordinates to put in the message: the phone's recent location, or the place itself.
    func locationForMessage(placeId: String?) -> (latitude: Double, longitude: Double)? {
        if let last = lastLocation, Date().timeIntervalSince(last.timestamp) < 10 * 60 {
            return (last.coordinate.latitude, last.coordinate.longitude)
        }
        if let id = placeId, let place = place(withId: id) { return (place.latitude, place.longitude) }
        if let last = lastLocation { return (last.coordinate.latitude, last.coordinate.longitude) }
        return nil
    }

    private func info(for placeId: String, since: Date, now: Date) -> DueAlertInfo {
        let name = place(withId: placeId)?.name ?? ""
        return DueAlertInfo(placeId: placeId, placeName: name, since: since, minutes: Int(now.timeIntervalSince(since) / 60))
    }

    // MARK: - Region events

    private func syncRegions() {
        let wanted = config.enabled ? config.places : []
        let wantedIds = Set(wanted.map { PlaceWatcher.regionPrefix + $0.id })
        for region in manager.monitoredRegions where region.identifier.hasPrefix(PlaceWatcher.regionPrefix) {
            if !wantedIds.contains(region.identifier) { manager.stopMonitoring(for: region) }
        }
        NSLog("Tidelight places: sync, enabled=%d wanted=%d available=%d auth=%d", config.enabled ? 1 : 0, wanted.count,
              CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) ? 1 : 0, manager.authorizationStatus.rawValue)
        guard config.enabled, CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else { return }
        let existing = Set(manager.monitoredRegions.map { $0.identifier })
        for place in wanted {
            let id = PlaceWatcher.regionPrefix + place.id
            let center = CLLocationCoordinate2D(latitude: place.latitude, longitude: place.longitude)
            let region = CLCircularRegion(center: center, radius: max(50, min(place.radius, manager.maximumRegionMonitoringDistance)), identifier: id)
            region.notifyOnEntry = true
            region.notifyOnExit = true
            if existing.contains(id) {
                // Replace it in case the pin or radius changed.
                if let old = manager.monitoredRegions.first(where: { $0.identifier == id }) { manager.stopMonitoring(for: old) }
            }
            manager.startMonitoring(for: region)
            manager.requestState(for: region)
        }
    }

    private func placeId(from region: CLRegion) -> String? {
        guard region.identifier.hasPrefix(PlaceWatcher.regionPrefix) else { return nil }
        return String(region.identifier.dropFirst(PlaceWatcher.regionPrefix.count))
    }

    func locationManager(_ manager: CLLocationManager, didStartMonitoringFor region: CLRegion) {
        NSLog("Tidelight places: now watching %@", region.identifier)
    }

    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        NSLog("Tidelight places: entered %@", region.identifier)
        guard config.enabled, let id = placeId(from: region) else { return }
        if let action = tracker.entered(id, at: Date()) { perform([action]) }
        saveTracker()
    }

    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        guard let id = placeId(from: region) else { return }
        if let action = tracker.exited(id, at: Date()) { perform([action]) }
        saveTracker()
    }

    func locationManager(_ manager: CLLocationManager, didDetermineState state: CLRegionState, for region: CLRegion) {
        NSLog("Tidelight places: state %d for %@", state.rawValue, region.identifier)
        guard let id = placeId(from: region) else { return }
        switch state {
        case .inside: locationManager(manager, didEnterRegion: region)
        case .outside: locationManager(manager, didExitRegion: region)
        case .unknown: break
        @unknown default: break
        }
        _ = id
    }

    func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        NSLog("Tidelight places: monitoring failed for %@: %@", region?.identifier ?? "?", error.localizedDescription)
        if let id = region.flatMap(placeId(from:)) { monitoringFailures[id] = error.localizedDescription }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        lastLocation = locations.last
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // A one-shot location request failed. The message falls back to the place itself.
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        syncRegions()
        onAuthorizationChange?()
    }

    // MARK: - Notifications from the phone itself

    private func registerCategories() {
        let w = config.words
        let actions = [
            UNNotificationAction(identifier: PlaceWatcher.actionOkay, title: w.okay.isEmpty ? "OK" : w.okay, options: []),
            UNNotificationAction(identifier: PlaceWatcher.actionSend, title: w.send.isEmpty ? "Send" : w.send, options: [.foreground]),
            UNNotificationAction(identifier: PlaceWatcher.action988, title: w.call988.isEmpty ? "988" : w.call988, options: [.foreground]),
            UNNotificationAction(identifier: PlaceWatcher.action911, title: w.call911.isEmpty ? "911" : w.call911, options: [.foreground, .destructive]),
        ]
        let category = UNNotificationCategory(identifier: PlaceWatcher.placeCategory, actions: actions, intentIdentifiers: [], options: [])
        // Only our own category: the reminders plugin registers nothing, and categories replace each other.
        UNUserNotificationCenter.current().setNotificationCategories([category])
    }

    private func perform(_ actions: [DwellTracker.Action]) {
        let center = UNUserNotificationCenter.current()
        for action in actions {
            switch action {
            case .cancel(let placeId):
                center.removePendingNotificationRequests(withIdentifiers: [PlaceWatcher.notificationPrefix + placeId])
                center.removeDeliveredNotifications(withIdentifiers: [PlaceWatcher.notificationPrefix + placeId])
            case .schedule(let placeId, let fireAt):
                let content = UNMutableNotificationContent()
                let w = config.words
                let name = place(withId: placeId)?.name ?? ""
                content.title = w.title
                content.body = config.showPlaceOnLockScreen
                    ? w.bodyWithPlace.replacingOccurrences(of: "{place}", with: name).replacingOccurrences(of: "{minutes}", with: String(config.dwellMinutes))
                    : w.body
                content.sound = .default
                content.categoryIdentifier = PlaceWatcher.placeCategory
                content.userInfo = ["kind": "tidelightPlace", "placeId": placeId]
                if #available(iOS 15.0, *) { content.interruptionLevel = .timeSensitive }
                let seconds = max(1, fireAt.timeIntervalSinceNow)
                let trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: false)
                let request = UNNotificationRequest(identifier: PlaceWatcher.notificationPrefix + placeId, content: content, trigger: trigger)
                center.removePendingNotificationRequests(withIdentifiers: [request.identifier])
                center.add(request)
            }
        }
    }

    #if DEBUG
    /// Test builds only: pretend the phone just entered this place, so the dwell notification and
    /// the alert screen can be tried in the Simulator, where region monitoring isn't available.
    func debugEnter(placeId: String) {
        guard config.enabled, place(withId: placeId) != nil else { return }
        if let action = tracker.entered(placeId, at: Date()) { perform([action]) }
        saveTracker()
    }
    #endif

    /// The dwell notification fired while the app was open, or the person tapped it.
    func alertFired(placeId: String) {
        guard config.enabled, let since = tracker.inside[placeId] else { return }
        onAlertDue?(info(for: placeId, since: since, now: Date()))
    }

    private func saveConfig() {
        if let data = try? JSONEncoder().encode(config) { defaults.set(data, forKey: configKey) }
    }
    private func saveTracker() {
        if let data = try? JSONEncoder().encode(tracker) { defaults.set(data, forKey: trackerKey) }
    }
}
