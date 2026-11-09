# Tidelight phone app (draft)

The website's pages inside a phone app, built with [Capacitor](https://capacitorjs.com). It adds
three things to the Daily check-in, and nothing else:

- **Saving on the phone.** Check-ins, reflections, journal entries, and lists are kept on this phone
  only (Capacitor Preferences). Nothing goes to Tidelight. The phone's own iCloud or Google backup
  includes them when it's on. Delete everything removes them.
- **Age setup.** The date of birth is asked once. The app keeps only the age group (under 13,
  13 to 17, 18 to 24, 25 to 64, 65 and over) and forgets the date. 988, 911, and Quick exit stay on
  screen while it asks. The research behind the groups is in `notes/AGE-STRATEGIES.md`.
- **Share this reflection.** A Share button on journal entries, kept lists, and today's feeling. It
  shows a notice first (who sees it, that it can't be taken back, that it isn't a way to get urgent
  help, with 988 and 911), lets the person change the words, then opens the phone's share sheet.

**Draft. No licensed reviewer has read the app's words, no fluent reader has checked the Spanish,
no lawyer has advised on ages or privacy, and it has never run on a phone.** Every word the app adds
is in `src/text/en.html` and `src/text/es.html`.

## How it's built

| Path | What it is |
| --- | --- |
| `tools/build.mjs` | Copies the website's published files into `www/`, then adds the app's blocks to the Daily check-in and About pages. Fails if the website changed so that a block no longer fits exactly once |
| `src/app.js` | Saving, age setup, and sharing. Bundled into `www/assets/app.js` |
| `src/app.css` | Styles for the app's blocks, using the website's Shoreline colors |
| `src/text/*.html` | Every word the app adds, in English and Spanish |
| `test/app-test.mjs` | 47 checks per language in desktop Chromium, with browser stand-ins for saving and sharing |
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
npm test
```

To run it on a phone, after `npm install`:

```bash
npm run sync
```

Then, for Android, open `app/android` in Android Studio and press Run. For iPhone, on a Mac with Xcode,
run `npx cap open ios` and press Run. Follow the rule in `notes/PHONE-TEST.md`: tap call and text links only as far
as the dial or compose screen, then cancel.

## Still to do before anyone else uses it

- A licensed reviewer reads `src/text/en.html` and `notes/AGE-STRATEGIES.md`. A fluent reader checks
  `src/text/es.html`.
- A lawyer advises on under-13s (COPPA, store rules) and on the privacy wording.
- Try it on real phones: saving after closing the app, backup and restore, the share sheet, and the
  call and text links.
- Confirm on Apple's and Google's pages that Preferences data is in iCloud and Google backups, as
  `notes/CHECK-IN-BACKEND.md` assumes.
- Choose the real app ID. `org.tidelight.app` is a placeholder, and the name still needs its trademark
  check.
- Icons and a launch screen. The native projects use Capacitor's defaults.
