# Admin Analytics Enhancement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Search Intelligence, Activity Log upgrade, Traffic & Acquisition, Content Performance, and User Journey Mapping to the SupplementDB admin dashboard.

**Architecture:** PostHog API (via existing Convex actions) + Convex table queries + new Google Search Console integration. All new admin queries use `requireAdmin(ctx)`. Client-side `analytics-enhanced.js` captures UTM params. Chart.js renders all charts. No new npm dependencies.

**Tech Stack:** Convex (TypeScript), PostHog API, Google Search Console API, Chart.js, vanilla JS/HTML/CSS

**Spec:** `docs/superpowers/specs/2026-03-25-admin-analytics-enhancement-design.md`

**Linear Issues:** SUPP-29 (Search), SUPP-30 (Activity Log), SUPP-31 (Traffic), SUPP-32 (Content), SUPP-33 (Journeys)

---

## Chunk 1: Schema + Client-Side UTM Capture (Foundation)

These changes are required by multiple downstream tasks. Must go first.

### Task 1: Add UTM fields to Convex schema [SUPP-31]

**Files:**
- Modify: `convex/schema.ts` (lines 21-46)

- [ ] **Step 1: Add UTM optional fields to `pageViews` table**

In `convex/schema.ts`, add 5 UTM fields after the existing `userAgent` field (line 40), before the closing `)`:

```typescript
    userAgent: v.optional(v.string()),
    // UTM campaign tracking
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
  })
```

Also add a compound index for UTM queries after the existing indexes:

```typescript
    .index("by_utmSource", ["utmSource"])
```

- [ ] **Step 2: Update `recordPageView` mutation args in `convex/analytics.ts`**

In `convex/analytics.ts`, add the 5 UTM args to the `recordPageView` mutation (after `referrer` arg, line 26):

```typescript
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
```

The handler already spreads `...args` into the insert, so the new fields will be stored automatically.

- [ ] **Step 3: Verify Convex schema pushes cleanly**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Schema accepted, no validation errors (fields are optional so existing docs are compatible).

- [ ] **Step 4: Commit**

```bash
git add convex/schema.ts convex/analytics.ts
git commit -m "feat(SUPP-31): add UTM fields to pageViews schema and recordPageView mutation"
```

---

### Task 2: Capture UTM params in analytics-enhanced.js [SUPP-31]

**Files:**
- Modify: `js/analytics-enhanced.js` (lines 54-71, `enrichProperties` function)
- Modify: `js/convex-client.js` (the `recordPageView` call, around line 139)

- [ ] **Step 1: Add UTM extraction to `enrichProperties()`**

In `js/analytics-enhanced.js`, modify the `enrichProperties` function to read UTM params from the URL:

```javascript
  function enrichProperties(props) {
    const auth = window.SupplementDBAuth;
    const urlParams = new URLSearchParams(window.location.search);
    return {
      ...props,
      page_path: window.location.pathname,
      page_title: document.title,
      page_type: detectPageType(),
      is_authenticated: !!auth?.isSignedIn,
      user_role: auth?.role || "anonymous",
      session_id:
        window.SupplementDB?.getSessionId?.() ||
        sessionStorage.getItem("sdb_session_id") ||
        undefined,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timestamp: Date.now(),
      // UTM campaign tracking
      utm_source: urlParams.get("utm_source") || undefined,
      utm_medium: urlParams.get("utm_medium") || undefined,
      utm_campaign: urlParams.get("utm_campaign") || undefined,
      utm_content: urlParams.get("utm_content") || undefined,
      utm_term: urlParams.get("utm_term") || undefined,
    };
  }
```

- [ ] **Step 2: Pass UTM params to Convex `recordPageView`**

In `js/convex-client.js`, find the `recordPageView` call (around line 130-140). Add UTM fields:

```javascript
      const urlParams = new URLSearchParams(window.location.search);
      window.SupplementDB.mutation("analytics:recordPageView", {
        userId: window.SupplementDBAuth?.user?.id || undefined,
        sessionId: sessionId,
        pageType: detectPageType(),
        pagePath: window.location.pathname,
        pageTitle: document.title || undefined,
        supplementId: getSupplementId() || undefined,
        referrer: document.referrer || undefined,
        utmSource: urlParams.get("utm_source") || undefined,
        utmMedium: urlParams.get("utm_medium") || undefined,
        utmCampaign: urlParams.get("utm_campaign") || undefined,
        utmContent: urlParams.get("utm_content") || undefined,
        utmTerm: urlParams.get("utm_term") || undefined,
      });
```

- [ ] **Step 3: Verify no JS errors in browser**

Open any supplement page with `?utm_source=test&utm_campaign=demo` appended. Check browser console — no errors. Check PostHog debug (if enabled) shows `utm_source` in event properties.

- [ ] **Step 4: Commit**

```bash
git add js/analytics-enhanced.js js/convex-client.js
git commit -m "feat(SUPP-31): capture UTM params in analytics and pass to Convex"
```

---

## Chunk 2: Internal Search Analytics Backend [SUPP-29]

### Task 3: Add `getZeroResultSearches` query [SUPP-29]

**Files:**
- Modify: `convex/analytics.ts`

- [ ] **Step 1: Add `getZeroResultSearches` query**

Append to `convex/analytics.ts`, after the existing `getGateStats` query:

```typescript
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

    // Group by normalized query
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
```

- [ ] **Step 2: Add `getSearchTrend` query**

Append to `convex/analytics.ts`:

```typescript
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
```

- [ ] **Step 3: Verify queries compile**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully.

- [ ] **Step 4: Commit**

```bash
git add convex/analytics.ts
git commit -m "feat(SUPP-29): add getZeroResultSearches and getSearchTrend queries"
```

---

### Task 4: Add `getSearchConversion` action [SUPP-29]

**Files:**
- Modify: `convex/analytics.ts`

- [ ] **Step 1: Add `getSearchConversion` as a Convex action**

Add to the imports at the top of `convex/analytics.ts`:

```typescript
import { mutation, query, action } from "./_generated/server";
```

Then append the action:

```typescript
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
    // Collect both tables for the time range
    const searches = await ctx.runQuery(
      "analytics:_getSearchEventsInRange" as any,
      { startTime: args.startTime, endTime: args.endTime }
    );
    const pageViews = await ctx.runQuery(
      "analytics:_getPageViewsInRange" as any,
      { startTime: args.startTime, endTime: args.endTime }
    );

    // Build a lookup: sessionId → sorted list of pageView timestamps
    const pvBySession: Record<string, number[]> = {};
    for (const pv of pageViews) {
      if (!pvBySession[pv.sessionId]) pvBySession[pv.sessionId] = [];
      pvBySession[pv.sessionId].push(pv.timestamp);
    }

    // For each search, check if a pageView in the same session happened within 60s
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
 * Internal helper: get search events in range (used by getSearchConversion action).
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
 * Internal helper: get page views in range (used by getSearchConversion action).
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
```

- [ ] **Step 2: Verify action compiles**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully.

- [ ] **Step 3: Commit**

```bash
git add convex/analytics.ts
git commit -m "feat(SUPP-29): add getSearchConversion action with in-memory session join"
```

---

## Chunk 3: Activity Log Backend [SUPP-30]

### Task 5: Add `getActivityFeed` and `getActivitySummary` queries [SUPP-30]

**Files:**
- Modify: `convex/analytics.ts`

- [ ] **Step 1: Add `getActivityFeed` query**

Append to `convex/analytics.ts`:

```typescript
/**
 * Unified activity feed merging pageViews, searchEvents, and gateEvents — admin only.
 */
export const getActivityFeed = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    eventTypes: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 100;
    const types = args.eventTypes || ["pageview", "search", "gate"];

    const events: Array<{
      type: string;
      timestamp: number;
      sessionId: string;
      userId?: string;
      pagePath?: string;
      pageType?: string;
      pageTitle?: string;
      query?: string;
      resultCount?: number;
      eventType?: string;
      guideSlug?: string;
    }> = [];

    // Page views
    if (types.includes("pageview")) {
      const pvs = await ctx.db
        .query("pageViews")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
        )
        .order("desc")
        .take(limit);
      for (const pv of pvs) {
        events.push({
          type: "pageview",
          timestamp: pv.timestamp,
          sessionId: pv.sessionId,
          userId: pv.userId,
          pagePath: pv.pagePath,
          pageType: pv.pageType,
          pageTitle: pv.pageTitle,
        });
      }
    }

    // Search events
    if (types.includes("search")) {
      const searches = await ctx.db
        .query("searchEvents")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
        )
        .order("desc")
        .take(limit);
      for (const s of searches) {
        events.push({
          type: "search",
          timestamp: s.timestamp,
          sessionId: s.sessionId,
          userId: s.userId,
          query: s.query,
          resultCount: s.resultCount,
        });
      }
    }

    // Gate events
    if (types.includes("gate")) {
      const gates = await ctx.db
        .query("gateEvents")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
        )
        .order("desc")
        .take(limit);
      for (const g of gates) {
        events.push({
          type: "gate",
          timestamp: g.timestamp,
          sessionId: g.sessionId,
          userId: g.userId,
          eventType: g.eventType,
          guideSlug: g.guideSlug,
        });
      }
    }

    // Sort merged events by timestamp desc and limit
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, limit);
  },
});
```

- [ ] **Step 2: Add `getActivitySummary` query**

Append to `convex/analytics.ts`:

```typescript
/**
 * Summary stats for activity log header — admin only.
 */
export const getActivitySummary = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const pvs = await ctx.db
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

    const gates = await ctx.db
      .query("gateEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const uniqueSessions = new Set([
      ...pvs.map((p) => p.sessionId),
      ...searches.map((s) => s.sessionId),
      ...gates.map((g) => g.sessionId),
    ]);

    const gateImpressions = gates.filter(
      (g) => g.eventType === "impression" || g.eventType === "gate_overlay_shown"
    ).length;

    return {
      totalEvents: pvs.length + searches.length + gates.length,
      uniqueSessions: uniqueSessions.size,
      totalSearches: searches.length,
      gateImpressions,
    };
  },
});
```

- [ ] **Step 3: Verify queries compile**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully.

- [ ] **Step 4: Commit**

```bash
git add convex/analytics.ts
git commit -m "feat(SUPP-30): add getActivityFeed and getActivitySummary queries"
```

---

## Chunk 4: Traffic & Metrics Backend [SUPP-31]

### Task 6: Add UTM, bounce rate, and new-vs-returning queries [SUPP-31]

**Files:**
- Modify: `convex/metrics.ts`

- [ ] **Step 1: Add `getUTMBreakdown` query**

Append to `convex/metrics.ts`:

```typescript
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

    // Filter to views with UTM data
    const utmViews = views.filter((v) => v.utmSource);

    // Group by source + campaign
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
        conversions: g.userIds.size, // unique authenticated users = proxy for conversions
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20);
  },
});
```

- [ ] **Step 2: Add `getNewVsReturning` query**

Append to `convex/metrics.ts`:

```typescript
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

    // Group by sessionId, check if userId present
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
```

- [ ] **Step 3: Add `getBounceRate` query**

Append to `convex/metrics.ts`:

```typescript
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

    // Group by sessionId — track page count and landing page
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

    // Bounce rate by landing page
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
```

- [ ] **Step 4: Verify queries compile**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully.

- [ ] **Step 5: Commit**

```bash
git add convex/metrics.ts
git commit -m "feat(SUPP-31): add UTM breakdown, new-vs-returning, and bounce rate queries"
```

---

## Chunk 5: Content Performance + Journey Backend [SUPP-32, SUPP-33]

### Task 7: Add `getContentPerformance` query [SUPP-32]

**Files:**
- Modify: `convex/analytics.ts`

- [ ] **Step 1: Add `getContentPerformance` query**

Append to `convex/analytics.ts`:

```typescript
/**
 * Monograph performance aggregation — admin only.
 * Combines pageViews and gateEvents for each supplement page.
 */
export const getContentPerformance = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get supplement page views in range
    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    const supplementViews = views.filter((v) => v.pageType === "supplement");

    // Get gate events in range
    const gates = await ctx.db
      .query("gateEvents")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .collect();

    // Aggregate by supplement path
    const bySupp: Record<
      string,
      {
        name: string;
        views: number;
        totalDuration: number;
        withDuration: number;
        gateImpressions: number;
        gateClicks: number;
        signUps: number;
      }
    > = {};

    for (const view of supplementViews) {
      const slug = view.pagePath.split("/").pop()?.replace(".html", "") || view.pagePath;
      if (!bySupp[slug]) {
        bySupp[slug] = {
          name: view.pageTitle || slug,
          views: 0,
          totalDuration: 0,
          withDuration: 0,
          gateImpressions: 0,
          gateClicks: 0,
          signUps: 0,
        };
      }
      bySupp[slug].views++;
      if (view.duration && view.duration > 0) {
        bySupp[slug].totalDuration += view.duration;
        bySupp[slug].withDuration++;
      }
    }

    // Merge gate events (guideSlug maps to supplement slug for monographs)
    for (const gate of gates) {
      const slug = gate.guideSlug;
      if (!bySupp[slug]) continue; // Only include supplements that have page views
      if (gate.eventType === "impression" || gate.eventType === "gate_overlay_shown") {
        bySupp[slug].gateImpressions++;
      }
      if (gate.eventType === "cta_click" || gate.eventType === "gate_cta_clicked") {
        bySupp[slug].gateClicks++;
      }
      if (gate.eventType === "sign_up_completed") {
        bySupp[slug].signUps++;
      }
    }

    return Object.entries(bySupp)
      .map(([slug, data]) => ({
        slug,
        name: data.name,
        views: data.views,
        avgDuration:
          data.withDuration > 0
            ? Math.round(data.totalDuration / data.withDuration)
            : 0,
        gateImpressions: data.gateImpressions,
        gateCtr:
          data.gateImpressions > 0
            ? Math.round((data.gateClicks / data.gateImpressions) * 1000) / 10
            : 0,
        signUps: data.signUps,
      }))
      .sort((a, b) => b.views - a.views);
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add convex/analytics.ts
git commit -m "feat(SUPP-32): add getContentPerformance query"
```

---

### Task 8: Add `fetchScrollDepthByPage` PostHog action [SUPP-32]

**Files:**
- Modify: `convex/posthog.ts`

- [ ] **Step 1: Add `fetchScrollDepthByPage` action**

Append to `convex/posthog.ts`, before the `clearPostHogCache` action:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add convex/posthog.ts
git commit -m "feat(SUPP-32): add fetchScrollDepthByPage PostHog action"
```

---

### Task 9: Create `convex/journeys.ts` [SUPP-33]

**Files:**
- Create: `convex/journeys.ts`

- [ ] **Step 1: Create `convex/journeys.ts` with drop-off and exit page queries**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

/**
 * journeys.ts — Session journey analysis queries for admin dashboard.
 */

/**
 * Drop-off analysis by page type — admin only.
 * Groups sessions, identifies exit pages, and calculates continuation rates.
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

    // Group page views by session, sorted by timestamp
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

    // Sort each session's pages by timestamp
    for (const pages of Object.values(sessions)) {
      pages.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Analyze by page type
    const pageTypeStats: Record<
      string,
      { entrySessions: number; continued: number; totalPagesAfter: number }
    > = {};

    for (const pages of Object.values(sessions)) {
      // Entry page type
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

    // Group by sessionId, find last page
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

    // Count exits per page
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
```

- [ ] **Step 2: Verify file compiles**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully.

- [ ] **Step 3: Commit**

```bash
git add convex/journeys.ts
git commit -m "feat(SUPP-33): add journeys.ts with drop-off analysis and exit page queries"
```

---

### Task 10: Add `fetchPathAnalysis` PostHog action [SUPP-33]

**Files:**
- Modify: `convex/posthog.ts`

- [ ] **Step 1: Add `fetchPathAnalysis` action**

Append to `convex/posthog.ts`, before `clearPostHogCache`:

```typescript
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

      // PostHog paths returns an array of path steps
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
```

- [ ] **Step 2: Commit**

```bash
git add convex/posthog.ts
git commit -m "feat(SUPP-33): add fetchPathAnalysis PostHog action"
```

---

## Chunk 6: Google Search Console Integration [SUPP-29]

### Task 11: Create `convex/gsc.ts` [SUPP-29]

**Files:**
- Create: `convex/gsc.ts`

- [ ] **Step 1: Create `convex/gsc.ts` with JWT auth and keyword fetch**

```typescript
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

// ── Cache ──────────────────────────────────────────────────────
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

// ── JWT Signing ────────────────────────────────────────────────
/**
 * Generate a JWT signed with the service account private key,
 * then exchange it for an OAuth2 access token.
 */
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

  // Import the private key and sign
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

  // Exchange JWT for access token
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

// ── Search Keywords ────────────────────────────────────────────
/**
 * Fetch top search keywords from Google Search Console.
 */
export const fetchSearchKeywords = action({
  args: {
    dateFrom: v.string(), // YYYY-MM-DD
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
        ctr: Math.round(row.ctr * 1000) / 10, // Convert to percentage
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
```

- [ ] **Step 2: Verify file compiles**

Run: `cd supp-db-site && npx convex dev --once --typecheck=disable`
Expected: Deployed successfully (action won't execute without env vars, but should compile).

- [ ] **Step 3: Commit**

```bash
git add convex/gsc.ts
git commit -m "feat(SUPP-29): add Google Search Console integration with JWT auth"
```

---

## Chunk 7: Admin Metrics Fetcher Layer [ALL]

### Task 12: Add fetcher functions to `admin-metrics.js` [ALL]

**Files:**
- Modify: `js/admin-metrics.js`

- [ ] **Step 1: Add new fetcher functions to `admin-metrics.js`**

Add these functions inside the IIFE, before the `// ── Public API` section (around line 414):

```javascript
  // ── Zero-Result Searches ─────────────────────────────────────
  async function fetchZeroResultSearches(range, limit) {
    const lim = limit || 20;
    const cacheKey = `zeroResults_${range || currentRange}_${lim}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getZeroResultSearches", {
      startTime, endTime, limit: lim,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Search Trend ─────────────────────────────────────────────
  async function fetchSearchTrend(range, granularity) {
    const gran = granularity || "day";
    const cacheKey = `searchTrend_${range || currentRange}_${gran}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getSearchTrend", {
      startTime, endTime, granularity: gran,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Search Conversion (action, not query) ────────────────────
  async function fetchSearchConversion(range) {
    const cacheKey = `searchConversion_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    if (!window.SupplementDB) throw new Error("Convex client not initialized");
    const data = await window.SupplementDB.action("analytics:getSearchConversion", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Activity Feed ────────────────────────────────────────────
  async function fetchActivityFeed(range, eventTypes, limit) {
    // No caching — activity should be fresh
    const { startTime, endTime } = getDateRange(range);
    return convexQuery("analytics:getActivityFeed", {
      startTime, endTime, eventTypes: eventTypes || undefined, limit: limit || 100,
    });
  }

  // ── Activity Summary ─────────────────────────────────────────
  async function fetchActivitySummary(range) {
    const cacheKey = `activitySummary_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getActivitySummary", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── UTM Breakdown ────────────────────────────────────────────
  async function fetchUTMBreakdown(range) {
    const cacheKey = `utmBreakdown_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getUTMBreakdown", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── New vs Returning ─────────────────────────────────────────
  async function fetchNewVsReturning(range) {
    const cacheKey = `newVsReturning_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getNewVsReturning", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Bounce Rate ──────────────────────────────────────────────
  async function fetchBounceRate(range) {
    const cacheKey = `bounceRate_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getBounceRate", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Content Performance ──────────────────────────────────────
  async function fetchContentPerformance(range) {
    const cacheKey = `contentPerf_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getContentPerformance", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Drop-off Analysis ────────────────────────────────────────
  async function fetchDropoffAnalysis(range) {
    const cacheKey = `dropoff_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("journeys:getDropoffAnalysis", {
      startTime, endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Top Exit Pages ───────────────────────────────────────────
  async function fetchTopExitPages(range, limit) {
    const lim = limit || 15;
    const cacheKey = `exitPages_${range || currentRange}_${lim}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("journeys:getTopExitPages", {
      startTime, endTime, limit: lim,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── GSC Keywords (action) ────────────────────────────────────
  async function fetchGSCKeywords(range) {
    const cacheKey = `gscKeywords_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const dateFrom = new Date(startTime).toISOString().slice(0, 10);
    const dateTo = new Date(endTime).toISOString().slice(0, 10);
    if (!window.SupplementDB) throw new Error("Convex client not initialized");
    const data = await window.SupplementDB.action("gsc:fetchSearchKeywords", {
      dateFrom, dateTo, limit: 20,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── PostHog Path Analysis (action) ───────────────────────────
  async function fetchPathAnalysis(range, startPoint) {
    const sp = startPoint || "/";
    const cacheKey = `pathAnalysis_${range || currentRange}_${sp}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const dateFrom = new Date(startTime).toISOString().slice(0, 10);
    const dateTo = new Date(endTime).toISOString().slice(0, 10);
    if (!window.SupplementDB) throw new Error("Convex client not initialized");
    const data = await window.SupplementDB.action("posthog:fetchPathAnalysis", {
      dateFrom, dateTo, startPoint: sp,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── PostHog Scroll Depth (action) ────────────────────────────
  async function fetchScrollDepthByPage(range) {
    const cacheKey = `scrollDepth_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const dateFrom = new Date(startTime).toISOString().slice(0, 10);
    const dateTo = new Date(endTime).toISOString().slice(0, 10);
    if (!window.SupplementDB) throw new Error("Convex client not initialized");
    const data = await window.SupplementDB.action("posthog:fetchScrollDepthByPage", {
      dateFrom, dateTo,
    });
    setCache(cacheKey, data);
    return data;
  }
```

- [ ] **Step 2: Add new functions to the public API object**

In the `window.AdminMetrics = { ... }` block, add after `fetchAllDashboardData`:

```javascript
    // New analytics fetchers
    fetchZeroResultSearches,
    fetchSearchTrend,
    fetchSearchConversion,
    fetchActivityFeed,
    fetchActivitySummary,
    fetchUTMBreakdown,
    fetchNewVsReturning,
    fetchBounceRate,
    fetchContentPerformance,
    fetchDropoffAnalysis,
    fetchTopExitPages,
    fetchGSCKeywords,
    fetchPathAnalysis,
    fetchScrollDepthByPage,
```

- [ ] **Step 3: Also add "1d" to the RANGES constant**

At the top of admin-metrics.js (line 12), the `RANGES` object needs a 1D entry:

```javascript
  const RANGES = {
    "1d": 1 * 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    "365d": 365 * 24 * 60 * 60 * 1000,
  };
```

- [ ] **Step 4: Commit**

```bash
git add js/admin-metrics.js
git commit -m "feat: add all new analytics fetcher functions to admin-metrics.js"
```

---

## Chunk 8: Admin Dashboard UI — Sidebar + HTML Sections [ALL]

### Task 13: Update sidebar navigation in `admin/index.html` [ALL]

**Files:**
- Modify: `admin/index.html` (sidebar, lines 86-132)

- [ ] **Step 1: Add new sidebar navigation items**

In `admin/index.html`, locate the sidebar `<aside class="admin-sidebar">` block. After the existing Engagement/Content Quality/Business nav items, add the new sections. Replace the existing Content Quality button with the new Content button, and add Search, Traffic, Journeys sections:

After the existing `<button class="admin-nav-item" data-section="engagement">` block and before the Monitoring section, update to:

```html
            <div class="admin-nav-section">
                <div class="admin-nav-label">Metrics</div>
                <button class="admin-nav-item" data-section="engagement">
                    <i class="fas fa-users"></i>
                    <span>Engagement</span>
                </button>
                <button class="admin-nav-item" data-section="business">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Business &amp; Revenue</span>
                </button>
            </div>

            <div class="admin-nav-section">
                <div class="admin-nav-label">Intelligence</div>
                <button class="admin-nav-item" data-section="search">
                    <i class="fas fa-search-dollar"></i>
                    <span>Search Intelligence</span>
                </button>
                <button class="admin-nav-item" data-section="traffic">
                    <i class="fas fa-globe"></i>
                    <span>Traffic &amp; Acquisition</span>
                </button>
                <button class="admin-nav-item" data-section="content">
                    <i class="fas fa-chart-bar"></i>
                    <span>Content Performance</span>
                </button>
                <button class="admin-nav-item" data-section="journeys">
                    <i class="fas fa-route"></i>
                    <span>User Journeys</span>
                </button>
            </div>
```

- [ ] **Step 2: Commit sidebar changes**

```bash
git add admin/index.html
git commit -m "feat: update admin sidebar with Search, Traffic, Content, Journeys sections"
```

---

### Task 14: Add Search Intelligence HTML section [SUPP-29]

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Add Search Intelligence section HTML**

After the Business section's `</section>`, add:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: Search Intelligence                       -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-search" class="admin-section">
                <h2 class="admin-section-title">Search Intelligence</h2>

                <!-- External Keywords (GSC) -->
                <div class="admin-chart-card">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="admin-chart-title">External Keywords (Google)</h3>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-400"><i class="fas fa-clock mr-1"></i>Data delayed ~48h</span>
                            <div class="admin-pill-group" id="gsc-range-pills">
                                <button class="admin-pill active" data-range="7d">7D</button>
                                <button class="admin-pill" data-range="30d">30D</button>
                            </div>
                        </div>
                    </div>
                    <div id="gsc-keywords-table" class="overflow-x-auto">
                        <div class="admin-empty-state"><i class="fas fa-satellite-dish"></i><h3>Loading keywords&hellip;</h3></div>
                    </div>
                </div>

                <!-- Internal Search Tabs -->
                <div class="admin-chart-card mt-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="admin-chart-title">Internal Search</h3>
                        <div class="admin-pill-group" id="search-tab-pills">
                            <button class="admin-pill active" data-tab="top-queries">Top Queries</button>
                            <button class="admin-pill" data-tab="zero-results">Zero Results</button>
                            <button class="admin-pill" data-tab="conversion">Conversion</button>
                        </div>
                    </div>

                    <!-- Search Trend Chart -->
                    <div class="mb-4" style="height: 200px;">
                        <canvas id="chart-search-trend"></canvas>
                    </div>

                    <!-- Tab Panels -->
                    <div id="search-tab-top-queries" class="search-tab-panel">
                        <table class="admin-table">
                            <thead><tr><th>Query</th><th>Count</th><th>Avg Results</th><th>CTR %</th></tr></thead>
                            <tbody id="table-internal-searches"></tbody>
                        </table>
                    </div>
                    <div id="search-tab-zero-results" class="search-tab-panel" style="display:none;">
                        <table class="admin-table">
                            <thead><tr><th>Query</th><th>Count</th><th>Last Searched</th></tr></thead>
                            <tbody id="table-zero-results"></tbody>
                        </table>
                    </div>
                    <div id="search-tab-conversion" class="search-tab-panel" style="display:none;">
                        <table class="admin-table">
                            <thead><tr><th>Query</th><th>Searches</th><th>Clicks</th><th>Conversion %</th></tr></thead>
                            <tbody id="table-search-conversion"></tbody>
                        </table>
                    </div>
                </div>
            </section>
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "feat(SUPP-29): add Search Intelligence HTML section to admin dashboard"
```

---

### Task 15: Add Traffic & Acquisition HTML section [SUPP-31]

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Add Traffic & Acquisition section HTML**

After the Search section's `</section>`, add:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: Traffic & Acquisition                     -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-traffic" class="admin-section">
                <h2 class="admin-section-title">Traffic &amp; Acquisition</h2>

                <!-- Referrer Sources -->
                <div class="admin-chart-card">
                    <h3 class="admin-chart-title">Referrer Sources</h3>
                    <div style="height: 300px;"><canvas id="chart-referrer-sources"></canvas></div>
                    <table class="admin-table mt-3">
                        <thead><tr><th>Source</th><th>Visits</th><th>% of Total</th></tr></thead>
                        <tbody id="table-referrer-sources"></tbody>
                    </table>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <!-- UTM Campaigns -->
                    <div class="admin-chart-card">
                        <h3 class="admin-chart-title">UTM Campaigns</h3>
                        <div id="utm-campaigns-container">
                            <table class="admin-table">
                                <thead><tr><th>Campaign</th><th>Source</th><th>Medium</th><th>Visits</th><th>Conversions</th></tr></thead>
                                <tbody id="table-utm-campaigns"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- New vs Returning -->
                    <div class="admin-chart-card">
                        <h3 class="admin-chart-title">New vs Returning Visitors</h3>
                        <div style="height: 250px;"><canvas id="chart-new-vs-returning"></canvas></div>
                        <div id="bounce-rate-summary" class="mt-3 text-center">
                            <span class="text-sm text-gray-500">Bounce Rate: </span>
                            <span class="text-lg font-bold" id="bounce-rate-value">&mdash;</span>
                        </div>
                    </div>
                </div>

                <!-- Bounce Rate by Landing Page -->
                <div class="admin-chart-card mt-4">
                    <h3 class="admin-chart-title">Bounce Rate by Landing Page</h3>
                    <table class="admin-table">
                        <thead><tr><th>Landing Page</th><th>Sessions</th><th>Bounce Rate</th></tr></thead>
                        <tbody id="table-bounce-rate"></tbody>
                    </table>
                </div>
            </section>
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "feat(SUPP-31): add Traffic & Acquisition HTML section to admin dashboard"
```

---

### Task 16: Add Content Performance HTML section [SUPP-32]

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Replace existing Content Quality section with Content Performance**

Find and replace the existing `<section id="section-content" class="admin-section">` block with:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: Content Performance                       -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-content" class="admin-section">
                <h2 class="admin-section-title">Content Performance</h2>

                <!-- Monograph Table -->
                <div class="admin-chart-card">
                    <h3 class="admin-chart-title">Monograph Performance</h3>
                    <div class="overflow-x-auto">
                        <table class="admin-table" id="content-performance-table">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="name">Supplement <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="views">Views <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="avgDuration">Avg Time <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="avgScrollDepth">Scroll % <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="gateImpressions">Gate Imp. <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="gateCtr">Gate CTR <i class="fas fa-sort"></i></th>
                                    <th class="sortable" data-sort="signUps">Sign-ups <i class="fas fa-sort"></i></th>
                                </tr>
                            </thead>
                            <tbody id="table-content-performance"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Gate Conversion Chart -->
                <div class="admin-chart-card mt-4">
                    <h3 class="admin-chart-title">Gate Conversion by Monograph (Top 15)</h3>
                    <div style="height: 350px;"><canvas id="chart-gate-conversion"></canvas></div>
                </div>

                <!-- Content Gaps -->
                <div class="admin-chart-card mt-4">
                    <h3 class="admin-chart-title">Content Gaps <span class="text-xs font-normal text-gray-400 ml-1">(searches with no matching content)</span></h3>
                    <div id="content-gaps-list">
                        <div class="admin-empty-state"><i class="fas fa-search-minus"></i><h3>Loading&hellip;</h3></div>
                    </div>
                </div>
            </section>
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "feat(SUPP-32): replace Content Quality with Content Performance section"
```

---

### Task 17: Add User Journeys HTML section [SUPP-33]

**Files:**
- Modify: `admin/index.html`

- [ ] **Step 1: Add User Journeys section HTML**

After the Content section's `</section>`, before the Activity section, add:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: User Journeys                             -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-journeys" class="admin-section">
                <h2 class="admin-section-title">User Journeys</h2>

                <!-- Session Flow -->
                <div class="admin-chart-card">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="admin-chart-title">Session Flow</h3>
                        <select id="flow-start-point" class="admin-select">
                            <option value="/">From Homepage</option>
                            <option value="/supplements/">From Any Supplement</option>
                            <option value="/guides/">From Any Guide</option>
                        </select>
                    </div>
                    <div id="session-flow-diagram" class="session-flow-container">
                        <div class="admin-empty-state"><i class="fas fa-project-diagram"></i><h3>Loading flow&hellip;</h3></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <!-- Drop-off Analysis -->
                    <div class="admin-chart-card">
                        <h3 class="admin-chart-title">Drop-off Analysis</h3>
                        <table class="admin-table">
                            <thead><tr><th>Page Type</th><th>Entry Sessions</th><th>Continued %</th><th>Exited %</th><th>Avg Pages After</th></tr></thead>
                            <tbody id="table-dropoff"></tbody>
                        </table>
                    </div>

                    <!-- Top Exit Pages -->
                    <div class="admin-chart-card">
                        <h3 class="admin-chart-title">Top Exit Pages</h3>
                        <table class="admin-table">
                            <thead><tr><th>Page</th><th>Exit Count</th></tr></thead>
                            <tbody id="table-exit-pages"></tbody>
                        </table>
                    </div>
                </div>
            </section>
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "feat(SUPP-33): add User Journeys HTML section to admin dashboard"
```

---

### Task 18: Upgrade Activity Log section with 1D/7D + filters [SUPP-30]

**Files:**
- Modify: `admin/index.html` (Activity section, lines 474-498)

- [ ] **Step 1: Replace Activity Log section HTML**

Replace the existing `<section id="section-activity" class="admin-section">` block with:

```html
            <!-- ═══════════════════════════════════════════════════ -->
            <!-- SECTION: Activity Log (Enhanced)                   -->
            <!-- ═══════════════════════════════════════════════════ -->
            <section id="section-activity" class="admin-section">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="admin-section-title" style="margin-bottom: 0;">Activity Log</h2>
                    <div class="flex items-center space-x-3">
                        <div class="admin-pill-group" id="activity-range-pills">
                            <button class="admin-pill active" data-range="1d">1D</button>
                            <button class="admin-pill" data-range="7d">7D</button>
                        </div>
                        <button id="exportActivityBtn" class="admin-refresh-btn" title="Export to CSV">
                            <i class="fas fa-download"></i>
                            <span class="hidden sm:inline ml-1">Export CSV</span>
                        </button>
                    </div>
                </div>

                <!-- Summary Stats Bar -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div class="admin-mini-card">
                        <div class="admin-mini-label">Total Events</div>
                        <div class="admin-mini-value" id="activity-total-events">&mdash;</div>
                    </div>
                    <div class="admin-mini-card">
                        <div class="admin-mini-label">Unique Sessions</div>
                        <div class="admin-mini-value" id="activity-unique-sessions">&mdash;</div>
                    </div>
                    <div class="admin-mini-card">
                        <div class="admin-mini-label">Searches</div>
                        <div class="admin-mini-value" id="activity-searches">&mdash;</div>
                    </div>
                    <div class="admin-mini-card">
                        <div class="admin-mini-label">Gate Impressions</div>
                        <div class="admin-mini-value" id="activity-gate-impressions">&mdash;</div>
                    </div>
                </div>

                <!-- Event Type Filters -->
                <div class="flex flex-wrap gap-2 mb-4" id="activity-type-filters">
                    <button class="admin-filter-chip active" data-type="all">All</button>
                    <button class="admin-filter-chip" data-type="pageview"><i class="fas fa-eye text-blue-500 mr-1"></i>Page Views</button>
                    <button class="admin-filter-chip" data-type="search"><i class="fas fa-search text-green-500 mr-1"></i>Searches</button>
                    <button class="admin-filter-chip" data-type="gate"><i class="fas fa-lock text-orange-500 mr-1"></i>Gate Events</button>
                </div>

                <!-- Activity Feed -->
                <div class="admin-chart-card">
                    <div class="admin-activity-header">
                        <div class="flex items-center space-x-2">
                            <span class="admin-live-dot"></span>
                            <span class="text-sm font-medium text-gray-600">Events feed</span>
                        </div>
                    </div>
                    <div id="activity-list" class="admin-activity-list">
                        <div class="admin-empty-state">
                            <i class="fas fa-stream"></i>
                            <h3>Loading Activity&hellip;</h3>
                            <p>Page views and events will appear here.</p>
                        </div>
                    </div>
                </div>
            </section>
```

- [ ] **Step 2: Commit**

```bash
git add admin/index.html
git commit -m "feat(SUPP-30): upgrade Activity Log with 1D/7D pills, filter chips, summary stats"
```

---

## Chunk 9: UI Rendering JS + CSS [ALL]

### Task 19: Create `admin/admin-analytics.css` [ALL]

**Files:**
- Create: `admin/admin-analytics.css`

- [ ] **Step 1: Create styles for new admin panels**

Create `admin/admin-analytics.css` with styles for pills, filter chips, mini cards, search tabs, flow diagram, and sortable table headers. Style each new component matching the existing admin design system (refer to `admin/admin.css` for colors, border-radius, shadows).

Key classes needed:
- `.admin-pill-group`, `.admin-pill` — pill toggle buttons
- `.admin-filter-chip` — event type filter chips
- `.admin-mini-card`, `.admin-mini-label`, `.admin-mini-value` — summary stat mini cards
- `.search-tab-panel` — tab content panels
- `.session-flow-container`, `.flow-node`, `.flow-edge` — flow diagram
- `.sortable` — sortable table headers with cursor pointer
- `.seo-opportunity` — highlighted row for SEO opportunities (yellow left border)
- `.content-gap-item` — content gap list items
- `.activity-event-card` — richer activity feed cards with color-coded left border

- [ ] **Step 2: Link stylesheet in admin/index.html**

Add after the existing admin CSS link:

```html
    <link rel="stylesheet" href="/admin/admin-analytics.css">
```

- [ ] **Step 3: Commit**

```bash
git add admin/admin-analytics.css admin/index.html
git commit -m "feat: add admin-analytics.css styles for new dashboard panels"
```

---

### Task 20: Create `js/admin-analytics-panels.js` — rendering logic [ALL]

**Files:**
- Create: `js/admin-analytics-panels.js`

- [ ] **Step 1: Create the UI rendering module**

Create `js/admin-analytics-panels.js` — an IIFE that:

1. Initializes all new panel sections when admin dashboard loads
2. Wires up pill button click handlers (GSC range, activity range, search tabs)
3. Wires up filter chip click handlers (activity type filters)
4. Wires up flow start point dropdown
5. Wires up sortable table headers
6. Renders data into tables and Chart.js charts when data arrives

Key functions:
- `initSearchIntelligence()` — renders GSC table + internal search tabs
- `initActivityLog()` — renders activity feed with time grouping + summary stats
- `initTrafficAcquisition()` — renders referrer chart, UTM table, new-vs-returning donut
- `initContentPerformance()` — renders monograph table, gate conversion chart, content gaps
- `initUserJourneys()` — renders flow diagram, drop-off table, exit pages

Each init function calls the corresponding `AdminMetrics.fetch*()` function and renders the response into the DOM.

The module should be loaded after `admin-metrics.js` and expose `window.AdminAnalyticsPanels` with an `init()` method called when the admin dashboard's section navigation fires.

- [ ] **Step 2: Add script tag to admin/index.html**

Before the closing `</body>`, after the existing admin JS scripts:

```html
    <script src="/js/admin-analytics-panels.js"></script>
```

- [ ] **Step 3: Wire section navigation to init functions**

In the existing admin dashboard JS that handles `data-section` button clicks, add calls to the corresponding init functions when a new section becomes active. If the admin dashboard uses a pattern like:

```javascript
document.querySelectorAll("[data-section]").forEach(btn => {
  btn.addEventListener("click", () => { /* show section */ });
});
```

Then the init functions should fire on first activation (lazy load).

- [ ] **Step 4: Commit**

```bash
git add js/admin-analytics-panels.js admin/index.html
git commit -m "feat: add admin-analytics-panels.js rendering module for all new sections"
```

---

## Chunk 10: Integration Testing + Deploy [ALL]

### Task 21: Test all sections in browser [ALL]

**Files:** None (manual verification)

- [ ] **Step 1: Start local dev environment**

Run: `cd supp-db-site && npx convex dev` (in one terminal)
Open: `http://localhost:8080/admin` (or whatever the local dev URL is)

- [ ] **Step 2: Verify sidebar navigation**

Click each new sidebar item: Search Intelligence, Traffic & Acquisition, Content Performance, User Journeys. Verify each section loads without JS errors in the console.

- [ ] **Step 3: Verify Activity Log upgrade**

Navigate to Activity Log. Verify:
- 1D and 7D pill buttons appear and toggle
- Event type filter chips appear
- Summary stats bar shows numbers
- Events render with color-coded icons

- [ ] **Step 4: Verify internal search panels**

Navigate to Search Intelligence. Verify:
- Top Queries / Zero Results / Conversion tabs switch
- Search trend chart renders (may be empty if no search data)
- Tables populate or show empty state

- [ ] **Step 5: Verify Traffic section**

Navigate to Traffic & Acquisition. Verify:
- Referrer sources chart renders
- UTM campaigns table shows (empty if no UTM data yet)
- New vs Returning donut chart renders
- Bounce rate shows

- [ ] **Step 6: Verify Content Performance**

Navigate to Content Performance. Verify:
- Monograph table populates with supplement data
- Sortable headers work
- Gate conversion chart renders

- [ ] **Step 7: Verify User Journeys**

Navigate to User Journeys. Verify:
- Flow diagram loads (or shows empty state if PostHog paths not available)
- Drop-off table populates
- Exit pages table populates

- [ ] **Step 8: Check for console errors**

Open browser DevTools → Console. Verify zero JS errors across all sections.

---

### Task 22: Push to dev and deploy [ALL]

- [ ] **Step 1: Push all changes to dev branch**

```bash
git push origin dev
```

- [ ] **Step 2: Deploy Convex functions to prod**

```bash
cd supp-db-site && npx convex deploy --yes --typecheck=disable
```

Expected: "Deployed Convex functions to https://acoustic-chinchilla-759.convex.cloud"

- [ ] **Step 3: Merge dev to main**

```bash
git checkout main
git merge dev
git push origin main
```

- [ ] **Step 4: Deploy to Vercel production**

```bash
cd supp-db-site && vercel --prod
```

(User must be authenticated with `vercel login` first)

- [ ] **Step 5: Verify production deployment**

Navigate to the production URL → `/admin` and verify all new sections load correctly.

- [ ] **Step 6: Update Linear issues to Done**

Mark SUPP-29, SUPP-30, SUPP-31, SUPP-32, SUPP-33 as completed in Linear.
