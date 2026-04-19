/**
 * bookmarks.ts — Bookmarked evidence guides (SUPP-252)
 *
 * Mirrors `favorites.ts` shape but keyed on `guideSlug` (e.g. "sleep",
 * "creatine") instead of supplement ID. The dashboard joins this table
 * with `guidePurchases` to surface purchase/download status alongside
 * bookmark state — done in `joinedUserBookmarks` so the client makes a
 * single round-trip.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

// ─── Mutations ────────────────────────────────────────────────────────────

export const toggleGuide = mutation({
  args: {
    guideSlug: v.string(),
    guideName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userBookmarks")
      .withIndex("by_user_guide", (q) =>
        q.eq("userId", user.clerkId).eq("guideSlug", args.guideSlug)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { isBookmarked: false };
    }
    await ctx.db.insert("userBookmarks", {
      userId: user.clerkId,
      guideSlug: args.guideSlug,
      guideName: args.guideName,
      createdAt: Date.now(),
    });
    return { isBookmarked: true };
  },
});

export const removeBookmark = mutation({
  args: { guideSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userBookmarks")
      .withIndex("by_user_guide", (q) =>
        q.eq("userId", user.clerkId).eq("guideSlug", args.guideSlug)
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
    return { ok: true };
  },
});

/**
 * Idempotent bulk-sync on first sign-in. Mirrors favorites.syncFavorites —
 * lets the client push any localStorage bookmark state up to the cloud
 * without losing anonymous-era bookmarks.
 */
export const syncBookmarks = mutation({
  args: {
    bookmarks: v.array(
      v.object({
        guideSlug: v.string(),
        guideName: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    let synced = 0;
    for (const b of args.bookmarks) {
      const existing = await ctx.db
        .query("userBookmarks")
        .withIndex("by_user_guide", (q) =>
          q.eq("userId", user.clerkId).eq("guideSlug", b.guideSlug)
        )
        .first();
      if (!existing) {
        await ctx.db.insert("userBookmarks", {
          userId: user.clerkId,
          guideSlug: b.guideSlug,
          guideName: b.guideName,
          createdAt: Date.now(),
        });
        synced++;
      }
    }
    return { synced, total: args.bookmarks.length };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────

export const getUserBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return await ctx.db
      .query("userBookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
  },
});

export const isBookmarked = query({
  args: { guideSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userBookmarks")
      .withIndex("by_user_guide", (q) =>
        q.eq("userId", user.clerkId).eq("guideSlug", args.guideSlug)
      )
      .first();
    return !!existing;
  },
});

/**
 * Dashboard-optimized read: returns each bookmark joined with the user's
 * purchase row for that guide (if any), so the panel can render purchase
 * status badges without a second round-trip. Private data — auth required.
 *
 * Purchase status derivation:
 *   - No guidePurchases row         → "not_purchased"
 *   - status="pdf_ready"             → "owned"        (downloadable)
 *   - status="paid"|"pdf_generating" → "pending"      (bought, still processing)
 *   - status="pending"               → "checkout"     (Stripe not yet confirmed)
 *   - status="failed"                → "failed"       (contact support)
 */
export const joinedUserBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const bookmarks = await ctx.db
      .query("userBookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();

    const out = [] as Array<{
      guideSlug: string;
      guideName?: string;
      createdAt: number;
      purchaseStatus:
        | "not_purchased"
        | "owned"
        | "pending"
        | "checkout"
        | "failed";
      accessType: "web" | "pdf" | null;
      stripeSessionId?: string;
    }>;

    for (const b of bookmarks) {
      // Find the most recent purchase for this user + guide.
      const purchase = await ctx.db
        .query("guidePurchases")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), user.clerkId),
            q.eq(q.field("guideSlug"), b.guideSlug)
          )
        )
        .order("desc")
        .first();

      let purchaseStatus: any = "not_purchased";
      if (purchase) {
        if (purchase.status === "pdf_ready") purchaseStatus = "owned";
        else if (purchase.status === "paid" || purchase.status === "pdf_generating")
          purchaseStatus = "pending";
        else if (purchase.status === "pending") purchaseStatus = "checkout";
        else if (purchase.status === "failed") purchaseStatus = "failed";
      }

      out.push({
        guideSlug: b.guideSlug,
        guideName: b.guideName,
        createdAt: b.createdAt,
        purchaseStatus,
        accessType: (purchase && (purchase.accessType as any)) || null,
        stripeSessionId: purchase?.stripeSessionId,
      });
    }

    // Newest first.
    out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  },
});
