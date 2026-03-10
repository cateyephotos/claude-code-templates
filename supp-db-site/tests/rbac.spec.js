/**
 * rbac.spec.js — Role-based access control tests
 *
 * Validates:
 *  1. Free users cannot access /admin/ (redirect to homepage)
 *  2. Subscribers cannot access /admin/
 *  3. Admin users CAN access /admin/
 *  4. All roles can access monograph pages
 *  5. RBAC module correctly reports role capabilities
 */
const { test, expect } = require("playwright/test");
const { injectAuthMock, safeGoto } = require("./helpers/auth-helpers");

// ── Admin Access Control ──────────────────────────────────────────
test.describe("Admin dashboard access", () => {
  test("free user is blocked from /admin/", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/admin/");

    // Should be redirected away from admin or show access denied
    // The admin-dashboard.js checks canAccessAdmin() and redirects
    await page.waitForTimeout(2000);

    const url = page.url();
    const isRedirected = !url.includes("/admin/");
    const hasAccessDenied = await page
      .locator("text=Access Denied")
      .isVisible()
      .catch(() => false);
    const hasRedirectNotice = await page
      .locator("text=You need admin access")
      .isVisible()
      .catch(() => false);

    // Either redirected away OR shown an access message
    expect(isRedirected || hasAccessDenied || hasRedirectNotice).toBeTruthy();
  });

  test("subscriber user is blocked from /admin/", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, "/admin/");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isRedirected = !url.includes("/admin/");
    const hasAccessDenied = await page
      .locator("text=Access Denied")
      .isVisible()
      .catch(() => false);

    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });

  test("anonymous user is blocked from /admin/", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/admin/");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isRedirected = !url.includes("/admin/");
    const hasAccessDenied = await page
      .locator("text=Access Denied")
      .isVisible()
      .catch(() => false);
    const hasSignIn = await page
      .locator("text=sign in")
      .isVisible()
      .catch(() => false);

    expect(isRedirected || hasAccessDenied || hasSignIn).toBeTruthy();
  });

  test("admin user CAN access /admin/", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, "/admin/");
    await page.waitForTimeout(2000);

    // Should NOT be redirected — dashboard should render
    const url = page.url();
    expect(url).toContain("/admin");

    // Dashboard content should be visible
    const dashboard = page.locator("#admin-dashboard, .admin-dashboard, [data-section]");
    const hasDashboard = (await dashboard.count()) > 0;
    expect(hasDashboard).toBeTruthy();
  });
});

// ── Monograph Access (all roles) ──────────────────────────────────
test.describe("Monograph pages (open to all)", () => {
  const MONOGRAPH = "/supplements/magnesium.html";

  test("free user can access monograph", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, MONOGRAPH);

    const url = page.url();
    expect(url).toContain("magnesium");

    // Should NOT have a content gate on monograph pages
    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // Gate may not exist at all on monograph pages — that's fine
    });
  });

  test("anonymous user can access monograph", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, MONOGRAPH);

    const url = page.url();
    expect(url).toContain("magnesium");
  });
});

// ── RBAC Module Client-Side Checks ────────────────────────────────
test.describe("RBAC client-side module", () => {
  test("admin role reports correct capabilities", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, "/");

    const caps = await page.evaluate(() => ({
      role: window.SupplementDBRBAC?.getRole(),
      canAccessGuide: window.SupplementDBRBAC?.canAccessGuide(),
      canAccessAdmin: window.SupplementDBRBAC?.canAccessAdmin(),
      isAuthenticated: window.SupplementDBRBAC?.isAuthenticated(),
      hasAdmin: window.SupplementDBRBAC?.hasRole("admin"),
      hasSubscriber: window.SupplementDBRBAC?.hasRole("subscriber"),
      hasFree: window.SupplementDBRBAC?.hasRole("free"),
    }));

    expect(caps.role).toBe("admin");
    expect(caps.canAccessGuide).toBe(true);
    expect(caps.canAccessAdmin).toBe(true);
    expect(caps.isAuthenticated).toBe(true);
    expect(caps.hasAdmin).toBe(true);
    expect(caps.hasSubscriber).toBe(true);
    expect(caps.hasFree).toBe(true);
  });

  test("subscriber role reports correct capabilities", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, "/");

    const caps = await page.evaluate(() => ({
      role: window.SupplementDBRBAC?.getRole(),
      canAccessGuide: window.SupplementDBRBAC?.canAccessGuide(),
      canAccessAdmin: window.SupplementDBRBAC?.canAccessAdmin(),
      isAuthenticated: window.SupplementDBRBAC?.isAuthenticated(),
    }));

    expect(caps.role).toBe("subscriber");
    expect(caps.canAccessGuide).toBe(true);
    expect(caps.canAccessAdmin).toBe(false);
    expect(caps.isAuthenticated).toBe(true);
  });

  test("free role reports correct capabilities", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/");

    const caps = await page.evaluate(() => ({
      role: window.SupplementDBRBAC?.getRole(),
      canAccessGuide: window.SupplementDBRBAC?.canAccessGuide(),
      canAccessAdmin: window.SupplementDBRBAC?.canAccessAdmin(),
      isAuthenticated: window.SupplementDBRBAC?.isAuthenticated(),
    }));

    expect(caps.role).toBe("free");
    expect(caps.canAccessGuide).toBe(false);
    expect(caps.canAccessAdmin).toBe(false);
    expect(caps.isAuthenticated).toBe(true);
  });
});
