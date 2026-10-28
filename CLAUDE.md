# CLAUDE.md

Guidance for working in this repo. See `README.md` for the general project
overview, content-collection schema, and deploy instructions — this file
covers conventions and history that aren't obvious from reading the code.

## Stack

- Astro 7, Tailwind CSS 4 — **CSS-first config, not the old v3
  `tailwind.config.mjs` setup.** Theme customization (colors, font) lives in
  the `@theme` block of `src/styles/global.css`, imported once from
  `Layout.astro`. There is no `@astrojs/tailwind` integration anymore —
  Tailwind is wired in via the `@tailwindcss/vite` plugin in
  `astro.config.mjs`'s `vite.plugins`. `@tailwindcss/typography` is loaded
  in CSS via `@plugin "@tailwindcss/typography";`, not the old
  `plugins: [require(...)]` array.
  - TypeScript is pinned to the 6.x line (`^6.0.3`), not the latest 7.x —
    `@astrojs/check`'s peer range (`^5.0.0 || ^6.0.0`) doesn't support
    TS 7 yet. Don't bump past 6.x until `@astrojs/check` does.
  - **Trap: don't reintroduce a sitewide `* { margin: 0; padding: 0; }`
    reset in a plain (unlayered) `<style is:global>` block.** Tailwind v4's
    Preflight (auto-included by `@import "tailwindcss";`) already ships an
    equivalent reset inside its own `base` CSS layer. An unlayered rule with
    the same properties silently wins over *any* layered Tailwind utility —
    including `.px-4`, `.mx-auto`, `.p-6`, etc. — regardless of selector
    specificity or source order, because in CSS, unlayered styles always
    beat `@layer`-wrapped ones. This exact bug shipped once already (every
    page's padding/margin utilities silently no-op'd) and was fixed by
    deleting the redundant reset from `Layout.astro`'s global style block
    and trusting Preflight instead.
- Static output, deployed to GitHub Pages at savelledesign.com via
  `.github/workflows/deploy.yml` on push to `main`/`master`/`claude/**`.
- **The deploy workflow gates on `astro check` (which `astro build` does
  NOT run).** Run `npx astro check` before pushing — a change that builds
  clean locally can still fail CI on TypeScript errors. Recurring trap: TS
  doesn't carry a null-guard (`const el = getElementById(...) as X|null; if
  (!el) return;`) into nested closures — re-alias after the guard
  (`const canvas: X = el;`). This bit the hero weave script (9 "possibly
  null" errors in CI, green local build).
  - Separately, `astro check` and `astro build` can disagree: `astro check`
    (the language server) tolerated an unclosed `<div>` that `astro build`'s
    stricter JSX-style compiler rejected outright (`CompilerError: Expected
    corresponding JSX closing tag for 'div'`). Don't treat a clean `astro
    check` as proof the build will succeed — run `astro build` too before
    trusting a change, especially after touching markup-heavy `.astro` files.
- Content collection (`src/content/projects`; the blog collection was removed) defined in
  `src/content.config.ts` (Astro 6 removed the legacy `src/content/config.ts`
  + `type: 'content'` API — collections now require an explicit `loader`,
  here `glob()` from `astro/loaders`). Entries no longer have a `.slug`
  property; use `.id` instead (e.g. `project.id`, not `project.slug`).
  Rendering an entry's Markdown body also changed: import `render` from
  `astro:content` and call `const { Content } = await render(entry)` instead
  of the old `entry.render()` method, which no longer exists on
  loader-based collections.
- GSAP (core + `ScrollTrigger` + `SplitText` plugins) drives essentially all
  motion, and Lenis drives smooth scroll — both loaded per-page via a fixed
  list of `<script src="../scripts/*.ts">` tags at the bottom of
  `Layout.astro`'s `<head>` (see "Motion & animation system" below for what
  each one does). `ClientRouter` (`astro:transitions`) is enabled sitewide,
  so navigation is client-side (View Transitions), not a full page reload.

  **Trap, and the most common bug in this codebase: every script that
  touches the DOM must bind its init logic to the `astro:page-load` event,
  not run it as a bare top-level IIFE/statement.** `astro:page-load` fires
  on the *first* load and again after *every* client-side navigation;
  a plain top-level IIFE only ever runs once, against whichever page
  happened to be loaded first. Since `ClientRouter` swaps the DOM (not just
  `<main>`) on navigation, any component rendered by `Layout.astro`
  (nav, footer, modals, floating widgets) gets fresh, listener-less DOM
  nodes on every navigation — a script that isn't re-bound via
  `astro:page-load` silently stops doing anything the moment the user
  navigates once, even though it worked perfectly on first load. This has
  bitten this codebase twice for real: `WebsiteScoreChat.astro`'s launcher
  button looked identical but did nothing after any client-side nav until
  its script was rewired to `document.addEventListener('astro:page-load',
  initWsc)`, and `pillar-scroll.ts`'s GSAP `matchMedia` context/pins were
  never reverted between page loads, leaving a homepage visit's pinned
  section dangling and corrupting the *next* page's scroll-height
  bookkeeping (case studies would load pre-scrolled near the bottom). The
  established pattern everywhere in `src/scripts/` and the inline
  `<script>`s in `src/components/*.astro`: wrap init logic in a named
  function, call `cleanup?.()` (or an equivalent revert) at its top if the
  script owns any GSAP triggers/pins/tweens or global listeners, then
  `document.addEventListener('astro:page-load', initFn)` at module scope —
  never invoke `initFn()` directly at the top level.

## Design conventions

**v4 redesign: the site is dark/monochrome throughout** (`bg-zinc-950`
sections, `text-zinc-50` body copy, `zinc-*` scale for everything else —
per `global.css`'s own comment: "black ground throughout, monochrome...
there are no custom color tokens... no accent color — the portfolio
imagery carries the color; type and space carry the design"). This
superseded an earlier light-themed version of the site (see "History"
sections below, which describe that earlier version and predate this
redesign — treat any light-theme/color specifics down there as historical,
not current). When adding pages, match the current dark pattern:

- Font: self-hosted **Inter** (variable font, `public/fonts/inter-var.woff2`,
  `font-weight: 100 900`), not Plus Jakarta Sans. `--font-sans`,
  `--font-display`, and `--font-head` in `global.css`'s `@theme` block all
  resolve to the same Inter stack — there's no separate display face.
- Custom fluid type scale (also in `@theme`, `global.css`): `text-mega`
  (clamp 2.75rem→6rem, hero h1s), `text-huge` (clamp 2.1rem→4rem, section
  h2s), `text-big` (clamp 1.6rem→2.5rem, stat numbers/subsection headings) —
  each ships its own `line-height`/`letter-spacing` pair via Tailwind v4's
  `--text-*--line-height` / `--text-*--letter-spacing` token suffixes.
- Container/padding: `px-5 sm:px-8 md:px-12` (no `max-w-7xl mx-auto` cap —
  sections run full-bleed), wrapped in a section with generous vertical
  padding (`py-20 md:py-28`/`py-24 md:py-36` are common).
- Section rhythm: consecutive `<section class="bg-zinc-950">` blocks,
  sometimes separated by `border-t border-zinc-900` rather than visible gaps.
- Cards/recessed surfaces: `bg-zinc-900` (image placeholders, hover
  backgrounds) or `bg-zinc-800` (pillar visual placeholders); border accents
  use `border-zinc-800`/`border-zinc-700`/`border-zinc-900` depending on
  contrast needed.
- Buttons: solid pill `rounded-full bg-white text-zinc-950
  hover:bg-zinc-200` (primary, e.g. "LET'S TALK"); secondary pill
  `rounded-full bg-zinc-800 text-zinc-50 hover:bg-zinc-900` (e.g. the nav's
  "MENU" toggle). **Pills (`rounded-full`) are the button convention now** —
  the opposite of the old light-theme `rounded-lg`-only rule below. Every
  `<button>` needs an explicit `cursor-pointer` class — browsers don't
  default one for buttons (only `<a>` gets a pointer cursor for free), and
  this has already shipped as a real bug once (`WebsiteScoreChat.astro`'s
  launcher, close button, and quiz-answer chips were all missing it).
- Nav (`src/components/Nav.astro`) is a fixed, transparent, floating header
  (`SAVELLE` wordmark + LET'S TALK + MENU) that opens a full-screen dark
  drawer (`#nav-drawer`) with four links (Home/About/Work/Contact) — not the
  old light-theme desktop-dropdown-plus-`#mobile-menu` pattern. There's only
  one nav markup location now, not two to keep in sync.

### Motion & animation system

Every scroll-driven animation is a GSAP `ScrollTrigger` (imported per-script,
`gsap.registerPlugin(...)` at module scope); Lenis (`src/scripts/smooth-scroll.ts`)
provides the eased scroll feel and is wired to `ScrollTrigger.update` via
`lenis.on('scroll', ScrollTrigger.update)`. Every script:

- Checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and
  either bails entirely or skips straight to the final visual state — never
  animates when the user has asked not to.
- Binds via `astro:page-load`, not a bare top-level call (see the Stack
  section's trap above — this is the rule the whole system depends on).

The named scripts (`src/scripts/`), each opted into per-element via a
`data-*` attribute:

- **`word-reveal.ts`** (`data-word-reveal`, optional
  `data-word-reveal-speed="slow|base|fast"`) — splits text into words
  (`SplitText`) and staggers them in on scroll entry; replays on every
  re-entry (both directions). `data-reveal-next="#selector"` chains a plain
  fade-in on another element once the split finishes.
- **`image-reveal.ts`** (`data-image-reveal`, optional
  `data-image-reveal-duration`/`data-image-reveal-delay`) — opacity+scale
  reveal for images/visual blocks; also replays on re-entry. The `-delay`
  only applies the *first* time an element plays — later re-entries (user
  scrolls away and back) play immediately, so there's never a repeat dead
  pause. This first-play-only-delay pattern is reused by `count-up.ts`.
- **`drop-reveal.ts`** (`data-drop-reveal`) — simple drop-in fade, used for
  CTAs/closing elements.
- **`dot-grid.ts`** (`<canvas id="dot-grid-canvas" data-fade-trigger="#selector">`)
  — an interactive, cursor-repelling dot grid rendered behind a page's hero
  section(s) (which must drop their own `bg-zinc-950` — see existing pages
  for the pattern), fading out via a scrubbed `ScrollTrigger` as
  `data-fade-trigger`'s element scrolls into place. **Trap:** the fade's
  `start: 'top bottom'` assumes the hero is at least one viewport tall: on
  a page with a short hero (e.g. `/works`'s one-line intro), the
  fade-trigger element can already be behind that "top bottom" point at
  scroll position 0, giving a *negative* computed start and thus the canvas
  rendering already partway faded (dimmer than every other page) before any
  scrolling happens at all. Fixed by flooring the effective start at 0
  inside the `onUpdate` (`Math.max(0, self.start)`) rather than assuming
  `self.progress` is trustworthy as-is — check for this again if the canvas
  ever looks dimmer-than-expected on a new page with a short hero.
- **`pillar-scroll.ts`** (`#pillars-section`, homepage only, desktop +
  motion-allowed only) — pins the Web/Brand/Reach section and converts
  vertical scroll into horizontal movement across the three cards; the
  single deliberate scroll-hijack on the site. A single `ScrollTrigger`
  (the pin itself) is the sole source of truth for the track's x position
  *and* each card's reveal timing — **do not** split those across two
  independently-scrubbed triggers (e.g. one pinning, another driving the
  horizontal tween via its own offset `start`): an earlier version tried
  exactly that to add a pause on the first card, and the second trigger's
  `"top top+=N"` offset didn't reliably track N px after the first
  trigger's start through GSAP's refresh cycle, silently desyncing once the
  pause grew — the card would already be most of the way through its
  transition before the "held" state visibly kicked in. Track position is
  now set directly via `gsap.quickTo` from inside the pin's own `onUpdate`.
- **`hstrip-drag.ts`** (`.hstrip` + `[data-hstrip-wrap]`/`[data-hstrip]`/
  `[data-hstrip-prev]`/`[data-hstrip-next]`, case-study detail galleries) —
  click-and-drag horizontal scroll plus prev/next arrow buttons; styled
  scrollbar lives in `global.css`. Arrow disabled-state is computed from
  `scrollWidth`, which is wrong until lazy-loaded images inside the strip
  finish loading — the script re-checks on each image's `load` event, not
  just once at init, to avoid the "next" arrow getting stuck disabled.
- **`count-up.ts`** (`data-count-up`) — counts a stat number up from 0 to
  its authored value (case-study Results strip), preserving whatever
  prefix/suffix/commas were authored (`"209K+"`, `"2,000"`, `"5 Days"`) and
  leaving genuinely non-numeric values (`"Custom"`) untouched. Uses the same
  first-play-only-delay idea as `image-reveal.ts`, but inverted: the number
  sits at its *starting* value (0) for a deliberate beat (`FIRST_PLAY_DELAY`,
  currently 0.6s) before counting begins, so the count-up reads as a second,
  noticeable beat rather than firing instantly the moment the section
  crosses the reveal threshold (easy to miss mid-scroll).

Two files exist in `src/scripts/` but are **dead code, not wired into
`Layout.astro`'s script list, and describe the pre-v4 motion policy**
("hover-triggered snaps... no scroll reveals" — the opposite of the system
above): `motion.ts` (an alternate/earlier Lenis setup) and
`src/components/BackgroundField.astro` / `BackgroundHex.astro` (unused
canvas backdrop components). Don't wire these up thinking they're the
active system — grep for the filename before trusting a comment inside one
of them. Ask the user before deleting; they may be intentionally kept for
recovery.

### Known Tailwind gotcha

Preflight's `[hidden] { display: none }` rule lives in the `base` layer, so a
`.flex` (or other display) utility class on the *same element* will win in the
cascade and the element stays visible despite `el.hidden = true`. If you need
to hide an element that also carries a `flex`/`grid`/etc. class, toggle
`el.style.display = 'none'` instead of the `hidden` property/attribute. This
bit the UX Health Check nav bar during migration (see below) — check for it
again if you add similar step-based UI.

## The v4 redesign — current page/component architecture

The dark-theme redesign described above (roughly 2026-07-27 onward, per the
"v4 redesign" comments left in `Nav.astro`, `Footer.astro`,
`WebsiteScoreChat.astro`, `ContactModal.astro`, and `global.css`) replaced
large parts of what the two "History"/"Pages added independently" sections
below describe. Those sections predate v4 and are kept for git-archaeology
(recovering old copy, layouts, or approaches) — their *structural* facts
(no email/phone anywhere, content-collection merges, which pages got
deleted and when) still hold, but anything about **colors, the contact
page, the footer, or the nav** describes the superseded light-theme version.
Current reality:

- **Contact is a modal, not a page.** `src/pages/contact.astro` no longer
  exists. `src/components/ContactModal.astro` renders once in
  `Layout.astro` and opens from *any* element anywhere with a
  `[data-contact-open]` attribute (event-delegated on `document`, so it
  works for elements injected later by other scripts too, e.g.
  `WebsiteScoreChat`'s results CTA). The footer (`id="contact"`) doubles as
  the scroll target for `/#contact` links; `LET'S TALK` opens the modal
  directly. Both coexist deliberately.
- **`src/pages/services.astro` no longer exists** (deleted 2026-07-25, see
  the "Pages added independently" section below for that history) — nothing
  in the current nav/footer links to it.
- **`WebsiteScoreChat.astro` no longer takes a `page` prop.** It renders
  once, sitewide, from `Layout.astro`, reading `Astro.url.pathname` itself
  for lead-attribution — the "Pages added independently" section below
  describes an earlier version gated to `/contact` and `/works` via a
  required prop; that's no longer how it works. It's a fixed bottom-right
  chat-bubble launcher (`#wsc-launcher`/`#wsc-open`/`#wsc-panel`) running
  the same 10-question scoring logic as before, duplicated by hand (not
  shared) from nothing now — the old full-page `/ux-health-check` quiz it
  used to duplicate is gone too.
- **The footer is a single minimal block**, not a multi-column sitemap:
  headline + "Let's make something great." + LET'S TALK button + a bottom
  bar with copyright, Follow (LinkedIn + Substack icons), and
  Privacy/Terms links. No
  Explore/Start-here columns.
- **Nav is a single fixed header + full-screen drawer** (see Design
  conventions above), not the old two-places-to-update desktop-dropdown +
  `#mobile-menu` pattern.
- **The blog is gone — writing lives on Substack** (2026-10-27,
  savelledesign.substack.com). Removed: `src/content/blog/` + its
  collection in `content.config.ts`, `blog.astro`/`blog/[slug].astro`,
  `public/images/blog/`, `/about`'s "Field notes" section, the footer's
  dead `explore` array, llms.txt's post list (now one Substack line), and
  SurveyModal's `a[href="#website-score"]` handler (only blog posts used
  it). The Substack link is a small item in the footer, right of
  the survey link (a full-width section above the footer was tried and
  dropped for competing with the footer headline), and the nav drawer has a small "Follow along
  on Substack" link under the survey link. Older "History" notes below
  that mention the blog describe the removed version.
- Current page inventory: `index.astro`, `about.astro`, `works.astro` +
  `works/[slug].astro`, `privacy.astro`,
  `terms.astro`, `404.astro`, `llms.txt.ts`. That's the full list —
  `contact.astro`, `services.astro`, `gallery.astro`, `agencies.astro`,
  `pricing.astro`, and `ux-audit.astro` are all gone (some pre-date v4, see
  below); `ux-health-check.astro` is also gone, fully superseded by the
  `WebsiteScoreChat` widget.

## Short links (`/go/<key>`)

`savelledesign.com/go/<key>` forwards to a full URL with UTMs attached — for
links posted OFF-site (LinkedIn first). Registry: `src/data/go-links.ts`;
page: `src/pages/go/[key].astro`. UTMs are assembled from each entry
(`utm_source`=platform, default `linkedin`; `utm_medium`=channel, default
`social`; `utm_campaign`=program, default `linkedin-posts`;
`utm_content`=`<date>-<content>`), all lowercase-hyphenated. Never use them
on internal links — UTMs mid-visit overwrite the visitor's real source.

- **GitHub Pages can't do server redirects**, so each key prerenders a bare
  static page (meta refresh + `location.replace` + a fallback link). It
  intentionally skips `Layout.astro` so GTM never loads on the hop page;
  otherwise GA4 would record a UTM-less `/go/...` pageview as the landing
  page. `/go/*` is filtered out of the sitemap and every page is `noindex`.
- **The build fails on a bad entry** — invalid key/date/UTM value, a
  non-https `url`, or a `path` that isn't a real page (static pages plus
  `/works/<project id>`). Every rejection path was tested to fire. If a page
  is deleted while a key still points at it, the build will fail; repoint the
  key's `path` rather than deleting the key.
- **Never re-date or delete a key that has been posted.** `date`+`content`
  is the `utm_content` already counted against that post, and old posts link
  to the key forever. A new post gets a NEW key, even to the same page.
- **Link previews:** a platform that unfurls the `/go/` URL itself sees the
  page's own OG tags. Case-study destinations reuse the project's title,
  description and hero image automatically; others use the site default or
  the entry's `previewTitle`/`previewDescription`.
- **Off-site destinations (Substack) are not trackable in GA4** — the visitor
  never lands on savelledesign.com. Their UTMs only help whatever analytics
  the destination has.
- Unknown keys hit the normal 404 page. Verify a new key after deploy by
  opening it and checking the address bar's final URL carries the UTMs.

## History: the former `uxblog/` directory

Through 2026-07-20, this repo also contained `uxblog/` — a full copy of an
earlier, separate portfolio site (Astro 6, Tailwind v4, dark theme, different
domain/branding — "Savelle McThias" rather than "Savelle Design"). It was kept
only as a migration source, was never part of the deployed site, and **the
user has since deleted it** (`git log -- uxblog` still shows its history if
you need to recover old copy/markup). Nothing in `astro.config.mjs`,
`tsconfig.json`, or the deploy workflow references it anymore — there's
nothing left to clean up on that front.

Features ported from it into the main site before deletion:

- **Gallery** — ported from `uxblog/src/pages/gallery.astro` (same 29 images
  and copy), then **removed again at the user's request on 2026-07-24**. The
  page (`src/pages/gallery.astro`), its nav entries (desktop "Work" dropdown,
  mobile menu, footer sitemap), and its `llms.txt.ts` entry are gone; the
  desktop nav's "Work" dropdown was collapsed back into a plain link straight
  to `/works`. The image assets (`public/images/gallery/{full,thumbs}/`,
  `{full,thumb}-<slug>.jpg`) were left in place, orphaned, in case the page
  is ever brought back — check with the user before deleting them or
  resurrecting the page (recoverable from git history pre-2026-07-24).
- **UX Health Check** (`src/pages/ux-health-check.astro`) — same 10 questions,
  scoring logic, and lead-capture flow as the old uxblog page. Restyled to
  light theme. The Google Apps Script `FORM_ENDPOINT` for lead capture was
  carried over as-is (same spreadsheet as the old site). The `gtag(...)` calls
  are dead code for now — this site's `Layout.astro` doesn't wire up Google
  Analytics the way uxblog's `BaseLayout.astro` did, so they no-op safely;
  wire up GA first if you want those events to fire.
- **Contact** (`src/pages/contact.astro`) — two-column layout (trust rail +
  project-inquiry form with project-type/budget chip selectors), same Google
  Apps Script `FORM_ENDPOINT` as the UX Health Check (same sheet, `form_type`
  field distinguishes rows), restyled to light theme. The trust-rail
  testimonial is hardcoded inline (the Brian Fidler quote also used on the
  homepage) rather than pulling from a data file — there was no reason to
  reintroduce uxblog's separate `src/data/testimonials.ts` pattern here. The
  five "Trusted by teams at" logo SVGs (PetSmart, GM, Sotheby's, Universal,
  bareMinerals) live in `public/images/logos/` — solid-white artwork, so the
  light-theme version uses `brightness-0 opacity-40` instead of the
  original's `brightness-0 invert opacity-40`.
- **Blog articles** (`src/content/blog/*.md`) — uxblog's 8 "insights" MDX
  articles were converted to plain Markdown (they used only `<img>` tags, no
  JSX, so no MDX integration was needed) and merged into this site's existing
  `blog` content collection alongside the original 6 posts. Frontmatter was
  remapped to this site's schema (`pubDate` → `date`, `hero` → `image`/
  `imageAlt`, `category` derived from each post's first tag; uxblog-only
  fields like `cluster`/`pillar`/`cta` were dropped). Internal links
  (`/insights/slug` → `/blog/slug`) and image paths
  (`/images/insights/*` → `/images/blog/*`) were rewritten; images copied to
  `public/images/blog/`. The two service-page templates
  (`src/pages/blog.astro`, `src/pages/blog/[slug].astro`) now resolve
  `post.data.image` against a generic `/images/` root instead of a
  hardcoded `/images/works/`, so old posts use `works/<file>` and migrated
  posts use `blog/<file>` in their frontmatter.
- **UX Audit** — the $997 "48-Hour UX Audit" productized service page
  (`src/pages/ux-audit.astro`) was ported from uxblog and rebuilt in this
  site's light theme, with its "Buy Now" buttons keeping the real Stripe
  payment link (`buy.stripe.com/9B614nadB2L82Aw01c7wA00`) as live commerce.
  It was later added as a 5th `/services` anchor section too. **Both the
  page and the offering were removed at the user's request on 2026-07-25**
  — see the entry under "Pages and content added independently" below for
  the full list of what changed. There is no longer any on-site checkout
  anywhere on the site. Recoverable from git history (pre-2026-07-25) if
  the audit product is ever brought back.
- **Testimonial** — Roxana Epps (SVP of Marketing, Young Living / LifeWave /
  Green Compass) was added to `about.astro` as a 5th testimonial card; her
  quote existed only in uxblog's `src/data/testimonials.ts` with no
  counterpart on this site. uxblog's Caitlin Kelly quote also had a whimsical
  italic rhyming sign-off that was deliberately **not** ported (reads more
  like a joke aside than a testimonial) — mention this if the user asks why
  it's "missing."

The UX Health Check page was added to the main nav (desktop + mobile) in
`Layout.astro`, unlike the original uxblog nav, which only linked to that
page via a promotional CTA band component that wasn't ported. (Gallery was
also added to nav when ported, but both the page and its nav entries were
later removed — see above.)

**No phone number anywhere on this site.** It was removed from `contact.astro`
and from the `telephone` field of the `Person` JSON-LD in `Layout.astro` at
the user's request (2026-07-20). Don't re-add one without checking with the
user first.

**No email address anywhere on this site either**, as of 2026-07-25 —
`savellem@gmail.com` was removed at the user's request from every mailto
link and the `email` field of the `Person` JSON-LD in `Layout.astro`.
Removed from: the footer's bottom bar (was next to the copyright line),
the "Or just email me" secondary CTA on `about.astro` and `works.astro`
(link deleted outright, not replaced — the primary "Start your project"
button covers that), `contact.astro`'s "Email works too:" line under the
form (now just "Connect on LinkedIn", same LinkedIn URL as elsewhere on
the site) and its form-submission-failure fallback message (now points to
LinkedIn instead of a mailto link), and `privacy.astro`/`terms.astro`'s
"Contact" sections (both now link to `/contact` via "Get in touch" instead
of a mailto link; `privacy.astro`'s "Your choices" paragraph was reworded
from "emailing the address below" to "getting in touch below" to match).
The contact form (`contact.astro`, POSTs to a Google Apps Script endpoint)
and the LinkedIn profile link remain the only ways to reach out from the
site. Don't re-add the address without checking with the user first.

**Never ported, and now unrecoverable from the filesystem** (only visible via
`git log -- uxblog` on commits before the deletion, e.g. `git show
<commit>:uxblog/path/to/file`): uxblog's separate case-studies content
collection (Card Ritual, Green Compass, PetSmart, Plexus Worldwide — distinct
from this site's `src/content/projects`, which covers different client work),
the promotional UX-Health-Check CTA band component, the contact-form Google
Apps Script runbook docs that lived in `uxblog/docs/`, and Caitlin Kelly's
rhyming sign-off mentioned above. If the user ever asks for one of these,
it'll need to be recovered from git history rather than the working tree.

## Pages and content added independently of `uxblog/` (not migrations)

This section also predates the v4 redesign — see "The v4 redesign" section
above for what superseded it (contact is a modal now, not `contact.astro`;
`WebsiteScoreChat` no longer takes a `page` prop or lives only on
`/contact`+`/works`; the footer/nav described below are the pre-v4 ones).
The deletions and dates below are still accurate as history.

- **Pricing** — a rate-card page (`src/pages/pricing.astro`) built from
  figures the user supplied in chat existed briefly, linked from the Services
  nav dropdown, footer, homepage, and `services.astro`. **Removed at the
  user's request on 2026-07-25** — no more published dollar figures or rate
  card anywhere on the site. All former `/pricing` links and CTAs now point
  to `/contact` with generic "get a quote" / "fixed price after a
  conversation" copy instead. (At the time, the only dollar amount left on
  the site was the unrelated fixed-price `/ux-audit` product — that product
  was itself removed shortly after, see below — plus the contact form's
  budget-range qualification buttons, always out of scope of the rate
  card.) Recoverable from git history (pre-2026-07-25) if pricing is ever
  brought back.
- **Agencies** — a `/agencies` landing page existed briefly, linked from the
  main nav (desktop + mobile) and the footer's "Start here" column as "For
  Agencies". **Removed at the user's request on 2026-07-25.** Both nav links
  were deleted outright (not redirected); the site's copy still mentions
  agencies generically as a client type (homepage, works, about, contact,
  `Layout.astro`'s default meta description) — those are unaffected since
  they were never links to the page. Recoverable from git history
  (pre-2026-07-25) if the page is ever brought back.
- **Privacy** (`src/pages/privacy.astro`) and **Terms**
  (`src/pages/terms.astro`) — adapted from uxblog's starter policies but
  rewritten for this site's actual domain (savelledesign.com), third parties
  (Google Apps Script + Analytics; no Stripe/Vimeo references — the only
  on-site checkout was the now-removed `/ux-audit` page, see above), and
  business model (no direct on-site checkout anywhere on the site). Linked
  from the footer.
- **Nav dropdowns and footer sitemap** — the footer was expanded from a bare
  copyright line into a full sitemap with LinkedIn link; that came from an
  independent request, not uxblog. `Nav.astro`'s desktop nav used to group
  both Services (into each service anchor plus Website Score/Audit) and
  About (into About/Blog) as hover dropdowns. **Both were flattened to
  plain links on 2026-07-25** — Services first (see the `services.astro`
  restructure note below), About in a later pass the same day: `Nav.astro`
  now renders `About` as a single flat link straight to `/about`, and
  **Blog was dropped from the top nav entirely** (desktop and mobile
  drawer) rather than promoted to its own item — it's reachable from the
  footer's "Explore" column (unchanged) and is now also featured directly
  on `/about` (see below). The `on('/about') || on('/blog')` active-state
  check on the About link was kept as-is even though Blog no longer nests
  under it visually, so reading a blog post still highlights "About" in
  the nav.
- **`about.astro` "From the blog" section (2026-07-25)** — added between
  the testimonials and closing CTA: the 3 most recent posts
  (`getCollection('blog')`, sorted by `date` desc, `.slice(0, 3)`), each
  as an image/date/title/description card linking to `/blog/<id>`, plus a
  "View all articles" link to `/blog`. Added when Blog was dropped from
  the top nav, so the site's most prominent surface for the writing
  besides `/blog` itself is now the About page rather than a nav item.
- **`services.astro` restructure (2026-07-25)** — the page used to open with
  a redundant intro grid (icon + headline card per service) that just
  repeated the detailed anchor sections below it; that grid was deleted, so
  the page now goes straight from the hero into the detailed sections. Each
  service entry's card field was renamed `project` → `card` (with
  `eyebrow`/`name`/`line`/`href`/`cta`) so the same markup could serve both
  a case-study link and a product link — that flexibility was added to
  support a 5th **48-Hour Website Audit** service (id `website-audit`)
  reusing `/ux-audit`'s copy/price, but **that service and the underlying
  `/ux-audit` page were both removed again later the same day** at the
  user's request (see the UX Audit entry above) — the site is back to four
  services, though the `card` field naming/shape from this rename stuck
  around since it's still useful generically. The nav's Services dropdown
  was removed in the same pass — `Nav.astro` now renders a single flat
  `Services` link (desktop and mobile), since the sub-anchors it used to
  expose are one scroll away on `/services` itself.
  `src/components/WebsiteScoreChat.astro` is a fixed bottom-right chat
  widget that reruns the same 10 questions/scoring/lead-capture endpoint as
  the full-page `/ux-health-check` quiz, but presented as chat bubbles with
  quick-reply chips instead of a step wizard. The two questions/scoring
  implementations are intentionally duplicated (not shared) since one
  renders a full-page form and the other injects chat bubbles via
  `innerHTML` — keep both in sync by hand if the question set or scoring
  logic ever changes. Its results CTA and the full-page quiz's results CTA
  both used to branch to `/ux-audit` for lower scores; both now always
  point to `/contact` since that page is gone. The standalone
  `/ux-health-check` page is unchanged and still linked from the footer
  and the mobile drawer.
  **Originally `/services`-only, the widget was moved to `/contact` and
  `/works` instead on 2026-07-25** (not duplicated — `services.astro` no
  longer renders it, and its FAQ answer about the Website Score was
  reworded to point at "the contact and work pages"). The component now
  takes a required `page` prop (`<WebsiteScoreChat page="contact" />` /
  `page="works"`) threaded through as `data-page` into the client script,
  used for two things: the lead payload sent to the Apps Script endpoint
  now includes `page`, and the results CTA is page-aware — on `/contact`
  it scrolls to `#contact-form` (the id on that page's form) instead of
  navigating, since linking to `/contact` from a widget already on
  `/contact` would go nowhere useful; everywhere else it links to
  `/contact?ref=<page>-chat`.
- **Services page deleted entirely (2026-07-25)** — `src/pages/services.astro`
  is gone, along with every link to it. This is the last step in a string of
  changes that same day (see the `services.astro` restructure and
  `WebsiteScoreChat` entries above for the page's fuller history — five
  services down to four, the audit added then removed, the widget moved
  out) — the page itself was never re-expanded back out after being
  trimmed down, and the user asked to drop it outright rather than keep
  maintaining it. What changed as a result:
  - `Nav.astro` — the `Services` link is gone (desktop nav and mobile
    drawer); desktop nav is now just `Work` / `About` / `Start a project`.
  - `Footer.astro` — the whole "Services" sitemap column (5 links, all
    pointing at the dead page or its anchors) is gone; the footer grid went
    from `md:grid-cols-5` to `md:grid-cols-4` to match (brand block
    `col-span-2` + `Explore` + `Start here`).
  - `index.astro`'s "What I do" section — the 4 service tiles used to be
    `<a href="/services#...">` cards; they're now plain non-interactive
    `<div>`s (dropped `group`/hover/underline classes along with the link,
    since a card that looks clickable but isn't is worse than one that
    doesn't). The two-card CTA row below them ("All services" → `/services`
    + "Get a quote" → `/contact`) lost its now-pointless first card, leaving
    a single full-width "Get a quote" band — **that band was itself removed
    entirely in a later pass the same day**, see the content-simplification
    entry below.
  - `llms.txt.ts` — the `## Services` section (one line, linking
    `/services`) is gone.
  - `ux-health-check.astro` — the results CTA's secondary link was "See all
    services" → `/services`; it's now "See the work" → `/works`.
  - `README.md` — removed the `/services` page bullet and the
    `services.astro` / `services/` entries from the project-structure tree
    (that tree was already stale in other ways — e.g. still listed the
    long-deleted `ux-audit.astro`/`agencies.astro` — this pass only touched
    the services-related lines, not a full audit of the file).
  Recoverable from git history (pre-2026-07-25) if a services page is ever
  wanted again — full content (five services' worth of copy, FAQs, "how it
  works", pricing band) is in the commit before this one.
- **Sitewide content stripping (2026-07-25)** — a large, itemized cleanup
  pass, all in one sitting, at the user's explicit request per-page. Net
  effect: shorter pages, fewer competing CTAs, one CTA per page instead of
  several. Broken down by page:
  - **`index.astro`** — hero lost its subheadline and both CTA buttons
    (`Start a project` / `See the work`); now just the H1. `work` (the
    homepage's featured-project list) changed from `FEATURED.map(...)` to
    `FEATURED.slice(0, 3).map(...)` — 3 case studies instead of 5. The
    "Get a quote" band (added earlier the same day, see the services-page
    deletion entry above) is gone. The "Is your website losing you
    customers?" conversion-check section (linking to `/ux-health-check`) is
    gone. `FEATURED` itself (`src/data/featured.ts`) was **not** touched —
    still 5 entries — since `works.astro` also depends on it to order the
    full grid; only the homepage's rendered slice changed.
  - **`works.astro`** — hero lost its subheadline. The "What I bring"
    section (3 disciplines: Design/Development/Strategy, `brings` array)
    is gone entirely — `brings` was removed from the frontmatter as dead
    code. The closing "Let's talk about your project" section is gone.
  - **`about.astro`** — the closing "Let's talk about your project" section
    is gone (the page now ends after "From the blog").
  - **`contact.astro`** — hero lost its subheadline (which also carried the
    only on-page link to `/ux-health-check` — that link is gone, not moved
    elsewhere). The trust-rail self-quote ("You'll work directly with
    me...") is gone. "What happens next" (3-step numbered list) is gone.
    "Trusted by teams at" (the logo row, separate from the identical-looking
    row on `/contact`'s old hero) is gone — `logos` removed from
    frontmatter. The Daniel Kruger testimonial figure was **kept**. Form
    simplified from 5 fields to 3: the "What you need" (`project_type`) and
    "Budget range" (`budget`) fieldsets are gone — `projectTypes` and
    `budgets` removed from frontmatter, the `FORM_ENDPOINT` comment updated
    to drop those two from its payload shape, and the success handler's
    `gtag('generate_lead', ...)` call no longer sends `project_type` (it
    would always have been `'unspecified'` post-removal). Name, work email,
    and the project textarea are the only fields left.
  - **`works/[slug].astro`** (case study template) — the "Outcome" section
    (`<p class="label">The outcome</p>` / "By the numbers.", the *second*
    results display further down the page) is gone; the **first** one (the
    "Results" strip inside the dark hero band, shown immediately) was
    intentionally left alone — different section, not named "Outcome," and
    not requested. The closing "Let's talk about your project" section is
    gone.
  - **Eyebrow labels removed sitewide** — every `<p>`/`<h2>`/`<legend
    class="label">` micro-heading (the small tracked-caps "About," "What
    clients say," "Selected work," "How I work," "Trusted by brands you
    know," "What I do," "Insights," "404," etc. — the convention documented
    in `global.css` right above the `.label` rule) was deleted across
    `index.astro`, `works.astro`, `about.astro`, `contact.astro`,
    `works/[slug].astro`, `blog.astro`, and `404.astro`. The section
    heading (`h1`/`h2`) directly below each one was kept — only the small
    eyebrow above it went. **`ux-health-check.astro` was deliberately left
    untouched** — most of its `.label` usages aren't decorative eyebrows
    but functional UI inside the interactive quiz (each question's
    category legend, the results screen's "Priority N" and score labels),
    and that page/tool wasn't named in the request; touching its
    JS-rendered result strings risked breaking the quiz's visual hierarchy
    for a page nobody asked to change. If the user wants that page brought
    in line too, ask before touching the quiz-step legends specifically —
    those double as functional labels, not just style.
  - **Footer.astro, Nav.astro, `edge-label` (hero marginalia)** — not part
    of this pass, left as-is. The footer's column headings
    (`text-xs uppercase ... text-dusk`) are a different, unstyled-by-`.label`
    pattern and serve real navigational grouping, not decoration — judgment
    call to leave them; revisit if the user calls them out specifically.
  Recoverable from git history (pre-2026-07-25) if any of this is wanted
  back — nothing here deleted data, only presentation.
