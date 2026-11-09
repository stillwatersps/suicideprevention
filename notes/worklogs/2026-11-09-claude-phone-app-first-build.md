---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: app/first-build
---

# Phone app first draft: saving, age setup, and sharing

Date: November 9, 2026.

**State when written: pushed to `app/first-build`, a draft pull request into
`claude/jolly-mayer-2m6eno`. Not merged.** The app is not part of the website, so merging publishes
nothing. It has never run on a phone. No reviewer, fluent reader, or lawyer has seen it.

## What was asked

One founder asked to start building the reflections and sharing options, to build the age setup,
and to research which strategies work for which age groups.

## What was built

| Part | What it does |
| --- | --- |
| `app/` | A Capacitor app that shows the website's own pages, with Android and iPhone projects |
| Saving | The Daily check-in is saved on the phone only, after every change, and restored when the app opens. Nothing goes to Tidelight |
| Age setup | Asks a date of birth once, before the check-in. Keeps only the age group and forgets the date. 988, 911, and Quick exit stay on screen. Your journey shows the group and can ask again |
| For your age | One card in today's results with ideas for the person's age group, drawn from [[AGE-STRATEGIES]] |
| Share this reflection | Share buttons on journal entries, kept lists, and today's feeling. A notice comes first, the words can be changed, then the phone's share sheet opens |
| App wording | Privacy lines, journal and journey notes, Delete everything, and the About page now describe the app's saving. Every word is in `app/src/text/` |
| Research | [[AGE-STRATEGIES]]: seven sources read on November 9, 2026, by age group, with quotes, and a proposal for the reviewer |

## Files

- New: `app/` (see `app/README.md`), [[AGE-STRATEGIES]], this handoff.
- `assets/check-in.js`: offers `window.TidelightCheckIn` so the app can read and restore the check-in.
  The website never calls it and stores nothing.
- `tools/check_site.py`: skips `app/`, which isn't part of the website.
- Notes: [[IDEAS]] (E2a and E3 built in the draft), [[CHECK-IN-BACKEND]], [[DECISIONS]],
  [[CONTENT-REVIEW]], [[STATUS]], [[TASKS]], START HERE, and `CLAUDE.md`.

## Checked

In desktop Chromium on Linux, November 9, 2026. **Not on a phone, not in the iOS Simulator, not in an
Android emulator.** Native saving and the native share sheet were not run: the test uses the app's
browser stand-ins.

| Check | Result |
| --- | --- |
| `cd app && npm test` | 56 of 56 passed, 28 in each language |
| `python3 tools/check_site.py` | All checks passed, 21 pages |
| `python3 tools/test_browser.py --pages check-in` and `--pages registro` | Every group passed on both pages, except the contact card check, which needs pages this filter leaves out |
| `python3 tools/make_review_packet.py` | Rebuilt. The app's own words aren't in the packets yet; see [[TASKS]] |

## Research notes

- Several sites (PubMed Central, NIMH, SPRC, Cochrane) weren't allowed in this cloud session's network.
  One founder's environment now allows them, and Claude read the pages directly.
- Two sources couldn't be read: SPRC's older adults page and NIMH's parent flyer. Nothing is taken
  from them.

- A second round the same day, at the founder's request, added six sources: a 2023 BMJ review of
  young people (with the classroom program for young children, YAM and SOS for teens, and DBT with
  family for teens), the 2018 safety plan with follow-up calls for adults, a review of programs for
  older adults, the Trevor Project's 2024 survey, and the CDC and WHO overviews. PubMed began refusing
  automated reads, so three trials were used only as other sources describe them. [[AGE-STRATEGIES]]
  ends with proposals for the app; none is built.

## Open questions

- In [[CONTENT-REVIEW]], under "Questions about the phone app", and at the end of [[AGE-STRATEGIES]].
- Whether children under 13 use the app at all, and how. A lawyer must advise.

## Next step

The reviewer reads `app/src/text/en.html` and [[AGE-STRATEGIES]]. A founder with a Mac runs the app in
Xcode, and one with an Android phone runs it from Android Studio, following `notes/PHONE-TEST.md`.
