---
type: handoff
owner: Claude, at one founder's request
branch: app/daily-check-ins
---

# Daily check-in reminders, shared check-ins, forty ideas, and a code check

Date: November 9, 2026, evening.

**State when written: on `app/daily-check-ins`, a draft pull request into `app/first-build` (pull
request 16's branch). Not merged. Merging publishes nothing: `app/` isn't part of the website, and
the one website file changed (`assets/check-in.js`) changes nothing the website does.** The app has
never run on a phone. No reviewer, fluent reader, or lawyer has seen any of it.

## What was asked

One founder asked Claude to look through the whole project, check that merging works as it should,
list thirty things that would make the app the best of its kind, work out the logistics of alerting a
group of people when someone stays near a place known for suicide, add check-ins in the morning, at
midday, after school if wanted, and before bed, with the option to share them with guardians or
physicians, find ten more things, and then check that all the code is correct and works.

## What was done

| Part | Where |
| --- | --- |
| The location idea, worked out: how phones notice a place, what they allow when sending, where places could come from, who gets the alert, the risks, and the order to build in. Claude recommends the person's own places, a wait time, and a one-tap send, and no built-in list | [[LOCATION-ALERT]] |
| Four daily check-ins and sharing, designed | [[CHECK-IN-SCHEDULE]] |
| Built in the app: four optional reminders with neutral words, shown by the phone; today's check-ins listed by time of day with the feeling and needs chosen; Share today's check-ins and Share the last 7 days through the existing share notice | `app/src/app.js`, `app/src/text/en.html`, `es.html`, `app/src/app.css`, `app/tools/build.mjs` |
| Thirty ideas, then ten more, each with why it matters and what it needs | [[IDEAS-ROUND-3]] |
| Code fixes found while checking: dates restored from the phone came back as text, so the calendar stopped marking days and journal dates showed raw; the app's test browser (Playwright) was missing from `app/package.json`, so `npm test` failed on a fresh computer; the app's tests didn't run on GitHub | `assets/check-in.js` (the app-only `setState`), `app/package.json`, `.github/workflows/site.yml` (new `app` job) |
| The notifications plugin added to the Android project, and to the iPhone `Podfile` by hand, because this Mac has no CocoaPods | `app/android/*.gradle`, `app/ios/App/Podfile` |
| Notes: [[IDEAS]], [[CHECK-IN-BACKEND]], [[CONTENT-REVIEW]], [[CODE-MAP]], [[STATUS]], [[TASKS]], [[DECISIONS]], `app/README.md` | |

## Does merging work as it should?

Checked on November 9, 2026:

- **Pull request 12**, the one crisis page: merges cleanly with today's `main`; its publish check
  passed on GitHub and catches 11 of 11 planted faults on the merged result. Going live still
  needs the other founder's approval, then the Pages setting, in the order its description gives.
- **Pull request 5's publish gate**: `tools/launch_gate.py --self-test` reads all 61 made-up cases
  correctly, and `--publish` stops publishing because no review is recorded. That is the intended
  behavior until the reviewer signs off.
- **Pull requests 17 and 18** merge cleanly into pull request 5's branch, with green checks; a
  separate session was merging them and setting branch protection, Issues, and the Wiki.
- **Pull request 16**, the app: mergeable, but its tests had no GitHub job and depended on a
  package it didn't list. Both fixed here.
- **This Mac** had no Node.js, so the app's tests couldn't run on it. Node was installed with
  Homebrew. It has Xcode but no CocoaPods and no Android Studio, so neither phone project was built.

## Checked

| Check | Result |
| --- | --- |
| `cd app && npm test` | 136 of 136 passed, 68 in each language, desktop Chromium with browser stand-ins. Reminders can't fire in a browser |
| `python3 tools/check_site.py` | All checks passed, 21 pages, after the new notes were staged |
| `python3 tools/test_browser.py --pages check-in` and `--pages registro` | Every group passed on both pages, except the contact-card check, which needs pages this filter leaves out (as before) |
| `python3 tools/test_webkit.py --pages check-in` | 27 checks, 0 problems, macOS WebKit in a window |
| `python3 tools/make_review_packet.py` | Rebuilt; the app's words still aren't in the packets (an open task) |
| On a phone | **Not tried.** Reminders, the permission question, the share sheet, and saving need a real iPhone and Android phone |

## Decisions and open questions

- Every reminder is off until the person turns it on. The notification says only "A moment to
  check in, if you'd like."
- The shared summary holds the time of day, feeling, and needs, never journal entries or
  reflections. Whether that is the right detail for a parent or a clinician is a reviewer question.
- Nothing automatic is built. Sending check-ins or a location without a tap needs accounts and a
  server, which the founders set aside in [[CHECK-IN-BACKEND]].
- The Android reminders use inexact alarms, so one may arrive a few minutes late. Exact alarms need
  another permission Google restricts; not worth it for a reminder.
- Tapping a reminder opens the app's Home, not the check-in page, because the app's script runs
  only on the check-in pages. A small later change.

## Next step

Both founders read [[LOCATION-ALERT]] and [[CHECK-IN-SCHEDULE]] and decide; the reviewer reads the
new words in `app/src/text/`; a founder with CocoaPods or Android Studio runs the app and tries the
reminders on a real phone, following [[PHONE-TEST]]. Then merge this into pull request 16's branch,
which publishes nothing.
