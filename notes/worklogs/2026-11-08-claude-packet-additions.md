---
type: handoff
owner: Claude Code, at one founder's request
branch: build/packet-additions, based on e608945 of site/first-version-finish
---

# Review packet additions

Date: November 8, 2026. **State when written: local commit only, not pushed, not merged, and not on the
public website.** No page of the website changed. No qualified person has reviewed anything here, and nothing
was tried on a phone.

## Completed

- **Questions for the fluent Spanish reader.** A new section in [[CONTENT-REVIEW]], "Questions for the fluent
  Spanish reader", holds 20 questions. Each is in Spanish, then its English twin for the founders, then where it
  comes from. They gather what the notes already leave open about Spanish: the three Spanish items in [[SAFETY]]
  (Crisis Text Line's word, HOLA or AYUDA; TTY in Spanish; the 988 LGBTQ+ youth service not offered in Spanish),
  each asked about wording; tú or usted, and whether the wording suits someone in crisis and teens; every Spanish
  question already in [[CONTENT-REVIEW]]; and the compact strip proposed in draft pull request 13, "Llama al 988
  y marca 2 · Envía AYUDA al 988 · Llama al 911", which would drop "Si hay peligro inmediato," where the full
  strip's lead-in is already hidden. The section is marked "Unreviewed AI translation". The Spanish packet shows
  the questions as Parte 5, "Preguntas para usted", with room for answers, so sign-off is now Parte 6.
- **What screen readers hear.** A script listed everything on the 19 pages that a screen reader reads and the
  eye doesn't see, and that neither packet showed: each page's title (19); every `aria-label` (12 different
  wordings in English and 11 in Spanish, 176 in all, until now only in a list without pages in Part 3 and
  Parte 4); the hidden ", home" and ", inicio" after the brand; the hidden section name after each of the 10
  "Show more", "Ver más" and "Mostrar más" buttons, with the button words themselves; and the skip link. The pages
  have no `title` attributes, `aria-description` or named drawings.
  - Each page's section, and the text on every page, now ends with "Read aloud by a screen reader, not shown on
    screen" ("Lo que lee en voz alta un lector de pantalla y no se ve en pantalla"): English in the therapist's
    packet, Spanish in the Spanish packet. A link reads like `Link "Call 988", read aloud as: Call 988, the
    Suicide and Crisis Lifeline`. Spanish words for screen readers on an English page would go to that page's
    section in Part 3 of the Spanish packet. There are none today.
  - The words are part of each section's fingerprint. The text on every page lists each pair of words on screen
    and words read aloud once, so a link renamed on one page shows up as a new line.
  - `tools/check_site.py` reads each page its own way, apart from the packet tool, and fails with "screen reader
    text that no review packet shows" on any such words that no packet shows, such as a new `aria-label` the
    packet tool missed. A Spanish name on an English page with no Spanish section fails like a Spanish line does.
    The publish step's first check fails with it.
  - Everything each packet showed before is still there. Part 3 and Parte 4 keep their list of names.
- **The Spanish packet's date in Spanish.** It now reads "Generado el 8 de noviembre de 2026". Both packets
  write the date from month names in the tool, never from the computer's language setting.
- **The packet fingerprint covers the packet tool.** `notes/review-packet/FINGERPRINT.txt` is now made from
  both packets' text as the tool would write them, with the date and the fingerprint left out, and from what
  makes the PDFs: the PDF settings, the footer, and every month's date. So the stale-packet NOTE in
  `tools/check_site.py` appears after any change that changes what a packet shows, whether in a page, a note,
  `tools/make_review_packet.py`, or what it reads from `tools/check_site.py`, and not after a change to a test or
  another check. It also no longer appears after a page change that no packet shows, such as an HTML comment.
- **`python3 tools/make_review_packet.py --self-test`** checks the dates under the computer's own language
  setting and four others where the computer has them, the questions reaching the Spanish packet, and 11 made-up
  question sections. The build refuses to run if a question has lost its Spanish, its English twin, or its source.
- **Notes:** [[CONTENT-REVIEW]] ("Review records" now says what screen reader words are and that fingerprints
  hold them), [[REVIEWER-NOTES]] (both messages, and where answers to questions go), [[LAUNCH-CHECKLIST]]
  (sections 2, 3 and the publish check), and the docstring of `tools/launch_gate.py`.
- **Tests:** 16 planted bugs in `tools/test_the_tests.py`, 13 that must fail and 3 that must print the
  stale-packet NOTE, and 2 harmless changes that must not print it. NOTE bugs and harmless changes are new kinds
  there, because that report is a NOTE on purpose.

### Section fingerprints

No approval is recorded, so nothing is lost. 21 of 28 changed, because they now hold screen reader words:

| Section | Before | Now |
| --- | --- | --- |
| Home | 9d600d6bda50 | 489cb59b8170 |
| Get Help | 7a6296e3eb5b | 26ee997d5273 |
| Help Someone | 467a910dd4d8 | a30e69d213ba |
| For Teens | 2797cd355481 | 6cafca6ccc75 |
| Not sure what you're feeling? | 4f9e338b72c4 | 10b44a4810e1 |
| After a loss | 4d1c629ecc93 | 1d5d66bdc7e9 |
| Research | b86ea97995c1 | dec86ab9d119 |
| Wallet card and poster | 878efbc32754 | 4bb88250ba10 |
| About and privacy | c413a066acee | 2d2cffba6ec6 |
| Page not found | 1d66cfdc4f45 | 2569c979a487 |
| Text on every page (Part 1) | 129e4c8240e4 | 344567fb201a |
| Inicio | b1d2ce77c776 | 8f8a11d8e26c |
| Obtener ayuda | ad23716b3944 | 34b269f4c929 |
| Ayudar a alguien | 3596ec3ad84d | 3b457bc1d9ed |
| Adolescentes | 5a584c8aa50a | c8efed5a60be |
| ¿No sabes bien qué sientes? | 6a21105c49a6 | d2cf68c4c777 |
| Después de una pérdida | 512f7e2dad11 | 72960af07f82 |
| Investigación | 35ef70bcc7b3 | 173a4eca630b |
| Tarjeta y cartel | e25a82227278 | 6056fa95f868 |
| Acerca de y privacidad | 564c733bdc65 | dc129cba4901 |
| Texto en cada página (Parte 1) | 660985d7fb96 | 255c6736ac93 |

Unchanged: the five sections of Spanish lines on English pages, `Wording outside the page text (Part 3)` and
`Texto fuera de las páginas (Parte 4)`. The packet fingerprint went from 715c9a471f3f to c871c6eabce6.

## Checked

On a Mac, on November 8, 2026, before the commit. Headless desktop Chrome built the PDFs.

- `python3 tools/check_site.py`: "All checks passed", 19 pages, with no NOTE after the rebuild.
- `python3 tools/check_site.py --self-test`: all 5 made-up link answers read correctly.
- `python3 tools/launch_gate.py --self-test`: all 61 made-up cases read correctly.
- `python3 tools/make_review_packet.py --self-test`: all 21 made-up cases read correctly.
- `python3 tools/make_review_packet.py`: built both packets, HTML and PDF (94 and 71 pages).
- `python3 tools/test_the_tests.py --only packet`: 21 planted bugs caught and 2 harmless changes quiet. A script
  ran every planted bug that needs no browser or WebKit: 70 caught, 2 quiet.
- With the packet tool and site check from e608945, the five new planted bugs in pages and notes and the three
  NOTE bugs all went unnoticed.
- The packet fingerprint was the same under four different Python hash seeds.
- A script compared the new packets with e608945's: every piece of text is still there, apart from the build
  date, the section fingerprints, sign-off's move to Parte 6, and three introductions that gained a sentence.
- On a scratch copy, made-up markup (a hidden image, `aria-description`, a `title` attribute, a drawing with a
  title, hidden words outside a link, a link inside `aria-hidden`, a Spanish menu name) all reached the packets,
  and the site check found nothing left out.
- Looked at: the new parts of both HTML packets in headless desktop Chrome with print styles, and three PDF
  pages drawn with macOS PDFKit: the Spanish cover, the first page of Parte 5, and Part 1's screen reader list.
- The full suite runs on the final commit, after this note was written. Its results are reported with this
  branch.

## Decisions and open questions

- Screen reader words sit at the end of the section they belong to, not in a part of their own, so an approval
  covers them and a reviewer sees them with the page.
- Fold buttons get two lines, closed and open, so "Show less" and "Ver menos" are reviewed too.
- Open, from before: visible text that no packet shows on purpose: the menus, "On this page", the "Home" links
  at the top of pages, and "Read in English" on the Spanish pages.
- Limit: the text on every page lists each wording once. Two names swapped between pages, such as the two menu
  names, wouldn't change a fingerprint unless they make a new pair of words.
- The new lists show that the Spanish fold buttons say "Ver más" on Obtener ayuda and "Mostrar más" on Después
  de una pérdida. No note raises it, so it isn't one of the questions.
- Question 9 describes draft pull request 13 as a proposal. Update it if that pull request changes or merges.
- The new self-test isn't in `.github/workflows/site.yml`. Only `tools/test_the_tests.py` and people run it.
- In Parte 5 each question stays on one printed page, which leaves some white space.
- Not updated, as asked: [[STATUS]] and [[TASKS]]. The session that merges this branch records it there.

## Next step

Review this branch, then merge it into the branch behind draft pull request 10, or wherever the founders decide.
Give the fluent Spanish reader the rebuilt Spanish packet, and copy useful answers into the notes each question
comes from. See [[worklogs/2026-11-07-claude-spanish-sections]] for the sections this builds on.
