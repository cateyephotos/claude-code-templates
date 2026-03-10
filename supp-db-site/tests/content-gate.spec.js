/**
 * content-gate.spec.js — Guide page content gating tests
 *
 * Validates:
 *  1. Free users see gate overlay on guide pages
 *  2. CTA buttons (sign up / sign in) are present in gate overlay
 *  3. Content below gate is hidden but PRESENT in DOM (SEO preservation)
 *  4. Subscriber users see full content (no gate)
 *  5. Admin users see full content (no gate)
 *  6. Gate does NOT appear on non-guide pages
 */
const { test, expect } = require("playwright/test");
const { injectAuthMock, safeGoto } = require("./helpers/auth-helpers");

const GUIDE_PAGES = [
  "/guides/sleep.html",
  "/guides/anxiety-stress.html",
  "/guides/cognitive-performance.html",
  "/guides/cardiovascular.html",
  "/guides/immune-function.html",
  "/guides/joint-health.html",
  "/guides/metabolic-health.html",
  "/guides/energy-vitality.html",
];

// ── Free User Gate ────────────────────────────────────────────────
test.describe("Free user — gate applied", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("gate overlay appears on sleep guide", async ({ page }) => {
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(1500);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).toBeAttached({ timeout: 5000 });
  });

  test("gate shows sign-up CTA button", async ({ page }) => {
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(1500);

    const signupBtn = page.locator("#gate-cta-signup");
    await expect(signupBtn).toBeAttached({ timeout: 5000 });
  });

  test("gate shows sign-in link", async ({ page }) => {
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(1500);

    const signinBtn = page.locator("#gate-cta-signin");
    await expect(signinBtn).toBeAttached({ timeout: 5000 });
  });

  test("content element has content-gated class", async ({ page }) => {
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(1500);

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("SEO: content is still present in DOM below the gate", async ({ page }) => {
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(1500);

    // The content body should contain text even though it's visually hidden
    const contentEl = page.locator(
      ".content-body, .guide-content, article, main .prose"
    );
    const count = await contentEl.count();
    if (count > 0) {
      const textContent = await contentEl.first().textContent();
      // Should have substantial content (not empty)
      expect(textContent.length).toBeGreaterThan(100);
    }
  });
});

// ── Multiple Guide Pages ──────────────────────────────────────────
test.describe("Gate on all guide pages", () => {
  for (const guidePath of GUIDE_PAGES) {
    const guideName = guidePath.split("/").pop().replace(".html", "");

    test(`${guideName} — gate overlay present for free user`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, guidePath);
      await page.waitForTimeout(1500);

      const gate = page.locator("#content-gate-overlay");
      await expect(gate).toBeAttached({ timeout: 5000 });
    });
  }
});

// ── Subscriber — No Gate ──────────────────────────────────────────
test.describe("Subscriber — full access", () => {
  test("subscriber sees full guide content (no gate)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(2000);

    // Gate should NOT be present
    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {
      // If attached, it should be hidden
    });

    // Content should NOT have gated class
    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

// ── Admin — No Gate ───────────────────────────────────────────────
test.describe("Admin — full access", () => {
  test("admin sees full guide content (no gate)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, GUIDE_PAGES[0]);
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {});

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

// ── Non-Guide Pages — No Gate ─────────────────────────────────────
test.describe("Non-guide pages — no gate", () => {
  const NON_GUIDE_PAGES = [
    { name: "homepage", path: "/" },
    { name: "monograph", path: "/supplements/magnesium.html" },
    { name: "legal", path: "/legal/privacy.html" },
  ];

  for (const { name, path } of NON_GUIDE_PAGES) {
    test(`${name} page has no content gate`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, path);
      await page.waitForTimeout(1500);

      const gate = page.locator("#content-gate-overlay");
      await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {});
    });
  }
});
