import WidgetKit
import SwiftUI
import AppIntents

// A quiet way back into Tidelight from the Home Screen or the Lock Screen.
//
// A founder's rule for anything outside the app: it is discreet. The widget shows the app's name
// and one or two plain words. It never shows a mood, a check-in, a streak, a name, or anything
// about crisis, and it reads nothing the person saved: it has no access to the app's storage at
// all (there is no shared container).
//
// A tap opens the app at a named place through the app's own address (tidelight://open/...).
// The app, not the widget, decides what to show, and its lock still applies.
//
// One thing happens on the widget itself: "Start here" runs a breathing minute in place, with a
// pace in words and the time left, and the app is not opened. For that the widget keeps one
// number in its own storage (which the app can't read, and which says nothing about the person):
// when that minute ends. Outside that minute the widget never changes.
// A draft: these words have not been reviewed, and the widget has never run on a real phone.

struct QuietEntry: TimelineEntry {
    let date: Date
    // When a breathing minute started on the widget ends; nil when none is running.
    let breathingUntil: Date?
}

enum BreathingMinute {
    static let key = "breathingUntil"
    static let seconds: TimeInterval = 60
    static func until(now: Date) -> Date? {
        let stored = UserDefaults.standard.double(forKey: BreathingMinute.key)
        guard stored > 0 else { return nil }
        let end = Date(timeIntervalSince1970: stored)
        return end > now ? end : nil
    }
}

// The widget's one button. The phone runs this without opening the app, then asks the widget to
// draw itself again.
struct StartBreathingIntent: AppIntent {
    static var title: LocalizedStringResource = "widget.breathe.long"
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult {
        UserDefaults.standard.set(Date().addingTimeInterval(BreathingMinute.seconds).timeIntervalSince1970, forKey: BreathingMinute.key)
        return .result()
    }
}

struct QuietProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuietEntry { QuietEntry(date: Date(), breathingUntil: nil) }
    func getSnapshot(in context: Context, completion: @escaping (QuietEntry) -> Void) { completion(QuietEntry(date: Date(), breathingUntil: nil)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<QuietEntry>) -> Void) {
        let now = Date()
        var entries = [QuietEntry(date: now, breathingUntil: BreathingMinute.until(now: now))]
        // During a breathing minute there is a second entry: the moment it ends, back to rest.
        if let end = entries[0].breathingUntil { entries.append(QuietEntry(date: end, breathingUntil: nil)) }
        completion(Timeline(entries: entries, policy: .never))
    }
}

enum Open {
    static let home = URL(string: "tidelight://open/home")!
    static let breathe = URL(string: "tidelight://open/breathe")!
    static let plan = URL(string: "tidelight://open/plan")!
}

struct TidelightWidgetView: View {
    let entry: QuietEntry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        content.containerBackground(.fill.tertiary, for: .widget)
    }

    @ViewBuilder private var content: some View {
        switch family {
        case .accessoryCircular:
            Image(systemName: "leaf").font(.title2).accessibilityLabel(Text("Tidelight")).widgetURL(Open.home)
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Label("Tidelight", systemImage: "leaf").font(.headline)
                Text("widget.breathe.long").font(.caption)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .widgetURL(Open.breathe)
        case .systemMedium:
            VStack(alignment: .leading, spacing: 12) {
                Label("Tidelight", systemImage: "leaf").font(.headline)
                if let end = entry.breathingUntil {
                    breathing(until: end)
                } else {
                    HStack(spacing: 12) {
                        Button(intent: StartBreathingIntent()) { choice("widget.start", symbol: "wind") }.buttonStyle(.plain)
                        Link(destination: Open.plan) { choice("widget.plan", symbol: "list.bullet") }
                    }
                }
            }
        default:
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: "leaf").font(.title2)
                Spacer(minLength: 0)
                Text("Tidelight").font(.headline)
                if let end = entry.breathingUntil {
                    breathing(until: end)
                } else {
                    Button(intent: StartBreathingIntent()) { choice("widget.start", symbol: "wind") }.buttonStyle(.plain)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .widgetURL(Open.home)
        }
    }

    // A breathing minute, in place: a pace in words and the time left, which the phone counts down.
    private func breathing(until end: Date) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("widget.pace").font(.subheadline)
            Text(timerInterval: entry.date...max(entry.date, end), countsDown: true)
                .monospacedDigit()
                .font(.title3.weight(.semibold))
        }
        .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
    }

    // One of the taps on the widget: a word and a small picture, at least 44 points tall.
    private func choice(_ key: LocalizedStringKey, symbol: String) -> some View {
        Label(key, systemImage: symbol)
            .font(.subheadline.weight(.semibold))
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(.fill.secondary, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

struct TidelightWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TidelightWidget", provider: QuietProvider()) { entry in
            TidelightWidgetView(entry: entry)
        }
        .configurationDisplayName("Tidelight")
        .description(Text("widget.description"))
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}

// The widget, and the Lock Screen's view of a breathing session the app started (BreathingLive.swift).
@main
struct TidelightWidgets: WidgetBundle {
    var body: some Widget {
        TidelightWidget()
        BreathingLiveActivity()
    }
}
