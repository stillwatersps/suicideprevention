// Every screen and state of the app a person can be on, and how to get to each, in one place.
// The crisis test, the accessibility test, and the network test all walk this same list, so a
// screen added here is checked by all of them.
import { tab, openPanel, openSettings, startDaily, birthDateYearsAgo } from './helpers.mjs';

export const home = async (page) => { await tab(page, 'home'); if (!(await page.isVisible('#tl-home'))) await tab(page, 'home'); };
export const root = async (page, id) => { await tab(page, id); if (!(await page.isVisible('#tl-' + id))) await tab(page, id); };
export const startFlow = async (page) => { await home(page); await page.click('#tl-home [data-tl-quick="checkin"]'); if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip'); };
// The test clock: 1 is real time; a large number finishes a meditation in a moment.
export const setRate = (page, rate) => page.evaluate((r) => { window.__tidelight.clockRate = r; }, rate);
const dailyToNeeds = async (page) => {
  await startDaily(page);
  await page.click('#ci-step-feeling label:has(input[value="okay"])');
  await page.click('#ci-step-feeling .ci-next');
  for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
};

// In the order they are visited. `go` gets there from wherever the last one left off; `leave`
// closes anything that would be in the way of the next one. The two that record a very low
// mood come last, because they make the rest of the day "quiet".
export const SCREENS = [
  { id: 'home', name: 'Home', go: home },
  { id: 'home-menu-open', name: 'Home, with the site menu open', go: async (page) => { await home(page); await page.click('.menu-button'); }, leave: async (page) => { if ((await page.getAttribute('.menu-button', 'aria-expanded')) === 'true') await page.click('.menu-button'); } },
  { id: 'streak', name: 'Your streak', go: async (page) => { await home(page); await page.click('#tl-streak-card'); } },
  { id: 'settings', name: 'Settings', go: openSettings },
  { id: 'checkin', name: 'Check-in tab', go: (page) => root(page, 'checkin') },
  { id: 'flow-mood', name: 'Quick check-in, choosing a mood', go: startFlow },
  { id: 'flow-done', name: 'Quick check-in, finished', go: async (page) => { await startFlow(page); await page.click('#tl-flow-faces [data-value="4"]'); await page.click('#tl-flow-done'); } },
  { id: 'daily-question', name: 'Daily check-in, first question', go: startDaily },
  { id: 'daily-needs', name: 'Daily check-in, "what do you need" (with its 988 line)', go: dailyToNeeds },
  { id: 'daily-result', name: 'Daily check-in, result', go: async (page) => { if (!(await page.isVisible('.ci-finish'))) await dailyToNeeds(page); await page.click('.ci-finish'); } },
  { id: 'share', name: 'Share with someone you choose', go: async (page) => { await page.click('[data-share="result"]'); await page.waitForSelector('#app-share-panel:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('.app-share-cancel')) await page.click('.app-share-cancel'); } },
  { id: 'journal', name: 'Journal', go: (page) => openPanel(page, 'ci-journal') },
  { id: 'rediscover', name: 'Rediscover', go: (page) => openPanel(page, 'ci-rediscover') },
  { id: 'hope', name: 'Hope box', go: (page) => openPanel(page, 'app-hope') },
  { id: 'journey', name: 'Your journey', go: (page) => openPanel(page, 'ci-journey') },
  { id: 'meditate', name: 'Meditate', go: (page) => root(page, 'meditate') },
  { id: 'builder', name: 'Build your own', go: async (page) => { await root(page, 'meditate'); await page.click('#tl-build-card'); } },
  { id: 'history', name: 'Meditation history', go: async (page) => { await root(page, 'meditate'); await page.click('#tl-history-card'); } },
  { id: 'player', name: 'Meditation player, session running', go: async (page) => { await setRate(page, 1); await root(page, 'meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-stage:not([hidden])'); await page.waitForTimeout(600); } },
  { id: 'player-end', name: 'Meditation player, "End session?" open', go: async (page) => { await page.click('#tl-stage', { position: { x: 150, y: 300 } }); await page.click('#tl-player-end'); await page.waitForSelector('#tl-end-confirm:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('#tl-end-yes')) await page.click('#tl-end-yes'); } },
  { id: 'complete', name: 'Meditation finished', go: async (page) => { await setRate(page, 900); await root(page, 'meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 15000 }); await setRate(page, 1); } },
  { id: 'complete-support', name: 'Meditation finished, very low mood after', go: async (page) => { await page.click('#tl-complete-faces [data-value="1"]'); await page.waitForSelector('#tl-complete-support:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('#tl-complete [data-player-done]')) await page.click('#tl-complete [data-player-done]'); else if (await page.isVisible('#tl-complete-support [data-player-done]')) await page.click('#tl-complete-support [data-player-done]'); } },
  { id: 'location', name: 'Location, Places off', go: (page) => root(page, 'location') },
  { id: 'location-on', name: 'Location, Places turned on', go: async (page) => { await root(page, 'location'); await page.check('#app-places .app-places-on'); } },
  { id: 'place-alert', name: 'Place alert ("You\'ve been at…")', go: async (page) => {
    await page.evaluate(() => { window.__tidelight.pendingAlert = { placeId: 'x', placeName: 'A made-up place', since: Date.now() - 600000, minutes: 10 }; window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#app-place-alert' })); });
    await page.waitForSelector('#app-place-alert:not([hidden])', { timeout: 4000 });
  }, leave: async (page) => { await page.evaluate(() => { delete window.__tidelight.pendingAlert; }); } },
  { id: 'friends', name: 'Friends', go: (page) => root(page, 'friends') },
  { id: 'flow-support', name: 'Quick check-in, support after a very low mood', go: async (page) => { await startFlow(page); await page.click('#tl-flow-faces [data-value="1"]'); await page.click('#tl-flow-done'); await page.waitForSelector('#tl-flow-support:not([hidden])'); } },
  { id: 'daily-result-heavy', name: 'Daily check-in, result after a heavy feeling', go: async (page) => {
    await startDaily(page); if (await page.isVisible('.ci-restart')) await page.click('.ci-restart');
    await page.click('#ci-step-feeling label:has(input[value="sad"])'); await page.click('#ci-step-feeling .ci-next');
    for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
    await page.click('.ci-finish');
  } },
];

// Visits every screen in order. `each(screen, page, problem)` is called once per screen, with
// `problem` set (and nothing to look at) if the screen could not be reached.
export async function walk(page, each, { settle = 450 } = {}) {
  for (const screen of SCREENS) {
    let problem = null;
    try { await screen.go(page); await page.waitForTimeout(settle); } catch (e) { problem = String(e.message).split('\n')[0]; }
    await each(screen, page, problem);
    if (screen.leave) { try { await screen.leave(page); } catch (e) { /* already left */ } }
  }
}
// A phone opened for the very first time: the age question and each onboarding page, on `page`
// (which must have been opened with nothing stored).
export async function walkFirstLaunch(page, each, { settle = 450 } = {}) {
  for (let i = 0; i < 12 && await page.isVisible('#tl-onboarding'); i += 1) {
    const name = await page.getAttribute('.tl-ob-page:not([hidden])', 'data-ob');
    await page.waitForTimeout(settle); // let the page finish fading in
    await each({ id: 'onboarding-' + name, name: 'First launch, onboarding: ' + name }, page, null);
    if (name === 'age') { await page.fill('#app-birth-date', birthDateYearsAgo(30)); await page.click('.app-age-save'); await page.click('.app-age-yes'); } else if (name === 'done') break;
    else { if (name === 'style') await page.click('#tl-ob-style [data-value="calm"]'); await page.click('.tl-ob-page:not([hidden]) [data-ob-next]'); }
  }
}
