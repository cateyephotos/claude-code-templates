/**
 * guides-expansion.spec.js — Phase 8 Guide Library Expansion tests
 *
 * Validates:
 *  1. All 20 guide pages load with HTTP 200
 *  2. Each guide has an <h1> title
 *  3. Each guide has JSON-LD structured data
 *  4. Generated guides have required section structure
 *  5. Homepage has card links for all 20 guides
 *  6. Generator script runs without errors
 *  7. Safety guide special validation (all supplements included)
 *  8. Newsletter form present on all guide pages
 *  9. No critical JS errors on guide pages
 */
const { test, expect } = require("playwright/test");
const {
  injectAuthMock,
  safeGoto,
  collectConsoleErrors,
  filterCriticalErrors,
} = require("./helpers/auth-helpers");

// ── All 20 guide pages ───────────────────────────────────────────
const ALL_GUIDES = [
  { slug: "sleep", title: "Sleep", manual: true },
  { slug: "anxiety-stress", title: "Anxiety" },
  { slug: "cognitive-performance", title: "Cognitive" },
  { slug: "cardiovascular", title: "Cardiovascular" },
  { slug: "immune-function", title: "Immune" },
  { slug: "joint-health", title: "Joint" },
  { slug: "metabolic-health", title: "Metabolic" },
  { slug: "energy-vitality", title: "Energy" },
  { slug: "mood-support", title: "Mood" },
  { slug: "memory-aging", title: "Memory" },
  { slug: "longevity", title: "Longevity" },
  { slug: "brain-fog", title: "Brain Fog" },
  { slug: "stress-resilience", title: "Stress Resilience" },
  { slug: "safety-interactions", title: "Safety" },
  { slug: "muscle-strength", title: "Muscle" },
  { slug: "recovery", title: "Recovery" },
  { slug: "womens-health", title: "Women" },
  { slug: "mens-health", title: "Men" },
  { slug: "gut-brain", title: "Gut-Brain" },
  { slug: "nootropic-stacks", title: "Nootropic" },
];

const NEW_GUIDES = ALL_GUIDES.filter(
  (g) =>
    ![
      "sleep",
      "anxiety-stress",
      "cognitive-performance",
      "cardiovascular",
      "immune-function",
      "joint-health",
      "metabolic-health",
      "energy-vitality",
    ].includes(g.slug)
);

// ── Guide Page Loading ───────────────────────────────────────────
test.describe("All 20 guides — page loads", () => {
  for (const guide of ALL_GUIDES) {
    test(`${guide.slug} loads with HTTP 200`, async ({ page }) => {
      const response = await page.goto(`/guides/${guide.slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      expect(response.status()).toBe(200);
    });
  }
});

// ── Guide H1 Titles ──────────────────────────────────────────────
test.describe("All 20 guides — has <h1>", () => {
  for (const guide of ALL_GUIDES) {
    test(`${guide.slug} has an h1 heading`, async ({ page }) => {
      await page.goto(`/guides/${guide.slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const h1 = page.locator("h1").first();
      await expect(h1).toBeAttached({ timeout: 5000 });
      const text = await h1.textContent();
      expect(text.trim().length).toBeGreaterThan(3);
    });
  }
});

// ── JSON-LD Structured Data ──────────────────────────────────────
// sleep.html is a manual file without JSON-LD — test generated guides only
const GENERATED_GUIDES = ALL_GUIDES.filter((g) => !g.manual);

test.describe("Generated guides — JSON-LD schema", () => {
  for (const guide of GENERATED_GUIDES) {
    test(`${guide.slug} has JSON-LD structured data`, async ({ page }) => {
      await page.goto(`/guides/${guide.slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();
      expect(count).toBeGreaterThanOrEqual(1);

      // Validate JSON-LD is valid JSON
      const content = await jsonLd.first().textContent();
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty("@context");
      expect(parsed).toHaveProperty("@type");
    });
  }
});

// ── New Guide Section Structure ──────────────────────────────────
test.describe("New guides — required sections", () => {
  for (const guide of NEW_GUIDES) {
    test(`${guide.slug} has #introduction section`, async ({ page }) => {
      await page.goto(`/guides/${guide.slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const intro = page.locator("#introduction");
      await expect(intro).toBeAttached({ timeout: 5000 });
    });

    test(`${guide.slug} has #top-supplements section`, async ({ page }) => {
      await page.goto(`/guides/${guide.slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const topSupps = page.locator("#top-supplements");
      await expect(topSupps).toBeAttached({ timeout: 5000 });
    });
  }
});

// ── Homepage Guide Cards ─────────────────────────────────────────
test.describe("Homepage — guide cards", () => {
  for (const guide of ALL_GUIDES) {
    test(`homepage has card linking to ${guide.slug}`, async ({ page }) => {
      await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const link = page.locator(
        `a[href*="guides/${guide.slug}.html"], a[href*="guides/${guide.slug}"]`
      );
      const count = await link.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

// ── Safety Guide Special Validation ──────────────────────────────
test.describe("Safety guide — special template", () => {
  test("safety-interactions references 50+ supplements", async ({ page }) => {
    await page.goto("/guides/safety-interactions.html", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // The safety guide should link to most/all supplements in the database
    // Count unique supplement page links (href contains /supplements/)
    const supplementLinks = page.locator('a[href*="/supplements/"]');
    const count = await supplementLinks.count();
    // Safety guide generated with 93 supplements — should have many links
    expect(count).toBeGreaterThan(50);
  });

  test("safety-interactions has safety-focused title", async ({ page }) => {
    await page.goto("/guides/safety-interactions.html", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const h1 = page.locator("h1").first();
    const text = await h1.textContent();
    expect(text.toLowerCase()).toContain("safety");
  });
});

// ── Newsletter Forms ─────────────────────────────────────────────
test.describe("All guides — newsletter form", () => {
  for (const guide of ALL_GUIDES) {
    test(`${guide.slug} has newsletter form`, async ({ page }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      await safeGoto(page, `/guides/${guide.slug}.html`);
      await page.waitForTimeout(1000);

      // Look for newsletter form elements
      const form = page.locator(
        "#newsletter-form, .newsletter-form, [data-newsletter], form[action*='newsletter'], input[type='email']"
      );
      const count = await form.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

// ── No Critical JS Errors ────────────────────────────────────────
test.describe("New guides — no JS errors", () => {
  for (const guide of NEW_GUIDES) {
    test(`${guide.slug} loads without critical JS errors`, async ({
      page,
    }) => {
      await injectAuthMock(page, { signedIn: false, role: "free" });
      const errors = collectConsoleErrors(page);
      await safeGoto(page, `/guides/${guide.slug}.html`);
      await page.waitForTimeout(2000);

      const critical = filterCriticalErrors(errors);
      expect(critical).toEqual([]);
    });
  }
});

// ── Generator Script Execution ───────────────────────────────────
test.describe("Generator", () => {
  test("generator creates 19 guide files without errors", async () => {
    const { execSync } = require("child_process");
    const path = require("path");
    const fs = require("fs");

    const projectRoot = path.resolve(__dirname, "..");

    // Run the generator
    const output = execSync("node scripts/generate-guide-pages.js", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 30000,
    });

    // Should not contain error messages
    expect(output.toLowerCase()).not.toContain("error");

    // Verify all 19 generated guide files exist (sleep.html is manual)
    const generatedGuides = ALL_GUIDES.filter((g) => !g.manual);
    for (const guide of generatedGuides) {
      const filePath = path.join(projectRoot, "guides", `${guide.slug}.html`);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});

// ── Related Resources Section ────────────────────────────────────
test.describe("Guides — related resources", () => {
  // Check a sample of guides for related content sections
  const sampleGuides = ["anxiety-stress", "mood-support", "muscle-strength", "longevity"];
  for (const slug of sampleGuides) {
    test(`${slug} has related resources section`, async ({ page }) => {
      await page.goto(`/guides/${slug}.html`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const related = page.locator(
        ".related-content, .related-content-grid, [class*='related']"
      );
      const count = await related.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});
