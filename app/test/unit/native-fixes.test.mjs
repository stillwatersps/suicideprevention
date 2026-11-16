// Faults found in the iPhone code on November 16, 2026, each held fixed here by reading the Swift.
// No phone: what these do on screen was looked at once in the iPhone Simulator, and is in
// TESTING_CHECKLIST.md for a person to try.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (path) => readFileSync(fileURLToPath(new URL('../../' + path, import.meta.url)), 'utf8');
const code = (path) => read(path).replace(/^\s*\/\/.*$/gm, '');
const plugin = code('ios/App/App/TidelightPlugin.swift');
const picker = code('ios/App/App/PlacePickerViewController.swift');

test('a check-in reminder still shows while the app is open', () => {
  // The reminders plugin's handler is a separate object; asking the plugin itself gave nothing,
  // so every reminder that fired with the app in front was swallowed.
  assert.ok(!/plugin\(withName: "LocalNotifications"\) as\? NotificationHandlerProtocol/.test(plugin), 'the reminders plugin is asked to handle notifications, which it cannot');
  const load = plugin.slice(plugin.indexOf('override public func load()'), plugin.indexOf('notificationRouter.localNotificationHandler = self'));
  assert.match(load, /reminders = earlier/, 'the handler that was registered first is not kept');
  assert.match(plugin, /return otherHandler\(\)\?\.willPresent\(notification: notification\) \?\? \[\]/);
  assert.match(plugin, /otherHandler\(\)\?\.didReceive\(response: response\)/);
});

test('a tapped reminder reaches the page, which opens the Check-in tab', () => {
  assert.match(code('src/ui/device.js'), /LocalNotifications\.addListener\('localNotificationActionPerformed'/);
  const redesign = code('src/redesign.js');
  assert.match(redesign, /onReminderTap\(\(\) => \{ if \(!state\.onboarding\.completed\) return;/, 'first-time setup could be skipped by a reminder');
  assert.match(code('src/ui/shell.js'), /event\.detail === '#ci-today'\) shell\.go\('checkin'\)/);
});

test('the map for choosing a place opens below the crisis strip', () => {
  const pick = plugin.slice(plugin.indexOf('@objc func pickPlace'), plugin.indexOf('@objc func pickContact'));
  assert.match(pick, /call\.getDouble\("top"\)/);
  assert.match(pick, /nav\.view\.frame = CGRect\(x: 0, y: top,/);
  assert.match(code('src/app.js'), /pickPlace\(options\)/);
  assert.match(code('src/app.js'), /top: stripBottom\(\)/, 'the page does not say where the crisis strip ends');
  // Closing it works whichever way it was opened.
  assert.match(picker, /holder\.view\.removeFromSuperview\(\)/);
  assert.equal((picker.match(/dismiss\(animated/g) || []).length, 1, 'the map is dismissed somewhere other than finish()');
});

test('the map reads the phone\'s location only after "Use where I am"', () => {
  // The phone reports the permission as soon as the map opens. Without the guard, that moved the
  // pin of a place being renamed to wherever the phone was.
  const changed = picker.slice(picker.indexOf('func locationManagerDidChangeAuthorization'));
  assert.match(changed, /guard askedForHere else \{ return \}/);
  const updated = picker.slice(picker.indexOf('didUpdateLocations'), picker.indexOf('didFailWithError'));
  assert.match(updated, /guard askedForHere else \{ return \}/);
  assert.equal((picker.match(/requestLocation\(\)/g) || []).length, 2, 'the location is asked for somewhere new');
});

test('every word the map shows is one the page sends', () => {
  const sent = [...read('src/text/en.html').matchAll(/data-word="map([A-Z]\w*)"/g)].map((m) => m[1][0].toLowerCase() + m[1].slice(1));
  assert.ok(sent.length >= 10, 'found ' + sent.length);
  const asked = [...picker.matchAll(/word\("(\w+)"\)/g)].map((m) => m[1]);
  for (const key of asked) assert.ok(sent.includes(key), `the map asks for "${key}", which the page never sends (VoiceOver would read the key itself)`);
});
