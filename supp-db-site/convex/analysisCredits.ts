import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Analysis Credits — Manages per-user credit allocation for the Stack Analyzer.
 *
 * Credit tiers:
 *   Free:       3 analyses/month  (~$0.018/month cost at $0.006/analysis)
 *   Subscriber: 25 analyses/month (~$0.15/month cost at $0.006/analysis)
 *
 * Credits reset on the 1st of each month (UTC).
 * When a user upgrades mid-cycle, remaining credits carry over + difference added.
 */

// ── Credit Limits ──────────────────────────────────────────────
const CREDIT_LIMITS = {
  free: 3,
  subscriber: 25,
} as const;

// ── Helpers ────────────────────────────────────────────────────

/** Get the start and end of the current billing period (calendar month UTC) */
function getCurrentPeriod(): { start: number; end: number } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.getTime(), end: end.getTime() };
}

/** Determine tier from user role */
function tierFromRole(role: string): "free" | "subscriber" {
  return role === "subscriber" || role === "admin" ? "subscriber" : "free";
}

// ── Queries ────────────────────────────────────────────────────

/**
 * Get the current user's credit balance and usage.
 * Returns null if not authenticated.
 */
export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .unique();

    if (!record) {
      // No record yet — return defaults
      const { start, end } = getCurrentPeriod();
      return {
        tier: "free" as const,
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: 0,
        remaining: CREDIT_LIMITS.free,
        periodStart: start,
        periodEnd: end,
        totalAnalyses: 0,
        lastAnalysisAt: null,
      };
    }

    // Check if we need to reset (new month)
    const { start: currentStart } = getCurrentPeriod();
    const used = record.periodStart < currentStart ? 0 : record.usedThisMonth;

    return {
      tier: record.tier,
      monthlyLimit: record.monthlyLimit,
      usedThisMonth: used,
      remaining: record.monthlyLimit - used,
      periodStart: record.periodStart,
      periodEnd: record.periodEnd,
      totalAnalyses: record.totalAnalyses,
      lastAnalysisAt: record.lastAnalysisAt ?? null,
    };
  },
});

/**
 * Check if current user has credits available.
 * Used by the Stack Analyzer action before calling Claude.
 */
export const hasCreditsAvailable = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const clerkId = identity.subject;
    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .unique();

    if (!record) {
      // First-time user always has credits (will be initialized on first use)
      return true;
    }

    // Reset check
    const { start: currentStart } = getCurrentPeriod();
    const used = record.periodStart < currentStart ? 0 : record.usedThisMonth;

    return used < record.monthlyLimit;
  },
});

// ── Mutations ──────────────────────────────────────────────────

/**
 * Consume one credit. Called after a successful Stack Analyzer run.
 * Returns the updated credit info or throws if no credits remain.
 */
export const consumeCredit = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { start, end } = getCurrentPeriod();
    const now = Date.now();

    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      // First use — initialize with free tier
      const newRecord = await ctx.db.insert("analysisCredits", {
        userId: args.userId,
        tier: "free",
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: 1,
        periodStart: start,
        periodEnd: end,
        lastAnalysisAt: now,
        totalAnalyses: 1,
        createdAt: now,
        updatedAt: now,
      });
      return {
        remaining: CREDIT_LIMITS.free - 1,
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: 1,
        totalAnalyses: 1,
      };
    }

    // Reset if new month
    let used = record.usedThisMonth;
    let periodStart = record.periodStart;
    let periodEnd = record.periodEnd;

    if (periodStart < start) {
      // New billing period — reset usage
      used = 0;
      periodStart = start;
      periodEnd = end;
    }

    // Check limit
    if (used >= record.monthlyLimit) {
      throw new Error(
        `Monthly analysis limit reached (${record.monthlyLimit}/${record.monthlyLimit}). ` +
        (record.tier === "free"
          ? "Upgrade to Pro for 25 analyses/month."
          : "Your credits will reset at the start of next month.")
      );
    }

    // Consume credit
    const newUsed = used + 1;
    const newTotal = record.totalAnalyses + 1;

    await ctx.db.patch(record._id, {
      usedThisMonth: newUsed,
      periodStart,
      periodEnd,
      lastAnalysisAt: now,
      totalAnalyses: newTotal,
      updatedAt: now,
    });

    return {
      remaining: record.monthlyLimit - newUsed,
      monthlyLimit: record.monthlyLimit,
      usedThisMonth: newUsed,
      totalAnalyses: newTotal,
    };
  },
});

/**
 * Sync tier when user subscription changes (called from Stripe webhook handler).
 * Upgrades limit, preserves used count.
 */
export const syncTier = internalMutation({
  args: {
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const tier = tierFromRole(args.role);
    const limit = CREDIT_LIMITS[tier];
    const { start, end } = getCurrentPeriod();
    const now = Date.now();

    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      await ctx.db.insert("analysisCredits", {
        userId: args.userId,
        tier,
        monthlyLimit: limit,
        usedThisMonth: 0,
        periodStart: start,
        periodEnd: end,
        lastAnalysisAt: undefined,
        totalAnalyses: 0,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.patch(record._id, {
      tier,
      monthlyLimit: limit,
      updatedAt: now,
    });
  },
});

/**
 * Get recent analysis history for the current user.
 */
export const getMyAnalyses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkId = identity.subject;
    const limit = args.limit ?? 10;

    return await ctx.db
      .query("stackAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .order("desc")
      .take(limit);
  },
});
