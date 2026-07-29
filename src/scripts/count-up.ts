// Counts each case-study result stat up from 0 to its authored value once it
// scrolls into view — <p data-count-up>209K+</p> — rather than the number
// just materializing all at once like a plain reveal.
//
// Mirrors image-reveal.ts's first-play-only delay: on the very first time a
// stat scrolls into view, it sits still for a beat (FIRST_PLAY_DELAY) before
// counting starts, so the count-up reads as a deliberate second beat the
// user actually notices rather than something that fires (and is easy to
// miss mid-scroll) the instant the section crosses the reveal threshold.
// Later re-entries (scrolling back up then down again) replay immediately,
// same rationale as image-reveal.ts: a repeat viewer doesn't need to wait
// through a dead pause again.
//
// The authored value's prefix/suffix (K/M/+/commas/" Days", etc.) is
// preserved as static text — only the numeric portion counts up. Values
// with no digits at all (e.g. "Custom") are left alone entirely.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FIRST_PLAY_DELAY = 0.6; // seconds — the pause before the first count-up starts
const COUNT_DURATION = 1.4;

function initCountUp() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // leave the authored final value exactly as rendered

  const els = document.querySelectorAll<HTMLElement>('[data-count-up]');

  els.forEach((el) => {
    if (el.dataset.countUpDone) return;
    el.dataset.countUpDone = '1';

    const raw = (el.textContent || '').trim();
    const match = raw.match(/^([^\d]*)([\d,]*\d)(.*)$/);
    if (!match) return; // no digits (e.g. "Custom") — nothing to count

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits.replace(/,/g, ''), 10);
    if (!Number.isFinite(target)) return;

    const hasComma = digits.includes(',');
    const format = (n: number) => prefix + (hasComma ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))) + suffix;

    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: target,
      duration: COUNT_DURATION,
      ease: 'power2.out',
      paused: true,
      onUpdate: () => { el.textContent = format(counter.value); },
    });

    let firstPlay = true;
    const play = () => {
      counter.value = 0;
      el.textContent = format(0);
      if (firstPlay) gsap.delayedCall(FIRST_PLAY_DELAY, () => tween.restart());
      else tween.restart();
      firstPlay = false;
    };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: play,
      onEnterBack: play,
    });
  });
}

document.addEventListener('astro:page-load', initCountUp);
