---
aliases: [Reviewer packet, Clinical reviewer packet]
status: DRAFT, written by an AI assistant. No reviewer has been found or contacted, and nothing has been sent
---

# Reviewer packet: the Tidelight phone app

[[00 START HERE|Back to Start Here]]

**DRAFT.** Written November 12, 2026, during the launch readiness work ([[LAUNCH-READINESS]]), from
the app on the branch `app/launch-readiness`. It is for a licensed suicide prevention professional
the founders have yet to find. It covers the phone app only. The website's pages have their own
packets in `notes/review-packet/` and their own questions in [[CONTENT-REVIEW]].

## The app, in one paragraph

Tidelight is a free phone app, in draft, for people who are having a hard time, including people
who may be thinking about suicide. It is meant for adults and minors in the United States; the
exact ages are undecided. A person can check in on how they feel in one tap or in five gentle
questions, write in a private journal, do a breathing or meditation session, keep a "Hope box" of
reasons and photos, share a check-in with a few people they choose, and, if they turn it on, have
the phone check in with them when they stay at a place they have named as hard. Buttons to call
or text 988 and to call 911 are at the top of every screen. Nothing a person enters leaves their
phone unless they send it themselves. The app is not treatment and contacts nobody on its own.
**Every word in it was written by an AI assistant from the founders' briefs, and no clinician has
read any of it.** The Spanish is an unreviewed AI translation.

## What we need from you

About two hours, in this order. Stop whenever you like; the order puts what matters most first.

| Step | What | Where | Time |
| --- | --- | --- | --- |
| 1 | Read "On every screen" and the three support screens (31, 36, and 37 in the walkthrough) | Below | 15 min |
| 2 | Answer the **crisis and safety** questions, A1 to A14 | Below | 30 min |
| 3 | Answer the **streaks and rewards** questions, B1 to B7 | Below | 15 min |
| 4 | Skim the walkthrough for anything that reads wrongly to you, marking the screen number | Below | 30 min |
| 5 | Answer the **privacy wording** questions, C1 to C6 (a lawyer is asked too) | Below | 10 min |
| 6 | Answer what you can of **everything else**, D1 to D21 | Below | 20 min |

For each question, an answer of "fine as it is", "change to …", or "remove" is all we need. If a
whole feature should not exist, say so; that is a welcome answer.

What happens next: the founders change the wording you ask for, a test locks the approved wording
so it can't change without you, and the "Draft for review" notice comes off only what you approved.

## On every screen

These never move, shrink, or hide. A test checks each on all 37 screens and states, in both
languages, at every text size ([[LAUNCH-READINESS]], "Crisis path reliability").

- **The crisis strip**, fixed at the top: "Need help now? Call 988 · Text 988 · In immediate
  danger, call 911" and a **Quick exit** button, which hides the page at once and opens weather.gov.
- **Get Support Now**, a button in the header that goes to the Support section.
- **"Leer en español"**, the link to the same screen in Spanish.
- **The review notice**: "Draft for review. The check-in prompts, streak messages, and meditation
  words in this app are new. A suicide prevention professional has not reviewed them yet. An AI
  assistant wrote them from a founder's brief. They are ideas for calm and reflection, not
  treatment, and not a replacement for care."
- **The privacy notice** ("What happens to what you share here"), quoted in question C1.
- **Support**, below each screen: "Tidelight is not a crisis service, and it doesn't replace
  professional care…", then the 988 Lifeline by call, text, and chat, and 911, with the line "The
  988 Suicide & Crisis Lifeline is free, confidential, and available any time. It is a separate
  service from Tidelight."
- **The tab bar** at the bottom: Home, Check-in, Meditate, Location, Friends.

## Screen by screen

The wording under each screen is copied by a script from what the app shows, in English, with
made-up data, on November 12, 2026. It leaves out the parts listed under "On every screen", and
it shows each screen in one state (an empty list, a first day). Pictures are made on a
founder's computer with `node tools/reviewer-walkthrough.mjs` in `app/` and saved to
`app/design/after-launch-pass/reviewer/`; they are not in the public repository, so a founder
needs to send them with this packet. Every line the app can show, including lines that appear
only in some states, is numbered in `notes/review-packet/tidelight-app-words.html`.

<!-- WALKTHROUGH:START -->

### 1. First launch, onboarding: welcome

The first thing a new person sees.

Picture: `app/design/after-launch-pass/reviewer/01-onboarding-welcome.png`

> Draft for review  
> Step 1 of 9  
> TIDELIGHT  
> Find your calm, anywhere.  
> Let's go

### 2. First launch, onboarding: age

Asks a date of birth once, to choose an age group. Only the group is kept.

Picture: `app/design/after-launch-pass/reviewer/02-onboarding-age.png`

> Draft for review  
> Back  
> Step 2 of 9  
> Before you start: your date of birth  
> Tidelight shows different ideas for different ages, because research finds that different things help at different ages. Your date of birth is asked once.  
> Please enter your real date of birth. It matters.  
> The app uses it to choose the kinds of help that research supports for your age. A wrong date means ideas meant for a different age, and some may not fit you or be safe for you.  
> The app works out your age group, keeps only the group on this phone, and forgets the date. It never leaves the phone.  
> You don't need to answer this to get help. You can call 988 or text 988 at any time. In immediate danger, call 911.  
> Date of birth  
> Continue  
> If you're under 13, please use Tidelight with a parent, carer, or another adult you trust.

### 3. First launch, onboarding: name

Asks for an optional first name, used in the greeting.

Picture: `app/design/after-launch-pass/reviewer/03-onboarding-name.png`

> Draft for review  
> Back  
> Skip  
> Step 3 of 9  
> What should we call you?  
> Optional. It stays on this phone.  
> Next

### 4. First launch, onboarding: count

How many check-ins a day the person would like, from 1 to 5.

Picture: `app/design/after-launch-pass/reviewer/04-onboarding-count.png`

> Draft for review  
> Back  
> Skip  
> Step 4 of 9  
> Check-ins per day  
> 3  
> 9:30 AM  
> 2:30 PM  
> 7:30 PM  
> Next

### 5. First launch, onboarding: times

When the person wakes and goes to bed, to space the check-ins.

Picture: `app/design/after-launch-pass/reviewer/05-onboarding-times.png`

> Draft for review  
> Back  
> Skip  
> Step 5 of 9  
> Your day  
> I wake up  
> I go to bed  
> 9:30 AM  
> 2:30 PM  
> 7:30 PM  
> Next

### 6. First launch, onboarding: style

Chooses between two voices for the app's prompts.

Picture: `app/design/after-launch-pass/reviewer/06-onboarding-style.png`

> Draft for review  
> Back  
> Skip  
> Step 6 of 9  
> Pick your style  
> Calm  
> Gentle and slow  
> Straightforward  
> Quick and direct  
> Next

### 7. First launch, onboarding: location

Offers to save one "home spot". Optional.

Picture: `app/design/after-launch-pass/reviewer/07-onboarding-location.png`

> Draft for review  
> Back  
> Skip  
> Step 7 of 9  
> Meditations that fit  
> So we can suggest the right meditation for where you are.  
> Your location is read only when you ask. It stays on this phone and is never sent anywhere.  
> Set your home spot  
> Location is on.  
> Next

### 8. First launch, onboarding: notifications

Offers check-in reminders. Optional.

Picture: `app/design/after-launch-pass/reviewer/08-onboarding-notifications.png`

> Draft for review  
> Back  
> Skip  
> Step 8 of 9  
> Gentle reminders  
> We'll gently remind you to check in.  
> A reminder never says anything about you.  
> Turn on reminders  
> Next

### 9. First launch, onboarding: done

The end of setup.

Picture: `app/design/after-launch-pass/reviewer/09-onboarding-done.png`

> Draft for review  
> Back  
> Step 9 of 9  
> You're all set.  
> Start

### 10. Home

The first tab: a greeting, the next check-in, the streak, and four quick tools.

Picture: `app/design/after-launch-pass/reviewer/10-home.png`

> Draft for review  
> Good afternoon  
> You don't have to have everything figured out.  
> Next check-in  
> At 2:30 PM  
> Start  
> SUGGESTED FOR YOU  
> Silent  
> Silent and ready anywhere  
> Start  
> 0  
> day streak  
> This week: 0 done, 0 frozen, 0 rest days.  
> 1  
> Check in  
> Meditate  
> 1-min reset  
> Get help  
> Finish setting up  
> Setup 1/8  
> 1/8

### 11. Home, with the site menu open

Home with the website's menu open (links to the site's other pages).

Picture: `app/design/after-launch-pass/reviewer/11-home-menu-open.png`

> Draft for review  
> Good afternoon  
> You don't have to have everything figured out.  
> Next check-in  
> At 2:30 PM  
> Start  
> SUGGESTED FOR YOU  
> Silent  
> Silent and ready anywhere  
> Start  
> 0  
> day streak  
> This week: 0 done, 0 frozen, 0 rest days.  
> 1  
> Check in  
> Meditate  
> 1-min reset  
> Get help  
> Finish setting up  
> Setup 1/8  
> 1/8

### 12. Your streak

Opened from the streak card on Home.

Picture: `app/design/after-launch-pass/reviewer/12-streak.png`

> Draft for review  
> Back  
> Your streak  
> Now  
> 0  
> Best  
> 0  
> NOVEMBER 2026  
> M  
> T  
> W  
> T  
> F  
> S  
> 1  
> 2  
> 3  
> 4  
> 5  
> 6  
> 7  
> 8  
> 9  
> 10  
> 11  
> 12  
> 13  
> 14  
> 15  
> 16  
> 17  
> 18  
> 19  
> 20  
> 21  
> 22  
> 23  
> 24  
> 25  
> 26  
> 27  
> 28  
> 29  
> 30  
> Done  
> Frozen  
> Rest day  
> Today  
> A day counts when you finish your check-ins, or do one check-in and one meditation.  
> Miss a day and a freeze ❄️ covers it. No freeze? You simply start again.  
> ❄️ 1 held. The next one arrives on Monday.  
> Turn streaks off in Settings

### 13. Settings

Opened from the gear on Home.

Picture: `app/design/after-launch-pass/reviewer/13-settings.png`

> Draft for review  
> Back  
> Settings  
> Get Support Now  
> YOU  
> Your name (optional, stays on this phone)  
> CHECK-INS  
> Check-ins per day  
> 3  
> I wake up  
> I go to bed  
> Check-in times (you can change each one)  
> Check-in 1  
> Check-in 2  
> Check-in 3  
> Style  
> Calm  
> Gentle and slow  
> Straightforward  
> Quick and direct  
> NOTIFICATIONS  
> Check-in reminders  
> The phone shows them itself. A reminder only says "A moment to check in, if you'd like." Nothing about you is in it, and nothing is sent anywhere.  
> Send a test notification  
> MEDITATION  
> Usual length  
> 3 min  
> 5 min  
> 10 min  
> 15 min  
> 20 min  
> Usual sound  
> None  
> Rain  
> Ocean  
> White noise  
> Brown noise  
> Voice guide  
> Haptic breathing  
> Count each breath  
> FEEL  
> Haptics  
> Reduce animations  
> Streaks  
> Streaks count the days you check in. Turn them off any time. Nothing is lost.  
> PLACES  
> Home spot  
> No home spot saved.  
> One spot, saved on this phone only. The app looks at where you are only when it suggests a meditation, to see if you're near it. Your location is never sent anywhere.  
> Save where I am  
> YOUR AGE GROUP  
> Your age group  
> The app shows ideas for ages 25 to 64. What it does for your age:  
> 988, 911, and Quick exit stay on every screen, at every age.  
> A box at the top of Today about a safety plan, and how to make one with a professional.  
> Ideas about talking to a doctor or counselor.  
> Text is the regular size. Use larger text  
> If this group isn't right, enter your date of birth again. The right age group matters for the best help.  
> Enter my date of birth again  
> YOUR DATA  
> Delete everything  
> In Your journey  
> ABOUT  
> Tidelight app, draft  
> 0.2.0

### 14. Check-in tab

The second tab: every kind of check-in, the journal, and the person's history.

Picture: `app/design/after-launch-pass/reviewer/14-checkin.png`

> Draft for review  
> Check in  
> Quick check-in  
> One tap, how you are  
> Check in  
> Today  
> No check-ins yet today.  
> Daily check-in  
> Five gentle questions  
> Journal  
> Write it out  
> Rediscover  
> Find your way back  
> Hope box  
> Reasons, words, photos  
> Your journey  
> What you've kept

### 15. Quick check-in, choosing a mood

The quick check-in: one tap on a mood, and optional tags and a note.

Picture: `app/design/after-launch-pass/reviewer/15-flow-mood.png`

> Draft for review  
> Back  
> Take a moment… how are you feeling right now?  
> Very low  
> Low  
> Okay  
> Good  
> Great

### 16. Quick check-in, finished

The end of an ordinary quick check-in (mood Okay, Good, or Great).

Picture: `app/design/after-launch-pass/reviewer/16-flow-done.png`

> Draft for review  
> Back  
> Thank you for checking in with yourself 💙  
> Breathe for a minute  
> Back to home

### 17. Daily check-in, first question

The longer Daily check-in, first of five questions.

Picture: `app/design/after-launch-pass/reviewer/17-daily-question.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Today  
> Welcome. However today is going, you're welcome here. You can skip any question, go back, or stop at any time.  
> A plan for hard moments  
> A safety plan lists signs that a hard moment is coming, what helps, who to contact, and your reasons for living. It helps most when you make it, or go over it, with a doctor or counselor.  
> Planning for a hard moment  
> How are you feeling today?  
> Choose the one that fits best, or skip it.  
> Hopeful  
> Calm  
> Okay  
> Unsure  
> Overwhelmed  
> Sad  
> Anxious  
> Disconnected  
> Exhausted  
> Next  
> Skip this question  
> See every suggestion this page can show

### 18. Daily check-in, "what do you need" (with its 988 line)

The Daily check-in's last question, with a 988 and 911 line.

Picture: `app/design/after-launch-pass/reviewer/18-daily-needs.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Today  
> Welcome. However today is going, you're welcome here. You can skip any question, go back, or stop at any time.  
> A plan for hard moments  
> A safety plan lists signs that a hard moment is coming, what helps, who to contact, and your reasons for living. It helps most when you make it, or go over it, with a doctor or counselor.  
> Planning for a hard moment  
> What do you feel like you need right now?  
> Choose any that fit, or none.  
> Rest  
> A break  
> Someone to talk to  
> To feel less alone  
> To get outside  
> To do something I enjoy  
> I'm not sure  
> If you're thinking about suicide, you can call 988 or text 988 at any time. In immediate danger, call 911.  
> See today's suggestions  
> Back  
> See every suggestion this page can show

### 19. Daily check-in, result

What the Daily check-in shows at the end: ideas chosen from the answers.

Picture: `app/design/after-launch-pass/reviewer/19-daily-result.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Today  
> Welcome. However today is going, you're welcome here. You can skip any question, go back, or stop at any time.  
> A plan for hard moments  
> A safety plan lists signs that a hard moment is coming, what helps, who to contact, and your reasons for living. It helps most when you make it, or go over it, with a doctor or counselor.  
> Planning for a hard moment  
> Thank you for checking in.  
> You said you're feeling Okay today.  
> Here are a few small things you could try. They're ideas, not instructions, and none of them is a treatment. Skip any that don't fit.  
> FOR YOUR MIND  
> Notice one thing that went okay today, however small.  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOUR CONNECTION  
> Send a short message to someone you feel comfortable with. It can be as simple as "thinking of you."  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOURSELF  
> Revisit something you used to enjoy, even for ten minutes.  
> Try something else  
> Not today  
> I'd like to try this  
> For your age  
> A safety plan is a short list for hard moments: signs that one is coming, things that help you cope, people and places to go to, professionals to call, and your reasons for living. It helps most when you make or review it with a doctor or counselor.  
> Talking to a doctor about how you've been feeling is a good place to start.  
> Ideas for your age group, from research summarized in the app's notes. Not a treatment, and not reviewed by a professional yet.  
> Share how I'm feeling  
> Change my answers  
> See every suggestion this page can show

### 20. Share with someone you choose

The notice shown before anything is shared.

Picture: `app/design/after-launch-pass/reviewer/20-share.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Today  
> Welcome. However today is going, you're welcome here. You can skip any question, go back, or stop at any time.  
> A plan for hard moments  
> A safety plan lists signs that a hard moment is coming, what helps, who to contact, and your reasons for living. It helps most when you make it, or go over it, with a doctor or counselor.  
> Planning for a hard moment  
> Thank you for checking in.  
> You said you're feeling Okay today.  
> Here are a few small things you could try. They're ideas, not instructions, and none of them is a treatment. Skip any that don't fit.  
> FOR YOUR MIND  
> Notice one thing that went okay today, however small.  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOUR CONNECTION  
> Send a short message to someone you feel comfortable with. It can be as simple as "thinking of you."  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOURSELF  
> Revisit something you used to enjoy, even for ten minutes.  
> Try something else  
> Not today  
> I'd like to try this  
> For your age  
> A safety plan is a short list for hard moments: signs that one is coming, things that help you cope, people and places to go to, professionals to call, and your reasons for living. It helps most when you make or review it with a doctor or counselor.  
> Talking to a doctor about how you've been feeling is a good place to start.  
> Ideas for your age group, from research summarized in the app's notes. Not a treatment, and not reviewed by a professional yet.  
> Share how I'm feeling  
> Change my answers  
> See every suggestion this page can show  
> Share with someone you choose  
> You choose who gets this and how, in the next step. It goes to them, stays in their messages or email, and can't be taken back.  
> The person may not see it for hours, so this isn't a way to get urgent help. If you need help now, call 988 or text 988. In immediate danger, call 911.  
> What will be shared. You can change it.  
> Start with "I wanted to share this with you."  
> Choose who to share with  
> Cancel

### 21. Journal

A private journal.

Picture: `app/design/after-launch-pass/reviewer/21-journal.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Journal  
> A private place to write freely. Use a prompt if it helps, or ignore them all.  
> Your entries are saved on this phone only, and are never read, analyzed, or sent anywhere unless you share one.  
> Optional prompts  
> What would you like to remember about today?  
> What's one thing you're carrying right now?  
> What helped, even a little?  
> What would you like to tell yourself?  
> Write anything you like  
> Mood tag, optional  
> Hopeful  
> Calm  
> Okay  
> Unsure  
> Overwhelmed  
> Sad  
> Anxious  
> Disconnected  
> Exhausted  
> Add to this visit's journal  
> Entries from this visit  
> No entries yet.

### 22. Rediscover

Prompts about things the person used to enjoy.

Picture: `app/design/after-launch-pass/reviewer/22-rediscover.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Finding your way back  
> Sometimes, when life gets difficult, we lose touch with the things that make us feel like ourselves. You don't need to rediscover everything at once. Even the smallest step matters.  
> What used to make you excited to wake up?  
> Keep this reflection  
> When was the last time you felt genuinely at peace?  
> Keep this reflection  
> What's something you've always wanted to try?  
> Keep this reflection  
> Who makes you feel understood?  
> Keep this reflection  
> What's one thing you appreciate about yourself?  
> Keep this reflection  
> What is something you would like to experience again?  
> Keep this reflection  
> Rediscover something  
> Choose anything you're drawn to, and get one low-pressure idea. None of them cost money.  
> Being outside  
> Music  
> Making things  
> Moving my body  
> Learning something  
> People I care about  
> Quiet time  
> Show me an idea  
> See every idea

### 23. Hope box

The Hope box: the person's own reasons, words, and photos.

Picture: `app/design/after-launch-pass/reviewer/23-hope.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Hope box  
> A place to keep what reminds you why you keep going: a photo, a few words from someone, a song, a reason. Add to it on better days, and open it on hard ones.  
> Everything here stays in this app, on this phone. It is never sent anywhere, and Share never includes it. Delete everything, in Your journey, empties it. Photos may not come back if you change phones, so keep the originals.  
> A hope box is not a way to get help. If you're thinking about suicide, call 988 or text 988 at any time. In immediate danger, call 911.  
> Add some words  
> What is it?  
> A reason I keep going  
> Something kind someone said to me  
> A song, a book, or a place that calms me  
> Something else  
> Write it here  
> Add to my hope box  
> Add a photo  
> Choose a photo of someone, somewhere, or something that matters to you. The app keeps its own smaller copy.  
> Choose a photo from this phone  
> In your hope box  
> Nothing yet. One small thing is enough to start.

### 24. Your journey

The person's history, sharing, and "Delete everything".

Picture: `app/design/after-launch-pass/reviewer/24-journey.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Your journey  
> A look back at what you've shared during this visit. There are no streaks or scores, and a day you didn't check in never counts against you.  
> What you've shared, saved on this phone. Nothing here is scored.  
> Check-ins this month  
> S  
> M  
> T  
> W  
> T  
> F  
> S  
> 1  
> 2  
> 3  
> 4  
> 5  
> 6  
> 7  
> 8  
> 9  
> 10  
> 11  
> 12  
> 13  
> 14  
> 15  
> 16  
> 17  
> 18  
> 19  
> 20  
> 21  
> 22  
> 23  
> 24  
> 25  
> 26  
> 27  
> 28  
> 29  
> 30  
> Today's check-ins  
> After school, 2:20 PM: feeling: Good.  
> After school, 2:21 PM: feeling: Okay.  
> You can share today's check-ins, or the last 7 days, with someone you choose: a parent or guardian, a doctor or therapist, or a friend. You'll see the words first and can change them. Nothing is shared unless you tap Share.  
> Share today's check-ins  
> Share the last 7 days  
> Reflections you kept  
> None yet. You can keep reflections from Finding your way back.  
> Things you'd like to try  
> None yet. Choose "I'd like to try this" on a suggestion or idea.  
> Things you've enjoyed  
> Add something you enjoyed  
> Add  
> Things I've learned about myself  
> Add something you've noticed about yourself  
> Add  
> Delete everything  
> Clears every answer, reflection, journal entry, and list on this page now, without waiting for you to close it.  
> In the app, this also deletes what's saved on this phone. A copy in an earlier iCloud or Google backup can last until the phone's next backup. Your places and your people from Places that are hard for me go too. Your name, your home spot, your streak, and your meditation history go too. Your age group, your settings, and your saved meditations stay, so you aren't asked again.  
> Delete everything on this page

### 25. Meditate

The third tab: a suggested session and four types.

Picture: `app/design/after-launch-pass/reviewer/25-meditate.png`

> Draft for review  
> Meditate  
> SUGGESTED FOR YOU  
> Silent  
> Silent and ready anywhere  
> Start  
> Silent · anywhere  
> 3 min  
> 5 min  
> Start  
> Options  
> 1-minute reset  
> 1 min  
> Start  
> Options  
> Deep session  
> 10 min  
> 15 min  
> 20 min  
> Start  
> Options  
> Sleep  
> 10 min  
> 20 min  
> Start  
> Options  
> YOUR PRESETS  
> Suggested  
> Bus ride  
> 5-min Just breathe · Ocean  
> Start  
> Keep  
> Suggested  
> Before bed  
> 15-min Sleep · Night sky  
> Start  
> Keep  
> Build your own  
> Length, breath, sound, world  
> History  
> 0 minutes in all

### 26. Build your own

Builds a custom session from length, feeling, and sound.

Picture: `app/design/after-launch-pass/reviewer/26-builder.png`

> Draft for review  
> Back  
> Build your own  
> 5 min  
> Right now I'm  
> Stressed  
> Focus  
> Energize  
> Sleepy  
> Just breathe  
> Sound  
> None  
> Rain  
> Ocean  
> White noise  
> Brown noise  
> World  
> Ocean  
> Forest  
> Night sky  
> Voice guide  
> Haptic breathing  
> Style  
> Calm  
> Straightforward  
> 5-min Just breathe · Ocean. Breathe in for 4, out for 6.  
> Start  
> Save preset

### 27. Meditation history

Past sessions.

Picture: `app/design/after-launch-pass/reviewer/27-history.png`

> Draft for review  
> Back  
> History  
> 0 minutes in all  
> No sessions yet.

### 28. Meditation player, session running

A session in progress. The crisis strip stays on screen above it.

Picture: `app/design/after-launch-pass/reviewer/28-player.png`

> Draft for review  
> Get Support Now  
> One minute  
> 1-minute reset, 1 min  
> 0:59 left  
> Tap for controls

### 29. Meditation player, "End session?" open

The question shown when a session is ended early.

Picture: `app/design/after-launch-pass/reviewer/29-player-end.png`

> Draft for review  
> Get Support Now  
> One minute  
> 1-minute reset, 1 min  
> 0:58 left  
> Tap for controls  
> End  
> Pause  
> End session?  
> End  
> Keep going

### 30. Meditation finished

The end of a session, with an optional "how do you feel now".

Picture: `app/design/after-launch-pass/reviewer/30-complete.png`

> Draft for review  
> Well done  
> 1 minute  
> 1 minutes in all  
> How do you feel now?  
> Very low  
> Low  
> Okay  
> Good  
> Great  
> Done  
> Save as favorite

### 31. Meditation finished, very low mood after

The end of a session after the person answers "Very low" or "Low".

Picture: `app/design/after-launch-pass/reviewer/31-complete-support.png`

> Draft for review  
> That sounds really hard.  
> You don't have to carry it alone. You can talk to someone right now.  
> Call 988  
> Text 988  
> In immediate danger, call 911  
> The 988 Suicide & Crisis Lifeline is free, confidential, and available any time. It is a separate service from Tidelight.  
> More ways to get support  
> How do you feel now?  
> Very low  
> Low  
> Okay  
> Good  
> Great  
> Done  
> Save as favorite

### 32. Location, Places off

The fourth tab, before "Places that are hard for me" is turned on.

Picture: `app/design/after-launch-pass/reviewer/32-location.png`

> Draft for review  
> Places  
> Home spot  
> No home spot saved.  
> Places that are hard for me  
> Some people have a place that's hard to be near. If you'd like, you can tell this phone about yours, so that when you've stayed there for a while, the phone can check in with you and, if you choose, let people you trust know where you are.  
> This is off until you turn it on. The app suggests no places: only you decide what counts as a hard place for you. Your places and your people stay on this phone, and Tidelight never receives them. You can turn this off or remove anything at any time, and nobody is told.  
> Turn this on  
> This works in the app on a phone. In a web browser you can look at it, but no place can be watched.

### 33. Location, Places turned on

The fourth tab with the feature turned on.

Picture: `app/design/after-launch-pass/reviewer/33-location-on.png`

> Draft for review  
> Places  
> Home spot  
> No home spot saved.  
> Places that are hard for me  
> Some people have a place that's hard to be near. If you'd like, you can tell this phone about yours, so that when you've stayed there for a while, the phone can check in with you and, if you choose, let people you trust know where you are.  
> This is off until you turn it on. The app suggests no places: only you decide what counts as a hard place for you. Your places and your people stay on this phone, and Tidelight never receives them. You can turn this off or remove anything at any time, and nobody is told.  
> Turn this on  
> This works in the app on a phone. In a web browser you can look at it, but no place can be watched.  
> Permission  
> For this to work with the app closed, the phone needs to allow Tidelight to use your location "always". The phone asks in two steps, first "while using the app", then "always", sometimes a few days later. Your location is only used to notice your own places, and it's never sent unless you choose to send it.  
> The phone allows location only while the app is open, so a closed app can't notice a place. To allow "always", open the phone's Settings, Tidelight, Location.  
> Your places  
> Learn more  
> No places yet. You don't have to add any.  
> Add a place  
> People you trust  
> Choose up to 5 people from your contacts. The app keeps their name and phone number on this phone only. They aren't told that you chose them, and nothing is sent to them unless you send it.  
> No one chosen yet. Without someone chosen, the phone can still check in with you, but there's nobody to send a message to.  
> Choose someone from my contacts  
> How long before the phone checks in with you  
> After staying at a place for  
> 10 minutes  
> 20 minutes  
> 30 minutes  
> 1 minute (test builds only)  
> Passing through a place does nothing. Only staying counts.  
> What the phone shows  
> When the time is up, the phone shows a notification from Tidelight. By default it says only "Your plan is here," so nothing private shows on the lock screen. Opening it shows how long you've been there, your people, 988 and 911, and the choices below.  
> Show the place's name and the time on the lock screen  
> Your message  
> If you choose to send it, this message goes to your people through the phone's own Messages app, with a map link to where you are. You see it first and tap Send yourself; the app can't send a text on its own. You can change the words now.  
> Your message  
> Good to know  
> Before you rely on this, try it once with someone you chose, so you both know what arrives.  
> It can't work when the phone is off, in airplane mode, out of battery, has location turned off, or is somewhere the phone can't tell where it is, like underground. It may take the phone a few minutes to notice a place, and places smaller than about 100 meters are unreliable.  
> The phone only notices your chosen places. It doesn't track where you go, and the app keeps no record of visits.  
> A message to your people isn't a way to get urgent help. They may not see it for a while. If you need help now, call 988 or text 988. In immediate danger, call 911.  
> On, but no place is added yet.

### 34. Place alert ("You've been at…")

What opens from the notification after the person has stayed at one of their places.

Picture: `app/design/after-launch-pass/reviewer/34-place-alert.png`

> Draft for review  
> Places  
> Home spot  
> No home spot saved.  
> Places that are hard for me  
> Some people have a place that's hard to be near. If you'd like, you can tell this phone about yours, so that when you've stayed there for a while, the phone can check in with you and, if you choose, let people you trust know where you are.  
> This is off until you turn it on. The app suggests no places: only you decide what counts as a hard place for you. Your places and your people stay on this phone, and Tidelight never receives them. You can turn this off or remove anything at any time, and nobody is told.  
> Turn this on  
> This works in the app on a phone. In a web browser you can look at it, but no place can be watched.  
> Permission  
> For this to work with the app closed, the phone needs to allow Tidelight to use your location "always". The phone asks in two steps, first "while using the app", then "always", sometimes a few days later. Your location is only used to notice your own places, and it's never sent unless you choose to send it.  
> The phone allows location only while the app is open, so a closed app can't notice a place. To allow "always", open the phone's Settings, Tidelight, Location.  
> Your places  
> Learn more  
> No places yet. You don't have to add any.  
> Add a place  
> People you trust  
> Choose up to 5 people from your contacts. The app keeps their name and phone number on this phone only. They aren't told that you chose them, and nothing is sent to them unless you send it.  
> No one chosen yet. Without someone chosen, the phone can still check in with you, but there's nobody to send a message to.  
> Choose someone from my contacts  
> How long before the phone checks in with you  
> After staying at a place for  
> 10 minutes  
> 20 minutes  
> 30 minutes  
> 1 minute (test builds only)  
> Passing through a place does nothing. Only staying counts.  
> What the phone shows  
> When the time is up, the phone shows a notification from Tidelight. By default it says only "Your plan is here," so nothing private shows on the lock screen. Opening it shows how long you've been there, your people, 988 and 911, and the choices below.  
> Show the place's name and the time on the lock screen  
> Your message  
> If you choose to send it, this message goes to your people through the phone's own Messages app, with a map link to where you are. You see it first and tap Send yourself; the app can't send a text on its own. You can change the words now.  
> Your message  
> Good to know  
> Before you rely on this, try it once with someone you chose, so you both know what arrives.  
> It can't work when the phone is off, in airplane mode, out of battery, has location turned off, or is somewhere the phone can't tell where it is, like underground. It may take the phone a few minutes to notice a place, and places smaller than about 100 meters are unreliable.  
> The phone only notices your chosen places. It doesn't track where you go, and the app keeps no record of visits.  
> A message to your people isn't a way to get urgent help. They may not see it for a while. If you need help now, call 988 or text 988. In immediate danger, call 911.  
> On, but no place is added yet.  
> You've been at A made-up place for 10 minutes  
> You haven't chosen anyone to send a message to, so nothing can be sent. You can choose people on the Location tab.  
> Send my message now  
> I'm okay  
> You can also call 988 or text 988 right now, any time. In immediate danger, call 911.

### 35. Friends

The fifth tab: My circle, and sharing check-ins.

Picture: `app/design/after-launch-pass/reviewer/35-friends.png`

> Draft for review  
> Friends  
> My circle  
> A few people you trust, such as a relative, a friend, a doctor, or a therapist. You decide who is in it, and each time you choose what they see. Everything else stays private.  
> There are no accounts. People in your circle don't need this app.  
> They see only what you send them, as a text message from you. Tidelight never sees it.  
> Nothing is sent by itself. Messages opens with your words filled in, and you tap Send.  
> Once it's sent, it stays on their phones and can't be taken back.  
> It isn't a way to get urgent help. People may not read it for hours. If you need help now, call 988 or text 988. In immediate danger, call 911.  
> People in my circle  
> No one yet.  
> Choose someone from my contacts  
> Learn more  
> What I've shared with my circle  
> A list for you, kept on this phone, of what you opened in Messages for your circle. The app can't tell whether you tapped Send.  
> Nothing shared yet.  
> Share check-ins  
> Today or 7 days, in Your journey

### 36. Quick check-in, support after a very low mood

What a quick check-in shows at once after "Very low" or "Low", instead of the thanks line.

Picture: `app/design/after-launch-pass/reviewer/36-flow-support.png`

> Draft for review  
> Back  
> That sounds really hard.  
> You don't have to carry it alone. You can talk to someone right now.  
> Call 988  
> Text 988  
> In immediate danger, call 911  
> The 988 Suicide & Crisis Lifeline is free, confidential, and available any time. It is a separate service from Tidelight.  
> Your check-in is saved on this phone. Nobody at Tidelight sees it, so it isn't a way to ask for help.  
> More ways to get support  
> Back to Home

### 37. Daily check-in, result after a heavy feeling

The Daily check-in's result after choosing a heavy feeling (here, Sad).

Picture: `app/design/after-launch-pass/reviewer/37-daily-result-heavy.png`

> Back  
> Today  
> Rediscover  
> Journal  
> Hope box  
> Your journey  
> Support  
> Today  
> Welcome. However today is going, you're welcome here. You can skip any question, go back, or stop at any time.  
> A plan for hard moments  
> A safety plan lists signs that a hard moment is coming, what helps, who to contact, and your reasons for living. It helps most when you make it, or go over it, with a doctor or counselor.  
> Planning for a hard moment  
> Thank you for checking in.  
> You said you're feeling Sad today.  
> Here are a few small things you could try. They're ideas, not instructions, and none of them is a treatment. Skip any that don't fit.  
> That sounds heavy. You don't have to carry it alone. You can call 988 or text 988 right now, any time. In immediate danger, call 911.  
> More ways to get support  
> FOR YOUR MIND  
> Write down one thing that's on your mind. You don't have to solve it.  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOUR CONNECTION  
> Send a short message to someone you feel comfortable with. It can be as simple as "thinking of you."  
> Try something else  
> Not today  
> I'd like to try this  
> FOR YOURSELF  
> Listen to a song that has meant something to you.  
> Try something else  
> Not today  
> I'd like to try this  
> For your age  
> A safety plan is a short list for hard moments: signs that one is coming, things that help you cope, people and places to go to, professionals to call, and your reasons for living. It helps most when you make or review it with a doctor or counselor.  
> Talking to a doctor about how you've been feeling is a good place to start.  
> Ideas for your age group, from research summarized in the app's notes. Not a treatment, and not reviewed by a professional yet.  
> Share how I'm feeling  
> Change my answers  
> See every suggestion this page can show

<!-- WALKTHROUGH:END -->

## Open questions, by priority

Every open question about the app from [[CONTENT-REVIEW]], gathered and numbered. "Today" is what
the app does now. Nothing was changed while waiting for you.

### A. Crisis and safety

| # | Question | Where | Today | Options |
| --- | --- | --- | --- | --- |
| A1 | Which check-in answers should bring up support at once? | Quick check-in; Daily check-in | Moods 1 and 2 of 5 ("Very low", "Low"), and the feelings Overwhelmed, Sad, Anxious, Disconnected, Exhausted | Keep; only mood 1; a different list of feelings; add an explicit option such as "I'm thinking about suicide" |
| A2 | Are the support words right? | Screen 36 | "That sounds really hard. You don't have to carry it alone. You can talk to someone right now." with Call 988, Text 988, Call 911, "More ways to get support" | Keep; reword. Could it feel like an alarm to someone who is often at "Low"? |
| A3 | Are the words after a heavy feeling right? | Screen 37 | "That sounds heavy. You don't have to carry it alone." with 988 and 911 above the results | Keep; reword |
| A4 | Should the app ask people to type about what's difficult? | Daily check-in, after screen 17 | Three optional writing questions, each skippable. Nothing typed is read or used | Keep; shorten; remove writing for people who chose a heavy feeling |
| A5 | Are any of the 30 suggestions and ideas unsafe for someone in distress, such as time alone? | Daily check-in result, "See every suggestion" | General well-being ideas chosen from the feeling and needs, never from what was typed | Keep; remove named ones |
| A6 | A Sleep meditation ends in darkness and silence. Is that right for someone alone at night? | Meditation player, Sleep | It dims and stays dark; the crisis strip stays lit | Keep; end with a quiet closing screen |
| A7 | Could any meditation line read badly to someone thinking about suicide? | Meditation scripts, for example "There is nothing left to do today." and "Let go" | Shown and spoken as written; "you can stop at any time" is said at the start | Keep; change named lines; add a line about what to do if distress rises |
| A8 | During a meditation the crisis strip and a "Get Support Now" button are on screen; the rest of the safety frame is below. Enough? | Screen 28 | Strip, Quick exit, and Get Support Now on screen; Support below the stage | Keep; add Call 988 to the player itself |
| A9 | The place alert's notification has "Call 988" and "Call 911" buttons when long-pressed, including on a lock screen. A founder's rule says notifications never mention crisis | Place alert notification | Four buttons: "I'm okay", "Send my message", "Call 988", "Call 911" | Keep; show only when unlocked; remove |
| A10 | After Quick exit, what should the app show when it is opened again? | Every screen | The screen the person left | Keep; always return to Home, so a journal entry isn't the first thing a bystander sees |
| A11 | At the phone's three largest text sizes the crisis strip takes half the screen or more | Every screen | Strip unchanged; at the very largest, in Spanish, it must be scrolled to reach 911 | Keep; use the strip's short form ("Call 988 · Text 988 · Call 911") at those sizes |
| A12 | Crisis links inside sentences are text-sized and close together | Hope box, My circle, Places, share notice, place alert, age question | About 19 points tall; the full-size strip is also on each screen | Keep; make them buttons or separate lines |
| A13 | The place alert: is "You set this up for yourself" right, and should the message open by itself after 30 seconds? | Screen 34 | Countdown, then Messages opens with the message filled in; the person taps Send. "I'm okay" cancels | Keep; always wait for a tap; change the wait times (10, 20, 30 minutes) |
| A14 | The default message to chosen people | Places, "Your message" | "I'm having a hard time right now and I'd like you to call me. I set this up in Tidelight to send when I stay at a place that's hard for me. Here's where I am:" | Keep; reword; add what the receiver should do |

### B. Streaks and rewards

| # | Question | Where | Today | Options |
| --- | --- | --- | --- | --- |
| B1 | Is any streak safe for someone in a low period? | Home; Your streak | Counts days in a row with check-ins; "freezes" cover a missed day; can be turned off in Settings; never shown on a day with a very low check-in or near support | Keep; start turned off; remove |
| B2 | When a streak ends | Home, next visit | A card: "New wave, new start 🌊 Your best is still {best} days." Missed days are "rest days" | Keep; reword; say nothing |
| B3 | Milestones at 3, 7, 14, 30, 50, 100, 200, 365 days | Home | "{days} days. One wave at a time 🌊", with no animation | Keep; fewer; remove |
| B4 | A new person sees "0 day streak" | Home | Shown | Keep; hide until the first day |
| B5 | How an ordinary check-in ends | Screen 16 | A horizon at dawn, the thanks line, "Breathe for a minute", "Back to home". After a very low mood: none of it | Keep; plainer. Is a dawn a kind of reward? |
| B6 | A later check-in on a day that had a very low one | Quick check-in | Thanks line and two choices, no dawn; the thin progress light still shows | Keep; remove the progress light that day too |
| B7 | "Logged. Nice." after an ordinary check-in, in the Straightforward style | Screen 16 | Shown; never after a very low mood | Keep; reword |

### C. Privacy wording (a lawyer is asked too: [[LEGAL-PACKET]])

| # | Question | Where | Today | Options |
| --- | --- | --- | --- | --- |
| C1 | Is the privacy notice plain and accurate, and does "it isn't a way to ask for help" land? | Every check-in screen | "In this app, what you choose and write is saved on this phone only… Nobody at Tidelight sees what you write, so it isn't a way to ask for help. In a crisis, call or text 988, or call 911." | Keep; reword |
| C2 | The notice before sharing | Screen 20 | "It goes to them, stays in their messages or email, and can't be taken back… this isn't a way to get urgent help." | Keep; reword |
| C3 | Two how-to paragraphs fold under "Learn more"; everything about privacy and consent stays in view. Is either one something a person needs before deciding? | Location; Friends | Folded: "Add a place by choosing it on a map… Give it a name only you need to understand…" and "To share something, tap Share…" | Keep; show "Give it a name only you need to understand" always |
| C4 | What should the app say about shared or school devices, for minors who journal? | Journal | "Anyone who can unlock this phone can open the app. Quick exit leaves fast." | Keep; add a line |
| C5 | Asking for a first name | Onboarding | "What should we call you?" Optional; kept on the phone | Keep; remove; change for children |
| C6 | Is the lock-screen wording safe? | Reminders; place alert | "A moment to check in, if you'd like." / "Time for your check-in." / "Tidelight. Your plan is here." | Keep; reword |

### D. Everything else

| # | Question | Where | Today | Options |
| --- | --- | --- | --- | --- |
| D1 | Is a five-point mood pick appropriate, and are the words right? | Quick check-in | Very low, Low, Okay, Good, Great. Stored 1 to 5; never charted or scored | Keep; reword; fewer points |
| D2 | Mood is shown as a colored square beside its word. Could the darker tones read as a judgment? | Quick check-in | Slate blue to light blue; no red, no green-for-good | Keep; no color |
| D3 | The nine feelings and the needs list: anything missing or hurtful? | Daily check-in | Hopeful, Calm, Okay, Unsure, Overwhelmed, Sad, Anxious, Disconnected, Exhausted | Keep; add; reword |
| D4 | The feelings sit two across. Does "Overwhelmed" beside "Sad" read differently from a list? | Daily check-in | Tiles, two columns | Keep; one column |
| D5 | The six tags | Quick check-in | Tired, Stressed, Happy, Focused, Anxious, Grateful | Keep; change |
| D6 | The two styles | Onboarding; Settings | Calm: "Take a moment… how are you feeling right now?" Straightforward: "How are you?" | Keep; one style |
| D7 | Does the "wellness app" feel fit a suicide prevention app, or make it look like care it isn't? | Whole app | Calm look; "Draft for review" on every new screen; 988 on every screen | Keep; plainer |
| D8 | Is asking a date of birth before the first check-in right? What should a child under 13 see? | Screen 2 | Asked once; only the age group is kept; "You don't need to answer this to get help." | Keep; ask later; don't ask |
| D9 | Could "Please enter your real date of birth. It matters." pressure a child to lie or give up? | Age question | Shown | Keep; soften |
| D10 | Are the five "For your age" cards and the five "top of Today" boxes safe and accurate? | Daily check-in | One per age group; the teen card says to make a plan with a trusted adult, not alone | Keep; change named cards |
| D11 | Is "Friends" the right name for a tab of people who may be a parent or a therapist? | Tab bar | "Friends", holding "My circle" | Keep; "My people"; "My circle" |
| D12 | What should people in a circle be told to do if a shared entry worries them? | My circle | Nothing is said to them; the message says "If you're worried about me, please call me." | Keep; add guidance in the message |
| D13 | Minors and their circle: who may be in it, and should a guardian be suggested or only allowed? | My circle | Child: "Ask a grown-up you trust to help you choose…" Teen: "It doesn't have to be a parent." | Keep; change |
| D14 | Reminders: up to five a day, fading out after two weeks unopened | Settings | Off until turned on | Keep; fewer; something other than fading out |
| D15 | Should the app suggest no places, as now? | Places | "The app suggests no places: only you decide what counts as a hard place for you." | Keep; a founder first asked for a built-in list |
| D16 | Your journey has no scores. Could an empty month still feel like failure? | Your journey | A calendar of marks | Keep; hide empty months |
| D17 | Sixteen emoji that stood alone became small line icons. Was any meaning lost? | Style, meditation, and streak cards | Words unchanged | Keep; restore named ones |
| D18 | "1 minutes in all" | After a one-minute meditation | Shown as written | Change to "1 minute in all"? |
| D19 | The tab bar shows icons without words at the largest text on a small phone | Tab bar | House, heart, lotus, pin, two people; names kept for screen readers | Keep; always show words |
| D20 | The crisis strip changed color, not content. Does it read as quieter than before? | Every screen | Dark ink on paper, or the reverse; contrast at least 7 to 1 | Keep; stronger |
| D21 | The English 988 panel ends with a link to 988lifeline.org; the Spanish one with a link to 988's Spanish chat | Support | Different on purpose or by accident | Make them match? |

### E. For a fluent Spanish reader

A separate person, or you if you read Spanish. The Spanish is an AI translation throughout.

| # | Question | Where |
| --- | --- | --- |
| E1 | "Low" is "Mal" (bad) and "Very low" is "Muy mal". Is there a less judging pair? | Quick check-in |
| E2 | A streak "freeze" is "congelador" (the appliance). Better: "pausa"? | Home; Your streak |
| E3 | "1 días seguidos" when the count is 1 | Home |
| E4 | Feelings and tags are nouns ("Cansancio", "Estrés") to avoid gendered endings. Natural on a button? | Check-ins |
| E5 | "Ahora mismo siento" followed by "Solo respirar" | Build your own |
| E6 | Spanish 988 wording follows 988's own instructions ("Llamar al 988 y marcar 2", "Enviar AYUDA al 988"). Please confirm against 988's current Spanish pages | Every screen |

## What this packet doesn't cover

- The website's pages: `notes/review-packet/` and [[CONTENT-REVIEW]].
- Legal questions: [[LEGAL-PACKET]].
- Whether the app works on a real phone. It has only run in a simulator.
