// Sitewide easing-only smooth scroll (Lenis) + GSAP ScrollTrigger sync.
// Never intercepts scroll direction or captures input — the one exception
// is the pillars horizontal-scroll section (src/scripts/pillar-scroll.ts),
// which is deliberately self-contained.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

function initSmoothScroll() {
  window.__lenis?.destroy();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__lenis = undefined;
    return;
  }

  const lenis = new Lenis({ autoRaf: false });
  window.__lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Land on the right spot if the page loaded with a hash (e.g. navigating
  // to /#contact). Otherwise every fresh navigation should start at the
  // top, not wherever the previous page happened to be scrolled to — Lenis
  // tracks its own virtual scroll position, so it needs to be told this
  // explicitly rather than assuming it'll pick up the browser's reset.
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) requestAnimationFrame(() => lenis.scrollTo(target as HTMLElement, { offset: -80, immediate: true }));
  } else {
    lenis.scrollTo(0, { immediate: true });
  }
}

// Reset the browser's own scroll position before the new page is swapped
// in, so Lenis initializes against a true top-of-page on the next
// astro:page-load rather than inheriting the outgoing page's position.
document.addEventListener('astro:after-swap', () => {
  if (!window.location.hash) window.scrollTo(0, 0);
});

// Bound once (not inside initSmoothScroll, which reruns on every
// navigation) — resolves window.__lenis live at click time instead of
// closing over a Lenis instance that may since have been destroyed.
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement)?.closest('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.getAttribute('href')!, window.location.href);
  if (url.pathname !== window.location.pathname || !url.hash) return;
  const target = document.querySelector(url.hash);
  if (!target) return;
  e.preventDefault();
  window.__lenis?.scrollTo(target as HTMLElement, { offset: -80 });
});

document.addEventListener('astro:page-load', initSmoothScroll);
