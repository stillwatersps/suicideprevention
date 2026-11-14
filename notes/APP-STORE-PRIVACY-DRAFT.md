---
aliases: [App Store privacy draft, App Privacy answers]
status: DRAFT, for founder and lawyer review. Not legal advice. Nothing has been submitted to Apple
---

# App Store "App Privacy" answers: a draft

[[00 START HERE|Back to Start Here]]

**DRAFT — for founder and lawyer review. Not legal advice.** Written November 12, 2026, from
[[PRIVACY-INVENTORY]], which was written from the app's code. Apple's questions and definitions
change; read Apple's current wording in App Store Connect before answering, and have a lawyer
confirm. Nothing here has been entered anywhere.

## What Apple asks, and the draft answer

Apple's questionnaire starts with one question: **"Do you or your third-party partners collect
data from this app?"** Apple has defined "collect" as sending data off the device in a way that
lets you or your partners access it for longer than it takes to service the request. Data that is
only ever processed on the device is not "collected" in that sense.

| Question | Draft answer | Why |
| --- | --- | --- |
| Do you or your third-party partners collect data from this app? | **No** | The app has no server, no accounts, no analytics, and no third-party code that contacts anyone. Everything stays on the phone ([[PRIVACY-INVENTORY]]). A test fails if the app makes any network request |
| Is data used to track the user? | **No** | Nothing is collected, and there is no advertising or data broker |
| Resulting label | **"Data Not Collected"** | Follows from the first answer |

If the first answer is "No", Apple asks nothing further. The answers below are kept in case a
lawyer reads Apple's definition differently, or a future version adds a server.

## If the app were treated as collecting, what the data types would be

| Apple's data type | In this app | Linked to the person? | Used for tracking? |
| --- | --- | --- | --- |
| Health & Fitness, or Sensitive Info | Mood and feeling check-ins, journal entries, meditation history | Stored on the phone only | No |
| Location (Precise) | One home spot; places the person chooses, watched by the phone | Stored on the phone only | No |
| Contacts | Names and phone numbers of up to 5 people the person picks, in each of two features | Stored on the phone only | No |
| User Content (Photos, Other) | Hope box photos and words; notes | Stored on the phone only | No |
| Contact Info (Name) | An optional first name | Stored on the phone only | No |
| Identifiers, Usage Data, Diagnostics, Purchases, Financial Info, Browsing or Search History | None | | |

## Things that could change the answer

1. **The phone's backup.** Everything goes into the person's own iCloud or Google backup if they
   have backups on. That is the person's account with Apple or Google, not collection by the
   developer. A lawyer should confirm this reading.
2. **Messages and the Share sheet.** The person can send a message or share an entry. The app
   hands the text to the phone's own screens and never sees whether it was sent.
3. **Any future addition** of crash reporting, analytics, a server, sign-in, or a third-party SDK
   would change the first answer to "Yes" and require the table above to be filled in for real.
4. **Third-party SDKs' own declarations.** Apple expects the label to cover SDKs too. The app's
   only SDK is Capacitor and three of its plugins; none sends data anywhere.

## What Apple also requires around this (not answered here)

- **A privacy policy URL.** Required for every app, even with "Data Not Collected". None exists
  yet. A launch blocker: [[LAUNCH-BACKLOG]].
- **A privacy manifest** (`PrivacyInfo.xcprivacy`) in the app, declaring why it uses certain
  system features. The app reads and writes `UserDefaults` (through the Preferences plugin and for
  the places watcher), which is one of the features Apple requires a declared reason for. The app
  has no manifest of its own yet. See `notes/APP-STORE-READINESS.md`.
- **Purpose strings** for location, which exist (see the permissions list in [[LAUNCH-READINESS]]).
- **Age rating** and, because the audience includes minors, Apple's rules for apps used by
  children. A founder and lawyer decision.
