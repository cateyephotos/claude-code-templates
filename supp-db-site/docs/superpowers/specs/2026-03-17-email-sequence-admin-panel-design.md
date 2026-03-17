# Email Sequence Admin Panel — Design Spec

**Date:** 2026-03-17
**Project:** SupplementDB (supp-db-site)
**Linear Issue:** SUPP-3 — Build 3-Email Welcome Sequence + Admin Panel
**Status:** Approved for implementation

---

## 1. Overview

Build an admin-only email sequence configuration panel integrated into the existing SupplementDB admin dashboard. The panel enables designing, enabling, and tracking email sequence campaigns via a Convex-native backend and Resend delivery integration.

**Scope:**
- Convex backend: 4 new tables, cron mutation + action, webhook route in `http.ts`, CRUD functions
- Admin UI: New dedicated "Email" tab in `admin/index.html`
- 3 pre-built welcome sequence emails using the 7X brand voice
- Resend webhook integration for engagement tracking (opens, clicks, bounces, unsubscribes)

**Out of scope (deferred):**
- Full funnel Stripe attribution
- A/B testing email variants
- Subscriber import/export

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email content editing | Structured form with branded templates | Fastest to use at 1hr/week constraint; keeps brand voice consistent |
| Automation triggers | Manual + Event hybrid | Every sequence auto-triggers from events AND supports manual enrollment |
| Analytics depth | Engagement metrics (opens, clicks, unsubs) | Sufficient for optimization; Stripe attribution deferred |
| Admin panel location | Dedicated header tab in admin dashboard | Full-width workspace; cleanly separated from analytics dashboard |
| Sequence timing | Smart scheduling (delays + send time + day exclusions) | Improves open rates; minimal extra complexity over fixed delays |
| Backend architecture | Convex-native | Single backend, no new infrastructure; fits existing stack |

---

## 3. Data Model

### Table: `emailSequences`

```typescript
emailSequences: defineTable({
  name: v.string(),
  description: v.string(),
  trigger: v.object({
    type: v.union(v.literal("event"), v.literal("manual"), v.literal("both")),
    event: v.optional(v.string()), // "email_opt_in" | "pdf_purchase" | "pro_signup"
  }),
  status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
  sendTime: v.object({
    hour: v.number(),       // 0–23
    minute: v.number(),     // 0 or 30
    timezone: v.string(),   // e.g. "America/New_York"
  }),
  excludeDays: v.array(v.string()), // ["saturday", "sunday"]
  maxDeferHours: v.number(),        // max hours to wait for scheduling window (default: 48)
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Table: `emailSteps`

```typescript
emailSteps: defineTable({
  sequenceId: v.id("emailSequences"),
  stepIndex: v.number(),   // 0-indexed position; used as cursor in emailSubscribers.currentStepIndex
  subject: v.string(),     // supports {{variable}} tokens
  preheader: v.string(),   // supports {{variable}} tokens
  bodyBlocks: v.array(v.object({
    type: v.union(v.literal("text"), v.literal("cta"), v.literal("divider")),
    content: v.optional(v.string()),  // text blocks; supports {{variable}} tokens
    label: v.optional(v.string()),    // CTA blocks
    url: v.optional(v.string()),      // CTA blocks
  })),
  delayDays: v.number(),  // 0 = send on enrollment day, N = N days after previous step sent
  status: v.union(v.literal("active"), v.literal("disabled")),
})
.index("by_sequence", ["sequenceId", "stepIndex"])
```

**Note:** `stepIndex` is a stable 0-based position assigned at creation and maintained through reorder operations. `emailSubscribers.currentStepIndex` stores this value directly. When steps are reordered, all `stepIndex` values are reassigned atomically in a single mutation.

### Table: `emailSubscribers`

```typescript
emailSubscribers: defineTable({
  email: v.string(),
  newsletterSubscriberId: v.optional(v.id("newsletterSubscribers")), // link to canonical subscriber
  sequenceId: v.id("emailSequences"),
  currentStepIndex: v.number(),      // 0-indexed; matches emailSteps.stepIndex
  status: v.union(
    v.literal("active"),
    v.literal("completed"),
    v.literal("unsubscribed"),
    v.literal("paused")
  ),
  enrolledAt: v.number(),
  nextSendAt: v.number(),            // Unix timestamp ms; when to send next step
  source: v.string(),                // "event:email_opt_in" | "manual:admin"
})
.index("by_sequence", ["sequenceId"])
.index("by_status_next_send", ["status", "nextSendAt"])
.index("by_email_sequence", ["email", "sequenceId"])  // for duplicate enrollment guard
```

### Table: `emailEvents`

```typescript
emailEvents: defineTable({
  subscriberId: v.id("emailSubscribers"),
  stepId: v.id("emailSteps"),
  sequenceId: v.id("emailSequences"),
  resendMessageId: v.string(),       // top-level field for O(1) webhook lookup
  type: v.union(
    v.literal("sent"),
    v.literal("delivered"),
    v.literal("opened"),
    v.literal("clicked"),
    v.literal("bounced"),
    v.literal("unsubscribed")
  ),
  metadata: v.optional(v.object({
    link: v.optional(v.string()),    // for "clicked" events
  })),
  timestamp: v.number(),
})
.index("by_subscriber", ["subscriberId"])
.index("by_step", ["stepId"])
.index("by_sequence_type", ["sequenceId", "type"])
.index("by_resend_message_id", ["resendMessageId"])  // O(1) webhook lookup
```

**Note:** Resend message IDs are stored as top-level fields on `emailEvents` (not in arrays on subscribers) with an index for O(1) webhook lookup. When the "sent" event is created, the `resendMessageId` is written here.

### Dynamic Variable System

At send time, subject/preheader/body fields support `{{variable}}` tokens resolved from live Convex data:

| Token | Source | Example |
|-------|--------|---------|
| `{{supplement_count}}` | `COUNT(supplements)` query | "93" |
| `{{paper_count}}` | `siteConfig` table field `paperCount` (admin-maintained) | "471" |
| `{{user_name}}` | `emailSubscribers.email` → `users` table first name lookup | "Carlos" |
| `{{evidence_tier_count}}` | `siteConfig` table field `evidenceTierCount` | "4" |
| `{{current_year}}` | `new Date().getFullYear().toString()` | "2026" |

**Note:** `{{paper_count}}` is sourced from a `siteConfig` table (to be created) that stores admin-maintained site-wide stats. This avoids requiring a live count of a non-Convex data source. The admin can update this value from the admin panel settings.

---

## 4. Convex Backend Architecture

### New Files

**`convex/emailSequences.ts`** — Sequence + step CRUD (mutations and queries only — no actions, ensuring `requireAdmin()` compatibility)
- `listSequences` — query (admin): all sequences with step count and active subscriber count
- `getSequence` — query (admin): single sequence with all steps ordered by `stepIndex`
- `createSequence` — mutation (admin): create draft sequence with default scheduling
- `updateSequence` — mutation (admin): update fields; status toggle (draft→active, active↔paused)
- `deleteSequence` — mutation (admin): allowed only if `status === "draft"`; cascades to delete associated `emailSteps` records
- `createStep` — mutation (admin): appends step with next available `stepIndex`
- `updateStep` — mutation (admin): update step content/delay/status
- `deleteStep` — mutation (admin): removes step; reassigns `stepIndex` values for remaining steps
- `reorderSteps` — mutation (admin): accepts new ordered array of step IDs; atomically reassigns all `stepIndex` values from 0
- `getSequenceAnalytics` — query (admin): open/click/bounce rates per step; aggregate funnel counts; filtered by time range

**`convex/emailSubscribers.ts`** — Enrollment and progression (mutations and queries only)
- `enrollSubscriber` — internal mutation: checks `by_email_sequence` index to prevent duplicate enrollment; creates subscriber record; calculates `nextSendAt` using smart scheduling
- `unenrollSubscriber` — internal mutation: sets status to "paused" or "unsubscribed"; called by webhook handler and unsubscribe flow
- `manualEnroll` — mutation (admin): bulk-enroll email list into a sequence; calls `enrollSubscriber` for each; skips already-enrolled emails
- `listSubscribers` — query (admin): paginated subscriber list filterable by status

**`convex/emailCron.ts`** — Queue processor (split into mutation + action per Convex cron constraints)

```typescript
// Internal mutation — called by cron, safe to schedule
export const triggerEmailQueue = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_status_next_send", q =>
        q.eq("status", "active").lte("nextSendAt", now)
      )
      .take(50); // batch size to avoid timeout
    for (const subscriber of due) {
      await ctx.scheduler.runAfter(0, internal.emailCron.processSingleSubscriber, {
        subscriberId: subscriber._id,
      });
    }
  }
});

// Internal action — handles Resend API calls (cannot be called by cron directly)
export const processSingleSubscriber = internalAction({
  args: { subscriberId: v.id("emailSubscribers") },
  handler: async (ctx, { subscriberId }) => {
    // 1. Load subscriber + sequence + current step
    // 2. Check smart scheduling: is now within sendTime window? Is today excluded?
    //    - If outside window AND (now - nextSendAt) < maxDeferHours: reschedule +1hr, return
    //    - If outside window AND deferred too long: send anyway (failsafe)
    // 3. Resolve {{variable}} tokens via ctx.runQuery
    // 4. Render HTML from body blocks (+ mandatory unsubscribe footer)
    // 5. Send via Resend; receive messageId
    // 6. ctx.runMutation to: create emailEvents "sent" record with resendMessageId
    // 7. ctx.runMutation to: advance currentStepIndex or mark "completed"
  }
});
```

**`convex/crons.ts`** — New file (does not currently exist)
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "email-queue-processor",
  { minuteUTC: 0 },
  internal.emailCron.triggerEmailQueue
);

export default crons;
```

**Resend Webhook Route** — Added to existing `convex/http.ts` (not a separate file):
```typescript
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Validate Resend webhook signature using RESEND_WEBHOOK_SECRET
    // 2. Parse event: type, data.message_id
    // 3. Look up emailEvents by resendMessageId index → get subscriberId + stepId
    // 4. Insert emailEvents record with correct type + timestamp
    // 5. On "email.unsubscribed": call internal.emailSubscribers.unenrollSubscriber
    //    AND mark newsletterSubscribers record as unsubscribed (if linked)
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});
```

### Subscriber Identity Reconciliation

The existing `newsletterSubscribers` table is the **canonical unsubscribe authority**. The new `emailSubscribers` table links to it via `newsletterSubscriberId`.

**Enrollment flow:**
1. When `enrollSubscriber` is called, look up `newsletterSubscribers` by email
2. If found and status is `"unsubscribed"` → reject enrollment; do not send sequence emails
3. If found and status is `"confirmed"` → set `newsletterSubscriberId` on the subscriber record
4. If not found → enroll without link (manual enrollees may not be newsletter subscribers)

**Unsubscribe propagation:**
- Resend webhook `email.unsubscribed` → pause `emailSubscribers` record AND mark linked `newsletterSubscribers` as unsubscribed
- Existing newsletter unsubscribe token flow → also pause all active `emailSubscribers` records for that email

### Unsubscribe Footer

Every sequence email rendered by `processSingleSubscriber` automatically appends a mandatory unsubscribe footer block. This is injected at render time in the HTML template, not left to admin discretion:

```html
<div style="text-align:center;padding:20px;font-size:12px;color:#666;">
  <p>You're receiving this because you subscribed at SupplementDB.</p>
  <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
</div>
```

`{{unsubscribe_url}}` resolves to the existing newsletter unsubscribe endpoint with the subscriber's token.

### Event Trigger Wiring

Existing actions in `convex/resend.ts` gain enrollment hooks. All hooks check `newsletterSubscribers` status before enrolling:

| Existing Action | Trigger Event | Sequences to Enroll |
|-----------------|---------------|---------------------|
| `sendWelcomeEmail` | `email_opt_in` | Active sequences with `trigger.event === "email_opt_in"` |
| `sendGuideDownloadEmail` | `pdf_purchase` | Active sequences with `trigger.event === "pdf_purchase"` |
| `http.ts` Stripe webhook `checkout.session.completed` (subscription) | `pro_signup` | Active sequences with `trigger.event === "pro_signup"` |

Enrollment hooks are `ctx.runMutation(internal.emailSubscribers.enrollSubscriber, ...)` calls appended after the primary action succeeds.

---

## 5. Admin UI

### Location
Dedicated "Email" tab added to `admin/index.html` header alongside existing tab navigation. URL hash: `#email`. Uses existing admin tab switching pattern.

### Sub-view 1: Sequences List
- Table: Name, Status badge + inline toggle, Steps count, Active subscribers count, Trigger type, Last updated
- "New Sequence" button → opens editor (blank)
- Row click → opens editor (pre-filled)
- Tailwind + `#2d5a3d` accent, consistent with existing admin tables

### Sub-view 2: Sequence Editor

**Sections:**

1. **Metadata:** Name (required), description, status badge

2. **Trigger:** Event dropdown (None / Email Opt-In / PDF Purchase / Pro Signup). Manual enrollment always available regardless.

3. **Scheduling:**
   - Send time: hour + AM/PM + timezone (common US timezones)
   - Exclude days: Mon–Sun checkboxes (default: Sat + Sun)
   - Max defer: hours input (default: 48) — failsafe: send anyway if window missed beyond this

4. **Steps (ordered, reorderable):** Each step card:
   - Delay: "Send immediately" / "+ N days after previous step sent"
   - Subject + Preheader: text inputs with `{{}}` variable insert dropdown
   - Body blocks (text / CTA / divider): ordered, add/remove/reorder
   - Text blocks: textarea with variable insert; CTA blocks: label + URL inputs
   - Step enable/disable toggle; step delete (with confirm)
   - "Add Step" button

5. **Sticky action bar:** "Send Test Email to carlosthomasphotos@gmail.com" | "Save Draft" | "Save & Activate"
   - Test email recipient resolves from authenticated Clerk session email (not hardcoded)

### Sub-view 3: Analytics

- Sequence selector + time range (7d / 30d / All time)
- Funnel stat cards: Sent → Delivered → Opened → Clicked
- Per-step table: subject, sent, delivered %, opened %, clicked %, bounced %, unsub count
- Subscriber table: email, status, current step, enrolled date, last event; filterable by status
- "Manually Enroll" button: modal with textarea (bulk email paste) + sequence selector

---

## 6. Pre-Built Welcome Sequence

Three emails using the 7X brand voice (calm authority, dry humor, no emojis, evidence contrasts). All dynamic values use `{{variable}}` tokens.

**Email 1 — Welcome (send immediately)**
- Subject: `The {{supplement_count}} supplements. The {{paper_count}} papers. Here's what it means for you.`
- Preheader: `Not all of them are worth taking. Most people are surprised which ones are.`
- Content: Welcome, explain the 4-tier evidence system, set expectations for next 2 emails
- PS: Link to browse the full database

**Email 2 — Evidence Gap (+2 days)**
- Subject: `"Clinically proven" can mean 12 people for 3 weeks. Here's what it actually means.`
- Preheader: `The label says evidence-based. The evidence says otherwise.`
- Content: Reframe what "clinically proven" means; real example of Tier 1 vs Tier 4 supplement; introduce evidence tiers
- CTA: View the evidence tier guide

**Email 3 — $9 Guide Offer (+5 days)**
- Subject: `{{supplement_count}} supplements reviewed for sleep. Here are the ones with actual evidence.`
- Preheader: `You've seen the gap. Here's the complete protocol.`
- Content: Bridge from education to action; evidence stats as proof; introduce Sleep Optimization Guide at $9
- CTA: Get the Sleep Evidence Guide — $9

**Note:** Email 3 subject uses total supplement count accurately (not "sleep supplements" count, which would be misleading). The subject positions this as "supplements reviewed for sleep" — accurate framing.

---

## 7. Security & Access Control

- All email management mutations/queries: `requireAdmin()` (existing utility — only works on QueryCtx/MutationCtx, which all email functions use)
- Resend webhook: validates signature using `RESEND_WEBHOOK_SECRET` env var before processing
- Manual enrollment: admin-only; does not bypass unsubscribe check
- Unsubscribe: propagates to both `emailSubscribers` and `newsletterSubscribers` tables
- No subscriber PII exposed in client-side queries beyond email address
- Test email: resolves recipient from Clerk session, not hardcoded

---

## 8. Environment Variables

| Variable | Purpose | Status |
|----------|---------|--------|
| `RESEND_API_KEY` | Send emails | Already configured |
| `RESEND_FROM_ADDRESS` | Sender address | Already configured |
| `RESEND_WEBHOOK_SECRET` | Validate Resend webhook signatures | **New — must add** |
| `SITE_URL` | Unsubscribe URL base, CTA links | Already configured |

---

## 9. Files to Create / Modify

**New files:**
- `convex/emailSequences.ts` — sequence + step CRUD (mutations + queries)
- `convex/emailSubscribers.ts` — enrollment + progression (mutations + queries)
- `convex/emailCron.ts` — `triggerEmailQueue` (internal mutation) + `processSingleSubscriber` (internal action)
- `convex/crons.ts` — **create new** (does not currently exist); registers hourly cron
- `admin/email.js` — Email tab UI logic
- `admin/email.css` — Email tab styles extending admin.css

**Modified files:**
- `convex/schema.ts` — Add 4 new tables + `siteConfig` table for admin-maintained stats
- `convex/http.ts` — Add `/resend-webhook` route before `export default http`
- `convex/resend.ts` — Add enrollment hooks to `sendWelcomeEmail` and `sendGuideDownloadEmail`
- `convex/newsletter.ts` — Add unsubscribe propagation to pause linked `emailSubscribers` records
- `admin/index.html` — Add Email tab to header; load `email.js` + `email.css`
- `.env.example` — Add `RESEND_WEBHOOK_SECRET`

---

## 10. Success Criteria (SUPP-3)

- [ ] 3 welcome emails configured in the panel with `{{variable}}` tokens
- [ ] Admin panel accessible via Email header tab
- [ ] Sequence editor working end-to-end (create, edit, step CRUD, reorder)
- [ ] Enable/disable toggle per sequence operational
- [ ] Analytics dashboard showing sends/opens/clicks per step
- [ ] Resend webhooks recording delivery events via `/resend-webhook` in `http.ts`
- [ ] Auto-trigger: email opt-in → welcome sequence enrollment
- [ ] Manual enrollment working from admin panel (bulk paste)
- [ ] Duplicate enrollment guard: existing active subscriber not re-enrolled
- [ ] Unsubscribe propagation: Resend webhook unsubscribe → pauses sequence AND newsletter records
- [ ] Dynamic variables resolving live Convex data at send time
- [ ] Mandatory unsubscribe footer injected in every sequence email
- [ ] Smart scheduling with `maxDeferHours` failsafe (no silent indefinite deferral)
- [ ] Test email send resolves to authenticated admin's Clerk email
