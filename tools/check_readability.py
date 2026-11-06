#!/usr/bin/env python3
"""Plain-language report for the website (idea C4). Changes nothing.

    python3 tools/check_readability.py            # report long sentences and reading level
    python3 tools/check_readability.py --strict   # also fail if any sentence is very long

The audience includes teens and people in distress, so shorter is better. The
reading level is a rough estimate for English pages only (Flesch-Kincaid grade).
For Spanish pages it reports sentence length only. It is a prompt for a person to
look, not a judgement: some long sentences are needed for accuracy.
"""
import html.parser
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from check_site import ROOT, find_pages, language_of  # noqa: E402

LONG = 25       # words: flagged for a person to look at
VERY_LONG = 35  # words: fails with --strict
SKIP_CLASSES = {"sources", "toc", "source-toggle", "visually-hidden", "pc-cards", "breadcrumb", "lang-switch"}
SKIP_TAGS = {"script", "style", "svg", "nav", "summary"}


class MainText(html.parser.HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.blocks, self.current = [], [], []

    def _skipping(self):
        if not any(tag == "main" for tag, _ in self.stack):
            return True
        return any(tag in SKIP_TAGS or SKIP_CLASSES & set(classes) for tag, classes in self.stack)

    def handle_starttag(self, tag, attrs):
        if tag in {"p", "li", "h1", "h2", "h3"}:
            self._flush()
        if tag not in self.VOID:
            self.stack.append((tag, (dict(attrs).get("class") or "").split()))

    def handle_endtag(self, tag):
        if tag in {"p", "li", "h1", "h2", "h3"}:
            self._flush()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if not self._skipping():
            self.current.append(data)

    def _flush(self):
        text = re.sub(r"\s+", " ", "".join(self.current)).strip()
        if text:
            self.blocks.append(text)
        self.current = []


def sentences(blocks):
    for block in blocks:
        for sentence in re.split(r"(?<=[.!?])\s+(?=[A-Z¿¡\"“])", block):
            words = re.findall(r"[\wáéíóúñü'’-]+", sentence, re.I)
            if words:
                yield sentence, words


def syllables(word):
    word = word.lower().strip("'’")
    if len(word) <= 3:
        return 1
    word = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", word)
    word = re.sub(r"^y", "", word)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", word)))


def main():
    strict = "--strict" in sys.argv
    worst = 0
    print("Plain-language report. Sentences over", LONG, "words are listed for a person to look at.\n")
    for name in find_pages():
        parser = MainText()
        parser.feed((ROOT / name).read_text(encoding="utf-8"))
        parser._flush()
        found = list(sentences(parser.blocks))
        if not found:
            continue
        counts = [len(w) for _, w in found]
        total_words = sum(counts)
        line = f"{name}: {len(found)} sentences, average {total_words / len(found):.1f} words"
        if language_of(name) == "en":
            syl = sum(syllables(w) for _, ws in found for w in ws)
            grade = 0.39 * total_words / len(found) + 11.8 * syl / total_words - 15.59
            line += f", reading grade about {grade:.1f}"
        print(line)
        for sentence, words in found:
            if len(words) > LONG:
                worst = max(worst, len(words))
                print(f"  {len(words)} words: {sentence[:110]}{'...' if len(sentence) > 110 else ''}")
    if strict and worst > VERY_LONG:
        print(f"\nFAIL: at least one sentence has more than {VERY_LONG} words.")
        return 1
    print("\nReport only. Shortening crisis or health wording needs the reviewer; see notes/CONTENT-REVIEW.md.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
