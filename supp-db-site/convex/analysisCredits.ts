import { query, mutation, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Analysis Credits — Manages per-user credit allocation for the Stack Analyzer.
 *
 * Credit system:
 *   Monthly credits (reset each month):
 *     Free:       3 analyses/month
 *     Subscriber: 25 analyses/month
 *
 *   Purchased credits (never expire, never reset):
 *     Starter Pack ($5):  10 credits
 *     Pro Pack ($10):     25 credits  (best value)
 *     Bulk Pack ($25):    75 credits
 *
 *   Credit cost per analysis depth:
 *     Quick:    1 credit
 *     Standard: 2 credits
 *     Deep:     3 credits
 *
 * Consumption order: monthly credits are used first, then purchased credits.
 */

// ── Credit Limits ──────────────────────────────────────────────
const CREDIT_LIMITS = {
  free: 3,
  subscriber: 25,
} as const;

// ── Credit Cost per Analysis Depth ─────────────────────────────
export const CREDIT_COST_BY_DEPTH: Record<string, number> = {
  quick: 1,
  standard: 2,
  deep: 3,
};

// ── Purchasable Credit Packs ───────────────────────────────────
export const CREDIT_PACKS = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    priceUsd: 5.00,
    priceCents: 500,
    analyses: { quick: 10, standard: 5, deep: 3 },
    badge: null,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 25,
    priceUsd: 10.00,
    priceCents: 1000,
    analyses: { quick: 25, standard: 12, deep: 8 },
    badge: "Best Value",
  },
  {
    id: "bulk",
    name: "Bulk Pack",
    credits: 75,
    priceUsd: 25.00,
    priceCents: 2500,
    analyses: { quick: 75, standard: 37, deep: 25 },
    badge: "Most Credits",
  },
] as const;

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
        purchasedCredits: 0,
        totalAvailable: CREDIT_LIMITS.free,
        periodStart: start,
        periodEnd: end,
        totalAnalyses: 0,
        lastAnalysisAt: null,
        creditCosts: CREDIT_COST_BY_DEPTH,
      };
    }

    // Check if we need to reset (new month)
    const { start: currentStart } = getCurrentPeriod();
    const used = record.periodStart < currentStart ? 0 : record.usedThisMonth;
    const monthlyRemaining = Math.max(0, record.monthlyLimit - used);
    const purchased = record.purchasedCredits ?? 0;

    return {
      tier: record.tier,
      monthlyLimit: record.monthlyLimit,
      usedThisMonth: used,
      remaining: monthlyRemaining,
      purchasedCredits: purchased,
      totalAvailable: monthlyRemaining + purchased,
      periodStart: record.periodStart,
      periodEnd: record.periodEnd,
      totalAnalyses: record.totalAnalyses,
      lastAnalysisAt: record.lastAnalysisAt ?? null,
      creditCosts: CREDIT_COST_BY_DEPTH,
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
    const monthlyRemaining = record.monthlyLimit - used;
    const purchased = record.purchasedCredits ?? 0;

    return (monthlyRemaining + purchased) > 0;
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
    depth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { start, end } = getCurrentPeriod();
    const now = Date.now();
    const cost = CREDIT_COST_BY_DEPTH[args.depth || "standard"] || 2;

    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      // First use — initialize with free tier
      if (cost > CREDIT_LIMITS.free) {
        throw new ConvexError(
          `This analysis requires ${cost} credits but you only have ${CREDIT_LIMITS.free}. Buy a credit pack or choose a lighter analysis depth.`
        );
      }
      await ctx.db.insert("analysisCredits", {
        userId: args.userId,
        tier: "free",
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: cost,
        purchasedCredits: 0,
        periodStart: start,
        periodEnd: end,
        lastAnalysisAt: now,
        totalAnalyses: 1,
        createdAt: now,
        updatedAt: now,
      });
      return {
        remaining: CREDIT_LIMITS.free - cost,
        purchasedCredits: 0,
        totalAvailable: CREDIT_LIMITS.free - cost,
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: cost,
        totalAnalyses: 1,
        creditCost: cost,
      };
    }

    // Reset if new month
    let used = record.usedThisMonth;
    let periodStart = record.periodStart;
    let periodEnd = record.periodEnd;

    if (periodStart < start) {
      // New billing period — reset monthly usage (purchased credits untouched)
      used = 0;
      periodStart = start;
      periodEnd = end;
    }

    const monthlyRemaining = Math.max(0, record.monthlyLimit - used);
    const purchased = record.purchasedCredits ?? 0;
    const totalAvailable = monthlyRemaining + purchased;

    // Check if user has enough credits
    if (totalAvailable < cost) {
      const depthLabel = args.depth === "quick" ? "Quick" : args.depth === "deep" ? "Deep" : "Standard";
      throw new ConvexError(
        `${depthLabel} analysis requires ${cost} credit${cost > 1 ? 's' : ''}, but you have ${totalAvailable}. ` +
        (totalAvailable === 0
          ? "Buy a credit pack to continue analyzing."
          : `Try a ${cost > 2 ? 'Quick (1 credit)' : 'Quick (1 credit)'} analysis, or buy more credits.`)
      );
    }

    // Consume credits: monthly first, then purchased
    let monthlyConsumed = Math.min(cost, monthlyRemaining);
    let purchasedConsumed = cost - monthlyConsumed;

    const newUsed = used + monthlyConsumed;
    const newPurchased = purchased - purchasedConsumed;
    const newTotal = record.totalAnalyses + 1;

    await ctx.db.patch(record._id, {
      usedThisMonth: newUsed,
      purchasedCredits: newPurchased,
      periodStart,
      periodEnd,
      lastAnalysisAt: now,
      totalAnalyses: newTotal,
      updatedAt: now,
    });

    const newMonthlyRemaining = Math.max(0, record.monthlyLimit - newUsed);
    return {
      remaining: newMonthlyRemaining,
      purchasedCredits: newPurchased,
      totalAvailable: newMonthlyRemaining + newPurchased,
      monthlyLimit: record.monthlyLimit,
      usedThisMonth: newUsed,
      totalAnalyses: newTotal,
      creditCost: cost,
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

/**
 * Admin: Reset credits for a user (sets usedThisMonth back to 0).
 */
export const adminResetCredits = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { start, end } = getCurrentPeriod();

    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      return { success: false, error: "No credit record found" };
    }

    await ctx.db.patch(record._id, {
      usedThisMonth: 0,
      periodStart: start,
      periodEnd: end,
      updatedAt: Date.now(),
    });

    return { success: true, remaining: record.monthlyLimit };
  },
});

// ── Credit Purchases ──────────────────────────────────────────

/**
 * Get available credit packs and pricing.
 * Public query — no auth required (shown on the buy-credits UI).
 */
export const getCreditPacks = query({
  args: {},
  handler: async () => {
    return {
      packs: CREDIT_PACKS.map(p => ({
        id: p.id,
        name: p.name,
        credits: p.credits,
        priceUsd: p.priceUsd,
        analyses: p.analyses,
        badge: p.badge,
        perCreditCents: Math.round(p.priceCents / p.credits),
      })),
      creditCosts: CREDIT_COST_BY_DEPTH,
    };
  },
});

/**
 * Add purchased credits to a user's account.
 * Called internally by the Stripe webhook after successful payment.
 */
export const addPurchasedCredits = internalMutation({
  args: {
    userId: v.string(),
    credits: v.number(),
    packId: v.string(),
    packName: v.string(),
    amountCents: v.number(),
    currency: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { start, end } = getCurrentPeriod();
    const now = Date.now();

    // Idempotency check — don't double-credit for same session
    const existingPurchase = await ctx.db
      .query("creditPurchases")
      .withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();

    if (existingPurchase && existingPurchase.status === "completed") {
      console.log(`[CreditPurchase] Duplicate webhook for session ${args.stripeSessionId} — skipping`);
      return { success: true, alreadyProcessed: true };
    }

    // Record the purchase
    const purchaseId = existingPurchase
      ? existingPurchase._id
      : await ctx.db.insert("creditPurchases", {
          userId: args.userId,
          packId: args.packId,
          packName: args.packName,
          creditsAdded: args.credits,
          amountCents: args.amountCents,
          currency: args.currency,
          stripeSessionId: args.stripeSessionId,
          stripePaymentIntentId: args.stripePaymentIntentId,
          stripeCustomerId: args.stripeCustomerId,
          status: "completed",
          createdAt: now,
          updatedAt: now,
        });

    if (existingPurchase) {
      await ctx.db.patch(existingPurchase._id, { status: "completed", updatedAt: now });
    }

    // Add credits to user's account
    const record = await ctx.db
      .query("analysisCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!record) {
      // Create record with purchased credits
      await ctx.db.insert("analysisCredits", {
        userId: args.userId,
        tier: "free",
        monthlyLimit: CREDIT_LIMITS.free,
        usedThisMonth: 0,
        purchasedCredits: args.credits,
        periodStart: start,
        periodEnd: end,
        lastAnalysisAt: undefined,
        totalAnalyses: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const currentPurchased = record.purchasedCredits ?? 0;
      await ctx.db.patch(record._id, {
        purchasedCredits: currentPurchased + args.credits,
        updatedAt: now,
      });
    }

    console.log(`✅ [CreditPurchase] Added ${args.credits} credits to user ${args.userId} (pack: ${args.packId})`);
    return { success: true, creditsAdded: args.credits };
  },
});

/**
 * Get purchase history for the current user.
 */
export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("creditPurchases")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(20);
  },
});
