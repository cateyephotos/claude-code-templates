/**
 * admin-dashboard.js — Chart.js rendering + UI logic for admin dashboard
 *
 * Sections: Overview, Engagement, Content Quality, Business/Revenue, Activity Log
 * Dependencies: Chart.js, admin-metrics.js, auth.js, rbac.js, convex-client.js
 */
(function () {
  "use strict";

  // ── Chart.js Defaults ───────────────────────────────────────
  const COLORS = {
    accent: "#2d5a3d",
    accentLight: "rgba(45, 90, 61, 0.15)",
    accentFaded: "rgba(45, 90, 61, 0.6)",
    blue: "#2563eb",
    blueLight: "rgba(37, 99, 235, 0.15)",
    orange: "#f59e0b",
    orangeLight: "rgba(245, 158, 11, 0.15)",
    red: "#dc2626",
    redLight: "rgba(220, 38, 38, 0.15)",
    purple: "#7c3aed",
    purpleLight: "rgba(124, 58, 237, 0.15)",
    teal: "#0d9488",
    tealLight: "rgba(13, 148, 136, 0.15)",
    gray: "#9ca3af",
    grayLight: "rgba(156, 163, 175, 0.15)",
    chartPalette: [
      "#2d5a3d", "#2563eb", "#f59e0b", "#dc2626",
      "#7c3aed", "#0d9488", "#ec4899", "#8b5cf6",
      "#06b6d4", "#84cc16",
    ],
  };

  const CHART_FONT = {
    family: "'DM Sans', sans-serif",
    size: 12,
    weight: 500,
  };

  // Track chart instances for cleanup
  const charts = {};

  // ── Chart.js Global Config ──────────────────────────────────
  function initChartDefaults() {
    if (typeof Chart === "undefined") return;

    Chart.defaults.font.family = CHART_FONT.family;
    Chart.defaults.font.size = CHART_FONT.size;
    Chart.defaults.color = "#6b7280";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = "#1a1a1a";
    Chart.defaults.plugins.tooltip.titleFont = { weight: "600" };
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.elements.line.tension = 0.3;
    Chart.defaults.elements.point.radius = 2;
    Chart.defaults.elements.point.hoverRadius = 5;
  }

  // ── Chart Helpers ───────────────────────────────────────────
  function destroyChart(id) {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  }

  function createChart(canvasId, config) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    charts[canvasId] = new Chart(ctx, config);
    return charts[canvasId];
  }

  // ── Section Navigation ──────────────────────────────────────
  let activeSection = "overview";

  function switchSection(sectionId) {
    // Update nav items
    document.querySelectorAll(".admin-nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.classList.toggle("active", section.id === `section-${sectionId}`);
    });

    activeSection = sectionId;

    // Load section data on first visit
    loadSectionData(sectionId);

    // Close mobile sidebar
    document.querySelector(".admin-sidebar")?.classList.remove("open");
  }

  // ── Date Range Switching ────────────────────────────────────
  function switchRange(range) {
    document.querySelectorAll(".admin-range-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.range === range);
    });
    AdminMetrics.setRange(range);
    AdminMetrics.clearCache();
    loadSectionData(activeSection);
  }

  // ── Refresh Handler ─────────────────────────────────────────
  async function handleRefresh() {
    const btn = document.getElementById("refreshBtn");
    if (btn) {
      btn.classList.add("loading");
    }
    AdminMetrics.clearCache();
    await loadSectionData(activeSection);
    if (btn) {
      btn.classList.remove("loading");
    }
  }

  // ── Section Data Loaders ────────────────────────────────────
  const loadedSections = new Set();

  async function loadSectionData(sectionId) {
    try {
      switch (sectionId) {
        case "overview":
          await loadOverview();
          break;
        case "engagement":
          await loadEngagement();
          break;
        case "content":
          if (window.AdminAnalyticsPanels) await AdminAnalyticsPanels.init("content");
          else await loadContentQuality();
          break;
        case "business":
          await loadBusiness();
          break;
        case "activity":
          await loadActivityLog();
          if (window.AdminAnalyticsPanels) await AdminAnalyticsPanels.init("activity");
          break;
        case "search":
          if (window.AdminAnalyticsPanels) await AdminAnalyticsPanels.init("search");
          break;
        case "traffic":
          if (window.AdminAnalyticsPanels) await AdminAnalyticsPanels.init("traffic");
          break;
        case "journeys":
          if (window.AdminAnalyticsPanels) await AdminAnalyticsPanels.init("journeys");
          break;
      }
      loadedSections.add(sectionId);
    } catch (err) {
      console.error(`Failed to load ${sectionId}:`, err);
    }
  }

  // ── Overview Section ────────────────────────────────────────
  async function loadOverview() {
    const M = AdminMetrics;
    const data = await M.fetchAllDashboardData();

    // Overview cards
    if (data.overview) {
      setCardValue("card-total-users", M.formatNumber(data.overview.totalUsers));
      setCardValue("card-total-views", M.formatNumber(data.overview.totalPageViews));
      setCardValue("card-total-searches", M.formatNumber(data.overview.totalSearches));
      setCardValue("card-total-subscribers", M.formatNumber(data.overview.totalSubscribers));
    }

    // Active users
    if (data.activeUsers) {
      setCardValue("card-dau", M.formatNumber(data.activeUsers.dau));
      setCardValue("card-wau", M.formatNumber(data.activeUsers.wau));
      setCardValue("card-mau", M.formatNumber(data.activeUsers.mau));
    }

    // Subscription metrics
    if (data.subscriptions) {
      setCardValue("card-mrr", M.formatCurrency(data.subscriptions.mrr));
      setCardValue("card-churn", M.formatPercent(data.subscriptions.churnRate));
    }

    // Top supplements mini-list
    if (data.topSupplements && data.topSupplements.length > 0) {
      const list = document.getElementById("overview-top-supplements");
      if (list) {
        list.innerHTML = data.topSupplements.slice(0, 5).map((s, i) =>
          `<div class="flex items-center justify-between py-1.5 ${i > 0 ? "border-t border-gray-100" : ""}">
            <span class="text-sm text-gray-700 truncate">${escapeHtml(s.name || s.supplementId)}</span>
            <span class="text-sm font-semibold text-gray-900 ml-2">${M.formatNumber(s.count)}</span>
          </div>`
        ).join("");
      }
    }

    // Top searches mini-list
    if (data.topSearches && data.topSearches.length > 0) {
      const list = document.getElementById("overview-top-searches");
      if (list) {
        list.innerHTML = data.topSearches.slice(0, 5).map((s, i) =>
          `<div class="flex items-center justify-between py-1.5 ${i > 0 ? "border-t border-gray-100" : ""}">
            <span class="text-sm text-gray-700 truncate">"${escapeHtml(s.query)}"</span>
            <span class="text-sm font-semibold text-gray-900 ml-2">${M.formatNumber(s.count)}</span>
          </div>`
        ).join("");
      }
    }
  }

  // ── Engagement Section ──────────────────────────────────────
  async function loadEngagement() {
    const M = AdminMetrics;

    // DAU/WAU/MAU line chart
    const activeUsers = await M.fetchActiveUsers();
    if (activeUsers && activeUsers.dailyBreakdown) {
      const labels = activeUsers.dailyBreakdown.map((d) => d.date);
      const userValues = activeUsers.dailyBreakdown.map((d) => d.authenticatedUsers);
      const sessionValues = activeUsers.dailyBreakdown.map((d) => d.sessions);

      createChart("chart-active-users", {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Authenticated Users",
              data: userValues,
              borderColor: COLORS.accent,
              backgroundColor: COLORS.accentLight,
              fill: true,
            },
            {
              label: "Sessions",
              data: sessionValues,
              borderColor: COLORS.blue,
              backgroundColor: COLORS.blueLight,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
    }

    // Page views by type (pie chart)
    const pvByType = await M.fetchPageViewsByType();
    if (pvByType) {
      const pvLabels = Object.keys(pvByType);
      const pvValues = Object.values(pvByType);

      createChart("chart-pv-by-type", {
        type: "doughnut",
        data: {
          labels: pvLabels.map(capitalize),
          datasets: [{
            data: pvValues,
            backgroundColor: COLORS.chartPalette.slice(0, pvLabels.length),
            borderWidth: 2,
            borderColor: "#ffffff",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { padding: 12 } },
          },
        },
      });
    }

    // Traffic sources bar chart
    const traffic = await M.fetchTrafficSources();
    if (traffic && traffic.length > 0) {
      createChart("chart-traffic-sources", {
        type: "bar",
        data: {
          labels: traffic.map((t) => t.source),
          datasets: [{
            label: "Page Views",
            data: traffic.map((t) => t.count),
            backgroundColor: COLORS.accentLight,
            borderColor: COLORS.accent,
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false } },
          },
        },
      });
    }

    // Session duration
    const sessionDur = await M.fetchAvgSessionDuration();
    if (sessionDur) {
      setCardValue("card-avg-session", M.formatDuration(sessionDur.avgDuration));
      setCardValue("card-total-sessions-eng", M.formatNumber(sessionDur.totalSessions));
    }

    // Activity heatmap
    const heatmap = await M.fetchActivityHeatmap();
    if (heatmap && heatmap.data) {
      renderHeatmap(heatmap);
    }
  }

  // ── Content Quality Section ─────────────────────────────────
  async function loadContentQuality() {
    const M = AdminMetrics;

    // Top supplements bar chart
    const topSupps = await M.fetchTopSupplements(null, 20);
    if (topSupps && topSupps.length > 0) {
      createChart("chart-top-supplements", {
        type: "bar",
        data: {
          labels: topSupps.map((s) => truncate(s.name || s.supplementId, 20)),
          datasets: [{
            label: "Page Views",
            data: topSupps.map((s) => s.count),
            backgroundColor: COLORS.accent,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        },
      });
    }

    // Top searches
    const topSearches = await M.fetchTopSearches(null, 20);
    if (topSearches && topSearches.length > 0) {
      const searchTable = document.getElementById("table-top-searches");
      if (searchTable) {
        searchTable.innerHTML = topSearches.map((s) =>
          `<tr>
            <td class="font-medium">"${escapeHtml(s.query)}"</td>
            <td class="text-right">${M.formatNumber(s.count)}</td>
            <td class="text-right">${s.avgResults}</td>
          </tr>`
        ).join("");
      }
    }

    // Guide engagement
    const guides = await M.fetchGuideEngagement();
    if (guides && guides.length > 0) {
      createChart("chart-guide-engagement", {
        type: "bar",
        data: {
          labels: guides.map((g) => truncate(g.title, 25)),
          datasets: [
            {
              label: "Views",
              data: guides.map((g) => g.views),
              backgroundColor: COLORS.accent,
              borderRadius: 4,
            },
            {
              label: "Avg Duration (s)",
              data: guides.map((g) => Math.round(g.avgDuration / 1000)),
              backgroundColor: COLORS.blue,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
    }

    // Gate stats
    const gateStats = await M.fetchGateStats();
    if (gateStats) {
      setCardValue("card-gate-impressions", M.formatNumber(gateStats.totalImpressions));
      setCardValue("card-gate-clicks", M.formatNumber(gateStats.totalCtaClicks));
      setCardValue("card-gate-signups", M.formatNumber(gateStats.totalSignUpCompletes));

      const gateRate = gateStats.totalImpressions > 0
        ? ((gateStats.totalCtaClicks / gateStats.totalImpressions) * 100).toFixed(1)
        : "0";
      setCardValue("card-gate-rate", gateRate + "%");
    }
  }

  // ── Business / Revenue Section ──────────────────────────────
  async function loadBusiness() {
    const M = AdminMetrics;

    // Subscription metrics
    const subMetrics = await M.fetchSubscriptionMetrics();
    if (subMetrics) {
      setCardValue("card-active-subs", M.formatNumber(subMetrics.totalActive));
      setCardValue("card-mrr-biz", M.formatCurrency(subMetrics.mrr));
      setCardValue("card-arr-biz", M.formatCurrency(subMetrics.arr));
      setCardValue("card-churn-biz", M.formatPercent(subMetrics.churnRate));
      setCardValue("card-past-due", M.formatNumber(subMetrics.totalPastDue));
      setCardValue("card-trialing", M.formatNumber(subMetrics.totalTrialing));
    }

    // Subs by plan donut
    const subsByPlan = await M.fetchSubscriptionsByPlan();
    if (subsByPlan) {
      createChart("chart-subs-by-plan", {
        type: "doughnut",
        data: {
          labels: ["Free", "Monthly", "Annual"],
          datasets: [{
            data: [subsByPlan.free || 0, subsByPlan.monthly || 0, subsByPlan.annual || 0],
            backgroundColor: [COLORS.gray, COLORS.accent, COLORS.blue],
            borderWidth: 2,
            borderColor: "#ffffff",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    // Subscription growth line chart
    const growth = await M.fetchSubscriptionGrowth();
    if (growth && growth.length > 0) {
      createChart("chart-sub-growth", {
        type: "line",
        data: {
          labels: growth.map((g) => g.month),
          datasets: [
            {
              label: "New Subscriptions",
              data: growth.map((g) => g.newSubscriptions),
              borderColor: COLORS.accent,
              backgroundColor: COLORS.accentLight,
              fill: true,
            },
            {
              label: "Cancellations",
              data: growth.map((g) => g.cancellations),
              borderColor: COLORS.red,
              backgroundColor: COLORS.redLight,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
    }

    // Conversion funnel
    const funnel = await M.fetchConversionFunnel();
    if (funnel) {
      renderConversionFunnel(funnel);
    }

    // ── Newsletter Metrics ──────────────────────────────────
    const nlStats = await M.fetchNewsletterStats();
    if (nlStats) {
      setCardValue("card-nl-total", M.formatNumber(nlStats.total));
      setCardValue("card-nl-confirmed", M.formatNumber(nlStats.confirmed));
      setCardValue("card-nl-pending", M.formatNumber(nlStats.pending));
      setCardValue("card-nl-unsubscribed", M.formatNumber(nlStats.unsubscribed));
      setCardValue("card-nl-last7", M.formatNumber(nlStats.last7Days));
      setCardValue("card-nl-last30", M.formatNumber(nlStats.last30Days));
    }

    // Newsletter subscriber growth line chart
    const nlGrowth = await M.fetchNewsletterGrowth();
    if (nlGrowth && nlGrowth.length > 0) {
      createChart("chart-nl-growth", {
        type: "line",
        data: {
          labels: nlGrowth.map((g) => g.date),
          datasets: [
            {
              label: "Confirmed Subscribers",
              data: nlGrowth.map((g) => g.confirmed),
              borderColor: COLORS.teal,
              backgroundColor: COLORS.tealLight,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
    }
  }

  // ── Activity Log Section ────────────────────────────────────
  let activitySubscription = null;

  async function loadActivityLog() {
    const M = AdminMetrics;

    const events = await M.fetchRecentActivity(100);
    renderActivityList(events || []);

    // Set up real-time subscription if available
    if (window.SupplementDB && window.SupplementDB.subscribe && !activitySubscription) {
      try {
        activitySubscription = window.SupplementDB.subscribe(
          "analytics:getRecentPageViews",
          { limit: 50 },
          (data) => {
            if (activeSection === "activity" && data) {
              renderActivityList(data);
            }
          }
        );
      } catch (e) {
        console.warn("Real-time subscription not available:", e);
      }
    }
  }

  function renderActivityList(events) {
    const container = document.getElementById("activity-list");
    if (!container) return;

    if (!events.length) {
      container.innerHTML = `
        <div class="admin-empty-state">
          <i class="fas fa-stream"></i>
          <h3>No Recent Activity</h3>
          <p>Page views and events will appear here in real-time.</p>
        </div>`;
      return;
    }

    container.innerHTML = events.map((event) => {
      const iconClass = getActivityIconClass(event.pageType);
      const iconName = getActivityIcon(event.pageType);
      const title = event.pageTitle || event.pagePath;
      const meta = [
        event.pageType,
        event.userId ? "authenticated" : "anonymous",
        event.sessionId ? `session: ${event.sessionId.slice(0, 8)}` : "",
      ].filter(Boolean).join(" · ");

      return `
        <div class="admin-activity-item">
          <div class="admin-activity-icon ${iconClass}">
            <i class="fas ${iconName}"></i>
          </div>
          <div class="admin-activity-content">
            <div class="admin-activity-title">${escapeHtml(title)}</div>
            <div class="admin-activity-meta">${escapeHtml(meta)}</div>
          </div>
          <span class="admin-activity-time">${AdminMetrics.timeAgo(event.timestamp)}</span>
        </div>`;
    }).join("");
  }

  function getActivityIconClass(pageType) {
    const map = {
      homepage: "pageview",
      supplement: "pageview",
      guide: "gate",
      comparison: "pageview",
      category: "pageview",
      admin: "auth",
      search: "search",
    };
    return map[pageType] || "pageview";
  }

  function getActivityIcon(pageType) {
    const map = {
      homepage: "fa-home",
      supplement: "fa-pills",
      guide: "fa-book",
      comparison: "fa-balance-scale",
      category: "fa-tags",
      admin: "fa-shield-alt",
      search: "fa-search",
      legal: "fa-gavel",
    };
    return map[pageType] || "fa-eye";
  }

  // ── Heatmap Renderer ────────────────────────────────────────
  function renderHeatmap(heatmapData) {
    const container = document.getElementById("heatmap-container");
    if (!container) return;

    const days = heatmapData.days;
    const data = heatmapData.data;
    const maxVal = Math.max(...data.flat(), 1);

    let html = '<div class="overflow-x-auto"><table class="w-full text-xs">';
    html += "<thead><tr><th></th>";
    for (let h = 0; h < 24; h++) {
      html += `<th class="text-center px-0.5 py-1 text-gray-400 font-normal">${h}</th>`;
    }
    html += "</tr></thead><tbody>";

    for (let d = 0; d < 7; d++) {
      html += `<tr><td class="text-right pr-2 py-0.5 text-gray-500 font-medium whitespace-nowrap">${days[d].slice(0, 3)}</td>`;
      for (let h = 0; h < 24; h++) {
        const val = data[d][h];
        const intensity = maxVal > 0 ? val / maxVal : 0;
        const bg = intensity === 0
          ? "#f3f2ef"
          : `rgba(45, 90, 61, ${0.1 + intensity * 0.8})`;
        const textColor = intensity > 0.5 ? "white" : "#6b7280";
        html += `<td class="text-center px-0.5 py-0.5" style="background:${bg};color:${textColor};border-radius:2px;" title="${days[d]} ${h}:00 — ${val} views">${val || ""}</td>`;
      }
      html += "</tr>";
    }

    html += "</tbody></table></div>";
    container.innerHTML = html;
  }

  // ── Conversion Funnel Renderer ──────────────────────────────
  function renderConversionFunnel(funnelData) {
    const container = document.getElementById("funnel-container");
    if (!container) return;

    const funnel = funnelData.funnel;
    const steps = [
      { label: "Gate Impressions", value: funnel.gateImpressions },
      { label: "CTA Clicks", value: funnel.ctaClicks },
      { label: "Sign-Up Started", value: funnel.signUpStarts },
      { label: "Sign-Up Completed", value: funnel.signUpCompletes },
    ];

    const maxVal = Math.max(...steps.map((s) => s.value), 1);

    let html = '<div class="admin-funnel">';
    steps.forEach((step, i) => {
      const pct = Math.max((step.value / maxVal) * 100, 5);
      const rate = i > 0 && steps[i - 1].value > 0
        ? ((step.value / steps[i - 1].value) * 100).toFixed(1)
        : null;

      html += `
        <div class="admin-funnel-step">
          <span class="admin-funnel-label">${step.label}</span>
          <div class="admin-funnel-bar" style="width: ${pct}%">
            <span class="admin-funnel-bar-text">${AdminMetrics.formatNumber(step.value)}</span>
          </div>
          ${rate !== null ? `<span class="admin-funnel-rate">${rate}%</span>` : ""}
        </div>`;
    });

    html += "</div>";
    html += `<div class="text-sm text-gray-500 mt-2">Overall conversion: <strong class="text-gray-800">${AdminMetrics.formatPercent(funnelData.conversionRate)}</strong> (free → subscriber)</div>`;
    container.innerHTML = html;
  }

  // ── Utility Functions ───────────────────────────────────────
  function setCardValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      el.classList.remove("admin-skeleton");
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "…" : str;
  }

  // ── CSV Export ──────────────────────────────────────────────
  function exportActivityCSV() {
    const rows = document.querySelectorAll("#activity-list .admin-activity-item");
    if (!rows.length) return;

    let csv = "Timestamp,Type,Title,Session\n";
    rows.forEach((row) => {
      const time = row.querySelector(".admin-activity-time")?.textContent || "";
      const title = row.querySelector(".admin-activity-title")?.textContent || "";
      const meta = row.querySelector(".admin-activity-meta")?.textContent || "";
      csv += `"${time}","${meta.split(" · ")[0] || ""}","${title.replace(/"/g, '""')}","${meta}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplementdb-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Mobile Sidebar Toggle ───────────────────────────────────
  function toggleSidebar() {
    document.querySelector(".admin-sidebar")?.classList.toggle("open");
  }

  // ── Initialization ──────────────────────────────────────────
  async function init() {
    // Enforce admin access
    if (window.SupplementDBRBAC && !window.SupplementDBRBAC.canAccessAdmin()) {
      // Wait for auth to load
      const authReady = new Promise((resolve) => {
        if (window.SupplementDBAuth && window.SupplementDBAuth.isLoaded) {
          resolve();
        } else {
          document.addEventListener("auth:loaded", resolve, { once: true });
          setTimeout(resolve, 5000); // Timeout fallback
        }
      });

      await authReady;

      if (!window.SupplementDBRBAC.canAccessAdmin()) {
        window.location.href = "../index.html";
        return;
      }
    }

    initChartDefaults();

    // Set up nav click handlers
    document.querySelectorAll(".admin-nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.dataset.section;
        if (section) switchSection(section);
      });
    });

    // Set up range picker
    document.querySelectorAll(".admin-range-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const range = btn.dataset.range;
        if (range) switchRange(range);
      });
    });

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", handleRefresh);
    }

    // Export button
    const exportBtn = document.getElementById("exportActivityBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportActivityCSV);
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector(".admin-sidebar-toggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", toggleSidebar);
    }

    // Wait for Convex client before loading data
    const convexReady = new Promise((resolve) => {
      if (window.SupplementDB) {
        resolve();
      } else {
        const check = setInterval(() => {
          if (window.SupplementDB) {
            clearInterval(check);
            resolve();
          }
        }, 200);
        setTimeout(() => { clearInterval(check); resolve(); }, 8000);
      }
    });

    await convexReady;

    // Load initial section
    switchSection("overview");
  }

  // ── Public API ──────────────────────────────────────────────
  window.AdminDashboard = {
    init,
    switchSection,
    switchRange,
    handleRefresh,
    exportActivityCSV,
    toggleSidebar,
    COLORS,
  };

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
