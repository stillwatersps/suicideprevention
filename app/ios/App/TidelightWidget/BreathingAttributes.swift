import Foundation
import ActivityKit

// What the Lock Screen is told about a breathing session the app started: when it ends, and
// nothing else. No name, no mood, no kind of session, nothing the person saved.
// This one file is part of both the app and the widget, so both mean the same thing by it.
@available(iOS 16.2, *)
struct BreathingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endsAt: Date
    }
}
