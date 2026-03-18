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

// ── Helper queries (internal, used by processSingleSubscriber action) ──

export const getStepById = internalQuery({
  args: { stepId: v.id("emailSteps") },
  handler: async (ctx, args) => ctx.db.get(args.stepId),
});

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
