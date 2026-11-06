#!/usr/bin/env python3
"""Proves the browser tests can fail: plants one bug at a time and expects them to catch it.

    python3 tools/test_the_tests.py

Each bug goes into a throwaway copy of the project, never the real files. A test that can't
fail proves nothing, so run this after changing tools/test_browser.py. Needs Python and Chrome.
"""
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP = shutil.ignore_patterns(".git", "__pycache__", "review-packet", "qa-first-version", "*.pdf")


def replace(path, old, new):
    def apply(copy):
        target = copy / path
        text = target.read_text(encoding="utf-8")
        if old not in text:
            raise RuntimeError(f"{path} no longer contains: {old[:70]}")
        target.write_text(text.replace(old, new, 1), encoding="utf-8")
    return apply


def replace_bytes(path, old, new):
    def apply(copy):
        target = copy / path
        data = target.read_bytes()
        if old not in data:
            raise RuntimeError(f"{path} no longer contains: {old[:70]}")
        target.write_bytes(data.replace(old, new, 1))
    return apply


def append_css(rule):
    def apply(copy):
        target = copy / "assets" / "styles.css"
        target.write_text(target.read_text(encoding="utf-8") + "\n" + rule + "\n", encoding="utf-8")
    return apply


def regex(path, pattern, new):
    def apply(copy):
        target = copy / path
        text = target.read_text(encoding="utf-8")
        updated, count = re.subn(pattern, new, text, count=1, flags=re.S)
        if not count:
            raise RuntimeError(f"{path} no longer matches: {pattern[:70]}")
        target.write_text(updated, encoding="utf-8")
    return apply


def big_file(copy):
    (copy / "assets" / "huge.js").write_text("// padding\n" * 60000, encoding="utf-8")
    replace("get-help/index.html", '<script src="../assets/menu.js"', '<script src="../assets/huge.js"></script><script src="../assets/menu.js"')(copy)


def menu_never_closes(copy):
    # Tapping outside closes the menu in two ways, so a real bug needs both broken.
    replace("assets/menu.js", "    if (isOpen() && !nav.contains(event.target) && !button.contains(event.target)) {", "    if (false) {")(copy)
    replace("assets/menu.js", "    if (isOpen() && next && !nav.contains(next) && next !== button) {", "    if (false) {")(copy)


# Name, bug, test group, pages to test, words the failure must contain.
BUGS = [
    ("sideways scrolling", append_css("body { min-width: 500px; }"), "matrix", "get-help", "scrolls sideways"),
    ("low contrast text", append_css(".hero-lead { color: #bbbbbb; }"), "matrix", "get-help", "low contrast"),
    ("an image that doesn't load", replace("index.html", 'src="assets/images/joshua-tree-sunset-1600.jpg"', 'src="assets/images/none.jpg"'), "links", "index", "answered 404"),
    ("something loaded from another site", regex("get-help/index.html", r'<meta name="referrer"', '<link rel="prefetch" href="https://example.com/x.css"><meta name="referrer"'), "matrix", "get-help", "contacted another site"),
    ("a script error", replace("assets/menu.js", "// Opens and closes the phone navigation menu.", "throw new Error('planted');"), "matrix", "get-help", "script error"),
    ("overlapping controls", append_css(".lang-switch { margin-bottom: -40px; }"), "matrix", "get-help", "controls overlap"),
    ("a small tap target", append_css(".pill { min-height: 0; padding: 0 2px; font-size: 8px; }"), "matrix", "get-help", "tap target"),
    ("a link without an underline", append_css(".prose a:not([class]) { text-decoration: none; }"), "matrix", "get-help", "no underline"),
    ("breaking at larger text", append_css(".pill { white-space: nowrap; overflow-wrap: normal; }"), "textsize", "after-a-loss", "off the screen"),
    ("a focus ring removed", append_css(":focus-visible { outline: none; }"), "keyboard", "get-help", "no visible focus ring"),
    ("focus hidden behind Quick exit", append_css("html { scroll-padding-bottom: 0; }"), "keyboard", "es/obtener-ayuda", "covered by"),
    ("a skip link that goes nowhere", regex("get-help/index.html", r'<main id="main" tabindex="-1">', '<main id="main">'), "keyboard", "get-help", "skip link does not move focus"),
    ("Escape not closing the menu", replace("assets/menu.js", "if (event.key === 'Escape' && isOpen()) {", "if (false) {"), "menu", "get-help", "Escape did not close"),
    ("a menu stuck open on a phone", menu_never_closes, "menu", "get-help", "tapping outside"),
    ("a section link hidden by the strip", append_css("html { scroll-padding-top: 0; }"), "jumps", "get-help", "behind the pinned area"),
    ("a folded section that won't open from a link", replace("assets/menu.js", "    if (own) own.open = true;", ""), "folds", "get-help", "leaves it folded"),
    ("a wrong language link", replace("get-help/index.html", '../es/obtener-ayuda/" hreflang="es"', '../es/ayudar-a-alguien/" hreflang="es"'), "language", "get-help", "does not lead back"),
    ("Quick exit leaving the page in history", replace("assets/menu.js", "window.location.replace(exit.href);", "window.location.href = exit.href;"), "quickexit", "get-help", "stayed in the tab's history"),
    ("motion ignoring the setting", replace("assets/styles.css", "@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }", ""), "reducedmotion", "get-help", "still moves"),
    ("a menu that needs JavaScript", append_css("html:not(.js) .site-nav { display: none; }"), "nojs", "get-help", "layout without JavaScript"),
    ("blank printouts", append_css("@media print { main { display: none; } }"), "print", "get-help", "prints almost nothing"),
    ("Quick exit printing", replace("assets/styles.css", "  .quick-exit, .skip-link, .menu-button,", "  .skip-link, .menu-button,"), "print", "get-help", "Quick exit would print"),
    ("a wrong crisis number", replace("get-help/index.html", 'href="sms:838255"', 'href="sms:838256"'), "contact", "get-help", "not a number recorded"),
    ("a broken contact card", replace_bytes("assets/988-lifeline.vcf", b"TEL;TYPE=VOICE:988", b"TEL;TYPE=VOICE:999"), "contact", "get-help", "not recorded in notes/SAFETY.md"),
    ("a control with no name", regex("get-help/index.html", r'<a class="pill" href="tel:911">[^<]*</a>', '<a class="pill" href="tel:911"></a>'), "a11ytree", "get-help", "no accessible name"),
    ("a page left out of the offline list", replace("sw.js", "  'about/',\n", ""), "offline", "about", "not available offline"),
    ("no offline notice", replace("assets/menu.js", "if (navigator.onLine === false && !note) {", "if (false) {"), "offline", "about", "no offline notice"),
    ("the offline worker not registering", replace("assets/menu.js", "    navigator.serviceWorker.register(", "    if (false) navigator.serviceWorker.register("), "offline", "about", "did not take control"),
    ("a heavy page", big_file, "speed", "get-help", "KB loaded"),
    ("a cookie being set", replace("assets/menu.js", "// Opens and closes the phone navigation menu.", "document.cookie = 'visitor=1';"), "privacy", "get-help", "stores something"),
    ("no content security policy", regex("get-help/index.html", r'<meta http-equiv="Content-Security-Policy"[^>]*>', ""), "privacy", "get-help", "doesn't block loading"),
    ("telling outside sites where a visitor came from", regex("get-help/index.html", r'<meta name="referrer"[^>]*>', '<meta name="referrer" content="unsafe-url">'), "privacy", "get-help", "is told the visitor came from here"),
    ("icons vanishing in high contrast", append_css("@media (forced-colors: active) { .action svg { display: none; } }"), "modes", "get-help", "icons disappear"),
]


def run(copy, group, pages):
    done = subprocess.run(
        [sys.executable, "tools/test_browser.py", "--only", group, "--pages", pages],
        cwd=copy, capture_output=True, text=True, timeout=400,
    )
    return done.returncode, done.stdout + done.stderr


def main():
    missed = []
    with tempfile.TemporaryDirectory(prefix="stillwater-bugs-") as folder:
        base = pathlib.Path(folder) / "clean"
        shutil.copytree(ROOT, base, ignore=SKIP)
        # The untouched copy must pass the same tests, or a failure proves nothing.
        groups = sorted({(group, pages) for _, _, group, pages, _ in BUGS})
        for group, pages in groups:
            code, output = run(base, group, pages)
            if code != 0:
                print(f"NOT CLEAN: the untouched copy fails {group} on {pages}")
                print(output[-1500:])
                return 2
        print(f"The untouched copy passes all {len(groups)} test groups used below.")
        for name, bug, group, pages, words in BUGS:
            copy = pathlib.Path(folder) / "bug"
            shutil.rmtree(copy, ignore_errors=True)
            shutil.copytree(ROOT, copy, ignore=SKIP)
            bug(copy)
            code, output = run(copy, group, pages)
            caught = code != 0 and words.lower() in output.lower()
            print(f"  {'caught' if caught else 'MISSED'}: {name} ({group})", flush=True)
            if not caught:
                missed.append(name)
                print("    " + "\n    ".join(line for line in output.strip().splitlines() if "FAIL" in line or "Error" in line)[:900])
    print()
    if missed:
        print(f"{len(missed)} of {len(BUGS)} planted bugs were missed: {missed}")
        return 1
    print(f"All {len(BUGS)} planted bugs were caught.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
