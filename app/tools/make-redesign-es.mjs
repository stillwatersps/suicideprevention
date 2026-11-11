// Makes src/text/redesign.es.html from src/text/redesign.en.html and the Spanish words in
// src/text/redesign.es.json, so the two languages can never drift apart in structure.
// Run: node tools/make-redesign-es.mjs   (npm run words:es). It fails if any English line has no
// Spanish yet. The Spanish is an unreviewed AI translation: a fluent reader changes the .json.
//  - "lines": whole lines, used first. Crisis sentences live here, because Spanish 988 wording is
//    not a word-for-word translation (press 2 on a call; text AYUDA).
//  - "words": every other piece of text or spoken label, matched exactly.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const textDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'text');
const en = readFileSync(join(textDir, 'redesign.en.html'), 'utf8');
const dict = JSON.parse(readFileSync(join(textDir, 'redesign.es.json'), 'utf8'));
const missing = new Set();
const hasLetters = (text) => /[A-Za-z]/.test(text.replace(/&[a-z]+;/g, '').replace(/\{[a-zA-Z]+\}/g, ''));

function word(text) {
  const trimmed = text.trim();
  if (!trimmed || !hasLetters(trimmed)) return text;
  if (Object.prototype.hasOwnProperty.call(dict.words, trimmed)) return text.replace(trimmed, () => dict.words[trimmed]);
  missing.add(trimmed);
  return text;
}

const headerEnd = en.indexOf('-->') + 3;
const body = en.slice(headerEnd).split('\n').map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('<!--')) return line;
  if (Object.prototype.hasOwnProperty.call(dict.lines, trimmed)) return line.replace(trimmed, () => dict.lines[trimmed]);
  let out = line.replace(/\b(aria-label|placeholder|alt|title)="([^"]*)"/g, (all, name, value) => `${name}="${word(value)}"`);
  out = out.replace(/>([^<>]+)</g, (all, text) => '>' + word(text) + '<');
  // A line that is only text (a wrapped paragraph) has no tags around it.
  if (!/[<>]/.test(out)) out = word(out);
  return out.replace(/href="\.\.\/about\//g, 'href="../acerca-de/').replace(/href="\.\.\/check-in\//g, 'href="../registro-diario/');
}).join('\n');

if (missing.size) {
  console.log('No Spanish yet for:\n' + [...missing].map((m) => '  ' + JSON.stringify(m)).join('\n'));
  console.log(`\n${missing.size} line(s) missing in src/text/redesign.es.json.`);
  process.exit(1);
}
writeFileSync(join(textDir, 'redesign.es.html'), dict.header + body);
console.log('Wrote src/text/redesign.es.html from the English blocks and redesign.es.json.');
