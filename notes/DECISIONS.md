# Decisions

Agreed decisions, proposals, and open questions, each labelled.

## Confirmed project choices

- Start with a phone-friendly website.
- Launch first in the United States.
- Plan for adults and minors; exact supported ages remain undecided.

## November 4, 2026: shared project notebook

The user requested a shared Obsidian vault. Keep it in the GitHub project's
`notes/` folder, so notes, designs, and future code share one workflow.
Claude Code reads the short core notes through `CLAUDE.md`; detailed task
handoffs go in `worklogs/`.

The starter repository is published. The second computer's setup still needs
confirmation. Each person uses their own local copy and Claude conversation.

## November 4 to 6, 2026: what has already happened

Recorded so the history is accurate. No note records that both founders agreed to
these before they happened.

- The repository is public and GitHub Pages publishes `main`.
- The homepage and three placeholder pages went public when pull requests 3 and 4
  merged, without a recorded review or a decision about a public preview.
- The first build used plain HTML, CSS, and one small script. Its handoff calls this
  a starting point, not an agreed tool choice.

## November 6, 2026: reported, not confirmed

- **Hold on publishing.** The research brief's handoff says the founder who supplied
  it chose not to merge pull request 5 until both founders agree and a licensed
  therapist has reviewed the content. The other founder's agreement isn't recorded.

## November 6, 2026: proposed on branch `site/phone-accessibility-content`

Claude made these routine, reversible choices overnight at one founder's request.
They are in draft pull requests, not merged, and **not agreed by both founders**.

- **Crisis strip pinned on phones and tablets.** Up to 959 px wide, the crisis strip
  stays on screen while the header scrolls away. The full strip stops pinning on very narrow
  screens (16em wide or less, about 256 px) and very short ones (300 px tall or
  less), where it would fill the screen. A phone on its side still pins it, as one row,
  down to 240 px tall when the screen is at least 704 px wide: Safari on an iPhone 17
  measures 750 by 292 there, so the 300 px rule had left 988 and 911 off screen after
  scrolling. Found in the iOS Simulator on November 7, 2026. These limits are set in em, so
  they grow with a larger text setting: at 150% text, 16em is 384 px and 18.75em is 450 px.
  Without the proposal below, the strip then scrolls away and only Quick exit stays on screen,
  even where the strip would take a small part of it, and short screens 568 to 703 px wide and
  300 px tall or less, such as older phones on their side, don't pin it, because the Spanish
  strip needs two rows there. Whether larger text should still pin the strip is open. The
  proposal below would answer it, once both founders agree.
  **Proposed on November 7, 2026, on branch `site/compact-crisis-strip`, and not agreed by both
  founders:** where the full strip would scroll away on a short screen, a compact strip pins
  instead. It is one row, "Call 988 · Text 988 · Call 911", with Quick exit inside. In Spanish
  it reads "Llama al 988 y marca 2 · Envía AYUDA al 988 · Llama al 911". It leaves out "Need
  help now?", "In immediate danger," and "any time", and their Spanish twins, though screen
  readers still hear each link's full name. The rule: it pins only where that row is sure to
  fit and to take a quarter of the screen's height or less. In height that means at least 192 px
  at the default text size, 265 px at 150% and about 266 px at 200%, so a few short screens with
  larger text, such as 640 by 264 at 150%, still scroll it away. With text set smaller than the
  default, it also needs as much width as at the default size, 312 px in English and 544 px in Spanish, because
  part of the row doesn't shrink with the text. Anywhere else the strip scrolls away as before, and
  Quick exit floats in the bottom corner. In desktop Chrome's phone-size emulation, 640 by 290
  and 568 by 300, such as older phones on their side, now pin it in both languages, at 48 px,
  about a sixth of the height. A desktop window zoomed to 400%, 320 by 225 in the tests, now pins
  the English row. With 150% text, 844 by 390 pins it in both languages, and 750 by
  292, 640 by 290 and 568 by 300 in English only. The Spanish row is about 1.7 times as long, so
  it pins in fewer places: at 200% text only the English row pins, at 844 by 390, 750 by 292 and
  640 by 290. A phone held upright with very large text, such as 390 px wide at 200%, can't fit
  one row, so the strip still scrolls away there. WebKit on a Mac agrees at the default text
  size. Not tried on a real phone. [[CONTENT-REVIEW]] asks the reviewer about the shorter wording.
  At 960 px and wider the strip scrolls away and the sticky header's button stays, which takes
  two steps to start a call. Why: on phones, the header's button took two taps.
- **Crisis strip uses links.** Call 988, text 988, and call 911 can be tapped. Why:
  [[SAFETY]] rule 1. Whether 911 should be a link is a question for the reviewer.
- **Pages ask search engines not to list them** (`noindex`), until review. Why: a
  person in crisis should not land on unreviewed drafts from a search. Remove it
  when the content is approved. It does not cover raw notes.
- **Wording keeps Tidelight apart from support services.** For example, "How can
  we support you today?" became "Where would you like to start?", and the footer
  says the content has not had professional review, not that it is being reviewed.
- **Privacy wording.** The homepage says "Tidelight has no sign-ups, forms, or
  tracking. Our web host logs visitors' IP addresses." Each footer says "no sign-ups,
  forms, analytics, or cookies" and links GitHub's statement about logging IP
  addresses. "Privacy first" was dropped because it promised too much. For the
  reviewer and a lawyer.
- **AI disclosure.** Footers and draft notes say an AI assistant drafted the content
  and compared numbers and links with each provider's website, and that no person has
  confirmed them.
- **A 404 page** keeps crisis options on screen for broken links.
- **Draft content is on the pages, marked for review,** with sources on each page.
  Long source lists sit behind a Show sources button. Three research papers are cited
  without links, because they name methods. The pages don't say why, since saying so
  points to method details. [[CONTENT-REVIEW]] gives the links for the reviewer.
- **No new website tools.** Still plain HTML, CSS, and one script. `tools/check_site.py`
  checks links, crisis numbers and markup, outside scripts and files, and Obsidian
  links with Python alone.
- **The 988 LGBTQ+ youth option is on the Get Help page as a draft,** listed apart
  from The Trevor Project. 988's own pages say it has been restored and list press 3
  and PRIDE to 988. None states an age range or chat route, and SAMHSA's older FAQ
  doesn't mention it. A person needs to confirm it. See [[SAFETY]].
- **Crisis content rules in `CLAUDE.md`.** That section, and importing [[SAFETY]] as a
  core note, are a proposal for both founders to confirm.
- **Pull request 6 goes into `claude/jolly-mayer-2m6eno`, not `main`,** so pull
  request 5 stays the one place to review. Merging it doesn't publish.

## Open decisions

For both founders, ideally with a qualified reviewer. Record the answer, who agreed,
and why at the end of this note. Then change that item below to plain text starting with
"Settled", with no bold, such as "4. Settled. See the end of this note." `tools/launch_gate.py`
counts only bold items as open. Keep the numbers, because other notes refer to them. This
repository is public, so record people by role,
such as "founder A", or by a handle the person chooses.

1. Settled: pull request 12, the one crisis page, until the content is reviewed. See the
   November 9 entry near the end of this note.
2. Settled: publish the website without the notes, through GitHub Actions. Same entry.
3. Settled: the licensed therapist reviews everything, and a fluent Spanish reader is still to
   be found. Same entry.
4. Settled: every merge into `main` needs the other founder's approval, once the GitHub
   setting is on. Same entry.
5. Settled: turn off GitHub Issues and the Wiki. Same entry.
6. Settled: every age, with the app held back from under-13s until a lawyer has advised.
   Same entry.
7. Settled: private notes live outside the project folder. Same entry.

## November 6, 2026: improvement ideas approved by one founder

One founder approved nine ideas from [[IDEAS]]: A1, A2, A3, A4, A6, A7, B1, B2 and B6.
**The other founder has not agreed yet.** They are built on branch
`claude/jolly-mayer-2m6eno`, draft pull request 5, not merged. Details and the
GitHub settings each needs are in
[[worklogs/2026-11-06-claude-approved-ideas|the handoff]].

- A2, A3 and A4 would settle open decisions 4, 2 and 5 above, once both founders
  agree and the settings are changed.
- B1, B2 and B6 change crisis wording, so they stay drafts until the qualified
  reviewer, and for B6 a fluent Spanish reader, has checked them. See [[CONTENT-REVIEW]].

## November 6, 2026: second batch approved by one founder

One founder approved C2, C3, C4, C5, C6, D1, D2 and D3 from [[IDEAS]]. **The other
founder has not agreed yet.** Built on draft pull request 5, not merged, except:
C5 (closing pull requests 1, 7 and 8) is on hold because the other founder opened
them, and C6 is a plan in [[USER-TEST]], not yet run. D1 to D3 add health wording,
so they stay drafts for the reviewer. D3, a page for teens, was built before
supported ages are decided; the page says so. Details in
[[worklogs/2026-11-06-claude-second-batch|the handoff]].

## November 6, 2026: first version finished for testing and review

The founder who hadn't yet weighed in asked Claude to finish the first version in one
session, using the work already on `claude/jolly-mayer-2m6eno`, so the site can be tested on
phones and given to human reviewers. This asks for testing and review, not publishing. **It
settles none of the open decisions above, and nothing is agreed to go live.** The first
founder hasn't seen the additions, and neither founder has agreed to the other's list.

Built as drafts on `site/first-version-build`, draft pull request 9: A5, B3, B4, B5, and C1
from [[IDEAS]], an About and privacy page, and the rest of the Spanish Research page. Details
are in [[worklogs/2026-11-06-claude-first-version|the handoff]]. Choices Claude made, all easy
to reverse:

- **Not sure page has nothing to type.** Tapping opens short notes. No answers, no score, no
  saving, and no form, which keeps [[SAFETY]] rule 5 intact. Pathway B's journal was not built.
- **The Research page was translated before review.** Earlier notes planned to wait. The founder
  asked for complete Spanish pages so they can be reviewed. If the English changes, so must this.
- **About became a page.** The first scope listed one, and quick exit and offline limits
  needed a place. The footer stays short and links to it. "About" in the menu goes there.
- **Two packets, not one.** The therapist gets English pages and the brief. A fluent Spanish
  reader gets the Spanish pages. Packets record a role and a date, never contact details.
- **Two pages appear in the phone menu only.** They don't fit the desktop header, where they
  stay in the footer and on the homepage.

## November 7, 2026: name changed to Tidelight

One founder renamed the project from Stillwater to Tidelight. **The other founder's
agreement isn't recorded yet.** Done on branch `claude/jolly-mayer-2m6eno`, draft pull
request 5, not merged. What changed:

- Every page in English and Spanish, the home screen app name, the review packets,
  the tools, and the current notes.
- Not changed: the supplied design files, which show the old name; earlier handoff
  notes, which are history; and the GitHub organization `stillwatersps` and the website
  address, which a founder would change in GitHub's settings.
- Visitors' saved offline copies under the old name are removed on their next visit.

Still open: check Tidelight against existing organizations and trademarks before
buying a domain or printing cards.

## Recorded November 7, 2026: publish safety check, proposed

Once Pages publishes with GitHub Actions, `tools/launch_gate.py` stops the publish step until
reviews are recorded. Claude built it as a proposal. Neither founder's agreement is recorded. See
[[LAUNCH-CHECKLIST]].

## Recorded November 7, 2026: four more items built, proposed

One founder asked Claude to build everything that could be built. **Neither founder's agreement is
recorded,** and each is easy to reverse.

- **A first-version description,** [[FIRST-VERSION]], for both founders to correct and agree. Merged
  into `site/first-version-finish`.
- **Spanish lines on English pages get their own review sections.** The Spanish packet shows them,
  and the publish check needs a fluent reader's approval for each. Merged into
  `site/first-version-finish`. Why: before this, those lines were only in the therapist's packet, so
  no fluent reader would have checked them.
- **A compact crisis strip,** in draft pull request 13, not merged. Why: with larger text and
  on older phones on their side, the full strip scrolls away. It is a pull request of its own because
  draft pull request 11 rewrites the same stylesheet.
- **A one-page public site,** in draft pull request 12 into `main`, not merged. It is option B
  for open decision 1. Merging it publishes.

## November 8, 2026: a second redesign, proposed

One founder asked for a redesign with the same limits the other founder gave for the signage
redesign (pull request 11): a complete new look, no change to wording, links, numbers, page
addresses, or behavior, and the crisis strip, Quick exit, and menu working exactly as before.
Built on `site/pro-max-redesign` with the ui-ux-pro-max design skill. **Neither founder has
chosen between the current look, signage, and Shoreline.** See [[DESIGN]].

Choices made, all easy to reverse:

- The skill's first suggestion was rejected: a testimonial carousel, low-contrast
  "neumorphism", Google Fonts, and scroll animation. They conflict with [[SAFETY]] rule 5 or
  with a crisis site. Its narrower "Accessible & Ethical" and "E-Ink / Paper" styles were used.
- Only `assets/styles.css` changed: one marked block near the end. The skill was installed for
  that session only, not added to the project.

## November 9, 2026: Daily check-in, proposed

One founder asked for a Daily Check-In and Self-Discovery page from a detailed spec: Today,
Rediscover, Journal, Your journey, and Support. **The other founder hasn't agreed, and no
reviewer has seen it.** Built on `site/daily-check-in`, a draft pull request into the Shoreline
branch (`site/pro-max-redesign`). Merging it there publishes nothing. Choices:

- **Saving: a phone app with the user's own iCloud or Google backup.** The founder first chose
  accounts and a server, then, after seeing the comparison in [[CHECK-IN-BACKEND]], chose this the
  same day. No server and nothing reaches Tidelight. The website still saves nothing and says so.
  Nothing for the app is built; the plan is in [[CHECK-IN-BACKEND]].
- **Typing is allowed on this page only,** a proposed narrowing of [[SAFETY]] rule 5. It reverses
  the Not sure page's choice of nothing to type, for this page. A question for the reviewer.
- **English and Spanish at once,** the founder's choice.
- **Every word the page can show is on the page,** including all 30 suggestions and ideas, so the
  review packets cover them and the script can't show unreviewed text.
- **No risk scores and no reading of what people write.** Suggestions follow only the feeling and
  needs chosen.
- **Support stays on screen.** The crisis strip and 988 panel are on the page at all times, and
  the needs step always shows 988 and 911.

## November 9, 2026: location alerts, proposed

One founder asked whether the phone app could alert someone at a place known for suicide. Claude
advised against an app that carries a list of such places, for the reasons in [[IDEAS]], and
suggested idea E1 instead: an opt-in safety-plan feature where the person picks their own places.
**The founder likes E1 and marked it Important, first for attention.** The other founder hasn't
agreed, no reviewer has seen it, and nothing is built.

## November 9, 2026: every age, with date of birth at sign-up, proposed

One founder's answer to open decision 6. **The other founder hasn't agreed, and no lawyer or
reviewer has seen it.** Nothing is built.

- **Every age is supported.**
- **Date of birth is required when someone signs up** in the app, and the age group it gives
  decides which kinds of help the app offers, based on what research shows works for that age
  group.

Claude's notes, to settle before building. Details are in [[IDEAS]], idea E3:

- **Crisis help never waits for sign-up.** 988, 911, and Quick exit stay available before and
  without signing up or giving a birth date ([[SAFETY]] rule 1).
- **Keep the age group, not the birth date,** once it has been worked out, so the app holds less
  about a person.
- **Under 13** brings U.S. COPPA rules and the stores' children's rules. A lawyer must advise
  before the app asks young children anything.
- **People can enter a wrong birth date.** What every age group sees must be safe for any age.
- **Which help fits which age** must come from research the reviewer approves. The research brief
  doesn't yet set out help by age group.

## November 9, 2026: "Share this reflection", proposed

One founder chose idea E2a in [[IDEAS]] for the phone app: a button that sends one reflection,
check-in, or journal entry to someone the person picks, through the phone's share sheet. **The
other founder hasn't agreed, no reviewer has seen it, and nothing is built.** It isn't on the
website, because nothing typed there may leave the page until both founders agree.

## November 9, 2026: every pull request that publishes nothing, merged

One founder asked to merge all the pull requests. Claude explained that 5, 8 and 12 publish to the
public website and that 11 and 14 are rival designs, and the founder chose to merge only those that
publish nothing. **The other founder's agreement isn't recorded.** Merged into
`claude/jolly-mayer-2m6eno`, pull request 5's branch, which is still not on `main`:

- 15, the Daily check-in, into 14, Shoreline. So **Shoreline is the look on pull request 5's branch.**
  Signage, pull request 11, stays open, and would conflict.
- 13, the compact crisis strip, and 14 into 10, and 10 into pull request 5's branch.
- Two fixes the combined version needed: the check-in pages got the compact strip's markup, and the
  homepage cards stack on tablet-width screens with larger text. Full browser tests pass.

Still open, and publishing: 5, 8 and 12. Merging any of them still needs both founders.

## November 9, 2026: phone app first draft, proposed

One founder asked Claude to build the reflections and sharing, and the age setup, and to research
what works for which age groups. **The other founder hasn't agreed, and no reviewer or lawyer has
seen it.** Built on `app/first-build`, in `app/`, which the website never publishes. Choices, all easy
to reverse:

- **Capacitor, wrapping the website's own pages,** as [[CHECK-IN-BACKEND]] proposed, so the reviewed
  words stay in one place. The app adds blocks to the Daily check-in at build time; the website is
  unchanged except for a small hook in `assets/check-in.js` that the website never uses.
- **Saved on the phone only,** with Capacitor Preferences, which the phone's own backups are expected
  to include. To confirm on a phone.
- **Age groups:** under 13, 13 to 17, 18 to 24, 25 to 64, 65 and over, from [[AGE-STRATEGIES]]. Only
  the group is kept. 988, 911, and Quick exit come before and during the question.
- **Delete everything keeps the age group,** so the person isn't asked again. A button in Your
  journey asks again.
- **Sharing shows a notice first,** and the person can change the words before the share sheet opens.

## November 9, 2026: age-based accommodations in the app, proposed

One founder asked to show people their accommodations by age, and to make plain that an accurate
age matters. **The other founder hasn't agreed, and no reviewer has seen it.** Built in the app
draft (`app/`, branch `app/first-build`):

- **Accuracy comes first.** Before the date of birth, the app says to enter the real date, because
  a wrong one means ideas meant for a different age that may not fit or be safe.
- **The group is checked before it's kept.** After the date, the app shows the age group and what
  it will do for that age, and keeps nothing until the person taps "Yes, that's right".
- **Accommodations by age:** a box at the top of Today for each group (for the grown-up with a
  child; under-18 and LGBTQ+ help for teens; reaching out for 18 to 24; a safety plan with a
  professional for 25 to 64; the doctor and staying in touch for 65 and over), the card in today's
  results, and larger text by default for 65 and over, which anyone can switch.
- Your journey lists what the app does for the person's age, and lets them enter the date again.

## November 9, 2026: reminders, shared check-ins, and forty ideas, proposed

Late on November 9, one founder asked Claude to check the whole project, to work out two ideas in full, and to list
thirty things that would make the app the best of its kind, then ten more. **The other founder hasn't agreed to any
of it, and no reviewer or lawyer has seen it.**

- **Alerting chosen people when someone stays near a hard place** is worked out in [[LOCATION-ALERT]]. Claude's
  recommendation: build it on the person's own places (E1), with a wait time and a one-tap send through Messages,
  and no built-in list of places. Nothing is built.
- **Four daily check-ins, shared with a guardian or a doctor**, is designed in [[CHECK-IN-SCHEDULE]] and partly built
  as a draft on `app/daily-check-ins`: four reminders, all off until turned on, with neutral words; today's check-ins
  listed; Share today or Share the last 7 days through the share sheet. Nothing is sent without a tap, and nothing
  automatic is built, because that needs accounts and a server.
- **Forty ideas** are in [[IDEAS-ROUND-3]], none approved.
- Also done while checking the code: the app's tests now run on GitHub for every pull request, the test browser is
  listed in `app/package.json`, and a fix so saved check-in and journal dates still read as dates after the app
  reopens. Node.js was installed on one founder's Mac with Homebrew to run the app's tests there.

Choices Claude made, all easy to reverse: every reminder off by default; the third reminder named "After school
(or after work)"; the shared summary leaves out journal entries and reflections; reminders survive Delete everything,
like the age group.

## November 10, 2026: My circle without accounts, and a hope box, proposed

One founder asked to build E2, F9, and F3. **The other founder hasn't agreed to these, and no
reviewer has seen them.** On `app/my-circle-and-hope-box`, stacked on `app/hard-places-and-reminders`:

- **My circle is built without accounts or a server.** Chosen people get a text message the person
  sends from their own Messages app. Why: the app may send nothing to Tidelight, and accounts need
  both founders ([[CHECK-IN-BACKEND]]). A circle whose members see entries inside an app is still
  an open choice.
- **Hope box (F9):** words and photos kept in the app on the phone, never shared.
- **F3 was already being built by the other founder's session,** so nothing of it was rebuilt.

## November 9, 2026: both founders' answers to 14 questions

Founder A answered 14 questions Claude listed, and founder B agreed to every answer the same day.
These are the first decisions both founders have agreed. They answer the open decisions above and
the earlier entries that say the other founder hasn't agreed to every age, the phone app, or typing
in the Daily check-in. Who owns each step isn't named yet.

1. **Public site until review: pull request 12.** Merge it, the one crisis page with 988 and 911 in
   English and Spanish, and close pull request 8. Merging publishes.
2. **The licensed therapist reviews everything:** the research brief, every draft page, and the
   phone app's words. Sign-offs go in [[CONTENT-REVIEW]] by role and date. A fluent Spanish reader is
   still needed. Nothing in pull request 5 goes live until both have signed off.
3. **Every merge into `main` needs the other founder's approval,** set as branch protection in
   GitHub's settings.
4. **Publish the website without the notes,** by switching Pages to the GitHub Actions publish
   step. The notes stay readable in the public repository but stop being web pages. That step is
   only on pull request 5's branch now, and `tools/launch_gate.py` stops it until reviews are
   recorded, so `main` needs a version that publishes pull request 12's page.
5. **Turn off GitHub Issues and the Wiki,** so nobody in crisis posts where no one is watching.
6. **Design: decide after trying Shoreline and signage on a real phone.** Not chosen yet.
   Shoreline is on pull request 5's branch; pull request 11 swaps in signage.
7. **Every age, with date of birth asked at sign-up in the app.** The app isn't released to
   under-13s until a lawyer has advised on children's privacy law (COPPA) and the app stores' rules.
   The website asks no age. A lawyer is still to be found.
8. **The Daily check-in keeps typing, saved to the person's own account.** Nobody else, Tidelight
   included, can see it unless the person shares it. In the phone app that means saved on the
   phone and shared only through Share. The website saves nothing until accounts and a server
   exist ([[CHECK-IN-BACKEND]]). **Still to answer:** whether "own account" means the person's
   iCloud or Google account, as chosen earlier on November 9, with no server, or a Tidelight
   account, which needs one. Claude builds neither until both founders say which.
9. **Keep building the phone app,** pull request 16, as a draft until the reviewer and a lawyer
   have read it and it has run on real phones. Idea E1, places that are hard for me, waits for
   the reviewer.
10. **Claude updates [[FIRST-VERSION]] with these decisions first,** then both founders read and
    agree it.
11. **Both founders read [[SAFETY]] and the crisis rules in `CLAUDE.md`,** change anything needed,
    and then record them here as agreed. Not done yet, so both stay proposals.
12. **Keep the name Tidelight,** and check the U.S. trademark office's search and existing
    organizations before buying a domain or printing anything.
13. **Private notes live outside the project folder,** so they can't be committed or published.
14. **Upkeep is split:** one founder rechecks the crisis numbers monthly; the other gets GitHub's
    failed-check emails and looks at the Actions tab on a set day. Who does which isn't named.

## Decision format

For future decisions, add the date, what was chosen, why, who agreed, and any
remaining questions. Keep the newest entries at the end.

## November 11, 2026: phone app redesign from a build spec, proposed

One founder sent a build spec for the phone app (`app/BUILD-SPEC.md`): fewer words, bottom tabs, onboarding, streaks,
and meditation, "like Calm, Headspace and Finch". **The other founder hasn't seen the spec or agreed to any of it, and
no reviewer or lawyer has seen it.** Built as a draft on `app/redesign-dev`, in `app/` only. It publishes nothing.
The same founder added six safety rules that override the spec; they are in `app/CLAUDE.md`. Choices, all easy to
reverse, with the full list in `app/PROGRESS.md`:

- **The safety frame stays on every screen, in full.** The crisis strip, Exit, Get Support Now, the Spanish link,
  both "Draft for review" notices, the privacy notice, Support, and the 988 panel. Nothing new is a pop-up or a
  layer over them. During a meditation the strip stays on screen and the rest is in the page below.
- **Kept Capacitor and the website's own pages.** The spec expected a different kind of app; nothing was ported.
- **Five tabs:** Home, Check-in, Meditate, Location, Friends. Everything that existed has a place.
- **The date of birth stays required** in onboarding, as decided on November 9. Every other page can be skipped.
- **A very low check-in shows 988 and 911 at once,** and nothing celebrates for the rest of that day.
- **Streaks are built as the spec asks, with gentle words, and can be turned off.** Whether they belong in this app
  at all is the first question in [[CONTENT-REVIEW]].
- **The four older reminders became "N check-ins a day".** Reminder words stay discreet.
- **Location:** one home spot the person saves, read only while the app is open, kept on the phone. No list of places.
- **No new packages.** Haptics, keeping the screen awake, one location, and the audio route are small additions to
  the project's own iPhone plugin.
- **The website gained one line it never uses** (`addCheckIn` in `assets/check-in.js`), so a quick check-in marks
  the calendar.

Open: whether to keep any of it; the reviewer's and the lawyer's answers; a real phone.

## November 11, 2026: phone app visual identity from a design brief, proposed

The same founder sent a design brief (`app/DESIGN-BRIEF.md`) for the phone app's look. **The other founder hasn't
seen it or agreed to any of it, and no reviewer has seen it.** Built as a draft on `app/visual-identity`, on top of
`app/redesign-dev`, in `app/` only. It publishes nothing. Choices, with the full list in `app/PROGRESS.md`:

- **Safety rules win over the brief.** The crisis strip, Exit, Get Support Now, the Spanish link, and the review
  notices keep their words and places. They were restyled to be plainer and higher in contrast, never quieter.
- **Streak wording is unchanged.** A first version replaced the streak screens with a month view; the founder
  asked for the original wording back, since it was awaiting review. Only the look of the streak screens changed.
- **Only plain how-to text folds under "Learn more" on Location and Friends.** The founder's rule: all privacy
  and consent wording stays in view, always (what is stored, where data stays, who gets a message, that a sent
  message can't be undone), as do urgent-help lines and controls. No word changed.
- **A check-in ends on a choice of two** and no longer returns Home by itself; the burst of drops is removed.
- **Fonts are bundled files** (Fraunces and Figtree, open licenses). Nothing is fetched from another site.
- **Automated runs are muted**, at the founder's instruction: tests and Simulator checks play no sound, and the
  app's own audio code is unchanged.
- **Not done because they would be new features:** seek buttons in the player, filter chips on Meditate.

## November 14, 2026: the phone app's fonts, proposed

The founder who wrote the app's design brief found its fonts too much like other AI-made apps, compared five
alternatives side by side on the Home, Check-in, and Meditate screens, and chose one. **The other founder hasn't
seen it, and it has not run on a real phone.** Built as a draft on `app/literata-font`, on top of
`app/launch-readiness`, in `app/` only. It publishes nothing.

- **Headlines are Literata**, one bundled file with its open license. It replaces Fraunces.
- **Body text is the phone's own font**: San Francisco on iPhone, Roboto on Android. It replaces Figtree, so the
  app carries one font file where it carried two (52 KB, down from 141 KB). The two phones will look
  slightly different from each other, as most apps do.
- **The app's name in the header is one size smaller** (18 px, from 20 to 26 px depending on the screen). Literata is
  wider than Fraunces, and without this Get Support Now dropped to a second row on common phone widths, which
  pushed everything below it down. With it, the button wraps at the same widths as before and no others.
- **Nothing else changed:** no wording, colors, sizes of other text, crisis controls, or behavior. The website's
  fonts are untouched.

Not chosen: the phone's own fonts for everything, Atkinson Hyperlegible Next, the phone's rounded font, and
Newsreader. Open: whether the other founder agrees, and how it looks on a real iPhone and Android phone.

## November 14, 2026: fixes before review, proposed

One founder asked for a list of what would improve the phone app before it goes to a lawyer and a licensed
reviewer, then asked Claude to build six small items from it. **The other founder hasn't seen any of it, and no
reviewer or lawyer has.** Built as a draft on `app/pre-review-fixes`, on top of `app/literata-font`, in `app/`
and notes only. It publishes nothing.

Built, each easy to reverse:

- **After Quick exit the app opens on Home.** Before, it came back on the screen the person had left, which
  could be a journal entry. A check-in or meditation that was under way is not kept. The reviewer's question
  about this stays open in [[CONTENT-REVIEW]].
- **"1 minute in all."** A new line for exactly one minute; the line for every other number is unchanged. It is
  recorded as wording added since the reviewer's snapshot, not as reviewed.
- **The Hope box uses the phone's photo picker on iPhone.** The page's own file chooser can offer "Take Photo",
  and the app states no reason for using the camera, so iOS would close it. The picker shows the library only.
  Like the phone's contact picker, it covers the crisis strip while it is open.
- **A draft privacy manifest:** no tracking, nothing collected, one stated reason for on-phone storage. For a
  lawyer to confirm.

Asked for and not built, because the app's own safety rules say no:

- **A short crisis strip at the largest text sizes.** It would leave out "Need help now?" and "In immediate
  danger,". The app's first safety rule is never to shorten crisis wording or the 911 banner.
- **Taller tap areas for crisis links inside sentences.** An earlier check found the taller areas overlap, so a
  tap meant for 988 could land on 911. The safe fix is a new layout for reviewed sentences.

Both stay decisions for both founders and the reviewer, as [[LAUNCH-BACKLOG]] already says.

## November 14, 2026: one version of the app for review, proposed

The same founder asked for the app to be made ready to hand to reviewers. **The other founder hasn't seen it,
and no reviewer or lawyer has.** On `app/review-version`, in `app/` and notes only. It publishes nothing.

- **One branch and one pull request for the whole app.** The app had spread over nine stacked pull requests, and
  the first of them conflicted with pull request 5's branch. Nothing was left out. The founder who asked for
  this closed the seven older pull requests they had opened (19, 20, 25 to 29), keeping the branches; 16 and 21
  were opened by the other founder and are theirs to close.
- **The notes conflict was settled by keeping both sides:** the app's entries here, then both founders'
  fourteen answers; in [[TASKS]] and [[STATUS]], the wording both founders agreed, with the app's rows and its
  own Important item kept.
- **Meditation history is grouped by month,** under month names the phone writes itself. No new wording.
- **A plainer look.** The founder found the app's look too much like a template. Small labels are no longer in
  spaced capitals; buttons and chips are rounded rectangles, with the pill kept for the crisis buttons only; the
  dawn glow and paper grain give way to flat color. This goes against parts of the same founder's design
  brief, which now says so. It is one block of styles and easy to drop.
- **The reviewer packet is reordered,** not shortened: support and crisis screens first, then check-in
  questions, then streaks, then everything else. It also says plainly where each kind of wording came from:
  nothing is quoted from 988; numbers and keywords come from providers' pages listed in [[SAFETY]]; an AI
  assistant wrote the rest.

Open: whether the other founder agrees to the plainer look, and all the earlier questions.

## November 14, 2026: privacy features in the phone app, proposed

The same founder asked for the privacy features Claude had listed: an app lock, removing one entry, a copy
of your data, plainer words about backups, and a licenses screen. **The other founder hasn't seen any of it,
and no reviewer or lawyer has.** Built as a draft on `app/privacy-package`, on top of `app/review-version`, in
`app/` and notes only. It publishes nothing. It adds wording, so it adds questions for the reviewer and the
lawyer; they are in [[CONTENT-REVIEW]] under "Questions about the app's privacy features". Choices, each easy
to reverse:

- **The lock uses the phone's own check** (Face ID, Touch ID, or the phone's passcode), not a code of the
  app's own. Why: nothing to forget, so nobody is locked out of their own Hope box and plan, and the app
  stores no code. The cost: someone who knows the phone's passcode can open the app, and the screen says so.
  A separate code is an open question for both founders and the reviewer.
- **The lock never covers crisis help.** Call 988, Text 988, Call 911, Quick exit, Get Support Now, the
  Support panel, the Spanish link, the review notices, and a place alert all stay on screen and work while
  the app is locked. It is off until turned on, and first launch is never behind it.
- **If the phone can no longer check who is holding it** (the passcode was turned off), the app opens.
- **Removing one check-in removes its words and leaves the day marked** on the calendar and in the streak.
  The screen says so. Only today's check-ins are listed, so only those can be removed one at a time.
- **A copy of your data is one plain text file,** handed to the phone's share sheet only when the person taps
  the button, with a warning that the file isn't locked. No photos. The app keeps no record of it.
- **The backup sentence is new and sits in Settings, in view.** The older lines that say "on this phone
  only" were not changed, because reviewed wording is locked; whether they should change is a question for
  the reviewer and a lawyer.
- **License notices are read from the installed packages when the app is built,** and shown in English in
  both languages.
- **Two screens were added to the crisis inventory** (the licenses screen and the lock screen). Every
  screen already in it is unchanged, which was checked entry by entry.

Open: all of it, for the other founder, the reviewer, and a lawyer; and a real phone, where the lock has
never run.

## November 15, 2026: twenty more features in the phone app, proposed

One founder asked Claude to list 20 features that would make the app better, then to build all of them, one at
a time, with a full check after each. **The other founder hasn't seen any of it, and no reviewer or lawyer
has.** Built as a draft on `app/next-features`, on top of `app/privacy-package`, as draft pull request 32.
It publishes nothing. It adds a lot of wording; the questions are in [[CONTENT-REVIEW]] under "Questions about
the app's next features". What that founder chose along the way, each easy to reverse:

- **New screens may be added to the crisis inventory**, the recorded list of every crisis control on every
  screen. Existing entries were compared each time and left unchanged. The one exception is the feature the
  founder asked for by name: the Spanish text address gained AYUDA.
- **At the largest text, the crisis strip keeps every word and stops growing at 28 points** ("full words,
  capped"), so the strip leaves room for the screen under it. Chosen over shortening its words, which the
  safety rules forbid.
- **Build the widget, the Apple Watch app, and Apple Health**, all three, as drafts.
- **Apple Health gets mindful minutes only**, off until turned on. Never a mood, a check-in, or a word, and
  the app asks for no access to read Health. This changes what "stays on this phone" means, and the app's
  privacy screen says so.

Choices Claude made that both founders should look at: the safety plan suggests nothing and fills nothing in;
"what tends to help" never counts or shows hard days; the summary for an appointment lists records as recorded
and interprets nothing; the privacy screen says first that it is not a privacy policy; the shortcuts and the
widget avoid the words mood, crisis, and safety; the watch app puts the three crisis lines on its first screen
with no step in front of them. **Open and urgent before anyone uses the watch app:** whether a tap on "Call
988" or "Call 911" dials at once on a watch. Nobody has seen it run.

## November 16, 2026: the crisis strip on a short screen, proposed

On November 15 one founder chose that the crisis strip keeps every word and stops growing at 28 points. A
check on November 16 found a case that choice did not cover: on a short screen (320 by 568 points), in Spanish,
with a font wider than an iPhone's, 28 points made the strip as tall as the whole screen, so "call 911" had to
be scrolled to inside the strip. **Proposed, built, and easy to reverse:** where the strip would take more than
70% of the screen's height, its words are set smaller a point at a time, never under 18 points (an iPhone's
usual size is 17). Every word and every control stays, at full tap size. On an iPhone with its own font the
strip never reaches 70% in the sizes tested, so nothing changes there. **The other founder and the reviewer
haven't seen this.** The alternative is to leave the strip to fill a short screen.

Also proposed the same day: a check-in reminder now shows as a banner while the app is open (it showed nothing
before). For about five seconds the banner covers the strip's first line, as any notification does.

## November 17, 2026: reminders in the person's own words (a proposal, not agreed)

Built by Claude as feature 24 of the forty, on the unmerged branch `app/forty-features`. A person can write one
short line for their check-in reminders to say. The app refuses words about mood, crisis, or getting help. The
founder's rule is that notifications are discreet; whether a person's own words, inside that list, are within
the rule is for the founders to decide. Until then this stays a draft on its branch.

## November 17, 2026: an unlocked backup file (a proposal, not agreed)

Built by Claude as feature 39 of the forty, on the unmerged branch `app/forty-features`. Settings can make one
file with everything the app has saved (no photos) and read one back. The file is not locked: anyone who gets
it can read all of it, and the screen says so. Whether an unlocked backup is acceptable, or a backup must be
locked with a passphrase first, is for the founders (and a lawyer) to decide. Until then this stays a draft on
its branch.

## November 17, 2026: a breathing session on the Lock Screen (a proposal, not agreed)

Built by Claude as feature 38 of the forty, on the unmerged branch `app/forty-features`. If a person turns it on,
the Lock Screen shows "Tidelight", "Breathing", and the time left while a breathing session runs; and the
widget has a button that runs a breathing minute on the widget itself. The founders' rule is that anything
outside the app is discreet. Whether these are within it is for the founders to decide. Until then this stays
a draft on its branch.
