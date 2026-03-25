/**
 * admin-analytics-panels.js -- UI rendering for extended admin dashboard sections
 *
 * Sections: Search Intelligence, Traffic Acquisition, Content Performance,
 *           User Journeys, Activity Log (enhanced)
 *
 * Dependencies: Chart.js, admin-metrics.js (window.AdminMetrics)
 * Exposes: window.AdminAnalyticsPanels
 *
 * Security: All API/user-supplied string values are passed through escapeHtml()
 * before being concatenated into innerHTML template strings.
 */
(function () {
  "use strict";

  // Chart instance registry (destroy before recreate)
  var charts = {};

  // Colour palette (mirrors admin-dashboard.js)
  var COLORS = {
    accent: "#2d5a3d",
    accentLight: "rgba(45, 90, 61, 0.15)",
    blue: "#2563eb",
    blueLight: "rgba(37, 99, 235, 0.15)",
    orange: "#f59e0b",
    orangeLight: "rgba(245, 158, 11, 0.15)",
    red: "#dc2626",
    green: "#16a34a",
    gray: "#9ca3af",
    chartPalette: [
      "#2d5a3d","#2563eb","#f59e0b","#dc2626",
      "#7c3aed","#0d9488","#ec4899","#8b5cf6","#06b6d4","#84cc16"
    ]
  };

  // ---- Utility helpers ----------------------------------------------------

  // All dynamic string values MUST be sanitised through escapeHtml before HTML insertion.
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    var div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  }

  function createChart(canvasId, config) {
    destroyChart(canvasId);
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return null;
    charts[canvasId] = new Chart(canvas.getContext("2d"), config);
    return charts[canvasId];
  }

  function showError(containerId, message) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<div style="padding:1rem;text-align:center;color:#dc2626;">'
      + '<i class="fas fa-exclamation-triangle"></i>'
      + '<p style="font-size:0.85rem;">' + escapeHtml(message) + "</p></div>";
  }

  function showEmpty(containerId, message) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<div style="padding:1rem;text-align:center;color:#9ca3af;">'
      + '<i class="fas fa-inbox"></i>'
      + '<p style="font-size:0.85rem;">' + escapeHtml(message || "No data available.") + "</p></div>";
  }

  function setElementText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ---- Sortable table helpers ----------------------------------------------

  var sortState = {};

  function makeSortableTable(tableBodyId, rows, columns, defaultSortIdx) {
    var tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    var table = tbody.closest("table");
    var headRow = table && table.querySelector("thead tr");
    if (!headRow) { renderTableRows(tbody, rows, columns); return; }
    var key = tableBodyId;
    if (!sortState[key]) sortState[key] = { col: defaultSortIdx || 0, asc: false };
    headRow.querySelectorAll("th[data-sort]").forEach(function (th, idx) {
      th.style.cursor = "pointer";
      var newTh = th.cloneNode(true);
      th.parentNode.replaceChild(newTh, th);
      newTh.addEventListener("click", function () {
        if (sortState[key].col === idx) {
          sortState[key].asc = !sortState[key].asc;
        } else {
          sortState[key].col = idx;
          sortState[key].asc = false;
        }
        headRow.querySelectorAll("th[data-sort]").forEach(function (h, i) {
          h.classList.toggle("sort-active", i === sortState[key].col);
          h.classList.toggle("sort-asc", i === sortState[key].col && sortState[key].asc);
          h.classList.toggle("sort-desc", i === sortState[key].col && !sortState[key].asc);
        });
        renderTableRows(tbody, sortRows(rows, columns, sortState[key].col, sortState[key].asc), columns);
      });
    });
    renderTableRows(tbody, sortRows(rows, columns, sortState[key].col, sortState[key].asc), columns);
  }

  function sortRows(rows, columns, colIdx, asc) {
    var col = columns[colIdx];
    return rows.slice().sort(function (a, b) {
      var va = col.value ? col.value(a) : a[col.key];
      var vb = col.value ? col.value(b) : b[col.key];
      var na = typeof va === "number" ? va : parseFloat(va) || 0;
      var nb = typeof vb === "number" ? vb : parseFloat(vb) || 0;
      if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
      var sa = String(va || "").toLowerCase();
      var sb = String(vb || "").toLowerCase();
      return asc ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }

  function renderTableRows(tbody, rows, columns) {
    if (!rows || !rows.length) {
      tbody.innerHTML = '<tr><td colspan="' + columns.length
        + '" style="text-align:center;color:#9ca3af;padding:1rem;">No data available</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (row) {
      return "<tr>" + columns.map(function (col) {
        var raw = col.value ? col.value(row) : (row[col.key] !== undefined ? row[col.key] : "");
        var display = col.render ? col.render(raw, row) : escapeHtml(raw);
        var align = col.align ? ' style="text-align:' + col.align + '"' : "";
        return "<td" + align + ">" + display + "</td>";
      }).join("") + "</tr>";
    }).join("");
  }

  // ---- Pill / tab wiring helpers ------------------------------------------

  function wireRangePills(containerId, dataAttr, onChange) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll("[data-" + dataAttr + "]").forEach(function (pill) {
      if (pill._pillHandler) pill.removeEventListener("click", pill._pillHandler);
      pill._pillHandler = function () {
        container.querySelectorAll("[data-" + dataAttr + "]")
          .forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        onChange(pill.dataset[dataAttr]);
      };
      pill.addEventListener("click", pill._pillHandler);
    });
  }

  function wireTabPills(containerId, dataAttr, panelMap) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var pills = container.querySelectorAll("[data-" + dataAttr + "]");
    var panels = Object.values(panelMap)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    pills.forEach(function (pill) {
      if (pill._tabHandler) pill.removeEventListener("click", pill._tabHandler);
      pill._tabHandler = function () {
        pills.forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        var targetId = panelMap[pill.dataset[dataAttr]];
        panels.forEach(function (panel) {
          panel.style.display = panel.id === targetId ? "" : "none";
        });
      };
      pill.addEventListener("click", pill._tabHandler);
    });
    if (pills.length > 0) pills[0].click();
  }

  // ---- Search Intelligence ------------------------------------------------

  async function initSearchIntelligence() {
    var M = window.AdminMetrics;
    var range = M.getRange ? M.getRange() : "30d";
    var res = await Promise.allSettled([
      M.fetchGSCKeywords(range),
      M.fetchTopSearches(range, 25),
      M.fetchZeroResultSearches(range, 25),
      M.fetchSearchConversion(range),
      M.fetchSearchTrend(range, "day")
    ]);

    try { renderGSCTable(res[0].status === "fulfilled" ? res[0].value : null); }
    catch (e) { showError("gsc-keywords-table", "Failed to load GSC data"); }

    wireRangePills("gsc-range-pills", "range", async function (r) {
      try { renderGSCTable(await M.fetchGSCKeywords(r)); }
      catch (e) { showError("gsc-keywords-table", "Failed to reload GSC data"); }
    });

    try { renderTopSearchesTable(res[1].status === "fulfilled" ? res[1].value : null); }
    catch (e) { showError("table-internal-searches", "Failed to load search data"); }

    try { renderZeroResultsTable(res[2].status === "fulfilled" ? res[2].value : null); }
    catch (e) { showError("table-zero-results", "Failed to load zero-results data"); }

    try { renderSearchConversionTable(res[3].status === "fulfilled" ? res[3].value : null); }
    catch (e) { showError("table-search-conversion", "Failed to load conversion data"); }

    try { renderSearchTrendChart(res[4].status === "fulfilled" ? res[4].value : null); }
    catch (e) { console.warn("Search trend chart failed:", e); }

    wireTabPills("search-tab-pills", "tab", {
      "top-queries":  "search-tab-top-queries",
      "zero-results": "search-tab-zero-results",
      "conversion":   "search-tab-conversion"
    });
  }

  function renderGSCTable(data) {
    var container = document.getElementById("gsc-keywords-table");
    if (!container) return;
    var keywords = Array.isArray(data) ? data : (data && data.keywords ? data.keywords : []);
    if (!keywords.length) { showEmpty("gsc-keywords-table", "No GSC keyword data available."); return; }
    var M = window.AdminMetrics;
    var rows = keywords.map(function (kw) {
      var isOpp = (kw.impressions || 0) > 100 && (kw.ctr || 0) < 2;
      var ctrStr = M.formatPercent
        ? M.formatPercent((kw.ctr || 0) / 100)
        : (kw.ctr || 0).toFixed(1) + "%";
      return "<tr" + (isOpp ? ' class="seo-opportunity"' : "") + ">"
        + "<td>" + escapeHtml(kw.keyword || kw.query || "")
        + (isOpp ? ' <span title="SEO opportunity" style="color:#f59e0b;">&#9888;</span>' : "")
        + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(kw.clicks || 0) + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(kw.impressions || 0) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(ctrStr) + "</td>"
        + '<td style="text-align:right">' + escapeHtml((kw.position || kw.avgPosition || 0).toFixed(1)) + "</td>"
        + "</tr>";
    }).join("");
    container.innerHTML = '<table class="admin-table w-full"><thead><tr>'
      + "<th>Keyword</th>"
      + '<th style="text-align:right">Clicks</th>'
      + '<th style="text-align:right">Impressions</th>'
      + '<th style="text-align:right">CTR</th>'
      + '<th style="text-align:right">Avg Position</th>'
      + "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function renderTopSearchesTable(data) {
    var tbody = document.getElementById("table-internal-searches");
    if (!tbody) return;
    var items = Array.isArray(data) ? data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No search data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = items.map(function (s) {
      var avgR = s.avgResults !== undefined ? s.avgResults : (s.results !== undefined ? s.results : "-");
      return "<tr>"
        + '<td class="font-medium">&quot;' + escapeHtml(s.query || s.term || "") + '&quot;</td>'
        + '<td style="text-align:right">' + M.formatNumber(s.count || s.searches || 0) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(String(avgR)) + "</td>"
        + "</tr>";
    }).join("");
  }

  function renderZeroResultsTable(data) {
    var tbody = document.getElementById("table-zero-results");
    if (!tbody) return;
    var items = Array.isArray(data) ? data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#9ca3af;padding:1rem;">No zero-result searches</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = items.map(function (s) {
      return "<tr>"
        + '<td><i class="fas fa-exclamation-circle" style="color:#f59e0b;margin-right:0.4rem;"></i>'
        + '&quot;' + escapeHtml(s.query || s.term || "") + '&quot;</td>'
        + '<td style="text-align:right">' + M.formatNumber(s.count || s.searches || 0) + "</td>"
        + "</tr>";
    }).join("");
  }

  function renderSearchConversionTable(data) {
    var tbody = document.getElementById("table-search-conversion");
    if (!tbody) return;
    var items = Array.isArray(data) ? data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No conversion data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = items.map(function (s) {
      var conv;
      if (typeof s.conversionRate === "number") conv = s.conversionRate.toFixed(1) + "%";
      else if (s.clicks !== undefined && s.searches) conv = ((s.clicks / s.searches) * 100).toFixed(1) + "%";
      else conv = "-";
      return "<tr>"
        + '<td>&quot;' + escapeHtml(s.query || s.term || "") + '&quot;</td>'
        + '<td style="text-align:right">' + M.formatNumber(s.searches || s.count || 0) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(conv) + "</td>"
        + "</tr>";
    }).join("");
  }

  function renderSearchTrendChart(data) {
    var points = Array.isArray(data) ? data : (data && data.points ? data.points : []);
    if (!points.length) return;
    createChart("chart-search-trend", {
      type: "line",
      data: {
        labels: points.map(function (p) { return p.date || p.label || ""; }),
        datasets: [{
          label: "Searches",
          data: points.map(function (p) { return p.count || p.searches || p.value || 0; }),
          borderColor: COLORS.blue,
          backgroundColor: COLORS.blueLight,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
      }
    });
  }

  // ---- Traffic Acquisition ------------------------------------------------

  async function initTrafficAcquisition() {
    var M = window.AdminMetrics;
    var range = M.getRange ? M.getRange() : "30d";
    var res = await Promise.allSettled([
      M.fetchTrafficSources(range),
      M.fetchUTMBreakdown(range),
      M.fetchNewVsReturning(range),
      M.fetchBounceRate(range)
    ]);

    try {
      var t = res[0].status === "fulfilled" ? res[0].value : null;
      renderReferrerSourcesChart(t);
      renderReferrerSourcesTable(t);
    } catch (e) {
      console.warn("Traffic sources failed:", e);
      showError("table-referrer-sources", "Failed to load traffic sources");
    }

    try { renderUTMTable(res[1].status === "fulfilled" ? res[1].value : null); }
    catch (e) { showError("table-utm-campaigns", "Failed to load UTM data"); }

    try { renderNewVsReturningChart(res[2].status === "fulfilled" ? res[2].value : null); }
    catch (e) { console.warn("New vs returning chart failed:", e); }

    try { renderBounceRate(res[3].status === "fulfilled" ? res[3].value : null); }
    catch (e) { showError("table-bounce-rate", "Failed to load bounce rate"); }
  }

  function renderReferrerSourcesChart(data) {
    var sources = Array.isArray(data) ? data : [];
    if (!sources.length) return;
    createChart("chart-referrer-sources", {
      type: "bar",
      data: {
        labels: sources.map(function (s) { return s.source || s.referrer || "Direct"; }),
        datasets: [{
          label: "Page Views",
          data: sources.map(function (s) { return s.count || s.views || 0; }),
          backgroundColor: COLORS.accentLight,
          borderColor: COLORS.accent,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { display: false } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function renderReferrerSourcesTable(data) {
    var tbody = document.getElementById("table-referrer-sources");
    if (!tbody) return;
    var sources = Array.isArray(data) ? data : [];
    if (!sources.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No traffic source data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    var total = sources.reduce(function (s, r) { return s + (r.count || r.views || 0); }, 0);
    tbody.innerHTML = sources.map(function (s) {
      var views = s.count || s.views || 0;
      var share = total > 0 ? ((views / total) * 100).toFixed(1) : "0";
      return "<tr>"
        + '<td class="font-medium">' + escapeHtml(s.source || s.referrer || "Direct") + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(views) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(share) + "%</td>"
        + "</tr>";
    }).join("");
  }

  function renderUTMTable(data) {
    var tbody = document.getElementById("table-utm-campaigns");
    if (!tbody) return;
    var campaigns = Array.isArray(data) ? data : (data && data.campaigns ? data.campaigns : []);
    if (!campaigns.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:1rem;">No UTM campaign data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = campaigns.map(function (c) {
      return "<tr>"
        + '<td class="font-medium">' + escapeHtml(c.campaign || c.utmCampaign || "-") + "</td>"
        + "<td>" + escapeHtml(c.source || c.utmSource || "-") + "</td>"
        + "<td>" + escapeHtml(c.medium || c.utmMedium || "-") + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(c.count || c.sessions || c.views || 0) + "</td>"
        + "</tr>";
    }).join("");
  }

  function renderNewVsReturningChart(data) {
    if (!data) return;
    var newU = data.new || data.newUsers || 0;
    var retU = data.returning || data.returningUsers || 0;
    if (!newU && !retU) return;
    createChart("chart-new-vs-returning", {
      type: "doughnut",
      data: {
        labels: ["New Visitors", "Returning Visitors"],
        datasets: [{
          data: [newU, retU],
          backgroundColor: [COLORS.blue, COLORS.accent],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { padding: 12 } } }
      }
    });
  }

  function renderBounceRate(data) {
    if (!data) return;
    var M = window.AdminMetrics;
    var rate = data.overall !== undefined ? data.overall
      : (data.bounceRate !== undefined ? data.bounceRate : null);
    if (rate !== null) {
      setElementText("bounce-rate-value", typeof rate === "number" ? rate.toFixed(1) + "%" : String(rate));
    }
    var tbody = document.getElementById("table-bounce-rate");
    if (!tbody) return;
    var pages = Array.isArray(data.pages) ? data.pages : (Array.isArray(data) ? data : []);
    if (!pages.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No page-level bounce data</td></tr>';
      return;
    }
    tbody.innerHTML = pages.map(function (p) {
      var brStr = typeof p.bounceRate === "number" ? p.bounceRate.toFixed(1) + "%" : (p.bounceRate || "-");
      return "<tr>"
        + '<td class="font-medium">' + escapeHtml(p.page || p.path || "") + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(p.sessions || p.visits || 0) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(brStr) + "</td>"
        + "</tr>";
    }).join("");
  }

  // ---- Content Performance ------------------------------------------------

  async function initContentPerformance() {
    var M = window.AdminMetrics;
    var range = M.getRange ? M.getRange() : "30d";
    var res = await Promise.allSettled([
      M.fetchContentPerformance(range),
      M.fetchGateStats(range),
      M.fetchZeroResultSearches(range, 50)
    ]);

    try { renderContentPerformanceTable(res[0].status === "fulfilled" ? res[0].value : null); }
    catch (e) { showError("table-content-performance", "Failed to load content performance data"); }

    try { renderGateConversionChart(res[1].status === "fulfilled" ? res[1].value : null); }
    catch (e) { console.warn("Gate chart failed:", e); }

    try { renderContentGaps(res[2].status === "fulfilled" ? res[2].value : null); }
    catch (e) { showError("content-gaps-list", "Failed to load content gaps"); }
  }

  function renderContentPerformanceTable(data) {
    var tbody = document.getElementById("table-content-performance");
    if (!tbody) return;
    var rows = Array.isArray(data) ? data : (data && data.items ? data.items : []);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:1rem;">No content performance data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    var columns = [
      {
        key: "name",
        label: "Supplement",
        render: function (v) { return '<span class="font-medium">' + escapeHtml(v) + "</span>"; }
      },
      {
        key: "views",
        label: "Views",
        align: "right",
        render: function (v) { return M.formatNumber(v || 0); }
      },
      {
        key: "avgTime",
        label: "Avg Time",
        align: "right",
        value: function (r) { return r.avgTime || r.avgDuration || 0; },
        render: function (v) { return M.formatDuration ? M.formatDuration(v) : Math.round(v / 1000) + "s"; }
      },
      {
        key: "scrollDepth",
        label: "Scroll %",
        align: "right",
        value: function (r) { return r.scrollDepth || r.scroll || 0; },
        render: function (v) { return typeof v === "number" ? v.toFixed(0) + "%" : escapeHtml(v || "-"); }
      },
      {
        key: "gateImpressions",
        label: "Gate Imp.",
        align: "right",
        render: function (v) { return M.formatNumber(v || 0); }
      },
      {
        key: "gateCtr",
        label: "Gate CTR",
        align: "right",
        value: function (r) {
          if (r.gateCtr !== undefined) return r.gateCtr;
          if (r.gateImpressions && r.gateClicks) return (r.gateClicks / r.gateImpressions) * 100;
          return 0;
        },
        render: function (v) { return typeof v === "number" ? v.toFixed(1) + "%" : escapeHtml(v || "-"); }
      },
      {
        key: "signups",
        label: "Sign-ups",
        align: "right",
        render: function (v) { return M.formatNumber(v || 0); }
      }
    ];
    makeSortableTable("table-content-performance", rows, columns, 1);
  }

  function renderGateConversionChart(data) {
    if (!data) return;
    var items = Array.isArray(data) ? data
      : (data.bySupplement ? data.bySupplement : (data.pages ? data.pages : []));
    if (!items.length) return;
    var top15 = items.map(function (item) {
      return Object.assign({}, item, {
        ctr: item.ctr || item.gateCtr
          || (item.impressions && item.clicks ? (item.clicks / item.impressions) * 100 : 0)
      });
    }).sort(function (a, b) { return b.ctr - a.ctr; }).slice(0, 15);

    createChart("chart-gate-conversion", {
      type: "bar",
      data: {
        labels: top15.map(function (i) {
          var n = i.name || i.supplementId || i.page || "";
          return n.length > 20 ? n.slice(0, 20) + "..." : n;
        }),
        datasets: [{
          label: "Gate CTR (%)",
          data: top15.map(function (i) { return parseFloat(i.ctr.toFixed(1)); }),
          backgroundColor: COLORS.orangeLight,
          borderColor: COLORS.orange,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, title: { display: true, text: "CTR (%)" } }
        }
      }
    });
  }

  function renderContentGaps(data) {
    var container = document.getElementById("content-gaps-list");
    if (!container) return;
    var items = Array.isArray(data) ? data : [];
    if (!items.length) {
      showEmpty("content-gaps-list", "No content gaps detected from zero-result searches.");
      return;
    }
    container.innerHTML = items.slice(0, 20).map(function (item) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #f3f4f6;">'
        + '<span style="font-size:0.875rem;color:#374151;">'
        + '<i class="fas fa-search-minus" style="color:#dc2626;margin-right:0.4rem;font-size:0.75rem;"></i>'
        + '&quot;' + escapeHtml(item.query || item.term || "") + '&quot;</span>'
        + '<span style="font-size:0.8rem;font-weight:600;color:#9ca3af;">'
        + escapeHtml(String(item.count || item.searches || 0)) + "x</span>"
        + "</div>";
    }).join("");
  }

  // ---- User Journeys -------------------------------------------------------

  async function initUserJourneys() {
    var M = window.AdminMetrics;
    var range = M.getRange ? M.getRange() : "30d";
    var startPointEl = document.getElementById("flow-start-point");
    var startPoint = startPointEl ? (startPointEl.value || "homepage") : "homepage";
    var res = await Promise.allSettled([
      M.fetchPathAnalysis(range, startPoint),
      M.fetchDropoffAnalysis(range),
      M.fetchTopExitPages(range, 20)
    ]);

    try { renderSessionFlow(res[0].status === "fulfilled" ? res[0].value : null); }
    catch (e) { showError("session-flow-diagram", "Failed to load path data"); }

    if (startPointEl) {
      if (startPointEl._flowHandler) startPointEl.removeEventListener("change", startPointEl._flowHandler);
      startPointEl._flowHandler = async function () {
        try { renderSessionFlow(await M.fetchPathAnalysis(range, startPointEl.value)); }
        catch (e) { showError("session-flow-diagram", "Failed to reload path data"); }
      };
      startPointEl.addEventListener("change", startPointEl._flowHandler);
    }

    try { renderDropoffTable(res[1].status === "fulfilled" ? res[1].value : null); }
    catch (e) { showError("table-dropoff", "Failed to load dropoff data"); }

    try { renderExitPagesTable(res[2].status === "fulfilled" ? res[2].value : null); }
    catch (e) { showError("table-exit-pages", "Failed to load exit pages data"); }
  }

  function renderSessionFlow(data) {
    var container = document.getElementById("session-flow-diagram");
    if (!container) return;
    var paths = Array.isArray(data) ? data : (data && data.paths ? data.paths : []);
    if (!paths.length) {
      showEmpty("session-flow-diagram", "No path data available for this start point.");
      return;
    }
    var topPaths = paths.slice(0, 8);
    var maxCount = Math.max.apply(null,
      topPaths.map(function (p) { return p.count || p.sessions || 1; }).concat([1]));
    var html = '<div style="overflow-x:auto;">'
      + '<div style="font-size:0.75rem;color:#9ca3af;margin-bottom:0.75rem;">Top '
      + topPaths.length + " user paths (by session count)</div>";
    topPaths.forEach(function (path) {
      var count = path.count || path.sessions || 0;
      var widthPct = Math.max((count / maxCount) * 100, 8);
      var steps = Array.isArray(path.steps) ? path.steps
        : (path.path ? path.path.split(" > ") : [path.from, path.to].filter(Boolean));
      html += '<div style="margin-bottom:0.75rem;">'
        + '<div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.25rem;flex-wrap:wrap;">';
      steps.forEach(function (step, i) {
        var label = String(step).length > 22 ? String(step).slice(0, 22) + "..." : String(step);
        html += '<span style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;'
          + 'padding:0.2rem 0.5rem;font-size:0.75rem;color:#374151;">' + escapeHtml(label) + "</span>";
        if (i < steps.length - 1) {
          html += '<span style="color:#9ca3af;font-size:0.8rem;">&rsaquo;</span>';
        }
      });
      html += "</div>"
        + '<div style="background:#e5e7eb;border-radius:3px;height:6px;width:100%;">'
        + '<div style="background:' + COLORS.accent + ';border-radius:3px;height:6px;width:' + widthPct + '%;"></div></div>'
        + '<div style="font-size:0.7rem;color:#6b7280;margin-top:0.15rem;">'
        + escapeHtml(String(count.toLocaleString())) + " sessions</div></div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  function renderDropoffTable(data) {
    var tbody = document.getElementById("table-dropoff");
    if (!tbody) return;
    var items = Array.isArray(data) ? data : (data && data.steps ? data.steps : []);
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No dropoff data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = items.map(function (item) {
      var drStr = typeof item.dropoffRate === "number"
        ? item.dropoffRate.toFixed(1) + "%" : (item.dropoffRate || "-");
      var color = (item.dropoffRate || 0) > 60 ? "#dc2626" : "#374151";
      return "<tr>"
        + '<td class="font-medium">' + escapeHtml(item.page || item.step || item.path || "") + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(item.sessions || item.users || 0) + "</td>"
        + '<td style="text-align:right"><span style="color:' + color + ';">' + escapeHtml(drStr) + "</span></td>"
        + "</tr>";
    }).join("");
  }

  function renderExitPagesTable(data) {
    var tbody = document.getElementById("table-exit-pages");
    if (!tbody) return;
    var items = Array.isArray(data) ? data : [];
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:1rem;">No exit page data</td></tr>';
      return;
    }
    var M = window.AdminMetrics;
    tbody.innerHTML = items.map(function (item) {
      var erStr = typeof item.exitRate === "number"
        ? item.exitRate.toFixed(1) + "%" : (item.exitRate || "-");
      return "<tr>"
        + '<td class="font-medium">' + escapeHtml(item.page || item.path || "") + "</td>"
        + '<td style="text-align:right">' + M.formatNumber(item.exits || item.count || 0) + "</td>"
        + '<td style="text-align:right">' + escapeHtml(erStr) + "</td>"
        + "</tr>";
    }).join("");
  }

  // ---- Activity Log (enhanced) --------------------------------------------

  var activityActiveFilters = new Set();

  async function initActivityLog() {
    var M = window.AdminMetrics;
    var range = M.getRange ? M.getRange() : "1d";
    wireRangePills("activity-range-pills", "range", async function (r) {
      await reloadActivityFeed(r);
    });
    try { renderActivitySummaryCards(await M.fetchActivitySummary(range)); }
    catch (e) { console.warn("Activity summary failed:", e); }
    wireActivityTypeFilters();
    await reloadActivityFeed(range);
  }

  async function reloadActivityFeed(range) {
    var M = window.AdminMetrics;
    var filterArr = activityActiveFilters.size > 0 ? Array.from(activityActiveFilters) : null;
    try { renderActivitySummaryCards(await M.fetchActivitySummary(range)); }
    catch (e) { console.warn("Activity summary reload failed:", e); }
    try { renderEnhancedActivityList(await M.fetchActivityFeed(range, filterArr, 100) || []); }
    catch (e) { showError("activity-list", "Failed to load activity feed"); }
  }

  function renderActivitySummaryCards(data) {
    if (!data) return;
    var M = window.AdminMetrics;
    setElementText("activity-total-events",     M.formatNumber(data.totalEvents     || data.total         || 0));
    setElementText("activity-unique-sessions",  M.formatNumber(data.uniqueSessions  || data.sessions      || 0));
    setElementText("activity-searches",         M.formatNumber(data.searches        || data.totalSearches  || 0));
    setElementText("activity-gate-impressions", M.formatNumber(data.gateImpressions || data.impressions    || 0));
  }

  function wireActivityTypeFilters() {
    var container = document.getElementById("activity-type-filters");
    if (!container) return;
    container.querySelectorAll("[data-filter-type]").forEach(function (chip) {
      if (chip._filterHandler) chip.removeEventListener("click", chip._filterHandler);
      chip._filterHandler = function () {
        var type = chip.dataset.filterType;
        if (activityActiveFilters.has(type)) {
          activityActiveFilters.delete(type);
          chip.classList.remove("active");
        } else {
          activityActiveFilters.add(type);
          chip.classList.add("active");
        }
        var M = window.AdminMetrics;
        reloadActivityFeed(M.getRange ? M.getRange() : "1d");
      };
      chip.addEventListener("click", chip._filterHandler);
    });
  }

  function renderEnhancedActivityList(events) {
    var container = document.getElementById("activity-list");
    if (!container) return;
    if (!events || !events.length) {
      container.innerHTML = '<div class="admin-empty-state">'
        + '<i class="fas fa-stream"></i>'
        + "<h3>No Recent Activity</h3>"
        + "<p>Events matching your filters will appear here.</p>"
        + "</div>";
      return;
    }
    var M = window.AdminMetrics;
    var groups = groupEventsByTimeBucket(events);
    var html = "";
    groups.forEach(function (group) {
      html += '<div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;'
        + 'letter-spacing:0.05em;padding:0.75rem 0 0.25rem;">'
        + escapeHtml(group.label) + "</div>";
      group.items.forEach(function (event) {
        var evType = resolveEventType(event);
        var borderColor = eventTypeBorderColor(evType);
        var iconClass = eventTypeIcon(evType);
        var description = buildEventDescription(event);
        var path = event.pagePath || event.path || "";
        var ts = event.timestamp || event._creationTime || null;
        var timeStr = ts ? M.timeAgo(ts) : "";
        html += '<div class="admin-activity-item" style="border-left:3px solid ' + borderColor
          + ';padding-left:0.75rem;margin-bottom:0.5rem;display:flex;align-items:flex-start;gap:0.75rem;">'
          + '<div style="flex-shrink:0;width:2rem;height:2rem;display:flex;align-items:center;'
          + 'justify-content:center;border-radius:50%;background:' + borderColor + '20;">'
          + '<i class="fas ' + iconClass + '" style="color:' + borderColor + ';font-size:0.8rem;"></i>'
          + "</div>"
          + '<div style="flex:1;min-width:0;">'
          + '<div style="font-size:0.875rem;font-weight:500;color:#111827;">' + escapeHtml(description) + "</div>"
          + (path ? '<div style="font-size:0.75rem;color:#6b7280;margin-top:0.1rem;white-space:nowrap;'
            + 'overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(path) + "</div>" : "")
          + "</div>"
          + '<span style="flex-shrink:0;font-size:0.75rem;color:#9ca3af;white-space:nowrap;">'
          + escapeHtml(timeStr) + "</span>"
          + "</div>";
      });
    });
    container.innerHTML = html;
  }

  function groupEventsByTimeBucket(events) {
    var now = Date.now();
    var groups = [];
    var labelIndex = {};
    events.forEach(function (event) {
      var ts = event.timestamp || event._creationTime || now;
      var label = timeBucketLabel(ts, now);
      if (!(label in labelIndex)) {
        labelIndex[label] = groups.length;
        groups.push({ label: label, items: [] });
      }
      groups[labelIndex[label]].items.push(event);
    });
    return groups;
  }

  function timeBucketLabel(ts, now) {
    var date = new Date(ts);
    var nowDate = new Date(now);
    var sameDay = date.getDate() === nowDate.getDate()
      && date.getMonth() === nowDate.getMonth()
      && date.getFullYear() === nowDate.getFullYear();
    if (now - ts < 86400000 && sameDay) {
      var h = date.getHours() % 12 || 12;
      return "Today " + h + (date.getHours() >= 12 ? "pm" : "am");
    }
    var yesterday = new Date(now - 86400000);
    if (date.getDate() === yesterday.getDate()
      && date.getMonth() === yesterday.getMonth()
      && date.getFullYear() === yesterday.getFullYear()) {
      return "Yesterday";
    }
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return days[date.getDay()] + " " + months[date.getMonth()] + " " + date.getDate();
  }

  function resolveEventType(event) {
    var type = event.type || event.eventType || event.pageType || "";
    if (type === "search" || type === "search_query") return "search";
    if (type === "gate" || type === "gate_impression" || type === "gate_click" || type === "signup") return "gate";
    return "pageview";
  }

  function eventTypeBorderColor(type) {
    if (type === "search") return COLORS.green;
    if (type === "gate") return COLORS.orange;
    return COLORS.blue;
  }

  function eventTypeIcon(type) {
    if (type === "search") return "fa-search";
    if (type === "gate") return "fa-lock";
    return "fa-eye";
  }

  function buildEventDescription(event) {
    var type = resolveEventType(event);
    var title = event.pageTitle || event.title || "";
    var query = event.query || event.searchQuery || "";
    if (type === "search" && query) return "Searched: \"" + query + "\"";
    if (type === "gate") return "Gate shown" + (title ? " on " + title : "");
    if (title) return title;
    return event.pagePath || event.path || "Page view";
  }

  // ---- Public API ---------------------------------------------------------

  async function init(sectionId) {
    try {
      switch (sectionId) {
        case "search":   await initSearchIntelligence(); break;
        case "traffic":  await initTrafficAcquisition(); break;
        case "content":  await initContentPerformance(); break;
        case "journeys": await initUserJourneys(); break;
        case "activity": await initActivityLog(); break;
        default: console.warn("AdminAnalyticsPanels: unknown section", sectionId);
      }
    } catch (err) {
      console.error("AdminAnalyticsPanels: failed to init section", sectionId, err);
    }
  }

  window.AdminAnalyticsPanels = { init: init };
})();
