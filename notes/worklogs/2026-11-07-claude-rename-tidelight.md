---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: claude/jolly-mayer-2m6eno
---

# Renamed from Stillwater to Tidelight

Date: November 7, 2026.

## Completed

- First merged `site/first-version-build` (draft pull request 9) into this branch,
  at the founder's request, so the rename covers all 19 pages. That merge publishes
  nothing, and closes pull request 9.
- Replaced Stillwater with Tidelight in every page in English and Spanish, the home
  screen app name, the tools and tests (including the setting
  `TIDELIGHT_CHROME_NO_SANDBOX`), and the current notes.
- Rebuilt the review packets with `tools/make_review_packet.py`:
  `notes/review-packet/tidelight-review-packet.pdf` (70 pages) and
  `tidelight-spanish-review-packet.pdf` (47 pages). The old Stillwater PDFs are removed.
- The offline storage is now `tidelight-v5`. On a visitor's next visit, copies saved
  under the old `stillwater-` name are deleted.
- Recorded the change in [[DECISIONS]] and added a trademark check to [[TASKS]].

Not changed, on purpose: `design/homepage.svg` and its source, which show the old name;
earlier handoff notes, which are history; screenshots in attachments; and the GitHub
organization `stillwatersps` and the website address.

## Checked

- `python3 tools/check_site.py`: all checks passed, 19 pages.
- `python3 tools/test_browser.py` in Chromium: 4,581 checks in 18 groups, 0 failures.
- Packet PDFs: "Tidelight" 122 and 78 times, "Stillwater" 0 times.
- A browser with an old `stillwater-v4` offline copy had it removed after one visit.
- No "Stillwater" left in live files except the comment explaining the cleanup.

## Decisions and open questions

- One founder chose the name. The other founder's agreement isn't recorded.
- Trademark and domain checks are still open.

## Next step

The other founder pulls this branch and reviews the name. Then the review packets go
to the therapist and a fluent Spanish reader.
