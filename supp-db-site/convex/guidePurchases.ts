import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Guide Purchases module for SupplementDB.
 *
 * Handles recording, updating, and querying one-time guide purchases.
 * Supports two access types:
 *   - "web"  — unlocks the gated HTML content on the site
 *   - "pdf"  — PDF delivery only (legacy default)
 *
 * Web access is intentionally separate from PDF access; legacy records
 * with undefined accessType do NOT grant web access.
 */

/** Guides that are always free — no purchase required. */
const FREE_GUIDES = ["sleep", "safety-interactions"];

// ─── Public queries (authenticated) ──────────────────────────────────────────

/**
 * Returns true if the current user has web access to the given guide.
 *
 * Free guides always return true.
 * Unauthenticated users always return false.
 * Legacy records (accessType undefined) do NOT grant web access.
 */
export const hasWebAccess = query({
  args: { guideSlug: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    // Free guides are always accessible
    if (FREE_GUIDES.includes(args.guideSlug)) {
      return true;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const userId = identity.subject;

    const purchases = await ctx.db
      .query("guidePurchases")
      .withIndex("by_user_guide", (q) =>
        q.eq("userId", userId).eq("guideSlug", args.guideSlug)
      )
      .collect();

    const PAID_STATUSES = ["paid", "pdf_ready", "pdf_generating"] as const;

    return purchases.some(
      (p) =>
        p.accessType === "web" &&
        PAID_STATUSES.includes(p.status as (typeof PAID_STATUSES)[number])
    );
  },
});

/**
 * Returns all guide purchases for the currently authenticated user.
 * Returns an empty array for unauthenticated users.
 */
export const getUserPurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    return await ctx.db
      .query("guidePurchases")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * Returns true if the current user has purchased the given guide
 * in any paid status and with any access type.
 */
export const hasPurchasedGuide = query({
  args: { guideSlug: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const userId = identity.subject;

    const PAID_STATUSES = ["paid", "pdf_ready", "pdf_generating"] as const;

    const purchases = await ctx.db
      .query("guidePurchases")
      .withIndex("by_user_guide", (q) =>
        q.eq("userId", userId).eq("guideSlug", args.guideSlug)
      )
      .collect();

    return purchases.some((p) =>
      PAID_STATUSES.includes(p.status as (typeof PAID_STATUSES)[number])
    );
  },
});

// ─── Internal mutations ───────────────────────────────────────────────────────

/**
 * Idempotent insert — if a record with the same stripeSessionId already exists,
 * returns the existing document's _id without inserting a duplicate.
 */
export const recordGuidePurchase = internalMutation({
  args: {
    userId: v.string(),
    guideSlug: v.string(),
    guideName: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    amountTotal: v.number(),
    currency: v.string(),
    accessType: v.optional(v.union(v.literal("web"), v.literal("pdf"))),
  },
  handler: async (ctx, args): Promise<Id<"guidePurchases">> => {
    // Idempotency check — return existing record if already inserted
    const existing = await ctx.db
      .query("guidePurchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();

    return await ctx.db.insert("guidePurchases", {
      userId: args.userId,
      guideSlug: args.guideSlug,
      guideName: args.guideName,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCustomerId: args.stripeCustomerId,
      amountTotal: args.amountTotal,
      currency: args.currency,
      status: "paid",
      accessType: args.accessType,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Marks a purchase as "pdf_generating" — called at the start of PDF generation.
 */
export const markPdfGenerating = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.purchaseId, {
      status: "pdf_generating",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Marks a purchase as "failed" and records the error message.
 */
export const markPdfFailed = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.purchaseId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Updates a purchase with the generated PDF storage ID and marks it "pdf_ready".
 */
export const updateGuidePurchasePdf = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
    pdfStorageId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.purchaseId, {
      status: "pdf_ready",
      pdfStorageId: args.pdfStorageId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Records the timestamp when the download notification email was sent.
 */
export const markEmailSent = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.purchaseId, {
      emailSentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ─── Internal queries ─────────────────────────────────────────────────────────

/**
 * Fetches a single purchase by its document ID.
 * Returns null if not found.
 */
export const getPurchaseById = internalQuery({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.purchaseId);
  },
});
