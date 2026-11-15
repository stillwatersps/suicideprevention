import WidgetKit
import SwiftUI

// A quiet way back into Tidelight from the Home Screen or the Lock Screen.
//
// A founder's rule for anything outside the app: it is discreet. The widget shows the app's name
// and one or two plain words. It never shows a mood, a check-in, a streak, a name, or anything
// about crisis, and it reads nothing the person saved: it has no access to the app's storage at
// all (there is no shared container). It never changes, so there is nothing to refresh.
//
// A tap opens the app at a named place through the app's own address (tidelight://open/...).
// The app, not the widget, decides what to show, and its lock still applies.
// A draft: these words have not been reviewed, and the widget has never run on a real phone.

struct QuietEntry: TimelineEntry {
    let date: Date
}

struct QuietProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuietEntry { QuietEntry(date: Date()) }
    func getSnapshot(in context: Context, completion: @escaping (QuietEntry) -> Void) { completion(QuietEntry(date: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<QuietEntry>) -> Void) {
        completion(Timeline(entries: [QuietEntry(date: Date())], policy: .never))
    }
}

enum Open {
    static let home = URL(string: "tidelight://open/home")!
    static let breathe = URL(string: "tidelight://open/breathe")!
    static let plan = URL(string: "tidelight://open/plan")!
}

struct TidelightWidgetView: View {
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
                HStack(spacing: 12) {
                    Link(destination: Open.breathe) { choice("widget.breathe", symbol: "wind") }
                    Link(destination: Open.plan) { choice("widget.plan", symbol: "list.bullet") }
                }
            }
        default:
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: "leaf").font(.title2)
                Spacer(minLength: 0)
                Text("Tidelight").font(.headline)
                Text("widget.breathe.long").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .widgetURL(Open.breathe)
        }
    }

    // One of the two taps on the wider widget: a word and a small picture, at least 44 points tall.
    private func choice(_ key: LocalizedStringKey, symbol: String) -> some View {
        Label(key, systemImage: symbol)
            .font(.subheadline.weight(.semibold))
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(.fill.secondary, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

@main
struct TidelightWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TidelightWidget", provider: QuietProvider()) { _ in
            TidelightWidgetView()
        }
        .configurationDisplayName("Tidelight")
        .description(Text("widget.description"))
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}
