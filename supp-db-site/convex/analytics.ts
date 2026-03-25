import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * Record a page view event.
 * Called from the client on every page load.
 */
export const recordPageView = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
    pageType: v.union(
      v.literal("homepage"),
      v.literal("supplement"),
      v.literal("guide"),
      v.literal("comparison"),
      v.literal("category"),
      v.literal("legal"),
      v.literal("admin"),
      v.literal("other")
    ),
    pagePath: v.string(),
    pageTitle: v.optional(v.string()),
    supplementId: v.optional(v.string()),
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pageViews", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

/**
 * Update page view duration when user leaves the page.
 */
export const updatePageViewDuration = mutation({
  args: {
    pageViewId: v.id("pageViews"),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageViewId, { duration: args.duration });
  },
});

/**
 * Record a search event.
 */
export const recordSearch = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
    query: v.string(),
    filters: v.optional(v.any()),
    resultCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

/**
 * Record when a user clicks a search result.
 */
export const recordSearchClick = mutation({
  args: {
    searchEventId: v.id("searchEvents"),
    clickedResult: v.string(),
    clickedResultIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.searchEventId, {
      clickedResult: args.clickedResult,
      clickedResultIndex: args.clickedResultIndex,
    });
  },
});

/**
 * Record content gate events (impression, CTA click, etc.)
 */
export const recordGateEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
    guideSlug: v.string(),
    eventType: v.union(
      v.literal("impression"),
      v.literal("cta_click"),
      v.literal("sign_up_started"),
      v.literal("sign_up_completed"),
      v.literal("premium_content_loaded"),
      v.literal("premium_content_error"),
      v.literal("gate_overlay_shown"),
      v.literal("gate_cta_clicked")
    ),
    scrollPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gateEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// ============================================================
// Admin-only queries for dashboard
// ============================================================

/**
 * Get recent page views — admin only.
 */
export const getRecentPageViews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

/**
 * Get page views grouped by page type within a date range — admin only.
 */
export const getPageViewsByType = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const byType: Record<string, number> = {};
    for (const view of views) {
      byType[view.pageType] = (byType[view.pageType] || 0) + 1;
    }

    return byType;
  },
});

/**
 * Get top viewed supplements — admin only.
 */
export const getTopSupplements = query({
  args: {
    limit: v.optional(v.number()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let query = ctx.db.query("pageViews").withIndex("by_pageType");
    const views = await query.collect();

    // Filter to supplement pages and optionally by date range
    const supplementViews = views.filter((v) => {
      if (v.pageType !== "supplement") return false;
      if (args.startTime && v.timestamp < args.startTime) return false;
      if (args.endTime && v.timestamp > args.endTime) return false;
      return true;
    });

    // Group by supplementId
    const counts: Record<string, { count: number; name: string }> = {};
    for (const view of supplementViews) {
      const id = view.supplementId || view.pagePath;
      if (!counts[id]) {
        counts[id] = { count: 0, name: view.pageTitle || id };
      }
      counts[id].count++;
    }

    // Sort and limit
    const limit = args.limit ?? 20;
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([id, data]) => ({ supplementId: id, ...data }));
  },
});

/**
 * Get top search queries — admin only.
 */
export const getTopSearches = query({
  args: {
    limit: v.optional(v.number()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const events = await ctx.db.query("searchEvents").collect();

    // Filter by date range
    const filtered = events.filter((e) => {
      if (args.startTime && e.timestamp < args.startTime) return false;
      if (args.endTime && e.timestamp > args.endTime) return false;
      return true;
    });

    // Group by query
    const counts: Record<string, { count: number; avgResults: number }> = {};
    for (const event of filtered) {
      const q = event.query.toLowerCase().trim();
      if (!counts[q]) {
        counts[q] = { count: 0, avgResults: 0 };
      }
      counts[q].count++;
      counts[q].avgResults += event.resultCount;
    }

    // Calculate averages and sort
    const limit = args.limit ?? 20;
    return Object.entries(counts)
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResults: Math.round(data.avgResults / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
});

/**
 * Get gate event stats — admin only.
 */
export const getGateStats = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const events = await ctx.db.query("gateEvents").collect();

    const filtered = events.filter((e) => {
      if (args.startTime && e.timestamp < args.startTime) return false;
      if (args.endTime && e.timestamp > args.endTime) return false;
      return true;
    });

    const stats = {
      totalImpressions: 0,
      totalCtaClicks: 0,
      totalSignUpStarts: 0,
      totalSignUpCompletes: 0,
      byGuide: {} as Record<string, { impressions: number; clicks: number }>,
    };

    for (const event of filtered) {
      if (event.eventType === "impression") stats.totalImpressions++;
      if (event.eventType === "cta_click") stats.totalCtaClicks++;
      if (event.eventType === "sign_up_started") stats.totalSignUpStarts++;
      if (event.eventType === "sign_up_completed") stats.totalSignUpCompletes++;

      if (!stats.byGuide[event.guideSlug]) {
        stats.byGuide[event.guideSlug] = { impressions: 0, clicks: 0 };
      }
      if (event.eventType === "impression") {
        stats.byGuide[event.guideSlug].impressions++;
      }
      if (event.eventType === "cta_click") {
        stats.byGuide[event.guideSlug].clicks++;
      }
    }

    return stats;
  },
});

/**
 * Get search queries that returned zero results — admin only.
 */
export const getZeroResultSearches = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 20;

    const events = await ctx.db
      .query("searchEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const zeroResults = events.filter((e) => e.resultCount === 0);

    const grouped: Record<string, { count: number; lastSearched: number }> = {};
    for (const event of zeroResults) {
      const q = event.query.toLowerCase().trim();
      if (!grouped[q]) {
        grouped[q] = { count: 0, lastSearched: 0 };
      }
      grouped[q].count++;
      if (event.timestamp > grouped[q].lastSearched) {
        grouped[q].lastSearched = event.timestamp;
      }
    }

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
      }));
  },
});

/**
 * Get search volume trend over time — admin only.
 */
export const getSearchTrend = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    granularity: v.union(v.literal("hour"), v.literal("day")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const events = await ctx.db
      .query("searchEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const buckets: Record<string, number> = {};
    for (const event of events) {
      const d = new Date(event.timestamp);
      const key =
        args.granularity === "hour"
          ? d.toISOString().slice(0, 13)
          : d.toISOString().slice(0, 10);
      buckets[key] = (buckets[key] || 0) + 1;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period, count }));
  },
});

/**
 * Get search-to-pageview conversion rates — admin only.
 * Uses action (not query) to perform in-memory join across tables.
 */
export const getSearchConversion = action({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const searches = await ctx.runQuery(
      "analytics:_getSearchEventsInRange" as any,
      { startTime: args.startTime, endTime: args.endTime }
    );
    const pageViews = await ctx.runQuery(
      "analytics:_getPageViewsInRange" as any,
      { startTime: args.startTime, endTime: args.endTime }
    );

    const pvBySession: Record<string, number[]> = {};
    for (const pv of pageViews) {
      if (!pvBySession[pv.sessionId]) pvBySession[pv.sessionId] = [];
      pvBySession[pv.sessionId].push(pv.timestamp);
    }

    const queryStats: Record<string, { searches: number; conversions: number }> = {};
    for (const search of searches) {
      const q = search.query.toLowerCase().trim();
      if (!queryStats[q]) queryStats[q] = { searches: 0, conversions: 0 };
      queryStats[q].searches++;

      const sessionPvs = pvBySession[search.sessionId] || [];
      const hasConversion = sessionPvs.some(
        (pvTs: number) => pvTs > search.timestamp && pvTs <= search.timestamp + 60000
      );
      if (hasConversion) queryStats[q].conversions++;
    }

    return Object.entries(queryStats)
      .map(([query, stats]) => ({
        query,
        searchCount: stats.searches,
        clickThroughCount: stats.conversions,
        conversionRate:
          stats.searches > 0
            ? Math.round((stats.conversions / stats.searches) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 30);
  },
});

/**
 * Internal helper: get search events in range.
 */
export const _getSearchEventsInRange = query({
  args: { startTime: v.number(), endTime: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("searchEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();
  },
});

/**
 * Internal helper: get page views in range.
 */
export const _getPageViewsInRange = query({
  args: { startTime: v.number(), endTime: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();
  },
});
