#!/usr/bin/env python3
"""Says whether the website is ready for the public, and what is still in the way.

    python3 tools/launch_gate.py             # the full list, including GitHub settings
    python3 tools/launch_gate.py --publish   # used by the publish step: only the blocking review checks
    python3 tools/launch_gate.py --self-test # checks this tool's own reading of records, on made-up cases

This reads the project. It changes nothing, and it can't tell whether content is good: it only checks
that people have recorded the reviews and decisions. Publishing is blocked until each section of the
review packets has an approval of its current text recorded under "## Review records" in
notes/CONTENT-REVIEW.md: every English page, the text on every page, and the wording outside the page
text from a licensed mental health professional, and the Spanish sections, including the Spanish lines on
the English pages, from a fluent or native Spanish reader. One line each, like this:

    - Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6

The last part is the section's fingerprint, printed beside it in the packet's sign-off table. It is made
from the section's text, so if the text changes after the review, the approval stops counting.

  - Only "approved" or "approved with changes, changes made" counts.
  - Only a licensed clinician's record counts for an English section (such as a licensed clinical social
    worker, LPC, LMHC, LMFT, psychologist, psychiatrist, or psychiatric nurse practitioner), and only a
    fluent or native Spanish reader's for a Spanish one. Records by anyone else are left out entirely, so
    a lawyer's later "approved" can never hide a clinician's rejection. Reviews by others go under
    "## Other reviews", which this tool never reads.
  - Of the records that count, the newest decides.
  - A record dated after today, or one that can't be read, stops publishing.
  - Every page must have a section in the review packets, and so must Spanish lines on an English page.
    So must all the text a visitor sees: a sentence loose in a div, outside any paragraph, would reach no reviewer.
    So must the words a screen reader says that the screen doesn't show, of the kinds tools/check_site.py reads:
    the page's title, an aria-label or a similar attribute, an image's description, words hidden from the eye, a
    drawing's title, and the skip link. In the parts every page shares, which the packets list once, those words
    must be the same on every page of a language.

The founders can override this on purpose, for an early preview, by setting a repository variable named
PUBLISH_UNREVIEWED to the words "both founders agreed". See notes/LAUNCH-CHECKLIST.md.
"""
import argparse
import datetime
import json
import os
import pathlib
import re
import subprocess
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from check_site import (find_pages, ignored_records, language_of, missing_sections, read_review_records,  # noqa: E402
                        review_records, review_sections, review_state, section_fingerprint)

REPO = "stillwatersps/suicideprevention"
OVERRIDE = "both founders agreed"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def review_checks(lines=None, today=None, pages=None):
    """What must be on record before the public sees the site, as (name, passed, what is missing), and
    the record lines that don't count, each with the reason."""
    records, unreadable = read_review_records((review_records() or []) if lines is None else lines, today)
    missing_pages = missing_sections(find_pages() if pages is None else pages)
    not_approved = {"en": {}, "es": {}}  # language: {why: [sections]}
    for label, page, lang in review_sections():
        approved, why = review_state(records, page, lang)
        if not approved:
            not_approved[lang].setdefault(why, []).append(label)
    checks = [
        ("Every page, and all its text, has a section in the review packets", not missing_pages, "; ".join(missing_pages)),
        ("Every line under \"Review records\" can be read", not unreadable,
         f"{len(unreadable)} can't be read, and one could be a rejection"),
    ]
    for lang, who, kind in (("en", "A licensed clinician", "English"), ("es", "A fluent Spanish reader", "Spanish")):
        count = sum(len(labels) for labels in not_approved[lang].values())
        why = "; ".join(f"{', '.join(labels)}: {reason}" for reason, labels in not_approved[lang].items())
        checks.append((f"{who} approved the current text of every {kind} section of the review packets",
                       not count, f"{count} not approved. {why}"))
    not_counted = [f"{line}: it doesn't count, because {why}." for line, why in unreadable]
    not_counted += [f"{r['line']}: it doesn't count, because a \"{r['role']}\" can't approve this section. "
                    "Reviews by others belong under \"## Other reviews\"." for r in ignored_records(records)]
    return checks, not_counted


# A real phone test is recorded in a worklog as one line in this form, one line per phone:
#   Real phone test: iPhone 15, iOS 26.1, 2026-12-02, every check in notes/PHONE-TEST.md passed
PHONE_LINE = re.compile(r"^Real phone test: (?P<model>[^,]+), (?P<system>[^,]+), (?P<date>\d{4}-\d{2}-\d{2}), (?P<result>.+)$", re.M)
NOT_A_PHONE = re.compile(r"simulat|emulat|webkit|phone-size|phone size|devtools|not (on )?a real|browserstack|virtual", re.I)
NOT_DONE = re.compile(r"\b(not|no|yet|pending|waiting|todo|tbd|unknown|unconfirmed|planned|later)\b|\?", re.I)


def phone_tests(notes, today=None):
    """Which kinds of real phone were tested, {"iPhone", "Android"}, from (file name, text) pairs. A
    Simulator or emulation note never counts, and neither does a result that says it isn't done."""
    today = today or datetime.date.today()
    found = set()
    for name, text in notes:
        if NOT_A_PHONE.search(name) or NOT_A_PHONE.search(text.split("\n", 1)[0]):
            continue
        for match in PHONE_LINE.finditer(text):
            try:
                date = datetime.date.fromisoformat(match.group("date"))
            except ValueError:
                continue
            if NOT_A_PHONE.search(match.group(0)) or NOT_DONE.search(match.group("result")) or date > today:
                continue
            device = (match.group("model") + " " + match.group("system")).lower()
            if "iphone" in device or re.search(r"\bios\b", device):
                found.add("iPhone")
            elif re.search(r"android|pixel|galaxy", device):
                found.add("Android")
    return found


DATE_IN_CELL = re.compile(r"\b\d{4}-\d{2}-\d{2}\b|\b[A-Z][a-z]{2,8}\.? \d{1,2}, \d{4}\b")


def person_confirmed(cell):
    """Whether a "Person confirmed" cell in notes/SAFETY.md records a confirmation: who, by role, and a
    date, such as "founder A, 2026-12-01". "Not yet", "pending" or a question mark never count."""
    cell = cell.strip()
    return bool(cell and DATE_IN_CELL.search(cell) and not NOT_DONE.search(cell))


def content_checks():
    pages = find_pages()
    drafts = [p for p in pages if 'class="page-status review-note"' in read(p)]
    noindex = [p for p in pages if 'name="robots" content="noindex"' in read(p)]
    safety = read("notes/SAFETY.md").split("## U.S. crisis resources", 1)[-1].split("###", 1)[0]
    rows = [line for line in safety.splitlines() if line.startswith("|") and not line.startswith(("| Resource", "| ---"))]
    unconfirmed = [line.split("|")[1].strip() for line in rows if not person_confirmed(line.rstrip().rstrip("|").split("|")[-1])]
    tracker = read("notes/RESEARCH-BRIEF.md").split("## Review tracker", 1)[-1].split("## ", 1)[0]
    brief_open = len(re.findall(r"^\|.*\| Not reviewed \|", tracker, re.M))
    pending = sum(read(p).count('class="status-value">Pending') + read(p).count('class="status-value">Pendiente') for p in pages)
    worklogs = [(p.name, p.read_text(encoding="utf-8")) for p in sorted((ROOT / "notes" / "worklogs").glob("*.md"))]
    phones = phone_tests(worklogs)
    decisions = read("notes/DECISIONS.md")
    open_decisions = len(re.findall(r"^\d+\. \*\*", decisions.split("## Open decisions", 1)[-1].split("## ", 1)[0], re.M))
    return [
        ("Crisis details confirmed by a person in notes/SAFETY.md", not unconfirmed,
         f"{len(unconfirmed)} of {len(rows)} rows have no person's confirmation with a date"),
        ("Research brief reviewed", brief_open == 0, f"{brief_open} sections are not reviewed"),
        ("Review list on the About pages updated", pending == 0, f"{pending} entries still say pending"),
        ("Draft notes removed from pages", not drafts, f"{len(drafts)} pages still say draft"),
        ("Search engines allowed, once approved", not noindex, f"{len(noindex)} pages ask not to be listed"),
        ("Real phone tests recorded in notes/worklogs, on an iPhone and an Android phone", phones >= {"iPhone", "Android"},
         "no \"Real phone test:\" line for " + " or ".join(sorted({"iPhone", "Android"} - phones)) + "; see notes/PHONE-TEST.md"),
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
    """Feeds made-up records to the same code the publish step and the launch list use. Nothing is read
    from the records in the notes, and nothing is changed. Each rule has a case that fails without it."""
    today = datetime.date(2026, 12, 31)  # fixed, so the cases mean the same whatever day this runs
    sections = review_sections()
    fingerprint = {(page, lang): section_fingerprint(page, lang) for _, page, lang in sections}

    def record(label, page, lang, role=None, date="2026-12-01", result="approved", print_=None):
        role = role or ("licensed clinical social worker" if lang == "en" else "fluent Spanish reader, medical translator")
        return f"- {label}: {role}, {date}, {result}, {print_ or fingerprint[(page, lang)]}"

    full = [record(*section) for section in sections]
    about_en = next(s for s in sections if s[1] == "about/index.html" and s[2] == "en")
    help_en = next(s for s in sections if s[1] == "get-help/index.html" and s[2] == "en")
    help_es = next(s for s in sections if s[1] == "es/obtener-ayuda/index.html")
    # Get Help's Spanish lines. If they have no section, every case that should publish is blocked, and says so.
    help_lines = next((s for s in sections if s[1] == "get-help/index.html" and s[2] == "es"), None)

    def but(section, line):
        """Every section approved, except that this section's line is replaced."""
        return [line if existing.startswith(f"- {section[0]}:") else existing for existing in full]

    def roles(english, spanish):
        return [record(*s, role=english if s[2] == "en" else spanish) for s in sections]

    cases = [
        # What the records show, the record lines, and whether publishing may go ahead.
        ("every page approved by the right reviewer", full, True),
        ("approved with changes, and the changes made", [record(*s, result="approved with changes, changes made") for s in sections], True),
        ("other licensed roles and Spanish readers", [record(*s, role=["LCSW", "licensed professional counselor", "psychiatrist", "LMFT",
                                                                           "psychiatric nurse practitioner", "licensed therapist", "psychologist",
                                                                           "licensed mental health counselor"][i % 8]
                                                              if s[2] == "en" else ["native Spanish speaker", "hablante nativa de español",
                                                                                    "persona hispanohablante"][i % 3])
                                                       for i, s in enumerate(sections)], True),
        ("the sign-off table's name for the text on every page", [line.replace("- Text on every page:", "- Text on every page (Part 1):") for line in full], True),
        ("a rejection", ["- Get Help only, licensed therapist, December 2026: NOT approved. Several changes needed.",
                         "- Spanish Home only, fluent reader, December 2026: not approved. Reads as machine translation."], False),
        ("a review still pending", ["- Sent the packet to the therapist; waiting. Not yet approved.",
                                    "- Asked a translator; waiting. Not yet approved."], False),
        ("one partial line", ["- Get Help and its Spanish twin, licensed therapist, December 2026: not for the website; approved only the 988 sentence."], False),
        ("changes asked for but not yet made", [record(*s, result="approved with changes") for s in sections], False),
        ("a 'not' in every result", [record(*s, result="not approved") for s in sections], False),
        ("a well-formed rejection of one page", but(help_en, record(*help_en, result="not for the website")), False),
        ("a well-formed 'not yet' in the role", but(help_en, record(*help_en, role="licensed therapist, not yet finished")), False),
        ("one page left out", full[1:], False),
        ("a clinician signing a Spanish page", but(help_es, record(*help_es, role="licensed therapist")), False),
        ("a fluent Spanish reader signing an English page", but(help_en, record(*help_en, role="fluent Spanish reader")), False),
    ]
    if help_lines:  # the Spanish lines on an English page are a Spanish section of their own
        cases += [
            ("the Spanish lines of an English page left out", [line for line in full if not line.startswith(f"- {help_lines[0]}:")], False),
            ("a clinician signing the Spanish lines of an English page", but(help_lines, record(*help_lines, role="licensed therapist")), False),
            ("an English page's address used for its Spanish lines",
             but(help_lines, record(*help_lines).replace(f"- {help_lines[0]}:", "- get-help/:")), False),
        ]
    cases += [
        ("a newer rejection of one page", full + [record(*help_en, date="2026-12-09", result="not for the website")], False),
        ("a rejection on the same day", full + [record(*help_en, result="not for the website")], False),
        ("a date that isn't a date", [line.replace("2026-12-01", "2026-13-45") for line in full], False),
        ("a rejection that can't be read, after every approval", full + ["- Get Help: licensed therapist, December 2026: NOT approved"], False),
        # Each approval is bound to the text the reviewer read.
        ("one sentence changed after its approval", but(help_en, record(*help_en, print_="0123456789ab")), False),
        ("an approval with no fingerprint", but(help_en, record(*help_en).rsplit(", ", 1)[0]), False),
        ("the text reverted after a newer approval", full + [record(*help_en, date="2026-12-05", print_="0123456789ab")], False),
        # Only the right kind of reviewer counts, and nobody else's record can override theirs.
        ("a lawyer approving after a clinician's rejection",
         full + [record(*about_en, date="2026-12-05", result="not for the website"), record(*about_en, role="legal counsel", date="2026-12-09")], False),
        ("a school counselor approving after a clinician's rejection",
         full + [record(*help_en, date="2026-12-05", result="not for the website"), record(*help_en, role="school counselor", date="2026-12-09")], False),
        ("every English page signed by legal counsel", roles("legal counsel", "fluent Spanish reader"), False),
        ("every English page signed by privacy counsel", roles("privacy counsel", "fluent Spanish reader"), False),
        ("every English page signed by a physical therapist", roles("physical therapist", "fluent Spanish reader"), False),
        ("every English page signed by an occupational therapist", roles("occupational therapist", "fluent Spanish reader"), False),
        ("every English page signed by a speech therapist", roles("speech therapist", "fluent Spanish reader"), False),
        ("every English page signed by a school psychologist", roles("school psychologist", "fluent Spanish reader"), False),
        ("every English page signed by a non-clinical volunteer", roles("non-clinical volunteer", "fluent Spanish reader"), False),
        ("every English page signed by a volunteer licensed therapist", roles("volunteer licensed therapist", "fluent Spanish reader"), False),
        ("every English page signed by a clinical trial coordinator", roles("clinical trial coordinator", "fluent Spanish reader"), False),
        ("every English page signed by an AI psychologist", roles("AI psychologist", "fluent Spanish reader"), False),
        ("every Spanish page signed by an AI translator", roles("licensed clinical social worker", "AI translator"), False),
        ("every Spanish page signed by machine translation", roles("licensed clinical social worker", "fluent Spanish reader (machine translation)"), False),
        ("every Spanish page signed by translation software", roles("licensed clinical social worker", "native Spanish speaker, translation software"), False),
        ("every Spanish page signed by a Spanish-speaking lawyer", roles("licensed clinical social worker", "Spanish-speaking lawyer"), False),
        ("every Spanish page signed by a Spanish teacher", roles("licensed clinical social worker", "Spanish teacher"), False),
        ("every Spanish page signed by a non-native Spanish speaker", roles("licensed clinical social worker", "non-native Spanish speaker"), False),
        # A record dated after today is a typing mistake, and must not outrank a real record.
        ("approvals dated in the future", [line.replace("2026-12-01", "2027-02-01") for line in full], False),
        ("a future-dated approval after a real rejection",
         full + [record(*help_en, date="2026-12-09", result="not for the website"), record(*help_en, date="2062-12-01")], False),
    ]
    wrong = 0
    for name, lines, expected in cases:
        checks, _ = review_checks(lines, today)
        allowed = all(passed for _, passed, _ in checks)
        wrong += allowed != expected
        print(f"  {'ok' if allowed == expected else 'WRONG'}: {name}: publishing {'allowed' if allowed else 'blocked'}")

    # Every page must have a section, or its review would never be asked for.
    checks, _ = review_checks(full, today, pages=find_pages() + ["crisis-plan/index.html"])
    allowed = all(passed for _, passed, _ in checks)
    wrong += allowed
    print(f"  {'WRONG' if allowed else 'ok'}: a page with no section in the review packets: publishing {'allowed' if allowed else 'blocked'}")

    # The launch list: what counts as a real phone test, and as a person's confirmation.
    phone_cases = [
        ("an iPhone and an Android phone", [("2026-12-02-phone.md", "Real phone test: iPhone 15, iOS 26.1, 2026-12-02, all checks passed\n"
                                                                     "Real phone test: Pixel 8, Android 16, 2026-12-02, all checks passed")], {"iPhone", "Android"}),
        ("a Simulator note", [("2026-11-07-claude-iphone-simulator.md", "Not a real phone.\nReal phone test: iPhone 17 Pro, iOS 26, 2026-11-07, all passed")], set()),
        ("a Simulator line in another note", [("2026-12-02-phone.md", "Real phone test: iPhone 17 Pro Simulator, iOS 26, 2026-12-02, all passed")], set()),
        ("phone-size emulation", [("2026-12-02-phone.md", "Real phone test: iPhone 15 (phone-size emulation in Chrome), iOS 26, 2026-12-02, passed")], set()),
        ("a phone in the file name only", [("2026-12-02-phone.md", "Tried the phone layout in a desktop browser.")], set()),
        ("a result that says not yet", [("2026-12-02-phone.md", "Real phone test: iPhone 15, iOS 26.1, 2026-12-02, not yet")], set()),
        ("a result that says pending", [("2026-12-02-phone.md", "Real phone test: Pixel 8, Android 16, 2026-12-02, pending")], set()),
    ]
    for name, notes, expected in phone_cases:
        found = phone_tests(notes, today)
        wrong += found != expected
        print(f"  {'ok' if found == expected else 'WRONG'}: {name}: real phones counted: {sorted(found) or 'none'}")
    confirm_cases = [("founder A, 2026-12-01", True), ("founder B, Dec 3, 2026", True), ("not yet", False), ("Pending", False),
                     ("founder A, pending, 2026-12-01", False), ("not yet, 2026-12-01", False), ("", False), ("founder A", False),
                     ("2026-12-01?", False)]
    for cell, expected in confirm_cases:
        counted = person_confirmed(cell)
        wrong += counted != expected
        print(f"  {'ok' if counted == expected else 'WRONG'}: \"Person confirmed\" saying \"{cell}\": {'counted' if counted else 'not counted'}")

    total = len(cases) + 1 + len(phone_cases) + len(confirm_cases)
    if wrong:
        print(f"{wrong} case(s) read wrongly, so the publish step can't be trusted until this is fixed.")
        return 1
    print(f"All {total} made-up cases were read correctly.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--publish", action="store_true", help="only the checks that block publishing")
    parser.add_argument("--self-test", action="store_true", help="check how this tool reads review records")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    reviews, not_counted = review_checks()
    missing = [(name, detail) for name, passed, detail in reviews if not passed]
    for line in not_counted:
        print(f"Not counted: {line}")
    if args.publish:
        if not missing:
            print("Reviews of the current text are on record. Publishing can go ahead.")
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
