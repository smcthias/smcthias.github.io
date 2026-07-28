// Word-by-word scroll reveal for headline/statement copy. Replays every
// time the element re-enters the viewport (either scroll direction), not
// just the first time. Usage:
//   <h1 data-word-reveal data-word-reveal-speed="slow">Two lines...</h1>
// Speed: "slow" (hero, seen first) | "base" (default, section headings) |
// "fast" (supporting lines — subtext/captions skip the stagger feel).
//
// A word-reveal element can chain a plain fade-in on a following element
// once its own animation completes — for a headline + trailing subtext
// that should visibly follow rather than animate in together. The chained
// fade also replays: it's hidden again as soon as the headline leaves the
// viewport, so it's ready to fade in again on the next entry.
//   <h2 data-word-reveal data-reveal-next="#opener-subtext">...</h2>
//   <p id="opener-subtext" data-fade-reveal>...</p>
//
// Elements inside a [data-pillar-card] are skipped here on desktop: since
// all three pillar cards sit in the same vertical position (just
// translated horizontally by the pin), this file's vertical-scroll trigger
// would fire all three simultaneously. src/scripts/pillar-scroll.ts drives
// them instead, tied to which card is actually active. On mobile (stacked,
// no pin) or under reduced motion, this file handles them normally.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

const SPEEDS = {
  slow: { duration: 0.9, stagger: 0.09 },
  base: { duration: 0.65, stagger: 0.045 },
  fast: { duration: 0.4, stagger: 0.02 },
} as const;

function initWordReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll<HTMLElement>('[data-word-reveal]');

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;

  els.forEach((el) => {
    if (el.dataset.wordRevealDone) return;

    if (!reduced && isDesktop && el.closest('[data-pillar-card]')) {
      el.dataset.wordRevealDone = '1'; // handled by pillar-scroll.ts instead
      return;
    }

    el.dataset.wordRevealDone = '1';

    const revealNext = el.dataset.revealNext ? document.querySelector<HTMLElement>(el.dataset.revealNext) : null;

    if (reduced) {
      revealNext?.classList.add('is-visible'); // CSS fallback shows words/fades at full opacity anyway
      return;
    }

    const speedKey = (el.dataset.wordRevealSpeed as keyof typeof SPEEDS) || 'base';
    const { duration, stagger } = SPEEDS[speedKey];

    const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.set(split.words, { opacity: 0, y: '0.6em' });
    gsap.to(split.words, {
      opacity: 1,
      y: '0em',
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        // A flat viewport percentage (e.g. 'bottom 20%') doesn't account
        // for the element's own height — for a short element sitting near
        // the top of the page (like the hero heading), 'bottom 20%' of a
        // tall viewport can already be true at rest, before any scrolling,
        // so it would never show at all. Pin the exit point to 20% of the
        // element's OWN height instead: its bottom edge reaching that many
        // px down the viewport means 80% of the element has scrolled out
        // through the top. 'reverse' (not 'reset') so leaving actually
        // plays the words back out instead of snapping them to hidden.
        end: `bottom ${Math.round(el.offsetHeight * 0.2)}px`,
        toggleActions: 'restart reverse restart reverse',
        onLeave: () => revealNext?.classList.remove('is-visible'),
        onLeaveBack: () => revealNext?.classList.remove('is-visible'),
      },
      onComplete: () => revealNext?.classList.add('is-visible'),
    });
  });
}

document.addEventListener('astro:page-load', initWordReveal);
