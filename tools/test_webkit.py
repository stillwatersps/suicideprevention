#!/usr/bin/env python3
"""Tries the site in WebKit, the engine family Safari uses, on a Mac.

    python3 tools/test_webkit.py
    python3 tools/test_webkit.py --pages get-help --shots /some/folder

This is a check between tools/test_browser.py (Chrome) and a real iPhone. It opens every page
in a small window at phone, tablet, and desktop sizes, in light and dark, and runs the same
layout audit as the Chrome tests, including SAFETY rule 1: the crisis strip can be seen at the
top of every page, and stays pinned at the sizes where Chrome's tests expect it to. Then it uses
the menu, folded sections, jump links, Quick exit, and the offline notice.

It is macOS WebKit in a window, not iOS Safari and not a phone. It can't check touch, the
on-screen keyboard, Safari's toolbars, call and text links, printing, or offline support.
See notes/PHONE-TEST.md for those. It needs a Mac with Xcode's command line tools. It never
opens a call or text link, and it cancels any page load that would leave the local test site.
"""
import argparse
import json
import pathlib
import platform
import shutil
import subprocess
import sys
import tempfile
import threading

TOOLS = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
from check_site import find_pages  # noqa: E402
from preview_server import BASE, make_server  # noqa: E402
from test_browser import AUDIT_JS, MUST_PIN, ONE_ROW, ONE_ROW_MAX_PERCENT, VIEWPORTS  # noqa: E402

# Width, height, dark mode. 640x290 and 568x300 show the compact one-row strip.
SIZES = [(390, 844, False), (320, 568, False), (568, 300, False), (640, 290, False), (750, 292, False), (844, 390, False),
         (768, 1024, False), (1440, 900, False), (390, 844, True)]
AUDIT_KEYS = {
    "hscroll": "scrolls sideways", "offscreen": "runs off the screen", "clipped": "text cut off", "overlaps": "controls overlap",
    "brokenImages": "image did not load", "contrast": "low contrast", "unnamed": "control has no name",
    "tinyTargets": "tap target under 24px", "stripTargets": "crisis strip tap target under 44px",
    "exitCovers": "Quick exit covers something", "colorOnlyLinks": "link in a sentence has no underline",
    "exitCoversTop": "Quick exit covers a crisis link at the top of the page", "deadCrisis": "a crisis link can't be tapped",
    "stripHidden": "at the top of the page, the crisis strip's",
}
# The sizes where the Chrome tests expect the crisis strip to stay pinned, and to be one short row.
PINNED_SIZES = {(width, height) for label, width, height, _ in VIEWPORTS if label in MUST_PIN}
ONE_ROW_SIZES = {(width, height) for label, width, height, _ in VIEWPORTS if label in ONE_ROW}

SWIFT = r"""
// Runs steps in a WebKit view: load an address, run a script, or take a screenshot. Prints one line of JSON per step.
import AppKit
import WebKit

final class Runner: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    var steps: [[String: Any]]
    let shots: URL?
    let webView: WKWebView
    let window: NSWindow
    var loading: String? = nil
    var notes: [String] = []

    init(width: Int, height: Int, dark: Bool, shots: URL?, steps: [[String: Any]]) {
        self.steps = steps; self.shots = shots
        let frame = NSRect(x: 0, y: 0, width: width, height: height)
        let config = WKWebViewConfiguration()
        let watcher = "window.addEventListener('error', function (e) { window.webkit.messageHandlers.note.postMessage('script error: ' + e.message); });"
            + "document.addEventListener('securitypolicyviolation', function (e) { window.webkit.messageHandlers.note.postMessage('blocked by the page policy: ' + e.violatedDirective + ' ' + e.blockedURI); });"
        config.userContentController.addUserScript(WKUserScript(source: watcher, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        webView = WKWebView(frame: frame, configuration: config)
        webView.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
        window = NSWindow(contentRect: frame, styleMask: [.borderless], backing: .buffered, defer: false)
        super.init()
        config.userContentController.add(self, name: "note")
        webView.navigationDelegate = self
        window.contentView = webView
        window.setFrameOrigin(NSPoint(x: -5000, y: -5000))
        window.orderFrontRegardless()
    }

    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        notes.append(String(describing: m.body))
    }

    func next() {
        guard !steps.isEmpty else { NSApp.terminate(nil); return }
        let step = steps.removeFirst()
        let name = step["name"] as? String ?? "?"
        if let load = step["load"] as? String, let url = URL(string: load) {
            loading = name
            notes = []
            webView.load(URLRequest(url: url))
        } else if let shot = step["shot"] as? String {
            guard let shots = shots else { next(); return }
            webView.takeSnapshot(with: nil) { image, _ in
                if let image = image, let t = image.tiffRepresentation, let r = NSBitmapImageRep(data: t), let p = r.representation(using: .png, properties: [:]) {
                    try? p.write(to: shots.appendingPathComponent(shot))
                }
                self.next()
            }
        } else {
            let js = step["js"] as? String ?? "null"
            let wait = step["wait"] as? Double ?? 0.1
            webView.evaluateJavaScript("JSON.stringify((function(){ return " + js + "; })())") { value, error in
                DispatchQueue.main.asyncAfter(deadline: .now() + wait) {
                    self.say(name, value as? String ?? "null", error)
                    self.next()
                }
            }
        }
    }

    // Only the local test site, so a mistake here can never load another site, such as a crisis service.
    func webView(_ w: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = action.request.url
        let host = url?.host ?? ""
        if url?.scheme == "about" || (url?.scheme == "http" && (host == "localhost" || host == "127.0.0.1")) {
            decisionHandler(.allow)
        } else {
            notes.append("cancelled a page load that would leave the local test site: " + (url?.absoluteString ?? "?"))
            decisionHandler(.cancel)
        }
    }

    func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
        guard let name = loading else { return }
        loading = nil
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { self.say(name, "\"loaded\"", nil); self.next() }
    }

    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) {
        guard let name = loading else { return }
        loading = nil
        say(name, "\"failed\"", e)
        next()
    }

    func say(_ name: String, _ value: String, _ error: Error?) {
        var line: [String: Any] = ["step": name, "at": webView.url?.absoluteString ?? "", "notes": notes]
        line["value"] = (try? JSONSerialization.jsonObject(with: Data(value.utf8), options: [.fragmentsAllowed])) ?? value
        if let error = error { line["error"] = String(describing: error) }
        if let data = try? JSONSerialization.data(withJSONObject: line), let text = String(data: data, encoding: .utf8) {
            print(text)
            fflush(stdout)
        }
    }
}

let args = CommandLine.arguments
let lines = try! String(contentsOfFile: args[5], encoding: .utf8).split(separator: "\n")
let steps = lines.compactMap { try? JSONSerialization.jsonObject(with: Data($0.utf8)) as? [String: Any] }
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let runner = Runner(width: Int(args[1])!, height: Int(args[2])!, dark: args[3] == "1",
                    shots: args[4] == "-" ? nil : URL(fileURLWithPath: args[4]), steps: steps)
DispatchQueue.main.async { runner.next() }
DispatchQueue.main.asyncAfter(deadline: .now() + 500) { print("{\"step\":\"timed out\"}"); exit(3) }
app.run()
"""


def behavior_steps(base):
    """Each step is a script that returns what happened. An "expect" is compared with the answer."""
    def load(name, address):
        return {"name": name, "load": address}

    def js(name, script, expect=None, wait=0.1):
        step = {"name": name, "js": script, "wait": wait}
        if expect is not None:
            step["expect"] = expect
        return step

    return [
        load("open Get Help", base + "get-help/"),
        js("the page's inline script runs under its policy", "document.documentElement.classList.contains('js')", True),
        js("the menu opens", """(function () { document.querySelector('.menu-button').click();
            return document.getElementById('site-nav').classList.contains('is-open'); })()""", True),
        js("Escape closes the menu", """(function () { document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
            return document.querySelector('.menu-button').getAttribute('aria-expanded'); })()""", "false"),
        js("a fold opens", """(function () { var d = document.querySelector('details'); d.querySelector('summary').click();
            return d.open && d.getBoundingClientRect().height > 100; })()""", True),
        js("the fold closes", """(function () { var d = document.querySelector('details'); d.querySelector('summary').click(); return d.open; })()""", False),
        js("a jump link starts", "(function () { location.hash = '#what-to-expect'; return true; })()", True, wait=0.5),
        js("a jump link opens its fold and clears the strip", """(function () { var t = document.getElementById('what-to-expect');
            var own = t.querySelector(':scope > details.more');
            return (!own || own.open) && t.getBoundingClientRect().top >= document.querySelector('.crisis-bar').getBoundingClientRect().bottom; })()""", True),
        js("a garbled address starts", "(function () { location.hash = '#%E0%A4%A'; return true; })()", True, wait=0.3),
        js("Get Support Now starts", "(function () { document.querySelector('.header-cta').click(); return true; })()", True, wait=0.5),
        js("Get Support Now rings the crisis buttons", "getComputedStyle(document.querySelector('#support .action')).outlineStyle", "solid"),
        load("open Not sure", base + "not-sure/"),
        js("a feeling opens", """(function () { var d = document.querySelector('details.feeling'); d.querySelector('summary').click(); return d.open; })()""", True),
        js("leaving the page closes it", """(function () { window.dispatchEvent(new PageTransitionEvent('pagehide'));
            return document.querySelectorAll('details.feeling[open]').length; })()""", 0),
        load("open Get Help before Quick exit", base + "get-help/"),
        js("Quick exit blanks the page at once", """(function () { var e = document.querySelector('.quick-exit');
            e.href = location.origin + location.pathname.replace('get-help/', '') + 'about/?left'; e.click();
            return getComputedStyle(document.documentElement).display; })()""", "none", wait=1),
        js("Quick exit leaves", "location.search", "?left"),
        js("Back starts", "(function () { history.back(); return true; })()", True, wait=1.2),
        js("Back skips the page that was left", "location.pathname.indexOf('not-sure') >= 0 && !document.documentElement.hidden", True),
        load("open the Spanish home page", base + "es/"),
        js("the offline notice appears in Spanish", """(function () {
            Object.defineProperty(navigator, 'onLine', {get: function () { return false; }, configurable: true});
            window.dispatchEvent(new Event('offline'));
            var note = document.querySelector('main > .offline-note'); return !!note && note.textContent.indexOf('sin conexi') >= 0; })()""", True),
        js("the offline notice leaves", """(function () {
            Object.defineProperty(navigator, 'onLine', {get: function () { return true; }, configurable: true});
            window.dispatchEvent(new Event('online')); return !!document.querySelector('.offline-note'); })()""", False),
    ]


def run_steps(binary, workdir, width, height, dark, shots, steps):
    steps_file = pathlib.Path(workdir) / "steps.jsonl"
    steps_file.write_text("\n".join(json.dumps(step) for step in steps), encoding="utf-8")
    done = subprocess.run([str(binary), str(width), str(height), "1" if dark else "0", str(shots) if shots else "-", str(steps_file)],
                          capture_output=True, text=True, timeout=520)
    return [json.loads(line) for line in done.stdout.splitlines() if line.startswith("{")], done.returncode


def main():
    parser = argparse.ArgumentParser(description="Try the site in WebKit on a Mac.")
    parser.add_argument("--pages", default="", help="only pages whose path contains this text")
    parser.add_argument("--shots", default="", help="save screenshots in this folder")
    args = parser.parse_args()
    if platform.system() != "Darwin" or not shutil.which("swiftc"):
        print("Skipped: this needs a Mac with Xcode's command line tools (swiftc).")
        return 0

    pages = find_pages()
    if args.pages:
        pages = [p for p in pages if any(piece in p for piece in args.pages.split(","))]
        if not pages:
            print(f"No page's path contains {args.pages!r}, so nothing would be tested.")
            return 2
    shots = pathlib.Path(args.shots) if args.shots else None
    if shots:
        shots.mkdir(parents=True, exist_ok=True)
    server = make_server("127.0.0.1", 0)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://localhost:{server.server_address[1]}{BASE}"

    problems = []
    checks = 0
    with tempfile.TemporaryDirectory(prefix="tidelight-webkit-") as workdir:
        source = pathlib.Path(workdir) / "run.swift"
        binary = pathlib.Path(workdir) / "run"
        source.write_text(SWIFT, encoding="utf-8")
        subprocess.run(["swiftc", "-O", str(source), "-o", str(binary), "-framework", "AppKit", "-framework", "WebKit"], check=True, capture_output=True)

        audit = AUDIT_JS.strip().rstrip(";")
        for width, height, dark in SIZES:
            where = f"{width}x{height}{', dark' if dark else ''}"
            steps = []
            for page in pages:
                address = base + ("no-such-page/" if page == "404.html" else page[: -len("index.html")])
                steps.append({"name": f"load {page}", "load": address})
                steps.append({"name": page, "js": audit})
                if shots:
                    steps.append({"shot": page.replace("/", "-").replace("index.html", "page") + f"-{width}x{height}{'-dark' if dark else ''}.png"})
            lines, code = run_steps(binary, workdir, width, height, dark, shots, steps)
            if code != 0 or len(lines) != 2 * len(pages):
                problems.append(f"{where}: only {len(lines)} of {2 * len(pages)} steps finished (return code {code})")
            for line in lines:
                if line["step"].startswith("load "):
                    if line["value"] != "loaded":
                        problems.append(f"{line['step']}, {where}: did not load: {line.get('error', '')[:160]}")
                    continue
                checks += 1
                if line.get("error"):
                    problems.append(f"{line['step']}, {where}: the audit failed: {line['error'][:200]}")
                for note in line.get("notes", []):
                    problems.append(f"{line['step']}, {where}: {note}")
                result = line["value"] if isinstance(line["value"], dict) else {}
                for key, label in AUDIT_KEYS.items():
                    for item in result.get(key) or []:
                        problems.append(f"{line['step']}, {where}: {label}{'' if key == 'stripHidden' else ':'} {item}")
                # SAFETY rule 1, as in the Chrome tests' matrix group.
                if not result.get("stripTop"):
                    problems.append(f"{line['step']}, {where}: the crisis strip's Call 988 is not on screen at the top of the page")
                if (width, height) in PINNED_SIZES and not result.get("pinned"):
                    problems.append(f"{line['step']}, {where}: the crisis strip is not pinned")
                if (width, height) in PINNED_SIZES and not result.get("stripBottom"):
                    problems.append(f"{line['step']}, {where}: the crisis strip's Call 988 scrolls off the screen")
                if (width, height) in ONE_ROW_SIZES and result.get("pinned") and (result.get("stripRows") != 1 or result["pinned"] > ONE_ROW_MAX_PERCENT):
                    problems.append(f"{line['step']}, {where}: the pinned crisis strip takes {result.get('stripRows')} rows and {result['pinned']}% "
                                    f"of the screen's height, where it must be one row of {ONE_ROW_MAX_PERCENT}% or less")
                if width >= 960 and not result.get("headerBottom"):
                    problems.append(f"{line['step']}, {where}: the header's Get Support Now button scrolls off the screen")

        steps = behavior_steps(base)
        expected = {step["name"]: step["expect"] for step in steps if "expect" in step}
        lines, code = run_steps(binary, workdir, 390, 844, False, shots, steps)
        seen = set()
        for line in lines:
            seen.add(line["step"])
            for note in line.get("notes", []):
                problems.append(f"{line['step']}: {note}")
            if line.get("error"):
                problems.append(f"{line['step']}: {line['error'][:200]}")
            elif line["step"] in expected:
                checks += 1
                if line["value"] != expected[line["step"]]:
                    problems.append(f"{line['step']}: got {line['value']!r}, expected {expected[line['step']]!r}")
        for name in expected:
            if name not in seen:
                problems.append(f"{name}: never ran (return code {code})")
    server.close_everything()

    for problem in problems:
        print("FAIL", problem)
    print(f"{checks} checks in WebKit on this Mac, {len(problems)} problems.")
    print("This is macOS WebKit in a window: not iOS Safari, not a phone, and not touch, call links, or offline support.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
