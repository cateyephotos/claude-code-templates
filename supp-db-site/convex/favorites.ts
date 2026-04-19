import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

/**
 * Add a supplement to the user's favorites.
 */
export const addFavorite = mutation({
  args: {
    supplementId: v.string(),
    supplementName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_supplement", (q) =>
        q.eq("userId", user.clerkId).eq("supplementId", args.supplementId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("favorites", {
      userId: user.clerkId,
      supplementId: args.supplementId,
      supplementName: args.supplementName,
      timestamp: Date.now(),
    });
  },
});

/**
 * Remove a supplement from the user's favorites.
 */
export const removeFavorite = mutation({
  args: {
    supplementId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_supplement", (q) =>
        q.eq("userId", user.clerkId).eq("supplementId", args.supplementId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Toggle favorite status for a supplement.
 */
export const toggleFavorite = mutation({
  args: {
    supplementId: v.string(),
    supplementName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_supplement", (q) =>
        q.eq("userId", user.clerkId).eq("supplementId", args.supplementId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFavorited: false };
    }

    await ctx.db.insert("favorites", {
      userId: user.clerkId,
      supplementId: args.supplementId,
      supplementName: args.supplementName,
      timestamp: Date.now(),
    });
    return { isFavorited: true };
  },
});

/**
 * Get all favorites for the current user.
 */
export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    return await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
  },
});

/**
 * Check if a specific supplement is favorited by the current user.
 */
export const isFavorited = query({
  args: {
    supplementId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_supplement", (q) =>
        q.eq("userId", user.clerkId).eq("supplementId", args.supplementId)
      )
      .first();

    return !!existing;
  },
});

/**
 * Sync favorites from localStorage on first sign-in.
 * Called once when a user signs in and has localStorage favorites
 * that haven't been synced to the cloud yet.
 */
export const syncFavorites = mutation({
  args: {
    favorites: v.array(
      v.object({
        supplementId: v.string(),
        supplementName: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    let synced = 0;
    for (const fav of args.favorites) {
      // Check if already exists
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_supplement", (q) =>
          q.eq("userId", user.clerkId).eq("supplementId", fav.supplementId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("favorites", {
          userId: user.clerkId,
          supplementId: fav.supplementId,
          supplementName: fav.supplementName,
          timestamp: Date.now(),
        });
        synced++;
      }
    }

    return { synced, total: args.favorites.length };
  },
});

/**
 * Get favorite count for the current user.
 */
export const getFavoriteCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();

    return favorites.length;
  },
});

/**
 * Public social-proof query — number of users who have favorited a given
 * supplement. Unauthenticated — counts are aggregate and not tied to any
 * user. Privacy rule: counts < 10 are returned as 0 so that small numbers
 * cannot be cross-referenced to identify specific users by subtraction.
 */
export const getSupplementSaveCount = query({
  args: {
    supplementId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_supplement", (q) =>
        q.eq("supplementId", args.supplementId)
      )
      .collect();
    const count = rows.length;
    return count >= 10 ? count : 0;
  },
});

/**
 * Batched public social-proof query — returns a map of supplementId → count
 * for the supplied IDs. Honors the same ≥ 10 privacy threshold as the
 * single-lookup variant. Intended for the supplement grid page where many
 * cards need counts in one round-trip.
 */
export const getSaveCountsForSupplements = query({
  args: {
    supplementIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const out: Record<string, number> = {};
    // Deduplicate and cap to protect against pathologically large batches.
    const unique = Array.from(new Set(args.supplementIds)).slice(0, 200);
    await Promise.all(
      unique.map(async (id) => {
        const rows = await ctx.db
          .query("favorites")
          .withIndex("by_supplement", (q) => q.eq("supplementId", id))
          .collect();
        const count = rows.length;
        out[id] = count >= 10 ? count : 0;
      })
    );
    return out;
  },
});
