// Why the phone asks for each permission: the same four reasons in Info.plist, in English, and in
// Spanish, so a phone set to Spanish is never asked in English. Read from the files; no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = fileURLToPath(new URL('../../ios/App/App/', import.meta.url));
const plist = readFileSync(app + 'Info.plist', 'utf8');
const strings = (lang) => Object.fromEntries([...readFileSync(`${app}${lang}.lproj/InfoPlist.strings`, 'utf8').matchAll(/^"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)";$/gm)].map((m) => [m[1], m[2].replace(/\\"/g, '"')]));
const asked = [...plist.matchAll(/<key>(NS\w+UsageDescription)<\/key>\s*<string>([^<]*)<\/string>/g)].map((m) => [m[1], m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&')]);

test('every permission the app can ask for has its reason in English and in Spanish', () => {
  assert.ok(asked.length >= 4, 'found ' + asked.length);
  const en = strings('en');
  const es = strings('es');
  assert.deepEqual(Object.keys(en).sort(), asked.map(([key]) => key).sort());
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const [key, words] of asked) {
    assert.equal(en[key], words, key + ': the English file and Info.plist say different things');
    assert.notEqual(es[key], words, key + ' is not translated');
    assert.ok(es[key].length > 40, key + ' is too short to be a reason');
  }
});

test('the Spanish reasons use the app\'s own Spanish names for each setting, and promise no more than the English', () => {
  const es = strings('es');
  const spanish = JSON.parse(readFileSync(new URL('../../src/text/redesign.es.json', import.meta.url), 'utf8'));
  const pages = readFileSync(new URL('../../src/text/es.html', import.meta.url), 'utf8');
  assert.ok(es.NSFaceIDUsageDescription.includes(`"${spanish.words['Lock the app']}"`));
  assert.ok(es.NSHealthUpdateUsageDescription.includes(`"${spanish.words['Add meditations to Apple Health']}"`));
  for (const key of ['NSLocationWhenInUseUsageDescription', 'NSLocationAlwaysAndWhenInUseUsageDescription']) {
    assert.ok(es[key].includes('"Lugares que son difíciles para mí"') && pages.includes('>Lugares que son difíciles para mí<'), key);
    assert.match(es[key], /se queda en este teléfono/);
  }
  assert.ok(!/NSHealthShareUsageDescription/.test(Object.keys(es).join(' ')));
});

test('the files are in the Xcode project, so they ship with the app', () => {
  const project = readFileSync(app + '../App.xcodeproj/project.pbxproj', 'utf8');
  assert.match(project, /InfoPlist\.strings in Resources/);
  assert.match(project, /path = es\.lproj\/InfoPlist\.strings/);
});
