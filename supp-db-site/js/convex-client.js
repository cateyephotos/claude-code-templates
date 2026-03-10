/**
 * convex-client.js — Convex Browser Client with Clerk JWT Auth
 *
 * Initializes the Convex browser client, wires up Clerk token provider
 * for authenticated queries/mutations, and provides helper functions
 * for the rest of the app.
 *
 * Dependencies:
 *   - convex browser bundle loaded via CDN before this script
 *   - auth.js loaded before this script (window.SupplementDBAuth)
 *
 * Usage:
 *   const result = await SupplementDB.query("analytics:getRecentPageViews", { limit: 10 });
 *   await SupplementDB.mutation("analytics:recordPageView", { ... });
 *   const unsub = SupplementDB.subscribe("metrics:getOverviewStats", { ... }, callback);
 */
(function () {
  "use strict";

  // Skip real initialization when test mock is active
  if (window.__CLERK_MOCK__) return;

  // ── Configuration ──────────────────────────────────────────────
  const CONVEX_URL =
    document.querySelector('meta[name="convex-url"]')?.content ||
    "https://robust-frog-754.convex.cloud";

  // ── State ──────────────────────────────────────────────────────
  let client = null;
  let isInitialized = false;
  let initPromise = null;

  // ── Public API ─────────────────────────────────────────────────
  window.SupplementDB = {
    get client() {
      return client;
    },
    get isInitialized() {
      return isInitialized;
    },

    /**
     * Run a Convex query.
     * @param {string} functionPath — e.g. "analytics:getRecentPageViews"
     * @param {object} args — query arguments
     * @returns {Promise<any>}
     */
    async query(functionPath, args = {}) {
      await ensureInitialized();
      const fn = parseFunctionPath(functionPath);
      return client.query(fn, args);
    },

    /**
     * Run a Convex mutation.
     * @param {string} functionPath — e.g. "analytics:recordPageView"
     * @param {object} args — mutation arguments
     * @returns {Promise<any>}
     */
    async mutation(functionPath, args = {}) {
      await ensureInitialized();
      const fn = parseFunctionPath(functionPath);
      return client.mutation(fn, args);
    },

    /**
     * Run a Convex action.
     * @param {string} functionPath — e.g. "posthog:fetchEventCounts"
     * @param {object} args — action arguments
     * @returns {Promise<any>}
     */
    async action(functionPath, args = {}) {
      await ensureInitialized();
      const fn = parseFunctionPath(functionPath);
      return client.action(fn, args);
    },

    /**
     * Subscribe to a Convex query for real-time updates.
     * @param {string} functionPath — e.g. "metrics:getOverviewStats"
     * @param {object} args — query arguments
     * @param {function} callback — called with (result) on each update
     * @returns {function} unsubscribe function
     */
    subscribe(functionPath, args = {}, callback) {
      if (!client) {
        console.warn("[Convex] Client not initialized for subscribe");
        return () => {};
      }
      const fn = parseFunctionPath(functionPath);
      return client.onUpdate(fn, args, callback);
    },

    /**
     * Wait for the Convex client to be initialized.
     * @returns {Promise<void>}
     */
    whenReady() {
      return ensureInitialized();
    },

    /**
     * Generate a unique session ID for anonymous analytics tracking.
     * Persists in sessionStorage for the duration of the browser session.
     * @returns {string}
     */
    getSessionId() {
      let sid = sessionStorage.getItem("sdb_session_id");
      if (!sid) {
        sid =
          "sess_" +
          Date.now().toString(36) +
          "_" +
          Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("sdb_session_id", sid);
      }
      return sid;
    },

    /**
     * Record a page view event. Called automatically on page load.
     * @param {object} overrides — optional overrides for page data
     */
    async recordPageView(overrides = {}) {
      try {
        const pageType = detectPageType();
        const pageViewId = await this.mutation(
          "analytics:recordPageView",
          {
            sessionId: this.getSessionId(),
            userId:
              window.SupplementDBAuth?.user?.id ||
              undefined,
            pageType,
            pagePath: window.location.pathname,
            pageTitle: document.title,
            supplementId: detectSupplementId(),
            referrer: document.referrer || undefined,
            ...overrides,
          }
        );

        // Track duration on page leave
        if (pageViewId) {
          trackPageDuration(pageViewId);
        }

        return pageViewId;
      } catch (err) {
        // Analytics should never break the page
        console.warn("[Convex] Failed to record page view:", err);
      }
    },
  };

  // ── Initialization ─────────────────────────────────────────────
  function ensureInitialized() {
    if (isInitialized) return Promise.resolve();
    if (initPromise) return initPromise;
    initPromise = initConvex();
    return initPromise;
  }

  async function initConvex() {
    if (isInitialized) return;

    // Wait for Convex CDN to load
    if (typeof window.convex === "undefined") {
      console.warn(
        "[Convex] Convex CDN not loaded. Backend features will be unavailable."
      );
      isInitialized = true;
      return;
    }

    // Validate URL
    if (!CONVEX_URL || CONVEX_URL === "__CONVEX_URL__") {
      console.warn(
        "[Convex] Convex URL not configured. Backend features will be unavailable."
      );
      isInitialized = true;
      return;
    }

    try {
      client = new window.convex.ConvexClient(CONVEX_URL);
      isInitialized = true;

      // Wire up Clerk auth when available
      wireAuthProvider();

      // Listen for auth state changes
      document.addEventListener("auth:signed-in", () => wireAuthProvider());
      document.addEventListener("auth:signed-out", () => {
        if (client) {
          client.clearAuth();
        }
      });

      console.log("[Convex] Client initialized:", CONVEX_URL);
    } catch (err) {
      console.error("[Convex] Client initialization failed:", err);
      isInitialized = true;
    }
  }

  function wireAuthProvider() {
    if (!client || !window.SupplementDBAuth?.isSignedIn) return;

    const tokenProvider = window.SupplementDBAuth.getTokenProvider();
    if (tokenProvider) {
      client.setAuth(tokenProvider);
    }
  }

  // ── Helper: Parse function path ────────────────────────────────
  // Converts "module:functionName" to the Convex API reference format.
  // The Convex browser client expects api.module.functionName format,
  // but from CDN we use string-based function references.
  function parseFunctionPath(path) {
    // The Convex CDN client accepts string paths like "analytics:recordPageView"
    // which maps to api.analytics.recordPageView
    return path;
  }

  // ── Helper: Detect page type from URL ──────────────────────────
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
      path.startsWith("/terms") ||
      path.startsWith("/disclaimer")
    )
      return "legal";
    if (path.startsWith("/admin/")) return "admin";
    return "other";
  }

  // ── Helper: Detect supplement ID from URL ──────────────────────
  function detectSupplementId() {
    const path = window.location.pathname;
    if (path.startsWith("/supplements/")) {
      const filename = path.split("/").pop();
      return filename ? filename.replace(".html", "") : undefined;
    }
    return undefined;
  }

  // ── Helper: Track page duration ────────────────────────────────
  function trackPageDuration(pageViewId) {
    const startTime = Date.now();

    const updateDuration = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration > 0 && duration < 3600) {
        // Cap at 1 hour
        try {
          // Use navigator.sendBeacon for reliability on page unload
          if (window.SupplementDB?.client) {
            window.SupplementDB.mutation(
              "analytics:updatePageViewDuration",
              { pageViewId, duration }
            ).catch(() => {});
          }
        } catch {
          // Silently fail — analytics should never break navigation
        }
      }
    };

    // Use visibilitychange for modern browsers (more reliable than beforeunload)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        updateDuration();
      }
    });

    // Fallback for older browsers
    window.addEventListener("beforeunload", updateDuration);
  }

  // ── Auto-initialize ────────────────────────────────────────────
  // Initialize after auth loads (or immediately if auth isn't available)
  if (window.SupplementDBAuth) {
    window.SupplementDBAuth.whenLoaded().then(() => {
      ensureInitialized().then(() => {
        // Auto-record page view after initialization
        window.SupplementDB.recordPageView();
      });
    });
  } else {
    // Auth not available — initialize Convex anyway for anonymous tracking
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        ensureInitialized().then(() => {
          window.SupplementDB.recordPageView();
        });
      });
    } else {
      ensureInitialized().then(() => {
        window.SupplementDB.recordPageView();
      });
    }
  }
})();
