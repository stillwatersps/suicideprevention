// The visual worlds: Ocean, Forest, and Night Sky. Each is drawn in code on one canvas (no image
// files) and follows the breath: more light on the inhale, less on the exhale. Under Reduce Motion
// nothing moves; only light changes, slowly. Every color comes from the `--scene-*` tokens.
// The ocean is a flat, still horizon with light gathering at its edge: no waves, by design.
import { CONFIG } from '../core/config.js';

// A small repeatable random, so a world looks the same each time.
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

// The scene colors, read from the tokens once per world.
function palette() {
  const css = getComputedStyle(document.documentElement);
  const read = (name) => css.getPropertyValue('--scene-' + name).trim();
  const out = {};
  ['ink-top', 'ink-mid', 'glow', 'glow-core', 'water', 'water-deep', 'forest-top', 'forest-mid', 'forest-low', 'tree-1', 'tree-2', 'tree-3',
    'ray', 'firefly', 'night-top', 'night-mid', 'night-low', 'star', 'moon', 'ground', 'dim'].forEach((name) => { out[name] = read(name); });
  return out;
}

function sky(g, w, h, stops) {
  const grad = g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([at, color]) => grad.addColorStop(at, color));
  g.globalAlpha = 1;
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}
// A soft round light: full color at the center, nothing at the edge.
function glow(g, x, y, rx, ry, color, alpha) {
  g.save();
  g.translate(x, y);
  g.scale(1, ry / rx);
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'transparent');
  g.globalAlpha = alpha;
  g.fillStyle = grad;
  g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill();
  g.restore();
  g.globalAlpha = 1;
}

const SCENES = {
  // Night water and a flat horizon. The dawn glow widens and brightens on the inhale and draws
  // in on the exhale. A faint reflection lies still on the water under it.
  ocean(g, w, h, breath, t, still, c) {
    const line = h * 0.6;
    sky(g, w, h, [[0, c['ink-top']], [0.6, c['ink-mid']], [0.6, c.water], [1, c['water-deep']]]);
    glow(g, w / 2, line, w * (0.34 + 0.3 * breath), h * (0.1 + 0.08 * breath), c.glow, 0.28 + 0.4 * breath);
    glow(g, w / 2, line, w * (0.12 + 0.1 * breath), h * 0.035, c['glow-core'], 0.4 + 0.45 * breath);
    g.fillStyle = c.water;
    g.fillRect(0, line, w, h - line);
    sky(g, w, h, [[0, 'transparent'], [0.6, 'transparent'], [0.6, c.water], [1, c['water-deep']]]);
    glow(g, w / 2, line + h * 0.012, w * (0.1 + 0.12 * breath), h * 0.06, c.glow, 0.1 + 0.16 * breath);
    g.globalAlpha = 0.35;
    g.fillStyle = c['glow-core'];
    g.fillRect(0, line - 0.5, w, 1);
    const rand = seeded(7);
    for (let i = 0; i < CONFIG.meditation.particles; i += 1) {
      const y = line + h * (0.03 + rand() * 0.3);
      const spread = (y - line) / (h * 0.4);
      const x = w / 2 + (rand() - 0.5) * w * (0.12 + spread * 0.5);
      const glint = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.7 + i * 2.1);
      g.globalAlpha = (0.04 + 0.2 * glint * breath) * (1 - spread * 0.6);
      g.fillRect(x, y, 10 + rand() * 16, 1.2);
    }
    g.globalAlpha = 1;
  },
  // Soft layers of trees; rays of light brighten on the inhale; a few fireflies drift.
  forest(g, w, h, breath, t, still, c) {
    sky(g, w, h, [[0, c['forest-top']], [0.5, c['forest-mid']], [1, c['forest-low']]]);
    g.fillStyle = c.ray;
    for (let i = 0; i < 4; i += 1) {
      const x = w * (0.15 + i * 0.22);
      g.globalAlpha = 0.03 + 0.1 * breath;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w * 0.1, 0); g.lineTo(x + w * 0.02, h); g.lineTo(x - w * 0.16, h); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    const rand = seeded(11);
    [[c['tree-1'], 0.5, 0.22], [c['tree-2'], 0.62, 0.3], [c['tree-3'], 0.76, 0.4]].forEach(([color, base, size], layer) => {
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
    g.fillStyle = c.firefly;
    for (let i = 0; i < CONFIG.meditation.particles; i += 1) {
      const x = fly() * w + (still ? 0 : Math.sin(t * 0.3 + i) * 18);
      const y = h * (0.3 + fly() * 0.5) + (still ? 0 : Math.cos(t * 0.24 + i * 1.7) * 14);
      g.globalAlpha = 0.15 + 0.6 * breath * (still ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.9 + i));
      g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  },
  // A deep sky; stars brighten with the breath; the moon's glow slowly swells.
  nightSky(g, w, h, breath, t, still, c) {
    sky(g, w, h, [[0, c['night-top']], [0.6, c['night-mid']], [1, c['night-low']]]);
    const rand = seeded(5);
    g.fillStyle = c.star;
    for (let i = 0; i < 46; i += 1) {
      const x = rand() * w;
      const y = rand() * h * 0.8;
      const twinkle = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * (0.6 + rand()) + i);
      g.globalAlpha = 0.15 + 0.7 * breath * twinkle;
      g.beginPath(); g.arc(x, y, 0.8 + rand() * 1.4, 0, Math.PI * 2); g.fill();
    }
    const mx = w * 0.72;
    const my = h * 0.24;
    glow(g, mx, my, w * (0.2 + 0.1 * breath), w * (0.2 + 0.1 * breath), c.moon, 0.3 + 0.25 * breath);
    g.fillStyle = c.moon;
    g.beginPath(); g.arc(mx, my, w * 0.07, 0, Math.PI * 2); g.fill();
    g.fillStyle = c.ground;
    g.fillRect(0, h * 0.9, w, h * 0.1);
  },
};

// createWorld(canvas, 'ocean', { reduced }) -> { draw(breath, seconds, dim), resize(), name }
export function createWorld(canvas, name, options = {}) {
  const scene = SCENES[name] || SCENES.ocean;
  const g = canvas.getContext && canvas.getContext('2d');
  const colors = palette();
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
      scene(g, width, height, shown, seconds, Boolean(options.reduced), colors);
      if (dim > 0) { g.globalAlpha = Math.min(0.96, dim); g.fillStyle = colors.dim; g.fillRect(0, 0, width, height); g.globalAlpha = 1; }
    },
  };
  world.resize();
  return world;
}
