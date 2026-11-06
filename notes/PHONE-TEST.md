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
| Crisis strip | It stays at the top as you scroll |
| Call 988 | The phone offers to call 988. **Cancel** |
| Text 988 | Messages opens to 988 with no message filled in. **Cancel** |
| Call 911 | The phone offers to call 911. **Cancel** |
| Chat Online | The 988 chat page opens. Don't submit its form |
| Menu | It opens, closes, and every link works |
| Leer en español | The same page opens in Spanish, and "Read in English" comes back |
| Show more, and each feeling on Not Sure | They open and close |
| Save 988 to your contacts | A contact card opens. You can save it or cancel. Delete it after testing if you saved it |
| Quick exit | weather.gov opens. Back doesn't return to the page you left, though it can reach pages you opened before it |
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

## Writing down results

Add results to a new note in `worklogs/`, with the phone model, the iOS or Android version, and
what you tried. Then tick the matching lines in the "Human-only checklist" in [[CONTENT-REVIEW]].
Don't write that something was tested on a phone unless it was.
