// One reminder at a time the person picks, shown by the phone itself with fixed, discreet words
// ("A reminder you set."). Used by "A reminder to check in on someone".
import { t, lang } from './words.js';
import { notificationPermission, requestNotificationPermission, setNotifications } from './device.js';

export const onceWords = () => ({ title: t('rem.title'), body: t('once.body') });
export function sayWhen(iso) {
  const date = new Date(iso);
  try { return date.toLocaleString(lang(), { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return date.toISOString(); }
}
// Sets the phone's reminder `id` for `date`, asking the phone's permission if it hasn't been
// asked. Returns 'set' or 'denied'.
export async function setOnce(id, date) {
  let permission = await notificationPermission();
  if (permission !== 'granted' && permission !== 'denied') permission = await requestNotificationPermission();
  if (permission !== 'granted') { await setNotifications([], [id]); return 'denied'; }
  const words = onceWords();
  await setNotifications([{ id, at: date, title: words.title, body: words.body }], [id]);
  return 'set';
}
export const cancelOnce = (id) => setNotifications([], [id]);
