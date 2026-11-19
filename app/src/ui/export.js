// "Make a copy of my data": gathers what the app keeps on this phone into one text file and hands
// it to the phone's share sheet, where the person chooses where it goes. Only when they tap the
// button. Tidelight receives nothing and keeps no record of it. Photos stay in the Hope box.
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Tidelight } from '../native.js';
import { store } from '../core/device-storage.js';
import { KEYS } from '../core/storage.js';
import { buildExport, oneLine, listOf } from '../logic/export.js';
import { PARTS, planLines } from '../logic/plan.js';
import { courseLines } from '../logic/course.js';
import { letterLines } from '../logic/letter.js';
import { goodLines } from '../logic/good.js';
import { sayDay } from './good.js';
import { t, lang } from './words.js';
import { state } from './state.js';
import { sayWhen } from './once.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const heading = (sel) => { const node = $(sel); return node ? node.textContent.trim() : ''; };
const when = (value) => {
  const date = new Date(value);
  if (isNaN(date)) return '';
  try { return date.toLocaleString(lang(), { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return date.toISOString(); }
};
async function stored(key) {
  try { return JSON.parse((await store.getRaw(key)) || 'null'); } catch (e) { return null; }
}

// Exported for the tests: the text of the file, from what is kept right now.
export async function exportText(ctx) {
  const page = ctx.api.getState();
  const sections = [];

  const checkins = [];
  let lastDay = null;
  ctx.logLines().forEach((entry) => {
    if (entry.day !== lastDay) { checkins.push(entry.day); lastDay = entry.day; }
    checkins.push('- ' + oneLine(entry.line));
  });
  sections.push({ heading: t('export.checkins'), lines: checkins });

  sections.push({
    heading: heading('#ci-journal-title'),
    lines: listOf(page.entries, (entry) => typeof entry.text === 'string').map((entry) => [
      [when(entry.date), oneLine(entry.mood)].filter(Boolean).join(' · '), oneLine(entry.prompt), String(entry.text).trim(),
    ].filter(Boolean).join('\n')),
  });

  const reflections = page.reflections && typeof page.reflections === 'object' ? Object.values(page.reflections) : [];
  sections.push({ heading: heading('#ci-kept-reflections-title'), lines: listOf(reflections).map((r) => '- ' + oneLine(r.question) + ' ' + oneLine(r.answer)) });
  [['explore', '#ci-explore-title'], ['enjoyed', '#ci-enjoyed-title'], ['learned', '#ci-learned-title']].forEach(([name, title]) => {
    sections.push({ heading: heading(title), lines: (Array.isArray(page[name]) ? page[name] : []).map((text) => '- ' + oneLine(text)) });
  });

  const hope = listOf(await stored(KEYS.hope), (word) => typeof word.text === 'string').map((word) => '- ' + oneLine(word.text));
  const photos = document.querySelectorAll('#app-hope .app-hope-photos img').length;
  if (photos) hope.push(t('export.photos', { count: photos }));
  sections.push({ heading: heading('#app-hope-title'), lines: hope });

  const plan = planLines(state.plan, Object.fromEntries(PARTS.map((part) => [part, heading('#tl-plan-' + part + '-title')])));
  sections.push({ heading: t('plan.title'), lines: plan });
  sections.push({ heading: t('visit.title'), lines: state.visit.notes.map((note) => '- ' + oneLine(note)).concat(state.visit.at ? [t('visit.when', { when: sayWhen(state.visit.at) })] : []) });
  sections.push({ heading: t('follow.title'), lines: state.follow.at || state.follow.who ? [t('follow.export', { who: oneLine(state.follow.who) || '-', when: state.follow.at ? sayWhen(state.follow.at) : '-' })] : [] });
  sections.push({ heading: t('toolkit.title'), lines: state.toolkit.pinned.map((id) => '- ' + t('tool.' + id)) });
  sections.push({ heading: t('course.title'), lines: courseLines(state.course, Array.from(document.querySelectorAll('#tl-course [data-course-step] h3')).map((h) => h.textContent.trim())) });
  sections.push({ heading: t('letter.title'), lines: letterLines(state.letter) });
  sections.push({ heading: t('good.title'), lines: goodLines(state.good, sayDay) });
  sections.push({ heading: t('reach.title'), lines: state.reach && state.reach.message ? state.reach.message.split('\n') : [] });

  const circle = (await stored(KEYS.circle)) || {};
  const person = (p) => '- ' + [oneLine(p.name), oneLine(p.phone)].filter(Boolean).join(', ');
  sections.push({ heading: heading('#app-circle-title'), lines: listOf(circle.people).map(person) });
  sections.push({ heading: heading('#app-circle-log-title'), lines: listOf(circle.log).map((entry) => '- ' + [when(entry.when), oneLine(entry.preview)].filter(Boolean).join(': ')) });

  const places = (await stored(KEYS.places)) || {};
  const placeLines = listOf(places.places).map((place) => '- ' + oneLine(place.name) + ' (' + [place.latitude, place.longitude].map((n) => oneLine(n)).join(', ') + ')');
  const contacts = listOf(places.contacts).map(person);
  if (contacts.length) placeLines.push(t('export.people'), ...contacts);
  if (placeLines.length && places.message) placeLines.push(t('export.message', { message: oneLine(places.message) }));
  sections.push({ heading: heading('#app-places-title'), lines: placeLines });

  sections.push({
    heading: t('export.meditations'),
    lines: listOf(state.sessions).map((s) => {
      const name = t('med.' + s.type) || oneLine(s.name) || oneLine(s.type);
      const minutes = Math.max(1, Math.round((Number(s.completedSeconds) || 0) / 60));
      return '- ' + when(s.startedAt) + ': ' + t(s.completed ? 'history.item' : 'history.partial', { name, minutes });
    }),
  });

  const me = [];
  if (state.profile.name) me.push(t('export.name', { name: oneLine(state.profile.name) }));
  if (typeof state.settings.reminderWords === 'string' && state.settings.reminderWords.trim()) me.push(t('export.reminderWords', { words: oneLine(state.settings.reminderWords) }));
  const group = ctx.getGroup && ctx.getGroup();
  const groupName = group && $('.app-group-names [data-age-group="' + group + '"]');
  if (groupName) me.push(t('export.age', { group: groupName.textContent.trim() }));
  if (state.home && typeof state.home === 'object') me.push(t('export.home', { latitude: oneLine(state.home.latitude), longitude: oneLine(state.home.longitude) }));
  sections.push({ heading: t('export.settings'), lines: me });

  return buildExport({ title: t('export.title'), made: t('export.made', { date: when(new Date()) }), note: t('export.note'), none: t('export.none'), sections });
}

// Hands the file to the phone's share sheet. 'done' when the person sent or saved it there,
// 'cancelled' when they closed the sheet. Anything that goes wrong is thrown.
export async function handFile(name, text) {
  let result = null;
  try { result = await Tidelight.shareFile({ name, text }); } catch (e) { devLog('share file', e); result = { unavailable: true }; }
  if (result && !result.unavailable) return result.completed === false ? 'cancelled' : 'done';
  // A phone without the app's own file sharing: the words go to the share sheet as text.
  if (Capacitor.isNativePlatform()) {
    try { await Share.share({ title: name, text }); return 'done'; } catch (e) { return 'cancelled'; }
  }
  // A desktop browser, where the app is only tried out: the file is saved to this computer.
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'done';
}

export function initExport(ctx) {
  const button = $('#tl-set-export');
  const note = $('#tl-set-export-note');
  if (!button) return;
  button.addEventListener('click', async () => {
    note.hidden = true;
    let outcome = 'failed';
    try { outcome = await handFile(t('export.fileName'), await exportText(ctx)); } catch (e) { devLog('export', e); }
    if (outcome === 'cancelled') return; // the sheet was closed: nothing happened, so nothing to say
    note.textContent = t(outcome === 'done' ? 'export.done' : 'export.failed');
    note.hidden = false;
  });
}
