---
aliases: [First version, First-version brief]
status: updated with both founders' November 9 decisions, waiting for both to agree it
---

# Tidelight's first version

[[00 START HERE|Back to Start Here]]

> [!warning] Not agreed yet
> Claude wrote this at one founder's request on November 7, 2026, and updated it on November 9 with
> the 14 decisions both founders agreed that day, as they asked. Both founders now read it and agree
> it, and record that in [[DECISIONS]]. No qualified person has reviewed the site. No fluent reader
> has checked the Spanish, and nothing has been tried on a real phone.

## Until review

The public link shows one crisis page, with 988 and 911 in English and Spanish: pull request 12,
once it is merged. Everything below stays off the public site until the licensed therapist and a
fluent Spanish reader have signed off in [[CONTENT-REVIEW]].

## What it is, and isn't

A phone-friendly information website for every age in the United States, and a phone app that
shows the same pages. The website asks no age. It points to real crisis services, mainly the 988
Suicide & Crisis Lifeline and 911.

- Not a crisis service. Nobody at Tidelight watches the site, and it can't take messages.
- No accounts, analytics, or cookies. The Daily check-in is the only place to type or choose, and
  the website saves none of it. GitHub, the web host, logs visitors' IP addresses.
- No AI chat or counseling, risk scores, or follow-up contact.
- No coping exercises, though Home mentions coping. See [[FOUNDER-BRIEF]].
- No recovery stories yet (idea D4 in [[IDEAS]]).

## Who it's for: the main journeys

**Someone in crisis right now**

1. Every English page starts with **Call 988**, **text 988**, and **call 911**. On phones this
   strip usually stays on screen.
2. Below it, Home's **You are not alone** section and every other page's
   **Need to talk to someone now?** box offer **Call 988**, **Text 988**, and **Chat Online**.
3. **Get Help**, **For Teens**, and **After a loss** also have a short **Right now** box near the
   top. **Not sure what you're feeling?** has one too, headed **If you're thinking about suicide**.

**Someone worried about another person**

1. **I'm worried about someone** opens **Help Someone**. First: in immediate danger, call 911. If
   you're worried about suicide, call or text 988.
2. Then warning signs, five steps, and what to say.

**A teen**

1. **For Teens**, in the menu, has **Right now** and **Save 988 to your contacts** near the top.
2. It says teens can call or text 988 themselves, who might be told, and what stays private.

**Someone who lost a person to suicide**

1. **I've lost someone to suicide** opens **After a loss**. Its **Right now** box offers 988, even
   just to talk.
2. Then "It's not your fault", feelings, support, and talking with children.

**Someone who survived a suicide attempt, or their family** (draft, added November 9, 2026)

1. **After a suicide attempt**, linked from Get Help, Help Someone, and every footer, starts with a
   **Right now** box: 988 if thoughts of suicide come back, 911 in immediate danger.
2. Then the days and weeks after, care and follow-up, talking with others, and a part for families.

**Someone planning ahead for a hard moment** (draft, added November 9, 2026)

1. **Make a safety plan**, linked from Get Help's "Planning for a hard moment", Help Someone, and every
   footer, explains the usual steps in plain words.
2. A blank plan prints on its own, with 988 and 911 on it, to fill in by hand. Nothing is typed or saved.

**A Spanish speaker**

1. **Leer en español** opens each page's Spanish twin. **Ayuda en español** opens Get Help's
   Spanish section.
2. On Spanish pages, the strip and buttons say to call 988 and press 2, or text AYUDA to 988. Many
   linked services are English only.

**Someone on a shared or watched device**

1. **Quick exit**, on every page, blanks the page and opens weather.gov.
2. It can't clear history, saved copies, contacts, or call logs. Back can still reach earlier
   pages. School or work devices may be watched, even in a private window.

**Someone with no signal**

1. After one visit on a secure connection, the browser may save every page. Copies can be out of
   date.
2. Calls and texts still need phone service. A contact saved earlier with
   **Save 988 to your contacts**, or a printed **Wallet card**, doesn't depend on saved pages.

**Someone Deaf or hard of hearing**

1. **Deaf or hard of hearing**, on every page, opens a Get Help section.
2. It covers ASL by videophone, text, chat, and TTY through a relay service or 711, then 988. No
   Deaf reviewer has read it.

**Someone checking in on a hard day**

1. **Daily check-in** asks how they feel and what they need, then suggests small steps. They can
   write in a journal. 988 and 911 stay on screen throughout.
2. On the website, nothing is kept when the page closes. In the app, it is kept on the phone.

## The pages

Each English page has a Spanish twin in `es/`, except Page not found. [[CONTENT-REVIEW]] says what
every control does.

- **Home**: crisis buttons and five cards.
- **Get Help**: 988, other services, and what to expect.
- **Help Someone**: warning signs and five steps.
- **For Teens**: reaching out, trusted adults, and privacy.
- **Not sure what you're feeling?**: five feelings, nothing to type.
- **After a loss**: support after a suicide loss.
- **After a suicide attempt**: a draft, added November 9, 2026, for people who survived and their families.
- **Make a safety plan**: a draft, added November 9, 2026: the usual steps and a blank plan to print.
- **Research**: myths and facts, and what studies show.
- **Wallet card**: printable poster and cards, not to hand out yet.
- **Daily check-in**: today's feeling, ideas, a journal, and support. Saves nothing.
- **About and privacy**: what Tidelight is, review status, and privacy.
- **Page not found**: crisis options and links.

## The look

Shoreline, paper and one tide blue, is on pull request 5's branch. Signage, a green help sign with
an amber Call 988 button, is pull request 11. Both founders choose after trying both on a real
phone. Neither changes any wording, link, or behavior.

## The phone app, a draft

Pull request 16. Both founders agreed to keep building it as a draft until the reviewer and a
lawyer have read it and it has run on real phones.

- It shows the website's pages, and keeps the Daily check-in on the phone. Nothing goes to Tidelight.
- It asks for date of birth once, keeps only the age group, and shapes help by age. 988, 911, and
  Quick exit never wait for it.
- Not offered to under-13s until a lawyer has advised on COPPA and the app stores' rules.
- **Share** sends one reflection to someone the person picks, after a notice.
- Not decided: whether saving reaches the person's own iCloud or Google account, or a Tidelight
  account, which needs a server. Idea E1, places that are hard for me, waits for the reviewer.

## Before launch

[[LAUNCH-CHECKLIST]] lists every step to launch, in order. [[FOUNDER-BRIEF]] lists what only the
founders can decide.
