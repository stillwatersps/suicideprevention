---
aliases: [Location alert, Alert my people, Near a hard place]
status: logistics worked out at one founder's request on November 9, 2026. A proposal. Not agreed by both founders, not reviewed, not built
---

# Alerting people you choose when you stay near a hard place

[[00 START HERE|Back to Start Here]]

> [!warning] A proposal, not a plan
> One founder asked Claude on November 9, 2026, to work out the logistics of this idea. This note
> does that. It is not agreed by the other founder, no licensed reviewer or lawyer has read it, and
> nothing in it is built. Claude's earlier advice against a built-in list of places, in [[IDEAS]],
> still stands, and the reasons are repeated below so both founders can weigh them.

## The idea, as asked

A person shares their location with a group of people they choose. When the app notices they have
been near a place known for suicide for a set amount of time, it can, if the person has chosen
this, alert those people and give them the person's location.

## What was already proposed, and what this adds

Idea E1 in [[IDEAS]], chosen by one founder on November 9, is "Places that are hard for me": the
person picks their own places, and when the phone enters one, a quiet notification opens their own
safety plan, with 988 and 911. Nothing is sent to anyone.

This idea adds three things to E1:

1. A **wait time**: nothing happens on passing through, only on staying.
2. **Other people**: an alert goes to a group the person chose, with the person's location.
3. Possibly **a list of places the app already knows**, instead of, or as well as, the person's own.

Each is worked out below. The first two can be built on E1. The third is where the risk is.

## How it would work for the person

| Step | What happens | Notes |
| --- | --- | --- |
| 1. Set up, inside the safety plan | The person chooses: **people** (one to five, from the phone's contacts: a name and a phone number, kept on the phone); **places** (a pin on a map and a radius, about 100 to 300 meters; the app suggests none); a **wait time** (5, 10, 20, or 30 minutes; 10 to start); **what to send** (a short fixed message and a map link, with an optional line in their own words); and **how to send** (ask me first, or a 60-second countdown I can cancel) | Off until the person turns it on. Everything stays on the phone. Delete everything removes it |
| 2. Watching | The phone itself watches the places (geofencing, below) and wakes the app when the phone enters one. The app notes the time | Nothing is recorded if the person leaves before the wait time |
| 3. The wait | When the wait time passes and the phone is still there, the app shows a full-screen notice | On the lock screen the words are neutral, such as "Tidelight: your plan is here" |
| 4. The notice | "You've been at [the name they gave] for 10 minutes. Send your location to [names]?" with **Send now**, **Not now**, **Call 988**, and **Call 911**. Their own plan shows underneath: reasons, people, and what helps | If they chose the countdown, it counts down from 60 seconds and sends unless they cancel |
| 5. Sending | See the next section. This is the hard part | |
| 6. Afterwards | The app shows what was sent, to whom, and when, and a button to tell them it's over | The app keeps no history of visits to places unless the person wants one |

## The hard part: sending an alert from a phone with no server

Phones don't let an app send a text message on its own.

| Platform | What an app can do | What it can't do |
| --- | --- | --- |
| iPhone | Open Messages with the people and the message filled in. The person taps Send | Send a text in the background, or without the person tapping Send. Apple doesn't allow it |
| Android | The same, through Messages. Technically an app can send texts itself with the `SEND_SMS` permission | Google Play only allows that permission for an app that is the phone's default messaging app, so a mental-health app would be refused |

So there are four routes:

| Route | How the alert reaches people | Needs | Fits the phone app plan in [[CHECK-IN-BACKEND]]? |
| --- | --- | --- | --- |
| **A. One tap** | The notice opens Messages, or the share sheet, with the message and a map link filled in. The person taps Send | Nothing new: no account, no server, nothing reaches Tidelight | Yes. **Claude's suggested first version.** Limit: if the person won't tap, nothing is sent |
| **B. Tidelight's own server** | The phone tells Tidelight's server, which sends a push notification to each person's app, or a text through a messaging service such as Twilio | Accounts for everyone in the group, the group members having the app (for push), a server, encryption, a privacy policy, deleting, a breach plan, someone to run and pay for it, and a lawyer. For texts, a per-message cost and a third company that sees the phone numbers and the location | No. It is the accounts-and-server route that was set aside. Tidelight would also hold a record that a person was at a place at a time |
| **C. The phone's own tools** | iPhone's **Check In** in Messages and **Find My**, and Google Maps **location sharing**, already let a person share their location with someone they trust, and Check In alerts that person if the user doesn't arrive or respond | Nothing to build. The app can't start these itself, but the safety plan can suggest setting one up with a trusted person | Yes. A good step for today |
| **D. Automatic calling** | Calling a person or a service without a tap | Not possible on either phone | No |

The route the founders pick decides what the "set amount of time" buys. In route A the wait time
decides when the person is **asked**. Only in route B can the alert go out with no tap at all.

## Noticing "near a place for a set time"

| Question | Answer, from general knowledge; confirm on Apple's and Google's developer pages |
| --- | --- |
| How does the phone notice? | **Geofencing.** The app registers a few places; the phone wakes it on entering or leaving one, even when the app is closed. iPhone allows about 20 places per app; Android about 100 |
| How exact is it? | A radius under about 100 meters is unreliable. Tall buildings, water, and tunnels make it worse, and the phone may take a few minutes to notice. A bridge or a station is often exactly such a place |
| How is the wait time measured? | Android has a built-in **dwell** event with a chosen delay, which fits this exactly. iPhone has no dwell event, so the app schedules a local notification for "entry time plus the wait" when the phone enters, and cancels it if the phone leaves first. That works even when the app is suspended |
| What permission does it need? | iPhone: location **Always**, which Apple asks for in two steps and reviews closely, with a plain reason the person sees. Android: background location, which Google Play only grants after a declaration form, a video of the feature, and a prominent disclosure in the app |
| Battery? | Low. Geofences are designed for this. Continuous tracking is not needed and shouldn't be used |
| When does it fail? | Phone off, airplane mode, location turned off, the app force-closed on some Android phones, a dead battery, or an underground place. The app must say this, so nobody relies on it as a safety net |

## Where the places come from

| Route | What it means | Claude's view |
| --- | --- | --- |
| **1. The person's own places** (E1) | The person adds places that are hard for them, if any. The app ships with none | **Recommended.** The person knows their places; no list exists to leak or be wrong; no false alarms for everyone else |
| **2. A trusted person adds places**, with the person's consent | A parent, partner, or therapist suggests a place; the person accepts or declines it in the app | Workable for a minor or at a therapist's suggestion. Control stays with the person. Ask the reviewer about minors |
| **3. A built-in list of places known for suicide** | Tidelight researches and keeps a list, and the app watches those places for everyone who turns the feature on | **Not recommended**, for the reasons below |

Why not a built-in list:

- **There is no such list to use.** No public national dataset of these places exists. Tidelight
  would have to research and keep one, place by place, forever.
- **Making the list breaks safe messaging.** [[SAFETY]] rule 4 and the guidance it cites say to
  leave locations out. A list in an app can be pulled out of it, and in this public repository it
  would simply be published.
- **Almost everyone at those places is not in crisis.** They are bridges, stations, parking
  garages, and tall buildings, crossed by thousands of people a day. Every one of them who turned
  the feature on would get crisis alerts on an ordinary commute, learn to ignore them, and risk a
  lock-screen alert being seen by someone else.
- **It assumes what the person is thinking.** A wrong guess can feel like an accusation.
- **Being wrong carries weight.** A place left off the list, or a stale one, is a liability
  question a lawyer should answer before any list exists.

If the founders still want a built-in list after reading this, the smallest version is: a short
list kept outside the public repository, only places where owners already run prevention measures,
never shown to the person, and only ever used together with the person's own wait time and
consent. The reviewer and a lawyer would have to approve it first.

## Who gets the alert, and what they do with it

- **The group**: people the person picks. In route A they need only a phone number. In route B
  they would need the app and an account.
- **What they receive**, for the reviewer to approve: "[Name] set up Tidelight to reach you when
  they're having a hard time, and chose to send you their location now: [map link]. Please call
  them. If you think they're in immediate danger, call 911." A short page on the website, "If
  someone sent you their location", could explain what to do; that would be a new page for review.
- **If nobody answers**: the notice must keep **Call 988** and **Call 911** in front of the
  person, before and after sending. An alert to friends is not a substitute.
- **Minors**: a parent or guardian is the obvious group member, and the obvious problem when home
  isn't safe. Who can be in a minor's group, and whether a guardian may add places (route 2), are
  questions for the reviewer and a lawyer, after supported ages are settled.
- **Clinicians in the group**: a doctor or therapist may have professional duties once they
  receive such an alert, and may not want alerts outside working hours. A lawyer and the reviewer
  should advise before the app suggests adding one.
- **Promises**: Tidelight can't promise that anyone will answer, or how fast. The app's wording and
  terms must say so, and a lawyer reads them.

## Risks, and what reduces them

| Risk | What reduces it |
| --- | --- |
| A lock-screen alert reveals something private, on a shared or watched phone | Neutral words on the lock screen; details only after unlocking; an app lock |
| Someone else turns it on to watch the person | Only the person can set up, pause, or remove it, behind the app lock; the app shows plainly that it's on; "Pause for today" in one tap. The app can't fully prevent misuse of a phone someone else controls, so the reviewer should advise on wording for people in unsafe relationships |
| False alarms | The wait time; the person's own radius; a schedule (for example, not during a daily commute); "Pause"; no built-in list |
| A record that the person was somewhere | Keep nothing after a notice except what the person chooses to see; route A keeps nothing on any server |
| People rely on it and it fails | The app says when it can't work: phone off, no location, battery. 988 and 911 stay on every screen |
| Group members don't know what to do | The message tells them; a website page for them; the reviewer approves both |

## Evidence

Claude has not read research on alerts to a support network based on location, so this note makes
no claim that it helps or harms. What it resembles is one step of a **safety plan**: the people to
contact in a hard moment, which the research brief and the Get Help page already describe. The
reviewer should say whether automating that step fits safety-planning practice, and for which ages.

## What could be built, in order

1. **E1** as already proposed: the person's own places, a quiet notification, their own plan,
   988 and 911. Nothing sent to anyone.
2. **The wait time**: ask only after staying, not on passing through.
3. **"Send my location to my people"** on that screen, route A: one tap opens Messages with the
   people, the message, and a map link filled in.
4. **The countdown**, if the reviewer agrees: send after 60 seconds unless cancelled. Still route
   A on iPhone, so still one tap.
5. **Route C** in the safety plan: a line suggesting Check In or location sharing with someone
   trusted, today, with no new code.
6. Only with accounts and a server, and only if both founders choose that route after
   [[CHECK-IN-BACKEND]]: automatic sending with no tap (route B).

Before any of it: both founders agree; the reviewer reads this note; a lawyer advises on minors,
location data, and the wording; and the feature is tried on real phones, because geofencing can't
be tested in a desktop browser. The iOS Simulator can pretend to be at a location, which helps
during building but doesn't replace a phone.

## Questions for the reviewer and the founders

1. Does automating "contact my people" fit safety-planning practice, and for which ages?
2. Is a wait time a good idea, or should the person's own plan appear at once, as in E1?
3. Should the person be able to choose "send without asking" (the countdown), or always confirm?
4. Who may be in a minor's group, and may a guardian add places?
5. What should the lock-screen words be, and what should the message to the group say?
6. Should any built-in list of places exist at all? Claude recommends no.
