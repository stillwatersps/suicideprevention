#!/usr/bin/env python3
"""Checks that the public website is up and every page still shows its crisis help.

    python3 tools/check_live.py                          # the live GitHub Pages site
    python3 tools/check_live.py http://localhost:8000/   # a local copy

Only reads pages. It never calls, texts, or submits anything. Used daily by
.github/workflows/monitor.yml (idea C3).
"""
import pathlib
import sys
import urllib.error
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from check_site import find_pages, language_of, LANG_RULES  # noqa: E402

LIVE = "https://stillwatersps.github.io/suicideprevention/"
MUST_LINK = ('href="tel:988"', 'href="sms:988"', 'href="tel:911"')


def address(base, page):
    if page.endswith("index.html"):
        page = page[: -len("index.html")]
    return base + page


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else LIVE
    if not base.endswith("/"):
        base += "/"
    failures = []
    pages = [p for p in find_pages() if p != "404.html"]
    for page in pages:
        url = address(base, page)
        request = urllib.request.Request(url, headers={"User-Agent": "Stillwater live check"})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read().decode("utf-8", "replace")
                status = response.status
        except urllib.error.HTTPError as error:
            failures.append(f"{url}: HTTP {error.code}")
            continue
        except Exception as error:  # network problems are failures here: the site must load
            failures.append(f"{url}: could not load ({error})")
            continue
        missing = [link for link in MUST_LINK if link not in body]
        if 'class="crisis-bar"' not in body:
            missing.append("crisis strip")
        if LANG_RULES[language_of(page)]["not_crisis"] not in body:
            missing.append("the line saying Stillwater is not a crisis service")
        if missing:
            failures.append(f"{url}: missing {', '.join(missing)}")
        else:
            print(f"  {status} {url}")
    for failure in failures:
        print(f"FAIL: {failure}")
    if failures:
        print(f"{len(failures)} problem(s) on the live site.")
        return 1
    print(f"All {len(pages)} live pages load and show their crisis help.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
