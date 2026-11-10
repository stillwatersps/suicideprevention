---
type: handoff
owner: Claude Code, at one founder's request
branch: build/tools-1109
---

# Two testing tools: a QR code for phone testing, and axe-core checks

Date: November 9, 2026.

**State when written: local only.** On branch `build/tools-1109`, made from `830f766`, the tip of
`claude/jolly-mayer-2m6eno` (pull request 5's branch). Not pushed, not in any pull request, not on the
public website. No page, stylesheet, or site script changed, and no wording changed. Nothing was tried
on a real phone, and no qualified person has reviewed anything here.

## What was asked

One founder asked Claude to build everything still to build. This task was two testing tools: a QR code
that `tools/preview_server.py --lan` prints, so a phone can open the preview without typing the address,
and axe-core accessibility checks in the browser tests. The founder approved downloading axe-core for the
tests only.

## Completed

| Part | What changed |
| --- | --- |
| `tools/qr.py`, new | A QR code encoder in plain Python with no downloads: byte mode, error correction level M, the smallest version (size) that fits, and the mask with the lowest penalty under the standard's four rules. It draws the code in the terminal with Unicode half blocks and the standard's 4-module light border, forcing black on white when the terminal supports color, so a dark terminal doesn't show it inverted. `python3 tools/qr.py "text"` prints one |
| `tools/qr.py --self-test` | Everywhere: the block table against a drawing of each version's layout, alignment positions, the standard's format and version bits, each penalty rule on cases worked out by hand, that the chosen mask has the lowest penalty, and that the terminal drawing matches the code. On a Mac with Xcode's command line tools it also builds a small Swift program, as `tools/test_webkit.py` does, and reads 51 codes back with Core Image's own QR detector: five addresses, one code of every version from 1 to 40, accented text, and what the preview server prints, read back from the printed text. Elsewhere that part says it is skipped |
| `tools/preview_server.py` | With `--lan`, each phone address is printed as a QR code, then as text below it. Nothing else changed |
| `tools/axe_core.py`, new | Downloads and checks axe-core. See the table below. `--fetch`, `--check`, and an offline `--self-test` that wrong files are refused |
| `tools/test_browser.py` | A new `axe` group. See below |
| `.github/workflows/site.yml` | The check job runs both self-tests. The browser job runs `python3 tools/axe_core.py --fetch`, which downloads and checks the same file, before the browser tests. No npm |
| `tools/test_the_tests.py` | 15 new planted bugs, listed under Checked. The axe-core copy is downloaded once before copying, if it isn't cached yet |
| `.gitignore` | `tools/cache/`, where the checked axe.min.js is kept |
| `notes/PHONE-TEST.md`, `README.md` | The QR code in "Start the preview", the axe group in the table of kinds of test, and the two new tools |
| `notes/review-packet/` | Rebuilt. They were behind `notes/SAFETY.md`'s November 9 re-read dates on `830f766`; only those dates and the fingerprint changed |

### axe-core

| | |
| --- | --- |
| File | `axe.min.js`, the only file taken from the package, read in memory. Nothing else is written, installed, or run |
| Source | https://registry.npmjs.org/axe-core/-/axe-core-4.14.0.tgz, the official npm registry |
| Version | 4.14.0, published October 5, 2026: the newest release, and more than two weeks old on November 9 |
| Package checks | 706,680 bytes, and the registry's published `dist.integrity`, sha512-9WTZxEjsZ7b13TH8JPmbV2z8CHbl80/2hm3XPEG4JgNdQLK81IBRXmSxHfMAOkSqQeRxT/0dwNDz2GOm3zzpcQ==, read from https://registry.npmjs.org/axe-core on November 9, 2026 |
| axe.min.js checks | 652,140 bytes. SHA-256 `20c09fe157a8a34a30e241aaa1fcdade657734f08ab379ecfbeb7d45cc46e878`, the same as the hash axe-core publishes for that release in the package's `sri-history.json`, sha256-IMCf4Veoo0ow4kGqofza3mV3NPCKs3ns++t9RcxG6Hg=. Recorded in `tools/axe_core.py` |
| License | Mozilla Public License 2.0, Deque Systems. Its `LICENSE-3RD-PARTY.txt` lists bundled MIT and ISC parts. Nothing is redistributed: the file is never committed or published |
| Where it runs | Injected into the tests' own headless Chrome only. The site never serves, links, or loads it |

### The axe group

`python3 tools/test_browser.py --only axe` runs axe-core's rules tagged WCAG 2.0, 2.1 and 2.2, levels A and
AA (64 or 65 rules a page; axe-core 4.14 tags none `wcag22a`), on all 21 pages in both languages, the Daily
check-in pages included, at phone 390x844 and desktop 1440x900, light and dark, with every fold open. On a
phone it also checks the open menu. On the two Daily check-in pages it checks each tab and each step, and
today's suggestions, as a visitor would reach them.

When axe-core can't judge contrast, such as text over the homepage photo, the test measures it on screen:
it hides all text for a moment, captures what is behind the element's own text, and compares the text color
with each pixel there, leaving out the worst 1 in 100. The lowest measured on the homepage was 7.13:1, where
4.5:1 is needed.

Triage on November 9, 2026. No violation needed a page change:

| Finding | Pages | What was done |
| --- | --- | --- |
| `target-size`: a tab partly hidden | Both Daily check-in pages, phone size, after choosing a tab or step | Allowed, with the reason written in `AXE_ALLOWED` and printed as a NOTE each run. Choosing a tab scrolls its section to just below the pinned crisis strip, so the tab row sits partly behind the strip, about 13 px of it showing, until the visitor scrolls up. At the top of the page every tab passes. The allowance only covers "partially obscured", and a planted bug shows tabs that are simply too small still fail |
| Undecided contrast, text over a photo or drawn behind a link | Both homepages at desktop size, one link on Help Someone | Measured on screen. Every one passes |
| Undecided contrast, `nonBmp` | Arrows in "← Home" and similar links on every page | Counted as fine, with the reason in `AXE_UNDECIDED_FINE`: each is a symbol hidden from screen readers, inside a link whose words are checked |

Passing these rules is not an accessibility review. Automated rules find only part of what a person using
a screen reader, a keyboard, or larger text would.

## Sources read, November 9, 2026

- https://registry.npmjs.org/axe-core, the registry's metadata: release dates, the `latest` tag, and
  4.14.0's `dist` entry with its hash, size, and license.
- The 4.14.0 package itself: `sri-history.json`, `LICENSE`, and `LICENSE-3RD-PARTY.txt`.

No crisis service, health source, or provider page was read or needed: nothing here changes crisis or
health wording.

## Checked

On this Mac, November 9, 2026. Desktop Chrome and its phone-size emulation, and macOS WebKit, are kept
apart. Nothing was run on a real phone or in the iOS Simulator, and `--lan` was not run, to avoid the
firewall prompt; the QR output was tried with localhost addresses instead.

- `python3 tools/qr.py --self-test`: "Core Image read back 51 of 51 codes, including one of every version
  from 1 to 40 and what the preview server prints." and "QR self-test: 0 problems." With swiftc off the
  PATH: "Skipped reading the codes back: that needs a Mac with Xcode's command line tools (swiftc)." and
  "QR self-test: 0 problems."
- A one-off comparison with Core Image's own QR generator: for `http://localhost:8000/suicideprevention/`
  both made the same code, module for module, mask 2. For other text Apple's generator picks other
  encoding modes, so it isn't a reference and isn't in the self-test.
- `python3 tools/axe_core.py --fetch`, `--check` and `--self-test`: "axe-core 4.14.0 (MPL-2.0) at
  tools/cache/axe-core-4.14.0/axe.min.js matches its recorded SHA-256 hash 20c09fe1…" and "axe-core
  download self-test: 0 problems."
- `python3 tools/check_site.py`: "Checked 21 pages. 112 different outside links." and "All checks
  passed." with no NOTE.
- `python3 tools/check_site.py --self-test`: "All 5 made-up link answers were read correctly."
- `python3 tools/launch_gate.py --self-test`: "All 61 made-up cases were read correctly."
- `python3 tools/check_live.py --local`: "All 20 live pages load and show their crisis help, and so do a
  wrong address and 6 files. No notes or tools are published."
- `python3 tools/check_crisis_sources.py --self-test`: "All 20 made-up cases were read correctly, and
  every crisis number in notes/SAFETY.md has a check."
- `python3 tools/test_browser.py --only axe,a11ytree,links`, desktop Chrome and its phone-size
  emulation: links 974, a11ytree 21, axe 412 checks passed, 0 distinct failures, "All browser checks
  passed." with the three allowed target-size NOTEs.
- `python3 tools/test_webkit.py`, macOS WebKit: "207 checks in WebKit on this Mac, 0 problems."
- `python3 tools/test_the_tests.py --only "axe:"`: "All 7 planted bugs were caught." An image's alt
  removed, a control's name removed, a color made faint, a color made faint over the photo, check-in tabs
  too small to tap, a changed copy of axe-core accepted, and the download's SHA-512 check removed.
- `python3 tools/test_the_tests.py --only "QR code"`: "All 7 planted bugs were caught." Wrong format bits,
  wrong error correction, data in the wrong order, a block table too small, the mask chosen without the
  penalty rules, penalty rule 3 ignoring the border, and the code drawn upside down.
- `python3 tools/test_the_tests.py --only "preview server printing"` and `--only "notes published"`: each
  "All 1 planted bugs were caught."

Not run: the full browser suite, the full planted-bug suite, and the 25 to 35 minute full suite script;
no item asked for it. The workflow changes haven't run on GitHub.

### Rechecked November 10, 2026

On the same commits, unchanged. https://registry.npmjs.org/axe-core/4.14.0 still gives the same
`dist.integrity` and license, and `latest` is still 4.14.0. These gave the same result lines as above:
`tools/qr.py --self-test` (51 of 51 read back, 0 problems), `tools/axe_core.py --check` and `--self-test`,
`tools/check_site.py` (all checks passed, no NOTE), `tools/test_browser.py --only axe,a11ytree,links`
(links 974, a11ytree 21, axe 412, all passed, with the three allowed target-size NOTEs),
`tools/test_webkit.py` (207 checks, 0 problems), and `tools/test_the_tests.py --only` "axe:" (7 of 7),
"QR code" (7 of 7) and "preview server printing" (1 of 1).

## Decisions and open questions

None of this is agreed by both founders; each part is easy to remove.

- **For the founders: the check-in tab row after choosing a tab.** On a phone, choosing Rediscover,
  Journal, or Your journey leaves the tab row half behind the crisis strip. A visitor scrolls up a little to
  choose another tab. Keeping the row in view would change the page's behavior, so it wasn't changed.
- **No phone has scanned the QR code yet.** Core Image reads it on this Mac. When trying [[PHONE-TEST]],
  note whether the camera opened the address, and which terminal and text size were used.
- axe-core's first download needs the internet. Without it, and with no cached copy, the `axe` group
  fails and says how to fetch it. Every other group runs offline as before.
- To move to a newer axe-core, follow the steps at the top of `tools/axe_core.py`, then triage again.
- This branch doesn't touch pull request 11 or 16, the phone app, or idea E1.

## Next step

A founder decides whether to push `build/tools-1109` and open a pull request into
`claude/jolly-mayer-2m6eno`, which publishes nothing. Then, on a real phone, follow [[PHONE-TEST]] and
note whether the QR code worked.
