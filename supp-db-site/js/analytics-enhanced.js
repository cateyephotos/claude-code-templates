/**
 * analytics-enhanced.js — Enhanced Client-Side Event Tracking
 *
 * Enriches PostHog autocapture with structured custom events for
 * supplement, guide, search, comparison, auth, and gate interactions.
 * Also records events to Convex for the admin dashboard.
 *
 * Events fired:
 *   supplement_viewed    — User opens a supplement monograph
 *   guide_opened         — User opens an evidence guide page
 *   guide_gate_shown     — Gate overlay displayed to free user
 *   guide_gate_cta_clicked — User clicks gate CTA
 *   search_performed     — User submits a search query
 *   search_result_clicked — User clicks a search result
 *   comparison_viewed    — User opens a comparison page
 *   favorite_toggled     — User adds/removes a favorite
 *   auth_modal_opened    — Sign-in/sign-up modal opened
 *   auth_completed       — User completes authentication
 *   category_viewed      — User opens a category page
 *   export_initiated     — User exports data (PDF, CSV, etc.)
 *
 * Dependencies:
 *   - PostHog JS loaded on page (window.posthog)
 *   - convex-client.js (window.SupplementDB) — optional, for Convex events
 *   - auth.js (window.SupplementDBAuth) — optional, for user context
 */
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────────
  const DEBUG = false;

  // ── PostHog Wrapper ────────────────────────────────────────────
  function capture(eventName, properties) {
    const props = enrichProperties(properties || {});

    // PostHog
    try {
      if (typeof posthog !== "undefined" && posthog.capture) {
        posthog.capture(eventName, props);
      }
    } catch {
      // Analytics should never break the page
    }

    if (DEBUG) {
      console.log("[Analytics]", eventName, props);
    }
  }

  /**
   * Enrich all events with common properties.
   */
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

  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path === "/" || path === "/index.html") return "homepage";
    if (path.startsWith("/supplements/")) return "supplement";
    if (path.startsWith("/guides/")) return "guide";
    if (path.startsWith("/compare/")) return "comparison";
    if (path.startsWith("/categories/") || path.startsWith("/category/"))
      return "category";
    if (
      path.startsWith("/legal/") ||
      path.startsWith("/privacy") ||
      path.startsWith("/terms")
    )
      return "legal";
    if (path.startsWith("/admin/")) return "admin";
    return "other";
  }

  // ── Auto-detect Page Events ────────────────────────────────────

  function trackPageSpecificEvents() {
    const pageType = detectPageType();
    const path = window.location.pathname;

    switch (pageType) {
      case "supplement":
        trackSupplementViewed(path);
        break;
      case "guide":
        trackGuideOpened(path);
        break;
      case "comparison":
        trackComparisonViewed(path);
        break;
      case "category":
        trackCategoryViewed(path);
        break;
    }
  }

  function trackSupplementViewed(path) {
    const slug = extractSlug(path);
    const name = document.querySelector("h1")?.textContent?.trim() || slug;

    capture("supplement_viewed", {
      supplement_slug: slug,
      supplement_name: name,
      evidence_tier:
        document.querySelector("[data-evidence-tier]")?.dataset?.evidenceTier ||
        undefined,
      has_interactions:
        !!document.querySelector(".interactions-section") || undefined,
    });
  }

  function trackGuideOpened(path) {
    const slug = extractSlug(path);
    const title = document.querySelector("h1")?.textContent?.trim() || slug;

    capture("guide_opened", {
      guide_slug: slug,
      guide_title: title,
    });
  }

  function trackComparisonViewed(path) {
    const slug = extractSlug(path);
    const title = document.querySelector("h1")?.textContent?.trim() || slug;
    const supplementCount =
      document.querySelectorAll(".comparison-item, .compare-card").length || 0;

    capture("comparison_viewed", {
      comparison_slug: slug,
      comparison_title: title,
      supplement_count: supplementCount,
    });
  }

  function trackCategoryViewed(path) {
    const slug = extractSlug(path);
    const title = document.querySelector("h1")?.textContent?.trim() || slug;

    capture("category_viewed", {
      category_slug: slug,
      category_title: title,
    });
  }

  // ── Search Tracking ────────────────────────────────────────────

  function setupSearchTracking() {
    // Listen for search form submissions
    document.addEventListener("submit", (e) => {
      const form = e.target;
      if (
        form.classList?.contains("search-form") ||
        form.id === "searchForm" ||
        form.querySelector('[name="q"], [name="query"], [name="search"]')
      ) {
        const input = form.querySelector(
          'input[type="search"], input[type="text"], input[name="q"], input[name="query"]'
        );
        if (input?.value?.trim()) {
          trackSearchPerformed(input.value.trim());
        }
      }
    });

    // Listen for programmatic search events (from app.js)
    document.addEventListener("sdb:search", (e) => {
      const detail = e.detail || {};
      trackSearchPerformed(
        detail.query,
        detail.resultCount,
        detail.filters
      );
    });

    // Listen for search result clicks
    document.addEventListener("sdb:search-result-click", (e) => {
      const detail = e.detail || {};
      trackSearchResultClicked(
        detail.query,
        detail.result,
        detail.index
      );
    });
  }

  function trackSearchPerformed(query, resultCount, filters) {
    capture("search_performed", {
      search_query: query,
      result_count: resultCount ?? undefined,
      filters: filters ?? undefined,
      query_length: query?.length || 0,
    });

    // Also record to Convex if available
    try {
      if (window.SupplementDB?.mutation && query) {
        window.SupplementDB.mutation("analytics:recordSearch", {
          sessionId: window.SupplementDB.getSessionId(),
          userId: window.SupplementDBAuth?.user?.id || undefined,
          query: query,
          filters: filters || undefined,
          resultCount: resultCount ?? 0,
        }).catch(() => {});
      }
    } catch {
      // Silently fail
    }
  }

  function trackSearchResultClicked(query, result, index) {
    capture("search_result_clicked", {
      search_query: query,
      clicked_result: result,
      result_index: index,
    });
  }

  // ── Favorite Tracking ──────────────────────────────────────────

  function setupFavoriteTracking() {
    // Listen for custom favorite events from app.js
    document.addEventListener("sdb:favorite-toggled", (e) => {
      const detail = e.detail || {};
      capture("favorite_toggled", {
        supplement_id: detail.supplementId,
        supplement_name: detail.supplementName,
        action: detail.isFavorited ? "added" : "removed",
        total_favorites: detail.totalCount ?? undefined,
      });
    });

    // Also listen for clicks on favorite buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        '[data-action="favorite"], .favorite-btn, .btn-favorite'
      );
      if (!btn) return;

      const supplementId =
        btn.dataset.supplementId ||
        btn.closest("[data-supplement-id]")?.dataset?.supplementId;
      const supplementName =
        btn.dataset.supplementName ||
        btn.closest("[data-supplement-name]")?.dataset?.supplementName;
      const isActive =
        btn.classList.contains("active") || btn.classList.contains("favorited");

      capture("favorite_toggled", {
        supplement_id: supplementId,
        supplement_name: supplementName,
        action: isActive ? "removed" : "added",
      });
    });
  }

  // ── Auth Tracking ──────────────────────────────────────────────

  function setupAuthTracking() {
    // Track sign-in modal opens
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        "#auth-signin-btn, #gate-cta-signin, [data-action='sign-in']"
      );
      if (btn) {
        capture("auth_modal_opened", { type: "sign_in", trigger: btn.id || "button" });
      }

      const signUpBtn = e.target.closest(
        "#auth-signup-btn, #gate-cta-signup, [data-action='sign-up']"
      );
      if (signUpBtn) {
        capture("auth_modal_opened", {
          type: "sign_up",
          trigger: signUpBtn.id || "button",
        });
      }
    });

    // Track auth completion
    document.addEventListener("auth:signed-in", (e) => {
      const detail = e.detail || {};
      capture("auth_completed", {
        auth_method: "clerk",
        user_role: detail.role || "free",
        is_new_user: undefined, // Clerk doesn't expose this directly
      });
    });
  }

  // ── Export Tracking ────────────────────────────────────────────

  function setupExportTracking() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        '[data-action="export"], #exportBtn, #exportActivityBtn, .export-btn'
      );
      if (!btn) return;

      const format =
        btn.dataset.format || btn.dataset.exportType || "unknown";

      capture("export_initiated", {
        format,
        trigger: btn.id || "button",
        context: detectPageType(),
      });
    });
  }

  // ── Scroll Depth Tracking ──────────────────────────────────────

  function setupScrollDepthTracking() {
    const milestones = [25, 50, 75, 90, 100];
    const reached = new Set();
    let ticking = false;

    function checkScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (scrollHeight <= 0) return;

      const percent = Math.round((scrollTop / scrollHeight) * 100);

      for (const milestone of milestones) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          capture("scroll_depth_reached", {
            depth: milestone,
            page_type: detectPageType(),
          });
        }
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            checkScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ── Time on Page Tracking ──────────────────────────────────────

  function setupTimeOnPageTracking() {
    const intervals = [30, 60, 120, 300]; // seconds
    const fired = new Set();
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      for (const interval of intervals) {
        if (elapsed >= interval && !fired.has(interval)) {
          fired.add(interval);
          capture("time_on_page_reached", {
            seconds: interval,
            page_type: detectPageType(),
          });
        }
      }

      // Stop checking after we hit all milestones
      if (fired.size >= intervals.length) {
        clearInterval(timer);
      }
    }, 5000); // Check every 5 seconds

    // Clean up on page hide
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        clearInterval(timer);
      }
    });
  }

  // ── Utility ────────────────────────────────────────────────────

  function extractSlug(path) {
    const filename = path.split("/").pop() || "";
    return filename.replace(".html", "");
  }

  // ── Public API ─────────────────────────────────────────────────
  window.SupplementDBAnalytics = {
    capture,

    trackSearchPerformed,
    trackSearchResultClicked,

    /**
     * Manually fire a supplement view event.
     */
    trackSupplementViewed(slug, name) {
      capture("supplement_viewed", {
        supplement_slug: slug,
        supplement_name: name,
      });
    },

    /**
     * Manually fire a guide opened event.
     */
    trackGuideOpened(slug, title) {
      capture("guide_opened", {
        guide_slug: slug,
        guide_title: title,
      });
    },

    /**
     * Track custom events with auto-enrichment.
     */
    track(eventName, properties) {
      capture(eventName, properties);
    },
  };

  // ── Initialize ─────────────────────────────────────────────────
  function init() {
    // Page-specific events
    trackPageSpecificEvents();

    // Global tracking
    setupSearchTracking();
    setupFavoriteTracking();
    setupAuthTracking();
    setupExportTracking();
    setupScrollDepthTracking();
    setupTimeOnPageTracking();

    if (DEBUG) {
      console.log("[Analytics] Enhanced tracking initialized");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
