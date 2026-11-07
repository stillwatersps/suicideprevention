---
type: handoff
owner: Claude Code, at one founder's request
branch: build/spanish-sections, based on f2e6a70 of site/first-version-finish
---

# Spanish lines on English pages reach the Spanish reader

Date: November 7, 2026. Local commit only. Not pushed, not merged, and not on the public website.

## Completed

- **The Spanish lines on the English pages have sections of their own in the Spanish packet,** each with a
  fingerprint in its sign-off table. A script found them: 34 elements marked `lang="es"` on the 10 English
  pages. Before, only the 404 page's sentence reached the Spanish packet. The rest reached only the
  therapist's packet, and two reached neither packet: the "Leer en español" switch on every page, and the "En
  español" link under "On this page" on Get Help.
- **The new sections are in Part 3 of the Spanish packet:** `Español en cada página en inglés` ("Leer en
  español" and "Ayuda en español"), `Español en Get Help`, `Español en After a loss`, `Español en Wallet card
  and poster`, and the existing `Página no encontrada`. The text outside the pages is now Part 4, so its
  section is `Texto fuera de las páginas (Parte 4)`. Sign-off is Part 5.
- **`tools/make_review_packet.py` finds Spanish anywhere on an English page:** a whole Spanish block, a few
  Spanish words in an English sentence, and navigation the English packet leaves out, such as the language
  switch and "On this page". A Spanish screen reader name on an English page would go in the Spanish
  outside-text section. None exists today.
- **`tools/check_site.py` and `tools/launch_gate.py` need a section for any Spanish on an English page,**
  whether or not the page has a Spanish twin. That exemption is gone. The publish gate needs a fluent
  Spanish reader's approval of each new section, like any Spanish section. A review claim on an English
  page also needs its Spanish lines approved. On the About pages, a page's Spanish result can say
  "Approved" only when its Spanish page and its own Spanish lines are both approved.
- **No earlier section's fingerprint changed.** The English packet only gained one sentence in its
  introduction, and its packet fingerprint.
- **Notes:** "Review records" in [[CONTENT-REVIEW]], [[REVIEWER-NOTES]], [[LAUNCH-CHECKLIST]] (now 12 English
  and 16 Spanish record lines), and the Spanish reader's task in [[TASKS]].
- **Tests:** three made-up cases in the publish gate's self-test, seven planted bugs in
  `tools/test_the_tests.py`, and new expected words for the 404 page's planted bug.

## Checked

On a Mac, on November 7, 2026. No website page was tested in a browser or on a phone for this task. Headless
Chrome built the PDFs, and took screenshots of the Spanish packet's print layout to check the new rows.

- `python3 tools/check_site.py`: all checks passed.
- `python3 tools/launch_gate.py --self-test`: all 61 made-up cases read correctly.
- `python3 tools/launch_gate.py`: lists the 12 English and 16 Spanish sections as not approved, as expected,
  with 13 items still in the way, the same count as before. `--publish` stops publishing.
- `python3 tools/make_review_packet.py`: built both packets, HTML and PDF.
- `python3 tools/test_the_tests.py`, run only for parts of it: `--only "Spanish line"` caught 8 of 8,
  `--only gate` 10 of 10, `--only packet` 7 of 7, `--only review` 7 of 7, and `--only "About page"` 2 of 2.
- A separate script read the raw HTML of the English pages and found all 34 Spanish elements in a Spanish
  section. With the old tools from f2e6a70, the three new planted Spanish lines went unnoticed.
- On a scratch copy, one made-up approval per section, named as the sign-off tables print them, let the
  publish step go ahead. Changing one Spanish sentence on Get Help then stopped it, for `Get Help` and for
  `Español en Get Help`.

## Decisions and open questions

- The Spanish in the parts every English page shares, and the two links to Spanish, form one section,
  listed once per wording. So the reader doesn't approve "Leer en español" ten times.
- An English line with a few Spanish words, such as a Spanish source title, appears whole, for context.
- The English packet keeps these lines too, so the therapist still reads each page whole.
- A page's address, such as `get-help/`, no longer names a section in a record, because Get Help now has two.
  Records use the names in the sign-off tables, as the notes already say.
- Open: the Spanish pages also hold English lines, mostly source titles, that only the Spanish packet shows.
  This task didn't look at them.
- Open: the packet fingerprint doesn't cover the tools, so `tools/check_site.py` doesn't notice when a
  change to a tool needs the packets rebuilt.
- Open, older and cosmetic: long sentence numbers such as E-OUTSIDE-12 wrap in the printed packets, and
  the Spanish packet prints its build date in English.
- Not updated: [[STATUS]], since other task branches are being built at the same time. Whoever merges them
  should add this branch there.

## Next step

Review this branch, then merge it into the branch behind pull request 10, or wherever the founders decide.
Give the fluent Spanish reader the rebuilt Spanish packet. See [[worklogs/2026-11-07-claude-review-gate-fixes]]
for how the fingerprints work.
