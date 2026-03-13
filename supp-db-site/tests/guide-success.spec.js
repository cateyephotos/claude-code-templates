/**
 * guide-success.spec.js — UI state tests for guide-success.html
 *
 * Tests the 5 UI states driven by the Convex purchase polling loop:
 *
 *   1. Missing ?session_id   → #state-error  (instant, no auth needed)
 *   2. User not signed in    → #state-error  (auth check fails)
 *   3. status "pdf_ready"    → #state-success (download btn, badge, guide link)
 *   4. status "failed"       → #state-failed  (error detail visible)
 *   5. status null (timeout) → #state-processing (Check Again btn, 30 s poll)
 *
 * Strategy: inject auth + Convex mocks via addInitScript BEFORE page.goto(),
 * so the real page scripts (auth.js, convex-client.js) find the mocks already
 * in place and skip their CDN initialisation entirely.
 *
 * The nginx static server on http://localhost:8080 must be running.
 */
const { test, expect } = require("playwright/test");
const {
  injectAuthMock,
  injectConvexPurchaseMock,
  collectConsoleErrors,
  filterCriticalErrors,
} = require("./helpers/auth-helpers");

const BASE_URL = process.env.SUPP_DB_URL || "http://localhost:8080";
const SUCCESS_URL = `${BASE_URL}/guide-success.html`;

// ── Test 1: Missing session_id ─────────────────────────────────────────────
test.describe("guide-success.html — missing session_id", () => {
  test("shows error state immediately when ?session_id is absent", async ({ page }) => {
    const errors = collectConsoleErrors(page);

    // Signed-in user, but no mock purchase needed — error shows before auth
    await injectAuthMock(page, { role: "subscriber", signedIn: true });
    await injectConvexPurchaseMock(page, { status: "pdf_ready" });

    // Navigate WITHOUT session_id param
    await page.goto(SUCCESS_URL, { waitUntil: "domcontentloaded", timeout: 15000 });

    // #state-error must be visible
    await expect(page.locator("#state-error")).toBeVisible({ timeout: 5000 });

    // Error message must mention the missing session
    const msg = page.locator("#error-message");
    await expect(msg).toContainText(/no checkout session/i);

    // Other states must be hidden
    await expect(page.locator("#state-loading")).not.toBeVisible();
    await expect(page.locator("#state-success")).not.toBeVisible();

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });
});

// ── Test 2: Not signed in ──────────────────────────────────────────────────
test.describe("guide-success.html — user not signed in", () => {
  test("shows error state with sign-in message when user is signed out", async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await injectAuthMock(page, { role: "free", signedIn: false });
    await injectConvexPurchaseMock(page, { status: "pdf_ready" });

    await page.goto(
      `${SUCCESS_URL}?session_id=cs_test_noauth`,
      { waitUntil: "domcontentloaded", timeout: 15000 }
    );

    // Auth state is injected as already-loaded (isLoaded: true, isSignedIn: false)
    // so beginPoll() runs immediately and fires showError("Please sign in…")
    await expect(page.locator("#state-error")).toBeVisible({ timeout: 6000 });

    const msg = page.locator("#error-message");
    await expect(msg).toContainText(/sign in/i);

    await expect(page.locator("#state-loading")).not.toBeVisible();
    await expect(page.locator("#state-success")).not.toBeVisible();

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });
});

// ── Test 3: pdf_ready → success state ────────────────────────────────────
test.describe("guide-success.html — pdf_ready status", () => {
  test("shows success state with download button, guide badge, and guide link", async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await injectAuthMock(page, { role: "subscriber", signedIn: true });
    await injectConvexPurchaseMock(page, {
      status: "pdf_ready",
      sessionId: "cs_test_ready",
      guideSlug: "sleep",
      guideName: "Sleep Optimization Guide",
      downloadUrl: "https://cdn.supplementdb.com/test-sleep.pdf",
    });

    await page.goto(
      `${SUCCESS_URL}?session_id=cs_test_ready`,
      { waitUntil: "domcontentloaded", timeout: 15000 }
    );

    // Success state must appear within a reasonable time (first poll returns immediately)
    await expect(page.locator("#state-success")).toBeVisible({ timeout: 10000 });

    // Loading state hidden
    await expect(page.locator("#state-loading")).not.toBeVisible();

    // Download button is present and enabled
    const downloadBtn = page.locator("#download-btn");
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();

    // Guide badge shows guide name
    const guideBadge = page.locator("#guide-badge");
    await expect(guideBadge).toBeVisible();
    await expect(page.locator("#guide-name-label")).toHaveText("Sleep Optimization Guide");

    // Guide link points to the correct guide
    const guideLink = page.locator("#guide-link");
    await expect(guideLink).toBeVisible();
    const href = await guideLink.getAttribute("href");
    expect(href).toContain("sleep.html");

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });
});

// ── Test 4: failed status ─────────────────────────────────────────────────
test.describe("guide-success.html — failed status", () => {
  test("shows failed state with error detail when purchase status is 'failed'", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const FAIL_MSG = "Puppeteer crashed during render";

    await injectAuthMock(page, { role: "subscriber", signedIn: true });
    await injectConvexPurchaseMock(page, {
      status: "failed",
      sessionId: "cs_test_failed",
      guideSlug: "sleep",
      guideName: "Sleep Optimization Guide",
      errorMessage: FAIL_MSG,
    });

    await page.goto(
      `${SUCCESS_URL}?session_id=cs_test_failed`,
      { waitUntil: "domcontentloaded", timeout: 15000 }
    );

    // Failed state must be visible
    await expect(page.locator("#state-failed")).toBeVisible({ timeout: 10000 });

    // Loading and success states must be hidden
    await expect(page.locator("#state-loading")).not.toBeVisible();
    await expect(page.locator("#state-success")).not.toBeVisible();

    // Failed detail panel is visible and contains the error message
    const failedDetail = page.locator("#failed-detail");
    await expect(failedDetail).toBeVisible();
    await expect(failedDetail).toContainText(FAIL_MSG);

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });
});

// ── Test 5: poll timeout → processing state ───────────────────────────────
test.describe("guide-success.html — poll timeout (no purchase record)", () => {
  // MAX_POLL_MS is 30 s in the page; we give 33 s for the state transition
  // plus overhead, and set an outer test timeout of 40 s.
  test.setTimeout(40_000);

  test("shows processing state after 30 s when purchase is never found", async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await injectAuthMock(page, { role: "subscriber", signedIn: true });
    // status: null causes guidePurchases:getBySessionId to always resolve null
    await injectConvexPurchaseMock(page, { status: null, sessionId: "cs_test_timeout" });

    await page.goto(
      `${SUCCESS_URL}?session_id=cs_test_timeout`,
      { waitUntil: "domcontentloaded", timeout: 15000 }
    );

    // While polling, loading state should be visible
    await expect(page.locator("#state-loading")).toBeVisible({ timeout: 5000 });

    // After 30 s of failed polls, processing state should appear
    await expect(page.locator("#state-processing")).toBeVisible({ timeout: 33_000 });

    // Loading state must now be hidden
    await expect(page.locator("#state-loading")).not.toBeVisible();
    await expect(page.locator("#state-success")).not.toBeVisible();
    await expect(page.locator("#state-failed")).not.toBeVisible();

    // "Check Again" button must be present
    const checkAgainBtn = page.locator("#state-processing button", { hasText: /check again/i });
    await expect(checkAgainBtn).toBeVisible();

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });
});
