// The redesigned app (app/BUILD-SPEC.md): tabs, onboarding, streaks, and meditation, on top of the
// older app layer in app.js. A draft, not reviewed. Nothing here sends anything anywhere.
import { initShell, shell } from './ui/shell.js';
import { initHome } from './ui/home.js';

// Called by app.js once what's saved has been loaded, before the page is shown.
export async function initRedesign(context) {
  if (!document.getElementById('tl-app')) return;
  initShell();
  initHome(shell, context);
}
