// Case-study detail gallery (.hstrip, works/[slug].astro): click-and-hold
// drag-to-scroll, plus prev/next arrow buttons. Visual language for the
// arrows is borrowed from the homepage pillars section (pillar-scroll.ts),
// but this is plain native scroll underneath — no pin, no scroll-hijack,
// just scrollLeft writes and scrollBy() — since the gallery isn't full-page
// like the pillars are.
// Wired sitewide via Layout.astro like the other reveal/scroll scripts, but
// no-ops on pages with no [data-hstrip-wrap].

function initHstripDrag() {
  const wraps = document.querySelectorAll<HTMLElement>('[data-hstrip-wrap]');
  const teardowns: Array<() => void> = [];

  wraps.forEach((wrap) => {
    const strip = wrap.querySelector<HTMLElement>('[data-hstrip]');
    if (!strip) return;
    const prevBtn = wrap.querySelector<HTMLButtonElement>('[data-hstrip-prev]');
    const nextBtn = wrap.querySelector<HTMLButtonElement>('[data-hstrip-next]');

    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
      strip.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) dragged = true;
      strip.scrollLeft = startScroll - dx;
    };
    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      strip.classList.remove('is-dragging');
      try {
        strip.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may already be released (e.g. pointercancel) — fine to ignore.
      }
    };
    // A drag that happens to end over an <img> would otherwise also fire a
    // click on it; swallow just that one synthetic click.
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };

    strip.addEventListener('pointerdown', onPointerDown);
    strip.addEventListener('pointermove', onPointerMove);
    strip.addEventListener('pointerup', endDrag);
    strip.addEventListener('pointercancel', endDrag);
    strip.addEventListener('click', onClickCapture, true);

    const scrollByPage = (dir: 1 | -1) => {
      strip.scrollBy({ left: dir * strip.clientWidth * 0.9, behavior: 'smooth' });
    };
    const onPrev = () => scrollByPage(-1);
    const onNext = () => scrollByPage(1);
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    // Fade + disable an arrow once its direction has nothing left to scroll to.
    const EPS = 4;
    const updateEdges = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      if (prevBtn) prevBtn.disabled = strip.scrollLeft <= EPS;
      if (nextBtn) nextBtn.disabled = strip.scrollLeft >= max - EPS;
    };
    strip.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    updateEdges();

    // Detail images use loading="lazy" and can still be pending when this
    // runs (e.g. the gallery starts below the fold) — scrollWidth is 0/short
    // until each one finishes loading, which would otherwise leave the
    // arrows stuck in whatever disabled state was computed too early.
    const images = Array.from(strip.querySelectorAll('img'));
    const onImageLoad = () => updateEdges();
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImageLoad);
    });

    teardowns.push(() => {
      strip.removeEventListener('pointerdown', onPointerDown);
      strip.removeEventListener('pointermove', onPointerMove);
      strip.removeEventListener('pointerup', endDrag);
      strip.removeEventListener('pointercancel', endDrag);
      strip.removeEventListener('click', onClickCapture, true);
      images.forEach((img) => img.removeEventListener('load', onImageLoad));
      strip.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
    });
  });

  return () => teardowns.forEach((fn) => fn());
}

let cleanup: (() => void) | null = null;
document.addEventListener('astro:page-load', () => {
  cleanup?.();
  cleanup = initHstripDrag();
});
