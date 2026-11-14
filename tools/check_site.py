#!/usr/bin/env python3
"""Checks the Tidelight website and notes. Needs only Python 3; changes nothing.

Run from the project folder:

    python3 tools/check_site.py                 # pages and notes
    python3 tools/check_site.py --check-links   # also load every outside link
    python3 tools/check_site.py --self-test     # check how the link check reads answers, offline

It never calls, texts, or submits anything. Phone and text links are only read.
Passing means the structure is consistent: it does not show that a page is
accessible, safe, or true. See notes/CONTENT-REVIEW.md for what needs a person.
Git is used if it is installed, to tell project notes from private ones.
"""
import argparse
import base64
import datetime
import hashlib
import html.parser
import os
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
NOT_SITE = {"notes", "design", "tools", ".git", ".claude", "node_modules", "app"}  # app/ is the phone app, built from the site; it is never published
# These two pages have no draft health content, so they need no review note.
NOT_DRAFT = {"index.html", "404.html"}
# 404.html is served from any address, so it alone links from the site root.
SITE_ROOT = "/suicideprevention/"
# The Quick exit part is inline so it works from the first moment, even before assets/menu.js has loaded.
# It clears the tab's title and blanks the page while the neutral site loads. If another site shows
# Tidelight in a frame, it leaves the whole window, and only the frame if that site doesn't allow it.
# Changing it means changing the hash in every page's policy too: see CSP_RULE below.
ALLOWED_INLINE_SCRIPT = (
    "document.documentElement.classList.add('js');"
    "setTimeout(function(){if(!window.tidelightMenuReady)document.documentElement.classList.remove('js');},3000);"
    "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.quick-exit');"
    "if(a){e.preventDefault();document.title='';document.documentElement.hidden=true;"
    "try{top.location.replace(a.href);}catch(_){location.replace(a.href);}}});"
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


def is_spanish(lang):
    """Whether a lang attribute names Spanish, such as "es" or "es-US"."""
    return bool(re.match(r"es(-|$)", (lang or "").strip().lower()))


# Letters Spanish uses and English almost never does, and the Spanish way to give a crisis number, such as
# "Llama al 988 y marca 2", which has none of them. On an English page, text with one that nothing marks as
# another language is almost always Spanish without lang="es". A screen reader then reads it with English
# sounds, and the Spanish review packet, which finds Spanish by that mark, leaves it out. Spanish with none of
# these isn't found, so every Spanish line still needs its mark.
SPANISH_SIGNS = re.compile(r"[¿¡ñáéíóúü]|\b(?:al|del) (?:988|911|741741)\b|\b(?:llama|marca|presiona) al\b"
                           r"|\by (?:marca|presiona)\b", re.I)
CRISIS_WORDS = re.compile(r"\b(call|text|chat|llamar|enviar|chatear)\b", re.I)
# Links that call or text. A browser reads a scheme in any letter case, so TEL:988 is a call link too.
PHONE_SCHEMES = {"tel", "sms"}
# Other ways to open a call or message app. Not every phone has them, so the pages use tel: and sms: only.
OTHER_PHONE_SCHEMES = {"callto", "facetime", "facetime-audio", "mms", "sip", "sips", "skype", "whatsapp", "imessage"}
# Elements that start hidden and assets/menu.js shows as soon as it runs, such as the wallet card
# page's print button. Visitors with JavaScript see them, so their text is checked like any other,
# and tools/make_review_packet.py puts it in the review packets.
SHOWN_BY_SCRIPT = {"print-button", "print-hint"}
# The only pages allowed places to type or choose (a proposal; see notes/DECISIONS.md, November 9, 2026).
# What is typed there stays in the page: assets/check-in.js may not send or store it, which the asset
# checks below enforce, and the page has no <form>.
INTERACTIVE_PAGES = {"check-in/index.html", "es/registro-diario/index.html"}
# Below this, counting every parent, a crisis control is too faint to count as shown. The browser tests use it too.
SHOWN_OPACITY = 0.9


def scheme_of(href):
    """A link's scheme in lower case, as a browser reads it (tabs and line breaks dropped), or "" for a
    link to a page on this site."""
    cleaned = re.sub(r"[\t\n\r]", "", href or "").strip()
    match = re.match(r"([A-Za-z][A-Za-z0-9+.-]*):", cleaned)
    return match.group(1).lower() if match else ""


def normal_href(href):
    """A link with its scheme in lower case, so TEL:988 and tel:988 compare as the same link."""
    scheme = scheme_of(href)
    cleaned = re.sub(r"[\t\n\r]", "", href or "").strip()
    return scheme + cleaned[len(scheme):] if scheme else cleaned


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
        self.inputs = []
        self.text_parts = []
        # The same text without the review list on the About pages, which has its own check.
        self.claim_parts = []
        self.attribute_text = []
        # The text a visitor sees or a screen reader says, each piece with the language it is marked as.
        self.marked_text = []
        self.classes = set()
        self.aria_refs = []
        self.hidden_crisis = []
        self.balance_errors = []
        self.mains = 0
        self.first_focusable = None
        self.review_note = ""
        self.status_values = []
        # Text inside a hidden element that the script never shows, so no visitor sees it and nothing checks it.
        self.unread_hidden = []
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

    def _lang(self, attrs=None):
        """The language marked here: the element's own lang, or the nearest one around it."""
        if attrs and attrs.get("lang"):
            return attrs["lang"]
        for _, around in reversed(self.stack):
            if around.get("lang"):
                return around["lang"]
        return None

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
                self.marked_text.append((self._lang(attrs), attrs[key]))
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
                self.marked_text.append((self._lang(attrs), attrs.get("content", "")))
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt.append(attrs.get("src", "?"))
        elif tag in {"input", "textarea"}:
            # Only the Daily check-in may have these, and only kinds that can't send anything: checkboxes,
            # radio buttons, and text boxes that browsers don't autofill. See INTERACTIVE_PAGES.
            kind = attrs.get("type", "text" if tag == "input" else "textarea").lower()
            self.inputs.append((tag, kind, attrs.get("autocomplete", "")))
        elif tag in {"form", "select", "iframe", "embed", "object", "video", "audio"}:
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
                "target": attrs.get("target", ""),
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
            self.marked_text.append((self._lang(), data))
            return
        if "script" in tags:
            if self.inline_scripts and data.strip() and not self.stack[-1][1].get("src"):
                self.inline_scripts[-1] += data.strip()
            return
        if "style" in tags or "svg" in tags:
            return
        # Hidden text that the script shows is read like the rest. Other hidden text is never seen.
        if any("hidden" in attrs and not set(attrs.get("class", "").split()) & SHOWN_BY_SCRIPT for _, attrs in self.stack):
            if data.strip():
                self.unread_hidden.append(data.strip())
            return
        self.text_parts.append(data)
        self.marked_text.append((self._lang(), data))
        if not any("status-list" in attrs.get("class", "").split() for _, attrs in self.stack):
            self.claim_parts.append(data)
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

    @property
    def claim_text(self):
        return re.sub(r"\s+", " ", " ".join(self.claim_parts))


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
            # Above /suicideprevention/ is another address on GitHub Pages, so the link would be broken there.
            if not pieces:
                return ("MISSING:" + path, parts.fragment)
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


def safety_table():
    """The rows of the resource table in notes/SAFETY.md, the single place crisis details are recorded."""
    safety = (ROOT / "notes" / "SAFETY.md").read_text(encoding="utf-8")
    section = safety.split("## U.S. crisis resources", 1)[-1].split("###", 1)[0]
    return [line for line in section.splitlines() if line.startswith("|")]


def crisis_hosts():
    """The web addresses of the crisis services in notes/SAFETY.md's table, such as 988lifeline.org."""
    hosts = set()
    for line in safety_table():
        for host in re.findall(r"\b((?:[a-z0-9-]+\.)+(?:org|gov|net|com))\b", line.lower()):
            hosts.add(host[4:] if host.startswith("www.") else host)
    return hosts


def is_crisis_host(url):
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    host = host[4:] if host.startswith("www.") else host
    return any(host == known or host.endswith("." + known) for known in crisis_hosts())


def allowed_numbers():
    """Whole numbers from the resource table in notes/SAFETY.md, the single place they are recorded."""
    numbers = set()
    for line in safety_table():
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


# Phone numbers written out in text, from 1-800-662-4357 down to short codes such as 988 and 741741.
WRITTEN_NUMBER = re.compile(r"(?<![\d-])(?:1-)?\d{3}-\d{3}-\d{4}(?![\d-])|(?<![\d-])\d{3}-\d{3}(?![\d-])|(?<![\d.,-])\d{3,}(?![\d-])")


def check_printed_numbers(page, numbers, fail):
    """The wallet cards and poster are printed and handed out, so every number on them, written out as
    plain text, must be one recorded in notes/SAFETY.md. Four-digit years are the one exception."""
    for number in WRITTEN_NUMBER.findall(page.text + " " + " ".join(page.attribute_text)):
        if re.fullmatch(r"(19|20)\d\d", number):
            continue
        if phone_digits(number) not in numbers:
            fail(f"the printed card or poster shows {number}, which is not a number recorded in notes/SAFETY.md")


def unmarked_spanish(page):
    """Text on an English page that looks Spanish, by SPANISH_SIGNS, where nothing marks it as another language:
    the page's text and title, image descriptions, screen reader names, and the description. Each once."""
    found = []
    for lang, text in page.marked_text:
        text = re.sub(r"\s+", " ", text).strip()
        if SPANISH_SIGNS.search(text) and re.match(r"en(-|$)", (lang or "en").strip().lower()) and text not in found:
            found.append(text)
    return found


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
        if page.inputs and name not in INTERACTIVE_PAGES:
            fail(f"places to type or choose belong only on the Daily check-in (SAFETY rule 5): {sorted(set(t for t, _, _ in page.inputs))}")
        for tag, kind, autocomplete in page.inputs:
            if tag == "input" and kind not in {"radio", "checkbox"}:
                fail(f"the Daily check-in may only use checkboxes and radio buttons, not input type=\"{kind}\"")
            if tag == "textarea" and autocomplete != "off":
                fail("every text box on the Daily check-in needs autocomplete=\"off\", so browsers don't keep what was typed")
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

        bar = [normal_href(link["href"]) for link in page.links if ".crisis-bar" in link["within"]]
        for required in ("tel:988", "sms:988", "tel:911"):
            if required not in bar:
                fail(f"crisis strip is missing {required} (SAFETY rule 1)")
        actions = [normal_href(link["href"]) for link in page.links if ".crisis-actions" in link["within"]]
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
            fail("does not say Tidelight is not a crisis service (SAFETY rule 3)")
        if lang == "en" and not any((link["href"] or "").endswith("#en-espanol") for link in page.links):
            fail("has no link to the Spanish section")
        for text in unmarked_spanish(page) if lang == "en" else []:
            fail("has text that looks Spanish, with letters such as ñ or é or words such as \"al 988\", but nothing marks "
                 "it as Spanish or another language. If it's Spanish, mark it lang=\"es\", so screen readers pronounce "
                 "it in Spanish and the Spanish review packet shows it. A name or word from another language takes "
                 f"that language's code, such as lang=\"fr\". It says: \"{text[:80]}\"")
        exits = [link for link in page.links if "quick-exit" in link["classes"]]
        if len(exits) != 1 or scheme_of(exits[0]["href"]) != "https":
            fail("needs exactly one quick exit link to an outside https page (idea B2)")
        elif exits[0]["target"] != "_top":
            # Without JavaScript the link is all there is, and inside another site's frame it would leave only the frame.
            fail("the quick exit link needs target=\"_top\", so it leaves the whole window even inside another site's frame")
        if page.unread_hidden:
            fail(f"has hidden text that no check reads, starting \"{page.unread_hidden[0][:50]}\". Remove it, or if "
                 "assets/menu.js shows it, add its class to SHOWN_BY_SCRIPT in tools/check_site.py")
        if "print-area" in page.classes:
            check_printed_numbers(page, numbers, fail)
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
            scheme = scheme_of(href)
            if scheme in ("javascript", "vbscript", "data"):
                fail(f"link \"{label}\" uses {scheme}:")
                continue
            if href.startswith("#") and CRISIS_WORDS.search(label) and len(href) == 1:
                fail(f"crisis link \"{label}\" goes nowhere")
            if scheme in OTHER_PHONE_SCHEMES:
                fail(f"link \"{label}\" uses {scheme}:, which not every phone can open. Use tel: or sms:")
            if scheme in PHONE_SCHEMES | OTHER_PHONE_SCHEMES:
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
    check_review_status(failures, pages, notes)
    check_dates(failures, pages)
    check_crisis_styles(failures, names)
    outside = {}
    for name, page in pages.items():
        for link in page.links:
            if scheme_of(link["href"]) in ("http", "https"):
                outside.setdefault(link["href"], []).append(name)
    return outside, len(names)


# Words that would claim a review. A page may use them only once its own review, and the review of the
# text on every page, are recorded as approved in notes/CONTENT-REVIEW.md. "has not reviewed" and
# "no ha sido revisado" don't match.
REVIEW_CLAIMS = re.compile(
    r"\b(reviewed by|approved by|vetted by|validated by|reviewed and approved|clinically (reviewed|approved|validated)"
    r"|(medically|professionally|clinically|clinician|expert|doctor|therapist|psychologist)[- ](reviewed|approved|vetted|validated)"
    r"|(page|site|content|text|information|wording) (has been|was|is) (reviewed|approved)"
    r"|checked by (a|an|our) (licensed|clinician|clinical|therapist|psychologist|psychiatrist|counsel+or|social worker|professional|doctor|expert)"
    r"|revisad[oa]s? por|aprobad[oa]s? por|validad[oa]s? por|revisad[oa]s? y aprobad[oa]s?"
    r"|(médica|clínica|profesional)mente (revisad|aprobad|validad)[oa]s?"
    r"|(página|sitio|contenido|texto|información) (ha sido|fue|está) (revisad|aprobad)[oa]s?)\b", re.I)
# Sentences that say someone has done a review, such as "A licensed therapist has reviewed every page" or
# "Una terapeuta revisó cada página". They count unless the same sentence denies it first, as in "No
# licensed clinician has reviewed this site yet" or "ninguna persona hispanohablante la ha revisado".
REVIEW_DONE = re.compile(
    r"\b(has|have|had) (now |already |fully |carefully )?(reviewed|approved|vetted|checked|validated)\b"
    r"|\b(reviewed|approved|vetted|checked) (this|these|every|each|all|the|its|our)\b"
    r"|(?<!\bse )\b(ha|han|había|habían) (revisado|aprobado|validado|comprobado)\b"
    r"|(?<!\bse )\b(revisó|revisaron|aprobó|aprobaron|validó|validaron) (este|esta|estos|estas|cada|todo|toda|todos|todas|el|la|los|las|su|sus|nuestro|nuestra)\b",
    re.I)
DENIED = re.compile(r"\b(no|not|never|nobody|none|neither|nor|yet to|ningún|ninguna|ninguno|nadie|nunca|ni|tampoco|sin)\b", re.I)


def review_claim(text):
    """The first words in the text that claim a review, or None."""
    match = REVIEW_CLAIMS.search(text)
    if match:
        return match.group(0)
    for match in REVIEW_DONE.finditer(text):
        sentence = re.split(r"[.!?;:]\s", text[: match.start()])[-1]
        if not DENIED.search(sentence):
            return match.group(0)
    return None


ABOUT_SECTIONS = ("what-this-is", "review-status", "privacy", "quick-exit", "offline", "contact-card")
# What the About pages' review list may show for a section whose newest record isn't an approval of its
# current text. Until a record exists, only the first one.
NOT_YET_STATUS = {"en": ("Pending", "Changes needed", "Not approved"), "es": ("Pendiente", "Cambios pedidos", "No aprobada")}

# A review record in notes/CONTENT-REVIEW.md is one line in exactly this form:
#   - Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6
# The section is a section's name in the review packets' sign-off tables, or a page's address, such as
# help-someone/, if no other section has that address. Get Help has two, its English text and its Spanish
# lines, so its records use the names. The last part is the section's fingerprint, printed beside it in the
# sign-off table. It is made from the section's text, so an approval only counts for the text the reviewer
# read. Only these two results count as an approval.
RECORD_FORM = re.compile(r"^- (?P<section>[^:]+): (?P<role>.+?), (?P<date>\d{4}-\d{2}-\d{2}), (?P<result>.+?)"
                         r"(?:, (?P<fingerprint>[0-9a-fA-F]{12}))?\.?\s*$")
RECORD_EXAMPLE = "- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6"
APPROVED = {"approved", "approved with changes, changes made"}
# Any of these words in the role or the result means it is not a full approval.
NOT_APPROVED = re.compile(r"\b(not|no|yet|waiting|pending|only|partly|partial|except|until|but)\b", re.I)
# English sections need a licensed mental health professional, and Spanish sections a fluent or native
# Spanish reader. Only these roles count, and one never counts for the other. A record by anyone else is
# left out completely, so it can neither approve a section nor hide an earlier rejection.
CLINICAL_ROLE = re.compile(
    r"\b(licensed clinical social worker|LCSW|licensed professional counsell?or|LPC|licensed mental health counsell?or|LMHC"
    r"|licensed marriage and family therapist|LMFT|psychologist|psychiatrist|psychiatric (mental health )?nurse practitioner"
    r"|PMHNP|licensed therapist|licensed counsell?or)\b", re.I)
NOT_CLINICAL = re.compile(
    r"\b(legal|lawyer|attorney|counsel|physical|occupational|speech|school|volunteer|non-?clinical|unlicensed|non-?licensed"
    r"|not|AI|A\.I|artificial intelligence|chatbot|bot|student|intern|trainee)\b", re.I)
SPANISH_ROLE = re.compile(
    r"\b((fluent|native)( or (fluent|native))? Spanish (reader|speaker)|hispanohablante|hablante nativ[oa] de español"
    r"|(lector|lectora) (nativ[oa]|fluid[oa]) de español|(lector|lectora|hablante) con español (nativo|fluido))\b", re.I)
NOT_SPANISH = re.compile(
    r"\b(AI|A\.I|IA|artificial|machine|máquina|automatic|automated|automática|automático|software|program|programa|app"
    r"|bot|chatbot|non-?native|no nativ[oa]|not|no)\b", re.I)
EVERY_PAGE = {"en": "(text on every page)", "es": "(texto en cada página)"}
OUTSIDE_TEXT = {"en": "(wording outside the page text)", "es": "(texto fuera de las páginas)"}
# The Spanish lines in the parts every English page shares, such as "Leer en español". A fluent reader reviews
# them as a section of the Spanish packet, like the Spanish lines in an English page's own text.
SPANISH_ON_EVERY_PAGE = "(español en cada página en inglés)"
# The sign-off tables name these sections with the part of the packet they are in.
SIGNOFF_NAMES = {"text on every page (part 1)": (EVERY_PAGE["en"], "en"), "texto en cada página (parte 1)": (EVERY_PAGE["es"], "es"),
                 "wording outside the page text (part 3)": (OUTSIDE_TEXT["en"], "en"),
                 "texto fuera de las páginas (parte 4)": (OUTSIDE_TEXT["es"], "es")}


def reviewer_kinds(role):
    """Which sections a reviewer's role can approve: "en" for a licensed clinician, "es" for a fluent reader."""
    kinds = set()
    if CLINICAL_ROLE.search(role) and not NOT_CLINICAL.search(role):
        kinds.add("en")
    if SPANISH_ROLE.search(role) and not NOT_SPANISH.search(role):
        kinds.add("es")
    return kinds


def review_records():
    """Lines recorded under "## Review records" in notes/CONTENT-REVIEW.md, other than the placeholder.
    The section ends at the next "## " heading, so lines under "## Other reviews" are never read."""
    text = (ROOT / "notes" / "CONTENT-REVIEW.md").read_text(encoding="utf-8")
    if "## Review records" not in text:
        return None
    section = text.split("## Review records", 1)[1].split("\n## ", 1)[0]
    return [line for line in section.splitlines() if line.startswith("- ") and "No review has been recorded" not in line]


def review_sections():
    """Each part a reviewer signs off, as (name, page, language), named as in the review packets."""
    sys.path.insert(0, str(ROOT / "tools"))
    import make_review_packet  # here, not at the top, because that file uses this one
    found = [(label, page, "en") for page, _, label in make_review_packet.ENGLISH]
    found += [(label, page, "es") for page, _, label, _ in make_review_packet.SPANISH]
    found += [(label, page, "es") for page, _, label in make_review_packet.SPANISH_ON_ENGLISH]
    return found + [("Text on every page", EVERY_PAGE["en"], "en"), ("Texto en cada página", EVERY_PAGE["es"], "es"),
                    ("Wording outside the page text", OUTSIDE_TEXT["en"], "en"),
                    ("Texto fuera de las páginas", OUTSIDE_TEXT["es"], "es")]


_FINGERPRINTS = {}


def section_fingerprint(page, lang):
    """A section's fingerprint now, made from its text as the review packets show it."""
    if (page, lang) not in _FINGERPRINTS:
        sys.path.insert(0, str(ROOT / "tools"))
        import make_review_packet
        missing = page.endswith(".html") and not (ROOT / page).exists()  # never matches a record
        _FINGERPRINTS[(page, lang)] = "page missing" if missing else make_review_packet.section_fingerprint(page, lang)
    return _FINGERPRINTS[(page, lang)]


def section_names():
    """Every name a record may use for a section, lower-cased, mapped to (page, language). An address
    shared by two sections, such as 404.html, names neither, so the record must use the section's name."""
    found = {}
    for label, page, lang in review_sections():
        names = {label, page}
        if page.endswith("index.html"):
            names.add(page[: -len("index.html")])
        for name in names:
            if name:
                found.setdefault(name.lower(), set()).add((page, lang))
    for name, section in SIGNOFF_NAMES.items():
        found.setdefault(name, set()).add(section)
    return {name: sections.pop() for name, sections in found.items() if len(sections) == 1}


def read_review_records(lines, today=None):
    """Reads review records strictly. Returns (records, [(line, why it doesn't count)]).
    A record dated after today doesn't count: it is almost always a typing mistake."""
    today = today or datetime.date.today()
    names = section_names()
    records, unreadable = [], []
    for index, line in enumerate(lines):
        match = RECORD_FORM.match(line.strip())
        section = match and match.group("section").strip().strip("\"“”").lower()
        try:
            date = datetime.date.fromisoformat(match.group("date")) if match else None
        except ValueError:
            date = None
        if not match:
            unreadable.append((line, f"it isn't in the form \"{RECORD_EXAMPLE}\""))
            continue
        if section not in names:
            unreadable.append((line, "the section isn't named as in the review packets' sign-off tables"))
            continue
        if not date:
            unreadable.append((line, "the date isn't a real date in the form YYYY-MM-DD"))
            continue
        if date > today:
            unreadable.append((line, f"the date is after today ({today.isoformat()})"))
            continue
        page, lang = names[section]
        role, result = match.group("role").strip(), match.group("result").strip()
        approved = result.lower() in APPROVED and not NOT_APPROVED.search(role + " " + result)
        fingerprint = (match.group("fingerprint") or "").lower() or None
        records.append({"page": page, "lang": lang, "role": role, "kinds": reviewer_kinds(role), "date": date,
                        "approved": approved, "fingerprint": fingerprint, "line": line, "index": index})
    return records, unreadable


def ignored_records(records):
    """Records by a reviewer who can't approve that section, such as a lawyer, so they are left out."""
    return [r for r in records if r["lang"] not in r["kinds"]]


def latest_review(records, page, lang):
    """The newest record for a page or section by the kind of reviewer it needs, or None. Records by
    anyone else are left out. On the same date, a record that isn't an approval wins, then the later line."""
    mine = [r for r in records if r["page"] == page and r["lang"] == lang and lang in r["kinds"]]
    return max(mine, key=lambda r: (r["date"], not r["approved"], r["index"])) if mine else None


def review_state(records, page, lang):
    """(approved, why not). Approved only if the newest record by the right kind of reviewer is an
    approval, and its fingerprint matches the section's text now."""
    found = latest_review(records, page, lang)
    if not found:
        return False, "no record by a " + ("licensed clinician" if lang == "en" else "fluent Spanish reader")
    if not found["approved"]:
        return False, f"the newest record, from {found['date']}, isn't an approval"
    if not found["fingerprint"]:
        return False, f"the approval from {found['date']} has no fingerprint"
    current = section_fingerprint(page, lang)
    if found["fingerprint"] != current:
        return False, (f"the text changed after the approval from {found['date']}: it was approved as "
                       f"{found['fingerprint']}, and is {current} now")
    return True, ""


def is_approved(records, page, lang):
    return review_state(records, page, lang)[0]


_LOOSE_TEXT = {}


def missing_sections(names):
    """What the publish step could never ask a reviewer about, each with what to do. Every page needs a section
    in the review packets. Spanish lines on an English page, even a few words, need one in the Spanish packet,
    whether or not the page has a Spanish twin: only a fluent reader can approve them. And text that no part of
    a packet holds, such as a sentence in a div, would reach no reviewer, and no fingerprint would change with it."""
    sys.path.insert(0, str(ROOT / "tools"))
    import make_review_packet
    covered = {(page, lang) for _, page, lang in review_sections()}
    add = ("so the publish step would never ask for its review. Add it to ENGLISH, SPANISH or SPANISH_ON_ENGLISH "
           "in tools/make_review_packet.py")
    missing = []
    shared_on = []
    for name in names:
        if (name, language_of(name)) not in covered:
            missing.append(f"{name} has no section in the review packets, {add}")
            continue
        if not (ROOT / name).exists():
            continue
        if name not in _LOOSE_TEXT:  # the publish gate's self-test asks many times, and the pages don't change
            _LOOSE_TEXT[name] = make_review_packet.loose_text(name)
        for lang, text in _LOOSE_TEXT[name]:
            missing.append(f"{name} has {'Spanish ' if is_spanish(lang) else ''}text that no review packet shows, so no "
                           "reviewer would read it and an approval couldn't notice it change. Put it in a paragraph, "
                           "heading, list item or table cell, or add its tag to BLOCK in tools/make_review_packet.py. "
                           f"It says: \"{text[:80]}\"")
        if language_of(name) != "en":
            continue
        own, shared = make_review_packet.spanish_on_english(name)
        if own and (name, "es") not in covered:
            missing.append(f"{name} has Spanish lines in its own text, but no section for them in the Spanish review packet, {add}")
        if shared and (SPANISH_ON_EVERY_PAGE, "es") not in covered:
            shared_on.append(name)
    if shared_on:
        missing.append(f"the parts every English page shares have Spanish lines, on {len(shared_on)} page(s) such as "
                       f"{shared_on[0]}, but no section for them in the Spanish review packet, {add}")
    return missing


def page_twins(pages):
    """Each page's twin in the other language, from its language switch."""
    twins = {}
    for name, page in pages.items():
        for link in page.links:
            if link["href"] and "lang-switch" in " ".join(link["within"]):
                target = resolve(name, link["href"])
                if target and not target[0].startswith("MISSING:"):
                    twins[name] = target[0]
    return twins


def check_review_status(failures, pages, notes=None):
    """Every page, and all its text, has a review section, the site may not claim a review that isn't recorded,
    and the About pages must stay complete and truthful."""
    notes = [] if notes is None else notes
    sys.path.insert(0, str(ROOT / "tools"))
    import make_review_packet
    failures.extend(missing_sections(pages))
    covered = {(page, lang) for _, page, lang in review_sections()}
    for label, page, lang in review_sections():
        if page.endswith(".html") and page not in pages:
            failures.append(f"tools/make_review_packet.py: the section \"{label}\" is for {page}, which doesn't exist")
    for page, _, label in make_review_packet.SPANISH_ON_ENGLISH:
        if (page in pages or not page.endswith(".html")) and not make_review_packet.section_blocks(page, "es"):
            failures.append(f"tools/make_review_packet.py: the section \"{label}\" has no Spanish lines for a reader to "
                            "approve. Remove it from SPANISH_ON_ENGLISH")
    # English pages with Spanish lines in the parts they all share, such as the links to Spanish. A review claim
    # on one of them needs that section approved too.
    shared_spanish = {name for name in pages if language_of(name) == "en" and make_review_packet.spanish_on_english(name)[1]}
    lines = review_records()
    if lines is None:
        failures.append("notes/CONTENT-REVIEW.md: needs a \"## Review records\" section")
        return
    records, unreadable = read_review_records(lines)
    for line, why in unreadable:
        failures.append(f"notes/CONTENT-REVIEW.md: this review record doesn't count, because {why}: {line}")
    for record in ignored_records(records):
        notes.append(f"notes/CONTENT-REVIEW.md: this record doesn't count for the publish step, because a "
                     f"\"{record['role']}\" can't approve this section. Move it under \"## Other reviews\": {record['line']}")
    for label, page, lang in review_sections():
        newest = latest_review(records, page, lang)
        approved, why = review_state(records, page, lang)
        if newest and newest["approved"] and not approved:  # a normal state after an edit; the publish step stops
            notes.append(f"{label}: its approval doesn't count until it's recorded again, because {why}")
    twins = page_twins(pages)
    for name, page in pages.items():
        lang = language_of(name)
        allowed = is_approved(records, name, lang) and is_approved(records, EVERY_PAGE[lang], lang)
        if lang == "es":  # a Spanish page also needs its English original's clinical review
            allowed = allowed and is_approved(records, twins.get(name), "en") and is_approved(records, EVERY_PAGE["en"], "en")
        if lang == "en" and (name, "es") in covered:  # and an English page's own Spanish lines, a fluent reader's
            allowed = allowed and is_approved(records, name, "es")
        if name in shared_spanish:  # and the Spanish lines every English page shares
            allowed = allowed and is_approved(records, SPANISH_ON_EVERY_PAGE, "es")
        claim = review_claim(page.claim_text + " " + " ".join(page.attribute_text))
        if claim and not allowed:
            failures.append(f"{name}: says \"{claim}\" but no approval of this page's current text is recorded in notes/CONTENT-REVIEW.md")
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
        listed = [resolve(about, link["href"])[0] for link in page.links
                  if ".status-list" in link["within"] and resolve(about, link["href"])]
        for name in pages:
            if language_of(name) == lang and name != "404.html" and name not in listed:
                failures.append(f"{about}: the review list does not list {name}")
        # Each page in the list shows two results: its clinical review, then its Spanish review.
        if len(page.status_values) != 2 * len(listed):
            failures.append(f"{about}: each page in the review list needs two results, clinical then Spanish")
            continue
        for index, name in enumerate(listed):
            english, spanish = (name, twins.get(name)) if lang == "en" else (twins.get(name), name)
            shown = page.status_values[2 * index: 2 * index + 2]
            # The Spanish result covers the Spanish page, and the English page's own Spanish lines if it has any.
            spanish_sections = [spanish] + ([english] if (english, "es") in covered else [])
            for value, sections, section_lang, what in ((shown[0], [english], "en", "clinical review"),
                                                        (shown[1], spanish_sections, "es", "Spanish review")):
                for section in sections:
                    if is_approved(records, section, section_lang):
                        continue
                    if not latest_review(records, section, section_lang):
                        if value != word:
                            failures.append(f"{about}: {name} must show {word} for its {what} until one is recorded")
                            break
                    elif value not in NOT_YET_STATUS[lang]:
                        failures.append(f"{about}: {name} shows \"{value}\" for its {what}, but the newest record isn't an approval "
                                        f"of the current text. Show one of: {', '.join(NOT_YET_STATUS[lang])}")
                        break


DATE_EN = re.compile(r"(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d\d")
DATE_ES = re.compile(r"\d{1,2} de (?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de 20\d\d")


def date_kind(text_before):
    """Whether a date dates the crisis numbers and links, or a list of sources. Reads the sentence
    the date ends, given the text just before it."""
    sentence = re.split(r"[.!?]\s", text_before[-400:])[-1]
    return "crisis details" if re.search(r"provider|proveedor", sentence) else "sources"


def check_dates(failures, pages):
    """Every page shows the same date for each kind of check, so a re-check can't update only some pages.
    The crisis details and the source lists are checked on their own schedules, so each has its own date."""
    for lang, pattern in (("en", DATE_EN), ("es", DATE_ES)):
        seen = {}
        for name, page in pages.items():
            if language_of(name) == lang:
                for match in pattern.finditer(page.text):
                    kind = date_kind(page.text[: match.start()])
                    seen.setdefault(kind, {}).setdefault(match.group(0), []).append(name)
        for kind, dates in sorted(seen.items()):
            if len(dates) > 1:
                failures.append(f"pages show different dates for the {kind} ({lang}): {sorted(dates)}. Use tools/set_checked_date.py")


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
        # vCard names are read in any letter case, as phones read them.
        phones = [line.split(":", 1)[1] for line in lines if line.upper().startswith("TEL")]
        if not phones:
            failures.append(f"{path.name}: has no phone number")
        for phone in phones:
            if phone_digits(phone) not in numbers:
                failures.append(f"{path.name}: {phone} is not a number recorded in notes/SAFETY.md")
        if any(len(line.encode("utf-8")) > 75 for line in lines):
            failures.append(f"{path.name}: vCard lines must be folded at 75 bytes")
        # The note and web address are saved to a person's phone too, and can stay there for years.
        # A long line continues on the next one, which starts with a space.
        unfolded = re.sub(r"\r\n[ \t]", "", raw.decode("utf-8")).split("\r\n")
        for line in unfolded:
            if line.upper().startswith("NOTE"):
                for number in re.findall(r"\b1-\d{3}-\d{3}-\d{4}\b|\b\d{3}-\d{3}\b|\d{3,}", line):
                    if phone_digits(number) not in numbers:
                        failures.append(f"{path.name}: the note has {number}, which is not a number recorded in notes/SAFETY.md")
            if line.upper().startswith("URL") and not is_crisis_host(line.split(":", 1)[1]):
                failures.append(f"{path.name}: {line} is not the website of a service in notes/SAFETY.md")


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
    for path in sorted((ROOT / "assets").glob("*.js")):
        script = path.read_text(encoding="utf-8")
        for word in ("http://", "https://", "fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "document.cookie"):
            if word in script:
                failures.append(f"{path.name}: sends or stores data (SAFETY rule 5): {word}")
    menu = (ROOT / "assets" / "menu.js").read_text(encoding="utf-8") if (ROOT / "assets" / "menu.js").exists() else ""
    for name in sorted(SHOWN_BY_SCRIPT):
        if f"querySelector('.{name}')" not in menu or ".hidden = false" not in menu:
            failures.append(f"tools/check_site.py: SHOWN_BY_SCRIPT lists .{name}, but assets/menu.js doesn't show it")


# ---------------------------------------------------------------- what can hide the crisis help
# SAFETY rule 1 keeps the crisis strip, the crisis buttons, and every link in them on screen. These
# checks read each page as a tree and match the stylesheet's selectors against it, so a rule that
# reaches the strip in any way (by class, by tag, by attribute, through a parent such as body, or with
# *) is found. Rules for printing are left out: the strip is meant to stay off paper. The browser tests
# check what this can't see, such as something covering the strip.

class Element:
    """One element of a page: its tag, attributes, parent and child elements."""

    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children = tag, attrs, parent, []
        self.classes = set(attrs.get("class", "").split())

    def ancestors(self):
        node = self.parent
        while node is not None and node.parent is not None:
            yield node
            node = node.parent

    def before(self):
        """The element children of its parent that come before it."""
        siblings = self.parent.children if self.parent else []
        return siblings[: siblings.index(self)] if self in siblings else []

    def descendants(self):
        for child in self.children:
            yield child
            yield from child.descendants()

    def describe(self):
        label = self.attrs.get("href") or self.attrs.get("aria-label") or " ".join(sorted(self.classes))
        return f"<{self.tag}{' ' + label if label else ''}>"


class Tree(html.parser.HTMLParser):
    """A page as a tree of elements."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("#document", {}, None)
        self.current = self.root
        self.elements = []

    def handle_starttag(self, tag, attrs):
        node = Element(tag, {k: (v or "") for k, v in attrs}, self.current)
        self.current.children.append(node)
        self.elements.append(node)
        if tag not in Page.VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in Page.VOID:
            self.current = self.current.parent

    def handle_endtag(self, tag):
        node = self.current
        while node.parent is not None and node.tag != tag:
            node = node.parent
        if node.parent is not None:
            self.current = node.parent


SIMPLE_SELECTOR = re.compile(r"""
    (?P<type>\*|[a-zA-Z][\w-]*)
  | \.(?P<cls>-?[_a-zA-Z][\w-]*)
  | \#(?P<id>-?[_a-zA-Z][\w-]*)
  | \[\s*(?P<attr>[\w-]+)\s*(?:(?P<op>[~|^$*]?=)\s*(?P<value>"[^"]*"|'[^']*'|[^\]\s]+)\s*(?P<flag>[iIsS])?\s*)?\]
  | ::(?P<element>[\w-]+)(?:\((?:[^()]|\([^()]*\))*\))?
  | :(?P<pseudo>[\w-]+)(?P<args>\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))?
""", re.X)
_parsed_selectors = {}


def split_top(text, mark=","):
    """Splits at commas that aren't inside brackets, as in a selector list."""
    parts, depth, start = [], 0, 0
    for i, char in enumerate(text):
        if char in "([":
            depth += 1
        elif char in ")]":
            depth -= 1
        elif char == mark and depth == 0:
            parts.append(text[start:i])
            start = i + 1
    return [part for part in parts + [text[start:]] if part.strip()]


def parse_selector(text):
    """A selector as [(combinator, [parts])] from left to right, or None if it can't be read. A
    selector that can't be read counts as one that can match anything."""
    text = text.strip()
    if text in _parsed_selectors:
        return _parsed_selectors[text]
    steps, compound, combinator, i = [], [], None, 0
    while i < len(text):
        gap = re.compile(r"\s*([>+~])\s*|\s+").match(text, i)
        if gap and gap.group(0):
            if not compound:  # leading space, or the spaces around > + ~, already taken
                i = gap.end()
                continue
            steps.append((combinator, compound))
            compound = []
            combinator = gap.group(1) or " "
            i = gap.end()
            continue
        part = SIMPLE_SELECTOR.match(text, i)
        if not part:
            steps = None
            break
        compound.append(part)
        i = part.end()
    if steps is not None and compound:
        steps.append((combinator, compound))
    _parsed_selectors[text] = steps or None
    return _parsed_selectors[text]


def attribute_matches(node, part):
    name = part.group("attr").lower()
    if name not in node.attrs:
        return False
    if not part.group("op"):
        return True
    have, want = node.attrs[name], part.group("value").strip("\"'")
    if part.group("flag") and part.group("flag").lower() == "i":
        have, want = have.lower(), want.lower()
    return {"=": have == want, "~=": want in have.split(), "|=": have == want or have.startswith(want + "-"),
            "^=": have.startswith(want), "$=": have.endswith(want), "*=": want in have}[part.group("op")]


def pseudo_matches(node, name, args, js):
    """States such as :hover or :focus can happen at any time, so they count as matching."""
    if name == "not":
        return not any(selector_matches(node, parse_selector(item), js) for item in split_top(args))
    if name in ("is", "where", "matches", "-webkit-any"):
        return any(selector_matches(node, parse_selector(item), js) for item in split_top(args))
    if name == "root":
        return node.tag == "html"
    siblings = node.parent.children if node.parent else [node]
    if name == "first-child":
        return siblings[0] is node
    if name == "last-child":
        return siblings[-1] is node
    if name == "only-child":
        return len(siblings) == 1
    return True


def compound_matches(node, parts, js):
    for part in parts:
        if part.group("type"):
            if part.group("type") != "*" and part.group("type").lower() != node.tag:
                return False
        elif part.group("cls"):
            # The page's script adds the class js to the html element, so match it with and without.
            if part.group("cls") not in node.classes | ({"js"} if js and node.tag == "html" else set()):
                return False
        elif part.group("id"):
            if node.attrs.get("id") != part.group("id"):
                return False
        elif part.group("attr"):
            if not attribute_matches(node, part):
                return False
        elif part.group("element"):
            return False  # a rule for ::before or ::after styles that, not the element
        elif part.group("pseudo"):
            if not pseudo_matches(node, part.group("pseudo").lower(), (part.group("args") or "()")[1:-1], js):
                return False
    return True


def selector_matches(node, steps, js):
    if steps is None:
        return True

    def from_step(node, index):
        combinator, parts = steps[index]
        if not compound_matches(node, parts, js):
            return False
        if index == 0:
            return True
        if combinator == ">":
            return node.parent is not None and node.parent.parent is not None and from_step(node.parent, index - 1)
        if combinator == "+":
            before = node.before()
            return bool(before) and from_step(before[-1], index - 1)
        if combinator == "~":
            return any(from_step(other, index - 1) for other in node.before())
        return any(from_step(other, index - 1) for other in node.ancestors())

    return from_step(node, len(steps) - 1)


def css_rules(css):
    """Each style rule as (the @media and @supports blocks around it, selectors, declarations), and the
    declarations in each @keyframes, by name."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    rules, keyframes, around, i = [], {}, [], 0
    while True:
        brace = re.compile(r"[{}]").search(css, i)
        if not brace:
            break
        prelude = css[i:brace.start()].split(";")[-1].strip()
        if brace.group() == "}":
            if around:
                around.pop()
            i = brace.end()
            continue
        if prelude.startswith("@"):
            name = prelude.split()[0].lower()
            if name in ("@media", "@supports", "@layer", "@container", "@scope", "@document"):
                around.append(prelude)
                i = brace.end()
                continue
            # @font-face, @page, @keyframes and the like hold no selectors. Skip the whole block.
            depth, end = 1, brace.end()
            while depth and end < len(css):
                depth += {"{": 1, "}": -1}.get(css[end], 0)
                end += 1
            if name.endswith("keyframes") and len(prelude.split()) > 1:
                keyframes[prelude.split()[1]] = re.sub(r"[^{};]*\{|\}", ";", css[brace.end():end - 1])
            i = end
            continue
        close = css.find("}", brace.end())
        close = len(css) if close < 0 else close
        rules.append((tuple(around), prelude, css[brace.end():close]))
        i = close + 1
    return rules, keyframes


def declarations(text):
    for item in text.split(";"):
        if ":" in item:
            name, value = item.split(":", 1)
            yield name.strip().lower(), re.sub(r"\s*!\s*important\s*$", "", value.strip().lower())


def print_only(around):
    """True when an @media block around a rule applies only to printing."""
    for prelude in around:
        if prelude.lower().startswith("@media"):
            queries = prelude[len("@media"):].split(",")
            if all("print" in q and not re.search(r"\bnot\b", q) for q in queries):
                return True
    return False


def amount(text):
    """0.5 from "0.5" or "50%"."""
    match = re.fullmatch(r"([\d.]+)(%?)", text.strip())
    return float(match.group(1)) / (100 if match.group(2) else 1) if match else None


def far_negative(value):
    """A negative position or margin large enough to put something off the screen."""
    for number, unit in re.findall(r"-\s*(\d+(?:\.\d+)?)\s*(px|r?em|%|vw|vh|vmin|vmax|in|cm|mm|pt)?", value):
        limit = {"": 100, "px": 100, "em": 6, "rem": 6, "in": 1, "cm": 3, "mm": 30, "pt": 75}.get(unit, 50)
        if float(number) >= limit:
            return True
    return False


def hides(name, value, own, keyframes):
    """Why one declaration would hide a crisis control, or None. "own" is true for the control itself,
    and false for one of its parents."""
    zero = re.fullmatch(r"-?0*\.?0+([a-z%]+)?", value) is not None
    if name == "display" and value == "none":
        return "display: none"
    if name in ("visibility", "content-visibility") and value in ("hidden", "collapse"):
        return f"{name}: {value}"
    if name == "opacity" and (amount(value) if amount(value) is not None else 1) < SHOWN_OPACITY:
        return f"opacity: {value}"
    if name in ("filter", "-webkit-filter", "backdrop-filter"):
        for found in re.findall(r"opacity\(\s*([\d.]+%?)\s*\)", value):
            if amount(found) is not None and amount(found) < SHOWN_OPACITY:
                return f"{name}: {value}"
    if name in ("clip-path", "-webkit-clip-path", "mask", "-webkit-mask", "mask-image", "-webkit-mask-image") and value not in ("none", "initial", "unset", "revert"):
        return f"{name}: {value}"
    if name == "clip" and value != "auto":
        return f"clip: {value}"
    if name in ("transform", "-webkit-transform", "translate", "scale", "rotate") and value != "none":
        return f"{name}: {value}"
    if name in ("color", "-webkit-text-fill-color") and value == "transparent":
        return f"{name}: transparent"
    if name == "font-size" and zero:
        return f"font-size: {value}"
    if name == "pointer-events" and value == "none":
        return "pointer-events: none, so it can't be tapped"
    if name == "z-index" and value.startswith("-"):
        return f"z-index: {value}, which can put it under the page"
    if re.fullmatch(r"(left|right|top|bottom|inset(-[a-z-]+)?|margin(-[a-z-]+)?|text-indent)", name) and far_negative(value):
        return f"{name}: {value}"
    if own and name in ("width", "height", "max-width", "max-height", "block-size", "inline-size") and zero:
        return f"{name}: {value}"
    if name in ("animation", "animation-name"):
        for word in re.findall(r"[\w-]+", value):
            for inner_name, inner_value in declarations(keyframes.get(word, "")):
                why = hides(inner_name, inner_value, own, {})
                if why:
                    return f"animation {word}, which sets {why}"
    return None


def markup_hides(holder, node):
    """Why an element's own markup hides it or the crisis control inside it, or None."""
    if "hidden" in holder.attrs:
        return "the hidden attribute"
    if holder.attrs.get("aria-hidden", "").lower() == "true":
        return "aria-hidden=\"true\""
    if "inert" in holder.attrs:
        return "the inert attribute"
    if holder.tag in ("template", "noscript"):
        return f"a <{holder.tag}>"
    if holder.tag in ("details", "dialog") and "open" not in holder.attrs and holder is not node:
        if not (holder.tag == "details" and any(a.tag == "summary" and a.parent is holder for a in [node, *node.ancestors()])):
            return f"a closed <{holder.tag}>"
    return None


def crisis_controls(tree):
    """The crisis strip and the crisis buttons' list, each with every link in them."""
    found = []
    for node in tree.elements:
        if node.classes & {"crisis-bar", "crisis-actions"}:
            found.append(node)
            found.extend(inner for inner in node.descendants() if inner.tag == "a")
    return found


def check_crisis_styles(failures, names):
    """No markup and no style rule may hide the crisis strip, the crisis buttons, or a link in them."""
    sheets = [(path.name, css_rules(path.read_text(encoding="utf-8"))) for path in sorted((ROOT / "assets").glob("*.css"))]
    reported = set()
    for name in names:
        tree = Tree()
        tree.feed((ROOT / name).read_text(encoding="utf-8"))
        tree.close()
        controls = crisis_controls(tree)
        reach = {}  # each control, and each of their parents, with whether it is a control itself
        hiding = set()
        for node in controls:
            reach[node] = True
            for holder in node.ancestors():
                reach.setdefault(holder, False)
            for holder in [node, *node.ancestors()]:
                why = markup_hides(holder, node)
                if why and holder not in hiding:
                    hiding.add(holder)
                    where = "" if holder is node else f" inside {holder.describe()}"
                    failures.append(f"{name}: crisis controls are hidden (SAFETY rule 1): {node.describe()}{where} has {why}")
        for sheet, (rules, keyframes) in sheets:
            for around, selectors, body in rules:
                if print_only(around):
                    continue
                found = [(n, v) for n, v in declarations(body)]
                for selector in split_top(selectors):
                    steps = parse_selector(selector)
                    for node, own in reach.items():
                        if not any(selector_matches(node, steps, js) for js in (False, True)):
                            continue
                        for prop, value in found:
                            why = hides(prop, value, own, keyframes)
                            key = (sheet, selector.strip(), why)
                            if why and key not in reported:
                                reported.add(key)
                                media = f" (inside {' '.join(around)})" if around else ""
                                failures.append(f"{sheet}: {selector.strip()}{media} hides crisis controls (SAFETY rule 1), "
                                                f"for example {node.describe()} on {name}: {why}")


# Crisis services known to refuse scripts: two answer 403, and findtreatment.gov gives scripts, even
# Chrome, a nearly empty page. A person checks these in a browser instead.
KNOWN_BLOCKERS = {"chat.988lifeline.org", "www.fcc.gov", "findtreatment.gov"}


def open_link(url):
    """Returns (status, final address, error). Status None means the site couldn't be reached."""
    request = urllib.request.Request(url, headers={"User-Agent": "Tidelight link check"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.geturl(), None
    except urllib.error.HTTPError as error:
        return error.code, url, None
    except Exception as error:  # network problems are reported, never hidden
        return None, url, error


def same_service(url, final):
    """True if a link still lands on the site it names, or on part of it, such as www. or chat."""
    def host(address):
        name = (urllib.parse.urlsplit(address).hostname or "").lower()
        return name[4:] if name.startswith("www.") else name
    start, end = host(url), host(final)
    return end == start or end.endswith("." + start) or start.endswith("." + end)


def check_links(outside, failures, notes, opener=open_link, out=print):
    """Loads each outside link. Many sites block scripts, so 403, 429 and 503 are reported, not failed.
    A crisis service from notes/SAFETY.md is stricter: after one retry, a site that can't be reached or
    answers with a server error fails, and so does a block from one not in KNOWN_BLOCKERS, or a link
    that now leads to another site, such as a parked or sold address."""
    for url in sorted(outside):
        status, final, error = opener(url)
        if status is None or status >= 500:
            status, final, error = opener(url)  # one retry, for a passing hiccup
        crisis = is_crisis_host(url)
        if status is None:
            message = f"could not reach {url}: {error}"
            (failures if crisis else notes).append(("crisis service " if crisis else "") + message)
            continue
        moved = f" -> {final}" if final.rstrip("/") != url.rstrip("/") else ""
        out(f"  {status} {url}{moved}")
        host = urllib.parse.urlsplit(url).hostname
        if crisis and not same_service(url, final):
            failures.append(f"crisis service link now leads to another site: {url} -> {final}")
        elif crisis and (status >= 500 or (status in (403, 429) and host not in KNOWN_BLOCKERS)):
            failures.append(f"crisis service link failed ({status}): {url}")
        elif status in (403, 429, 503):
            notes.append(f"{url} blocked this script ({status}); check it in a browser")
        elif status >= 400:
            failures.append(f"outside link failed ({status}): {url}")


def self_test_links():
    """Made-up answers, so the link check's own rules can be checked without the internet."""
    cases = [
        # What is being shown, the link, the answer (status, final address), whether it should fail.
        ("a crisis link that opens passes", "https://988lifeline.org/get-help/", (200, "https://988lifeline.org/get-help/"), False),
        ("a crisis link moved within its own site passes", "https://www.veteranscrisisline.net", (200, "https://www.veteranscrisisline.net/get-help-now/"), False),
        ("a crisis link sent to another site fails", "https://www.taps.org/suicide", (200, "https://parked-domain.example/for-sale"), True),
        ("a crisis link that answers 404 fails", "https://988lifeline.org/gone/", (404, "https://988lifeline.org/gone/"), True),
        ("another link sent elsewhere is only printed", "https://www.nimh.nih.gov/x", (200, "https://www.nih.gov/x"), False),
    ]
    wrong = 0
    for name, url, (status, final), should_fail in cases:
        failures, notes = [], []
        check_links({url: ["index.html"]}, failures, notes, opener=lambda _url, s=status, f=final: (s, f, None), out=lambda _line: None)
        right = bool(failures) == should_fail
        wrong += not right
        print(f"  {'ok' if right else 'WRONG'}: {name}")
    if wrong:
        print(f"{wrong} case(s) read wrongly. The monthly link check can't be trusted until this is fixed.")
        return 1
    print(f"All {len(cases)} made-up link answers were read correctly.")
    return 0


def write_job_summary(title, lines):
    """On GitHub, also put notes and failures on the run's summary page, so nobody has to open the log."""
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary and lines:
        with open(summary, "a", encoding="utf-8") as out:
            out.write(f"### {title}\n\n" + "".join(f"- {line}\n" for line in lines) + "\n")


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
    parser.add_argument("--self-test", action="store_true", help="check how the link check reads answers, offline")
    args = parser.parse_args()
    if args.self_test:
        return self_test_links()

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
    write_job_summary("Site check", [f"NOTE: {n}" for n in notes] + [f"FAIL: {f}" for f in failures])
    if failures:
        print(f"{len(failures)} problem(s) found.")
        return 1
    print("All checks passed. This does not replace a real phone test or a content review.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
