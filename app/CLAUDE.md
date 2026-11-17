# Tidelight phone app: instructions for Claude Code

Read the repository's root `CLAUDE.md` first. It holds the two founders' shared rules, and it wins.
This file covers only the phone app in `app/`. If `app/PROGRESS.md` exists, read it next and
resume from its "Resume instructions".

## What this is

Tidelight is a suicide prevention project. The phone app is a calm, check-in-based companion
people can use anywhere: a few short check-ins a day, breathing and meditation sessions that work
in silence, and their own people and places. The redesign (`app/BUILD-SPEC.md`) aims for fewer
words, more touch, and no friction, on top of everything the app already did. **It is a draft.
No licensed reviewer, fluent Spanish reader, or lawyer has seen its words, and it has not run on
a real phone.**

## Rules that are never traded away

- **Crisis help is one tap away on every screen.** The crisis strip (Call 988, Text 988, Call 911,
  Quick exit) stays on screen in every tab, every onboarding page, Settings, and the meditation
  player. Take numbers and markup from the existing pages and `notes/SAFETY.md`, never from memory.
- **Never place a call, send a text, start a chat, or submit a form on a crisis service**, on any
  device or simulator. Stop at the dial or compose screen.
- **Nothing typed or recorded leaves the phone.** No analytics, no network calls, no outside
  fonts, scripts, or embeds. Location is read on demand only. The app keeps no list of places
  beyond the person's own.
- **Every word is in `src/text/`, in English and Spanish together.** Never put words for people
  in a script. The Spanish is an unreviewed AI translation and says so. After changing words, run
  `npm run words` and add the reviewer's questions to `notes/CONTENT-REVIEW.md`.
- **Never shorten or remove crisis wording, the draft-for-review notice, or privacy wording.**
- **Stored data stays readable.** Change a stored shape only with a migration in
  `src/core/migrations.js` and a bumped `SCHEMA_VERSION`.
- **Never merge into `main`** (it publishes the website) and never push to `app/first-build`.
  The repository is public: no names, email addresses, `@`-mentions, or local paths in anything
  committed.

## Automated runs make no sound

A founder's instruction. Tests, tools, and Simulator checks never play audio out loud, and the
app's own audio code is never changed to achieve that.

- Open every test or tool browser with `openBrowser()` from `test/quiet.mjs` (muted Chromium, plus
  a page script that silences speech, recordings, and generated sound). The lint enforces it.
- Launch the app in the iOS Simulator with `npm run sim:launch`, which passes `-TidelightQuiet YES`
  to a debug-only, Simulator-only hook in `TidelightPlugin.swift`. Never with a plain launch.
- If the quiet script changes, change both copies (`test/quiet.mjs` and the Swift string); a unit
  test compares them.

## A founder's safety rules for the redesign (November 11, 2026). They override the build spec

1. **Never remove, shorten, hide, or move behind a tap any safety feature**: the "In immediate
   danger, call 911" banner, the Exit button, "Get Support Now", any crisis line (988 and the
   others), the "Draft for review" notices, or the Spanish link. The 50% text cut does not apply
   to them. They stay visible on every screen where they appeared before the redesign.
2. **A check-in that shows very low mood or distress shows crisis support options right away**,
   instead of just logging it.
3. **Streaks**: no streak, celebration, or "you missed a day" message ever appears in or near a
   crisis or support screen. All streak language stays gentle. Streaks are a setting people can
   turn off.
4. **Notifications and the lock screen are discreet.** Never mention suicide, crisis, or mood in
   notification text. "Time for your check-in" is the model.
5. **All new wellness copy and meditation scripts are marked "Draft for review"** with the
   existing review system, the same way the pages are marked.
6. **Location data stays on the device** and is used only for the features described.

## Stack

- Capacitor 7 (`@capacitor/core`, `ios`, `android`), plain HTML, CSS, and JavaScript modules.
  No framework, no TypeScript. esbuild bundles `src/app.js` into one file.
- Plugins: Preferences, Share, Local Notifications, and the project's own `Tidelight` Swift plugin
  (`ios/App/App/TidelightPlugin.swift`, with a browser stand-in in `src/native.js`).
- Tests: Node's built-in runner for pure logic (`test/unit/`), and Playwright in desktop Chromium
  for the screens (`test/*-test.mjs`), with stand-ins for everything a phone does.

## Install, run, test, build

```bash
cd app
npm ci
npx playwright install chromium
npm test          # lint, unit tests, build, then every browser test
npm run lint      # scripts parse, nothing can leave the phone, token-only styles, word twins match
npm run test:unit # pure logic only, fast
npm run build     # makes app/www from the website plus the app's blocks
npm run words     # rebuilds notes/review-packet/tidelight-app-words.html
npm run words:es  # makes src/text/redesign.es.html from the English blocks and redesign.es.json
npm run test:safety # every crisis path and every safety rule (about 8 minutes). Run before EVERY commit
npm run test:crisis # the crisis paths alone
npm run sim:launch  # starts the installed app in the booted Simulator, muted (automated runs)
npm start           # builds, then serves the app to this computer only, for a look in a browser
npm run test:a11y   # the accessibility audit alone (about 8 minutes)
npm run test:ios    # the Swift logic for places (needs Xcode)
node tools/launch-time.mjs 5        # cold launch time in the booted Simulator, median of 5
node tools/reviewer-walkthrough.mjs # refills the screen-by-screen part of notes/REVIEWER-PACKET.md
node tools/voice-sheet.mjs          # rewrites notes/VOICE-RECORDING-SHEET.md after a script line changes
LANG=en_US.UTF-8 npm run sync   # build, then copy into the iOS and Android projects (needs CocoaPods)
```

Before every push, also run `python3 tools/check_site.py` from the repository root.

**Before every commit that touches `app/src/`, run `npm run test:safety`.** It must pass. It
covers every crisis control on every screen (`test/crisis-test.mjs`, against the inventory in
`test/fixtures/crisis-inventory.json`) and every written safety rule (`test/safety-test.mjs`,
`test/unit/safety-rules.test.mjs`); `notes/LAUNCH-READINESS.md` has the table of rules and tests.
Never re-record the crisis inventory or rewrite the wording snapshot to make a failure go away.

## Rules from the launch readiness work (November 12, 2026)

`npm test` runs all of these; each must pass before a push. `notes/LAUNCH-READINESS.md` says what
each covers and what only a real phone can show.

- **Crisis tests must pass** (`test/crisis-test.mjs`). No change may move, hide, shrink, delay,
  lower the contrast of, or put a step in front of Call 988, Text 988, Call 911, Quick exit, or
  Get Support Now. If a change needs the crisis inventory re-recorded, stop and ask a founder.
- **Reviewed wording is locked** (`test/unit/reviewed-strings.test.mjs`). A wording change to
  crisis, consent, privacy, clinical, location, or safety text is a question in
  `notes/CONTENT-REVIEW.md`, never an edit. New technical strings (a spoken label, a test name) are fine.
- **Nothing leaves the phone** (`test/network-test.mjs`: every screen walked with the network
  blocked). No analytics, crash reporting, remote configuration, or package that contacts a
  server. A new dependency that ships in the app needs its license in
  `notes/THIRD-PARTY-LICENSES.md` and a line in `notes/PRIVACY-INVENTORY.md`.
- **Accessibility** (`test/a11y-test.mjs`): no serious or critical finding from the automated
  audit on any screen, in both languages, light and dark; every control has a name that contains
  the words on it (`keepNamesHonest` in `src/ui/components.js` keeps that true when a script
  changes a label); nothing runs off the side at the phone's largest text. On iPhone the app
  follows the phone's text size, so sizes are `rem` and layouts wrap.
- **Colors and sizes are tokens** (the lint): no raw color in `src/` outside `src/tokens.css`.
- **A performance budget** (`test/budget-test.mjs`): sizes of the script, styles, fonts, and the
  whole folder; no outside request at start; the crisis strip on screen before the app's script
  has loaded. Raise a ceiling only on purpose, and write why in `notes/LAUNCH-READINESS.md`.
- **Bad data never blanks the app** (`test/resilience-test.mjs`). Read stored data through
  `src/core/storage.js`, and treat every stored value as possibly damaged. If the newer screens
  fail to start, `src/app.js` falls back to the older layout (`leaveNewerScreens`), which keeps the
  crisis strip. Never show a technical error to a person.
- **Spanish matches English in structure** (`test/unit/spanish-parity.test.mjs`). A line that is
  rightly the same in both languages goes in `test/fixtures/same-in-spanish.json`.
- **A stored thing that is new or changed** goes in `notes/PRIVACY-INVENTORY.md`, and
  "Delete everything" must cover it or say why not.
- Ideas that are out of scope go in `notes/LAUNCH-BACKLOG.md`, not into the app.

## The app lock (November 14, 2026, a draft)

- **The lock covers the app's own screens and nothing else** (`src/ui/lock.js`, the `tl-locked`
  rules at the end of `src/redesign.css`). The crisis strip, Quick exit, Get Support Now, the
  Support panel, the Spanish link, both review notices, and the place alert are outside it and are
  never covered. `test/privacy-test.mjs` checks each while locked. A new part of the page that
  holds something a person saved goes inside a `.tl-screen`, or is added to those rules.
- **The app keeps no code of its own.** The phone confirms the person (Face ID, Touch ID, or the
  phone's passcode) through the `Tidelight` plugin. If the phone can no longer do that, the app
  opens: nobody is ever locked out of their own plan. Nothing is counted and nothing is erased
  after a failed try.
- The lock is off until turned on, turning it on asks the phone first, and first launch is never
  behind it.
- **Leaving and coming back** (`TidelightPlugin.swift`): while the lock is on, the phone puts a
  plain cover over the app as it leaves the screen, starting below the crisis strip (the page says
  where the strip ends), so the strip is never under it. Coming back, the cover stays until the
  app is fully in front and the page says its lock screen is drawn (`lockDrawn`); only then does
  the page ask for Face ID. A page can't redraw while the app is in the background, so without
  this order the screen the person left shows for a moment. A timer lifts the cover anyway after
  a few seconds: the app must never stay covered.

## Rules from the check on November 16, 2026

- **The crisis strip never takes most of a short screen** (`src/ui/strip-fit.js`): past 70% of the screen's
  height its words are set smaller, never under 18 points. Fonts differ between computers and phones, so
  `test/strip-test.mjs` also runs with a deliberately wide font; a layout check must hold with any font.
- **A native screen of the app's own opens below the crisis strip**, never over it. The map for a place takes
  `top` from the page (`stripBottom`). The phone's own pickers (contacts, photos, the share sheet) are the
  phone's and can't be changed.
- **Nothing is saved before what was saved has been read** (`loaded` in `src/app.js`).
- **After Quick exit, nothing the person had open is left on the page**: `tidelight-back-from-exit` closes
  the share notice and "Enter my date of birth again" as well as going Home. A new panel outside the
  screens must listen for it too.
- **Nothing celebrates on a quiet day**, the setup list included (`isQuiet()` before any success haptic or
  "done" card).
- **Reminders:** `TidelightPlugin.swift` takes over the phone's notification handler and passes reminders on
  to the reminders plugin's own handler, which it must keep hold of at load. A tapped reminder reaches the
  page through `onReminderTap` in `src/ui/device.js`.
- **Why the phone asks for a permission** is written three times and must stay the same: `Info.plist`,
  `en.lproj/InfoPlist.strings`, and (in Spanish) `es.lproj/InfoPlist.strings`. A unit test compares them.
- **Android is not working** and has never been built: no `Tidelight` plugin, no routing for pages in
  folders, no location permission. Don't describe a feature as working on Android.
- `test/faults-test.mjs` and `test/unit/native-fixes.test.mjs` hold the faults from that check fixed.

## When the phone can't save (November 15, 2026, a draft)

- **Every write to the phone reports a failure** by calling `saveFailed()` from `src/core/save-note.js`
  (the storage layer in `src/core/device-storage.js`, and the Hope box layer's own `save` in
  `src/extras.js`). A new place that writes must do the same. What failed is never recorded.
- **`src/ui/save-note.js` shows one line, once,** until "Got it". It sits at the bottom, above the tab
  bar, and the page grows by its height; where there is no room between the crisis strip and the tab
  bar it sits in the page instead. It is never laid over the strip. `test/save-test.mjs` checks it.
- **Things scrolled to land just under the crisis strip** (`scroll-padding-top` follows `--tl-top`, the
  strip's measured height). The website's fixed allowance was taller than a small screen at the largest
  text, so Support landed off the screen after Get Support Now. `test/strip-test.mjs` checks every size.

## "What tends to help" (November 15, 2026, a draft)

- **Rule in `src/logic/helps.js`, screen in `src/ui/helps.js`, numbers in `CONFIG.helps`.** It looks only
  at better days (a quick check-in of Good or Great) and says what else was recorded on them.
- **Never a score, a chart, an average, or a trend, and hard days are never counted, listed, or
  mentioned.** The result has no field for them, and a unit test checks that. It never says one thing
  caused another.
- It stores nothing. The screen's words say "30 days", "three days", and "two or more"; a unit test fails
  if `CONFIG.helps` and those words disagree.
- The check-in log is cleaned once, when it is loaded (`src/app.js`): an entry that isn't a record with a
  readable time is left out. One such entry used to stop the whole app from starting.

## The widget, and opening the app at a named place (November 15, 2026, a draft)

- **`ios/App/TidelightWidget/` is its own Xcode target** (`org.tidelight.app.widget`, iOS 17), added by
  `tools/add-widget-target.rb` with CocoaPods' `xcodeproj` library; never edit `project.pbxproj` by hand.
  No team or signing identity is set for it. Android has no widget.
- **The widget is discreet, like a notification:** the app's name and a few plain words from its own
  `Localizable.strings` (English and Spanish). Never a mood, a check-in, a streak, a name, 988, or the
  word "safety". It has no entitlements and no shared container, so it can read nothing the person
  saved. `test/unit/widget.test.mjs` checks all of that from its files.
- **A tap opens `tidelight://open/breathe`, `/plan`, or `/home`.** `TidelightPlugin.swift` turns the
  first two into a launch target; `src/redesign.js` acts on `tidelight-launch`: the plan opens
  (behind the lock, if it is on), a breathing minute starts only when the app is not locked, and
  nothing happens during first-time setup. Any other address just opens the app.
  `test/open-test.mjs` checks the page's side.

## The iPad layout, and the Apple Watch app (November 15, 2026, a draft)

- **iPad:** the app's column (`.tl-app`, inside `.page-body`) sits in the middle of the screen at every
  width, in line with the tab bar. `test/ipad-test.mjs` walks every screen in `test/app-screens.mjs` at
  four iPad sizes and checks that, the safety frame, and that each crisis control is full size and
  uncovered. On a wide screen the website puts Quick exit in a corner, over the end of the tab bar;
  leave it there, and never let it cover a tab.
- **The crisis strip is pinned at every width in the app** (`src/app-safe-area.css`). The website lets
  it scroll away on a screen 960 points wide or more; an iPad on its side is that wide.
- Build the iOS app with a destination and without `-sdk iphonesimulator`: that flag forces the
  phone's SDK onto the watch target, which then fails to build.
- **`ios/App/TidelightWatch/` is its own Xcode target** (`org.tidelight.app.watchkitapp`, watchOS 10),
  added by `tools/add-watch-target.rb`; never edit `project.pbxproj` by hand. No team or signing
  identity is set for it.
- **The watch app's first screen carries the phone app's three crisis lines** (call 988, text 988,
  call 911), with the phone app's own words in each language; `test/unit/watch.test.mjs` compares them.
  Nothing may be put in front of them. The breathing minute is silent.
- **It stores nothing, reads nothing the phone app saved, and shows nothing outside itself:** no
  storage, no network, no link to the phone app, no Health, no notifications, no complication. The
  unit test fails on any of those, and on a file in the folder it has not read.
- It has been built for the watch Simulator and has never run. Treat every screen of it as unseen.

## Shortcuts and Apple Health (November 15, 2026, a draft; iPhone only)

- **Shortcuts** (`ios/App/App/TidelightShortcuts.swift`): two App Intents, "A minute to breathe" and
  "My plan", which only open the app at the widget's two places through the same launch target.
  Their names and Siri phrases are in `en.lproj` and `es.lproj` and are as discreet as the widget's
  words. They take nothing typed and read nothing saved.
- **Apple Health** (`TidelightHealth.swift`, `src/ui/health.js`, `settings.health`, off by default):
  the app may add **mindful minutes only** (a start and an end), and may remove what it added.
  **Never a mood, a check-in, or a word, and never any read access.** The setting is hidden where the
  phone has no Health. "Delete everything" removes the entries too. `test/unit/shortcuts-health.test.mjs`
  reads the Swift for all of this; `test/health-test.mjs` checks the page with a stand-in.
- New files join the Xcode project through `tools/add-shortcuts-health.rb`, never by hand. No team or
  signing identity is set. The one entitlement is `com.apple.developer.healthkit` in `App.entitlements`.
- A change to what goes to Health changes the privacy screen, `notes/PRIVACY-INVENTORY.md`, and
  `notes/APP-STORE-PRIVACY-DRAFT.md` together.

## "Your privacy in Tidelight" (November 15, 2026, a draft)

- **`#tl-privacy` describes what the app does; it is not a privacy policy and says so first.** Its
  words are privacy wording: never folded, never shortened.
- **A new stored thing, or a new way for something to leave the phone, changes this screen** as well
  as `notes/PRIVACY-INVENTORY.md`. `test/unit/privacy-screen.test.mjs` lists each key in `KEYS` beside
  the words that cover it and fails on a key it doesn't know. It also fails on words the code can't
  back up ("encrypted", "anonymous", "secure", "guarantee").

## A summary for an appointment (November 15, 2026, a draft)

- **Rule in `src/logic/summary.js`, screen in `src/ui/summary.js`, numbers in `CONFIG.summary`.** Only
  what the person ticks goes on the page, as it was recorded. **Never a count, an average, a score, a
  chart, or an interpretation**; a unit test reads the rule's source for them.
- **It stores nothing.** Choices and the typed line live only on the screen, and opening it again starts
  over (check-ins ticked, the rest not). The screen shows every word before sharing, and what is shared
  is exactly that text, through `handFile` in `src/ui/export.js` (the same way as "a copy of my data").
- The screen says "14 days", "30 days", and holds 300 characters; a unit test fails if `CONFIG.summary`
  and the screen disagree.

## "Helping someone you're worried about" (November 15, 2026, a draft)

- **`#tl-helping`, on the Friends tab, holds no wording of its own.** `helpingPage` in
  `tools/build-redesign.mjs` copies the Help Someone page's title, opening, urgent line, and six
  sections into it at build time, in each language, with folded parts opened and headings moved down
  one level. Change the words on the website's page, never in the app. `test/helping-test.mjs` fails
  if one word or link differs. The row that opens it carries the page's own title.

## The 988 screen, and screens opened from the support step (November 15, 2026, a draft)

- **`#tl-expect` and `#tl-ways` hold no wording of their own.** `tools/build-redesign.mjs` (`helpSection`)
  copies the Get Help page's "What happens when you reach out to 988" and "Other ways to reach someone"
  sections into them at build time, in each language. The crisis test allows the other services' numbers
  only because that page names them, and reads the list from the page. Change the words on the website's page, never in the app. `test/expect-test.mjs` fails
  if one word differs. The button that opens it carries the same words as the section's heading.
- **A screen opened from the support step uses `data-tl-over`** beside `data-tl-push`, so it opens
  on top of the support step wherever else it was open (`shell.pushOver`). Back then returns to the
  support step with Call 988, never to a new check-in (`onSupport` in `src/ui/checkin.js`).

## Texting 988 in Spanish (November 15, 2026, a draft)

- In the app's copy of the Spanish pages, a link that says to text AYUDA to 988 is
  `sms:988?&body=AYUDA` (`fillInAyuda` in `tools/build-redesign.mjs`, at build time). The word
  sources and the public website keep `sms:988`. English links and the PRIDE link are never filled in.
- Tests look for a text link with `a[href^="sms:988"]`, never the exact address.
- It has not been confirmed on a real phone that 988 shows as the recipient. Until it has, treat it
  as unproven on the crisis path.

## One small thing for today (November 17, 2026, a draft)

- **A card on Home** (`src/logic/step.js`, `src/ui/step.js`) that shows one line a day from the person's own
  "Things you'd like to try", which the older check-in page keeps (`explore` in `tidelight.checkin.v1`). It
  reads that list and never writes it.
- **The app adds no line of its own**, stores nothing, counts nothing, and never asks whether the thing was
  done. It is hidden on a quiet day. A unit test reads the script for each of those.

## Three good things (November 17, 2026, a draft)

- **Rules in `src/logic/good.js`, screen in `src/ui/good.js`, numbers in `CONFIG.good`.** Up to three short lines
  a day, in the person's own words; the app writes none of them.
- **Never a count of days, a streak, a score, or a comparison**, and a day with nothing is never remarked on.
  A unit test reads the rules and the script for those words. No celebration on saving.
- **It is never offered on a support step**: a hard moment is not the time to be asked for good things.
  `test/good-test.mjs` checks that, and the rest.

## Wind down for sleep (November 17, 2026, a draft)

- **`#tl-wind`, on the Meditate tab, with `src/ui/wind.js`.** Four tick boxes and a button that starts the
  Sleep session. **The ticks are never stored** and are cleared each time the screen opens; nothing is counted.
  It names nothing to take (no medicine, no drink); a unit test reads the words for that.

## Just sound (November 17, 2026, a draft)

- **A fifth built-in type, `sound`** (`TYPES` and `builtIn` in `src/logic/meditations.js`,
  `CONFIG.meditation.lengths.sound`): one quiet stretch with a background sound for the whole time. Never a
  voice, a breathing guide, or haptic breathing; `test/sound-test.mjs` checks each. It has no script lines,
  so the voice recording sheet does not change. Its card on the Meditate tab is a copy of the other cards.

## Care near me (November 17, 2026, a draft)

- **`#tl-nearby` holds one outside link**, to the phone's maps at a search for emergency rooms. The address is
  markup (`maps.apple.com/?q=…`, with a `geo:` form for Android swapped in by `src/ui/nearby.js`). **It carries
  no place and nothing about the person, and the app reads no location for it;** `test/unit/nearby.test.mjs`
  fails on a coordinate in the address, a second outside link, or a location call in the script.
- The screen says first that nobody has to go anywhere to get help, and says in view that the link leaves
  Tidelight. Never add a list of hospitals or a "nearest" result: the app keeps no list of places.

## Darker at night (November 16, 2026, a draft)

- **Rule in `src/logic/night.js`, switch in `src/ui/night.js`, `settings.nightMode` (off by default).** Between
  the bed time and the wake time in Settings the root element has the class `tl-night`.
- **Never write a night color by hand.** Dark colors are written once, for a phone set to dark
  (`@media (prefers-color-scheme: dark)`); `tools/night-css.mjs` copies every such rule for `html.tl-night` at
  build time, in every stylesheet in `www/assets`. A new dark rule needs nothing more.
- At night every part of the app, the crisis strip included, looks exactly as it does on a phone set to dark
  (the strip's dark colors pass the same 7 to 1 test). `test/night-test.mjs` compares them, and checks contrast
  on each tab at night on a phone set to light.
- The website's pages inside the app can't read the settings. `src/ui/night.js` notes when tonight ends in
  session storage (`tidelight.night-until`), and `src/app-return.js` reads it before the page is drawn.

## Ten minutes at a time (November 16, 2026, a draft)

- **Clock rules in `src/logic/ride.js`, screen in `src/ui/ride.js`, numbers in `CONFIG.ride`** (five steps of
  two minutes). The screen's words say "ten minutes" and "five small steps, two minutes each"; a unit test
  fails if they and the numbers disagree. The steps' words are `ride.step.1` to `ride.step.5`.
- **It is silent, stores nothing, and celebrates nothing.** Call 988, Text 988, and Call 911 are the screen's
  last lines the whole time. At the end, or on "Stop here", it asks how things are and chooses no answer;
  **"Still hard" shows support at once and makes the day quiet** (`goQuiet`), like a very low check-in.
- No step names a method or a way to get hurt; a unit test reads the words. Leaving the screen, or Quick
  exit, ends the ten minutes. `test/ride-test.mjs` checks each.

## Reach someone I trust (November 16, 2026, a draft)

- **Rules in `src/logic/reach.js`, screen in `src/ui/reach.js`, limits in `CONFIG.reach`.** A short message for
  one person in My circle. **The app sends nothing:** a tap opens the phone's own messages to that one person
  with the words filled in, and the person taps Send there. Never to a crisis line, and never to more than the
  one person tapped; a unit test reads the script for both.
- The screen starts with its own short message (`reach.start`), which names no method and is not a call for
  emergency help. Only words the person changed and saved are stored (`tidelight.reach.v1`).
- It reads My circle (kept by `src/extras.js`) and never writes it. `src/extras.js` announces a change with
  `tidelight-circle-changed`.
- "Message someone I trust" shows on the support step only when the circle has someone in it, below the crisis
  buttons. The screen says first that a message is not a way to get urgent help. `test/reach-test.mjs` checks each.

## A letter to myself (November 16, 2026, a draft)

- **Rules in `src/logic/letter.js`, screen in `src/ui/letter.js`, the limit in `CONFIG.letter`.** One letter, in
  the person's own words. **The app writes none of it:** no starting words, no placeholder, no prompts. A unit
  test reads the script and the field for them.
- Whatever is stored comes back whole or empty (`cleanLetter`), because it is read in a hard moment.
- "Read my letter" shows on the support step only once there is a letter, and always below the crisis buttons
  and the plan. Removing the letter asks first. "Delete everything" removes it; the app lock covers it; "a copy
  of my data" includes it; the privacy screen names it. `test/letter-test.mjs` checks each.

## Another way to see it (November 17, 2026, a draft)

- **`#tl-reframe`, on the Check-in tab, with `src/ui/reframe.js`.** Four questions and four empty fields. **Nothing
  typed is kept anywhere**: it is cleared when the screen is left, on Quick exit, and by "Clear what I wrote".
  Never add saving or sharing to it without a founder's decision; a unit test fails on either.
- It says, before the questions, that it isn't for thoughts of ending your life, and it never tells the person
  their thought is a mistake (no "distorted", "irrational", "negative thinking"). Never on a support step.

## Body scan (November 17, 2026, a draft)

- **A sixth built-in type, `scan`** (`src/logic/meditations.js`): settle, six slow breaths, the body scan, a long
  quiet, come back. **It reuses the Deep session's lines** (`intro.deep`, `bodyScan`, `outro.deep`), so there is
  nothing new to record. A new spoken line means new entries in `notes/VOICE-RECORDING-SHEET.md`
  (`node tools/voice-sheet.mjs`) and a reviewer's read; none was added.

## Being kind to yourself (November 17, 2026, a draft)

- **`#tl-kind`, on the Check-in tab, is words only**: three short exercises, the grounding screen's layout, and
  the three crisis lines at its end. No script, nothing to type, nothing kept. Its words never blame, promise
  a result, or tell the person what they should feel; a unit test reads them for that.

## A mindful walk (November 17, 2026, a draft)

- **A seventh built-in type, `walk`** (`src/logic/meditations.js`): four spoken lines with quiet walking between
  them. **Nothing to look at while moving**: no breathing segment, no taps, and the opening line says to put
  the phone in a pocket and watch where you're going. A unit test fails if any of that is removed.
- Its lines are new, so `notes/VOICE-RECORDING-SHEET.md` gained eight rows per language. With the voice guide
  off in Settings the session is silent with words on the screen only.

## A first week (November 17, 2026, a draft)

- **`#tl-course`, on the Meditate tab; `src/logic/course.js`, `src/ui/course.js`; kept as `tidelight.course.v1`.**
  Seven steps that open things the app already has (`STEPS`). **Only the step numbers ticked are kept**: no
  dates, no count of days, no streak, and a session finishing never ticks a step by itself.
- The closing line is plain and is hidden on a quiet day (`isQuiet()`). Never add a count, a badge, or a
  reminder to "keep going" to it.
- A new course is a new list of steps and its own words, each step a thing that exists; it is not a place to
  write new exercises.

## Breathe in a pattern (November 17, 2026, a draft)

- **An eighth built-in type, `breathe`**, with `options.pattern` one of `BREATHE` (`calm`, `box`, `stressed`, which
  is 4-7-8). Whole breaths only, nothing spoken. Its id and its favorite carry the pattern
  (`breathe-3-box`), so a saved one plays the same pattern again.
- **The card's line about dizziness stays.** A new pattern needs a reviewer's read first: long holds are not
  safe for everyone. A unit test fails if the warning goes.

## The safety plan (November 15, 2026, a draft)

- **Rules in `src/logic/plan.js`, screen in `src/ui/plan.js`, limits in `CONFIG.plan`.** Six parts, in the
  order the website's Get Help page gives them. Entries are the person's own words: the app suggests
  nothing and fills nothing in.
- **Call 988, Text 988, and Call 911 are markup in part 5**, the same three lines as the support screen,
  never stored entries, so nothing a person does can remove them. Never name a method anywhere in the plan.
- **Whatever is stored comes back whole or empty** (`cleanPlan`), because the plan is read in a hard moment.
- "Open my safety plan" shows on the support screen only when the plan has something in it, and always
  below the crisis buttons. "Delete everything" removes the plan; the app lock covers it; "a copy of my
  data" includes it. `test/plan-test.mjs` checks each.

## Architecture after the redesign

- **Tabs** (`src/ui/shell.js`): `TABS` in `src/ui/icons.js` is the one list; adding a tab is one line there, plus its
  word (`tab.<id>`) and its screen (`<section class="tl-screen" id="tl-<id>" data-tl-tab="<id>">`)
  in `src/text/redesign.en.html`. Each tab keeps its own stack; `shell.push('name')` shows
  `#tl-name`. The older sections live in `#tl-legacy`, inside Check-in. `shell.setFull(true)` hides
  the tab bar (onboarding, the player) and never hides the safety frame.
- **The tab bar is on every page inside the app.** The app's own two pages build it in
  `shell.js` (buttons). Every other page (the website's pages: Get help, Not sure, and the rest)
  gets the same five tabs as plain links, written in by `tools/build-redesign.mjs` from `TABS` and
  `ICONS` in `src/ui/icons.js` and the `tab.*` words, styled by `src/app-tabbar.css` in the
  website's own colors. `test/pages-test.mjs` walks all of them. A new page needs nothing; a new
  tab is one line in `TABS`. The public website never gets the bar.
- **Design system** ("Dawn at the Shoreline", `DESIGN-BRIEF.md`, notes in `design/`): every color,
  size, radius, duration, and font is a token in `src/tokens.css` (`--ink`, `--sand`, `--paper`,
  `--coral`, `--seafoam`, `--dawn`, `--mood-1..5`, `--scene-*`, `--space-*`, `--radius-*`,
  `--text-*`; the older `--tl-*` names are aliases). The lint fails on a raw color anywhere in
  `src/` outside that file, and on a size or duration outside it in the redesign's stylesheets.
  `src/redesign.css` holds layout; `src/redesign-identity.css` loads last and holds the look.
  Button-like rules start with `html.tl` so they win over the website's own button rule.
  - **Crisis controls are plain on purpose**: `--crisis-bg`/`--crisis-text` for the strip,
    `--crisis-btn-bg`/`--crisis-btn-text` for Get Support Now and Call 988. At least 7 to 1 (a unit
    test checks), no grain, no animation, no highlight, no haptic of the app's own, never coral.
    The strip's own words follow the phone's text size up to 28 points and its tap targets up to 56
    (`--crisis-size-cap`, `--crisis-tap-cap`), so the strip leaves room for the screen at the largest
    sizes. Every word stays; `test/strip-test.mjs` checks six sizes. A draft, one founder's choice.
  - **The horizon** (`.tl-horizon`, with `-hero`, `-progress`, `-complete`) is the one
    signature shape: a flat line with light at its edge. No waves. It is decoration
    (`aria-hidden`) and never appears on a support screen or on a "quiet" day.
  - **Surfaces**: one `.tl-feature` card per section, rows with hairlines for lists, `.tl-tile` for
    quick tools, plain type on the page for the rest. One coral button per section.
  - **Fonts**: headlines use Literata, a file in `src/fonts/` with its license. Everything else uses
    the phone's own font, so there is nothing to load. Never link a font.
  - **Streak wording is the reviewed-or-awaiting-review wording; restyle it, never rewrite it.**
    Days are dots whose state is a shape as well as a color (filled, soft with a ring, dashed,
    double ring). Never red, and a milestone sets off no burst.
  - **Only plain how-to text folds under "Learn more"** (`src/ui/sections.js`), and it is never
    cut. A founder's rule: every word about privacy or consent stays in view, always: what is
    stored, where data stays, who gets a message, that a sent message can't be undone. So do lines
    about urgent help (988, 911), status lines, and controls. Two paragraphs fold today (how to add
    a place, how to share). When unsure whether a paragraph is only how-to, leave it in view.
  - **The tab bar** shows icons only when its labels can't fit (`fitTabBar` in `src/ui/shell.js`);
    the labels stay in the page for screen readers.
- **Words**: every word is in `src/text/redesign.en.html`. Scripts read them with `t('key')` from
  `src/ui/words.js`; a word with two voices has `data-style="calm"` and `"straightforward"`.
  Spanish is `src/text/redesign.es.json`; `npm run words:es` makes `redesign.es.html` from the two,
  and fails if a line has no Spanish. Crisis sentences are whole-line entries copied from the
  existing Spanish pages.
- **State and storage**: `src/ui/state.js` holds what's loaded (`state.settings`, `profile`,
  `onboarding`, `home`, `days`, `streak`, `sessions`, `presets`); `save(name, change)` merges,
  `replace(name, value)` swaps. Keys are in `KEYS` in `src/core/storage.js`: the older
  `tidelight.checkin.v1`, `agegroup.v1`, `textsize.v1`, `log.v1`, `reminders.v1` (read once),
  `places.v1`, `hope.v1`, `circle.v1`, and the new `tidelight.settings`, `profile`, `onboarding`,
  `home`, `days`, `streak`, `sessions`, `presets`, `schema`.
- **Config** (`src/core/config.js`): streak rules, check-in limits, reminder limits, meditation
  timings, builder limits, haptic timings. Change behavior there.
- **Check-ins**: `src/ui/checkin.js` is the quick check-in; `app.js` keeps the log and fires
  `tidelight-checkin` for both kinds. Moods 1 and 2, and the feelings in
  `CONFIG.checkIn.distressFeelings`, show support at once and make the day "quiet". Those rules
  have one implementation, `src/logic/safety.js` (`isLowMood`, `isHeavyFeeling`, `showsSupport`,
  `isQuietDay`): screens ask it and never decide on their own.
- **Streaks**: `src/logic/streaks.js` (pure, local `YYYY-MM-DD` keys); `src/ui/streaks-ui.js`.
- **Meditation engine**: a meditation is data (`src/logic/meditations.js`: `builtIn(type, options)`).
  `src/logic/timeline.js` owns the clock; `src/ui/player.js` subscribes five layers to it
  (`worlds.js`, the guide, the voice and ambient sound in `audio.js`, haptic breathing).
  `audioPlan()` decides what may sound; Silent is always nothing.
- **Voice clips**: `app/assets/voice/<language>/<scriptId>_<style>.mp3`, for example
  `app/assets/voice/en/intro.deep_calm.mp3`. Ambient loops: `app/assets/ambient/rain.mp3`,
  `ocean.mp3`. The build lists what exists; anything missing falls back to text-to-speech or to
  sound made in code.
- **Builder algorithm**: `src/logic/generate.js`, `generateMeditation(choices)`. Intro 10% and outro
  8% of the time (clamped), an optional body scan from 8 minutes, silence from 10, the rest whole
  breaths by situation, leftover seconds to silence or the outro so the total is exact.
- **Suggestions**: `src/logic/suggest.js`, `suggestMeditation(context)`, rules in order.
- **Haptics**: screens call `haptic('name')` from `src/ui/haptics.js`; patterns and the throttle are
  in `src/logic/haptic-patterns.js`; `src/ui/feel.js` wires taps and switches for every screen.
- **The phone's part**: `src/ui/device.js` (permissions, one location, reminders, keep-awake, audio
  route) over `src/native.js` and the Swift plugin. Tests pretend through `window.__tidelight`.

## Where things go

| Path | What belongs there |
| --- | --- |
| `src/core/` | Storage layer (`storage.js`, `device-storage.js`, `migrations.js`), tunable numbers (`config.js`), developer notes (`dev.js`) |
| `src/logic/` | Pure logic with no browser or phone in it, each with unit tests |
| `src/ui/` | Screens and components. They read words from the page, numbers from `config.js`, and data through the store |
| `src/text/*.html`, `redesign.es.json` | Every word, as named blocks, one file per language |
| `src/tokens.css` | Design tokens. Every other redesign stylesheet uses only these |
| `src/redesign-identity.css`, `src/fonts/`, `src/grain*.svg` | The look: loads after `redesign.css`. Fonts and paper grain are local files |
| `design/` | Design notes: `AUDIT.md`, `TOKENS.md` (generated by `tools/token-report.mjs`), `COMPARISON.md`. Pictures from `tools/screens.mjs` stay on your computer |
| `test/quiet.mjs` | The muted browser every test and tool opens |
| `test/crisis-test.mjs`, `test/safety-test.mjs`, `test/fixtures/` | Crisis paths and safety rules on screen; the crisis inventory, the wording snapshot, and the "Learn more" allow-list |
| `test/app-screens.mjs` | The one list of every screen and state, and how to reach each. The crisis, accessibility, resilience, and network tests and the reviewer walkthrough all walk it. A new screen goes here |
| `test/a11y-test.mjs`, `test/budget-test.mjs`, `test/resilience-test.mjs`, `test/network-test.mjs` | Accessibility, the performance budget, damaged and oversized data, and "nothing leaves the phone" |
| `src/logic/safety.js` | The one implementation of "low mood", "heavy feeling", "show support", and "quiet day" |
| `src/app-return.js` | Loaded on every page, apart from the bundle: shows the page again when the app comes back after Quick exit |
| `src/app.js`, `src/extras.js` | The older app layer and the Hope box / My circle layer |
| `tools/` | Build steps, the lint, the words packet |
| `test/unit/` | `*.test.mjs` for `src/core/` and `src/logic/` |
| `ios/`, `android/` | Native projects. Edit by hand only for settings and the `Tidelight` plugin |

## Conventions (match what exists)

- Two-space indent, single quotes, semicolons, `const` first. Small functions with a one-line
  comment that says why, in plain words.
- Class names: `ci-` is the website's check-in, `app-` the older app layer, `tl-` the redesign.
- Stored keys start with `tidelight.` and are listed in `KEYS` in `src/core/storage.js`.
- The page has a strict Content Security Policy: no inline scripts and no `style="..."`
  attributes. Set styles from scripts through `element.style` or classes.
- Scripts never hold words. Read them from the page with the helpers in `src/ui/words.js`.
- Tests say what a person would see. A test may never contact a crisis service.
