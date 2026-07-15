# UX Health Check — Email Capture Runbook

The `/ux-health-check` tool is fully functional today. It scores the quiz, gates
the result behind an email, and shows personalized recommendations. What it does
**not** do yet is *send* the captured email anywhere — because the site is static
(GitHub Pages) and there is no backend.

To start capturing leads, wire up a form endpoint. Pick one path:

## Option A — Hosted form service (no backend, easiest)

Works on static GitHub Pages. Examples: Formspree, Web3Forms, ConvertKit/Kit,
Beehiiv, Mailchimp embedded endpoint.

1. Create a form/endpoint in your provider and copy its POST URL.
2. Open `src/pages/ux-health-check.astro` and set:
   ```js
   const FORM_ENDPOINT = 'https://formspree.io/f/XXXXXXXX';
   ```
3. The tool already POSTs JSON: `{ email, score, categories }`. Confirm your
   provider accepts JSON, or adapt the `fetch` body in the page script to the
   provider's expected format (some want `application/x-www-form-urlencoded`).
4. Rebuild and deploy. Submissions now flow to your provider; pipe them into your
   nurture sequence.

## Option B — Serverless function (if you move off static hosting)

If the site moves to Vercel/Netlify/Cloudflare, create a function (e.g.
`/api/ux-health-check`) that validates the payload and forwards it to your ESP,
then set `FORM_ENDPOINT = '/api/ux-health-check'`. This keeps the provider key
server-side and lets you add spam protection.

## Recommended nurture follow-up (from the audit)

1. Personalized result email (their score + the 3 priorities the tool returned)
2. A results/story email — what fixing these looks like
3. "How I work"
4. The productized 48-hour UX Audit offer with price + booking link
5. A soft re-engage

## Notes

- A GA4 event `ux_health_check_completed` (with `score`) already fires on finish —
  use it to measure tool completions and build a remarketing audience.
- Keep the value exchange honest: the result is shown immediately after email
  entry, even before the ESP confirms. Don't add a hard "check your inbox to
  unlock" wall — it kills completion.
