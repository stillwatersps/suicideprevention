---
aliases: [Privacy inventory, Data inventory]
status: a description of what the app does today, written from its code. Not a privacy policy, and not legal advice
---

# Privacy inventory: what the phone app stores, and where it goes

[[00 START HERE|Back to Start Here]]

Written November 12, 2026, during the launch readiness work ([[LAUNCH-READINESS]]), by reading the
app's code on `app/launch-readiness`. It describes existing behavior only. **It is not a privacy
policy.** No privacy policy or terms exist yet; that is a launch blocker listed in
[[LAUNCH-BACKLOG]]. A lawyer should read this beside [[LEGAL-PACKET]].

## The short version

- The app has no accounts, no server, no analytics, no crash reporting, no advertising, and no
  third-party code that contacts anyone. A test (`app/test/network-test.mjs`) walks every screen
  with the network blocked and fails if the app tries to reach anything.
- Everything a person enters is stored on their phone, inside the app's own storage.
- Data leaves the phone in only three ways, each started by the person: a text message they send
  from the phone's own Messages screen, the phone's Share sheet, and the phone's own backup
  (iCloud or Google) if they have backups turned on.
- Location is read only when the person asks, or, if they turn on "Places that are hard for me",
  watched by the phone itself for the places they chose. It is never sent anywhere by the app.

## Everything stored

Where: on iPhone, the app's key-and-value storage is the phone's `UserDefaults` for this app
(through Capacitor's Preferences plugin); in a web browser it is `localStorage`. Photos are in the
web view's IndexedDB database `tidelight-hope`. Nothing is in a shared container or in iCloud
key-value storage. Formats are JSON unless marked plain text. The stored format's version is in
`tidelight.schema` (currently 2); changes go through `app/src/core/migrations.js`.

| Stored as | What it holds | Why | Entered by | Leaves the phone? |
| --- | --- | --- | --- | --- |
| `tidelight.agegroup.v1` (plain text) | An age group, such as "adult". The date of birth itself is used once to work out the group and is not kept | To show ideas suited to the person's age | The person, once | No |
| `tidelight.profile` | An optional first name | The greeting on Home | The person | No |
| `tidelight.settings` | Check-ins per day, wake and bed times, check-in times, check-in style, reminders on or off, haptics, sound, reduce motion, streaks on or off, (on `app/privacy-package`) the app lock on or off, and (on `app/next-features`) Apple Health on or off | To run the app the way the person set it | The person | No |
| `tidelight.textsize.v1` (plain text) | "large" or "regular" | Text size | The person | No |
| `tidelight.language` (plain text) | "en" or "es" | To open in the chosen language | The person | No |
| `tidelight.reach.v1` | A message for a hard moment, only if the person changed the screen's own words and saved them (up to 300 characters), and when | To fill in a text the person sends to someone in their circle | The app; the person they send it to, through the phone's own messages | Only when the person taps Send in the phone's messages |
| `tidelight.letter.v1` | A letter to myself: one letter in the person's own words (up to 2,000 characters), and when it was last changed | To read on a hard day | The app, and anyone the person shows it to | No |
| `tidelight.plan.v1` | The safety plan: six short lists in the person's own words (warning signs, things to do, people and places, people to ask for help and professionals, each with a name and an optional phone number, and ways to make their space safer), and when it was last changed | To read in a hard moment | The person | Only if they share it. "Delete everything" removes it, the app lock covers it, and it is in "a copy of my data" |
| `tidelight.onboarding` | Whether setup is finished; the date of a day with a very low check-in (the "quiet day") | To skip onboarding next time; to keep that day free of celebration | The app | No |
| `tidelight.log.v1` | Each check-in: the time, the part of the day, the mood or feeling chosen, needs chosen, tags, and an optional short note | "Today" and "Your journey"; the streak | The person | Only if they share it (below) |
| `tidelight.checkin.v1` | The Daily check-in's own state: journal entries, reflections, ideas kept or set aside, and calendar marks | Journal, Rediscover, Your journey | The person | Only if they share an entry |
| `tidelight.days`, `tidelight.streak` | For each day, how many check-ins and meditations were finished; the streak count, best streak, and freezes | The streak | The app, from check-ins | No |
| `tidelight.sessions` | Meditation history: type, length, when, and an optional mood after | History; suggestions | The app | No |
| `tidelight.presets` | Saved meditations the person built | The builder | The person | No |
| `tidelight.home` | One "home spot": a latitude and longitude | To suggest a longer meditation at home | The person, by tapping "Save where I am" | No |
| `tidelight.places.v1`, and a copy in the phone's `UserDefaults` for the watcher | "Places that are hard for me": each place's name, location, and size; up to 5 people's names and phone numbers; the wait time; the message; whether the place's name may show on the lock screen; whether it is on | So the phone can notice a chosen place and offer to send the message | The person | Only in a text message they choose to send |
| `tidelight.circle.v1` | "My circle": up to 5 people's names and phone numbers; a list of what the person opened in Messages for them | To address a message; a record for the person | The person | Names and numbers go to the phone's Messages screen when they share |
| `tidelight.hope.v1` | Hope box words: the kind and the text | The Hope box | The person | Only if they share an item |
| IndexedDB `tidelight-hope` | Hope box photos. On `app/pre-review-fixes` an iPhone uses the phone's own photo picker: the app sees only the photo chosen, asks for no access to the library, and never opens the camera. The app redraws the photo smaller, which leaves out where and when it was taken | The Hope box | The person, from their photo library | Only if they share one |
| `tidelight.reminders.v1` | The four reminders of an older version | Read once when upgrading; kept unchanged | The older version | No |
| `tidelight.schema` (plain text) | The stored format's version number | Upgrades | The app | No |
| Session only: `tidelight.night-until` | The time tonight ends, while "Darker at night" is on and it is night | So every page in the app is dark at night | The app | No; gone when the app closes |
| Session only: `tidelight.language.tapped` | "en" or "es", when the language link is tapped on a website page inside the app, until the Daily check-in page saves it as the language | Remembering the language | The app | No; gone when the app closes |
| Session only: `tidelight.older-layout` | A mark that the newer screens failed to start, so the older layout is used until the app is closed | Reliability | The app | No; gone when the app closes |

Not stored anywhere: the date of birth; any location other than the home spot and the person's
own places; any record of taps, screens visited, or time spent; any identifier for the person or
the phone.

## "What tends to help"

A screen that counts, from check-ins, meditations, and journal dates already on the phone, what else was
recorded on days with a quick check-in of Good or Great. The count is made each time the screen opens and is
never stored; nothing new is kept, and nothing leaves the phone. The app lock covers it.

## What the app tells the person

"Your privacy in Tidelight" (Settings, About) is a plain description written from this inventory. It says
first that it is not a privacy policy. When this inventory changes, that screen changes too; a unit test
ties the screen to the app's list of stored things.

## A summary for an appointment

A screen that puts the person's own check-ins, journal entries, and safety plan from the last 14 or 30 days
on one short page, with one line they may type. Only what they tick is on it. It is made each time the screen
opens; what is ticked or typed is never stored, and the app keeps no copy of the page. The app lock covers it.

## The Apple Watch app

A separate small program that comes with the iPhone app. It stores nothing, and it can read nothing the phone
app stores: the two share no storage and do not talk to each other. It has no notifications and no watch-face
complication. "Call 988", "Text 988", and "Call 911" hand an address to the watch's own Phone and Messages;
nothing from the app goes with it but, in Spanish, the word AYUDA in the text.

## The Home Screen widget (iPhone)

A separate small program inside the app. It stores nothing and can read nothing the app stores: there is no
shared storage between them. It shows only fixed words and never changes. A tap passes the app one word,
"breathe", "plan", or "home", through the app's own address (`tidelight://open/...`); any other app on the
phone could open that address too, and all it can do is open Tidelight at one of those places, behind the app
lock if it is on.

## When data leaves the phone

"Care near me" (November 17, 2026): a link opens the phone's maps app at a search for emergency rooms. The
app sends nothing and reads no location; the address is the same for everyone. From there the maps app, not
Tidelight, uses the person's location under its own privacy policy, and may keep the search.

| How | What goes | To whom | Who starts it |
| --- | --- | --- | --- |
| A text message from "Places that are hard for me" | The person's own message and, if they choose, where they are | The people they chose, through the phone's Messages screen; the person still taps Send | The person |
| "Send to my circle" and Share | The text of a check-in, a journal entry, or a Hope box item, as shown in a preview they can edit | Whoever they pick in Messages or the phone's Share sheet | The person |
| "Make a copy of my data" (Settings, on `app/privacy-package`) | One text file with the check-ins, journal, reflections, lists, Hope box words, people, places, meditation history, name, age group, and home spot. No photos | Wherever the person sends or saves it from the phone's share sheet | The person, by tapping the button. The file is written to the app's temporary folder and deleted when the sheet closes; the app keeps no record of it |
| "Share this summary" (a summary for an appointment) | One text file with what the person ticked: check-ins and journal entries from the last 14 or 30 days, the safety plan, and one line they typed. Every word is shown on the screen first | Wherever the person sends or saves it from the phone's share sheet | The person, by tapping the button. The file is written to the app's temporary folder and deleted when the sheet closes; the app keeps no record of it |
| Apple Health, only if "Add meditations to Apple Health" is on (iPhone) | For each finished meditation: when it started and when it ended, as "mindful minutes", under the app's name. No mood, check-in, or word. The app asks for no access to read Health | Apple's Health store on the phone. From there it can sync to the person's iCloud and be read by other apps the person allowed | The person, by turning the setting on; then the app, each time a meditation is finished. A button in Settings and "Delete everything" remove what the app added |
| A shortcut or Siri (iPhone) | Nothing. A shortcut passes the app one word, "breathe" or "plan" | Nobody | The person |
| The phone's backup | Everything in the table above | Apple (iCloud) or Google, under the person's own account, if backups are on | The phone, on its own schedule |
| Quick exit | Nothing from the app. The phone's browser opens weather.gov, which sees a visit like any other | weather.gov | The person |
| Call 988, Text 988, Call 911, Chat Online | Nothing from the app. The phone's own dialer, Messages, or browser opens | 988 or 911 | The person |
| Local notifications | Nothing leaves. They are scheduled on the phone | Nobody | The app, if reminders or Places are on |

## How long it is kept, and how it is deleted

- Kept until the person deletes it or removes the app. Nothing expires by itself.
- **"Delete everything"** (Your journey) removes: every check-in, journal entry, reflection, and
  list; places and their people; My circle; the Hope box and its photos; the name; the home spot;
  the streak; and meditation history. It keeps: the age group, settings, and saved meditations (so
  the person isn't asked again). This is as the screen itself says.
- Removing the app removes everything on the phone.
- A copy in an earlier phone backup can last until the next backup replaces it. The app says so.
- Single items can be removed one at a time: a journal entry, a kept idea, a Hope box item, a
  place, a person, a saved meditation. A single check-in, or a single meditation in the history,
  can't be removed on its own, and there is no way to export a copy. See [[LAUNCH-BACKLOG]].
- **On `app/privacy-package` (November 14, 2026):** each of today's check-ins and each meditation
  in the history has its own Remove. Removing a check-in takes its words off the phone (the
  feeling, needs, tags, and note); the day stays marked on the calendar and in the streak, which
  hold no words, and the screen says so. A check-in from an earlier day still can't be removed on
  its own, because earlier days aren't listed anywhere. "Make a copy of my data" exports a copy.
- **The app lock** (same branch) stores one thing: on or off, in `tidelight.settings`. The check
  itself (Face ID, Touch ID, or the phone's passcode) is the phone's own; the app never sees a
  face, a fingerprint, or a code, and keeps none. The lock keeps the app's screens closed; it does
  not encrypt what is saved. "Delete everything" leaves the lock setting as it is, like the other
  settings.

## Third parties

None receive data from the app. The app's shipped code is the project's own, plus Capacitor (the
bridge between the page and the phone) and its Preferences, Share, and Local Notifications plugins.
None of them contacts a server. The two fonts are files inside the app. See
[[THIRD-PARTY-LICENSES]].

## What a lawyer should check against this

1. The audience includes minors, and the app asks for a date of birth (it keeps only an age group).
   What does that require in the United States (for under-13s in particular), and in Apple's rules?
2. Names and phone numbers of other people (the person's contacts) are stored on the phone.
3. Location: one home spot, and optionally places watched in the background ("Always").
4. The phone's backup carries all of it to Apple or Google under the person's account.
5. Free-text notes and journal entries may contain health information the person wrote themselves.
6. The screen's own privacy wording ("What happens to what you share here") should match this note.
