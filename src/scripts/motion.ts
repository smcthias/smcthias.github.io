// ──────────────────────────────────────────────────────────────────────────
// Site motion layer: Lenis smooth scroll only. All other motion is CSS —
// the hero registration moment on load, and hover-triggered snaps everywhere
// else. (The old IntersectionObserver scroll-reveal system was removed with
// the "In Register" pass: content renders immediately; motion is earned by
// hover, per the site's motion policy.)
//
// Gated on prefers-reduced-motion. With reduced motion or no JS the page
// scrolls natively. Re-initialised on every astro:page-load so it survives
// View Transitions.
// ──────────────────────────────────────────────────────────────────────────
import Lenis from 'lenis';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let rafId = 0;

function teardown() {
  if (lenis) { lenis.destroy(); lenis = null; }
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
}

function setupSmoothScroll() {
  if (prefersReduced()) return;
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  // In-page anchor links scroll smoothly through Lenis.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); lenis?.scrollTo(target as HTMLElement, { offset: -80 }); }
    });
  });
}

function init() {
  teardown();
  setupSmoothScroll();
}

// astro:page-load fires on first load AND after each View Transition nav.
document.addEventListener('astro:page-load', init);
// Tear down before the DOM is swapped so nothing leaks across a transition.
document.addEventListener('astro:before-swap', teardown);
