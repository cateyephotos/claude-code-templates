import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const FREE_GUIDES = ["sleep"];

export const getContent = query({
  args: {
    guideSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Free guides have content inline in static HTML; no DB entry needed
    if (FREE_GUIDES.includes(args.guideSlug)) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Role-based access: subscribers and admins get all premium content
    const role = (identity as any).publicMetadata?.role as string | undefined;
    const hasRoleAccess = role === "subscriber" || role === "admin";

    if (!hasRoleAccess) {
      // Check for a valid web purchase directly — cannot call api.guidePurchases.hasWebAccess
      // from within a query, so we duplicate the filter logic inline.
      const purchases = await ctx.db
        .query("guidePurchases")
        .withIndex("by_user_guide", (q) =>
          q.eq("userId", identity.subject).eq("guideSlug", args.guideSlug)
        )
        .collect();

      const validStatuses = new Set(["paid", "pdf_ready", "pdf_generating"]);
      const hasPurchase = purchases.some(
        (p) => p.accessType === "web" && validStatuses.has(p.status)
      );

      if (!hasPurchase) {
        return null;
      }
    }

    // Fetch the stored premium content
    const record = await ctx.db
      .query("premiumGuideContent")
      .withIndex("by_guideSlug", (q) => q.eq("guideSlug", args.guideSlug))
      .unique();

    if (!record) {
      return null;
    }

    return {
      htmlContent: record.htmlContent,
      version: record.version,
    };
  },
});

export const upsertContent = internalMutation({
  args: {
    guideSlug: v.string(),
    htmlContent: v.string(),
    version: v.string(),
    generatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("premiumGuideContent")
      .withIndex("by_guideSlug", (q) => q.eq("guideSlug", args.guideSlug))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        htmlContent: args.htmlContent,
        version: args.version,
        generatedAt: args.generatedAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("premiumGuideContent", {
        guideSlug: args.guideSlug,
        htmlContent: args.htmlContent,
        version: args.version,
        generatedAt: args.generatedAt,
        updatedAt: now,
      });
    }
  },
});
