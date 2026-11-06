#!/usr/bin/env python3
"""Builds the printable review packets from the website and the notes.

    python3 tools/make_review_packet.py           # HTML and PDF, in notes/review-packet/
    python3 tools/make_review_packet.py --no-pdf  # HTML only, if Chrome isn't installed

It writes two packets, so each reader gets what they need:
  - stillwater-review-packet: for the licensed therapist. English pages, research brief,
    sources, questions, and sign-off.
  - stillwater-spanish-review-packet: for a fluent Spanish reader. Spanish pages and sign-off.

Every sentence gets a number, so feedback can say "HELP-12" instead of quoting it. The packet
records a reviewer's role and the date, never personal contact details. It only reads the
project's files. It is not a review, and it doesn't rate any wording.
"""
import argparse
import datetime
import hashlib
import html
import html.parser
import pathlib
import re
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import find_pages  # noqa: E402

OUT = ROOT / "notes" / "review-packet"
PREVIEW = "https://stillwatersps.github.io/suicideprevention/"

ENGLISH = [
    ("index.html", "HOME", "Home"),
    ("get-help/index.html", "HELP", "Get Help"),
    ("help-someone/index.html", "SOME", "Help Someone"),
    ("teens/index.html", "TEEN", "For Teens"),
    ("not-sure/index.html", "SURE", "Not sure what you're feeling?"),
    ("after-a-loss/index.html", "LOSS", "After a loss"),
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
    ("es/que-siento/index.html", "E-SURE", "¿No sabes bien qué sientes?", "not-sure/"),
    ("es/despues-de-una-perdida/index.html", "E-LOSS", "Después de una pérdida", "after-a-loss/"),
    ("es/investigacion/index.html", "E-RES", "Investigación", "research/"),
    ("es/tarjeta/index.html", "E-CARD", "Tarjeta y cartel", "card/"),
    ("es/acerca-de/index.html", "E-ABOUT", "Acerca de y privacidad", "about/"),
]
BLOCK = {"h1", "h2", "h3", "h4", "p", "li", "summary", "dt", "dd", "caption"}
SKIP_CLASSES = {"visually-hidden", "lang-switch", "breadcrumb", "toc", "print-actions", "card-arrow", "card-icon", "skip-link"}
SHARED_CLASSES = {"crisis-bar", "crisis-panel", "site-footer", "site-header", "quick-exit"}
ABBREVIATIONS = ["U.S.", "e.g.", "i.e.", "Dr.", "Nov.", "vs.", "EE. UU.", "a.m.", "p.m.", "No."]


def split_sentences(text):
    protected = text
    for short in ABBREVIATIONS:
        protected = protected.replace(short, short.replace(".", "\u0001"))
    protected = re.sub(r"(\d)\.(\d)", "\\1\u0001\\2", protected)
    parts = re.split(r"(?<=[.!?])[\"”']?\s+(?=[A-ZÁÉÍÓÚÑ¿¡\"“(0-9])", protected)
    return [part.replace("\u0001", ".").strip() for part in parts if part.strip()]


class Extractor(html.parser.HTMLParser):
    """Reads a page into ordered blocks of text with their links, marking shared parts."""

    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.blocks = []
        self.current = None
        self.title = ""
        self.link = None

    def _classes(self):
        found = set()
        for _, attrs in self.stack:
            found.update((attrs.get("class") or "").split())
        return found

    def _ids(self):
        return [attrs.get("id") for _, attrs in self.stack if attrs.get("id")]

    def _hidden(self):
        return any("hidden" in attrs for _, attrs in self.stack) or bool(self._classes() & SKIP_CLASSES) or any(t in ("svg", "script", "style") for t, _ in self.stack)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in self.VOID:
            if tag == "img" and attrs.get("alt") and not self._hidden():
                self.blocks.append({"tag": "img", "text": "Image description: " + attrs["alt"], "links": [], "classes": self._classes(), "ids": self._ids()})
            return
        self.stack.append((tag, attrs))
        if self._hidden():
            return
        # A list item that holds its own headings and paragraphs is only a container.
        if tag in BLOCK and self.current is not None and self.current["tag"] == "li" and not self.current["text"].strip():
            self.current = None
        if tag in BLOCK and self.current is None:
            self.current = {"tag": tag, "text": "", "links": [], "classes": self._classes(), "ids": self._ids()}
        if tag == "a" and self.current is not None:
            if "pill" in (attrs.get("class") or "").split() and self.current["text"].strip():
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
        if self._hidden() or self.current is None:
            return
        self.current["text"] += data
        if self.link is not None:
            self.link["text"] += data


def read_page(name):
    parser = Extractor()
    parser.feed((ROOT / name).read_text(encoding="utf-8"))
    parser.close()
    return parser


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
        if tag in ("h1", "h2", "h3", "h4", "summary"):
            label, same = numbering.number(prefix, counters, block["text"])
            level = {"h1": "h3", "h2": "h4", "h3": "h5", "h4": "h5", "summary": "h5"}[tag]
            note = "" if not same else f' <span class="same">same as {same}</span>'
            out.append(f'<{level} class="row-heading"><span class="id">{label}</span> {esc(block["text"])}{note}</{level}>')
        else:
            bullet = " in-list" if tag == "li" else ""
            for sentence in split_sentences(block["text"]):
                label, same = numbering.number(prefix, counters, sentence)
                if same:
                    out.append(f'<p class="row repeat{bullet}"><span class="id">{label}</span> <span class="same">same as {same}:</span> {esc(sentence)}</p>')
                else:
                    out.append(f'<p class="row{bullet}"><span class="id">{label}</span> {esc(sentence)}</p>')
        links.extend(block["links"])
    close()
    return "\n".join(out)


def page_blocks(name):
    """A page's own text, leaving out the parts every page shares and repeated wallet cards."""
    blocks = read_page(name).blocks
    own = []
    cards = 0
    for block in blocks:
        if block["classes"] & SHARED_CLASSES:
            continue
        if "pc-card" in block["classes"]:
            if block["tag"] == "p" and "pc-kicker" in block["classes"]:
                cards += 1
            if cards > 1:
                continue
        own.append(block)
    return own


def shared_blocks(names):
    """The crisis strip, header, panel, and footer, listed once with every different wording."""
    blocks = []
    seen = set()
    for name in names:
        for block in read_page(name).blocks:
            if not (block["classes"] & SHARED_CLASSES) or "footer-nav" in block["classes"] or "site-nav" in block["classes"]:
                continue
            key = block["text"]
            if key in seen:
                continue
            seen.add(key)
            blocks.append(block)
    return blocks


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
@media screen { body { max-width: 820px; margin: 24px auto; padding: 0 16px; } }
"""


def document(title, body):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{esc(title)}</title>
<style>{STYLE}</style>
</head>
<body>
{body}
</body>
</html>
"""


def fingerprint():
    digest = hashlib.sha256()
    names = [p for p in find_pages()] + ["notes/RESEARCH-BRIEF.md", "notes/CONTENT-REVIEW.md", "notes/SAFETY.md"]
    for name in sorted(names):
        digest.update(name.encode())
        digest.update((ROOT / name).read_bytes())
    return digest.hexdigest()[:12]


def signoff_table(pages, lang):
    rows = "".join(
        f"<tr><td>{esc(label)}</td><td>{BOX}</td><td>{BOX}</td><td>{BOX}</td><td></td></tr>"
        for label in pages
    )
    if lang == "es":
        head = "<tr><th>Sección</th><th>Aprobada</th><th>Aprobada con cambios</th><th>No para el sitio</th><th>Función de quien revisa y fecha</th></tr>"
    else:
        head = "<tr><th>Section</th><th>Approved</th><th>Approved with changes</th><th>Not for the website</th><th>Reviewer's role and date</th></tr>"
    return f'<table class="signoff"><thead>{head}</thead><tbody>{rows}</tbody></table>'


def therapist_packet(today, stamp):
    numbering = Numbering()
    counters = {}
    parts = []
    english_names = [item[0] for item in ENGLISH]

    parts.append(f"""
<h1>Stillwater content review packet</h1>
<p class="lede">For a licensed therapist reviewing a draft suicide prevention website for adults and young people in the United States.</p>
<div class="banner"><strong>Draft. Not reviewed.</strong> An AI assistant drafted the website text, and one founder supplied the research brief. No licensed clinician has reviewed any of it, and none of it should be relied on until a review is recorded. Reviewer: not yet recorded. Review date: not yet recorded.</div>
<p class="small">Built {today} from the website files and project notes. Fingerprint {stamp}. If the pages change, this packet must be rebuilt with <code>python3 tools/make_review_packet.py</code>, and numbers may change.</p>

<h2 class="first">How to use this packet</h2>
<p><strong>What's inside:</strong></p>
<ul>
<li>Part 1: Text that appears on every page</li>
<li>Part 2: Each English page, sentence by sentence, with its source links</li>
<li>Part 3: The founder-supplied research brief</li>
<li>Part 4: Crisis resources, and what each button does</li>
<li>Part 5: Questions written for you</li>
<li>Part 6: How the research was read, and how the pages compare with the brief</li>
<li>Part 7: Decisions and sign-off</li>
</ul>
<p>The Spanish pages are in a separate packet for a fluent reader.</p>
<p><strong>How to record feedback:</strong></p>
<ul>
<li><strong>Mark each section.</strong> Each section ends with a box: OK as written, OK with changes, or Not for the website.</li>
<li><strong>Refer to sentences by number.</strong> Every sentence has a number, such as HELP-12. In the Notes line, write something like "HELP-12: change to ...". Writing on the page is fine.</li>
<li><strong>Repeated sentences.</strong> A gray sentence marked "same as" repeats an earlier one. A decision on the first applies to all of them.</li>
<li><strong>Answer the questions in Part 5</strong> if you can. Skip any that aren't yours to answer.</li>
<li><strong>Finish with Part 7.</strong> It records your decisions, your role, and the date. Please don't write personal contact details in this packet. It may be stored in a public project.</li>
</ul>
<p>You can use a pen on paper, or add notes to the PDF in a PDF app. Return it to the founder who gave it to you.</p>
<div class="urgent"><strong>If anything here could cause harm, please say so first.</strong> Use this box, or tell the founders right away, for anything that should come down or change before anything else happens.<span class="answer"></span><span class="answer"></span></div>
<p class="small" style="margin-top:8pt">You can see the draft website as it looks on a screen if a founder shares a preview link. The draft pages are not on the public website yet. Parts of an older version are public at {PREVIEW}.</p>
""")

    parts.append("<h2>Part 1: Text that appears on every page</h2>")
    parts.append("<p>The crisis strip, header, crisis buttons, and footer. Each page has one version of these. Different wording on different pages is listed here once.</p>")
    parts.append(render_blocks(shared_blocks(english_names), "SHARED", numbering, counters, "en"))

    parts.append("<h2>Part 2: English pages</h2>")
    parts.append("<p>Text from the crisis strip, header, crisis buttons, and footer is in Part 1. Folded sections are shown open. Links show their full address, so they can be checked from paper.</p>")
    for name, prefix, label in ENGLISH:
        address = "" if name == "404.html" else name.replace("index.html", "")
        parts.append(f"<h3>Page: {esc(label)}</h3><p class=\"small\">Address once published: {esc(PREVIEW + address) if name != '404.html' else 'shown for any address that does not exist'}. Numbers start with {prefix}.</p>")
        parts.append(render_blocks(page_blocks(name), prefix, numbering, counters, "en"))

    parts.append("<h2>Part 3: Research brief</h2>")
    parts.append("<p>A founder supplied this brief. The website's draft text was written separately and did not come from it, so please read both. The unchanged PDF is in the project at <code>notes/attachments/research-and-website-copy-2026-11.pdf</code>.</p>")
    parts.append(render_blocks(brief_blocks(), "BRIEF", numbering, counters, "en"))
    parts.append("<h3>Tracker for the brief</h3>")
    parts.append(markdown(note_section("notes/RESEARCH-BRIEF.md", "Review tracker")))

    parts.append("<h2>Part 4: Crisis resources and what each button does</h2>")
    parts.append("<p>An AI assistant read these on each provider's page. No person has confirmed them. No call, text, or chat was placed.</p>")
    parts.append("<h3>Crisis resources</h3>")
    parts.append(markdown(note_section("notes/SAFETY.md", "U.S. crisis resources")))
    parts.append("<h3>What each control does</h3>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "What each control does")))

    parts.append("<h2>Part 5: Questions written for you</h2>")
    parts.append("<p>These are suggestions from an AI assistant, not decisions. Use the blank lines, or write on the notes pages at the end.</p>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions for the qualified reviewer")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the approved ideas")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the second batch")))
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "Questions about the first-version additions")))
    parts.append("<h3>Questions about the research brief</h3>")
    parts.append(markdown(note_section("notes/RESEARCH-BRIEF.md", "Questions for the reviewer from Claude")))
    parts.append('<h3>Your answers</h3>' + '<span class="answer"></span>' * 14)

    parts.append("<h2>Part 6: How the research was read</h2>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "How each finding was read")))
    parts.append("<h3>How the pages compare with the research brief</h3>")
    parts.append(markdown(note_section("notes/CONTENT-REVIEW.md", "How the pages compare with the research brief")))

    parts.append("<h2>Part 7: Decisions and sign-off</h2>")
    parts.append("<p>Please record your role and the date, such as \"licensed clinical social worker, November 2026\". Please don't write your name, license number, or contact details here. The founders will keep any such record outside the project.</p>")
    sections = [label for _, _, label in ENGLISH] + ["Text on every page (Part 1)"]
    tracker = re.findall(r"^\| ([^|]+?) \| [^|]+ \| Not reviewed", note_section("notes/RESEARCH-BRIEF.md", "Review tracker"), re.M)
    parts.append("<h3>The website</h3>" + signoff_table(sections, "en"))
    parts.append("<h3>The research brief</h3>" + signoff_table(["Brief: " + t for t in tracker], "en"))
    parts.append("""<h3>Overall</h3>
<p>Is this site safe to show the public with the changes you asked for? <span class="box"></span> Yes <span class="box"></span> Yes, after the changes are made and I have seen them <span class="box"></span> No <span class="box"></span> Not my call</p>
<p>Anything else the founders should know, including who else should review this:</p>
<span class="answer"></span><span class="answer"></span><span class="answer"></span>
<p><strong>Reviewer's role:</strong><span class="write"></span></p>
<p><strong>Date:</strong><span class="write"></span></p>
<h3>For the founders, after the review</h3>
<ul>
<li>Copy each result into "Review records" in <code>notes/CONTENT-REVIEW.md</code>, and the tracker in <code>notes/RESEARCH-BRIEF.md</code>. Use the role and date only.</li>
<li>Make the changes on a task branch, and show the reviewer anything that changed a safety message.</li>
<li>Update the review list on the About pages. Remove a page's draft note only after its review is recorded.</li>
<li>Keep any signed copy with personal details outside this public project.</li>
</ul>""")
    parts.append("<h2>Notes</h2>" + '<span class="answer"></span>' * 16)
    return document("Stillwater content review packet", "\n".join(parts))


def spanish_packet(today, stamp):
    numbering = Numbering()
    counters = {}
    parts = []
    names = [item[0] for item in SPANISH]
    parts.append(f"""
<h1>Stillwater: paquete de revisión en español</h1>
<p class="lede">Para una persona hispanohablante que revise la traducción de un sitio web preliminar sobre la prevención del suicidio. For a fluent Spanish reader.</p>
<div class="banner"><strong>Borrador sin revisar.</strong> Un asistente de IA redactó el texto en inglés y lo tradujo al español. Ninguna persona hispanohablante lo ha revisado, y ningún profesional clínico ha revisado todavía la versión en inglés. Quien revisa: sin registrar. Fecha de revisión: sin registrar.</div>
<p class="small">Generado el {today} a partir de los archivos del sitio. Huella {stamp}. Si las páginas cambian, hay que generar este paquete de nuevo con <code>python3 tools/make_review_packet.py</code>.</p>

<h2 class="first">Cómo usar este paquete</h2>
<ul>
<li><strong>Revise cada sección.</strong> Cada sección termina con un recuadro: bien así, bien con cambios, o no para el sitio.</li>
<li><strong>Use los números.</strong> Cada oración tiene un número, como E-HELP-12. En las notas, escriba por ejemplo "E-HELP-12: cambiar a ...".</li>
<li><strong>Oraciones repetidas.</strong> Una oración en gris marcada "same as" repite otra anterior. Lo que decida sobre la primera vale para todas.</li>
<li><strong>Preguntas que importan.</strong> ¿Se entiende? ¿Suena natural? ¿Cambia el sentido del inglés? ¿Hay algo que pueda confundir a alguien en crisis? ¿Debería evitarse alguna forma solo masculina, como "No estás solo"?</li>
<li><strong>Datos de contacto.</strong> Por favor, no escriba su nombre ni sus datos personales en este paquete, porque puede guardarse en un proyecto público.</li>
</ul>
<div class="urgent"><strong>Si algo puede causar daño, dígalo primero.</strong> Use este recuadro, o avise de inmediato a los fundadores.<span class="answer"></span><span class="answer"></span></div>
<p class="small" style="margin-top:8pt">Los datos de crisis en español salen de la tabla de recursos del proyecto, leída en el sitio de cada proveedor por un asistente de IA. Nadie ha llamado ni enviado textos para comprobarlos, y no debe hacerse.</p>
""")
    parts.append("<h2>Parte 1: Texto que aparece en cada página</h2>")
    parts.append(render_blocks(shared_blocks(names), "E-SHARED", numbering, counters, "es"))
    parts.append("<h2>Parte 2: Páginas en español</h2>")
    parts.append("<p>Las secciones plegadas se muestran abiertas. Los enlaces muestran la dirección completa. La versión en inglés de cada página está en el otro paquete.</p>")
    for name, prefix, label, english in SPANISH:
        address = name.replace("index.html", "")
        parts.append(f"<h3>Página: {esc(label)}</h3><p class=\"small\">Dirección cuando se publique: {esc(PREVIEW + address)}. En inglés: {esc(PREVIEW + (english if english != 'index.html' else ''))}. Los números empiezan con {prefix}.</p>")
        parts.append(render_blocks(page_blocks(name), prefix, numbering, counters, "es"))
    parts.append("<h2>Parte 3: Decisiones y firma</h2>")
    parts.append("<p>Anote su función y la fecha, por ejemplo \"traductora médica, noviembre de 2026\". Por favor, no escriba su nombre ni sus datos de contacto.</p>")
    parts.append(signoff_table([label for _, _, label, _ in SPANISH] + ["Texto en cada página (Parte 1)"], "es"))
    parts.append("""<p>Otros comentarios:</p><span class="answer"></span><span class="answer"></span><span class="answer"></span>
<p><strong>Función de quien revisa:</strong><span class="write"></span></p>
<p><strong>Fecha:</strong><span class="write"></span></p>""")
    parts.append("<h2>Notas</h2>" + '<span class="answer"></span>' * 16)
    html_text = document("Stillwater: paquete de revisión en español", "\n".join(parts))
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


def check_all_pages_listed():
    listed = {item[0] for item in ENGLISH} | {item[0] for item in SPANISH}
    missing = [p for p in find_pages() if p not in listed]
    if missing:
        raise SystemExit(f"Add these pages to the lists in tools/make_review_packet.py: {missing}")


def main():
    parser = argparse.ArgumentParser(description="Build the printable review packets.")
    parser.add_argument("--no-pdf", action="store_true", help="HTML only")
    args = parser.parse_args()
    check_all_pages_listed()
    today = datetime.date.today().strftime("%B %-d, %Y")
    stamp = fingerprint()
    OUT.mkdir(parents=True, exist_ok=True)
    builds = (
        ("stillwater-review-packet", therapist_packet(today, stamp), "Stillwater content review packet"),
        ("stillwater-spanish-review-packet", spanish_packet(today, stamp), "Stillwater Spanish review packet"),
    )
    (OUT / "FINGERPRINT.txt").write_text(stamp + "\n", encoding="utf-8")
    for name, text, label in builds:
        path = OUT / f"{name}.html"
        path.write_text(text, encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)}")
        if not args.no_pdf:
            pdf = OUT / f"{name}.pdf"
            make_pdf(path, pdf, label)
            print(f"wrote {pdf.relative_to(ROOT)} ({pdf.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
