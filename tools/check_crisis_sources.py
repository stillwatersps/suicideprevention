#!/usr/bin/env python3
"""Reads each crisis provider's own page and checks that the details on this site still appear there.

    python3 tools/check_crisis_sources.py
    python3 tools/check_crisis_sources.py --self-test   # checks this tool with made-up pages, offline

It only reads pages. It never calls, texts, chats, or submits anything. A page that blocks automated
reading is listed for a person to open, and nothing is done to get around the block. Passing doesn't
mean a person has confirmed the details, and finding a detail on a page doesn't show the service
still runs: notes/SAFETY.md has a column for a person's check. It runs monthly in
.github/workflows/monitor.yml, and exits with an error if a detail is missing from its provider's page,
or if a page couldn't be read and isn't one of the few known to block scripts.
"""
import argparse
import html
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

TOOLS = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
from browser import Browser, Tab, find_chrome  # noqa: E402
from check_site import KNOWN_BLOCKERS, allowed_numbers, phone_digits, write_job_summary  # noqa: E402


class Word(str):
    """A keyword a person types, such as AYUDA. It must appear in exactly this form, as a whole word,
    so that ordinary words like "ayuda" or "Start Chat" can't stand in for it."""


# Each page, and what must appear on it. A tuple means any one of those wordings will do.
# Other wording is matched in any letter case, because pages write it differently ("Next" for NEXT).
CHECKS = [
    ("https://988lifeline.org/get-help/", ["988", ("then press 2", "press 2"), Word("AYUDA"), ("pressing 1", "press 1"), "838255"]),
    ("https://988lifeline.org/get-help/what-to-expect/", ["press 3", Word("PRIDE"), "press 2", "NEXT"]),
    ("https://988lifeline.org/deaf-hard-of-hearing-hearing-loss/", ["videophone", "711"]),
    ("https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/", ["240", "interpreter"]),
    ("https://www.veteranscrisisline.net/", ["988", "838255", ("Press 1", "press 1")]),
    ("https://www.thetrevorproject.org/get-help/", ["866-488-7386", "678-678", Word("START"), "866-803-3699"]),
    ("https://www.crisistextline.org/about-us/faq/", ["741741", Word("HOME")]),
    ("https://www.samhsa.gov/find-help/helplines/national-helpline", [("662-4357", "662-HELP"), "487-4889"]),
    ("https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911", ["911", "voice call"]),
    ("https://findtreatment.gov/", []),
]
# Numbers in notes/SAFETY.md that the checks above cover. A new number there must be added here too.
COVERED = {"988", "838255", "8664887386", "678678", "8668033699", "741741", "8006624357", "8004874889", "711", "911"}
BLOCKED_STATUSES = {401, 403, 406, 429, 503}
# Fewer words than this is a block or an error screen, not a page that dropped a number.
REAL_PAGE_WORDS = 40


def read_simple(url):
    """Returns (status, text). Status None means the page couldn't be reached."""
    request = urllib.request.Request(url, headers={"User-Agent": "Tidelight crisis source check"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except Exception:  # a network problem is reported as unread, never as a pass
        return None, ""


def read_in_browser(tab, url):
    """A real browser, for pages that build their text with scripts. Blocks aren't bypassed."""
    tab.clear_events()
    frame = tab.send("Page.navigate", {"url": url}).get("frameId")
    try:
        tab.browser.wait_for("Page.loadEventFired", tab.session, 30)
    except TimeoutError:
        pass
    tab.browser.pump(2.5)
    # Some pages build their text with scripts after loading, so give them up to 10 more seconds.
    for _ in range(20):
        words = tab.js("document.body ? document.body.innerText.split(/\\s+/).length : 0") or 0
        if words >= REAL_PAGE_WORDS:
            break
        tab.browser.pump(0.5)
    status = None
    for event in tab.browser.events:
        # Only the page itself. A frame inside it, such as an advert, may answer differently.
        if (event.get("sessionId") == tab.session and event["method"] == "Network.responseReceived"
                and event["params"].get("type") == "Document" and event["params"].get("frameId") == frame):
            status = event["params"]["response"]["status"]
    text = tab.js("document.documentElement ? document.documentElement.outerHTML : ''") or ""
    return status, text


def normalize(text):
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", text, flags=re.S | re.I)
    # Keep phone links, because some pages show a number only in the link's address.
    text = re.sub(r'href="(?:tel|sms):([^"]*)"', r" \1 ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text))


def found(option, text):
    if isinstance(option, Word):
        return re.search(rf"(?<![\w-]){re.escape(option)}(?![\w-])", text) is not None
    return option.lower() in text.lower()


def find_missing(text, wanted):
    missing = []
    for item in wanted:
        options = item if isinstance(item, tuple) else (item,)
        if not any(found(option, text) for option in options):
            missing.append(" or ".join(options))
    return missing


def is_real_read(status, text):
    return status == 200 and len(normalize(text).split()) >= REAL_PAGE_WORDS


def check_page(url, wanted, read_plain, read_browser=None):
    """Reads one page and returns (result, detail): result is ok, MISSING, FAILED, or UNREAD.
    A page read in full is never thrown away for a worse read in the browser."""
    status, text = read_plain(url)
    missing = find_missing(normalize(text), wanted) if text else list(wanted)
    if read_browser and (not is_real_read(status, text) or missing):
        b_status, b_text = read_browser(url)
        if is_real_read(b_status, b_text) or not is_real_read(status, text):
            status, text = b_status, b_text
            missing = find_missing(normalize(text), wanted) if text else list(wanted)
    words = len(normalize(text).split())
    if status is None or status in BLOCKED_STATUSES or (status == 200 and words < REAL_PAGE_WORDS):
        return "UNREAD", f"status {status}, {words} words"
    if status != 200:
        return "FAILED", f"answered {status}"
    if missing:
        return "MISSING", ", ".join(missing)
    return "ok", ""


def check_coverage():
    uncovered = sorted(allowed_numbers() - COVERED)
    return [phone_digits(number) for number in uncovered]


def run(read_plain, read_browser, checks=CHECKS, out=print):
    """Checks every page. Returns (problems, notes)."""
    problems, notes = [], []
    for url, wanted in checks:
        result, detail = check_page(url, wanted, read_plain, read_browser)
        out(f"  {result:7} {url}" + (f": {detail}" if detail else ""))
        if result == "UNREAD" and urllib.parse.urlsplit(url).hostname in KNOWN_BLOCKERS:
            notes.append(f"a person should open this page and check it, because it blocks scripts: {url} ({detail})")
        elif result == "UNREAD":
            problems.append(f"{url} couldn't be read ({detail}). Open it in a browser; it may be down or have moved")
        elif result == "FAILED":
            problems.append(f"{url} {detail}")
        elif result == "MISSING":
            problems.append(f"{url} no longer shows: {detail}")
    return problems, notes


def self_test():
    """Made-up pages and reads, so the tool's own rules can be checked without the internet."""
    full = ("<p>Call 1-800-662-4357 (1-800-662-HELP), TTY 1-800-487-4889. " + "Words about the helpline. " * 20 + "</p>")
    gone = full.replace("487-4889", "")
    keyword = "<p>Text START to 678-678. " + "Words about getting help. " * 20 + "</p>"
    url = "https://www.samhsa.gov/find-help/helplines/national-helpline"
    wanted = [("662-4357", "662-HELP"), "487-4889"]
    cases = [
        # What is being shown, the plain read, the browser read (None means no Chrome), what is expected.
        ("a full page passes", (200, full), None, wanted, "ok"),
        ("a dropped number is missing", (200, gone), None, wanted, "MISSING"),
        ("a dropped number stays missing when the browser is blocked", (200, gone), (403, ""), wanted, "MISSING"),
        ("a dropped number stays missing when the browser gets a stub page", (200, gone), (200, "<p>Just a moment</p>"), wanted, "MISSING"),
        ("a dropped number stays missing when the browser gets nothing", (200, gone), (None, ""), wanted, "MISSING"),
        ("a page built by scripts is read in the browser", (200, "<p>Loading</p>"), (200, full), wanted, "ok"),
        ("a stub page with no details wanted is retried in the browser", (200, "<p>Loading</p>"), (200, full), [], "ok"),
        ("a page blocked both ways is unread", (403, ""), (403, ""), wanted, "UNREAD"),
        ("a page that is gone fails", (404, ""), (404, ""), wanted, "FAILED"),
        ("an ordinary word can't stand in for a keyword", (200, keyword.replace("START", "Start")), None, ["678-678", Word("START")], "MISSING"),
        ("a keyword in its exact form passes", (200, keyword), None, ["678-678", Word("START")], "ok"),
    ]
    wrong = 0
    for name, plain, browser, items, expected in cases:
        result, _ = check_page(url, items, lambda _url, p=plain: p, (lambda _url, b=browser: b) if browser else None)
        wrong += result != expected
        print(f"  {'ok' if result == expected else 'WRONG'}: {name}: {result}")
    # An unread page fails the run, unless it is one of the few known to block scripts.
    problems, notes = run(lambda _url: (None, ""), None, [("https://988lifeline.org/x", ["988"]), ("https://www.fcc.gov/x", ["911"])], out=lambda _line: None)
    unread_ok = len(problems) == 1 and "988lifeline" in problems[0] and len(notes) == 1
    wrong += not unread_ok
    print(f"  {'ok' if unread_ok else 'WRONG'}: an unread provider page fails the run, a known blocker is a note")
    if wrong:
        print(f"{wrong} case(s) read wrongly. The monthly check can't be trusted until this is fixed.")
        return 1
    print(f"All {len(cases) + 1} made-up cases were read correctly.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--self-test", action="store_true", help="check this tool with made-up pages, offline")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    browser = None
    read_browser = None
    if find_chrome():
        browser = Browser()
        tab = Tab(browser, 1280, 900, False)
        read_browser = lambda url: read_in_browser(tab, url)  # noqa: E731
    try:
        problems, notes = run(read_simple, read_browser)
    finally:
        if browser:
            browser.close()
    for number in check_coverage():
        problems.append(f"{number} is in notes/SAFETY.md but no check covers it. Add it to tools/check_crisis_sources.py")
    print()
    for item in notes:
        print(f"NOTE: {item}")
    for item in problems:
        print(f"FAIL: {item}")
    write_job_summary("Crisis details on provider pages", [f"NOTE: {n}" for n in notes] + [f"FAIL: {p}" for p in problems])
    if problems:
        print(f"{len(problems)} problem(s). Check the provider's page, then notes/SAFETY.md and every page that uses it.")
        print("See notes/UPKEEP.md for what to do when a crisis detail changes.")
        return 1
    print(f"Checked {len(CHECKS)} provider pages, {len(notes)} left for a person to open.")
    print("Finding a detail on a page doesn't show the service still runs, and doesn't replace a person confirming it.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
