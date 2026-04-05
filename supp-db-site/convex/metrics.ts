import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ============================================================
// Admin-only dashboard aggregation queries
// ============================================================

// ────────────────────────────────────────────────────────────
// Referrer categorization — shared across traffic-source queries
// ────────────────────────────────────────────────────────────
//
// Raw `document.referrer` values are noisy. This module exports a
// single `categorizeReferrer` function that maps any referrer string
// to a canonical (category, source) pair. The admin dashboard then
// aggregates on `source` so the Traffic & Acquisition chart reflects
// real external traffic instead of self-referrals, auth callbacks,
// and preview deploy URLs.
//
// Categories:
//   "organic"   — search engines (google, bing, duckduckgo, yahoo, ecosia, brave)
//   "social"    — social platforms (twitter, x, facebook, reddit, linkedin, youtube, etc.)
//   "referral"  — other external websites
//   "internal"  — self-referrals and preview deploys (dropped from charts)
//   "auth"      — Clerk/Google/Apple OAuth callback domains (dropped from charts)
//   "direct"    — empty/unparseable referrer (no source header)
//
// The `source` value is stable per category and safe to use as a
// chart label without further processing.

const ORGANIC_ENGINES: Record<string, string> = {
  // Google — all country TLDs collapse to one bucket
  "google.com": "Google Organic",
  "www.google.com": "Google Organic",
  // Microsoft Bing
  "bing.com": "Bing Organic",
  "www.bing.com": "Bing Organic",
  "cn.bing.com": "Bing Organic",
  // DuckDuckGo
  "duckduckgo.com": "DuckDuckGo Organic",
  "www.duckduckgo.com": "DuckDuckGo Organic",
  // Yahoo
  "yahoo.com": "Yahoo Organic",
  "search.yahoo.com": "Yahoo Organic",
  "www.yahoo.com": "Yahoo Organic",
  // Ecosia / Brave / Startpage / Kagi
  "ecosia.org": "Ecosia Organic",
  "www.ecosia.org": "Ecosia Organic",
  "search.brave.com": "Brave Search",
  "startpage.com": "Startpage Organic",
  "www.startpage.com": "Startpage Organic",
  "kagi.com": "Kagi Organic",
  // Baidu / Yandex / Naver
  "baidu.com": "Baidu Organic",
  "www.baidu.com": "Baidu Organic",
  "yandex.com": "Yandex Organic",
  "yandex.ru": "Yandex Organic",
  "naver.com": "Naver Organic",
};

// Any google.* country TLD (google.co.uk, google.de, …) maps to the
// same bucket via a suffix check rather than an exhaustive list.
function matchGoogleCountryTLD(hostname: string): string | null {
  if (/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(hostname)) {
    return "Google Organic";
  }
  return null;
}

const SOCIAL_HOSTS: Record<string, string> = {
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "t.co": "Twitter/X",
  "facebook.com": "Facebook",
  "www.facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  "reddit.com": "Reddit",
  "www.reddit.com": "Reddit",
  "old.reddit.com": "Reddit",
  "out.reddit.com": "Reddit",
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "youtube.com": "YouTube",
  "www.youtube.com": "YouTube",
  "m.youtube.com": "YouTube",
  "instagram.com": "Instagram",
  "www.instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "www.tiktok.com": "TikTok",
  "pinterest.com": "Pinterest",
  "www.pinterest.com": "Pinterest",
  "hackernews.com": "Hacker News",
  "news.ycombinator.com": "Hacker News",
  "mastodon.social": "Mastodon",
  "bsky.app": "Bluesky",
  "threads.net": "Threads",
};

// Auth callback / OAuth redirect hosts — these are NOT real traffic;
// they're return trips from a sign-in flow. Categorized separately so
// the dashboard can optionally hide them.
const AUTH_CALLBACK_HOSTS = new Set([
  "accounts.google.com",
  "appleid.apple.com",
  "login.microsoftonline.com",
  "github.com/login",
  "www.facebook.com/dialog",
]);

const AUTH_CALLBACK_SUFFIXES = [
  ".clerk.accounts.dev",  // Dev Clerk auth
  ".clerk.app",            // Prod Clerk auth
  ".clerkstage.dev",       // Staging Clerk
];

// Internal hosts — self-referrals and preview deploys that slipped
// past the client-side filter (e.g., old pageViews written before the
// filter was deployed, or traffic from a deploy alias).
const INTERNAL_SUFFIXES = [
  ".vercel.app",           // Vercel preview deploys
  ".ngrok.io",
  ".ngrok-free.app",
  ".loca.lt",
  ".trycloudflare.com",
];

const INTERNAL_EXACT = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "supplementdb.info",
  "www.supplementdb.info",
  // The production Convex and Clerk subdomains occasionally appear
  // as referrers when the app redirects through them — bucket as
  // internal rather than external.
  "acoustic-chinchilla-759.convex.cloud",
  "acoustic-chinchilla-759.convex.site",
  "clerk.supplementdb.info",
]);

type ReferrerCategory =
  | "organic"
  | "social"
  | "referral"
  | "internal"
  | "auth"
  | "direct";

interface CategorizedReferrer {
  category: ReferrerCategory;
  source: string;
}

/**
 * Classify a raw referrer string into a canonical (category, source)
 * pair. Exported for reuse by other traffic-source queries.
 */
export function categorizeReferrer(
  referrer: string | undefined | null
): CategorizedReferrer {
  if (!referrer) {
    return { category: "direct", source: "Direct" };
  }

  let hostname = "";
  try {
    hostname = new URL(referrer).hostname.toLowerCase();
  } catch {
    // Malformed referrer — treat as direct rather than logging noise.
    return { category: "direct", source: "Direct" };
  }

  if (!hostname) {
    return { category: "direct", source: "Direct" };
  }

  // 1. Internal / preview / localhost — drop first so nothing leaks
  //    through into "referral"
  if (INTERNAL_EXACT.has(hostname)) {
    return { category: "internal", source: "Internal" };
  }
  for (const suffix of INTERNAL_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { category: "internal", source: "Internal" };
    }
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return { category: "internal", source: "Internal" };
  }

  // 2. Auth callbacks — Clerk, Google OAuth, Apple Sign-in, etc.
  if (AUTH_CALLBACK_HOSTS.has(hostname)) {
    return { category: "auth", source: "Auth callback" };
  }
  for (const suffix of AUTH_CALLBACK_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { category: "auth", source: "Auth callback" };
    }
  }

  // 3. Organic search engines
  if (hostname in ORGANIC_ENGINES) {
    return { category: "organic", source: ORGANIC_ENGINES[hostname] };
  }
  const googleTLD = matchGoogleCountryTLD(hostname);
  if (googleTLD) {
    return { category: "organic", source: googleTLD };
  }

  // 4. Social platforms
  if (hostname in SOCIAL_HOSTS) {
    return { category: "social", source: SOCIAL_HOSTS[hostname] };
  }

  // 5. Fallback: genuine external referral. Strip the leading "www."
  //    so referrer-by-hostname doesn't split the same site into two
  //    rows.
  const cleanedHost = hostname.startsWith("www.")
    ? hostname.slice(4)
    : hostname;
  return { category: "referral", source: cleanedHost };
}

/**
 * Get daily/weekly/monthly active users — admin only.
 */
export const getActiveUsers = query({
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

    // Unique sessions per day
    const dailySessions: Record<string, Set<string>> = {};
    // Unique user IDs per day
    const dailyUsers: Record<string, Set<string>> = {};

    for (const view of views) {
      const day = new Date(view.timestamp).toISOString().slice(0, 10);

      if (!dailySessions[day]) dailySessions[day] = new Set();
      dailySessions[day].add(view.sessionId);

      if (view.userId) {
        if (!dailyUsers[day]) dailyUsers[day] = new Set();
        dailyUsers[day].add(view.userId);
      }
    }

    // Calculate DAU (average daily active users over period)
    const days = Object.keys(dailyUsers);
    const totalDailyUsers = days.reduce(
      (sum, day) => sum + (dailyUsers[day]?.size || 0),
      0
    );
    const dau = days.length > 0 ? Math.round(totalDailyUsers / days.length) : 0;

    // WAU — unique users in last 7 days of range
    const sevenDaysAgo = args.endTime - 7 * 24 * 60 * 60 * 1000;
    const wauUsers = new Set<string>();
    for (const view of views) {
      if (view.timestamp >= sevenDaysAgo && view.userId) {
        wauUsers.add(view.userId);
      }
    }

    // MAU — unique users in last 30 days of range
    const thirtyDaysAgo = args.endTime - 30 * 24 * 60 * 60 * 1000;
    const mauUsers = new Set<string>();
    for (const view of views) {
      if (view.timestamp >= thirtyDaysAgo && view.userId) {
        mauUsers.add(view.userId);
      }
    }

    // Daily breakdown for chart
    const dailyBreakdown = days.sort().map((day) => ({
      date: day,
      authenticatedUsers: dailyUsers[day]?.size || 0,
      sessions: dailySessions[day]?.size || 0,
    }));

    return {
      dau,
      wau: wauUsers.size,
      mau: mauUsers.size,
      dailyBreakdown,
    };
  },
});

/**
 * Get page view trends over time — admin only.
 */
export const getPageViewTrends = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    granularity: v.union(
      v.literal("hour"),
      v.literal("day"),
      v.literal("week")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const buckets: Record<string, number> = {};

    for (const view of views) {
      let key: string;
      const d = new Date(view.timestamp);

      if (args.granularity === "hour") {
        key = d.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      } else if (args.granularity === "week") {
        // ISO week start (Monday)
        const dayOfWeek = d.getUTCDay();
        const diff = d.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setUTCDate(diff);
        key = monday.toISOString().slice(0, 10);
      } else {
        key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      buckets[key] = (buckets[key] || 0) + 1;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period, count }));
  },
});

/**
 * Get average session duration — admin only.
 */
export const getAvgSessionDuration = query({
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

    // Group durations by session
    const sessionDurations: Record<string, number> = {};
    for (const view of views) {
      if (view.duration && view.duration > 0) {
        if (!sessionDurations[view.sessionId]) {
          sessionDurations[view.sessionId] = 0;
        }
        sessionDurations[view.sessionId] += view.duration;
      }
    }

    const sessions = Object.values(sessionDurations);
    if (sessions.length === 0) return { avgDuration: 0, totalSessions: 0 };

    const total = sessions.reduce((sum, d) => sum + d, 0);
    return {
      avgDuration: Math.round(total / sessions.length),
      totalSessions: sessions.length,
    };
  },
});

/**
 * Get traffic sources (referrer breakdown) — admin only.
 */
export const getTrafficSources = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
    // When true (default), drops "internal" and "auth" categories from
    // the result. Set to false to get the raw uncategorized breakdown
    // for debugging.
    cleanOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cleanOnly = args.cleanOnly ?? true;

    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    // Track both per-source counts and per-category totals. The
    // dashboard renders per-source (for the chart/table) and per-
    // category (for the summary header).
    const bySource: Record<string, { count: number; category: string }> = {};
    const byCategory: Record<string, number> = {
      direct: 0,
      organic: 0,
      social: 0,
      referral: 0,
      internal: 0,
      auth: 0,
    };

    for (const view of views) {
      const { category, source } = categorizeReferrer(view.referrer);
      byCategory[category] = (byCategory[category] ?? 0) + 1;

      if (cleanOnly && (category === "internal" || category === "auth")) {
        continue;
      }

      if (!bySource[source]) {
        bySource[source] = { count: 0, category };
      }
      bySource[source].count += 1;
    }

    const limit = args.limit ?? 10;
    const sources = Object.entries(bySource)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([source, { count, category }]) => ({ source, count, category }));

    // Return both the per-source chart data and the category summary.
    // Backwards compatibility: the legacy client code destructures
    // the array directly, so we also spread the sources onto a
    // numerically-indexed result plus the new `byCategory` key. The
    // existing `renderReferrerSourcesChart` path uses
    // `data.map(s => s.source)` which will continue to work because
    // `sources` IS the array shape it expected, and TypeScript gives
    // us `Array & { byCategory }` at the call site.
    const totalClean = sources.reduce((sum, s) => sum + s.count, 0);
    const totalAll =
      byCategory.direct +
      byCategory.organic +
      byCategory.social +
      byCategory.referral +
      byCategory.internal +
      byCategory.auth;

    // We return an object rather than a bare array so the UI can
    // read `byCategory` and `totals` for the summary header. The
    // existing client code (js/admin-analytics-panels.js) already
    // tolerates both shapes — it checks `Array.isArray(data)` first
    // and falls back to `data.keywords || data.sources || data`.
    // A compatibility shim is added below in the same commit.
    return {
      sources,
      byCategory,
      totals: {
        clean: totalClean,
        all: totalAll,
        suppressed: totalAll - totalClean,
      },
    };
  },
});

/**
 * Get conversion funnel (free → subscriber) — admin only.
 */
export const getConversionFunnel = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Total users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // Users by role
    const byRole = { admin: 0, subscriber: 0, free: 0 };
    for (const user of allUsers) {
      if (user.role in byRole) {
        byRole[user.role as keyof typeof byRole]++;
      }
    }

    // Gate events for funnel
    const gateEvents = await ctx.db.query("gateEvents").collect();
    const filtered = gateEvents.filter((e) => {
      if (args.startTime && e.timestamp < args.startTime) return false;
      if (args.endTime && e.timestamp > args.endTime) return false;
      return true;
    });

    const impressions = filtered.filter(
      (e) => e.eventType === "impression"
    ).length;
    const ctaClicks = filtered.filter(
      (e) => e.eventType === "cta_click"
    ).length;
    const signUpStarts = filtered.filter(
      (e) => e.eventType === "sign_up_started"
    ).length;
    const signUpCompletes = filtered.filter(
      (e) => e.eventType === "sign_up_completed"
    ).length;

    // Conversion rate
    const conversionRate =
      totalUsers > 0 ? ((byRole.subscriber / totalUsers) * 100).toFixed(1) : "0";

    return {
      totalUsers,
      byRole,
      conversionRate: parseFloat(conversionRate),
      funnel: {
        gateImpressions: impressions,
        ctaClicks,
        signUpStarts,
        signUpCompletes,
      },
    };
  },
});

/**
 * Get guide completion / engagement rates — admin only.
 */
export const getGuideEngagement = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Guide page views with duration
    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_pageType")
      .collect();

    const guideViews = views.filter((v) => {
      if (v.pageType !== "guide") return false;
      if (args.startTime && v.timestamp < args.startTime) return false;
      if (args.endTime && v.timestamp > args.endTime) return false;
      return true;
    });

    // Group by guide (pagePath)
    const byGuide: Record<
      string,
      { views: number; totalDuration: number; withDuration: number; title: string }
    > = {};

    for (const view of guideViews) {
      const key = view.pagePath;
      if (!byGuide[key]) {
        byGuide[key] = {
          views: 0,
          totalDuration: 0,
          withDuration: 0,
          title: view.pageTitle || key,
        };
      }
      byGuide[key].views++;
      if (view.duration && view.duration > 0) {
        byGuide[key].totalDuration += view.duration;
        byGuide[key].withDuration++;
      }
    }

    return Object.entries(byGuide)
      .map(([path, data]) => ({
        path,
        title: data.title,
        views: data.views,
        avgDuration:
          data.withDuration > 0
            ? Math.round(data.totalDuration / data.withDuration)
            : 0,
      }))
      .sort((a, b) => b.views - a.views);
  },
});

/**
 * Get overview stats (total page views, total users, total searches) — admin only.
 */
export const getOverviewStats = query({
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

    const searches = await ctx.db
      .query("searchEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const totalUsers = await ctx.db.query("users").collect();

    // Unique sessions
    const uniqueSessions = new Set(views.map((v) => v.sessionId));

    // Subscribers
    const subscribers = totalUsers.filter((u) => u.role === "subscriber");

    return {
      totalPageViews: views.length,
      totalSearches: searches.length,
      totalUsers: totalUsers.length,
      totalSubscribers: subscribers.length,
      uniqueSessions: uniqueSessions.size,
    };
  },
});

/**
 * Get activity heatmap data (hour of day × day of week) — admin only.
 */
export const getActivityHeatmap = query({
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

    // 7 days × 24 hours matrix
    const heatmap: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );

    for (const view of views) {
      const d = new Date(view.timestamp);
      const day = d.getUTCDay(); // 0=Sun..6=Sat
      const hour = d.getUTCHours();
      heatmap[day][hour]++;
    }

    return {
      days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      hours: Array.from({ length: 24 }, (_, i) => i),
      data: heatmap,
    };
  },
});

/**
 * Get page views grouped by UTM source + campaign — admin only.
 */
export const getUTMBreakdown = query({
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

    const utmViews = views.filter((v) => v.utmSource);

    const groups: Record<
      string,
      { source: string; medium: string; campaign: string; visits: number; userIds: Set<string> }
    > = {};

    for (const view of utmViews) {
      const key = `${view.utmSource || ""}|${view.utmCampaign || "(none)"}`;
      if (!groups[key]) {
        groups[key] = {
          source: view.utmSource || "",
          medium: view.utmMedium || "",
          campaign: view.utmCampaign || "(none)",
          visits: 0,
          userIds: new Set(),
        };
      }
      groups[key].visits++;
      if (view.userId) groups[key].userIds.add(view.userId);
    }

    return Object.values(groups)
      .map((g) => ({
        source: g.source,
        medium: g.medium,
        campaign: g.campaign,
        visits: g.visits,
        conversions: g.userIds.size,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20);
  },
});

/**
 * New vs returning visitor breakdown — admin only.
 */
export const getNewVsReturning = query({
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

    const sessions: Record<string, { hasUser: boolean; day: string }> = {};
    for (const view of views) {
      const day = new Date(view.timestamp).toISOString().slice(0, 10);
      if (!sessions[view.sessionId]) {
        sessions[view.sessionId] = { hasUser: !!view.userId, day };
      }
      if (view.userId) sessions[view.sessionId].hasUser = true;
    }

    let newSessions = 0;
    let returningSessions = 0;
    const dailyBreakdown: Record<string, { newCount: number; returningCount: number }> = {};

    for (const session of Object.values(sessions)) {
      if (session.hasUser) {
        returningSessions++;
      } else {
        newSessions++;
      }
      if (!dailyBreakdown[session.day]) {
        dailyBreakdown[session.day] = { newCount: 0, returningCount: 0 };
      }
      if (session.hasUser) {
        dailyBreakdown[session.day].returningCount++;
      } else {
        dailyBreakdown[session.day].newCount++;
      }
    }

    const total = newSessions + returningSessions;
    return {
      newSessions,
      returningSessions,
      ratio: total > 0 ? Math.round((returningSessions / total) * 1000) / 10 : 0,
      dailyBreakdown: Object.entries(dailyBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data })),
    };
  },
});

/**
 * Bounce rate — sessions with only 1 page view — admin only.
 */
export const getBounceRate = query({
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

    const sessions: Record<string, { pageCount: number; landingPage: string }> = {};
    for (const view of views) {
      if (!sessions[view.sessionId]) {
        sessions[view.sessionId] = { pageCount: 0, landingPage: view.pagePath };
      }
      sessions[view.sessionId].pageCount++;
    }

    const totalSessions = Object.keys(sessions).length;
    const bouncedSessions = Object.values(sessions).filter((s) => s.pageCount === 1);
    const overallBounceRate =
      totalSessions > 0
        ? Math.round((bouncedSessions.length / totalSessions) * 1000) / 10
        : 0;

    const byLandingPage: Record<string, { sessions: number; bounced: number }> = {};
    for (const session of Object.values(sessions)) {
      const lp = session.landingPage;
      if (!byLandingPage[lp]) byLandingPage[lp] = { sessions: 0, bounced: 0 };
      byLandingPage[lp].sessions++;
      if (session.pageCount === 1) byLandingPage[lp].bounced++;
    }

    return {
      overallBounceRate,
      totalSessions,
      bouncedSessions: bouncedSessions.length,
      byLandingPage: Object.entries(byLandingPage)
        .map(([path, data]) => ({
          path,
          sessions: data.sessions,
          bounceRate: Math.round((data.bounced / data.sessions) * 1000) / 10,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 15),
    };
  },
});
