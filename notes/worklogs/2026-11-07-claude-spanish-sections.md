---
type: handoff
owner: Claude Code, at one founder's request
branch: build/spanish-sections, based on f2e6a70 of site/first-version-finish
---

# Spanish lines on English pages reach the Spanish reader

Date: November 7, 2026. Local commits only. Not pushed, not merged, and not on the public website.

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
- **`tools/make_review_packet.py` finds Spanish marked `lang="es"` on an English page:** a whole Spanish
  block, a few Spanish words in an English sentence, and navigation the English packet leaves out, such as
  the language switch and "On this page". A Spanish screen reader name on an English page would go in the
  Spanish outside-text section. None exists today. Spanish with no mark is a separate check, below.
- **`tools/check_site.py` and `tools/launch_gate.py` need a section for any Spanish on an English page,**
  whether or not the page has a Spanish twin. That exemption is gone. The publish gate needs a fluent
  Spanish reader's approval of each new section, like any Spanish section. A review claim on an English
  page also needs its Spanish lines approved. On the About pages, a page's Spanish result can say
  "Approved" only when its Spanish page and its own Spanish lines are both approved.
- **Fingerprints:** the first commit changed none of the earlier ones. The review fixes below changed two,
  `Text on every page (Part 1)` and `Texto en cada página (Parte 1)`, because the header's Menu button label
  is now in them. No approval is recorded yet, so nothing was lost. The other 26 are unchanged.
- **Notes:** "Review records" in [[CONTENT-REVIEW]], [[REVIEWER-NOTES]], [[LAUNCH-CHECKLIST]] (now 12 English
  and 16 Spanish record lines), and the Spanish reader's task in [[TASKS]].
- **Tests:** three made-up cases in the publish gate's self-test, and 13 planted bugs in
  `tools/test_the_tests.py`: seven in the first commit, six with the review fixes. The 404 page's planted bug
  has new expected words.

## Fixes after an independent review

A second AI review of the first commit found two gaps. Both were tried on scratch copies first, and both
were real.

- **Text outside the parts the packets number reached neither packet.** The packet builder read headings,
  paragraphs, list items and a few other tags. Text anywhere else was dropped, in either language: a sentence
  in a div, a span outside a paragraph, a table cell, a caption, a quote, or text after a heading inside a
  list item. No fingerprint changed with it, so a recorded approval still counted, and the publish step would
  have let the new wording go live. On today's pages, only the header's Menu button label was dropped.
  - Now the builder also numbers table cells, captions, quotes, labels, smaller headings and button labels.
    So the Menu and Menú labels are in Part 1 of each packet.
  - Any other visible text makes `tools/check_site.py` fail, naming the page and the text. The publish
    step's first check fails too, and the packet builder stops rather than leave the text out.
- **Spanish without `lang="es"` on an English page went unnoticed.** It reached only the therapist's packet,
  and a screen reader would read it with English sounds. Now `tools/check_site.py` fails on English-page text
  that looks Spanish but has no language mark: letters such as ñ, é or ¿, or the Spanish way to give a crisis
  number, such as "al 988" or "y marca 2". A name or word from another language passes once it's marked with
  that language, such as `lang="fr"`.
  - Still a limit: Spanish with none of those signs and no mark isn't found. So mark every Spanish line with
    `lang="es"`. [[CONTENT-REVIEW]] now says so.

## Checked

On a Mac, on November 7, 2026. No website page was tested in a browser or on a phone for this task. Headless
Chrome built the PDFs.

First commit:

- `python3 tools/check_site.py`: all checks passed.
- `python3 tools/launch_gate.py --self-test`: all 61 made-up cases read correctly.
- `python3 tools/launch_gate.py`: lists the 12 English and 16 Spanish sections as not approved, as expected,
  with 13 items still in the way, the same count as before. `--publish` stops publishing.
- `python3 tools/make_review_packet.py`: built both packets, HTML and PDF. Screenshots of the Spanish
  packet's print layout showed the new rows.
- `python3 tools/test_the_tests.py`, run only for parts of it: `--only "Spanish line"` caught 8 of 8,
  `--only gate` 10 of 10, `--only packet` 7 of 7, `--only review` 7 of 7, and `--only "About page"` 2 of 2.
- A separate script read the raw HTML of the English pages and found all 34 Spanish elements in a Spanish
  section. With the old tools from f2e6a70, the three new planted Spanish lines went unnoticed.
- On a scratch copy, one made-up approval per section, named as the sign-off tables print them, let the
  publish step go ahead. Changing one Spanish sentence on Get Help then stopped it, for `Get Help` and for
  `Español en Get Help`.

After the review fixes:

- `python3 tools/check_site.py`: all checks passed, 19 pages. `--self-test`: all 5 made-up link answers read
  correctly. `python3 tools/check_readability.py` ran without errors.
- `python3 tools/launch_gate.py --self-test`: all 61 made-up cases read correctly, in about 2 seconds.
- `python3 tools/launch_gate.py`: 13 items still in the way, as before, and "Every page, and all its text,
  has a section in the review packets" is done. `--publish` stops publishing, with 12 English and 16 Spanish
  sections not approved.
- `python3 tools/make_review_packet.py`: built both packets, HTML and PDF. The HTML changed only by the new
  Menu and Menú rows, the numbers after them in Part 1, the two Part 1 fingerprints, and the packet
  fingerprint. No PDF page was looked at.
- `python3 tools/test_the_tests.py`: `--only "Spanish line"` caught 12 of 12, `--only packet` 11 of 11,
  `--only gate` 10 of 10, `--only review` 9 of 9, and `--only "About page"` 2 of 2. A script ran every planted
  bug that needs no browser or WebKit, 54 in all, and each was caught.
- With the first commit's tools, all five new planted page bugs passed `tools/check_site.py`.
- On a scratch copy with a made-up approval for all 28 sections, publishing could go ahead. Then a Spanish
  line in a div inside Get Help's Spanish part stopped both the publish step and the site check. With the
  first commit's tools, the same line let publishing go ahead.
- A script listed visible text outside every numbered part on all 19 pages: the Menu labels before the fix,
  nothing after.
- Not run: `tools/test_browser.py`, `tools/test_webkit.py`, and the browser half of
  `tools/test_the_tests.py`, because no page or style changed.

## Decisions and open questions

- The Spanish in the parts every English page shares, and the two links to Spanish, form one section,
  listed once per wording. So the reader doesn't approve "Leer en español" ten times.
- An English line with a few Spanish words, such as a Spanish source title, appears whole, for context.
- The English packet keeps these lines too, so the therapist still reads each page whole.
- A page's address, such as `get-help/`, no longer names a section in a record, because Get Help now has two.
  Records use the names in the sign-off tables, as the notes already say.
- Text outside every numbered part fails the checks. It isn't added to a packet on its own, because its place
  in a section would be a guess. Putting it in a paragraph makes its place clear.
- The Menu label is numbered rather than let through, so the fluent reader sees "Menú".
- Open: Spanish with no `lang="es"` and none of the signs above isn't found.
- Open, older: neither packet shows a page's title, or the words only screen readers say, such as ", home"
  after the brand name and the section name after each "Show more" button. The packets leave them out on
  purpose, and this task didn't change that.
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
