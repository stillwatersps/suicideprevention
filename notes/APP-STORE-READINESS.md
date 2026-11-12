---
aliases: [App Store readiness]
status: DRAFT, pending review by both founders, the clinical reviewer, and a lawyer. Nothing has been submitted to Apple
---

# App Store readiness: a draft

[[00 START HERE|Back to Start Here]]

**DRAFT — pending review.** Written November 12, 2026, by an AI assistant during the launch
readiness work ([[LAUNCH-READINESS]]), from the app's code on `app/launch-readiness`. Nothing here
has been entered in App Store Connect, no account was created, and no signing or bundle setting
was changed. Apple's rules and forms change: read Apple's current text before relying on any line
here. Guideline numbers are from the App Review Guidelines as the assistant knew them and may have
moved.

**The app is not ready to submit.** The short list of what stands in the way is at the end.

## 1. Draft listing

Every line is **DRAFT — pending review**. It makes no clinical claim, promises no outcome, names
no award or ranking, and says nothing the app doesn't do. The clinical reviewer should read it
with the rest of the wording, and the lawyer should read the disclaimers.

**Name** (30 characters at most): Tidelight

**Subtitle options** (30 characters at most; choose one):

1. Check in. Breathe. Reach out.
2. A calm daily check-in
3. Calm check-ins, help close by

**Promotional text** (170 characters at most):

> A quiet place to check in with yourself, breathe for a minute, and keep the people and reasons
> that matter close. Everything stays on your phone.

**Description:**

> Tidelight is a calm, private place to check in with yourself.
>
> A FEW MOMENTS A DAY
> • A quick check-in: one tap for how you are, and a note if you like.
> • A longer daily check-in with gentle questions and a private journal.
> • Breathing and meditation sessions from one minute, with or without sound.
>
> YOUR PEOPLE AND YOUR REASONS
> • A Hope box for the words, photos, and reasons that matter to you.
> • My circle: choose a few people you trust, and share a check-in with them only when you decide to.
> • Places that are hard for me: an optional feature, off until you turn it on, that lets your
>   phone check in with you when you stay somewhere you've told it is hard for you.
>
> HELP IS ALWAYS ONE TAP AWAY
> Every screen has buttons to call or text the 988 Suicide & Crisis Lifeline and to call 911.
> Tidelight is a separate service from 988.
>
> PRIVATE BY DESIGN
> • No account. No ads. No tracking.
> • What you write stays on your phone. Tidelight never receives it.
> • Delete everything at any time.
>
> IN ENGLISH AND SPANISH
>
> IMPORTANT
> Tidelight is not medical care, treatment, or a crisis service, and it cannot contact anyone for
> you. If you are in danger, call 911. If you are thinking about suicide, call or text 988.

Notes on the draft:

- "IN ENGLISH AND SPANISH" should stay out until a fluent reader has reviewed the Spanish.
- "No tracking" and "never receives it" must match the privacy policy a lawyer writes.
- The meditation sessions have no recorded voice yet; the description doesn't promise one.

**Keywords** (100 characters at most, 94 used):

`check-in,mood,journal,breathing,meditation,calm,crisis,988,support,hope,wellbeing,teen,spanish`

For a founder and the lawyer to decide: whether "988" may be a keyword (it is another
organization's service), whether "suicide prevention" should be one, and whether "teen" should
be, given the open question about ages.

**Category:** Health & Fitness (primary). Medical is the alternative and invites closer review;
the app gives no medical advice.

**Price:** Free, with no purchases.

## 2. Draft notes for App Review

> Tidelight is a free self-care and suicide prevention companion. It needs no account and no
> sign-in; every feature is available as soon as the app opens.
>
> What it does: short mood check-ins, a private journal, breathing and meditation timers, a
> "Hope box" of the person's own words and photos, sharing a check-in through the system Messages
> or Share sheet, and an optional location feature described below.
>
> It does not provide medical treatment, diagnosis, or advice, and it is not a crisis service.
> Every screen shows a bar with Call 988, Text 988, and Call 911. These are ordinary tel: and sms:
> links that open the system dialer or Messages; the app never places a call or sends a message
> itself.
>
> To test without contacting a crisis service: tap Call 988, Text 988, or Call 911 and cancel at
> the system confirmation or compose screen. Please do not complete a call or send a text.
>
> Data: everything is stored on the device. The app makes no network requests and contains no
> analytics, advertising, or third-party SDK that contacts a server.
>
> Location: optional. "When In Use" is requested only when the person taps "Allow location", to
> save one "home spot" on the device. "Always" is requested only inside "Places that are hard for
> me" (Location tab), which is off by default. That feature uses region monitoring for places the
> person adds, shows a local notification after they have stayed there, and offers to open
> Messages with a message the person wrote. Location is never sent anywhere by the app. To test:
> Location tab, turn the feature on, add a place, choose a contact.
>
> Notifications: local only, optional, and worded neutrally ("Time for your check-in.").
>
> Quick exit (top of every screen) opens weather.gov in the browser so the app can be left quickly.
>
> The date of birth asked at first launch is used once to choose an age group; only the group is
> stored, on the device.

Before using this, a founder must confirm each sentence against the build being submitted.

## 3. Checklist against Apple's App Review Guidelines

"Met" means the code and tests support it today. "Needs a person" means a founder, the reviewer,
or the lawyer has to decide or supply something.

| Guideline (as numbered when written) | What it asks, in short | State | Evidence or gap |
| --- | --- | --- | --- |
| 1.4.1 Physical harm: medical apps | Health claims must be accurate; apps that could give wrong health information get closer review; remind people to check with a doctor | **Needs a person** | The app makes no measurement and no diagnosis and says "not treatment, and not a replacement for care" on every new screen. But no clinician has reviewed any wording, and the app says so on screen. Apple may reject an app that calls its own content an unreviewed draft. Clinical review comes first |
| 1.4 Physical harm, generally | The app must not encourage harm | Met in code, **needs a person** for wording | Crisis help on all 37 screens (`crisis-test.mjs`, 334 checks); a very low check-in shows support at once (`safety-test.mjs`). Wording unreviewed |
| 1.1 Objectionable content | Nothing harmful or upsetting | **Needs a person** | The subject is suicide; the reviewer should confirm safe-messaging practice in every line |
| 1.2 User-generated content | Moderation, if people post to each other | Not applicable | Nothing is posted anywhere; sharing goes through the system's own Messages |
| 1.3 Kids Category; 5.1.4 Kids | Extra rules if the app is aimed at children | **Needs a person** | The app admits children under 13 and asks a date of birth. It should not be placed in the Kids Category. Whether under-13s are included at all is undecided: [[LEGAL-PACKET]] |
| 2.1 App completeness | Final, working, no placeholder content, tested on device | **Not met** | Never run on a real iPhone. "Draft for review" notices are on every screen. A "Developer" section exists in Settings behind a hidden gesture. Meditations have no recorded voice |
| 2.3 Accurate metadata | Listing, screenshots, and privacy answers match the app | Not started | Drafts are in this note; screenshots are drafts |
| 2.3.6 Age rating answers | Answer honestly | **Needs a person** | Draft answers below |
| 2.4.1 iPad | An app that runs on iPad should work well there | **Needs a person** | The project is set to iPhone and iPad. It has not been looked at on an iPad. Either test it there or make the app iPhone-only, which is a project setting a founder should change |
| 2.5.1 Public APIs only | No private system features | Met | Capacitor and Apple's own frameworks only |
| 2.5.4 Background use | Background features only for their purpose | Met, to confirm on a phone | Region monitoring needs no background mode and none is declared |
| 2.5.6 WebKit | Web content uses the system's web view | Met | Capacitor uses WKWebView |
| 4.2 Minimum functionality | More than a wrapped website | Likely met, **Apple decides** | Local storage, notifications, the contact picker, Messages, location, haptics, and offline use. The app's pages do come from the website's pages, so the risk is real |
| 4.0 Design; 4.8, 4.9 | Sign-in and payment rules | Not applicable | No sign-in, no payments |
| 5.1.1 Data collection and storage | A privacy policy; ask only for what is needed; explain each permission; let people delete their data; no account required | **Not met** | No privacy policy exists. Otherwise: no account, permissions asked only at the feature, purpose strings present for location, "Delete everything" exists. Gaps: a camera purpose string may be needed (see below); no privacy manifest file |
| 5.1.2 Data use and sharing | No sharing without consent; tracking rules | Met | Nothing is collected or shared; no tracking (`network-test.mjs`: 0 outside requests) |
| 5.1.3 Health and health research | Health data not used for ads, not stored in iCloud by the app, not disclosed | Met, **lawyer to confirm** | Not used for anything but the screen. The app doesn't use iCloud itself; the phone's device backup includes app data, which is the person's own setting |
| 5.1.5 Location services | Only when relevant; explain why; "Always" only when needed | Met in code, **needs a person** | Both purpose strings are present and specific. Apple looks hard at "Always"; the App Review notes explain it. Never run on a real phone |
| 5.2 Intellectual property | Rights to names, images, and code | **Needs a person** | "Tidelight" is unchecked against trademarks. "988" is named. Open-source notices need an acknowledgements screen: [[THIRD-PARTY-LICENSES]] |
| 5.1.1(ix), regulated fields | Apps in highly regulated fields (health care among them) should come from a legal entity, not an individual | **Needs a person** | There is no organization yet. Apple may expect one for this subject |

## 4. Age rating: draft answers

Apple's age rating questions were revised in 2025 and now lead to 4+, 9+, 13+, 16+, or 18+. The
exact questions should be read in App Store Connect. **Flagged for a founder's decision, with the
reviewer and the lawyer.**

| Topic Apple asks about | Draft answer | Why |
| --- | --- | --- |
| Violence, sexual content, profanity, horror, gambling, contests, alcohol, tobacco, or drugs | None | None appears |
| Medical or treatment information | Yes, infrequent or mild | The app describes a "safety plan" and suggests talking to a doctor; it is not treatment |
| Mature or suggestive themes | **Decide.** Suicide and self-harm are the app's subject, mentioned plainly and never in detail | Answering "none" would be inaccurate. This answer is likely to raise the rating above 4+ |
| Health or wellness topics, if asked | Yes | Mood check-ins and meditation |
| Unrestricted web access | No | Only fixed links to 988's site and weather.gov open, in the browser |
| User-generated content, messaging, or chat inside the app | No | Sharing uses the system's Messages; nothing is exchanged inside the app |
| Advertising | No | None |
| Parental controls or age assurance in the app | No | The date of birth isn't verified and isn't a gate |
| Made for Kids | No | Not designed for children as its main audience |

The founders' own question sits on top of this: the intended audience includes minors, and a
rating of 13+ or higher would tell families the app isn't meant for younger children. That needs
to match the decision about under-13s.

## 5. Build readiness

| Item | State | Detail |
| --- | --- | --- |
| Bundle identifier | Present, **not to be changed here** | `org.tidelight.app`, which the app's README calls a placeholder. Nobody has confirmed the founders control that name or the matching domain. Once an app is uploaded under an identifier it can't be changed, so choose before the first upload |
| Signing team | **Missing, a founder's step** | No development team is set. Needs a paid Apple Developer Program membership, in an organization's name if possible |
| Version and build | Present, **inconsistent** | Xcode: version 1.0, build 1. The app's own Settings screen says 0.2.0, and `package.json` says 0.1.0. Choose one number before a first upload |
| App icon | Present | One 1024 by 1024 icon with no transparency, in Xcode's single-size format, which generates every size. Whether it is the final icon is a founder's call |
| Launch screen | Present | `LaunchScreen.storyboard`, a plain sand color |
| Display name | Present | Tidelight |
| Minimum iOS | 15.0 | Set by Capacitor 7's default. To confirm |
| Devices | iPhone and iPad | See 2.4.1 above |
| Orientations | Portrait and landscape | The crisis strip has a short form for landscape; tested in the browser only |
| Location purpose strings | Present | `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Camera purpose string | **Missing, to check** | The Hope box photo chooser may offer "Take Photo" on a real iPhone. Without `NSCameraUsageDescription` the app would be closed by iOS if it is tapped. Check on a phone; then either add the sentence (new wording) or limit the chooser to the library |
| Export compliance | **Missing** | `ITSAppUsesNonExemptEncryption` is not set, so App Store Connect will ask on every upload. The app uses no encryption of its own; the likely answer is "No", for a founder to confirm |
| Privacy manifest | **Missing** | No `PrivacyInfo.xcprivacy` for the app's own use of the phone's key-and-value storage. Capacitor's packages include their own |
| Required device capability | To correct | `Info.plist` lists `armv7`, a leftover from the template; current phones are `arm64`. Harmless in the Simulator, worth correcting before upload |
| Privacy policy address | **Missing** | Required to submit |
| Support address | **Missing** | Required to submit. The website could host one |
| Screenshots | Drafts | Six draft pictures at the 6.9-inch size can be made with `node tools/screens.mjs after-launch-pass store` in `app/` (after `npm run build`); they are saved to `app/design/after-launch-pass/store/` on your computer, with names ending in `-DRAFT`, and are not in the repository. They are plain captures of real screens with made-up data, with no captions or frames, and they show draft wording |
| Android | Not looked at | The Android project exists and has never been built in this work |

## 6. What stands between today and TestFlight

In order. None of it can be done by an AI assistant.

1. A licensed suicide prevention professional reviews the wording ([[REVIEWER-PACKET]]), and the
   "Draft for review" notices come off only for what they approve.
2. A lawyer answers the questions in [[LEGAL-PACKET]], and a privacy policy and terms are written.
3. The founders decide the ages, and whether the location feature is in a first release.
4. An Apple Developer account, in an organization's name if the lawyer advises it.
5. The app runs on a real iPhone, and someone works through `app/TESTING_CHECKLIST.md`,
   including the crisis buttons (stopping at the dial screen) and VoiceOver.
6. The build items marked missing above.
7. A fluent Spanish reader reviews the Spanish, or the first release is English only.
