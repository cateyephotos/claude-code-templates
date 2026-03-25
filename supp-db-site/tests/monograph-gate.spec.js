// @ts-check
/**
 * monograph-gate.spec.js — Monograph Preview Wall E2E tests
 *
 * Validates:
 *  1. Unauthenticated visitors see only sections 1-3 with gate overlay
 *  2. Gated sections are removed from the DOM
 *  3. Dynamic pill labels match actual section labels
 *  4. Sign-in button and subtitle are present
 *  5. Gate does not appear for signed-in users
 *  6. Gate does not appear on non-supplement pages
 *  7. Responsive: gate works on mobile viewport
 *  8. Dark theme: gate renders correctly
 *  9. Analytics: PostHog events fire correctly
 */
const { test, expect } = require("playwright/test");
const { injectAuthMock, safeGoto } = require("./helpers/auth-helpers");

const TEST_PAGE = "/supplements/creatine.html";

// ── Unauthenticated (gate shown) ────────────────────────────────
test.describe("Monograph Preview Wall — unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("gate renders for unauthenticated visitors", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    // Sections 1-3 should be visible
    await expect(page.locator("#quick-facts")).toBeAttached();
    await expect(page.locator("#overview")).toBeAttached();
    await expect(page.locator("#mechanisms")).toBeAttached();

    // Gate overlay should be visible
    await expect(page.locator(".content-gate-overlay")).toBeAttached({ timeout: 5000 });
    await expect(page.locator(".content-gate-btn-primary")).toBeAttached();

    // Gate title text
    const title = page.locator(".content-gate-title");
    await expect(title).toContainText("Sign in to continue reading");
  });

  test("gated sections are removed from DOM", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    // These section IDs should NOT exist in the DOM
    const gatedIds = ["benefits", "effect-sizes", "dosage", "safety", "enhanced-evidence", "references", "related"];
    for (const id of gatedIds) {
      const count = await page.locator("#" + id).count();
      expect(count, `Section #${id} should be removed from DOM`).toBe(0);
    }
  });

  test("dynamic pill labels match actual section labels", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    const pills = page.locator(".gate-pill");
    const count = await pills.count();
    expect(count).toBeGreaterThan(0);

    // Verify pills contain real section label text
    const pillTexts = await pills.allTextContents();
    // Creatine's section 4 label is "What the Research Shows"
    expect(pillTexts).toContain("What the Research Shows");
  });

  test("section count is dynamic", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    const countText = page.locator(".gate-section-count");
    await expect(countText).toBeAttached();
    const text = await countText.textContent();
    expect(text).toMatch(/\d+ more sections behind the gate/);
  });

  test("gate overlay has sign-in button", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    const btn = page.locator(".content-gate-btn-primary");
    await expect(btn).toContainText("Sign In / Create Account");
  });

  test("gate overlay has free account subtitle", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    const subtitle = page.locator(".gate-subtitle");
    await expect(subtitle).toContainText("Free account");
    await expect(subtitle).toContainText("No credit card required");
  });

  test("gate overlay renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    await expect(page.locator(".content-gate-overlay")).toBeAttached({ timeout: 5000 });
    await expect(page.locator(".gate-section-pills")).toBeAttached();
    await expect(page.locator(".content-gate-btn-primary")).toBeAttached();
  });

  test("gate overlay renders in dark theme", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    await expect(page.locator(".content-gate-overlay")).toBeAttached();
    // Verify pill exists and is styled (dark theme overrides applied)
    const pill = page.locator(".gate-pill").first();
    await expect(pill).toBeAttached();
  });
});

// ── Authenticated (no gate) ─────────────────────────────────────
test.describe("Monograph Preview Wall — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
  });

  test("signed-in user sees full content without gate", async ({ page }) => {
    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);

    // All sections should be present
    await expect(page.locator("#quick-facts")).toBeAttached();
    await expect(page.locator("#mechanisms")).toBeAttached();
    await expect(page.locator("#benefits")).toBeAttached();
    await expect(page.locator("#dosage")).toBeAttached();
    await expect(page.locator("#safety")).toBeAttached();

    // Gate overlay should NOT be present
    const overlay = page.locator(".content-gate-overlay");
    await expect(overlay).toHaveCount(0);
  });
});

// ── Non-supplement pages ────────────────────────────────────────
test.describe("Monograph gate — scope", () => {
  test("gate does not render on non-supplement pages", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/index.html");
    await page.waitForTimeout(1500);

    // Monograph gate overlay should not exist on homepage
    const overlay = page.locator(".content-gate-overlay");
    await expect(overlay).toHaveCount(0);
  });
});

// ── Analytics ───────────────────────────────────────────────────
test.describe("Monograph gate — analytics", () => {
  test("monograph_gate_shown event fires on gate render", async ({ page }) => {
    // Mock PostHog before auth mock
    await page.addInitScript(() => {
      window.__posthogCalls = [];
      window.posthog = {
        capture: function (event, props) {
          window.__posthogCalls.push({ event, props });
        },
        identify: function () {},
        init: function () {},
      };
    });
    await injectAuthMock(page, { signedIn: false, role: "free" });

    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(2000);

    const calls = await page.evaluate(() => window.__posthogCalls || []);
    const gateEvent = calls.find((c) => c.event === "monograph_gate_shown");
    expect(gateEvent).toBeTruthy();
    expect(gateEvent.props.supplement).toBe("creatine");
  });

  test("monograph_gate_signin_click fires on CTA click", async ({ page }) => {
    await page.addInitScript(() => {
      window.__posthogCalls = [];
      window.posthog = {
        capture: function (event, props) {
          window.__posthogCalls.push({ event, props });
        },
        identify: function () {},
        init: function () {},
      };
    });
    await injectAuthMock(page, { signedIn: false, role: "free" });

    await safeGoto(page, TEST_PAGE);
    await page.waitForTimeout(1500);
    await page.locator(".content-gate-btn-primary").click();

    const calls = await page.evaluate(() => window.__posthogCalls || []);
    const clickEvent = calls.find((c) => c.event === "monograph_gate_signin_click");
    expect(clickEvent).toBeTruthy();
  });
});
