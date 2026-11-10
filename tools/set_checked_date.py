#!/usr/bin/env python3
"""Updates a "last checked" date on every page, in English and Spanish, after a real re-check.

    python3 tools/set_checked_date.py 2026-11-06 2026-12-07 --part crisis --by ai            # shows what would change
    python3 tools/set_checked_date.py 2026-11-06 2026-12-07 --part crisis --by ai --apply    # changes the pages

--part says which check happened: "crisis" for the crisis numbers and links (the routine in
notes/UPKEEP.md), or "sources" for the lists of sources under health information. Each has its own date,
so a check of one doesn't move the other.

--by says who did it: "ai" for an AI assistant, or "person". The pages say who made the crisis check,
and that no person has confirmed the numbers. This tool only moves dates. If the wording around a date
names someone else, it stops, so a page never says an AI assistant did a check a person did, or the
other way round. Change that wording by hand first, in both languages, and have a fluent reader confirm
the Spanish.

Use it only after the check has actually happened. The date is a claim to visitors. It changes website
pages only, and refuses a future date.
"""
import argparse
import datetime
import html
import pathlib
import re
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import date_kind, find_pages  # noqa: E402

MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
PARTS = {"crisis": "crisis details", "sources": "sources"}


def english(day):
    return f"{MONTHS_EN[day.month - 1]} {day.day}, {day.year}"


def spanish(day):
    return f"{day.day} de {MONTHS_ES[day.month - 1]} de {day.year}"


def text_before(raw, index):
    """The page's visible words just before a point in its HTML."""
    words = html.unescape(re.sub(r"<[^>]+>", " ", raw[max(0, index - 2000):index]))
    return re.sub(r"\s+", " ", words)


def who_checked(before):
    """Who the sentence ending at a date says made the check: "ai", "person", or None if it doesn't say."""
    sentence = re.split(r"[.!?]\s", before[-400:])[-1]
    if re.search(r"AI assistant|asistente de IA", sentence, re.I):
        return "ai"
    if re.search(r"\b(person|persona|founder|fundador|fundadora)\b", sentence, re.I):
        return "person"
    return None


def main(argv=None, today=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("old", help="the date on the pages now, as YYYY-MM-DD")
    parser.add_argument("new", help="the date of the new check, as YYYY-MM-DD")
    parser.add_argument("--part", required=True, choices=sorted(PARTS), help="which check happened")
    parser.add_argument("--by", required=True, choices=["ai", "person"], help="who did the check")
    parser.add_argument("--apply", action="store_true", help="change the files; without this it only shows the count")
    args = parser.parse_args(argv)
    try:
        old = datetime.date.fromisoformat(args.old)
        new = datetime.date.fromisoformat(args.new)
    except ValueError as error:
        print(f"Dates must look like 2026-12-07: {error}")
        return 2
    if new > (today or datetime.date.today()):
        print("The new date is in the future. Use the day the check really happened.")
        return 2
    if new <= old:
        print("The new date must be after the old one.")
        return 2

    total = 0
    pages_without = []
    wrong_person = []
    changes = {}
    for name in find_pages():
        path = ROOT / name
        raw = path.read_text(encoding="utf-8")
        # The Spanish pages may quote an English source line, so look for both forms there.
        forms = [(spanish(old), spanish(new)), (english(old), english(new))] if name.startswith("es/") else [(english(old), english(new))]
        spots = []
        for before, after in forms:
            for match in re.finditer(re.escape(before), raw):
                context = text_before(raw, match.start())
                if date_kind(context) != PARTS[args.part]:
                    continue
                if args.part == "crisis" and who_checked(context) != args.by:
                    wrong_person.append(f"{name}: \"...{context[-90:]}\"")
                spots.append((match.start(), match.end(), after))
        if not spots:
            pages_without.append(name)
            continue
        total += len(spots)
        print(f"  {name}: {len(spots)}")
        for start, end, after in sorted(spots, reverse=True):
            raw = raw[:start] + after + raw[end:]
        changes[path] = raw
    if wrong_person:
        named = "an AI assistant" if args.by == "person" else "someone else"
        print(f"Stopped: these sentences say {named} made the check, not who you named with --by {args.by}:")
        for item in wrong_person:
            print(f"  {item}")
        print("Change that wording by hand first, in English and Spanish, with a fluent reader confirming the Spanish.")
        print("If a person checked, also remove the sentence saying no person has confirmed the numbers. Nothing was changed.")
        return 2
    if args.apply:
        for path, text in changes.items():
            path.write_text(text, encoding="utf-8")
    print(f"{'Changed' if args.apply else 'Would change'} {total} dates for the {PARTS[args.part]}. Pages without this date: {pages_without or 'none'}")
    if total == 0:
        print("Nothing matched. Check the old date and --part.")
        return 1
    if args.part == "crisis":
        print("Also update the 'Read on' column in notes/SAFETY.md, then run python3 tools/check_site.py and rebuild the packets.")
    else:
        print("Run python3 tools/check_site.py and rebuild the packets.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
