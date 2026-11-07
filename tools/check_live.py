#!/usr/bin/env python3
"""Checks that the public website is up and every page still shows its crisis help.

    python3 tools/check_live.py                                              # the live GitHub Pages site
    python3 tools/check_live.py http://localhost:8000/suicideprevention/    # a local copy, from tools/preview_server.py
    python3 tools/check_live.py --local                                      # starts that local copy itself

Only reads pages. It never calls, texts, or submits anything. Used daily by
.github/workflows/monitor.yml (idea C3). Besides the pages, it checks the page-not-found page, which
shows the crisis numbers at any wrong address, and the files the pages need, with their content types.
It also checks that notes and tools are not published: they answer 404 once Pages publishes with
GitHub Actions, and if Pages is switched back to publishing from a branch, this notices.

The list of pages comes from this project, not from what is published. Until a new version of the
site is published, new pages answer 404 on the live site, and the notes are public, so this fails
every day until then.
"""
import pathlib
import sys
import threading
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from check_site import find_pages, language_of, LANG_RULES  # noqa: E402

LIVE = "https://stillwatersps.github.io/suicideprevention/"
MUST_LINK = ('href="tel:988"', 'href="sms:988"', 'href="tel:911"')
# Files every page needs, and words their content type must contain. Contact cards are added below.
FILES = {
    "assets/styles.css": "text/css",
    "assets/menu.js": "javascript",
    "sw.js": "javascript",
    "manifest.webmanifest": "json",
}
# Files that must never be published. If one answers, the notes, instructions, and tools are public.
PRIVATE = ("notes/STATUS.md", "CLAUDE.md", "README.md", "tools/launch_gate.py")


def address(base, page):
    if page.endswith("index.html"):
        page = page[: -len("index.html")]
    return base + page


def load(url):
    """Returns (status, body, content type). Status None means the site couldn't be reached."""
    request = urllib.request.Request(url, headers={"User-Agent": "Tidelight live check"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read().decode("utf-8", "replace"), response.headers.get("Content-Type", "")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", "replace"), error.headers.get("Content-Type", "")
    except Exception as error:  # network problems are failures here: the site must load
        return None, str(error), ""


def crisis_help_missing(body, page):
    missing = [link for link in MUST_LINK if link not in body]
    if 'class="crisis-bar"' not in body:
        missing.append("crisis strip")
    if LANG_RULES[language_of(page)]["not_crisis"] not in body:
        missing.append("the line saying Tidelight is not a crisis service")
    return missing


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else LIVE
    if base == "--local":
        from preview_server import BASE, make_server
        server = make_server("127.0.0.1", 0)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}{BASE}"
    if not base.endswith("/"):
        base += "/"
    failures = []
    pages = [p for p in find_pages() if p != "404.html"]
    for page in pages:
        url = address(base, page)
        status, body, _ = load(url)
        if status != 200:
            failures.append(f"{url}: {'could not load (' + body + ')' if status is None else f'HTTP {status}'}")
            continue
        missing = crisis_help_missing(body, page)
        if missing:
            failures.append(f"{url}: missing {', '.join(missing)}")
        else:
            print(f"  {status} {url}")
    # A wrong address shows the page-not-found page, with the crisis numbers, and says 404.
    url = base + "no-such-page/"
    status, body, _ = load(url)
    missing = crisis_help_missing(body, "404.html") if status == 404 else []
    if status != 404 or missing:
        failures.append(f"{url}: a wrong address answered {status}" + (f" and is missing {', '.join(missing)}" if missing else ""))
    else:
        print(f"  {status} {url} (the page-not-found page, with crisis help)")
    files = dict(FILES, **{f"assets/{card.name}": "vcard" for card in sorted((ROOT / "assets").glob("*.vcf"))})
    for name, kind in files.items():
        url = base + name
        status, _, content_type = load(url)
        if status != 200:
            failures.append(f"{url}: HTTP {status}")
        elif kind not in content_type:
            failures.append(f"{url}: content type is {content_type!r}, not {kind}")
        else:
            print(f"  {status} {url} ({content_type})")
    for name in PRIVATE:
        url = base + name
        status, _, _ = load(url)
        if status != 404:
            failures.append(f"{url}: answered {status}. Notes and tools must not be published: check that "
                            "Settings > Pages publishes with GitHub Actions")
        else:
            print(f"  {status} {url} (not published, as it should be)")
    for failure in failures:
        print(f"FAIL: {failure}")
    if failures:
        print(f"{len(failures)} problem(s) on the live site.")
        return 1
    print(f"All {len(pages)} live pages load and show their crisis help, and so do a wrong address and {len(files)} files. "
          f"No notes or tools are published.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
