import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * gsc.ts — Google Search Console API Integration
 *
 * Fetches organic search keyword data (clicks, impressions, CTR, position).
 * Auth: service account JWT → OAuth2 access token.
 *
 * Required Convex env vars:
 *   GSC_SERVICE_ACCOUNT_JSON — single-line JSON string of service account credentials
 *   GSC_SITE_URL — site URL registered in GSC (e.g., "https://supplementdb.com")
 */

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

async function getAccessToken(
  serviceAccount: {
    client_email: string;
    private_key: string;
  },
  scope: string = "https://www.googleapis.com/auth/webmasters.readonly"
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope,
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
    throw new Error(`OAuth token exchange failed: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Fetch top search keywords from Google Search Console.
 */
export const fetchSearchKeywords = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `gsc_keywords_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const saJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
    const siteUrl = process.env.GSC_SITE_URL;

    if (!saJson || !siteUrl) {
      console.warn("GSC: Not configured (GSC_SERVICE_ACCOUNT_JSON or GSC_SITE_URL missing)");
      return { keywords: [], configured: false };
    }

    try {
      const serviceAccount = JSON.parse(saJson);
      const accessToken = await getAccessToken(serviceAccount);

      const encodedSiteUrl = encodeURIComponent(siteUrl);
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: args.dateFrom,
            endDate: args.dateTo,
            dimensions: ["query"],
            rowLimit: limit,
            dimensionFilterGroups: [],
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`GSC API ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const keywords = (data.rows || []).map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
        position: Math.round(row.position * 10) / 10,
      }));

      const result = { keywords, configured: true };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error("GSC: Failed to fetch keywords:", err);
      return { keywords: [], configured: true, error: String(err) };
    }
  },
});

// ── Shared helper for dimension-based queries ───────────────────
// All four new actions below share the same auth, cache, and error
// handling pattern. Only the `dimensions` array and field names differ.

async function gscQuery(
  dateFrom: string,
  dateTo: string,
  dimensions: string[],
  rowLimit: number
): Promise<any[]> {
  const saJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!saJson || !siteUrl) {
    throw new Error("GSC not configured");
  }

  const serviceAccount = JSON.parse(saJson);
  const accessToken = await getAccessToken(serviceAccount);
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: dateFrom,
        endDate: dateTo,
        dimensions,
        rowLimit,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GSC API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.rows || [];
}

/**
 * Fetch top landing pages from GSC.
 */
export const fetchTopPages = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 20;
    const cacheKey = `gsc_pages_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const rows = await gscQuery(args.dateFrom, args.dateTo, ["page"], limit);
      const pages = rows.map((row: any) => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
        position: Math.round(row.position * 10) / 10,
      }));
      const result = { pages, configured: true };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      const msg = String(err);
      if (msg.includes("not configured")) {
        return { pages: [], configured: false };
      }
      console.error("GSC: Failed to fetch top pages:", err);
      return { pages: [], configured: true, error: msg };
    }
  },
});

/**
 * Fetch organic traffic by country from GSC.
 */
export const fetchCountries = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 15;
    const cacheKey = `gsc_countries_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const rows = await gscQuery(args.dateFrom, args.dateTo, ["country"], limit);
      const countries = rows.map((row: any) => ({
        country: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
        position: Math.round(row.position * 10) / 10,
      }));
      const result = { countries, configured: true };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      const msg = String(err);
      if (msg.includes("not configured")) {
        return { countries: [], configured: false };
      }
      console.error("GSC: Failed to fetch countries:", err);
      return { countries: [], configured: true, error: msg };
    }
  },
});

/**
 * Fetch organic traffic by device (MOBILE / DESKTOP / TABLET) from GSC.
 */
export const fetchDevices = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (_ctx, args) => {
    const cacheKey = `gsc_devices_${args.dateFrom}_${args.dateTo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const rows = await gscQuery(args.dateFrom, args.dateTo, ["device"], 5);
      const devices = rows.map((row: any) => ({
        device: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
        position: Math.round(row.position * 10) / 10,
      }));
      const result = { devices, configured: true };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      const msg = String(err);
      if (msg.includes("not configured")) {
        return { devices: [], configured: false };
      }
      console.error("GSC: Failed to fetch devices:", err);
      return { devices: [], configured: true, error: msg };
    }
  },
});

/**
 * Fetch query-by-page matrix from GSC — the goldmine for SEO.
 * Shows which queries rank for which pages, revealing
 * cannibalization and consolidation opportunities.
 */
export const fetchQueryByPage = action({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.limit ?? 50;
    const cacheKey = `gsc_querypage_${args.dateFrom}_${args.dateTo}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const rows = await gscQuery(
        args.dateFrom,
        args.dateTo,
        ["query", "page"],
        limit
      );
      const pairs = rows.map((row: any) => ({
        query: row.keys[0],
        page: row.keys[1],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
        position: Math.round(row.position * 10) / 10,
      }));
      const result = { pairs, configured: true };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      const msg = String(err);
      if (msg.includes("not configured")) {
        return { pairs: [], configured: false };
      }
      console.error("GSC: Failed to fetch query-by-page:", err);
      return { pairs: [], configured: true, error: msg };
    }
  },
});

/**
 * Submit (or resubmit) the sitemap to Google Search Console.
 *
 * Uses the read-write "webmasters" scope (not readonly). The service account
 * must be added as a Full user in GSC Settings → Users.
 *
 * Call via CLI:
 *   npx convex run gsc:submitSitemap --prod
 *   npx convex run gsc:submitSitemap --prod '{"feedpath":"sitemap.xml"}'
 */
export const submitSitemap = action({
  args: {
    feedpath: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const feedpath = args.feedpath ?? "sitemap.xml";
    const saJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
    const siteUrl = process.env.GSC_SITE_URL;

    if (!saJson || !siteUrl) {
      throw new Error(
        "GSC not configured: GSC_SERVICE_ACCOUNT_JSON or GSC_SITE_URL missing on this deployment"
      );
    }

    const serviceAccount = JSON.parse(saJson);
    const accessToken = await getAccessToken(
      serviceAccount,
      "https://www.googleapis.com/auth/webmasters"
    );

    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const siteRoot = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
    const absoluteFeed = feedpath.startsWith("http")
      ? feedpath
      : `${siteRoot}${feedpath.replace(/^\//, "")}`;
    const encodedFeed = encodeURIComponent(absoluteFeed);

    // PUT sites/{siteUrl}/sitemaps/{feedpath} — idempotent; GSC treats
    // a second PUT as a resubmission/recrawl request.
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedFeed}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok && response.status !== 204) {
      const errBody = await response.text();
      throw new Error(
        `GSC sitemap submission failed (${response.status}): ${errBody}`
      );
    }

    // Fetch the sitemap record to return its reported status.
    const statusResponse = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const statusBody = statusResponse.ok ? await statusResponse.json() : null;

    return {
      submitted: true,
      siteUrl,
      sitemap: absoluteFeed,
      submittedAt: new Date().toISOString(),
      lastDownloaded: statusBody?.lastDownloaded ?? null,
      lastSubmitted: statusBody?.lastSubmitted ?? null,
      isPending: statusBody?.isPending ?? null,
      errors: statusBody?.errors ?? 0,
      warnings: statusBody?.warnings ?? 0,
    };
  },
});
