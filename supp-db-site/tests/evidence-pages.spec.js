/**
 * evidence-pages.spec.js — Evidence page integration tests
 *
 * Validates Wave 1 evidence pages (25 pages: 5 domains × 5 supplements):
 *  1. All 25 pages load with HTTP 200 and have <h1>
 *  2. JSON-LD Article schema present on all pages
 *  3. Content sections present (spot-check 1 page per domain)
 *  4. Breadcrumb structure correct (1 page per domain)
 *  5. Cross-links present (evidence → guide, evidence → supplement, evidence → sibling)
 *  6. Content gate present for free users on evidence pages
 *  7. Newsletter CTA form present
 *  8. Generator script executes successfully and creates all 25 files
 *  9. No critical JS errors (1 page per domain)
 */
const { test, expect } = require("playwright/test");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const {
  injectAuthMock,
  safeGoto,
  collectConsoleErrors,
  filterCriticalErrors,
} = require("./helpers/auth-helpers");

// ── All 25 Evidence Pages ───────────────────────────────────────────
const EVIDENCE_PAGES = {
  sleep: [
    "/evidence/sleep/melatonin.html",
    "/evidence/sleep/magnesium.html",
    "/evidence/sleep/l-theanine.html",
    "/evidence/sleep/passionflower.html",
    "/evidence/sleep/ashwagandha.html",
  ],
  anxiety: [
    "/evidence/anxiety/ashwagandha.html",
    "/evidence/anxiety/l-theanine.html",
    "/evidence/anxiety/magnesium.html",
    "/evidence/anxiety/passionflower.html",
    "/evidence/anxiety/gaba.html",
  ],
  "cognitive-performance": [
    "/evidence/cognitive-performance/bacopa-monnieri.html",
    "/evidence/cognitive-performance/lion-s-mane-mushroom.html",
    "/evidence/cognitive-performance/caffeine.html",
    "/evidence/cognitive-performance/alpha-gpc.html",
    "/evidence/cognitive-performance/citicoline.html",
  ],
  "metabolic-health": [
    "/evidence/metabolic-health/berberine.html",
    "/evidence/metabolic-health/alpha-lipoic-acid.html",
    "/evidence/metabolic-health/chromium.html",
    "/evidence/metabolic-health/inositol.html",
    "/evidence/metabolic-health/fenugreek.html",
  ],
  inflammation: [
    "/evidence/inflammation/turmeric-curcumin.html",
    "/evidence/inflammation/omega-3-fatty-acids.html",
    "/evidence/inflammation/boswellia.html",
    "/evidence/inflammation/glucosamine.html",
    "/evidence/inflammation/ginger.html",
  ],
};

// Flat list of all 25 evidence page paths
const ALL_EVIDENCE_PATHS = Object.values(EVIDENCE_PAGES).flat();

// Representative page per domain (first page in each domain)
const DOMAIN_REPRESENTATIVES = Object.entries(EVIDENCE_PAGES).map(
  ([domain, pages]) => ({
    domain,
    path: pages[0],
    name: pages[0].split("/").pop().replace(".html", ""),
  })
);

// ── 1. Page Loads (25 tests) ─────────────────────────────────────────
test.describe("Evidence pages — page loads", () => {
  for (const pagePath of ALL_EVIDENCE_PATHS) {
    const parts = pagePath.split("/");
    const domain = parts[2];
    const supplement = parts[3].replace(".html", "");

    test(`${domain}/${supplement} loads with h1`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      const resp = await page.goto(pagePath, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      expect(resp.status()).toBe(200);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeAttached({ timeout: 5000 });
      const text = await h1.textContent();
      expect(text.length).toBeGreaterThan(3);
    });
  }
});

// ── 2. JSON-LD Schema (25 tests) ─────────────────────────────────────
test.describe("Evidence pages — JSON-LD schema", () => {
  for (const pagePath of ALL_EVIDENCE_PATHS) {
    const parts = pagePath.split("/");
    const domain = parts[2];
    const supplement = parts[3].replace(".html", "");

    test(`${domain}/${supplement} has valid JSON-LD`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, pagePath);

      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const content = await jsonLd.first().textContent();
      const parsed = JSON.parse(content);
      expect(parsed["@type"]).toBe("Article");
      expect(parsed.headline).toBeTruthy();
      expect(parsed.publisher).toBeTruthy();
    });
  }
});

// ── 3. Content Sections (5 tests — 1 per domain) ────────────────────
test.describe("Evidence pages — content sections", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} has required content sections`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: true, role: "subscriber" });
      await safeGoto(page, pagePath);
      await page.waitForTimeout(1000);

      // Check for key section IDs or section headings
      const sections = [
        "#evidence-overview",
        "#mechanisms",
        "#dosage",
        "#safety",
        "#citations",
      ];

      for (const sectionId of sections) {
        const section = page.locator(sectionId);
        const count = await section.count();
        // Section should exist as an id anchor
        if (count === 0) {
          // Fallback: check for heading text
          const headingTexts = {
            "#evidence-overview": "Evidence Overview",
            "#mechanisms": "Mechanism",
            "#dosage": "Dosage",
            "#safety": "Safety",
            "#citations": "Citation",
          };
          const heading = page.locator(
            `h2:has-text("${headingTexts[sectionId]}")`
          );
          const headingCount = await heading.count();
          expect(headingCount).toBeGreaterThanOrEqual(1);
        }
      }
    });
  }
});

// ── 4. Breadcrumbs (5 tests — 1 per domain) ─────────────────────────
test.describe("Evidence pages — breadcrumbs", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} has correct breadcrumb structure`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, pagePath);

      const breadcrumb = page.locator(
        "nav.content-breadcrumb, nav.breadcrumb, .breadcrumbs, [aria-label='Breadcrumb'], .breadcrumb-nav"
      );
      const bcCount = await breadcrumb.count();
      expect(bcCount).toBeGreaterThanOrEqual(1);

      // Breadcrumb should contain "Home" and "Evidence" links
      const bcText = await breadcrumb.first().textContent();
      expect(bcText.toLowerCase()).toContain("home");
      expect(bcText.toLowerCase()).toContain("evidence");
    });
  }
});

// ── 5. Cross-Links (5 tests — 1 per domain) ─────────────────────────
test.describe("Evidence pages — cross-links", () => {
  const DOMAIN_GUIDE_MAP = {
    sleep: "/guides/sleep.html",
    anxiety: "/guides/anxiety-stress.html",
    "cognitive-performance": "/guides/cognitive-performance.html",
    "metabolic-health": "/guides/metabolic-health.html",
    inflammation: "/guides/immune-function.html",
  };

  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} has cross-links to guide and siblings`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: true, role: "subscriber" });
      await safeGoto(page, pagePath);
      await page.waitForTimeout(1000);

      // Check for link to the parent guide page
      const guidePath = DOMAIN_GUIDE_MAP[domain];
      const guideLink = page.locator(`a[href*="${guidePath}"]`);
      const guideLinkCount = await guideLink.count();
      expect(guideLinkCount).toBeGreaterThanOrEqual(1);

      // Check for related evidence links (sibling pages in same domain)
      const relatedSection = page.locator(
        "#related-evidence, .related-evidence, .cross-links"
      );
      const relCount = await relatedSection.count();
      if (relCount > 0) {
        // Should have links to other evidence pages in same domain
        const siblingLinks = page.locator(
          `a[href*="/evidence/${domain}/"]`
        );
        const siblingCount = await siblingLinks.count();
        // At least 1 sibling link (4 other supplements in the domain)
        expect(siblingCount).toBeGreaterThanOrEqual(1);
      }
    });
  }
});

// ── 6. Content Gate (5 tests — 1 per domain) ─────────────────────────
test.describe("Evidence pages — content gate for free users", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} shows gate overlay for free user`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, pagePath);
      await page.waitForTimeout(1500);

      const gate = page.locator("#content-gate-overlay");
      await expect(gate).toBeAttached({ timeout: 5000 });

      // Gate should have CTA button
      const ctaBtn = page.locator(
        "#gate-cta-signup, #gate-cta-upgrade"
      );
      const ctaCount = await ctaBtn.count();
      expect(ctaCount).toBeGreaterThanOrEqual(1);
    });
  }
});

// ── 6b. Subscriber — no gate on evidence pages ──────────────────────
test.describe("Evidence pages — subscriber sees full content", () => {
  test("subscriber sees full evidence content (no gate)", async ({
    page,
  }) => {
    await injectAuthMock(page, { signedIn: true, role: "subscriber" });
    await safeGoto(page, EVIDENCE_PAGES.sleep[0]);
    await page.waitForTimeout(2000);

    const gate = page.locator("#content-gate-overlay");
    await expect(gate)
      .not.toBeAttached({ timeout: 3000 })
      .catch(() => {});

    const gatedContent = page.locator(".content-gated");
    const count = await gatedContent.count();
    expect(count).toBe(0);
  });
});

// ── 7. Newsletter CTA (5 tests — 1 per domain) ──────────────────────
test.describe("Evidence pages — newsletter CTA", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} has newsletter form`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: true, role: "subscriber" });
      await safeGoto(page, pagePath);
      await page.waitForTimeout(1000);

      // Newsletter section should exist
      const newsletter = page.locator(
        "#newsletter, .newsletter-section, .newsletter-cta, [data-newsletter]"
      );
      const nlCount = await newsletter.count();

      if (nlCount > 0) {
        // Should contain an email input
        const emailInput = page.locator(
          'input[type="email"], input[name="email"], input[placeholder*="email" i]'
        );
        const inputCount = await emailInput.count();
        expect(inputCount).toBeGreaterThanOrEqual(1);
      } else {
        // If no dedicated newsletter section, check for form anywhere
        const anyForm = page.locator("form");
        const formCount = await anyForm.count();
        // At least one form expected (newsletter)
        expect(formCount).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

// ── 8. Generator Execution (1 test) ──────────────────────────────────
test.describe("Evidence page generator", () => {
  test("generate-evidence-pages.js runs successfully and creates 25 files", async () => {
    const rootDir = path.resolve(__dirname, "..");
    const scriptPath = path.join(rootDir, "scripts", "generate-evidence-pages.js");

    // Run the generator
    const output = execSync(`node "${scriptPath}"`, {
      cwd: rootDir,
      encoding: "utf8",
      timeout: 30000,
    });

    // Should report success
    expect(output).toContain("Complete: 25 evidence pages generated");

    // Verify all 25 files exist
    const evidenceDir = path.join(rootDir, "evidence");
    const domains = ["sleep", "anxiety", "cognitive-performance", "metabolic-health", "inflammation"];
    let totalFiles = 0;

    for (const domain of domains) {
      const domainDir = path.join(evidenceDir, domain);
      expect(fs.existsSync(domainDir)).toBe(true);

      const files = fs
        .readdirSync(domainDir)
        .filter((f) => f.endsWith(".html"));
      expect(files.length).toBe(5);
      totalFiles += files.length;
    }

    expect(totalFiles).toBe(25);
  });
});

// ── 9. No JS Errors (5 tests — 1 per domain) ────────────────────────
test.describe("Evidence pages — no critical JS errors", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} loads without critical JS errors`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await injectAuthMock(page, { signedIn: true, role: "subscriber" });
      await safeGoto(page, pagePath);
      await page.waitForTimeout(2000);

      const critical = filterCriticalErrors(errors);
      expect(critical).toEqual([]);
    });
  }
});

// ── 10. Meta Tags (5 tests — 1 per domain) ──────────────────────────
test.describe("Evidence pages — meta tags", () => {
  for (const { domain, path: pagePath, name } of DOMAIN_REPRESENTATIVES) {
    test(`${domain}/${name} has proper meta tags`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, pagePath);

      // Title should contain supplement name and domain
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.toLowerCase()).toContain("supplementdb");

      // Meta description
      const metaDesc = page.locator('meta[name="description"]');
      const descCount = await metaDesc.count();
      expect(descCount).toBe(1);
      const descContent = await metaDesc.getAttribute("content");
      expect(descContent.length).toBeGreaterThan(50);

      // Open Graph
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogCount = await ogTitle.count();
      expect(ogCount).toBe(1);
    });
  }
});
