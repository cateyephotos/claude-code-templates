import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, getAuthUser } from "./auth";

/**
 * Upsert user on sign-in — creates if new, updates lastLoginAt if existing.
 * Called from the client after Clerk authentication completes.
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        lastLoginAt: now,
      });
      return existing._id;
    }

    // New user defaults to "free" role
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "free",
      avatarUrl: args.avatarUrl,
      createdAt: now,
      lastLoginAt: now,
    });
  },
});

/**
 * Update a user's role — admin only.
 */
export const updateRole = mutation({
  args: {
    targetClerkId: v.string(),
    newRole: v.union(v.literal("admin"), v.literal("subscriber"), v.literal("free")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.targetClerkId))
      .first();

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    await ctx.db.patch(targetUser._id, { role: args.newRole });
    return { success: true, userId: targetUser._id, newRole: args.newRole };
  },
});

/**
 * Get user by Clerk ID.
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Get current authenticated user.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUser(ctx);
  },
});

/**
 * List all users — admin only.
 */
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
    roleFilter: v.optional(
      v.union(v.literal("admin"), v.literal("subscriber"), v.literal("free"))
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 50;

    if (args.roleFilter) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.roleFilter!))
        .take(limit);
    }

    return await ctx.db.query("users").take(limit);
  },
});

/**
 * Get total user count.
 */
export const getUserCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

/**
 * Get user count grouped by role.
 */
export const getUserCountByRole = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const counts = { admin: 0, subscriber: 0, free: 0 };

    for (const user of users) {
      counts[user.role as keyof typeof counts]++;
    }

    return counts;
  },
});
