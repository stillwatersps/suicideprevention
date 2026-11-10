---
type: handoff
owner: Claude Code, at one founder's request
branch: build/packets-1109, from 830f766 (the tip of claude/jolly-mayer-2m6eno, the branch behind draft pull request 5)
---

# Review packet improvements

Started November 9, 2026, stopped by a usage limit, finished November 10. **State when written: local only.** Local
commits on `build/packets-1109`, not pushed, no pull request, not merged, and not on the public website. No page of the
website, stylesheet or script changed. No qualified person has reviewed anything here, and nothing was tried on a phone.

## Completed

- **The packet additions from November 8 are merged** (`fix/packet-additions-2026-11-08` at dbd95a2, which was local
  only and based on e608945). Both packets show what a screen reader hears inside each section's fingerprint (page
  titles, `aria-label`s, hidden words, image descriptions), the Spanish packet has a questions part (Parte 5), and it
  gives its date in Spanish. Its handoff is [[worklogs/2026-11-08-claude-packet-additions]]. Two conflicts, both kept
  whole: `notes/CONTENT-REVIEW.md` has the Daily check-in questions and then the questions for the fluent Spanish
  reader, and `tools/check_site.py` has the check-in page list and the screen reader attributes. The Daily check-in
  pages' screen reader words reach both packets with no other change: page title, "Check-in sections", "An idea", and
  the calendar's name, in English and Spanish.
- **A shared line taken off or changed on one page is now noticed.** Part 1 and Parte 1 still list each different line
  once, and so does "Español en cada página en inglés". A line that isn't on every page of its language now carries a
  note under it, such as "On every page except Home." or "Only on Get Help.", and the note is part of the section's
  fingerprint. So a line taken off one page, changed there to a new wording or to another page's wording, moved to
  another shared part, or given a link to another place there, gives the section a new fingerprint, and its approval
  stops counting. Links within the site are compared by where they lead, so `../get-help/` and
  `/suicideprevention/get-help/` are one link, and each language switch counts as one link to its own page's twin. A
  link to a place on its own page, such as each header's `#support`, stays as written. Today's notes are expected:
  Home has no crisis buttons, three panels use a different 988 sentence, Get Help's own links to its Spanish and Deaf
  parts start with `#`, and the wallet card page has the "Save 988" lines. `tools/make_review_packet.py` (`listing()`).
- **The packet tool's self-test is listed with the routine checks.** The check job in `.github/workflows/site.yml`
  runs it (since dbd95a2; its step name now says what it covers). `README.md`, [[UPKEEP]] step 6 and
  [[LAUNCH-CHECKLIST]]'s monthly recheck list it.
- **A "what changed" packet:** `python3 tools/make_review_packet.py --changes` writes `tidelight-review-changes` for the
  therapist and `tidelight-spanish-review-changes` for the fluent Spanish reader, HTML and PDF. Each has only the
  sections whose fingerprint differs from that reviewer's newest qualifying approval in "Review records", with the
  approved text and the text now side by side, words taken out struck through, words added underlined in bold, and
  unchanged lines between changes skipped. The approved text is found in git history: the newest commit that changed
  the pages, `assets/` or the packet tool and gives the section the approved fingerprint, with that commit's own packet
  tool or today's. Both columns show the text the way today's tool does. With no such commit, or no history, it shows
  the text now and says why. It also lists the sections unchanged since approval and those with no approval, notes a
  newer record that isn't an approval, and ends with a sign-off table of the new fingerprints. It changes nothing in
  git; `.gitignore` keeps these packets out of the project. Explained in [[REVIEWER-NOTES]] ("After a change") and
  `README.md`.
- **Earlier review points, each checked first:**
  - `tools/test_the_tests.py`: a harmless change counted as quiet if it printed no NOTE the untouched copy didn't
    also print, whatever its exit code. dbd95a2 and a4eaa16 changed it: it now needs exit 0 and no NOTE or FAIL line
    at all. Checked November 10 with two made-up harmless changes in a scratch script, one that makes the site check
    exit 1 and one that makes it crash: both were reported as NOISY.
  - The packet's own heading "Read aloud by a screen reader, not shown on screen" had a sentence number at 79f3caa;
    dbd95a2 removed it. Checked November 10: no number on it in either packet.
  - Spanish question 9 now says the compact strip is on these pages, since pull request 13 merged on November 9 at one
    founder's request, still a proposal both founders haven't agreed, and that it appears only on a short screen,
    such as a phone on its side, including with larger text. Checked against the compact strip's rules in
    `assets/styles.css`, whose height limits are in em, so with larger text a taller screen counts as short. An
    earlier draft added "never because of larger text alone", which isn't exact for that reason, so it was taken out.
  - Question 12, and the November 7 audit note it comes from, now say only what [[SAFETY]] records: no recorded source
    answers it, and the FCC's text-to-911 page refused automated reads on November 6 and 7. The audit note no longer
    says what the FCC's pages say.
  - Question 1 no longer asks how to say Crisis Text Line's word once confirmed. It says no word goes on the pages
    until a person confirms one with Crisis Text Line and records it, and asks only whether the current sentence is
    clear.
  - [[REVIEWER-NOTES]] said each page ends with the crisis links' full names. dbd95a2 corrected it: Part 1 and each
    page end with what a screen reader reads aloud there, such as the full names of the crisis links in Part 1.
- **A new question 21** for the fluent Spanish reader, about the Daily check-in's Spanish feelings ("Con esperanza" to
  "Sin energía", read from `es/registro-diario/index.html`), from "Questions about the Daily check-in", Spanish.
- **Tests added:** 5 planted bugs for the shared-line notes (the crisis buttons' 911 line, the 988 texting-steps line
  and the crisis strip's 911 line taken off For Teens, For Teens' 988 sentence changed to Help Someone's wording, and
  its Deaf link sent elsewhere, each after made-up approvals); all 5 went unnoticed with the tools at 05085a2. 5 planted
  bugs for `--changes`. 19 new self-test cases: 9 for the notes and 10 for `--changes`, in a scratch copy with a
  scratch git history and made-up approvals, including a lawyer's approval and a clinician's approval of a Spanish
  section, which must not count.
- **Packets rebuilt**, HTML and PDF, on November 10. Packet fingerprint `c5fd0060cb45`.

Sources read: no website. The rewording uses only [[SAFETY]], [[DECISIONS]], the pages in `es/`, and
`assets/styles.css`, read November 9 and 10, 2026. No crisis number, keyword or claim was added.

### Section fingerprints

No approval is recorded, so nothing is lost. Compared with 830f766, 24 of 30 changed, all because they now hold screen
reader words (dbd95a2). Part 1, Parte 1 and "Español en cada página en inglés" changed also because of the notes on
which pages show a line.

| Section | 830f766 | Now |
| --- | --- | --- |
| Home | 9d600d6bda50 | 489cb59b8170 |
| Get Help | 7a6296e3eb5b | 26ee997d5273 |
| Help Someone | 467a910dd4d8 | a30e69d213ba |
| For Teens | 2797cd355481 | 6cafca6ccc75 |
| Daily check-in | 8d31ca1668aa | 905d47be054d |
| Not sure what you're feeling? | 4f9e338b72c4 | 10b44a4810e1 |
| After a loss | 4d1c629ecc93 | 1d5d66bdc7e9 |
| Research | b86ea97995c1 | dec86ab9d119 |
| Wallet card and poster | 878efbc32754 | 4bb88250ba10 |
| About and privacy | f116a1768bd7 | 855cb90f6474 |
| Page not found | 1d66cfdc4f45 | 2569c979a487 |
| Text on every page (Part 1) | 129e4c8240e4 | f6608768c69f |
| Inicio | b1d2ce77c776 | 8f8a11d8e26c |
| Obtener ayuda | ad23716b3944 | 34b269f4c929 |
| Ayudar a alguien | 3596ec3ad84d | 3b457bc1d9ed |
| Adolescentes | 5a584c8aa50a | c8efed5a60be |
| Registro diario | 38fdfa7ffe7d | 8c602c6636c5 |
| ¿No sabes bien qué sientes? | 6a21105c49a6 | d2cf68c4c777 |
| Después de una pérdida | 512f7e2dad11 | 72960af07f82 |
| Investigación | 35ef70bcc7b3 | 173a4eca630b |
| Tarjeta y cartel | e25a82227278 | 6056fa95f868 |
| Acerca de y privacidad | 6f70678428a5 | 56eb80d31f84 |
| Español en cada página en inglés | 3dcdf38758dc | 333468d4cb67 |
| Texto en cada página (Parte 1) | 660985d7fb96 | 42fb93aa86c4 |

Unchanged: Wording outside the page text (Part 3), Texto fuera de las páginas (Parte 4), Español en Get Help, Español
en After a loss, Español en Wallet card and poster, and Página no encontrada.

## Checked

On a Mac. Headless desktop Chrome built the PDFs. No browser test or WebKit test was needed or run, because no page,
stylesheet or script changed. Results from November 10, after the last change:

- `python3 tools/check_site.py`: "All checks passed", 21 pages, no NOTE after the rebuild.
- `python3 tools/check_site.py --self-test`: all 5. `python3 tools/launch_gate.py --self-test`: all 61.
  `python3 tools/make_review_packet.py --self-test`: all 40. `python3 tools/check_crisis_sources.py --self-test`: all
  20. `python3 tools/check_live.py --local`: 20 pages, nothing unpublished shown.
- `python3 tools/test_the_tests.py --only` with "packet" (28 caught, 2 quiet), "after its approval" (7), "what-changed"
  (5), "screen reader" (7), "one page" (9), "build date" (2), "Spanish reader" (3), "image" (3), "menu names" (1), and
  "with the packets up to date" (2 quiet): all caught or quiet.

- On November 9, before the last change: `--changes` on this branch's real history with made-up approvals of the
  fingerprints printed at 830f766 (Get Help, Part 1, Obtener ayuda) and a made-up fingerprint (Research), in the
  working copy, then removed: it found commit 2423aac for the three, through the packet tool of that time, and said
  why Research had none, after reading all 71 commits in about 2.5 minutes. One page of a demo PDF, drawn with macOS
  `sips`, was looked at.
- Not run: the full suite, which this task didn't ask for; `tools/test_browser.py` and `tools/test_webkit.py`, since
  no page, stylesheet or script changed; anything on a phone or in the iOS Simulator.

## Decisions and open questions

- **For the founders:** Part 3 and Parte 4 still list every screen reader name a second time, beside the page lists,
  with their own numbers and decision boxes, so one `aria-label` change stops two sections' approvals. Whether to drop
  that list is a choice about what a reviewer signs, left for the founders.
- The notes on which pages show a line don't record order: a line that only changes its place among the lines of its
  part, on one page, changes no fingerprint. [[LAUNCH-CHECKLIST]] says so.
- The "same as" mark in the Spanish packet is still in English, as before.
- Question 7 still asks how to say «siguiente» if 988 confirms it, which is like the old question 1. Left as it is,
  because it wasn't part of this task; reword it the same way if the founders agree.
- The "what changed" packets aren't committed or checked by `tools/check_site.py`. They're built when needed.
- Not updated, as asked: [[STATUS]] and [[TASKS]].

## Next step

Review this branch, then merge it into `claude/jolly-mayer-2m6eno`, the branch behind draft pull request 5, or wherever
the founders decide. Merging there publishes nothing. Then give the rebuilt packets to the reviewers, and after any
later change, give each reviewer their "what changed" packet.
