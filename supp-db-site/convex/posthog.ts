import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * posthog.ts — Server-side PostHog API Integration
 *
 * Convex actions that call the PostHog Query API (HogQL) with a
 * personal API key stored in Convex environment variables.
 * Results are cached server-side for 15 minutes to reduce API load.
 *
 * Uses the /api/projects/{id}/query/ endpoint (v2) — the legacy
 * /insights/trend/ and /insights/funnel/ endpoints were deprecated
 * by PostHog in 2025.
 *
 * Required env vars (set in Convex dashboard with --prod flag):
 *   POSTHOG_API_KEY      — Personal API key (phx_...)
 *   POSTHOG_PROJECT_ID   — PostHog project numeric ID
 *   POSTHOG_HOST         — PostHog host (defaults to https://us.posthog.com)
 */

// ── In-memory server cache ──────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, ts: Date.now() });
}

// ── PostHog API helper ──────────────────────────────────────────
async function posthogRequest(
  host: string,
  path: string,
  apiKey: string,
  options: { method?: string; body?: any } = {}
): Promise<any> {
  const url = `${host}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `PostHog API error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

function getConfig(): { host: string; apiKey: string; projectId: string } {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST || "https://us.posthog.com";

  if (!apiKey || !projectId) {
    throw new Error(
      "PostHog API not configured. Set POSTHOG_API_KEY and POSTHOG_PROJECT_ID in Convex environment variables."
    );
  }

  return { host, apiKey, projectId };
}

/**
 * Run a HogQL query via the PostHog Query API.
 * Returns { columns: string[], results: any[][] }
 */
async function hogqlQuery(
  host: string,
  projectId: string,
  apiKey: string,
  select: string[],
  from: string,
  where: string,
  groupBy?: string[],
  orderBy?: string[],
  limit?: number
): Promise<{ columns: string[]; results: any[][] }> {
  const parts = [`SELECT ${select.join(", ")}`, `FROM ${from}`, `WHERE ${where}`];
  if (groupBy && groupBy.length > 0) parts.push(`GROUP BY ${groupBy.join(", ")}`);
  if (orderBy && orderBy.length > 0) parts.push(`ORDER BY ${orderBy.join(", ")}`);
  if (limit) parts.push(`LIMIT ${limit}`);

  const data = await posthogRequest(
    host,
    `/api/projects/${projectId}/query/`,
    apiKey,
    {
      method: "POST",
      body: {
        query: {
          kind: "HogQLQuery",
          query: parts.join(" "),
        },
      },
    }
  );

  return { columns: data.columns || [], results: data.results || [] };
}

// ── Event Counts ────────────────────────────────────────────────
/**
 * Fetch event counts from PostHog for specific events over a date range.
 */
export const fetchEventCounts = action({
  args: {
    events: v.array(v.string()),
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `eventCounts_${args.events.join(",")}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    const results: Record<string, number> = {};

    for (const eventName of args.events) {
      try {
        const data = await hogqlQuery(
          host, projectId, apiKey,
          ["count()"],
          "events",
          `event = '${eventName}' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`
        );
        results[eventName] = data.results?.[0]?.[0] ?? 0;
      } catch (err) {
        console.warn(`PostHog: Failed to fetch count for ${eventName}:`, err);
        results[eventName] = 0;
      }
    }

    setCache(cacheKey, results);
    return results;
  },
});

// ── Unique Users ────────────────────────────────────────────────
/**
 * Fetch unique user count from PostHog.
 */
export const fetchUniqueUsers = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    event: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const eventName = args.event || "$pageview";
    const cacheKey = `uniqueUsers_${eventName}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["count(DISTINCT person_id)"],
        "events",
        `event = '${eventName}' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`
      );

      const uniqueCount = data.results?.[0]?.[0] ?? 0;
      const result = { count: uniqueCount, event: eventName };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("PostHog: Failed to fetch unique users:", err);
      return { count: 0, event: eventName };
    }
  },
});

// ── Top Pages ───────────────────────────────────────────────────
/**
 * Fetch top viewed pages from PostHog.
 */
export const fetchTopPages = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `topPages_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["properties.$current_url", "count()"],
        "events",
        `event = '$pageview' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`,
        ["properties.$current_url"],
        ["count() DESC"],
        limit
      );

      const pages = (data.results || []).map((row: any[]) => ({
        url: row[0] || "Unknown",
        count: row[1] || 0,
      }));

      setCache(cacheKey, pages);
      return pages;
    } catch (err) {
      console.error("PostHog: Failed to fetch top pages:", err);
      return [];
    }
  },
});

// ── Retention ───────────────────────────────────────────────────
/**
 * Fetch user retention cohort data from PostHog.
 */
export const fetchRetention = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    retentionType: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const retType = args.retentionType || "retention_first_time";
    const cacheKey = `retention_${retType}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/query/`,
        apiKey,
        {
          method: "POST",
          body: {
            query: {
              kind: "RetentionQuery",
              dateRange: {
                date_from: args.dateFrom,
                date_to: args.dateTo,
              },
              retentionFilter: {
                retentionType: retType,
                totalIntervals: 7,
                period: "Day",
                targetEntity: { id: "$pageview", type: "events" },
                returningEntity: { id: "$pageview", type: "events" },
              },
            },
          },
        }
      );

      const result = {
        cohorts: data?.results || data?.result || [],
        retention_type: retType,
        date_from: args.dateFrom,
        date_to: args.dateTo,
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("PostHog: Failed to fetch retention:", err);
      return { cohorts: [], retention_type: retType };
    }
  },
});

// ── Funnel ──────────────────────────────────────────────────────
/**
 * Fetch funnel conversion data from PostHog.
 */
export const fetchFunnel = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    steps: v.optional(
      v.array(
        v.object({
          eventName: v.string(),
          label: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (_ctx, args) => {
    const steps = args.steps || [
      { eventName: "$pageview", label: "Page View" },
      { eventName: "guide_opened", label: "Guide Opened" },
      { eventName: "guide_gate_shown", label: "Gate Shown" },
      { eventName: "auth_completed", label: "Signed Up" },
    ];

    const cacheKey = `funnel_${steps.map((s) => s.eventName).join(",")}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/query/`,
        apiKey,
        {
          method: "POST",
          body: {
            query: {
              kind: "FunnelsQuery",
              dateRange: {
                date_from: args.dateFrom,
                date_to: args.dateTo,
              },
              series: steps.map((step) => ({
                event: step.eventName,
                kind: "EventsNode",
                name: step.label || step.eventName,
              })),
              funnelsFilter: {
                funnelVizType: "steps",
                funnelWindowIntervalUnit: "day",
                funnelWindowInterval: 14,
              },
            },
          },
        }
      );

      const rawSteps = data?.results || data?.result || [];
      const funnelSteps = rawSteps.map(
        (step: any, idx: number) => ({
          label: steps[idx]?.label || step.name || `Step ${idx + 1}`,
          event: steps[idx]?.eventName || step.action_id,
          count: step.count || 0,
          conversionRate:
            idx === 0
              ? 100
              : step.count && rawSteps[0]?.count
                ? Math.round(
                    (step.count / rawSteps[0].count) * 100 * 10
                  ) / 10
                : 0,
          dropoff: idx > 0 ? (rawSteps[idx - 1]?.count || 0) - (step.count || 0) : 0,
        })
      );

      const result = {
        steps: funnelSteps,
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
        conversionRate:
          funnelSteps.length > 1
            ? funnelSteps[funnelSteps.length - 1].conversionRate
            : 0,
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("PostHog: Failed to fetch funnel:", err);
      return {
        steps: steps.map((s, idx) => ({
          label: s.label || s.eventName,
          event: s.eventName,
          count: 0,
          conversionRate: idx === 0 ? 100 : 0,
          dropoff: 0,
        })),
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
        conversionRate: 0,
      };
    }
  },
});

// ── Browser Distribution ────────────────────────────────────────
/**
 * Fetch browser breakdown from PostHog.
 */
export const fetchBrowserDistribution = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `browsers_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["properties.$browser", "count(DISTINCT person_id)"],
        "events",
        `event = '$pageview' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`,
        ["properties.$browser"],
        ["count(DISTINCT person_id) DESC"],
        10
      );

      const browsers = (data.results || [])
        .map((row: any[]) => ({
          browser: row[0] || "Unknown",
          users: row[1] || 0,
        }))
        .filter((b: any) => b.browser && b.browser !== "Unknown");

      setCache(cacheKey, browsers);
      return browsers;
    } catch (err) {
      console.error("PostHog: Failed to fetch browser distribution:", err);
      return [];
    }
  },
});

// ── Device Type Distribution ────────────────────────────────────
/**
 * Fetch device type breakdown (Desktop/Mobile/Tablet) from PostHog.
 */
export const fetchDeviceTypes = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `devices_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["properties.$device_type", "count(DISTINCT person_id)"],
        "events",
        `event = '$pageview' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`,
        ["properties.$device_type"],
        ["count(DISTINCT person_id) DESC"]
      );

      const devices = (data.results || []).map((row: any[]) => ({
        type: row[0] || "Unknown",
        users: row[1] || 0,
      }));

      setCache(cacheKey, devices);
      return devices;
    } catch (err) {
      console.error("PostHog: Failed to fetch device types:", err);
      return [];
    }
  },
});

// ── Referrer Sources ────────────────────────────────────────────
/**
 * Fetch referrer source breakdown from PostHog.
 */
export const fetchReferrerSources = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 10;
    const cacheKey = `referrers_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["properties.$referring_domain", "count()"],
        "events",
        `event = '$pageview' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`,
        ["properties.$referring_domain"],
        ["count() DESC"],
        limit
      );

      const referrers = (data.results || []).map((row: any[]) => ({
        source: row[0] || "$direct",
        count: row[1] || 0,
      }));

      setCache(cacheKey, referrers);
      return referrers;
    } catch (err) {
      console.error("PostHog: Failed to fetch referrer sources:", err);
      return [];
    }
  },
});

// ── Scroll Depth by Page ─────────────────────────────────────────
/**
 * Fetch average scroll depth per page path from PostHog.
 */
export const fetchScrollDepthByPage = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `scrollDepth_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await hogqlQuery(
        host, projectId, apiKey,
        ["properties.page_path", "avg(toFloat64OrNull(properties.depth))"],
        "events",
        `event = 'scroll_depth_reached' AND timestamp >= '${args.dateFrom}' AND timestamp <= '${args.dateTo}'`,
        ["properties.page_path"],
        ["avg(toFloat64OrNull(properties.depth)) DESC"]
      );

      const pages = (data.results || [])
        .map((row: any[]) => ({
          path: row[0] || "Unknown",
          avgScrollDepth: Math.round(row[1] || 0),
        }))
        .filter((p: any) => p.path.includes("/supplements/"));

      setCache(cacheKey, pages);
      return pages;
    } catch (err) {
      console.error("PostHog: Failed to fetch scroll depth:", err);
      return [];
    }
  },
});

// ── Path Analysis ────────────────────────────────────────────────
/**
 * Fetch user path/flow analysis from PostHog.
 */
export const fetchPathAnalysis = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    startPoint: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const start = args.startPoint || "/";
    const cacheKey = `paths_${start}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/query/`,
        apiKey,
        {
          method: "POST",
          body: {
            query: {
              kind: "PathsQuery",
              dateRange: {
                date_from: args.dateFrom,
                date_to: args.dateTo,
              },
              pathsFilter: {
                includeEventTypes: ["$pageview"],
                startPoint: start,
                stepLimit: 5,
                pathGroupings: [
                  "/supplements/*",
                  "/guides/*",
                  "/categories/*",
                  "/compare/*",
                ],
              },
            },
          },
        }
      );

      const result = {
        paths: data?.results || data?.result || [],
        startPoint: start,
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("PostHog: Failed to fetch path analysis:", err);
      return {
        paths: [],
        startPoint: start,
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
      };
    }
  },
});

// ── Clear Server Cache ──────────────────────────────────────────
/**
 * Manually clear the PostHog cache. Admin-only.
 */
export const clearPostHogCache = action({
  args: {},
  handler: async () => {
    cache.clear();
    return { cleared: true, timestamp: Date.now() };
  },
});
