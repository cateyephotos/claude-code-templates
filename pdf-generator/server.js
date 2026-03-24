"use strict";

const express = require("express");
const puppeteer = require("puppeteer");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Configuration ─────────────────────────────────────────────
const PDF_GENERATOR_SECRET = process.env.PDF_GENERATOR_SECRET;
const SITE_URL = process.env.SITE_URL || "http://localhost:8080";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!PDF_GENERATOR_SECRET) {
  console.error(
    "[pdf-generator] FATAL: PDF_GENERATOR_SECRET environment variable is not set. Exiting."
  );
  process.exit(1);
}

// ── SSRF Allowlist ────────────────────────────────────────────
// Only allow rendering pages from trusted hostnames.
// This prevents the service from being used as a proxy to render
// arbitrary internal or external URLs.
function buildAllowedHostnames() {
  const allowed = new Set(["localhost", "127.0.0.1", "supp-db"]);
  try {
    const siteHostname = new URL(SITE_URL).hostname;
    if (siteHostname) {
      allowed.add(siteHostname);
    }
  } catch {
    // SITE_URL may be invalid in tests; silently ignore
  }
  return allowed;
}

const ALLOWED_HOSTNAMES = buildAllowedHostnames();

function isAllowedUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    // Only allow http and https schemes
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return ALLOWED_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
}

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// Auth middleware — validates X-PDF-Secret header on all non-health routes
function requireSecret(req, res, next) {
  const secret = req.headers["x-pdf-secret"];
  if (!secret || secret !== PDF_GENERATOR_SECRET) {
    console.warn(
      `[pdf-generator] Unauthorized request from ${req.ip} — invalid or missing X-PDF-Secret`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Browser lifecycle ─────────────────────────────────────────
// Launch a single shared browser instance for efficiency.
// Recreate it if it crashes.
let browserInstance = null;

async function getBrowser() {
  if (browserInstance) {
    try {
      // Ping to verify it's still alive
      await browserInstance.version();
      return browserInstance;
    } catch {
      console.warn("[pdf-generator] Browser instance died — restarting.");
      browserInstance = null;
    }
  }

  console.log("[pdf-generator] Launching Chromium...");
  browserInstance = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--mute-audio",
      "--safebrowsing-disable-auto-update",
    ],
    timeout: 30000,
  });

  browserInstance.on("disconnected", () => {
    console.warn("[pdf-generator] Browser disconnected — will relaunch on next request.");
    browserInstance = null;
  });

  console.log("[pdf-generator] Chromium launched.");
  return browserInstance;
}

// ── Routes ────────────────────────────────────────────────────

/**
 * GET /health
 * Health check — no auth required.
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

/**
 * POST /generate
 * Generate a PDF from a guide page URL.
 *
 * Body:
 *   { url: string, guideSlug: string, guideName: string }
 *
 * Returns: application/pdf binary (or JSON error)
 */
app.post("/generate", requireSecret, async (req, res) => {
  const { url, guideSlug, guideName } = req.body;

  // Validate inputs
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field" });
  }
  if (!guideSlug || typeof guideSlug !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'guideSlug' field" });
  }

  // SSRF protection
  if (!isAllowedUrl(url)) {
    console.warn(`[pdf-generator] Blocked SSRF attempt: url=${url}`);
    return res.status(400).json({ error: "URL not in allowlist" });
  }

  console.log(
    `[pdf-generator] Generating PDF: guideSlug=${guideSlug} guideName="${guideName}" url=${url}`
  );

  let page = null;
  const startTime = Date.now();

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Block non-essential resource types to speed up rendering
    await page.setRequestInterception(true);
    page.on("request", (interceptedReq) => {
      const resourceType = interceptedReq.resourceType();
      if (
        resourceType === "media" ||
        resourceType === "websocket" ||
        resourceType === "eventsource"
      ) {
        interceptedReq.abort();
      } else {
        interceptedReq.continue();
      }
    });

    // Set a reasonable viewport for PDF rendering
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

    // Navigate to the guide page and wait for network to settle
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait an extra moment for any JS-driven content to render
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // ── Inject premium content for split-content guides ──────────
    // Split guides have a <div id="premium-content" data-guide="slug">
    // placeholder (premium content is stored server-side). For PDF
    // rendering we fetch the premium chunk JSON from local nginx and
    // inject it into the DOM so the full guide is rendered.
    //
    // Security: premium chunk JSON is pipeline-generated HTML from our
    // own build system (generate-guide-pages.js), served from the local
    // Docker nginx — not user-supplied content.
    const premiumInjected = await page.evaluate(async (slug) => {
      const container = document.getElementById("premium-content");
      if (!container) return { injected: false, reason: "no-container" };

      try {
        const resp = await fetch("/data/premium-chunks/" + slug + ".json");
        if (!resp.ok) return { injected: false, reason: "fetch-" + resp.status };
        const data = await resp.json();
        if (!data.htmlContent) return { injected: false, reason: "no-htmlContent" };

        // Remove gate overlay if present
        const overlays = container.querySelectorAll("[class*='gate']");
        overlays.forEach(function(el) { el.remove(); });

        // Clear container and set trusted pipeline-generated content
        container.textContent = "";
        const wrapper = document.createElement("div");
        wrapper.innerHTML = data.htmlContent; // eslint-disable-line -- trusted pipeline output, not user input
        while (wrapper.firstChild) {
          container.appendChild(wrapper.firstChild);
        }

        // Trigger reveal animations
        container.querySelectorAll(".reveal").forEach(function(el) { el.classList.add("visible"); });

        return { injected: true, contentLength: data.htmlContent.length };
      } catch (err) {
        return { injected: false, reason: err.message };
      }
    }, guideSlug);

    if (premiumInjected.injected) {
      console.log("[pdf-generator] Injected premium content for " + guideSlug + " (" + premiumInjected.contentLength + " chars)");
      // Wait for injected content to render
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log("[pdf-generator] No premium injection for " + guideSlug + ": " + premiumInjected.reason);
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:9px;color:#666;width:100%;text-align:right;padding-right:15mm;">
          SupplementDB — Evidence-Based Research
        </div>`,
      footerTemplate: `
        <div style="font-size:9px;color:#666;width:100%;display:flex;justify-content:space-between;padding:0 15mm;">
          <span>${guideName || guideSlug}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
    });

    const elapsed = Date.now() - startTime;
    console.log(
      `[pdf-generator] PDF generated in ${elapsed}ms: guideSlug=${guideSlug} size=${pdfBuffer.byteLength} bytes`
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.byteLength,
      "Cache-Control": "no-store",
      "X-Guide-Slug": guideSlug,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(
      `[pdf-generator] PDF generation failed after ${elapsed}ms: guideSlug=${guideSlug}`,
      err
    );
    return res.status(500).json({
      error: "PDF generation failed",
      detail: NODE_ENV === "development" ? err.message : "Internal error",
    });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // ignore close errors
      }
    }
  }
});

// ── Global error handlers ─────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("[pdf-generator] Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[pdf-generator] Uncaught exception:", err);
  // Give logs a moment to flush, then exit so Docker restarts us
  setTimeout(() => process.exit(1), 500);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`[pdf-generator] ${signal} received — shutting down gracefully.`);
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[pdf-generator] Service running on port ${PORT} (env=${NODE_ENV}, siteUrl=${SITE_URL})`
  );
  console.log(
    `[pdf-generator] Allowed render hostnames: ${[...ALLOWED_HOSTNAMES].join(", ")}`
  );

  // Pre-warm the browser so the first request isn't slow
  getBrowser().catch((err) => {
    console.warn("[pdf-generator] Browser pre-warm failed:", err.message);
  });
});
