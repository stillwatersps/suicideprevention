// "Care near me": a link that opens the phone's own maps at a search for emergency rooms. The
// app itself reads no location and learns nothing: the address is plain markup on the page, with
// nothing about the person in it. This only swaps in the form of address an Android phone opens
// in its maps app. A draft: no licensed reviewer has seen it.
import { Capacitor } from '@capacitor/core';

export function initNearby() {
  const link = document.getElementById('tl-nearby-er');
  if (!link) return;
  const android = link.getAttribute('data-android-href');
  if (android && Capacitor.getPlatform() === 'android') link.setAttribute('href', android);
}
