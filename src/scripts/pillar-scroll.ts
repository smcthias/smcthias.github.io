// Web/Brand/Reach pillars: on desktop, pins #pillars-section and converts
// vertical scroll into horizontal movement across the cards — the one
// deliberate scroll-hijack exception (contained to this section only, per
// the design brief). Mobile and prefers-reduced-motion both get the plain
// stacked column instead (gsap.matchMedia below only ever registers the
// pin/scrub behavior for "desktop + motion allowed").
//
// Each card's heading + list + visual also animate in (word-by-word
// heading, then the list items, with the visual expanding/fading in
// alongside the heading) — but tied to how much of that card is actually
// on screen, not to vertical scroll position: all three cards share the
// same vertical spot in the pinned section (only translated horizontally),
// so the generic vertical-scroll word-reveal system (word-reveal.ts) would
// fire all three at once. Each card's content starts revealing as soon as
// a meaningful amount of the card has scrolled into view (not only once
// it's the single "current" card) and stays revealed until the card has
// mostly scrolled back out — not the instant the next card becomes
// current — so it never disappears while still visibly on screen.
//
// The first card is a special case: the pin's own scroll range (and thus
// updateCardVisibility below) only starts at 'top top', once the section
// is fully pinned — well after the section (and its first card) is
// already visible in normal scroll flow. A separate, earlier trigger
// reveals card 0 as soon as it approaches, same threshold as the rest of
// the site's word-reveal.
//
// The last card is also a special case, in the other direction: unlike
// cards 0→1 and 1→2, there's no next card sliding in behind it to drive
// its exit through the normal overlap-fraction check, so without help it
// would stay at 100% visible right up to the exact instant the pin
// releases — the pin holds the pillars section fixed while horizontal
// scroll happens, so as soon as that finishes there's nothing left to pin
// for, and it released as soon as the user's next scroll tick, whether or
// not the exit animation was ready. That read as an abrupt pop. The pin's
// scroll range is padded with extra distance (see holdDistance()) after
// the horizontal scroll completes — the track stops moving once it
// reaches the last card (a separate, unpadded ScrollTrigger drives the
// horizontal scrub and simply holds its final position once its own,
// shorter range is used up), but the *pin itself* keeps consuming scroll
// input for a while longer. updateCardVisibility keeps being fed a
// conceptual "phantom" offset that keeps advancing past the track's real
// width during that padding, so the same overlap-fraction math that
// handles every other transition naturally decays the last card's
// fraction below EXIT_THRESHOLD partway through — with room left
// afterward for its reverse animation to actually play out while still
// pinned, rather than the pin releasing (and page scroll resuming) the
// instant it starts.
//
// All of them reset when the pin itself is left, so re-entering the
// section always starts from the first card.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

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

    // One paused timeline per card: the visual expands + fades in
    // alongside the heading words staggering in, then the list items
    // stagger in just after. play()/reverse-to-start via pause(0) drive it
    // based on visibility, not each element's own scroll trigger.
    const cardTimelines = cards.map((card) => {
      const visual = card.querySelector<HTMLElement>('[data-pillar-visual]');
      const heading = card.querySelector<HTMLElement>('h2[data-word-reveal]');
      const items = gsap.utils.toArray<HTMLElement>('li[data-word-reveal]', card);

      // Hide via standalone gsap.set() (renders immediately) rather than a
      // .set() chained onto the paused timeline, which only applies once
      // the timeline actually renders — a paused timeline that's never
      // been played won't, leaving untouched cards at their natural
      // (visible) opacity instead of hidden.
      const headingWords = heading ? SplitText.create(heading, { type: 'words', wordsClass: 'word' }).words : [];
      const itemWords = items.flatMap((li) => SplitText.create(li, { type: 'words', wordsClass: 'word' }).words);
      if (visual) gsap.set(visual, { opacity: 0, scale: 0.88 });
      if (headingWords.length) gsap.set(headingWords, { opacity: 0, y: '0.6em' });
      if (itemWords.length) gsap.set(itemWords, { opacity: 0, y: '0.6em' });

      const tl = gsap.timeline({ paused: true });
      if (visual) {
        tl.to(visual, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0);
      }
      if (headingWords.length) {
        tl.to(headingWords, { opacity: 1, y: '0em', duration: 0.6, stagger: 0.045, ease: 'power3.out' }, 0);
      }
      if (itemWords.length) {
        tl.to(itemWords, { opacity: 1, y: '0em', duration: 0.4, stagger: 0.06, ease: 'power3.out' }, headingWords.length ? '-=0.35' : 0);
      }
      return tl;
    });

    // Hysteresis band, not a single threshold: a card only STARTS
    // revealing once a large majority (80%) of its width is on screen —
    // not just barely peeking in — but once shown, it keeps that state
    // until it's mostly gone (below 20%, i.e. 80% out of the viewport)
    // rather than at the same 80% mark, so it doesn't disappear the
    // instant it dips under 80% while still clearly visible. Cards are
    // 85vw wide in a 100vw viewport with no gap, so a not-yet-scrolled-to
    // neighbor always peeks in by ~17.6% of its own width at rest —
    // comfortably under the 80% enter threshold, so it doesn't fire before
    // the user actually scrolls toward it. hideCard() reverses the card's
    // timeline rather than snapping it to frame 0, so the visual/heading/
    // list actually animate back out over that remaining 20% sliver
    // instead of popping away.
    const ENTER_THRESHOLD = 0.8;
    const EXIT_THRESHOLD = 0.2;

    // Extra pin-scroll distance appended after the horizontal scroll
    // finishes, purely to give the last card room to hold, then animate
    // out, before the pin lets go. The same overlap-fraction math used for
    // every other transition needs (innerWidth - EXIT_THRESHOLD *
    // lastCardWidth) px of continued "phantom" offset to decay the last
    // card's fraction below EXIT_THRESHOLD on its own (derived the same
    // way as any other card's exit point); POST_EXIT_HOLD is added on top
    // of that so there's runway for the reverse animation to actually play
    // while still pinned, instead of firing right as the pin releases.
    const POST_EXIT_HOLD = () => window.innerHeight * 0.6;
    const HOLD_SCALE = 1 / 3; // scales the whole hold (pre- and post-decay) — was cut in half, then cut by a further third.
    const holdDistance = () => {
      const lastCardWidth = cards[cards.length - 1]?.offsetWidth ?? 0;
      return (Math.max(0, window.innerWidth - EXIT_THRESHOLD * lastCardWidth) + POST_EXIT_HOLD()) * HOLD_SCALE;
    };
    const totalDistance = () => distance() + holdDistance();

    const shown = new Set<number>();
    const updateCardVisibility = (viewLeft: number) => {
      const viewRight = viewLeft + window.innerWidth;
      cards.forEach((card, i) => {
        const cardLeft = card.offsetLeft;
        const cardRight = cardLeft + card.offsetWidth;
        const overlap = Math.max(0, Math.min(cardRight, viewRight) - Math.max(cardLeft, viewLeft));
        const fraction = card.offsetWidth ? overlap / card.offsetWidth : 0;
        if (fraction > ENTER_THRESHOLD) showCard(i);
        else if (fraction < EXIT_THRESHOLD) hideCard(i);
      });
    };
    const showCard = (i: number) => {
      if (shown.has(i)) return;
      shown.add(i);
      cardTimelines[i]?.restart();
    };
    const hideCard = (i: number) => {
      if (!shown.has(i)) return;
      shown.delete(i);
      cardTimelines[i]?.reverse();
    };
    // Safety net for when the pin is left (in either direction) with a
    // card still marked shown — normally the last card's own exit already
    // fires naturally during the hold (see holdDistance() above) before
    // this ever runs, but route through hideCard (reverse, not an instant
    // snap) regardless, so nothing can pop away abruptly even in an edge
    // case (e.g. a very fast/large scroll jump).
    const resetAll = () => {
      [...shown].forEach((i) => hideCard(i));
    };

    // The pin's own scroll range (and updateCardVisibility) only starts at
    // 'top top', once the section is fully pinned — later than when the
    // section is already visible in normal scroll flow. Reveal the first
    // card as soon as it approaches instead, at the same ~80%-visible
    // point as the rest of the pillars, so it doesn't lag behind its
    // visual. The section is exactly one viewport tall (md:h-screen), so
    // "80% of it visible" is precisely when its top edge reaches 20% down
    // the viewport — 'top 20%'.
    const earlyTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 20%',
      end: 'top top',
      onEnter: () => showCard(0),
      onLeaveBack: () => hideCard(0),
    });

    // Two separate ScrollTriggers on the same section, deliberately: this
    // one drives only the horizontal scrub (unpadded — end is the actual
    // track distance) so it naturally holds at its final position once its
    // own, shorter range is exhausted, without any manual clamping. It
    // does not pin anything itself.
    const scrubTrigger = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        scrub: 1,
        start: 'top top',
        end: () => '+=' + distance(),
        invalidateOnRefresh: true,
      },
    }).scrollTrigger!;

    // This one owns the pin, over the padded (horizontal-scroll +
    // hold) range, and feeds updateCardVisibility a "phantom" offset that
    // keeps advancing past the real track width during the hold — see the
    // file header and holdDistance() above.
    const st = ScrollTrigger.create({
      trigger: section,
      pin: true,
      start: 'top top',
      end: () => '+=' + totalDistance(),
      invalidateOnRefresh: true,
      onUpdate(self) {
        const dist = distance();
        const viewLeft = self.progress * totalDistance();
        const frac = dist ? Math.min(1, viewLeft / dist) : 0;
        const idx = Math.min(cards.length - 1, Math.round(frac * (cards.length - 1)));
        dots.forEach((d, i) => d.classList.toggle('bg-white', i === idx));
        dots.forEach((d, i) => d.classList.toggle('bg-zinc-700', i !== idx));
        if (hint && viewLeft > dist * 0.03) hint.style.display = 'none';
        updateCardVisibility(viewLeft);
      },
      // Controls are absolutely positioned inside the pinned section, so
      // once the pin releases they'd otherwise ride along with the
      // section's box and briefly overlap whatever comes next — hide them
      // the instant we leave the pin's active range in either direction.
      onLeave() { if (controls) controls.style.display = 'none'; resetAll(); },
      onEnterBack() { if (controls) controls.style.display = 'flex'; },
      onLeaveBack() { if (controls) controls.style.display = 'none'; resetAll(); },
      onEnter() { if (controls) controls.style.display = 'flex'; },
    });

    // This pin's spacer just reserved a large chunk of extra document
    // height (the horizontal-scroll distance plus the hold — see
    // holdDistance() above). Any other ScrollTrigger on the page for
    // content further down (e.g. every word-reveal.ts heading below this
    // section) had its start/end computed before that height existed, so
    // it's now stale — off by roughly this pin's total range, making those
    // elements' reveals fire (and immediately un-fire) long before they're
    // actually anywhere near the viewport. The static ScrollTrigger.refresh()
    // doesn't reliably re-settle already-created triggers here (empirically
    // confirmed: calling it, even twice, left stale triggers unchanged);
    // refreshing each registered instance directly does.
    ScrollTrigger.getAll().forEach((t) => t.refresh());
    // A one-time fix-up isn't enough: something (a late resize, an image or
    // font finishing load, etc.) triggers GSAP's own automatic global
    // refresh afterward — empirically confirmed a couple seconds after load
    // in this environment — and that automatic pass re-stales things the
    // same way the initial one did, undoing the fix above. Re-apply it on
    // every subsequent 'refresh' too, not just this pin's own setup.
    // Refreshing individual instances (not calling the static
    // ScrollTrigger.refresh() again) avoids re-triggering this same
    // 'refresh' event — but guard re-entrancy anyway in case that
    // assumption is ever wrong, rather than risking an infinite loop.
    let fixingUp = false;
    const onGlobalRefresh = () => {
      if (fixingUp) return;
      fixingUp = true;
      ScrollTrigger.getAll().forEach((t) => t.refresh());
      fixingUp = false;
    };
    ScrollTrigger.addEventListener('refresh', onGlobalRefresh);

    const goTo = (index: number) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, index));
      const dist = distance();
      const targetViewLeft = (clamped / (cards.length - 1)) * dist;
      const targetProgress = targetViewLeft / totalDistance();
      st.scroll(st.start + (st.end - st.start) * targetProgress);
    };
    const currentIndex = () => {
      const dist = distance();
      const viewLeft = Math.min(st.progress * totalDistance(), dist);
      return dist ? Math.round((viewLeft / dist) * (cards.length - 1)) : 0;
    };

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
      ScrollTrigger.removeEventListener('refresh', onGlobalRefresh);
      earlyTrigger.kill();
      scrubTrigger.kill();
      st.kill();
    };
  });
}

document.addEventListener('astro:page-load', initPillarScroll);
