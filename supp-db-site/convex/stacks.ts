/**
 * stacks.ts — Saved Stack Analyzer results (SUPP-251)
 *
 * Lets authenticated users save a named stack from the Stack Analyzer
 * (supplements + health goals + optional analysis snapshot) and share it
 * via a public `/stacks/{slug}` URL.
 *
 * Design notes
 * ────────────
 * - Slugs are globally unique. We derive a human-friendly base from the
 *   user-supplied name and append a short random suffix until the slug is
 *   free. Max 8 collision attempts — on exhaustion we fall back to a
 *   timestamp+random slug so `saveStack` never fails for collision reasons.
 * - `isPublic` is the authoritative privacy gate. `getPublicStack` only
 *   returns rows where `isPublic === true`; private stacks are 404 for
 *   anyone but the owner.
 * - `analysisSnapshot` is stored as `v.any()` so the full analyzer output
 *   round-trips unchanged. The Stack Analyzer owns the shape — we don't
 *   want to re-validate it here every time the analyzer grows new fields.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

const SLUG_SAFE_RE = /[^a-z0-9-]/g;
const MAX_SLUG_BASE_LEN = 48;
const MAX_COLLISION_ATTEMPTS = 8;

function toBaseSlug(name: string): string {
  const base = (name || "stack")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/\s+/g, "-")
    .replace(SLUG_SAFE_RE, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_BASE_LEN);
  return base || "stack";
}

function randomSuffix(len = 5): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"; // drop ambiguous chars
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// ─── Mutations ────────────────────────────────────────────────────────────

export const saveStack = mutation({
  args: {
    name: v.string(),
    supplementIds: v.array(v.string()),
    healthGoalIds: v.optional(v.array(v.string())),
    analysisSnapshot: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ slug: string; id: string }> => {
    const user = await requireAuth(ctx);
    if (args.supplementIds.length === 0) {
      throw new Error("A stack needs at least one supplement.");
    }
    if (args.supplementIds.length > 30) {
      throw new Error("A stack cannot contain more than 30 supplements.");
    }
    const trimmedName = args.name.trim().slice(0, 120) || "Untitled Stack";
    const base = toBaseSlug(trimmedName);

    // Find a unique slug. Try base alone first, then base-xxxxx, base-xxxxxx etc.
    let slug = base;
    let attempt = 0;
    while (attempt < MAX_COLLISION_ATTEMPTS) {
      const existing = await ctx.db
        .query("userStacks")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      attempt++;
      slug = `${base}-${randomSuffix(4 + Math.min(attempt, 3))}`;
    }
    if (attempt >= MAX_COLLISION_ATTEMPTS) {
      // Defensive fallback — statistically never hit with 30+ bits of entropy.
      slug = `${base}-${Date.now().toString(36)}-${randomSuffix(3)}`;
    }

    const now = Date.now();
    const id = await ctx.db.insert("userStacks", {
      userId: user.clerkId,
      slug,
      name: trimmedName,
      supplementIds: args.supplementIds,
      healthGoalIds: args.healthGoalIds,
      analysisSnapshot: args.analysisSnapshot,
      isPublic: args.isPublic !== false, // default true
      createdAt: now,
      updatedAt: now,
    });

    return { slug, id: String(id) };
  },
});

export const updateStack = mutation({
  args: {
    slug: v.string(),
    patches: v.object({
      name: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      supplementIds: v.optional(v.array(v.string())),
      healthGoalIds: v.optional(v.array(v.string())),
      analysisSnapshot: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const row = await ctx.db
      .query("userStacks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!row) throw new Error("Stack not found.");
    if (row.userId !== user.clerkId) throw new Error("Not authorized.");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.patches.name !== undefined) {
      updates.name = args.patches.name.trim().slice(0, 120) || row.name;
    }
    if (args.patches.isPublic !== undefined) updates.isPublic = !!args.patches.isPublic;
    if (args.patches.supplementIds !== undefined) {
      if (args.patches.supplementIds.length === 0) throw new Error("Stack needs ≥1 supplement.");
      if (args.patches.supplementIds.length > 30) throw new Error("Stack limited to 30 supplements.");
      updates.supplementIds = args.patches.supplementIds;
    }
    if (args.patches.healthGoalIds !== undefined) updates.healthGoalIds = args.patches.healthGoalIds;
    if (args.patches.analysisSnapshot !== undefined) updates.analysisSnapshot = args.patches.analysisSnapshot;

    await ctx.db.patch(row._id, updates);
    return { ok: true };
  },
});

export const deleteStack = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const row = await ctx.db
      .query("userStacks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!row) return { ok: true, alreadyGone: true };
    if (row.userId !== user.clerkId) throw new Error("Not authorized.");
    await ctx.db.delete(row._id);
    return { ok: true };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────

export const getUserStacks = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    const rows = await ctx.db
      .query("userStacks")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
    // Newest first.
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      supplementCount: r.supplementIds.length,
      supplementIds: r.supplementIds,
      healthGoalIds: r.healthGoalIds || [],
      isPublic: r.isPublic,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },
});

/**
 * Public read. Returns null when the slug doesn't exist OR the stack is
 * private (even if the caller is the owner — owners should use
 * `getMyStackBySlug` for that). This keeps the public endpoint 100% safe
 * to call anonymously without an auth check.
 */
export const getPublicStack = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("userStacks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!row || !row.isPublic) return null;
    return {
      slug: row.slug,
      name: row.name,
      supplementIds: row.supplementIds,
      healthGoalIds: row.healthGoalIds || [],
      analysisSnapshot: row.analysisSnapshot || null,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // Ownership info redacted on public reads.
    };
  },
});

/** Owner-scoped read — returns the stack regardless of isPublic. */
export const getMyStackBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const row = await ctx.db
      .query("userStacks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!row) return null;
    if (row.userId !== user.clerkId) return null; // treat as 404 for non-owner
    return {
      slug: row.slug,
      name: row.name,
      supplementIds: row.supplementIds,
      healthGoalIds: row.healthGoalIds || [],
      analysisSnapshot: row.analysisSnapshot || null,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },
});
