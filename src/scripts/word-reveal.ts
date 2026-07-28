// Word-by-word scroll reveal for headline/statement copy. Usage:
//   <h1 data-word-reveal data-word-reveal-speed="slow">Two lines...</h1>
// Speed: "slow" (hero, seen first) | "base" (default, section headings) |
// "fast" (supporting lines — subtext/captions skip the stagger feel).
//
// A word-reveal element can chain a plain fade-in on a following element
// once its own animation completes — for a headline + trailing subtext
// that should visibly follow rather than animate in together:
//   <h2 data-word-reveal data-reveal-next="#opener-subtext">...</h2>
//   <p id="opener-subtext" data-fade-reveal>...</p>
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

  els.forEach((el) => {
    if (el.dataset.wordRevealDone) return;
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
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => revealNext?.classList.add('is-visible'),
    });
  });
}

document.addEventListener('astro:page-load', initWordReveal);
