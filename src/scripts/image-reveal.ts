// Generic scroll-triggered expand+fade, for images/visual blocks outside
// the pillars' horizontal-scroll system — the same treatment as the pillar
// cards' visuals (src/scripts/pillar-scroll.ts: opacity 0→1, scale 0.88→1,
// 0.7s power3.out by default), just driven by a plain vertical ScrollTrigger
// instead of the pillars' fraction-based visibility. Same conventions as
// word-reveal.ts: replays every time the element re-enters the viewport,
// and animates back out (reverse) on exit rather than snapping to hidden,
// with the exit point pinned to the element's own height (not a flat
// viewport percentage — see word-reveal.ts for why that's the trap).
//   <div data-image-reveal>...</div>
//   <div data-image-reveal data-image-reveal-duration="1.4">...</div>
// data-image-reveal-delay only applies to the very first reveal (e.g. to
// sequence an above-the-fold element after something else on page load) —
// replays triggered by later scroll re-entry always play immediately, so
// scrolling back up to an already-seen element doesn't reintroduce a dead
// pause before it reappears.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initImageReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS fallback (global.css) keeps these at full opacity/scale

  const els = document.querySelectorAll<HTMLElement>('[data-image-reveal]');

  els.forEach((el) => {
    if (el.dataset.imageRevealDone) return;
    el.dataset.imageRevealDone = '1';

    const duration = parseFloat(el.dataset.imageRevealDuration || '') || 0.7;
    const initialDelay = parseFloat(el.dataset.imageRevealDelay || '') || 0;
    let firstPlay = true;

    gsap.set(el, { opacity: 0, scale: 0.88 });
    const tween = gsap.to(el, { opacity: 1, scale: 1, duration, ease: 'power3.out', paused: true });

    const play = () => {
      if (firstPlay && initialDelay) gsap.delayedCall(initialDelay, () => tween.restart());
      else tween.restart();
      firstPlay = false;
    };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: `bottom ${Math.round(el.offsetHeight * 0.2)}px`,
      onEnter: play,
      onEnterBack: play,
      onLeave: () => tween.reverse(),
      onLeaveBack: () => tween.reverse(),
    });
  });
}

document.addEventListener('astro:page-load', initImageReveal);
