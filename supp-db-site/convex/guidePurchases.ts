import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Guide Purchase module for SupplementDB.
 *
 * Handles one-time PDF guide purchases. The flow is:
 *   1. Client calls createGuideCheckoutSession (stripe.ts) → Stripe Checkout page
 *   2. Stripe fires checkout.session.completed webhook (http.ts)
 *   3. Webhook calls recordGuidePurchase mutation (this file)
 *   4. Webhook schedules generateAndStorePdf internalAction (pdfGenerator.ts)
 *   5. PDF is stored, updateGuidePurchasePdf is called
 *   6. Download email is sent (resend.ts)
 *   7. Client polls getBySessionId until status === "pdf_ready"
 *   8. Client calls getPdfDownloadUrl action to get a signed URL
 */

// ── Internal Mutations (called from webhook/scheduler) ──────────────

/**
 * Record a new guide purchase after Stripe payment confirmation.
 * Called from the stripe webhook handler.
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Prevent duplicate inserts from webhook retries
    const existing = await ctx.db
      .query("guidePurchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();

    if (existing) {
      console.log(
        `guidePurchases.recordGuidePurchase: already recorded for session ${args.stripeSessionId}`
      );
      return existing._id;
    }

    const id = await ctx.db.insert("guidePurchases", {
      userId: args.userId,
      guideSlug: args.guideSlug,
      guideName: args.guideName,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCustomerId: args.stripeCustomerId,
      amountTotal: args.amountTotal,
      currency: args.currency,
      status: "paid",
      createdAt: now,
      updatedAt: now,
    });

    console.log(
      `✅ guidePurchases.recordGuidePurchase: created ${id} for user ${args.userId}, guide ${args.guideSlug}`
    );

    return id;
  },
});

/**
 * Mark purchase as "pdf_generating" — called when PDF generation starts.
 */
export const markPdfGenerating = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      status: "pdf_generating",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Store the generated PDF storage ID and mark purchase as "pdf_ready".
 * Called after Convex storage.store() completes.
 */
export const updateGuidePurchasePdf = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
    pdfStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      pdfStorageId: args.pdfStorageId,
      status: "pdf_ready",
      updatedAt: Date.now(),
    });

    console.log(
      `✅ guidePurchases.updateGuidePurchasePdf: purchase ${args.purchaseId} ready (storageId: ${args.pdfStorageId})`
    );
  },
});

/**
 * Mark purchase as failed (PDF generation error).
 */
export const markPdfFailed = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });

    console.error(
      `❌ guidePurchases.markPdfFailed: purchase ${args.purchaseId} — ${args.errorMessage}`
    );
  },
});

/**
 * Record that the download email was sent.
 */
export const markEmailSent = internalMutation({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      emailSentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ── Public Queries ──────────────────────────────────────────────────

/**
 * Get a guide purchase by Stripe session ID.
 * Used by the guide-success.html page to poll for PDF readiness.
 * Returns null if not found or if the purchase belongs to another user.
 */
export const getBySessionId = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const purchase = await ctx.db
      .query("guidePurchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.sessionId)
      )
      .first();

    if (!purchase) return null;

    // Only return purchase if it belongs to the authenticated user
    if (purchase.userId !== clerkId) return null;

    // Strip internal fields from the response
    return {
      _id: purchase._id,
      guideSlug: purchase.guideSlug,
      guideName: purchase.guideName,
      status: purchase.status,
      amountTotal: purchase.amountTotal,
      currency: purchase.currency,
      hasPdf: !!purchase.pdfStorageId,
      errorMessage: purchase.errorMessage,
      createdAt: purchase.createdAt,
    };
  },
});

/**
 * Get all guide purchases for the authenticated user.
 * Used in the user profile / purchase history page.
 */
export const getMyGuidePurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkId = identity.subject;

    const purchases = await ctx.db
      .query("guidePurchases")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .order("desc")
      .collect();

    return purchases.map((p) => ({
      _id: p._id,
      guideSlug: p.guideSlug,
      guideName: p.guideName,
      status: p.status,
      amountTotal: p.amountTotal,
      currency: p.currency,
      hasPdf: !!p.pdfStorageId,
      createdAt: p.createdAt,
    }));
  },
});

// ── Public Actions ──────────────────────────────────────────────────

/**
 * Get a signed download URL for a purchased guide PDF.
 * The signed URL expires after 1 hour — call this only when the user
 * is actively requesting a download.
 */
export const getPdfDownloadUrl = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string; guideName: string } | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required.");
    }

    const clerkId = identity.subject;

    // Fetch purchase record
    const purchase = await ctx.runQuery(api.guidePurchases.getBySessionId, {
      sessionId: args.sessionId,
    });

    if (!purchase) {
      throw new Error("Purchase not found.");
    }

    if (purchase.status !== "pdf_ready") {
      throw new Error(
        `PDF not ready yet. Current status: ${purchase.status}`
      );
    }

    // Get the full record (with storageId) via internal query
    const fullPurchase = await ctx.runQuery(
      internal.guidePurchases.getFullPurchaseBySessionId,
      { sessionId: args.sessionId, clerkId }
    );

    if (!fullPurchase?.pdfStorageId) {
      throw new Error("PDF storage ID not found.");
    }

    // Generate a fresh signed URL (valid for 1 hour)
    const url = await ctx.storage.getUrl(fullPurchase.pdfStorageId as any);
    if (!url) {
      throw new Error("Failed to generate download URL.");
    }

    return { url, guideName: fullPurchase.guideName };
  },
});

// ── Internal Queries (for use by other internal functions) ──────────

/**
 * Get the full purchase record including pdfStorageId.
 * Internal only — not exposed to the client.
 */
export const getFullPurchaseBySessionId = internalQuery({
  args: {
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("guidePurchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.sessionId)
      )
      .first();

    if (!purchase || purchase.userId !== args.clerkId) return null;

    return purchase;
  },
});

/**
 * Get purchase by ID (for PDF generator to look up purchase details).
 */
export const getPurchaseById = internalQuery({
  args: {
    purchaseId: v.id("guidePurchases"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.purchaseId);
  },
});
