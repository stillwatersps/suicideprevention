---
type: handoff
owner: Claude Code (desktop session), at one founder's request
branch: site/first-version-finish
---

# Finishing the first version's audit, tests, and notes

Date: November 7, 2026.

**State when written: draft pull request 10 into `claude/jolly-mayer-2m6eno`, not merged, not on
the public website.** Merging it publishes nothing. Merging pull request 5 into `main` publishes.
No qualified person has reviewed anything here, and the Spanish is an unreviewed AI translation.

This continues [[worklogs/2026-11-06-claude-first-version]]. Pull request 9 merged at commit
`0f9d170`, then the project was renamed Tidelight ([[worklogs/2026-11-07-claude-rename-tidelight]]).
The fixes made after that merge were merged onto the renamed branch first.

## Completed

| Piece | What changed |
| --- | --- |
| Audit, 14 areas | Every finding from the AI audit was checked by a second agent against its source, then applied in both languages, or turned into a reviewer question or a founder item. The Spanish and iPhone and Android findings, and a completeness check, were verified today. Areas: research, crisis details, Get Help, Help Someone, safe messaging, a reader in crisis, teens, people bereaved by suicide, privacy statements, Spanish, accessibility, iPhone and Android, code, and docs |
| Safe messaging | Three research papers whose full text names methods are cited without links, and no page says why any more, since that pointed to them. Research findings end with a next step |
| Crisis reader | Right now links call, text, and chat. Text 988 buttons say "Send any message", with 988's first texting steps below. Save 988 to your contacts moved below Right now |
| Teens | Private windows and school devices, the school counselor association's real exception, the model school policy, plain words for legal terms, and that contacting 988 isn't anonymous |
| After a loss | What AFSP's Healing Conversations form asks and who sees it, talking with children, Survivor Day, wider resource lists, and TAPS's 24/7 line (new SAFETY row) |
| Accessibility | A Deaf or hard of hearing link on every page, English words marked on Spanish pages, sized icons, forced-colors edges, the menu with larger text, and an announced offline note |
| iPhone landscape | Found in the iOS Simulator: Safari lays out a sideways iPhone 17 at 750 by 292, so the strip stopped pinning. It now pins as one row. Crisis strip links are 44 px tall at every width |
| Quick exit | Switching apps during Quick exit no longer shows the page again in a browser tab. Only a Home Screen app does, so it isn't left blank |
| Menu fallback | If the site script hasn't loaded after 3 seconds, the page list shows as plain links |
| Offline | Version `tidelight-v7`. Addresses without a final slash go to the saved page. [[UPKEEP]] says how to retire offline support safely |
| Spanish | Its own Home Screen manifest, the 988 Lifeline's full Spanish name, and "Fuentes consultadas el" for source dates |
| Tools | Two rounds of code review fixes: a stricter publish check, stricter crisis-source and keyword checks, more browser and WebKit checks, and more planted bugs. See "Checked" |
| Notes | 53 questions from the audit in [[CONTENT-REVIEW]], 14 founder items in [[FOUNDER-BRIEF]], corrected [[STATUS]], [[TASKS]], [[DECISIONS]], [[UPKEEP]], [[PHONE-TEST]], [[LAUNCH-CHECKLIST]], and rebuilt review packets |

## iOS Simulator results

November 7, 2026. Xcode's iOS Simulator, **iPhone 17, iOS 27.2 (24B8117)**, Safari, on a Mac.
The site came from this computer at `http://localhost:8123/suicideprevention/`. This is a
simulated iPhone, not a real one: no phone service, no real touch, and the Mac's network.
Call and Text links were never tapped. Screenshots are in `attachments/ios-simulator-2026-11-07/`.

| Check | Result |
| --- | --- |
| Home, Get Help, After a loss, Not sure, Spanish Get Help in portrait | Pages drew correctly. The strip showed 988 and 911 with Exit beside them |
| Phone menu | Opened, listed all 8 pages, and Get Help opened from it |
| Language switch | Leer en español opened the Spanish twin, and Read in English came back. Safari offered its own translation, which is Safari, not the site |
| Quick exit | Went to weather.gov. Back skipped the page that was left and showed the earlier Tidelight page, which drew normally, not blank. This matches the limits on the About pages |
| Save 988 to your contacts | Opened Apple's contact preview: the name, a phone row labeled VOICE 988, the 988 website, the full note, and Create New Contact or Add to Existing Contact. Create New Contact put the whole name in the first-name field. Cancelled with Discard Changes, so nothing was saved |
| Landscape | **Found a bug.** Safari measures 750 by 292 for layout here, even after its toolbars shrink, so the strip stopped pinning and 988 and 911 scrolled off screen. Fixed the same day: the strip now pins as one row with Exit inside it, in English and Spanish. Checked again in the Simulator after the fix |
| Offline | Tested by stopping the preview server, since the Simulator uses the Mac's network. After a loss, never opened in Safari before, still opened from the saved copy, and an unknown address showed the saved page-not-found page with the crisis numbers. The offline notice didn't appear, because the phone itself still had a connection. Turning off a real phone's connection is a step in [[PHONE-TEST]] |
| Dark mode | Not sure drew correctly in dark mode |
| Safari's Privacy Report | On the home page it said "No Trackers Contacted" |
| Add to Home Screen | Not tested: Safari's Share sheet didn't open in the Simulator |

Not covered by the Simulator: real phone service, the dial and compose screens, VoiceOver,
Android, adding to the Home Screen, and a weak real-world signal.

## Checked

All on November 7, 2026, on the final code of this branch, on a Mac. Each kind of test is
listed apart, because none of them is a real phone.

| Check | Kind | Result |
| --- | --- | --- |
| `tools/check_site.py` | Reads the files | All checks passed, 19 pages |
| `tools/check_site.py --check-links` | Loads each outside link once, read only | 112 links: 105 answered (90 with 200, 15 PubMed pages with 203), 7 blocked scripts (403) and are listed for a person: both 988 chat addresses, two JAMA articles, two CDC pages, and the FCC's text-to-911 page |
| `tools/test_browser.py`, all 18 groups | Desktop Chrome and its phone-size emulation | 0 failures: links 845, matrix 456, text size 190, keyboard 2594, menu 22, jumps 541, folds 48, language 19, Quick exit 68, reduced motion 19, no JavaScript 19, print 18, contact 184, accessibility tree 19, offline 34, speed 19, modes 76, privacy 21. 46 notes, mostly links inside sentences under the 44 px aim |
| `tools/test_webkit.py` | macOS WebKit in a window, not iOS | 151 checks, 0 problems |
| `tools/test_the_tests.py` | Plants one bug at a time | All 111 planted bugs caught. The untouched copy passed all 22 test groups and 6 other checks first |
| `tools/launch_gate.py --self-test`, `tools/check_crisis_sources.py --self-test`, `tools/check_site.py --self-test` | Made-up cases | 58 of 58, 20 of 20, 5 of 5 |
| `tools/check_crisis_sources.py`, live | Reads each provider's page once | Run once by a code-fix agent: 10 pages showed our details. The FCC page refused (403), so a person must read it |
| `tools/check_live.py --local` | A local copy built the way publishing will build it | Passed, and no notes or tools are published |
| iOS Simulator, iPhone 17, iOS 27.2 | Simulated iPhone, Safari | See the section above. Rechecked after the last fixes: Get Help in portrait, and pinned as one row on its side after scrolling |
| Real iPhone or Android phone | Not run | **Not done.** See [[PHONE-TEST]] |

The publish job itself has never run, because Pages still publishes from a branch. Its copy step was
simulated locally. Phone-size screenshots from Chrome are in `attachments/qa-first-version/`, with all of
them on one page in `phone-layouts.jpg`. The code-fix agents' own handoff is
[[worklogs/2026-11-07-claude-review-gate-fixes]].

## Decisions and open questions

Recorded in [[DECISIONS]] as proposals, not agreed by both founders: the strip pins on a phone on
its side, and its limits grow with larger text. Everything else is in [[FOUNDER-BRIEF]] and the
"Questions from the November 7 audit" in [[CONTENT-REVIEW]].

## Next step

Try the site on a real iPhone and Android phone with [[PHONE-TEST]]. Both founders read
[[FOUNDER-BRIEF]] and decide what the public site shows. Then the review packets go to the licensed
therapist and a fluent Spanish reader.
