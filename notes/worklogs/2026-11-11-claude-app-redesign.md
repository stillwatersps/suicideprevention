---
type: handoff
owner: Claude, at one founder's request
branch: app/redesign-dev
---

# Phone app redesign from a founder's build spec

Date: November 11, 2026

One founder sent a build spec for the phone app (`app/BUILD-SPEC.md`) and asked for it to be built in
nine phases, without stopping. The same founder then added six safety rules that override the spec.
**The other founder hasn't seen the spec. No licensed reviewer, fluent Spanish reader, or lawyer has
seen any of it. It has not run on a real phone. It publishes nothing.**

## Completed

On `app/redesign-dev`, a draft pull request (25) into `app/first-build`. The branch starts from pull
request 19's branch with pull requests 20 and 21 merged in, so their commits show in it until they merge.
Each phase was a `feature/p*` branch merged back with a merge commit.

- **Phase 0:** storage layer with migrations, config module, lint, unit tests, `app/CLAUDE.md`,
  `app/PROGRESS.md`.
- **Phase 1:** design tokens, shared components, five bottom tabs (Home, Check-in, Meditate, Location,
  Friends), every older section given a place, the app's start screen.
- **Phase 2:** onboarding, the setup ring, two check-in styles, a quick check-in, support shown at once
  for a very low mood, reminders from "check-ins per day", Settings, a hidden Developer section.
- **Phase 3:** streaks with freezes, the streak card and screen, milestones, a gentle "new start" card,
  and a switch to turn streaks off.
- **Phase 4:** the meditation engine: timeline, three worlds drawn in code, breathing guide, voice,
  ambient sound, haptic breathing, the player, the session record.
- **Phase 5:** Silent, 1-minute reset, Deep session, and Sleep; suggestions; history.
- **Phase 6:** the custom builder, its generator, and presets.
- **Phase 7:** haptics wired everywhere, press states, motion, Reduce Motion.
- **Phase 8:** checks, the Simulator, `app/TESTING_CHECKLIST.md`, `app/CHANGELOG.md`, these notes.

Outside `app/`: one app-only line in `assets/check-in.js` (`addCheckIn`, which the website never
calls), and these notes. No page, no crisis number, and no reviewed-pending website wording changed.

In the older app words (`app/src/text/en.html`, `es.html`): the four-reminder section and its hint were
removed (Settings replaces them); Delete everything's note now lists the new data it removes; Your
journey's note no longer says "There are no streaks"; the place alert says "on the Location tab".

## Checked

See `app/PROGRESS.md` for the numbers at the time of the last run. In short:

- `npm test` in `app/`: the lint, the unit tests, and the three browser test files, in desktop Chromium
  with stand-ins for the phone. Not a phone.
- `python3 tools/check_site.py`, `tools/test_browser.py`, `tools/test_webkit.py`, and
  `tools/make_review_packet.py`, because one website file changed.
- The iOS Simulator, as far as `app/PROGRESS.md` records. A simulator can't feel haptics, play through a
  silent switch, deliver a reminder with the app closed, or know where it is.
- **Not checked:** any real phone; Android at all (no Android tools on this Mac); VoiceOver or TalkBack by
  ear; battery; whether sound continues with the phone locked.
- No call, text, chat, or form reached any crisis service at any point.

## Decisions and open questions

Proposed in [[DECISIONS]] under November 11, 2026, with the full list in `app/PROGRESS.md`. The ones a
founder should look at first:

- **The safety frame is on every screen in full**, so each screen is the new compact part on top and the
  same notices, Support, and 988 panel below. During a meditation the crisis strip stays on screen.
- **The date of birth stays required** in onboarding. The spec wanted every page skippable.
- **Streaks exist, gently, and can be turned off.** Whether an at-risk person should have them at all is
  the first question in [[CONTENT-REVIEW]], which has sixteen questions about this work.
- **The text cut:** new screens are short. The older sections kept their words, because they are the
  website's own or are consent, privacy, and crisis wording.
- **Pull request 21** (My circle and Hope box, the other founder's draft) is inside this branch, because
  the Friends tab needs it. Its files were barely touched.
- **Assets a founder could add**, all optional: voice recordings and rain and ocean loops. The list and
  the folders are in `app/PROGRESS.md`.

## Next step

Both founders read `app/BUILD-SPEC.md`, the six rules in `app/CLAUDE.md`, and the questions in
[[CONTENT-REVIEW]], and decide whether to keep this direction. Then one of them goes through
`app/TESTING_CHECKLIST.md` on a real iPhone, and the reviewer reads
`notes/review-packet/tidelight-app-words.html`.
