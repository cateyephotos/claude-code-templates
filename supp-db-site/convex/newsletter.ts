import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireAdmin } from "./auth";

/**
 * Newsletter mutations and admin queries for SupplementDB.
 *
 * Double opt-in flow:
 *   1. User submits email → subscribe() creates pending record + schedules confirmation email
 *   2. User clicks confirmation link → confirm() marks as confirmed + schedules welcome email
 *   3. Unsubscribe link in every email → unsubscribe() marks as unsubscribed
 *
 * Admin queries require "admin" role via requireAdmin() guard.
 */

// ── Helpers ──────────────────────────────────────────────────

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a 32-character random alphanumeric token.
 * Convex mutations don't have access to crypto.randomUUID(),
 * so we use Math.random() with an alphanumeric charset.
 */
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Basic email validation — checks for @ and domain dot.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Public Mutations ─────────────────────────────────────────

/**
 * Subscribe an email to the newsletter (public, no auth required).
 * Creates a pending record and schedules a confirmation email.
 */
export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return { status: "invalid_email" as const };
    }

    const now = Date.now();

    // Check for existing subscriber
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Already confirmed — no action needed
      if (existing.status === "confirmed") {
        return { status: "already_subscribed" as const };
      }

      // Pending with valid token — don't spam
      if (
        existing.status === "pending" &&
        existing.tokenExpiresAt > now
      ) {
        return { status: "already_pending" as const };
      }

      // Pending with expired token OR unsubscribed — regenerate and resend
      const confirmToken = generateToken();
      const unsubscribeToken = existing.unsubscribeToken || generateToken();

      await ctx.db.patch(existing._id, {
        status: "pending",
        source: args.source,
        confirmToken,
        tokenExpiresAt: now + TOKEN_EXPIRY_MS,
        unsubscribeToken,
        unsubscribedAt: undefined,
        updatedAt: now,
      });

      // Schedule confirmation email
      await ctx.scheduler.runAfter(0, internal.resend.sendConfirmationEmail, {
        email,
        confirmToken,
        source: args.source,
      });

      return { status: "pending" as const };
    }

    // New subscriber
    const confirmToken = generateToken();
    const unsubscribeToken = generateToken();

    // Try to get current user's clerkId if signed in
    let clerkUserId: string | undefined;
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        clerkUserId = identity.subject;
      }
    } catch {
      // Auth not available — that's fine for public mutation
    }

    await ctx.db.insert("newsletterSubscribers", {
      email,
      status: "pending",
      source: args.source,
      confirmToken,
      tokenExpiresAt: now + TOKEN_EXPIRY_MS,
      unsubscribeToken,
      clerkUserId,
      createdAt: now,
      updatedAt: now,
    });

    // Schedule confirmation email
    await ctx.scheduler.runAfter(0, internal.resend.sendConfirmationEmail, {
      email,
      confirmToken,
      source: args.source,
    });

    return { status: "pending" as const };
  },
});

/**
 * Confirm a newsletter subscription via token (public, no auth required).
 * Called when user clicks the confirmation link in their email.
 */
export const confirm = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_confirmToken", (q) => q.eq("confirmToken", args.token))
      .first();

    if (!subscriber) {
      return { status: "invalid_token" as const };
    }

    if (subscriber.status === "confirmed") {
      return { status: "already_confirmed" as const };
    }

    const now = Date.now();

    if (subscriber.tokenExpiresAt < now) {
      return { status: "token_expired" as const };
    }

    await ctx.db.patch(subscriber._id, {
      status: "confirmed",
      confirmedAt: now,
      updatedAt: now,
    });

    // Schedule welcome email
    await ctx.scheduler.runAfter(0, internal.resend.sendWelcomeEmail, {
      email: subscriber.email,
      unsubscribeToken: subscriber.unsubscribeToken,
    });

    return { status: "confirmed" as const };
  },
});

/**
 * Unsubscribe from the newsletter via token (public, no auth required).
 * Called when user clicks the unsubscribe link in any email footer.
 */
export const unsubscribe = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_unsubscribeToken", (q) =>
        q.eq("unsubscribeToken", args.token)
      )
      .first();

    if (!subscriber) {
      return { status: "invalid_token" as const };
    }

    if (subscriber.status === "unsubscribed") {
      return { status: "already_unsubscribed" as const };
    }

    const now = Date.now();

    await ctx.db.patch(subscriber._id, {
      status: "unsubscribed",
      unsubscribedAt: now,
      updatedAt: now,
    });

    return { status: "unsubscribed" as const };
  },
});

// ── Admin Queries ────────────────────────────────────────────

/**
 * Get aggregate newsletter statistics (admin only).
 */
export const getNewsletterStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const all = await ctx.db.query("newsletterSubscribers").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    let confirmed = 0;
    let pending = 0;
    let unsubscribed = 0;
    let last7Days = 0;
    let last30Days = 0;

    for (const sub of all) {
      if (sub.status === "confirmed") confirmed++;
      else if (sub.status === "pending") pending++;
      else if (sub.status === "unsubscribed") unsubscribed++;

      if (sub.confirmedAt && sub.confirmedAt >= sevenDaysAgo) last7Days++;
      if (sub.confirmedAt && sub.confirmedAt >= thirtyDaysAgo) last30Days++;
    }

    return {
      total: all.length,
      confirmed,
      pending,
      unsubscribed,
      last7Days,
      last30Days,
    };
  },
});

/**
 * List newsletter subscribers with optional filtering (admin only).
 */
export const listSubscribers = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("unsubscribed")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit || 50;

    let q;
    if (args.status) {
      q = ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_status", (qb) => qb.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else {
      q = ctx.db
        .query("newsletterSubscribers")
        .order("desc")
        .take(limit);
    }

    return q;
  },
});

/**
 * Get daily confirmed subscriber counts for the last 30 days (admin only).
 * Returns array of { date: "YYYY-MM-DD", count: number }.
 */
export const getSubscriberGrowth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Get all confirmed subscribers in the last 30 days
    const confirmed = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();

    // Build daily counts
    const dailyCounts: Record<string, number> = {};

    // Initialize all 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyCounts[key] = 0;
    }

    // Count confirmed subscribers by day
    for (const sub of confirmed) {
      if (sub.confirmedAt && sub.confirmedAt >= thirtyDaysAgo) {
        const key = new Date(sub.confirmedAt).toISOString().split("T")[0];
        if (dailyCounts[key] !== undefined) {
          dailyCounts[key]++;
        }
      }
    }

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));
  },
});
