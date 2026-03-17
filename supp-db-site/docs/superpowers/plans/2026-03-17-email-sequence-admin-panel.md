# Email Sequence Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only email sequence panel with Convex backend, Resend delivery, smart scheduling, and engagement analytics integrated into the existing SupplementDB admin dashboard.

**Architecture:** Convex-native 4-table data model (emailSequences, emailSteps, emailSubscribers, emailEvents) plus siteConfig for dynamic variables. Cron internalMutation dispatches per-subscriber internalAction via scheduler (Convex constraint: crons cannot call actions directly). Smart scheduling with deferral failsafe via deferredSince field + maxDeferHours. Resend webhook events stored with top-level resendMessageId and O(1) index lookup. Admin UI as dedicated Email nav item in existing sidebar, rendering full-width workspace.

**Tech Stack:** Convex (TypeScript backend), Resend API, Clerk (auth via existing requireAdmin), Tailwind CSS 2.2.19, Vanilla JS admin UI, Chart.js 4.4.1, Font Awesome 6.4.0

**Spec:** `docs/superpowers/specs/2026-03-17-email-sequence-admin-panel-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `convex/emailSequences.ts` | Sequence + step CRUD mutations and queries (admin-only) |
| `convex/emailSubscribers.ts` | Enrollment, unenrollment, manual enroll, subscriber listing |
| `convex/emailCron.ts` | triggerEmailQueue (internalMutation) + helper mutations + internal queries |
| `convex/emailCronAction.ts` | processSingleSubscriber (internalAction) — separate file for Node.js Resend import |
| `convex/siteConfig.ts` | Site-wide config key-value CRUD (for dynamic email variables) |
| `convex/crons.ts` | Hourly cron registration |
| `admin/email.js` | Email tab UI logic (sequences list, editor, analytics, manual enrollment) |
| `admin/email.css` | Email tab styles extending admin.css |

### Modified Files
| File | Change |
|------|--------|
| `convex/schema.ts` | Add 5 new tables: emailSequences, emailSteps, emailSubscribers, emailEvents, siteConfig |
| `convex/http.ts` | Add `/resend-webhook` POST route before `export default http` |
| `convex/resend.ts` | Add enrollment hooks to sendWelcomeEmail and sendGuideDownloadEmail |
| `convex/newsletter.ts` | Add unsubscribe propagation to pause linked emailSubscribers |
| `admin/index.html` | Add Email nav item to sidebar; load email.js + email.css |

---

## Chunk 1: Schema + siteConfig Table

### Task 1: Add 5 new tables to convex/schema.ts

**Files:**
- Modify: `convex/schema.ts` (after line 222, before closing `});`)

- [ ] **Step 1: Add emailSequences table to schema**

Add after the `emailLog` table definition (line 222) in `convex/schema.ts`:

```typescript
  // ── Email Sequence System ──────────────────────────────────

  // Email sequences (campaigns)
  emailSequences: defineTable({
    name: v.string(),
    description: v.string(),
    trigger: v.object({
      type: v.union(v.literal("event"), v.literal("manual"), v.literal("both")),
      event: v.optional(v.string()),
    }),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
    sendTime: v.object({
      hour: v.number(),
      minute: v.number(),
      timezone: v.string(),
    }),
    excludeDays: v.array(v.string()),
    maxDeferHours: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
```

- [ ] **Step 2: Add emailSteps table to schema**

Add immediately after emailSequences:

```typescript
  // Email steps within a sequence
  emailSteps: defineTable({
    sequenceId: v.id("emailSequences"),
    stepIndex: v.number(),
    subject: v.string(),
    preheader: v.string(),
    bodyBlocks: v.array(v.object({
      type: v.union(v.literal("text"), v.literal("cta"), v.literal("divider")),
      content: v.optional(v.string()),
      label: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    delayDays: v.number(),
    status: v.union(v.literal("active"), v.literal("disabled")),
  })
    .index("by_sequence", ["sequenceId", "stepIndex"]),
```

- [ ] **Step 3: Add emailSubscribers table to schema**

```typescript
  // Subscribers enrolled in email sequences
  emailSubscribers: defineTable({
    email: v.string(),
    newsletterSubscriberId: v.optional(v.id("newsletterSubscribers")),
    sequenceId: v.id("emailSequences"),
    currentStepIndex: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("unsubscribed"),
      v.literal("paused")
    ),
    enrolledAt: v.number(),
    nextSendAt: v.number(),
    deferredSince: v.optional(v.number()),
    source: v.string(),
  })
    .index("by_sequence", ["sequenceId"])
    .index("by_status_next_send", ["status", "nextSendAt"])
    .index("by_email_sequence", ["email", "sequenceId"])
    .index("by_email", ["email"]),  // for unsubscribe propagation lookups
```

- [ ] **Step 4: Add emailEvents table to schema**

```typescript
  // Email delivery/engagement events from Resend webhooks
  emailEvents: defineTable({
    subscriberId: v.id("emailSubscribers"),
    stepId: v.id("emailSteps"),
    sequenceId: v.id("emailSequences"),
    resendMessageId: v.string(),
    type: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("bounced"),
      v.literal("unsubscribed")
    ),
    metadata: v.optional(v.object({
      link: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_subscriber", ["subscriberId"])
    .index("by_step", ["stepId"])
    .index("by_sequence_type", ["sequenceId", "type"])
    .index("by_resend_message_id", ["resendMessageId"]),
```

- [ ] **Step 5: Add siteConfig table to schema**

```typescript
  // Site-wide configuration for dynamic email variables
  siteConfig: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  })
    .index("by_key", ["key"]),
```

- [ ] **Step 6: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors (schema changes are additive, no breaking changes)

- [ ] **Step 7: Commit schema changes**

```bash
cd supp-db-site
git add convex/schema.ts
git commit -m "feat: add email sequence system tables + siteConfig to schema

Add 5 new tables for the email sequence admin panel:
- emailSequences: campaign definitions with smart scheduling
- emailSteps: ordered email steps within sequences
- emailSubscribers: enrollment tracking with deferral failsafe
- emailEvents: Resend webhook delivery/engagement events
- siteConfig: admin-maintained dynamic variable store"
```

### Task 2: Create convex/siteConfig.ts

**Files:**
- Create: `convex/siteConfig.ts`

- [ ] **Step 1: Create siteConfig.ts with internal query + admin mutations**

Create `convex/siteConfig.ts`:

```typescript
import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * Site-wide configuration store for dynamic email variables.
 * Keys: supplementCount, paperCount, evidenceTierCount
 * Values are strings (parsed as needed at read time).
 */

// Internal query — used by emailCron.processSingleSubscriber to resolve {{variables}}
export const getAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("siteConfig").collect();
    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    return map;
  },
});

// Admin query — returns all config entries for the admin panel
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("siteConfig").collect();
  },
});

// Admin mutation — upsert a config key-value pair
export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: admin.clerkId,
      });
      return existing._id;
    }

    return ctx.db.insert("siteConfig", {
      key: args.key,
      value: args.value,
      updatedAt: now,
      updatedBy: admin.clerkId,
    });
  },
});
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit siteConfig**

```bash
cd supp-db-site
git add convex/siteConfig.ts
git commit -m "feat: add siteConfig CRUD for dynamic email variables

Internal query for email variable resolution + admin mutations
for managing supplementCount, paperCount, evidenceTierCount."
```

---

## Chunk 2: Sequence + Step CRUD

### Task 3: Create convex/emailSequences.ts — Sequence CRUD

**Files:**
- Create: `convex/emailSequences.ts`

- [ ] **Step 1: Create emailSequences.ts with sequence queries**

Create `convex/emailSequences.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * Email sequence + step CRUD.
 * All functions are admin-only (requireAdmin on QueryCtx/MutationCtx).
 */

// ── Sequence Queries ─────────────────────────────────────────

export const listSequences = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const sequences = await ctx.db.query("emailSequences").order("desc").collect();

    const results = [];
    for (const seq of sequences) {
      const steps = await ctx.db
        .query("emailSteps")
        .withIndex("by_sequence", (q) => q.eq("sequenceId", seq._id))
        .collect();

      const activeSubscribers = await ctx.db
        .query("emailSubscribers")
        .withIndex("by_sequence", (q) => q.eq("sequenceId", seq._id))
        .collect();

      const activeCount = activeSubscribers.filter((s) => s.status === "active").length;

      results.push({
        ...seq,
        stepCount: steps.length,
        activeSubscriberCount: activeCount,
      });
    }
    return results;
  },
});

export const getSequence = query({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) return null;

    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();

    // Sort by stepIndex ascending
    steps.sort((a, b) => a.stepIndex - b.stepIndex);

    return { ...sequence, steps };
  },
});
```

- [ ] **Step 2: Add sequence mutations (create, update, delete)**

Append to `convex/emailSequences.ts`:

```typescript
// ── Sequence Mutations ───────────────────────────────────────

export const createSequence = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    trigger: v.object({
      type: v.union(v.literal("event"), v.literal("manual"), v.literal("both")),
      event: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();

    return ctx.db.insert("emailSequences", {
      name: args.name,
      description: args.description,
      trigger: args.trigger,
      status: "draft",
      sendTime: { hour: 9, minute: 0, timezone: "America/New_York" },
      excludeDays: ["saturday", "sunday"],
      maxDeferHours: 48,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSequence = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.object({
      type: v.union(v.literal("event"), v.literal("manual"), v.literal("both")),
      event: v.optional(v.string()),
    })),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("paused"))),
    sendTime: v.optional(v.object({
      hour: v.number(),
      minute: v.number(),
      timezone: v.string(),
    })),
    excludeDays: v.optional(v.array(v.string())),
    maxDeferHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { sequenceId, ...updates } = args;

    const sequence = await ctx.db.get(sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    // Build patch object with only provided fields
    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.trigger !== undefined) patch.trigger = updates.trigger;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.sendTime !== undefined) patch.sendTime = updates.sendTime;
    if (updates.excludeDays !== undefined) patch.excludeDays = updates.excludeDays;
    if (updates.maxDeferHours !== undefined) patch.maxDeferHours = updates.maxDeferHours;

    await ctx.db.patch(sequenceId, patch);
    return sequenceId;
  },
});

export const deleteSequence = mutation({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    if (sequence.status !== "draft") {
      throw new Error("Can only delete draft sequences. Pause first, then set to draft.");
    }

    // Check for any subscribers (guard against manual-enrolled draft subscribers)
    const subscribers = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .first();
    if (subscribers) {
      throw new Error("Cannot delete sequence with enrolled subscribers. Remove subscribers first.");
    }

    // Cascade delete: steps, events
    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    for (const step of steps) {
      // Delete events for this step
      const events = await ctx.db
        .query("emailEvents")
        .withIndex("by_step", (q) => q.eq("stepId", step._id))
        .collect();
      for (const event of events) {
        await ctx.db.delete(event._id);
      }
      await ctx.db.delete(step._id);
    }

    await ctx.db.delete(args.sequenceId);
  },
});
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit sequence CRUD**

```bash
cd supp-db-site
git add convex/emailSequences.ts
git commit -m "feat: add emailSequences.ts with sequence queries + mutations

listSequences, getSequence, createSequence, updateSequence,
deleteSequence (draft-only with cascade guard)."
```

### Task 4: Add step CRUD + analytics to convex/emailSequences.ts

**Files:**
- Modify: `convex/emailSequences.ts`

- [ ] **Step 1: Add step CRUD mutations**

Append to `convex/emailSequences.ts`:

```typescript
// ── Step Mutations ───────────────────────────────────────────

export const createStep = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    subject: v.string(),
    preheader: v.string(),
    bodyBlocks: v.array(v.object({
      type: v.union(v.literal("text"), v.literal("cta"), v.literal("divider")),
      content: v.optional(v.string()),
      label: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    delayDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    // Find next available stepIndex
    const existingSteps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    const nextIndex = existingSteps.length > 0
      ? Math.max(...existingSteps.map((s) => s.stepIndex)) + 1
      : 0;

    const stepId = await ctx.db.insert("emailSteps", {
      sequenceId: args.sequenceId,
      stepIndex: nextIndex,
      subject: args.subject,
      preheader: args.preheader,
      bodyBlocks: args.bodyBlocks,
      delayDays: args.delayDays,
      status: "active",
    });

    await ctx.db.patch(args.sequenceId, { updatedAt: Date.now() });
    return stepId;
  },
});

export const updateStep = mutation({
  args: {
    stepId: v.id("emailSteps"),
    subject: v.optional(v.string()),
    preheader: v.optional(v.string()),
    bodyBlocks: v.optional(v.array(v.object({
      type: v.union(v.literal("text"), v.literal("cta"), v.literal("divider")),
      content: v.optional(v.string()),
      label: v.optional(v.string()),
      url: v.optional(v.string()),
    }))),
    delayDays: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("disabled"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    const { stepId, ...updates } = args;
    const patch: Record<string, any> = {};
    if (updates.subject !== undefined) patch.subject = updates.subject;
    if (updates.preheader !== undefined) patch.preheader = updates.preheader;
    if (updates.bodyBlocks !== undefined) patch.bodyBlocks = updates.bodyBlocks;
    if (updates.delayDays !== undefined) patch.delayDays = updates.delayDays;
    if (updates.status !== undefined) patch.status = updates.status;

    await ctx.db.patch(stepId, patch);
    await ctx.db.patch(step.sequenceId, { updatedAt: Date.now() });
    return stepId;
  },
});

export const deleteStep = mutation({
  args: { stepId: v.id("emailSteps") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Delete events for this step
    const events = await ctx.db
      .query("emailEvents")
      .withIndex("by_step", (q) => q.eq("stepId", args.stepId))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    await ctx.db.delete(args.stepId);

    // Reassign stepIndex for remaining steps
    const remaining = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", step.sequenceId))
      .collect();
    remaining.sort((a, b) => a.stepIndex - b.stepIndex);

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].stepIndex !== i) {
        await ctx.db.patch(remaining[i]._id, { stepIndex: i });
      }
    }

    await ctx.db.patch(step.sequenceId, { updatedAt: Date.now() });
  },
});

export const reorderSteps = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    stepIds: v.array(v.id("emailSteps")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    // Guard: only allow reorder on draft or paused sequences
    if (sequence.status === "active") {
      throw new Error("Cannot reorder steps on an active sequence. Pause it first.");
    }

    // Atomically reassign all stepIndex values
    for (let i = 0; i < args.stepIds.length; i++) {
      const step = await ctx.db.get(args.stepIds[i]);
      if (!step || step.sequenceId !== args.sequenceId) {
        throw new Error(`Step ${args.stepIds[i]} does not belong to this sequence`);
      }
      await ctx.db.patch(args.stepIds[i], { stepIndex: i });
    }

    await ctx.db.patch(args.sequenceId, { updatedAt: Date.now() });
  },
});
```

- [ ] **Step 2: Add getSequenceAnalytics query**

Append to `convex/emailSequences.ts`:

```typescript
// ── Analytics ────────────────────────────────────────────────

export const getSequenceAnalytics = query({
  args: {
    sequenceId: v.id("emailSequences"),
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const range = args.timeRange || "all";
    const now = Date.now();
    const cutoff = range === "7d"
      ? now - 7 * 24 * 60 * 60 * 1000
      : range === "30d"
        ? now - 30 * 24 * 60 * 60 * 1000
        : 0;

    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    steps.sort((a, b) => a.stepIndex - b.stepIndex);

    // Gather all events for this sequence
    const allEvents = await ctx.db
      .query("emailEvents")
      .withIndex("by_sequence_type", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();

    const filteredEvents = cutoff > 0
      ? allEvents.filter((e) => e.timestamp >= cutoff)
      : allEvents;

    // Build per-step analytics
    const stepAnalytics = steps.map((step) => {
      const stepEvents = filteredEvents.filter((e) => e.stepId === step._id);
      const sent = stepEvents.filter((e) => e.type === "sent").length;
      const delivered = stepEvents.filter((e) => e.type === "delivered").length;
      const opened = stepEvents.filter((e) => e.type === "opened").length;
      const clicked = stepEvents.filter((e) => e.type === "clicked").length;
      const bounced = stepEvents.filter((e) => e.type === "bounced").length;
      const unsubscribed = stepEvents.filter((e) => e.type === "unsubscribed").length;

      return {
        stepId: step._id,
        stepIndex: step.stepIndex,
        subject: step.subject,
        sent,
        deliveredPct: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        openedPct: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickedPct: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        bouncedPct: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
        unsubscribed,
      };
    });

    // Aggregate funnel
    const totalSent = filteredEvents.filter((e) => e.type === "sent").length;
    const totalDelivered = filteredEvents.filter((e) => e.type === "delivered").length;
    const totalOpened = filteredEvents.filter((e) => e.type === "opened").length;
    const totalClicked = filteredEvents.filter((e) => e.type === "clicked").length;

    return {
      funnel: { sent: totalSent, delivered: totalDelivered, opened: totalOpened, clicked: totalClicked },
      steps: stepAnalytics,
    };
  },
});
```

- [ ] **Step 3: Add getAdminEmail query + sendTestEmail mutation**

Append to `convex/emailSequences.ts`:

```typescript
// ── Test Email ───────────────────────────────────────────────

export const getAdminEmail = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    return admin.email;
  },
});

export const sendTestEmail = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    recipientEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    // Get first active step for test
    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    steps.sort((a, b) => a.stepIndex - b.stepIndex);
    const firstStep = steps.find((s) => s.status === "active");
    if (!firstStep) throw new Error("No active steps to test");

    // Dispatch test send via scheduler (uses the existing Resend action pattern)
    await ctx.scheduler.runAfter(0, internal.emailCronAction.sendTestEmailAction, {
      recipientEmail: args.recipientEmail,
      stepId: firstStep._id,
      sequenceId: args.sequenceId,
    });

    return { sent: true, stepSubject: firstStep.subject };
  },
});
```

Also add to `convex/emailCronAction.ts` (the action file with Node.js imports):

```typescript
export const sendTestEmailAction = internalAction({
  args: {
    recipientEmail: v.string(),
    stepId: v.id("emailSteps"),
    sequenceId: v.id("emailSequences"),
  },
  handler: async (ctx, args) => {
    const step = await ctx.runQuery(internal.emailCron.getStepById, { stepId: args.stepId });
    if (!step) return;

    const siteConfig = await ctx.runQuery(internal.siteConfig.getAll, {});
    const siteUrl = process.env.SITE_URL || "http://localhost:8080";

    const variables: Record<string, string> = {
      supplement_count: siteConfig.supplementCount || "90+",
      paper_count: siteConfig.paperCount || "400+",
      evidence_tier_count: siteConfig.evidenceTierCount || "4",
      current_year: new Date().getFullYear().toString(),
      user_name: args.recipientEmail.split("@")[0],
      unsubscribe_url: "#test-unsubscribe",
      site_url: siteUrl,
    };

    const subject = `[TEST] ${resolveVariables(step.subject, variables)}`;
    const html = renderEmailHtml(step.bodyBlocks, variables, "#test-unsubscribe");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error("RESEND_API_KEY not set"); return; }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_ADDRESS || "SupplementDB <onboarding@resend.dev>";

    try {
      await resend.emails.send({ from: fromAddress, to: [args.recipientEmail], subject, html });
      console.log(`Test email sent to ${args.recipientEmail}`);
    } catch (err) {
      console.error("Test email error:", err);
    }
  },
});

```

And add `getStepById` helper query to `convex/emailCron.ts`:

```typescript
export const getStepById = internalQuery({
  args: { stepId: v.id("emailSteps") },
  handler: async (ctx, args) => ctx.db.get(args.stepId),
});
```

**Note:** Add `import { internal } from "./_generated/api";` to `convex/emailSequences.ts` if not already present.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit step CRUD + analytics + test email**

```bash
cd supp-db-site
git add convex/emailSequences.ts convex/emailCron.ts
git commit -m "feat: add step CRUD + sequence analytics + test email to emailSequences.ts

createStep, updateStep, deleteStep (with stepIndex reassignment),
reorderSteps (draft/paused guard), getSequenceAnalytics (funnel + per-step),
getAdminEmail query, sendTestEmail mutation, sendTestEmailAction."
```

---

## Chunk 3: Subscriber Enrollment + Progression

### Task 5: Create convex/emailSubscribers.ts — Internal mutations

**Files:**
- Create: `convex/emailSubscribers.ts`

- [ ] **Step 1: Create emailSubscribers.ts with smart scheduling helper + enrollSubscriber**

Create `convex/emailSubscribers.ts`:

```typescript
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * Email subscriber enrollment and progression.
 * Internal mutations are called by emailCron and resend.ts hooks.
 * Admin mutations/queries are used by the admin UI.
 */

// ── Smart Scheduling Helper ──────────────────────────────────

/**
 * Calculate the next send timestamp based on smart scheduling rules.
 * @param delayDays Number of days to wait after previous send (0 = send today)
 * @param sendTime Preferred send time configuration
 * @param excludeDays Days of the week to exclude (e.g., ["saturday", "sunday"])
 * @returns Unix timestamp (ms) for the next scheduled send
 */
function calculateNextSendAt(
  delayDays: number,
  sendTime: { hour: number; minute: number; timezone: string },
  excludeDays: string[]
): number {
  const now = new Date();

  // Calculate target date: now + delayDays
  const target = new Date(now);
  target.setDate(target.getDate() + delayDays);

  // Set target time to preferred send time
  // Note: Timezone offsets are static approximations. DST shifts may cause ~1 hour
  // offset during Mar-Nov. For production precision, consider using Intl.DateTimeFormat
  // or a timezone library. This is acceptable for email send windows (2-hour tolerance).
  const tzOffsets: Record<string, number> = {
    "America/New_York": -5,
    "America/Chicago": -6,
    "America/Denver": -7,
    "America/Los_Angeles": -8,
    "UTC": 0,
  };
  const offset = tzOffsets[sendTime.timezone] ?? -5; // default EST

  // Set hours in UTC equivalent of the target timezone
  target.setUTCHours(sendTime.hour - offset, sendTime.minute, 0, 0);

  // If target is in the past for today, move to tomorrow
  if (target.getTime() <= now.getTime() && delayDays === 0) {
    target.setDate(target.getDate() + 1);
  }

  // Skip excluded days
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  let attempts = 0;
  while (excludeDays.includes(dayNames[target.getUTCDay()]) && attempts < 7) {
    target.setDate(target.getDate() + 1);
    attempts++;
  }

  return target.getTime();
}

// ── Internal Mutations ───────────────────────────────────────

export const enrollSubscriber = internalMutation({
  args: {
    email: v.string(),
    sequenceId: v.id("emailSequences"),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // Duplicate enrollment guard
    const existing = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_email_sequence", (q) =>
        q.eq("email", email).eq("sequenceId", args.sequenceId)
      )
      .first();
    if (existing && (existing.status === "active" || existing.status === "completed")) {
      return { status: "already_enrolled" as const, subscriberId: existing._id };
    }

    // Check newsletter subscriber status (canonical unsubscribe authority)
    const newsletterSub = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (newsletterSub?.status === "unsubscribed") {
      return { status: "unsubscribed_from_newsletter" as const };
    }

    // Load sequence for scheduling
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence || sequence.status !== "active") {
      return { status: "sequence_not_active" as const };
    }

    // Get first step for initial delay
    const firstStep = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .first();

    const delayDays = firstStep ? firstStep.delayDays : 0;
    const nextSendAt = calculateNextSendAt(delayDays, sequence.sendTime, sequence.excludeDays);

    const subscriberId = await ctx.db.insert("emailSubscribers", {
      email,
      newsletterSubscriberId: newsletterSub?._id,
      sequenceId: args.sequenceId,
      currentStepIndex: 0,
      status: "active",
      enrolledAt: Date.now(),
      nextSendAt,
      source: args.source,
    });

    return { status: "enrolled" as const, subscriberId };
  },
});

export const unenrollSubscriber = internalMutation({
  args: {
    subscriberId: v.id("emailSubscribers"),
    reason: v.union(v.literal("unsubscribed"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db.get(args.subscriberId);
    if (!subscriber) return;

    await ctx.db.patch(args.subscriberId, {
      status: args.reason,
    });
  },
});
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit internal mutations**

```bash
cd supp-db-site
git add convex/emailSubscribers.ts
git commit -m "feat: add emailSubscribers.ts with enrollment + unenrollment

enrollSubscriber (with duplicate guard, newsletter check, smart scheduling),
unenrollSubscriber (pause or unsubscribe), calculateNextSendAt helper."
```

### Task 6: Add admin functions to convex/emailSubscribers.ts

**Files:**
- Modify: `convex/emailSubscribers.ts`

- [ ] **Step 1: Add manualEnroll mutation + listSubscribers query**

Append to `convex/emailSubscribers.ts`:

```typescript
// ── Admin Functions ──────────────────────────────────────────

export const manualEnroll = mutation({
  args: {
    emails: v.array(v.string()),
    sequenceId: v.id("emailSequences"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");
    if (sequence.status !== "active") {
      throw new Error("Can only enroll into active sequences");
    }

    const results: Array<{ email: string; status: string }> = [];

    for (const rawEmail of args.emails) {
      const email = rawEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        results.push({ email: rawEmail, status: "invalid_email" });
        continue;
      }

      // Duplicate check
      const existing = await ctx.db
        .query("emailSubscribers")
        .withIndex("by_email_sequence", (q) =>
          q.eq("email", email).eq("sequenceId", args.sequenceId)
        )
        .first();

      if (existing && (existing.status === "active" || existing.status === "completed")) {
        results.push({ email, status: "already_enrolled" });
        continue;
      }

      // Newsletter unsubscribe check
      const newsletterSub = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (newsletterSub?.status === "unsubscribed") {
        results.push({ email, status: "newsletter_unsubscribed" });
        continue;
      }

      // Get first step for delay
      const firstStep = await ctx.db
        .query("emailSteps")
        .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
        .first();

      const delayDays = firstStep ? firstStep.delayDays : 0;
      const nextSendAt = calculateNextSendAt(delayDays, sequence.sendTime, sequence.excludeDays);

      await ctx.db.insert("emailSubscribers", {
        email,
        newsletterSubscriberId: newsletterSub?._id,
        sequenceId: args.sequenceId,
        currentStepIndex: 0,
        status: "active",
        enrolledAt: Date.now(),
        nextSendAt,
        source: "manual:admin",
      });

      results.push({ email, status: "enrolled" });
    }

    return results;
  },
});

export const listSubscribers = query({
  args: {
    sequenceId: v.id("emailSequences"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("unsubscribed"),
      v.literal("paused")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit || 100;

    let subscribers;
    if (args.status) {
      // Filter by sequence first, then filter by status in-memory
      subscribers = await ctx.db
        .query("emailSubscribers")
        .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
        .collect();
      subscribers = subscribers.filter((s) => s.status === args.status);
    } else {
      subscribers = await ctx.db
        .query("emailSubscribers")
        .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
        .collect();
    }

    // Sort by enrolledAt descending, take limit
    subscribers.sort((a, b) => b.enrolledAt - a.enrolledAt);
    subscribers = subscribers.slice(0, limit);

    // Enrich with last event info
    const enriched = [];
    for (const sub of subscribers) {
      const lastEvent = await ctx.db
        .query("emailEvents")
        .withIndex("by_subscriber", (q) => q.eq("subscriberId", sub._id))
        .order("desc")
        .first();

      enriched.push({
        ...sub,
        lastEventType: lastEvent?.type ?? null,
        lastEventAt: lastEvent?.timestamp ?? null,
      });
    }

    return enriched;
  },
});
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit admin functions**

```bash
cd supp-db-site
git add convex/emailSubscribers.ts
git commit -m "feat: add manualEnroll + listSubscribers to emailSubscribers.ts

Admin bulk enrollment with validation, duplicate/unsubscribe guards.
Paginated subscriber listing with last event enrichment."
```

---

## Chunk 4: Email Cron Queue Processor

### Task 7: Create convex/emailCron.ts — triggerEmailQueue + helper mutations

**Files:**
- Create: `convex/emailCron.ts`

- [ ] **Step 1: Create emailCron.ts with triggerEmailQueue internalMutation**

**CRITICAL CONVEX BUNDLING NOTE:** Convex bundles mutations and actions separately. Files that export both `internalMutation` and `internalAction` MUST NOT import Node.js-only packages (like `resend`) at the top level — this will cause deployment errors. The solution: `emailCron.ts` contains only mutations + queries. A separate `emailCronAction.ts` contains the action that imports `resend`.

Create `convex/emailCron.ts` (mutations + queries only — NO Node.js imports):

```typescript
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Email queue processor — mutation + query side.
 *
 * CRITICAL CONVEX CONSTRAINT: Crons can only call internalMutation, NOT internalAction.
 * triggerEmailQueue (internalMutation) is called by cron. It dispatches
 * processSingleSubscriber (internalAction in emailCronAction.ts) per subscriber via ctx.scheduler.runAfter.
 */

// ── Cron-safe trigger mutation ───────────────────────────────

export const triggerEmailQueue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const due = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_status_next_send", (q) =>
        q.eq("status", "active").lte("nextSendAt", now)
      )
      .order("asc") // oldest-due-first to prevent subscriber starvation
      .take(50);

    for (const subscriber of due) {
      await ctx.scheduler.runAfter(0, internal.emailCronAction.processSingleSubscriber, {
        subscriberId: subscriber._id,
      });
    }

    if (due.length > 0) {
      console.log(`Email queue: dispatched ${due.length} subscriber(s) for processing`);
    }
  },
});

// ── Helper mutations (called by processSingleSubscriber via ctx.runMutation) ──

export const updateDeferral = internalMutation({
  args: {
    subscriberId: v.id("emailSubscribers"),
    deferredSince: v.optional(v.number()),
    nextSendAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriberId, {
      deferredSince: args.deferredSince,
      nextSendAt: args.nextSendAt,
    });
  },
});

export const recordSentEvent = internalMutation({
  args: {
    subscriberId: v.id("emailSubscribers"),
    stepId: v.id("emailSteps"),
    sequenceId: v.id("emailSequences"),
    resendMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailEvents", {
      subscriberId: args.subscriberId,
      stepId: args.stepId,
      sequenceId: args.sequenceId,
      resendMessageId: args.resendMessageId,
      type: "sent",
      timestamp: Date.now(),
    });

    // Clear deferredSince on successful send
    await ctx.db.patch(args.subscriberId, {
      deferredSince: undefined,
    });
  },
});

export const advanceSubscriber = internalMutation({
  args: {
    subscriberId: v.id("emailSubscribers"),
    nextStepIndex: v.number(),
    nextSendAt: v.optional(v.number()),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.completed) {
      await ctx.db.patch(args.subscriberId, {
        status: "completed",
        currentStepIndex: args.nextStepIndex,
      });
    } else {
      await ctx.db.patch(args.subscriberId, {
        currentStepIndex: args.nextStepIndex,
        nextSendAt: args.nextSendAt!,
      });
    }
  },
});
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit trigger + helpers**

```bash
cd supp-db-site
git add convex/emailCron.ts
git commit -m "feat: add emailCron.ts with triggerEmailQueue + helper mutations

Cron-safe internalMutation dispatches per-subscriber actions.
Helper mutations: updateDeferral, recordSentEvent, advanceSubscriber."
```

### Task 8: Create convex/emailCronAction.ts — processSingleSubscriber

**Files:**
- Create: `convex/emailCronAction.ts` (separate from emailCron.ts to avoid Node.js bundling issues)

- [ ] **Step 1: Create emailCronAction.ts with variable resolution + HTML rendering helpers**

Create `convex/emailCronAction.ts`:

```typescript
"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
```

Then add the smart scheduling helper (duplicated from emailSubscribers.ts — pure function, no DB access):

```typescript
/**
 * Calculate the next send timestamp based on smart scheduling rules.
 * Note: Timezone offsets are static approximations. DST shifts may cause
 * ~1 hour offset during Mar-Nov. For production, consider using a timezone
 * library or Intl.DateTimeFormat for exact offsets.
 */
function calculateNextSendAt(
  delayDays: number,
  sendTime: { hour: number; minute: number; timezone: string },
  excludeDays: string[]
): number {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + delayDays);

  const tzOffsets: Record<string, number> = {
    "America/New_York": -5, "America/Chicago": -6,
    "America/Denver": -7, "America/Los_Angeles": -8, "UTC": 0,
  };
  const offset = tzOffsets[sendTime.timezone] ?? -5;
  target.setUTCHours(sendTime.hour - offset, sendTime.minute, 0, 0);

  if (target.getTime() <= now.getTime() && delayDays === 0) {
    target.setDate(target.getDate() + 1);
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  let attempts = 0;
  while (excludeDays.includes(dayNames[target.getUTCDay()]) && attempts < 7) {
    target.setDate(target.getDate() + 1);
    attempts++;
  }
  return target.getTime();
}
```

Then add the rendering helpers:

```typescript
// ── Email Rendering Helpers ──────────────────────────────────

function resolveVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

function renderEmailHtml(
  bodyBlocks: Array<{
    type: "text" | "cta" | "divider";
    content?: string;
    label?: string;
    url?: string;
  }>,
  variables: Record<string, string>,
  unsubscribeUrl: string
): string {
  const blocks = bodyBlocks.map((block) => {
    switch (block.type) {
      case "text":
        return `<tr><td style="padding:0 0 16px;color:#c9d1d9;font-size:15px;line-height:1.7;">${resolveVariables(block.content || "", variables)}</td></tr>`;
      case "cta":
        return `<tr><td align="center" style="padding:16px 0 24px;">
          <a href="${resolveVariables(block.url || "#", variables)}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
            ${resolveVariables(block.label || "Learn More", variables)}
          </a>
        </td></tr>`;
      case "divider":
        return `<tr><td style="padding:16px 0;"><hr style="border:none;border-top:1px solid rgba(99,102,241,0.15);"></td></tr>`;
      default:
        return "";
    }
  });

  // Mandatory unsubscribe footer (injected at render time, not admin-configurable)
  const footer = `<tr><td style="padding:20px 0 0;text-align:center;font-size:12px;color:#484f58;">
    <p style="margin:0 0 4px;">You're receiving this because you subscribed at SupplementDB.</p>
    <p style="margin:0;"><a href="${unsubscribeUrl}" style="color:#484f58;text-decoration:underline;">Unsubscribe</a></p>
  </td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#161b22;border-radius:12px;border:1px solid rgba(99,102,241,0.15);overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid rgba(99,102,241,0.1);">
          <span style="font-size:24px;margin-right:8px;">&#128138;</span>
          <span style="color:#f0f6fc;font-size:20px;font-weight:700;letter-spacing:-0.3px;">SupplementDB</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${blocks.join("\n            ")}
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(99,102,241,0.1);">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${footer}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
```

- [ ] **Step 2: Add processSingleSubscriber internalAction**

Continue in `convex/emailCronAction.ts`:

```typescript
// ── Per-Subscriber Action ────────────────────────────────────

export const processSingleSubscriber = internalAction({
  args: { subscriberId: v.id("emailSubscribers") },
  handler: async (ctx, { subscriberId }) => {
    // 1. Load subscriber
    const subscriber = await ctx.runQuery(internal.emailCron.getSubscriberData, { subscriberId });
    if (!subscriber || subscriber.status !== "active") return;

    const { sequence, step, newsletterSub } = subscriber;
    if (!sequence || !step) {
      console.error(`Missing sequence/step for subscriber ${subscriberId}`);
      return;
    }

    // Check if sequence is still active
    if (sequence.status !== "active") return;

    // Check if newsletter subscriber is unsubscribed (canonical authority)
    if (newsletterSub?.status === "unsubscribed") {
      await ctx.runMutation(internal.emailSubscribers.unenrollSubscriber, {
        subscriberId,
        reason: "unsubscribed",
      });
      return;
    }

    // 2. Smart scheduling check
    const now = Date.now();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = dayNames[new Date().getUTCDay()];

    const tzOffsets: Record<string, number> = {
      "America/New_York": -5,
      "America/Chicago": -6,
      "America/Denver": -7,
      "America/Los_Angeles": -8,
      "UTC": 0,
    };
    const offset = tzOffsets[sequence.sendTime.timezone] ?? -5;
    const localHour = (new Date().getUTCHours() + offset + 24) % 24;

    const isExcludedDay = sequence.excludeDays.includes(currentDay);
    const isOutsideWindow = localHour < sequence.sendTime.hour || localHour > sequence.sendTime.hour + 2;

    if (isExcludedDay || isOutsideWindow) {
      // Check deferral failsafe
      const deferredSince = subscriber.deferredSince;
      const maxDeferMs = sequence.maxDeferHours * 60 * 60 * 1000;

      if (!deferredSince) {
        // First deferral — set deferredSince and reschedule +1hr
        await ctx.runMutation(internal.emailCron.updateDeferral, {
          subscriberId,
          deferredSince: now,
          nextSendAt: now + 60 * 60 * 1000,
        });
        return;
      }

      if (now - deferredSince < maxDeferMs) {
        // Still within deferral window — reschedule +1hr
        await ctx.runMutation(internal.emailCron.updateDeferral, {
          subscriberId,
          deferredSince,
          nextSendAt: now + 60 * 60 * 1000,
        });
        return;
      }

      // Failsafe: exceeded maxDeferHours — send anyway
      console.log(`Failsafe: subscriber ${subscriberId} exceeded maxDeferHours, sending anyway`);
    }

    // 3. Resolve {{variable}} tokens
    const siteConfig = await ctx.runQuery(internal.siteConfig.getAll, {});
    const siteUrl = process.env.SITE_URL || "http://localhost:8080";

    // Build unsubscribe URL using newsletter subscriber token
    let unsubscribeUrl = `${siteUrl}/unsubscribe.html`;
    if (newsletterSub?.unsubscribeToken) {
      unsubscribeUrl += `?token=${newsletterSub.unsubscribeToken}`;
    }

    // Dynamic variable resolution (see spec Section 3: Dynamic Variable System)
    // site_url and unsubscribe_url are runtime-resolved, not from siteConfig
    const variables: Record<string, string> = {
      supplement_count: siteConfig.supplementCount || "90+",
      paper_count: siteConfig.paperCount || "400+",
      evidence_tier_count: siteConfig.evidenceTierCount || "4",
      current_year: new Date().getFullYear().toString(),
      user_name: subscriber.email.split("@")[0],
      unsubscribe_url: unsubscribeUrl,
      site_url: siteUrl,
    };

    // 4. Render HTML
    const subject = resolveVariables(step.subject, variables);
    const html = renderEmailHtml(step.bodyBlocks, variables, unsubscribeUrl);

    // 5. Send via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set, skipping email send");
      return;
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_ADDRESS || "SupplementDB <onboarding@resend.dev>";

    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [subscriber.email],
        subject,
        html,
      });

      if (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        return;
      }

      const messageId = data?.id || "unknown";
      console.log(`Sequence email sent to ${subscriber.email} (step ${step.stepIndex}, msgId: ${messageId})`);

      // 6. Record sent event
      await ctx.runMutation(internal.emailCron.recordSentEvent, {
        subscriberId,
        stepId: step._id,
        sequenceId: sequence._id,
        resendMessageId: messageId,
      });

      // 7. Advance to next step or mark completed
      const allSteps = await ctx.runQuery(internal.emailCron.getSequenceSteps, {
        sequenceId: sequence._id,
      });
      const nextStep = allSteps.find((s: any) => s.stepIndex === step.stepIndex + 1 && s.status === "active");

      if (nextStep) {
        // Calculate next send time using smart scheduling (timezone + excluded days)
        const nextSendAt = calculateNextSendAt(nextStep.delayDays, sequence.sendTime, sequence.excludeDays);
        await ctx.runMutation(internal.emailCron.advanceSubscriber, {
          subscriberId,
          nextStepIndex: nextStep.stepIndex,
          nextSendAt,
          completed: false,
        });
      } else {
        // No more steps — mark completed
        await ctx.runMutation(internal.emailCron.advanceSubscriber, {
          subscriberId,
          nextStepIndex: step.stepIndex + 1,
          completed: true,
        });
      }
    } catch (err) {
      console.error(`Error sending email to ${subscriber.email}:`, err);
    }
  },
});
```

- [ ] **Step 3: Add helper queries to emailCron.ts (these stay in the mutation file)**

Append to `convex/emailCron.ts` (the mutations/queries file, NOT the action file):

```typescript
// ── Helper queries (internal, used by processSingleSubscriber action) ──

export const getSubscriberData = internalQuery({
  args: { subscriberId: v.id("emailSubscribers") },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db.get(args.subscriberId);
    if (!subscriber) return null;

    const sequence = await ctx.db.get(subscriber.sequenceId);

    // Get current step by stepIndex
    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) =>
        q.eq("sequenceId", subscriber.sequenceId).eq("stepIndex", subscriber.currentStepIndex)
      )
      .first();

    // Get linked newsletter subscriber
    const newsletterSub = subscriber.newsletterSubscriberId
      ? await ctx.db.get(subscriber.newsletterSubscriberId)
      : null;

    return {
      ...subscriber,
      sequence,
      step: steps,
      newsletterSub,
    };
  },
});

export const getSequenceSteps = internalQuery({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query("emailSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    steps.sort((a, b) => a.stepIndex - b.stepIndex);
    return steps;
  },
});
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit emailCronAction.ts + helper queries**

```bash
cd supp-db-site
git add convex/emailCronAction.ts convex/emailCron.ts
git commit -m "feat: add processSingleSubscriber action + helper queries

Separate action file (emailCronAction.ts) for Node.js Resend import.
Full email send pipeline: smart scheduling check, deferral failsafe,
variable resolution, HTML rendering, Resend send, step advancement.
Helper queries in emailCron.ts: getSubscriberData, getSequenceSteps."
```

---

## Chunk 5: Cron Registration + Resend Webhook Route

### Task 9: Create convex/crons.ts

**Files:**
- Create: `convex/crons.ts`

- [ ] **Step 1: Create crons.ts with hourly email queue trigger**

Create `convex/crons.ts`:

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

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit crons.ts**

```bash
cd supp-db-site
git add convex/crons.ts
git commit -m "feat: add hourly cron for email queue processing

Runs triggerEmailQueue every hour at :00 UTC."
```

### Task 10: Add /resend-webhook route to convex/http.ts

**Files:**
- Modify: `convex/http.ts` (add route before `export default http;` at line 482)

- [ ] **Step 1: Add Resend webhook route**

Add before line 482 (`export default http;`) in `convex/http.ts`:

```typescript
// ── Resend Webhook ───────────────────────────────────────────

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Validate webhook signature using Svix
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing webhook signature headers", { status: 400 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();

    // Verify timestamp is within tolerance (5 minutes)
    const timestampSec = parseInt(svixTimestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestampSec) > 300) {
      return new Response("Webhook timestamp too old", { status: 400 });
    }

    // Verify HMAC signature (Svix uses base64-encoded HMAC-SHA256)
    // The signing content is: "{svix-id}.{svix-timestamp}.{body}"
    const signContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    // Svix secret is base64-encoded with "whsec_" prefix
    const secretBytes = atob(webhookSecret.replace("whsec_", ""));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretBytes),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signContent));
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    // Svix sends multiple signatures separated by spaces; check if any match
    const providedSigs = svixSignature.split(" ").map((s: string) => s.replace("v1,", ""));
    const isValid = providedSigs.some((sig: string) => sig === expectedSig);

    if (!isValid) {
      console.error("Resend webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // 2. Parse event
    const eventType = body.type as string;
    const messageId = body.data?.email_id as string;

    if (!eventType || !messageId) {
      return new Response("Missing event type or message ID", { status: 400 });
    }

    // Map Resend event types to our event types
    const typeMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.unsubscribed": "unsubscribed",
      "email.complained": "unsubscribed",  // complaints also treated as unsubscribe
    };

    const mappedType = typeMap[eventType];
    if (!mappedType) {
      // Unknown event type — acknowledge but ignore
      return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
    }

    // 3. Look up the original "sent" event by resendMessageId
    await ctx.runMutation(internal.emailCron.processWebhookEvent, {
      resendMessageId: messageId,
      eventType: mappedType,
      link: body.data?.click?.link || undefined,
      timestamp: Date.now(),
    });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});
```

- [ ] **Step 2: Add processWebhookEvent mutation to emailCron.ts**

Append to `convex/emailCron.ts`:

```typescript
// ── Webhook Event Processing ─────────────────────────────────

export const processWebhookEvent = internalMutation({
  args: {
    resendMessageId: v.string(),
    eventType: v.string(),
    link: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the original "sent" event by resendMessageId
    const sentEvent = await ctx.db
      .query("emailEvents")
      .withIndex("by_resend_message_id", (q) => q.eq("resendMessageId", args.resendMessageId))
      .first();

    if (!sentEvent) {
      console.warn(`Webhook: no sent event found for messageId ${args.resendMessageId}`);
      return;
    }

    // Insert the new event
    await ctx.db.insert("emailEvents", {
      subscriberId: sentEvent.subscriberId,
      stepId: sentEvent.stepId,
      sequenceId: sentEvent.sequenceId,
      resendMessageId: args.resendMessageId,
      type: args.eventType as any,
      metadata: args.link ? { link: args.link } : undefined,
      timestamp: args.timestamp,
    });

    // Handle unsubscribe: pause subscriber + propagate to newsletter
    if (args.eventType === "unsubscribed") {
      const subscriber = await ctx.db.get(sentEvent.subscriberId);
      if (subscriber) {
        await ctx.db.patch(subscriber._id, { status: "unsubscribed" });

        // Propagate to newsletterSubscribers if linked
        if (subscriber.newsletterSubscriberId) {
          const newsletterSub = await ctx.db.get(subscriber.newsletterSubscriberId);
          if (newsletterSub && newsletterSub.status !== "unsubscribed") {
            await ctx.db.patch(subscriber.newsletterSubscriberId, {
              status: "unsubscribed",
              unsubscribedAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }
    }
  },
});
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit webhook route + event processing**

```bash
cd supp-db-site
git add convex/http.ts convex/emailCron.ts
git commit -m "feat: add /resend-webhook route + event processing

Resend webhook receives delivery events (sent, delivered, opened,
clicked, bounced, unsubscribed). Unsubscribe propagates to both
emailSubscribers and newsletterSubscribers tables."
```

---

## Chunk 6: Newsletter + Resend Integration Hooks

### Task 11: Add unsubscribe propagation to convex/newsletter.ts

**Files:**
- Modify: `convex/newsletter.ts`

- [ ] **Step 1: Add emailSubscribers pause to the unsubscribe mutation**

In `convex/newsletter.ts`, modify the `unsubscribe` mutation handler (around line 210-218). After the existing `ctx.db.patch` that sets status to "unsubscribed", add code to also pause all active emailSubscribers for this email:

Find in `convex/newsletter.ts` the unsubscribe handler, and after the line:
```typescript
    await ctx.db.patch(subscriber._id, {
      status: "unsubscribed",
      unsubscribedAt: now,
      updatedAt: now,
    });
```

Add immediately after:

```typescript
    // Propagate: pause all active email sequence subscriptions for this email
    const emailSubs = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_email_sequence", (q) => q.eq("email", subscriber.email))
      .collect();
    for (const es of emailSubs) {
      if (es.status === "active") {
        await ctx.db.patch(es._id, { status: "unsubscribed" });
      }
    }
```

```typescript
    // Propagate: pause all active email sequence subscriptions for this email
    const emailSubs = await ctx.db
      .query("emailSubscribers")
      .withIndex("by_email", (q) => q.eq("email", subscriber.email))
      .collect();
    for (const es of emailSubs) {
      if (es.status === "active") {
        await ctx.db.patch(es._id, { status: "unsubscribed" });
      }
    }
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit newsletter propagation**

```bash
cd supp-db-site
git add convex/newsletter.ts
git commit -m "feat: propagate newsletter unsubscribe to email sequences

When user unsubscribes via newsletter token, all active email
sequence subscriptions for that email are also paused."
```

### Task 12: Add enrollment hooks to convex/resend.ts

**Files:**
- Modify: `convex/resend.ts`

- [ ] **Step 1: Add import for internal emailSubscribers**

At the top of `convex/resend.ts`, the existing imports are:
```typescript
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
```

Add after these imports:
```typescript
import { internal } from "./_generated/api";
```

**Note:** `internal` import may already exist — check first. If not present, add it.

- [ ] **Step 2: Add enrollment hook to sendWelcomeEmail**

In `convex/resend.ts`, the `sendWelcomeEmail` handler currently has `async (_ctx, args)`. Change `_ctx` to `ctx` and add enrollment logic after the successful send.

Replace the handler parameter `_ctx` with `ctx` and add after the `console.log` for successful send (around line 365):

```typescript
      // Enroll in email_opt_in sequences
      if (data?.id) {
        try {
          // Find all active sequences triggered by email_opt_in
          const sequences = await ctx.runQuery(internal.emailCron.getActiveSequencesByEvent, {
            event: "email_opt_in",
          });
          for (const seq of sequences) {
            await ctx.runMutation(internal.emailSubscribers.enrollSubscriber, {
              email: args.email,
              sequenceId: seq._id,
              source: "event:email_opt_in",
            });
          }
        } catch (enrollErr) {
          console.error("Failed to enroll in email sequences:", enrollErr);
        }
      }
```

- [ ] **Step 3: Add enrollment hook to sendGuideDownloadEmail**

Similarly, in `sendGuideDownloadEmail`, change `_ctx` to `ctx` and add after successful send (around line 254):

```typescript
      // Enroll in pdf_purchase sequences
      if (data?.id) {
        try {
          const sequences = await ctx.runQuery(internal.emailCron.getActiveSequencesByEvent, {
            event: "pdf_purchase",
          });
          for (const seq of sequences) {
            await ctx.runMutation(internal.emailSubscribers.enrollSubscriber, {
              email: args.email,
              sequenceId: seq._id,
              source: "event:pdf_purchase",
            });
          }
        } catch (enrollErr) {
          console.error("Failed to enroll in email sequences:", enrollErr);
        }
      }
```

- [ ] **Step 4: Add getActiveSequencesByEvent query to emailCron.ts**

Append to `convex/emailCron.ts`:

```typescript
export const getActiveSequencesByEvent = internalQuery({
  args: { event: v.string() },
  handler: async (ctx, args) => {
    const allSequences = await ctx.db.query("emailSequences").collect();
    return allSequences.filter(
      (s) =>
        s.status === "active" &&
        (s.trigger.type === "event" || s.trigger.type === "both") &&
        s.trigger.event === args.event
    );
  },
});
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `cd supp-db-site && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit enrollment hooks**

```bash
cd supp-db-site
git add convex/resend.ts convex/emailCron.ts
git commit -m "feat: add enrollment hooks to sendWelcomeEmail + sendGuideDownloadEmail

email_opt_in event triggers enrollment in matching active sequences.
pdf_purchase event triggers enrollment in matching active sequences.
Added getActiveSequencesByEvent internal query."
```

---

## Chunk 7: Admin UI — Email Tab Setup + Sequences List + Editor

### Task 13: Update admin/index.html

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Add email.css stylesheet link**

In `admin/index.html`, after line 44 (`<link rel="stylesheet" href="admin.css">`), add:

```html
    <link rel="stylesheet" href="email.css">
```

- [ ] **Step 2: Add Email nav item to sidebar**

In `admin/index.html`, after the "System" nav section (around line 124, before `</aside>`), add a new nav section:

```html
            <div class="admin-nav-section">
                <div class="admin-nav-label">Marketing</div>
                <button class="admin-nav-item" data-section="email">
                    <i class="fas fa-envelope"></i>
                    <span>Email Sequences</span>
                </button>
            </div>
```

- [ ] **Step 3: Add Email section container to main content**

In `admin/index.html`, after the last `</section>` tag (before `</main>`), add:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: Email Sequences                            -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-email" class="admin-section">
                <div id="email-app"></div>
            </section>
```

- [ ] **Step 4: Add email.js script**

At the bottom of `admin/index.html`, before the closing `</body>` tag, after the existing admin.js script tag, add:

```html
    <script src="email.js"></script>
```

- [ ] **Step 5: Commit index.html changes**

```bash
cd supp-db-site
git add admin/index.html
git commit -m "feat: add Email Sequences nav item + section container to admin

Marketing sidebar section with Email Sequences item.
Loads email.css + email.js for the email management UI."
```

### Task 14: Create admin/email.css

**Files:**
- Create: `admin/email.css`

- [ ] **Step 1: Create email.css with email panel styles**

Create `admin/email.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   EMAIL SEQUENCES ADMIN PANEL STYLES
   Extends admin.css — uses same color scheme (#2d5a3d green accent,
   #fafaf8 bg, Source Serif 4 headings, DM Sans body)
   ═══════════════════════════════════════════════════════════════ */

/* ── Layout ─────────────────────────────────────────────────── */
.email-container { max-width: 1200px; margin: 0 auto; }

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.email-header h2 {
  font-family: 'Source Serif 4', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ── Sub-navigation (Sequences | Analytics) ─────────────────── */
.email-subnav {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e5e5;
  margin-bottom: 1.5rem;
}

.email-subnav-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}

.email-subnav-btn:hover { color: #2d5a3d; }
.email-subnav-btn.active {
  color: #2d5a3d;
  border-bottom-color: #2d5a3d;
  font-weight: 600;
}

/* ── Sequences Table ────────────────────────────────────────── */
.email-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.email-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  border-bottom: 1px solid #e5e5e5;
}

.email-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.email-table tr:hover { background: #f8f8f6; cursor: pointer; }

/* ── Status Badges ──────────────────────────────────────────── */
.email-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.email-badge--draft { background: #f3f3f3; color: #888; }
.email-badge--active { background: #e8f5e9; color: #2d5a3d; }
.email-badge--paused { background: #fff3e0; color: #e65100; }
.email-badge--completed { background: #e3f2fd; color: #1565c0; }
.email-badge--unsubscribed { background: #fce4ec; color: #c62828; }

/* ── Buttons ────────────────────────────────────────────────── */
.email-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  font-family: 'DM Sans', sans-serif;
}

.email-btn--primary {
  background: #2d5a3d;
  color: white;
  border-color: #2d5a3d;
}
.email-btn--primary:hover { background: #245032; }

.email-btn--secondary {
  background: white;
  color: #333;
  border-color: #ddd;
}
.email-btn--secondary:hover { background: #f8f8f6; border-color: #ccc; }

.email-btn--danger {
  background: white;
  color: #c62828;
  border-color: #e57373;
}
.email-btn--danger:hover { background: #fce4ec; }

.email-btn--sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }

/* ── Editor Layout ──────────────────────────────────────────── */
.email-editor { display: flex; flex-direction: column; gap: 1.5rem; }

.email-editor-section {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.25rem;
}

.email-editor-section h3 {
  font-family: 'Source Serif 4', serif;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

/* ── Form Elements ──────────────────────────────────────────── */
.email-form-group { margin-bottom: 1rem; }
.email-form-group:last-child { margin-bottom: 0; }

.email-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.35rem;
}

.email-input, .email-select, .email-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: 'DM Sans', sans-serif;
  background: #fafaf8;
  transition: border-color 0.15s;
}

.email-input:focus, .email-select:focus, .email-textarea:focus {
  border-color: #2d5a3d;
  outline: none;
  box-shadow: 0 0 0 2px rgba(45, 90, 61, 0.1);
}

.email-textarea { min-height: 100px; resize: vertical; }

/* ── Step Cards ─────────────────────────────────────────────── */
.email-step-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: #fafaf8;
  position: relative;
}

.email-step-card--disabled { opacity: 0.5; }

.email-step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.email-step-number {
  font-weight: 700;
  color: #2d5a3d;
  font-size: 0.85rem;
}

.email-step-actions { display: flex; gap: 0.5rem; align-items: center; }

/* ── Body Block Editor ──────────────────────────────────────── */
.email-block {
  border: 1px dashed #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
}

.email-block-type {
  font-size: 0.7rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

/* ── Sticky Action Bar ──────────────────────────────────────── */
.email-action-bar {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e5e5;
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* ── Analytics ──────────────────────────────────────────────── */
.email-funnel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.email-funnel-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.email-funnel-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Source Serif 4', serif;
}

.email-funnel-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* ── Modal ──────────────────────────────────────────────────── */
.email-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.email-modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.email-modal h3 {
  font-family: 'Source Serif 4', serif;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .email-funnel { grid-template-columns: repeat(2, 1fr); }
  .email-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
}
```

- [ ] **Step 2: Commit email.css**

```bash
cd supp-db-site
git add admin/email.css
git commit -m "feat: add email.css for email sequence admin panel

Extends admin design system: #2d5a3d green accent, Source Serif 4 headings,
DM Sans body. Components: table, badges, editor, step cards, action bar,
funnel cards, modal overlay."
```

### Task 15: Create admin/email.js — Core + Sequences List + Editor

**Files:**
- Create: `admin/email.js`

- [ ] **Step 1: Create email.js with initialization and Convex client setup**

Create `admin/email.js`. This file uses the existing Convex client from the admin page (window.convex). The full file is large, so we build it incrementally.

```javascript
/**
 * Email Sequences Admin Panel
 * Uses the existing Convex client (window.convex) and Clerk auth from admin/index.html.
 *
 * Sub-views: Sequences List | Sequence Editor | Analytics
 */

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────────
  let currentView = "list"; // "list" | "editor" | "analytics"
  let currentSequenceId = null;
  let sequenceData = null;
  let sequencesListData = [];

  const app = document.getElementById("email-app");
  if (!app) return;

  // ── Convex Client Wrapper ────────────────────────────────────
  // The admin page initializes window.convex as the ConvexClient instance.
  function getClient() {
    return window.convex;
  }

  async function queryConvex(fnName, args = {}) {
    const client = getClient();
    if (!client) throw new Error("Convex client not available");
    return client.query(fnName, args);
  }

  async function mutateConvex(fnName, args = {}) {
    const client = getClient();
    if (!client) throw new Error("Convex client not available");
    return client.mutation(fnName, args);
  }

  // ── Render Router ────────────────────────────────────────────
  function render() {
    switch (currentView) {
      case "list":
        renderSequencesList();
        break;
      case "editor":
        renderSequenceEditor();
        break;
      case "analytics":
        renderAnalytics();
        break;
    }
  }

  // ── Sequences List View ──────────────────────────────────────
  async function renderSequencesList() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header">
          <h2>Email Sequences</h2>
          <button class="email-btn email-btn--primary" onclick="emailApp.createNew()">
            <i class="fas fa-plus"></i> New Sequence
          </button>
        </div>
        <div class="email-subnav">
          <button class="email-subnav-btn active" data-view="list">Sequences</button>
          <button class="email-subnav-btn" data-view="analytics">Analytics</button>
        </div>
        <div id="email-list-content">
          <p style="color:#888;text-align:center;padding:2rem;">Loading sequences...</p>
        </div>
      </div>
    `;

    // Bind subnav
    app.querySelectorAll(".email-subnav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.view === "analytics") {
          currentView = "analytics";
          render();
        }
      });
    });

    try {
      sequencesListData = await queryConvex("emailSequences:listSequences");
      const container = document.getElementById("email-list-content");

      if (sequencesListData.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:3rem;color:#888;">
            <i class="fas fa-envelope-open" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>
            <p>No email sequences yet. Create your first one to get started.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <table class="email-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Steps</th>
              <th>Active Subscribers</th>
              <th>Trigger</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            ${sequencesListData.map((seq) => `
              <tr data-id="${seq._id}">
                <td style="font-weight:500;">${escapeHtml(seq.name)}</td>
                <td><span class="email-badge email-badge--${seq.status}">${seq.status}</span></td>
                <td>${seq.stepCount}</td>
                <td>${seq.activeSubscriberCount}</td>
                <td style="font-size:0.8rem;color:#666;">${formatTrigger(seq.trigger)}</td>
                <td style="font-size:0.8rem;color:#888;">${formatDate(seq.updatedAt)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Bind row clicks
      container.querySelectorAll("tr[data-id]").forEach((row) => {
        row.addEventListener("click", () => {
          currentSequenceId = row.dataset.id;
          currentView = "editor";
          render();
        });
      });
    } catch (err) {
      document.getElementById("email-list-content").innerHTML =
        `<p style="color:#c62828;padding:1rem;">Error loading sequences: ${escapeHtml(err.message)}</p>`;
    }
  }

  // ── Sequence Editor View ─────────────────────────────────────
  async function renderSequenceEditor() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.backToList()">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <h2 id="editor-title">${currentSequenceId ? "Edit Sequence" : "New Sequence"}</h2>
          </div>
        </div>
        <div id="editor-content">
          <p style="color:#888;text-align:center;padding:2rem;">Loading...</p>
        </div>
      </div>
    `;

    if (currentSequenceId) {
      try {
        sequenceData = await queryConvex("emailSequences:getSequence", { sequenceId: currentSequenceId });
        if (!sequenceData) {
          document.getElementById("editor-content").innerHTML = `<p style="color:#c62828;">Sequence not found.</p>`;
          return;
        }
      } catch (err) {
        document.getElementById("editor-content").innerHTML = `<p style="color:#c62828;">Error: ${escapeHtml(err.message)}</p>`;
        return;
      }
    } else {
      sequenceData = {
        name: "",
        description: "",
        trigger: { type: "both", event: "email_opt_in" },
        status: "draft",
        sendTime: { hour: 9, minute: 0, timezone: "America/New_York" },
        excludeDays: ["saturday", "sunday"],
        maxDeferHours: 48,
        steps: [],
      };
    }

    renderEditorForm();
  }

  function renderEditorForm() {
    const seq = sequenceData;
    const isNew = !currentSequenceId;
    const steps = seq.steps || [];

    const editorHtml = `
      <div class="email-editor">
        <!-- Metadata -->
        <div class="email-editor-section">
          <h3>Sequence Details</h3>
          <div class="email-form-group">
            <label class="email-label">Name</label>
            <input class="email-input" id="seq-name" value="${escapeAttr(seq.name)}" placeholder="Welcome Sequence">
          </div>
          <div class="email-form-group">
            <label class="email-label">Description</label>
            <textarea class="email-textarea" id="seq-description" rows="2" placeholder="What this sequence does...">${escapeHtml(seq.description)}</textarea>
          </div>
          ${!isNew ? `<div class="email-form-group">
            <label class="email-label">Status</label>
            <span class="email-badge email-badge--${seq.status}">${seq.status}</span>
          </div>` : ""}
        </div>

        <!-- Trigger -->
        <div class="email-editor-section">
          <h3>Trigger</h3>
          <div class="email-form-group">
            <label class="email-label">Trigger Type</label>
            <select class="email-select" id="seq-trigger-type">
              <option value="both" ${seq.trigger.type === "both" ? "selected" : ""}>Event + Manual</option>
              <option value="event" ${seq.trigger.type === "event" ? "selected" : ""}>Event Only</option>
              <option value="manual" ${seq.trigger.type === "manual" ? "selected" : ""}>Manual Only</option>
            </select>
          </div>
          <div class="email-form-group" id="trigger-event-group" ${seq.trigger.type === "manual" ? 'style="display:none"' : ""}>
            <label class="email-label">Event</label>
            <select class="email-select" id="seq-trigger-event">
              <option value="email_opt_in" ${seq.trigger.event === "email_opt_in" ? "selected" : ""}>Email Opt-In</option>
              <option value="pdf_purchase" ${seq.trigger.event === "pdf_purchase" ? "selected" : ""}>PDF Purchase</option>
              <option value="pro_signup" ${seq.trigger.event === "pro_signup" ? "selected" : ""}>Pro Signup</option>
            </select>
          </div>
        </div>

        <!-- Scheduling -->
        <div class="email-editor-section">
          <h3>Smart Scheduling</h3>
          <div style="display:grid;grid-template-columns:auto auto auto auto;gap:0.75rem;align-items:end;">
            <div class="email-form-group">
              <label class="email-label">Hour</label>
              <select class="email-select" id="seq-hour">
                ${Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                  const val24 = seq.sendTime.hour;
                  const displayH = val24 > 12 ? val24 - 12 : val24 === 0 ? 12 : val24;
                  return `<option value="${h}" ${displayH === h ? "selected" : ""}>${h}</option>`;
                }).join("")}
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">AM/PM</label>
              <select class="email-select" id="seq-ampm">
                <option value="AM" ${seq.sendTime.hour < 12 ? "selected" : ""}>AM</option>
                <option value="PM" ${seq.sendTime.hour >= 12 ? "selected" : ""}>PM</option>
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">Timezone</label>
              <select class="email-select" id="seq-timezone">
                <option value="America/New_York" ${seq.sendTime.timezone === "America/New_York" ? "selected" : ""}>Eastern</option>
                <option value="America/Chicago" ${seq.sendTime.timezone === "America/Chicago" ? "selected" : ""}>Central</option>
                <option value="America/Denver" ${seq.sendTime.timezone === "America/Denver" ? "selected" : ""}>Mountain</option>
                <option value="America/Los_Angeles" ${seq.sendTime.timezone === "America/Los_Angeles" ? "selected" : ""}>Pacific</option>
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">Max Defer (hrs)</label>
              <input class="email-input" id="seq-max-defer" type="number" value="${seq.maxDeferHours}" min="1" max="168" style="width:80px;">
            </div>
          </div>
          <div class="email-form-group" style="margin-top:0.75rem;">
            <label class="email-label">Exclude Days</label>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              ${["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => `
                <label style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;cursor:pointer;">
                  <input type="checkbox" class="exclude-day" value="${day}" ${seq.excludeDays.includes(day) ? "checked" : ""}>
                  ${day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </label>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="email-editor-section">
          <h3>Email Steps</h3>
          <div id="steps-container">
            ${steps.map((step, i) => renderStepCard(step, i)).join("")}
          </div>
          <button class="email-btn email-btn--secondary" style="margin-top:0.75rem;" onclick="emailApp.addStep()">
            <i class="fas fa-plus"></i> Add Step
          </button>
        </div>

        <!-- Action Bar -->
        <div class="email-action-bar">
          <button class="email-btn email-btn--secondary" onclick="emailApp.sendTest()">
            <i class="fas fa-paper-plane"></i> Send Test Email
          </button>
          ${!isNew && seq.status === "draft" ? `
            <button class="email-btn email-btn--danger email-btn--sm" onclick="emailApp.deleteSequence()">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : ""}
          <button class="email-btn email-btn--secondary" onclick="emailApp.save('draft')">
            Save Draft
          </button>
          <button class="email-btn email-btn--primary" onclick="emailApp.save('activate')">
            <i class="fas fa-check"></i> Save & Activate
          </button>
        </div>
      </div>
    `;

    document.getElementById("editor-content").innerHTML = editorHtml;

    // Bind trigger type change
    document.getElementById("seq-trigger-type").addEventListener("change", (e) => {
      const eventGroup = document.getElementById("trigger-event-group");
      eventGroup.style.display = e.target.value === "manual" ? "none" : "";
    });
  }

  function renderStepCard(step, index) {
    const isDisabled = step.status === "disabled";
    return `
      <div class="email-step-card ${isDisabled ? "email-step-card--disabled" : ""}" data-step-id="${step._id || ""}" data-index="${index}">
        <div class="email-step-header">
          <span class="email-step-number">Step ${index + 1}</span>
          <div class="email-step-actions">
            <select class="email-select" style="width:auto;font-size:0.75rem;" onchange="emailApp.toggleStep('${step._id}', this.value)">
              <option value="active" ${!isDisabled ? "selected" : ""}>Active</option>
              <option value="disabled" ${isDisabled ? "selected" : ""}>Disabled</option>
            </select>
            <button class="email-btn email-btn--danger email-btn--sm" onclick="emailApp.removeStep('${step._id}', ${index})">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:0.75rem;margin-bottom:0.75rem;">
          <div class="email-form-group">
            <label class="email-label">Delay</label>
            <div style="display:flex;align-items:center;gap:0.3rem;">
              <input class="email-input step-delay" type="number" value="${step.delayDays}" min="0" style="width:60px;">
              <span style="font-size:0.75rem;color:#888;">days</span>
            </div>
          </div>
          <div class="email-form-group">
            <label class="email-label">Subject</label>
            <input class="email-input step-subject" value="${escapeAttr(step.subject)}" placeholder="Email subject...">
          </div>
        </div>
        <div class="email-form-group">
          <label class="email-label">Preheader</label>
          <input class="email-input step-preheader" value="${escapeAttr(step.preheader)}" placeholder="Preview text...">
        </div>
        <div class="email-form-group">
          <label class="email-label">Body Blocks</label>
          <div class="step-blocks" data-step-index="${index}">
            ${(step.bodyBlocks || []).map((block, bi) => renderBlockEditor(block, bi, index)).join("")}
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'text')">+ Text</button>
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'cta')">+ CTA</button>
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'divider')">+ Divider</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderBlockEditor(block, blockIndex, stepIndex) {
    if (block.type === "text") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">Text <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <textarea class="email-textarea block-content" rows="3" placeholder="Write your email content... Use {{variable}} for dynamic values.">${escapeHtml(block.content || "")}</textarea>
      </div>`;
    }
    if (block.type === "cta") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">CTA Button <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <input class="email-input block-label" value="${escapeAttr(block.label || "")}" placeholder="Button Label">
          <input class="email-input block-url" value="${escapeAttr(block.url || "")}" placeholder="https://...">
        </div>
      </div>`;
    }
    if (block.type === "divider") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">Divider <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <hr style="border:none;border-top:1px dashed #ddd;">
      </div>`;
    }
    return "";
  }

  // ── Editor Actions ───────────────────────────────────────────

  function gatherSequenceFormData() {
    const hourSelect = document.getElementById("seq-hour");
    const ampmSelect = document.getElementById("seq-ampm");
    let hour24 = parseInt(hourSelect.value);
    if (ampmSelect.value === "PM" && hour24 !== 12) hour24 += 12;
    if (ampmSelect.value === "AM" && hour24 === 12) hour24 = 0;

    const excludeDays = Array.from(document.querySelectorAll(".exclude-day:checked")).map((cb) => cb.value);

    return {
      name: document.getElementById("seq-name").value.trim(),
      description: document.getElementById("seq-description").value.trim(),
      trigger: {
        type: document.getElementById("seq-trigger-type").value,
        event: document.getElementById("seq-trigger-type").value !== "manual"
          ? document.getElementById("seq-trigger-event").value
          : undefined,
      },
      sendTime: {
        hour: hour24,
        minute: 0,
        timezone: document.getElementById("seq-timezone").value,
      },
      excludeDays,
      maxDeferHours: parseInt(document.getElementById("seq-max-defer").value) || 48,
    };
  }

  function gatherStepsData() {
    const stepCards = document.querySelectorAll(".email-step-card");
    const steps = [];

    stepCards.forEach((card) => {
      const blocks = [];
      card.querySelectorAll(".email-block").forEach((block) => {
        const blockIndex = parseInt(block.dataset.blockIndex);
        const contentEl = block.querySelector(".block-content");
        const labelEl = block.querySelector(".block-label");
        const urlEl = block.querySelector(".block-url");

        if (contentEl) {
          blocks.push({ type: "text", content: contentEl.value });
        } else if (labelEl) {
          blocks.push({ type: "cta", label: labelEl.value, url: urlEl.value });
        } else {
          blocks.push({ type: "divider" });
        }
      });

      steps.push({
        _id: card.dataset.stepId || null,
        delayDays: parseInt(card.querySelector(".step-delay").value) || 0,
        subject: card.querySelector(".step-subject").value,
        preheader: card.querySelector(".step-preheader").value,
        bodyBlocks: blocks,
        status: card.querySelector("select").value || "active",
      });
    });

    return steps;
  }

  async function saveSequence(activate) {
    const formData = gatherSequenceFormData();
    if (!formData.name) {
      alert("Sequence name is required.");
      return;
    }

    try {
      let seqId = currentSequenceId;

      if (!seqId) {
        // Create new sequence
        seqId = await mutateConvex("emailSequences:createSequence", {
          name: formData.name,
          description: formData.description,
          trigger: formData.trigger,
        });
        currentSequenceId = seqId;
      }

      // Update sequence fields
      const updateArgs = {
        sequenceId: seqId,
        ...formData,
      };
      if (activate) {
        updateArgs.status = "active";
      }
      await mutateConvex("emailSequences:updateSequence", updateArgs);

      // Save steps
      const stepsData = gatherStepsData();
      for (const step of stepsData) {
        if (step._id) {
          // Update existing step
          await mutateConvex("emailSequences:updateStep", {
            stepId: step._id,
            subject: step.subject,
            preheader: step.preheader,
            bodyBlocks: step.bodyBlocks,
            delayDays: step.delayDays,
            status: step.status,
          });
        } else {
          // Create new step
          await mutateConvex("emailSequences:createStep", {
            sequenceId: seqId,
            subject: step.subject,
            preheader: step.preheader,
            bodyBlocks: step.bodyBlocks,
            delayDays: step.delayDays,
          });
        }
      }

      alert(activate ? "Sequence saved and activated!" : "Sequence saved as draft.");
      currentView = "editor";
      render();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  }

  // ── Utility Functions ────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatTrigger(trigger) {
    if (!trigger) return "—";
    const type = trigger.type === "both" ? "Event + Manual" : trigger.type === "event" ? "Event" : "Manual";
    const event = trigger.event ? ` (${trigger.event.replace(/_/g, " ")})` : "";
    return type + event;
  }

  function formatDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // ── Public API (exposed to onclick handlers) ─────────────────

  window.emailApp = {
    createNew: () => { currentSequenceId = null; currentView = "editor"; render(); },
    backToList: () => { currentView = "list"; render(); },
    save: (mode) => saveSequence(mode === "activate"),
    deleteSequence: async () => {
      if (!confirm("Delete this sequence? This cannot be undone.")) return;
      try {
        await mutateConvex("emailSequences:deleteSequence", { sequenceId: currentSequenceId });
        currentView = "list";
        render();
      } catch (err) {
        alert("Error: " + err.message);
      }
    },
    addStep: () => {
      const steps = sequenceData.steps || [];
      steps.push({
        _id: null,
        stepIndex: steps.length,
        subject: "",
        preheader: "",
        bodyBlocks: [{ type: "text", content: "" }],
        delayDays: steps.length === 0 ? 0 : 2,
        status: "active",
      });
      sequenceData.steps = steps;
      renderEditorForm();
    },
    removeStep: async (stepId, index) => {
      if (!confirm("Remove this step?")) return;
      if (stepId) {
        try {
          await mutateConvex("emailSequences:deleteStep", { stepId });
        } catch (err) {
          alert("Error: " + err.message);
          return;
        }
      }
      sequenceData.steps.splice(index, 1);
      renderEditorForm();
    },
    toggleStep: async (stepId, status) => {
      if (stepId) {
        try {
          await mutateConvex("emailSequences:updateStep", { stepId, status });
        } catch (err) {
          alert("Error: " + err.message);
        }
      }
    },
    addBlock: (stepIndex, type) => {
      const block = type === "text" ? { type: "text", content: "" }
        : type === "cta" ? { type: "cta", label: "", url: "" }
          : { type: "divider" };
      sequenceData.steps[stepIndex].bodyBlocks.push(block);
      renderEditorForm();
    },
    removeBlock: (stepIndex, blockIndex) => {
      sequenceData.steps[stepIndex].bodyBlocks.splice(blockIndex, 1);
      renderEditorForm();
    },
    sendTest: async () => {
      if (!currentSequenceId) {
        alert("Save the sequence first, then send a test.");
        return;
      }
      // Resolve admin email from Clerk session
      const client = getClient();
      if (!client) { alert("Convex client not available."); return; }
      try {
        // Query admin's email via the users table (Clerk identity)
        const adminEmail = await queryConvex("emailSequences:getAdminEmail");
        if (!adminEmail) {
          alert("Could not resolve admin email from Clerk session.");
          return;
        }
        if (!confirm(`Send test email to ${adminEmail}?`)) return;
        await mutateConvex("emailSequences:sendTestEmail", {
          sequenceId: currentSequenceId,
          recipientEmail: adminEmail,
        });
        alert(`Test email sent to ${adminEmail}`);
      } catch (err) {
        alert("Error: " + err.message);
      }
    },
  };

  // ── Initialize on section activation ─────────────────────────
  // Watch for the email section becoming active
  const observer = new MutationObserver(() => {
    const section = document.getElementById("section-email");
    if (section && section.classList.contains("active")) {
      render();
    }
  });

  const section = document.getElementById("section-email");
  if (section) {
    observer.observe(section, { attributes: true, attributeFilter: ["class"] });
    // Also render if already active
    if (section.classList.contains("active")) {
      render();
    }
  }

  // Handle hash navigation
  if (window.location.hash === "#email") {
    const navBtn = document.querySelector('[data-section="email"]');
    if (navBtn) navBtn.click();
  }
})();
```

**Note:** The analytics view (`renderAnalytics`) and manual enrollment modal are added in Chunk 8 Task 16 and Task 17.

- [ ] **Step 2: Verify email.js loads without errors**

Open `admin/index.html` in browser, click the "Email Sequences" sidebar item. Verify:
- The email panel renders with "Email Sequences" header
- "New Sequence" button is visible
- Sub-nav shows "Sequences" and "Analytics" tabs
- The sequences list shows "No email sequences yet" message

- [ ] **Step 3: Commit email.js**

```bash
cd supp-db-site
git add admin/email.js
git commit -m "feat: add email.js with sequences list + sequence editor

Full admin UI: sequences table with status/trigger/step counts,
sequence editor with metadata/trigger/scheduling/steps/body blocks,
step card CRUD with inline block editors, save/activate/delete."
```

---

## Chunk 8: Analytics View + Manual Enrollment + Welcome Sequence Seed

### Task 16: Add analytics sub-view to admin/email.js

**Files:**
- Modify: `admin/email.js`

- [ ] **Step 1: Add renderAnalytics function**

In `admin/email.js`, find the comment `// ── Utility Functions` and add the analytics view BEFORE it:

```javascript
  // ── Analytics View ───────────────────────────────────────────
  async function renderAnalytics() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header">
          <h2>Email Analytics</h2>
        </div>
        <div class="email-subnav">
          <button class="email-subnav-btn" data-view="list">Sequences</button>
          <button class="email-subnav-btn active" data-view="analytics">Analytics</button>
        </div>
        <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;align-items:center;">
          <div class="email-form-group" style="margin:0;">
            <select class="email-select" id="analytics-sequence" style="width:auto;">
              <option value="">Select a sequence...</option>
            </select>
          </div>
          <div class="email-form-group" style="margin:0;">
            <select class="email-select" id="analytics-range" style="width:auto;">
              <option value="7d">Last 7 days</option>
              <option value="30d" selected>Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.enrollModal()">
            <i class="fas fa-user-plus"></i> Manually Enroll
          </button>
        </div>
        <div id="analytics-content">
          <p style="color:#888;text-align:center;padding:2rem;">Select a sequence to view analytics.</p>
        </div>
      </div>
    `;

    // Bind subnav
    app.querySelectorAll(".email-subnav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.view === "list") { currentView = "list"; render(); }
      });
    });

    // Load sequences into dropdown
    try {
      const sequences = await queryConvex("emailSequences:listSequences");
      const select = document.getElementById("analytics-sequence");
      sequences.forEach((seq) => {
        const opt = document.createElement("option");
        opt.value = seq._id;
        opt.textContent = seq.name;
        select.appendChild(opt);
      });

      select.addEventListener("change", loadAnalytics);
      document.getElementById("analytics-range").addEventListener("change", loadAnalytics);
    } catch (err) {
      document.getElementById("analytics-content").innerHTML =
        `<p style="color:#c62828;">Error: ${escapeHtml(err.message)}</p>`;
    }
  }

  async function loadAnalytics() {
    const sequenceId = document.getElementById("analytics-sequence").value;
    const timeRange = document.getElementById("analytics-range").value;
    const container = document.getElementById("analytics-content");

    if (!sequenceId) {
      container.innerHTML = `<p style="color:#888;text-align:center;padding:2rem;">Select a sequence to view analytics.</p>`;
      return;
    }

    container.innerHTML = `<p style="color:#888;text-align:center;padding:2rem;">Loading analytics...</p>`;

    try {
      const [analytics, subscribers] = await Promise.all([
        queryConvex("emailSequences:getSequenceAnalytics", { sequenceId, timeRange }),
        queryConvex("emailSubscribers:listSubscribers", { sequenceId, limit: 50 }),
      ]);

      const funnel = analytics.funnel;
      const stepRows = analytics.steps.map((s) => `
        <tr>
          <td style="font-weight:500;">${escapeHtml(s.subject)}</td>
          <td>${s.sent}</td>
          <td>${s.deliveredPct}%</td>
          <td>${s.openedPct}%</td>
          <td>${s.clickedPct}%</td>
          <td>${s.bouncedPct}%</td>
          <td>${s.unsubscribed}</td>
        </tr>
      `).join("");

      const subRows = subscribers.map((sub) => `
        <tr>
          <td>${escapeHtml(sub.email)}</td>
          <td><span class="email-badge email-badge--${sub.status}">${sub.status}</span></td>
          <td>Step ${sub.currentStepIndex + 1}</td>
          <td style="font-size:0.8rem;color:#888;">${formatDate(sub.enrolledAt)}</td>
          <td style="font-size:0.8rem;color:#888;">${sub.lastEventType ? sub.lastEventType + " " + formatDate(sub.lastEventAt) : "—"}</td>
        </tr>
      `).join("");

      container.innerHTML = `
        <!-- Funnel Cards -->
        <div class="email-funnel">
          <div class="email-funnel-card">
            <div class="email-funnel-value">${funnel.sent}</div>
            <div class="email-funnel-label">Sent</div>
          </div>
          <div class="email-funnel-card">
            <div class="email-funnel-value">${funnel.delivered}</div>
            <div class="email-funnel-label">Delivered</div>
          </div>
          <div class="email-funnel-card">
            <div class="email-funnel-value">${funnel.opened}</div>
            <div class="email-funnel-label">Opened</div>
          </div>
          <div class="email-funnel-card">
            <div class="email-funnel-value">${funnel.clicked}</div>
            <div class="email-funnel-label">Clicked</div>
          </div>
        </div>

        <!-- Per-Step Table -->
        <div class="email-editor-section" style="margin-bottom:1.5rem;">
          <h3>Per-Step Performance</h3>
          <table class="email-table">
            <thead>
              <tr><th>Subject</th><th>Sent</th><th>Delivered</th><th>Opened</th><th>Clicked</th><th>Bounced</th><th>Unsubs</th></tr>
            </thead>
            <tbody>${stepRows || '<tr><td colspan="7" style="text-align:center;color:#888;">No data yet</td></tr>'}</tbody>
          </table>
        </div>

        <!-- Subscriber Table -->
        <div class="email-editor-section">
          <h3>Subscribers</h3>
          <table class="email-table">
            <thead>
              <tr><th>Email</th><th>Status</th><th>Current Step</th><th>Enrolled</th><th>Last Event</th></tr>
            </thead>
            <tbody>${subRows || '<tr><td colspan="5" style="text-align:center;color:#888;">No subscribers</td></tr>'}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color:#c62828;">Error: ${escapeHtml(err.message)}</p>`;
    }
  }
```

- [ ] **Step 2: Verify analytics view renders**

Open admin panel, navigate to Email Sequences > Analytics tab. Verify:
- Sequence dropdown populates
- Time range selector works
- Funnel cards render (will show 0s with no data)

- [ ] **Step 2b: Add subscriber status filter to analytics**

In the analytics view subscriber section, add a status filter dropdown before the subscriber table. In `loadAnalytics`, update the `listSubscribers` call to pass the selected status:

```javascript
      // In the subscriber table section of loadAnalytics:
      const statusFilter = document.getElementById("analytics-sub-status")?.value || "";
      const subArgs = { sequenceId, limit: 50 };
      if (statusFilter) subArgs.status = statusFilter;
      const subscribers = await queryConvex("emailSubscribers:listSubscribers", subArgs);
```

And add the filter dropdown HTML before the subscriber table:
```html
        <div class="email-editor-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <h3>Subscribers</h3>
            <select class="email-select" id="analytics-sub-status" style="width:auto;font-size:0.8rem;" onchange="emailApp.refreshAnalytics()">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
```

Add to `window.emailApp`:
```javascript
    refreshAnalytics: loadAnalytics,
```

- [ ] **Step 3: Commit analytics view**

```bash
cd supp-db-site
git add admin/email.js
git commit -m "feat: add analytics sub-view to email admin panel

Funnel stat cards (sent/delivered/opened/clicked), per-step performance
table with percentages, subscriber table with status and last event."
```

### Task 17: Add manual enrollment modal to admin/email.js

**Files:**
- Modify: `admin/email.js`

- [ ] **Step 1: Add enrollModal function to window.emailApp**

Add to the `window.emailApp` object in `admin/email.js`:

```javascript
    enrollModal: async () => {
      // Create modal overlay
      const overlay = document.createElement("div");
      overlay.className = "email-modal-overlay";
      overlay.innerHTML = `
        <div class="email-modal">
          <h3>Manually Enroll Subscribers</h3>
          <div class="email-form-group">
            <label class="email-label">Sequence</label>
            <select class="email-select" id="enroll-sequence">
              <option value="">Select sequence...</option>
            </select>
          </div>
          <div class="email-form-group">
            <label class="email-label">Email Addresses (one per line)</label>
            <textarea class="email-textarea" id="enroll-emails" rows="6" placeholder="user1@example.com&#10;user2@example.com"></textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem;">
            <button class="email-btn email-btn--secondary" onclick="this.closest('.email-modal-overlay').remove()">Cancel</button>
            <button class="email-btn email-btn--primary" id="enroll-submit">
              <i class="fas fa-user-plus"></i> Enroll
            </button>
          </div>
          <div id="enroll-results" style="margin-top:1rem;font-size:0.8rem;"></div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Close on backdrop click
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
      });

      // Load sequences into dropdown
      try {
        const sequences = await queryConvex("emailSequences:listSequences");
        const select = document.getElementById("enroll-sequence");
        sequences.filter((s) => s.status === "active").forEach((seq) => {
          const opt = document.createElement("option");
          opt.value = seq._id;
          opt.textContent = seq.name;
          select.appendChild(opt);
        });
      } catch (err) {
        console.error("Failed to load sequences:", err);
      }

      // Bind submit
      document.getElementById("enroll-submit").addEventListener("click", async () => {
        const sequenceId = document.getElementById("enroll-sequence").value;
        const emailsRaw = document.getElementById("enroll-emails").value;

        if (!sequenceId) { alert("Select a sequence."); return; }

        const emails = emailsRaw.split("\n").map((e) => e.trim()).filter(Boolean);
        if (emails.length === 0) { alert("Enter at least one email."); return; }

        const resultsDiv = document.getElementById("enroll-results");
        resultsDiv.innerHTML = `<p style="color:#888;">Enrolling ${emails.length} email(s)...</p>`;

        try {
          const results = await mutateConvex("emailSubscribers:manualEnroll", {
            emails,
            sequenceId,
          });

          const summary = results.map((r) =>
            `<div style="color:${r.status === "enrolled" ? "#2d5a3d" : "#c62828"};">${escapeHtml(r.email)}: ${r.status}</div>`
          ).join("");

          resultsDiv.innerHTML = summary;
        } catch (err) {
          resultsDiv.innerHTML = `<p style="color:#c62828;">Error: ${escapeHtml(err.message)}</p>`;
        }
      });
    },
```

- [ ] **Step 2: Verify enrollment modal**

From the analytics view, click "Manually Enroll". Verify:
- Modal overlay appears with sequence dropdown and email textarea
- Only active sequences appear in the dropdown
- Cancel button closes the modal

- [ ] **Step 3: Commit enrollment modal**

```bash
cd supp-db-site
git add admin/email.js
git commit -m "feat: add manual enrollment modal to email admin

Bulk email paste, sequence selector (active only), per-email
result feedback, backdrop close."
```

### Task 18: Seed 3 pre-built welcome sequence emails

**Files:**
- Create: `convex/seedWelcomeSequence.ts`

This is a one-time seed script that creates the 3-email welcome sequence from the spec. Run it once from the Convex dashboard or via `npx convex run`.

- [ ] **Step 1: Create seed script**

Create `convex/seedWelcomeSequence.ts`:

```typescript
import { internalMutation } from "./_generated/server";

/**
 * One-time seed: creates the 3-email Welcome Sequence from the design spec.
 * Run via: npx convex run seedWelcomeSequence:seed
 *
 * IMPORTANT: Only run once. Check if "Welcome to SupplementDB" sequence exists first.
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("emailSequences").collect();
    const alreadyExists = existing.find((s) => s.name === "Welcome to SupplementDB");
    if (alreadyExists) {
      console.log("Welcome sequence already exists, skipping seed.");
      return;
    }

    const now = Date.now();

    // Create the sequence
    const sequenceId = await ctx.db.insert("emailSequences", {
      name: "Welcome to SupplementDB",
      description: "3-email welcome sequence for new newsletter subscribers. Builds trust through evidence, then offers the Sleep Optimization Guide.",
      trigger: { type: "both", event: "email_opt_in" },
      status: "draft", // Start as draft so admin can review before activating
      sendTime: { hour: 9, minute: 0, timezone: "America/New_York" },
      excludeDays: ["saturday", "sunday"],
      maxDeferHours: 48,
      createdAt: now,
      updatedAt: now,
    });

    // Email 1 — Welcome (send immediately)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 0,
      subject: "The {{supplement_count}} supplements. The {{paper_count}} papers. Here's what it means for you.",
      preheader: "Not all of them are worth taking. Most people are surprised which ones are.",
      bodyBlocks: [
        {
          type: "text",
          content: "You just joined a database that does something unusual: it tells you what <em>not</em> to take.",
        },
        {
          type: "text",
          content: "SupplementDB tracks {{supplement_count}} supplements across {{paper_count}} research papers. Each one is rated on a {{evidence_tier_count}}-tier evidence system — from \"strong clinical evidence\" down to \"mostly marketing.\"",
        },
        {
          type: "text",
          content: "Over the next few emails, I'll show you how the evidence system works, why most \"clinically proven\" claims fall apart under scrutiny, and how to use the database to make decisions you can actually trust.",
        },
        {
          type: "text",
          content: "For now, here's the full database. Browse by category, sort by evidence tier, and see what surprises you.",
        },
        {
          type: "cta",
          label: "Browse the Database",
          url: "{{site_url}}/index.html",
        },
        {
          type: "text",
          content: "<em>P.S. — The supplements with the weakest evidence are often the most popular. That's not a coincidence.</em>",
        },
      ],
      delayDays: 0,
      status: "active",
    });

    // Email 2 — Evidence Gap (+2 days)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 1,
      subject: '"Clinically proven" can mean 12 people for 3 weeks. Here\'s what it actually means.',
      preheader: "The label says evidence-based. The evidence says otherwise.",
      bodyBlocks: [
        {
          type: "text",
          content: "\"Clinically proven\" is the most abused phrase in the supplement industry.",
        },
        {
          type: "text",
          content: "It can mean a single study, with 12 participants, over 3 weeks, funded by the company selling the product. Technically clinical. Technically proven. Practically meaningless.",
        },
        {
          type: "text",
          content: "That's why SupplementDB uses a {{evidence_tier_count}}-tier evidence rating instead of a simple thumbs up/down:",
        },
        {
          type: "text",
          content: "<strong>Tier 1:</strong> Multiple large RCTs, consistent results, independent replication.<br><strong>Tier 2:</strong> Some RCTs with positive results, but limited in size or scope.<br><strong>Tier 3:</strong> Preliminary evidence — animal studies, small trials, mechanistic plausibility.<br><strong>Tier 4:</strong> Mostly traditional use or marketing claims. Little to no clinical evidence.",
        },
        {
          type: "text",
          content: "Most supplements people take daily? Tier 3 or 4. The ones that actually have Tier 1 evidence are a much shorter — and more interesting — list.",
        },
        {
          type: "cta",
          label: "View the Evidence Tier Guide",
          url: "{{site_url}}/index.html#guides",
        },
      ],
      delayDays: 2,
      status: "active",
    });

    // Email 3 — $9 Guide Offer (+5 days)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 2,
      subject: "{{supplement_count}} supplements reviewed for sleep. Here are the ones with actual evidence.",
      preheader: "You've seen the gap. Here's the complete protocol.",
      bodyBlocks: [
        {
          type: "text",
          content: "You've seen how the evidence system works. You've seen the gap between marketing and research. Now here's where it gets practical.",
        },
        {
          type: "text",
          content: "The Sleep Optimization Guide pulls together every sleep-related supplement in the database — dosages, timing, interactions, and evidence tier — into a single protocol you can actually follow.",
        },
        {
          type: "text",
          content: "It's not a list of \"top 10 sleep supplements.\" It's a decision framework built on the same evidence tiers you've been exploring. What to take, what to skip, what to combine, and what the research actually says about each one.",
        },
        {
          type: "text",
          content: "{{supplement_count}} supplements. {{paper_count}} papers. One clear protocol. $9.",
        },
        {
          type: "cta",
          label: "Get the Sleep Evidence Guide — $9",
          url: "{{site_url}}/index.html#guides",
        },
        {
          type: "text",
          content: "<em>Every purchase directly funds the database. More reviews, more papers, more tiers updated.</em>",
        },
      ],
      delayDays: 5,
      status: "active",
    });

    console.log("Welcome sequence seeded successfully (ID:", sequenceId, ")");
  },
});
```

- [ ] **Step 2: Run the seed script**

Run: `cd supp-db-site && npx convex run seedWelcomeSequence:seed`
Expected: "Welcome sequence seeded successfully" log output

- [ ] **Step 3: Verify in admin panel**

Navigate to Email Sequences in admin. Verify:
- "Welcome to SupplementDB" sequence appears in list
- Status is "draft"
- 3 steps are visible in the editor
- Step subjects contain `{{variable}}` tokens

- [ ] **Step 4: Commit seed script**

```bash
cd supp-db-site
git add convex/seedWelcomeSequence.ts
git commit -m "feat: add 3-email welcome sequence seed script

7X brand voice welcome sequence: evidence intro, evidence gap
reframe, Sleep Guide offer. All dynamic with {{variable}} tokens.
Run via: npx convex run seedWelcomeSequence:seed"
```

### Task 19: Seed siteConfig defaults + update .env.example

**Files:**
- Modify: `.env.example` (or create if it doesn't exist)

- [ ] **Step 1: Add seedDefaults to siteConfig.ts and run it**

Append to `convex/siteConfig.ts`:

```typescript
// Internal mutation for CLI seeding (no admin auth required)
export const seedDefaults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const defaults: Record<string, string> = {
      supplementCount: "93",
      paperCount: "471",
      evidenceTierCount: "4",
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await ctx.db
        .query("siteConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (!existing) {
        await ctx.db.insert("siteConfig", {
          key,
          value,
          updatedAt: Date.now(),
          updatedBy: "system:seed",
        });
      }
    }
    console.log("siteConfig defaults seeded");
  },
});
```

Add `internalMutation` to the imports at top of `convex/siteConfig.ts`:
```typescript
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
```

Run: `cd supp-db-site && npx convex run siteConfig:seedDefaults`
Expected: "siteConfig defaults seeded" log output

- [ ] **Step 2: Update .env.example**

Add to `.env.example` (or `convex/.env.example` depending on project convention):

```
# Email Sequence System
RESEND_WEBHOOK_SECRET=whsec_your_resend_webhook_secret
```

- [ ] **Step 3: Commit .env.example update**

```bash
cd supp-db-site
git add .env.example
git commit -m "docs: add RESEND_WEBHOOK_SECRET to .env.example

Required for Resend webhook signature validation on /resend-webhook route."
```

---

## Post-Implementation Checklist

After all tasks are complete, verify against the spec's success criteria:

- [ ] 3 welcome emails configured with `{{variable}}` tokens (Task 18)
- [ ] Admin panel accessible via Email sidebar item (Task 13)
- [ ] Sequence editor working end-to-end: create, edit, step CRUD, reorder (Tasks 3-4, 15)
- [ ] Enable/disable toggle per sequence operational (Task 3)
- [ ] Analytics dashboard showing sends/opens/clicks per step (Task 16)
- [ ] Resend webhooks recording delivery events via `/resend-webhook` (Task 10)
- [ ] Auto-trigger: email opt-in enrolls in welcome sequence (Task 12)
- [ ] Manual enrollment working from admin panel (Task 17)
- [ ] Duplicate enrollment guard: existing active subscriber not re-enrolled (Task 5)
- [ ] Unsubscribe propagation: webhook unsubscribe pauses sequence AND newsletter (Tasks 10, 11)
- [ ] Dynamic variables resolving live Convex data at send time (Task 8)
- [ ] Mandatory unsubscribe footer injected in every sequence email (Task 8)
- [ ] Smart scheduling with `maxDeferHours` failsafe (Task 8)
- [ ] Test email send resolves to authenticated admin's Clerk email (Tasks 4, 15)

---
