// The visual worlds: Ocean, Forest, and Night Sky. Each is drawn in code on one canvas (no image
// files) and follows the breath: fuller on the inhale, emptier on the exhale. Under Reduce Motion
// nothing moves; only light and color change, slowly. These palettes are scene art, not interface
// colors, so they live here and not in tokens.css.
import { CONFIG } from '../core/config.js';

// A small repeatable random, so a world looks the same each time.
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function sky(g, w, h, stops) {
  const grad = g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([at, color]) => grad.addColorStop(at, color));
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

const SCENES = {
  // A layered sky; waves rise and swell on the inhale and draw back on the exhale; light shimmers.
  ocean(g, w, h, breath, t, still) {
    sky(g, w, h, [[0, '#0B3A55'], [0.45, '#2E7C93'], [0.62, '#F3C9A0'], [0.63, '#1E6A85'], [1, '#062A3D']]);
    g.fillStyle = `rgba(255, 236, 200, ${0.25 + 0.35 * breath})`;
    g.beginPath(); g.arc(w * 0.7, h * 0.5, w * (0.1 + 0.02 * breath), 0, Math.PI * 2); g.fill();
    const layers = [['rgba(30, 106, 133, 0.9)', 0.66, 14, 0.9], ['rgba(18, 82, 110, 0.92)', 0.74, 18, 0.6], ['rgba(8, 52, 76, 0.96)', 0.84, 22, 0.4]];
    layers.forEach(([color, base, amp, speed], i) => {
      const rise = h * 0.06 * breath * (1 + i * 0.3);
      const drift = still ? i * 40 : t * 18 * speed + i * 40;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w; x += 12) g.lineTo(x, h * base - rise + Math.sin((x + drift) / (46 + i * 14)) * amp * (0.5 + 0.5 * breath));
      g.lineTo(w, h); g.closePath(); g.fill();
    });
    const rand = seeded(7);
    for (let i = 0; i < CONFIG.meditation.particles; i += 1) {
      const x = rand() * w;
      const y = h * (0.66 + rand() * 0.3);
      const glint = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2.1);
      g.fillStyle = `rgba(255, 255, 255, ${0.05 + 0.25 * glint * breath})`;
      g.fillRect(x, y, 14 + rand() * 18, 2);
    }
  },
  // Soft layers of trees; rays of light brighten on the inhale; a few fireflies drift.
  forest(g, w, h, breath, t, still) {
    sky(g, w, h, [[0, '#17332B'], [0.5, '#2F5D49'], [1, '#0C1E19']]);
    for (let i = 0; i < 4; i += 1) {
      const x = w * (0.15 + i * 0.22);
      g.fillStyle = `rgba(255, 244, 196, ${0.03 + 0.11 * breath})`;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w * 0.1, 0); g.lineTo(x + w * 0.02, h); g.lineTo(x - w * 0.16, h); g.closePath(); g.fill();
    }
    const rand = seeded(11);
    [['#1E4436', 0.5, 0.22], ['#16352A', 0.62, 0.3], ['#0C231B', 0.76, 0.4]].forEach(([color, base, size], layer) => {
      g.fillStyle = color;
      const shift = still ? 0 : Math.sin(t * 0.05 + layer) * 6 * (layer + 1);
      for (let x = -40; x < w + 40; x += w * (0.16 - layer * 0.02)) {
        const tall = h * size * (0.7 + rand() * 0.6);
        const wide = tall * 0.32;
        const cx = x + rand() * 30 + shift;
        g.beginPath(); g.moveTo(cx, h * base + tall * 0.6); g.lineTo(cx - wide, h * base + tall * 0.6); g.lineTo(cx, h * base - tall * 0.4); g.lineTo(cx + wide, h * base + tall * 0.6); g.closePath(); g.fill();
      }
      g.fillRect(0, h * base + h * size * 0.3, w, h);
    });
    const fly = seeded(23);
    for (let i = 0; i < CONFIG.meditation.particles; i += 1) {
      const x = fly() * w + (still ? 0 : Math.sin(t * 0.3 + i) * 18);
      const y = h * (0.3 + fly() * 0.5) + (still ? 0 : Math.cos(t * 0.24 + i * 1.7) * 14);
      g.fillStyle = `rgba(255, 240, 170, ${0.15 + 0.6 * breath * (still ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.9 + i))})`;
      g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
    }
  },
  // A deep sky; stars brighten and twinkle with the breath; the moon's glow slowly swells.
  nightSky(g, w, h, breath, t, still) {
    sky(g, w, h, [[0, '#050B1E'], [0.6, '#10234A'], [1, '#1B2F57']]);
    const rand = seeded(5);
    for (let i = 0; i < 46; i += 1) {
      const x = rand() * w;
      const y = rand() * h * 0.8;
      const twinkle = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * (0.6 + rand()) + i);
      g.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.7 * breath * twinkle})`;
      g.beginPath(); g.arc(x, y, 0.8 + rand() * 1.4, 0, Math.PI * 2); g.fill();
    }
    const mx = w * 0.72;
    const my = h * 0.24;
    const glow = g.createRadialGradient(mx, my, w * 0.05, mx, my, w * (0.2 + 0.1 * breath));
    glow.addColorStop(0, `rgba(240, 240, 255, ${0.35 + 0.25 * breath})`);
    glow.addColorStop(1, 'rgba(240, 240, 255, 0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#EEF0FA';
    g.beginPath(); g.arc(mx, my, w * 0.07, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0C1B3A';
    g.fillRect(0, h * 0.9, w, h * 0.1);
  },
};

// createWorld(canvas, 'ocean', { reduced }) -> { draw(breath, seconds, dim), resize(), name }
export function createWorld(canvas, name, options = {}) {
  const scene = SCENES[name] || SCENES.ocean;
  const g = canvas.getContext && canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let shown = 0.5;
  const world = {
    name: SCENES[name] ? name : 'ocean',
    resize() {
      const scale = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth || 300;
      height = canvas.clientHeight || 300;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      if (g) g.setTransform(scale, 0, 0, scale, 0, 0);
    },
    // breath: 0 (empty) to 1 (full). dim: 0 to 1, for Sleep and for the fade to dark.
    draw(breath, seconds, dim) {
      if (!g || !width) return;
      // Ease toward the breath so a phase change never jumps.
      shown = lerp(shown, ease(Math.max(0, Math.min(1, breath))), options.reduced ? 0.04 : 0.18);
      scene(g, width, height, shown, seconds, Boolean(options.reduced));
      if (dim > 0) { g.fillStyle = `rgba(0, 0, 0, ${Math.min(0.96, dim)})`; g.fillRect(0, 0, width, height); }
    },
  };
  world.resize();
  return world;
}
