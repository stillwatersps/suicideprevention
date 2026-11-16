// "A summary for an appointment": a short page of the person's own records, to bring to a doctor,
// a therapist, or a counselor. Only what they tick goes on it, in the words they recorded.
//
// What this is not, on purpose: nothing is counted, averaged, scored, charted, or interpreted, and
// nothing is added that the person did not record or type. Pure: no browser and no phone in here,
// so Node can test it. A draft. No licensed reviewer has seen the idea or the page it makes.
import { buildExport } from './export.js';

// The items whose time falls on or after the first day that counts. Anything without a readable
// time is left out. `dateKey` turns a Date into the day it belongs to (local time).
export function sincePeriod(items, when, sinceKey, dateKey) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const date = new Date(when(item));
    return !isNaN(date) && dateKey(date) >= sinceKey;
  });
}

// How far back, from what the page says: one of the allowed lengths, or the first of them.
export function periodDays(value, allowed) {
  const days = Number(value);
  return allowed.includes(days) ? days : allowed[0];
}

// words: { title, made, note, none, ask, checkins, journal, plan }.
// choices: { checkins, journal, plan }, each true only when the person ticked it.
// checkins, journal, plan: the lines for each, already in the person's words.
// ask: what they typed to ask or say, or nothing.
// Returns { empty, text }. Empty means nothing was ticked and nothing typed: there is no page.
export function buildSummary({ words, choices, checkins, journal, plan, ask, maxAsk }) {
  const sections = [];
  const said = String(ask === null || ask === undefined ? '' : ask).trim().slice(0, maxAsk || 300);
  if (said) sections.push({ heading: words.ask, lines: [said] });
  if (choices && choices.checkins === true) sections.push({ heading: words.checkins, lines: checkins });
  if (choices && choices.journal === true) sections.push({ heading: words.journal, lines: journal });
  if (choices && choices.plan === true) sections.push({ heading: words.plan, lines: plan });
  if (!sections.length) return { empty: true, text: '' };
  return { empty: false, text: buildExport({ title: words.title, made: words.made, note: words.note, none: words.none, sections }) };
}
