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

async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
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
