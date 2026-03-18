import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * Site-wide configuration store for dynamic email variables.
 * Keys: supplementCount, paperCount, evidenceTierCount
 * Values are strings (parsed as needed at read time).
 */

// Internal query — used by emailCron.processSingleSubscriber to resolve {{variables}}
export const getAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("siteConfig").collect();
    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    return map;
  },
});

// Admin query — returns all config entries for the admin panel
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("siteConfig").collect();
  },
});

// Admin mutation — upsert a config key-value pair
export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: admin.clerkId,
      });
      return existing._id;
    }

    return ctx.db.insert("siteConfig", {
      key: args.key,
      value: args.value,
      updatedAt: now,
      updatedBy: admin.clerkId,
    });
  },
});

// Internal mutation for CLI seeding (no admin auth required)
export const seedDefaults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const defaults: Record<string, string> = {
      supplementCount: "93",
      paperCount: "471",
      evidenceTierCount: "4",
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await ctx.db
        .query("siteConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (!existing) {
        await ctx.db.insert("siteConfig", {
          key,
          value,
          updatedAt: Date.now(),
          updatedBy: "system:seed",
        });
      }
    }
    console.log("siteConfig defaults seeded");
  },
});
