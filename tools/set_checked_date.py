#!/usr/bin/env python3
"""Updates the "last checked" date on every page, in English and Spanish, after a real re-check.

    python3 tools/set_checked_date.py 2026-11-06 2026-12-07          # shows what would change
    python3 tools/set_checked_date.py 2026-11-06 2026-12-07 --apply  # changes the pages

Use it only after someone has actually compared the crisis numbers and links with each provider's
page. The date is a claim to visitors. It changes website pages only, and refuses a future date.
"""
import argparse
import datetime
import pathlib
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import find_pages  # noqa: E402

MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def english(day):
    return f"{MONTHS_EN[day.month - 1]} {day.day}, {day.year}"


def spanish(day):
    return f"{day.day} de {MONTHS_ES[day.month - 1]} de {day.year}"


def main(argv=None, today=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("old", help="the date on the pages now, as YYYY-MM-DD")
    parser.add_argument("new", help="the date of the new check, as YYYY-MM-DD")
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
    for name in find_pages():
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        before, after = (spanish(old), spanish(new)) if name.startswith("es/") else (english(old), english(new))
        count = text.count(before)
        # The Spanish pages quote a few English source lines, so look for both forms.
        if name.startswith("es/"):
            count_english = text.count(english(old))
        else:
            count_english = 0
        if not count and not count_english:
            pages_without.append(name)
            continue
        total += count + count_english
        print(f"  {name}: {count + count_english}")
        if args.apply:
            path.write_text(text.replace(before, after).replace(english(old), english(new)), encoding="utf-8")
    print(f"{'Changed' if args.apply else 'Would change'} {total} dates. Pages without this date: {pages_without or 'none'}")
    if total == 0:
        print("Nothing matched. Check the old date.")
        return 1
    print("Also update the 'Read on' column in notes/SAFETY.md, then run python3 tools/check_site.py and rebuild the packets.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
