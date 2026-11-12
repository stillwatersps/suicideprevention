---
aliases: [Legal packet, Lawyer packet]
status: DRAFT. Not legal advice. Prepared for counsel, by an AI assistant, from the app's code and words
---

# Legal packet: the Tidelight phone app

[[00 START HERE|Back to Start Here]]

**Not legal advice — prepared for counsel.** Written November 12, 2026, during the launch
readiness work ([[LAUNCH-READINESS]]), on the branch `app/launch-readiness`. It gathers what a
lawyer needs to read in one place. Nothing here has been sent to anyone, and no lawyer has seen
it. Every quotation is copied from the app's word files (`app/src/text/`) or from
`app/ios/App/App/Info.plist`; none was written for this packet.

## What the app is, in one paragraph

Tidelight is a free suicide prevention project: a public website and, in draft, an iPhone and
Android app. The app offers short check-ins on how a person feels, a private journal, breathing
and meditation sessions, a "Hope box" of reasons and photos, a way to share a check-in with people
the person chooses, and an optional feature that notices when the person stays at a place they
have named as hard for them. Crisis numbers (988, 911) are on every screen. There are no accounts,
no server, and no analytics; everything is stored on the phone. The audience is the United
States, **adults and minors, with exact ages undecided**. No clinician has reviewed the wording.
The app has never been released, and it has run only in a simulator.

## What we need from you, in order

1. **Who is the publisher?** There is no company yet. Who should be the legal entity behind the
   app, the Apple developer account, and the privacy policy?
2. **A privacy policy and terms of use.** None exists. Apple requires a privacy policy address.
   [[PRIVACY-INVENTORY]] is a factual list of what the app stores, written to be the raw material.
3. **Minors.** See "The age and audience question" below. This is the largest open question.
4. **The location feature and messages to other people.** See the wording below.
5. **Disclaimers.** Is "not treatment, and not a replacement for care" enough, and where must it
   appear? What should the App Store listing say and not say?
6. **Apple's privacy answers.** [[APP-STORE-PRIVACY-DRAFT]] proposes "Data Not Collected". Is that
   right, given the phone's own backup?

## The age and audience question

- The app asks for a date of birth once, before the first check-in. It works out one of five age
  groups (under 13, 13 to 17, 18 to 24, 25 to 64, 65 and over), stores only the group on the
  phone, and discards the date. It is not an age gate: every group can use the app, and crisis
  numbers are on the screen while it asks.
- What the screen says: "Tidelight shows different ideas for different ages, because research
  finds that different things help at different ages. Your date of birth is asked once." "The app
  works out your age group, keeps only the group on this phone, and forgets the date. It never
  leaves the phone." "You don't need to answer this to get help." "If you're under 13, please use
  Tidelight with a parent, carer, or another adult you trust."
- A child under 13 sees ideas that point to a trusted adult, and a box for "the grown-up with you".
- Nothing a child enters leaves the phone unless the child sends it in a text message or through
  the phone's Share sheet.

Questions:

1. Does a children's privacy law (COPPA, or a state law) apply to an app that stores a child's
   entries only on the child's own device and has no server? Does knowing the age group change that?
2. Does the phone's own backup (to Apple or Google, under the family's account) count as
   collection or disclosure by us?
3. Should children under 13 be included at all in a first release? What would excluding them require?
4. For 13 to 17: is parental consent needed for any feature, in particular location "always",
   storing other people's phone numbers, and sending messages to chosen people?
5. Apple asks for an age rating and whether the app is "made for kids". What follows from each
   choice? ([[APP-STORE-READINESS]] has draft answers.)
6. Some states have laws on minors and apps or app stores. Which apply to a free app with no
   accounts, no advertising, and no purchases?

## Privacy wording the app shows

Shown on the Daily check-in screen, always in view:

> **What happens to what you share here.** In this app, what you choose and write is saved on this
> phone only, so it's here next time. Tidelight never receives it, reads it, or analyzes it.
>
> If this phone's iCloud or Google backup is on, the backup includes it. Delete everything, in
> Your journey, removes it from the phone now. A copy in an earlier backup can last until the
> phone's next backup.
>
> Anyone who can unlock this phone can open the app. Quick exit leaves fast. Nobody at Tidelight
> sees what you write, so it isn't a way to ask for help. In a crisis, call or text 988, or call 911.

Beside the journal: "Your entries are saved on this phone only, and are never read, analyzed, or
sent anywhere unless you share one."

Beside "Delete everything": "In the app, this also deletes what's saved on this phone. A copy in
an earlier iCloud or Google backup can last until the phone's next backup. Your places and your
people from Places that are hard for me go too. Your name, your home spot, your streak, and your
meditation history go too. Your age group, your settings, and your saved meditations stay, so you
aren't asked again."

In the Hope box: "Everything here stays in this app, on this phone. It is never sent anywhere, and
Share never includes it. Delete everything, in Your journey, empties it. Photos may not come back
if you change phones, so keep the originals."

In onboarding and Settings: "Optional. It stays on this phone." (the name); "A reminder never says
anything about you."

Questions:

7. Is each statement accurate against [[PRIVACY-INVENTORY]], and is any of it a promise we could
   fail to keep (for example "never", or "on this phone only" when a backup exists)?
8. "Delete everything" keeps the age group, settings, and saved meditations. Is that acceptable
   for something named "Delete everything"?
9. A single check-in can't be deleted on its own, and nothing can be exported. Does any law that
   applies require either?

## Location wording

Two uses, both optional.

**A home spot** (one place, saved when the person taps "Save where I am"):

- Onboarding: "So we can suggest the right meditation for where you are." "Your location is read
  only when you ask. It stays on this phone and is never sent anywhere."
- Settings: "One spot, saved on this phone only. The app looks at where you are only when it
  suggests a meditation, to see if you're near it. Your location is never sent anywhere."

**"Places that are hard for me"** (off until turned on; needs the phone's "Always" permission to
work with the app closed):

> Some people have a place that's hard to be near. If you'd like, you can tell this phone about
> yours, so that when you've stayed there for a while, the phone can check in with you and, if you
> choose, let people you trust know where you are.
>
> This is off until you turn it on. The app suggests no places: only you decide what counts as a
> hard place for you. Your places and your people stay on this phone, and Tidelight never receives
> them. You can turn this off or remove anything at any time, and nobody is told.

> **Permission.** For this to work with the app closed, the phone needs to allow Tidelight to use
> your location "always". The phone asks in two steps, first "while using the app", then "always",
> sometimes a few days later. Your location is only used to notice your own places, and it's never
> sent unless you choose to send it.

> **Good to know.** Before you rely on this, try it once with someone you chose, so you both know
> what arrives. It can't work when the phone is off, in airplane mode, out of battery, has
> location turned off, or is somewhere the phone can't tell where it is, like underground. It may
> take the phone a few minutes to notice a place, and places smaller than about 100 meters are
> unreliable. The phone only notices your chosen places. It doesn't track where you go, and the app
> keeps no record of visits. A message to your people isn't a way to get urgent help. They may not
> see it for a while. If you need help now, call 988 or text 988. In immediate danger, call 911.

The sentences the iPhone itself shows when it asks (`Info.plist`):

- While using the app: "To save a home spot you choose, and to check whether you're near it when
  the app suggests a meditation. And only if you turn on "Places that are hard for me": to notice
  when this phone enters a place you chose, and to put your location in a message you choose to
  send. Your location stays on this phone. Nothing is tracked or sent otherwise."
- Always: "Only if you turn on "Places that are hard for me": "Always" lets the phone notice a
  place you chose even when Tidelight is closed. Your location stays on this phone and is never
  sent unless you choose to send it."

Questions:

10. Is precise location, and background location, described accurately and fully enough for
    Apple's rules and for state privacy laws that treat precise location as sensitive?
11. The feature can fail silently (phone off, no signal). Is "Good to know" enough to prevent
    reliance, and should the App Store listing say the same?
12. The feature might be set up on a minor's phone by a guardian, or by a minor who names a
    guardian who is not safe. Is anything needed in the wording or the design?
13. A "hard place" may reveal something sensitive (a bridge, a home). It is stored on the phone
    and in the phone's backup. Anything required?

## Messaging wording ("can't be taken back")

The app never sends anything itself. It opens the phone's own Messages screen, or the Share sheet,
with words filled in; the person taps Send.

Before any share:

> **Share with someone you choose.** You choose who gets this and how, in the next step. It goes to
> them, stays in their messages or email, and can't be taken back.
>
> The person may not see it for hours, so this isn't a way to get urgent help. If you need help
> now, call 988 or text 988. In immediate danger, call 911.

In "My circle" (up to five people, names and numbers stored on the phone), always in view:

> There are no accounts. People in your circle don't need this app. They see only what you send
> them, as a text message from you. Tidelight never sees it. Nothing is sent by itself. Messages
> opens with your words filled in, and you tap Send. Once it's sent, it stays on their phones and
> can't be taken back. It isn't a way to get urgent help. People may not read it for hours. If you
> need help now, call 988 or text 988. In immediate danger, call 911.

For a child: "Ask a grown-up you trust to help you choose who is in your circle." For a teen: "You
choose who is in your circle. It doesn't have to be a parent."

In Places: "Choose up to 5 people from your contacts. The app keeps their name and phone number on
this phone only. They aren't told that you chose them, and nothing is sent to them unless you send
it." And: "If you choose to send it, this message goes to your people through the phone's own
Messages app, with a map link to where you are. You see it first and tap Send yourself; the app
can't send a text on its own."

The default message: "I'm having a hard time right now and I'd like you to call me. I set this up
in Tidelight to send when I stay at a place that's hard for me. Here's where I am:" followed by a
map link.

Questions:

14. The app stores other people's names and phone numbers on the person's phone, without those
    people knowing. Is that a problem anywhere?
15. A message from a person in distress reaches someone who may not know what to do. Is there any
    duty on us, and should the message or the app say more to the person receiving it?
16. Is "it isn't a way to get urgent help" enough, repeated where it is?

## Crisis services and medical claims

- Every screen shows Call 988, Text 988, Call 911, and a Quick exit. The app only opens the
  phone's dialer or Messages; it places no call and sends no text.
- A check-in with a very low mood shows: "That sounds really hard. You don't have to carry it
  alone. You can talk to someone right now." with those same buttons. The app tells no one.
- Every new screen says: "Draft for review. The check-in prompts, streak messages, and meditation
  words in this app are new. A suicide prevention professional has not reviewed them yet. An AI
  assistant wrote them from a founder's brief. They are ideas for calm and reflection, not
  treatment, and not a replacement for care."

Questions:

17. Is the app at risk of being treated as a medical device or as providing health care, given
    age-based "ideas", a "safety plan" description, and a response to low mood?
18. We use the names "988" and "988 Suicide & Crisis Lifeline" and link to its site. Is any
    permission or wording needed? We are not affiliated, and the app says "It is a separate
    service from Tidelight."
19. If a person in crisis uses the app and is harmed, what exposure do the founders have
    personally, with no company in place? What structure and insurance should exist before release?
20. The words were written by an AI assistant and say so. Does that need saying anywhere else?

## The name and other people's material

21. "Tidelight" has not been checked against existing trademarks, apps, or organizations.
22. The app ships open-source code (Capacitor, MIT license) and two fonts (Open Font License):
    [[THIRD-PARTY-LICENSES]]. The MIT license asks for its notice to travel with the app; the app
    has no acknowledgements screen yet.
23. The website's photograph and its license are recorded in the website's notes, not here.

## Documents to read beside this one

| Document | What it is |
| --- | --- |
| [[PRIVACY-INVENTORY]] | Every item the app stores, why, where, how long, how it is deleted, and when anything leaves the phone |
| [[APP-STORE-PRIVACY-DRAFT]] | Draft answers to Apple's App Privacy questions |
| [[LAUNCH-READINESS]], "Privacy and permissions" | The permissions the app can ask for, when, and the tests that show nothing leaves the phone |
| [[APP-STORE-READINESS]] | Draft store listing, age rating answers, and a checklist against Apple's rules |
| [[THIRD-PARTY-LICENSES]] | Open-source packages and fonts |
| [[CONTENT-REVIEW]] | Every open wording question for the clinical reviewer; several are marked for a lawyer too |
| [[LOCATION-ALERT]] | How the place feature was designed, and its open questions |
