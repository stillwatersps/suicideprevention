#!/usr/bin/env python3
"""Reads each crisis provider's own page and checks that the details on this site still appear there.

    python3 tools/check_crisis_sources.py
    python3 tools/check_crisis_sources.py --self-test   # checks this tool with made-up pages, offline,
                                                        # and that every crisis number has a check here

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
from check_site import KNOWN_BLOCKERS, allowed_numbers, phone_digits, safety_table, write_job_summary  # noqa: E402


class Word(str):
    """A keyword a person types, such as AYUDA. It must appear in exactly this form, as a whole word,
    so that ordinary words like "ayuda", "next" or "Start Chat" can't stand in for it."""


class Near(str):
    """Words that must appear together, as a pattern matched in any letter case: a number next to the
    word that says what to do with it ("text 988"), so 988 in a name such as "988 Suicide & Crisis
    Lifeline" doesn't count. "number" says which number from notes/SAFETY.md it checks."""

    def __new__(cls, pattern, label, number=""):
        made = super().__new__(cls, pattern)
        made.label, made.number = label, number
        return made


# "Call or text 988", "dial 988 and then press 2", "Call: 988", "send a text to 988", or a tel:988 link.
# Not "Text Chat Deaf/HoH 988" from a menu, or "call, text, or chat the 988 Lifeline", which name the service.
CALL_OR_TEXT_988 = Near(r"\b(?:call|text|dial)(?:ing)?\b(?:\s*,?\s*(?:or\s+|and\s+)?(?:call|text|chat|dial)\b)*:?\s+988\b"
                        r"(?!\s+(?:suicide|lifeline|videophone|day)\b)|\b(?:message|text)\s+to\s+988\b|\b(?:tel|sms):988\b",
                        "988 next to call, text or dial", "988")
CALL_911 = Near(r"\b(?:call|text|dial)(?:ing)?\b(?:\s*,?\s*(?:or\s+|and\s+)?(?:call|text|dial)\b)*:?\s+911\b|\btext-to-911\b|\btel:911\b",
                "911 next to call, text or dial", "911")
# 988's page says: When you text "Next" you will be accepting our Terms of Service. The word must
# follow reply, text, send or type, so "what happens next" doesn't count.
REPLY_NEXT = Near(r"\b(?:reply|text|send|type)\b\W{1,3}(?:with\W{1,3})?next\b", "text Next")

# Each page, and what must appear on it. A tuple means any one of those wordings will do.
# A number such as "838255" or "866-488-7386" must appear as a whole number, written with or without
# its 1- and dashes, or as a call or text link, so 711 inside 1-800-711-2400 doesn't count.
# Other wording is matched in any letter case, as whole words.
CHECKS = [
    ("https://988lifeline.org/get-help/", [CALL_OR_TEXT_988, ("then press 2", "press 2"), Word("AYUDA"), ("pressing 1", "press 1"), "838255"]),
    ("https://988lifeline.org/get-help/what-to-expect/", ["press 3", Word("PRIDE"), "press 2", REPLY_NEXT]),
    ("https://988lifeline.org/faq/texting-the-988-lifeline/", [Near(r"\bsend any message to 988\b", "send any message to 988", "988")]),
    ("https://988lifeline.org/deaf-hard-of-hearing-hearing-loss/", ["videophone", "711"]),
    ("https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/", ["240", "interpreter"]),
    ("https://www.veteranscrisisline.net/", [CALL_OR_TEXT_988, "838255", "press 1"]),
    ("https://www.thetrevorproject.org/get-help/", ["866-488-7386", "678-678", Word("START"), "866-803-3699"]),
    ("https://www.crisistextline.org/about-us/faq/", ["741741", Word("HOME")]),
    ("https://www.samhsa.gov/find-help/helplines/national-helpline", [("800-662-4357", Near(r"800-662-help", "1-800-662-HELP", "8006624357")), "800-487-4889"]),
    ("https://www.taps.org/suicide", [("800-959-8277", Near(r"800-959-taps", "1-800-959-TAPS", "8009598277"))]),
    ("https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911", [CALL_911, "voice call"]),
    ("https://findtreatment.gov/", []),
]
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
    # Keep phone links, because some pages show a number only in the link's address. They go at the
    # end, because removing the tags would remove them too.
    links = re.findall(r"""href=["']?((?:tel|sms):[^"'\s>]*)""", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text) + " " + " ".join(links)
    return re.sub(r"\s+", " ", html.unescape(text))


def is_number(option):
    return isinstance(option, str) and not isinstance(option, (Word, Near)) and re.fullmatch(r"\d[\d-]*\d", option) is not None


def numbers_in(text):
    """Every whole number in the text, as digits without a leading 1, such as 8006624357 for
    1-800-662-4357. Digits joined by dashes or dots are one number, so 711 inside 1-800-711-2400 isn't one."""
    found = {phone_digits(run) for run in re.findall(r"(?<![\w.-])\+?\d+(?:[-.]\d+)*(?![\w-]|\.\d)", text)}
    found |= {area + rest.replace("-", "") for area, rest in re.findall(r"\((\d{3})\)\s?(\d{3}-\d{4})", text)}
    return found


def found(option, text, numbers=None):
    if isinstance(option, Word):
        return re.search(rf"(?<![\w-]){re.escape(option)}(?![\w-])", text) is not None
    if isinstance(option, Near):
        return re.search(option, text, re.I) is not None
    if is_number(option):
        return phone_digits(option) in (numbers if numbers is not None else numbers_in(text))
    # Whole words: "press 2" isn't found in "press 22", but "interpreter" is found in "interpreters".
    end = r"(?!\d)" if option[-1].isdigit() else ""
    return re.search(rf"(?<!\w){re.escape(option)}{end}", text, re.I) is not None


def find_missing(text, wanted):
    missing = []
    numbers = numbers_in(text)
    for item in wanted:
        options = item if isinstance(item, tuple) else (item,)
        if not any(found(option, text, numbers) for option in options):
            missing.append(" or ".join(getattr(option, "label", option) for option in options))
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


def check_coverage(checks=CHECKS):
    """Every number in notes/SAFETY.md is checked on a provider's page, and every row there with a number
    to call or text has one of its own pages checked. It reads no website, so pull requests run it too."""
    covered = set()
    for _url, wanted in checks:
        for item in wanted:
            for option in item if isinstance(item, tuple) else (item,):
                number = getattr(option, "number", "") or (option if is_number(option) else "")
                if number:
                    covered.add(phone_digits(number))
    problems = [f"{number} is in notes/SAFETY.md but no check covers it. Add it to tools/check_crisis_sources.py"
                for number in sorted(allowed_numbers() - covered)]
    checked = {url.rstrip("/") for url, _ in checks}
    for line in safety_table():
        cells = line.split("|")
        if len(cells) < 5 or set(cells[2].strip()) <= {"-", " "}:
            continue
        has_number = bool(set(re.findall(r"\b1-\d{3}-\d{3}-\d{4}\b|\b\d{3}-\d{3}\b|\b\d{3,6}\b", cells[2])) - {"240"})
        pages = [page.rstrip("/.,") for page in re.findall(r"https?://[^\s|)]+", cells[3])]
        if has_number and not any(page in checked for page in pages):
            problems.append(f"notes/SAFETY.md lists a number for {cells[1].strip()}, but none of its pages is checked. "
                            "Add one to CHECKS in tools/check_crisis_sources.py")
    return problems


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
    filler = "Words about getting help. " * 20
    full = ("<p>Call 1-800-662-4357 (1-800-662-HELP), TTY 1-800-487-4889. " + filler + "</p>")
    gone = full.replace("487-4889", "")
    keyword = "<p>Text START to 678-678. " + filler + "</p>"
    url = "https://www.samhsa.gov/find-help/helplines/national-helpline"
    wanted = dict(CHECKS)[url]
    brand = "<h1>988 Suicide &amp; Crisis Lifeline</h1><p>What happens next is up to you. " + filler + "</p>"
    to_988 = "<p>Call or text 988 any time. Reply NEXT to accept the terms. " + filler + "</p>"
    other_number = "<p>Call our office at 1-800-711-2400 or use a videophone. " + filler + "</p>"
    relay = "<p>TTY users can use a relay service or dial 711, then 988. Use a videophone too. " + filler + "</p>"
    link_only = '<p><a href="tel:+18009598277">Call us</a> any time. ' + filler + "</p>"
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
        ("988 in the service's name isn't a number to call", (200, brand), None, [CALL_OR_TEXT_988], "MISSING"),
        ("the word next isn't the keyword NEXT", (200, brand), None, [REPLY_NEXT], "MISSING"),
        ("988 to call or text, and NEXT, pass", (200, to_988), None, [CALL_OR_TEXT_988, REPLY_NEXT], "ok"),
        ("711 inside another number doesn't count", (200, other_number), None, ["videophone", "711"], "MISSING"),
        ("711 on its own passes", (200, relay), None, ["videophone", "711"], "ok"),
        ("a number only in a call link counts", (200, link_only), None, ["800-959-8277"], "ok"),
        ("a number with one digit changed doesn't count", (200, link_only.replace("9598277", "9598278")), None, ["800-959-8277"], "MISSING"),
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
    # Every number and row in notes/SAFETY.md has a check, and a missing one is noticed.
    gaps = check_coverage()
    without_taps = check_coverage([check for check in CHECKS if "taps.org" not in check[0]])
    coverage_ok = not gaps and any("8009598277" in gap for gap in without_taps) and any("TAPS" in gap for gap in without_taps)
    wrong += not coverage_ok
    print(f"  {'ok' if coverage_ok else 'WRONG'}: every number and row in notes/SAFETY.md has a provider check, and a gap is noticed")
    for gap in gaps:
        print(f"FAIL: {gap}")
    if wrong:
        print(f"{wrong} case(s) read wrongly. The monthly check can't be trusted until this is fixed.")
        return 1
    print(f"All {len(cases) + 2} made-up cases were read correctly, and every crisis number in notes/SAFETY.md has a check.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--self-test", action="store_true", help="check this tool with made-up pages, offline")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    browser = None
    read_browser = None
    try:
        if find_chrome():
            # This tool reads providers' own pages, so its Chrome may reach other sites. It still only reads.
            browser = Browser(local_only=False)
            tab = Tab(browser, 1280, 900, False)
            read_browser = lambda url: read_in_browser(tab, url)  # noqa: E731
        problems, notes = run(read_simple, read_browser)
    finally:
        if browser:
            browser.close()
    problems += check_coverage()
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
