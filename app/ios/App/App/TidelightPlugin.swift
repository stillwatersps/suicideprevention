import Foundation
import Capacitor
import Contacts
import ContactsUI
import MessageUI
import PhotosUI
import UIKit
import UserNotifications
import CoreLocation
import AVFoundation
import LocalAuthentication
import WebKit

// The bridge between the app's pages and the phone for "Places that are hard for me" (idea E1).
// Draft, not reviewed, never run on a phone. Every word shown to the person arrives from
// app/src/text/*.html; this file has none of its own. The check-in reminders (pull request 19)
// use Capacitor's LocalNotifications plugin; notifications that aren't ours are passed on to it.
@objc(TidelightPlugin)
public class TidelightPlugin: CAPPlugin, CAPBridgedPlugin, NotificationHandlerProtocol {
    public let identifier = "TidelightPlugin"
    public let jsName = "Tidelight"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocationPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestNotificationPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickPlace", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickContact", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickPhoto", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPlaces", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPendingAlert", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "acknowledgeAlert", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "composeMessage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeLaunchTarget", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "debugEnterPlace", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "haptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setKeepAwake", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAudioRoute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lockStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlock", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLock", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lockDrawn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "healthStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "healthAsk", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "healthWrite", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "healthRemoveAll", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startBreathingActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endBreathingActivity", returnType: CAPPluginReturnPromise),
    ]

    private var launchTarget: String?
    private var composeDelegate: ComposeDelegate?
    private var contactDelegate: ContactPickDelegate?
    private var photoDelegate: PhotoPickDelegate?
    // The app lock: whether the person turned it on, whether the phone has confirmed them since
    // the app was last in the background, and the plain cover shown in the app switcher.
    private var lockEnabled = false
    private var unlocked = false
    private var privacyCover: UIView?
    private var coverTop: CGFloat = 0
    private var coverRound = 0
    private var activeAgain = true
    private var drawnCall: CAPPluginCall?
    private var oneLocation: OneLocationRequest?
    private let lightImpact = UIImpactFeedbackGenerator(style: .light)
    private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
    private let softImpact = UIImpactFeedbackGenerator(style: .soft)
    private let selection = UISelectionFeedbackGenerator()
    private let notice = UINotificationFeedbackGenerator()

    override public func load() {
        // A breathing session that was cut short (the app was closed) leaves nothing on the Lock Screen.
        if #available(iOS 16.2, *) { TidelightBreathing.end {} }
        #if DEBUG && targetEnvironment(simulator)
        quietForAutomatedRuns()
        #endif
        // The reminders plugin registered its own handler before this plugin loaded. Keep hold of it,
        // so a check-in reminder still shows while the app is open and its taps still reach the page.
        if let earlier = bridge?.notificationRouter.localNotificationHandler, earlier !== self { reminders = earlier }
        bridge?.notificationRouter.localNotificationHandler = self
        let center = NotificationCenter.default
        for name in [UIApplication.didEnterBackgroundNotification, UIScene.didEnterBackgroundNotification] {
            center.addObserver(self, selector: #selector(appWentToBackground), name: name, object: nil)
        }
        for name in [UIApplication.willEnterForegroundNotification, UIScene.willEnterForegroundNotification] {
            center.addObserver(self, selector: #selector(appComingBack), name: name, object: nil)
        }
        center.addObserver(self, selector: #selector(appActiveAgain), name: UIApplication.didBecomeActiveNotification, object: nil)
        let watcher = PlaceWatcher.shared
        watcher.start()
        watcher.onAlertDue = { [weak self] info in
            self?.notifyListeners("placeAlert", data: info.asDictionary, retainUntilConsumed: true)
        }
        watcher.onAuthorizationChange = { [weak self] in
            self?.notifyListeners("statusChange", data: watcher.status())
        }
        // Opened with an alert already due (for example after a tap the page missed): go to it.
        if watcher.pendingAlert() != nil { goToCheckIn(hash: "#app-place-alert") }
        // Opened from the widget, through the app's own address (tidelight://open/...).
        center.addObserver(self, selector: #selector(openedByAddress(_:)), name: .capacitorOpenURL, object: nil)
        if let url = ApplicationDelegateProxy.shared.lastURL { open(address: url) }
        // Opened by a shortcut (the Shortcuts app or Siri), which names the same two places.
        center.addObserver(self, selector: #selector(openedByShortcut(_:)), name: .tidelightShortcut, object: nil)
        if let word = TidelightShortcuts.pending { open(place: word) }
    }

    // MARK: - Opened from the widget

    // The widget names a place in the app: the plan, or a minute of breathing. Anything else, and
    // any address this doesn't know, just opens the app. The page decides what to show, and the
    // app lock, if it is on, still covers it. Nothing is read from the address but that one word.
    private static let openTargets = ["plan": "#tl-plan", "breathe": "#tl-breathe"]

    @objc private func openedByAddress(_ notification: Notification) {
        guard let info = notification.object as? [String: Any], let url = info["url"] as? URL else { return }
        open(address: url)
    }

    private func open(address url: URL) {
        guard url.scheme == "tidelight", url.host == "open" else { return }
        open(place: url.lastPathComponent)
    }

    @objc private func openedByShortcut(_ notification: Notification) {
        guard let word = notification.object as? String else { return }
        open(place: word)
    }

    // One word, from the widget's address or from a shortcut. A word this doesn't know does nothing.
    private func open(place word: String) {
        TidelightShortcuts.pending = nil
        guard let hash = TidelightPlugin.openTargets[word] else { return }
        goToCheckIn(hash: hash)
    }

    // MARK: - Automated Simulator runs make no sound

    #if DEBUG && targetEnvironment(simulator)
    // Only in a debug build, only in the Simulator, and only when launched with the argument
    // "-TidelightQuiet YES": each page gets a script that silences text-to-speech, recordings, and
    // generated sound, so a test run never plays the voice guide out loud. The app's own audio
    // code is untouched and still runs in full. The script is the same text as QUIET_SOURCE in
    // test/quiet.mjs; a unit test keeps the two identical.
    private func quietForAutomatedRuns() {
        guard UserDefaults.standard.bool(forKey: "TidelightQuiet") else { return }
        let script = WKUserScript(source: TidelightPlugin.quietScript, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        bridge?.webView?.configuration.userContentController.addUserScript(script)
        print("Tidelight: quiet test run, audio muted")
    }

    private static let quietScript = #"""
    (function () {
      if (window.__tidelightQuiet) return;
      window.__tidelightQuiet = true;
      var current = null;
      var fire = function (line, type) { try { line.dispatchEvent(new Event(type)); } catch (e) { if (typeof line['on' + type] === 'function') line['on' + type]({ type: type }); } };
      var speech = {
        speaking: false, pending: false, paused: false, onvoiceschanged: null,
        getVoices: function () { return []; },
        speak: function (line) {
          speech.cancel();
          current = line; speech.speaking = true; fire(line, 'start');
          var ms = Math.min(4000, 400 + String((line && line.text) || '').length * 40);
          line.__quietTimer = setTimeout(function () { if (current !== line) return; current = null; speech.speaking = false; fire(line, 'end'); }, ms);
        },
        cancel: function () { if (!current) return; var line = current; current = null; speech.speaking = false; clearTimeout(line.__quietTimer); fire(line, 'error'); },
        pause: function () { speech.paused = true; },
        resume: function () { speech.paused = false; },
        addEventListener: function () {}, removeEventListener: function () {}
      };
      try { Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: function () { return speech; } }); } catch (e) { /* stays as it was */ }
      var Media = window.HTMLMediaElement;
      if (Media && Media.prototype.play) {
        var play = Media.prototype.play;
        Media.prototype.play = function () { this.muted = true; return play.apply(this, arguments); };
      }
      var Real = window.AudioContext || window.webkitAudioContext;
      var Base = window.BaseAudioContext || Real;
      var out = Real && Base && Object.getOwnPropertyDescriptor(Base.prototype, 'destination');
      if (Real && out && out.get) {
        var Quiet = class extends Real {
          get destination() {
            if (!this.__quietOut) { this.__quietOut = this.createGain(); this.__quietOut.gain.value = 0; this.__quietOut.connect(out.get.call(this)); }
            return this.__quietOut;
          }
        };
        if (window.AudioContext) window.AudioContext = Quiet;
        if (window.webkitAudioContext) window.webkitAudioContext = Quiet;
      }
    })();
    """#
    #endif

    // MARK: - Status and permissions

    @objc func getStatus(_ call: CAPPluginCall) {
        var status = PlaceWatcher.shared.status()
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            switch settings.authorizationStatus {
            case .notDetermined: status["notificationAuthorization"] = "notDetermined"
            case .denied: status["notificationAuthorization"] = "denied"
            default: status["notificationAuthorization"] = "authorized"
            }
            status["canSendText"] = MFMessageComposeViewController.canSendText()
            #if DEBUG
            status["debugBuild"] = true
            #else
            status["debugBuild"] = false
            #endif
            call.resolve(status)
        }
    }

    /// iOS asks in two steps: "while using" first, then "always". The second question may be shown
    /// by iOS later, on its own schedule. The page shows what was granted.
    @objc func requestLocationPermission(_ call: CAPPluginCall) {
        let watcher = PlaceWatcher.shared
        let current = watcher.status()["locationAuthorization"] as? String ?? ""
        DispatchQueue.main.async {
            if current == "notDetermined" { watcher.requestWhenInUse() } else { watcher.requestAlways() }
            call.resolve(watcher.status())
        }
    }

    @objc func requestNotificationPermission(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            call.resolve(["granted": granted])
        }
    }

    // MARK: - Choosing a place and people

    @objc func pickPlace(_ call: CAPPluginCall) {
        let words = call.getObject("words") ?? [:]
        var initial: PlacePickerViewController.Place?
        if let lat = call.getDouble("latitude"), let lng = call.getDouble("longitude") {
            initial = PlacePickerViewController.Place(name: call.getString("name") ?? "", latitude: lat, longitude: lng, radius: call.getDouble("radius") ?? 200)
        }
        DispatchQueue.main.async { [weak self] in
            let picker = PlacePickerViewController(words: words, initial: initial, defaultRadius: call.getDouble("radius") ?? 200)
            picker.completion = { place in
                if let p = place {
                    call.resolve(["name": p.name, "latitude": p.latitude, "longitude": p.longitude, "radius": p.radius])
                } else {
                    call.resolve(["cancelled": true])
                }
            }
            let nav = UINavigationController(rootViewController: picker)
            // The map is laid over the page from the bottom of the crisis strip down, so the strip
            // (Call 988, Text 988, Call 911, Quick exit) is never under it. Only if the page gave no
            // place for the strip does it take the whole screen.
            let top = CGFloat(call.getDouble("top") ?? 0)
            if let host = self?.bridge?.viewController, top > 0, top < host.view.bounds.height - 300 {
                host.addChild(nav)
                nav.view.frame = CGRect(x: 0, y: top, width: host.view.bounds.width, height: host.view.bounds.height - top)
                nav.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                host.view.addSubview(nav.view)
                nav.didMove(toParent: host)
                UIAccessibility.post(notification: .screenChanged, argument: nav.view)
            } else {
                nav.modalPresentationStyle = .fullScreen
                self?.bridge?.viewController?.present(nav, animated: true)
            }
        }
    }

    /// The phone's own contact picker. It needs no permission and the app receives only the one
    /// contact the person taps: a name and a phone number, kept on the phone.
    @objc func pickContact(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            let picker = CNContactPickerViewController()
            picker.displayedPropertyKeys = [CNContactPhoneNumbersKey]
            picker.predicateForEnablingContact = NSPredicate(format: "phoneNumbers.@count > 0")
            picker.predicateForSelectionOfContact = NSPredicate(format: "phoneNumbers.@count == 1")
            let delegate = ContactPickDelegate { result in
                self?.contactDelegate = nil
                if let r = result { call.resolve(["name": r.name, "phone": r.phone]) } else { call.resolve(["cancelled": true]) }
            }
            self?.contactDelegate = delegate
            picker.delegate = delegate
            self?.bridge?.viewController?.present(picker, animated: true)
        }
    }

    // MARK: - One photo for the Hope box

    // The system's photo picker runs outside the app and hands back only the photo the person
    // chooses. It shows the photo library, never the camera, and needs no permission. The web
    // page's own file chooser can offer "Take Photo", which this app states no reason to use.
    @objc func pickPhoto(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            var config = PHPickerConfiguration()
            config.filter = .images
            config.selectionLimit = 1
            let picker = PHPickerViewController(configuration: config)
            let delegate = PhotoPickDelegate { result in
                self?.photoDelegate = nil
                switch result {
                case .cancelled: call.resolve(["cancelled": true])
                case .problem: call.resolve(["problem": true])
                case .photo(let dataUrl): call.resolve(["dataUrl": dataUrl])
                }
            }
            self?.photoDelegate = delegate
            picker.delegate = delegate
            picker.presentationController?.delegate = delegate
            self?.bridge?.viewController?.present(picker, animated: true)
        }
    }

    // MARK: - The app lock, and a copy of the person's data

    // The lock uses the phone's own check (Face ID, Touch ID, or the phone's passcode). The app
    // keeps no code of its own, and nothing about the check leaves the phone.
    @objc func lockStatus(_ call: CAPPluginCall) {
        var problem: NSError?
        let available = LAContext().canEvaluatePolicy(.deviceOwnerAuthentication, error: &problem)
        call.resolve(["available": available, "reason": available ? "" : "noPasscode", "unlocked": unlocked])
    }

    // The page says it has drawn its lock screen (or, if the lock no longer applies, its own
    // screen). The cover goes a moment after that, and not before the app is fully in front
    // again: until then the phone still shows the page as it was when the app left the screen.
    // The call is answered once the cover is off, and the page asks for Face ID only then.
    @objc func lockDrawn(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, self.privacyCover != nil else { call.resolve(); return }
            self.drawnCall?.resolve()
            self.drawnCall = call
            if self.activeAgain { self.finishDrawn() }
        }
    }

    @objc private func appActiveAgain() {
        activeAgain = true
        if drawnCall != nil { finishDrawn() }
    }

    private func finishDrawn() {
        let call = drawnCall
        drawnCall = nil
        liftPrivacyCover(after: 0.35) { call?.resolve() }
    }

    @objc func unlock(_ call: CAPPluginCall) {
        let context = LAContext()
        var problem: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &problem) else {
            call.resolve(["ok": false, "available": false])
            return
        }
        let reason = call.getString("reason") ?? "Tidelight"
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { [weak self] ok, _ in
            DispatchQueue.main.async {
                if ok { self?.unlocked = true }
                call.resolve(["ok": ok, "available": true])
            }
        }
    }

    @objc func setLock(_ call: CAPPluginCall) {
        lockEnabled = call.getBool("enabled") ?? false
        if let top = call.getDouble("top") { coverTop = CGFloat(max(0, top)) }
        if !lockEnabled { DispatchQueue.main.async { [weak self] in self?.removePrivacyCover() } }
        call.resolve()
    }

    // Leaving the app ends the unlocked time. While the lock is on, a plain cover goes over the
    // app first, so the picture the phone keeps for the app switcher shows nothing saved. The
    // cover starts below the crisis strip (the page says where that ends), so the strip, with
    // Call 988, Text 988, Call 911, and Quick exit, is never under it.
    @objc private func appWentToBackground() {
        unlocked = false
        coverRound += 1
        activeAgain = false
        drawnCall?.resolve()
        drawnCall = nil
        guard lockEnabled, privacyCover == nil, let window = bridge?.viewController?.view.window else { return }
        let top = min(coverTop, window.bounds.height)
        let cover = UIView(frame: CGRect(x: 0, y: top, width: window.bounds.width, height: window.bounds.height - top))
        cover.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        cover.backgroundColor = .systemBackground
        window.addSubview(cover)
        privacyCover = cover
    }

    // Coming back, the cover stays until the page says it has drawn its lock screen (lockDrawn),
    // so the screen the person left never shows for a moment. If the page never says so, the
    // cover goes anyway after a few seconds: the app must never stay covered.
    @objc private func appComingBack() { liftPrivacyCover(after: 3) }

    private func liftPrivacyCover(after seconds: TimeInterval, then done: (() -> Void)? = nil) {
        let round = coverRound
        DispatchQueue.main.asyncAfter(deadline: .now() + seconds) { [weak self] in
            defer { done?() }
            guard let self = self, self.coverRound == round, UIApplication.shared.applicationState != .background else { return }
            self.removePrivacyCover()
        }
    }

    private func removePrivacyCover() {
        privacyCover?.removeFromSuperview()
        privacyCover = nil
    }

    // One text file, written to the app's temporary folder, handed to the phone's share sheet, and
    // deleted when the sheet closes. The person chooses where it goes; the app sends it nowhere.
    @objc func shareFile(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else { call.reject("no text"); return }
        let wanted = (call.getString("name") ?? "tidelight.txt").replacingOccurrences(of: "/", with: "-")
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        let file = folder.appendingPathComponent(wanted.isEmpty ? "tidelight.txt" : wanted)
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            try text.write(to: file, atomically: true, encoding: .utf8)
        } catch {
            call.reject("could not write the file")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let host = self?.bridge?.viewController else {
                try? FileManager.default.removeItem(at: folder)
                call.reject("no screen to show the share sheet on")
                return
            }
            let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            sheet.completionWithItemsHandler = { _, completed, _, _ in
                try? FileManager.default.removeItem(at: folder)
                call.resolve(["completed": completed])
            }
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = host.view
                popover.sourceRect = CGRect(x: host.view.bounds.midX, y: host.view.bounds.midY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            host.present(sheet, animated: true)
        }
    }

    // MARK: - A breathing session on the Lock Screen (only if the person turns it on)

    @objc func startBreathingActivity(_ call: CAPPluginCall) {
        let seconds = min(max(call.getDouble("seconds") ?? 60, 10), 3600)
        if #available(iOS 16.2, *) {
            TidelightBreathing.start(seconds: seconds) { started in call.resolve(["started": started]) }
        } else {
            call.resolve(["started": false])
        }
    }

    @objc func endBreathingActivity(_ call: CAPPluginCall) {
        if #available(iOS 16.2, *) {
            TidelightBreathing.end { call.resolve() }
        } else {
            call.resolve()
        }
    }

    // MARK: - Apple Health (only if the person turns it on)

    @objc func healthStatus(_ call: CAPPluginCall) {
        call.resolve(["status": TidelightHealth.shared.status()])
    }

    @objc func healthAsk(_ call: CAPPluginCall) {
        TidelightHealth.shared.ask { status in call.resolve(["status": status]) }
    }

    // One finished meditation: when it started and how many seconds it lasted. Nothing else.
    @objc func healthWrite(_ call: CAPPluginCall) {
        guard let started = call.getDouble("startedAt"), let seconds = call.getDouble("seconds"), seconds > 0, seconds <= 4 * 60 * 60 else {
            call.resolve(["saved": false])
            return
        }
        let start = Date(timeIntervalSince1970: started / 1000)
        TidelightHealth.shared.write(start: start, end: start.addingTimeInterval(seconds)) { saved in
            call.resolve(["saved": saved])
        }
    }

    @objc func healthRemoveAll(_ call: CAPPluginCall) {
        TidelightHealth.shared.removeAll { removed, count in
            call.resolve(["removed": removed, "count": count])
        }
    }

    // MARK: - The feature's settings, kept on the phone

    @objc func setPlaces(_ call: CAPPluginCall) {
        guard let object = call.getObject("config"),
              let data = try? JSONSerialization.data(withJSONObject: object),
              let config = try? JSONDecoder().decode(PlacesConfig.self, from: data) else {
            call.reject("config is missing or malformed")
            return
        }
        DispatchQueue.main.async {
            PlaceWatcher.shared.apply(config)
            call.resolve(PlaceWatcher.shared.status())
        }
    }

    @objc func getPendingAlert(_ call: CAPPluginCall) {
        if let info = PlaceWatcher.shared.pendingAlert() { call.resolve(info.asDictionary) } else { call.resolve([:]) }
    }

    @objc func acknowledgeAlert(_ call: CAPPluginCall) {
        guard let id = call.getString("placeId") else { call.reject("placeId is missing"); return }
        PlaceWatcher.shared.acknowledge(placeId: id)
        call.resolve()
    }

    /// Opens the phone's own Messages composer with the chosen people and the message filled in.
    /// iOS never lets an app send a text by itself: the person taps Send, or cancels. When this phone
    /// can't send texts (for example the Simulator), the share sheet opens instead.
    @objc func composeMessage(_ call: CAPPluginCall) {
        let watcher = PlaceWatcher.shared
        let placeId = call.getString("placeId")
        var text = call.getString("message") ?? watcher.config.message
        if let loc = watcher.locationForMessage(placeId: placeId) {
            let link = String(format: "https://maps.apple.com/?ll=%.5f,%.5f&q=%@", loc.latitude, loc.longitude,
                              (call.getString("linkLabel") ?? "Tidelight").addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")
            text += "\n" + link
        }
        let phones = watcher.config.contacts.map { $0.phone }.filter { !$0.isEmpty }
        DispatchQueue.main.async { [weak self] in
            guard let vc = self?.bridge?.viewController else { call.reject("no view"); return }
            if MFMessageComposeViewController.canSendText() {
                let composer = MFMessageComposeViewController()
                composer.recipients = phones
                composer.body = text
                let delegate = ComposeDelegate { result in
                    self?.composeDelegate = nil
                    call.resolve(["result": result])
                }
                self?.composeDelegate = delegate
                composer.messageComposeDelegate = delegate
                vc.present(composer, animated: true)
            } else {
                let sheet = UIActivityViewController(activityItems: [text], applicationActivities: nil)
                sheet.completionWithItemsHandler = { _, completed, _, _ in
                    call.resolve(["result": completed ? "shared" : "cancelled", "fallback": true])
                }
                sheet.popoverPresentationController?.sourceView = vc.view
                vc.present(sheet, animated: true)
            }
        }
    }

    /// Test builds only. In a release build this does nothing.
    @objc func debugEnterPlace(_ call: CAPPluginCall) {
        #if DEBUG
        if let id = call.getString("placeId") { PlaceWatcher.shared.debugEnter(placeId: id) }
        call.resolve(["done": true])
        #else
        call.resolve(["done": false])
        #endif
    }

    // MARK: - The redesign: one location on request, haptics, keeping the screen awake, audio route

    /// Where the phone is right now, once, and only when the page asks (to save a home spot, or to
    /// check whether the person is near it). Nothing is watched, kept here, or sent anywhere.
    @objc func getCurrentLocation(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            let request = OneLocationRequest { location in
                self?.oneLocation = nil
                if let l = location {
                    call.resolve(["latitude": l.coordinate.latitude, "longitude": l.coordinate.longitude, "accuracy": l.horizontalAccuracy])
                } else {
                    call.resolve(["unavailable": true])
                }
            }
            self?.oneLocation = request
            request.start()
        }
    }

    /// One short, discrete haptic. The page chooses which and how often; nothing here repeats.
    @objc func haptic(_ call: CAPPluginCall) {
        let style = call.getString("style") ?? "light"
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            switch style {
            case "selection": self.selection.selectionChanged()
            case "soft": self.softImpact.impactOccurred(intensity: CGFloat(call.getDouble("intensity") ?? 0.6))
            case "medium": self.mediumImpact.impactOccurred(intensity: CGFloat(call.getDouble("intensity") ?? 1.0))
            case "success": self.notice.notificationOccurred(.success)
            case "warning": self.notice.notificationOccurred(.warning)
            default: self.lightImpact.impactOccurred(intensity: CGFloat(call.getDouble("intensity") ?? 1.0))
            }
            call.resolve()
        }
    }

    /// Keeps the screen on during a meditation, and lets it sleep again afterwards.
    @objc func setKeepAwake(_ call: CAPPluginCall) {
        let on = call.getBool("on") ?? false
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = on
            call.resolve(["on": on])
        }
    }

    /// Whether sound would play through headphones (wired or Bluetooth). Read once, on request.
    /// iOS doesn't let an app read the silent switch, so "silent" is always unknown here.
    @objc func getAudioRoute(_ call: CAPPluginCall) {
        let outputs = AVAudioSession.sharedInstance().currentRoute.outputs
        let personal: [AVAudioSession.Port] = [.headphones, .bluetoothA2DP, .bluetoothLE, .bluetoothHFP]
        call.resolve(["headphones": outputs.contains { personal.contains($0.portType) }, "silentKnown": false])
    }

    // MARK: - Where to go when a notification opened the app

    @objc func takeLaunchTarget(_ call: CAPPluginCall) {
        let target = launchTarget
        launchTarget = nil
        call.resolve(["target": target ?? ""])
    }

    private func goToCheckIn(hash: String) {
        launchTarget = hash
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
            guard let self = self, let webView = self.bridge?.webView, let base = self.bridge?.config.localURL else { return }
            let current = webView.url?.path ?? ""
            if current.hasSuffix("/check-in/") || current.hasSuffix("/check-in/index.html") || current.contains("registro-diario") {
                webView.evaluateJavaScript("window.dispatchEvent(new CustomEvent('tidelight-launch', {detail: '\(hash)'}))", completionHandler: nil)
            } else {
                var components = URLComponents(url: base.appendingPathComponent("check-in/index.html"), resolvingAgainstBaseURL: false)
                components?.fragment = String(hash.dropFirst())
                if let url = components?.url { webView.load(URLRequest(url: url)) }
            }
        }
    }

    // MARK: - NotificationHandlerProtocol

    // The reminders plugin's own handler (not the plugin itself, which doesn't handle notifications).
    // The plugin owns it for as long as the app runs.
    private weak var reminders: NotificationHandlerProtocol?
    private func otherHandler() -> NotificationHandlerProtocol? { reminders }

    public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
        let kind = notification.request.content.userInfo["kind"] as? String
        if kind == "tidelightPlace" {
            if let id = notification.request.content.userInfo["placeId"] as? String { PlaceWatcher.shared.alertFired(placeId: id) }
            goToCheckIn(hash: "#app-place-alert")
            return [.sound, .banner, .list]
        }
        return otherHandler()?.willPresent(notification: notification) ?? []
    }

    public func didReceive(response: UNNotificationResponse) {
        let info = response.notification.request.content.userInfo
        let kind = info["kind"] as? String
        if kind == "tidelightPlace" {
            let placeId = info["placeId"] as? String ?? ""
            switch response.actionIdentifier {
            case PlaceWatcher.actionOkay:
                PlaceWatcher.shared.acknowledge(placeId: placeId)
            case PlaceWatcher.action988:
                open("tel:988")
            case PlaceWatcher.action911:
                open("tel:911")
            case PlaceWatcher.actionSend:
                PlaceWatcher.shared.alertFired(placeId: placeId)
                goToCheckIn(hash: "#app-place-alert-send")
            default:
                PlaceWatcher.shared.alertFired(placeId: placeId)
                goToCheckIn(hash: "#app-place-alert")
            }
            return
        }
        otherHandler()?.didReceive(response: response)
    }

    private func open(_ string: String) {
        guard let url = URL(string: string) else { return }
        DispatchQueue.main.async { UIApplication.shared.open(url) }
    }
}

/// Asks the phone for its location once, then stops. Needs "while using the app" permission.
private final class OneLocationRequest: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var completion: ((CLLocation?) -> Void)?
    init(completion: @escaping (CLLocation?) -> Void) {
        self.completion = completion
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }
    func start() {
        let status = manager.authorizationStatus
        guard status == .authorizedWhenInUse || status == .authorizedAlways else { finish(nil); return }
        manager.requestLocation()
    }
    private func finish(_ location: CLLocation?) {
        completion?(location)
        completion = nil
    }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) { finish(locations.last) }
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) { finish(nil) }
}

private final class ComposeDelegate: NSObject, MFMessageComposeViewControllerDelegate {
    let done: (String) -> Void
    init(done: @escaping (String) -> Void) { self.done = done }
    func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) {
        controller.dismiss(animated: true)
        switch result {
        case .sent: done("sent")
        case .failed: done("failed")
        default: done("cancelled")
        }
    }
}

// One photo from the library, made smaller and handed to the page as a JPEG data URL. The page
// makes its own smaller copy and keeps that; nothing is written anywhere by this class.
private final class PhotoPickDelegate: NSObject, PHPickerViewControllerDelegate, UIAdaptivePresentationControllerDelegate {
    enum Result { case cancelled, problem, photo(String) }
    private static let longestEdge: CGFloat = 2048
    private let done: (Result) -> Void
    private var answered = false
    init(done: @escaping (Result) -> Void) { self.done = done }

    private func answer(_ result: Result) {
        if answered { return }
        answered = true
        done(result)
    }
    // Swiping the picker away is a cancel too.
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) { answer(.cancelled) }
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        guard let provider = results.first?.itemProvider else { answer(.cancelled); return }
        guard provider.canLoadObject(ofClass: UIImage.self) else { answer(.problem); return }
        provider.loadObject(ofClass: UIImage.self) { [weak self] object, _ in
            let data = (object as? UIImage).flatMap { PhotoPickDelegate.jpeg($0) }
            DispatchQueue.main.async {
                if let data = data { self?.answer(.photo("data:image/jpeg;base64," + data.base64EncodedString())) } else { self?.answer(.problem) }
            }
        }
    }
    private static func jpeg(_ image: UIImage) -> Data? {
        let longest = max(image.size.width, image.size.height)
        guard longest > 0 else { return nil }
        let scale = min(1, longestEdge / longest)
        let size = CGSize(width: max(1, (image.size.width * scale).rounded()), height: max(1, (image.size.height * scale).rounded()))
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        format.opaque = true
        let small = UIGraphicsImageRenderer(size: size, format: format).image { _ in image.draw(in: CGRect(origin: .zero, size: size)) }
        return small.jpegData(compressionQuality: 0.9)
    }
}

private final class ContactPickDelegate: NSObject, CNContactPickerDelegate {
    struct Picked { let name: String; let phone: String }
    let done: (Picked?) -> Void
    init(done: @escaping (Picked?) -> Void) { self.done = done }
    func contactPickerDidCancel(_ picker: CNContactPickerViewController) { done(nil) }
    func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
        let name = CNContactFormatter.string(from: contact, style: .fullName) ?? ""
        let phone = contact.phoneNumbers.first?.value.stringValue ?? ""
        done(Picked(name: name, phone: phone))
    }
    func contactPicker(_ picker: CNContactPickerViewController, didSelect contactProperty: CNContactProperty) {
        let name = CNContactFormatter.string(from: contactProperty.contact, style: .fullName) ?? ""
        let phone = (contactProperty.value as? CNPhoneNumber)?.stringValue ?? ""
        done(Picked(name: name, phone: phone))
    }
}
