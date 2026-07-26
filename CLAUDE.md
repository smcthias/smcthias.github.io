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
