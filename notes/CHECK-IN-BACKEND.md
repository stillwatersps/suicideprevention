---
aliases: [Check-in backend, Saving check-ins]
status: plan, not built, not agreed by both founders. Chosen route (one founder): phone app with iCloud or Google backup
---

# Saving the Daily check-in

[[00 START HERE|Back to Start Here]]

On November 9, 2026, one founder first chose **accounts and a server** for saving check-ins and
journal entries. Later that day, after the comparison below, the same founder chose instead: **a
phone app that saves on the phone, backed up by the user's own iCloud or Google backup.** The other
founder hasn't agreed. Nothing for saving is built: the website's Daily check-in works only while
the page is open. "The phone app plan" below is the current proposal. The accounts-and-server table
stays for comparison.

## What is built now

- Every screen works in the page: check-in, suggestions, reflections, journal with edit and
  delete, Your journey, and Delete everything.
- Nothing is sent or stored. `tools/check_site.py` fails if `assets/check-in.js` could send or
  store data, and the browser tests confirm no requests to other sites.
- Every screen says plainly that saving isn't built.

## What accounts and a server would need (no longer the chosen route)

| Area | What it means here |
| --- | --- |
| A server and database | A hosted service outside GitHub Pages, with its own cost and upkeep. Someone must own it |
| Accounts | Sign-up and sign-in, password reset, and a way to stay anonymous (no real name, optional email) |
| Encryption | Entries encrypted in transit and at rest. Ideally end-to-end, so not even Tidelight can read them |
| Privacy policy | A plain-language policy, written with a lawyer, saying what is kept, for how long, and who can see it |
| Deleting | Delete one entry, everything, or the whole account, at any time, and actually remove it |
| Shared devices | Sign-out, a short session timeout, and no entry text in notifications or page titles |
| Minors | Ages are undecided ([[DECISIONS]], open decision 6). Under-13s bring U.S. COPPA rules. A lawyer must advise first |
| Health data rules | Journals about distress are sensitive. Some state laws cover consumer health data. A lawyer should check |
| Nobody is watching | Saved entries would not be monitored. The site must say so, because someone might write something urgent and expect a reply. See [[SAFETY]] rule 3 |
| No analysis | Entries are never analyzed or scored without clear, separate consent. The founder's spec asks for this |
| Breaches | A plan for what happens if data leaks, and who tells the people affected |
| Review | The licensed reviewer, and ideally someone with lived experience, review the saved-data design before launch |

## The phone app plan (proposed, not built)

One founder's choice on November 9, 2026. Claude's proposal for how to build it, from general
knowledge; confirm the platform details on Apple's and Google's developer pages before building.

| Part | Proposal |
| --- | --- |
| How it's built | Wrap the existing pages in an app with Capacitor, an open-source tool for that, rather than writing two new apps. The app shows the same pages, so the review packets stay the one place where the words are reviewed. A rewrite in Swift and Kotlin would mean every word reviewed again |
| Saving | The app saves check-ins, reflections, and journal entries as a file in its own storage on the phone. Nothing goes to Tidelight |
| iPhone backup | Files an app keeps in its own storage are part of the phone's iCloud Backup when the user has it on, and come back when they set up a new iPhone from that backup. Nothing extra to build. Live syncing between a person's devices would need Apple's CloudKit, a later step |
| Android backup | Android's Auto Backup copies app data to the user's Google account (it has a size limit per app, about 25 MB, to confirm). Nothing extra to build for a text journal |
| Encryption | Both phones encrypt app storage when a screen lock is set. Apple and Google say their backups are encrypted, with end-to-end options. Confirm what each says before the app claims anything |
| App lock | An optional Face ID, fingerprint, or passcode lock inside the app, for shared phones |
| Deleting | "Delete everything" removes the file at once. **A copy in an earlier backup can last until the phone's next backup replaces it, and deleting the app doesn't remove it from iCloud or Google.** The app must say this plainly |
| The website | Stays as it is: saves nothing. Only the app saves. `tools/check_site.py` keeps forbidding storage on the website. The app needs its own check |
| Crisis links | Call and text links must open the phone's dialer and messages from inside the app. Test on real phones, stopping at the dial or compose screen ([[SAFETY]] rule 7) |
| Quick exit | Means something different in an app. Leaving the app, plus an optional lock, is the closest match. A question for the reviewer |
| Store review | Apple often turns down apps that are only a website in a wrapper. Saving, the app lock, and working offline should make this more than the website, but that is Apple's call |
| Location alerts | Asked about by one founder. Not part of this plan. See [[IDEAS]], idea E1, and the reviewer's question in [[CONTENT-REVIEW]] |
| Nobody is watching | Entries never reach Tidelight, so nobody reads them. The app must say so, and keep 988 and 911 on screen, as the website does |

What it needs that this project doesn't have yet:

- A Mac with Xcode to build and send the iPhone app, and an Apple Developer account (about $99 a
  year, to confirm). Android Studio and a Google Play developer account (about $25 once, to confirm).
- Real iPhones and Android phones to test on. A cloud session like Claude's can't build the iPhone
  app.
- Agreed ages first ([[DECISIONS]], open decision 6), since under-13s change the store rules.
- The store privacy forms filled in honestly: on-device data, not collected by Tidelight.
- The licensed reviewer to see the app's saving and deleting wording, and a lawyer to read the
  privacy wording.

## Ways to save, compared

Added November 9, 2026, after one founder asked whether an App Store or Play Store app would come
with a server. It wouldn't: the stores distribute apps and their updates, but don't store users'
data. This table is Claude's summary from general knowledge. Nobody has read Apple's or Google's
current pages for it, so confirm prices and rules there before deciding.

| Option | Server needed | Who can read entries | If the phone is lost | Main costs and risks |
| --- | --- | --- | --- | --- |
| Nothing saved (built now) | No | Nobody. Gone when the page closes | Nothing to lose | People lose what they wrote |
| Saved in the browser, on the website | No | Anyone who can open that browser | Lost, unless the browser syncs | Needs [[SAFETY]] rule 5 changed. A shared device keeps the entries, and Quick exit can't hide them |
| A phone app, saved on the phone only | No | Anyone who can unlock the phone. An app lock (Face ID or a code) helps | Lost, unless the phone's own backup is on | Building and keeping two apps, store fees (about $99 a year for Apple, $25 once for Google, to confirm), store review |
| A phone app with the user's own iCloud (iPhone) or Google backup (Android) | No, Apple or Google runs it | The user. Tidelight can't read it | Comes back on a new phone | As above, plus each platform works differently |
| Accounts and Tidelight's own server (the founder's choice) | Yes | Tidelight could, unless entries are end-to-end encrypted | Comes back on sign-in | Everything in "What saving would need" above |

Store rules to know, also to confirm:

- Apple often turns down apps that are only a website in a wrapper. The app would need to do more
  than the site.
- Both stores ask health and mental-health apps for privacy labels or a data-safety form, and check
  what the app claims to do.
- Under-13s bring COPPA and stricter store rules, so supported ages ([[DECISIONS]], open decision 6)
  come first.

Claude's suggestion, which one founder then chose: if a store app is the goal, saving on the phone, with iCloud or
Google backup as an option, gives saving without running a server, and nothing leaks from
Tidelight's side because Tidelight holds nothing.

## Questions for both founders

1. Is saving worth the risk and cost, given that the site's promise today is that nothing is kept?
2. Who would run and pay for the server, and who answers if something breaks?
3. Should saving be on the visitor's own device only, with no account? That was offered on
   November 9 and not chosen, but it needs no server.
4. One founder chose a phone app with iCloud or Google backup. Does the other agree, and who owns the
   developer accounts and the Mac needed to build it?
