// "Breathe in a pattern": the session as data. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { builtIn, audioPlan, BREATHE, PATTERNS } from '../../src/logic/meditations.js';
import { cycleLength } from '../../src/logic/timeline.js';
import { CONFIG } from '../../src/core/config.js';

const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');

test('three patterns, and each is what its chip says', () => {
  assert.deepEqual(BREATHE, ['calm', 'box', 'stressed']);
  const shape = (p) => [p.inhale, p.holdIn, p.exhale, p.holdOut].join();
  assert.equal(shape(PATTERNS.calm), '4,0,6,0');
  assert.equal(shape(PATTERNS.box), '4,4,4,4');
  assert.equal(shape(PATTERNS.stressed), '4,7,8,0');
  const en = read('en');
  for (const words of ['Calm: in 4, out 6', 'Box: 4, 4, 4, 4', '4-7-8']) assert.ok(en.includes('>' + words + '<'), words);
});

test('every pattern and length is whole breaths in that pattern, silent, the right length', () => {
  assert.deepEqual(CONFIG.meditation.lengths.breathe, [1, 3, 5]);
  for (const pattern of BREATHE) for (const minutes of CONFIG.meditation.lengths.breathe) {
    const m = builtIn('breathe', { minutes, pattern });
    assert.equal(m.totalSeconds, minutes * 60, pattern + ' ' + minutes);
    assert.equal(m.pattern, pattern);
    assert.equal(m.id, `breathe-${minutes}-${pattern}`);
    const breathing = m.segments.filter((s) => s.kind === 'breathing');
    assert.equal(breathing.length, 1);
    assert.equal(breathing[0].breathingPattern, PATTERNS[pattern]);
    assert.ok(breathing[0].cycles >= 2, 'at least two whole breaths');
    assert.equal(breathing[0].durationSeconds, breathing[0].cycles * cycleLength(PATTERNS[pattern]), 'no breath is cut short');
    assert.ok(m.segments.every((s) => !s.voiceScriptId), 'nothing is spoken');
    assert.equal(audioPlan(m, { sound: true, voice: true }).ambient, 'none');
  }
});

test('an unknown pattern is the calm one', () => {
  for (const pattern of [undefined, 'energize', 'sleep10', 'x', 7]) assert.equal(builtIn('breathe', { pattern }).pattern, 'calm');
});

test('the card warns about dizziness, in both languages', () => {
  assert.match(read('en'), /If you feel dizzy or short of breath, stop and breathe the way you usually do\./);
  assert.match(read('es'), /Si sientes mareo o te falta el aire, para y respira como lo haces normalmente\./);
});
