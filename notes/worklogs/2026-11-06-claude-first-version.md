---
type: handoff
owner: Claude Code (desktop session), at one founder's request
branch: site/first-version-build
---

# Finishing the first version for testing and review

Date: November 6, 2026.

**State when written: draft pull request 9 into `claude/jolly-mayer-2m6eno`, not merged, not on
the public website.** Merging it publishes nothing. Merging pull request 5 into `main` publishes.
No qualified person has reviewed anything here. Both founders still need to agree.

## Completed

| Piece | What was built | Files |
| --- | --- | --- |
| Not sure what you're feeling? | From Pathway A in [[RESEARCH-BRIEF]]. Tap to open five short notes. Nothing to type, nothing saved, no score. 988 and 911 come first | `not-sure/`, `es/que-siento/` |
| After a loss | What you may feel, taking care of yourself, where to find support, talking with children, and guides for schools and workplaces. No details of any death | `after-a-loss/`, `es/despues-de-una-perdida/` |
| About and privacy | What Stillwater is, a page-by-page review list, privacy, and what Quick exit and offline copies can't do | `about/`, `es/acerca-de/` |
| Save 988 to contacts | A contact card file, on Get Help, For Teens, Wallet card, and About | `assets/988-lifeline.vcf`, `assets/988-linea-es.vcf` |
| Review status | Every page says draft. About lists clinical and Spanish review as pending. `tools/check_site.py` fails if a page claims a review that isn't in "Review records" in [[CONTENT-REVIEW]] | About pages, `tools/check_site.py` |
| Review packets | Numbered sentences, source addresses, questions, and a sign-off for role and date. One for the therapist, one for a fluent Spanish reader | `tools/make_review_packet.py`, `notes/review-packet/` |
| Spanish Research page | The whole page is now translated | `es/investigacion/` |
| Phone test | Steps for a real phone, and a preview server that behaves like GitHub Pages | [[PHONE-TEST]], `tools/preview_server.py` |
| Browser tests | Python and Chrome only, no installs | `tools/test_browser.py`, `tools/browser.py` |

The two new content pages also appear in the phone menu, on the homepage, and in every footer.

## Bugs found and fixed

| Bug | Fix |
| --- | --- |
| Printing any page except the wallet card came out blank | Print rules now apply only to the card pages. Other pages print plainly, with folded sections open |
| Focused links could sit behind the Quick exit button | `scroll-padding-bottom` |
| "Leer en español" and "Home" tap areas overlapped | Removed a negative margin |
| Wallet card pages scrolled sideways at larger text | Cards can shrink, and long addresses wrap |
| Long link text pushed Spanish Help Someone and pills off narrow screens | Allowed wrapping |
| The offline list missed the larger photo, so an iPhone's home page could lose its photo offline | Added it, and tested at iPhone pixel density |
| The notes said Back doesn't return to Stillwater after Quick exit. Testing showed Back still reaches earlier pages | Wording corrected, and the limit is on the About pages |
| An independent check found Spanish urgent steps without the Spanish route, and wording that could mislead | See "Checked" below |

## Checked

Every result below is from desktop Chrome 157.0.8103.39 unless it says otherwise. **Phone-size
emulation in desktop Chrome is not a test on a phone.**

Automated, `python3 tools/test_browser.py`, final run: 4444 checks, 0 failures.

| Group | Checks | What it did |
| --- | --- | --- |
| links | 808 | Every internal link, image, section jump, and file, served under `/suicideprevention/`. Notes and tools are not served |
| matrix | 418 | 19 pages at 11 sizes, portrait and landscape, phone to desktop plus 400% zoom, light and dark: no sideways scrolling, clipped text, overlapping controls, broken images, console errors, failed requests, or outside requests. Contrast measured against WCAG AA |
| textsize | 114 | Browser text size at 150% and 200%, on 3 phone sizes |
| keyboard | 2314 | Every Tab stop, phone size and desktop: visible focus, not hidden, skip link works |
| menu | 22 | Opens, Escape, tapping outside, following a link, landscape, rotating to desktop |
| jumps | 387 | Every section link lands on visible text, not behind the pinned strip |
| folds | 42 | Every fold opens and closes by real click, and from a direct address |
| language | 19 | Every English and Spanish switch, both ways |
| quickexit | 60 | On every page. See the results below |
| reducedmotion | 19 | With the setting on, nothing animates or scrolls smoothly |
| nojs | 19 | With JavaScript off, crisis links, the menu, and Quick exit remain |
| print | 18 | Every page prints with its content, from light or dark mode. Wallet cards fit 2 sheets |
| contact | 161 | Every call and text link matches [[SAFETY]], read but never followed. Contact cards are valid |
| a11ytree | 19 | Reads Chrome's accessibility tree: names and landmarks. **This is not a screen reader test** |
| offline | 24 | Below |

**Offline, in desktop Chrome with the local server stopped.** After one visit, 30 files are saved, at
iPhone pixel density. Every page opened with its styles, images, and crisis links. An unsaved address
showed the page-not-found page with the crisis numbers. A changed page showed on the first visit back
online and replaced the saved copy. A new `VERSION` replaced the old saved files. Pages on the real site
can lag up to 10 minutes, because GitHub Pages sends `max-age=600`, read from the live site. The
built-in browser in the Claude app refused to register the offline worker with a generic error, though it
could fetch the same file. Chrome registered it. That browser's limit isn't explained.

**Quick exit, against a stand-in for weather.gov.** On every page, it replaces the current page in
history. After visiting two pages, Back still reaches the earlier one. With JavaScript off, it's a plain
link, so the page stays in history. With no connection, the tab shows the browser's error page.

**Call and text links.** Every link was read and compared with [[SAFETY]]. None was tapped, and the tests
refuse to click them. No call, text, chat, or form was placed or submitted.

**By eye, with screenshots:** main pages on a phone size and desktop, light and dark, landscape, printed
Get Help, printed wallet cards, and packet pages. A built-in browser check clicked a menu and a fold.

**Other checks.**

- `python3 tools/check_site.py --check-links`: all pass. A few providers block scripts, and those open in a
  browser. Mutation test: 11 planted breaks of the new rules were all caught.
- The publish step, run locally: 19 pages copied, no notes.
- Crisis numbers on the provider's page, read again November 6: 988 (Spanish, veterans, press 3, PRIDE,
  Deaf and hard of hearing, 240 languages), Veterans Crisis Line, The Trevor Project, Crisis Text Line,
  SAMHSA, and the FCC. They match [[SAFETY]]. A person still needs to confirm them.
- Two independent AI checks: one compared every Spanish page with its English twin, and one checked the
  new pages' claims against their sources. Their findings are fixed, or listed below. These are not
  human review.

**iOS Simulator: not run.** Xcode was still downloading when this was written, so no simulator or iOS runtime was available. See [[PHONE-TEST]].

## Not checked

- **A physical iPhone or Android phone. VoiceOver or TalkBack.** Use [[PHONE-TEST]].
- Whether Call and Text links open the right screen on a phone.
- Saving a contact on a real phone.
- Offline on a real phone, which needs HTTPS.
- Clinical accuracy, fluent Spanish, and legal wording. These need people.
- The AFSP booklets and toolkits are image-only flipbooks. The links open, but their text wasn't read.
- GitHub's scheduled and publishing workflows have never run on `main`.

## Decisions and open questions

Choices made are in [[DECISIONS]]. All are easy to reverse, and none settles an open decision. Reviewer
questions are in [[CONTENT-REVIEW]], under "Questions about the first-version additions". "No estás solo"
stays in the Spanish headline for a fluent reader to decide.

## Next step

Try it on a phone with [[PHONE-TEST]]. Both founders read pull request 9, then decide what the public site
shows until review. Then give the packets to the therapist and a fluent Spanish reader.

## Second working session: where it stopped

The usage limit stopped this session early. Done and pushed: content security policy and no-referrer on every page, offline notice, Spanish crisis text on the page-not-found page, slow-network, high-contrast, and privacy tests, 33 planted bugs caught, browser tests on pull requests, launch check and publish safety check, monthly crisis source check, date tool, [[FOUNDER-BRIEF]], [[LAUNCH-CHECKLIST]], [[REVIEWER-NOTES]], [[UPKEEP]], [[SHORTER-SENTENCES]].

**The usage limit stopped work again on November 7, 2026.** Pushed since the note above: the crisis strip redesign with Quick exit inside it on phones, saved-copy timing for weak signal, a WebKit test for Macs, and source-checked corrections to Research, Get Help, Help Someone, For Teens, the wallet card, and the Spanish crisis details.

**Not done:**

- **Audit findings.** Those for safe messaging, the crisis, teen, and bereaved readings, privacy wording, accessibility, code, and docs were checked by a second agent but are not applied. The Spanish and iOS and Android findings were never verified, and the completeness check didn't run. See [[worklogs/2026-11-06-claude-audit-partial]].
- **Two items from the areas already applied.** The interpreter sentence on the English Trevor Project card, and a person opening the FCC text-to-911 page, which refused the automated read.
- **iOS Simulator tests.** Not run. The iPhone Simulator was still downloading when last read, at 82.7%, so no iOS result exists.
- **Three independent code reviews.** Not run.
- **Full test runs.** After the last content commits, the site check passed, and the links, contact, and layout browser tests passed on the changed pages. The complete browser, WebKit, and planted-bug runs need repeating. The planted-bug list grew to 45 and hasn't had a full run.
- **Out of date.** The review packets, the screenshots in `notes/attachments/qa-first-version/`, which show the old strip, the description of pull request 9, and the test counts above.
