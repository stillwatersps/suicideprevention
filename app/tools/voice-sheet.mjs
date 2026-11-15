// Writes notes/VOICE-RECORDING-SHEET.md: every line a person would record for the meditation
// voice, with the exact file name the app looks for. The words come from the app's own word
// files, so the sheet can't say something the app doesn't.
//   node tools/voice-sheet.mjs          rewrites the note
//   node tools/voice-sheet.mjs --check  fails if the note is out of date (the unit test uses this)
// The app already plays a recording when its file exists (src/logic/meditations.js, resolveVoice)
// and falls back to the phone's own text-to-speech when it doesn't. Nothing here records anything.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voiceClipPath } from '../src/logic/meditations.js';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SHEET = join(appDir, '..', 'notes', 'VOICE-RECORDING-SHEET.md');
const LANGS = [['en', 'English'], ['es', 'Spanish']];
const STYLES = ['calm', 'straightforward'];
const tidy = (text) => text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// Every script line in one language: { id, style, words }, in the order the word file gives them.
export function scriptLines(lang) {
  const html = readFileSync(join(appDir, 'src', 'text', `redesign.${lang}.html`), 'utf8');
  return [...html.matchAll(/<span data-word="script\.([^"]+)" data-style="(calm|straightforward)">([\s\S]*?)<\/span>/g)].map((m) => ({ id: m[1], style: m[2], words: tidy(m[3]) }));
}
// About how long a calm reading takes: two words a second, and a breath at each full stop.
const seconds = (words) => Math.max(3, Math.round(words.split(/\s+/).length / 2 + (words.match(/[.?!]/g) || []).length * 0.7));

export function buildSheet() {
  const out = [
    '---',
    'aliases: [Voice recording sheet]',
    'status: DRAFT. Made by a tool from the app\'s own words. Nothing has been recorded, and the words have not been reviewed',
    '---',
    '',
    '# Voice recording sheet: the meditation guide',
    '',
    '[[00 START HERE|Back to Start Here]]',
    '',
    'Made by `node tools/voice-sheet.mjs` in `app/`, from the app\'s word files. Run it again after any script changes;',
    'a test fails if this note falls behind the app.',
    '',
    '**Record nothing yet.** These scripts were written by an AI assistant and no licensed reviewer has read them',
    '([[CONTENT-REVIEW]], "The meditation scripts"). A recording made now would have to be made again after review.',
    'The Spanish is an unreviewed AI translation.',
    '',
    '## What this is for',
    '',
    'During a meditation the app can speak a few lines: a welcome, a body scan, a closing. Today the phone\'s own',
    'text-to-speech reads them, which sounds like a machine. If a recording of a line is in the app, the app plays',
    'the recording instead. Nothing else changes: the voice is optional, off in a Silent session, and the words on',
    'screen are the same.',
    '',
    '## How to record',
    '',
    '- **Who.** One person per language, the same person for every line in it. A person, not a synthetic voice',
    '  made to sound like one. They agree in writing that Tidelight may use the recordings; a founder keeps that.',
    '- **How it should sound.** Unhurried and plain. The "calm" lines are slower and softer; the "straightforward"',
    '  lines are brisk and even. Never whispering, never performing. Read exactly the words below.',
    '- **The file.** One line per file, MP3, one channel, with about a third of a second of quiet at each end and',
    '  no music or room noise. Name it exactly as the table says.',
    '- **Where it goes.** `app/assets/voice/` and then the path in the table. The next build finds the files and',
    '  the app uses them. A missing file is never a fault: that line falls back to the phone\'s voice.',
    '- **Check.** Play each in the app, in a meditation of its type, with the sound on.',
    '',
  ];
  let total = 0;
  for (const [lang, name] of LANGS) {
    const lines = scriptLines(lang);
    out.push(`## ${name}: ${lines.length} recordings`, '', '| File | Voice | About | Words to read |', '| --- | --- | --- | --- |');
    for (const line of lines) {
      total += 1;
      out.push(`| \`${voiceClipPath(line.id, line.style, lang)}\` | ${line.style} | ${seconds(line.words)} s | ${line.words.replace(/\|/g, '\\|')} |`);
    }
    out.push('');
  }
  out.push('## Counts', '', `${total} recordings in all: ${scriptLines('en').length / STYLES.length} lines, in ${STYLES.length} voices, in ${LANGS.length} languages.`, '');
  return out.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sheet = buildSheet();
  if (process.argv.includes('--check')) {
    let now = '';
    try { now = readFileSync(SHEET, 'utf8'); } catch (e) { /* not written yet */ }
    if (now !== sheet) { console.log('notes/VOICE-RECORDING-SHEET.md is out of date. Run: node tools/voice-sheet.mjs'); process.exit(1); }
    console.log('The voice recording sheet matches the app\'s scripts.');
  } else {
    writeFileSync(SHEET, sheet);
    console.log(`Wrote notes/VOICE-RECORDING-SHEET.md: ${scriptLines('en').length + scriptLines('es').length} recordings.`);
  }
}
