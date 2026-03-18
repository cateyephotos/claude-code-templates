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
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.trigger !== undefined) patch.trigger = updates.trigger;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.sendTime !== undefined) patch.sendTime = updates.sendTime;
    if (updates.excludeDays !== undefined) patch.excludeDays = updates.excludeDays;
    if (updates.maxDeferHours !== undefined) patch.maxDeferHours = updates.maxDeferHours;

    await ctx.db.patch(sequenceId, patch as any);
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
    const patch: Record<string, unknown> = {};
    if (updates.subject !== undefined) patch.subject = updates.subject;
    if (updates.preheader !== undefined) patch.preheader = updates.preheader;
    if (updates.bodyBlocks !== undefined) patch.bodyBlocks = updates.bodyBlocks;
    if (updates.delayDays !== undefined) patch.delayDays = updates.delayDays;
    if (updates.status !== undefined) patch.status = updates.status;

    await ctx.db.patch(stepId, patch as any);
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

    // Gather events for this sequence, filtering by timestamp at the DB level
    const allEvents = cutoff > 0
      ? await ctx.db
          .query("emailEvents")
          .withIndex("by_sequence_timestamp", (q) =>
            q.eq("sequenceId", args.sequenceId).gte("timestamp", cutoff)
          )
          .collect()
      : await ctx.db
          .query("emailEvents")
          .withIndex("by_sequence_timestamp", (q) => q.eq("sequenceId", args.sequenceId))
          .collect();

    // Build per-step analytics
    const stepAnalytics = steps.map((step) => {
      const stepEvents = allEvents.filter((e) => e.stepId === step._id);
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
    const totalSent = allEvents.filter((e) => e.type === "sent").length;
    const totalDelivered = allEvents.filter((e) => e.type === "delivered").length;
    const totalOpened = allEvents.filter((e) => e.type === "opened").length;
    const totalClicked = allEvents.filter((e) => e.type === "clicked").length;

    return {
      funnel: { sent: totalSent, delivered: totalDelivered, opened: totalOpened, clicked: totalClicked },
      steps: stepAnalytics,
    };
  },
});

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
    const { internal: internalApi } = await import("./_generated/api");
    await ctx.scheduler.runAfter(0, internalApi.emailCronAction.sendTestEmailAction, {
      recipientEmail: args.recipientEmail,
      stepId: firstStep._id,
      sequenceId: args.sequenceId,
    });

    return { sent: true, stepSubject: firstStep.subject };
  },
});
