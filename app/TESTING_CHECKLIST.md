# Tidelight app: what to check on a real phone

The redesign has been tried in desktop Chromium with stand-ins for everything a phone does, and
in the iOS Simulator where `PROGRESS.md` says so. **Nothing here has run on a real phone.**
Haptics, sound and the silent switch, speech, notifications, location, and keeping the screen
awake only really work on one. Tick each box on a real iPhone and, if you can, a real Android
phone. Write down the phone and its system version.

**Sound during automated runs:** the browser tests and Simulator checks are muted on purpose (see
`PROGRESS.md`), so no automated run has ever confirmed how the voice guide or the sounds actually
sound. Section 6 on a real phone is the only check of that.

**Safety rule for every step:** never place a call, send a text, start a chat, or submit a form on
a crisis service. Tap a Call or Text link only as far as the phone's dial or message screen, check
the number, and cancel.

To put the app on an iPhone: on a Mac with Xcode, in `app/` run `npm ci`, then
`LANG=en_US.UTF-8 npm run sync`, open `ios/App/App.xcworkspace`, choose your phone, and press Run.

## 1. The safety frame, on every screen

- [ ] On Home, Check-in, Meditate, Location, Friends, Settings, the streak screen, History, the
  builder, and each onboarding page: Call 988, Text 988, Call 911, and Exit are at the top, and
  Get Support Now, the Spanish link, and both "Draft for review" notices are on the screen without
  opening anything.
  *Expected:* all of them, every time. *If not:* note the screen; this blocks everything else.
- [ ] Tap Call 988, Text 988, and Call 911 once each. *Expected:* the dial screen shows 988 or 911,
  the message screen is addressed to 988. Cancel each. *If not:* note what opened.
- [ ] Tap Get Support Now from Home and from the middle of a meditation. *Expected:* the 988 panel
  comes into view; the meditation pauses first.
- [ ] Tap "Leer en español". *Expected:* the same app in Spanish, with the same data. In a Spanish
  crisis line: "llamar al 988 y marcar 2", "enviar AYUDA al 988".
- [ ] Turn the phone's text size to its largest (Settings, Display, Text Size) and reopen the app.
  *Expected:* text grows, nothing is cut off, no sideways scrolling, the crisis strip still shows.
- [ ] Dark mode on, then off. *Expected:* every screen is readable in both.

## 1b. Crisis paths on a real iPhone (added by the launch readiness work)

The automated crisis test (`npm run test:crisis`) reads and measures every crisis control on every
screen, but it can't place a call, open Messages, or leave the app. Only a real iPhone can check
these. **Never let a call connect or a message send: cancel at the phone's own screen.**

- [ ] On Home, tap **Call 988** in the strip. *Expected:* the phone's own call sheet appears,
  showing 988. Tap Cancel. Nothing dials by itself.
- [ ] Tap **text 988** in the strip. *Expected:* Messages opens on a new message to 988, empty.
  Don't type or send. Go back to Tidelight.
- [ ] Tap **call 911** in the strip. *Expected:* the call sheet shows 911. Cancel.
- [ ] Repeat the three taps once in Spanish (the strip reads "Llama al 988", "envía AYUDA al 988",
  "llama al 911"). *Expected:* the same three phone screens.
- [ ] Tap **Get Support Now**, then **Call 988** and **Text 988** in the panel, and the Call 988
  button on the support screen after a very low check-in. *Expected:* the same phone screens.
  Cancel each.
- [ ] Tap **Chat Online** in the panel. *Expected:* Safari opens 988's chat page. Don't start a
  chat. Go back to Tidelight.
- [ ] Turn on Airplane Mode and tap Call 988. *Expected:* the phone still shows its call sheet (the
  phone, not the app, decides what happens next). Cancel, and turn Airplane Mode off.
- [ ] Tap **Exit**. *Expected:* the screen goes blank at once and Safari opens weather.gov. Now
  come back to Tidelight from the app switcher. *Expected:* the app is back, with the crisis strip.
  **It must never stay blank.** Write down which screen it shows.
- [ ] Tap Exit in the middle of a check-in, and again during a meditation. *Expected:* the same.
  Note whether the meditation's sound stops when Safari opens.
- [ ] If the phone has Screen Time or a parent's restrictions that block Safari: tap Exit.
  *Expected:* the screen goes blank. Press Home, then open Tidelight again: it must come back.
  Write down what happened.
- [ ] Lock the phone with Tidelight open, wait a minute, unlock. *Expected:* the strip is there
  and Call 988 works at the first tap.
- [ ] Start a meditation with sound, then tap Call 988. *Expected:* the call sheet appears over
  it. Cancel. Note whether the sound paused.
- [ ] Set the phone's text to its largest size (Settings, Accessibility, Display & Text Size,
  Larger Text, with Larger Accessibility Sizes on). *Expected:* the app's text grows with it, and
  the strip still shows all four controls without covering the whole screen. Write down what you
  see at the very largest size.
- [ ] With VoiceOver on, swipe from the top of Home. *Expected:* Quick exit, Call 988, Text 988,
  and Call 911 are the first things read.

## 2. First launch and onboarding

- [ ] Delete the app, install it again, open it. *Expected:* the welcome page, in under 2 seconds.
  *If not:* note what opened first (it should not be the website's Home page).
- [ ] Go through: date of birth (can't be skipped), name, check-ins per day, wake and bedtime,
  style, location, notifications, done. *Expected:* Back and a swipe right go back on every page;
  Skip is on every page but welcome, date of birth, and done.
- [ ] On the location page tap "Allow location". *Expected:* the phone's own question, with a
  sentence about a home spot and "Places that are hard for me". Choose "While using". Then "Set
  your home spot" appears and saves.
- [ ] On the notifications page tap "Turn on reminders". *Expected:* the phone's own question.
- [ ] Close the app fully and open it. *Expected:* Home, not onboarding.
- [ ] Do it all again on a fresh install, refusing both permissions. *Expected:* nothing is blocked;
  Home's "Finish setting up" lists what's left.

## 3. Quick check-in

- [ ] Style Straightforward: Home, Check in, tap a face, Done. *Expected:* under 10 seconds, "Logged.
  Nice.", back to Home after 2 seconds, a light tap under your finger at each step.
- [ ] Style Calm (Settings): Check in. *Expected:* one slow breath first (it can be skipped), the
  longer question, slower fades.
- [ ] Choose "Very low". *Expected:* no thanks line. "That sounds really hard." with Call 988, Text
  988, and Call 911, and the screen stays until you leave it. No streak or celebration anywhere.
- [ ] Do the five-question Daily check-in and choose "Sad". *Expected:* a support block with 988 and
  911 at the top of the results.
- [ ] Check-in tab: today's check-ins are listed. Your journey: the calendar marks today.

## 4. Reminders (needs a real phone)

- [ ] Settings, Check-in reminders on, 3 a day. Developer section (tap the version 7 times) lists
  the reminders set. *Expected:* three a day for two weeks, none in the past.
- [ ] "Send a test notification", then lock the phone. *Expected:* within about 5 seconds, a
  notification titled "Tidelight" that says only "A moment to check in, if you'd like." or "Time for
  your check-in." Nothing about mood, crisis, or you. *If nothing shows:* check the phone's
  Settings, Notifications, Tidelight.
- [ ] Wait for a real reminder with the app closed. *Expected:* it arrives near its time (Android
  may be a few minutes late). Tapping it opens the app.
- [ ] Check in, then look at the Developer list. *Expected:* today's next reminder is gone.
- [ ] If you used the older four reminders before this version: *Expected:* the ones that were on
  are now your check-in times.

## 5. Streaks

- [ ] Finish today's check-ins. *Expected:* the streak card on Home goes up at once.
- [ ] Settings, Developer, "Seed fake history", then open the streak screen. *Expected:* a month
  with done days (a filled dot), frozen days (a soft dot with a ring), and rest days (a dashed ring).
  Nothing is red.
- [ ] Settings, Streaks off. *Expected:* no streak card, no milestone, no "new start" card anywhere.
- [ ] Read every streak line. *Expected:* nothing that blames or pressures. Tell the reviewer what
  you felt.
- [ ] Reach a 3-day streak. *Expected:* a quiet card on Home after "Back to home". Nothing bursts.
- [ ] After a very low check-in. *Expected:* support first, with no horizon, no dawn, and no
  celebration; a meditation finished later that day also ends without the dawn.

## 5b. Layout follow-ups

- [ ] Location, with Places turned on. *Expected:* short sections under headings. One "Learn
  more" row, under "Your places", holding only how to add a place. Everything about what is kept,
  who is told, and what is sent is on the page without a tap.
- [ ] Friends. *Expected:* all five My circle points in view, including the one about urgent
  help with 988 and 911. One "Learn more" row, holding only how to share.
- [ ] Tap Get Support Now from any tab. *Expected:* the page stops with "Need to talk to someone
  now?" just below the crisis strip, not hidden under it.
- [ ] Daily check-in, first question. *Expected:* nine feelings as tiles, two across, in the same
  order as before.
- [ ] Set the phone to its largest text. *Expected:* the tab bar shows five icons with no words,
  each easy to tap, and VoiceOver still reads each name.

## 6. Meditation (sound, speech, haptics, and screen need a real phone)

- [ ] Meditate, 1-minute reset, Start. *Expected:* the forest fills the screen under the crisis
  strip; the circle grows for 4, holds 4, shrinks 4, holds 4; a voice speaks the first and last
  line; the phone pulses with the breath.
- [ ] Tap the screen. *Expected:* Pause in the middle, End top left, three switches top right, for
  3 seconds. Each switch turns its own layer off and on mid-session.
- [ ] Pause for a minute, Resume. *Expected:* it carries on from where it stopped.
- [ ] Lock the phone mid-session for 20 seconds, unlock. *Expected:* the session is 20 seconds
  further on, not frozen and not restarted. Note whether sound kept playing while locked.
- [ ] Leave the phone alone during a 3-minute Silent session. *Expected:* the screen stays on.
- [ ] Silent session with the ringer ON and volume up. *Expected:* no sound at all.
- [ ] Deep session with the silent switch ON. *Expected:* no sound (the phone's switch wins).
  With it OFF: ocean sound fades in over 3 seconds, dips while the voice speaks, fades out at the end.
- [ ] Listen to each sound in the builder for a full minute. *Expected:* no click or gap where the
  loop joins. Rain and ocean are stand-ins made in code until real recordings are added.
- [ ] Listen to the voice. *Expected:* the phone's own text-to-speech, slow and calm, in the app's
  language. Note if it sounds wrong or robotic: recordings would replace it.
- [ ] Haptic breathing: a rising pulse on the inhale, one light tick on a hold, a fading pulse and a
  soft tap on the exhale. *If you feel one long buzz:* note the phone; Android can't vary strength.
- [ ] Sleep, 10 minutes. *Expected:* the screen dims, the sound fades over the last 3 minutes, and
  it ends dark with no completion screen. The crisis strip stays lit. A tap shows End.
- [ ] After a session choose "Very low" on "How do you feel now?". *Expected:* 988 and 911 at once.
- [ ] End a session before 60%. *Expected:* no completion screen, and it doesn't count toward today.
- [ ] Reduce Motion on (phone setting or the app's). *Expected:* worlds stop moving and only light
  changes; no sliding, no burst.
- [ ] Watch for stutter during a 10-minute session, and check the battery before and after.

## 7. Suggestions and location

- [ ] At home with a home spot saved, in the afternoon. *Expected:* "Deep session: You're home, take
  your time". Away from home with headphones: "1-minute reset". After 9:30 pm: "Sleep".
- [ ] With location refused. *Expected:* a suggestion still shows; nothing asks again or complains.
- [ ] Phone Settings, Privacy, Location Services, Tidelight. *Expected:* "While Using" unless you
  turned on "Places that are hard for me". The location arrow should not stay on when the app is
  closed, unless that feature is on.

## 8. Builder and presets

- [ ] Build your own: drag the slider end to end. *Expected:* a tick at each minute, a stronger one
  at 5, 10, 15, 20, 25, 30. The big number follows your thumb.
- [ ] Change the world and the situation. *Expected:* the preview changes at once.
- [ ] Save preset. *Expected:* the keyboard opens with a name already filled in.
- [ ] Close the app fully and open it. *Expected:* the preset is on the Meditate tab.
- [ ] Rename, edit, duplicate, delete (it asks first).

## 9. Everything that existed before

- [ ] Journal, Rediscover, Hope box (add words and a photo), Your journey, and Delete everything
  still work from the Check-in tab.
- [ ] Location tab: "Places that are hard for me" works as in `notes/LOCATION-ALERT.md`.
- [ ] Friends tab: My circle, and "Send to my circle" from Share (stop at the message screen).
- [ ] Settings: your age group, larger text, and "Enter my date of birth again".
- [ ] Share a journal entry and today's check-ins. *Expected:* the notice first, then the share
  sheet. A check-in's note is never in the shared text.
- [ ] If you had data from the version before: your journal, kept lists, calendar, places, circle,
  and hope box are all still there.

## 10. With a screen reader

- [ ] VoiceOver (iPhone) or TalkBack (Android) on. Do a check-in, start and end a meditation, and
  change a setting. *Expected:* every control says what it does ("Start 5-minute Silent"), the
  crisis links are reachable first, and nothing traps you.
