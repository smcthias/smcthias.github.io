# Redesign migration brief (dark theme)

The homepage (`src/pages/index.astro`) is the approved reference. Match its
look and conventions exactly. Read it, `src/styles/global.css`,
`src/layouts/Layout.astro`, and `src/components/*` before editing.

**Do NOT edit** shared files: `global.css`, `Layout.astro`, `Nav/Footer/Reel/
ReelLightbox/BackgroundHex/motion.ts`, `astro.config.mjs`. Only edit the page(s)
you are assigned. Do NOT run `git`. Do NOT change the `<Layout>` import.

## Design tokens (Tailwind v4, defined in global.css @theme)
- Background: page base is `bg-ink` (near-black) — **leave full-bleed sections
  transparent** so the honeycomb shows through; use `bg-surface` only for
  distinct bands/cards, `bg-surface-2` for inputs/raised.
- Text: `text-paper` (primary/near-white), `text-muted` (body copy),
  `text-faint` (captions/eyebrows). NEVER `text-zinc-*`/`text-gray-*`.
- Borders: `border-line` (hairline), `border-line-2` (hover).
- Accent (neon lime): `text-accent`, `bg-accent`, `border-accent`,
  `hover:bg-accent-dim`. Accent is a SPICE — hovers, links, small highlights,
  primary CTA fills. Never neon body text. Ink text on accent fills.
- Fonts: headings use `font-display` (Clash Display); body is default
  (General Sans). Oversized display sizes: `text-mega`, `text-huge`, `text-big`.

## Layout & structure conventions
- Container: `max-w-[1400px] mx-auto px-5 sm:px-8`.
- Section rhythm: `py-24 md:py-32` (or `py-20`), alternate transparent vs
  `bg-surface border-y border-line` bands.
- Eyebrow label: `text-xs font-medium text-faint uppercase tracking-[0.2em] mb-4`.
- Section heading: `text-huge font-display text-paper`.
- Buttons — primary: `inline-flex items-center gap-2 px-7 py-3.5 rounded-md
  bg-accent text-ink font-medium hover:bg-accent-dim transition-colors`;
  secondary: `... rounded-md border border-line text-paper hover:border-accent
  hover:text-accent transition-colors`. Corners are `rounded-md` (no pills).
- Cards: `rounded-lg border border-line bg-surface p-8`.
- Grids: ALWAYS give an explicit base column count (`grid grid-cols-1
  md:grid-cols-2`) and `min-w-0` on flex/grid children holding long text —
  otherwise mobile overflows (lesson learned on the homepage).
- Scroll reveal: add `data-reveal` to sections/items you want to fade up on
  scroll; optional `data-reveal-delay={n}` (ms) for stagger. It degrades safe.
- The bracket motif: `<span class="bracketed text-accent">word</span>` frames a
  key word in neon brackets — use sparingly on one hero word per page.
- External links: `target="_blank" rel="noopener noreferrer"`. Internal: plain.

## Copy voice
Direct, plain-spoken, personality, outcomes-first. Ban buzzwords (synergy,
leverage, cutting-edge, solutions, elevate, seamless, delightful). Speak to
BOTH business owners and agencies. No fabricated stats/clients — keep all facts
that exist in the current page copy; you may rewrite tone but not invent.

## MUST PRESERVE (do not alter logic — restyle classes only)
- Any `<script>` logic, form field `name`s, `action`/`data-endpoint` URLs,
  the Google Apps Script endpoint, honeypot, UTM hidden inputs.
- All `gtag('event', ...)` / `window.gtag` calls exactly as-is.
- The Stripe link on `/ux-audit` (`buy.stripe.com/...`).
- JSON-LD `<script type="application/ld+json">` blocks (keep/ः extend, don't drop).
- `Astro.props`/`getCollection` data usage and frontmatter schema.
- Keep existing page URLs and the `<Layout title/description>` props.

## Verify
Your page must render on the dark theme with readable contrast and no leftover
light-theme classes (`bg-white`, `text-zinc-900`, `bg-zinc-50`, etc.). Do a
final grep of your file for `zinc-`, `gray-`, `bg-white`, `text-black` and
replace every one. Do not run the build (the orchestrator builds at the end).
