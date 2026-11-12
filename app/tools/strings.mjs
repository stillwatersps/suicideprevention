// Every word the app shows or speaks, pulled out of the text sources in src/text/, so wording can
// be compared between two versions of the app and locked by a test.
//
//   node tools/strings.mjs diff <git-ref>       what changed since that version (words only)
//   node tools/strings.mjs snapshot <git-ref>   rewrite test/fixtures/reviewed-strings.json
//
// The snapshot is the wording a reviewer has seen or is waiting to see. Rewrite it ONLY after the
// reviewer has approved a wording change. test/unit/reviewed-strings.test.mjs fails on any
// difference between the snapshot and the text sources.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SNAPSHOT = join(appDir, 'test', 'fixtures', 'reviewed-strings.json');
const WORD_ATTRIBUTES = ['aria-label', 'alt', 'placeholder', 'title', 'data-words', 'data-label'];
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const tidy = (text) => text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m]).replace(/\s+/g, ' ').trim();

// The words in one HTML text source: the text between tags, and the attributes people hear or see.
export function stringsOfHtml(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '');
  const out = [];
  for (const piece of clean.split(/<[^>]*>/)) { const text = tidy(piece); if (text) out.push(text); }
  for (const tag of clean.match(/<[^>]+>/g) || []) {
    for (const name of WORD_ATTRIBUTES) {
      const found = tag.match(new RegExp('\\s' + name + '="([^"]*)"'));
      if (found && tidy(found[1])) out.push(`[${name}] ${tidy(found[1])}`);
    }
  }
  return out;
}
// The Spanish dictionary: every English line and the Spanish beside it.
export function stringsOfDictionary(json) {
  const data = JSON.parse(json);
  const out = [];
  for (const group of ['lines', 'words']) for (const [english, spanish] of Object.entries(data[group] || {})) out.push(`[${group}] ${tidy(english)} => ${tidy(String(spanish))}`);
  return out;
}
// Wording has at least one letter or number. A lone emoji or symbol is a picture.
export const isWording = (text) => /[\p{L}\p{N}]/u.test(text.replace(/^\[[a-z-]+\] /, ''));
export const stringsOf = (name, content) => (name.endsWith('.json') ? stringsOfDictionary(content) : stringsOfHtml(content)).sort();

export function currentStrings() {
  const dir = join(appDir, 'src', 'text');
  const files = {};
  for (const name of readdirSync(dir).filter((f) => /\.(html|json)$/.test(f)).sort()) files[name] = stringsOf(name, readFileSync(join(dir, name), 'utf8'));
  return files;
}
function stringsAt(ref) {
  const git = (...args) => execFileSync('git', args, { cwd: appDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const files = {};
  for (const path of git('ls-tree', '--name-only', ref, 'src/text/').split('\n').filter((f) => /\.(html|json)$/.test(f)).sort()) {
    files[path.split('/').pop()] = stringsOf(path, git('show', `${ref}:app/${path}`));
  }
  return files;
}
// What is in `before` but not `after`, and the other way round, counting repeats.
export function difference(before, after) {
  const count = (list) => list.reduce((map, s) => map.set(s, (map.get(s) || 0) + 1), new Map());
  const a = count(before);
  const b = count(after);
  const gone = [];
  const added = [];
  for (const [s, n] of a) for (let i = b.get(s) || 0; i < n; i += 1) gone.push(s);
  for (const [s, n] of b) for (let i = a.get(s) || 0; i < n; i += 1) added.push(s);
  return { gone, added };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ref] = process.argv.slice(2);
  if (!ref || !['diff', 'snapshot'].includes(command)) { console.log('usage: node tools/strings.mjs diff|snapshot <git-ref>'); process.exit(1); }
  const before = stringsAt(ref);
  const now = currentStrings();
  if (command === 'snapshot') {
    // The reviewed wording at <ref>, plus what has been added since (new lines awaiting review).
    const added = {};
    const pictures = {};
    for (const name of Object.keys(now)) {
      const { gone, added: extra } = difference(before[name] || [], now[name]);
      if (extra.length) added[name] = extra;
      // A string with no letter or number is a picture (an emoji that stood alone, hidden from
      // screen readers). The visual redesign drew those as line icons. Anything else that is gone
      // is wording, and wording may not change here: restore it, or take the snapshot from a
      // version the reviewer has approved.
      const words = gone.filter((text) => isWording(text));
      if (words.length) { console.error(`${name}: wording is gone or changed since ${ref}:\n  ` + words.join('\n  ')); process.exit(1); }
      if (gone.length) pictures[name] = gone;
    }
    mkdirSync(dirname(SNAPSHOT), { recursive: true });
    writeFileSync(SNAPSHOT, JSON.stringify({ note: 'Reviewed and pending-review wording. Rewrite only after the reviewer approves a change: node tools/strings.mjs snapshot <git-ref>', takenFrom: ref, reviewed: before, picturesNowIcons: pictures, addedSince: added }, null, 1) + '\n');
    console.log(`Wrote ${Object.values(before).reduce((n, l) => n + l.length, 0)} reviewed strings and ${Object.values(added).reduce((n, l) => n + l.length, 0)} added since ${ref}.`);
  } else {
    let total = 0;
    for (const name of [...new Set([...Object.keys(before), ...Object.keys(now)])].sort()) {
      const { gone, added } = difference(before[name] || [], now[name] || []);
      console.log(`\n${name}: ${(before[name] || []).length} strings at ${ref}, ${(now[name] || []).length} now; ${gone.length} gone or changed, ${added.length} new`);
      gone.forEach((s) => console.log('  - ' + s));
      added.forEach((s) => console.log('  + ' + s));
      total += gone.length;
    }
    console.log(`\n${total} reviewed strings gone or changed since ${ref}.`);
  }
}
