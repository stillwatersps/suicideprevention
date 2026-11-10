---
aliases: [Code map, Where things are]
status: kept current by whoever changes the layout
---

# Code map: where everything is, and what to run

[[00 START HERE|Back to Start Here]]

Written November 9, 2026, so a person or a Claude session can find their way without reading the
whole project. **Start here before changing code.** Keep it short. When you add, move, or remove a
file or a check, update this page in the same change.

Checked on branch `app/first-build`, which holds everything else plus the phone app.

## The three parts

| Part | Where | Who sees it | Published by |
| --- | --- | --- | --- |
| The website | Page folders at the top level, `es/`, `assets/` | The public, once merged into `main` | GitHub Pages, from `main` |
| The phone app | `app/` | Nobody yet; never run on a phone | Nothing. Built by hand with `npm run build` |
| The shared notes | `notes/` (the Obsidian vault), `design/` | Both founders. Public too, while Pages serves `main` | Not meant to be published: see open decision 2 in [[DECISIONS]] |

## The website

Plain HTML, CSS, and two small scripts. No build step, no framework, no outside scripts or fonts.

| Page | English | Spanish twin |
| --- | --- | --- |
| Home | `index.html` | `es/index.html` |
| Get help | `get-help/` | `es/obtener-ayuda/` |
| Help someone | `help-someone/` | `es/ayudar-a-alguien/` |
| For teens | `teens/` | `es/adolescentes/` |
| Research | `research/` | `es/investigacion/` |
| Wallet card | `card/` | `es/tarjeta/` |
| Not sure what you're feeling? | `not-sure/` | `es/que-siento/` |
| After a loss | `after-a-loss/` | `es/despues-de-una-perdida/` |
| About and privacy | `about/` | `es/acerca-de/` |
| Daily check-in | `check-in/` | `es/registro-diario/` |
| Page not found | `404.html` | (one page, with Spanish lines inside) |

Every page repeats the same crisis strip, Quick exit, header, menu, and footer as plain HTML.
There are no shared templates, so **a change to a shared part means editing all 21 pages**, in
both languages. `tools/check_site.py` catches pages that drift apart.

### Assets

| File | What it does |
| --- | --- |
| `assets/styles.css` | All the styles, in marked sections, in this order: base layout (crisis strip, header, home, inner pages, footer) to about line 790; the compact crisis strip from about 791; wallet cards and print from about 972; **Shoreline**, the current look, from about 1009; the Daily check-in from about 1229 to the end. Later sections override earlier ones, so look at the end first |
| `assets/menu.js` | The phone menu, folded sections, and offline support. Every page loads it. Quick exit's click handler is a small script in each page's head, so it works before this file loads |
| `assets/check-in.js` | The Daily check-in only: steps, suggestions, journal, Your journey, Delete everything. It sends and stores nothing. At its end, `window.TidelightCheckIn` lets the app save |
| `assets/*.vcf` | "Save 988 to contacts" cards, English and Spanish |
| `assets/images/`, icons | The home photo and app icons |
| `sw.js` | Offline copies. Change `VERSION` when the list of core files changes or a crisis detail is corrected |
| `manifest.webmanifest`, `es/manifest.webmanifest` | Home-screen app name and icons |

### Each page has a Content Security Policy

Pages allow only their own scripts and styles. An inline script needs its hash added to the page's
`Content-Security-Policy` meta tag. Prefer a file in `assets/`.

## The phone app

All in `app/`. See `app/README.md` for how to build and run it.

| Path | What it is |
| --- | --- |
| `app/tools/build.mjs` | Copies the website into `app/www/`, then adds the app's blocks to the two check-in pages and the two About pages. Fails loudly if the website changed so a block no longer fits |
| `app/src/text/en.html`, `es.html` | **Every word the app adds**, as named blocks. Change words here, never in `app.js` |
| `app/src/app.js` | Saving on the phone, age setup and accommodations, larger text, sharing |
| `app/src/app.css` | Styles for the app's blocks |
| `app/src/extras.js`, `extras-logic.js`, `extras.css`, `app/src/text/extras.*.html`, `app/tools/build-extras.mjs` | The Hope box and My circle, kept in their own files. `app.js` and `build.mjs` each pull them in with one line |
| `app/tools/make-words-packet.mjs` | Writes `notes/review-packet/tidelight-app-words.html`, every word the app adds, numbered for reviewers. Run it after changing `app/src/text/` |
| `app/test/app-test.mjs` | 47 checks per language in desktop Chromium |
| `app/test/screens.mjs` | Phone-size screenshots of the age screens |
| `app/android/`, `app/ios/` | Native projects made by Capacitor. Don't edit by hand except settings |
| `app/www/`, `app/node_modules/` | Made by the build and `npm install`. Never committed |

## Tools (`tools/`, Python 3)

| Tool | When to run it |
| --- | --- |
| `check_site.py` | **Before every website change.** Links, crisis numbers and markup, page structure, Spanish twins, places to type, notes' links, review packets up to date |
| `test_browser.py` | Before sharing a page change. About 5,700 checks in Chrome at many screen sizes, text sizes, both themes. `--only GROUP` and `--pages TEXT` run part of it |
| `make_review_packet.py` | After changing any page or `notes/CONTENT-REVIEW.md`. Rebuilds the PDFs in `notes/review-packet/` |
| `test_the_tests.py` | After changing a check. Plants bugs and expects the checks to catch them. Slow; `--only TEXT` runs part |
| `test_webkit.py` | On a Mac only, for Safari's engine |
| `launch_gate.py` | Says what still blocks going public |
| `check_live.py`, `check_crisis_sources.py` | Run by the scheduled workflow; check the live site and providers' pages |
| `check_readability.py` | Long-sentence report for the reviewer |
| `preview_server.py` | Serves the site locally, as GitHub Pages would |
| `set_checked_date.py` | After a real re-check of crisis numbers |
| `browser.py` | Shared Chrome helper for the other tools |

GitHub runs `check_site.py` and `test_browser.py` on every pull request (`.github/workflows/site.yml`),
and the live checks daily and monthly (`monitor.yml`).

## What to change, and what to run

| To change | Edit | Then run |
| --- | --- | --- |
| Words on a page | That page **and its Spanish twin** | `check_site.py`, `make_review_packet.py` |
| Something every page shares (strip, menu, footer) | All 21 pages | `check_site.py`, `test_browser.py`, packets |
| A crisis number or keyword | The pages, then the table in [[SAFETY]] with the provider page and date | `check_site.py`, packets, and change `VERSION` in `sw.js` |
| The look | `assets/styles.css`, usually the Shoreline section | `test_browser.py` |
| A new page | The page and its twin, `sw.js` (list and `VERSION`), `.github/workflows/site.yml` copy list, the About pages' review list, `tools/make_review_packet.py` | Everything above |
| The Daily check-in | `check-in/`, `es/registro-diario/`, `assets/check-in.js` | `check_site.py`, `test_browser.py --pages check-in`, then `cd app && npm test` |
| The app's words or behavior | `app/src/` | `cd app && npm test` |

## Checks in this cloud environment

Chrome-based tools need the pre-installed browser:

```bash
PATH=/path/to/a/folder/with/a/chromium/link:$PATH TIDELIGHT_CHROME_NO_SANDBOX=1 python3 tools/test_browser.py
```

where that folder holds a link named `chromium` to `/opt/pw-browsers/chromium`. On the founders' own
computers, the tools find Chrome by themselves.

## Branches, as of November 9, 2026

The newest work sits at the end of a chain. Each branch contains the one above it.

```text
main  (public)
 └─ claude/jolly-mayer-2m6eno   pull request 5, the whole first version + Shoreline + check-in
     └─ app/first-build          pull request 16, the phone app and age research
```

Also open: 8 and 12 into `main` (they publish), and 11, signage, which conflicts with Shoreline.
[[STATUS]] has the full table.

## Notes, by purpose

| Need | Note |
| --- | --- |
| What's true now | [[STATUS]], [[TASKS]] |
| What was decided or proposed | [[DECISIONS]], [[IDEAS]] |
| Safety rules and crisis numbers | [[SAFETY]] |
| What the reviewer must check | [[CONTENT-REVIEW]] |
| Research | [[RESEARCH-BRIEF]], [[AGE-STRATEGIES]] |
| Saving and the app plan | [[CHECK-IN-BACKEND]] |
| One task's story | `worklogs/`, one file per task |
