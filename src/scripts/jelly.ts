// Spring-driven "jelly + magnetic" hover for pill buttons — the same effect as
// the hero "Play showreel" pill (src/pages/index.astro), generalised. Opt in
// with `data-jelly` (and the `jelly` class for the shimmer sweep, see
// global.css). The rAF loop only runs while the pointer/focus is on the button
// or the springs are still settling; at rest all inline styles are cleared.
// Skipped on touch and prefers-reduced-motion.
function initJelly() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_PULL = 8;
  const HOVER_SCALE = 1.06;

  type Spring = { p: number; v: number; t: number; k: number; c: number };
  const mk = (p: number, k: number, c: number): Spring => ({ p, v: 0, t: p, k, c });

  document.querySelectorAll<HTMLElement>('[data-jelly]').forEach((el) => {
    if (el.dataset.jellyBound) return;
    el.dataset.jellyBound = '1';
    const btn: HTMLElement = el;

    const x = mk(0, 180, 16);
    const y = mk(0, 180, 16);
    const sc = mk(1, 230, 11); // under-damped → springy overshoot
    const wob = mk(0, 260, 7); // jelly wobble amount, kicked by impulses
    const all = [x, y, sc, wob];

    let raf = 0;
    let last = 0;
    let hovering = false;
    let focused = false;

    const apply = () => {
      const w = wob.p;
      const R = btn.offsetHeight / 2;
      const sx = sc.p * (1 + w * 0.05);
      const sy = sc.p * (1 - w * 0.05);
      btn.style.transform = `translate3d(${x.p.toFixed(2)}px, ${y.p.toFixed(2)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      const r = (m: number) => Math.max(0, R * (1 + m * w)).toFixed(1) + 'px';
      btn.style.borderRadius = `${r(0.7)} ${r(-0.5)} ${r(0.6)} ${r(-0.6)} / ${r(-0.5)} ${r(0.7)} ${r(-0.6)} ${r(0.6)}`;
    };
    const clear = () => {
      btn.style.removeProperty('transform');
      btn.style.removeProperty('border-radius');
      btn.style.removeProperty('will-change');
    };
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      const h = dt / 2;
      for (let i = 0; i < 2; i++) {
        for (const s of all) {
          s.v += (-s.k * (s.p - s.t) - s.c * s.v) * h;
          s.p += s.v * h;
        }
      }
      apply();
      const settled = all.every((s) => Math.abs(s.p - s.t) < 0.002 && Math.abs(s.v) < 0.01);
      if (settled && !hovering && !focused) {
        raf = 0;
        all.forEach((s) => { s.p = s.t; s.v = 0; });
        clear();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    const wake = () => {
      if (raf) return;
      btn.style.willChange = 'transform';
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const enabled = () => fine.matches && !reduced.matches;
    const engage = () => { sc.t = HOVER_SCALE; wob.v += 9; wake(); };
    const release = () => { sc.t = 1; x.t = 0; y.t = 0; wob.v -= 4; wake(); };

    const move = (e: PointerEvent) => {
      // Centre of the button without the current spring offset, so the pull
      // doesn't feed back on itself.
      const b = btn.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2 - x.p);
      const dy = e.clientY - (b.top + b.height / 2 - y.p);
      const d = Math.hypot(dx, dy) || 1;
      const pull = Math.min(MAX_PULL, d * 0.12);
      x.t = (dx / d) * pull;
      y.t = (dy / d) * pull;
      wake();
    };

    btn.addEventListener('pointerenter', (e) => {
      if (!enabled() || e.pointerType !== 'mouse') return;
      hovering = true;
      btn.addEventListener('pointermove', move);
      engage();
    });
    btn.addEventListener('pointerleave', () => {
      if (!hovering) return;
      hovering = false;
      btn.removeEventListener('pointermove', move);
      if (!focused) release();
    });
    btn.addEventListener('focus', () => {
      if (!enabled() || !btn.matches(':focus-visible')) return;
      focused = true;
      engage();
    });
    btn.addEventListener('blur', () => {
      if (!focused) return;
      focused = false;
      if (!hovering) release();
    });
  });
}
document.addEventListener('astro:page-load', initJelly);
