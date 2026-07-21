# CLAUDE.md

Guidance for working in this repo. See `README.md` for the general project
overview, content-collection schema, and deploy instructions — this file
covers conventions and history that aren't obvious from reading the code.

## Stack

- Astro 5, Tailwind CSS 3 (config in `tailwind.config.mjs`, no `@theme`/CSS-first
  setup — this is v3, not v4).
- Static output, deployed to GitHub Pages at savelledesign.com via
  `.github/workflows/deploy.yml` on push to `main`/`master`/`claude/**`.
- Content collections (`src/content/projects`, `src/content/blog`) defined in
  `src/content/config.ts`.

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

### Known Tailwind gotcha

Preflight's `[hidden] { display: none }` rule lives in the `base` layer, so a
`.flex` (or other display) utility class on the *same element* will win in the
cascade and the element stays visible despite `el.hidden = true`. If you need
to hide an element that also carries a `flex`/`grid`/etc. class, toggle
`el.style.display = 'none'` instead of the `hidden` property/attribute. This
bit the UX Health Check nav bar during migration (see below) — check for it
again if you add similar step-based UI.

## The `uxblog/` directory

`uxblog/` is a full copy of an earlier, separate portfolio site (Astro 6,
Tailwind v4, dark theme, different domain/branding — "Savelle McThias"
rather than "Savelle Design"). It's kept only as a migration source and is
**not** part of the deployed site (excluded from typecheck in `tsconfig.json`,
not referenced by `astro.config.mjs`).

As of 2026-07-20, three features have been ported from it into the main site:

- **Gallery** (`src/pages/gallery.astro`) — same 29 images and copy as
  `uxblog/src/pages/gallery.astro`. Assets copied to
  `public/images/gallery/{full,thumbs}/`, filenames unchanged
  (`{full,thumb}-<slug>.jpg`). Restyled from dark to light theme; lightbox
  modal intentionally keeps a dark overlay (standard lightbox convention,
  independent of page theme).
- **UX Health Check** (`src/pages/ux-health-check.astro`) — same 10 questions,
  scoring logic, and lead-capture flow as `uxblog/src/pages/ux-health-check.astro`.
  Restyled to light theme. The Google Apps Script `FORM_ENDPOINT` for lead
  capture was carried over as-is (same spreadsheet as the old site). The
  `gtag(...)` calls are dead code for now — this site's `Layout.astro` doesn't
  wire up Google Analytics the way `uxblog`'s `BaseLayout.astro` does, so
  they no-op safely; wire up GA first if you want those events to fire.
  The original's closing CTA also linked to a `/ux-audit` page and mentioned
  a "48-hour UX Audit" service — that page doesn't exist on this site, so
  both the link and the copy referencing it were dropped rather than carried
  over as dead ends.
- **Contact** (`src/pages/contact.astro`) — replaced the previous simple
  contact page with the uxblog design: two-column layout (trust rail +
  project-inquiry form with project-type/budget chip selectors), same
  Google Apps Script `FORM_ENDPOINT` as the UX Health Check (same sheet,
  `form_type` field distinguishes rows), restyled to light theme. The
  trust-rail testimonial is hardcoded inline (the Brian Fidler quote already
  used on the homepage) rather than pulling from a new data file — there was
  no reason to introduce `uxblog`'s separate `src/data/testimonials.ts` when
  this site already has an equivalent testimonial in `index.astro`/`about.astro`.
  The five "Trusted by teams at" logo SVGs (PetSmart, GM, Sotheby's,
  Universal, bareMinerals) were copied to `public/images/logos/` — they're
  solid-white artwork, so the light-theme version uses `brightness-0 opacity-40`
  instead of the original's `brightness-0 invert opacity-40`. As with the
  UX Health Check, the `/ux-audit` mid-tier offer callout was dropped since
  that page isn't part of this site.

Both the Gallery and UX Health Check pages were added to the main nav
(desktop + mobile) in `Layout.astro`, which the original uxblog nav did for
Gallery but not for UX Health Check (it only linked to that page via a
promotional CTA band component that wasn't ported).

**No phone number anywhere on this site.** It was removed from `contact.astro`
and from the `telephone` field of the `Person` JSON-LD in `Layout.astro` at
the user's request (2026-07-20). Don't re-add one (e.g. by copying more
uxblog content wholesale) without checking with the user first — uxblog's
copies of the contact page and `src/lib/schema.ts` still have it, since that
directory wasn't scrubbed (it's legacy/unpublished and slated for deletion).

Not yet migrated, still uxblog-only: case studies / insights blog, the paid
`ux-audit` page, the promotional UX-Health-Check CTA band component, and the
contact-form Google Apps Script runbook docs in `uxblog/docs/`. Confirm with
the user before deleting `uxblog/` — check whether any of that still needs
porting first.
