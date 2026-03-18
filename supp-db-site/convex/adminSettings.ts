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
  "ANTHROPIC_MODEL",
] as const;

// Keys whose values must be masked before returning to the browser.
// Non-secret settings (model IDs, config values) are returned as-is.
const SECRET_KEYS = new Set(["ANTHROPIC_API_KEY", "RESEND_API_KEY"]);

// Default model — used as fallback when ANTHROPIC_MODEL is not configured.
export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

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

      const isSecret = SECRET_KEYS.has(key);
      if (dbSetting && dbSetting.value.length > 0) {
        results[key] = {
          isSet: true,
          masked: isSecret ? maskValue(dbSetting.value) : dbSetting.value,
          source: "admin_ui",
          updatedAt: dbSetting.updatedAt,
        };
      } else {
        // Check env var
        const envValue = process.env[key];
        const isSetInEnv = typeof envValue === "string" && envValue.length > 0;
        results[key] = {
          isSet: isSetInEnv,
          masked: isSetInEnv ? (isSecret ? maskValue(envValue!) : envValue!) : "",
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
  handler: async (ctx): Promise<{ success: boolean; model?: string; error?: string; latencyMs: number; source?: string }> => {
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

    // Resolve configured model — use stored preference, fall back to default
    const dbModel = await ctx.runQuery(internal.adminSettings.getRawSetting, {
      key: "ANTHROPIC_MODEL",
    });
    const model = dbModel || DEFAULT_ANTHROPIC_MODEL;

    const start = Date.now();
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model,
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

// ── Action: fetch available models from Anthropic API ──────────

export const fetchAvailableModels = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; error?: string; models: Array<{ id: string; name: string; createdAt: string }>; selectedModel?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const isAdmin = await ctx.runQuery(internal.adminSettings.checkIsAdmin, {
      clerkId: identity.subject,
    });
    if (!isAdmin) throw new Error("Admin access required");

    // Get API key: DB first, then env var
    const dbKey = await ctx.runQuery(internal.adminSettings.getRawSetting, {
      key: "ANTHROPIC_API_KEY",
    });
    const apiKey = dbKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "ANTHROPIC_API_KEY not configured. Save your API key first.",
        models: [],
      };
    }

    try {
      // Call Anthropic Models API to get the live list
      const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const body = await res.text();
        return {
          success: false,
          error: `Anthropic API returned ${res.status}: ${body}`,
          models: [],
        };
      }

      const data = await res.json() as { data: Array<{ id: string; display_name: string; created_at: string }> };
      const models = (data.data || []).map((m) => ({
        id: m.id,
        name: m.display_name || m.id,
        createdAt: m.created_at,
      }));

      // Get the currently selected model
      const selectedModel = await ctx.runQuery(internal.adminSettings.getRawSetting, {
        key: "ANTHROPIC_MODEL",
      });

      return {
        success: true,
        models,
        selectedModel: selectedModel || DEFAULT_ANTHROPIC_MODEL,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to fetch models",
        models: [],
      };
    }
  },
});
