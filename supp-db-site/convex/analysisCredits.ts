import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Analysis Credits — Manages per-user credit allocation for the Stack Analyzer.
 *
 * Credit pricing is depth-aware to match API cost structure:
 *   Quick    = 1 credit  (~$0.002 API cost)
 *   Standard = 2 credits (~$0.005 API cost)
 *   Deep     = 3 credits (~$0.008 API cost)
 *   Dual-goal adds +1 credit surcharge at every depth level.
 *
 * Credit tiers:
 *   Free:       5 credits/month  (enough for 5 quick or 2 standard + 1 quick)
 *   Subscriber: 30 credits/month (enough for ~10 standard or 7 deep analyses)
 *
 * Credits reset on the 1st of each month (UTC).
 * When a user upgrades mid-cycle, remaining credits carry over + difference added.
 */

// ── Credit Limits ──────────────────────────────────────────────
const CREDIT_LIMITS = {
  free: 5,
  subscriber: 30,
} as const;

// ── Depth-Aware Credit Costs ──────────────────────────────────
const CREDIT_COST_BY_DEPTH = {
  quick: 1,
  standard: 2,
  deep: 3,
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
 * Consume credits for an analysis. Called before the Claude API call.
 *
 * Depth-aware pricing (matches spec):
 *   Quick    = 1 credit  | + 1 for dual-goal = 2 credits
 *   Standard = 2 credits | + 1 for dual-goal = 3 credits
 *   Deep     = 3 credits | + 1 for dual-goal = 4 credits
 *
 * Race condition safety: Convex mutations are transactional — each mutation sees
 * a consistent snapshot and writes are serialized. Two concurrent consumeCredit
 * calls for the same user will be serialized by Convex's OCC (optimistic
 * concurrency control). If a conflict is detected, Convex automatically retries
 * the mutation with a fresh read, so double-consumption cannot occur.
 *
 * Returns the updated credit info or throws if insufficient credits remain.
 */
export const consumeCredit = mutation({
  args: {
    userId: v.string(),
    goalCount: v.optional(v.number()),
    depth: v.optional(v.union(v.literal("quick"), v.literal("standard"), v.literal("deep"))),
  },
  handler: async (ctx, args) => {
    const { start, end } = getCurrentPeriod();
    const now = Date.now();

    // Depth-aware cost: base from depth + 1 surcharge for dual-goal
    const depthKey = args.depth ?? "standard";
    const baseCost = CREDIT_COST_BY_DEPTH[depthKey] ?? CREDIT_COST_BY_DEPTH.standard;
    const dualGoalSurcharge = (args.goalCount ?? 1) > 1 ? 1 : 0;
    const cost = baseCost + dualGoalSurcharge;

    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      // First use — initialize with free tier
      // Cost check: even first-time users must have enough credits
      if (cost > CREDIT_LIMITS.free) {
        throw new Error(
          `Insufficient credits. This analysis costs ${cost} credits but free tier only allows ${CREDIT_LIMITS.free}.`
        );
      }
      await ctx.db.insert("analysisCredits", {
        userId: args.userId,
        tier: "free",
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: cost,
        periodStart: start,
        periodEnd: end,
        lastAnalysisAt: now,
        totalAnalyses: 1,
        createdAt: now,
        updatedAt: now,
      });
      return {
        remaining: CREDIT_LIMITS.free - cost,
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: cost,
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
    if (used + cost > record.monthlyLimit) {
      throw new Error(
        `Insufficient credits for this analysis. ` +
        `Cost: ${cost} credit${cost > 1 ? "s" : ""}, Remaining: ${record.monthlyLimit - used}. ` +
        (record.tier === "free"
          ? "Upgrade to Pro for 25 analyses/month."
          : "Your credits will reset at the start of next month.")
      );
    }

    // Consume credit(s)
    // Convex OCC ensures this patch is atomic — if another mutation modified
    // this record concurrently, Convex will retry this mutation with fresh data.
    const newUsed = used + cost;
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
