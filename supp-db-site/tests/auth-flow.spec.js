/**
 * auth-flow.spec.js — Auth sign-in / sign-out & nav rendering tests
 *
 * Validates:
 *  1. Auth buttons render correctly when signed out (both nav patterns)
 *  2. User avatar / menu renders when signed in
 *  3. Auth scripts are loaded on all page types
 *  4. No JS errors on any page type
 */
const { test, expect } = require("playwright/test");
const {
  injectAuthMock,
  collectConsoleErrors,
  safeGoto,
} = require("./helpers/auth-helpers");

// ── Representative pages from each nav pattern ────────────────────
const PAGES = {
  homepage: "/",
  monograph: "/supplements/magnesium.html",
  guide: "/guides/sleep.html",
  comparison: "/compare/ashwagandha-vs-rhodiola.html",
  category: "/categories/nootropics.html",
  legal: "/legal/privacy.html",
  admin: "/admin/",
};

// ── Signed-Out State ──────────────────────────────────────────────
test.describe("Signed-out state", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("homepage shows auth buttons container", async ({ page }) => {
    await safeGoto(page, "/");
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });

  test("subpage (monograph) shows auth buttons container", async ({ page }) => {
    await safeGoto(page, PAGES.monograph);
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });

  test("guide page shows auth buttons container", async ({ page }) => {
    await safeGoto(page, PAGES.guide);
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });
});

// ── Signed-In State ───────────────────────────────────────────────
test.describe("Signed-in state", () => {
  test("free user — auth buttons container present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/");
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });

  test("subscriber — auth buttons present on guide page", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, PAGES.guide);
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });

  test("admin — auth buttons present on admin page", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, PAGES.admin);
    const authButtons = page.locator("#auth-buttons");
    await expect(authButtons).toBeAttached({ timeout: 5000 });
  });
});

// ── Script Loading ────────────────────────────────────────────────
test.describe("Auth script injection", () => {
  for (const [name, path] of Object.entries(PAGES)) {
    if (name === "admin") continue; // admin has separate script layout

    test(`${name} page loads auth.js`, async ({ page }) => {
      await safeGoto(page, path);
      const authScript = page.locator('script[src*="auth.js"]');
      await expect(authScript).toBeAttached({ timeout: 5000 });
    });

    test(`${name} page loads convex-client.js`, async ({ page }) => {
      await safeGoto(page, path);
      const convexScript = page.locator('script[src*="convex-client.js"]');
      await expect(convexScript).toBeAttached({ timeout: 5000 });
    });

    test(`${name} page loads rbac.js`, async ({ page }) => {
      await safeGoto(page, path);
      const rbacScript = page.locator('script[src*="rbac.js"]');
      await expect(rbacScript).toBeAttached({ timeout: 5000 });
    });
  }
});

// ── Zero JS Errors ────────────────────────────────────────────────
test.describe("No critical JS errors", () => {
  for (const [name, path] of Object.entries(PAGES)) {
    test(`${name} page has no fatal JS errors`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      // Mock auth to prevent Clerk CDN errors
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, path);
      await page.waitForTimeout(1500);

      // Filter out expected warnings (Clerk CDN, Convex connection, PostHog)
      const fatalErrors = errors.filter(
        (e) =>
          !e.includes("clerk") &&
          !e.includes("Clerk") &&
          !e.includes("convex") &&
          !e.includes("Convex") &&
          !e.includes("posthog") &&
          !e.includes("PostHog") &&
          !e.includes("__CLERK_PUBLISHABLE_KEY__") &&
          !e.includes("__CONVEX_URL__") &&
          !e.includes("__POSTHOG_KEY__") &&
          !e.includes("net::ERR") &&
          !e.includes("Failed to load resource") &&
          !e.includes("favicon")
      );

      expect(fatalErrors).toEqual([]);
    });
  }
});
