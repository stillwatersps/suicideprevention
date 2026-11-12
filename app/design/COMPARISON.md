# Before and after: "Dawn at the Shoreline"

A screen-by-screen record of the phone app's visual redesign (`app/DESIGN-BRIEF.md`). **A draft.
Neither founder has compared these yet, no reviewer has seen it, and it has not run on a real
phone.**

## How to see the pictures

The pictures are not in the repository (about 800 files). Make them on your own computer:

```bash
cd app
npm ci && npx playwright install chromium
git switch app/redesign-dev && npm run build && node tools/screens.mjs before
git switch app/visual-identity && npm run build && node tools/screens.mjs after
```

Each pass saves about 40 pictures into `app/design/before/<mode>/` or `app/design/after/<mode>/`,
with the same file names in both, so any two can be opened side by side. The modes are English and
Spanish, light and dark, a small phone (375 by 667) and a large one (402 by 874), plus two passes
at the largest text size. They come from desktop Chromium at phone sizes, muted. They are not from
a phone. Ten pictures were also taken in the iOS Simulator (iPhone 17, launched muted): Home, Check-in,
Location, Friends, and Get Support, each in light and dark mode. They are in
`app/design/after/simulator-iphone17/` on the computer that took them.

## What never changed

The crisis strip (Call 988, Text 988, Call 911, Exit), Get Support Now, the language link, both
"Draft for review" notices, the privacy notice, Support, and the 988 panel are on every screen, in
the same places, with the same words. They changed color only: dark ink and paper, no texture, no
animation, at a contrast of at least 7 to 1 in light and dark mode. In dark mode the crisis buttons
turn light so they never sink into the page.

## Screen by screen

| Picture | Before | After |
| --- | --- | --- |
| `01-onboarding-01-welcome` | Three rotating wave shapes in a box, a system serif heading | A flat horizon with light at its edge, the name in small capitals, the heading in Fraunces |
| `01-onboarding-02` to `08` | White cards, green buttons, progress as round dots | Type on paper, one coral button per page, progress as thin bars, line icons |
| `01-onboarding-09-done` | A tick in a circle | The horizon at full dawn |
| `02-home-first-day` | A greeting, a streak card reading 0, three equal buttons, cards for everything | A hero with the greeting above the horizon and one phrase lit from behind; one feature card for the next check-in; the streak as a row (same words); four tinted tiles |
| `03-home-setup-open` | A ring with "3/8" | A thin progress line with "3/8" beside it; the same "Setup 3/8" line |
| `04-checkin-tab` | A stack of identical cards | One row with the action, then a list with hairlines |
| `05-checkin-breath`, `06`, `07` | Five drawn faces in a row | A horizon strip whose light grows as you go; five rows, each a tone and a word, with a check when chosen |
| `08-checkin-done` | A thanks line, then back to Home after two seconds | The full dawn, the same thanks line in large type, and two choices |
| `09-home-after-check-in` | A streak number, a week of ticks, a milestone card on some days | The same streak number and words; the week as seven dots; the milestone as a quiet card with no burst |
| `10-checkin-support-after-very-low` | Support card under the page's usual decoration | The support card alone: no horizon, no light, ink buttons |
| `11-streak` | "Your streak": ticks and snowflake emoji in boxes | The same words; days as dots with a shape for each state (filled, soft with a ring, dashed, double ring); numbers in Fraunces |
| `12-settings` | Settings start with your name | Settings start with Get Support Now, then the same groups as before |
| `13` to `19` (Daily check-in, Journal, Rediscover, Hope box, Your journey) | The website's blue and white controls | The same words and controls in the app's shapes: pill buttons, paper panels, hairlines, coral for the one main action |
| `13-daily-question-1` | Nine options in one long list | The same nine, in the same order, as tiles two across (one list at the largest text) |
| `20-meditate` | A grid of four cards with emoji | A feature card for the suggestion, then rows with a small scene tile, length chips, and Start |
| `21-builder` | Emoji choice cards | Line icons, the same choices |
| `22-player`, `23-player-controls` | Ocean scene with moving wave bands | Ocean is a still horizon whose glow breathes; the session's name and the time left sit at the bottom |
| `24-meditation-complete` | A tick and a burst of drops | The horizon at full dawn, slowly; no burst. Nothing at all on a day with a very low check-in |
| `25-history` | Cards | Rows |
| `26-location`, `27-friends` | Long paragraphs in one panel | Short sections under their own headings, with more room. Only plain how-to text is under a "Learn more" row (how to add a place; how to share). All privacy and consent wording stays in view. No word changed |
| `28-get-support-now` | Green primary action | Ink primary action, outlined secondary actions |

## Self-check against the brief

- [x] Horizon on Home, check-in, completion, and onboarding. No waves anywhere.
- [x] One coral button per screen section; crisis controls are never coral.
- [x] No pure black or white; every color comes from `src/tokens.css` (the lint enforces it).
- [x] Fraunces for headings, Figtree for everything else, both bundled.
- [x] No emoji used as pictures. One emoji remains inside a thanks line that is awaiting review.
- [x] Dark mode ("night tide") for every screen.
- [x] Reduce Motion: fades only, no drift, no stagger, the dawn simply there.
- [x] Largest text on the small phone: no sideways scrolling in any section the tests visit.
- [ ] Real phone: not done. Haptics, fonts at system text sizes, and the launch screen need one.
- [ ] VoiceOver: labels are checked by the tests; nobody has listened to it.

## Three strongest screens, three weakest

Strongest: Home (the hero finally gives the app a face), the quick check-in (the light arriving
is the idea of the app in one strip), and Get Support Now (the plainest, clearest thing on screen).

Weakest, as first built: Location and Friends (long blocks of careful wording), the Daily
check-in's first question (nine options in one list), and the tab bar at the largest text on a
small phone. A follow-up addressed all three without changing a word: short sections (with only
how-to text under "Learn more"), two-across tiles, and an icons-only tab bar when the labels can't fit. Still weak:
the streak row on a first day, which reads "0 day streak".
