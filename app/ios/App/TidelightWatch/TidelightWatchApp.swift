import SwiftUI
import WatchKit

// Tidelight on Apple Watch: a silent minute of breathing, and the same three crisis lines the
// phone app's support screen has (call 988, text 988, call 911), one tap away on its first screen.
//
// It is its own small program. It stores nothing, reads nothing the phone app saved, talks to no
// server and not to the phone app, sends no notification, and has no watch-face complication, so
// nothing about the person shows on the watch outside the app. Its only name outside is
// "Tidelight". The words are in Localizable.strings (English and Spanish). A draft: no reviewer
// has seen it, and it has not run on a watch.

@main
struct TidelightWatchApp: App {
    var body: some Scene {
        WindowGroup { HomeView() }
    }
}

// The addresses are the phone app's own: the support screen's three lines, and in Spanish the
// word AYUDA filled in for a text, as the Spanish pages ask.
enum CrisisLine {
    static let call988 = URL(string: "tel:988")!
    static let call911 = URL(string: "tel:911")!
    static var text988: URL {
        let spanish = Bundle.main.preferredLocalizations.first == "es"
        return URL(string: spanish ? "sms:988?&body=AYUDA" : "sms:988")!
    }
}

struct HomeView: View {
    var body: some View {
        NavigationStack {
            List {
                Section {
                    NavigationLink { BreatheView() } label: { Label("A minute to breathe", systemImage: "wind") }
                }
                // Crisis help: plain, always here, never behind another screen.
                Section {
                    Button { open(CrisisLine.call988) } label: { Label("Call 988", systemImage: "phone") }
                    Button { open(CrisisLine.text988) } label: { Label("Text 988", systemImage: "message") }
                    Button { open(CrisisLine.call911) } label: { Label("In immediate danger, call 911", systemImage: "phone") }
                } header: {
                    Text("Need help now?")
                } footer: {
                    Text("Draft for review")
                }
            }
            .navigationTitle("Tidelight")
        }
    }

    // The watch's own Phone and Messages take it from here; the app is not part of the call or text.
    private func open(_ url: URL) {
        WKApplication.shared().openSystemURL(url)
    }
}

// One minute, in silence: six breaths of four seconds in and six out (the phone app's calm
// pattern). A soft tap marks each turn. No sound, no score, no streak, and nothing is kept.
struct BreatheView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var breathingIn = false
    @State private var finished = false
    @State private var task: Task<Void, Never>?

    private static let inSeconds: Double = 4
    private static let outSeconds: Double = 6
    private static let breaths = 6

    var body: some View {
        VStack(spacing: 8) {
            Circle()
                .fill(Color.accentColor.opacity(0.35))
                .overlay(Circle().stroke(Color.accentColor, lineWidth: 2))
                .scaleEffect(reduceMotion ? 1 : (breathingIn ? 1 : 0.55))
                .opacity(reduceMotion ? (breathingIn ? 1 : 0.45) : 1)
                .accessibilityHidden(true)
            Text(finished ? "Done" : (breathingIn ? "Breathe in" : "Breathe out"))
                .font(.headline)
                .accessibilityAddTraits(.updatesFrequently)
        }
        .padding()
        .onAppear { start() }
        .onDisappear { task?.cancel() }
    }

    private func start() {
        task?.cancel()
        finished = false
        task = Task { @MainActor in
            for _ in 0..<BreatheView.breaths {
                await turn(toIn: true, seconds: BreatheView.inSeconds)
                if Task.isCancelled { return }
                await turn(toIn: false, seconds: BreatheView.outSeconds)
                if Task.isCancelled { return }
            }
            finished = true
        }
    }

    @MainActor private func turn(toIn: Bool, seconds: Double) async {
        WKInterfaceDevice.current().play(.click)
        withAnimation(.easeInOut(duration: seconds)) { breathingIn = toIn }
        try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    }
}
