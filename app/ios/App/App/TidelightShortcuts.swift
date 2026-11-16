import AppIntents
import Foundation

// Shortcuts and Siri: two plain ways into the app, the same two the widget offers. Each only
// opens Tidelight at a place: a minute of breathing, or the person's plan. They read nothing the
// person saved, say nothing about them, and work behind the app lock if it is on.
//
// Their names show in the Shortcuts app and in search, where anyone holding the phone can see
// them, so they are as discreet as the widget's words: no mood, no crisis, and not the word
// "safety". The words are in Localizable.strings and AppShortcuts.strings (English and Spanish).
// A draft: no reviewer has seen them.

extension Notification.Name {
    static let tidelightShortcut = Notification.Name("TidelightShortcut")
}

// Where a shortcut asked to go, kept until the page is ready to be told (the app may have been
// closed when the shortcut ran). One word, "breathe" or "plan", and nothing else.
enum TidelightShortcuts {
    static var pending: String?

    @MainActor static func open(_ word: String) {
        pending = word
        NotificationCenter.default.post(name: .tidelightShortcut, object: word)
    }
}

@available(iOS 16.0, *)
struct BreatheIntent: AppIntent {
    static var title: LocalizedStringResource = "A minute to breathe"
    static var description = IntentDescription("Opens Tidelight at a minute of breathing.")
    static var openAppWhenRun: Bool = true

    @MainActor func perform() async throws -> some IntentResult {
        TidelightShortcuts.open("breathe")
        return .result()
    }
}

@available(iOS 16.0, *)
struct PlanIntent: AppIntent {
    static var title: LocalizedStringResource = "My plan"
    static var description = IntentDescription("Opens Tidelight at your plan.")
    static var openAppWhenRun: Bool = true

    @MainActor func perform() async throws -> some IntentResult {
        TidelightShortcuts.open("plan")
        return .result()
    }
}

@available(iOS 16.4, *)
struct TidelightAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: BreatheIntent(),
            phrases: ["A minute to breathe with \(.applicationName)", "Breathe with \(.applicationName)"],
            shortTitle: "A minute to breathe",
            systemImageName: "wind"
        )
        AppShortcut(
            intent: PlanIntent(),
            phrases: ["Open my plan in \(.applicationName)", "My plan in \(.applicationName)"],
            shortTitle: "My plan",
            systemImageName: "list.bullet"
        )
    }
}
