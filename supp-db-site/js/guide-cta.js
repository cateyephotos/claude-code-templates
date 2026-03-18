/**
 * guide-cta.js — Self-Injecting Guide CTA Component
 *
 * Injects a contextual call-to-action banner above the footer on any
 * supplement, evidence, or guide page. Domain-aware copy, PostHog
 * impression/click tracking, and zero external dependencies.
 *
 * Usage — add one <script> tag to any page:
 *
 *   Root-level pages (index.html, pricing.html, etc.):
 *     <script src="/js/guide-cta.js" defer></script>
 *
 *   Pages in a subdirectory (/supplements/, /guides/, /evidence/):
 *     <script src="../js/guide-cta.js" defer></script>
 *
 *   Pages two levels deep (/evidence/sleep/melatonin.html):
 *     <script src="../../js/guide-cta.js" defer></script>
 *
 * Opt-out: add data-no-cta attribute to <body>:
 *   <body data-no-cta>
 *
 * Health domain override: add data-health-domain attribute to <body>:
 *   <body data-health-domain="sleep">
 */

(function () {
  "use strict";

  // ─── Exclusion list ─────────────────────────────────────────────────────────
  // Pages where the CTA must never appear.
  var EXCLUDED_PATHS = [
    "/guides/sleep-sales.html",
    "/guide-success.html",
    "/pricing.html",
  ];

  var EXCLUDED_PREFIXES = ["/admin/"];

  // ─── Supplement → health-domain mapping ─────────────────────────────────────
  // Maps URL slugs (filename without .html) to a health domain string.
  // Only domains that have bespoke copy below need a full entry; all others
  // fall back to "generic".
  var SUPPLEMENT_DOMAIN_MAP = {
    // Sleep domain
    melatonin: "sleep",
    magnesium: "sleep",
    "l-theanine": "sleep",
    "magnesium-glycinate": "sleep",
    "magnesium-l-threonate": "sleep",
    passionflower: "sleep",
    "valerian-root": "sleep",
    glycine: "sleep",
    "5-htp": "sleep",
    ashwagandha: "sleep",
    // Cognitive / nootropic domain
    "bacopa-monnieri": "cognitive",
    "lions-mane": "cognitive",
    "alpha-gpc": "cognitive",
    citicoline: "cognitive",
    "huperzine-a": "cognitive",
    "phosphatidylserine": "cognitive",
    "ginkgo-biloba": "cognitive",
    "panax-ginseng": "cognitive",
    "rhodiola-rosea": "cognitive",
    "acetyl-l-carnitine": "cognitive",
    caffeine: "cognitive",
    // Stress / mood domain
    "l-theanine": "stress",
    "lemon-balm": "stress",
    kava: "stress",
    inositol: "stress",
    saffron: "stress",
    // Energy / performance domain
    creatine: "performance",
    "coenzyme-q10": "performance",
    "cordyceps": "performance",
    "beta-alanine": "performance",
    "citrulline-malate": "performance",
    // Longevity domain
    "nicotinamide-riboside": "longevity",
    nmn: "longevity",
    resveratrol: "longevity",
    "alpha-lipoic-acid": "longevity",
    "urolithin-a": "longevity",
    spermidine: "longevity",
    fisetin: "longevity",
    quercetin: "longevity",
  };

  // ─── Copy variants ───────────────────────────────────────────────────────────
  // Each entry: { headline, body, ctaLabel, guide, ctaHref }
  // `guide` is used as the PostHog property value.
  var COPY_VARIANTS = {
    sleep: {
      headline: "Get the complete evidence protocol for better sleep.",
      body: "7 sleep supplements — ranked by evidence tier, dosed precisely, and cited from 126+ peer-reviewed studies. No guesswork.",
      ctaLabel: "Read the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
    cognitive: {
      headline: "See how sleep quality drives cognitive performance.",
      body: "Our Sleep Guide covers the evidence on supplementing your way to deeper, more restorative sleep — the foundation of sharp cognition.",
      ctaLabel: "Read the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
    stress: {
      headline: "Poor sleep amplifies stress. Here's what the evidence says.",
      body: "Evidence-ranked sleep supplements with precise dosing, mechanism analysis, and 126 clinical citations — no filler.",
      ctaLabel: "Read the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
    performance: {
      headline: "Recovery starts with sleep. Read the evidence guide.",
      body: "7 supplements ranked by clinical evidence for sleep quality, onset latency, and restorative depth — with exact dosing protocols.",
      ctaLabel: "Read the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
    longevity: {
      headline: "Sleep is the most evidence-backed longevity lever.",
      body: "Our evidence-tiered sleep guide covers the supplements with the strongest human trial data for restorative sleep — all cited.",
      ctaLabel: "Read the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
    generic: {
      headline: "Evidence-based supplement guides. Every supplement rated, dosed, and cited.",
      body: "Cut through the noise. Our guides rank supplements by clinical evidence quality, not marketing claims — with full citation trails.",
      ctaLabel: "Start with the Sleep Guide",
      guide: "sleep",
      ctaHref: "/guides/sleep.html",
    },
  };

  // ─── Injected CSS ────────────────────────────────────────────────────────────
  var STYLES = [
    "#guide-cta-banner {",
    "  --gcta-navy-deep: #0d1117;",
    "  --gcta-navy: #161b22;",
    "  --gcta-indigo: #4f46e5;",
    "  --gcta-indigo-light: #6366f1;",
    "  --gcta-text-bright: #f0f6fc;",
    "  --gcta-text-primary: #c9d1d9;",
    "  --gcta-text-muted: #8b949e;",
    "  --gcta-border: rgba(99, 102, 241, 0.12);",
    "  all: initial;",
    "  display: block;",
    "  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
    "  background: var(--gcta-navy);",
    "  border-top: 2px solid transparent;",
    "  border-image: linear-gradient(90deg, transparent 0%, #4f46e5 30%, #6366f1 50%, #4f46e5 70%, transparent 100%) 1;",
    "  position: relative;",
    "  overflow: hidden;",
    "  opacity: 0;",
    "  transform: translateY(16px);",
    "  transition: opacity 0.5s ease, transform 0.5s ease;",
    "}",
    "#guide-cta-banner.gcta-visible {",
    "  opacity: 1;",
    "  transform: translateY(0);",
    "}",
    "#guide-cta-banner::before {",
    "  content: '';",
    "  position: absolute;",
    "  inset: 0;",
    "  background:",
    "    radial-gradient(ellipse 80% 120% at 50% -20%, rgba(99, 102, 241, 0.14) 0%, transparent 60%),",
    "    radial-gradient(ellipse 40% 60% at 85% 50%, rgba(118, 75, 162, 0.08) 0%, transparent 50%);",
    "  pointer-events: none;",
    "}",
    "#guide-cta-inner {",
    "  display: block;",
    "  max-width: 720px;",
    "  margin: 0 auto;",
    "  padding: 3rem 1.5rem;",
    "  text-align: center;",
    "  position: relative;",
    "  z-index: 1;",
    "}",
    "#guide-cta-eyebrow {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  gap: 0.4rem;",
    "  font-size: 0.7rem;",
    "  font-weight: 600;",
    "  letter-spacing: 0.1em;",
    "  text-transform: uppercase;",
    "  color: #818cf8;",
    "  background: rgba(99, 102, 241, 0.1);",
    "  border: 1px solid rgba(99, 102, 241, 0.25);",
    "  border-radius: 999px;",
    "  padding: 0.3rem 0.8rem;",
    "  margin-bottom: 1.25rem;",
    "}",
    "#guide-cta-eyebrow-dot {",
    "  width: 6px;",
    "  height: 6px;",
    "  border-radius: 50%;",
    "  background: #818cf8;",
    "  display: inline-block;",
    "  flex-shrink: 0;",
    "}",
    "#guide-cta-headline {",
    "  display: block;",
    "  font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif;",
    "  font-size: clamp(1.5rem, 4vw, 2rem);",
    "  font-weight: 400;",
    "  line-height: 1.25;",
    "  color: #f0f6fc;",
    "  margin: 0 0 1rem 0;",
    "  letter-spacing: -0.01em;",
    "}",
    "#guide-cta-body {",
    "  display: block;",
    "  font-size: 0.9375rem;",
    "  line-height: 1.65;",
    "  color: #8b949e;",
    "  margin: 0 auto 2rem auto;",
    "  max-width: 540px;",
    "}",
    "#guide-cta-actions {",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: center;",
    "  gap: 0.875rem;",
    "}",
    "@media (min-width: 480px) {",
    "  #guide-cta-actions {",
    "    flex-direction: row;",
    "    justify-content: center;",
    "  }",
    "}",
    "#guide-cta-btn {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  gap: 0.5rem;",
    "  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);",
    "  color: #ffffff;",
    "  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
    "  font-size: 0.9375rem;",
    "  font-weight: 600;",
    "  line-height: 1;",
    "  padding: 0.875rem 1.75rem;",
    "  border-radius: 8px;",
    "  border: none;",
    "  cursor: pointer;",
    "  text-decoration: none;",
    "  transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;",
    "  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.35);",
    "  white-space: nowrap;",
    "}",
    "#guide-cta-btn:hover {",
    "  opacity: 0.92;",
    "  transform: translateY(-1px);",
    "  box-shadow: 0 6px 28px rgba(79, 70, 229, 0.45);",
    "}",
    "#guide-cta-btn:active {",
    "  transform: translateY(0);",
    "  opacity: 1;",
    "}",
    "#guide-cta-btn:focus-visible {",
    "  outline: 2px solid #6366f1;",
    "  outline-offset: 3px;",
    "}",
    "#guide-cta-secondary {",
    "  display: inline-block;",
    "  font-size: 0.8125rem;",
    "  color: #8b949e;",
    "  text-decoration: none;",
    "  white-space: nowrap;",
    "  transition: color 0.15s ease;",
    "}",
    "#guide-cta-secondary:hover {",
    "  color: #c9d1d9;",
    "}",
    "#guide-cta-secondary:focus-visible {",
    "  outline: 2px solid #6366f1;",
    "  outline-offset: 2px;",
    "  border-radius: 3px;",
    "}",
    "#guide-cta-divider {",
    "  display: none;",
    "}",
    "@media (min-width: 480px) {",
    "  #guide-cta-divider {",
    "    display: inline-block;",
    "    width: 1px;",
    "    height: 18px;",
    "    background: rgba(99, 102, 241, 0.25);",
    "    flex-shrink: 0;",
    "  }",
    "}",
  ].join("\n");

  // ─── Utilities ───────────────────────────────────────────────────────────────

  function shouldExclude() {
    var path = window.location.pathname;

    for (var i = 0; i < EXCLUDED_PATHS.length; i++) {
      if (path === EXCLUDED_PATHS[i]) return true;
    }

    for (var j = 0; j < EXCLUDED_PREFIXES.length; j++) {
      if (path.indexOf(EXCLUDED_PREFIXES[j]) === 0) return true;
    }

    if (document.body && document.body.hasAttribute("data-no-cta")) {
      return true;
    }

    return false;
  }

  /**
   * Detect the health domain for the current page using a priority chain:
   *   1. data-health-domain on <body>
   *   2. data-health-domain on any container element
   *   3. URL path analysis (guide path segment, evidence path segment, or
   *      supplement slug against SUPPLEMENT_DOMAIN_MAP)
   *   4. Page <title> keyword scan
   *   5. Fallback: "generic"
   */
  function detectDomain() {
    // 1. Explicit body attribute
    var body = document.body;
    if (body) {
      var bodyDomain = body.getAttribute("data-health-domain");
      if (bodyDomain && COPY_VARIANTS[bodyDomain]) return bodyDomain;
    }

    // 2. Any container with the attribute
    var explicitEl = document.querySelector("[data-health-domain]");
    if (explicitEl) {
      var explicitDomain = explicitEl.getAttribute("data-health-domain");
      if (explicitDomain && COPY_VARIANTS[explicitDomain]) return explicitDomain;
    }

    var path = window.location.pathname.toLowerCase();

    // 3a. Evidence pages: /evidence/sleep/*, /evidence/cognitive-performance/*, etc.
    var evidenceMatch = path.match(/\/evidence\/([^/]+)\//);
    if (evidenceMatch) {
      var evidenceSegment = evidenceMatch[1];
      if (evidenceSegment === "sleep") return "sleep";
      if (
        evidenceSegment === "cognitive-performance" ||
        evidenceSegment === "cognitive"
      )
        return "cognitive";
      if (
        evidenceSegment === "anxiety" ||
        evidenceSegment === "stress-resilience"
      )
        return "stress";
      if (evidenceSegment === "metabolic-health") return "performance";
      if (evidenceSegment === "longevity") return "longevity";
    }

    // 3b. Guide pages: /guides/sleep.html, /guides/cognitive-performance.html, etc.
    var guidesMatch = path.match(/\/guides\/([^/]+?)(?:\.html)?$/);
    if (guidesMatch) {
      var guideSegment = guidesMatch[1];
      if (guideSegment === "sleep") return "sleep";
      if (guideSegment.indexOf("cognitive") !== -1) return "cognitive";
      if (
        guideSegment.indexOf("stress") !== -1 ||
        guideSegment.indexOf("anxiety") !== -1
      )
        return "stress";
      if (
        guideSegment.indexOf("performance") !== -1 ||
        guideSegment.indexOf("muscle") !== -1
      )
        return "performance";
      if (guideSegment.indexOf("longevity") !== -1) return "longevity";
    }

    // 3c. Supplement pages: /supplements/melatonin.html → look up slug
    var suppMatch = path.match(/\/supplements\/([^/]+?)(?:\.html)?$/);
    if (suppMatch) {
      var slug = suppMatch[1];
      var mapped = SUPPLEMENT_DOMAIN_MAP[slug];
      if (mapped && COPY_VARIANTS[mapped]) return mapped;
    }

    // 3d. Category pages: /categories/sleep.html etc.
    var catMatch = path.match(/\/categories\/([^/]+?)(?:\.html)?$/);
    if (catMatch) {
      var catSlug = catMatch[1];
      if (catSlug === "sleep") return "sleep";
      if (catSlug.indexOf("cognitive") !== -1) return "cognitive";
      if (catSlug.indexOf("stress") !== -1 || catSlug.indexOf("anxiety") !== -1)
        return "stress";
      if (
        catSlug.indexOf("performance") !== -1 ||
        catSlug.indexOf("muscle") !== -1
      )
        return "performance";
      if (catSlug.indexOf("longevity") !== -1) return "longevity";
    }

    // 4. Page title keyword scan (last resort before generic fallback)
    var title = document.title.toLowerCase();
    if (title.indexOf("sleep") !== -1 || title.indexOf("insomnia") !== -1)
      return "sleep";
    if (
      title.indexOf("cognitive") !== -1 ||
      title.indexOf("memory") !== -1 ||
      title.indexOf("focus") !== -1 ||
      title.indexOf("nootropic") !== -1
    )
      return "cognitive";
    if (title.indexOf("stress") !== -1 || title.indexOf("anxiety") !== -1)
      return "stress";
    if (
      title.indexOf("longevity") !== -1 ||
      title.indexOf("aging") !== -1 ||
      title.indexOf("anti-aging") !== -1
    )
      return "longevity";
    if (
      title.indexOf("performance") !== -1 ||
      title.indexOf("strength") !== -1 ||
      title.indexOf("muscle") !== -1
    )
      return "performance";

    return "generic";
  }

  /**
   * Resolve the correct href for CTA links, accounting for the page's depth
   * relative to the site root so that the link works without a server rewrite.
   *
   * If the page is served with an absolute root path accessible (i.e. HTTP/S),
   * we use the absolute path directly. For file:// protocol (local dev) we
   * compute a relative path from the current page location.
   */
  function resolveHref(absolutePath) {
    if (window.location.protocol !== "file:") {
      return absolutePath;
    }

    // Count directory depth from root to current page
    var parts = window.location.pathname.replace(/\/[^/]*$/, "").split("/");
    var depth = parts.length - 1;
    var prefix = "";
    for (var i = 0; i < depth; i++) {
      prefix += "../";
    }
    // absolutePath starts with "/" so strip it
    return prefix + absolutePath.replace(/^\//, "");
  }

  // ─── PostHog tracking ────────────────────────────────────────────────────────

  function capture(eventName, properties) {
    try {
      if (typeof posthog !== "undefined" && posthog.capture) {
        posthog.capture(eventName, properties);
      }
    } catch (_) {
      // Analytics must never break the page
    }
  }

  // ─── DOM construction ────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById("guide-cta-styles")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "guide-cta-styles";
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  function buildBanner(copy, domain) {
    var ctaHref = resolveHref(copy.ctaHref);
    var dbHref = resolveHref("/index.html");

    var banner = document.createElement("div");
    banner.id = "guide-cta-banner";
    banner.setAttribute("role", "complementary");
    banner.setAttribute("aria-label", "Evidence guide call to action");

    banner.innerHTML =
      '<div id="guide-cta-inner">' +
        '<span id="guide-cta-eyebrow" aria-hidden="true">' +
          '<span id="guide-cta-eyebrow-dot"></span>' +
          "Evidence Guide" +
        "</span>" +
        '<span id="guide-cta-headline">' + escapeHTML(copy.headline) + "</span>" +
        '<span id="guide-cta-body">' + escapeHTML(copy.body) + "</span>" +
        '<div id="guide-cta-actions">' +
          '<a id="guide-cta-btn" href="' + ctaHref + '" data-guide="' + escapeAttr(copy.guide) + '" data-domain="' + escapeAttr(domain) + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
            escapeHTML(copy.ctaLabel) +
          "</a>" +
          '<span id="guide-cta-divider" aria-hidden="true"></span>' +
          '<a id="guide-cta-secondary" href="' + dbHref + '">Explore the database &rarr;</a>' +
        "</div>" +
      "</div>";

    return banner;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ─── Intersection Observer (impression + animate-in) ────────────────────────

  function observeBanner(banner, copy, domain) {
    if (!("IntersectionObserver" in window)) {
      // Fallback for very old browsers: make visible immediately
      banner.classList.add("gcta-visible");
      return;
    }

    var impressionFired = false;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Animate in
            banner.classList.add("gcta-visible");

            // Fire impression once per page load
            if (!impressionFired) {
              impressionFired = true;
              capture("guide_cta_impression", {
                guide: copy.guide,
                source_page: window.location.pathname,
                domain: domain,
                page_title: document.title,
              });
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(banner);
  }

  // ─── Click tracking ──────────────────────────────────────────────────────────

  function attachClickTracking(banner, copy, domain) {
    var ctaBtn = banner.querySelector("#guide-cta-btn");
    if (ctaBtn) {
      ctaBtn.addEventListener("click", function () {
        capture("guide_cta_clicked", {
          guide: copy.guide,
          source_page: window.location.pathname,
          domain: domain,
          page_title: document.title,
          cta_label: copy.ctaLabel,
        });
      });
    }
  }

  // ─── Insertion ───────────────────────────────────────────────────────────────

  function findInsertionTarget() {
    // Prefer the <footer> element
    var footer = document.querySelector("footer");
    if (footer) return footer;

    // Try common footer-like selectors
    var candidates = [
      "footer",
      "[role='contentinfo']",
      ".monograph-footer",
      "#footer",
      ".footer",
      ".site-footer",
    ];

    for (var i = 0; i < candidates.length; i++) {
      var el = document.querySelector(candidates[i]);
      if (el) return el;
    }

    // Fall back to last direct child of <body> that is a block element
    var bodyChildren = document.body ? document.body.children : [];
    for (var j = bodyChildren.length - 1; j >= 0; j--) {
      var child = bodyChildren[j];
      var tag = child.tagName.toLowerCase();
      if (
        tag === "div" ||
        tag === "section" ||
        tag === "main" ||
        tag === "article"
      ) {
        return child;
      }
    }

    return null;
  }

  function inject() {
    if (shouldExclude()) return;

    var domain = detectDomain();
    var copy = COPY_VARIANTS[domain] || COPY_VARIANTS.generic;

    injectStyles();
    var banner = buildBanner(copy, domain);
    attachClickTracking(banner, copy, domain);

    var target = findInsertionTarget();
    if (target) {
      target.parentNode.insertBefore(banner, target);
    } else {
      // Last resort: append to body
      if (document.body) {
        document.body.appendChild(banner);
      }
    }

    observeBanner(banner, copy, domain);
  }

  // ─── Entry point ─────────────────────────────────────────────────────────────

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    // DOMContentLoaded already fired (e.g., script placed at end of body)
    inject();
  }
})();
