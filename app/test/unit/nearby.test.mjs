// "Care near me": the link carries nothing about the person, and the app reads no location for it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-nearby"'), page.indexOf('id="tl-expect"'));

for (const [lang, file, query] of [['English', 'text/redesign.en.html', 'emergency+room'], ['Spanish', 'text/redesign.es.html', 'sala+de+emergencias']]) {
  test(`${lang}: the link is a plain search in the phone's maps, with nothing about the person in it`, () => {
    const screen = screenOf(read(file));
    const link = screen.match(/<a[^>]*id="tl-nearby-er"[^>]*>/);
    assert.ok(link, 'the link is missing');
    assert.match(link[0], new RegExp(`href="https://maps\\.apple\\.com/\\?q=${query.replace(/\+/g, '\\+')}"`));
    assert.match(link[0], new RegExp(`data-android-href="geo:0,0\\?q=${query.replace(/\+/g, '\\+')}"`));
    assert.match(link[0], /rel="noreferrer noopener"/);
    assert.ok(!/ll=|sll=|near=|daddr|saddr|@\d/.test(link[0]), 'the address carries a place');
    const outside = [...screen.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(outside, [link[0].match(/href="([^"]+)"/)[1]], 'the screen links somewhere else outside the app');
    for (const href of ['tel:988', 'tel:911']) assert.ok(screen.includes(`href="${href}"`), href + ' is not on the screen');
    assert.ok(/sms:988/.test(screen));
  });
}

test('the app reads no location for it and sends nothing', () => {
  const code = read('ui/nearby.js').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/geolocation|currentPosition|requestLocationPermission|getCurrentLocation|fetch\(|XMLHttpRequest|sendBeacon|https?:/.test(code), 'the script reads a location, sends something, or holds an address');
  assert.ok(!/store\.|save\(|localStorage/.test(code), 'the script stores something');
});

test('the screen says that the link leaves the app, and what the maps app then does', () => {
  const text = screenOf(read('text/redesign.en.html')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(text, /leaves Tidelight/);
  assert.match(text, /doesn't learn where you are/);
  assert.match(text, /its own privacy rules/);
  assert.match(text, /You don't have to go anywhere to get help/);
});
