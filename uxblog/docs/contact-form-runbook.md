# Contact Form — Activation Runbook

The redesigned `/contact` page has a real lead-capture form. It validates, shows
loading/success/error states, captures UTM attribution, and fires a GA4
`generate_lead` event on submit. What it does NOT do yet is *deliver* the
submission anywhere — because the site is static (GitHub Pages) and
`FORM_ENDPOINT` is empty.

## Go live (pick one)

### Option A — Google Sheet (chosen) ⭐
A free Google Apps Script web app writes each submission into a Sheet and emails
Savelle. The script lives in `docs/google-apps-script-leads.gs`.

1. Create a Google Sheet (e.g. "Savellem Leads").
2. **Extensions → Apps Script**, delete the placeholder, paste the contents of
   `docs/google-apps-script-leads.gs`, and Save.
3. **Deploy → New deployment → Web app**: *Execute as* Me, *Who has access*
   **Anyone**. Deploy and authorize.
4. Copy the **Web app URL** (ends in `/exec`).
5. In `src/pages/contact.astro`, set:
   ```js
   const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfyc.../exec';
   ```
6. Rebuild + deploy. Submissions now append to the Sheet and email Savelle.

The form POSTs the lead as a `text/plain` JSON body in `no-cors` mode (Apps
Script returns no CORS headers, so the response is opaque — a delivered request
is treated as success; a network failure shows the email fallback). To verify,
submit a test inquiry and confirm a new row + email arrive.

### Option B — Formspree (alternative, stay on GitHub Pages)
1. Create a form at formspree.io and copy its endpoint (`https://formspree.io/f/xxxx`).
2. In `src/pages/contact.astro`, set:
   ```js
   const FORM_ENDPOINT = 'https://formspree.io/f/xxxx';
   ```
3. The form POSTs JSON `{ name, email, project_type, budget, message, utm_* }`.
   Confirm the provider accepts JSON, or change the fetch in the page script to
   `application/x-www-form-urlencoded` if needed.
4. Rebuild + deploy. Submissions now email Savelle and store in the dashboard.

### Option C — Netlify / Vercel (if the site moves off GitHub Pages)
Use Netlify Forms or a serverless function as the endpoint, then set
`FORM_ENDPOINT` to it. This also gives the UX Health Check a first-party endpoint
(see ux-health-check-runbook.md) and keeps provider keys server-side.

## Enable "Book a call"
Set `BOOKING_URL` in `src/pages/contact.astro` to a Cal.com / Calendly link. The
secondary "Prefer to talk? Book a 30-min intro call" button only renders when
this is set. The nurture sequence's `[[BOOKING_LINK]]` should use the same URL.

## Tracking / GA4 (recommended)
- `generate_lead` (method: `contact_form`) already fires on successful submit —
  mark it a **Key Event** in GA4 Admin so it counts as a conversion.
- `contact_intent` fires on clicks of "Start a project" CTAs (soft, top-of-funnel).
- Consider a Stripe success → `/audit-thank-you` page that fires `purchase`
  (value 997) so audit *sales* are measured, not just `begin_checkout`.
- UTMs are captured as hidden fields and submitted with the lead for attribution.

## Still pending Savelle's input
- Hosting choice (GitHub Pages + Formspree vs. Netlify/Vercel).
- The qualifying options (project types / budget bands) — currently sensible defaults.
- A dedicated inbox/alias (e.g. hello@savellem.com) vs. personal Gmail.
- A headshot for the trust rail would strengthen the "you work with me" note.
