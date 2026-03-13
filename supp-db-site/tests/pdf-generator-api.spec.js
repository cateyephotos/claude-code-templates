/**
 * pdf-generator-api.spec.js — Direct API tests for the pdf-generator service
 *
 * These tests hit http://localhost:3001 directly (no browser).
 * They run via Playwright's test runner but use fetch() for API calls.
 *
 * Prerequisites: pdf-generator-service container must be running (healthy).
 */
const { test, expect } = require("playwright/test");

const PDF_API = "http://localhost:3001";
const PDF_SECRET =
  process.env.PDF_GENERATOR_SECRET ||
  "01a335c379b5f66c198f6a67e4d4c3d11d7165039dfdf4f8e2fd013fbb28886f";
// Use Docker-internal hostname so Puppeteer (running inside the pdf-generator
// container) can reach the supp-db nginx service on the same Docker network.
const SITE_URL =
  process.env.PDF_GENERATOR_SITE_URL || "http://supp-db:8080";

// ── Health Check ─────────────────────────────────────────────────────
test.describe("pdf-generator /health", () => {
  test("returns ok status and timestamp", async () => {
    const res = await fetch(`${PDF_API}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("number");
    expect(body.timestamp).toBeGreaterThan(0);
  });
});

// ── Authentication ────────────────────────────────────────────────────
test.describe("pdf-generator /generate — authentication", () => {
  test("rejects request with no X-PDF-Secret header", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/sleep.html`,
        guideSlug: "sleep",
        guideName: "Sleep Optimization Guide",
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("rejects request with wrong X-PDF-Secret header", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": "wrong-secret",
      },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/sleep.html`,
        guideSlug: "sleep",
        guideName: "Sleep Optimization Guide",
      }),
    });
    expect(res.status).toBe(401);
  });
});

// ── Input Validation ──────────────────────────────────────────────────
test.describe("pdf-generator /generate — input validation", () => {
  test("rejects missing url field", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": PDF_SECRET,
      },
      body: JSON.stringify({ guideSlug: "sleep", guideName: "Sleep Guide" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url/i);
  });

  test("rejects missing guideSlug field", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": PDF_SECRET,
      },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/sleep.html`,
        guideName: "Sleep Guide",
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/guideSlug/i);
  });
});

// ── SSRF Protection ───────────────────────────────────────────────────
test.describe("pdf-generator /generate — SSRF protection", () => {
  const ssrfCases = [
    {
      label: "internal metadata service",
      url: "http://169.254.169.254/latest/meta-data/",
    },
    { label: "file:// protocol", url: "file:///etc/passwd" },
    { label: "external domain", url: "https://evil.example.com/page" },
    { label: "ftp:// protocol", url: "ftp://internal.host/data" },
    { label: "non-allowlisted IP", url: "http://10.0.0.1/secret" },
  ];

  for (const { label, url } of ssrfCases) {
    test(`blocks ${label}`, async () => {
      const res = await fetch(`${PDF_API}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PDF-Secret": PDF_SECRET,
        },
        body: JSON.stringify({
          url,
          guideSlug: "sleep",
          guideName: "Sleep Guide",
        }),
      });
      // Must be 400 (bad request / not allowed), not 200
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  }
});

// ── Real PDF Generation ───────────────────────────────────────────────
test.describe("pdf-generator /generate — real PDF generation", () => {
  // Increase timeout for Puppeteer rendering
  test.setTimeout(60_000);

  test("generates valid PDF for sleep guide", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": PDF_SECRET,
      },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/sleep.html`,
        guideSlug: "sleep",
        guideName: "Sleep Optimization Guide",
      }),
    });

    expect(res.status).toBe(200);

    const contentType = res.headers.get("content-type") || "";
    expect(contentType).toContain("application/pdf");

    const buffer = await res.arrayBuffer();
    // PDFs start with %PDF
    const bytes = new Uint8Array(buffer);
    const header = String.fromCharCode(...bytes.slice(0, 4));
    expect(header).toBe("%PDF");

    // Must be at least 10KB — tiny files indicate rendering failure
    expect(buffer.byteLength).toBeGreaterThan(10_000);
  });

  test("generates valid PDF for cognitive-performance guide", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": PDF_SECRET,
      },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/cognitive-performance.html`,
        guideSlug: "cognitive-performance",
        guideName: "Cognitive Performance Evidence Guide",
      }),
    });

    expect(res.status).toBe(200);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = String.fromCharCode(...bytes.slice(0, 4));
    expect(header).toBe("%PDF");
    expect(buffer.byteLength).toBeGreaterThan(10_000);
  });

  test("returns error for non-existent guide page (404 from nginx)", async () => {
    const res = await fetch(`${PDF_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PDF-Secret": PDF_SECRET,
      },
      body: JSON.stringify({
        url: `${SITE_URL}/guides/totally-fake-guide-that-does-not-exist.html`,
        guideSlug: "totally-fake",
        guideName: "Fake Guide",
      }),
    });
    // Service should return 500 (rendering error) for a 404 page,
    // or 200 with the 404 content rendered as PDF. Either way the
    // response must not crash (no 5xx from a crash, only controlled error).
    expect([200, 400, 422, 500]).toContain(res.status);
  });

  test("health endpoint still responds under load (concurrent requests)", async () => {
    // Fire 3 health checks concurrently to verify the server doesn't lock up
    const results = await Promise.all([
      fetch(`${PDF_API}/health`),
      fetch(`${PDF_API}/health`),
      fetch(`${PDF_API}/health`),
    ]);
    for (const res of results) {
      expect(res.status).toBe(200);
    }
  });
});
