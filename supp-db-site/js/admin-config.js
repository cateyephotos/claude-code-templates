/**
 * admin-config.js — Configuration & Services panel for SupplementDB admin dashboard.
 *
 * Loads two Convex queries:
 *   adminConfig:getConfigHealth       — env var health per service (admin-only, server-side)
 *   adminConfig:getStackAnalyzerStats — live Claude API usage + costs
 *
 * Renders:
 *   1. System health banner (overall status)
 *   2. Per-service cards with var-by-var status, masked values, docs links
 *   3. Stack Analyzer live usage stats (this month + all time)
 *   4. Analysis depth breakdown bars
 *   5. Model info + pricing reference
 *
 * Updates status dot on the sidebar nav item for at-a-glance health.
 *
 * Dependencies: convex-client.js (window.SupplementDB), admin-dashboard.js (section nav)
 */
(function () {
  "use strict";

  // ── Convex query wrapper ──────────────────────────────────────
  async function convexQuery(path, args) {
    if (!window.SupplementDB) throw new Error("Convex client not initialised");
    return window.SupplementDB.query(path, args || {});
  }

  // ── Helpers ───────────────────────────────────────────────────
  function fmt(n) {
    if (n === null || n === undefined) return "—";
    return Number(n).toLocaleString();
  }

  function fmtUsd(n) {
    if (n === null || n === undefined) return "—";
    if (n < 0.01) return "<$0.01";
    return "$" + Number(n).toFixed(2);
  }

  function fmtTokens(n) {
    if (!n) return "0";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = el(id);
    if (node) {
      node.textContent = value;
      node.classList.remove("admin-skeleton");
    }
  }

  // ── Render: System Health Banner ─────────────────────────────
  function renderHealthBanner(summary) {
    const banner = el("config-health-banner");
    if (!banner) return;

    const { overallStatus, totalRequiredMissing, totalRequired, totalOptionalMissing } = summary;

    const configs = {
      ok: {
        cls: "config-health-ok",
        icon: "fa-check-circle",
        title: "All systems operational",
        body: `${totalRequired}/${totalRequired} required variables configured. System fully operational.`,
      },
      degraded: {
        cls: "config-health-degraded",
        icon: "fa-exclamation-circle",
        title: "Some optional features unconfigured",
        body: `${totalRequired - totalRequiredMissing}/${totalRequired} required vars set. ${totalOptionalMissing} optional var${totalOptionalMissing !== 1 ? "s" : ""} missing — some features may be unavailable.`,
      },
      error: {
        cls: "config-health-error",
        icon: "fa-times-circle",
        title: `${totalRequiredMissing} required variable${totalRequiredMissing !== 1 ? "s" : ""} missing`,
        body: `Critical features are unavailable. Configure the missing variables in the Convex dashboard immediately.`,
      },
    };

    const cfg = configs[overallStatus] || configs.error;

    banner.className = "config-health-banner " + cfg.cls;
    banner.innerHTML = `
      <div class="config-health-banner-icon">
        <i class="fas ${cfg.icon}"></i>
      </div>
      <div class="config-health-banner-text">
        <strong>${cfg.title}</strong>
        <span>${cfg.body}</span>
      </div>
      <a href="https://dashboard.convex.dev" target="_blank" rel="noopener" class="config-convex-link">
        <i class="fas fa-external-link-alt mr-1"></i>Convex Dashboard
      </a>
    `;

    // Update sidebar nav dot
    const dot = el("config-nav-badge");
    if (dot) {
      dot.className = "config-nav-status-dot dot-" + overallStatus;
      dot.classList.remove("hidden");
    }
  }

  // ── Render: Service Cards ─────────────────────────────────────
  function renderServiceCards(services) {
    const grid = el("config-services-grid");
    if (!grid) return;

    const statusLabel = { ok: "Ready", degraded: "Partial", error: "Issues" };

    grid.innerHTML = services.map((service) => {
      const badgeClass = "config-status-badge badge-" + service.status;
      const iconClass = "config-service-icon icon-" + service.status;
      const iconMap = {
        anthropic: "fa-robot",
        stripe: "fa-credit-card",
        clerk: "fa-shield-alt",
        resend: "fa-envelope",
        posthog: "fa-chart-bar",
        pdf: "fa-file-pdf",
      };
      const icon = iconMap[service.serviceId] || "fa-cog";

      const varRows = service.vars.map((v) => {
        let rowClass = "config-var-row";
        let iconHtml = "";
        let statusText = "";

        if (v.isSet) {
          rowClass += " var-set";
          iconHtml = '<i class="fas fa-check-circle config-var-status-icon icon-set"></i>';
          statusText = "";
        } else if (v.required) {
          rowClass += " var-missing-required";
          iconHtml = '<i class="fas fa-times-circle config-var-status-icon icon-missing"></i>';
          statusText = '<span class="config-var-masked" style="color:#dc2626;font-family:inherit;font-size:0.75rem;">NOT SET — REQUIRED</span>';
        } else if (v.defaultValue) {
          rowClass += "";
          iconHtml = '<i class="fas fa-info-circle config-var-status-icon icon-default"></i>';
          statusText = `<span class="config-var-masked">default</span>`;
        } else {
          rowClass += " var-missing-optional";
          iconHtml = '<i class="fas fa-minus-circle config-var-status-icon icon-optional"></i>';
          statusText = '<span class="config-var-masked">not set</span>';
        }

        const maskedHtml = v.isSet
          ? `<span class="config-var-masked">${v.masked || "••••"}</span>`
          : statusText;

        const docsHtml = v.docsUrl
          ? `<a href="${v.docsUrl}" target="_blank" rel="noopener" class="config-var-docs-link" title="Open docs"><i class="fas fa-external-link-alt"></i></a>`
          : "";

        return `
          <div class="${rowClass}">
            ${iconHtml}
            <div class="config-var-info">
              <div class="config-var-key">${v.key}</div>
              <div class="config-var-label">${v.label}</div>
            </div>
            ${maskedHtml}
            ${docsHtml}
          </div>
        `;
      }).join("");

      return `
        <div class="admin-chart-card config-service-card">
          <div class="config-service-header">
            <div class="${iconClass}"><i class="fas ${icon}"></i></div>
            <div class="config-service-title-group">
              <div class="config-service-name">${service.serviceName}</div>
              <div class="config-service-desc">${service.serviceDescription}</div>
            </div>
            <span class="${badgeClass}">${statusLabel[service.status] || service.status}</span>
          </div>
          <div class="config-var-list">
            ${varRows}
          </div>
        </div>
      `;
    }).join("");
  }

  // ── Render: Stack Analyzer API Status Banner ──────────────────
  function renderApiStatusBanner(configured) {
    const el_ = el("stack-api-status");
    if (!el_) return;

    if (configured) {
      el_.className = "config-api-status api-ok";
      el_.innerHTML = `
        <div class="config-api-status-icon"><i class="fas fa-check-circle"></i></div>
        <div class="config-api-status-text">
          <strong>ANTHROPIC_API_KEY is configured</strong>
          <small>The Stack Analyzer is active. Claude API calls are being made successfully.</small>
        </div>
      `;
    } else {
      el_.className = "config-api-status api-error";
      el_.innerHTML = `
        <div class="config-api-status-icon"><i class="fas fa-times-circle"></i></div>
        <div class="config-api-status-text">
          <strong>ANTHROPIC_API_KEY is NOT configured</strong>
          <small>The Stack Analyzer will fail for all users. Set this in Convex Dashboard → Settings → Environment Variables.</small>
        </div>
        <a href="https://dashboard.convex.dev" target="_blank" rel="noopener" class="config-convex-link" style="font-size:0.8rem;">
          Fix Now <i class="fas fa-arrow-right ml-1"></i>
        </a>
      `;
    }
  }

  // ── Render: Stat Cards ────────────────────────────────────────
  function renderStackStats(stats) {
    setText("cfg-analyses-month", fmt(stats.thisMonth.analyses));

    // WAT (Weighted API Tokens) = input×1 + output×5, where 1M WAT = $1.00 API cost.
    // This is the primary profitability metric — tracks true spend proportional to Haiku pricing.
    const watMonth = stats.thisMonth.weightedTokens || 0;
    const watTotal = stats.allTime.weightedTokens || 0;
    setText("cfg-cost-month", fmtTokens(watMonth) + " WAT");
    setText("cfg-cost-total", fmtTokens(watTotal) + " WAT");

    // USD sub-labels — secondary reference only, for margin calculations
    const subMonth = el("cfg-cost-month-usd");
    if (subMonth) subMonth.textContent = "≈ " + fmtUsd(stats.thisMonth.costUsd) + " API cost";
    const subTotal = el("cfg-cost-total-usd");
    if (subTotal) subTotal.textContent = "≈ " + fmtUsd(stats.allTime.costUsd) + " API cost";

    setText("cfg-users-month", fmt(stats.thisMonth.uniqueUsers));
    setText("cfg-analyses-total", fmt(stats.allTime.analyses));
    setText("cfg-credit-users",
      fmt((stats.creditUsers.free || 0) + (stats.creditUsers.subscriber || 0)) +
      " (" + fmt(stats.creditUsers.free) + " free / " + fmt(stats.creditUsers.subscriber) + " pro)"
    );
    setText("cfg-input-tokens", fmtTokens(stats.thisMonth.inputTokens));
    setText("cfg-output-tokens", fmtTokens(stats.thisMonth.outputTokens));
  }

  // ── Render: Depth Breakdown ───────────────────────────────────
  function renderDepthBreakdown(depthBreakdown, totalThisMonth) {
    const container = el("cfg-depth-breakdown");
    if (!container) return;

    const depths = [
      { key: "quick", label: "Quick", cls: "bar-quick" },
      { key: "standard", label: "Standard", cls: "bar-standard" },
      { key: "deep", label: "Deep", cls: "bar-deep" },
    ];

    const total = totalThisMonth || 1;

    container.innerHTML = depths.map((d) => {
      const count = depthBreakdown[d.key] || 0;
      const pct = Math.round((count / total) * 100);
      return `
        <div class="config-depth-row">
          <div class="config-depth-label">${d.label}</div>
          <div class="config-depth-bar-wrap">
            <div class="config-depth-bar ${d.cls}" style="width:${pct}%;"></div>
          </div>
          <div class="config-depth-count">${count}</div>
        </div>
      `;
    }).join("");

    if (total === 1 && totalThisMonth === 0) {
      container.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:1.5rem 0;font-size:0.875rem;">No analyses this month yet.</p>';
    }
  }

  // ── Render: Model Info ────────────────────────────────────────
  // WAT = Weighted API Tokens (input×1 + output×5). 1M WAT = $1.00 API cost (Haiku input parity).
  // Profitability floor: avgWAT/analysis × 25 pro analyses / 1M × $1 = API cost per pro user/month.
  // ── Model selector state ──────────────────────────────────────
  // Tracks the original selected value so we can show Save only on actual change
  let _currentModelId = "";
  const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

  function renderModelInfo(model, allTime) {
    const container = el("cfg-model-info");
    if (!container) return;

    const activeModel = model || DEFAULT_MODEL;

    // Initialise the selector with the active model if it hasn't been populated yet
    const sel = el("model-select");
    if (sel && sel.options.length <= 1) {
      // Placeholder until fetchModels() is called — show current model as sole option
      sel.innerHTML = `<option value="${activeModel}">${activeModel}</option>`;
      _currentModelId = activeModel;
    }

    const sourceTag = el("model-source-tag");
    if (sourceTag && sel) {
      // Will be updated once fetchModels() loads full list
      sourceTag.textContent = "";
    }

    const avgWat = allTime.avgWatPerAnalysis || 0;
    const apiCostPerProUser = (avgWat * 25) / 1_000_000;
    const proMarginLabel = avgWat > 0
      ? fmtTokens(avgWat * 25) + " WAT ≈ " + fmtUsd(apiCostPerProUser) + " API/user/mo"
      : "Insufficient data";

    container.innerHTML = `
      <div class="config-model-row">
        <span class="config-model-row-label">WAT formula</span>
        <span class="config-model-row-value">input×1 + output×5</span>
      </div>
      <div class="config-model-row">
        <span class="config-model-row-label">WAT rate</span>
        <span class="config-model-row-value">$1.00 / 1M WAT</span>
      </div>
      <div class="config-model-row">
        <span class="config-model-row-label">Avg WAT / analysis</span>
        <span class="config-model-row-value">${avgWat > 0 ? fmtTokens(avgWat) + " WAT" : "~4,500 WAT (est.)"}</span>
      </div>
      <div class="config-model-row">
        <span class="config-model-row-label">Pro plan (25 analyses)</span>
        <span class="config-model-row-value config-model-row-profit">${proMarginLabel}</span>
      </div>
      <div class="config-model-row">
        <span class="config-model-row-label">All-time input tokens</span>
        <span class="config-model-row-value">${fmtTokens(allTime.inputTokens)}</span>
      </div>
      <div class="config-model-row">
        <span class="config-model-row-label">All-time output tokens</span>
        <span class="config-model-row-value">${fmtTokens(allTime.outputTokens)}</span>
      </div>
    `;

    // Auto-fetch live model list once stats are rendered
    fetchModels();
  }

  // ── Model selector functions ──────────────────────────────────

  async function fetchModels() {
    const sel = el("model-select");
    const fetchBtn = el("model-fetch-btn");
    const sourceTag = el("model-source-tag");
    if (!sel) return;

    if (fetchBtn) fetchBtn.disabled = true;
    try {
      const result = await window.SupplementDB.action("adminSettings:fetchAvailableModels", {});

      if (!result.success || !result.models.length) {
        // Keep current placeholder — surface error subtly
        if (sourceTag) sourceTag.textContent = result.error ? "⚠ " + result.error : "";
        return;
      }

      const selected = result.selectedModel || DEFAULT_MODEL;
      _currentModelId = selected;

      // Rebuild dropdown with live model list
      sel.innerHTML = result.models
        .map((m) => `<option value="${m.id}"${m.id === selected ? " selected" : ""}>${m.name}</option>`)
        .join("");

      // Tag the source
      if (sourceTag) {
        const isDefault = selected === DEFAULT_MODEL && !result.models.find(
          (m) => m.id === selected && selected !== DEFAULT_MODEL
        );
        sourceTag.textContent = isDefault ? "(default)" : "(custom)";
      }

      // Hide Save until user changes selection
      const saveBtn = el("model-save-btn");
      if (saveBtn) saveBtn.style.display = "none";

    } catch (err) {
      if (sourceTag) sourceTag.textContent = "⚠ Could not fetch models";
    } finally {
      if (fetchBtn) fetchBtn.disabled = false;
    }
  }

  function onModelSelectChange(value) {
    const saveBtn = el("model-save-btn");
    if (!saveBtn) return;
    // Show Save only when selection differs from what's stored
    saveBtn.style.display = value !== _currentModelId ? "inline-flex" : "none";
  }

  async function saveModel() {
    const sel = el("model-select");
    const feedback = el("model-feedback");
    const saveBtn = el("model-save-btn");
    if (!sel || !feedback) return;

    const value = sel.value;
    if (!value) return;

    feedback.textContent = "Saving…";
    feedback.className = "config-key-feedback config-key-feedback-info";
    feedback.classList.remove("hidden");
    if (saveBtn) saveBtn.disabled = true;

    try {
      await window.SupplementDB.mutation("adminSettings:upsertSetting", {
        key: "ANTHROPIC_MODEL",
        value,
      });
      _currentModelId = value;
      feedback.textContent = "✅ Model updated to " + value;
      feedback.className = "config-key-feedback config-key-feedback-success";
      if (saveBtn) { saveBtn.style.display = "none"; }
      // Refresh stats so the "Active model" row reflects the change
      loaded = false;
      setTimeout(() => { loaded = false; loadConfigSection(); }, 600);
    } catch (err) {
      feedback.textContent = "❌ " + (err.message || "Failed to save");
      feedback.className = "config-key-feedback config-key-feedback-error";
    } finally {
      feedback.classList.remove("hidden");
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  // ── API Key Status ────────────────────────────────────────────
  async function loadKeyStatus() {
    try {
      const statuses = await convexQuery("adminSettings:getSettingsStatus", {});

      // Anthropic key
      const ak = statuses["ANTHROPIC_API_KEY"];
      if (ak) {
        const badge = el("anthropic-key-badge");
        const sourceEl = el("anthropic-key-source");
        const editLabel = el("anthropic-edit-label");
        if (badge) {
          badge.textContent = ak.isSet ? "Set" : "Not Set";
          badge.className = "config-key-badge " + (ak.isSet ? "badge-set" : "badge-missing");
        }
        if (sourceEl) {
          sourceEl.textContent = ak.isSet
            ? (ak.source === "admin_ui" ? "via Admin UI" : "via Convex env var")
            : "";
        }
        if (editLabel) editLabel.textContent = ak.isSet ? "Update Key" : "Set Key";
      }

      // Resend key
      const rk = statuses["RESEND_API_KEY"];
      if (rk) {
        const badge = el("resend-key-badge");
        const sourceEl = el("resend-key-source");
        const editLabel = el("resend-edit-label");
        if (badge) {
          badge.textContent = rk.isSet ? "Set" : "Not Set";
          badge.className = "config-key-badge " + (rk.isSet ? "badge-set" : "badge-missing");
        }
        if (sourceEl) {
          sourceEl.textContent = rk.isSet
            ? (rk.source === "admin_ui" ? "via Admin UI" : "via Convex env var")
            : "";
        }
        if (editLabel) editLabel.textContent = rk.isSet ? "Update Key" : "Set Key";
      }
    } catch (err) {
      console.warn("[admin-config] Could not load key status:", err);
    }
  }

  // ── Main Load ─────────────────────────────────────────────────
  async function loadConfigSection() {
    try {
      // Fetch all data in parallel
      const [healthData, statsData] = await Promise.all([
        convexQuery("adminConfig:getConfigHealth", {}),
        convexQuery("adminConfig:getStackAnalyzerStats", {}),
      ]);

      // Render health banner + service cards
      renderHealthBanner(healthData.summary);
      renderServiceCards(healthData.services);

      // Render Stack Analyzer section
      renderApiStatusBanner(statsData.apiKeyConfigured);
      renderStackStats(statsData);
      renderDepthBreakdown(statsData.depthBreakdown, statsData.thisMonth.analyses);
      renderModelInfo(statsData.model, statsData.allTime);

      // Load API key management status (separate query — may fail if table not ready)
      loadKeyStatus();

    } catch (err) {
      console.error("[admin-config] Failed to load config data:", err);

      // Show error state in banner
      const banner = el("config-health-banner");
      if (banner) {
        banner.className = "config-health-banner config-health-error";
        banner.innerHTML = `
          <div class="config-health-banner-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="config-health-banner-text">
            <strong>Could not load configuration data</strong>
            <span>${err.message || "Check that you are signed in with an admin account."}</span>
          </div>
        `;
      }

      // Clear skeleton grid
      const grid = el("config-services-grid");
      if (grid) {
        grid.innerHTML = `
          <div class="admin-chart-card" style="grid-column:1/-1;padding:2rem;text-align:center;color:#9ca3af;">
            <i class="fas fa-exclamation-circle" style="font-size:2rem;margin-bottom:0.5rem;display:block;"></i>
            <p>Configuration data unavailable. Admin access required.</p>
          </div>
        `;
      }
    }
  }

  // ── Hook into section activation ─────────────────────────────
  // Watch for the config section becoming active. Lazy-load on first view.
  let loaded = false;

  function onSectionChange() {
    const section = document.getElementById("section-config");
    if (!section) return;
    if (section.classList.contains("active") && !loaded) {
      loaded = true;
      loadConfigSection();
    }
  }

  // Poll once the DOM is ready and then observe section activations
  // (admin-dashboard.js toggles the 'active' class on sidebar nav clicks)
  function hookSectionObserver() {
    const observer = new MutationObserver(() => onSectionChange());
    const section = document.getElementById("section-config");
    if (section) {
      observer.observe(section, { attributes: true, attributeFilter: ["class"] });
    }

    // Also check immediately in case config is the default/active section
    onSectionChange();
  }

  // Initialise after DOM + scripts loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hookSectionObserver);
  } else {
    // Small delay to ensure convex-client.js has initialised
    setTimeout(hookSectionObserver, 300);
  }

  // ── API Key Form Handlers ─────────────────────────────────────
  async function saveKey(convexKey, prefix) {
    const input = el(prefix + "-key-input");
    const feedback = el(prefix + "-key-feedback");
    if (!input || !feedback) return;

    const value = input.value.trim();
    if (!value) {
      feedback.textContent = "Please enter a key value.";
      feedback.className = "config-key-feedback config-key-feedback-error";
      feedback.classList.remove("hidden");
      return;
    }

    // Disable form during save
    input.disabled = true;
    feedback.textContent = "Saving…";
    feedback.className = "config-key-feedback config-key-feedback-info";
    feedback.classList.remove("hidden");

    try {
      await window.SupplementDB.mutation("adminSettings:upsertSetting", { key: convexKey, value });
      feedback.textContent = "✅ Key saved successfully.";
      feedback.className = "config-key-feedback config-key-feedback-success";
      input.value = "";
      // Reload status to show updated badge
      await loadKeyStatus();
      // Reload health banner in case this key fixed an error state
      loaded = false;
      setTimeout(() => { loaded = false; loadConfigSection(); }, 800);
    } catch (err) {
      feedback.textContent = "❌ Error: " + (err.message || "Failed to save key.");
      feedback.className = "config-key-feedback config-key-feedback-error";
    } finally {
      input.disabled = false;
    }
  }

  function toggleKeyForm(prefix) {
    const form = el(prefix + "-key-form");
    if (!form) return;
    const isHidden = form.classList.contains("hidden");
    form.classList.toggle("hidden", !isHidden);
    if (!isHidden) {
      // Closing — clear feedback
      const feedback = el(prefix + "-key-feedback");
      if (feedback) feedback.classList.add("hidden");
    } else {
      // Opening — focus input
      const input = el(prefix + "-key-input");
      if (input) setTimeout(() => input.focus(), 50);
    }
  }

  async function testAnthropicKey() {
    const resultEl = el("anthropic-test-result");
    const testBtn = el("anthropic-test-btn");
    if (!resultEl) return;

    resultEl.className = "config-test-result config-test-result-loading";
    resultEl.textContent = "Testing connection…";
    resultEl.classList.remove("hidden");
    if (testBtn) testBtn.disabled = true;

    try {
      const result = await window.SupplementDB.action("adminSettings:testAnthropicConnection", {});
      if (result.success) {
        resultEl.className = "config-test-result config-test-result-success";
        resultEl.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Connected — <strong>${result.model}</strong> responded in ${result.latencyMs}ms (source: ${result.source === "admin_ui" ? "Admin UI key" : "env var"})`;
      } else {
        resultEl.className = "config-test-result config-test-result-error";
        resultEl.innerHTML = `<i class="fas fa-times-circle mr-1"></i>${result.error || "Connection failed"}`;
      }
    } catch (err) {
      resultEl.className = "config-test-result config-test-result-error";
      resultEl.innerHTML = `<i class="fas fa-times-circle mr-1"></i>Test failed: ${err.message || "Unknown error"}`;
    } finally {
      if (testBtn) testBtn.disabled = false;
    }
  }

  // Expose functions for use from HTML onclick handlers and manual reload
  window.AdminConfig = {
    reload: function () { loaded = false; loadConfigSection(); },
    saveKey,
    toggleKeyForm,
    testAnthropicKey,
    fetchModels,
    saveModel,
    onModelSelectChange,
  };

})();
