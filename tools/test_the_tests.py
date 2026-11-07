#!/usr/bin/env python3
"""Proves the checks can fail: plants one bug at a time and expects the checks to catch it.

    python3 tools/test_the_tests.py
    python3 tools/test_the_tests.py --only "crisis strip"   # only bugs whose name has this text

Each bug goes into a throwaway copy of the project, never the real files. A test that can't
fail proves nothing, so run this after changing tools/test_browser.py, tools/check_site.py,
tools/launch_gate.py, tools/make_review_packet.py, tools/check_crisis_sources.py, tools/check_live.py, or tools/test_webkit.py.
Needs Python and Chrome; the WebKit bugs also need a Mac with Xcode's command line tools. It reads
no outside website: the checks of other tools run offline, on made-up cases or a local copy.
A bug counts as caught only if the check fails and says so in a FAIL line or its error, not in a NOTE.
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
    ("a page left out of the review packets", replace("tools/make_review_packet.py", '    ("card/index.html", "CARD", "Wallet card and poster"),\n', ""), ["tools/check_site.py"], "has no section in the review packets"),
    ("the 404 page's Spanish lines left out of the Spanish packet", replace("tools/make_review_packet.py", '    ("404.html", "E-NOTFOUND", "Página no encontrada"),\n', ""), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    # Spanish on an English page reaches the fluent reader's packet, even on a page with a Spanish twin.
    ("a Spanish line on an English page left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p lang="es">Una línea en español.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("a Spanish line inside an English sentence left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p>Help is here, <span lang="es">ahora mismo</span>.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
    ("a Spanish line in text the English packet skips, left out of the Spanish packet", replace("help-someone/index.html", "<h1", '<p class="visually-hidden" lang="es">Solo para lectores de pantalla.</p><h1'), ["tools/check_site.py"], "no section for them in the Spanish review packet"),
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
    ("an upper-case text link with a wrong number, in the site check", replace("get-help/index.html", 'href="sms:838255"', 'href="SMS:838256"'), ["tools/check_site.py"], "not a number recorded"),
    ("a link above the site's root", replace("index.html", 'href="get-help/"', 'href="../get-help/"'), ["tools/check_site.py"], "broken link"),
    ("a wrong number printed on the wallet card", replace("card/index.html", "call 1-866-488-7386", "call 1-866-488-7368"), ["tools/check_site.py"], "printed card or poster"),
    ("avoided wording in text the script shows", replace("card/index.html", "If nothing happens, open", "If nothing happens after a failed attempt, open"), ["tools/check_site.py"], "failed attempt"),
    ("hidden text that nothing reads", replace("get-help/index.html", "<h1", "<p hidden>Unread words</p><h1"), ["tools/check_site.py"], "hidden text that no check reads"),
    ("a Quick exit link that leaves only the frame", replace("get-help/index.html", ' target="_top"', ""), ["tools/check_site.py"], 'target="_top"'),
    ("a crisis link sent to another site counted as fine", replace("tools/check_site.py", "if crisis and not same_service(url, final):", "if False:"), ["tools/check_site.py", "--self-test"], "read wrongly"),
    ("provider numbers found inside other numbers", replace("tools/check_crisis_sources.py", "return phone_digits(option) in (numbers if numbers is not None else numbers_in(text))", "return option in text"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("988 in the service's name taken as its number", replace("tools/check_crisis_sources.py", "        return re.search(option, text, re.I) is not None", "        return option.number in text if option.number else re.search(option, text, re.I) is not None"), ["tools/check_crisis_sources.py", "--self-test"], "read wrongly"),
    ("a crisis number with no provider check", regex("tools/check_crisis_sources.py", r'\n    \("https://www\.taps\.org/suicide".*?\n', "\n"), ["tools/check_crisis_sources.py", "--self-test"], "no check covers it"),
    ("notes published without the live check noticing", replace("tools/preview_server.py", 'if ".." in parts or (parts and parts[0] not in allowed):', 'if ".." in parts:'), ["tools/check_live.py", "--local"], "must not be published"),
]
# Bugs only WebKit can show, for tools/test_webkit.py, on a Mac with Xcode's command line tools.
# Chrome doesn't match @supports (font: -apple-system-body), so only Safari's engine sees these.
if platform.system() == "Darwin" and shutil.which("swiftc"):
    COMMAND_BUGS += [
        ("the crisis strip unpinned only in Safari", append_css("@supports (font: -apple-system-body) { .crisis-bar { position: static !important; } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "not pinned"),
        ("the crisis strip see-through only in Safari", append_css("@supports (font: -apple-system-body) { .crisis-bar { opacity: 0.01; } }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "see-through"),
        ("the crisis strip hidden in WebKit", append_css("body > aside { display: none !important; }"), ["tools/test_webkit.py", "--pages", "get-help/index.html"], "not on screen at the top"),
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
            caught = code not in (0, None) and words.lower() in counted_lines(output).lower()
            print(f"  {'caught' if caught else 'MISSED'}: {name} ({label}){' (timed out)' if code is None else ''}", flush=True)
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
