---
type: handoff
owner: Claude Code, at one founder's request
branch: build/privacy-1109
---

# Privacy and language additions

Date: November 9, 2026.

**State when written: local only,** on branch `build/privacy-1109`, made from `830f766`, the tip of
`claude/jolly-mayer-2m6eno` (draft pull request 5). Not pushed, not merged, not on the public website.
No qualified person has reviewed it, no fluent reader has checked the Spanish, and nothing was tried on
a real phone.

## What was asked

Three privacy and language changes, as drafts: leave the site from the keyboard, a short "Browse
privately" section on both About pages, and make the "Leer en español" link stand out for browsers
whose first language is Spanish.

## Completed

| Part | What changed |
| --- | --- |
| Esc twice | `assets/menu.js`: Esc pressed twice within about a second clicks Quick exit, so the page's head script leaves exactly as the button does. An Esc that closes the open menu doesn't count. Nothing happens while a text box has focus, such as the Daily check-in's. Another key in between, a held-down key, or modifier keys start the count again. No change to the head script or its policy hash |
| About, Quick exit | Both languages: a paragraph on Esc, a line that inside another website's frame Esc may change only Tidelight's part, and that without JavaScript Esc does nothing. The two paragraphs on private windows became one, linking to the new section |
| Browse privately | Both About pages: a new section with steps for Safari on iPhone, Chrome on Android, Chrome on a computer, Firefox and Edge, then what private browsing and clearing history don't hide: the network at school, work or home, monitoring software, and synced devices. Its own source list (11 each): English help pages on the English page, the makers' Spanish help pages on the Spanish page. The draft note says nobody has tried the steps |
| Spanish link | `assets/menu.js` adds `.lang-offer` to an English page's "Leer en español" link when `navigator.languages[0]` is Spanish. `assets/styles.css` gives it a border and tinted background in one small, commented block at the end, using Shoreline's tokens. Same words, nothing stored or sent, no change without the script, and nothing on Spanish pages |
| Tools | `tools/check_site.py`: About pages need a `browse-privately` section, and the browser help pages' date is its own kind, apart from "sources", so it can be rechecked on its own schedule. `tools/set_checked_date.py --part browsers` moves it |
| Tests | `tools/test_browser.py` quickexit group: Esc twice on every page leaves, blanks the page, and replaces it in history; one Esc, two 1.4 seconds apart, a held key, another key between, the menu-closing Esc, and Esc in a Daily check-in text box (both languages) don't leave; inside another site's frame it records which part leaves. Language group: a Spanish preference set through DevTools (`Emulation.setUserAgentOverride` with `acceptLanguage`) in light and dark, with the layout audit; not with English first, not on Spanish pages, not without JavaScript. `tools/test_webkit.py`: one Esc stays, two leave |
| Planted bugs | 13 new in `tools/test_the_tests.py`: 7 for Esc in Chrome, 1 for Esc in WebKit, 4 for the Spanish link, 1 for the missing About section |
| Notes | Questions in [[CONTENT-REVIEW]] under "Privacy and language additions", and a line in its controls table. Rebuilt review packets |

No new page, so `sw.js`, the workflow's copy list, and the page lists are unchanged.

## Sources read November 9, 2026

All read in the built-in browser, read only, nothing submitted.

- Apple: Browse the web privately in Safari on iPhone (iOS 27), and Delete your Safari history, cache,
  and cookies on iPhone, in English and Spanish (es-us guide, es-mx article).
- Google Chrome Help: Browse in Incognito mode, and Delete browsing data in Chrome, each for Android and
  for computers, in English and Spanish (es-419). The Spanish pages say they may include AI translation.
- Firefox Help: Private Browsing - Use Firefox without saving history, and Delete browsing, search and
  download history, in English and Spanish. The Spanish pages are machine translations that show menu
  names in English, so the Spanish About page describes the Firefox steps without quoting menu names,
  and says so.
- Microsoft Support: Browse InPrivate in Microsoft Edge, and View and delete browser history in
  Microsoft Edge, in English and Spanish (es-es; es-mx redirected there).
- The National Domestic Violence Hotline: Internet Safety, in English and Spanish.

Mozilla's English page asked the browser to wait a few seconds before showing it; it loaded on its own.
No crisis number, keyword or crisis detail was added, so [[SAFETY]] is unchanged.

## Checks

Results are in the session's final report. Desktop Chrome and its phone-size emulation, and macOS WebKit
in a window, were used. No iOS Simulator, no real phone, no screen reader.

## Decisions made, all easy to reverse

- **Two presses, not one.** People press Esc to close things, so one press would leave by accident.
- **Esc in Chrome inside another site's frame changes only the frame.** A key press doesn't let a frame
  change the whole window there, unlike a click. The test showed it, and About says Esc "may" do that.
- **Browse privately moved the private-window limits.** The Quick exit section's two paragraphs on
  private windows became one line and a link. The Hotline moved from the first source list to the new one.
- **A date of its own for browser steps.** Otherwise a November 9 date would clash with the other source
  lists' November 6.
- **The highlight doesn't switch language or remember anything.** It only reads the browser's setting.

## Open points

- A licensed reviewer and a fluent Spanish reader need to read the new wording. See [[CONTENT-REVIEW]].
- Nobody has tried the browser steps in each browser, or the Spanish menu names in Spanish browsers.
- The highlight wasn't tried in WebKit, whose test can't set a language preference before load.
- Who rechecks the browser steps, and how often, isn't decided. [[UPKEEP]] doesn't list them yet.
- Pull request 11 swaps this stylesheet: its owner would need to carry the `.lang-offer` block across.

## Next step

Review this branch, then merge it into `claude/jolly-mayer-2m6eno` or open a pull request for it. That
publishes nothing.
