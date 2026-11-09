---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: site/daily-check-in
---

# Daily check-in and self-discovery page

Date: November 9, 2026.

**State when written: pushed to `site/daily-check-in`, a draft pull request into
`site/pro-max-redesign` (Shoreline). Not merged, not on the public website.** No qualified person
has reviewed it, no fluent reader has checked the Spanish, and nothing was tried on a real phone.

## What was asked

One founder supplied a detailed spec for a "Daily Check-In & Self-Discovery" page: a 2 to 3 minute
check-in, "Finding Your Way Back" reflections, personalized suggestions, a private journal, "Your
Journey", and support, under the message "You don't have to have everything figured out. Start
with how you're feeling today." Three choices were asked first:

- **Saving:** first accounts and a server. Later the same day, after a comparison, the founder chose
  a phone app that saves on the phone with the user's iCloud or Google backup. Neither is built, so
  the page saves nothing. See [[CHECK-IN-BACKEND]].
- **Languages:** English and Spanish now.
- **Look:** built on Shoreline.

## Completed

| Part | What works |
| --- | --- |
| Today | "Start today's check-in", then one question at a time: a feeling (9 choices, each with a small light that comes on when chosen), three optional written questions, and needs. Next, Skip, and Back on every step |
| Suggestions | One each for your mind, your connection, and yourself, chosen only from the feeling and needs. "Try something else", "Not today", and "I'd like to try this". Choosing "Someone to talk to" puts 988 first |
| Rediscover | "Finding your way back" with six reflection cards to write in and keep, and "Rediscover something": pick interests, get one free, low-pressure idea |
| Journal | Free writing, four optional prompts, an optional mood tag, and dated entries you can edit and delete |
| Your journey | A calendar of this month with this visit's check-ins, kept reflections, things you'd like to try, things you've enjoyed, and "Things I've learned about myself". No streaks, scores, or missed-day marks |
| Support | Always on the page: the crisis strip, Quick exit, and the 988 panel, plus a short support section. U.S. services only, with a line for people outside the U.S. |
| Delete everything | Clears every answer, list, and entry at once, after a confirmation |
| Privacy | Nothing is sent or stored. Closing or reloading the page erases everything. The page says so in three places |

Every word the page can show is written in the page itself, including all 30 suggestions and ideas
in "See every suggestion" and "See every idea". The script only shows, hides, and copies that text.
Without JavaScript, the whole page shows at once, as plain questions and lists.

## Files

- New: `check-in/index.html`, `es/registro-diario/index.html`, `assets/check-in.js`,
  [[CHECK-IN-BACKEND]], this handoff.
- `assets/styles.css`: a "Daily check-in" block using the Shoreline colors. Square buttons.
- Every page: "Daily check-in" (or "Registro diario") in the phone menu and the footer.
- About pages: the review list and a privacy line about the check-in.
- `sw.js` (offline list, version 8), `.github/workflows/site.yml` (publish list),
  `tools/make_review_packet.py` (sections DAY and E-DAY), rebuilt review packets.
- `tools/check_site.py`: places to type or choose are allowed on these two pages only, and only
  checkboxes, radio buttons, and text boxes with `autocomplete="off"`. It still forbids forms and
  any script that sends or stores data.
- `tools/test_browser.py`: the fold test opens a check-in section's tab before tapping a fold in
  it, as a visitor would.
- Notes: [[SAFETY]] rule 5, [[DECISIONS]], [[CONTENT-REVIEW]], [[STATUS]], [[TASKS]], `CLAUDE.md`,
  README.

## Checked

All on November 9, 2026, in Chromium on Linux. None of it was on a real phone.

| Check | Result |
| --- | --- |
| `python3 tools/check_site.py` | All checks passed, 21 pages |
| A walkthrough of every feature, English and Spanish | 24 of 24 passed: steps, skip and back, suggestions, try something else, not today, keep, reflections, ideas, journal add, edit and delete, Your journey, Delete everything, nothing in local storage, session storage, or cookies, no requests to other sites, no script errors |
| `python3 tools/test_browser.py` | All groups, 5,704 checks, 0 failures. The first run found large text pushing the Start button off screen, section links scrolling before the section showed, and dark-mode buttons with low contrast. All fixed |
| Review packets | Rebuilt. The therapist's packet numbers the page as DAY-1 onward, and the Spanish packet as E-DAY |
| Real phones, screen readers | **Not done** |

## Decisions and open questions

- All proposals, in [[DECISIONS]]. [[CHECK-IN-BACKEND]] now compares ways to save, including a phone app. Questions for the reviewer are in [[CONTENT-REVIEW]], under
  "Questions about the Daily check-in".
- The page is reached from the phone menu and the footer only. Whether Home should link to it is
  for both founders.

## Next step

Both founders try it, decide whether typing belongs on the site, and whether to build the phone app
one founder chose for saving ("The phone app plan" in [[CHECK-IN-BACKEND]]). The licensed reviewer reads sections DAY and E-DAY of the packets.
