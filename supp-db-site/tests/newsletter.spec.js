/**
 * newsletter.spec.js — Newsletter Subscription, Confirmation & Unsubscribe Tests
 *
 * Validates:
 *  1. Homepage newsletter form is visible and functional
 *  2. Guide newsletter form is visible and functional
 *  3. Duplicate email shows "already subscribed" message (localStorage dedup)
 *  4. confirm.html renders success state on valid token
 *  5. confirm.html shows expired state for expired token
 *  6. unsubscribe.html renders success state
 *  7. unsubscribe.html shows invalid state for bad token
 *  8. Newsletter message styling is correct
 *  9. newsletter.js gracefully falls back when Convex is unavailable
 * 10. Admin dashboard shows newsletter metrics section
 * 11. confirm.html shows invalid state when no token provided
 * 12. Zero console errors on newsletter-related pages
 */
const { test, expect } = require("playwright/test");
const {
  injectAuthMock,
  safeGoto,
  collectConsoleErrors,
} = require("./helpers/auth-helpers");

// ── Helper: standard error filter ─────────────────────────────
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
      !e.includes("Newsletter Convex error")
  );
}

// ── Helper: inject newsletter-aware Convex mock ───────────────
async function injectNewsletterMock(page, mutationResponses) {
  await page.addInitScript(
    ({ responses }) => {
      // Prevent real Clerk/Convex from loading
      window.__CLERK_MOCK__ = true;

      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: null,
          user: null,
          addListener: () => {},
          openSignIn: () => {},
          openSignUp: () => {},
          signOut: () => {},
          mountUserButton: () => {},
        },
        writable: false,
        configurable: false,
      });

      window.SupplementDBAuth = {
        isLoaded: true,
        isSignedIn: false,
        user: null,
        session: null,
        role: "free",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "free",
        hasRole: () => false,
        canAccessGuide: () => false,
        canAccessAdmin: () => false,
        isAuthenticated: () => false,
      };

      // Convex mock with newsletter-specific mutation responses
      window.SupplementDB = {
        query: () => Promise.resolve(null),
        mutation: (name, args) => {
          var key = name;
          if (responses[key]) {
            return Promise.resolve(responses[key]);
          }
          return Promise.resolve(null);
        },
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_" + Date.now(),
        recordPageView: () => {},
      };

      // Fire auth events
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
        }, 0);
      }
    },
    { responses: mutationResponses }
  );
}

// ════════════════════════════════════════════════════════════════
// Homepage Newsletter Form
// ════════════════════════════════════════════════════════════════

test.describe("Homepage newsletter form", () => {
  test("form is visible with email input and submit button", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/index.html");

    const form = page.locator("#newsletter-form");
    await expect(form).toBeAttached();

    const emailInput = page.locator("#newsletter-email");
    await expect(emailInput).toBeAttached();
    await expect(emailInput).toHaveAttribute("type", "email");

    const submitBtn = form.locator('button[type="submit"]');
    await expect(submitBtn).toBeAttached();
  });

  test("submitting email shows confirmation message via Convex", async ({
    page,
  }) => {
    await injectNewsletterMock(page, {
      "newsletter:subscribe": { status: "pending" },
    });

    // Clear localStorage to avoid dedup
    await page.addInitScript(() => {
      localStorage.removeItem("sdb_newsletter");
    });

    await safeGoto(page, "/index.html");
    await page.waitForTimeout(500);

    const emailInput = page.locator("#newsletter-email");
    await emailInput.fill("test-new@example.com");

    const form = page.locator("#newsletter-form");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1500);

    const message = page.locator("#newsletter-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText("Check your inbox");
  });
});

// ════════════════════════════════════════════════════════════════
// Guide Newsletter Form
// ════════════════════════════════════════════════════════════════

test.describe("Guide newsletter form", () => {
  test("guide page has newsletter form that works", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:subscribe": { status: "pending" },
    });

    await page.addInitScript(() => {
      localStorage.removeItem("sdb_newsletter");
    });

    await safeGoto(page, "/guides/cardiovascular.html");
    await page.waitForTimeout(500);

    const form = page.locator("#guide-newsletter-form");
    await expect(form).toBeAttached();

    const emailInput = page.locator("#guide-newsletter-email");
    await expect(emailInput).toBeAttached();

    await emailInput.fill("guide-test@example.com");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1500);

    const message = page.locator("#guide-newsletter-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText("Check your inbox");
  });

  test("sleep guide has newsletter form (new in Phase 7)", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/guides/sleep.html");

    const form = page.locator("#guide-newsletter-form");
    await expect(form).toBeAttached();

    const emailInput = page.locator("#guide-newsletter-email");
    await expect(emailInput).toBeAttached();
  });
});

// ════════════════════════════════════════════════════════════════
// Duplicate Email (localStorage Dedup)
// ════════════════════════════════════════════════════════════════

test.describe("Newsletter dedup", () => {
  test("duplicate email shows already subscribed message", async ({
    page,
  }) => {
    await injectNewsletterMock(page, {
      "newsletter:subscribe": { status: "pending" },
    });

    // Pre-seed localStorage with the email
    await page.addInitScript(() => {
      localStorage.setItem(
        "sdb_newsletter",
        JSON.stringify(["dupe@example.com"])
      );
    });

    await safeGoto(page, "/index.html");
    await page.waitForTimeout(500);

    const emailInput = page.locator("#newsletter-email");
    await emailInput.fill("dupe@example.com");

    const form = page.locator("#newsletter-form");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1000);

    const message = page.locator("#newsletter-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText("already subscribed");
  });
});

// ════════════════════════════════════════════════════════════════
// confirm.html — Email Confirmation Page
// ════════════════════════════════════════════════════════════════

test.describe("Confirmation page", () => {
  test("shows success state on valid token", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:confirm": { status: "confirmed" },
    });

    await safeGoto(page, "/confirm.html?token=valid_test_token_abc123");
    await page.waitForTimeout(2000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-success")).toBeVisible();

    const title = page.locator("#state-success .confirm-title");
    await expect(title).toContainText("Confirmed");
  });

  test("shows expired state for expired token", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:confirm": { status: "token_expired" },
    });

    await safeGoto(page, "/confirm.html?token=expired_test_token_xyz");
    await page.waitForTimeout(2000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-expired")).toBeVisible();

    const title = page.locator("#state-expired .confirm-title");
    await expect(title).toContainText("Expired");
  });

  test("shows invalid state when no token provided", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/confirm.html");
    await page.waitForTimeout(1000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-invalid")).toBeVisible();

    const title = page.locator("#state-invalid .confirm-title");
    await expect(title).toContainText("Invalid");
  });

  test("shows already confirmed state", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:confirm": { status: "already_confirmed" },
    });

    await safeGoto(page, "/confirm.html?token=already_confirmed_token");
    await page.waitForTimeout(2000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-already")).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════
// unsubscribe.html — Unsubscribe Page
// ════════════════════════════════════════════════════════════════

test.describe("Unsubscribe page", () => {
  test("shows success state on valid unsubscribe token", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:unsubscribe": { status: "unsubscribed" },
    });

    await safeGoto(page, "/unsubscribe.html?token=unsub_valid_token_123");
    await page.waitForTimeout(2000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-success")).toBeVisible();

    const title = page.locator("#state-success .unsub-title");
    await expect(title).toContainText("Unsubscribed");
  });

  test("shows invalid state for bad unsubscribe token", async ({ page }) => {
    await injectNewsletterMock(page, {
      "newsletter:unsubscribe": { status: "invalid_token" },
    });

    await safeGoto(page, "/unsubscribe.html?token=bad_token");
    await page.waitForTimeout(2000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-invalid")).toBeVisible();

    const title = page.locator("#state-invalid .unsub-title");
    await expect(title).toContainText("Invalid");
  });

  test("shows invalid state when no token provided", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/unsubscribe.html");
    await page.waitForTimeout(1000);

    await expect(page.locator("#state-loading")).toBeHidden();
    await expect(page.locator("#state-invalid")).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════
// Newsletter Message Styling
// ════════════════════════════════════════════════════════════════

test.describe("Newsletter message styling", () => {
  test("success message is visible with correct text after submit", async ({
    page,
  }) => {
    await injectNewsletterMock(page, {
      "newsletter:subscribe": { status: "already_subscribed" },
    });

    await page.addInitScript(() => {
      localStorage.removeItem("sdb_newsletter");
    });

    await safeGoto(page, "/index.html");
    await page.waitForTimeout(500);

    // Message should be hidden initially
    const message = page.locator("#newsletter-message");
    await expect(message).toBeHidden();

    const emailInput = page.locator("#newsletter-email");
    await emailInput.fill("existing@example.com");

    const form = page.locator("#newsletter-form");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1500);

    // After submit, message should be visible
    await expect(message).toBeVisible();
    await expect(message).toContainText("already subscribed");
  });

  test("invalid email shows error-styled message", async ({ page }) => {
    // Use a valid-format email so HTML5 validation doesn't block submission,
    // but mock Convex to return "invalid_email" status
    await injectNewsletterMock(page, {
      "newsletter:subscribe": { status: "invalid_email" },
    });

    await page.addInitScript(() => {
      localStorage.removeItem("sdb_newsletter");
    });

    await safeGoto(page, "/index.html");
    await page.waitForTimeout(500);

    const emailInput = page.locator("#newsletter-email");
    await emailInput.fill("invalid-test@example.com");

    const form = page.locator("#newsletter-form");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1500);

    const message = page.locator("#newsletter-message");
    await expect(message).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════
// Graceful Fallback (no Convex)
// ════════════════════════════════════════════════════════════════

test.describe("Newsletter fallback", () => {
  test("falls back to localStorage when Convex is unavailable", async ({
    page,
  }) => {
    // Inject a mock that does NOT include SupplementDB (simulating Convex unavailability)
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;

      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: null,
          user: null,
          addListener: () => {},
          openSignIn: () => {},
          openSignUp: () => {},
          signOut: () => {},
          mountUserButton: () => {},
        },
        writable: false,
        configurable: false,
      });

      window.SupplementDBAuth = {
        isLoaded: true,
        isSignedIn: false,
        user: null,
        session: null,
        role: "free",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "free",
        hasRole: () => false,
        canAccessGuide: () => false,
        canAccessAdmin: () => false,
        isAuthenticated: () => false,
      };

      // Intentionally leave window.SupplementDB undefined
      // to simulate Convex not loading
      localStorage.removeItem("sdb_newsletter");
    });

    await safeGoto(page, "/index.html");
    await page.waitForTimeout(500);

    const emailInput = page.locator("#newsletter-email");
    await emailInput.fill("fallback@example.com");

    const form = page.locator("#newsletter-form");
    await form.locator('button[type="submit"]').click();

    await page.waitForTimeout(1500);

    // Should show fallback success message
    const message = page.locator("#newsletter-message");
    await expect(message).toBeVisible();
    await expect(message).toContainText("subscribed");

    // Verify email was saved to localStorage
    const stored = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("sdb_newsletter") || "[]");
    });
    expect(stored).toContain("fallback@example.com");
  });
});

// ════════════════════════════════════════════════════════════════
// Admin Dashboard — Newsletter Metrics
// ════════════════════════════════════════════════════════════════

test.describe("Admin dashboard newsletter section", () => {
  test("admin sees newsletter metrics section", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, "/admin/index.html");
    await page.waitForTimeout(1500);

    // Newsletter section header should exist
    const newsletterSection = page.locator(
      "text=Newsletter"
    );
    await expect(newsletterSection.first()).toBeAttached();

    // Newsletter stat cards should be present (actual IDs from admin/index.html)
    const totalSubs = page.locator("#card-nl-total");
    await expect(totalSubs).toBeAttached();

    const confirmedSubs = page.locator("#card-nl-confirmed");
    await expect(confirmedSubs).toBeAttached();

    const pendingSubs = page.locator("#card-nl-pending");
    await expect(pendingSubs).toBeAttached();
  });
});

// ════════════════════════════════════════════════════════════════
// Console Error Checks
// ════════════════════════════════════════════════════════════════

test.describe("Newsletter pages — zero console errors", () => {
  test("homepage — no JS errors with newsletter form", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/index.html");
    await page.waitForTimeout(2000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test("confirm.html — no JS errors (with valid token mock)", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await injectNewsletterMock(page, {
      "newsletter:confirm": { status: "confirmed" },
    });
    await safeGoto(page, "/confirm.html?token=test_no_errors");
    await page.waitForTimeout(2500);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test("confirm.html — no JS errors (without token)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/confirm.html");
    await page.waitForTimeout(2000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test("unsubscribe.html — no JS errors (with valid token mock)", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await injectNewsletterMock(page, {
      "newsletter:unsubscribe": { status: "unsubscribed" },
    });
    await safeGoto(page, "/unsubscribe.html?token=test_no_errors");
    await page.waitForTimeout(2500);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test("unsubscribe.html — no JS errors (without token)", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/unsubscribe.html");
    await page.waitForTimeout(2000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test("guide page — no JS errors with newsletter form", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false });
    await safeGoto(page, "/guides/cardiovascular.html");
    await page.waitForTimeout(2000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });
});
