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

Open that address in Safari on an iPhone, or Chrome on an Android phone. Then check:

| Check | What should happen |
| --- | --- |
| Crisis strip | It stays at the top as you scroll, with Quick exit inside it. Call 988, Text 988, and Call 911 are easy to tap without hitting each other |
| Call 988 | The phone offers to call 988. **Cancel** |
| Text 988 | Messages opens to 988 with no message filled in. **Cancel** |
| Call 911 | The phone offers to call 911. **Cancel** |
| Chat Online | The 988 chat page opens. Don't submit its form |
| Menu | It opens, closes, and every link works |
| Leer en español | The same page opens in Spanish, and "Read in English" comes back |
| Show more, and each feeling on Not Sure | They open and close |
| Save 988 to your contacts | A contact card opens, or a file downloads that you can open. You can save it or cancel. Note what your phone does. Delete the contact and the file after testing |
| Quick exit | The page goes blank and weather.gov opens. Back doesn't return to the page you left, unless you used a link within that page, such as "On this page". Back can reach pages you opened before it |
| Wallet card, Print | The print screen shows the poster and cards. Cancel |
| Portrait and landscape | Nothing is cut off or overlapping |
| Larger text | In Safari, use the **aA** button to make the text larger, and check nothing breaks |
| VoiceOver or TalkBack | The page reads in a sensible order, and every button has a name |
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
| Add to Home Screen | The icon and name appear, and the site opens with no address bar. Note that the icon stays on the phone until you remove it |
| Quick exit from the Home Screen app | Note where weather.gov opens. Go back to the app and check the page isn't left blank. Back may not exist here, so write down what remains |

## Writing down results

Add results to a new note in `worklogs/`, with the phone model, the iOS or Android version, and
what you tried. Then tick the matching lines in the "Human-only checklist" in [[CONTENT-REVIEW]].
Don't write that something was tested on a phone unless it was.

## What each kind of test can and can't show

Keep these results apart when writing them down.

| Kind | Command or place | Can show | Can't show |
| --- | --- | --- | --- |
| Desktop Chrome, and its phone-size emulation | `python3 tools/test_browser.py` | Layout, keyboard, offline, links, print | Safari, real touch, real screen readers |
| WebKit on a Mac, in a phone-size window | `python3 tools/test_webkit.py` | Layout and main behaviors in the engine family Safari uses | iOS itself, touch, Safari's toolbars, offline, call links |
| iOS Simulator | Safari in Xcode's Simulator | iOS Safari's layout and toolbars, offline on `localhost`, the contact card screen | A real call or text, real touch, VoiceOver as a person uses it |
| A real phone | This page | Everything above, plus touch, call and text screens, VoiceOver and TalkBack | Whether the content is right, which needs the reviewers |
