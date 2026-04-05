import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * ga4.ts — Google Analytics 4 Data API Integration
 *
 * Fetches session-level analytics from GA4 via the Data API v1beta.
 * Auth uses the same service-account JWT → OAuth2 flow as convex/gsc.ts.
 *
 * Required Convex env vars:
 *   GA4_PROPERTY_ID              — numeric GA4 property ID (NOT the G- measurement ID)
 *   GSC_SERVICE_ACCOUNT_JSON     — same service account as GSC; GA4 property must
 *                                  grant it Viewer access under Admin → Property Access
 *
 * API quota: 25,000 tokens/day on standard GA4 properties. Each runReport
 * call uses ~10 tokens. With 30-minute caching and 5 report types, we'd
 * consume ~2,400 tokens/day at peak refresh rate — well under quota.
 *
 * Data freshness: GA4 Data API reports are typically 24–48h stale for
 * standard properties. Real-time data requires the separate
 * runRealtimeReport endpoint (not implemented here).
 */

// ── In-memory server cache ──────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, ts: Date.now() });
}

// ── OAuth2 service account JWT ──────────────────────────────────
// Reuses the same RSA-256 JWT signing flow from gsc.ts. Scope is
// different: analytics.readonly instead of webmasters.readonly.

async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: any) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signingInput}.${sigB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`GA4 OAuth token exchange failed: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// ── GA4 Data API helper ─────────────────────────────────────────

function getConfig(): { propertyId: string; serviceAccount: any } {
  const saJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!saJson || !propertyId) {
    throw new Error(
      "GA4 not configured. Set GA4_PROPERTY_ID and GSC_SERVICE_ACCOUNT_JSON " +
        "in Convex environment variables. The service account must have " +
        "Viewer access on the GA4 property."
    );
  }

  return { propertyId, serviceAccount: JSON.parse(saJson) };
}

async function runReport(
  accessToken: string,
  propertyId: string,
  body: {
    dateRanges: Array<{ startDate: string; endDate: string }>;
    dimensions: Array<{ name: string }>;
    metrics: Array<{ name: string }>;
    limit?: number;
  }
): Promise<any> {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GA4 Data API ${response.status}: ${errText}`);
  }

  return response.json();
}

// ── Helper: parse GA4 row values ────────────────────────────────
// GA4 Data API returns { dimensionValues: [{value}], metricValues: [{value}] }
// for each row. This helper unpacks them into a flat object.

function parseRows(
  data: any,
  dimensionNames: string[],
  metricNames: string[]
): Array<Record<string, any>> {
  if (!data?.rows?.length) return [];
  return data.rows.map((row: any) => {
    const obj: Record<string, any> = {};
    dimensionNames.forEach((name, i) => {
      obj[name] = row.dimensionValues?.[i]?.value ?? "";
    });
    metricNames.forEach((name, i) => {
      const raw = row.metricValues?.[i]?.value ?? "0";
      obj[name] = raw.includes(".") ? parseFloat(raw) : parseInt(raw, 10);
    });
    return obj;
  });
}

// ═════════════════════════════════════════════════════════════════
// Actions
// ═════════════════════════════════════════════════════════════════

/**
 * Fetch sessions broken down by source/medium.
 * This is the canonical traffic-source breakdown: organic, direct,
 * referral, email, social, paid — properly classified by GA4.
 */
export const fetchSessionsByMedium = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `ga4_sessions_medium_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "bounceRate" },
        ],
        limit,
      });

      const rows = parseRows(
        data,
        ["sessionSource", "sessionMedium"],
        ["sessions", "activeUsers", "bounceRate"]
      );

      const result = {
        configured: true,
        rows: rows
          .sort((a: any, b: any) => b.sessions - a.sessions)
          .map((r: any) => ({
            source: r.sessionSource || "(direct)",
            medium: r.sessionMedium || "(none)",
            sessions: r.sessions,
            users: r.activeUsers,
            bounceRate: Math.round(r.bounceRate * 1000) / 10,
          })),
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchSessionsByMedium failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        rows: [],
        error: String(err),
      };
    }
  },
});

/**
 * Fetch landing page performance from GA4.
 */
export const fetchLandingPagePerformance = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `ga4_landing_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [{ name: "landingPagePlusQueryString" }],
        metrics: [
          { name: "sessions" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
        limit,
      });

      const rows = parseRows(
        data,
        ["landingPage"],
        ["sessions", "avgDuration", "bounceRate"]
      );

      const result = {
        configured: true,
        rows: rows
          .sort((a: any, b: any) => b.sessions - a.sessions)
          .map((r: any) => ({
            page: r.landingPage,
            sessions: r.sessions,
            avgDuration: Math.round(r.avgDuration),
            bounceRate: Math.round(r.bounceRate * 1000) / 10,
          })),
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchLandingPagePerformance failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        rows: [],
        error: String(err),
      };
    }
  },
});

/**
 * Fetch new vs returning user breakdown from GA4.
 */
export const fetchNewVsReturning = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `ga4_newret_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [{ name: "newVsReturning" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      });

      const rows = parseRows(
        data,
        ["type"],
        ["users", "sessions"]
      );

      const newRow = rows.find((r: any) => r.type === "new") || { users: 0, sessions: 0 };
      const returningRow = rows.find((r: any) => r.type === "returning") || { users: 0, sessions: 0 };

      const result = {
        configured: true,
        new: newRow.users,
        returning: returningRow.users,
        newSessions: newRow.sessions,
        returningSessions: returningRow.sessions,
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchNewVsReturning failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        new: 0,
        returning: 0,
        error: String(err),
      };
    }
  },
});

/**
 * Fetch device category breakdown (desktop/mobile/tablet) from GA4.
 */
export const fetchDeviceBreakdown = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `ga4_devices_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }, { name: "bounceRate" }],
      });

      const rows = parseRows(data, ["device"], ["sessions", "bounceRate"]);

      const result = {
        configured: true,
        rows: rows.map((r: any) => ({
          device: r.device,
          sessions: r.sessions,
          bounceRate: Math.round(r.bounceRate * 1000) / 10,
        })),
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchDeviceBreakdown failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        rows: [],
        error: String(err),
      };
    }
  },
});

/**
 * Fetch country breakdown from GA4.
 */
export const fetchCountryBreakdown = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 15;
    const cacheKey = `ga4_countries_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        limit,
      });

      const rows = parseRows(data, ["country"], ["sessions", "users"]);

      const result = {
        configured: true,
        rows: rows
          .sort((a: any, b: any) => b.sessions - a.sessions)
          .map((r: any) => ({
            country: r.country,
            sessions: r.sessions,
            users: r.users,
          })),
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchCountryBreakdown failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        rows: [],
        error: String(err),
      };
    }
  },
});

/**
 * Fetch campaign performance from GA4.
 */
export const fetchCampaignPerformance = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `ga4_campaigns_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const { propertyId, serviceAccount } = getConfig();
      const accessToken = await getAccessToken(serviceAccount);

      const data = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: args.dateFrom, endDate: args.dateTo }],
        dimensions: [
          { name: "sessionCampaignName" },
          { name: "sessionSource" },
        ],
        metrics: [{ name: "sessions" }],
        limit,
      });

      const rows = parseRows(
        data,
        ["campaign", "source"],
        ["sessions"]
      );

      const result = {
        configured: true,
        rows: rows
          .filter((r: any) => r.campaign !== "(not set)")
          .sort((a: any, b: any) => b.sessions - a.sessions)
          .map((r: any) => ({
            campaign: r.campaign,
            source: r.source,
            sessions: r.sessions,
          })),
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GA4: fetchCampaignPerformance failed:", err);
      return {
        configured: String(err).includes("not configured") ? false : true,
        rows: [],
        error: String(err),
      };
    }
  },
});

/**
 * Clear the GA4 server-side cache. Useful after setting up the
 * service account or changing the property ID.
 */
export const clearGA4Cache = action({
  args: {},
  handler: async () => {
    cache.clear();
    return { cleared: true, timestamp: Date.now() };
  },
});
