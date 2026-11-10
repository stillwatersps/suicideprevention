#!/usr/bin/env python3
"""Builds the printable review packets from the website and the notes.

    python3 tools/make_review_packet.py              # HTML and PDF, in notes/review-packet/
    python3 tools/make_review_packet.py --no-pdf     # HTML only, if Chrome isn't installed
    python3 tools/make_review_packet.py --changes    # only what changed since each reviewer's approvals
    python3 tools/make_review_packet.py --self-test  # checks this tool on made-up cases, changing nothing

It writes two packets, so each reader gets what they need:
  - tidelight-review-packet: for the licensed therapist. English pages, research brief,
    sources, questions, and sign-off.
  - tidelight-spanish-review-packet: for a fluent Spanish reader. Spanish pages, the Spanish
    lines on the English pages, questions written in Spanish, and sign-off.

Every sentence gets a number, so feedback can say "HELP-12" instead of quoting it. Each page, and the
text on every page, ends with what a screen reader reads aloud there that the screen doesn't show, such
as the page's title and the full names of the crisis links. The packet records a reviewer's role and the
date, never personal contact details. It only reads the project's files. It is not a review, and it
doesn't rate any wording.

Each section of the sign-off tables also shows a fingerprint: a 12-character code made from that
section's text, exactly as the packet shows it, screen reader words included. A review record carries it,
and the publish step (tools/launch_gate.py) counts an approval only while the section's text still has that
fingerprint. The packet fingerprint in notes/review-packet/FINGERPRINT.txt is made from both packets' text,
so tools/check_site.py says the packets are out of date whenever what they would show changes.

With --changes it writes, for each reviewer, a short packet instead: tidelight-review-changes for the licensed
therapist and tidelight-spanish-review-changes for the fluent Spanish reader. Each holds only the sections whose
fingerprint now differs from that reviewer's newest approval in notes/CONTENT-REVIEW.md, with the approved text
and the text now side by side and the differences marked. The approved text comes from the project's git
history: the newest commit that changed the site or this tool and gives the section the approved fingerprint.
If there is none, it shows the text now and says why. It reads git and changes nothing in it, and .gitignore
keeps those packets out of the project.
"""
import argparse
import collections
import datetime
import difflib
import hashlib
import html
import html.parser
import inspect
import io
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import (DATE_EN, DATE_ES, EVERY_PAGE, HEARD_ATTRIBUTES, OUTSIDE_TEXT, SHOWN_BY_SCRIPT,  # noqa: E402
                        SPANISH_ON_EVERY_PAGE, SPANISH_SIGNS, find_pages, is_spanish, language_of, normal_href,
                        scheme_of)

OUT = ROOT / "notes" / "review-packet"
PREVIEW = "https://stillwatersps.github.io/suicideprevention/"

ENGLISH = [
    ("index.html", "HOME", "Home"),
    ("get-help/index.html", "HELP", "Get Help"),
    ("help-someone/index.html", "SOME", "Help Someone"),
    ("teens/index.html", "TEEN", "For Teens"),
    ("check-in/index.html", "DAY", "Daily check-in"),
    ("not-sure/index.html", "SURE", "Not sure what you're feeling?"),
    ("after-a-loss/index.html", "LOSS", "After a loss"),
    ("safety-plan/index.html", "PLAN", "Make a safety plan"),
    ("after-an-attempt/index.html", "ATT", "After a suicide attempt"),
    ("research/index.html", "RES", "Research"),
    ("card/index.html", "CARD", "Wallet card and poster"),
    ("about/index.html", "ABOUT", "About and privacy"),
    ("404.html", "NOTFOUND", "Page not found"),
]
SPANISH = [
    ("es/index.html", "E-HOME", "Inicio", "index.html"),
    ("es/obtener-ayuda/index.html", "E-HELP", "Obtener ayuda", "get-help/"),
    ("es/ayudar-a-alguien/index.html", "E-SOME", "Ayudar a alguien", "help-someone/"),
    ("es/adolescentes/index.html", "E-TEEN", "Adolescentes", "teens/"),
    ("es/registro-diario/index.html", "E-DAY", "Registro diario", "check-in/"),
    ("es/que-siento/index.html", "E-SURE", "¿No sabes bien qué sientes?", "not-sure/"),
    ("es/despues-de-una-perdida/index.html", "E-LOSS", "Después de una pérdida", "after-a-loss/"),
    ("es/plan-de-seguridad/index.html", "E-PLAN", "Haz un plan de seguridad", "safety-plan/"),
    ("es/despues-de-un-intento/index.html", "E-ATT", "Después de un intento de suicidio", "after-an-attempt/"),
    ("es/investigacion/index.html", "E-RES", "Investigación", "research/"),
    ("es/tarjeta/index.html", "E-CARD", "Tarjeta y cartel", "card/"),
    ("es/acerca-de/index.html", "E-ABOUT", "Acerca de y privacidad", "about/"),
]
# Spanish lines on the English pages: every element marked lang="es", or holding words that are, wherever it
# sits. They would otherwise reach only the English packet, so a fluent reader reviews them in sections of
# their own: one for the parts every English page shares, such as the links to Spanish, and one for each
# page with Spanish lines in its own text. tools/check_site.py fails if any of them has no section here.
SPANISH_ON_ENGLISH = [
    (SPANISH_ON_EVERY_PAGE, "EN-ALL", "Español en cada página en inglés"),
    ("get-help/index.html", "EN-HELP", "Español en Get Help"),
    ("after-a-loss/index.html", "EN-LOSS", "Español en After a loss"),
    ("card/index.html", "EN-CARD", "Español en Wallet card and poster"),
    ("404.html", "E-NOTFOUND", "Página no encontrada"),
]
# What the Spanish packet says about where a section's lines appear, when the page's address doesn't say it.
SPANISH_ON_ENGLISH_NOTES = {
    SPANISH_ON_EVERY_PAGE: "Las líneas en español que tienen todas las páginas en inglés, como los enlaces al español. "
                           "Cada texto distinto aparece una vez, y una línea que no está en todas dice en cuáles está.",
    "card/index.html": "El cartel y cada tarjeta de bolsillo llevan esta línea al imprimirlos. Las tarjetas iguales aparecen una vez.",
    "404.html": "Aparece en cualquier dirección que no existe, y sin conexión en lugar de una página que no se guardó, "
                "así que también la ven personas que hablan español.",
}
# The links to Spanish that every English page has: the language switch and "Ayuda en español". Their Spanish
# goes in the section for the parts every English page shares, even where a page places them in its own text.
LANGUAGE_LINKS = {"lang-switch", "lang-link"}
# The parts of a page whose text the packets number, such as a paragraph, a table cell, or a button's label like
# the header's Menu. A link outside them, such as the header's brand, is numbered too. Visible text in none of
# them, such as a sentence in a div, would reach neither packet, so tools/check_site.py fails on it.
BLOCK = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "summary", "dt", "dd", "caption", "td", "th", "figcaption",
         "blockquote", "label", "button"}
HEADINGS = {"h1": "h3", "h2": "h4", "h3": "h5", "h4": "h5", "h5": "h6", "h6": "h6", "summary": "h5"}
# Fold labels ("Show more", "Show less") are buttons, not content, so they get no number.
SKIP_CLASSES = {"visually-hidden", "lang-switch", "breadcrumb", "toc", "card-arrow", "card-icon", "skip-link",
                "when-closed", "when-open"}
SHARED_CLASSES = {"crisis-bar", "crisis-panel", "site-footer", "site-header", "quick-exit"}
# The text on every page lists each different line once, so a reviewer reads it once. A line that isn't on every
# page of its language gets a note saying which pages show it, and the note is part of the section's fingerprint.
# So a shared line taken off one page, or changed there, changes the fingerprint and stops that section's approval,
# though no page lists the shared text again. See listing(). A line belongs to the first of these parts it sits in.
SHARED_PARTS = ("lang-switch", "lang-link", "crisis-bar", "quick-exit", "site-header", "crisis-panel", "site-footer")
WHERE_WORDS = {
    "en": {"only": "Only on {pages}.", "except": "On {every} except {pages}.", "every": "every page", "and": " and ",
           "part": "In {part}.", "links": "Its links go to {links}.", "tag": "Shown as <{tag}>.",
           "twin": "the same page in the other language",
           "parts": {"lang-switch": "the language switch", "lang-link": "the link to help in Spanish",
                     "crisis-bar": "the crisis strip", "quick-exit": "Quick exit", "site-header": "the header",
                     "crisis-panel": "the crisis buttons", "site-footer": "the footer"}},
    "es": {"only": "Solo en {pages}.", "except": "En {every} menos {pages}.", "every": "todas las páginas",
           "and": " y ", "part": "En {part}.", "links": "Sus enlaces van a {links}.", "tag": "Con la etiqueta <{tag}>.",
           "twin": "la misma página en el otro idioma",
           "parts": {"lang-switch": "el cambio de idioma", "lang-link": "el enlace a la ayuda en español",
                     "crisis-bar": "la franja de crisis", "quick-exit": "Salida rápida", "site-header": "el encabezado",
                     "crisis-panel": "los botones de crisis", "site-footer": "el pie de página"}},
}
# Parts of one control or line that show as separate pieces on screen, such as a button's title and
# its smaller second line. A " | " keeps them apart, so the packet doesn't show "Call 988Talk to a counselor".
PART_CLASSES = {"action-sub", "trust-text", "status-line", "brand-tag"}
ABBREVIATIONS = ["U.S.", "e.g.", "i.e.", "Dr.", "Nov.", "vs.", "EE. UU.", "a.m.", "p.m.", "No."]
# Words a screen reader says that the screen doesn't show. A link, button, or fold button is kept whole, with
# the words the screen shows, when a screen reader names it differently: by an aria-label, or with words hidden
# from the eye, such as ", home" after the brand or the section name after each "Show more".
CONTROLS = {"a", "button", "summary"}
# Where such words sit decides their section, as for the words the eye sees. The skip link is on every page too.
SHARED_HEARD = SHARED_CLASSES | {"skip-link"}
# How each packet introduces them. {heard} is what a screen reader says, {shown} what the screen shows.
HEARD_WORDS = {
    "en": {
        "part": "Read aloud by a screen reader, not shown on screen",
        "page-title": "Page title, read first when the page opens: {heard}",
        "skip": "Link seen only when reached with a keyboard: {heard}",
        "control": '{what} "{shown}", read aloud as: {heard}',
        "control-open": '{what} "{shown}", once open, read aloud as: {heard}',
        "control-empty": "{what} with no words on screen, read aloud as: {heard}",
        "hidden": "Read only by a screen reader: {heard}",
        "image": "Image description, read only by a screen reader: {heard}",
        "a": "Link", "button": "Button", "summary": "Fold button",
        "aria-label": {"nav": "Menu name: {heard}", "ul": "List name: {heard}", "ol": "List name: {heard}",
                       "": "Area name: {heard}"},
        "aria-description": "Description read by a screen reader: {heard}",
        "aria-roledescription": "Kind of item a screen reader names: {heard}",
        "aria-valuetext": "Value read by a screen reader: {heard}",
        "aria-placeholder": "Hint read by a screen reader: {heard}",
        "aria-braillelabel": "Name shown on a braille display: {heard}",
        "aria-brailleroledescription": "Kind of item shown on a braille display: {heard}",
        "title": "Tooltip, which some screen readers read: {heard}",
    },
    "es": {
        "part": "Lo que lee en voz alta un lector de pantalla y no se ve en pantalla",
        "page-title": "Título de la página, que se lee primero al abrirla: {heard}",
        "skip": "Enlace que solo se ve al llegar con el teclado: {heard}",
        "control": "{what} «{shown}», leído en voz alta: {heard}",
        "control-open": "{what} «{shown}», ya abierto, leído en voz alta: {heard}",
        "control-empty": "{what} sin palabras en pantalla, leído en voz alta: {heard}",
        "hidden": "Solo lo lee un lector de pantalla: {heard}",
        "image": "Descripción de imagen, que solo lee un lector de pantalla: {heard}",
        "a": "Enlace", "button": "Botón", "summary": "Botón para desplegar",
        "aria-label": {"nav": "Nombre del menú: {heard}", "ul": "Nombre de la lista: {heard}",
                       "ol": "Nombre de la lista: {heard}", "": "Nombre de la zona: {heard}"},
        "aria-description": "Descripción que lee un lector de pantalla: {heard}",
        "aria-roledescription": "Tipo de elemento que dice un lector de pantalla: {heard}",
        "aria-valuetext": "Valor que dice un lector de pantalla: {heard}",
        "aria-placeholder": "Pista que dice un lector de pantalla: {heard}",
        "aria-braillelabel": "Nombre en una pantalla braille: {heard}",
        "aria-brailleroledescription": "Tipo de elemento en una pantalla braille: {heard}",
        "title": "Texto emergente, que leen algunos lectores de pantalla: {heard}",
    },
}
# The build date, in each packet's language, from these names rather than the computer's language setting.
MONTHS = {
    "en": ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
           "November", "December"),
    "es": ("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre",
           "noviembre", "diciembre"),
}
# The questions for the fluent Spanish reader: a section of notes/CONTENT-REVIEW.md, shown in Parte 5 of the
# Spanish packet. tools/check_site.py fails if a question loses its Spanish, its English twin, or its source.
SPANISH_QUESTIONS = "Questions for the fluent Spanish reader"
AI_TRANSLATION = "Unreviewed AI translation"
QUESTION_LINE = re.compile(r"^\s*(?:\d+\.\s+|-\s+)?(ES|EN|Source):(?:\s+(.*))?$")
QUESTION_FIELDS = {"ES": "es", "EN": "en", "Source": "source"}


def english_date(day):
    return f"{MONTHS['en'][day.month - 1]} {day.day}, {day.year}"


def spanish_date(day):
    return f"{day.day} de {MONTHS['es'][day.month - 1]} de {day.year}"


def split_sentences(text):
    protected = text
    for short in ABBREVIATIONS:
        protected = protected.replace(short, short.replace(".", "\u0001"))
    protected = re.sub(r"(\d)\.(\d)", "\\1\u0001\\2", protected)
    # Split after the end of a sentence, keeping a closing quote mark with the sentence it ends.
    parts = re.split(r"(?:(?<=[.!?])|(?<=[.!?][\"”']))\s+(?=[A-ZÁÉÍÓÚÑ¿¡\"“(0-9])", protected)
    return [part.replace("\u0001", ".").strip() for part in parts if part.strip()]


class Extractor(html.parser.HTMLParser):
    """Reads a page into ordered blocks of text with their links, marking shared parts. A block that holds
    Spanish words, even a few inside an English sentence, is marked "spanish". Visible text that no block
    holds is kept apart in "loose", because no packet would show it."""

    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self, skip=SKIP_CLASSES):
        super().__init__(convert_charrefs=True)
        self.skip = set(skip)
        self.stack = []
        self.blocks = []
        self.current = None
        self.title = ""
        self.link = None
        # Wording a visitor meets outside the page text: (kind, text), such as a screen reader's name for a link.
        self.outside = []
        # The part of it marked as Spanish, such as a Spanish link's name on an English page.
        self.spanish_outside = []
        # Visible text outside every block, such as a sentence in a div: (language, text).
        self.loose = []

    def _classes(self):
        found = set()
        for _, attrs in self.stack:
            found.update((attrs.get("class") or "").split())
        return found

    def _ids(self):
        return [attrs.get("id") for _, attrs in self.stack if attrs.get("id")]

    def _lang(self):
        """The language of the innermost element that names one, such as a Spanish line on an English page."""
        for _, attrs in reversed(self.stack):
            if attrs.get("lang"):
                return attrs["lang"]
        return None

    def _block(self, tag, text=""):
        return {"tag": tag, "text": text, "links": [], "classes": self._classes(), "ids": self._ids(), "lang": self._lang()}

    def _hidden(self):
        # Hidden text that assets/menu.js shows, such as the wallet card page's print button, is kept.
        hidden = any("hidden" in attrs and not set((attrs.get("class") or "").split()) & SHOWN_BY_SCRIPT for _, attrs in self.stack)
        return hidden or bool(self._classes() & self.skip) or any(t in ("svg", "script", "style") for t, _ in self.stack)

    def _by_script(self):
        return any("hidden" in attrs for _, attrs in self.stack)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name") == "description" and attrs.get("content"):
            self.outside.append(("description", attrs["content"]))
        if attrs.get("aria-label"):
            self.outside.append(("aria-label", attrs["aria-label"]))
            if is_spanish(attrs.get("lang") or self._lang()):
                self.spanish_outside.append(("aria-label", attrs["aria-label"]))
        if tag in self.VOID:
            if tag == "img" and attrs.get("alt") and not self._hidden():
                block = self._block("img", "Image description: " + attrs["alt"])
                block["spanish"] = is_spanish(attrs.get("lang") or block["lang"])
                # Only a screen reader says it, so tools/check_site.py compares it with its own reading of the page.
                block["said"] = [tidy(attrs["alt"])]
                self.blocks.append(block)
            return
        self.stack.append((tag, attrs))
        if self._hidden():
            return
        # A list item, or a link, that holds its own headings and paragraphs is only a container.
        if tag in BLOCK and self.current is not None and self.current["tag"] in ("li", "a") and not self.current["text"].strip():
            self.current = None
        if tag in BLOCK and self.current is None:
            self.current = self._block(tag)
        # A link outside any paragraph or list, such as the header's button, is a block of its own.
        if tag == "a" and self.current is None:
            self.current = self._block("a")
        classes = set((attrs.get("class") or "").split())
        for holder in (self.current, self.link):
            if holder is not None and classes & PART_CLASSES and holder["text"].strip():
                holder["text"] = holder["text"].rstrip() + " | "
        if tag == "a" and self.current is not None:
            if "pill" in classes and self.current["text"].strip():
                self.current["text"] += " | "
            self.link = {"text": "", "href": attrs.get("href") or ""}

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        if tag == "a" and self.link is not None and self.current is not None:
            self.link["text"] = re.sub(r"\s+", " ", self.link["text"]).strip()
            self.current["links"].append(self.link)
            self.link = None
        if self.current is not None and tag == self.current["tag"]:
            self.current["text"] = re.sub(r"\s+", " ", self.current["text"]).strip()
            if self.current["text"]:
                self.blocks.append(self.current)
            self.current = None
        while self.stack:
            popped, _ = self.stack.pop()
            if popped == tag:
                break

    def handle_data(self, data):
        if self.stack and self.stack[-1][0] == "title":
            self.title += data
            return
        if self._hidden():
            return
        if self.current is None:
            if data.strip():
                self.loose.append((self._lang(), re.sub(r"\s+", " ", data).strip()))
            return
        self.current["text"] += data
        if data.strip() and self._by_script():
            self.current["script"] = True
        if data.strip() and is_spanish(self._lang()):
            self.current["spanish"] = True
        if self.link is not None:
            self.link["text"] += data


_READ = {}


def read_page(name, skip=SKIP_CLASSES):
    """A page read into blocks. Each reading is kept while the file is unchanged, because the packets and the
    checks read each page many times. Callers only read what it holds."""
    path = ROOT / name
    stat = path.stat()
    key = (name, frozenset(skip), stat.st_mtime_ns, stat.st_size)
    if key not in _READ:
        parser = Extractor(skip)
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        _READ[key] = parser
    return _READ[key]


def tidy(text):
    """Text with its spaces collapsed, as a screen reader would read it out."""
    return re.sub(r"\s+", " ", text or "").strip()


class Heard(html.parser.HTMLParser):
    """Reads what a screen reader says on a page that the screen doesn't show, as items for the packets: the
    page's title, names and other words given in HEARD_ATTRIBUTES, words with the visually-hidden class, the
    skip link, and the words of an image a packet would otherwise leave out. A link or button that a screen
    reader names differently from what the screen shows is kept whole, with the words the screen shows. Each
    item keeps "said": the words that only a screen reader says, which tools/check_site.py compares with its
    own reading of the page. Anything a screen reader skips, such as text marked aria-hidden, is left out."""

    VOID = Extractor.VOID

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.items = []
        self.title = ""
        self.html_lang = None
        # Links and buttons still open, each with its words as (text, hidden from the eye, fold state).
        self.controls = []
        # An element with the visually-hidden class that is still open.
        self.hidden = None

    def _classes(self):
        found = set()
        for _, attrs in self.stack:
            found.update((attrs.get("class") or "").split())
        return found

    def _lang(self):
        for _, attrs in reversed(self.stack):
            if attrs.get("lang"):
                return attrs["lang"]
        return None

    def _unheard(self):
        """Whether a screen reader skips what is here: hidden text the script never shows, anything marked
        aria-hidden, and scripts and styles."""
        for tag, attrs in self.stack:
            if tag in ("script", "style", "template"):
                return True
            if "hidden" in attrs and not set((attrs.get("class") or "").split()) & SHOWN_BY_SCRIPT:
                return True
            if (attrs.get("aria-hidden") or "").strip().lower() == "true":
                return True
        return False

    def _item(self, kind, heard, **extra):
        heard = tidy(heard)
        if heard:
            lang = extra.pop("lang", self._lang())
            item = {"kind": kind, "heard": heard, "said": [heard], "classes": self._classes(), "lang": lang,
                    "spanish": is_spanish(lang)}
            item.update(extra)
            self.items.append(item)

    def handle_starttag(self, tag, attrs):
        attrs = {key: value or "" for key, value in attrs}
        if tag == "html":
            self.html_lang = attrs.get("lang")
        self.stack.append((tag, attrs))
        if not self._unheard():
            for name in HEARD_ATTRIBUTES:
                value = tidy(attrs.get(name))
                if value and not (name == "aria-label" and tag in CONTROLS):  # a control's name is kept at its end
                    self._item("attribute", value, attribute=name, tag=tag)
            alt = tidy(attrs.get("alt"))
            if tag == "img" and alt:
                classes = self._classes()
                state = "closed" if "when-closed" in classes else "open" if "when-open" in classes else None
                for control in self.controls:  # an image's description names a link around it
                    control["words"].append((alt, "visually-hidden" in classes, state))
                if classes & SKIP_CLASSES:  # where the packets leave out the text around it
                    self._item("image", alt)
            if tag in CONTROLS:
                self.controls.append({"depth": len(self.stack), "tag": tag, "label": tidy(attrs.get("aria-label")),
                                      "words": [], "pieces": [], "classes": self._classes(), "lang": self._lang(),
                                      "spanish": is_spanish(self._lang())})
            if "visually-hidden" in (attrs.get("class") or "").split() and self.hidden is None and tag not in self.VOID:
                self.hidden = {"depth": len(self.stack), "text": "", "lang": self._lang(), "classes": self._classes()}
        if tag in self.VOID:
            self.stack.pop()

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in self.VOID or not any(open_tag == tag for open_tag, _ in self.stack):
            return
        while self.stack:
            popped, _ = self.stack.pop()
            if popped == tag:
                break
        depth = len(self.stack)
        if self.hidden is not None and depth < self.hidden["depth"]:
            hidden, self.hidden = self.hidden, None
            text = tidy(hidden["text"])
            if text and self.controls:  # part of a link's or button's name
                self.controls[-1]["pieces"].append(text)
                self.controls[-1]["spanish"] = self.controls[-1]["spanish"] or is_spanish(hidden["lang"])
            elif text:
                self.items.append({"kind": "hidden", "heard": text, "said": [text], "classes": hidden["classes"],
                                   "lang": hidden["lang"], "spanish": is_spanish(hidden["lang"])})
        while self.controls and depth < self.controls[-1]["depth"]:
            self._close_control(self.controls.pop())

    def _close_control(self, control):
        """Keeps a link or button whose name a screen reader says differently from the screen, once per fold
        state when it has the "Show more" and "Show less" labels, and the skip link, which the screen hides."""
        skip = "skip-link" in control["classes"]
        if not (control["label"] or control["pieces"] or skip):
            return
        states = [state for state in ("closed", "open") if any(s == state for _, _, s in control["words"])] or [None]
        for state in states:
            words = [(text, eye) for text, eye, s in control["words"] if s in (None, state)]
            shown = tidy("".join(text for text, eye in words if not eye))
            # Without the space that the page's line breaks leave before hidden words such as ", home".
            heard = control["label"] or re.sub(r"\s+([,.;:!?])", r"\1", tidy("".join(text for text, _ in words)))
            # The words only a screen reader says: the name that replaces the link's words, or the hidden ones.
            # A skip link is seen only when reached with a keyboard, so all its words count.
            said = [control["label"]] if control["label"] else list(control["pieces"])
            said = said + [heard] if skip or not said else said
            kind = "skip" if skip and not control["label"] and not control["pieces"] else "control"
            self.items.append({"kind": kind, "tag": control["tag"], "state": state if len(states) > 1 else None,
                               "shown": shown, "heard": heard, "said": said, "classes": control["classes"],
                               "lang": control["lang"], "spanish": control["spanish"]})

    def handle_data(self, data):
        tags = [tag for tag, _ in self.stack]
        if "svg" in tags:  # an image drawn on the page is named by its own title, unless it is marked aria-hidden
            if tags[-1] in ("title", "desc") and not self._unheard():
                self._item("image", data)
            return
        if tags and tags[-1] == "title":
            self.title += data
            return
        if self._unheard():
            return
        classes = self._classes()
        state = "closed" if "when-closed" in classes else "open" if "when-open" in classes else None
        for control in self.controls:
            control["words"].append((data, "visually-hidden" in classes, state))
        if self.hidden is not None:
            self.hidden["text"] += data

    def close(self):
        super().close()
        title = tidy(self.title)
        if title:
            self.items.insert(0, {"kind": "page-title", "heard": title, "said": [title], "classes": set(),
                                  "lang": self.html_lang, "spanish": is_spanish(self.html_lang)})


_HEARD = {}


def heard_items(name):
    """What a screen reader says on a page that the screen doesn't show, as items, the page's title first."""
    path = ROOT / name
    stat = path.stat()
    key = (name, stat.st_mtime_ns, stat.st_size)
    if key not in _HEARD:
        parser = Heard()
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        _HEARD[key] = parser.items
    return _HEARD[key]


def heard_text(item, lang):
    """One item as its packet lists it, such as: Link "Call 988", read aloud as: Call 988, the ..."""
    words = HEARD_WORDS[lang]
    if item["kind"] == "control":
        template = words["control-open" if item["state"] == "open" else "control" if item["shown"] else "control-empty"]
        return template.format(what=words[item["tag"]], shown=item["shown"], heard=item["heard"])
    template = words[item["attribute"]] if item["kind"] == "attribute" else words[item["kind"]]
    if isinstance(template, dict):
        template = template.get(item["tag"], template[""])
    return template.format(heard=item["heard"])


def heard_part(items, lang, once=False):
    """A section's closing part: what a screen reader says there that the screen doesn't show. In a section
    every page shares, each wording is listed once, as for the text the eye sees."""
    if not items:
        return []
    # The packet's own heading, not the page's, so it gets no number and is never marked as a repeat.
    blocks = [{"tag": "h2", "text": HEARD_WORDS[lang]["part"], "links": [], "classes": set(), "ids": [], "lang": lang,
               "unnumbered": True}]
    seen = set()
    for item in items:
        text = heard_text(item, lang)
        if once and text in seen:
            continue
        seen.add(text)
        blocks.append({"tag": "li", "text": text, "links": [], "classes": set(), "ids": [], "lang": lang,
                       "said": list(item["said"])})
    return blocks


def own_heard(name):
    """What a screen reader says in a page's own text, outside the parts every page shares."""
    return [item for item in heard_items(name) if not item["classes"] & SHARED_HEARD]


def shared_heard(names):
    """What a screen reader says in the parts every page shares, page by page."""
    return [item for name in names if (ROOT / name).exists() for item in heard_items(name) if item["classes"] & SHARED_HEARD]


def spanish_heard(name):
    """What a screen reader says in Spanish on an English page, as (in its own text, in the parts every English
    page shares or the links to Spanish), as for the Spanish lines the eye sees."""
    spanish = [item for item in heard_items(name) if item["spanish"]]
    elsewhere = SHARED_HEARD | LANGUAGE_LINKS
    return ([item for item in spanish if not item["classes"] & elsewhere],
            [item for item in spanish if item["classes"] & elsewhere])


def esc(text):
    return html.escape(text, quote=False)


BOX = '<span class="box"></span>'


class Numbering:
    """Gives each new sentence an id, and points repeats back to the first time they appeared."""

    def __init__(self):
        self.first = {}

    def number(self, prefix, counters, sentence):
        counters[prefix] = counters.get(prefix, 0) + 1
        label = f"{prefix}-{counters[prefix]}"
        key = re.sub(r"\W+", " ", sentence.lower()).strip()
        same = self.first.get(key)
        if same is None:
            self.first[key] = label
        return label, same


def links_table(links):
    seen = []
    rows = []
    for link in links:
        href = link["href"]
        if href.startswith(("#", "../", "./")) or not re.match(r"[a-z]+:", href):
            continue
        if href in seen:
            continue
        seen.append(href)
        rows.append(f"<li><strong>{esc(link['text'] or href)}</strong>: <span class=\"url\">{esc(href)}</span></li>")
    if not rows:
        return ""
    return '<ul class="links">' + "".join(rows) + "</ul>"


def decision(lang):
    if lang == "es":
        return (f'<p class="decision"><strong>Decisión:</strong> {BOX} Bien así {BOX} Bien con cambios {BOX} No para el sitio '
                '<span class="line">Notas:</span></p>')
    return (f'<p class="decision"><strong>Decision:</strong> {BOX} OK as written {BOX} OK with changes {BOX} Not for the website '
            '<span class="line">Notes:</span></p>')


def render_blocks(blocks, prefix, numbering, counters, lang):
    """Sentences grouped into sections, each section ending with a place for a decision."""
    out = []
    links = []
    open_section = False

    def close():
        nonlocal links, open_section
        if open_section:
            out.append(links_table(links))
            out.append(decision(lang))
            out.append("</section>")
        links = []
        open_section = False

    for block in blocks:
        tag = block["tag"]
        if tag in ("h1", "h2") or not open_section:
            close()
            out.append('<section class="review-block">')
            open_section = True
        if tag in HEADINGS and block.get("unnumbered"):
            out.append(f'<{HEADINGS[tag]} class="row-heading">{esc(block["text"])}</{HEADINGS[tag]}>')
        elif tag in HEADINGS:
            label, same = numbering.number(prefix, counters, block["text"])
            level = HEADINGS[tag]
            note = "" if not same else f' <span class="same">same as {same}</span>'
            out.append(f'<{level} class="row-heading"><span class="id">{label}</span> {esc(block["text"])}{note}</{level}>')
        else:
            bullet = " in-list" if tag == "li" else ""
            # Text the page's script shows, such as a print button, which visitors without JavaScript don't see.
            shown = "" if not block.get("script") else (
                ' <span class="same">(se muestra cuando funciona el script de la página)</span>' if lang == "es"
                else ' <span class="same">(shown once the page\'s script runs)</span>')
            for sentence in split_sentences(block["text"]):
                label, same = numbering.number(prefix, counters, sentence)
                if same:
                    out.append(f'<p class="row repeat{bullet}"><span class="id">{label}</span> <span class="same">same as {same}:</span> {esc(sentence)}{shown}</p>')
                else:
                    out.append(f'<p class="row{bullet}"><span class="id">{label}</span> {esc(sentence)}{shown}</p>')
        if block.get("where"):  # which pages show a line of the text on every page, when not every page does
            out.append(f'<p class="row where"><span class="id"></span> <span class="same">{esc(block["where"])}</span></p>')
        links.extend(block["links"])
    close()
    return "\n".join(out)


def page_blocks(name):
    """A page's own text, leaving out the parts every page shares and repeated wallet cards."""
    return own_text(read_page(name).blocks)


def own_text(blocks):
    """The blocks of a page's own text, leaving out the parts every page shares and repeated wallet cards. A
    line in a later card that differs from the first card is kept, so a changed card can't escape the review."""
    own = []
    cards = 0
    first_card = set()
    for block in blocks:
        if block["classes"] & SHARED_CLASSES:
            continue
        if "pc-card" in block["classes"]:
            if block["tag"] == "p" and "pc-kicker" in block["classes"]:
                cards += 1
            if cards <= 1:
                first_card.add((block["tag"], block["text"]))
            elif (block["tag"], block["text"]) in first_card:
                continue
        own.append(block)
    return own


def spanish_text(name):
    """An English page's Spanish lines, as (those in its own text, those in the parts every English page
    shares). A line counts if it is marked as Spanish or holds words that are, even in navigation the English
    packet leaves out, such as the language switch. A line in English with a few Spanish words is kept whole."""
    blocks = read_page(name, skip=()).blocks
    spanish = [block for block in blocks if block.get("spanish") or is_spanish(block.get("lang"))]
    shared = [block for block in spanish if block["classes"] & (SHARED_CLASSES | LANGUAGE_LINKS)]
    own = [block for block in own_text(blocks)
           if (block.get("spanish") or is_spanish(block.get("lang"))) and not block["classes"] & LANGUAGE_LINKS]
    return own, shared


def spanish_on_english(name):
    """An English page's Spanish, as (in its own text, in the parts every English page shares): the Spanish
    lines the eye sees, then what a screen reader says in Spanish there. Only a fluent reader approves it."""
    own, shared = spanish_text(name)
    heard_own, heard_shared = spanish_heard(name)
    return own + heard_own, shared + heard_shared


def spanish_lines(name):
    """The Spanish lines of an English page's own text, such as the 404 page's sentence for Spanish speakers."""
    return spanish_text(name)[0]


def spanish_shared_lines(names):
    """The Spanish lines in the parts every English page shares: each different line once, with a note under any
    line that isn't on every English page saying which pages show it. A page that doesn't exist is skipped:
    tools/check_site.py reports it on its own."""
    pages = [(packet_name(name), name, spanish_text(name)[1]) for name in names if (ROOT / name).exists()]
    return listing(pages, "es", "todas las páginas en inglés")


def packet_name(name):
    """A page's name in the packets, such as "For Teens" for teens/index.html."""
    found = {item[0]: item[2] for item in ENGLISH + SPANISH}
    return found.get(name, name)


def site_link(href, name):
    """Where a link on the page called name leads: a link within the site as its path from the site's root, the
    same whichever page it's on (../get-help/ on Help Someone and /suicideprevention/get-help/ on the 404 page both
    lead to get-help/), and any other link as written, with its scheme in lower case. A link to a place on its own
    page, such as #support, stays as written, because each page's header has one to its own crisis buttons."""
    href = normal_href(href)
    if scheme_of(href) or href.startswith("#"):
        return href
    folder = name[:-len("index.html")] if name.endswith("index.html") else name
    full = urllib.parse.urljoin(PREVIEW + folder, href)
    return (full[len(PREVIEW):] or "./") if full.startswith(PREVIEW) else full


def shared_part(block):
    """The part every page shares that a line sits in, such as "crisis-bar"."""
    return next((part for part in SHARED_PARTS if part in block["classes"]), "")


# How line_key() marks a link to the page's own twin in the other language, whatever page it's on.
TWIN = "(twin)"


def twin_link(name):
    """The site path of a page's twin in the other language, as site_link() gives it, from ENGLISH and SPANISH."""
    for spanish, _, _, english in SPANISH:
        english_page = english if english.endswith(".html") else english + "index.html"
        if name == english_page:
            return spanish[:-len("index.html")]
        if name == spanish:
            return "./" if english == "index.html" else english
    return None


def line_key(block, name):
    """What makes a line of a shared part the same line on another page: its part, its kind, its words, and where
    each of its links leads. A link to the page's own twin in the other language, such as each language switch,
    counts as one destination on every page."""
    twin = twin_link(name)
    return (shared_part(block), block["tag"], block["text"],
            tuple((link["text"], TWIN if site_link(link["href"], name) == twin
                   else site_link(link["href"], name)) for link in block["links"]))


def join_names(names, lang):
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + WHERE_WORDS[lang]["and"] + names[-1]


def listing(pages, lang, every=None):
    """The lines of the parts every page shares, each different line once, in the order first seen. pages is
    [(the page's name in the packet, its file, [block, ...]), ...], in the packets' order. A line that isn't on
    every page gets "where", a note saying which pages show it, and a line whose words are listed twice says what
    tells the two apart: its part, its links, or its kind. section_fingerprint() holds the notes, so a line taken
    off one page, or changed there, changes the fingerprint, though the packet shows each wording only once."""
    words = WHERE_WORDS[lang]
    every = every or words["every"]
    labels = [label for label, _, _ in pages]
    listed = {}  # line: {"block": the first page's block, "on": [page names]}, in the order first seen
    for label, name, blocks in pages:
        for block in blocks:
            entry = listed.setdefault(line_key(block, name), {"block": block, "on": []})
            if label not in entry["on"]:
                entry["on"].append(label)
    same_words = collections.defaultdict(list)
    for key in listed:
        same_words[key[2]].append(key)
    found = []
    for key, entry in listed.items():
        notes = []
        on = entry["on"]
        if len(on) < len(labels):
            off = [label for label in labels if label not in on]
            notes.append(words["only"].format(pages=join_names(on, lang)) if 2 * len(on) <= len(labels)
                         else words["except"].format(every=every, pages=join_names(off, lang)))
        twins = same_words[key[2]]
        if len({twin[0] for twin in twins}) > 1:
            notes.append(words["part"].format(part=words["parts"].get(key[0], key[0] or "-")))
        if len({twin[3] for twin in twins}) > 1:
            notes.append(words["links"].format(links=", ".join(words["twin"] if href == TWIN else href
                                                                for _, href in key[3]) or "-"))
        if len({twin[1] for twin in twins}) > 1:
            notes.append(words["tag"].format(tag=key[1]))
        block = dict(entry["block"])
        if notes:
            block["where"] = " ".join(notes)
        found.append(block)
    return found


def loose_text(name):
    """Visible text on a page that no block holds, such as a sentence in a div, as (language, text). No packet
    would show it, so no reviewer would read it, and no section's fingerprint would change with it. Read the
    way each packet reads the page: its own text, and on an English page, its Spanish lines too, which include
    parts the English packet skips."""
    found = list(read_page(name).loose)
    if language_of(name) == "en":
        found += [item for item in read_page(name, skip=()).loose if is_spanish(item[0]) and item not in found]
    return found


def section_blocks(page, lang):
    """The text of one section of the sign-off tables, exactly as its packet shows it: what the eye sees, then
    what a screen reader says there that the screen doesn't show."""
    names = [item[0] for item in (ENGLISH if lang == "en" else SPANISH)]
    english = [item[0] for item in ENGLISH]
    if page == EVERY_PAGE[lang]:
        return shared_blocks(names, lang) + heard_part(shared_heard(names), lang, once=True)
    if page == OUTSIDE_TEXT[lang]:
        return outside_blocks(names, lang)
    if lang == "es" and page == SPANISH_ON_EVERY_PAGE:
        heard = [item for name in english if (ROOT / name).exists() for item in spanish_heard(name)[1]]
        return spanish_shared_lines(english) + heard_part(heard, lang, once=True)
    if lang == "es" and language_of(page) == "en":
        return spanish_lines(page) + heard_part(spanish_heard(page)[0], lang)
    return page_blocks(page) + heard_part(own_heard(page), lang)


def section_fingerprint(page, lang):
    """The first 12 characters of a SHA-256 hash of a section's text and links, as the packet shows them, with
    the notes saying which pages show a line of the text on every page. Any change a reader of the packet could
    see changes it, and nothing else does."""
    return blocks_fingerprint(page, lang, section_blocks(page, lang))


def blocks_fingerprint(page, lang, blocks):
    """section_fingerprint() for a section whose blocks are given, such as made-up ones in --self-test."""
    lines = [f"section {lang} {page}"]
    for block in blocks:
        lines.append(f"{block['tag']}: {block['text']}")
        lines.extend(f"  link: {link['text']} -> {link['href']}" for link in block["links"])
        if block.get("where"):
            lines.append(f"  where: {block['where']}")
    return hashlib.sha256("\n".join(lines).encode("utf-8")).hexdigest()[:12]


_HEARD_SHOWN = {}


def heard_shown(page, lang):
    """The words only a screen reader says that one section of a packet shows."""
    if (page, lang) not in _HEARD_SHOWN:
        _HEARD_SHOWN[(page, lang)] = {piece for block in section_blocks(page, lang) for piece in block.get("said", ())}
    return _HEARD_SHOWN[(page, lang)]


def heard_in_packets(name):
    """The words only a screen reader says on a page that the packets show, as {"en": ..., "es": ...}: those
    in the sections that hold the page's text in the therapist's packet, and in the Spanish packet.
    tools/check_site.py reads the page its own way and fails on any such words that neither shows."""
    if language_of(name) == "en":
        sections = {"en": [(name, "en"), (EVERY_PAGE["en"], "en")], "es": [(SPANISH_ON_EVERY_PAGE, "es")]}
        if any(page == name for page, _, _ in SPANISH_ON_ENGLISH):
            sections["es"].append((name, "es"))
    else:
        sections = {"en": [], "es": [(name, "es"), (EVERY_PAGE["es"], "es")]}
    return {lang: set().union(*(heard_shown(page, section_lang) for page, section_lang in found))
            for lang, found in sections.items()}


def offline_notices():
    """The notice assets/menu.js shows with no connection, as {"en": ..., "es": ...}."""
    script = (ROOT / "assets" / "menu.js").read_text(encoding="utf-8")
    match = re.search(r"spanish\s*\?\s*'((?:[^'\\]|\\.)*)'\s*:\s*\"((?:[^\"\\]|\\.)*)\"", script)
    if not match:
        raise SystemExit("Couldn't find the offline notice in assets/menu.js. Update offline_notices() in tools/make_review_packet.py.")
    return {"es": match.group(1), "en": match.group(2)}


def card_fields(path):
    """A contact card's name and note, with long lines joined and vCard escapes removed."""
    text = re.sub(r"\r?\n[ \t]", "", path.read_text(encoding="utf-8"))
    fields = dict(line.split(":", 1) for line in text.splitlines() if ":" in line)
    return [(key, re.sub(r"\\([,;\\])", r"\1", fields[key])) for key in ("FN", "NOTE") if fields.get(key)]


def outside_blocks(names, lang):
    """Wording people meet outside the page text: a page's description in search results and link
    previews, the names a screen reader says, the offline notice, the contact card saved to a phone,
    and, in English, the name and description used when the site is added to a home screen."""
    es = lang == "es"
    blocks = []

    def heading(text):
        blocks.append({"tag": "h2", "text": text, "links": [], "classes": set(), "ids": [], "lang": lang})

    def item(text):
        blocks.append({"tag": "li", "text": text, "links": [], "classes": set(), "ids": [], "lang": lang})

    for kind, title in (("description", "Descripción en buscadores y vistas previas de enlaces" if es else "Description in search results and link previews"),
                        ("aria-label", "Nombres que dice un lector de pantalla" if es else "Names a screen reader says")):
        heading(title)
        seen = []
        wording = [read_page(name).outside for name in names]
        if es:  # Spanish wording on the English pages too, such as a Spanish link's name for a screen reader
            wording += [read_page(name).spanish_outside for name, _, _ in ENGLISH]
        for found_on_page in wording:
            for found, text in found_on_page:
                if found == kind and text not in seen:
                    seen.append(text)
                    item(text)
    heading("Aviso sin conexión" if es else "Notice shown with no connection")
    item(offline_notices()[lang])
    for path in sorted((ROOT / "assets").glob("*.vcf")):
        if path.stem.endswith("-es") == es:
            heading(("Tarjeta de contacto que se guarda en el teléfono: " if es else "Contact card saved to a phone: ") + path.name)
            for key, text in card_fields(path):
                item(("Nombre: " if es else "Name: ") + text if key == "FN" else text)
    if not es:
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
        heading("Name and description when the site is added to a home screen")
        for key in ("name", "short_name", "description"):
            item(manifest[key])
    return blocks


def shared_blocks(names, lang="en"):
    """The crisis strip, header, panel, and footer: each different line once, with a note under any line that
    isn't on every page of the language saying which pages show it. A page that doesn't exist is skipped."""
    pages = [(packet_name(name), name, [block for block in read_page(name).blocks if block["classes"] & SHARED_CLASSES
                                        and not block["classes"] & {"footer-nav", "site-nav"}])
             for name in names if (ROOT / name).exists()]
    return listing(pages, lang)


# ---------------------------------------------------------------- small Markdown reader


def inline(text):
    text = esc(text)
    text = re.sub(r"!?\[\[([^\]|]+)\\?\|([^\]]+)\]\]", r"\2", text)
    text = re.sub(r"!?\[\[([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'\1 (<span class="url">\2</span>)', text)
    return text


def markdown(text):
    """Headings, paragraphs, bullets, and tables, which is all these notes use."""
    out = []
    table = []
    para = []
    bullets = []

    def flush():
        nonlocal para, bullets, table
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para = []
        if bullets:
            out.append("<ul>" + "".join(f"<li>{inline(b)}</li>" for b in bullets) + "</ul>")
            bullets = []
        if table:
            rows = [[c.strip() for c in re.split(r"(?<!\\)\|", row.strip().strip("|"))] for row in table]
            rows = [r for r in rows if not all(set(c) <= {"-", " ", ":"} for c in r)]
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>")
            table = []

    for raw in text.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if stripped.startswith("|"):
            if para or bullets:
                flush()
            table.append(stripped)
            continue
        if table:
            flush()
        if not stripped:
            flush()
            continue
        heading = re.match(r"(#{1,6})\s+(.*)", stripped)
        if heading:
            flush()
            level = min(len(heading.group(1)) + 2, 6)
            out.append(f"<h{level}>{inline(heading.group(2))}</h{level}>")
        elif re.match(r"(- \[[ x]\] |- |\d+\. )", stripped):
            if para:
                flush()
            bullets.append(re.sub(r"^(- \[[ x]\] |- |\d+\. )", "", stripped))
        elif stripped.startswith(">"):
            para.append(stripped.lstrip("> ").replace("[!warning]", ""))
        elif stripped.startswith("!["):
            continue
        else:
            if bullets and raw.startswith(" "):
                bullets[-1] += " " + stripped
            else:
                para.append(stripped)
    flush()
    return "\n".join(out)


def note_section(path, heading, stop_level=2):
    """The text of one section of a note, from its heading to the next one at the same level."""
    text = (ROOT / path).read_text(encoding="utf-8")
    pattern = re.compile(rf"^{'#' * stop_level} {re.escape(heading)}\s*$", re.M)
    match = pattern.search(text)
    if not match:
        raise SystemExit(f"{path}: no section called \"{heading}\"")
    rest = text[match.end():]
    end = re.search(rf"^#{{1,{stop_level}}} ", rest, re.M)
    return rest[: end.start()] if end else rest


def spanish_questions(text=None):
    """The questions for the fluent Spanish reader in notes/CONTENT-REVIEW.md, as (questions, problems). Each
    question is {"es", "en", "source"}: what the reader is asked, its English twin for the founders, and where
    it comes from. Only complete questions are returned. Each problem says what is missing, so
    tools/check_site.py can fail on it and this tool can refuse to build a packet that leaves one out.

    The section holds an introduction, then a numbered list in which each question has three lines, in order:
        1. ES: ¿...?
           EN: ...?
           Source: notes/SAFETY.md, ...
    A longer line goes on below it, indented."""
    text = (ROOT / "notes" / "CONTENT-REVIEW.md").read_text(encoding="utf-8") if text is None else text
    where = f'the "## {SPANISH_QUESTIONS}" section'
    match = re.search(rf"^## {re.escape(SPANISH_QUESTIONS)}\s*$", text, re.M)
    if not match:
        return [], [f'needs a "## {SPANISH_QUESTIONS}" section, which the Spanish packet shows in its Parte 5']
    rest = text[match.end():]
    end = re.search(r"^#{1,2} ", rest, re.M)
    body = rest[: end.start()] if end else rest
    problems = []
    if AI_TRANSLATION not in body:
        problems.append(f'{where} must say "{AI_TRANSLATION}", because no fluent reader has checked its Spanish')
    fields = []
    for line in body.splitlines():
        found = QUESTION_LINE.match(line)
        if found:
            fields.append([QUESTION_FIELDS[found.group(1)], (found.group(2) or "").strip()])
        elif fields and line.startswith(" ") and line.strip():
            fields[-1][1] = (fields[-1][1] + " " + line.strip()).strip()
        elif fields and line.strip():
            problems.append(f'{where} has a line that belongs to no question, after the list began: "{line.strip()[:60]}"')
    order = list(QUESTION_FIELDS.values())
    questions = []
    for key, value in fields:
        # A field that is already there, or comes before one that is, starts the next question.
        if not questions or key in questions[-1] or order.index(key) < max(order.index(k) for k in questions[-1]):
            questions.append({})
        questions[-1][key] = value
    missing = {"es": "Spanish, so the fluent reader would never be asked it",
               "en": "English twin, so the founders couldn't tell what was asked",
               "source": "source, so nobody could tell where it comes from"}
    for number, question in enumerate(questions, 1):
        start = next(question[key] for key in order if question.get(key) is not None)[:60]
        for key in order:
            if not question.get(key):
                problems.append(f'question {number} for the fluent Spanish reader has no {missing[key]}. It begins "{start}"')
        if question.get("es") and not SPANISH_SIGNS.search(question["es"]):
            problems.append(f'question {number} for the fluent Spanish reader has Spanish that doesn\'t look Spanish: "{start}"')
    if not questions:
        problems.append(f"{where} has no questions")
    return [question for question in questions if all(question.get(key) for key in order)], problems


def questions_part():
    """Parte 5 of the Spanish packet: each question in Spanish, its English twin, where it comes from, and room
    for an answer."""
    rows = []
    for number, question in enumerate(spanish_questions()[0], 1):
        rows.append('<div class="question">'
                    f'<p class="row"><span class="id">P-{number}</span> {inline(question["es"])}</p>'
                    f'<p class="twin" lang="en"><em>In English, for the founders:</em> {inline(question["en"])}</p>'
                    f'<p class="from">De dónde viene: <span lang="en">{inline(question["source"])}</span></p>'
                    '<span class="answer"></span></div>')
    return "\n".join(rows)


def brief_blocks():
    """The research brief's full text, as blocks to number."""
    text = note_section("notes/RESEARCH-BRIEF.md", "Full text of the brief")
    blocks = []
    for raw in text.split("\n\n"):
        chunk = " ".join(line.strip() for line in raw.splitlines()).strip()
        if not chunk:
            continue
        heading = re.match(r"(#{3,4})\s+(.*)", chunk)
        if heading:
            blocks.append({"tag": "h2" if len(heading.group(1)) == 3 else "h3", "text": heading.group(2), "links": [], "classes": set(), "ids": []})
        elif chunk.startswith("- "):
            for item in re.split(r"\s*(?:^|\s)- (?=\S)", chunk):
                if item.strip():
                    blocks.append({"tag": "li", "text": re.sub(r"[*`]", "", item).strip(), "links": [], "classes": set(), "ids": []})
        else:
            links = [{"text": url, "href": url} for url in re.findall(r"https?://\S+", chunk)]
            blocks.append({"tag": "p", "text": re.sub(r"[*`]", "", chunk), "links": links, "classes": set(), "ids": []})
    return blocks


# ---------------------------------------------------------------- the packets

STYLE = """
@page { size: letter; margin: 16mm 15mm 18mm; }
* { box-sizing: border-box; }
body { font: 10.5pt/1.42 Georgia, "Times New Roman", serif; color: #111; margin: 0; }
h1 { font-size: 26pt; margin: 0 0 6pt; line-height: 1.1; }
h2 { font-size: 17pt; margin: 0 0 8pt; break-before: page; border-bottom: 2px solid #315A45; padding-bottom: 4pt; color: #213B30; }
h2.first { break-before: auto; }
h3 { font-size: 13pt; margin: 14pt 0 4pt; color: #213B30; break-after: avoid; }
h4 { font-size: 11pt; margin: 10pt 0 3pt; break-after: avoid; }
h5, h6 { font-size: 10.5pt; margin: 8pt 0 2pt; break-after: avoid; }
p { margin: 0 0 5pt; }
ul { margin: 0 0 6pt; padding-left: 16pt; }
li { margin-bottom: 2pt; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 9pt; }
th, td { border: 1px solid #999; padding: 3pt 4pt; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
th { background: #EEF2EA; overflow-wrap: normal; }
.signoff td { overflow-wrap: normal; }
code { font: 8.5pt Menlo, Consolas, monospace; }
.lede { font-size: 12pt; }
.banner { border: 2px solid #60375E; padding: 8pt 10pt; margin: 10pt 0; }
.review-block { margin: 0 0 10pt; }
.row { display: block; margin: 0 0 3pt; padding-left: 52pt; text-indent: -52pt; }
.row.in-list { padding-left: 60pt; }
.row.in-list .id::after { content: " •"; }
.row.repeat { color: #555; font-size: 9.5pt; }
.row-heading { padding-left: 52pt; text-indent: -52pt; }
.id { display: inline-block; width: 50pt; text-indent: 0; font: 7.5pt/1 Menlo, Consolas, monospace; color: #333; }
.same { font: italic 8.5pt Georgia, serif; color: #555; }
.links { list-style: none; padding: 0; margin: 4pt 0 0 52pt; font-size: 8.5pt; color: #333; }
.url { font: 7.5pt Menlo, Consolas, monospace; overflow-wrap: anywhere; }
.decision { margin: 6pt 0 0; padding: 5pt 6pt; border: 1px solid #777; font: 9pt Arial, Helvetica, sans-serif; break-inside: avoid; }
.decision .line { display: block; margin-top: 8pt; padding-bottom: 14pt; border-bottom: 1px solid #999; }
.box { display: inline-block; width: 9pt; height: 9pt; border: 1px solid #111; margin: 0 2pt 0 8pt; vertical-align: -1pt; }
.signoff td { height: 24pt; }
.write { display: block; border-bottom: 1px solid #777; height: 22pt; }
.answer { display: block; border-bottom: 1px solid #999; height: 30pt; margin-bottom: 8pt; }
.urgent { border: 2px solid #111; padding: 8pt; break-inside: avoid; }
.small { font-size: 9pt; color: #333; }
.question { margin: 0 0 8pt; break-inside: avoid; }
.question .twin, .question .from, .question .answer { margin-left: 52pt; }
.question .twin { margin-bottom: 2pt; font-size: 9pt; color: #333; }
.question .from { margin-bottom: 0; font-size: 8.5pt; color: #555; }
@media screen { body { max-width: 820px; margin: 24px auto; padding: 0 16px; } }
"""


def document(title, body, style=STYLE):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{esc(title)}</title>
<style>{style}</style>
</head>
<body>
{body}
</body>
</html>
"""


# Any fixed day: the packet fingerprint leaves out the build date, but not how each packet writes a date.
FINGERPRINT_DAY = datetime.date(2000, 1, 1)
NO_STAMP = "-" * 12


def fingerprint():
    """The packet fingerprint: the first 12 characters of a SHA-256 hash of both packets, as this tool would
    write them now, with the build date and the fingerprint itself left out, and of what else makes the PDFs:
    the date in each month, make_pdf(), the browser's PDF settings, and each packet's name. So it changes when
    anything a packet shows changes, whether that comes from a page, a note, this file, or what this file reads
    from tools/check_site.py, and it stays the same for anything else, such as a test or another check."""
    import browser

    digest = hashlib.sha256()
    parts = [build(FINGERPRINT_DAY, NO_STAMP) for _, build, _ in PACKETS]
    parts += [f"{english_date(day)} | {spanish_date(day)}" for day in (datetime.date(2026, month, month) for month in range(1, 13))]
    parts += [inspect.getsource(make_pdf), inspect.getsource(browser.Tab.pdf), repr([(name, label) for name, _, label in PACKETS])]
    for part in parts:
        digest.update(part.encode("utf-8") + b"\0")
    return digest.hexdigest()[:12]


def signoff_table(rows, lang):
    """Rows are (section name, fingerprint), or a plain name for a part the publish step doesn't read."""
    rows = [row if isinstance(row, tuple) else (row, None) for row in rows]
    prints = any(fingerprint for _, fingerprint in rows)
    body = "".join(
        f"<tr><td>{esc(label)}</td>" + (f'<td><code>{esc(fingerprint)}</code></td>' if prints else "")
        + f"<td>{BOX}</td><td>{BOX}</td><td>{BOX}</td><td></td></tr>"
        for label, fingerprint in rows
    )
    print_head = ("<th>Huella</th>" if lang == "es" else "<th>Fingerprint</th>") if prints else ""
    if lang == "es":
        head = f"<tr><th>Sección</th>{print_head}<th>Aprobada</th><th>Aprobada con cambios</th><th>No para el sitio</th><th>Función de quien revisa y fecha</th></tr>"
    else:
        head = f"<tr><th>Section</th>{print_head}<th>Approved</th><th>Approved with changes</th><th>Not for the website</th><th>Reviewer's role and date</th></tr>"
    return f'<table class="signoff"><thead>{head}</thead><tbody>{body}</tbody></table>'


def signoff_rows(lang):
    """Each section the publish step reads, named as a review record may name it, with its fingerprint now."""
    return [(label, section_fingerprint(page, lang)) for label, page, _ in signoff_rows_named(lang)]


def therapist_packet(day, stamp):
    numbering = Numbering()
    counters = {}
    parts = []

    parts.append(f"""
<h1>Tidelight content review packet</h1>
<p class="lede">For a licensed therapist reviewing a draft suicide prevention website for adults and young people in the United States.</p>
<div class="banner"><strong>Draft. Not reviewed.</strong> An AI assistant drafted the website text, and one founder supplied the research brief. No licensed clinician has reviewed any of it, and none of it should be relied on until a review is recorded. Reviewer: not yet recorded. Review date: not yet recorded.</div>
<p class="small">Built {english_date(day)} from the website files and project notes. Packet fingerprint {stamp}. If the pages change, this packet must be rebuilt with <code>python3 tools/make_review_packet.py</code>, and numbers may change.</p>

<h2 class="first">How to use this packet</h2>
<p><strong>What's inside:</strong></p>
<ul>
<li>Part 1: Text that appears on every page</li>
<li>Part 2: Each English page, sentence by sentence, with its source links</li>
<li>Part 3: Wording outside the page text, such as what a screen reader says and the contact card</li>
<li>Part 4: The founder-supplied research brief</li>
<li>Part 5: Crisis resources, and what each button does</li>
<li>Part 6: Questions written for you</li>
<li>Part 7: How the research was read, and how the pages compare with the brief</li>
<li>Part 8: Proposed shorter sentences, optional</li>
<li>Part 9: Decisions and sign-off</li>
</ul>
<p>The Spanish pages are in a separate packet for a fluent reader. The Spanish lines on the English pages, such as the Spanish part of Get Help, appear here as part of each page. The fluent reader also checks their wording.</p>
<p><strong>How to record feedback:</strong></p>
<ul>
<li><strong>Mark each section.</strong> Each section ends with a box: OK as written, OK with changes, or Not for the website.</li>
<li><strong>Refer to sentences by number.</strong> Every sentence has a number, such as HELP-12. In the Notes line, write something like "HELP-12: change to ...". Writing on the page is fine.</li>
<li><strong>Repeated sentences.</strong> A gray sentence marked "same as" repeats an earlier one. A decision on the first applies to all of them.</li>
<li><strong>What a screen reader says.</strong> Part 1, and each page in Part 2, ends with what a screen reader reads aloud there that the screen doesn't show, such as the page's title, the full names of the crisis links, and the section name after each "Show more" button. Someone who can't see the screen hears these words, so please mark them like the rest.</li>
<li><strong>Answer the questions in Part 6</strong> if you can. Skip any that aren't yours to answer.</li>
<li><strong>Finish with Part 9.</strong> It records your decisions, your role, and the date. Please don't write personal contact details in this packet. It may be stored in a public project.</li>
</ul>
<p>You can use a pen on paper, or add notes to the PDF in a PDF app. Return it to the founder who gave it to you.</p>
<div class="urgent"><strong>If anything here could cause harm, please say so first.</strong> Use this box, or tell the founders right away, for anything that should come down or change before anything else happens.<span class="answer"></span><span class="answer"></span></div>
<p class="small" style="margin-top:8pt">You can see the draft website on a screen if you meet a founder in person. Otherwise this packet is how to read it. The draft pages are not on the public website yet. Parts of an older version are public at {PREVIEW}.</p>
""")

    parts.append("<h2>Part 1: Text that appears on every page</h2>")
    parts.append("<p>The crisis strip, header, crisis buttons, and footer. Each page has one version of these. Different wording on different pages is listed here once, and a line that isn't on every page says which pages show it, so a line that changes on one page changes this section too. The last list is what a screen reader reads aloud in these parts that the screen doesn't show.</p>")
    parts.append(render_blocks(section_blocks(EVERY_PAGE["en"], "en"), "SHARED", numbering, counters, "en"))

    parts.append("<h2>Part 2: English pages</h2>")
    parts.append("<p>Text from the crisis strip, header, crisis buttons, and footer is in Part 1. Folded sections are shown open. Links show their full address, so they can be checked from paper. Each page ends with what a screen reader reads aloud on it that the screen doesn't show, starting with the page's title.</p>")
    for name, prefix, label in ENGLISH:
        address = "" if name == "404.html" else name.replace("index.html", "")
        parts.append(f"<h3>Page: {esc(label)}</h3><p class=\"small\">Address once published: {esc(PREVIEW + address) if name != '404.html' else 'shown for any address that does not exist'}. Numbers start with {prefix}.</p>")
        parts.append(render_blocks(section_blocks(name, "en"), prefix, numbering, counters, "en"))

    parts.append("<h2>Part 3: Wording outside the page text</h2>")
    parts.append("<p>People meet this wording outside the text of each page: a page's description in search results and link previews, the names a screen reader says for links and areas, the notice shown with no connection, the contact card saved to a phone, and the name used when the site is added to a home screen.</p>")
    parts.append(render_blocks(section_blocks(OUTSIDE_TEXT["en"], "en"), "OUTSIDE", numbering, counters, "en"))

    parts.append("<h2>Part 4: Research brief</h2>")
    parts.append("<p>A founder supplied this brief. The first drafts of Get Help, Help Someone, and Research were written separately from it. The Not sure page uses Pathway A's heading, opening paragraph, and prompt word for word. Please read both. The unchanged PDF is in the project at <code>notes/attachments/research-and-website-copy-2026-11.pdf</code>.</p>")
    parts.append(render_blocks(brief_blocks(), "BRIEF", numbering, counters, "en"))
    parts.append("<h3>Tracker for the brief</h3>")
    parts.append(markdown(note_section("notes/RESEARCH-BRIEF.md", "Review tracker")))

    parts.append("<h2>Part 5: Crisis resources and what each button does</h2>")
    parts.append("<p>An AI assistant read these on each provider's page. No person has confirmed them. No call, text, or chat was placed.</p>")
    parts.append("<h3>Crisis resources</h3>")
    parts.append(markdown(note_section("notes/SAFETY.md", "U.S. crisis resources")))
    parts.append("<h3>What each control does</h3>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "What each control does")))

    parts.append("<h2>Part 6: Questions written for you</h2>")
    parts.append("<p>These are suggestions from an AI assistant, not decisions. Use the blank lines, or write on the notes pages at the end.</p>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions for the qualified reviewer")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the approved ideas")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the second batch")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the first-version additions")))
    parts.append("<h3>Questions from the November 7 audit</h3>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions from the November 7 audit")))
    parts.append("<h3>Questions about the research brief</h3>")
    parts.append(markdown(note_section("notes/RESEARCH-BRIEF.md", "Questions for the reviewer from Claude")))
    parts.append('<h3>Your answers</h3>' + '<span class="answer"></span>' * 14)

    parts.append("<h2>Part 7: How the research was read</h2>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "How each finding was read")))
    parts.append("<h3>How the pages compare with the research brief</h3>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "How the pages compare with the research brief")))

    parts.append("<h2>Part 8: Proposed shorter sentences</h2>")
    parts.append("<p>Optional. These are AI-drafted rewrites of the longest sentences. The pages have not changed. Mark any you accept.</p>")
    shorter = (ROOT / "notes" / "SHORTER-SENTENCES.md").read_text(encoding="utf-8")
    parts.append(markdown("## " + shorter.split("## ", 1)[1]))

    parts.append("<h2>Part 9: Decisions and sign-off</h2>")
    parts.append("<p>Please record your role and the date, such as \"licensed clinical social worker, November 2026\". Please don't write your name, license number, or contact details here. The founders will keep any such record outside the project.</p>")
    parts.append("<p><strong>What the fingerprint is.</strong> Each website section below has a fingerprint: a 12-character code made from that section's text, exactly as this packet shows it. If even one word of the section changes later, its fingerprint changes. The website can go public only while each section's approval carries the fingerprint of its current text. So if a page changes after you approve it, your approval stops counting until you have seen the change and the founders record it again. You don't need to do anything with the fingerprints yourself.</p>")
    tracker = re.findall(r"^\| ([^|]+?) \| [^|]+ \| Not reviewed", note_section("notes/RESEARCH-BRIEF.md", "Review tracker"), re.M)
    parts.append("<h3>The website</h3>" + signoff_table(signoff_rows("en"), "en"))
    parts.append("<h3>The research brief</h3>" + signoff_table(["Brief: " + t for t in tracker], "en"))
    parts.append("""<h3>Overall</h3>
<p>Is this site safe to show the public with the changes you asked for? <span class="box"></span> Yes <span class="box"></span> Yes, after the changes are made and I have seen them <span class="box"></span> No <span class="box"></span> Not my call</p>
<p>Anything else the founders should know, including who else should review this:</p>
<span class="answer"></span><span class="answer"></span><span class="answer"></span>
<p><strong>Reviewer's role:</strong><span class="write"></span></p>
<p><strong>Date:</strong><span class="write"></span></p>
<h3>For the founders, after the review</h3>
<ul>
<li>Copy each result into "Review records" in <code>notes/CONTENT-REVIEW.md</code>, one line per section, in this form, ending with the fingerprint printed beside that section above: "- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6". Use the section name exactly as the table prints it, and the date as YYYY-MM-DD.</li>
<li>Only "approved", or "approved with changes, changes made", lets the site publish, and only from a licensed mental health professional, such as a licensed clinical social worker, LPC, LMHC, LMFT, psychologist, psychiatrist, or psychiatric nurse practitioner. For each section, the newest line from such a reviewer decides.</li>
<li>If you make changes the reviewer asked for, the section's fingerprint changes. Rebuild the packet, show the reviewer the changes, and add a new line with the new fingerprint. An approval whose fingerprint doesn't match the current text doesn't count, and publishing stops.</li>
<li>Reviews by anyone else, such as a lawyer or someone with lived experience, go under "Other reviews" in the same note. The publish step doesn't read them.</li>
<li>Also fill in the tracker in <code>notes/RESEARCH-BRIEF.md</code>. Use the role and date only.</li>
<li>Make the changes on a task branch, and show the reviewer anything that changed a safety message.</li>
<li>Update the review list on the About pages. Remove a page's draft note only after its review is recorded.</li>
<li>Keep any signed copy with personal details outside this public project.</li>
</ul>""")
    parts.append("<h2>Notes</h2>" + '<span class="answer"></span>' * 16)
    return document("Tidelight content review packet", "\n".join(parts))


def spanish_packet(day, stamp):
    numbering = Numbering()
    counters = {}
    parts = []
    parts.append(f"""
<h1>Tidelight: paquete de revisión en español</h1>
<p class="lede">Para una persona hispanohablante que revise la traducción de un sitio web preliminar sobre la prevención del suicidio. For a fluent Spanish reader.</p>
<div class="banner"><strong>Borrador sin revisar.</strong> Un asistente de IA redactó el texto en inglés y lo tradujo al español. Ninguna persona hispanohablante lo ha revisado, y ningún profesional clínico ha revisado todavía la versión en inglés. Quien revisa: sin registrar. Fecha de revisión: sin registrar.</div>
<p class="small">Generado el {spanish_date(day)} a partir de los archivos del sitio. Huella del paquete {stamp}. Si las páginas cambian, hay que generar este paquete de nuevo con <code>python3 tools/make_review_packet.py</code>.</p>

<h2 class="first">Cómo usar este paquete</h2>
<ul>
<li><strong>Revise cada sección.</strong> Cada sección termina con un recuadro: bien así, bien con cambios, o no para el sitio.</li>
<li><strong>Use los números.</strong> Cada oración tiene un número, como E-HELP-12. En las notas, escriba por ejemplo "E-HELP-12: cambiar a ...".</li>
<li><strong>Oraciones repetidas.</strong> Una oración en gris marcada "same as" repite otra anterior. Lo que decida sobre la primera vale para todas.</li>
<li><strong>Líneas en español de las páginas en inglés.</strong> Las páginas en inglés tienen algunas líneas en español. Están en la Parte 3, y también necesitan su decisión.</li>
<li><strong>Lo que lee un lector de pantalla.</strong> La Parte 1 y cada página de la Parte 2 terminan con lo que lee en voz alta un lector de pantalla y no se ve en pantalla, como el título de la página, el nombre completo de los enlaces de crisis y el nombre de la sección después de cada «Ver más». Quien no ve la pantalla oye estas palabras, así que también necesitan su decisión.</li>
<li><strong>Preguntas que importan.</strong> ¿Se entiende? ¿Suena natural? ¿Cambia el sentido del inglés? ¿Hay algo que pueda confundir a alguien en crisis? ¿Debería evitarse alguna forma solo masculina, como "No estás solo"?</li>
<li><strong>Preguntas para usted.</strong> La Parte 5 tiene preguntas escritas para usted, cada una con su versión en inglés para los fundadores. Conteste las que pueda.</li>
<li><strong>Datos de contacto.</strong> Por favor, no escriba su nombre ni sus datos personales en este paquete, porque puede guardarse en un proyecto público.</li>
</ul>
<div class="urgent"><strong>Si algo puede causar daño, dígalo primero.</strong> Use este recuadro, o avise de inmediato a los fundadores.<span class="answer"></span><span class="answer"></span></div>
<p class="small" style="margin-top:8pt">Los datos de crisis en español salen de la tabla de recursos del proyecto, leída en el sitio de cada proveedor por un asistente de IA. Nadie ha llamado ni enviado textos para comprobarlos, y no debe hacerse.</p>
""")
    parts.append("<h2>Parte 1: Texto que aparece en cada página</h2>")
    parts.append("<p>La franja de crisis, el encabezado, los botones de crisis y el pie de página. Cada página tiene una versión de estas partes, y cada texto distinto aparece aquí una vez. Una línea que no está en todas las páginas dice en cuáles está, así que una línea que cambia en una sola página también cambia esta sección. La última lista es lo que lee en voz alta un lector de pantalla en estas partes y no se ve en pantalla.</p>")
    parts.append(render_blocks(section_blocks(EVERY_PAGE["es"], "es"), "E-SHARED", numbering, counters, "es"))
    parts.append("<h2>Parte 2: Páginas en español</h2>")
    parts.append("<p>Las secciones plegadas se muestran abiertas. Los enlaces muestran la dirección completa. La versión en inglés de cada página está en el otro paquete. Cada página termina con lo que lee en voz alta un lector de pantalla y no se ve en pantalla, empezando por el título de la página.</p>")
    for name, prefix, label, english in SPANISH:
        address = name.replace("index.html", "")
        parts.append(f"<h3>Página: {esc(label)}</h3><p class=\"small\">Dirección cuando se publique: {esc(PREVIEW + address)}. En inglés: {esc(PREVIEW + (english if english != 'index.html' else ''))}. Los números empiezan con {prefix}.</p>")
        parts.append(render_blocks(section_blocks(name, "es"), prefix, numbering, counters, "es"))
    parts.append("<h2>Parte 3: Líneas en español de las páginas en inglés</h2>")
    parts.append("<p>Las páginas en inglés tienen algunas líneas en español para quien habla español, como el enlace «Leer en español» y los datos de la Línea 988 en español. Aquí aparecen sin el texto en inglés que las rodea. Una línea en inglés con algunas palabras en español aparece entera. Cada sección tiene su propia huella en la Parte 6. La versión completa de cada página en inglés está en el otro paquete.</p>")
    for name, prefix, label in SPANISH_ON_ENGLISH:
        address = name if name == "404.html" else PREVIEW + name.replace("index.html", "")
        where = [] if name == SPANISH_ON_EVERY_PAGE else [f"Solo las líneas en español de una página en inglés ({address})."]
        about = " ".join(where + [SPANISH_ON_ENGLISH_NOTES.get(name, ""), f"Los números empiezan con {prefix}."])
        parts.append(f"<h3>{esc(label)}</h3><p class=\"small\">{esc(re.sub(' +', ' ', about))}</p>")
        parts.append(render_blocks(section_blocks(name, "es"), prefix, numbering, counters, "es"))
    parts.append("<h2>Parte 4: Texto fuera de las páginas</h2>")
    parts.append("<p>Este texto aparece fuera del texto de cada página: la descripción en buscadores y vistas previas de enlaces, los nombres que dice un lector de pantalla, el aviso sin conexión y la tarjeta de contacto que se guarda en el teléfono.</p>")
    parts.append(render_blocks(section_blocks(OUTSIDE_TEXT["es"], "es"), "E-OUTSIDE", numbering, counters, "es"))
    parts.append("<h2>Parte 5: Preguntas para usted</h2>")
    parts.append("<p>Un asistente de IA reunió estas preguntas a partir de lo que las notas del proyecto dejan abierto sobre el español, y las escribió en español. <strong>Traducción de IA sin revisar:</strong> ninguna persona hispanohablante ha revisado estas preguntas. Después de cada una va su versión en inglés, para los fundadores, y de dónde viene. Preguntan por la redacción. Los hechos solo puede confirmarlos alguien que se lo pregunte al proveedor, y nadie debe llamar, enviar textos ni chatear con una línea de crisis para comprobarlos. Conteste las que pueda, en las líneas o en las notas del final. Los números empiezan con P.</p>")
    parts.append(questions_part())
    parts.append("<h2>Parte 6: Decisiones y firma</h2>")
    parts.append("<p>Anote su función y la fecha, por ejemplo \"hablante nativa de español, traductora médica, noviembre de 2026\". Por favor, no escriba su nombre ni sus datos de contacto.</p>")
    parts.append("<p><strong>Qué es la huella.</strong> Cada sección tiene una huella: un código de 12 caracteres hecho a partir del texto de esa sección, tal como aparece en este paquete. Si cambia una sola palabra de la sección, su huella cambia. El sitio solo puede hacerse público mientras la aprobación de cada sección lleve la huella de su texto actual. Si una página cambia después de que usted la apruebe, su aprobación deja de contar hasta que vea el cambio y los fundadores la anoten de nuevo. Usted no tiene que hacer nada con las huellas.</p>")
    parts.append(signoff_table(signoff_rows("es"), "es"))
    parts.append("""<p>Otros comentarios:</p><span class="answer"></span><span class="answer"></span><span class="answer"></span>
<p><strong>Función de quien revisa:</strong><span class="write"></span></p>
<p><strong>Fecha:</strong><span class="write"></span></p>""")
    parts.append("""<h3>For the founders, after the review</h3>
<ul>
<li>Copy each result into "Review records" in <code>notes/CONTENT-REVIEW.md</code>, one line per section, in this form, ending with the fingerprint (huella) printed beside that section above: "- Obtener ayuda: native Spanish speaker, 2026-12-01, approved, a1b2c3d4e5f6". Use the section name exactly as the table prints it, the date as YYYY-MM-DD, and the result in English.</li>
<li>The Spanish lines on the English pages, in Part 3, have sections of their own, such as "Español en Get Help". Each needs its own line too, and only a fluent Spanish reader's line counts for them, never the clinician's.</li>
<li>Only a fluent or native Spanish reader counts here, such as "fluent Spanish reader", "native Spanish speaker", "hablante nativa de español" or "persona hispanohablante". Machine translation, AI, or translation software never counts. For each section, the newest line from such a reader decides.</li>
<li>An approval whose fingerprint doesn't match the current text doesn't count, and publishing stops. After any change, rebuild the packet, show the reader the change, and add a new line with the new fingerprint.</li>
</ul>
""")
    parts.append("<h2>Notas</h2>" + '<span class="answer"></span>' * 16)
    html_text = document("Tidelight: paquete de revisión en español", "\n".join(parts))
    return html_text.replace('<html lang="en">', '<html lang="es">', 1)


def make_pdf(html_path, pdf_path, label):
    from browser import Browser, Tab

    browser = Browser()
    try:
        tab = Tab(browser, 1000, 1200, False, scale=1)
        tab.goto(html_path.resolve().as_uri())
        footer = (
            '<div style="font: 8px Arial, sans-serif; width: 100%; padding: 0 15mm; color: #444; display: flex; justify-content: space-between;">'
            f'<span>{esc(label)}. Draft. No clinician has reviewed this.</span>'
            '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>'
        )
        tab.pdf(pdf_path, footer=footer)
    finally:
        browser.close()


# Each packet: its file name, how it is built, and the label in its PDF's footer.
PACKETS = (
    ("tidelight-review-packet", therapist_packet, "Tidelight content review packet"),
    ("tidelight-spanish-review-packet", spanish_packet, "Tidelight Spanish review packet"),
)


# ---------------------------------------------------------------- what changed since each reviewer's approvals

# Each "what changed" packet: its file name, the reviewer's sections ("en" for the licensed clinician, "es" for the
# fluent Spanish reader), and the label in its PDF's footer. Built only with --changes, and never committed:
# .gitignore leaves them out, because they depend on the review records and the text at the time they are built.
CHANGE_PACKETS = (
    ("tidelight-review-changes", "en", "Tidelight: what changed since the clinical review"),
    ("tidelight-spanish-review-changes", "es", "Tidelight: qué cambió desde la revisión en español"),
)
# What a section's text depends on, so the only commits worth reading: the pages, what the packets read from
# assets/ and manifest.webmanifest, and the two tools that turn them into sections.
HISTORY_PATHS = ("*.html", "assets", "manifest.webmanifest", "tools/make_review_packet.py", "tools/check_site.py")
# Left out of each copy read from history: nothing a section shows comes from them, and they are large.
HISTORY_SKIP = ("notes/review-packet", "notes/attachments", "notes/worklogs", "assets/images", "design")
# Run in a copy of the project, with that copy's tools: prints each section's fingerprint and its text as plain
# lines, as JSON. It reads only the keys every version of this tool has given its blocks, so an older version's
# tool can run it too. Each line is a block's words, a heading or list mark first, then each link and any note
# saying which pages show it.
SECTION_SCRIPT = r'''
import json, sys
sys.path.insert(0, "tools")
import make_review_packet as tool
found = {}
for page, lang in json.loads(sys.argv[1]):
    try:
        lines = []
        for block in tool.section_blocks(page, lang):
            mark = "Heading: " if block["tag"] in ("h1", "h2", "h3", "h4", "h5", "h6") else "- " if block["tag"] == "li" else ""
            lines.append(mark + block["text"])
            lines.extend("    Link: %s -> %s" % (link["text"], link["href"]) for link in block.get("links", []))
            if block.get("where"):
                lines.append("    (%s)" % block["where"])
        found[page + "|" + lang] = {"fingerprint": tool.section_fingerprint(page, lang), "lines": lines}
    except Exception as error:  # an older tool, or a page that didn't exist yet
        found[page + "|" + lang] = {"error": repr(error)[:300]}
print(json.dumps(found))
'''
CHANGE_WORDS = {
    "en": {
        "title": "What changed since your review",
        "lede": "For the licensed therapist: only the sections of the Tidelight review packet whose text changed after your newest recorded approval.",
        "banner": "<strong>Draft. Not reviewed.</strong> This short packet doesn't replace the full one. It shows each section's approved text and its text now, with the differences marked. The full packet has every sentence with its number and sources.",
        "built": "Built {day} from the website files, the review records in notes/CONTENT-REVIEW.md, and the project's history.",
        "legend": "How the differences are marked: <del>words taken out</del> are struck through, and <ins>words added</ins> are underlined in bold. Unchanged lines between changes are skipped, and the full packet has them.",
        "none": "No section has changed since its newest approval.",
        "approved": "Approved on {date} (reviewer: {role}), with the fingerprint {old}. Its fingerprint now is {new}.",
        "newer": "A newer record, from {date}, isn't an approval. This compares the text with the approval above.",
        "found": "Approved text: as of commit {commit}, from {date}. It is the newest commit in the project's history that changed the site or the packet tool and gives this section that fingerprint.",
        "found_old_tool": " That fingerprint was made by the packet tool of that time. Both columns below show the text the way the packet tool shows it now.",
        "same_words": "The words and links are the same as approved. The fingerprint changed because the packet tool now shows this section differently, so the approval still has to be recorded again.",
        "not_found": "The approved text wasn't found: {why}. Here is the text now. Please read it in full.",
        "why_no_git": "this copy of the project has no git history",
        "why_none": "none of the {count} commits read gives this section the fingerprint {old}, so it may have been copied wrongly into the review record, or come from a branch this copy doesn't have",
        "side_old": "Approved text",
        "side_new": "Text now",
        "skipped": "{count} unchanged lines",
        "unchanged": "Unchanged since your newest approval",
        "unapproved": "No approval recorded yet, so please read these in the full packet",
        "no_print": "Approved without a fingerprint, so the approved text can't be found. Please read these in the full packet",
        "signoff": "Sign-off for the changed sections",
        "signoff_note": "Each changed section's new fingerprint is printed beside it. Record the result in \"Review records\" in notes/CONTENT-REVIEW.md as before, with the new fingerprint.",
    },
    "es": {
        "title": "Qué cambió desde su revisión",
        "lede": "Para la persona hispanohablante: solo las secciones del paquete en español de Tidelight cuyo texto cambió después de su aprobación más reciente.",
        "banner": "<strong>Borrador sin revisar.</strong> Este paquete corto no reemplaza al completo. Muestra el texto aprobado de cada sección y su texto actual, con las diferencias marcadas. El paquete completo tiene cada oración con su número.",
        "built": "Generado el {day} a partir de los archivos del sitio, los registros de revisión de notes/CONTENT-REVIEW.md y el historial del proyecto.",
        "legend": "Cómo se marcan las diferencias: <del>las palabras que se quitaron</del> van tachadas, y <ins>las que se agregaron</ins>, subrayadas en negrita. Las líneas sin cambios entre los cambios se omiten; están en el paquete completo.",
        "none": "Ninguna sección ha cambiado desde su aprobación más reciente.",
        "approved": "Aprobada el {date} (quien revisó: {role}), con la huella {old}. Su huella actual es {new}.",
        "newer": "Un registro más reciente, del {date}, no es una aprobación. Aquí se compara el texto con la aprobación de arriba.",
        "found": "Texto aprobado: el del commit {commit}, del {date}. Es el commit más reciente del historial del proyecto que cambió el sitio o la herramienta del paquete y le da a esta sección esa huella.",
        "found_old_tool": " Esa huella la hizo la herramienta del paquete de ese momento. Las dos columnas de abajo muestran el texto como lo muestra ahora la herramienta del paquete.",
        "same_words": "Las palabras y los enlaces son los mismos que se aprobaron. La huella cambió porque la herramienta del paquete ahora muestra esta sección de otra forma, así que la aprobación tiene que anotarse de nuevo.",
        "not_found": "No se encontró el texto aprobado: {why}. Este es el texto actual. Léalo completo, por favor.",
        "why_no_git": "esta copia del proyecto no tiene historial de git",
        "why_none": "ninguno de los {count} commits leídos le da a esta sección la huella {old}, así que puede haberse copiado mal en el registro, o venir de una rama que esta copia no tiene",
        "side_old": "Texto aprobado",
        "side_new": "Texto actual",
        "skipped": "{count} líneas sin cambios",
        "unchanged": "Sin cambios desde su aprobación más reciente",
        "unapproved": "Sin aprobación registrada todavía, así que léalas en el paquete completo",
        "no_print": "Aprobadas sin huella, así que no se puede encontrar el texto aprobado. Léalas en el paquete completo",
        "signoff": "Firma de las secciones que cambiaron",
        "signoff_note": "Junto a cada sección que cambió va su huella nueva. Los fundadores anotan el resultado en \"Review records\" de notes/CONTENT-REVIEW.md, como antes, con la huella nueva.",
    },
}
CHANGES_STYLE = STYLE + """
del { text-decoration: line-through; background: #FBE3E3; color: #5A1010; }
ins { text-decoration: underline; font-weight: bold; background: #E1F2E3; color: #0E3D1A; }
.compare td { width: 50%; font-size: 9pt; }
.compare p { margin: 0 0 3pt; white-space: pre-wrap; }
.compare .gap { font-style: italic; color: #555; }
"""


def git(*args, cwd=None, data=False):
    """Runs git in the project, or in cwd, and returns its output, or None if git isn't there or fails."""
    try:
        done = subprocess.run(["git", *args], cwd=cwd or ROOT, capture_output=True, text=not data)
    except OSError:
        return None
    return done.stdout if done.returncode == 0 else None


def newest_approvals(records, page, lang):
    """(the newest approval of a section by the kind of reviewer it needs, the newest record of any result by that
    kind of reviewer). Records by anyone else, such as a lawyer, are left out, as the publish step leaves them out."""
    from check_site import latest_review

    mine = [r for r in records if r["page"] == page and r["lang"] == lang and lang in r["kinds"] and r["approved"]]
    return (max(mine, key=lambda r: (r["date"], r["index"])) if mine else None), latest_review(records, page, lang)


def section_states(folder, sections):
    """{(page, lang): {"fingerprint": ..., "lines": [...]}} for the project in folder, as its own tools see it."""
    done = subprocess.run([sys.executable, "-c", SECTION_SCRIPT, json.dumps(sections)], cwd=folder,
                          capture_output=True, text=True)
    try:
        found = json.loads(done.stdout)
    except ValueError:
        return {}
    return {tuple(key.split("|", 1)): value for key, value in found.items() if "fingerprint" in value}


class History:
    """Reads the sections' text at older commits, newest first, each commit once. At each commit it asks both
    that commit's own packet tool, which made the fingerprints reviewers saw then, and this one, so the text
    compares line for line with the text now."""

    def __init__(self, sections):
        self.sections = [list(section) for section in sections]
        listed = git("rev-list", "--full-history", "HEAD", "--", *HISTORY_PATHS)
        self.commits = listed.split() if listed is not None else None
        self.read = {}

    def state(self, commit):
        if commit not in self.read:
            self.read[commit] = self._state(commit)
        return self.read[commit]

    def _state(self, commit):
        archive = git("archive", "--format=tar", commit, "--", ".", *(f":(exclude){path}" for path in HISTORY_SKIP), data=True)
        if archive is None:
            return {"own": {}, "now": {}}
        with tempfile.TemporaryDirectory(prefix="tidelight-history-") as folder:
            own = pathlib.Path(folder) / "own"
            with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
                tar.extractall(own)  # the project's own history, read from its own git
            found = {"own": section_states(own, self.sections)}
            now = pathlib.Path(folder) / "now"
            shutil.copytree(own, now)
            (now / "tools").mkdir(exist_ok=True)  # an early commit may have no tools at all
            for tool in TOOLS.glob("*.py"):
                shutil.copy2(tool, now / "tools" / tool.name)
            found["now"] = section_states(now, self.sections)
        return found

    def find(self, page, lang, wanted):
        """(commit, its date, lines, True if only that commit's own tool gave the fingerprint), or None: the
        newest commit at which the section has the fingerprint wanted. The lines are that commit's text as this
        tool shows it, so they compare line for line with the text now, or, if this tool can't read that commit,
        as that commit's own tool showed it."""
        for commit in self.commits or []:
            state = self.state(commit)
            for which in ("now", "own"):
                found = state[which].get((page, lang))
                if found and found["fingerprint"] == wanted:
                    date = (git("show", "-s", "--format=%cs", commit) or "").strip()
                    shown = state["now"].get((page, lang)) or found
                    return commit, date, shown["lines"], which == "own"
        return None


def marked_words(old, new):
    """Two lines as HTML, with the words taken out of the first and added to the second marked."""
    a, b = old.split(" "), new.split(" ")
    left, right = [], []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            left.append(esc(" ".join(a[i1:i2])))
            right.append(esc(" ".join(b[j1:j2])))
            continue
        if i2 > i1:
            left.append(f"<del>{esc(' '.join(a[i1:i2]))}</del>")
        if j2 > j1:
            right.append(f"<ins>{esc(' '.join(b[j1:j2]))}</ins>")
    return " ".join(left), " ".join(right)


def compare_lines(old, new, lang, context=2):
    """A two-column table of the approved lines and the lines now, with the differences marked and runs of
    unchanged lines between them skipped. Returns "" when the lines are the same."""
    if old == new:
        return ""
    rows = []
    matcher = difflib.SequenceMatcher(None, old, new, autojunk=False)
    groups = list(matcher.get_grouped_opcodes(context))
    shown_until = 0
    for group in groups:
        start = group[0][1]
        if start > shown_until:
            gap = CHANGE_WORDS[lang]["skipped"].format(count=start - shown_until)
            rows.append((f'<p class="gap">{esc(gap)}</p>', f'<p class="gap">{esc(gap)}</p>'))
        left, right = [], []
        for op, i1, i2, j1, j2 in group:
            if op == "equal":
                left += [esc(line) for line in old[i1:i2]]
                right += [esc(line) for line in new[j1:j2]]
                continue
            pairs = min(i2 - i1, j2 - j1) if op == "replace" else 0
            for k in range(pairs):
                a, b = marked_words(old[i1 + k], new[j1 + k])
                left.append(a)
                right.append(b)
            left += [f"<del>{esc(line)}</del>" for line in old[i1 + pairs:i2]]
            right += [f"<ins>{esc(line)}</ins>" for line in new[j1 + pairs:j2]]
        rows.append(("".join(f"<p>{line}</p>" for line in left), "".join(f"<p>{line}</p>" for line in right)))
        shown_until = group[-1][2]
    if shown_until < len(old):
        gap = CHANGE_WORDS[lang]["skipped"].format(count=len(old) - shown_until)
        rows.append((f'<p class="gap">{esc(gap)}</p>', f'<p class="gap">{esc(gap)}</p>'))
    words = CHANGE_WORDS[lang]
    body = "".join(f"<tr><td>{a}</td><td>{b}</td></tr>" for a, b in rows)
    return (f'<table class="compare"><thead><tr><th>{esc(words["side_old"])}</th><th>{esc(words["side_new"])}</th>'
            f"</tr></thead><tbody>{body}</tbody></table>")


def changes_packet(lang, day, records, history):
    """The "what changed" packet for one reviewer, as HTML."""
    from check_site import review_sections

    words = CHANGE_WORDS[lang]
    named = {page: label for label, page, section_lang in signoff_rows_named(lang)}
    now = section_states(ROOT, [[page, lang] for _, page, section_lang in review_sections() if section_lang == lang])
    parts = [f"<h1>{esc(words['title'])}</h1>", f'<p class="lede">{esc(words["lede"])}</p>',
             f'<div class="banner">{words["banner"]}</div>',
             f'<p class="small">{esc(words["built"].format(day=spanish_date(day) if lang == "es" else english_date(day)))}</p>',
             f"<p>{words['legend']}</p>"]
    changed, unchanged, unapproved, no_print = [], [], [], []
    for label, page, section_lang in review_sections():
        if section_lang != lang:
            continue
        approval, newest = newest_approvals(records, page, lang)
        current = now.get((page, lang))
        if not approval:
            unapproved.append(named.get(page, label))
        elif not approval["fingerprint"]:
            no_print.append(named.get(page, label))
        elif current and approval["fingerprint"] == current["fingerprint"]:
            unchanged.append(named.get(page, label))
        else:
            changed.append((named.get(page, label), page, approval, newest, current))
    if not changed:
        parts.append(f"<p><strong>{esc(words['none'])}</strong></p>")
    for name, page, approval, newest, current in changed:
        lines_now = current["lines"] if current else []
        parts.append(f'<section class="review-block"><h3>{esc(name)}</h3>')
        parts.append(f'<p class="small">{esc(words["approved"].format(date=approval["date"].isoformat(), role=approval["role"], old=approval["fingerprint"], new=current["fingerprint"] if current else "-"))}</p>')
        if newest and newest is not approval and not newest["approved"]:
            parts.append(f'<p class="small">{esc(words["newer"].format(date=newest["date"].isoformat()))}</p>')
        found = None if history.commits is None else history.find(page, lang, approval["fingerprint"])
        if found:
            commit, date, lines, old_tool = found
            parts.append(f'<p class="small">{esc(words["found"].format(commit=commit[:7], date=date) + (words["found_old_tool"] if old_tool else ""))}</p>')
            table = compare_lines(lines, lines_now, lang)
            parts.append(table or f"<p>{esc(words['same_words'])}</p>")
        else:
            why = words["why_no_git"] if history.commits is None else words["why_none"].format(count=len(history.commits), old=approval["fingerprint"])
            parts.append(f"<p><strong>{esc(words['not_found'].format(why=why))}</strong></p>")
            parts.append('<div class="compare">' + "".join(f"<p>{esc(line)}</p>" for line in lines_now) + "</div>")
        parts.append(decision(lang) + "</section>")
    for heading, names in (("unchanged", unchanged), ("no_print", no_print), ("unapproved", unapproved)):
        if names:
            parts.append(f"<h3>{esc(words[heading])}</h3><ul>" + "".join(f"<li>{esc(name)}</li>" for name in names) + "</ul>")
    if changed:
        rows = [(name, current["fingerprint"] if current else "-") for name, _, _, _, current in changed]
        parts.append(f"<h3>{esc(words['signoff'])}</h3><p>{esc(words['signoff_note'])}</p>" + signoff_table(rows, lang))
    html_text = document(words["title"], "\n".join(parts), CHANGES_STYLE)
    return html_text.replace('<html lang="en">', '<html lang="es">', 1) if lang == "es" else html_text


def signoff_rows_named(lang):
    """(the name a sign-off table prints for a section, its page, its language), for the sections of one language."""
    from check_site import review_sections

    part = {EVERY_PAGE["en"]: " (Part 1)", OUTSIDE_TEXT["en"]: " (Part 3)",
            EVERY_PAGE["es"]: " (Parte 1)", OUTSIDE_TEXT["es"]: " (Parte 4)"}
    return [(label + part.get(page, ""), page, section_lang) for label, page, section_lang in review_sections()
            if section_lang == lang]


def build_changes(no_pdf, today=None):
    """Writes the "what changed" packets, and changes nothing else, in the files or in git."""
    from check_site import read_review_records, review_records

    lines = review_records()
    if lines is None:
        raise SystemExit("notes/CONTENT-REVIEW.md has no \"## Review records\" section, so there is nothing to compare.")
    records, unreadable = read_review_records(lines)
    for line, why in unreadable:
        print(f"NOTE: this review record is left out, because {why}: {line}")
    day = today or datetime.date.today()
    history = History([(page, lang) for _, page, lang in signoff_rows_named("en") + signoff_rows_named("es")])
    if history.commits is None:
        print("NOTE: this copy of the project has no git history, so the approved text can't be found.")
    OUT.mkdir(parents=True, exist_ok=True)
    for name, lang, label in CHANGE_PACKETS:
        path = OUT / f"{name}.html"
        path.write_text(changes_packet(lang, day, records, history), encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)}")
        if not no_pdf:
            pdf = OUT / f"{name}.pdf"
            make_pdf(path, pdf, label)
            print(f"wrote {pdf.relative_to(ROOT)} ({pdf.stat().st_size // 1024} KB)")
    return 0


def changes_self_test(report):
    """--changes on made-up approvals, in a scratch copy of the project with a scratch git history of its own:
    an approved section changed since, one unchanged, one approved with a fingerprint no commit has, approvals by
    a reviewer who can't approve that section, and a copy with no history. The project's own git is never used."""
    if not shutil.which("git"):
        print("  skipped: the \"what changed\" packets, because git isn't installed")
        return
    with tempfile.TemporaryDirectory(prefix="tidelight-changes-") as folder:
        copy = pathlib.Path(folder) / "project"
        shutil.copytree(ROOT, copy, ignore=shutil.ignore_patterns(".git", "__pycache__", "*.pdf", *(
            pathlib.PurePath(path).name for path in HISTORY_SKIP)))
        # A git of its own: no settings from this computer, such as commit signing, and a made-up author.
        # GIT_CEILING_DIRECTORIES keeps git from finding a project above the scratch folder.
        env = dict(os.environ, HOME=folder, GIT_CONFIG_NOSYSTEM="1", GIT_CEILING_DIRECTORIES=folder, GIT_AUTHOR_NAME="Self-test",
                   GIT_AUTHOR_EMAIL="self-test", GIT_COMMITTER_NAME="Self-test", GIT_COMMITTER_EMAIL="self-test")

        def run(*args, cwd=copy):
            return subprocess.run(list(args), cwd=cwd, env=env, capture_output=True, text=True)

        def commit(message):
            run("git", "add", "--all")
            run("git", "commit", "--quiet", "--no-verify", "-m", message)
            return run("git", "rev-parse", "HEAD").stdout.strip()

        def edit(path, pattern, new):
            target = copy / path
            target.write_text(re.sub(pattern, new, target.read_text(encoding="utf-8"), count=1, flags=re.S), encoding="utf-8")

        run("git", "init", "--quiet")
        first = commit("Made-up first version")
        sections = [["get-help/index.html", "en"], ["help-someone/index.html", "en"], ["es/obtener-ayuda/index.html", "es"]]
        before = section_states(copy, sections)
        edit("get-help/index.html", r"(<h1[^>]*>.*?)(</h1>)", r"\1 made-up words\2\n<p>A made-up sentence.</p>")
        edit("es/obtener-ayuda/index.html", r"(<h1[^>]*>.*?)(</h1>)", r"\1 palabras inventadas\2")
        second = commit("Made-up change")
        unchanged = section_states(copy, [["help-someone/index.html", "en"]])
        records = "\n".join([
            f"- Get Help: licensed clinical social worker, 2026-10-01, approved, {'0' * 12}",
            f"- Get Help: licensed clinical social worker, 2026-11-01, approved, {before[('get-help/index.html', 'en')]['fingerprint']}",
            "- Get Help: licensed clinical social worker, 2026-11-02, not for the website",
            f"- Help Someone: licensed clinical social worker, 2026-11-01, approved, {unchanged[('help-someone/index.html', 'en')]['fingerprint']}",
            "- Research: licensed clinical social worker, 2026-11-01, approved, 0123456789ab",
            f"- About and privacy: lawyer, 2026-11-01, approved, {'0' * 12}",
            f"- Obtener ayuda: native Spanish speaker, 2026-11-01, approved, {before[('es/obtener-ayuda/index.html', 'es')]['fingerprint']}",
            f"- Inicio: licensed clinical social worker, 2026-11-01, approved, {'0' * 12}",
        ])
        edit("notes/CONTENT-REVIEW.md", r"- No review has been recorded\.", records)
        status = run("git", "status", "--porcelain").stdout
        done = run(sys.executable, "tools/make_review_packet.py", "--changes", "--no-pdf")
        english = (copy / OUT.relative_to(ROOT) / "tidelight-review-changes.html")
        spanish = (copy / OUT.relative_to(ROOT) / "tidelight-spanish-review-changes.html")
        english = english.read_text(encoding="utf-8") if english.exists() else ""
        spanish = spanish.read_text(encoding="utf-8") if spanish.exists() else ""

        def section(text, name):
            start = text.find(f"<h3>{esc(name)}</h3>")
            return "" if start < 0 else text[start:text.find("</section>", start)]

        get_help = section(english, "Get Help")
        report("--changes ran and wrote a packet for each reviewer", done.returncode == 0 and bool(english) and bool(spanish))
        report("a section changed since its newest approval: the approved text, found in the history, beside the text now",
               f"commit {first[:7]}" in get_help and "<ins>made-up words</ins>" in get_help
               and "<ins>A made-up sentence.</ins>" in get_help
               and not any("made-up" in cell for cell in re.findall(r"<tr><td>(.*?)</td><td>", get_help, re.S)))
        report("a newer record that isn't an approval: said, and the text compared with the approval",
               "2026-11-02, isn't an approval" in get_help)
        report("a section unchanged since its approval: only named", "<h3>Help Someone</h3>" not in english
               and "<li>Help Someone</li>" in english)
        report("an approval whose fingerprint no commit has: the text now, and why",
               "wasn't found" in section(english, "Research") and "0123456789ab" in section(english, "Research"))
        report("an approval by someone who can't approve the section, such as a lawyer: not counted",
               "<h3>About and privacy</h3>" not in english and "<li>About and privacy</li>" in english)
        report("the Spanish packet: a changed Spanish section, compared with the fluent reader's approval",
               "<ins>palabras inventadas</ins>" in section(spanish, "Obtener ayuda") and f"commit {first[:7]}" in spanish)
        report("a clinician's approval of a Spanish section: not counted", "<h3>Inicio</h3>" not in spanish
               and "<li>Inicio</li>" in spanish)
        report("--changes changed nothing in git", run("git", "rev-parse", "HEAD").stdout.strip() == second
               and run("git", "status", "--porcelain").stdout == status)
        bare = pathlib.Path(folder) / "no-history"
        shutil.copytree(copy, bare, ignore=shutil.ignore_patterns(".git"))
        run(sys.executable, "tools/make_review_packet.py", "--changes", "--no-pdf", cwd=bare)
        written = bare / OUT.relative_to(ROOT) / "tidelight-review-changes.html"
        report("a copy with no git history: the text now, and why",
               written.exists() and "has no git history" in section(written.read_text(encoding="utf-8"), "Get Help"))


def check_all_pages_listed():
    """The same rule tools/check_site.py and the publish step apply: every page, and all its text, has a review
    section. Otherwise a packet would leave something out without saying so."""
    from check_site import missing_sections

    missing = missing_sections(find_pages())
    if missing:
        raise SystemExit("The review packets would leave something out, so they weren't built:\n- " + "\n- ".join(missing))


def check_questions():
    """The questions for the fluent Spanish reader, the same rule tools/check_site.py applies. A question that
    lost its Spanish would never reach the reader."""
    problems = spanish_questions()[1]
    if problems:
        raise SystemExit("A question for the fluent Spanish reader is incomplete, so the packets weren't built. "
                         "Fix notes/CONTENT-REVIEW.md:\n- " + "\n- ".join(problems))


def self_test():
    """Checks this tool on made-up cases, and changes nothing: each packet's build date in its own language,
    whatever the computer's language setting, the questions for the fluent Spanish reader reaching the Spanish
    packet, the reading of those questions, so a lost Spanish question or source is noticed, and the notes that
    say which pages show a line of the text on every page."""
    import locale

    day = datetime.date(2026, 11, 7)
    wrong = 0
    total = 0

    def report(name, passed):
        nonlocal wrong, total
        total += 1
        wrong += not passed
        print(f"  {'ok' if passed else 'WRONG'}: {name}")

    therapist, spanish = therapist_packet(day, NO_STAMP), spanish_packet(day, NO_STAMP)
    report("the therapist's packet says when it was built in English", "Built November 7, 2026 from" in therapist)
    report("the Spanish packet says when it was built in Spanish", "Generado el 7 de noviembre de 2026 a partir" in spanish)
    # The names of the months come from this file, never from the computer's language setting. "" is the computer's
    # own setting: Python starts every program in "C" and applies the computer's only when asked, as here.
    before = locale.setlocale(locale.LC_TIME)
    settings = []
    for setting in ("", "C", "es_ES.UTF-8", "de_DE.UTF-8", "fr_FR.UTF-8"):
        try:
            settings.append((setting, locale.setlocale(locale.LC_TIME, setting)))
        except locale.Error:
            pass
        finally:
            locale.setlocale(locale.LC_TIME, before)
    for setting, applied in settings:
        try:
            locale.setlocale(locale.LC_TIME, setting)
            months = [datetime.date(2026, month, month) for month in range(1, 13)]
            passed = (english_date(day) == "November 7, 2026" and spanish_date(day) == "7 de noviembre de 2026"
                      and all(DATE_EN.fullmatch(english_date(month)) and DATE_ES.fullmatch(spanish_date(month)) for month in months))
        finally:
            locale.setlocale(locale.LC_TIME, before)
        where = f"this computer's own, which is {applied}" if setting == "" else setting
        report(f"every month's date in English and in Spanish, with the time language set to {where}", passed)

    questions, problems = spanish_questions()
    report(f"the {len(questions)} questions for the fluent Spanish reader in notes/CONTENT-REVIEW.md can be read",
           bool(questions) and not problems)
    left_out = [question["es"] for question in questions
                if not all(inline(question[key]) in spanish for key in ("es", "en", "source"))]
    report("the Spanish packet shows every question, with its English twin and where it comes from", not left_out)

    good = (f"## {SPANISH_QUESTIONS}\n\nIntroduction. {AI_TRANSLATION}.\n\n"
            "1. ES: ¿Se entiende esta frase?\n   EN: Is this sentence clear?\n   Source: notes/SAFETY.md, a made-up item.\n"
            "2. ES: ¿Suena natural?\n   EN: Does it sound natural?\n   Source: notes/CONTENT-REVIEW.md, a made-up item.\n")
    cases = [
        ("two complete questions", good, False),
        ("a longer question going on below its first line", good.replace("¿Suena natural?", "¿Suena\n   natural?"), False),
        ("a question whose Spanish was removed", good.replace("2. ES: ¿Suena natural?\n   EN:", "2. EN:"), True),
        ("a question whose Spanish line is empty", good.replace("ES: ¿Suena natural?", "ES:"), True),
        ("a question whose English twin was removed", good.replace("   EN: Is this sentence clear?\n", ""), True),
        ("a question with no source", good.replace("   Source: notes/SAFETY.md, a made-up item.\n", ""), True),
        ("English where the Spanish should be", good.replace("ES: ¿Suena natural?", "ES: Does it sound natural?"), True),
        ("no mark as an unreviewed AI translation", good.replace(AI_TRANSLATION, "A translation"), True),
        ("a stray line after the questions", good + "A note that belongs to no question.\n", True),
        ("no questions at all", f"## {SPANISH_QUESTIONS}\n\n{AI_TRANSLATION}.\n", True),
        ("no section for them", "## Other questions\n\n1. ES: ¿Algo?\n", True),
    ]
    for name, text, expected in cases:
        found = spanish_questions(text)[1]
        report(f"{name}: {'a problem found' if found else 'no problem found'}", bool(found) == expected)

    # The text on every page lists each line once. A line that isn't on every page must say so, and the note must
    # reach the fingerprint, or a crisis line taken off one page, or changed there, would leave approvals standing.
    def line(text, href=None, part="crisis-panel"):
        return {"tag": "p", "text": text, "links": [{"text": text, "href": href}] if href else [], "classes": {part},
                "ids": [], "lang": "en"}

    def pages(*lists):
        return [(f"Page {number}", f"p{number}/index.html", blocks) for number, blocks in enumerate(lists, 1)]

    def notes(found):
        return [(block["text"], block.get("where")) for block in found]

    steps = line("988 says a text starts with a few steps.")
    danger = line("In immediate danger, call 911.", "tel:911")
    full = [steps, danger]
    every = listing(pages(full, full, full), "en")
    lost = listing(pages(full, full, [steps]), "en")
    changed = listing(pages(full, full, [steps, line("In danger, call 911.", "tel:911")]), "en")
    relinked = listing(pages(full, full, [steps, line(danger["text"], "tel:991")]), "en")
    moved = listing(pages(full, full, [steps, line(danger["text"], "tel:911", "site-footer")]), "en")
    print_of = {name: blocks_fingerprint("(made up)", "en", found) for name, found in
                (("every", every), ("lost", lost), ("changed", changed), ("relinked", relinked), ("moved", moved))}
    report("a shared line on every page: listed once, with no note",
           notes(every) == [(steps["text"], None), (danger["text"], None)])
    report("a shared crisis line taken off one page: noted, and the fingerprint changes",
           (danger["text"], "On every page except Page 3.") in notes(lost) and print_of["lost"] != print_of["every"])
    report("a shared crisis line changed on one page: both wordings noted, and the fingerprint changes",
           (danger["text"], "On every page except Page 3.") in notes(changed)
           and ("In danger, call 911.", "Only on Page 3.") in notes(changed) and print_of["changed"] != print_of["every"])
    report("a shared crisis line's link changed on one page: noted with where each leads, and the fingerprint changes",
           (danger["text"], "On every page except Page 3. Its links go to tel:911.") in notes(relinked)
           and (danger["text"], "Only on Page 3. Its links go to tel:991.") in notes(relinked)
           and print_of["relinked"] != print_of["every"])
    report("a shared crisis line moved to another part on one page: noted, and the fingerprint changes",
           (danger["text"], "Only on Page 3. In the footer.") in notes(moved) and print_of["moved"] != print_of["every"])
    report("a shared crisis line taken off one page, in Spanish: noted in Spanish",
           (danger["text"], "En todas las páginas menos Page 3.") in notes(listing(pages(full, full, [steps]), "es")))
    report("one link written differently on two pages, to the same place: one line, with no note",
           notes(listing(pages([line("Ayuda en español", "../get-help/#en-espanol")],
                               [line("Ayuda en español", "/suicideprevention/get-help/#en-espanol")]), "en"))
           == [("Ayuda en español", None)])
    switch = [(label, page, [line("Leer en español", href, "lang-switch")]) for label, page, href in
              (("Home", "index.html", "es/"), ("Get Help", "get-help/index.html", "../es/obtener-ayuda/"))]
    report("each page's language switch to its own twin: one line, with no note",
           notes(listing(switch, "es")) == [("Leer en español", None)])
    switch[1][2][0]["links"][0]["href"] = "../es/"
    report("a language switch to another page than its twin: noted",
           ("Leer en español", "Solo en Get Help. Sus enlaces van a es/.") in notes(listing(switch, "es")))

    report("the packet fingerprint is the same each time it is made", fingerprint() == fingerprint())
    changes_self_test(report)
    if wrong:
        print(f"{wrong} of {total} case(s) read wrongly, so the packets can't be trusted until this is fixed.")
        return 1
    print(f"All {total} made-up cases were read correctly.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Build the printable review packets.")
    parser.add_argument("--no-pdf", action="store_true", help="HTML only")
    parser.add_argument("--self-test", action="store_true", help="check this tool on made-up cases, changing nothing")
    parser.add_argument("--changes", action="store_true",
                        help="for each reviewer, only the sections that changed after their newest recorded approval")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if args.changes:
        return build_changes(args.no_pdf)
    check_all_pages_listed()
    check_questions()
    today = datetime.date.today()
    stamp = fingerprint()
    OUT.mkdir(parents=True, exist_ok=True)
    for name, build, label in PACKETS:
        path = OUT / f"{name}.html"
        path.write_text(build(today, stamp), encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)}")
        if not args.no_pdf:
            pdf = OUT / f"{name}.pdf"
            make_pdf(path, pdf, label)
            print(f"wrote {pdf.relative_to(ROOT)} ({pdf.stat().st_size // 1024} KB)")
    # The fingerprint goes last, and only once the PDFs are rebuilt too, because the PDFs are what
    # reviewers are given. Until then, tools/check_site.py keeps saying the packets are out of date.
    if args.no_pdf:
        print("The PDFs were not rebuilt, so they still show the old wording. Don't hand them out; build them with Chrome.")
        return 0
    (OUT / "FINGERPRINT.txt").write_text(stamp + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
