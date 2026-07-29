// Generic scroll-triggered fade + slide-down-into-place, for standalone UI
// bits that aren't headline text (word-reveal.ts) or images/visuals
// (image-reveal.ts) — e.g. the homepage hero's scroll indicator. Same
// opacity/y treatment as the nav's own load-in (src/components/Nav.astro).
// Same scroll-trigger conventions as the other reveal systems: replays on
// re-entry, reverses (not snaps) on exit, exit point pinned to the
// element's own height rather than a flat viewport percentage.
//   <div data-drop-reveal>...</div>
//   <div data-drop-reveal data-drop-reveal-delay="3.7">...</div>
// data-drop-reveal-delay only applies to the very first reveal — see
// image-reveal.ts for why later scroll re-entries always play immediately.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initDropReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS fallback (global.css) keeps these at full opacity/position

  const els = document.querySelectorAll<HTMLElement>('[data-drop-reveal]');

  els.forEach((el) => {
    if (el.dataset.dropRevealDone) return;
    el.dataset.dropRevealDone = '1';

    const initialDelay = parseFloat(el.dataset.dropRevealDelay || '') || 0;
    let firstPlay = true;

    gsap.set(el, { opacity: 0, y: -16 });
    const tween = gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', paused: true });

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

document.addEventListener('astro:page-load', initDropReveal);
