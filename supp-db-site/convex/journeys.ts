import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * journeys.ts — Session journey analysis queries for admin dashboard.
 */

/**
 * Drop-off analysis by page type — admin only.
 */
export const getDropoffAnalysis = query({
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

    const sessions: Record<
      string,
      Array<{ pageType: string; pagePath: string; timestamp: number }>
    > = {};
    for (const view of views) {
      if (!sessions[view.sessionId]) sessions[view.sessionId] = [];
      sessions[view.sessionId].push({
        pageType: view.pageType,
        pagePath: view.pagePath,
        timestamp: view.timestamp,
      });
    }

    for (const pages of Object.values(sessions)) {
      pages.sort((a, b) => a.timestamp - b.timestamp);
    }

    const pageTypeStats: Record<
      string,
      { entrySessions: number; continued: number; totalPagesAfter: number }
    > = {};

    for (const pages of Object.values(sessions)) {
      const entryType = pages[0].pageType;
      if (!pageTypeStats[entryType]) {
        pageTypeStats[entryType] = { entrySessions: 0, continued: 0, totalPagesAfter: 0 };
      }
      pageTypeStats[entryType].entrySessions++;

      if (pages.length > 1) {
        pageTypeStats[entryType].continued++;
        pageTypeStats[entryType].totalPagesAfter += pages.length - 1;
      }
    }

    return Object.entries(pageTypeStats)
      .map(([pageType, stats]) => ({
        pageType,
        entrySessions: stats.entrySessions,
        continuedPct:
          stats.entrySessions > 0
            ? Math.round((stats.continued / stats.entrySessions) * 1000) / 10
            : 0,
        exitedPct:
          stats.entrySessions > 0
            ? Math.round(
                ((stats.entrySessions - stats.continued) / stats.entrySessions) * 1000
              ) / 10
            : 0,
        avgPagesAfter:
          stats.continued > 0
            ? Math.round((stats.totalPagesAfter / stats.continued) * 10) / 10
            : 0,
      }))
      .sort((a, b) => b.entrySessions - a.entrySessions);
  },
});

/**
 * Top exit pages — where users leave — admin only.
 */
export const getTopExitPages = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 15;

    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const sessions: Record<string, { pagePath: string; pageTitle: string; timestamp: number }> =
      {};
    for (const view of views) {
      if (!sessions[view.sessionId] || view.timestamp > sessions[view.sessionId].timestamp) {
        sessions[view.sessionId] = {
          pagePath: view.pagePath,
          pageTitle: view.pageTitle || view.pagePath,
          timestamp: view.timestamp,
        };
      }
    }

    const exitCounts: Record<string, { count: number; title: string }> = {};
    for (const session of Object.values(sessions)) {
      if (!exitCounts[session.pagePath]) {
        exitCounts[session.pagePath] = { count: 0, title: session.pageTitle };
      }
      exitCounts[session.pagePath].count++;
    }

    return Object.entries(exitCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([path, data]) => ({
        path,
        title: data.title,
        exitCount: data.count,
      }));
  },
});
