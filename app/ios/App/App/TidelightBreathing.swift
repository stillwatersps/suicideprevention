import Foundation
import ActivityKit

// Starts and ends the Lock Screen's view of a breathing session (a Live Activity). The app asks
// for it only when the person has turned it on in Settings and a breathing session begins.
// The phone is told one thing: when the session ends. See TidelightWidget/BreathingLive.swift.
// A draft: this has never run on a real phone.
@available(iOS 16.2, *)
enum TidelightBreathing {
    // Ends whatever is showing, then shows a new one that ends `seconds` from now.
    // `done(true)` if the phone accepted it; false if Live Activities are off for the app.
    static func start(seconds: Double, done: @escaping (Bool) -> Void) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { done(false); return }
        Task {
            await endAll()
            let endsAt = Date().addingTimeInterval(seconds)
            let content = ActivityContent(state: BreathingAttributes.ContentState(endsAt: endsAt), staleDate: endsAt)
            do {
                _ = try Activity.request(attributes: BreathingAttributes(), content: content, pushType: nil)
                done(true)
            } catch {
                done(false)
            }
        }
    }

    // Takes it off the Lock Screen at once.
    static func end(done: @escaping () -> Void) {
        Task {
            await endAll()
            done()
        }
    }

    private static func endAll() async {
        for activity in Activity<BreathingAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }
}
