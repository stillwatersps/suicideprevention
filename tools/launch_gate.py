#!/usr/bin/env python3
"""Says whether the website is ready for the public, and what is still in the way.

    python3 tools/launch_gate.py             # the full list, including GitHub settings
    python3 tools/launch_gate.py --publish   # used by the publish step: only the blocking review checks
    python3 tools/launch_gate.py --self-test # checks this tool's own reading of review records

This reads the project. It changes nothing, and it can't tell whether content is good: it only checks
that people have recorded the reviews and decisions. Publishing is blocked until each section of the
review packets has an approval recorded in notes/CONTENT-REVIEW.md: every English page, the text on
every page, and the wording outside the page text from a licensed clinician, and the same Spanish
sections from a fluent Spanish reader. One line each, like this:

    - Get Help: licensed clinical social worker, 2026-12-01, approved

Only "approved" or "approved with changes, changes made" counts, and the newest record for a section
is the one that counts. The founders can override this on purpose, for an early preview, by setting a
repository variable named PUBLISH_UNREVIEWED to the words "both founders agreed". See
notes/LAUNCH-CHECKLIST.md.
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
from check_site import find_pages, is_approved, language_of, read_review_records, review_records, review_sections  # noqa: E402

REPO = "stillwatersps/suicideprevention"
OVERRIDE = "both founders agreed"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def review_checks(lines=None):
    """What must be on record before the public sees the site, as (name, passed, what is missing),
    and the record lines that don't count because they aren't in the form."""
    records, unreadable = read_review_records((review_records() or []) if lines is None else lines)
    sections = review_sections()
    english = [label for label, page, lang in sections if lang == "en" and not is_approved(records, page, lang)]
    spanish = [label for label, page, lang in sections if lang == "es" and not is_approved(records, page, lang)]
    return [
        ("A licensed clinician approved every English section of the review packet", not english,
         f"{len(english)} not approved: {', '.join(english)}"),
        ("A fluent Spanish reader approved every Spanish section of the review packet", not spanish,
         f"{len(spanish)} not approved: {', '.join(spanish)}"),
    ], unreadable


def content_checks():
    pages = find_pages()
    drafts = [p for p in pages if 'class="page-status review-note"' in read(p)]
    noindex = [p for p in pages if 'name="robots" content="noindex"' in read(p)]
    safety = read("notes/SAFETY.md").split("## U.S. crisis resources", 1)[-1].split("###", 1)[0]
    rows = [line for line in safety.splitlines() if line.startswith("|") and not line.startswith(("| Resource", "| ---"))]
    unconfirmed = [line.split("|")[1].strip() for line in rows if not line.rstrip().rstrip("|").split("|")[-1].strip()]
    tracker = read("notes/RESEARCH-BRIEF.md").split("## Review tracker", 1)[-1].split("## ", 1)[0]
    brief_open = len(re.findall(r"^\|.*\| Not reviewed \|", tracker, re.M))
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
    approvals, approval_detail = required_approvals(api)
    return [
        ("Pages publishes with GitHub Actions, so notes stay out", pages.get("build_type") == "workflow", f"Pages builds from: {pages.get('build_type')}"),
        ("Main requires the other founder's approval", approvals >= 1, approval_detail),
        ("GitHub Issues turned off", not repo.get("has_issues"), "Issues are on, so someone in crisis could post there"),
        ("GitHub Wiki turned off", not repo.get("has_wiki"), "the Wiki is on"),
    ]


def required_approvals(api):
    """How many approvals main needs, from branch protection or a ruleset, and what to say if none.
    Branch protection can only be read with admin access, so a failed read isn't taken as "none"."""
    classic = api(f"repos/{REPO}/branches/main/protection")
    if classic is None:
        classic_count = None
    elif "_error" in classic:
        classic_count = 0 if "not protected" in classic["_error"].lower() else None
    else:
        classic_count = (classic.get("required_pull_request_reviews") or {}).get("required_approving_review_count", 0)
    rules = api(f"repos/{REPO}/rules/branches/main")
    if rules is None or isinstance(rules, dict):
        rules_count = None
    else:
        rules_count = max([(rule.get("parameters") or {}).get("required_approving_review_count", 0)
                           for rule in rules if rule.get("type") == "pull_request"], default=0)
    known = [count for count in (classic_count, rules_count) if count is not None]
    if any(count >= 1 for count in known):
        return max(known), ""
    if None in (classic_count, rules_count):
        return 0, "couldn't read this; check by hand with notes/LAUNCH-CHECKLIST.md"
    return 0, "main has no required approvals"


def self_test():
    """Feeds made-up review records to the same code the publish step uses. Nothing is read or changed."""
    full = []
    for label, page, lang in review_sections():
        role = "licensed clinical social worker" if lang == "en" else "fluent Spanish reader, medical translator"
        full.append(f"- {label}: {role}, 2026-12-01, approved")
    spanish_by_clinician = [line.replace("fluent Spanish reader, medical translator", "licensed therapist")
                            if line.startswith("- Obtener ayuda:") else line for line in full]
    cases = [
        # What the records show, the record lines, and whether publishing may go ahead.
        ("every page approved by the right reviewer", full, True),
        ("approved with changes, and the changes made", [line.replace(", approved", ", approved with changes, changes made") for line in full], True),
        ("a rejection", ["- Get Help only, licensed therapist, December 2026: NOT approved. Several changes needed.",
                         "- Spanish Home only, fluent reader, December 2026: not approved. Reads as machine translation."], False),
        ("a review still pending", ["- Sent the packet to the therapist; waiting. Not yet approved.",
                                    "- Asked a translator; waiting. Not yet approved."], False),
        ("one partial line", ["- Get Help and its Spanish twin, licensed therapist, December 2026: not for the website; approved only the 988 sentence."], False),
        ("changes asked for but not yet made", [line.replace(", approved", ", approved with changes") for line in full], False),
        ("a 'not' in every result", [line.replace(", approved", ", not approved") for line in full], False),
        ("one page left out", full[1:], False),
        ("a clinician signing a Spanish page", spanish_by_clinician, False),
        ("a newer rejection of one page", full + ["- Get Help: licensed clinical social worker, 2026-12-09, not for the website"], False),
        ("a rejection on the same day", full + ["- Get Help: licensed clinical social worker, 2026-12-01, not for the website"], False),
        ("a date that isn't a date", [line.replace("2026-12-01", "2026-13-45") for line in full], False),
    ]
    wrong = 0
    for name, lines, expected in cases:
        checks, _ = review_checks(lines)
        allowed = all(passed for _, passed, _ in checks)
        wrong += allowed != expected
        print(f"  {'ok' if allowed == expected else 'WRONG'}: {name}: publishing {'allowed' if allowed else 'blocked'}")
    if wrong:
        print(f"{wrong} case(s) read wrongly, so the publish step can't be trusted until this is fixed.")
        return 1
    print(f"All {len(cases)} made-up cases were read correctly.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--publish", action="store_true", help="only the checks that block publishing")
    parser.add_argument("--self-test", action="store_true", help="check how this tool reads review records")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    reviews, unreadable = review_checks()
    missing = [(name, detail) for name, passed, detail in reviews if not passed]
    for line in unreadable:
        print(f"Not counted, because it isn't in the form \"- Get Help: licensed clinical social worker, 2026-12-01, approved\": {line}")
    if args.publish:
        if not missing:
            print("Reviews are on record. Publishing can go ahead.")
            return 0
        if os.environ.get("PUBLISH_UNREVIEWED", "").strip().lower() == OVERRIDE:
            print(f"Publishing without these, because PUBLISH_UNREVIEWED says \"{OVERRIDE}\": {[name for name, _ in missing]}")
            return 0
        print("Publishing stopped, so unreviewed crisis content doesn't go live by accident.")
        for name, detail in missing:
            print(f"  Not yet: {name}. {detail}")
        print("Record reviews in notes/CONTENT-REVIEW.md. To publish on purpose anyway, see notes/LAUNCH-CHECKLIST.md.")
        return 1

    print("Tidelight launch check. It only sees what people have recorded.\n")
    blocked = 0
    for name, passed, detail in reviews + content_checks() + github_checks():
        print(f"  {'done' if passed else 'NOT YET'}  {name}" + ("" if passed else f": {detail}"))
        blocked += not passed
    lang_pairs = {language_of(p) for p in find_pages()}
    print(f"\n{len(find_pages())} pages in {len(lang_pairs)} languages. {blocked} item(s) still in the way.")
    print("Also run: python3 tools/check_site.py --check-links, tools/test_browser.py, and tools/check_crisis_sources.py")
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main())
