import WidgetKit
import SwiftUI
import ActivityKit

// A breathing session on the Lock Screen and in the Dynamic Island (a Live Activity), only if the
// person turned on "Show a breathing session on the Lock Screen" in the app's Settings.
//
// It is on a screen anyone can see, so it shows the app's name, one plain word, and the time
// left, which the phone counts down by itself. Once the time has passed it shows the name alone.
// It is given one thing by the app: when the session ends (BreathingAttributes.swift).
// A draft: these words have not been reviewed, and this has never run on a real phone.
struct BreathingLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BreathingAttributes.self) { context in
            HStack(spacing: 12) {
                Image(systemName: "wind").font(.title2)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Tidelight").font(.headline)
                    if !context.isStale { Text("widget.breathing").font(.subheadline) }
                }
                Spacer(minLength: 8)
                if !context.isStale { timeLeft(until: context.state.endsAt).font(.title3.weight(.semibold)) }
            }
            .padding()
            .widgetURL(Open.home)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { Image(systemName: "wind") }
                DynamicIslandExpandedRegion(.center) { Text("widget.breathing") }
                DynamicIslandExpandedRegion(.trailing) { timeLeft(until: context.state.endsAt) }
            } compactLeading: {
                Image(systemName: "wind")
            } compactTrailing: {
                timeLeft(until: context.state.endsAt).frame(maxWidth: 44)
            } minimal: {
                Image(systemName: "wind")
            }
            .widgetURL(Open.home)
        }
    }

    // The time left, counted down by the phone. Never a time that has already passed.
    private func timeLeft(until end: Date) -> some View {
        Text(timerInterval: Date()...max(Date(), end), countsDown: true)
            .monospacedDigit()
            .multilineTextAlignment(.trailing)
    }
}
