// ──────────────────────────────────────────────────────────────────────────
// Site motion layer. Three responsibilities, all optional and degradable:
//   1. Lenis smooth scroll (desktop + mobile)
//   2. GSAP hero entrance timeline (one orchestrated page-load moment)
//   3. IntersectionObserver scroll reveals for [data-reveal]
//
// Everything is gated on prefers-reduced-motion. With reduced motion or no JS,
// the page is fully visible and scrolls natively — no library loads its effect.
// Re-initialised on every astro:page-load so it survives View Transitions.
// ──────────────────────────────────────────────────────────────────────────
import Lenis from 'lenis';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let observer: IntersectionObserver | null = null;
let rafId = 0;

function teardown() {
  if (lenis) { lenis.destroy(); lenis = null; }
  if (observer) { observer.disconnect(); observer = null; }
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

function setupReveals() {
  // Tell the head-level failsafe that reveals are handled, so it won't force-show.
  document.documentElement.dataset.revealsInit = '1';

  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length) return;

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay || 0);
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-in');
        observer?.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
  );
  items.forEach((el) => observer!.observe(el));
}

function init() {
  teardown();
  setupSmoothScroll();
  setupReveals();
}

// astro:page-load fires on first load AND after each View Transition nav.
document.addEventListener('astro:page-load', init);
// Tear down before the DOM is swapped so nothing leaks across a transition.
document.addEventListener('astro:before-swap', teardown);
