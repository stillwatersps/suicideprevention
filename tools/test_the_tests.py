#!/usr/bin/env python3
"""Proves the checks can fail: plants one bug at a time and expects the checks to catch it.

    python3 tools/test_the_tests.py
    python3 tools/test_the_tests.py --only "crisis strip"   # only bugs whose name has this text

Each bug goes into a throwaway copy of the project, never the real files. A test that can't
fail proves nothing, so run this after changing tools/test_browser.py, tools/check_site.py,
tools/launch_gate.py, or tools/check_crisis_sources.py. Needs Python and Chrome. It reads no
outside website: the checks of other tools run offline, on made-up cases.
"""
import argparse
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
_SKIP_NAMES = shutil.ignore_patterns(".git", "__pycache__", "review-packet", "qa-first-version", "*.pdf")


def SKIP(folder, names):
    """What not to copy. PDFs are left out, except the notes' attachments, which notes link to."""
    skipped = _SKIP_NAMES(folder, names)
    if pathlib.Path(folder).name == "attachments":
        skipped = {name for name in skipped if not name.endswith(".pdf")}
    return skipped


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


def quick_exit_plain_link(copy):
    # A changed inline script no longer matches the page's policy, so it can't run: a plain link.
    replace("get-help/index.html", "location.replace(a.href);", "location.href = a.href;")(copy)


def quick_exit_no_blank(copy):
    replace("get-help/index.html", "document.documentElement.hidden=true;", "")(copy)


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
    # On phones Quick exit sits in the strip, so only the floating desktop button can cover anything.
    ("focus hidden behind Quick exit", append_css("html { scroll-padding-bottom: 0; } @media (min-width: 960px) { .quick-exit { left: 12px; } }"), "keyboard", "es/obtener-ayuda", "covered by"),
    ("a skip link that goes nowhere", regex("get-help/index.html", r'<main id="main" tabindex="-1">', '<main id="main">'), "keyboard", "get-help", "skip link does not move focus"),
    ("Escape not closing the menu", replace("assets/menu.js", "if (event.key === 'Escape' && isOpen()) {", "if (false) {"), "menu", "get-help", "Escape did not close"),
    ("a menu stuck open on a phone", menu_never_closes, "menu", "get-help", "tapping outside"),
    ("a section link hidden by the strip", append_css("html { scroll-padding-top: 0; }"), "jumps", "get-help", "behind the pinned area"),
    ("a folded section that won't open from a link", replace("assets/menu.js", "    if (own) own.open = true;", ""), "folds", "get-help", "leaves it folded"),
    ("a wrong language link", replace("get-help/index.html", '../es/obtener-ayuda/" hreflang="es"', '../es/ayudar-a-alguien/" hreflang="es"'), "language", "get-help", "does not lead back"),
    ("Quick exit leaving the page in history", quick_exit_plain_link, "quickexit", "get-help", "stayed in the tab's history"),
    ("Quick exit leaving the page on screen", quick_exit_no_blank, "quickexit", "get-help", "stays on screen"),
    ("a blank page after coming back from Quick exit", replace("assets/menu.js", "if (document.visibilityState === 'visible') showPageAgain();", ""), "quickexit", "get-help", "leaves it blank"),
    ("Quick exit floating over crisis buttons", append_css("@media (max-width: 959px) { .quick-exit { position: fixed !important; right: 8px; bottom: 8px; } }"), "quickexit", "get-help", "not inside the pinned strip"),
    ("Quick exit too close to Call 911", append_css("@media (max-width: 959px) { .quick-exit { margin-left: 0 !important; } .strip-911 { flex: none !important; } .crisis-bar { justify-content: flex-start !important; column-gap: 0 !important; } }"), "quickexit", "get-help", "too close to call 911"),
    ("crisis strip not pinned on a phone on its side", append_css("@media (max-height: 18.75em) { .crisis-bar { position: static !important; } }"), "matrix", "get-help", "crisis strip is not pinned"),
    ("crisis strip links too small to tap", append_css("@media (max-width: 959px) { .crisis-bar p a { min-height: 0 !important; padding: 0 !important; } }"), "matrix", "get-help", "crisis strip tap target"),
    ("a garbled address stopping the script", replace("assets/menu.js", "      return; // A garbled address.", "      throw error; // A garbled address."), "jumps", "get-help", "garbled address"),
    ("Back showing which feeling was opened", replace("assets/menu.js", "    fold.open = false;\n  });\n});", "  });\n});"), "privacy", "not-sure", "which feeling was opened"),
    ("a long wait for a saved copy on a weak signal", replace("sw.js", "var WAIT_MS = 3000;", "var WAIT_MS = 600000;"), "offline", "get-help", "weak signal"),
    ("waiting again on every file on a weak signal", replace("sw.js", "Date.now() < stalledUntil ? 0 : WAIT_MS", "WAIT_MS"), "offline", "get-help", "weak signal"),
    ("a server error hiding the saved copy", replace("sw.js", "response.status >= 500 ?", "response.status >= 999 ?"), "offline", "get-help", "server error hides"),
    ("a correction lost to the browser's cache", replace("sw.js", "return new Request(path, { cache: 'reload' });", "return path;"), "offline", "get-help", "browser's cache"),
    ("addresses saved with their query", replace("sw.js", "var key = url.origin + url.pathname;", "var key = request.url;"), "offline", "get-help", "saved with its query"),
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
    ("crisis links that can't be tapped", append_css(".crisis-bar a, .action, .crisis-actions a, .pill { pointer-events: none; }"), "matrix", "get-help", "can't be tapped"),
    ("the crisis strip scrolling away on phones", append_css(".crisis-bar { position: static !important; }"), "matrix", "get-help", "scrolls off the screen"),
    # !important, because the strip's own class rule would otherwise win and nothing would be hidden.
    ("the crisis strip hidden on wide screens", append_css("@media (min-width: 960px) { body > aside { display: none !important; } }"), "matrix", "get-help", "not on screen at the top"),
    ("the crisis strip hidden in dark mode", append_css("@media (prefers-color-scheme: dark) { body > aside { display: none !important; } }"), "matrix", "get-help", "not on screen at the top"),
    ("Quick exit covering crisis buttons on the first screen", append_css("@media (min-width: 960px) { .quick-exit { inset: 0 !important; width: auto !important; height: auto !important; } }"), "matrix", "get-help", "covers a crisis link at the top"),
    ("a fold that won't open from another page's link", replace("assets/menu.js", "  openTarget();\n})();", "})();"), "folds", "get-help", "leaves it folded"),
    ("an error a moment after loading", replace("assets/menu.js", "// Opens and closes the phone navigation menu.", "setTimeout(function () { throw new Error('planted late'); }, 200);"), "matrix", "get-help", "planted late"),
    ("an error from tapping the menu button", replace("assets/menu.js", "    setOpen(!isOpen());", "    setOpen(!isOpen()); throw new Error('planted in the menu');"), "menu", "get-help", "planted in the menu"),
    ("photos left out of the offline list", replace("sw.js", "  'assets/images/joshua-tree-sunset-800.webp',\n  'assets/images/joshua-tree-sunset-1600.webp',\n", ""), "offline", "index.html", "image missing offline"),
]

# Bugs for the checks that don't need a browser: name, bug, command, words the failure must contain.
# The publish gate and the monthly crisis check test themselves on made-up cases, offline.
COMMAND_BUGS = [
    ("a review claimed with none recorded", replace("get-help/index.html", "<h1", "<p>Medically reviewed and approved.</p><h1"), ["tools/check_site.py"], "no approval of this page"),
    ("a wrong number in a contact card's note", replace_bytes("assets/988-lifeline.vcf", b"call 911", b"call 811"), ["tools/check_site.py"], "not a number recorded"),
    ("a contact card pointing to another site", replace_bytes("assets/988-lifeline.vcf", b"URL:https://988lifeline.org/", b"URL:https://example.com/"), ["tools/check_site.py"], "not the website of a service"),
    ("the crisis strip hidden by a rule for every aside", append_css("@media (min-width: 960px) { body > aside { display: none !important; } }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the publish gate taking 'not approved' as approval", replace("tools/check_site.py", 'approved = result.lower() in APPROVED and not NOT_APPROVED.search(role + " " + result)', 'approved = "approved" in result.lower()'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate taking one page's review for all", replace("tools/check_site.py", 'mine = [r for r in records if r["page"] == page and r["lang"] == lang and needs.search(r["role"])]', 'mine = [r for r in records if needs.search(r["role"])]'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the monthly check throwing away a good read", replace("tools/check_crisis_sources.py", "if is_real_read(b_status, b_text) or not is_real_read(status, text):", "if True:"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("keywords matched as ordinary words", replace("tools/check_crisis_sources.py", "    if isinstance(option, Word):", "    if False:"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
]


def run(copy, group, pages):
    return run_command(copy, ["tools/test_browser.py", "--only", group, "--pages", pages])


def run_command(copy, command):
    done = subprocess.run([sys.executable, *command], cwd=copy, capture_output=True, text=True, timeout=400)
    return done.returncode, done.stdout + done.stderr


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--only", default="", help="only the planted bugs whose name contains this text")
    args = parser.parse_args()
    browser_bugs = [bug for bug in BUGS if args.only.lower() in bug[0].lower()]
    command_bugs = [bug for bug in COMMAND_BUGS if args.only.lower() in bug[0].lower()]
    missed = []
    with tempfile.TemporaryDirectory(prefix="tidelight-bugs-") as folder:
        base = pathlib.Path(folder) / "clean"
        shutil.copytree(ROOT, base, ignore=SKIP)
        # The untouched copy must pass the same tests, or a failure proves nothing.
        groups = sorted({(group, pages) for _, _, group, pages, _ in browser_bugs})
        commands = sorted({tuple(command) for _, _, command, _ in command_bugs})
        for group, pages in groups:
            code, output = run(base, group, pages)
            if code != 0:
                print(f"NOT CLEAN: the untouched copy fails {group} on {pages}")
                print(output[-1500:])
                return 2
        for command in commands:
            code, output = run_command(base, list(command))
            if code != 0:
                print(f"NOT CLEAN: the untouched copy fails {' '.join(command)}")
                print(output[-1500:])
                return 2
        print(f"The untouched copy passes all {len(groups)} test groups and {len(commands)} other checks used below.")
        planted = [(name, bug, ["tools/test_browser.py", "--only", group, "--pages", pages], words, group)
                   for name, bug, group, pages, words in browser_bugs]
        planted += [(name, bug, command, words, " ".join(command)) for name, bug, command, words in command_bugs]
        for name, bug, command, words, label in planted:
            copy = pathlib.Path(folder) / "bug"
            shutil.rmtree(copy, ignore_errors=True)
            shutil.copytree(ROOT, copy, ignore=SKIP)
            bug(copy)
            code, output = run_command(copy, command)
            caught = code != 0 and words.lower() in output.lower()
            print(f"  {'caught' if caught else 'MISSED'}: {name} ({label})", flush=True)
            if not caught:
                missed.append(name)
                print("    " + "\n    ".join(line for line in output.strip().splitlines() if "FAIL" in line or "Error" in line or "WRONG" in line)[:900])
    print()
    total = len(planted)
    if missed:
        print(f"{len(missed)} of {total} planted bugs were missed: {missed}")
        return 1
    print(f"All {total} planted bugs were caught.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
