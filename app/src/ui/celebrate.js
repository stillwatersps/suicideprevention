// One shared celebration: a short, soft burst of drops over the app's own area. It never covers
// the crisis strip or the rest of the safety frame, takes no taps, and under Reduce Motion it is
// a still glow that fades. Used for a finished setup, a meditation, and streak milestones.
import { reducedMotion } from './state.js';

const DURATION = 1600;
let running = null;

function tokens() {
  const css = getComputedStyle(document.documentElement);
  return ['--tl-primary', '--tl-secondary', '--tl-accent-warm'].map((name) => css.getPropertyValue(name).trim());
}

export function celebrate() {
  const host = document.getElementById('tl-app');
  if (!host || running) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'tl-burst';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const done = () => { canvas.remove(); running = null; };
  if (reducedMotion() || !canvas.getContext) {
    canvas.classList.add('tl-burst-still');
    running = setTimeout(done, DURATION);
    return;
  }
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const width = host.clientWidth;
  const height = Math.min(host.clientHeight, window.innerHeight);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const g = canvas.getContext('2d');
  g.scale(scale, scale);
  const colors = tokens();
  const drops = Array.from({ length: 36 }, (unused, i) => {
    const angle = Math.PI * (1.15 + 0.7 * Math.random());
    const speed = 3 + Math.random() * 6;
    return { x: width / 2, y: height * 0.45, vx: Math.cos(angle) * speed * (i % 2 ? 1 : -1), vy: Math.sin(angle) * speed, r: 3 + Math.random() * 4, color: colors[i % colors.length] };
  });
  const start = performance.now();
  running = true;
  (function frame(now) {
    const t = (now - start) / DURATION;
    g.clearRect(0, 0, width, height);
    if (t >= 1 || document.hidden) { done(); return; }
    g.globalAlpha = 1 - t;
    drops.forEach((d) => {
      d.x += d.vx; d.y += d.vy; d.vy += 0.22;
      g.fillStyle = d.color;
      g.beginPath();
      g.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      g.fill();
    });
    requestAnimationFrame(frame);
  })(start);
}
