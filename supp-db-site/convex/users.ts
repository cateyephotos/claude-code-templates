import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
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
    role: v.optional(v.union(v.literal("admin"), v.literal("subscriber"), v.literal("free"))),
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
        ...(args.role ? { role: args.role } : {}),
      });
      return existing._id;
    }

    // New user defaults to "free" role
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: args.role || "free",
      avatarUrl: args.avatarUrl,
      createdAt: now,
      lastLoginAt: now,
    });
  },
});

/**
 * Update a user's role — internal only (called from webhooks).
 * Does not require admin auth — used by Stripe webhook handler.
 */
export const updateRoleInternal = internalMutation({
  args: {
    clerkId: v.string(),
    newRole: v.union(
      v.literal("admin"),
      v.literal("subscriber"),
      v.literal("free")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.error(`updateRoleInternal: user not found for clerkId ${args.clerkId}`);
      return;
    }

    await ctx.db.patch(user._id, { role: args.newRole });
    console.log(
      `Updated role for user ${args.clerkId}: ${user.role} → ${args.newRole}`
    );
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
 * Get user by Clerk ID — internal only.
 * Used by server-side actions (e.g. pdfGenerator) that need the user's email.
 */
export const getByClerkIdInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
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
 * Bootstrap admin role — internal mutation, called from /admin-bootstrap HTTP endpoint.
 *
 * No Clerk auth required — the HTTP endpoint validates a shared secret env var instead.
 * Creates the user record if it doesn't exist (for pre-webhook setup).
 * Removes ADMIN_BOOTSTRAP_SECRET from Convex env vars after use to disable this path.
 */
export const bootstrapAdminRole = internalMutation({
  args: {
    email: v.union(v.string(), v.null()),
    clerkId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Try to find existing user
    let user = null;

    if (args.clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
        .first();
    }

    if (!user && args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .first();
    }

    if (user) {
      // Promote existing user to admin
      const prevRole = user.role;
      await ctx.db.patch(user._id, { role: "admin", lastLoginAt: now });
      return {
        action: "promoted",
        email: user.email,
        clerkId: user.clerkId,
        prevRole,
        newRole: "admin",
        message: `User ${user.email} promoted to admin. Remove ADMIN_BOOTSTRAP_SECRET from Convex env vars now.`,
      };
    }

    // User doesn't exist yet (webhook not set up) — create a placeholder record
    if (!args.email || !args.clerkId) {
      throw new Error(
        "User not found in DB. Provide both 'email' and 'clerkId' to create a placeholder admin record."
      );
    }

    const newId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.email.split("@")[0],
      role: "admin",
      createdAt: now,
      lastLoginAt: now,
    });

    return {
      action: "created",
      email: args.email,
      clerkId: args.clerkId,
      prevRole: null,
      newRole: "admin",
      userId: newId,
      message: `Admin record created for ${args.email}. Remove ADMIN_BOOTSTRAP_SECRET from Convex env vars now.`,
    };
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
