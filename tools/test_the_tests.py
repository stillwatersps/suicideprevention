#!/usr/bin/env python3
"""Proves the checks can fail: plants one bug at a time and expects the checks to catch it.

    python3 tools/test_the_tests.py
    python3 tools/test_the_tests.py --only "crisis strip"   # only bugs whose name has this text

Each bug goes into a throwaway copy of the project, never the real files. A test that can't
fail proves nothing, so run this after changing tools/test_browser.py, tools/check_site.py,
tools/launch_gate.py, tools/make_review_packet.py, tools/check_crisis_sources.py, tools/check_live.py,
tools/test_webkit.py, tools/qr.py, or tools/axe_core.py.
Needs Python and Chrome; the WebKit and QR code bugs also need a Mac with Xcode's command line tools. It
reads no outside website: the checks of other tools run offline, on made-up cases or a local copy. The one
exception: if the axe-core bugs are chosen and tools/cache/ has no checked copy of axe-core yet, it is
downloaded and checked once, as tools/axe_core.py --fetch does, before anything is copied.
A bug counts as caught only if the check fails and says so in a FAIL line or its error, not in a NOTE.
The one exception is NOTE_BUGS, out-of-date review packets, which tools/check_site.py reports in a NOTE
on purpose. QUIET_CHANGES are harmless changes that a check must not report at all: it must exit 0, so
a crash doesn't count as quiet, and print no NOTE or FAIL line.
"""
import argparse
import base64
import hashlib
import os
import pathlib
import platform
import re
import shutil
import signal
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


def both(*bugs):
    """Several changes planted together, for a bug that only shows when each of them is made."""
    def apply(copy):
        for bug in bugs:
            bug(copy)
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


def head_script(path, old, new):
    """Changes the page's inline script and the hash for it in the page's policy, so the changed script
    still runs, and the bug tests one thing."""
    def apply(copy):
        target = copy / path
        text = target.read_text(encoding="utf-8")
        script = re.search(r"<script>(.*?)</script>", text).group(1)
        if old not in script:
            raise RuntimeError(f"{path}'s inline script no longer contains: {old[:70]}")
        changed = script.replace(old, new, 1)
        digest = lambda s: "sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()  # noqa: E731
        text = text.replace(script, changed, 1).replace(digest(script), digest(changed), 1)
        target.write_text(text, encoding="utf-8")
    return apply


def cover_layer(copy):
    # A white layer over everything that lets taps through: the crisis links still take taps, but can't be seen.
    replace("get-help/index.html", "</body>", '<div class="planted-cover"></div></body>')(copy)
    append_css(".planted-cover { position: fixed; inset: 0; background: #fff; pointer-events: none; z-index: 1000; }")(copy)


def chat_under_every_tap(copy):
    # The chat link covers the screen, so test taps land on it. The page's guard must stop them,
    # and the browser can't reach the chat service anyway.
    append_css(".crisis-actions a[href^='https://chat'] { position: fixed !important; inset: 0 !important; z-index: 9999 !important; }")(copy)


def strip_in_hidden_box(copy):
    replace("get-help/index.html", '<aside class="crisis-bar"', '<div hidden><aside class="crisis-bar"')(copy)
    replace("get-help/index.html", "</aside>", "</aside></div>")(copy)


def big_file(copy):
    (copy / "assets" / "huge.js").write_text("// padding\n" * 60000, encoding="utf-8")
    replace("get-help/index.html", '<script src="../assets/menu.js"', '<script src="../assets/huge.js"></script><script src="../assets/menu.js"')(copy)


def menu_never_closes(copy):
    # Tapping outside closes the menu in two ways, so a real bug needs both broken.
    replace("assets/menu.js", "    if (isOpen() && !nav.contains(event.target) && !button.contains(event.target)) {", "    if (false) {")(copy)
    replace("assets/menu.js", "    if (isOpen() && next && !nav.contains(next) && next !== button) {", "    if (false) {")(copy)


def quick_exit_plain_link(copy):
    # Following the link the ordinary way keeps the page in the tab's history.
    head_script("get-help/index.html", "try{top.location.replace(a.href);}catch(_){location.replace(a.href);}", "location.href=a.href;")(copy)


def quick_exit_no_blank(copy):
    head_script("get-help/index.html", "document.documentElement.hidden=true;", "")(copy)


def strip_lead_renamed(copy):
    # A tidy-up renames a class in the page and the stylesheet alike. The page looks the same, but the
    # audit could no longer tell the compact strip is in use, so its limits would go unchecked.
    for path in ("get-help/index.html", "assets/styles.css"):
        target = copy / path
        text = target.read_text(encoding="utf-8")
        if "strip-lead" not in text:
            raise RuntimeError(f"{path} no longer contains: strip-lead")
        target.write_text(text.replace("strip-lead", "strip-intro"), encoding="utf-8")


def about_claims_approval_after_rejection(copy):
    # A clinician's rejection is on record, yet the About page says the page is approved.
    replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.",
            "- Get Help: licensed clinical social worker, 2026-11-01, not for the website")(copy)
    replace("about/index.html", '<a href="../get-help/">Get Help</a><span class="status-line">Clinical review: <span class="status-value">Pending</span>',
            '<a href="../get-help/">Get Help</a><span class="status-line">Clinical review: <span class="status-value">Approved</span>')(copy)


def about_approves_spanish_with_lines_rejected(copy):
    # A fluent reader approved the Spanish Get Help page, but rejected the Spanish lines on the English one.
    # The About page still shows Get Help's Spanish review as approved.
    done = subprocess.run([sys.executable, "-c", "import sys; sys.path.insert(0, 'tools'); import make_review_packet; "
                           "print(make_review_packet.section_fingerprint('es/obtener-ayuda/index.html', 'es'))"],
                          cwd=copy, capture_output=True, text=True, check=True)
    replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.",
            f"- Obtener ayuda: native Spanish speaker, 2026-11-01, approved, {done.stdout.strip()}\n"
            "- Español en Get Help: native Spanish speaker, 2026-11-01, not for the website")(copy)
    replace("about/index.html", 'Get Help</a><span class="status-line">Clinical review: <span class="status-value">Pending</span></span>'
            '<span class="status-line">Spanish version, fluent reader: <span class="status-value">Pending</span>',
            'Get Help</a><span class="status-line">Clinical review: <span class="status-value">Pending</span></span>'
            '<span class="status-line">Spanish version, fluent reader: <span class="status-value">Approved</span>')(copy)


def section_prints(copy, *sections):
    """The copy's section fingerprints now, one for each (page, language), for made-up review records."""
    code = ("import sys; sys.path.insert(0, 'tools'); import make_review_packet; "
            f"print(' '.join(make_review_packet.section_fingerprint(page, lang) for page, lang in {list(sections)!r}))")
    done = subprocess.run([sys.executable, "-c", code], cwd=copy, capture_output=True, text=True, check=True)
    return done.stdout.split()


def area_name_changed_after_approval(copy):
    # Get Help's clinical review is recorded as approved, and the About page says so. Then the name a screen reader
    # gives one of Get Help's areas changes. Nothing on screen changes, so only a fingerprint that holds what a
    # screen reader says notices, and the About page must stop saying Approved.
    replace("about/index.html", '<a href="../get-help/">Get Help</a><span class="status-line">Clinical review: <span class="status-value">Pending</span>',
            '<a href="../get-help/">Get Help</a><span class="status-line">Clinical review: <span class="status-value">Approved</span>')(copy)
    (approved,) = section_prints(copy, ("get-help/index.html", "en"))
    replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.",
            f"- Get Help: licensed clinical social worker, 2026-11-01, approved, {approved}")(copy)
    replace("get-help/index.html", 'aria-label="Review status"', 'aria-label="Page status"')(copy)


def strip_link_name_shortened_after_approval(copy):
    # Get Help says it was reviewed, and every section it needs is approved. Then, on Get Help only, the crisis
    # strip's Call 988 link loses the Lifeline's name for screen readers. "Call 988" is already a name on the home
    # page, so only the pair of words on screen and words read aloud shows the change in the text on every page.
    replace("get-help/index.html", "<h1", "<p>Medically reviewed and approved.</p><h1")(copy)
    sections = [("get-help/index.html", "en"), ("(text on every page)", "en"), ("get-help/index.html", "es"),
                ("(español en cada página en inglés)", "es")]
    names = ["Get Help", "Text on every page", "Español en Get Help", "Español en cada página en inglés"]
    roles = ["licensed clinical social worker"] * 2 + ["native Spanish speaker"] * 2
    lines = [f"- {name}: {role}, 2026-11-01, approved, {approved}"
             for name, role, approved in zip(names, roles, section_prints(copy, *sections))]
    replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.", "\n".join(lines))(copy)
    replace("get-help/index.html", 'aria-label="Call 988, the Suicide and Crisis Lifeline"', 'aria-label="Call 988"')(copy)


def shared_line_on_one_page_after_approval(old, new):
    """For Teens says it was reviewed, and every section it needs is approved. Then, on For Teens only, a line of a
    part every page shares is taken off or changed. The text on every page lists each line once, and the other
    pages still have the line, so only the notes saying which pages show each line change its fingerprint."""
    def apply(copy):
        replace("teens/index.html", "<h1", "<p>Medically reviewed and approved.</p><h1")(copy)
        sections = [("teens/index.html", "en"), ("(text on every page)", "en"), ("(español en cada página en inglés)", "es")]
        names = ["For Teens", "Text on every page", "Español en cada página en inglés"]
        roles = ["licensed clinical social worker"] * 2 + ["native Spanish speaker"]
        lines = [f"- {name}: {role}, 2026-11-01, approved, {approved}"
                 for name, role, approved in zip(names, roles, section_prints(copy, *sections))]
        replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.", "\n".join(lines))(copy)
        replace("teens/index.html", old, new)(copy)
    return apply


def menu_names_swapped(copy):
    # On For Teens only, the header's menu takes the footer's name for screen readers, and the footer's the header's.
    # Both names are still on every page, so only comparing each part with the other pages notices.
    target = copy / "teens" / "index.html"
    text = target.read_text(encoding="utf-8")
    if 'aria-label="Main"' not in text or 'aria-label="All pages"' not in text:
        raise RuntimeError("teens/index.html no longer names its menus Main and All pages")
    text = text.replace('aria-label="Main"', 'aria-label="planted"', 1).replace('aria-label="All pages"', 'aria-label="Main"', 1)
    target.write_text(text.replace('aria-label="planted"', 'aria-label="All pages"', 1), encoding="utf-8")


def image_unlisted_where_text_is_skipped(copy):
    # An image in Help Someone's breadcrumb, which the packets leave out, and the packet tool no longer lists an
    # image's description there. A screen reader still says it.
    replace("help-someone/index.html", '<p class="breadcrumb"><a href="../">',
            '<p class="breadcrumb"><img src="../assets/images/joshua-tree-sunset-800.jpg" alt="A planted leaf" width="8" height="8"><a href="../">')(copy)
    replace("tools/make_review_packet.py", '                if classes & SKIP_CLASSES:  # where the packets leave out the text around it\n'
            '                    self._item("image", alt)\n', "")(copy)


def with_current_packets(change):
    """Marks the copy's review packets as just rebuilt, the way tools/make_review_packet.py does after a build,
    and then makes the change. The copy has no packets of its own."""
    def apply(copy):
        code = "import sys; sys.path.insert(0, 'tools'); import make_review_packet; print(make_review_packet.fingerprint())"
        done = subprocess.run([sys.executable, "-c", code], cwd=copy, capture_output=True, text=True, check=True)
        stamp = copy / "notes" / "review-packet" / "FINGERPRINT.txt"
        stamp.parent.mkdir(parents=True, exist_ok=True)
        stamp.write_text(done.stdout.strip() + "\n", encoding="utf-8")
        change(copy)
    return apply


# Name, bug, test group, pages to test, words the failure must contain.
BUGS = [
    ("sideways scrolling", append_css("body { min-width: 500px; }"), "matrix", "get-help", "scrolls sideways"),
    ("low contrast text", append_css(".hero-lead { color: #bbbbbb; }"), "matrix", "get-help", "low contrast"),
    ("an image that doesn't load", replace("index.html", 'src="assets/images/joshua-tree-sunset-1600.jpg"', 'src="assets/images/none.jpg"'), "links", "index", "answered 404"),
    # For Teens links to the section on posts online on Help Someone. Renaming that section would break it.
    ("a link to a section on another page that isn't there", replace("teens/index.html", 'href="../help-someone/#online"', 'href="../help-someone/#posts-online"'), "links", "teens", "points to a missing section"),
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
    ("Quick exit undone by switching apps", replace("assets/menu.js", " && isHomeScreenApp()) showPageAgain();", ") showPageAgain();"), "quickexit", "get-help", "shows the page that was left again"),
    ("a blank page after coming back from Quick exit", replace("assets/menu.js", "if (document.visibilityState === 'visible' && isHomeScreenApp()) showPageAgain();", ""), "quickexit", "get-help", "leaves it blank"),
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
    ("a blank safety plan printing on too many pages", append_css("@media print { .sp-line { height: 40mm; } }"), "print", "safety-plan", "should print on 1 or 2 pages"),
    ("a blank safety plan printing as a grid", append_css("@media print { .sp-sheet { display: grid; } }"), "print", "safety-plan", "prints as grid or flex"),
    ("a blank safety plan printing without 911", replace("safety-plan/index.html", '<p class="pc-urgent">In immediate danger, call 911.</p>\n', ""), "print", "safety-plan", "does not show both 988 and 911"),
    ("a safety plan page left out of the offline list", replace("sw.js", "  'safety-plan/',\n", ""), "offline", "safety-plan", "not available offline"),
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
    ("a see-through crisis strip", append_css(".crisis-bar { opacity: 0.01; }"), "matrix", "get-help", "see-through"),
    ("a crisis strip faded by a rule for its label", append_css('[aria-label="Crisis help and quick exit"] { opacity: 0; }'), "matrix", "get-help", "see-through"),
    ("crisis buttons faded with the page's main part", append_css("main { filter: opacity(40%); }"), "matrix", "get-help", "see-through"),
    ("text faded by a parent's opacity", append_css(".page-hero { opacity: 0.3; }"), "matrix", "get-help", "low contrast"),
    ("the crisis strip under a layer that lets taps through", cover_layer, "matrix", "get-help", "is covered by"),
    ("the crisis strip moved off the screen", append_css(".crisis-bar { transform: translateY(-300%); }"), "matrix", "get-help", "is off the screen"),
    ("the crisis strip clipped away", append_css(".crisis-bar { clip-path: inset(50%); }"), "matrix", "get-help", "at the top of the page, the crisis strip's"),
    ("an upper-case text link with a wrong number", replace("get-help/index.html", 'href="sms:838255"', 'href="SMS:838256"'), "contact", "get-help", "not a number recorded"),
    ("Quick exit leaving another site's frame on screen", head_script("get-help/index.html", "try{top.location.replace(a.href);}catch(_){location.replace(a.href);}", "location.replace(a.href);"), "quickexit", "get-help", "another site's frame"),
    ("Quick exit leaving the page's title in the tab", head_script("get-help/index.html", "document.title='';", ""), "quickexit", "get-help", "title still names"),
    ("test taps landing on the chat link", chat_under_every_tap, "folds", "get-help", "was stopped"),
    ("Quick exit by Escape doing nothing", replace("assets/menu.js", "      last = 0;\n      exit.click();", "      last = 0;"), "quickexit", "get-help", "Escape twice did not leave"),
    ("the Spanish link not standing out for a Spanish browser", replace("assets/menu.js", "  if (link) link.classList.add('lang-offer');", ""), "language", "get-help", "does not stand out"),
    ("the Spanish link standing out for an English browser", replace("assets/menu.js", "  if (!/^es(-|$)/i.test(first)) return;\n", ""), "language", "get-help", "first language is English"),
    ("the Spanish link's highlight in low contrast", append_css(".lang-switch a.lang-offer { color: var(--green-soft); }"), "language", "get-help", "low contrast"),
    ("the Spanish link's highlight storing the language", replace("assets/menu.js", "  if (link) link.classList.add('lang-offer');", "  if (link) link.classList.add('lang-offer');\n  localStorage.setItem('lang', 'es');"), "language", "get-help", "stores something"),
    ("Quick exit by Escape on a single press", replace("assets/menu.js", "if (last && now - last <= WITHIN_MS) {", "if (true) {"), "quickexit", "get-help", "after one Escape"),
    ("Quick exit by Escape with no time limit", replace("assets/menu.js", "if (last && now - last <= WITHIN_MS) {", "if (last) {"), "quickexit", "get-help", "1.4 seconds apart"),
    ("Quick exit by a held-down Escape", replace("assets/menu.js", "    if (event.repeat) return;\n", ""), "quickexit", "get-help", "Escape held down"),
    ("Quick exit by Escape counting across another key", replace("assets/menu.js", "    if ((event.key !== 'Escape' && event.key !== 'Esc') || !plain", "    if (event.key !== 'Escape' && event.key !== 'Esc') return;\n    if (!plain"), "quickexit", "get-help", "another key"),
    ("Quick exit by the Escape that closes the menu", replace("assets/menu.js", " || menuOpen || isTextField", " || isTextField"), "quickexit", "get-help", "while the menu was open"),
    ("Quick exit by Escape from a text field", replace("assets/menu.js", " || menuOpen || isTextField(event.target)) {", " || menuOpen) {"), "quickexit", "check-in", "while a text field had focus"),
    # The compact one-row strip, on short phones on their side and with larger text.
    ("the compact crisis strip not pinned on a short phone", append_css("@media (max-height: 18.75em) and (max-width: 43.99em) { .crisis-bar { position: static !important; } }"), "matrix", "get-help", "crisis strip is not pinned"),
    ("the Spanish compact crisis strip not pinned", replace("assets/styles.css", 'html[lang="es"] .crisis-bar { position: sticky; ', 'html[lang="es"] .crisis-bar { '), "matrix", "es/obtener-ayuda", "crisis strip is not pinned"),
    ("the compact crisis strip wrapping to two rows", append_css("@media (max-height: 18.75em) and (max-width: 43.99em) { .strip-988 { flex: 1 0 100% !important; } }"), "matrix", "get-help", "must be one row"),
    ("the compact crisis strip losing its pin at larger text", replace("assets/styles.css", 'html[lang="en"] .crisis-bar { position: sticky; ', 'html[lang="en"] .crisis-bar { '), "textsize", "get-help", "crisis strip is not pinned"),
    ("a Spanish compact crisis strip too long for one row", replace("assets/styles.css", "    @media (min-width: 34em) and (min-width: 544px) {", "    @media (min-width: 19.5em) and (min-width: 312px) {"), "textsize", "es/obtener-ayuda", "must be one row"),
    ("Quick exit floating outside the compact strip", append_css("@media (max-height: 18.75em) and (max-width: 43.99em) { .quick-exit { position: fixed !important; } }"), "quickexit", "get-help", "not inside the pinned strip"),
    # The compact strip's limits: a quarter of the screen's height at most, and one row.
    ("the compact crisis strip pinned below its height limit", replace("assets/styles.css", "  @media (min-height: 12em) and (min-height: 192px), (min-height: 8.3em) and (min-height: 265px) {", "  @media all {"), "matrix", "get-help", "one row of 25% or less"),
    ("the compact crisis strip's width limit lowered", replace("assets/styles.css", "    @media (min-width: 19.5em) and (min-width: 312px) {", "    @media (min-width: 1em) {"), "textsize", "get-help", "must be one row"),
    ("the compact crisis strip's width floor in px removed", replace("assets/styles.css", "(min-width: 19.5em) and (min-width: 312px)", "(min-width: 19.5em)"), "textsize", "get-help", "must be one row"),
    ("the Spanish compact crisis strip's width floor in px removed", replace("assets/styles.css", "(min-width: 34em) and (min-width: 544px)", "(min-width: 34em)"), "textsize", "es/obtener-ayuda", "must be one row"),
    ("the crisis strip pinned on a screen too short for it", append_css("@media (max-height: 15em) { .crisis-bar { position: sticky !important; } }"), "matrix", "get-help", "where it must scroll away"),
    ("Quick exit scrolling away with the crisis strip", append_css("@media (max-height: 15em) { .quick-exit { position: static !important; } }"), "matrix", "get-help", "Quick exit scrolls away"),
    ("the audit losing sight of the compact strip after a class is renamed", strip_lead_renamed, "matrix", "get-help", "the audit can't tell"),
    # axe-core's WCAG 2.2 A and AA rules.
    # Only the Spanish homepage's path contains "es/index.html", so the bug is planted there.
    ("axe: an image's alt removed", regex("es/index.html", r'(<img src="\.\./assets/images/joshua-tree-sunset-1600\.jpg"[^>]*?) alt="[^"]*"', r"\1"), "axe", "es/index.html", "image-alt"),
    ("axe: a control's name removed", replace("get-help/index.html", "        <span>Menu</span>\n      </button>", "      </button>"), "axe", "get-help", "button-name"),
    ("axe: a color made faint", append_css(".prose p { color: #b4b4b4 !important; }"), "axe", "get-help", "color-contrast"),
    # axe-core can't judge text over the homepage's photo, so the test measures it on screen.
    ("axe: a color made faint over the photo", append_css(".hero-lead { color: #a8a8a8 !important; }"), "axe", "es/index.html", "measured on screen"),
    # The allowance for check-in tabs behind the pinned strip must not cover tabs that are simply too small.
    # Small and stacked tightly, so the spacing that WCAG accepts for small targets isn't there either. Only the #ci-
    # tabs the allowance names are made small, and only after a tab is chosen, where the allowance applies, so neither
    # the Support tab nor the page at the top, which the allowance never covers, can make this count as caught.
    ("axe: check-in tabs too small to tap", append_css("body:has(.ci-panel:target) .ci-tabs ul { display: block !important; } body:has(.ci-panel:target) .ci-tabs a[href^=\"#ci-\"] { display: block !important; min-height: 0 !important; padding: 0 !important; font-size: 9px !important; line-height: 1 !important; }"), "axe", "check-in", 'a[href$="#ci-today"]: Fix any of the following: Target has insufficient size ('),
    # The allowance covers only the states after a tab is chosen. Here the tab row is behind the strip where the page
    # is first checked, at the top, as it would be if the strip grew: that must fail, not pass as a NOTE.
    ("axe: check-in tabs behind the strip at the top of the page", replace("tools/test_browser.py", "                tab.goto(site.url(page))\n                tab.js(OPEN_ALL)\n                ran.add(", "                tab.goto(site.url(page))\n                tab.js(\"if (document.getElementById('ci-today')) location.hash = '#ci-today'; true\")\n                tab.browser.pump(0.05)\n                tab.js(OPEN_ALL)\n                ran.add("), "axe", "check-in", "insufficient size because it is partially obscured"),
    # The floors in px of the full strip's own limits, which keep smaller text from pinning it over more of
    # the screen than at 100%. Each is removed alone, and only the text size tests below 100% can tell.
    ("the full crisis strip's width floor in px removed", replace("assets/styles.css", "@media (max-width: 16em), (max-width: 256px) {", "@media (max-width: 16em) {"), "textsize", "get-help", "where it scrolls away at 100% text"),
    ("the full crisis strip's height floor in px removed", replace("assets/styles.css", "       (max-height: 300px) and (max-width: 703.84px), (max-height: 240px) {", "       (max-height: 240px) {"), "textsize", "es/obtener-ayuda", "as at 100% text"),
    ("the full crisis strip's height floor in px for wide screens removed", replace("assets/styles.css", "(max-height: 300px) and (max-width: 703.84px), (max-height: 240px) {", "(max-height: 300px) and (max-width: 703.84px) {"), "textsize", "get-help", "as at 100% text"),
    ("Quick exit's floors in px removed, so it scrolls away with the crisis strip", replace("assets/styles.css", "  @media (min-width: 256.16px) and (min-height: 300.16px), (min-width: 704px) and (min-height: 240.16px) {", "  @media all {"), "textsize", "get-help", "Quick exit scrolls away"),
    ("the compact crisis strip's floors in px removed from its outer limits", replace("assets/styles.css", ",\n       (max-width: 959px) and (max-width: 703.84px) and (max-height: 300px), (max-width: 959px) and (max-height: 240px),\n", ",\n"), "textsize", "get-help", "where it stays pinned at 100% text"),
    ("the crisis strip's extra words shown with smaller text", replace("assets/styles.css", "@media (max-width: 30em), (max-height: 30em), (max-width: 480px), (max-height: 480px) {", "@media (max-width: 30em), (max-height: 30em) {"), "textsize", "es/obtener-ayuda", "as at 100% text"),
    ("the crisis strip's wider row gap with smaller text", replace("assets/styles.css", "@media (max-width: 959px) and (min-height: 30.01em) and (min-height: 480.16px) {", "@media (max-width: 959px) and (min-height: 30.01em) {"), "textsize", "get-help", "as at 100% text"),
    # Where jump links stop, rewritten November 10, 2026: see "Where a jump link stops" in assets/styles.css.
    ("jump links stopping low where the crisis strip scrolls away", replace("assets/styles.css", "  .site-header { position: relative; }\n  html[lang] { --jump-em: 1rem; --jump-px: 16px; }\n}\n/* Wide screens, which pin", "  .site-header { position: relative; }\n}\n/* Wide screens, which pin"), "jumps", "get-help", "lower than it needs to"),
    ("jump links behind the crisis strip with smaller text, without the padding's floor in px", replace("assets/styles.css", "  html[lang] { --jump-px: 112px; }", "  html[lang] { --jump-px: 0px; }"), "jumps", "get-help", "behind the pinned crisis strip"),
    ("jump links behind the Spanish strip's third row at 481px", both(replace("assets/styles.css", "@media (min-width: 480.16px) and (max-width: 504.84px) and (min-height: 480.16px) { html:lang(es) { --jump-px: 156px; } }", ""),
                                                                    replace("assets/styles.css", "@media (min-width: 30.01em) and (max-width: 31.55em) and (max-width: 959px) and (min-height: 30.01em) { html:lang(es) { --jump-em: 9.75rem; } }", "")), "jumps", "es/obtener-ayuda", "behind the pinned crisis strip"),
    ("jump links behind the compact crisis strip", replace("assets/styles.css", 'html[lang="en"] { --jump-em: 3.9rem; --jump-px: 62px; }', 'html[lang="en"] { --jump-em: 1rem; --jump-px: 16px; }'), "jumps", "get-help", "behind the pinned crisis strip"),
    ("jump links in the lower half with larger text, without the padding's limit of half the screen", replace("assets/styles.css", "  scroll-padding-top: min(max(var(--jump-em, 7rem), var(--jump-px, 112px)), 50dvh);", "  scroll-padding-top: max(var(--jump-em, 7rem), var(--jump-px, 112px));"), "jumps", "get-help", "lower half of the screen"),
    ("jump links behind the header holding the whole menu without JavaScript", replace("assets/styles.css", "{ html:not(.js) { --jump-em: 13rem; } }", "{ }"), "jumps", "get-help", "behind the pinned header"),
    ("the header pinned over more than half of a short wide screen", replace("assets/styles.css", "@media (min-width: 960px) and (max-height: 15.25em) {\n  .site-header { position: relative; }\n  html[lang] { --jump-em: 1rem; --jump-px: 16px; }\n}", ""), "jumps", "es/obtener-ayuda", "more than half"),
    ("the header holding the whole menu pinned over more than a third without JavaScript", replace("assets/styles.css", "  html:not(.js) .site-header { position: relative; }", ""), "jumps", "get-help", "more than a third"),
    # Narrow screens just over 300px tall, such as a phone in split-screen, at the default text size.
    ("the full crisis strip pinned where the compact one fits, on a split-screen phone", replace("assets/styles.css", ",\n       (max-width: 703.84px) and (max-width: 43.99em) and (max-height: 383.84px) {", " {"), "matrix", "get-help", "where the compact strip fits"),
    ("the Spanish full crisis strip pinned over more than a third of a split-screen phone", replace("assets/styles.css", "  html:lang(es) .crisis-bar { position: static; }", ""), "matrix", "es/obtener-ayuda", "more than a third"),
    ("the full crisis strip pinned over more than a third of a foldable's cover screen in split-screen", replace("assets/styles.css", "  html:lang(en) .crisis-bar { position: static; }", ""), "matrix", "get-help", "more than a third"),
    ("the Spanish strip's extra words over a quarter of the screen", replace("assets/styles.css", "  html:lang(es) .strip-extra { display: none; }", ""), "matrix", "es/obtener-ayuda", "shows its extra words"),
    ("Quick exit inside a crisis strip that scrolls away on a split-screen phone", replace("assets/styles.css", "  html:lang(en) .quick-exit { position: fixed; margin-left: 0; padding: 0 14px; gap: 8px; }", ""), "matrix", "get-help", "Quick exit scrolls away"),
]

# Bugs for the checks that don't need a browser: name, bug, command, words the failure must contain.
# The publish gate and the monthly crisis check test themselves on made-up cases, offline.
COMMAND_BUGS = [
    ("a review claimed with none recorded", replace("get-help/index.html", "<h1", "<p>Medically reviewed and approved.</p><h1"), ["tools/check_site.py"], "no approval of this page"),
    ("a wrong number in a contact card's note", replace_bytes("assets/988-lifeline.vcf", b"call 911", b"call 811"), ["tools/check_site.py"], "not a number recorded"),
    ("a contact card pointing to another site", replace_bytes("assets/988-lifeline.vcf", b"URL:https://988lifeline.org/", b"URL:https://example.com/"), ["tools/check_site.py"], "not the website of a service"),
    ("the crisis strip hidden by a rule for every aside", append_css("@media (min-width: 960px) { body > aside { display: none !important; } }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the publish gate taking 'not approved' as approval", replace("tools/check_site.py", 'approved = result.lower() in APPROVED and not NOT_APPROVED.search(role + " " + result)', 'approved = "approved" in result.lower()'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate taking one page's review for all", replace("tools/check_site.py", 'mine = [r for r in records if r["page"] == page and r["lang"] == lang and lang in r["kinds"]]', 'mine = [r for r in records if lang in r["kinds"]]'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    # Each rule of the publish gate has a made-up case in its self-test that fails without the rule.
    ("the publish gate ignoring text changed after approval", replace("tools/check_site.py", '    if found["fingerprint"] != current:', "    if False:"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate letting a lawyer override a clinician", replace("tools/check_site.py", 'mine = [r for r in records if r["page"] == page and r["lang"] == lang and lang in r["kinds"]]', 'mine = [r for r in records if r["page"] == page and r["lang"] == lang]'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate accepting a school or AI role as clinical", replace("tools/check_site.py", "    if CLINICAL_ROLE.search(role) and not NOT_CLINICAL.search(role):", "    if CLINICAL_ROLE.search(role):"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate accepting machine translation as a Spanish reader", replace("tools/check_site.py", "    if SPANISH_ROLE.search(role) and not NOT_SPANISH.search(role):", "    if SPANISH_ROLE.search(role):"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate accepting a record dated in the future", replace("tools/check_site.py", "        if date > today:", "        if False:"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate ignoring a record it can't read", replace("tools/launch_gate.py", '("Every line under \\"Review records\\" can be read", not unreadable,', '("Every line under \\"Review records\\" can be read", True,'), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the publish gate ignoring a page with no review section", replace("tools/launch_gate.py", "missing_pages = missing_sections(find_pages() if pages is None else pages)", "missing_pages = []"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the launch list counting a Simulator note as a phone test", replace("tools/launch_gate.py", '        if NOT_A_PHONE.search(name) or NOT_A_PHONE.search(text.split("\\n", 1)[0]):', "        if False:"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the launch list counting a 'not yet' phone result", replace("tools/launch_gate.py", ' or NOT_DONE.search(match.group("result"))', ""), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the launch list counting 'not yet' as a person's confirmation", replace("tools/launch_gate.py", "    return bool(cell and DATE_IN_CELL.search(cell) and not NOT_DONE.search(cell))", "    return bool(cell)"), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the Spanish About page without its Browse privately section", regex("es/acerca-de/index.html", r'<section id="browse-privately".*?</section>', ""), ["tools/check_site.py"], 'needs a section with the id "browse-privately"'),
    ("a page left out of the review packets", replace("tools/make_review_packet.py", '    ("card/index.html", "CARD", "Wallet card and poster"),\n', ""), ["tools/check_site.py"], "has no section in the review packets"),
    ("the 404 page's Spanish lines left out of the Spanish packet", replace("tools/make_review_packet.py", '    ("404.html", "E-NOTFOUND", "Página no encontrada"),\n', ""), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    # Spanish on an English page reaches the fluent reader's packet, even on a page with a Spanish twin.
    ("a Spanish line on an English page left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p lang="es">Una línea en español.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("a Spanish line inside an English sentence left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p>Help is here, <span lang="es">ahora mismo</span>.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("a Spanish line in text the English packet skips, left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p class="visually-hidden" lang="es">Solo para lectores de pantalla.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    # Text outside every part the packets number, such as a sentence in a div, would reach no reviewer, and no
    # section's fingerprint would change with it. The site check fails on it, in either language.
    ("a Spanish line in a div on an English page, left out of both packets", replace("help-someone/index.html", "<h1", '<div lang="es">Una línea en español.</div><h1'), ["tools/check_site.py"], "text that no review packet shows"),
    ("a Spanish line in a div inside Get Help's Spanish part, left out of both packets", replace("get-help/index.html", "<h3>En español</h3>", "<h3>En español</h3><div>Una línea más en español.</div>"), ["tools/check_site.py"], "text that no review packet shows"),
    ("an English sentence in a div, left out of the review packets", replace("help-someone/index.html", "<h1", "<div>A sentence in no paragraph.</div><h1"), ["tools/check_site.py"], "text that no review packet shows"),
    ("the header's Menu label left out of the review packets", replace("tools/make_review_packet.py", '"blockquote", "label", "button"}', '"blockquote", "label"}'), ["tools/check_site.py"], "text that no review packet shows"),
    # Spanish without lang="es" is read with English sounds, and the Spanish packet finds Spanish by that mark.
    ("a Spanish line on an English page not marked as Spanish", replace("help-someone/index.html", "<h1", "<p>Una línea en español.</p><h1"), ["tools/check_site.py"], 'mark it lang="es"'),
    ("a Spanish line with no accents on an English page, not marked as Spanish", replace("help-someone/index.html", "<h1", "<p>Llama al 988 y marca 2.</p><h1"), ["tools/check_site.py"], 'mark it lang="es"'),
    ("Get Help's Spanish lines left out of the Spanish packet", replace("tools/make_review_packet.py", '    ("get-help/index.html", "EN-HELP", "Español en Get Help"),\n', ""), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("the language links' Spanish lines left out of the Spanish packet", replace("tools/make_review_packet.py", '    (SPANISH_ON_EVERY_PAGE, "EN-ALL", "Español en cada página en inglés"),\n', ""), ["tools/check_site.py"], "parts every English page shares"),
    ("the publish gate leaving out the Spanish lines on English pages", replace("tools/check_site.py", '    found += [(label, page, "es") for page, _, label in make_review_packet.SPANISH_ON_ENGLISH]\n', ""), ["tools/launch_gate.py", "--self-test"], "read wrongly"),
    ("the About page approving Spanish while Get Help's Spanish lines are rejected", about_approves_spanish_with_lines_rejected, ["tools/check_site.py"], "isn't an approval of the current text"),
    ("the About page claiming approval after a rejection", about_claims_approval_after_rejection, ["tools/check_site.py"], "isn't an approval of the current text"),
    ("a review claimed as 'has reviewed'", replace("get-help/index.html", "<h1", "<p>A licensed therapist has reviewed every page.</p><h1"), ["tools/check_site.py"], "no approval of this page"),
    ("a review claimed in Spanish as 'revisó'", replace("es/obtener-ayuda/index.html", "<h1", "<p>Una terapeuta con licencia revisó cada página.</p><h1"), ["tools/check_site.py"], "no approval of this page"),
    ("a future-dated review record", replace("notes/CONTENT-REVIEW.md", "- No review has been recorded.", "- Get Help: licensed clinical social worker, 2062-12-01, not for the website"), ["tools/check_site.py"], "the date is after today"),
    ("the monthly check throwing away a good read", replace("tools/check_crisis_sources.py", "if is_real_read(b_status, b_text) or not is_real_read(status, text):", "if True:"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("keywords matched as ordinary words", replace("tools/check_crisis_sources.py", "    if isinstance(option, Word):", "    if False:"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a see-through crisis strip in the stylesheet", append_css(".crisis-bar { opacity: 0.01; }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the crisis strip faded by a rule for its label", append_css('[aria-label="Crisis help and quick exit"] { opacity: 0; }'), ["tools/check_site.py"], "hides crisis controls"),
    ("crisis buttons faded with the page's main part, in the stylesheet", append_css("main { filter: opacity(40%); }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the crisis strip moved off the screen in the stylesheet", append_css(".crisis-bar { position: relative; left: -9999px; }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the crisis strip clipped away in the stylesheet", append_css(".crisis-bar { clip-path: inset(50%); }"), ["tools/check_site.py"], "hides crisis controls"),
    ("the crisis strip inside a hidden box", strip_in_hidden_box, ["tools/check_site.py"], "crisis controls are hidden"),
    # The compact strip is written once for each language. A change to one copy only must be caught.
    ("the Spanish copy of the compact crisis strip changed alone", replace("assets/styles.css", 'html[lang="es"] .strip-or { display: inline-block; width: .25rem;', 'html[lang="es"] .strip-or { display: inline-block; width: .5rem;'), ["tools/check_site.py"], "English and Spanish copies differ"),
    # A rule without html[lang="..."] inside one copy's block applies to both languages there, out of the comparison's sight.
    ("where jump links stop, changed in the Spanish copy of the compact crisis strip alone", replace("assets/styles.css", 'html[lang="es"] { --jump-em: 3.9rem; --jump-px: 62px; }', 'html[lang="es"] { --jump-em: 3.9rem; --jump-px: 48px; }'), ["tools/check_site.py"], "English and Spanish copies differ"),
    ("a rule without its language inside the Spanish copy of the compact crisis strip", replace("assets/styles.css", '      html[lang="es"] body { padding-bottom: 0; }', '      html[lang="es"] body { padding-bottom: 0; }\n      .strip-or { margin: 0 2rem; }'), ["tools/check_site.py"], "isn't written for that language alone"),
    ("an upper-case text link with a wrong number, in the site check", replace("get-help/index.html", 'href="sms:838255"', 'href="SMS:838256"'), ["tools/check_site.py"], "not a number recorded"),
    ("a link above the site's root", replace("index.html", 'href="get-help/"', 'href="../get-help/"'), ["tools/check_site.py"], "broken link"),
    ("a link to a section on another page that isn't there, in the site check", replace("es/adolescentes/index.html", 'href="../ayudar-a-alguien/#online"', 'href="../ayudar-a-alguien/#publicaciones"'), ["tools/check_site.py"], "points to a missing section"),
    ("a wrong number printed on the wallet card", replace("card/index.html", "call 1-866-488-7386", "call 1-866-488-7368"), ["tools/check_site.py"], "printed card or poster"),
    ("a wrong number printed on the blank safety plan", replace("safety-plan/index.html", "call or text 988, any time.</p>", "call or text 989, any time.</p>"), ["tools/check_site.py"], "printed card or poster"),
    ("a page added later with a source date unlike the other later page's", replace("es/plan-de-seguridad/index.html", "Fuentes consultadas el 10 de noviembre de 2026.", "Fuentes consultadas el 8 de noviembre de 2026."), ["tools/check_site.py"], "sources on the pages added later"),
    ("a page added later claiming the older pages' source date", replace("after-an-attempt/index.html", "<p>Checked November 10, 2026.", "<p>Checked November 6, 2026."), ["tools/check_site.py"], "sources on the pages added later"),
    ("a new page left out of the review packets", replace("tools/make_review_packet.py", '    ("after-an-attempt/index.html", "ATT", "After a suicide attempt"),\n', ""), ["tools/check_site.py"], "has no section in the review packets"),
    ("avoided wording in text the script shows", replace("card/index.html", "If nothing happens, open", "If nothing happens after a failed attempt, open"), ["tools/check_site.py"], "failed attempt"),
    ("hidden text that nothing reads", replace("get-help/index.html", "<h1", "<p hidden>Unread words</p><h1"), ["tools/check_site.py"], "hidden text that no check reads"),
    ("a Quick exit link that leaves only the frame", replace("get-help/index.html", ' target="_top"', ""), ["tools/check_site.py"], 'target="_top"'),
    ("a crisis link sent to another site counted as fine", replace("tools/check_site.py", "if crisis and not same_service(url, final):", "if False:"), ["tools/check_site.py", "--self-test"], "read wrongly"),
    ("a crisis service blocking the link check counted as fine", replace("tools/check_site.py", "(status in (403, 429) and host not in KNOWN_BLOCKERS)", "False"), ["tools/check_site.py", "--self-test"], "read wrongly"),
    ("provider numbers found inside other numbers", replace("tools/check_crisis_sources.py", "return phone_digits(option) in (numbers if numbers is not None else numbers_in(text))", "return option in text"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("988 in the service's name taken as its number", replace("tools/check_crisis_sources.py", "        return re.search(option, text, re.I) is not None", "        return option.number in text if option.number else re.search(option, text, re.I) is not None"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a crisis number with no provider check", regex("tools/check_crisis_sources.py", r'\n    \("https://www\.taps\.org/suicide".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("axe: a changed copy of axe-core accepted", replace_bytes("tools/cache/axe-core-4.14.0/axe.min.js", b"axe v4.14.0", b"axe v4.14.9"), ["tools/axe_core.py", "--check"], "doesn't match"),
    ("axe: the download's SHA-512 check removed", replace("tools/axe_core.py", "    if digest != PACKAGE_SHA512:", "    if False:"), ["tools/axe_core.py", "--self-test"], "was accepted"),
    # The lines for specific groups on Get Help: each number has a check on its provider's page, a keyword or
    # set hours there must stay next to the number, and the pages may only use numbers recorded in notes/SAFETY.md.
    ("a group line's number with no provider check: maternal hotline", regex("tools/check_crisis_sources.py", r'\n    \("https://mchb\.hrsa\.gov/programs-impact/national-maternal-mental-health-hotline".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("a group line's number with no provider check: Disaster Distress Helpline", regex("tools/check_crisis_sources.py", r'\n    \("https://www\.samhsa\.gov/find-help/helplines/disaster-distress-helpline".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("a group line's number with no provider check: Teen Line texts", regex("tools/check_crisis_sources.py", r'\n    \("https://didihirsch\.org/teenline/hotline-support/".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("a group line's number with no provider check: Trans Lifeline", regex("tools/check_crisis_sources.py", r'\n    \("https://translifeline\.org/hotline/".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("a group line's texting keyword matched anywhere on its provider's page", replace("tools/check_crisis_sources.py", r'TEXT_TEEN = Near(r"\btext\W{1,3}TEEN\W{1,3}to\W{1,3}839863\b", "text TEEN to 839863", "839863")', 'TEXT_TEEN = Word("TEEN")'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's changed hours not noticed on its provider's page", replace("tools/check_crisis_sources.py", r'TEEN_CALL_HOURS = Near(r"\b6(?:\s*PM)?\s*[-–—]\s*10\s*PM" + PACIFIC, "calls 6 to 10 PM Pacific")', r'TEEN_CALL_HOURS = Near(r"\bPM" + PACIFIC, "calls 6 to 10 PM Pacific")'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's calling hours in any time zone on its provider's page", replace("tools/check_crisis_sources.py", r'TEEN_CALL_HOURS = Near(r"\b6(?:\s*PM)?\s*[-–—]\s*10\s*PM" + PACIFIC, "calls 6 to 10 PM Pacific")', r'TEEN_CALL_HOURS = Near(r"\b6(?:\s*PM)?\s*[-–—]\s*10\s*PM\b", "calls 6 to 10 PM Pacific")'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's texting hours in any time zone on its provider's page", replace("tools/check_crisis_sources.py", r'TEEN_TEXT_HOURS = Near(r"\b6(?:\s*PM)?\s*[-–—]\s*9\s*PM" + PACIFIC, "texts 6 to 9 PM Pacific")', r'TEEN_TEXT_HOURS = Near(r"\b6(?:\s*PM)?\s*[-–—]\s*9\s*PM\b", "texts 6 to 9 PM Pacific")'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's hours in any time zone on its provider's page", replace("tools/check_crisis_sources.py", r'TRANS_HOURS = Near(r"\b10\s*AM\s*[-–—]\s*6\s*PM\s+Pacific\b", "10 AM to 6 PM Pacific")', r'TRANS_HOURS = Near(r"\b10\s*AM\s*[-–—]\s*6\s*PM\b", "10 AM to 6 PM Pacific")'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's text link not looked for on its provider's page", replace("tools/check_crisis_sources.py", r'MATERNAL_TEXT = Near(r"\bsms:\+?1?-?833-?852-?6262\b"', r'MATERNAL_TEXT = Near(r"833-?852-?6262\b"'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line's blocked provider page failing every monthly run", replace("tools/check_site.py", ', "www.fcc.gov", "mchb.hrsa.gov"}', ', "www.fcc.gov"}'), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a group line with a wrong number on Get Help",replace("get-help/index.html", 'href="tel:+18775658860"', 'href="tel:+18775658861"'), ["tools/check_site.py"], "not a number recorded"),
    ("a group line with a wrong number on Spanish Get Help", replace("es/obtener-ayuda/index.html", 'href="sms:839863"', 'href="sms:839864"'), ["tools/check_site.py"], "not a number recorded"),
    ("a group line whose label and number disagree on Get Help", replace("get-help/index.html", ">Call 1-800-985-5990<", ">Call 1-800-985-5999<"), ["tools/check_site.py"], "does not match its destination"),
    ("notes published without the live check noticing", replace("tools/preview_server.py", 'if ".." in parts or (parts and parts[0] not in allowed):', 'if ".." in parts:'), ["tools/check_live.py", "--local"], "must not be published"),
    # The fluent Spanish reader's questions: a question that lost its Spanish would never be asked.
    ("a question for the fluent Spanish reader that lost its Spanish", regex("notes/CONTENT-REVIEW.md", r"\n1\. ES: .*?\n   EN: ", "\n1. EN: "), ["tools/check_site.py"], "has no Spanish"),
    ("the Spanish reader's questions no longer marked as an AI translation", replace("notes/CONTENT-REVIEW.md", "Preguntas para la persona hispanohablante. **Unreviewed AI translation:**", "Preguntas para la persona hispanohablante."), ["tools/check_site.py"], "must say"),
    ("the Spanish packet leaving out the questions for its reader", replace("tools/make_review_packet.py", "    parts.append(questions_part())\n", ""), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("a question with no Spanish read as complete", replace("tools/make_review_packet.py", "            if not question.get(key):\n", "            if key != \"es\" and not question.get(key):\n"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    # What a screen reader says that the screen doesn't show: the site check reads each page its own way and
    # fails on any such words that no packet shows.
    ("the review packets leaving out the names screen readers give areas and lists", replace("tools/make_review_packet.py", 'if value and not (name == "aria-label" and tag in CONTROLS):', 'if value and name != "aria-label":'), ["tools/check_site.py"], "screen reader text that no review packet shows"),
    ("the review packets leaving out the crisis links' names for screen readers", replace("tools/make_review_packet.py", '"label": tidy(attrs.get("aria-label")),', '"label": "",'), ["tools/check_site.py"], "screen reader text that no review packet shows"),
    ("the review packets leaving out the section names after the Show more buttons", replace("tools/make_review_packet.py", 'if "visually-hidden" in (attrs.get("class") or "").split() and self.hidden is None and tag not in self.VOID:', "if False:"), ["tools/check_site.py"], "screen reader text that no review packet shows"),
    ("the review packets leaving out each page's title", replace("tools/make_review_packet.py", "        if title:\n            self.items.insert(0,", "        if False:\n            self.items.insert(0,"), ["tools/check_site.py"], "screen reader text that no review packet shows"),
    ("a Spanish name for screen readers on an English page left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<section lang="es" aria-label="Ayuda en español"><p lang="en">Help in Spanish is on Get Help.</p></section><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("the review packets leaving out image descriptions", replace("tools/make_review_packet.py", 'if tag == "img" and attrs.get("alt") and not self._hidden():', "if False:"), ["tools/check_site.py"], "screen reader text that no review packet shows"),
    ("an image description where the packets skip the text, left out of the review packets", image_unlisted_where_text_is_skipped, ["tools/check_site.py"], "screen reader text that no review packet shows"),
    # The packets list the screen reader words in the parts every page shares once, so they must be the same on every
    # page of a language: a change on one page would otherwise reach no reviewer and change no fingerprint.
    ("a Spanish crisis link's full name for screen readers lost on one page", replace("es/adolescentes/index.html", ' aria-label="Llama al 988 y marca 2, la Línea 988 en español"', ""), ["tools/check_site.py"], "different words in its crisis strip"),
    ("the two menu names swapped for screen readers on one page", menu_names_swapped, ["tools/check_site.py"], "different words in its header"),
    # Each section's fingerprint holds what a screen reader says, so an approval notices when it changes.
    ("a screen reader's name for an area of Get Help changed after its approval", area_name_changed_after_approval, ["tools/check_site.py"], "isn't an approval of the current text"),
    ("the crisis strip's Call 988 link renamed for screen readers on one page after its approval", strip_link_name_shortened_after_approval, ["tools/check_site.py"], "no approval of this page"),
    # A line of the parts every page shares, taken off or changed on one page after the text on every page was
    # approved. Before the notes saying which pages show each line, no fingerprint changed.
    ("the crisis buttons' 911 line taken off one page after its approval", shared_line_on_one_page_after_approval(
        '        <p class="fallback">On a device that can\'t call or text? Call or text <strong>988</strong> from a phone, or go to <a href="https://988lifeline.org/">988lifeline.org</a>. In immediate danger, call <strong>911</strong>.</p>\n', ""),
     ["tools/check_site.py"], "no approval of this page"),
    ("the 988 texting-steps line taken off one page after its approval", shared_line_on_one_page_after_approval(
        "        <p>988 says a text starts with a few steps. Reply NEXT to accept its terms, answer a brief survey, and wait for a counselor.</p>\n", ""),
     ["tools/check_site.py"], "no approval of this page"),
    ("the crisis strip's 911 line taken off one page after its approval", shared_line_on_one_page_after_approval(
        '    <p class="strip-911"><span class="strip-lead">In immediate danger, </span><a href="tel:911" aria-label="Call 911, emergency services">call 911</a><span class="strip-end">.</span></p>\n', ""),
     ["tools/check_site.py"], "no approval of this page"),
    ("a shared crisis line changed on one page to another page's wording after its approval", shared_line_on_one_page_after_approval(
        "<p>The 988 Suicide &amp; Crisis Lifeline is free, confidential, and available any time. It is a separate service from Tidelight.</p>",
        "<p>The 988 Suicide &amp; Crisis Lifeline is free, confidential, and available any time. You can contact it about someone else, too. It is a separate service from Tidelight.</p>"),
     ["tools/check_site.py"], "no approval of this page"),
    ("a shared link sent elsewhere on one page after its approval", shared_line_on_one_page_after_approval(
        '<p class="access-link"><a href="../get-help/#deaf-hoh">Deaf or hard of hearing</a></p>',
        '<p class="access-link"><a href="../get-help/">Deaf or hard of hearing</a></p>'),
     ["tools/check_site.py"], "no approval of this page"),
    # The "what changed" packets (--changes), which the self-test builds in a scratch copy with a scratch history.
    ("the what-changed packet comparing with the oldest approval", replace("tools/make_review_packet.py", 'return (max(mine, key=lambda r: (r["date"], r["index"])) if mine else None)', 'return (min(mine, key=lambda r: (r["date"], r["index"])) if mine else None)'), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("the what-changed packet counting a lawyer's approval", replace("tools/make_review_packet.py", 'and lang in r["kinds"] and r["approved"]]', 'and r["approved"]]'), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("the what-changed packet leaving out a section changed since its approval", replace("tools/make_review_packet.py", 'elif current and approval["fingerprint"] == current["fingerprint"]:', "elif current:"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("the what-changed packet taking the approved text from a commit with another fingerprint", replace("tools/make_review_packet.py", 'if found and found["fingerprint"] == wanted:', "if found:"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("the what-changed packet showing no differences", replace("tools/make_review_packet.py", "    if old == new:\n        return \"\"\n", "    return \"\"\n"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    # The build date in each packet's own language, whatever the computer's language setting.
    ("the Spanish packet giving its build date in English", replace("tools/make_review_packet.py", "Generado el {spanish_date(day)}", "Generado el {english_date(day)}"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
    ("the Spanish build date taken from the computer's language setting", replace("tools/make_review_packet.py", "    return f\"{day.day} de {MONTHS['es'][day.month - 1]} de {day.year}\"", "    return day.strftime(\"%-d de %B de %Y\")"), ["tools/make_review_packet.py", "--self-test"], "read wrongly"),
]
# Bugs the site check must report in a NOTE, because what it finds isn't a failure: the review packets are out of
# date, and rebuilding them needs Chrome. Name, change, command, words the NOTE must contain. Each copy is marked as
# just rebuilt first, so only the change can make the packets out of date.
NOTE_BUGS = [
    ("a heading changed in the packet tool, leaving the packets out of date", with_current_packets(replace("tools/make_review_packet.py", '<h2 class="first">How to use this packet</h2>', '<h2 class="first">How to read this packet</h2>')), ["tools/check_site.py"], "the review packets are out of date"),
    ("the PDF footer changed in the packet tool, leaving the packets out of date", with_current_packets(replace("tools/make_review_packet.py", "Draft. No clinician has reviewed this.", "Draft.")), ["tools/check_site.py"], "the review packets are out of date"),
    ("a section name changed in what the packet tool reads from the site check", with_current_packets(replace("tools/check_site.py", '("Wording outside the page text", OUTSIDE_TEXT["en"], "en")', '("Words outside the page text", OUTSIDE_TEXT["en"], "en")')), ["tools/check_site.py"], "the review packets are out of date"),
]
# Harmless changes the site check must not report: none of them changes what a packet shows, and a check that
# cries wolf gets ignored. Name, change, command, words that must not appear. The check must also exit 0 and print
# no NOTE or FAIL line, so a check that crashed or couldn't run doesn't count as quiet.
QUIET_CHANGES = [
    ("a change to the browser tests, with the packets up to date", with_current_packets(replace("tools/test_browser.py", "Needs Python 3 and Google Chrome or Chromium.", "Needs Python 3, and Google Chrome or Chromium.")), ["tools/check_site.py"], "out of date"),
    ("a change to another check in the site check, with the packets up to date", with_current_packets(replace("tools/check_site.py", '"unsuccessful attempt", "completed suicide", "suicide victim",', '"unsuccessful attempt", "completed suicide", "suicide victim", "suicide epidemic",')), ["tools/check_site.py"], "out of date"),
]
# Bugs only WebKit can show, for tools/test_webkit.py, on a Mac with Xcode's command line tools.
# Chrome doesn't match @supports (font: -apple-system-body), so only Safari's engine sees these.
if platform.system() == "Darwin" and shutil.which("swiftc"):
    COMMAND_BUGS += [
        ("the crisis strip unpinned only in Safari", append_css("@supports (font: -apple-system-body) { .crisis-bar { position: static !important; } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "not pinned"),
        ("the crisis strip see-through only in Safari", append_css("@supports (font: -apple-system-body) { .crisis-bar { opacity: 0.01; } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "see-through"),
        ("Quick exit by Escape doing nothing in WebKit", replace("assets/menu.js", "      last = 0;\n      exit.click();", "      last = 0;"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "Escape twice blanks the page"),
        ("the crisis strip hidden in WebKit", append_css("body > aside { display: none !important; }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "not on screen at the top"),
        # The QR code printed by tools/preview_server.py --lan, read back with Core Image.
        # Readers correct a few wrong format bits, so the self-test compares them with the standard's own value.
        ("a QR code with the wrong format bits", replace("tools/qr.py", "FORMAT_MASK = 0x5412", "FORMAT_MASK = 0x5413"), ["tools/qr.py", "--self-test"], "the format bits for level M"),
        ("a QR code with the wrong error correction", replace("tools/qr.py", "        root = gf_multiply(root, 2)", "        root = gf_multiply(root, 3)"), ["tools/qr.py", "--self-test"], "could not read the code back"),
        ("a QR code with its data in the wrong order", replace("tools/qr.py", "                for x in (right, right - 1):", "                for x in (right - 1, right):"), ["tools/qr.py", "--self-test"], "could not read the code back"),
        ("a QR code version too small for its data", replace("tools/qr.py", "5: (24, (2, 43)),", "5: (24, (2, 44)),"), ["tools/qr.py", "--self-test"], "the block table has"),
        ("a QR code mask chosen without the penalty rules", replace("tools/qr.py", "        mask = scores.index(min(scores))", "        mask = 0"), ["tools/qr.py", "--self-test"], "has a lower penalty"),
        ("a QR code penalty rule 3 that ignores the border", replace("tools/qr.py", "        padded = [False] * 4 + list(line) + [False] * 4", "        padded = list(line)"), ["tools/qr.py", "--self-test"], "penalty rule 3"),
        ("a QR code drawn upside down in the terminal", replace("tools/qr.py", '(True, False): "\\u2580", (False, True): "\\u2584"', '(True, False): "\\u2584", (False, True): "\\u2580"'), ["tools/qr.py", "--self-test"], "terminal drawing doesn't match"),
        ("the preview server printing no address under the code", replace("tools/preview_server.py", '        f"On a phone on the same Wi-Fi: {address}",\n', ""), ["tools/qr.py", "--self-test"], "doesn't print the address"),
        ("the compact crisis strip on two rows only in Safari", append_css("@supports (font: -apple-system-body) { @media (max-height: 18.75em) and (max-width: 43.99em) { .strip-988 { flex: 1 0 100% !important; } } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "must be one row"),
        # The WebKit audit skips the text of closed folds, which WebKit gives boxes to. Real text must still count.
        # The typical split-screen and foldable sizes: which strip each shows, from EXPECT in tools/test_browser.py.
        ("the crisis strip pinned over a foldable's cover screen in split-screen only in Safari", append_css("@supports (font: -apple-system-body) { @media (max-width: 299.84px) and (max-height: 353.2px) { html:lang(en) .crisis-bar { position: sticky !important; } } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "where it must show"),
        ("a floating Quick exit over the page's last line only in Safari", append_css("@supports (font: -apple-system-body) { body { padding-bottom: 0 !important; } .quick-exit { left: 8px !important; right: auto !important; } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "Quick exit covers something"),
    ]


def run(copy, group, pages):
    return run_command(copy, ["tools/test_browser.py", "--only", group, "--pages", pages])


def run_command(copy, command, timeout=400):
    """Runs one check in the copy. Its temporary files, Chrome's profile included, go in a folder beside
    the copy, which is removed with it. If it runs too long, it is stopped with everything it started,
    such as Chrome, and the return code is None."""
    scratch = pathlib.Path(copy).parent / (pathlib.Path(copy).name + "-tmp")
    scratch.mkdir(exist_ok=True)
    env = dict(os.environ, TMPDIR=str(scratch), TMP=str(scratch), TEMP=str(scratch))
    process = subprocess.Popen([sys.executable, *command], cwd=copy, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, env=env, start_new_session=True)
    try:
        output, _ = process.communicate(timeout=timeout)
        return process.returncode, output
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except (OSError, AttributeError):
            process.kill()
        output, _ = process.communicate()
        return None, (output or "") + f"\nTimed out after {timeout} s, and was stopped."


def counted_lines(output):
    """The output without its NOTE lines, which can name a limit without anything having failed."""
    return "\n".join(line for line in output.splitlines() if not line.strip().startswith("NOTE"))


def note_lines(output):
    """Only the output's NOTE lines."""
    return "\n".join(line for line in output.splitlines() if line.strip().startswith("NOTE"))


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--only", default="", help="only the planted bugs whose name contains this text")
    args = parser.parse_args()
    browser_bugs = [bug for bug in BUGS if args.only.lower() in bug[0].lower()]
    command_bugs = [bug for bug in COMMAND_BUGS if args.only.lower() in bug[0].lower()]
    note_bugs = [bug for bug in NOTE_BUGS if args.only.lower() in bug[0].lower()]
    quiet_changes = [change for change in QUIET_CHANGES if args.only.lower() in change[0].lower()]
    missed = []
    if any(bug[0].startswith("axe:") for bug in browser_bugs + command_bugs):
        sys.path.insert(0, str(ROOT / "tools"))
        import axe_core
        try:
            axe_core.fetch()
        except axe_core.AxeError as error:
            print(f"NOT CLEAN: axe-core isn't available: {error}")
            return 2
    noisy = []
    with tempfile.TemporaryDirectory(prefix="tidelight-bugs-") as folder:
        base = pathlib.Path(folder) / "clean"
        shutil.copytree(ROOT, base, ignore=SKIP)
        # The untouched copy must pass the same tests, or a failure proves nothing.
        groups = sorted({(group, pages) for _, _, group, pages, _ in browser_bugs})
        commands = sorted({tuple(command) for _, _, command, _ in command_bugs + note_bugs + quiet_changes})
        clean_output = {}
        for group, pages in groups:
            code, output = run(base, group, pages)
            if code != 0:
                print(f"NOT CLEAN: the untouched copy fails {group} on {pages}")
                print(output[-1500:])
                return 2
        for command in commands:
            code, output = run_command(base, list(command))
            clean_output[command] = output
            if code != 0:
                print(f"NOT CLEAN: the untouched copy fails {' '.join(command)}")
                print(output[-1500:])
                return 2
        for name, _, command, words in note_bugs:
            if words.lower() in clean_output[tuple(command)].lower():
                print(f"NOT CLEAN: the untouched copy already says \"{words}\" in {' '.join(command)}")
                return 2
        print(f"The untouched copy passes all {len(groups)} test groups and {len(commands)} other checks used below.")
        planted = [(name, bug, ["tools/test_browser.py", "--only", group, "--pages", pages], words, group, "fail")
                   for name, bug, group, pages, words in browser_bugs]
        planted += [(name, bug, command, words, " ".join(command), "fail") for name, bug, command, words in command_bugs]
        planted += [(name, bug, command, words, " ".join(command), "note") for name, bug, command, words in note_bugs]
        planted += [(name, change, command, words, " ".join(command), "quiet") for name, change, command, words in quiet_changes]
        for name, bug, command, words, label, how in planted:
            copy = pathlib.Path(folder) / "bug"
            shutil.rmtree(copy, ignore_errors=True)
            shutil.copytree(ROOT, copy, ignore=SKIP)
            bug(copy)
            code, output = run_command(copy, command)
            timed_out = " (timed out)" if code is None else ""
            if how == "quiet":
                # Quiet means it exits 0, so a crash or a failure never counts, and prints no NOTE or FAIL line at
                # all, not even one the untouched copy prints too, such as a note that the packets couldn't be
                # checked. Each harmless change marks its copy's packets as just rebuilt, so none is expected.
                reported = [line for line in output.splitlines() if line.strip().startswith(("NOTE", "FAIL"))]
                quiet = code == 0 and words.lower() not in output.lower() and not reported
                print(f"  {'quiet' if quiet else 'NOISY'}: {name} ({label}){timed_out}", flush=True)
                if not quiet:
                    noisy.append(name)
                    shown = reported + [line for line in output.strip().splitlines() if words.lower() in line.lower()]
                    print(f"    exit {code}\n    " + "\n    ".join(shown)[:900])
                continue
            if how == "note":
                caught = code is not None and words.lower() in note_lines(output).lower()
            else:
                caught = code not in (0, None) and words.lower() in counted_lines(output).lower()
            print(f"  {'caught' if caught else 'MISSED'}: {name} ({label}){timed_out}", flush=True)
            if not caught:
                missed.append(name)
                print("    " + "\n    ".join(line for line in output.strip().splitlines() if "FAIL" in line or "Error" in line or "WRONG" in line or "NOTE" in line)[:900])
    print()
    total = len(planted) - len(quiet_changes)
    if missed or noisy:
        if missed:
            print(f"{len(missed)} of {total} planted bugs were missed: {missed}")
        if noisy:
            print(f"{len(noisy)} of {len(quiet_changes)} harmless changes were reported: {noisy}")
        return 1
    quiet_line = f", and all {len(quiet_changes)} harmless changes stayed quiet" if quiet_changes else ""
    print(f"All {total} planted bugs were caught{quiet_line}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
