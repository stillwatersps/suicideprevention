---
aliases: [Phone test, iPhone test]
status: for both founders
---

# Testing on a real phone

[[00 START HERE|Back to Start Here]]

This shows how to open the draft website on your own phone before it is published. It
stays on your own Wi-Fi and doesn't touch the public site.

> [!warning] Never complete a call or text to a crisis line
> These are real services for people in crisis. When you test a call or text link, tap it,
> check the screen that opens, and **cancel**. See rule 7 in [[SAFETY]].

## Start the preview

1. In GitHub Desktop, switch to the branch that has the work. [[STATUS]] names it. If another
   folder on your computer already has that branch open, run the next step in that folder.
2. In Terminal, in the project folder, run:

   ```bash
   python3 tools/preview_server.py --lan
   ```

3. It prints an address like `http://192.168.1.20:8000/suicideprevention/`. Your computer and
   phone must be on the same Wi-Fi. If macOS asks whether to allow incoming connections, choose
   **Allow**. If the phone can't connect, a VPN on either device may be blocking local traffic,
   so pause it while you test. Press Control-C to stop.

## Test on the phone

Open that address in Safari on an iPhone, or Chrome on an Android phone. If you can, also try Chrome on an iPhone and Samsung Internet on Android. Then check:

| Check | What should happen |
| --- | --- |
| Crisis strip | It stays at the top as you scroll, with Quick exit inside it. Call 988, Text 988, and Call 911 are easy to tap without hitting each other |
| Call 988 | The phone offers to call 988. **Cancel** |
| Text 988 | Messages opens to 988 with no message filled in. **Cancel** |
| Call 911 | The phone offers to call 911. **Cancel** |
| Other call and text links | On Get Help, For Teens, and After a loss, each one offers the number its label shows. **Cancel** every time |
| Chat Online | The 988 chat page opens. Don't submit its form |
| Menu | It opens, closes, and every link works |
| Leer en español | The same page opens in Spanish, and "Read in English" comes back |
| Show more, and each feeling on Not Sure | They open and close |
| Save 988 to your contacts | On an iPhone, a contact card opens. Scroll to the bottom and tap Create New Contact, then **Cancel**. Also check that the check mark at the top closes the card without saving. On Android, a file may download instead. Open it and note what happens. Delete any contact or file you saved |
| Quick exit | The page goes blank and weather.gov opens. Back doesn't return to the page you left, unless you used a link within that page, such as "On this page". Back can reach pages you opened before it |
| Quick exit on a slow connection | Use a very poor connection, as in the Weak signal check below. Tap Quick exit, then switch to another app before weather.gov appears. Come back, and note whether the page you left shows again |
| Wallet card, Print | The print screen shows the poster and cards. Cancel |
| Chrome on an iPhone | Open Get Help and Research in Chrome, not Safari. Scroll down slowly, then quickly. The crisis strip stays at the top. If it scrolls away, write down the iOS and Chrome versions |
| Safari's toolbar | Scroll until Safari's toolbar shrinks, then tap Quick exit once. One tap should leave. Try each tab layout in Settings, Apps, Safari. With the phone on its side, tap the strip's links too, then **cancel** |
| Largest text | Set Safari's **aA** to 200% or more, or Chrome's text scaling on Android to 200%. Quick exit may move to the bottom corner. If it does, tap it once and check it leaves. On Android, check the phone's bottom bar doesn't cover it |
| Incognito on Android | In a Chrome Incognito tab, tap Call 988. Expect "Leave Incognito mode?". Choose Leave, check the dial screen shows 988, and **cancel**. Repeat with Text 988 |
| Opening from another app | Send the address to yourself in a chat or social app, such as Messages, WhatsApp, Instagram, or Gmail, and open it there. Tap Call 988 and Text 988, then **cancel**. Note any app where nothing happens or an error page replaces the site |
| Portrait and landscape | Nothing is cut off or overlapping |
| Larger text | In Safari, use the **aA** button to make the text larger, and check nothing breaks |
| VoiceOver or TalkBack | The page reads in a sensible order, and every button has a name |
| VoiceOver: list labels | On Get Help, VoiceOver says "Reach the 988 Suicide and Crisis Lifeline" before the three buttons. If it doesn't, write that down |
| VoiceOver or TalkBack: numbers | Note whether 988, 911, 838255, and 741741 are read as digits or as large numbers. Stop at the dial or compose screen |
| VoiceOver or TalkBack: languages | Spanish text on English pages uses a Spanish voice. START, PRIDE, and HOME on Spanish pages use an English voice |
| Quick exit, small Safari toolbar | Scroll until Safari's toolbar shrinks, then tap Quick exit once. Note whether one tap is enough |
| Dark mode | Turn it on in the phone's settings, and the site follows |

## Offline needs HTTPS

Offline copies, and "Add to Home Screen" as an app, only work over HTTPS or on `localhost`.
This preview uses plain HTTP on your Wi-Fi, so **offline can't be tested this way on a real
phone**. Everything else above can. Three ways to test offline:

- In the iOS Simulator, which treats `localhost` as secure. This needs Xcode.
- On a real phone, once the site is published with HTTPS.
- On a real phone before that, with a temporary HTTPS tunnel, such as Cloudflare's
  `cloudflared tunnel --url http://localhost:8000`. It needs installing, and while it runs
  anyone with the address can open the draft site, so decide together before using it.

To test offline: open the site once, wait a few seconds, then turn on Airplane Mode and open
other pages. Call and text buttons still open the phone's apps, but need service to connect.

Once a test address has HTTPS, also check:

| Check | What should happen |
| --- | --- |
| Weak signal | After a first visit, use a very poor connection. On an iPhone with Developer Mode, that's Settings, Developer, Network Link Conditioner, Very Bad Network. A page you've seen shows its saved copy after about 3 seconds |
| VoiceOver or TalkBack: offline | Partway down a page, turn on Airplane Mode. Note whether the offline note is read out |
| Add to Home Screen | The icon and name appear, and the site opens with no address bar. Note that the icon stays on the phone until you remove it |
| Quick exit from the Home Screen app | Note where weather.gov opens. Go back to the app and check the page isn't left blank. Back may not exist here, so write down what remains |
| Home Screen app: Print and Save 988 | On the wallet card page, tap Print and note whether anything happens. Tap Save 988 and note what opens |
| Spanish Home Screen icon | Add the site to the Home Screen from a Spanish page. Note the name it shows and which page it opens |
| Install offer on Android | In Chrome, tap the page once, then stay on it for 30 seconds. Note whether Chrome offers to install the site, and what the offer covers |
| Save 988 again | Repeat the Save 988 check, since saved copies are active here |

## Writing down results

Add results to a new note in `worklogs/`, with "phone" in its file name so `tools/launch_gate.py`
finds it. Give the phone model, the iOS or Android version, and what you tried. Then tick the matching lines in the "Human-only checklist" in [[CONTENT-REVIEW]].
Don't write that something was tested on a phone unless it was.

## What each kind of test can and can't show

Keep these results apart when writing them down.

| Kind | Command or place | Can show | Can't show |
| --- | --- | --- | --- |
| Desktop Chrome, and its phone-size emulation | `python3 tools/test_browser.py` | Layout, keyboard, offline, links, print | Safari, real touch, real screen readers |
| WebKit on a Mac, in a phone-size window | `python3 tools/test_webkit.py` | Layout and main behaviors in the engine family Safari uses | iOS itself, touch, Safari's toolbars, offline, call links |
| iOS Simulator | Safari in Xcode's Simulator | iOS Safari's layout and toolbars, offline on `localhost`, the contact card screen | A real call or text, real touch, VoiceOver as a person uses it |
| A real phone | This page | Everything above, plus touch, call and text screens, VoiceOver and TalkBack | Whether the content is right, which needs the reviewers |
