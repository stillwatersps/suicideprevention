// "A mindful walk": the session as data, and its lines. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { builtIn, audioPlan } from '../../src/logic/meditations.js';
import { CONFIG } from '../../src/core/config.js';

const IDS = ['intro.walk', 'walk.steps', 'walk.around', 'outro.walk'];
const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');

test('every length is four spoken lines with walking between them, and nothing to watch', () => {
  assert.deepEqual(CONFIG.meditation.lengths.walk, [5, 10, 15]);
  for (const minutes of CONFIG.meditation.lengths.walk) {
    const m = builtIn('walk', { minutes });
    assert.equal(m.totalSeconds, minutes * 60);
    assert.deepEqual(m.segments.map((s) => s.voiceScriptId), IDS);
    assert.ok(m.segments.every((s) => s.kind !== 'breathing'), 'no breathing circle to follow while moving');
    assert.equal(m.hapticBreathing, false);
    assert.equal(m.backgroundSound, 'none', 'no sound over the street unless the person chooses one');
    assert.deepEqual(audioPlan(m, { sound: true, voice: true }), { ambient: 'none', voice: true });
    const [first, second] = [m.segments[1].durationSeconds, m.segments[2].durationSeconds];
    assert.ok(Math.abs(first - second) <= 1, 'the two stretches of walking are the same length');
  }
});

test('each line exists in both styles and both languages, and the first says to put the phone away', () => {
  for (const lang of ['en', 'es']) {
    const html = read(lang);
    for (const id of IDS) {
      for (const style of ['calm', 'straightforward']) assert.ok(new RegExp(`data-word="script\\.${id.replace('.', '\\.')}" data-style="${style}">[^<]{20,}<`).test(html), `${lang} ${id} ${style}`);
      assert.ok(new RegExp(`data-word="screen\\.${id.replace('.', '\\.')}">[^<]{5,}<`).test(html), `${lang} screen ${id}`);
    }
  }
  const intro = [...read('en').matchAll(/data-word="script\.intro\.walk" data-style="\w+">([^<]+)</g)].map((m) => m[1]);
  assert.equal(intro.length, 2);
  for (const line of intro) { assert.match(line, /pocket/i); assert.match(line, /where you're going/i); assert.match(line, /stop any ?time|stop at any time/i); }
});
