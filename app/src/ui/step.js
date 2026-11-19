// "One small thing for today", on Home: one line from the person's own list of things they'd
// like to try, a different one each day. The list belongs to the older check-in page
// ("Rediscover"); this only reads it. The app adds no line of its own, keeps nothing, and never
// asks whether the thing was tried. It is not shown on a day with a very low check-in.
import { ownList, pickStep } from '../logic/step.js';
import { isQuiet, todayKey } from './state.js';

const $ = (sel) => document.querySelector(sel);
let readList = () => [];
let skip = 0;
let shownDay = '';

export function renderStep() {
  const card = $('#tl-home-step');
  if (!card) return;
  const today = todayKey();
  if (today !== shownDay) { shownDay = today; skip = 0; }
  const list = ownList(readList());
  const line = pickStep(list, today, skip);
  card.hidden = isQuiet();
  $('#tl-home-step-line').textContent = line;
  $('#tl-home-step-line').hidden = !line;
  $('#tl-home-step-empty').hidden = Boolean(line);
  $('#tl-home-step-other').hidden = list.length < 2;
}

// `getList` returns the person's list as the older page holds it now.
export function initStep(shell, getList) {
  if (!$('#tl-home-step')) return;
  readList = () => { try { return getList(); } catch (e) { return []; } };
  $('#tl-home-step-other').addEventListener('click', () => { skip += 1; renderStep(); });
  shell.onShow('home', renderStep);
  window.addEventListener('tidelight-checkin', () => setTimeout(renderStep, 0));
  window.addEventListener('tidelight-erased', () => setTimeout(renderStep, 0));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') renderStep(); });
  renderStep();
}
