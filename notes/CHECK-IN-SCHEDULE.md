---
aliases: [Check-in schedule, Four daily check-ins, Sharing check-ins]
status: proposed and partly built at one founder's request on November 9, 2026. Not agreed by both founders, not reviewed, never run on a phone
---

# Four daily check-ins, and sharing them with someone

[[00 START HERE|Back to Start Here]]

> [!warning] A proposal, partly built as a draft
> One founder asked on November 9, 2026, for check-ins in the morning, at midday, after school if
> the person wants, and before bed, with the option to share them with guardians or physicians.
> Claude designed it here and built the part that needs no server, in the phone app on branch
> `app/daily-check-ins`. The other founder hasn't agreed, no reviewer or lawyer has read it, and
> it has never run on a phone.

## What was asked, and what it becomes

| Asked | What the app does | Why this way |
| --- | --- | --- |
| Check-ins in the morning, at midday, after school, and before bed | Four **reminders** the person can turn on, one at a time, each at a time they choose. Off until they turn them on. The check-in itself is the one that exists: feeling, what's on your mind, needs, and ideas | A reminder invites; it never nags. Someone who checks in once a day, or never, loses nothing |
| "After school, if they want" | The third reminder is named "After school (or after work)" and is as optional as the others | Adults use the app too, and a teen who isn't in school shouldn't see a reminder that assumes it |
| Share the check-ins with guardians or physicians | A **Share today's check-ins** button, and **Share the last 7 days**, in Your journey. Each opens the same notice as Share this reflection, then the phone's share sheet. The person picks who gets it: a parent or guardian, a doctor or therapist, or anyone else | Nothing leaves the phone unless the person taps Share, which keeps the phone app plan in [[CHECK-IN-BACKEND]]: no accounts, no server, nothing reaches Tidelight |

## The reminders

- **Where**: a "Check-in reminders" section in Your journey. A short line on Today points to it.
- **The four**: Morning (8:00 to start), Midday (12:00), After school or after work (15:30), and
  Before bed (21:00). Each has its own switch and time. All four are off until the person turns
  one on.
- **What the phone shows**: a local notification from the phone itself. The words are neutral, so
  nothing private shows on a lock screen: "Tidelight" and "A moment to check in, if you'd like."
  In Spanish: "Un momento para registrarte, si quieres." Tapping it opens the check-in.
- **What the phone needs**: permission to show notifications, which the phone asks for the first
  time a reminder is turned on. If the person says no, the switches stay off and the app says
  why. Android may deliver a reminder a few minutes late to save battery.
- **Nothing is sent**: a reminder is set on the phone, not by a server. Tidelight doesn't know
  whether anyone checks in.
- **On the website**: nothing. Websites can't do this well, and the website keeps nothing.

## Which check-in is which

The app doesn't ask "is this your morning check-in?". It files each check-in by the time of day it
was done: morning until 11:00, midday until 14:00, after school until 18:00, and before bed after
that (and before 5:00). Several check-ins in one slot are all kept. The calendar in Your journey
still marks the day; a new **Today's check-ins** list under it shows each one with its time,
feeling, and needs.

## Sharing with a guardian or a doctor

What the person shares is a plain-text summary they can read and change first, for example:

> Tidelight check-ins, Monday, November 9
> Morning, 8:05: feeling tired. Needs: rest.
> After school, 15:40: feeling okay. Needs: to talk to someone.
> Shared by me from Tidelight. It isn't a way to get urgent help. If you're worried, call me.

It never includes journal entries or reflections unless the person shares those separately, and it
never includes a score, because there are none.

What's **not** built, because it needs accounts and a server (route B in [[LOCATION-ALERT]] and
idea E2 in [[IDEAS]]):

- A guardian or doctor who gets the check-ins automatically, without the person tapping Share.
- A page where a guardian or doctor logs in to see them.
- A doctor's office receiving them as part of care, which also brings U.S. health privacy law
  (HIPAA) for the clinician and a lawyer's advice for Tidelight.

A middle step that needs no server, for the founders to consider: a "before bed" reminder that
also says "and share today's check-ins, if you'd like", which opens the share summary in one tap.

## For the reviewer and a lawyer

- Are four invitations a day too many for someone in distress, or is choosing them enough?
- Should any reminder be on by default for any age group? Claude built them all off.
- Is the notification wording safe for a lock screen, and for a phone a parent or partner checks?
- For a minor, should sharing with a guardian be suggested, or only possible?
- Is the summary wording right for a clinician to receive?
- Is "feeling tired. Needs: rest." the right level of detail, or too much for a text message?

## What's built, and how to check it

On branch `app/daily-check-ins`, in `app/`: the reminders section, the Today's check-ins list, the
two share buttons, and the words for all of it in `app/src/text/en.html` and `es.html`. The checks
are in `app/test/app-test.mjs`; run `npm test` in `app/`. Reminders can't fire in a desktop browser,
so the test only checks the settings, the words, and that nothing is sent; a real phone is needed
for the notifications themselves ([[PHONE-TEST]]).
