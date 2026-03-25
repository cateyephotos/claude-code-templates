import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * posthog.ts — Server-side PostHog API Integration
 *
 * Convex actions that call the PostHog API with a read-only key
 * stored in Convex environment variables. Results are cached
 * server-side for 15 minutes to reduce API load.
 *
 * Required env vars (set in Convex dashboard):
 *   POSTHOG_API_KEY      — Read-only project API key (phx_...)
 *   POSTHOG_PROJECT_ID   — PostHog project numeric ID
 *   POSTHOG_HOST         — PostHog host (defaults to https://us.i.posthog.com)
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
  const host = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey || !projectId) {
    throw new Error(
      "PostHog API not configured. Set POSTHOG_API_KEY and POSTHOG_PROJECT_ID in Convex environment variables."
    );
  }

  return { host, apiKey, projectId };
}

// ── Event Counts ────────────────────────────────────────────────
/**
 * Fetch event counts from PostHog for specific events over a date range.
 */
export const fetchEventCounts = action({
  args: {
    events: v.array(v.string()),
    dateFrom: v.string(), // YYYY-MM-DD
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `eventCounts_${args.events.join(",")}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    const results: Record<string, number> = {};

    // Batch queries per event
    for (const eventName of args.events) {
      try {
        const data = await posthogRequest(
          host,
          `/api/projects/${projectId}/insights/trend/`,
          apiKey,
          {
            method: "POST",
            body: {
              events: [{ id: eventName, type: "events", math: "total" }],
              date_from: args.dateFrom,
              date_to: args.dateTo,
            },
          }
        );

        // Sum up the trend data points
        const total =
          data?.result?.[0]?.aggregated_value ??
          data?.result?.[0]?.data?.reduce(
            (sum: number, val: number) => sum + val,
            0
          ) ??
          0;
        results[eventName] = total;
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
    event: v.optional(v.string()), // defaults to $pageview
  },
  handler: async (_ctx, args) => {
    const eventName = args.event || "$pageview";
    const cacheKey = `uniqueUsers_${eventName}_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { host, apiKey, projectId } = getConfig();

    try {
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              { id: eventName, type: "events", math: "dau" },
            ],
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const uniqueCount =
        data?.result?.[0]?.aggregated_value ??
        data?.result?.[0]?.data?.reduce(
          (sum: number, val: number) => sum + val,
          0
        ) ??
        0;

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
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              {
                id: "$pageview",
                type: "events",
                math: "total",
              },
            ],
            breakdown: "$current_url",
            breakdown_type: "event",
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const pages = (data?.result || [])
        .map((item: any) => ({
          url: item.breakdown_value || item.label || "Unknown",
          count:
            item.aggregated_value ??
            item.data?.reduce(
              (sum: number, val: number) => sum + val,
              0
            ) ??
            0,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, limit);

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
    retentionType: v.optional(v.string()), // "retention_first_time" or "retention_recurring"
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
        `/api/projects/${projectId}/insights/retention/`,
        apiKey,
        {
          method: "POST",
          body: {
            target_entity: {
              id: "$pageview",
              type: "events",
            },
            returning_entity: {
              id: "$pageview",
              type: "events",
            },
            retention_type: retType,
            date_from: args.dateFrom,
            date_to: args.dateTo,
            period: "Day",
            total_intervals: 7,
          },
        }
      );

      const result = {
        cohorts: data?.result || [],
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
 * Steps: landing → sign_up → subscribe
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
        `/api/projects/${projectId}/insights/funnel/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: steps.map((step) => ({
              id: step.eventName,
              type: "events",
              name: step.label || step.eventName,
            })),
            funnel_viz_type: "steps",
            date_from: args.dateFrom,
            date_to: args.dateTo,
            funnel_window_days: 14,
          },
        }
      );

      const funnelSteps = (data?.result || []).map(
        (step: any, idx: number) => ({
          label: steps[idx]?.label || step.name || `Step ${idx + 1}`,
          event: steps[idx]?.eventName || step.action_id,
          count: step.count || 0,
          conversionRate:
            idx === 0
              ? 100
              : step.count && data.result[0]?.count
                ? Math.round(
                    (step.count / data.result[0].count) * 100 * 10
                  ) / 10
                : 0,
          dropoff: step.order > 0 ? (data.result[idx - 1]?.count || 0) - (step.count || 0) : 0,
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
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              {
                id: "$pageview",
                type: "events",
                math: "dau",
              },
            ],
            breakdown: "$browser",
            breakdown_type: "event",
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const browsers = (data?.result || [])
        .map((item: any) => ({
          browser: item.breakdown_value || item.label || "Unknown",
          users:
            item.aggregated_value ??
            Math.max(...(item.data || [0])),
        }))
        .filter((b: any) => b.browser && b.browser !== "Unknown")
        .sort((a: any, b: any) => b.users - a.users)
        .slice(0, 10);

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
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              {
                id: "$pageview",
                type: "events",
                math: "dau",
              },
            ],
            breakdown: "$device_type",
            breakdown_type: "event",
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const devices = (data?.result || [])
        .map((item: any) => ({
          type: item.breakdown_value || item.label || "Unknown",
          users:
            item.aggregated_value ??
            Math.max(...(item.data || [0])),
        }))
        .sort((a: any, b: any) => b.users - a.users);

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
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              {
                id: "$pageview",
                type: "events",
                math: "total",
              },
            ],
            breakdown: "$referring_domain",
            breakdown_type: "event",
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const referrers = (data?.result || [])
        .map((item: any) => ({
          source: item.breakdown_value || item.label || "Direct",
          count:
            item.aggregated_value ??
            item.data?.reduce(
              (sum: number, val: number) => sum + val,
              0
            ) ??
            0,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, limit);

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
      const data = await posthogRequest(
        host,
        `/api/projects/${projectId}/insights/trend/`,
        apiKey,
        {
          method: "POST",
          body: {
            events: [
              {
                id: "scroll_depth_reached",
                type: "events",
                math: "avg",
                math_property: "depth",
              },
            ],
            breakdown: "page_path",
            breakdown_type: "event",
            date_from: args.dateFrom,
            date_to: args.dateTo,
          },
        }
      );

      const pages = (data?.result || [])
        .map((item: any) => ({
          path: item.breakdown_value || item.label || "Unknown",
          avgScrollDepth:
            item.aggregated_value ??
            (item.data?.length
              ? Math.round(
                  item.data.reduce((s: number, v: number) => s + v, 0) /
                    item.data.filter((v: number) => v > 0).length
                )
              : 0),
        }))
        .filter((p: any) => p.path.includes("/supplements/"))
        .sort((a: any, b: any) => b.avgScrollDepth - a.avgScrollDepth);

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
