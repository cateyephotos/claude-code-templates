# Admin Dashboard Analytics Enhancement — Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Approach:** A (PostHog-Heavy + Google Search Console)

## Overview

Enhance the SupplementDB admin dashboard with 5 new analytics capabilities: Search Intelligence, Activity Log upgrade, Traffic & Acquisition, Content Performance, and User Journey Mapping. Data sources: PostHog API (existing), Convex tables (existing), Google Search Console API (new integration).

## Architecture

### Data Flow

```
Google Search Console API ──► Convex action (gsc.ts) ──► Admin Dashboard
PostHog API ──────────────────► Convex actions (posthog.ts) ──► Admin Dashboard
Convex Tables (pageViews, searchEvents, gateEvents) ──► Convex queries ──► Admin Dashboard
Client analytics-enhanced.js ──► PostHog capture() + Convex mutations
```

### New Files

| File | Purpose |
|------|---------|
| `convex/gsc.ts` | Google Search Console API integration (Convex actions) |
| `convex/journeys.ts` | Session flow and drop-off analysis queries |
| `js/admin-analytics-panels.js` | UI rendering for new dashboard sections |
| `admin/admin-analytics.css` | Styles for new panels (charts, tables, filters) |

### Modified Files

| File | Changes |
|------|---------|
| `convex/analytics.ts` | Add `getActivityFeed`, `getZeroResultSearches`, `getSearchConversion`, `getSearchTrend`, `getContentPerformance` queries |
| `convex/metrics.ts` | Add `getUTMBreakdown`, `getNewVsReturning`, `getBounceRate` queries |
| `convex/posthog.ts` | Add `fetchPathAnalysis`, `fetchScrollDepthByPage` actions |
| `convex/schema.ts` | Add UTM fields to `pageViews` table |
| `js/analytics-enhanced.js` | Capture UTM params in `enrichProperties()` |
| `js/admin-metrics.js` | Add fetcher functions for new queries |
| `admin/index.html` | Add 4 new sidebar sections + panels |

---

## Section 1: Search Intelligence

### External Keywords (Google Search Console)

**New integration: `convex/gsc.ts`**

- Convex action `fetchSearchKeywords` calls GSC API `searchanalytics/query`
- Auth: Google service account JSON stored in Doppler (`GSC_SERVICE_ACCOUNT_JSON`) and synced to Convex env var
- Site URL stored in `GSC_SITE_URL` env var
- Server-side cache: 30 minutes (GSC data is delayed ~48h anyway)

**API call shape:**
```
POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dimensions": ["query"],
  "rowLimit": 20,
  "dimensionFilterGroups": []
}
```

**Response fields per row:** query, clicks, impressions, ctr, position

**Dashboard panel:**
- Table: Keyword, Clicks, Impressions, CTR, Avg Position, Trend (sparkline)
- Date range: 1D, 7D, 30D pill selectors
- Highlight rows where impressions > 100 but CTR < 2% (SEO opportunities)
- Note in UI: "Data delayed ~48 hours by Google"

### Internal Search (Convex)

**New queries in `convex/analytics.ts`:**

`getZeroResultSearches(startTime, endTime, limit)`
- Filter `searchEvents` where `resultCount === 0`
- Group by `query` (lowercased, trimmed)
- Return: query, count, sorted by count desc

`getSearchConversion(startTime, endTime)`
- For each search event, look for `pageViews` in same `sessionId` within 60s after search timestamp
- Return: query, searchCount, clickThroughCount, conversionRate

`getSearchTrend(startTime, endTime, granularity)`
- Count search events per day/hour bucket
- Return: [{period, count}]

**Dashboard panel:**
- Tab group: "Top Queries" | "Zero Results" | "Conversion"
- Top Queries table: Query, Count, Avg Results, Click-through %, Trend sparkline
- Zero Results table: Query, Count, Last Searched — with yellow warning icon
- Conversion table: Query, Searches, Clicks, Conversion %

---

## Section 2: Activity Log Upgrade

### Time Range Toggles

- Replace current `fetchRecentActivity(50)` with date-range-filtered query
- New query `getActivityFeed(startTime, endTime, eventTypes, limit)` in `convex/analytics.ts`
- Merges data from `pageViews`, `searchEvents`, `gateEvents` tables
- Returns typed union sorted by timestamp desc:
  ```
  { type: "pageview" | "search" | "gate" | "auth", timestamp, sessionId, userId?, ...typeSpecificFields }
  ```

**UI: Pill buttons**
- **1D** | **7D** at top of Activity section
- 1D: hourly grouping headers ("Today 2pm", "Today 11am")
- 7D: daily grouping headers ("Mon Mar 24", "Sun Mar 23")

### Event Type Filters

- Filter chips below time range: All | Page Views | Searches | Auth Events | Gate Events | Exports
- Multi-select toggle behavior
- Chips pass `eventTypes` array to `getActivityFeed`

### Richer Event Cards

Each card renders:
- Left: color-coded icon (blue=pageview, green=search, purple=auth, orange=gate, gray=export)
- Center: event description + page path + inline detail (search query, gate type, etc.)
- Right: relative timestamp ("3m ago") + user badge (anon pill vs role pill)

### Summary Stats Bar

- 4 mini cards above the feed for the selected time range:
  - Total Events | Unique Sessions | Searches | Gate Impressions
- Data from a lightweight `getActivitySummary(startTime, endTime)` query

---

## Section 3: Traffic & Acquisition

### Referrer Sources Panel

- Uses existing `posthog.ts` → `fetchReferrerSources` action
- Horizontal bar chart (Chart.js) — top 10 referring domains
- Color coding: search engines (green), social (blue), direct (gray), other (orange)
- Table below: Source, Visits, % of Total, Trend

### UTM Campaign Tracking

**Schema change in `convex/schema.ts`:**
```
pageViews: {
  ...existing fields,
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  utmContent: v.optional(v.string()),
  utmTerm: v.optional(v.string()),
}
```

**Client-side change in `analytics-enhanced.js`:**
- `enrichProperties()` reads `URLSearchParams` for `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Includes in PostHog capture properties
- Passes to Convex `recordPageView` mutation (new optional args)

**New query `getUTMBreakdown(startTime, endTime)` in `convex/metrics.ts`:**
- Groups `pageViews` by `utmSource` + `utmCampaign`
- Joins with auth events to attribute sign-ups to UTM campaigns
- Returns: campaign, source, medium, visits, conversions

**Dashboard panel:**
- Table: Campaign, Source, Medium, Visits, Conversions (sign-ups)
- Date range synced with global selector

### New vs Returning Visitors

**New query `getNewVsReturning(startTime, endTime)` in `convex/metrics.ts`:**
- Group sessions by whether `userId` is present (returning = identified, new = anonymous)
- Return: { newSessions, returningSessions, ratio, dailyBreakdown }

**New query `getBounceRate(startTime, endTime)` in `convex/metrics.ts`:**
- Sessions with only 1 page view = bounced
- Group by landing page path
- Return: { overallBounceRate, byLandingPage: [{path, sessions, bounceRate}] }

**Dashboard panel:**
- Donut chart: New vs Returning split
- Bounce rate stat card with landing page breakdown table

---

## Section 4: Content Performance

### Monograph Performance Table

**New query `getContentPerformance(startTime, endTime)` in `convex/analytics.ts`:**
- For each supplement page path, aggregate:
  - View count (from `pageViews`)
  - Avg duration (from `pageViews.duration`)
  - Gate impressions + CTA clicks (from `gateEvents`)
  - Sign-ups attributed (gate events → `sign_up_completed` in same session)
- Return sorted by views desc

**New PostHog action `fetchScrollDepthByPage(dateFrom, dateTo)` in `posthog.ts`:**
- PostHog trend query breaking down `scroll_depth_reached` by `page_path`
- Returns avg scroll depth per supplement slug

**Dashboard panel:**
- Full-width table: Supplement Name, Views, Avg Time, Avg Scroll %, Gate Impressions, Gate CTR, Sign-ups
- Sortable columns, default by Views
- 7D sparkline in Views column
- Row highlighting: green (top 10%), red (bottom 10% by engagement time)

### Gate Conversion by Monograph

- Uses existing `getGateStats` data, grouped by slug
- Bar chart (Chart.js): top 15 monographs by gate CTR
- Tooltip shows absolute numbers (impressions + clicks)

### Content Gap Detection

- Cross-references zero-result searches (from Section 1) with existing supplement page paths
- Simple list: "Users searched for X (N times) — no matching content"
- Data: join `getZeroResultSearches` results against known supplement slugs (derived from `pageViews` where `pageType === "supplement"`)

---

## Section 5: User Journey Mapping

### Session Flow Visualization

**New action `fetchPathAnalysis(dateFrom, dateTo, startPoint)` in `posthog.ts`:**
```
POST /api/projects/{projectId}/insights/path/
{
  "date_from": dateFrom,
  "date_to": dateTo,
  "include_event_types": ["$pageview"],
  "start_point": startPoint,  // e.g., "/"
  "step_limit": 5,
  "path_groupings": ["/supplements/*", "/guides/*", "/categories/*"]
}
```

**Visualization:**
- Simplified flow diagram using CSS boxes + connecting lines (no d3 dependency)
- Each node: page name + visit count
- Each edge: connection line with % label
- Top 10 most common paths shown
- Dropdown to select start point: Homepage | Any Supplement | Any Guide | Google Organic

### Drop-off Analysis

**New query `getDropoffAnalysis(startTime, endTime)` in `convex/journeys.ts`:**
- Group `pageViews` by `sessionId`
- For each session, identify page sequence and exit page
- Aggregate by page type: entry sessions, continued %, exited %
- Return: [{pageType, entrySessions, continuedPct, exitedPct, avgPagesAfter}]

**New query `getTopExitPages(startTime, endTime, limit)` in `convex/journeys.ts`:**
- Find last page in each session
- Group by path, count exits
- Return top N exit pages

**Dashboard panel:**
- Table: Page Type, Entry Sessions, Continued %, Exited %, Avg Pages After
- "Top Exit Pages" sub-table with exit count and suggestions

### Session Replay Links

- For sessions shown in the Activity Log, append a "View in PostHog" icon-link
- URL format: `https://us.posthog.com/project/{projectId}/replay/{sessionId}`
- Only rendered when PostHog project ID is available from config meta tag
- Non-functional if session recording is disabled (graceful — link just leads to empty replay page)

---

## Admin Sidebar Navigation Update

Current sidebar:
```
Dashboard: Overview
Metrics: Engagement, Content, Business
Operations: Activity Log
System: Configuration, Email
```

New sidebar:
```
Dashboard: Overview
Metrics: Engagement, Business
Search: Search Intelligence        ← NEW
Traffic: Traffic & Acquisition     ← NEW
Content: Content Performance       ← NEW (replaces old Content Quality)
Journeys: User Journeys            ← NEW
Operations: Activity Log           ← ENHANCED
System: Configuration, Email
```

---

## Environment Variables (New)

| Variable | Storage | Purpose |
|----------|---------|---------|
| `GSC_SERVICE_ACCOUNT_JSON` | Doppler prd → Convex env | Google Search Console service account credentials |
| `GSC_SITE_URL` | Doppler prd → Convex env | Site URL registered in GSC (e.g., `https://supplementdb.com`) |

---

## Dependencies

- No new npm packages (CSS-based flow diagram instead of d3-sankey)
- Google Search Console API (free, requires service account setup)
- PostHog Path Analysis API (available on current plan)
- Chart.js (already loaded in admin)

---

## Success Criteria

1. Admin can see external Google keywords driving traffic with CTR and position
2. Admin can identify zero-result internal searches (content gaps)
3. Activity log supports 1D/7D toggle with event type filters
4. UTM campaigns are tracked end-to-end with sign-up attribution
5. Monograph performance table shows engagement + gate conversion per page
6. Session flow visualization shows common user paths through the site
7. All new panels respect the global date range selector
8. All queries are admin-gated via `requireAdmin(ctx)`
