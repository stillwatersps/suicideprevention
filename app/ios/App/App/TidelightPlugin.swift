import Foundation
import Capacitor
import Contacts
import ContactsUI
import MessageUI
import UIKit
import UserNotifications

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
        CAPPluginMethod(name: "setPlaces", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPendingAlert", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "acknowledgeAlert", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "composeMessage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeLaunchTarget", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "debugEnterPlace", returnType: CAPPluginReturnPromise),
    ]

    private var launchTarget: String?
    private var composeDelegate: ComposeDelegate?
    private var contactDelegate: ContactPickDelegate?

    override public func load() {
        bridge?.notificationRouter.localNotificationHandler = self
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
    }

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
            nav.modalPresentationStyle = .fullScreen
            self?.bridge?.viewController?.present(nav, animated: true)
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

    private func otherHandler() -> NotificationHandlerProtocol? {
        bridge?.plugin(withName: "LocalNotifications") as? NotificationHandlerProtocol
    }

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
