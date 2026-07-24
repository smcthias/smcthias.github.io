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
- Content collections (`src/content/projects`, `src/content/blog`) defined in
  `src/content.config.ts` (Astro 6 removed the legacy `src/content/config.ts`
  + `type: 'content'` API — collections now require an explicit `loader`,
  here `glob()` from `astro/loaders`). Entries no longer have a `.slug`
  property; use `.id` instead (e.g. `project.id`, not `project.slug`).
  Rendering an entry's Markdown body also changed: import `render` from
  `astro:content` and call `const { Content } = await render(entry)` instead
  of the old `entry.render()` method, which no longer exists on
  loader-based collections.

## Design conventions

The site is light-themed throughout. When adding pages, match the existing
pattern rather than introducing new tokens:

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, wrapped in a `py-20`
  (or `pb-20`) section.
- Headings: `text-4xl md:text-5xl font-bold text-zinc-900` for page `<h1>`,
  `text-3xl md:text-4xl font-bold` for section `<h2>`.
- Body copy: `text-zinc-600` (or `text-xl text-zinc-600` for hero intros).
- Cards: `bg-white border border-zinc-200 rounded-lg`, or `bg-zinc-50` for a
  subtly recessed variant.
- Buttons: solid `bg-zinc-900 text-white rounded-lg hover:bg-zinc-800`;
  outline `border-2 border-zinc-900 text-zinc-900 rounded-lg hover:bg-zinc-50`.
  Corners are `rounded-lg` site-wide — no pill/`rounded-full` buttons.
- Nav items live in `src/layouts/Layout.astro` in **two** places (desktop
  `<div class="hidden md:flex ...">` and the mobile menu `<div id="mobile-menu">`)
  — both must be updated together when adding/removing a page from nav.
- No custom fonts beyond Plus Jakarta Sans (`font-sans`); there's no
  `font-display` token like the old uxblog site had.

### Scanline theme & motion policy

**All canvas/JS motion has been removed (2026-07-24) — the user found it
glitchy.** The homepage hero canvas weave (`#hero-weave`), the hover shred
pulse (`src/scripts/scanline-cards.ts`, `initScanlineHover()`, wired via
`data-sl-hover` on the homepage Featured Work grid, `/works`, case-study
visuals, blog cards, and gallery thumbs), the gallery hover zoom/shimmer
loading effect, and the 404 page's ambient drift canvas (`#nf-weave`) were
all deleted. `scanline-cards.ts` no longer exists. Images sitewide are now
plain static `<img>` tags with zero animation — no hover zoom, no fade-in,
no shred/glitch effects. **Do not reintroduce any of this** without
explicit user request; the old implementation is in git history
(pre-2026-07-24) if it's ever wanted again. `SectionDivider.astro` (a few
ragged offset strips) is unaffected — it was always static CSS, no motion.

### Known Tailwind gotcha

Preflight's `[hidden] { display: none }` rule lives in the `base` layer, so a
`.flex` (or other display) utility class on the *same element* will win in the
cascade and the element stays visible despite `el.hidden = true`. If you need
to hide an element that also carries a `flex`/`grid`/etc. class, toggle
`el.style.display = 'none'` instead of the `hidden` property/attribute. This
bit the UX Health Check nav bar during migration (see below) — check for it
again if you add similar step-based UI.

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
- **UX Audit** (`src/pages/ux-audit.astro`) — the $997 "48-Hour UX Audit"
  productized service page, rebuilt in this site's light theme rather than
  ported verbatim (uxblog's version used its dark `BaseLayout`). Both
  "Buy Now" buttons keep the real Stripe payment link
  (`buy.stripe.com/9B614nadB2L82Aw01c7wA00`) — that's live commerce
  functionality, not placeholder content. Linked from the Services nav
  dropdown, mobile menu, and footer.
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

- **Pricing** (`src/pages/pricing.astro`) — rate card built from figures the
  user supplied directly in chat, not sourced from uxblog. Linked from the
  Services nav dropdown, footer, homepage, `services.astro`, and all four
  service subpages. By design, dollar figures live **only** on this page
  (plus the unrelated fixed-price `/ux-audit` product and the contact form's
  budget-range qualification buttons, which are intentionally out of scope —
  confirmed with the user) so pricing can be managed/removed from one place.
- **Privacy** (`src/pages/privacy.astro`) and **Terms**
  (`src/pages/terms.astro`) — adapted from uxblog's starter policies but
  rewritten for this site's actual domain (savelledesign.com), third parties
  (Google Apps Script + Analytics, no Stripe/Vimeo references since those
  don't apply here beyond the standalone `/ux-audit` checkout), and business
  model (no direct on-site checkout outside `/ux-audit`). Linked from the
  footer.
- **Nav dropdowns and footer sitemap** — `Layout.astro`'s desktop nav groups
  Work/Services/About into hover dropdowns (each top-level label is itself a
  link to its primary page, e.g. "Services" → `/services`), and the footer
  was expanded from a bare copyright line into a full sitemap with LinkedIn
  link. None of this came from uxblog; it was requested independently.
