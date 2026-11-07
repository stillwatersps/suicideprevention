#!/usr/bin/env python3
"""Says whether the website is ready for the public, and what is still in the way.

    python3 tools/launch_gate.py             # the full list, including GitHub settings
    python3 tools/launch_gate.py --publish   # used by the publish step: only the blocking review checks

This reads the project. It changes nothing, and it can't tell whether content is good: it only checks
that people have recorded the reviews and decisions. Publishing is blocked until a clinical review and
a fluent Spanish review are recorded in notes/CONTENT-REVIEW.md. The founders can override that on
purpose, for an early preview, by setting a repository variable named PUBLISH_UNREVIEWED to the words
"both founders agreed". See notes/LAUNCH-CHECKLIST.md.
"""
import argparse
import json
import os
import pathlib
import re
import subprocess
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import find_pages, language_of, review_records  # noqa: E402

REPO = "stillwatersps/suicideprevention"
OVERRIDE = "both founders agreed"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def clinical_reviews(records):
    return [r for r in records if re.search(r"clinic|therap|counsel|psycholog|psychiatr|social worker", r, re.I) and re.search(r"approved", r, re.I)]


def spanish_reviews(records):
    return [r for r in records if re.search(r"spanish|español|translat|fluent", r, re.I) and re.search(r"approved", r, re.I)]


def review_checks():
    """What must be on record before the public sees the site."""
    records = review_records() or []
    return [
        ("A licensed clinician's review is recorded", bool(clinical_reviews(records))),
        ("A fluent Spanish reader's review is recorded", bool(spanish_reviews(records))),
    ]


def content_checks():
    pages = find_pages()
    drafts = [p for p in pages if 'class="page-status review-note"' in read(p)]
    noindex = [p for p in pages if 'name="robots" content="noindex"' in read(p)]
    safety = read("notes/SAFETY.md").split("## U.S. crisis resources", 1)[-1].split("###", 1)[0]
    rows = [line for line in safety.splitlines() if line.startswith("|") and not line.startswith(("| Resource", "| ---"))]
    unconfirmed = [line.split("|")[1].strip() for line in rows if not line.rstrip().rstrip("|").split("|")[-1].strip()]
    tracker = read("notes/RESEARCH-BRIEF.md").split("## Review tracker", 1)[-1].split("## ", 1)[0]
    brief_open = tracker.count("Not reviewed")
    pending = sum(read(p).count('class="status-value">Pending') + read(p).count('class="status-value">Pendiente') for p in pages)
    phone_notes = [p.name for p in (ROOT / "notes" / "worklogs").glob("*phone*.md")]
    decisions = read("notes/DECISIONS.md")
    open_decisions = len(re.findall(r"^\d+\. \*\*", decisions.split("## Open decisions", 1)[-1].split("## ", 1)[0], re.M))
    return [
        ("Crisis details confirmed by a person in notes/SAFETY.md", not unconfirmed, f"{len(unconfirmed)} of {len(rows)} rows have no person's confirmation"),
        ("Research brief reviewed", brief_open == 0, f"{brief_open} sections are not reviewed"),
        ("Review list on the About pages updated", pending == 0, f"{pending} entries still say pending"),
        ("Draft notes removed from pages", not drafts, f"{len(drafts)} pages still say draft"),
        ("Search engines allowed, once approved", not noindex, f"{len(noindex)} pages ask not to be listed"),
        ("Real phone test recorded in notes/worklogs", bool(phone_notes), "no phone test note yet; see notes/PHONE-TEST.md"),
        ("Open decisions settled in notes/DECISIONS.md", open_decisions == 0, f"{open_decisions} are still open"),
    ]


def github_checks():
    """Read-only questions for GitHub. Returns an empty list if the gh command isn't available."""
    def api(path):
        try:
            done = subprocess.run(["gh", "api", path], capture_output=True, text=True, timeout=30)
        except (OSError, subprocess.TimeoutExpired):
            return None
        if done.returncode != 0:
            return {"_error": done.stderr.strip()[:80]}
        return json.loads(done.stdout)

    repo = api(f"repos/{REPO}")
    if repo is None or "_error" in repo:
        return [("GitHub settings", False, "couldn't read them; check by hand with notes/LAUNCH-CHECKLIST.md")]
    pages = api(f"repos/{REPO}/pages") or {}
    protection = api(f"repos/{REPO}/branches/main/protection") or {"_error": "none"}
    reviews = (protection.get("required_pull_request_reviews") or {}).get("required_approving_review_count", 0)
    return [
        ("Pages publishes with GitHub Actions, so notes stay out", pages.get("build_type") == "workflow", f"Pages builds from: {pages.get('build_type')}"),
        ("Main requires the other founder's approval", reviews >= 1, "main has no required approvals"),
        ("GitHub Issues turned off", not repo.get("has_issues"), "Issues are on, so someone in crisis could post there"),
        ("GitHub Wiki turned off", not repo.get("has_wiki"), "the Wiki is on"),
    ]


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--publish", action="store_true", help="only the checks that block publishing")
    args = parser.parse_args()

    reviews = review_checks()
    missing = [name for name, passed in reviews if not passed]
    if args.publish:
        if not missing:
            print("Reviews are on record. Publishing can go ahead.")
            return 0
        if os.environ.get("PUBLISH_UNREVIEWED", "").strip().lower() == OVERRIDE:
            print(f"Publishing without these, because PUBLISH_UNREVIEWED says \"{OVERRIDE}\": {missing}")
            return 0
        print("Publishing stopped, so unreviewed crisis content doesn't go live by accident.")
        for name in missing:
            print(f"  Not yet: {name}")
        print("Record reviews in notes/CONTENT-REVIEW.md. To publish on purpose anyway, see notes/LAUNCH-CHECKLIST.md.")
        return 1

    print("Tidelight launch check. It only sees what people have recorded.\n")
    blocked = 0
    for name, passed in reviews:
        print(f"  {'done' if passed else 'NOT YET'}  {name}")
        blocked += not passed
    for name, passed, detail in content_checks() + github_checks():
        print(f"  {'done' if passed else 'NOT YET'}  {name}" + ("" if passed else f": {detail}"))
        blocked += not passed
    lang_pairs = {language_of(p) for p in find_pages()}
    print(f"\n{len(find_pages())} pages in {len(lang_pairs)} languages. {blocked} item(s) still in the way.")
    print("Also run: python3 tools/check_site.py --check-links, tools/test_browser.py, and tools/check_crisis_sources.py")
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main())
