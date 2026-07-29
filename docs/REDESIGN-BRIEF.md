# Redesign brief v3 — Swiss modern, light-first (2026-07-24)

Client feedback killed the previous dark neon "In Register" system. This brief
replaces it entirely. The homepage (`src/pages/index.astro`), `works.astro`,
`Layout.astro`, `Nav.astro`, `Footer.astro`, and `global.css` are the approved
v3 reference. Read them before editing. Match their look and conventions.

**Do NOT edit** shared files: `global.css`, `Layout.astro`, `Nav/Footer/Reel/
ReelLightbox`, `astro.config.mjs`, `src/data/featured.ts`. Only edit the
page(s) you are assigned. Do NOT run `git` or builds. Do NOT change the
`<Layout>` import or page URLs.

## The design idea

Swiss modernism. Monochrome, light-first, full-width, the work as the hero.
No accent color, no decorative systems, no ornament. Type, space, and imagery
carry everything. Light ground for reading; near-black bands ONLY for
galleries, media, and the footer. Every section gets room to breathe.

## Tokens (Tailwind v4, in global.css @theme) — the ONLY colors allowed

Light (default): `bg-paper` page ground, `bg-card` white panels,
`text-ink` headings/primary, `text-slate` body copy, `text-mist` captions,
`border-hairline` rules.
Dark bands (galleries/media only): `bg-ink` ground, `bg-ink-soft` panels,
`text-paper` primary, `text-fog` secondary, `text-dusk` captions,
`border-seam` rules. Add class `on-dark` to the dark section root.

DEAD — remove every occurrence: `accent`, `accent-dim`, `surface`,
`surface-2`, `line`, `line-2`, `muted`, `faint`, `spec-label`, `bracketed`,
`bracket-clamp`, `crop-frame`, `reg-snap`, `reg-glyph`, `rule-tick`,
`ghost-num`, `bar-list`, `font-tech`, `font-display`, `data-reveal`,
`line-mask`, `line-rise`, `data-ghost`. Grep your file for each before done.

## Layout & structure

- Wide container: `max-w-[1600px] mx-auto px-5 sm:px-8`. Full-bleed media may
  skip the container. Prose blocks cap at `max-w-2xl`/`max-w-3xl`.
- Generous rhythm: `py-24 md:py-36` feature sections, `py-20 md:py-28`
  supporting. One idea per section; give each section its moment.
- NO rounded corners anywhere (no `rounded-*`). No pills. Sharp edges.
- Section label: `<p class="label mb-5">` (small tracked caps, defined
  globally). Never numbered, never decorated.
- Headings: `text-mega` (page h1 only), `text-huge` (section h2),
  `text-big` (h3). All `font-semibold`. No `font-display` (one family now:
  Switzer via `font-sans` default).
- Buttons: primary `inline-flex items-center gap-2 px-7 py-3.5 bg-ink
  text-paper font-medium hover:bg-ink/85 transition-colors` (on dark bands:
  `bg-paper text-ink hover:bg-fog`). Secondary: underlined text link
  `text-ink font-medium underline underline-offset-8 decoration-hairline
  hover:decoration-ink transition-colors`.
- Lists: plain text with normal spacing. NO checkmark icons, NO icon bullets.
  If a list must be a list, keep it short; prefer prose statements.
- Motion: transitions on hover only (colors, small translate, image
  `scale-[1.02]`). No entrance animations, no parallax, no ambient effects.
  Horizontal image strips use `.hstrip` (native scroll-snap, no hijack).
- Numbered counts of projects/sections are banned.

## Copy voice (apply to your page's copy)

- Statements, not questions. ("Need a senior pair of hands?" becomes
  "Senior hands when you need them.") The ONLY sanctioned question is the
  conversion prompt "Is your website losing you customers?"
- NO em-dashes anywhere. Rewrite around them (periods, commas).
- Short. If words are on screen they are meant to be read; cut fluff,
  walls of bullets, and anything that explains what a warm lead already
  knows. Simple statements beat paragraphs.
- Audience is a RANGE: startups, agencies, enterprise marketing teams. Never
  call out company size ("small to medium businesses" is banned).
- Weave in the AI positioning where natural, plainly: AI-integrated
  workflows, speed of a full team, senior judgment, flexible budgets. Once
  per page maximum; a sentence, not a section.
- "UX Health Check" surfaces as **Website Score** in navigation/labels, and
  the language around it is plain conversion talk: how well the site turns
  visitors into paying customers. Never "free", never unexplained "UX".
  (Page URL /ux-health-check stays.)
- Never "Got the pieces?" / "pieces" metaphor. Page-closing sections are a
  plain final statement that asks for the project ("Let's talk about your
  project.") with a Start your project button. The footer already closes the
  page ("You've seen the work. Let's talk about yours."), so a page-level
  closing CTA can be shorter or omitted where the footer suffices.
- Experience framing: "two decades" (not "18+ years").

## MUST PRESERVE (restyle only, never alter logic)

- All `<script>` logic, form field `name`s, `action`/endpoint URLs, honeypot,
  UTM hidden inputs, the Google Apps Script endpoint.
- All `gtag('event', ...)` calls exactly as-is.
- The Stripe link on `/ux-audit`.
- JSON-LD blocks (update wording inside descriptions to match new copy where
  it references dead concepts; keep structure).
- `Astro.props`/`getCollection` usage and frontmatter schemas.

## Nielsen usability heuristics to honor

Visibility of status (loading/success states stay), match to real language
(plain words, no jargon), user control (no scroll hijack, no autoplay with
sound), consistency (tokens above), error prevention/recovery on forms
(keep validation + messages), recognition over recall (clear labels),
minimalist design (this whole brief).

## Verify before you finish

Grep your file for: `accent`, `surface`, `text-muted`, `text-faint`,
`border-line`, `rounded-`, `font-display`, `spec-label`, `bracketed`,
`data-reveal`, `—` (em-dash), `free`, `18+`. Every hit must be gone or
justified. The page must read light-ground with dark reserved for
media/gallery bands only.
