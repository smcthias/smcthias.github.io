# UX Health Check — Nurture Email Sequence

Ready-to-paste copy for the automated sequence that runs after someone completes
the [UX Health Check](https://savellem.com/ux-health-check). Drop these into your
ESP (Kit/ConvertKit, Beehiiv, Mailchimp, etc.) once `FORM_ENDPOINT` is wired —
see `ux-health-check-runbook.md`.

**Merge tags** (adjust to your ESP's syntax): `{{first_name}}`, `{{score}}`,
`{{weakest_area}}`. **Replace before sending:** `[[BOOKING_LINK]]` (your call
scheduler), `[[AUDIT_URL]]` = https://savellem.com/ux-audit.

Cadence below is a starting point — tune to your audience.

---

## Email 1 — Immediately: deliver the result

**Subject:** Your UX Health Score: {{score}}/100
**Preview:** Plus the 3 things I'd fix first.

Hi {{first_name}},

Thanks for running the UX Health Check. Your product scored **{{score}}/100**, and
your biggest opportunity is **{{weakest_area}}**.

Here's the thing most teams miss: a UX score isn't the point — the *priorities*
are. The three recommendations you saw are ordered deliberately. Start at the top.

Over the next few days I'll send a short series on how I'd actually fix issues
like yours, what the process looks like, and a real example. No fluff.

If you'd rather just talk it through, reply to this email — it comes straight to me.

— Savelle

---

## Email 2 — Day 2: a results story

**Subject:** What fixing this actually looks like
**Preview:** A regulated-industry example.

Hi {{first_name}},

When I led digital experience at Green Compass, the enrollment flow had to handle
product restrictions, state-by-state shipping laws, age verification, and FDA
disclaimers — without overwhelming someone mid-purchase.

The fix wasn't more features. It was *progressive disclosure*: show the right rule
at the right moment, not all of them at once. That single principle turned a
compliance headache into a flow people could finish.

Most UX problems are like this. The friction you measured in your Health Check
usually traces back to a handful of decisions, not a thousand small bugs.

Tomorrow: how I find those decisions fast.

— Savelle

---

## Email 3 — Day 4: how I work

**Subject:** How I find the real problem fast
**Preview:** Senior, hands-on, no junior hand-off.

Hi {{first_name}},

When I review a product, I navigate it as a first-time user and verbalize every
moment of confusion — then organize what I find by severity and business impact,
not by how easy it is to fix.

That ordering matters. It's why teams I work with stop guessing and start shipping
the changes that actually move conversion.

A few things clients tell me make the difference:
- You work with me, not a junior hand-off.
- Every recommendation comes with a specific, implementable next step.
- Two decades across enterprise SaaS and e-commerce means I've seen your problem before.

Tomorrow I'll show you the fastest way to get this for your own product.

— Savelle

---

## Email 4 — Day 6: the offer

**Subject:** Your product, reviewed in 48 hours
**Preview:** Fixed scope, fixed price, money-back.

Hi {{first_name}},

If your Health Check score left you wanting specifics, here's the fast path:
the **48-Hour UX Audit**.

You get:
- A recorded walkthrough of your product as a first-time user
- A prioritized list of every issue, ranked by impact
- Quick-win recommendations you can ship this week
- A 60-minute strategy call to plan the fixes

Fixed price — **$997**. Delivered in 48 hours. Money-back guarantee if the audit
isn't worth it.

That's a fraction of a $10,000+ agency engagement, with the same senior eyes.

→ [Start your audit]([[AUDIT_URL]])  ·  [Book a quick call]([[BOOKING_LINK]])

— Savelle

---

## Email 5 — Day 9: soft re-engage

**Subject:** Still thinking about your UX?
**Preview:** No pressure — one question.

Hi {{first_name}},

I'll leave it here so I'm not crowding your inbox.

One question worth sitting with: if the friction in your **{{weakest_area}}** is
quietly costing you conversions every day, what's the cost of *not* fixing it this
quarter?

When you're ready, the [48-Hour UX Audit]([[AUDIT_URL]]) is the fastest way to
get clear answers — or just reply and tell me what you're working on.

— Savelle

---

## Measurement

The site already fires GA4 events you can use as sequence triggers/goals:
- `ux_health_check_completed` (with `score`) — entry into this sequence
- `begin_checkout` — clicked the $997 audit
- `generate_lead` — clicked a contact CTA

Track the sequence on **discovery calls booked** and **audits sold**, not opens.
