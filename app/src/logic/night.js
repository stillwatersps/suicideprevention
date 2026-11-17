// "Darker at night": whether a moment falls between the time the person goes to bed and the time
// they wake up. Both come from Settings, as "HH:MM". Pure rules, no browser and no phone.

// Minutes since midnight for "HH:MM", or null if it isn't a time.
export function minutesOf(time) {
  const m = typeof time === 'string' ? time.match(/^(\d{1,2}):(\d{2})$/) : null;
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

// True from bed time up to, and not including, wake time. The night usually crosses midnight
// (22:00 to 07:00); it may also not (01:00 to 09:00). The same time for both, or a time that
// can't be read, is never night: the app then follows the phone, as it always did.
export function isNight(now, bedTime, wakeTime) {
  const bed = minutesOf(bedTime);
  const wake = minutesOf(wakeTime);
  if (bed === null || wake === null || bed === wake || !(now instanceof Date) || isNaN(now)) return false;
  const at = now.getHours() * 60 + now.getMinutes();
  return bed < wake ? at >= bed && at < wake : at >= bed || at < wake;
}

// When the night that `now` is in ends: the next time the clock reads the wake time. For pages
// that can't read the settings (the website's pages inside the app), which are told only this.
export function nightEnd(now, wakeTime) {
  const wake = minutesOf(wakeTime);
  if (wake === null || !(now instanceof Date) || isNaN(now)) return null;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(wake / 60), wake % 60, 0, 0);
  if (end <= now) end.setDate(end.getDate() + 1);
  return end;
}
