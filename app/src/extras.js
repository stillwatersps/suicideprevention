// Hope box (idea F9) and My circle (idea E2, the version with no accounts). Draft, not reviewed.
// Kept apart from app.js so two sessions can work without colliding. Runs only in the app.
// - Hope box: words and photos that stay in this app on this phone. Never sent, never shared.
// - My circle: up to 5 chosen people. "Send to my circle" opens the phone's Messages app with
//   those people and the words filled in; the person taps Send. Tidelight receives nothing.
// Every word shown is in app/src/text/extras.*.html.
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Tidelight } from './native.js';
import { smsLink, preview, fitInside } from './extras-logic.js';

const HOPE_KEY = 'tidelight.hope.v1';
const CIRCLE_KEY = 'tidelight.circle.v1';
const PLACES_KEY = 'tidelight.places.v1'; // read only, to offer the same people
const MAX_CIRCLE = 5;
const MAX_LOG = 30;
const PHOTO_EDGE = 1280;
const DB_NAME = 'tidelight-hope';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const native = Capacitor.isNativePlatform();
const show = (el, on) => { if (el) el.classList.toggle('ci-off', !on); };

async function load(key) {
  if (native) return (await Preferences.get({ key })).value;
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
async function save(key, value) {
  if (native) return Preferences.set({ key, value });
  try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: nothing kept */ }
}
async function loadJson(key, fallback) {
  try { const value = JSON.parse((await load(key)) || 'null'); return value === null ? fallback : value; } catch (e) { return fallback; }
}

// ---- Photos live in the app's own database on the phone (IndexedDB).
function photoDb() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('photos', { keyPath: 'id' });
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function photoStore(mode, work) {
  const db = await photoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', mode);
    const request = work(tx.objectStore('photos'));
    tx.oncomplete = () => { db.close(); resolve(request && request.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
async function smallCopy(file) {
  const bitmap = await createImageBitmap(file);
  const size = fitInside(bitmap.width, bitmap.height, PHOTO_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, size.width, size.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no image'))), 'image/jpeg', 0.82));
}

function start() {
  const hopeBox = $('#app-hope');
  const circleBox = $('#app-circle');
  if (!hopeBox || !circleBox) return;
  const lang = document.documentElement.lang || 'en';
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---- Hope box.
  let words = [];
  const urls = [];
  const kindLabel = (kind) => {
    const input = $('input[name="app-hope-kind"][value="' + kind + '"]', hopeBox);
    return input ? input.parentElement.textContent.trim() : '';
  };
  async function renderHope() {
    const list = $('.app-hope-words', hopeBox);
    list.textContent = '';
    words.forEach((word) => {
      const item = $('.app-hope-word-template', hopeBox).content.firstElementChild.cloneNode(true);
      $('.app-hope-word-kind', item).textContent = kindLabel(word.kind) + ':';
      $('.app-hope-word-text', item).textContent = word.text;
      $('.app-hope-remove', item).addEventListener('click', async () => {
        words = words.filter((other) => other.id !== word.id);
        await save(HOPE_KEY, JSON.stringify(words));
        await renderHope();
        $('#app-hope-text').focus();
      });
      list.appendChild(item);
    });
    let photos = [];
    try { photos = (await photoStore('readonly', (store) => store.getAll())) || []; } catch (e) { photos = []; }
    const grid = $('.app-hope-photos', hopeBox);
    urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
    grid.textContent = '';
    photos.sort((a, b) => a.when - b.when).forEach((photo) => {
      const figure = $('.app-hope-photo-template', hopeBox).content.firstElementChild.cloneNode(true);
      const url = URL.createObjectURL(photo.blob);
      urls.push(url);
      $('img', figure).src = url;
      $('.app-hope-remove', figure).addEventListener('click', async () => {
        await photoStore('readwrite', (store) => store.delete(photo.id));
        await renderHope();
        $('#app-hope-photo').focus();
      });
      grid.appendChild(figure);
    });
    show($('.app-hope-empty', hopeBox), words.length === 0 && photos.length === 0);
  }
  $('.app-hope-add', hopeBox).addEventListener('click', async () => {
    const box = $('#app-hope-text');
    const text = box.value.trim();
    if (!text) { box.focus(); return; }
    const kind = ($('input[name="app-hope-kind"]:checked', hopeBox) || {}).value || 'other';
    words.push({ id: newId(), kind, text, when: Date.now() });
    await save(HOPE_KEY, JSON.stringify(words));
    box.value = '';
    await renderHope();
    box.focus();
  });
  $('#app-hope-photo').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    const problem = $('.app-hope-photo-problem', hopeBox);
    show(problem, false);
    if (!file) return;
    try {
      const blob = await smallCopy(file);
      await photoStore('readwrite', (store) => store.put({ id: newId(), blob, when: Date.now() }));
      await renderHope();
    } catch (e) {
      show(problem, true);
    }
    event.target.value = '';
  });

  // ---- My circle.
  let circle = { people: [], log: [] };
  const saveCircle = () => save(CIRCLE_KEY, JSON.stringify(circle));
  const samePhone = (a, b) => String(a).replace(/\D/g, '') === String(b).replace(/\D/g, '');
  async function placesPeople() {
    const places = await loadJson(PLACES_KEY, null);
    const list = places && Array.isArray(places.contacts) ? places.contacts : [];
    return list.filter((p) => p && p.phone && !circle.people.some((mine) => samePhone(mine.phone, p.phone)));
  }
  async function renderCircle() {
    const list = $('.app-circle-list', circleBox);
    list.textContent = '';
    circle.people.forEach((person) => {
      const item = $('.app-circle-person-template', circleBox).content.firstElementChild.cloneNode(true);
      $('.app-circle-name', item).textContent = person.name;
      $('.app-circle-phone', item).textContent = person.phone;
      $('.app-circle-remove', item).addEventListener('click', async () => {
        circle.people = circle.people.filter((other) => other !== person);
        await saveCircle();
        await renderCircle();
        $('.app-circle-add', circleBox).focus();
      });
      list.appendChild(item);
    });
    const full = circle.people.length >= MAX_CIRCLE;
    show($('.app-circle-empty', circleBox), circle.people.length === 0);
    show($('.app-circle-full', circleBox), full);
    $('.app-circle-add', circleBox).disabled = full;
    show($('.app-circle-import', circleBox), !full && (await placesPeople()).length > 0);

    const log = $('.app-circle-log', circleBox);
    log.textContent = '';
    circle.log.slice().reverse().forEach((entry) => {
      const item = document.createElement('li');
      const when = new Date(entry.when).toLocaleDateString(lang, { month: 'long', day: 'numeric' });
      item.textContent = when + ': ' + entry.preview;
      log.appendChild(item);
    });
    show($('.app-circle-log-empty', circleBox), circle.log.length === 0);
    show($('.app-circle-log-clear', circleBox).parentElement, circle.log.length > 0);
    $$('.app-circle-share').forEach((el) => show(el, circle.people.length > 0));
  }
  $('.app-circle-add', circleBox).addEventListener('click', async () => {
    show($('.app-circle-no-phone', circleBox), false);
    let picked;
    try { picked = await Tidelight.pickContact(); } catch (e) { picked = { cancelled: true }; }
    if (!picked || picked.cancelled || circle.people.length >= MAX_CIRCLE) return;
    if (!picked.phone) { show($('.app-circle-no-phone', circleBox), true); return; }
    if (!circle.people.some((mine) => samePhone(mine.phone, picked.phone))) {
      circle.people.push({ name: picked.name || picked.phone, phone: picked.phone });
      await saveCircle();
    }
    await renderCircle();
  });
  $('.app-circle-import', circleBox).addEventListener('click', async () => {
    (await placesPeople()).forEach((p) => {
      if (circle.people.length < MAX_CIRCLE) circle.people.push({ name: p.name || p.phone, phone: p.phone });
    });
    await saveCircle();
    await renderCircle();
  });
  $('.app-circle-log-clear', circleBox).addEventListener('click', async () => {
    circle.log = [];
    await saveCircle();
    await renderCircle();
  });

  // "Send to my circle" sits in the share panel, next to the phone's share sheet button.
  const sharePanel = $('#app-share-panel');
  const shareGo = $('.app-share-go');
  if (sharePanel && shareGo) {
    const piece = $('.app-circle-share-template').content.firstElementChild.cloneNode(true);
    shareGo.insertAdjacentElement('afterend', piece);
    shareGo.insertAdjacentText('afterend', ' ');
    const opened = $('.app-circle-opened', piece);
    show(opened, false);
    document.addEventListener('click', (event) => { if (event.target.closest('.app-share')) show(opened, false); });
    $('.app-circle-send', piece).addEventListener('click', async () => {
      const box = $('#app-share-text');
      let text = box.value.trim();
      if (!text) { box.focus(); return; }
      if (!circle.people.length) return;
      if ($('#app-share-intro').checked) text = $('.app-share-intro-text').textContent.trim() + '\n\n' + text;
      const link = smsLink(circle.people.map((p) => p.phone), text, Capacitor.getPlatform());
      circle.log.push({ when: Date.now(), preview: preview(text) });
      circle.log = circle.log.slice(-MAX_LOG);
      await saveCircle();
      await renderCircle();
      show(opened, true);
      const hook = window.__tidelight && window.__tidelight.onSms;
      if (hook) hook(link); else window.location.href = link;
    });
  }

  // ---- Delete everything also empties the hope box and the circle.
  const erase = $('.ci-erase-yes');
  if (erase) {
    erase.addEventListener('click', async () => {
      words = [];
      circle = { people: [], log: [] };
      await save(HOPE_KEY, '[]');
      await saveCircle();
      try { await photoStore('readwrite', (store) => store.clear()); } catch (e) { /* nothing kept */ }
      await renderHope();
      await renderCircle();
    });
  }

  (async () => {
    show($('.app-hope-photo-problem', hopeBox), false);
    show($('.app-circle-no-phone', circleBox), false);
    const savedWords = await loadJson(HOPE_KEY, []);
    words = Array.isArray(savedWords) ? savedWords : [];
    const savedCircle = await loadJson(CIRCLE_KEY, null);
    if (savedCircle && Array.isArray(savedCircle.people)) {
      circle = { people: savedCircle.people.slice(0, MAX_CIRCLE), log: Array.isArray(savedCircle.log) ? savedCircle.log : [] };
    }
    await renderHope();
    await renderCircle();
    document.documentElement.classList.add('app-extras-ready');
  })();
  // The people in "Places that are hard for me" may change while the app is open.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') renderCircle(); });
  const journeyTab = $('.ci-tabs a[href="#ci-journey"]');
  if (journeyTab) journeyTab.addEventListener('click', () => { renderCircle(); });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}
