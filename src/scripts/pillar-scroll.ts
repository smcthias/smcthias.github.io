// Web/Brand/Reach pillars: on desktop, pins #pillars-section and converts
// vertical scroll into horizontal movement across the cards — the one
// deliberate scroll-hijack exception (contained to this section only, per
// the design brief). Mobile and prefers-reduced-motion both get the plain
// stacked column instead (gsap.matchMedia below only ever registers the
// pin/scrub behavior for "desktop + motion allowed").
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initPillarScroll() {
  const section = document.getElementById('pillars-section');
  const track = document.querySelector<HTMLElement>('[data-pillar-track]');
  const controls = document.querySelector<HTMLElement>('.pillar-controls');
  const hint = document.querySelector<HTMLElement>('.pillar-hint');
  if (!section || !track) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    track.classList.add('is-horizontal');
    if (controls) controls.style.display = 'flex';
    if (hint) hint.style.display = 'block';

    const cards = gsap.utils.toArray<HTMLElement>('[data-pillar-card]', track);
    const dots = gsap.utils.toArray<HTMLElement>('[data-pillar-dots] span');
    const distance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => '+=' + distance(),
        invalidateOnRefresh: true,
        onUpdate(self) {
          const idx = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
          dots.forEach((d, i) => d.classList.toggle('bg-white', i === idx));
          dots.forEach((d, i) => d.classList.toggle('bg-zinc-700', i !== idx));
          if (hint && self.progress > 0.03) hint.style.display = 'none';
        },
        // Controls are absolutely positioned inside the pinned section, so
        // once the pin releases they'd otherwise ride along with the
        // section's box and briefly overlap whatever comes next — hide them
        // the instant we leave the pin's active range in either direction.
        onLeave() { if (controls) controls.style.display = 'none'; },
        onEnterBack() { if (controls) controls.style.display = 'flex'; },
        onLeaveBack() { if (controls) controls.style.display = 'none'; },
        onEnter() { if (controls) controls.style.display = 'flex'; },
      },
    });

    const st = tween.scrollTrigger!;
    const goTo = (index: number) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, index));
      st.scroll(st.start + (st.end - st.start) * (clamped / (cards.length - 1)));
    };
    const currentIndex = () => Math.round(st.progress * (cards.length - 1));

    const onNext = () => goTo(currentIndex() + 1);
    const onPrev = () => goTo(currentIndex() - 1);
    document.querySelector('[data-pillar-next]')?.addEventListener('click', onNext);
    document.querySelector('[data-pillar-prev]')?.addEventListener('click', onPrev);

    return () => {
      document.querySelector('[data-pillar-next]')?.removeEventListener('click', onNext);
      document.querySelector('[data-pillar-prev]')?.removeEventListener('click', onPrev);
      track.classList.remove('is-horizontal');
      if (controls) controls.style.display = 'none';
      if (hint) hint.style.display = 'none';
      gsap.set(track, { clearProps: 'transform' });
      st.kill();
    };
  });
}

document.addEventListener('astro:page-load', initPillarScroll);
