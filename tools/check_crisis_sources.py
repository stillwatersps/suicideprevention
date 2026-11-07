#!/usr/bin/env python3
"""Reads each crisis provider's own page and checks that the details on this site still appear there.

    python3 tools/check_crisis_sources.py

It only reads pages. It never calls, texts, chats, or submits anything. A page that blocks automated
reading is listed for a person to open, and nothing is done to get around the block. Passing doesn't
mean a person has confirmed the details: notes/SAFETY.md has a column for that. It runs monthly in
.github/workflows/monitor.yml, and exits with an error if a detail is missing from its provider's page.
"""
import html
import pathlib
import re
import sys
import urllib.error
import urllib.request

TOOLS = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
from browser import Browser, Tab, find_chrome  # noqa: E402
from check_site import allowed_numbers, phone_digits  # noqa: E402

# Each page, and what must appear on it. A tuple means any one of those wordings will do.
CHECKS = [
    ("https://988lifeline.org/get-help/", ["988", ("then press 2", "press 2"), "AYUDA", ("pressing 1", "press 1"), "838255"]),
    ("https://988lifeline.org/get-help/what-to-expect/", ["press 3", "PRIDE", "press 2", "NEXT"]),
    ("https://988lifeline.org/deaf-hard-of-hearing-hearing-loss/", ["videophone", "711"]),
    ("https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/", ["240", "interpreter"]),
    ("https://www.veteranscrisisline.net/", ["988", "838255", ("Press 1", "press 1")]),
    ("https://www.thetrevorproject.org/get-help/", ["866-488-7386", "678-678", "START", "866-803-3699"]),
    ("https://www.crisistextline.org/about-us/faq/", ["741741", "HOME"]),
    ("https://www.samhsa.gov/find-help/helplines/national-helpline", [("662-4357", "662-HELP"), "487-4889"]),
    ("https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911", ["voice call"]),
    ("https://findtreatment.gov/", []),
]
# Numbers in notes/SAFETY.md that the checks above cover. A new number there must be added here too.
COVERED = {"988", "838255", "8664887386", "678678", "8668033699", "741741", "8006624357", "8004874889", "711", "911"}
BLOCKED_STATUSES = {401, 403, 406, 429, 503}


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
    tab.send("Page.navigate", {"url": url})
    try:
        tab.browser.wait_for("Page.loadEventFired", tab.session, 30)
    except TimeoutError:
        pass
    tab.browser.pump(2.5)
    status = None
    for event in tab.browser.events:
        if (event.get("sessionId") == tab.session and event["method"] == "Network.responseReceived"
                and event["params"].get("type") == "Document"):
            status = event["params"]["response"]["status"]
    text = tab.js("document.documentElement ? document.documentElement.outerHTML : ''") or ""
    return status, text


def normalize(text):
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", text, flags=re.S | re.I)
    # Keep phone links, because some pages show a number only in the link's address.
    text = re.sub(r'href="(?:tel|sms):([^"]*)"', r" \1 ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text))


def find_missing(text, wanted):
    missing = []
    lowered = text.lower()
    for item in wanted:
        options = item if isinstance(item, tuple) else (item,)
        if not any(option.lower() in lowered for option in options):
            missing.append(" or ".join(options))
    return missing


def check_coverage():
    uncovered = sorted(allowed_numbers() - COVERED)
    return [phone_digits(number) for number in uncovered]


def main():
    problems = []
    unread = []
    browser = None
    tab = None
    if find_chrome():
        browser = Browser()
        tab = Tab(browser, 1280, 900, False)
    try:
        for url, wanted in CHECKS:
            status, text = read_simple(url)
            missing = find_missing(normalize(text), wanted) if text else list(wanted)
            if tab and (status in BLOCKED_STATUSES or status is None or missing):
                status, text = read_in_browser(tab, url)
                missing = find_missing(normalize(text), wanted) if text else list(wanted)
            # A page with almost no text is a block or an error screen, not a page that dropped a number.
            words = len(normalize(text).split())
            if status is None or status in BLOCKED_STATUSES or (status == 200 and words < 40):
                unread.append(f"{url} (status {status}, {words} words)")
                print(f"  UNREAD  {url}")
            elif status != 200:
                problems.append(f"{url} answered {status}")
                print(f"  FAILED  {url} answered {status}")
            elif missing:
                problems.append(f"{url} no longer shows: {', '.join(missing)}")
                print(f"  MISSING {url}: {', '.join(missing)}")
            else:
                print(f"  ok      {url}")
    finally:
        if browser:
            browser.close()
    for number in check_coverage():
        problems.append(f"{number} is in notes/SAFETY.md but no check covers it. Add it to tools/check_crisis_sources.py")
    print()
    for item in unread:
        print(f"NOTE: a person should open this page and check it: {item}")
    for item in problems:
        print(f"FAIL: {item}")
    if problems:
        print(f"{len(problems)} problem(s). Check the provider's page, then notes/SAFETY.md and every page that uses it.")
        print("See notes/UPKEEP.md for what to do when a crisis detail changes.")
        return 1
    print(f"Checked {len(CHECKS)} provider pages, {len(unread)} unread. This doesn't replace a person confirming the details.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
