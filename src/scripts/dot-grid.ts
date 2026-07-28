// Interactive dot grid, opted into per-page via a
// <canvas id="dot-grid-canvas" data-fade-trigger="#some-section">. Sits
// behind whatever section(s) precede the fade-trigger element (their own
// bg-zinc-950 needs dropping so it shows through — see index.astro/
// about.astro for the pattern). Two independent concerns, deliberately kept
// separate rather than one scroll-driven redraw loop (that pattern is what
// made the old canvas weave feel glitchy — see the "Scanline theme &
// motion policy" note in CLAUDE.md):
//   1. A plain requestAnimationFrame loop, unrelated to scroll, that eases
//      each dot away from the cursor within a radius and back to rest when
//      the cursor moves away. Only runs on hover-capable pointers — touch
//      devices get a static grid with no loop at all.
//   2. A single GSAP/ScrollTrigger-scrubbed opacity tween on the canvas
//      element itself, fading it out as data-fade-trigger's element scrolls
//      into place (e.g. the homepage's #pillars-section — the Web/Brand/
//      Reach section). Cheap regardless of how many dots exist, and
//      independent of the rAF loop above — it just toggles whether that
//      loop keeps running once fully faded, to save battery once invisible.
//      No data-fade-trigger (or a selector that matches nothing) means no
//      fade at all — relies on subsequent sections' own opaque backgrounds
//      to occlude it once scrolled past instead.
// Wired sitewide via Layout.astro like the other reveal scripts, but bails
// immediately if the canvas isn't on the page.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SPACING = 44;
const DOT_RADIUS = 1;
const DOT_COLOR = '#27272a'; // zinc-800 — darker/more subtle against the zinc-950 page bg
const REPEL_RADIUS = 190;
const REPEL_STRENGTH = 46;
const EASE = 0.15;

let cleanup: (() => void) | null = null;

function initDotGrid() {
  cleanup?.();
  cleanup = null;

  const canvas = document.getElementById('dot-grid-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS fallback (global.css) hides the canvas outright

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const interactive = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dots: { x: number; y: number; cx: number; cy: number }[] = [];
  const mouse = { x: -9999, y: -9999 };
  let rafId = 0;
  let faded = false;

  const buildGrid = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * SPACING;
        const y = row * SPACING;
        dots.push({ x, y, cx: x, cy: y });
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = DOT_COLOR;
    for (const d of dots) {
      if (interactive) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let targetX = d.x;
        let targetY = d.y;
        if (dist < REPEL_RADIUS) {
          const falloff = 1 - dist / REPEL_RADIUS;
          const push = falloff * REPEL_STRENGTH;
          const nx = dist === 0 ? 1 : dx / dist;
          const ny = dist === 0 ? 0 : dy / dist;
          targetX = d.x + nx * push;
          targetY = d.y + ny * push;
        }
        d.cx += (targetX - d.cx) * EASE;
        d.cy += (targetY - d.cy) * EASE;
      } else {
        d.cx = d.x;
        d.cy = d.y;
      }
      ctx.beginPath();
      ctx.arc(d.cx, d.cy, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    draw();
    rafId = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (!rafId) rafId = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  const onMouseLeave = () => {
    mouse.x = -9999;
    mouse.y = -9999;
  };
  const onResize = () => buildGrid();

  buildGrid();

  if (interactive) {
    startLoop();
    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
  } else {
    draw(); // static grid, no loop needed
  }
  window.addEventListener('resize', onResize);

  const fadeTriggerSelector = canvas.dataset.fadeTrigger;
  const fadeTrigger = fadeTriggerSelector ? document.querySelector<HTMLElement>(fadeTriggerSelector) : null;
  let st: ScrollTrigger | null = null;
  if (fadeTrigger) {
    st = ScrollTrigger.create({
      trigger: fadeTrigger,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate(self) {
        canvas.style.opacity = String(1 - self.progress);
        const done = self.progress >= 1;
        if (done !== faded) {
          faded = done;
          if (interactive) {
            if (faded) stopLoop();
            else startLoop();
          }
        }
      },
    });
  }

  cleanup = () => {
    stopLoop();
    window.removeEventListener('mousemove', onMouseMove);
    document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', onResize);
    st?.kill();
  };
}

document.addEventListener('astro:page-load', initDotGrid);
