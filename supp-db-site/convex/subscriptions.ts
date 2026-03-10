import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin } from "./auth";

/**
 * Create or update a subscription for a user.
 * Called from Stripe webhook handler or admin panel.
 */
export const upsertSubscription = mutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("monthly"), v.literal("annual")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("trialing"),
      v.literal("past_due")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: args.plan,
      status: args.status,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Get the current user's subscription.
 */
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .first();
  },
});

/**
 * Cancel a subscription at period end.
 * The subscription remains active until currentPeriodEnd.
 */
export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .first();

    if (!sub) {
      throw new Error("No active subscription found.");
    }

    await ctx.db.patch(sub._id, {
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    });

    return { cancelAtPeriodEnd: true, currentPeriodEnd: sub.currentPeriodEnd };
  },
});

/**
 * Reactivate a subscription that was set to cancel.
 */
export const reactivateSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .first();

    if (!sub) {
      throw new Error("No subscription found.");
    }

    await ctx.db.patch(sub._id, {
      cancelAtPeriodEnd: false,
      status: "active",
      updatedAt: Date.now(),
    });

    return { status: "active", cancelAtPeriodEnd: false };
  },
});

// ============================================================
// Admin-only subscription queries
// ============================================================

/**
 * Get subscription metrics — admin only.
 */
export const getSubscriptionMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const subs = await ctx.db.query("subscriptions").collect();

    const active = subs.filter((s) => s.status === "active");
    const cancelled = subs.filter((s) => s.status === "cancelled");
    const pastDue = subs.filter((s) => s.status === "past_due");
    const trialing = subs.filter((s) => s.status === "trialing");

    // Monthly vs annual breakdown (active only)
    const monthly = active.filter((s) => s.plan === "monthly");
    const annual = active.filter((s) => s.plan === "annual");

    // Simple MRR calculation
    // Placeholder prices — these should come from env/config in production
    const MONTHLY_PRICE = 9.99;
    const ANNUAL_MONTHLY_EQUIVALENT = 7.99;

    const mrr =
      monthly.length * MONTHLY_PRICE +
      annual.length * ANNUAL_MONTHLY_EQUIVALENT;

    // Churn: cancelled in last 30 days vs total active
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyCancelled = cancelled.filter(
      (s) => s.updatedAt > thirtyDaysAgo
    );
    const churnRate =
      active.length > 0
        ? ((recentlyCancelled.length / (active.length + recentlyCancelled.length)) * 100).toFixed(1)
        : "0";

    return {
      totalActive: active.length,
      totalCancelled: cancelled.length,
      totalPastDue: pastDue.length,
      totalTrialing: trialing.length,
      byPlan: {
        monthly: monthly.length,
        annual: annual.length,
      },
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat((mrr * 12).toFixed(2)),
      churnRate: parseFloat(churnRate),
    };
  },
});

/**
 * Get subscriptions by plan — admin only.
 */
export const getSubscriptionsByPlan = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const subs = await ctx.db.query("subscriptions").collect();

    const byPlan: Record<string, number> = { free: 0, monthly: 0, annual: 0 };
    for (const sub of subs) {
      if (sub.status === "active" || sub.status === "trialing") {
        byPlan[sub.plan] = (byPlan[sub.plan] || 0) + 1;
      }
    }

    return byPlan;
  },
});

/**
 * Get subscription growth over time — admin only.
 */
export const getSubscriptionGrowth = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const subs = await ctx.db.query("subscriptions").collect();

    // Group by creation month
    const byMonth: Record<string, { new: number; cancelled: number }> = {};

    for (const sub of subs) {
      if (sub.createdAt >= args.startTime && sub.createdAt <= args.endTime) {
        const month = new Date(sub.createdAt).toISOString().slice(0, 7); // YYYY-MM
        if (!byMonth[month]) byMonth[month] = { new: 0, cancelled: 0 };
        byMonth[month].new++;
      }

      if (
        sub.status === "cancelled" &&
        sub.updatedAt >= args.startTime &&
        sub.updatedAt <= args.endTime
      ) {
        const month = new Date(sub.updatedAt).toISOString().slice(0, 7);
        if (!byMonth[month]) byMonth[month] = { new: 0, cancelled: 0 };
        byMonth[month].cancelled++;
      }
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        newSubscriptions: data.new,
        cancellations: data.cancelled,
        net: data.new - data.cancelled,
      }));
  },
});

/**
 * List all subscriptions — admin only.
 */
export const listSubscriptions = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("expired"),
        v.literal("trialing"),
        v.literal("past_due")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let subs;
    if (args.status) {
      subs = await ctx.db
        .query("subscriptions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      subs = await ctx.db.query("subscriptions").collect();
    }

    const limit = args.limit ?? 50;
    return subs.slice(0, limit);
  },
});
