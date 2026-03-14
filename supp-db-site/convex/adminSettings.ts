import { action, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

/**
 * adminSettings.ts — Admin-configurable secrets stored in Convex DB.
 *
 * Allows admins to set API keys (ANTHROPIC_API_KEY, RESEND_API_KEY) from the
 * admin dashboard UI without accessing the Convex dashboard.
 *
 * Security:
 *  - All public queries/mutations require admin role (enforced server-side)
 *  - Raw values are NEVER returned to the browser — only masked versions
 *  - Internal query getRawSetting is only callable from other Convex functions
 *  - Stack Analyzer action prefers DB setting, falls back to process.env
 */

// ── Allowlist of keys that can be set via admin UI ─────────────
// Only add keys here that are safe to manage from the browser form.
// Stripe keys are excluded intentionally — manage those via Convex Dashboard.
const CONFIGURABLE_KEYS = [
  "ANTHROPIC_API_KEY",
  "RESEND_API_KEY",
] as const;

type ConfigurableKey = (typeof CONFIGURABLE_KEYS)[number];

// ── Helpers ────────────────────────────────────────────────────

async function requireAdmin(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return identity.subject;
}

function maskValue(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return value.slice(0, 4) + "•".repeat(Math.min(value.length - 8, 20)) + value.slice(-4);
}

// ── Internal query: raw value for use by other Convex functions ─

export const getRawSetting = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .unique();
    return setting?.value ?? null;
  },
});

// Internal query for actions to check admin role
export const checkIsAdmin = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
      .unique();
    return user?.role === "admin";
  },
});

// ── Public query: settings status (masked, never raw) ──────────

export const getSettingsStatus = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const results: Record<string, { isSet: boolean; masked: string; source: string; updatedAt: number | null }> = {};

    for (const key of CONFIGURABLE_KEYS) {
      // Check DB first
      const dbSetting = await ctx.db
        .query("adminSettings")
        .withIndex("by_key", (q: any) => q.eq("key", key))
        .unique();

      if (dbSetting && dbSetting.value.length > 0) {
        results[key] = {
          isSet: true,
          masked: maskValue(dbSetting.value),
          source: "admin_ui",
          updatedAt: dbSetting.updatedAt,
        };
      } else {
        // Check env var
        const envValue = process.env[key];
        const isSetInEnv = typeof envValue === "string" && envValue.length > 0;
        results[key] = {
          isSet: isSetInEnv,
          masked: isSetInEnv ? maskValue(envValue!) : "",
          source: isSetInEnv ? "env_var" : "not_set",
          updatedAt: null,
        };
      }
    }

    return results;
  },
});

// ── Mutation: upsert a setting ─────────────────────────────────

export const upsertSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { key, value }) => {
    const clerkId = await requireAdmin(ctx);

    if (!CONFIGURABLE_KEYS.includes(key as ConfigurableKey)) {
      throw new Error(`Key "${key}" is not admin-configurable via UI`);
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("Value cannot be empty");
    }

    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: trimmed,
        updatedAt: Date.now(),
        updatedBy: clerkId,
      });
    } else {
      await ctx.db.insert("adminSettings", {
        key,
        value: trimmed,
        updatedAt: Date.now(),
        updatedBy: clerkId,
      });
    }

    return { success: true };
  },
});

// ── Mutation: delete a setting (revert to env var) ─────────────

export const deleteSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});

// ── Action: test Anthropic API connection ──────────────────────

export const testAnthropicConnection = action({
  args: {},
  handler: async (ctx) => {
    // Admin check via internal query (actions can't access ctx.db directly)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const isAdmin = await ctx.runQuery(internal.adminSettings.checkIsAdmin, {
      clerkId: identity.subject,
    });
    if (!isAdmin) throw new Error("Admin access required");

    // Get key: DB first, then env var
    const dbKey = await ctx.runQuery(internal.adminSettings.getRawSetting, {
      key: "ANTHROPIC_API_KEY",
    });
    const apiKey = dbKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "No API key configured. Enter your key above and save it first.",
        latencyMs: 0,
      };
    }

    const start = Date.now();
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20250315",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      });
      return {
        success: true,
        model: response.model,
        latencyMs: Date.now() - start,
        source: dbKey ? "admin_ui" : "env_var",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Unknown API error",
        latencyMs: Date.now() - start,
      };
    }
  },
});
