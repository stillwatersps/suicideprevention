---
type: handoff
owner: Claude, at one founder's request
branch: app/launch-readiness
---

# Phone app launch readiness from a founder's brief

Date: November 12, 2026

One founder sent a third brief for the phone app (`app/LAUNCH-BRIEF.md`): no new features and no
new wording, only testing, measuring, fixing, and documenting, so the app is as ready as it can be
before people review it. Partway through, the same founder asked for one feature: the bottom tab
bar on every page inside the app.
**The other founder hasn't seen the brief. No licensed reviewer, fluent Spanish reader, or lawyer
has seen any of it. It has not run on a real phone. It publishes nothing.**

## Completed

On `app/launch-readiness`, a draft pull request into `app/redesign-dev`. The branch is cut from
`app/visual-identity`, so it carries pull request 26's commits until that merges. In `app/` only,
plus these notes and one line in `.gitignore`.

- **Wording locked.** Four strings the visual redesign had changed were restored (pushed to pull
  request 26), and a test now fails if any reviewed or pending wording changes.
- **Crisis paths.** Every crisis control on 37 screens and states, in two languages, is listed in
  an inventory and checked on every test run: present, large enough, clear enough, not covered,
  and leading to the right place.
- **Safety rules.** 25 written rules, each with a test. The low-mood and quiet-day rules have one
  implementation.
- **Accessibility, performance, damaged data, privacy, Spanish parity:** a test suite for each,
  all in `npm test`.
- **Twelve faults fixed.** The list is in [[LAUNCH-READINESS]], "Final results". The most
  serious: the app came back blank after Quick exit; 911 could not be reached in Spanish at the
  largest text; the crisis strip was nearly unreadable in the fallback layout in dark mode.
- **The tab bar on every page inside the app** (the founder's request): the website's 19 pages in
  the app now carry the same five tabs. The public website is unchanged.
- **Documents, all drafts, none sent:** [[FOUNDER-SUMMARY]], [[REVIEWER-PACKET]], [[LEGAL-PACKET]],
  [[APP-STORE-READINESS]], [[PRIVACY-INVENTORY]], [[APP-STORE-PRIVACY-DRAFT]],
  [[THIRD-PARTY-LICENSES]], [[LAUNCH-BACKLOG]].

## Checked

- `npm test` in `app/`: 131 unit tests and 2,305 browser checks, 0 failed (desktop Chromium,
  muted, with stand-ins for the phone).
- `npm run test:ios`: 11 Swift tests pass.
- `python3 tools/check_site.py`, `test_browser.py`, `test_webkit.py`, and
  `make_review_packet.py`: all pass.
- Rebuilt and launched muted in the iPhone 17 Simulator; Home, Check-in, Location, Friends, and
  Get Support looked at in light and dark. Cold launch 1,771 ms (median of 5), unchanged.
- **Not checked:** anything on a real phone. No call, text, or chat to a crisis service was ever
  started.

## Decisions and open questions

- No decision was made for the founders. Everything that needs one is in [[LAUNCH-BACKLOG]]; the
  wording questions are in [[CONTENT-REVIEW]], "Questions from the launch readiness work"; the
  legal ones are in [[LEGAL-PACKET]].
- The brief said "no new features". The tab bar is one; the founder asked for it directly. It is
  its own commit and is recorded in `app/PROGRESS.md`.
- The largest open questions: whether streaks belong in this app; whether children under 13 are
  included; the crisis strip at the largest text sizes; and that there is no privacy policy.

## Next step

Both founders read [[FOUNDER-SUMMARY]] (one page). Then: find a reviewer and a lawyer and send
them their packets, and one founder runs the app on a real iPhone with
`app/TESTING_CHECKLIST.md`. Review pull requests 25, 26, and this one in that order.
