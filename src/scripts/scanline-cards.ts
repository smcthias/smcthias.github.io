// Scanline hover treatment: the plain <img> stays in place for layout and
// scroll — the image only shreds into horizontal strips for a brief pulse
// on hover (the site's "pieces assembling" theme at whisper volume).
// Used on the homepage Featured Work grid, the works listing, case-study
// visuals, blog cards, and gallery thumbnails. Desktop only; mobile /
// no-JS / reduced-motion keep the plain <img>.
//
// The canvas and strip rows are built lazily on first hover, so a large
// grid (29 gallery thumbs) costs nothing until touched. Containers need
// position:relative + overflow:hidden and are marked [data-sl-hover].
//
// (The earlier construct/deconstruct-on-scroll treatment lives in git
// history if ever wanted again.)
export function initScanlineHover() {
  const boxes = Array.from(document.querySelectorAll('[data-sl-hover]')) as HTMLElement[];
  if (!boxes.length) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const PULSE_DUR = 0.55;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  type PulseRow = { ry: number; rh: number; dir: number; mag: number; rag: number };

  boxes.forEach((box) => {
    const imgEl = box.querySelector('img') as HTMLImageElement | null;
    if (!imgEl) return;

    // The shred pulse replaces any CSS zoom-on-hover at this breakpoint —
    // the two effects fight (the img hides mid-scale while the canvas
    // draws unscaled strips).
    imgEl.style.transform = 'none';

    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let rows: PulseRow[] = [];
    let w = 0;
    let h = 0;
    let pulsing = false;

    function setup(): boolean {
      if (!imgEl!.complete || !imgEl!.naturalWidth) return false;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText =
          'position:absolute;inset:0;display:none;pointer-events:none;z-index:3;';
        ctx = canvas.getContext('2d');
        if (!ctx) {
          canvas = null;
          return false;
        }
        box.appendChild(canvas);
      }
      if (box.clientWidth !== w || box.clientHeight !== h) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = box.clientWidth;
        h = box.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        rows = [];
        let ry = 0;
        while (ry < h) {
          const rh = Math.min(rand(4, 14), h - ry);
          rows.push({
            ry,
            rh,
            dir: Math.random() < 0.5 ? -1 : 1,
            mag: rand(6, 18),
            rag: rand(10, 44),
          });
          ry += rh;
        }
      }
      return true;
    }

    box.addEventListener('mouseenter', () => {
      if (pulsing || !setup()) return;
      pulsing = true;

      const scale = Math.max(w / imgEl!.naturalWidth, h / imgEl!.naturalHeight);
      const sW = w / scale;
      const sH = h / scale;
      const sX = (imgEl!.naturalWidth - sW) / 2;
      const sY = (imgEl!.naturalHeight - sH) / 2;

      imgEl!.style.visibility = 'hidden';
      canvas!.style.display = 'block';
      const startAt = performance.now();

      function frame(now: number) {
        const ph = (now - startAt) / 1000 / PULSE_DUR;
        if (ph >= 1) {
          ctx!.clearRect(0, 0, w, h);
          canvas!.style.display = 'none';
          imgEl!.style.visibility = '';
          pulsing = false;
          return;
        }
        const k = Math.sin(ph * Math.PI);
        ctx!.clearRect(0, 0, w, h);
        for (const r of rows) {
          const rag = r.rag * 0.5 * k;
          const dw = w - rag * 2;
          if (dw <= 2) continue;
          const rowSy = sY + (r.ry / h) * sH;
          const rowSh = (r.rh / h) * sH;
          const rowSx = sX + (rag / w) * sW;
          const rowSw = (dw / w) * sW;
          ctx!.drawImage(
            imgEl!,
            rowSx,
            rowSy,
            rowSw,
            rowSh,
            rag + r.dir * r.mag * k,
            r.ry,
            dw,
            r.rh
          );
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  });
}
