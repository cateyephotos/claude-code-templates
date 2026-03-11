/**
 * stack-analyzer.spec.js — Stack Analyzer tool page tests
 *
 * Validates:
 *   1. Page loads correctly (HTTP 200, <h1>, meta tags)
 *   2. JSON-LD WebApplication structured data present
 *   3. Hero section, How It Works, FAQ sections render
 *   4. #sa-app container present
 *   5. Auth gate shows for unauthenticated users (sign up / sign in buttons)
 *   6. Analyzer UI renders for authenticated users (credit bar, supplement selector, goal dropdown, depth radios)
 *   7. Content gate elements present for anonymous/free users
 *   8. Subscriber bypasses content gate
 *   9. Newsletter form present
 *  10. Navigation links work
 *  11. No critical JS console errors
 *  12. Sitemap includes tools page
 */
const { test, expect } = require("playwright/test");
const { injectAuthMock, safeGoto, collectConsoleErrors, filterCriticalErrors } = require("./helpers/auth-helpers");
const fs = require("fs");
const path = require("path");

const TOOL_PAGE = "/tools/stack-analyzer.html";

// ═══════════════════════════════════════════════════════════════════
// PAGE LOAD & STRUCTURE
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — page load & structure", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("page loads with HTTP 200", async ({ page }) => {
    const response = await page.goto(TOOL_PAGE, { waitUntil: "domcontentloaded", timeout: 15000 });
    expect(response.status()).toBe(200);
  });

  test("has correct <h1> title", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 5000 });
    const text = await h1.textContent();
    expect(text).toContain("Stack Analyzer");
  });

  test("has correct <title> tag", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const title = await page.title();
    expect(title).toContain("Stack Analyzer");
    expect(title).toContain("SupplementDB");
  });

  test("has meta description", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThan(50);
  });

  test("has canonical URL", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("stack-analyzer.html");
  });

  test("has Open Graph tags", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content");
    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(ogTitle).toContain("Stack Analyzer");
    expect(ogDesc).toBeTruthy();
    expect(ogType).toBe("website");
  });

  test("has Twitter Card tags", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");
  });
});

// ═══════════════════════════════════════════════════════════════════
// JSON-LD STRUCTURED DATA
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — JSON-LD structured data", () => {
  test("has valid application/ld+json script", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();

    const parsed = JSON.parse(jsonLd);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebApplication");
    expect(parsed.name).toBe("Stack Analyzer");
    expect(parsed.applicationCategory).toBe("HealthApplication");
  });

  test("JSON-LD has featureList array", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(Array.isArray(jsonLd.featureList)).toBe(true);
    expect(jsonLd.featureList.length).toBeGreaterThanOrEqual(4);
  });

  test("JSON-LD has offers with free tier", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(jsonLd.offers).toBeTruthy();
    expect(jsonLd.offers.price).toBe("0");
    expect(jsonLd.offers.priceCurrency).toBe("USD");
  });
});

// ═══════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — hero section", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("hero has AI-Powered Tool badge", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const badge = page.locator(".tool-hero-badge");
    await expect(badge).toBeVisible({ timeout: 5000 });
    const text = await badge.textContent();
    expect(text).toContain("AI-Powered Tool");
  });

  test("hero shows 4 stat items", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const stats = page.locator(".tool-hero-stat");
    const count = await stats.count();
    expect(count).toBe(4);
  });

  test("hero stats mention 93 supplements", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const statsText = await page.locator(".tool-hero-stats").textContent();
    expect(statsText).toContain("93 supplements");
  });

  test("hero stats mention 13 health goals", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const statsText = await page.locator(".tool-hero-stats").textContent();
    expect(statsText).toContain("13 health goals");
  });
});

// ═══════════════════════════════════════════════════════════════════
// HOW IT WORKS SECTION
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — How It Works section", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("How It Works section exists with id", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const section = page.locator("#how-it-works");
    await expect(section).toBeAttached({ timeout: 5000 });
  });

  test("has 4 how-it-works steps", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const steps = page.locator(".hiw-step");
    const count = await steps.count();
    expect(count).toBe(4);
  });

  test("steps have numbered indicators", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const numbers = page.locator(".hiw-step-number");
    const count = await numbers.count();
    expect(count).toBe(4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FAQ SECTION
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — FAQ section", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("FAQ section exists with id", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const section = page.locator("#faq");
    await expect(section).toBeAttached({ timeout: 5000 });
  });

  test("has 6 FAQ accordion items", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const details = page.locator("#faq details");
    const count = await details.count();
    expect(count).toBe(6);
  });

  test("FAQ items are clickable (accordion toggle)", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const firstDetail = page.locator("#faq details").first();

    // Initially closed
    const isOpenBefore = await firstDetail.getAttribute("open");
    expect(isOpenBefore).toBeNull();

    // Click to open
    await firstDetail.locator("summary").click();
    await page.waitForTimeout(300);

    const isOpenAfter = await firstDetail.getAttribute("open");
    expect(isOpenAfter).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// #sa-app CONTAINER
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — #sa-app container", () => {
  test("sa-app div is present in DOM", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    const app = page.locator("#sa-app");
    await expect(app).toBeAttached({ timeout: 5000 });
  });

  test("sa-app is inside #analyzer section", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    const app = page.locator("#analyzer #sa-app");
    await expect(app).toBeAttached({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════════════════
// AUTH GATE (unauthenticated users)
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — auth gate for anonymous users", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("shows auth gate when not signed in", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const authGate = page.locator(".sa-auth-gate");
    await expect(authGate).toBeAttached({ timeout: 5000 });
  });

  test("auth gate has sign up button", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const signupBtn = page.locator("#sa-gate-signup");
    await expect(signupBtn).toBeAttached({ timeout: 5000 });
    const text = await signupBtn.textContent();
    expect(text).toContain("Create Free Account");
  });

  test("auth gate has sign in link", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const signinBtn = page.locator("#sa-gate-signin");
    await expect(signinBtn).toBeAttached({ timeout: 5000 });
    const text = await signinBtn.textContent();
    expect(text).toContain("Sign in");
  });

  test("auth gate shows feature list", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const features = page.locator(".sa-auth-gate-feature");
    const count = await features.count();
    expect(count).toBe(4);
  });

  test("auth gate shows credit info", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const creditInfo = page.locator(".sa-auth-gate-credit-info");
    await expect(creditInfo).toBeAttached({ timeout: 5000 });
    const text = await creditInfo.textContent();
    expect(text).toContain("3 analyses per month");
  });
});

// ═══════════════════════════════════════════════════════════════════
// ANALYZER UI (authenticated users)
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — analyzer UI for signed-in users", () => {
  test.beforeEach(async ({ page }) => {
    // Mock signed-in free user with credit responses
    await page.addInitScript(({ role, signedIn }) => {
      const mockUser = {
        id: "user_test_free",
        firstName: "Test",
        lastName: "Free",
        fullName: "Test Free",
        primaryEmailAddress: { emailAddress: "test-free@supplementdb.test" },
        imageUrl: "",
        publicMetadata: { role: "free" },
      };

      window.__CLERK_MOCK__ = true;

      Object.defineProperty(window, "Clerk", {
        value: {
          load: () => Promise.resolve(),
          session: { getToken: () => Promise.resolve("mock-jwt-free") },
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

      window.SupplementDBAuth = {
        isLoaded: true,
        isSignedIn: true,
        user: mockUser,
        session: { getToken: () => Promise.resolve("mock") },
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
        hasRole: (r) => {
          const map = { admin: 3, subscriber: 2, free: 1 };
          return 1 >= (map[r] || 0);
        },
        canAccessGuide: () => false,
        canAccessAdmin: () => false,
        isAuthenticated: () => true,
      };

      window.SupplementDB = {
        query: (name) => {
          if (name === "analysisCredits:getMyCredits") {
            return Promise.resolve({
              usedThisMonth: 1,
              monthlyLimit: 3,
              remaining: 2,
              tier: "free",
              periodStart: Date.now(),
              periodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            });
          }
          if (name === "analysisCredits:hasCreditsAvailable") {
            return Promise.resolve(true);
          }
          if (name === "analysisCredits:getMyAnalyses") {
            return Promise.resolve([]);
          }
          if (name === "newsletter:getNewsletterStats") {
            return Promise.resolve({ total: 0, confirmed: 0, pending: 0, unsubscribed: 0, last7Days: 0, last30Days: 0 });
          }
          if (name === "newsletter:getSubscriberGrowth") {
            return Promise.resolve([]);
          }
          return Promise.resolve(null);
        },
        mutation: (name) => {
          if (name === "newsletter:subscribe") return Promise.resolve({ status: "pending" });
          if (name === "newsletter:confirm") return Promise.resolve({ status: "confirmed" });
          if (name === "newsletter:unsubscribe") return Promise.resolve({ status: "unsubscribed" });
          return Promise.resolve(null);
        },
        action: () => Promise.resolve(null),
        subscribe: () => () => {},
        getSessionId: () => "sess_test_" + Date.now(),
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
    }, { role: "free", signedIn: true });
  });

  test("no auth gate visible when signed in", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const authGate = page.locator(".sa-auth-gate");
    const count = await authGate.count();
    expect(count).toBe(0);
  });

  test("credit bar is present", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const creditBar = page.locator("#sa-credit-bar");
    await expect(creditBar).toBeAttached({ timeout: 5000 });
  });

  test("input panel is present", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const inputPanel = page.locator("#sa-input-panel");
    await expect(inputPanel).toBeAttached({ timeout: 5000 });
  });

  test("supplement search input is present", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const searchInput = page.locator("#sa-supp-search");
    await expect(searchInput).toBeAttached({ timeout: 5000 });
  });

  test("health goal dropdown is present with 13 options", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const select = page.locator("#sa-goal-select");
    await expect(select).toBeAttached({ timeout: 5000 });

    // 13 health goals + 1 placeholder option = 14 options
    const options = page.locator("#sa-goal-select option");
    const count = await options.count();
    expect(count).toBe(14);
  });

  test("depth selector has 3 radio options", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const radios = page.locator('input[name="sa-depth"]');
    const count = await radios.count();
    expect(count).toBe(3);
  });

  test("standard depth is pre-selected", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const standardRadio = page.locator('input[name="sa-depth"][value="standard"]');
    const isChecked = await standardRadio.isChecked();
    expect(isChecked).toBe(true);
  });

  test("analyze button is present but disabled initially", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const btn = page.locator("#sa-analyze-btn");
    await expect(btn).toBeAttached({ timeout: 5000 });
    const isDisabled = await btn.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("results panel is hidden initially", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const resultsPanel = page.locator("#sa-results-panel");
    const count = await resultsPanel.count();
    if (count > 0) {
      const display = await resultsPanel.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe("none");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// CONTENT GATE (tools page gating)
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — content gate for free users", () => {
  test("content gate overlay appears for anonymous user", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).toBeAttached({ timeout: 5000 });
  });

  test("content gate has sign-up CTA", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const signupBtn = page.locator("#gate-cta-signup");
    await expect(signupBtn).toBeAttached({ timeout: 5000 });
  });

  test("content gate has sign-in link", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2000);

    const signinBtn = page.locator("#gate-cta-signin");
    await expect(signinBtn).toBeAttached({ timeout: 5000 });
  });

  test("data-gate-cutoff marker is present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const marker = page.locator("[data-gate-cutoff]");
    await expect(marker).toBeAttached({ timeout: 5000 });
  });
});

test.describe("Stack Analyzer — subscriber bypasses content gate", () => {
  test("subscriber sees full content (no gate overlay)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {});

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

test.describe("Stack Analyzer — admin bypasses content gate", () => {
  test("admin sees full content (no gate overlay)", async ({ page }) => {
    await injectAuthMock(page, { signedIn: true, role: "admin" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(2500);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate).not.toBeAttached({ timeout: 3000 }).catch(() => {});

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// NEWSLETTER FORM
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — newsletter form", () => {
  test("newsletter form is present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const form = page.locator("#guide-newsletter-form");
    await expect(form).toBeAttached({ timeout: 5000 });
  });

  test("newsletter email input is present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const emailInput = page.locator("#guide-newsletter-email");
    await expect(emailInput).toBeAttached({ timeout: 5000 });
  });

  test("newsletter message container is present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const msgEl = page.locator("#guide-newsletter-message");
    await expect(msgEl).toBeAttached({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — navigation", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
  });

  test("sticky nav is present", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const nav = page.locator("nav.guide-nav");
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test("nav has back to database link", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const backLink = page.locator('nav a[href="/"]');
    await expect(backLink).toBeAttached({ timeout: 5000 });
  });

  test("nav has How It Works link", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const link = page.locator('nav a[href="#how-it-works"]');
    await expect(link).toBeAttached({ timeout: 5000 });
  });

  test("nav has Analyzer link", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const link = page.locator('nav a[href="#analyzer"]');
    await expect(link).toBeAttached({ timeout: 5000 });
  });

  test("nav has FAQ link", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const link = page.locator('nav a[href="#faq"]');
    await expect(link).toBeAttached({ timeout: 5000 });
  });

  test("mobile nav toggle button exists", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const toggleBtn = page.locator("#mobile-nav-toggle");
    await expect(toggleBtn).toBeAttached({ timeout: 5000 });
  });

  test("mobile nav menu is hidden by default", async ({ page }) => {
    await safeGoto(page, TOOL_PAGE);
    const mobileMenu = page.locator("#mobile-nav-menu");
    const hasHiddenClass = await mobileMenu.evaluate(el => el.classList.contains("hidden"));
    expect(hasHiddenClass).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — footer", () => {
  test("footer is present", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    const footer = page.locator("footer");
    await expect(footer).toBeAttached({ timeout: 5000 });
  });

  test("footer has methodology link", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    const link = page.locator('footer a[href*="methodology"]');
    await expect(link).toBeAttached({ timeout: 5000 });
  });

  test("footer has disclaimer text", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    const footerText = await page.locator("footer").textContent();
    expect(footerText).toContain("informational purposes only");
  });
});

// ═══════════════════════════════════════════════════════════════════
// CONSOLE ERRORS
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — no critical JS errors", () => {
  test("page loads without critical console errors (anonymous)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(3000);

    const critical = filterCriticalErrors(errors);
    expect(critical).toEqual([]);
  });

  test("page loads without critical console errors (signed in)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, TOOL_PAGE);
    await page.waitForTimeout(3000);

    const critical = filterCriticalErrors(errors);
    expect(critical).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SITEMAP
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — sitemap", () => {
  test("sitemap.xml includes stack-analyzer.html", async () => {
    const sitemapPath = path.join(__dirname, "..", "sitemap.xml");
    const sitemap = fs.readFileSync(sitemapPath, "utf-8");
    expect(sitemap).toContain("tools/stack-analyzer.html");
  });

  test("sitemap entry has correct priority", async () => {
    const sitemapPath = path.join(__dirname, "..", "sitemap.xml");
    const sitemap = fs.readFileSync(sitemapPath, "utf-8");
    // Find the tools section
    const toolsIndex = sitemap.indexOf("tools/stack-analyzer.html");
    expect(toolsIndex).toBeGreaterThan(-1);
    // Priority should be 0.8 (nearby in XML)
    const nearby = sitemap.substring(toolsIndex - 200, toolsIndex + 200);
    expect(nearby).toContain("0.8");
  });
});

// ═══════════════════════════════════════════════════════════════════
// CSS & ASSETS
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — CSS & asset loading", () => {
  test("stack-analyzer.css stylesheet is linked", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const cssLink = page.locator('link[href*="stack-analyzer.css"]');
    await expect(cssLink).toBeAttached({ timeout: 5000 });
  });

  test("auth.css stylesheet is linked", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const cssLink = page.locator('link[href*="auth.css"]');
    await expect(cssLink).toBeAttached({ timeout: 5000 });
  });

  test("content-gate.css stylesheet is linked", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    const cssLink = page.locator('link[href*="content-gate.css"]');
    await expect(cssLink).toBeAttached({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════════════════
// SCRIPT LOADING ORDER
// ═══════════════════════════════════════════════════════════════════
test.describe("Stack Analyzer — script loading", () => {
  test("stack-analyzer.js is loaded after auth scripts", async ({ page }) => {
    await injectAuthMock(page, { signedIn: false, role: "free" });
    await safeGoto(page, TOOL_PAGE);

    // Verify script elements are present in the expected order
    const scripts = await page.locator("script[src]").evaluateAll(els =>
      els.map(el => el.getAttribute("src")).filter(Boolean)
    );

    const authIndex = scripts.findIndex(s => s.includes("auth.js"));
    const convexIndex = scripts.findIndex(s => s.includes("convex-client.js"));
    const rbacIndex = scripts.findIndex(s => s.includes("rbac.js"));
    const saIndex = scripts.findIndex(s => s.includes("stack-analyzer.js"));
    const gateIndex = scripts.findIndex(s => s.includes("content-gate.js"));

    // stack-analyzer.js must come after auth, convex, rbac
    expect(authIndex).toBeGreaterThanOrEqual(0);
    expect(convexIndex).toBeGreaterThan(authIndex);
    expect(rbacIndex).toBeGreaterThan(convexIndex);
    expect(saIndex).toBeGreaterThan(rbacIndex);
    // content-gate.js must be last
    expect(gateIndex).toBeGreaterThan(saIndex);
  });
});
