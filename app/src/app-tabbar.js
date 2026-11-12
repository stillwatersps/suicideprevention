// The website's pages inside the app (Get help, Not sure, For teens, and the rest) carry the same
// five tabs as the app's own screens, so there is always a way back. tools/build-redesign.mjs
// writes the bar into each page as plain links; this only keeps its labels fitting.
import { watchTabBar } from './ui/tabbar-fit.js';

const start = () => watchTabBar(document.getElementById('tl-tabbar'));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
