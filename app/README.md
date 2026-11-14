# Tidelight phone app (draft)

The website's pages inside a phone app, built with [Capacitor](https://capacitorjs.com). It adds
five things to the Daily check-in, and nothing else:

- **Saving on the phone.** Check-ins, reflections, journal entries, and lists are kept on this phone
  only (Capacitor Preferences). Nothing goes to Tidelight. The phone's own iCloud or Google backup
  includes them when it's on. Delete everything removes them.
- **Age setup.** The date of birth is asked once. The app keeps only the age group (under 13,
  13 to 17, 18 to 24, 25 to 64, 65 and over) and forgets the date. 988, 911, and Quick exit stay on
  screen while it asks. The research behind the groups is in `notes/AGE-STRATEGIES.md`.
- **Share this reflection.** A Share button on journal entries, kept lists, and today's feeling. It
  shows a notice first (who sees it, that it can't be taken back, that it isn't a way to get urgent
  help, with 988 and 911), lets the person change the words, then opens the phone's share sheet.
- **Check-in reminders.** Four optional reminders, morning, midday, after school or work, and before
  bed, each off until turned on, at times the person sets. The phone itself shows them, and they
  say only "A moment to check in, if you'd like." Nothing is sent anywhere.
- **Today's check-ins, shared on purpose.** Your journey lists each check-in by the time of day it
  was done, with the feeling and needs chosen, and offers Share today's check-ins and Share the
  last 7 days through the same notice and share sheet. See `notes/CHECK-IN-SCHEDULE.md`.
- **Places that are hard for me (idea E1).** Off until turned on. The person adds their own places on a
  map, chooses up to 5 people from their contacts, a wait time, and a message. The phone watches the
  places itself (region monitoring, at most 20); after the wait, a neutral notification opens an alert
  screen with a countdown, "I'm okay", 988 and 911, and then the phone's Messages composer, where the
  person taps Send. The app suggests no places and keeps no record of visits. Native code is in
  `ios/App/App/` (Swift); the dwell logic and its tests are in `ios/TidelightLogic/`. See
  `notes/LOCATION-ALERT.md`.

## The redesign (a draft on top of the above)

One founder's build spec (`BUILD-SPEC.md`) asked for fewer words, bottom tabs, onboarding, streaks, and
meditation. It is built on the branch `app/redesign-dev`: five tabs (Home, Check-in, Meditate, Location,
Friends), a quick check-in in two styles, streaks that can be turned off, a meditation player with four
types and a builder, and haptics. The crisis strip, Exit, Get Support Now, the Spanish link, and the
"Draft for review" notices stay on every screen. Read `CLAUDE.md` (the rules), `PROGRESS.md` (what was
built and every decision), `CHANGELOG.md`, and `TESTING_CHECKLIST.md` (what to try on a real phone).

**Draft. No licensed reviewer has read the app's words, no fluent reader has checked the Spanish,
no lawyer has advised on ages or privacy, and it has never run on a phone.** Every word the app adds
is in `src/text/en.html` and `src/text/es.html`.

## How it's built

| Path | What it is |
| --- | --- |
| `tools/build.mjs` | Copies the website's published files into `www/`, then adds the app's blocks to the Daily check-in and About pages. Fails if the website changed so that a block no longer fits exactly once |
| `src/app.js` | Saving, age setup, sharing, today's check-ins, and reminders. Bundled into `www/assets/app.js` |
| `src/app.css` | Styles for the app's blocks, using the website's Shoreline colors |
| `src/text/*.html` | Every word the app adds, in English and Spanish |
| `test/app-test.mjs`, `test/extras-test.mjs`, `test/redesign-test.mjs`, `test/unit/` | Browser checks in desktop Chromium with stand-ins for the phone, and unit tests for the pure logic. `npm test` runs the lint and all of them, and GitHub runs it on every pull request (`.github/workflows/site.yml`, the `app` job) |
| `android/`, `ios/` | Native projects made by `npx cap add`. Open them in Android Studio or Xcode |

The website is unchanged, except that `assets/check-in.js` now offers `window.TidelightCheckIn`, so
the app can read and restore the check-in. The website never calls it and still stores nothing.

## Try it

You need Node.js. On a computer with this project:

```bash
cd app
```

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
npm test
```

The second command downloads the browser the tests use, once.

To run it on a phone, after `npm install`:

```bash
npm run sync
```

Then, for Android, open `app/android` in Android Studio and press Run. For iPhone, on a Mac with Xcode
and CocoaPods, run `npx cap open ios` and press Run. (`npm run sync` needs CocoaPods for the iPhone
part; without it, run `npx cap sync android` and the iPhone project's `Podfile` is kept current by hand.) Follow the rule in `notes/PHONE-TEST.md`: tap call and text links only as far
as the dial or compose screen, then cancel.

## Running on iPhone

The iOS project targets iOS 15 and uses the scene life cycle, which Xcode 27's SDK requires. CocoaPods
needs a UTF-8 locale on this Mac:

```bash
LANG=en_US.UTF-8 npm run sync
```

```bash
cd ios/TidelightLogic && swift test
```

The Simulator can't watch places (region monitoring isn't available there) or send texts, so test
builds show a "Pretend I just arrived" button and a 1-minute wait, and the share sheet stands in for
Messages. A real iPhone is needed for the rest.

## Step by step: install, look, test

Added during the launch readiness work. Each block is one command; run them from the `app` folder.

**1. Install** (once; needs Node.js):

```bash
npm ci
```

```bash
npx playwright install chromium
```

**2. Look at it in a web browser on this computer:**

```bash
npm start
```

It prints an address to open. Only this computer can reach it. A browser has no real
notifications, places, or Messages, so the app uses stand-ins for those.

**3. Run it in the iPhone Simulator** (a Mac with Xcode and CocoaPods):

```bash
LANG=en_US.UTF-8 npm run sync
```

```bash
npx cap open ios
```

In Xcode, choose an iPhone simulator at the top and press Run. To start the installed app again
without sound, which every automated run must do:

```bash
npm run sim:launch
```

**4. Run it on a real iPhone.** Nobody has done this yet. Plug the phone into the Mac, open the
project as in step 3, choose the phone at the top of Xcode, and under Signing & Capabilities choose
your own Apple account as the team. Xcode asks the phone to trust the computer and, on the phone,
Settings asks you to trust the developer. A free Apple account works for a week at a time. Then
work through `TESTING_CHECKLIST.md`. **Tap call and text buttons only as far as the dial or
compose screen, then cancel. Never complete a call or a text to a crisis service.**

**5. Run every test** (about 35 minutes; no sound, no network, nothing leaves the computer):

```bash
npm test
```

**6. Run the safety tests alone** (about 8 minutes). Do this before every commit that touches
`src/`:

```bash
npm run test:safety
```

Other parts on their own: `npm run lint`, `npm run test:unit`, `npm run test:crisis`,
`npm run test:a11y`, and `npm run test:ios` (the Swift logic for places; needs Xcode).
From the repository's top folder, before every push: `python3 tools/check_site.py`.

What each test covers, and what none of them can (a real phone), is in
`notes/LAUNCH-READINESS.md`.

## Still to do before anyone else uses it

- A licensed reviewer reads `src/text/en.html` and `notes/AGE-STRATEGIES.md`. A fluent reader checks
  `src/text/es.html`.
- A lawyer advises on under-13s (COPPA, store rules) and on the privacy wording.
- Try it on real phones: saving after closing the app, backup and restore, the share sheet, the
  reminders (the permission question, and whether a reminder arrives at its time, including with
  the app closed), and the call and text links.
- Confirm on Apple's and Google's pages that Preferences data is in iCloud and Google backups, as
  `notes/CHECK-IN-BACKEND.md` assumes.
- Choose the real app ID. `org.tidelight.app` is a placeholder, and the name still needs its trademark
  check.
- Icons and a launch screen. The native projects use Capacitor's defaults.
