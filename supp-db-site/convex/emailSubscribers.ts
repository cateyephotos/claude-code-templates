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
    if (existing && (existing.status === "active" || existing.status === "completed" || existing.status === "paused")) {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
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

      if (existing && (existing.status === "active" || existing.status === "completed" || existing.status === "paused")) {
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
