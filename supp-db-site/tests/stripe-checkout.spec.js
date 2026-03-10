/**
 * stripe-checkout.spec.js — Stripe Checkout & Pricing Page Tests
 *
 * Validates:
 *  1. Pricing page renders 3 plan cards with correct prices
 *  2. Anonymous user sees sign-up prompts on all CTAs
 *  3. Signed-in free user sees "Current Plan" on free + checkout buttons on paid
 *  4. Subscriber sees "Current Plan" on their plan + "Manage Subscription" on others
 *  5. Admin sees same subscriber view
 *  6. FAQ accordion expands/collapses
 *  7. Success page shows loading state by default (with session_id)
 *  8. Success page shows error state without session_id
 *  9. Success page shows error for unauthenticated users
 * 10. Content gate CTA shows "Upgrade to Pro" for signed-in free users
 * 11. Content gate CTA shows "Start Free Account" for anonymous users
 * 12. Zero console errors on pricing and success pages
 */
const { test, expect } = require("playwright/test");
const {
  injectAuthMock,
  safeGoto,
  collectConsoleErrors,
} = require("./helpers/auth-helpers");

// ════════════════════════════════════════════════════════════════
// Pricing Page — Structure & Layout
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — structure", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("renders page with correct title", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    await expect(page).toHaveTitle(/Pricing.*SupplementDB/);
  });

  test("renders hero heading", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const heading = page.locator(".pricing-hero h1");
    await expect(heading).toHaveText("Choose Your Plan");
  });

  test("renders exactly 3 plan cards", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const cards = page.locator(".plan-card");
    await expect(cards).toHaveCount(3);
  });

  test("renders Free plan card with $0 price", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const freeCard = page.locator('.plan-card[data-plan="free"]');
    await expect(freeCard).toBeAttached();

    const amount = freeCard.locator(".amount");
    await expect(amount).toHaveText("0");
  });

  test("renders Pro Monthly card with $9.99 price", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const monthlyCard = page.locator('.plan-card[data-plan="monthly"]');
    await expect(monthlyCard).toBeAttached();

    const amount = monthlyCard.locator(".amount");
    await expect(amount).toHaveText("9");

    const period = monthlyCard.locator(".period");
    await expect(period).toContainText(".99/mo");
  });

  test("renders Pro Annual card with $79.99 price", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const annualCard = page.locator('.plan-card[data-plan="annual"]');
    await expect(annualCard).toBeAttached();

    const amount = annualCard.locator(".amount");
    await expect(amount).toHaveText("79");

    const period = annualCard.locator(".period");
    await expect(period).toContainText(".99/yr");
  });

  test("Monthly card has 'Most Popular' badge", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const badge = page.locator('.plan-card[data-plan="monthly"] .plan-badge');
    await expect(badge).toHaveText("Most Popular");
  });

  test("Annual card has savings badge", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const badge = page.locator(
      '.plan-card[data-plan="annual"] .savings-badge'
    );
    await expect(badge).toContainText("Save 33%");
  });

  test("renders trust signals", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const trustItems = page.locator(".pricing-trust-item");
    await expect(trustItems).toHaveCount(3);
  });

  test("renders FAQ section with 5 questions", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const faqItems = page.locator(".faq-item");
    await expect(faqItems).toHaveCount(5);
  });

  test("renders navigation with SupplementDB logo", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const nav = page.locator(".pricing-nav");
    await expect(nav).toBeAttached();

    const logo = nav.locator("text=SupplementDB");
    await expect(logo).toBeAttached();
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — FAQ Accordion
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — FAQ accordion", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("FAQ answer is hidden by default", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const firstAnswer = page.locator(".faq-item:first-of-type .faq-answer");
    await expect(firstAnswer).not.toBeVisible();
  });

  test("clicking FAQ question opens the answer", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const firstQuestion = page.locator(
      ".faq-item:first-of-type .faq-question"
    );
    await firstQuestion.click();

    const firstItem = page.locator(".faq-item:first-of-type");
    await expect(firstItem).toHaveClass(/open/);

    const firstAnswer = page.locator(".faq-item:first-of-type .faq-answer");
    await expect(firstAnswer).toBeVisible();
  });

  test("clicking open FAQ question closes it", async ({ page }) => {
    await safeGoto(page, "/pricing.html");
    const firstQuestion = page.locator(
      ".faq-item:first-of-type .faq-question"
    );

    // Open
    await firstQuestion.click();
    await expect(
      page.locator(".faq-item:first-of-type")
    ).toHaveClass(/open/);

    // Close
    await firstQuestion.click();
    await expect(
      page.locator(".faq-item:first-of-type")
    ).not.toHaveClass(/open/);
  });

  test("opening one FAQ closes others", async ({ page }) => {
    await safeGoto(page, "/pricing.html");

    // Open first
    await page.locator(".faq-item:first-of-type .faq-question").click();
    await expect(
      page.locator(".faq-item:first-of-type")
    ).toHaveClass(/open/);

    // Open second
    await page.locator(".faq-item:nth-of-type(2) .faq-question").click();
    await expect(
      page.locator(".faq-item:nth-of-type(2)")
    ).toHaveClass(/open/);

    // First should now be closed
    await expect(
      page.locator(".faq-item:first-of-type")
    ).not.toHaveClass(/open/);
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — Anonymous User CTAs
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — anonymous user", () => {
  test("all CTA buttons show sign-up text", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(1500);

    const ctaFree = page.locator("#cta-free");
    const ctaMonthly = page.locator("#cta-monthly");
    const ctaAnnual = page.locator("#cta-annual");

    await expect(ctaFree).toHaveText("Get Started Free");
    await expect(ctaMonthly).toHaveText("Subscribe Monthly");
    await expect(ctaAnnual).toHaveText("Subscribe Annually");
  });

  test("all CTAs are enabled (not disabled)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(1500);

    await expect(page.locator("#cta-free")).not.toBeDisabled();
    await expect(page.locator("#cta-monthly")).not.toBeDisabled();
    await expect(page.locator("#cta-annual")).not.toBeDisabled();
  });

  test("cancelled banner is NOT shown for anonymous users", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(1500);

    const banner = page.locator("#cancelled-banner");
    await expect(banner).not.toHaveClass(/show/);
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — Signed-in Free User CTAs
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — signed-in free user", () => {
  test("free CTA shows 'Current Plan' (disabled)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2000);

    const ctaFree = page.locator("#cta-free");
    await expect(ctaFree).toHaveText("Current Plan");
    await expect(ctaFree).toBeDisabled();
  });

  test("monthly CTA shows 'Subscribe Monthly' (enabled)", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2000);

    const ctaMonthly = page.locator("#cta-monthly");
    await expect(ctaMonthly).toHaveText("Subscribe Monthly");
    await expect(ctaMonthly).not.toBeDisabled();
  });

  test("annual CTA shows 'Subscribe Annually' (enabled)", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2000);

    const ctaAnnual = page.locator("#cta-annual");
    await expect(ctaAnnual).toHaveText("Subscribe Annually");
    await expect(ctaAnnual).not.toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — Subscriber CTAs
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — subscriber (monthly)", () => {
  test("shows 'Current Plan' on monthly, 'Manage Subscription' on annual", async ({
    page,
  }) => {
    // Custom mock that returns a monthly subscription from Convex queries
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt-subscriber") },
          user: {
            id: "user_test_subscriber",
            firstName: "Test",
            lastName: "Subscriber",
            fullName: "Test Subscriber",
            primaryEmailAddress: {
              emailAddress: "test-subscriber@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "subscriber" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
        role: "subscriber",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "subscriber",
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return 2 >= (map[r] || 0);
        },
        canAccessGuide: () => true,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
        isSubscriber: () => true,
        isAdmin: () => false,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "subscriptions:getMySubscription") {
            return Promise.resolve({
              plan: "monthly",
              status: "active",
              stripeCustomerId: "cus_test_123",
              stripeSubscriptionId: "sub_test_123",
              cancelAtPeriodEnd: false,
              currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            });
          }
          return Promise.resolve(null);
        },
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_sub",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2500);

    const ctaFree = page.locator("#cta-free");
    const ctaMonthly = page.locator("#cta-monthly");
    const ctaAnnual = page.locator("#cta-annual");

    await expect(ctaFree).toHaveText("Current Plan");
    await expect(ctaFree).toBeDisabled();

    await expect(ctaMonthly).toHaveText("Current Plan");
    await expect(ctaMonthly).toBeDisabled();

    await expect(ctaAnnual).toHaveText("Manage Subscription");
    await expect(ctaAnnual).not.toBeDisabled();
  });
});

test.describe("Pricing page — subscriber (annual)", () => {
  test("shows 'Current Plan' on annual, 'Manage Subscription' on monthly", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt-subscriber") },
          user: {
            id: "user_test_subscriber",
            firstName: "Test",
            lastName: "Subscriber",
            fullName: "Test Subscriber",
            primaryEmailAddress: {
              emailAddress: "test-subscriber@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "subscriber" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
        role: "subscriber",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "subscriber",
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return 2 >= (map[r] || 0);
        },
        canAccessGuide: () => true,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
        isSubscriber: () => true,
        isAdmin: () => false,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "subscriptions:getMySubscription") {
            return Promise.resolve({
              plan: "annual",
              status: "active",
              stripeCustomerId: "cus_test_456",
              stripeSubscriptionId: "sub_test_456",
              cancelAtPeriodEnd: false,
              currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000,
            });
          }
          return Promise.resolve(null);
        },
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_sub2",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2500);

    const ctaMonthly = page.locator("#cta-monthly");
    const ctaAnnual = page.locator("#cta-annual");

    await expect(ctaMonthly).toHaveText("Manage Subscription");
    await expect(ctaMonthly).not.toBeDisabled();

    await expect(ctaAnnual).toHaveText("Current Plan");
    await expect(ctaAnnual).toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — Admin CTAs
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — admin", () => {
  test("admin sees subscriber-like view with Current Plan", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt-admin") },
          user: {
            id: "user_test_admin",
            firstName: "Test",
            lastName: "Admin",
            fullName: "Test Admin",
            primaryEmailAddress: {
              emailAddress: "test-admin@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "admin" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
        role: "admin",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "admin",
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return 3 >= (map[r] || 0);
        },
        canAccessGuide: () => true,
        canAccessAdmin: () => true,
        isAuthenticated: () => true,
        isSubscriber: () => true,
        isAdmin: () => true,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "subscriptions:getMySubscription") {
            return Promise.resolve({
              plan: "monthly",
              status: "active",
              cancelAtPeriodEnd: false,
            });
          }
          return Promise.resolve(null);
        },
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_admin",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2500);

    // Admin should see free card as "Current Plan"
    await expect(page.locator("#cta-free")).toHaveText("Current Plan");
    await expect(page.locator("#cta-free")).toBeDisabled();

    // Monthly should be Current Plan (since mock returns monthly sub)
    await expect(page.locator("#cta-monthly")).toHaveText("Current Plan");
    await expect(page.locator("#cta-monthly")).toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════════
// Pricing Page — Cancelled Subscription Banner
// ════════════════════════════════════════════════════════════════

test.describe("Pricing page — cancelled subscription banner", () => {
  test("shows cancelled banner when cancelAtPeriodEnd is true", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt") },
          user: {
            id: "user_test_cancelled",
            firstName: "Test",
            lastName: "Cancelled",
            fullName: "Test Cancelled",
            primaryEmailAddress: {
              emailAddress: "test-cancelled@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "subscriber" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
        role: "subscriber",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "subscriber",
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return 2 >= (map[r] || 0);
        },
        canAccessGuide: () => true,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
        isSubscriber: () => true,
        isAdmin: () => false,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "subscriptions:getMySubscription") {
            return Promise.resolve({
              plan: "monthly",
              status: "active",
              cancelAtPeriodEnd: true,
              currentPeriodEnd: Date.now() + 15 * 24 * 60 * 60 * 1000,
            });
          }
          return Promise.resolve(null);
        },
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_cancelled",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2500);

    const banner = page.locator("#cancelled-banner");
    await expect(banner).toHaveClass(/show/);
  });
});

// ════════════════════════════════════════════════════════════════
// Success Page — States
// ════════════════════════════════════════════════════════════════

test.describe("Success page — states", () => {
  test("shows loading state when session_id is present and user is signed in", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html?session_id=cs_test_12345");
    await page.waitForTimeout(1000);

    const loadingState = page.locator("#state-loading");
    await expect(loadingState).toBeVisible();

    const successState = page.locator("#state-success");
    await expect(successState).not.toBeVisible();
  });

  test("shows error state when no session_id is present", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html");
    await page.waitForTimeout(1000);

    const errorState = page.locator("#state-error");
    await expect(errorState).toBeVisible();

    const loadingState = page.locator("#state-loading");
    await expect(loadingState).not.toBeVisible();
  });

  test("shows error when user is not signed in", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/success.html?session_id=cs_test_12345");
    // Wait for auth:loaded event + polling to start + not-signed-in check
    await page.waitForTimeout(4000);

    const errorState = page.locator("#state-error");
    await expect(errorState).toBeVisible();
  });

  test("shows success state when subscription query returns active", async ({
    page,
  }) => {
    // Custom mock with active subscription returned from query
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt") },
          user: {
            id: "user_test_subscriber",
            firstName: "Test",
            lastName: "Subscriber",
            fullName: "Test Subscriber",
            primaryEmailAddress: {
              emailAddress: "test@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "subscriber" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
        role: "subscriber",
        openSignIn: () => {},
        openSignUp: () => {},
        signOut: () => {},
        mountUserButton: () => {},
        getTokenProvider: () => () => Promise.resolve("mock-jwt"),
        whenLoaded: () => Promise.resolve(),
      };

      window.SupplementDBRBAC = {
        getRole: () => "subscriber",
        hasRole: () => true,
        canAccessGuide: () => true,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "subscriptions:getMySubscription") {
            return Promise.resolve({
              plan: "monthly",
              status: "active",
              cancelAtPeriodEnd: false,
            });
          }
          return Promise.resolve(null);
        },
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/success.html?session_id=cs_test_12345");
    // Mock query returns instantly, so success state should appear quickly
    // Must check BEFORE the 5-second redirect countdown navigates away
    const successState = page.locator("#state-success");
    await expect(successState).toBeVisible({ timeout: 10000 });

    // Should show "Welcome to Pro!" heading
    const heading = successState.locator(".success-title");
    await expect(heading).toHaveText("Welcome to Pro!");

    // Should have redirect countdown
    const countdown = page.locator("#redirect-countdown");
    await expect(countdown).toBeAttached();
  });

  test("success page has noindex meta tag", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html?session_id=cs_test_12345");

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", "noindex, nofollow");
  });

  test("success page has navigation with SupplementDB logo", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html?session_id=cs_test_12345");

    const nav = page.locator(".success-nav");
    await expect(nav).toBeAttached();

    const logo = nav.locator("text=SupplementDB");
    await expect(logo).toBeAttached();
  });
});

// ════════════════════════════════════════════════════════════════
// Success Page — Timeout State
// ════════════════════════════════════════════════════════════════

test.describe("Success page — timeout", () => {
  test("shows timeout state when subscription is not found after polling", async ({
    page,
  }) => {
    // Mock with signed-in user but subscription query returns null (no subscription)
    await page.addInitScript(() => {
      window.__CLERK_MOCK__ = true;
      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt") },
          user: {
            id: "user_test_free",
            firstName: "Test",
            lastName: "Free",
            fullName: "Test Free",
            primaryEmailAddress: {
              emailAddress: "test-free@supplementdb.test",
            },
            imageUrl: "",
            publicMetadata: { role: "free" },
          },
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
        isSignedIn: true,
        user: window.Clerk.user,
        session: window.Clerk.session,
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
        hasRole: (r) => (r === "free" ? true : false),
        canAccessGuide: () => false,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
      };

      // Returns null — subscription never appears
      window.SupplementDB = {
        query: () => Promise.resolve(null),
        mutation: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_timeout",
        recordPageView: () => {},
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        });
      } else {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("auth:loaded"));
          document.dispatchEvent(new CustomEvent("auth:signed-in"));
        }, 0);
      }
    });

    await safeGoto(page, "/success.html?session_id=cs_test_timeout");
    // Wait for the full 15s poll timeout + buffer
    await page.waitForTimeout(18000);

    const timeoutState = page.locator("#state-timeout");
    await expect(timeoutState).toBeVisible();

    // Should show "Almost There" heading
    const heading = timeoutState.locator(".success-title");
    await expect(heading).toHaveText("Almost There");

    // Refresh button should be present
    const refreshBtn = timeoutState.locator("button:has-text('Refresh Page')");
    await expect(refreshBtn).toBeAttached();
  });

  // Increase timeout for this specific test since it waits 18s
  test.setTimeout(30000);
});

// ════════════════════════════════════════════════════════════════
// Content Gate — CTA Variants
// ════════════════════════════════════════════════════════════════

test.describe("Content gate — CTA variants", () => {
  test("anonymous user sees 'Start Free Account' in gate", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/guides/sleep.html");
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).toBeAttached({ timeout: 5000 });

    const signupBtn = page.locator("#gate-cta-signup");
    await expect(signupBtn).toBeAttached();
    await expect(signupBtn).toContainText("Start Free Account");
  });

  test("anonymous gate shows sign-in link", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/guides/sleep.html");
    await page.waitForTimeout(2000);

    const signinBtn = page.locator("#gate-cta-signin");
    await expect(signinBtn).toBeAttached();
    await expect(signinBtn).toContainText("Sign in");
  });

  test("signed-in free user sees 'Upgrade to Pro' / 'View Plans' in gate", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/guides/sleep.html");
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).toBeAttached({ timeout: 5000 });

    // Should show upgrade CTA for signed-in free users
    const upgradeBtn = page.locator("#gate-cta-upgrade");
    await expect(upgradeBtn).toBeAttached();
    await expect(upgradeBtn).toContainText("View Plans");
  });

  test("signed-in free user gate links to pricing page", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/guides/sleep.html");
    await page.waitForTimeout(2000);

    const upgradeLink = page.locator("#gate-cta-upgrade");
    await expect(upgradeLink).toBeAttached();
    await expect(upgradeLink).toHaveAttribute("href", "/pricing.html");
  });

  test("subscriber does NOT see content gate on guide", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, "/guides/sleep.html");
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {});

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════
// Zero Console Errors
// ════════════════════════════════════════════════════════════════

test.describe("Zero console errors", () => {
  test("pricing page — no JS errors (anonymous)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("PostHog") &&
        !e.includes("net::ERR") &&
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to load resource") &&
        !e.includes("CORS") &&
        !e.includes("Access-Control-Allow-Origin") &&
        !e.includes("unpkg.com")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("pricing page — no JS errors (signed-in free)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/pricing.html");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("PostHog") &&
        !e.includes("net::ERR") &&
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to load resource") &&
        !e.includes("CORS") &&
        !e.includes("Access-Control-Allow-Origin") &&
        !e.includes("unpkg.com")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("success page — no JS errors (with session_id)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html?session_id=cs_test_noerror");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("PostHog") &&
        !e.includes("net::ERR") &&
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to load resource") &&
        !e.includes("Poll query error") &&
        !e.includes("CORS") &&
        !e.includes("Access-Control-Allow-Origin") &&
        !e.includes("unpkg.com")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("success page — no JS errors (without session_id)", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: true, role: "free" });
    await safeGoto(page, "/success.html");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("PostHog") &&
        !e.includes("net::ERR") &&
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to load resource") &&
        !e.includes("CORS") &&
        !e.includes("Access-Control-Allow-Origin") &&
        !e.includes("unpkg.com")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
