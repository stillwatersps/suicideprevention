#!/usr/bin/env python3
"""Checks the Stillwater website and notes. Needs only Python 3; changes nothing.

Run from the project folder:

    python3 tools/check_site.py                 # pages and notes
    python3 tools/check_site.py --check-links   # also load every outside link

It never calls, texts, or submits anything. Phone and text links are only read.
Passing means the structure is consistent. It is not an accessibility audit or
a content review: see notes/SAFETY.md for what still needs a person.
"""
import argparse
import html.parser
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "get-help/index.html", "help-someone/index.html", "research/index.html", "404.html"]
# Pages whose content has not had professional review must say so.
DRAFT_PAGES = {"get-help/index.html", "help-someone/index.html", "research/index.html"}
# 404.html is served from any address, so it alone links from the site root.
SITE_ROOT = "/suicideprevention/"
BANNED_PHRASES = [
    "commit suicide", "committed suicide", "commits suicide", "committing suicide",
    "successful suicide", "successful attempt", "failed suicide", "failed attempt",
    "unsuccessful attempt", "completed suicide", "suicide victim",
]


class Page(html.parser.HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.ids = set()
        self.duplicate_ids = set()
        self.title = ""
        self.lang = None
        self.metas = {}
        self.headings = []
        self.images_without_alt = []
        self.links = []  # dicts: href, text, label, classes, within
        self.scripts = []
        self.stylesheets = []
        self.icons = []
        self.forbidden = []
        self.text_parts = []
        self.classes = set()
        self._open_links = []

    def _within(self):
        names = []
        for tag, attrs in self.stack:
            names.append(tag)
            names.extend("." + c for c in attrs.get("class", "").split())
            if attrs.get("id"):
                names.append("#" + attrs["id"])
        return names

    def handle_starttag(self, tag, attrs):
        attrs = {k: (v or "") for k, v in attrs}
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicate_ids.add(attrs["id"])
            self.ids.add(attrs["id"])
        self.classes.update(attrs.get("class", "").split())
        if tag == "html":
            self.lang = attrs.get("lang")
        elif tag == "meta" and attrs.get("name"):
            self.metas[attrs["name"]] = attrs.get("content", "")
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt.append(attrs.get("src", "?"))
        elif tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        elif tag == "link" and attrs.get("rel") == "stylesheet":
            self.stylesheets.append(attrs.get("href", ""))
        elif tag == "link" and attrs.get("rel") == "icon":
            self.icons.append(attrs.get("href", ""))
        elif tag in {"form", "input", "select", "textarea", "iframe", "embed", "object"}:
            self.forbidden.append(tag)
        elif re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if tag == "a":
            link = {
                "href": attrs.get("href"),
                "text": "",
                "label": attrs.get("aria-label", ""),
                "classes": attrs.get("class", "").split(),
                "within": self._within(),
                "current": attrs.get("aria-current", ""),
            }
            self.links.append(link)
            self._open_links.append(link)
        if tag not in self.VOID:
            self.stack.append((tag, attrs))

    def handle_endtag(self, tag):
        if tag == "a" and self._open_links:
            self._open_links.pop()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        in_tags = [t for t, _ in self.stack]
        if in_tags and in_tags[-1] == "title":
            self.title += data
        if "script" in in_tags or "style" in in_tags or "svg" in in_tags or "title" in in_tags:
            return
        self.text_parts.append(data)
        for link in self._open_links:
            link["text"] += data

    @property
    def text(self):
        return re.sub(r"\s+", " ", " ".join(self.text_parts))


def load(name):
    page = Page()
    page.feed((ROOT / name).read_text(encoding="utf-8"))
    return page


def resolve(name, href):
    """Return (target page name or None, fragment) for a local link, or None if it is not local."""
    parts = urllib.parse.urlsplit(href)
    if parts.scheme or parts.netloc:
        return None
    path = urllib.parse.unquote(parts.path)
    if path.startswith("/"):
        if not path.startswith(SITE_ROOT):
            return ("MISSING:" + path, parts.fragment)
        rel = pathlib.PurePosixPath(path[len(SITE_ROOT):] or ".")
    elif path == "":
        return (name, parts.fragment)
    else:
        rel = pathlib.PurePosixPath(str(pathlib.PurePosixPath(name).parent / path))
    # Normalise ../ without touching the disk.
    pieces = []
    for piece in rel.parts:
        if piece == "..":
            if pieces:
                pieces.pop()
        elif piece != ".":
            pieces.append(piece)
    target = ROOT.joinpath(*pieces) if pieces else ROOT
    if target.is_dir():
        target = target / "index.html"
    if not target.exists():
        return ("MISSING:" + path, parts.fragment)
    return (str(target.relative_to(ROOT)).replace("\\", "/"), parts.fragment)


def nav_targets(name, page, marker):
    """Which pages a navigation block links to, independent of the current folder."""
    found = []
    for link in page.links:
        if marker in link["within"] and link["href"]:
            target = resolve(name, link["href"])
            if target and target[0] == name and target[1]:
                found.append("#" + target[1])
            elif target:
                found.append(target[0])
    return found


def check_pages(failures, notes):
    pages = {name: load(name) for name in PAGES}
    titles = {}
    for name, page in pages.items():
        def fail(message, page_name=name):
            failures.append(f"{page_name}: {message}")

        if page.lang != "en":
            fail("the html tag needs lang=\"en\"")
        if not page.title.strip():
            fail("missing page title")
        titles.setdefault(page.title.strip(), []).append(name)
        if "viewport" not in page.metas:
            fail("missing viewport meta tag")
        if "description" not in page.metas:
            fail("missing description")
        if not page.icons:
            fail("missing favicon link")
        if page.metas.get("robots") != "noindex":
            notes.append(f"{name}: search engines may index this page")
        if page.headings.count(1) != 1:
            fail(f"needs exactly one h1, found {page.headings.count(1)}")
        for before, after in zip(page.headings, page.headings[1:]):
            if after > before + 1:
                fail(f"heading level jumps from h{before} to h{after}")
        if page.images_without_alt:
            fail(f"images without alt text: {page.images_without_alt}")
        if page.duplicate_ids:
            fail(f"duplicate ids: {sorted(page.duplicate_ids)}")
        if page.forbidden:
            fail(f"data-collecting or embedded elements (SAFETY rule 5): {sorted(set(page.forbidden))}")
        for url in page.scripts + page.stylesheets + page.icons:
            if urllib.parse.urlsplit(url).netloc:
                fail(f"loads something from another site (SAFETY rule 5): {url}")
        if not any(link["href"] == "#main" for link in page.links) or "main" not in page.ids:
            fail("missing skip link to #main")

        hrefs = [link["href"] for link in page.links]
        bar = [link["href"] for link in page.links if ".crisis-bar" in link["within"]]
        for required in ("tel:988", "sms:988", "tel:911"):
            if required not in bar:
                fail(f"crisis bar is missing {required} (SAFETY rule 1)")
        actions = [link["href"] for link in page.links if ".crisis-actions" in link["within"]]
        for required in ("tel:988", "sms:988", "https://988lifeline.org/chat/"):
            if required not in actions:
                fail(f"crisis buttons are missing {required} (SAFETY rule 2)")
        if "support" not in page.ids:
            fail("the Get Support Now button needs a #support target")
        if "911" not in page.text:
            fail("does not mention 911 (SAFETY rule 1)")
        if "not a crisis service" not in page.text:
            fail("does not say Stillwater is not a crisis service (SAFETY rule 3)")
        lowered = page.text.lower()
        for phrase in BANNED_PHRASES:
            if phrase in lowered:
                fail(f"uses language safe messaging guidance avoids: \"{phrase}\" (SAFETY rule 4)")
        if name in DRAFT_PAGES and "review-note" not in page.classes:
            fail("draft page needs a visible review note")

        for link in page.links:
            href = link["href"]
            label = (link["label"] or link["text"]).strip()
            if not label:
                fail(f"link with no text: {href}")
            if href is None or href == "":
                fail(f"link \"{label}\" has an empty href")
                continue
            if label.lower() in {"click here", "here", "read more", "more", "link"}:
                fail(f"link text does not describe the destination: \"{label}\"")
            target = resolve(name, href)
            if target is None:
                continue
            if name != "404.html" and href.startswith("/"):
                fail(f"link starts at the site root, which breaks outside GitHub Pages: {href}")
            if target[0].startswith("MISSING:"):
                fail(f"broken link: {href}")
                continue
            if target[1]:
                other = pages.get(target[0])
                if other is None:
                    other = load(target[0])
                if target[1] not in other.ids:
                    fail(f"link points to a missing section: {href}")

    for title, names in titles.items():
        if len(names) > 1:
            failures.append(f"duplicate page title \"{title}\": {names}")

    # Every page must offer the same destinations.
    expected_main = {name: nav_targets(name, pages[name], "#site-nav") for name in PAGES}
    expected_footer = {name: nav_targets(name, pages[name], ".footer-nav") for name in PAGES}
    baseline_main = expected_main[PAGES[0]]
    baseline_footer = expected_footer[PAGES[0]]
    for name in PAGES[1:]:
        if expected_main[name] != baseline_main:
            failures.append(f"{name}: main menu differs from the homepage: {expected_main[name]}")
        if expected_footer[name] != baseline_footer:
            failures.append(f"{name}: footer links differ from the homepage: {expected_footer[name]}")

    # Every phone number or short code in a link must be recorded in the safety notes.
    safety = (ROOT / "notes" / "SAFETY.md").read_text(encoding="utf-8")
    safety_digits = re.sub(r"[^0-9]", "", safety)
    outside = {}
    for name, page in pages.items():
        for link in page.links:
            href = link["href"] or ""
            if href.startswith(("tel:", "sms:")):
                digits = re.sub(r"[^0-9]", "", href.split("?")[0])
                if digits.startswith("1") and len(digits) == 11:
                    digits = digits[1:]
                if digits not in safety_digits:
                    failures.append(f"{name}: {href} is not recorded in notes/SAFETY.md")
            elif href.startswith(("http://", "https://")):
                outside.setdefault(href, []).append(name)
    return outside


def check_links(outside, failures, notes):
    """Loads each outside link. A provider may block scripts, so 403 and 429 are reported, not failed."""
    for url in sorted(outside):
        request = urllib.request.Request(url, headers={"User-Agent": "Stillwater link check"})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                final = response.geturl()
                status = response.status
        except urllib.error.HTTPError as error:
            status, final = error.code, url
        except Exception as error:  # network problems are reported, not hidden
            notes.append(f"could not check {url}: {error}")
            continue
        moved = f" -> {final}" if final.rstrip("/") != url.rstrip("/") else ""
        print(f"  {status} {url}{moved}")
        if status in (403, 429, 503):
            notes.append(f"{url} blocked this script ({status}); check it in a browser")
        elif status >= 400:
            failures.append(f"outside link failed ({status}): {url}")


def check_notes(failures):
    """Every Obsidian [[link]] in a project note must point to a note or attachment that exists."""
    try:
        listed = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "notes"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.splitlines()
    except (OSError, subprocess.CalledProcessError):
        listed = [str(p.relative_to(ROOT)) for p in (ROOT / "notes").rglob("*") if p.is_file()]
    # Notes that git does not track on this computer can be personal, so they are not read.
    tracked = subprocess.run(
        ["git", "ls-files", "--cached", "notes"], cwd=ROOT, capture_output=True, text=True,
    ).stdout.splitlines() or listed
    known = set()
    for item in listed:
        relative = item[len("notes/"):]
        known.add(relative)
        known.add(relative[:-3] if relative.endswith(".md") else relative)
        stem = pathlib.PurePosixPath(relative).name
        known.add(stem)
        known.add(stem[:-3] if stem.endswith(".md") else stem)
    pattern = re.compile(r"!?\[\[([^\]]+?)\]\]")
    for item in tracked + [i for i in listed if i not in tracked and _is_project_note(i)]:
        if not item.endswith(".md"):
            continue
        for match in pattern.finditer((ROOT / item).read_text(encoding="utf-8")):
            target = re.split(r"\\?\|", match.group(1))[0].split("#")[0].strip()
            if target and target not in known:
                failures.append(f"{item}: Obsidian link points to nothing: [[{target}]]")


def _is_project_note(item):
    return item.startswith(("notes/worklogs/", "notes/planning/", "notes/templates/"))


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check-links", action="store_true", help="also load every outside link")
    args = parser.parse_args()

    failures, notes = [], []
    outside = check_pages(failures, notes)
    check_notes(failures)
    print(f"Checked {len(PAGES)} pages. {len(outside)} different outside links.")
    if args.check_links:
        check_links(outside, failures, notes)
    for note in notes:
        print(f"NOTE: {note}")
    for failure in failures:
        print(f"FAIL: {failure}")
    if failures:
        print(f"{len(failures)} problem(s) found.")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
