/**
 * auth-helpers.js — Shared test utilities for SupplementDB Playwright tests
 *
 * Provides helpers for:
 *   - Waiting for page scripts to load
 *   - Mocking Clerk / Convex for isolated testing
 *   - Simulating auth states (signed-in, signed-out, different roles)
 *   - Asserting common DOM patterns (nav, gate, dashboard)
 *   - Newsletter mutation mocks for subscription flow testing
 */

/**
 * Wait until all SupplementDB modules are present on window.
 * Resolves once auth.js, convex-client.js, and rbac.js have attached
 * their global APIs, or after a timeout.
 */
async function waitForModules(page, { timeout = 8000 } = {}) {
  await page.waitForFunction(
    () =>
      typeof window.SupplementDBAuth !== "undefined" &&
      typeof window.SupplementDB !== "undefined" &&
      typeof window.SupplementDBRBAC !== "undefined",
    { timeout }
  ).catch(() => {
    // Modules may not load if Clerk/Convex keys are missing —
    // tests that need them should mock first
  });
}

/**
 * Inject mock Clerk + Convex globals BEFORE the page navigates.
 * Call this BEFORE page.goto() so the real scripts find the mocks
 * already in place and skip their CDN initialisation.
 *
 * @param {import('playwright/test').Page} page
 * @param {object} opts
 * @param {string}  opts.role  - "admin" | "subscriber" | "free"
 * @param {boolean} opts.signedIn - whether user is signed in
 */
async function injectAuthMock(page, { role = "free", signedIn = false } = {}) {
  await page.addInitScript(
    ({ role, signedIn }) => {
      // ── Mock Clerk ────────────────────────────────────────────
      const mockUser = signedIn
        ? {
            id: "user_test_" + role,
            firstName: "Test",
            lastName: role.charAt(0).toUpperCase() + role.slice(1),
            fullName: "Test " + role.charAt(0).toUpperCase() + role.slice(1),
            primaryEmailAddress: { emailAddress: `test-${role}@supplementdb.test` },
            imageUrl: "",
            publicMetadata: { role },
          }
        : null;

      window.__CLERK_MOCK__ = true;

      // Prevent real Clerk from loading
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: signedIn
            ? { getToken: () => Promise.resolve("mock-jwt-" + role) }
            : null,
          user: mockUser,
          addListener: () => {},
          openSignIn: () => {},
          openSignUp: () => {},
          signOut: () => {},
          mountUserButton: () => {},
        },
        writable: false,
        configurable: false,
      });

      // ── Mock SupplementDBAuth ─────────────────────────────────
      window.SupplementDBAuth = {
        isLoaded: true,
        isSignedIn: signedIn,
        user: mockUser,
        session: signedIn ? { getToken: () => Promise.resolve("mock") } : null,
        role,
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      // ── Mock RBAC ─────────────────────────────────────────────
      const roleLevel = { admin: 3, subscriber: 2, free: 1 }[role] || 1;
      window.SupplementDBRBAC = {
        getRole: () => role,
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return roleLevel >= (map[r] || 0);
        },
        canAccessGuide: () => roleLevel >= 2,
        canAccessAdmin: () => roleLevel >= 3,
        isAuthenticated: () => signedIn,
      };

      // ── Mock Convex client ────────────────────────────────────
      // Includes default newsletter mutation responses so confirm.html
      // and unsubscribe.html don't hang waiting for Convex.
      window.SupplementDB = {
        query: (name) => {
          // Default admin query responses for dashboard tests
          if (name === "newsletter:getNewsletterStats") {
            return Promise.resolve({
              total: 0, confirmed: 0, pending: 0,
              unsubscribed: 0, last7Days: 0, last30Days: 0,
            });
          }
          if (name === "newsletter:getSubscriberGrowth") {
            return Promise.resolve([]);
          }
          return Promise.resolve(null);
        },
        mutation: (name, args) => {
          // Default newsletter mutation responses
          if (name === "newsletter:subscribe") {
            return Promise.resolve({ status: "pending" });
          }
          if (name === "newsletter:confirm") {
            return Promise.resolve({ status: "confirmed" });
          }
          if (name === "newsletter:unsubscribe") {
            return Promise.resolve({ status: "unsubscribed" });
          }
          return Promise.resolve(null);
        },
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_" + Date.now(),
        recordPageView: () => {},
      };

      // Fire auth:loaded event once DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          if (signedIn) {
            document.dispatchEvent(new CustomEvent("auth:signed-in"));
          }
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          if (signedIn) {
            document.dispatchEvent(new CustomEvent("auth:signed-in"));
          }
        }, 0);
      }
    },
    { role, signedIn }
  );
}

/**
 * Collect all JS console errors during a page visit.
 * Returns an array of error message strings.
 */
function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });
  return errors;
}

/**
 * Navigate and wait for network idle.
 */
async function safeGoto(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }).catch(() =>
    page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 })
  );
}

/**
 * Filter out known non-critical console errors (PostHog, CORS, CDN, etc.).
 * Returns only errors that indicate genuine JS bugs in our code.
 */
function filterCriticalErrors(errors) {
  return errors.filter(
    (e) =>
      !e.includes("posthog") &&
      !e.includes("PostHog") &&
      !e.includes("net::ERR") &&
      !e.includes("favicon") &&
      !e.includes("ERR_CONNECTION_REFUSED") &&
      !e.includes("Failed to load resource") &&
      !e.includes("CORS") &&
      !e.includes("Access-Control-Allow-Origin") &&
      !e.includes("unpkg.com") &&
      !e.includes("Newsletter Convex error") &&
      !e.includes("Poll query error")
  );
}

module.exports = {
  waitForModules,
  injectAuthMock,
  collectConsoleErrors,
  filterCriticalErrors,
  safeGoto,
};
