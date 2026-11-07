#!/usr/bin/env python3
"""Checks the Stillwater website and notes. Needs only Python 3; changes nothing.

Run from the project folder:

    python3 tools/check_site.py                 # pages and notes
    python3 tools/check_site.py --check-links   # also load every outside link

It never calls, texts, or submits anything. Phone and text links are only read.
Passing means the structure is consistent: it does not show that a page is
accessible, safe, or true. See notes/CONTENT-REVIEW.md for what needs a person.
Git is used if it is installed, to tell project notes from private ones.
"""
import argparse
import base64
import hashlib
import html.parser
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
NOT_SITE = {"notes", "design", "tools", ".git", ".claude", "node_modules"}
# These two pages have no draft health content, so they need no review note.
NOT_DRAFT = {"index.html", "404.html"}
# 404.html is served from any address, so it alone links from the site root.
SITE_ROOT = "/suicideprevention/"
# The Quick exit part is inline so it works from the first moment, even before assets/menu.js has loaded.
ALLOWED_INLINE_SCRIPT = (
    "document.documentElement.classList.add('js');"
    "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.quick-exit');"
    "if(a){e.preventDefault();document.documentElement.hidden=true;location.replace(a.href);}});"
)
ALLOWED_ONERROR = "document.documentElement.classList.remove('js')"
# Every page repeats this. The hashes must match the two allowed bits of inline script above.
CSP_RULE = (
    "default-src 'none'; script-src 'self' '{script}' '{handler}' 'unsafe-hashes'; style-src 'self'; img-src 'self'; "
    "connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'"
)
BANNED_PHRASES = [
    "commit suicide", "committed suicide", "commits suicide", "committing suicide",
    "successful suicide", "successful attempt", "failed suicide", "failed attempt",
    "unsuccessful attempt", "completed suicide", "suicide victim",
    # Spanish equivalents, for the pages in es/
    "cometer suicidio", "cometió suicidio", "cometido suicidio", "suicidio consumado",
    "suicidio exitoso", "intento fallido", "víctima de suicidio",
]
# What each language must say. Spanish pages live in es/ and are checked by the same rules.
LANG_RULES = {
    "en": {"not_crisis": "not a crisis service", "unreviewed": "has not reviewed", "chat": "https://chat.988lifeline.org/"},
    "es": {"not_crisis": "no es un servicio de crisis", "unreviewed": "no ha revisado", "chat": "https://chat.988lifeline.org/?lang=es"},
}


def language_of(name):
    return "es" if name.startswith("es/") else "en"
CRISIS_WORDS = re.compile(r"\b(call|text|chat|llamar|enviar|chatear)\b", re.I)
HIDES = re.compile(r"display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(\.0+)?\s*(;|$)")


def csp_hash(text):
    return "sha256-" + base64.b64encode(hashlib.sha256(text.encode()).digest()).decode()


def expected_csp():
    return CSP_RULE.format(script=csp_hash(ALLOWED_INLINE_SCRIPT), handler=csp_hash(ALLOWED_ONERROR))


def digits_of(text):
    return re.sub(r"[^0-9]", "", text or "")


def phone_digits(text):
    digits = digits_of(text)
    return digits[1:] if len(digits) == 11 and digits.startswith("1") else digits


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
        self.empty_headings = 0
        self.images_without_alt = []
        self.links = []
        self.local_files = []
        self.third_party = []
        self.inline_scripts = []
        self.bad_handlers = []
        self.forbidden = []
        self.text_parts = []
        self.attribute_text = []
        self.classes = set()
        self.aria_refs = []
        self.hidden_crisis = []
        self.balance_errors = []
        self.mains = 0
        self.first_focusable = None
        self.review_note = ""
        self.status_values = []
        self.csp = None
        self._open_links = []
        self._heading_text = None

    def _within(self):
        names = []
        for tag, attrs in self.stack:
            names.append(tag)
            names.extend("." + c for c in attrs.get("class", "").split())
            if attrs.get("id"):
                names.append("#" + attrs["id"])
        return names

    def _note_url(self, url):
        parts = urllib.parse.urlsplit(url)
        if parts.scheme or parts.netloc:
            self.third_party.append(url)
        elif url:
            self.local_files.append(url)

    def handle_starttag(self, tag, attrs):
        attrs = {k: (v or "") for k, v in attrs}
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicate_ids.add(attrs["id"])
            self.ids.add(attrs["id"])
        classes = attrs.get("class", "").split()
        self.classes.update(classes)
        for key in ("aria-labelledby", "aria-controls"):
            if attrs.get(key):
                self.aria_refs.extend((key, value) for value in attrs[key].split())
        for key in ("alt", "aria-label"):
            if attrs.get(key):
                self.attribute_text.append(attrs[key])
        for key, value in attrs.items():
            if key.startswith("on") and not (key == "onerror" and value == ALLOWED_ONERROR):
                self.bad_handlers.append(f"{tag} {key}")
        within = self._within() + [tag] + ["." + c for c in classes]
        is_crisis = any(n in within for n in (".crisis-bar", ".crisis-actions"))
        if is_crisis and ("hidden" in attrs or attrs.get("aria-hidden") == "true") and tag != "svg" and "svg" not in within[:-1]:
            if tag != "span" or "hidden" in attrs:
                self.hidden_crisis.append(tag)

        if tag == "html":
            self.lang = attrs.get("lang")
        elif tag == "main":
            self.mains += 1
        elif tag == "meta" and attrs.get("http-equiv", "").lower() == "content-security-policy":
            self.csp = attrs.get("content", "")
        elif tag == "meta" and attrs.get("name"):
            self.metas[attrs["name"]] = attrs.get("content", "")
            if attrs["name"] == "description":
                self.attribute_text.append(attrs.get("content", ""))
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt.append(attrs.get("src", "?"))
        elif tag in {"form", "input", "select", "textarea", "iframe", "embed", "object", "video", "audio"}:
            self.forbidden.append(tag)
        elif re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
            self._heading_text = ""

        if tag == "link" and attrs.get("href"):
            self._note_url(attrs["href"])
        for key in ("src", "poster", "data"):
            if tag != "a" and attrs.get(key):
                self._note_url(attrs[key])
        for key in ("srcset", "imagesrcset"):
            for candidate in attrs.get(key, "").split(","):
                if candidate.strip():
                    self._note_url(candidate.split()[0])
        if attrs.get("ping"):
            self.third_party.append(attrs["ping"])
        if tag == "script" and not attrs.get("src"):
            self.inline_scripts.append("")

        if tag in {"a", "button", "summary"} and self.first_focusable is None:
            self.first_focusable = attrs.get("href", tag)
        if tag == "a":
            link = {
                "href": attrs.get("href"),
                "text": "",
                "label": attrs.get("aria-label", ""),
                "classes": classes,
                "within": self._within(),
                "current": attrs.get("aria-current", ""),
            }
            self.links.append(link)
            self._open_links.append(link)
        if tag not in self.VOID:
            self.stack.append((tag, attrs))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag == "a" and self._open_links:
            self._open_links.pop()
        if re.fullmatch(r"h[1-6]", tag) and self._heading_text is not None:
            if not self._heading_text.strip():
                self.empty_headings += 1
            self._heading_text = None
        if tag in self.VOID:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
            return
        self.balance_errors.append(f"unexpected </{tag}>")
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        tags = [t for t, _ in self.stack]
        if tags and tags[-1] == "title":
            self.title += data
            return
        if "script" in tags:
            if self.inline_scripts and data.strip() and not self.stack[-1][1].get("src"):
                self.inline_scripts[-1] += data.strip()
            return
        if "style" in tags or "svg" in tags:
            return
        if any("hidden" in attrs for _, attrs in self.stack):
            return
        self.text_parts.append(data)
        if self.stack and "status-value" in self.stack[-1][1].get("class", "").split() and data.strip():
            self.status_values.append(data.strip())
        if self._heading_text is not None:
            self._heading_text += data
        for link in self._open_links:
            link["text"] += data
        if any("review-note" in attrs.get("class", "").split() for _, attrs in self.stack):
            self.review_note += data

    def close(self):
        super().close()
        for tag, _ in self.stack:
            self.balance_errors.append(f"<{tag}> is never closed")

    @property
    def text(self):
        return re.sub(r"\s+", " ", " ".join(self.text_parts))


def find_pages():
    """Every web page in the project, homepage first, so new pages cannot escape the checks."""
    found = []
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT)
        if relative.parts[0] not in NOT_SITE:
            found.append(str(relative).replace("\\", "/"))
    return sorted(found, key=lambda name: (name != "index.html", name))


def load(name):
    page = Page()
    page.feed((ROOT / name).read_text(encoding="utf-8"))
    page.close()
    return page


def resolve(name, href):
    """Return (target page name or MISSING:..., fragment) for a local link, or None if it is not local."""
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


def allowed_numbers():
    """Whole numbers from the resource table in notes/SAFETY.md, the single place they are recorded."""
    safety = (ROOT / "notes" / "SAFETY.md").read_text(encoding="utf-8")
    section = safety.split("## U.S. crisis resources", 1)[-1].split("###", 1)[0]
    numbers = set()
    for line in section.splitlines():
        cells = line.split("|")
        if len(cells) > 3 and not set(cells[2].strip()) <= {"-", " "}:
            for match in re.findall(r"\b1-\d{3}-\d{3}-\d{4}\b|\b\d{3}-\d{3}\b|\b\d{3,6}\b", cells[2]):
                numbers.add(phone_digits(match))
    numbers.discard("240")  # a count of languages in that table, not a number to dial
    return numbers


def check_phone_link(name, link, numbers, fail):
    href = link["href"]
    digits = phone_digits(href.split("?")[0])
    if not digits:
        fail(f"{href} has no number")
        return
    if digits not in numbers:
        fail(f"{href} is not a number recorded in notes/SAFETY.md")
    visible, label = link["text"], link["label"]
    labelled = False
    for words in (visible, label):
        if digits_of(words):
            labelled = True
            if digits not in digits_of(words):
                fail(f"link \"{words.strip()}\" does not match its destination {href}")
    if not labelled:
        fail(f"phone or text link \"{visible.strip()}\" does not say which number it uses")


def check_pages(failures, notes):
    names = find_pages()
    pages = {name: load(name) for name in names}
    numbers = allowed_numbers()
    titles = {}
    for name, page in pages.items():
        def fail(message, page_name=name):
            failures.append(f"{page_name}: {message}")

        lang = language_of(name)
        rules = LANG_RULES[lang]
        if page.lang != lang:
            fail(f"the html tag needs lang=\"{lang}\"")
        if not page.title.strip():
            fail("missing page title")
        titles.setdefault(page.title.strip(), []).append(name)
        viewport = page.metas.get("viewport", "")
        if not viewport:
            fail("missing viewport meta tag")
        if "user-scalable=no" in viewport.replace(" ", "") or "maximum-scale" in viewport:
            fail("the viewport tag blocks zooming")
        if "description" not in page.metas:
            fail("missing description")
        if page.csp != expected_csp():
            fail("the Content-Security-Policy tag is missing or differs from CSP_RULE in tools/check_site.py")
        if page.metas.get("referrer") != "no-referrer":
            fail("needs <meta name=\"referrer\" content=\"no-referrer\"> so other sites aren't told where a visitor came from")
        if page.metas.get("robots") != "noindex":
            notes.append(f"{name}: search engines may index this page")
        if page.headings.count(1) != 1:
            fail(f"needs exactly one h1, found {page.headings.count(1)}")
        if page.headings and page.headings[0] != 1:
            fail(f"the first heading is h{page.headings[0]}, not h1")
        for before, after in zip(page.headings, page.headings[1:]):
            if after > before + 1:
                fail(f"heading level jumps from h{before} to h{after}")
        if page.empty_headings:
            fail("has an empty heading")
        if page.images_without_alt:
            fail(f"images without alt text: {page.images_without_alt}")
        if page.duplicate_ids:
            fail(f"duplicate ids: {sorted(page.duplicate_ids)}")
        if page.forbidden:
            fail(f"data-collecting or embedded elements (SAFETY rule 5): {sorted(set(page.forbidden))}")
        if page.third_party:
            fail(f"loads something from another site (SAFETY rule 5): {page.third_party}")
        for script in page.inline_scripts:
            if script != ALLOWED_INLINE_SCRIPT:
                fail(f"unexpected inline script (SAFETY rule 5): {script[:60]}")
        if page.bad_handlers:
            fail(f"inline event handlers: {page.bad_handlers}")
        for url in page.local_files:
            target = resolve(name, url)
            if target and target[0].startswith("MISSING:"):
                fail(f"file does not exist: {url}")
        for key, value in page.aria_refs:
            if value not in page.ids:
                fail(f"{key} points to a missing id: {value}")
        if page.balance_errors:
            fail(f"broken HTML: {page.balance_errors[:3]}")
        if page.mains != 1:
            fail(f"needs exactly one main landmark, found {page.mains}")
        if "main" not in page.ids or page.first_focusable != "#main":
            fail("the first focusable item must be a skip link to #main")

        bar = [link["href"] for link in page.links if ".crisis-bar" in link["within"]]
        for required in ("tel:988", "sms:988", "tel:911"):
            if required not in bar:
                fail(f"crisis strip is missing {required} (SAFETY rule 1)")
        actions = [link["href"] for link in page.links if ".crisis-actions" in link["within"]]
        for required in ("tel:988", "sms:988", rules["chat"]):
            if required not in actions:
                fail(f"crisis buttons are missing {required} (SAFETY rule 2)")
        if page.hidden_crisis:
            fail(f"crisis controls are hidden (SAFETY rule 1): {page.hidden_crisis}")
        if "support" not in page.ids:
            fail("the Get Support Now button needs a #support target")
        if "911" not in page.text:
            fail("does not mention 911 (SAFETY rule 1)")
        if rules["not_crisis"] not in page.text:
            fail("does not say Stillwater is not a crisis service (SAFETY rule 3)")
        if lang == "en" and not any((link["href"] or "").endswith("#en-espanol") for link in page.links):
            fail("has no link to the Spanish section")
        exits = [link for link in page.links if "quick-exit" in link["classes"]]
        if len(exits) != 1 or not (exits[0]["href"] or "").startswith("https://"):
            fail("needs exactly one quick exit link to an outside https page (idea B2)")
        if not any(link["href"] and "lang-switch" in " ".join(link["within"]) for link in page.links) and name != "404.html":
            fail("needs a link to the same page in the other language (idea B6)")
        everything = (page.text + " " + page.title + " " + " ".join(page.attribute_text)).lower()
        for phrase in BANNED_PHRASES:
            if phrase in everything:
                fail(f"uses language safe messaging guidance avoids: \"{phrase}\" (SAFETY rule 4)")
        if ("print-area" in page.classes) != ("print-page" in page.classes):
            fail("the print-area and the print-page class on body go together, or printing comes out blank")
        if name not in NOT_DRAFT and rules["unreviewed"] not in page.review_note:
            fail("draft page needs a visible review note saying no professional has reviewed it")

        for link in page.links:
            href = link["href"]
            label = (link["label"] or link["text"]).strip()
            if not label:
                fail(f"link with no text: {href}")
            if not href:
                fail(f"link \"{label}\" has an empty href")
                continue
            if label.lower() in {"click here", "here", "read more", "more", "link"}:
                fail(f"link text does not describe the destination: \"{label}\"")
            if link["label"] and link["text"].strip().lower() not in link["label"].lower():
                fail(f"link label \"{link['label']}\" leaves out its visible words \"{link['text'].strip()}\"")
            if href.startswith("javascript:"):
                fail(f"link \"{label}\" uses javascript:")
                continue
            if href.startswith("#") and CRISIS_WORDS.search(label) and len(href) == 1:
                fail(f"crisis link \"{label}\" goes nowhere")
            if href.startswith(("tel:", "sms:")):
                check_phone_link(name, link, numbers, fail)
                continue
            target = resolve(name, href)
            if target is None:
                continue
            if name != "404.html" and href.startswith("/"):
                fail(f"link starts at the site root, which breaks outside GitHub Pages: {href}")
            if target[0].startswith("MISSING:"):
                fail(f"broken link: {href}")
                continue
            if link["current"] and target[0] != name:
                fail(f"aria-current is on a link to another page: {href}")
            if target[1]:
                other = pages.get(target[0]) or load(target[0])
                if target[1] not in other.ids:
                    fail(f"link points to a missing section: {href}")

    for title, same in titles.items():
        if len(same) > 1:
            failures.append(f"duplicate page title \"{title}\": {same}")

    # Every page must offer the same destinations as its language's homepage.
    main_nav = {name: nav_targets(name, pages[name], "#site-nav") for name in names}
    footer = {name: nav_targets(name, pages[name], ".footer-nav") for name in names}
    homes = {"en": "index.html", "es": "es/index.html"}
    for name in names:
        home = homes[language_of(name)]
        if home not in pages:
            failures.append(f"{name}: there is no {home} for this language")
            continue
        if name != home:
            if main_nav[name] != main_nav[home]:
                failures.append(f"{name}: main menu differs from {home}: {main_nav[name]}")
            if footer[name] != footer[home]:
                failures.append(f"{name}: footer links differ from {home}: {footer[name]}")
        if name != "404.html" and name != home and name not in main_nav[home] and name not in footer[home]:
            failures.append(f"{name}: neither the main menu nor the footer links to this page")

    check_assets(failures)
    check_offline(failures, names)
    check_publish_list(failures, names)
    check_contact_cards(failures, numbers)
    check_review_status(failures, pages)
    check_dates(failures, pages)
    outside = {}
    for name, page in pages.items():
        for link in page.links:
            if (link["href"] or "").startswith(("http://", "https://")):
                outside.setdefault(link["href"], []).append(name)
    return outside, len(names)


# Words that would claim a review. They are refused until a review is on record in notes/CONTENT-REVIEW.md.
REVIEW_CLAIMS = re.compile(r"\b(reviewed by|approved by|clinically (reviewed|approved)|revisado por|aprobado por|revisada por|aprobada por)\b", re.I)
ABOUT_SECTIONS = ("what-this-is", "review-status", "privacy", "quick-exit", "offline", "contact-card")


def review_records():
    """Lines recorded under "## Review records" in notes/CONTENT-REVIEW.md, other than the placeholder."""
    text = (ROOT / "notes" / "CONTENT-REVIEW.md").read_text(encoding="utf-8")
    if "## Review records" not in text:
        return None
    section = text.split("## Review records", 1)[1].split("\n## ", 1)[0]
    return [line for line in section.splitlines() if line.startswith("- ") and "No review has been recorded" not in line]


def check_review_status(failures, pages):
    """The site may not claim a review that isn't recorded, and the About pages must stay complete."""
    records = review_records()
    if records is None:
        failures.append("notes/CONTENT-REVIEW.md: needs a \"## Review records\" section")
        return
    for name, page in pages.items():
        everything = page.text + " " + " ".join(page.attribute_text)
        if not records:
            match = REVIEW_CLAIMS.search(everything)
            if match:
                failures.append(f"{name}: says \"{match.group(0)}\" but no review is recorded in notes/CONTENT-REVIEW.md")
    pending = {"about/index.html": "Pending", "es/acerca-de/index.html": "Pendiente"}
    for about, word in pending.items():
        page = pages.get(about)
        if not page:
            failures.append(f"{about}: this page is missing")
            continue
        for section in ABOUT_SECTIONS:
            if section not in page.ids:
                failures.append(f"{about}: needs a section with the id \"{section}\"")
        lang = language_of(about)
        listed = {resolve(about, link["href"])[0] for link in page.links
                  if ".status-list" in link["within"] and resolve(about, link["href"])}
        for name in pages:
            if language_of(name) == lang and name != "404.html" and name not in listed:
                failures.append(f"{about}: the review list does not list {name}")
        if not records and page.status_values.count(word) != 2 * len(listed):
            failures.append(f"{about}: every page must show {word} until a review is recorded")


DATE_EN = re.compile(r"(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d\d")
DATE_ES = re.compile(r"\d{1,2} de (?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de 20\d\d")


def check_dates(failures, pages):
    """Every page shows the same "last checked" date, so a re-check can't update only some of them."""
    for lang, pattern in (("en", DATE_EN), ("es", DATE_ES)):
        seen = {}
        for name, page in pages.items():
            if language_of(name) == lang:
                for date in pattern.findall(page.text):
                    seen.setdefault(date, []).append(name)
        if len(seen) > 1:
            failures.append(f"pages show different dates ({lang}): {sorted(seen)}. Use tools/set_checked_date.py")


def check_contact_cards(failures, numbers):
    """Contact cards hold only numbers recorded in notes/SAFETY.md, in valid vCard form."""
    cards = sorted((ROOT / "assets").glob("*.vcf"))
    if not cards:
        failures.append("assets: no contact cards (idea A5)")
    for path in cards:
        raw = path.read_bytes()
        if re.search(rb"(?<!\r)\n", raw):
            failures.append(f"{path.name}: vCard lines must end in CRLF; check .gitattributes")
        lines = raw.decode("utf-8").split("\r\n")
        if lines[0] != "BEGIN:VCARD" or "VERSION:3.0" not in lines or "END:VCARD" not in lines:
            failures.append(f"{path.name}: not a valid vCard 3.0")
        phones = [line.split(":", 1)[1] for line in lines if line.startswith("TEL")]
        if not phones:
            failures.append(f"{path.name}: has no phone number")
        for phone in phones:
            if phone_digits(phone) not in numbers:
                failures.append(f"{path.name}: {phone} is not a number recorded in notes/SAFETY.md")
        if any(len(line.encode("utf-8")) > 75 for line in lines):
            failures.append(f"{path.name}: vCard lines must be folded at 75 bytes")


def check_publish_list(failures, names):
    """Every page's top-level folder and file must be in the workflow's publish list."""
    workflow = (ROOT / ".github" / "workflows" / "site.yml").read_text(encoding="utf-8")
    match = re.search(r"for item in ([^;]+); do", workflow)
    if not match:
        failures.append(".github/workflows/site.yml: publish list not found")
        return
    published = set(match.group(1).split())
    for name in names:
        top = name.split("/", 1)[0]
        if top not in published:
            failures.append(f"{name}: {top} is not in the publish list in .github/workflows/site.yml")


def check_offline(failures, names=()):
    """The offline worker (idea A6) may only keep this site's own files, and its list must exist."""
    worker = ROOT / "sw.js"
    manifest = ROOT / "manifest.webmanifest"
    if not worker.exists() or not manifest.exists():
        failures.append("sw.js or manifest.webmanifest is missing (idea A6)")
        return
    code = worker.read_text(encoding="utf-8")
    for word in ("http://", "https://", "sendBeacon", "postMessage", "indexedDB", "localStorage"):
        if word in code:
            failures.append(f"sw.js: must not reach other sites or store visitor data: {word}")
    if "url.origin !== self.location.origin" not in code:
        failures.append("sw.js: must ignore requests to other sites")
    listed = re.search(r"var CORE = \[(.*?)\];", code, re.S)
    for item in re.findall(r"'([^']+)'", listed.group(1) if listed else ""):
        target = ROOT / item
        if item.endswith("/") or item == "./":
            target = target / "index.html"
        if not target.exists():
            failures.append(f"sw.js lists a file that does not exist: {item}")
    listed_items = set(re.findall(r"'([^']+)'", listed.group(1) if listed else ""))
    for name in names:
        entry = "./" if name == "index.html" else (name[: -len("index.html")] if name.endswith("/index.html") else name)
        if entry not in listed_items:
            failures.append(f"sw.js: {name} is not in the offline list (CORE), so it won't open offline")
    for path in sorted((ROOT / "assets").glob("*.vcf")):
        if f"assets/{path.name}" not in listed_items:
            failures.append(f"sw.js: assets/{path.name} is not in the offline list (CORE)")
    for icon in re.findall(r'"src":\s*"([^"]+)"', manifest.read_text(encoding="utf-8")):
        if not (ROOT / icon).exists():
            failures.append(f"manifest.webmanifest lists a missing icon: {icon}")


def check_assets(failures):
    for path in sorted((ROOT / "assets").glob("*.css")):
        css = path.read_text(encoding="utf-8")
        for match in re.finditer(r"url\(\s*['\"]?(https?:)?//|@import", css):
            failures.append(f"{path.name}: loads something from another site (SAFETY rule 5): {match.group(0)}")
        for selector, declarations in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
            if re.search(r"\.crisis-(bar|actions)\b|\.action\b", selector) and HIDES.search(declarations):
                failures.append(f"{path.name}: hides crisis controls (SAFETY rule 1): {selector.strip()}")
    for path in sorted((ROOT / "assets").glob("*.js")):
        script = path.read_text(encoding="utf-8")
        for word in ("http://", "https://", "fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "document.cookie"):
            if word in script:
                failures.append(f"{path.name}: sends or stores data (SAFETY rule 5): {word}")


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


def check_packets(notes):
    """The review packets are built from the pages, so say when they need rebuilding."""
    stamp = ROOT / "notes" / "review-packet" / "FINGERPRINT.txt"
    if not stamp.exists():
        notes.append("no review packets yet: python3 tools/make_review_packet.py")
        return
    try:
        sys.path.insert(0, str(ROOT / "tools"))
        from make_review_packet import fingerprint
    except Exception as error:  # the packet tool is optional here
        notes.append(f"could not check the review packets: {error}")
        return
    if fingerprint() != stamp.read_text(encoding="utf-8").strip():
        notes.append("the review packets are out of date: python3 tools/make_review_packet.py")


def run_git(*args):
    """Lists files with git, or returns None if git is not available here."""
    try:
        done = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        return None
    return done.stdout.splitlines()


def check_notes(failures):
    """Every Obsidian [[link]] in a project note must point to a note or attachment the project shares.

    A link to a note that only exists on this computer would be broken for the other
    founder, so only tracked files and the shared note folders count. Other untracked
    files in the vault may be private, so they are not read.
    """
    tracked = run_git("ls-files", "--cached", "notes")
    if tracked is None:
        everything = [str(p.relative_to(ROOT)).replace("\\", "/") for p in (ROOT / "notes").rglob("*") if p.is_file()]
        tracked, shared_new = everything, []
    else:
        others = run_git("ls-files", "--others", "--exclude-standard", "notes") or []
        shared_new = [i for i in others if i.startswith(("notes/worklogs/", "notes/planning/", "notes/templates/"))]
    known = set()
    for item in tracked + shared_new:
        relative = item[len("notes/"):]
        stem = pathlib.PurePosixPath(relative).name
        for form in (relative, stem):
            known.add(form)
            known.add(form[:-3] if form.endswith(".md") else form)
    pattern = re.compile(r"!?\[\[([^\]]+?)\]\]")
    for item in tracked + shared_new:
        if not item.endswith(".md"):
            continue
        path = ROOT / item
        if not path.exists():
            failures.append(f"{item}: this tracked note has been deleted or renamed without being committed")
            continue
        for match in pattern.finditer(path.read_text(encoding="utf-8")):
            target = re.split(r"\\?\|", match.group(1))[0].split("#")[0].strip()
            if target and target not in known:
                failures.append(f"{item}: Obsidian link points to nothing: [[{target}]]")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check-links", action="store_true", help="also load every outside link")
    args = parser.parse_args()

    failures, notes = [], []
    outside, count = check_pages(failures, notes)
    check_notes(failures)
    check_packets(notes)
    print(f"Checked {count} pages. {len(outside)} different outside links.")
    if args.check_links:
        check_links(outside, failures, notes)
    for note in notes:
        print(f"NOTE: {note}")
    for failure in failures:
        print(f"FAIL: {failure}")
    if failures:
        print(f"{len(failures)} problem(s) found.")
        return 1
    print("All checks passed. This does not replace a real phone test or a content review.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
