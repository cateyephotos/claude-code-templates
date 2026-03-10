/**
 * admin-metrics.js — Data fetching layer for admin dashboard
 *
 * Wraps Convex queries with caching, date range management,
 * and data transformation for Chart.js consumption.
 */
(function () {
  "use strict";

  // ── Date Range Helpers ──────────────────────────────────────
  const RANGES = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    "365d": 365 * 24 * 60 * 60 * 1000,
  };

  let currentRange = "30d";

  function getDateRange(range) {
    const r = range || currentRange;
    const now = Date.now();
    const ms = RANGES[r] || RANGES["30d"];
    return { startTime: now - ms, endTime: now };
  }

  function setRange(range) {
    if (RANGES[range]) {
      currentRange = range;
    }
  }

  function getRange() {
    return currentRange;
  }

  // ── Cache Layer ─────────────────────────────────────────────
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) {
      return entry.data;
    }
    cache.delete(key);
    return null;
  }

  function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
  }

  function clearCache() {
    cache.clear();
  }

  // ── Convex Query Wrapper ────────────────────────────────────
  async function convexQuery(functionPath, args) {
    if (!window.SupplementDB) {
      throw new Error("Convex client not initialized");
    }
    return window.SupplementDB.query(functionPath, args || {});
  }

  // ── Overview Stats ──────────────────────────────────────────
  async function fetchOverviewStats(range) {
    const cacheKey = `overview_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getOverviewStats", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Active Users (DAU/WAU/MAU) ──────────────────────────────
  async function fetchActiveUsers(range) {
    const cacheKey = `activeUsers_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getActiveUsers", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Page View Trends ────────────────────────────────────────
  async function fetchPageViewTrends(range, granularity) {
    const gran = granularity || "day";
    const cacheKey = `pvTrends_${range || currentRange}_${gran}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getPageViewTrends", {
      startTime,
      endTime,
      granularity: gran,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Page Views by Type ──────────────────────────────────────
  async function fetchPageViewsByType(range) {
    const cacheKey = `pvByType_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getPageViewsByType", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Session Duration ────────────────────────────────────────
  async function fetchAvgSessionDuration(range) {
    const cacheKey = `sessionDur_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getAvgSessionDuration", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Traffic Sources ─────────────────────────────────────────
  async function fetchTrafficSources(range) {
    const cacheKey = `traffic_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getTrafficSources", {
      startTime,
      endTime,
      limit: 10,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Activity Heatmap ────────────────────────────────────────
  async function fetchActivityHeatmap(range) {
    const cacheKey = `heatmap_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getActivityHeatmap", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Top Supplements ─────────────────────────────────────────
  async function fetchTopSupplements(range, limit) {
    const lim = limit || 20;
    const cacheKey = `topSupps_${range || currentRange}_${lim}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getTopSupplements", {
      startTime,
      endTime,
      limit: lim,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Top Searches ────────────────────────────────────────────
  async function fetchTopSearches(range, limit) {
    const lim = limit || 20;
    const cacheKey = `topSearches_${range || currentRange}_${lim}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getTopSearches", {
      startTime,
      endTime,
      limit: lim,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Guide Engagement ────────────────────────────────────────
  async function fetchGuideEngagement(range) {
    const cacheKey = `guideEngage_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getGuideEngagement", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Gate Stats ──────────────────────────────────────────────
  async function fetchGateStats(range) {
    const cacheKey = `gateStats_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("analytics:getGateStats", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Conversion Funnel ───────────────────────────────────────
  async function fetchConversionFunnel(range) {
    const cacheKey = `funnel_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("metrics:getConversionFunnel", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Subscription Metrics ────────────────────────────────────
  async function fetchSubscriptionMetrics() {
    const cacheKey = "subMetrics";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await convexQuery("subscriptions:getSubscriptionMetrics", {});
    setCache(cacheKey, data);
    return data;
  }

  // ── Subscription Growth ─────────────────────────────────────
  async function fetchSubscriptionGrowth(range) {
    const cacheKey = `subGrowth_${range || currentRange}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const { startTime, endTime } = getDateRange(range);
    const data = await convexQuery("subscriptions:getSubscriptionGrowth", {
      startTime,
      endTime,
    });
    setCache(cacheKey, data);
    return data;
  }

  // ── Subscriptions by Plan ───────────────────────────────────
  async function fetchSubscriptionsByPlan() {
    const cacheKey = "subsByPlan";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await convexQuery(
      "subscriptions:getSubscriptionsByPlan",
      {}
    );
    setCache(cacheKey, data);
    return data;
  }

  // ── Recent Page Views (Activity Log) ────────────────────────
  async function fetchRecentActivity(limit) {
    const lim = limit || 50;
    // No caching for real-time activity
    return convexQuery("analytics:getRecentPageViews", { limit: lim });
  }

  // ── User Stats ──────────────────────────────────────────────
  async function fetchUserCountByRole() {
    const cacheKey = "usersByRole";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await convexQuery("users:getUserCountByRole", {});
    setCache(cacheKey, data);
    return data;
  }

  // ── Bulk Data Fetch ─────────────────────────────────────────
  async function fetchAllDashboardData(range) {
    const r = range || currentRange;
    const results = await Promise.allSettled([
      fetchOverviewStats(r),
      fetchActiveUsers(r),
      fetchSubscriptionMetrics(),
      fetchTopSupplements(r, 10),
      fetchTopSearches(r, 10),
      fetchConversionFunnel(r),
    ]);

    return {
      overview: results[0].status === "fulfilled" ? results[0].value : null,
      activeUsers:
        results[1].status === "fulfilled" ? results[1].value : null,
      subscriptions:
        results[2].status === "fulfilled" ? results[2].value : null,
      topSupplements:
        results[3].status === "fulfilled" ? results[3].value : null,
      topSearches:
        results[4].status === "fulfilled" ? results[4].value : null,
      funnel: results[5].status === "fulfilled" ? results[5].value : null,
    };
  }

  // ── Formatting Helpers ──────────────────────────────────────
  function formatNumber(n) {
    if (n == null) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toLocaleString();
  }

  function formatDuration(ms) {
    if (!ms || ms <= 0) return "0s";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return seconds + "s";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return minutes + "m " + secs + "s";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours + "h " + mins + "m";
  }

  function formatCurrency(amount) {
    if (amount == null) return "$0.00";
    return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatPercent(value) {
    if (value == null) return "0%";
    return value.toFixed(1) + "%";
  }

  function formatDate(timestamp) {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function timeAgo(timestamp) {
    if (!timestamp) return "—";
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return seconds + "s ago";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    return days + "d ago";
  }

  // ── Public API ──────────────────────────────────────────────
  window.AdminMetrics = {
    // Range management
    setRange,
    getRange,
    getDateRange,
    clearCache,

    // Data fetchers
    fetchOverviewStats,
    fetchActiveUsers,
    fetchPageViewTrends,
    fetchPageViewsByType,
    fetchAvgSessionDuration,
    fetchTrafficSources,
    fetchActivityHeatmap,
    fetchTopSupplements,
    fetchTopSearches,
    fetchGuideEngagement,
    fetchGateStats,
    fetchConversionFunnel,
    fetchSubscriptionMetrics,
    fetchSubscriptionGrowth,
    fetchSubscriptionsByPlan,
    fetchRecentActivity,
    fetchUserCountByRole,
    fetchAllDashboardData,

    // Formatters
    formatNumber,
    formatDuration,
    formatCurrency,
    formatPercent,
    formatDate,
    timeAgo,

    // Constants
    RANGES,
  };
})();
