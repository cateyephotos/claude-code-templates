/**
 * auth.js — Clerk CDN Authentication Manager
 *
 * Initializes Clerk from CDN, manages auth state, and fires custom events.
 * Works with static HTML pages (no build step).
 *
 * Dependencies: @clerk/clerk-js loaded via CDN before this script.
 *
 * Custom events fired:
 *   auth:loaded     — Clerk finished initializing (user may or may not be signed in)
 *   auth:signed-in  — User just signed in (detail: { user, role })
 *   auth:signed-out — User just signed out
 *   auth:error      — Auth initialization error (detail: { error })
 */
(function () {
  "use strict";

  // Skip real initialization when test mock is active
  if (window.__CLERK_MOCK__) return;

  // ── Configuration ──────────────────────────────────────────────
  // Reads key from <meta name="clerk-key"> — Docker entrypoint substitutes __CLERK_PUBLISHABLE_KEY__
  // The Clerk CDN script is NOT included in HTML to prevent auto-boot errors.
  // Instead, auth.js dynamically loads it only when a valid key is present.
  // Pinned to @4 — v4 exports window.Clerk as a class (no auto-boot), supports full UI components.
  // Do NOT use @latest: v5+ auto-boots on script load and requires a different init path.
  const CLERK_CDN_URL = "https://unpkg.com/@clerk/clerk-js@4/dist/clerk.browser.js";
  const clerkMeta = document.querySelector('meta[name="clerk-key"]');
  const rawKey = clerkMeta?.content || "";
  const CLERK_PUBLISHABLE_KEY = rawKey.startsWith("pk_") ? rawKey : "";

  // ── State ──────────────────────────────────────────────────────
  const state = {
    clerk: null,
    user: null,
    session: null,
    isSignedIn: false,
    role: "free",
    isLoaded: false,
    isLoading: false,
  };

  // ── Public API ─────────────────────────────────────────────────
  window.SupplementDBAuth = {
    /** Current auth state (read-only snapshot) */
    get state() {
      return { ...state };
    },
    get isSignedIn() {
      return state.isSignedIn;
    },
    get user() {
      return state.user;
    },
    get role() {
      return state.role;
    },
    get session() {
      return state.session;
    },
    get isLoaded() {
      return state.isLoaded;
    },
    get clerk() {
      return state.clerk;
    },

    /** Open Clerk sign-in modal */
    openSignIn() {
      if (!state.clerk) {
        showAuthUnavailableToast();
        return;
      }
      state.clerk.openSignIn({
        afterSignInUrl: window.location.href,
        afterSignUpUrl: window.location.href,
      });
    },

    /** Open Clerk sign-up modal */
    openSignUp() {
      if (!state.clerk) {
        showAuthUnavailableToast();
        return;
      }
      state.clerk.openSignUp({
        afterSignInUrl: window.location.href,
        afterSignUpUrl: window.location.href,
      });
    },

    /** Sign out the current user */
    async signOut() {
      if (!state.clerk) return;
      await state.clerk.signOut();
    },

    /** Mount Clerk UserButton into a DOM element */
    mountUserButton(selector) {
      if (!state.clerk || !state.isSignedIn) return;
      const el =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;
      if (!el) return;
      state.clerk.mountUserButton(el, {
        afterSignOutUrl: window.location.href,
      });
    },

    /**
     * Get Clerk session token for Convex authentication.
     * Returns a function that Convex client can use as a token provider.
     */
    getTokenProvider() {
      return async () => {
        if (!state.clerk?.session) return null;
        try {
          return await state.clerk.session.getToken({ template: "convex" });
        } catch (err) {
          console.warn("[Auth] Failed to get Convex token:", err);
          return null;
        }
      };
    },

    /**
     * Wait for auth to finish loading.
     * @returns {Promise<void>}
     */
    whenLoaded() {
      if (state.isLoaded) return Promise.resolve();
      return new Promise((resolve) => {
        document.addEventListener("auth:loaded", () => resolve(), {
          once: true,
        });
      });
    },
  };

  // ── Dynamic script loader ─────────────────────────────────────
  // Pass publishableKey so Clerk v5+ auto-boot can find it via data-clerk-publishable-key.
  function loadScript(src, publishableKey) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      if (publishableKey) {
        script.setAttribute("data-clerk-publishable-key", publishableKey);
      }
      script.onload = resolve;
      script.onerror = () => reject(new Error("[Auth] Failed to load Clerk CDN from " + src));
      document.head.appendChild(script);
    });
  }

  // ── Initialization ─────────────────────────────────────────────
  async function initClerk() {
    if (state.isLoading || state.isLoaded) return;
    state.isLoading = true;

    // Validate key — must be a real Clerk publishable key (pk_test_... or pk_live_...)
    if (!CLERK_PUBLISHABLE_KEY || !CLERK_PUBLISHABLE_KEY.startsWith("pk_")) {
      console.warn(
        "[Auth] Clerk publishable key not configured. Auth features will be unavailable.",
        "Set CLERK_PUBLISHABLE_KEY in your .env file and restart Docker."
      );
      state.isLoaded = true;
      state.isLoading = false;
      dispatch("auth:loaded");
      return;
    }

    try {
      // Dynamically load Clerk CDN with the publishable key as a script attribute.
      // Clerk v5+ uses data-clerk-publishable-key for auto-boot; v4 ignores the attribute
      // and expects new Clerk(key) instead.
      if (typeof window.Clerk === "undefined") {
        await loadScript(CLERK_CDN_URL, CLERK_PUBLISHABLE_KEY);
      }

      if (typeof window.Clerk === "undefined") {
        throw new Error("Clerk CDN loaded but window.Clerk is not defined");
      }

      // Clerk v4 exports the class as window.Clerk (typeof === "function") — instantiate manually.
      // Clerk v5+ exports an already-created instance (typeof === "object") — call .load() directly.
      let clerk;
      if (typeof window.Clerk === "function") {
        // v4 style
        clerk = new window.Clerk(CLERK_PUBLISHABLE_KEY);
        await clerk.load();
      } else {
        // v5+ style — instance was created during auto-boot with data-clerk-publishable-key
        await window.Clerk.load();
        clerk = window.Clerk;
      }

      state.clerk = clerk;
      state.isLoaded = true;
      state.isLoading = false;

      // Set initial state
      updateAuthState(clerk);

      // Listen for auth changes
      clerk.addListener((emission) => {
        const wasSignedIn = state.isSignedIn;
        updateAuthState(clerk);

        if (!wasSignedIn && state.isSignedIn) {
          dispatch("auth:signed-in", { user: state.user, role: state.role });
        } else if (wasSignedIn && !state.isSignedIn) {
          dispatch("auth:signed-out");
        }
      });

      dispatch("auth:loaded");

      // If signed in, fire initial event with initial flag so listeners
      // can distinguish "already signed in on page load" from "user just signed in via modal"
      if (state.isSignedIn) {
        dispatch("auth:signed-in", { user: state.user, role: state.role, initial: true });
      }
    } catch (err) {
      console.error("[Auth] Clerk initialization failed:", err);
      state.isLoaded = true;
      state.isLoading = false;
      dispatch("auth:error", { error: err });
      dispatch("auth:loaded");
    }
  }

  function updateAuthState(clerk) {
    state.session = clerk.session;
    state.user = clerk.user;
    state.isSignedIn = !!clerk.user;
    state.role = clerk.user?.publicMetadata?.role || "free";
  }

  function dispatch(eventName, detail) {
    document.dispatchEvent(
      new CustomEvent(eventName, { detail: detail || {} })
    );
  }

  // ── Toast notification for missing auth config ─────────────────
  let toastTimeout = null;
  function showAuthUnavailableToast() {
    // Prevent duplicate toasts
    const existing = document.getElementById("auth-toast");
    if (existing) {
      clearTimeout(toastTimeout);
      existing.remove();
    }

    const toast = document.createElement("div");
    toast.id = "auth-toast";
    toast.setAttribute("role", "alert");
    toast.style.cssText =
      "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;" +
      "background:#1e293b;color:#f1f5f9;padding:14px 24px;border-radius:10px;" +
      "box-shadow:0 8px 30px rgba(0,0,0,0.4);font-family:'DM Sans',system-ui,sans-serif;" +
      "font-size:14px;line-height:1.5;max-width:420px;text-align:center;" +
      "border:1px solid rgba(99,102,241,0.3);animation:authToastIn .3s ease";

    toast.innerHTML =
      '<div style="font-weight:600;margin-bottom:4px;color:#818cf8">Authentication Unavailable</div>' +
      '<div style="color:#94a3b8">CLERK_PUBLISHABLE_KEY is not configured. ' +
      'Create a <code style="background:#334155;padding:1px 5px;border-radius:3px;font-size:12px">.env</code> file ' +
      'with your Clerk key and restart Docker.</div>';

    // Add animation keyframes if not already present
    if (!document.getElementById("auth-toast-styles")) {
      const style = document.createElement("style");
      style.id = "auth-toast-styles";
      style.textContent =
        "@keyframes authToastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}" +
        "@keyframes authToastOut{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(-10px)}}";
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    toastTimeout = setTimeout(() => {
      toast.style.animation = "authToastOut .3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // ── Auto-initialize when DOM is ready ──────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClerk);
  } else {
    initClerk();
  }
})();
