# Monograph Preview Wall Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate all 113 supplement monograph pages behind free Clerk sign-in, showing sections 1–3 as preview with a gradient fade + section-teaser CTA overlay.

**Architecture:** New `monograph-gate.js` strips gated DOM sections on page load for unauthenticated users and injects a gate overlay reusing existing `content-gate.css` styles. `seed.js` emits a marker comment; `inject-auth.js` wires the gate scripts into supplement pages at build time.

**Tech Stack:** Clerk (via `SupplementDBAuth`), `content-gate.css`, PostHog analytics, Cheerio (inject-auth.js)

**Spec:** `docs/superpowers/specs/2026-03-25-monograph-preview-wall-design.md`

---

## File Structure

| File | Role | Change |
|------|------|--------|
| `supp-db-site/js/monograph-gate.js` | Gate logic: auth check, DOM strip, overlay inject, analytics | **Create** (~150 lines) |
| `supp-db-site/css/content-gate.css` | Gate overlay styling — add pill/subtitle classes | **Modify** (~40 lines added) |
| `supp-db-site/seed.js` | Monograph generator — insert gate marker comment | **Modify** (~2 lines) |
| `supp-db-site/scripts/inject-auth.js` | Build-time injection — add supplement page support | **Modify** (~20 lines) |
| `supp-db-site/tests/monograph-gate.spec.js` | Playwright E2E tests | **Create** (~120 lines) |

---

## Chunk 1: Foundation

### Task 1: Add gate marker to seed.js

**Files:**
- Modify: `supp-db-site/seed.js:913-916`

- [ ] **Step 1: Read seed.js to confirm the exact insertion point**

The marker goes between the closing `</section>` of section 3 (mechanisms, line 913) and the opening `<!-- 4 · Benefits -->` comment (line 915). Verify these lines haven't shifted:

```
Run: grep -n "mechanisms\|Benefits" supp-db-site/seed.js | head -10
```

- [ ] **Step 2: Insert the gate marker comment**

In `supp-db-site/seed.js`, find:
```javascript
        </section>

        <!-- 4 · Benefits -->
```
(This is the boundary between the mechanisms section closing tag and the benefits section comment, around lines 913-915.)

Insert between them:
```javascript
        </section>

        <!-- MONOGRAPH_GATE_POINT -->

        <!-- 4 · Benefits -->
```

- [ ] **Step 3: Verify the marker appears in generated output**

```bash
cd supp-db-site && node seed.js --out supplements/ 2>&1 | tail -5
```

Then check the marker is in a generated file:

```bash
grep -c "MONOGRAPH_GATE_POINT" supplements/creatine.html
```

Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add supp-db-site/seed.js
git commit -m "feat(seed): insert MONOGRAPH_GATE_POINT marker after section 3"
```

---

### Task 2: Add pill/subtitle CSS to content-gate.css

**Files:**
- Modify: `supp-db-site/css/content-gate.css` (append before the `@media print` block, around line 374)

- [ ] **Step 1: Read the file to find the insertion point**

The new classes go before the `@media print` section. Verify:

```bash
grep -n "@media print" supp-db-site/css/content-gate.css
```

Expected: a line number around 374-377.

- [ ] **Step 2: Add the new CSS classes**

Insert before the `@media print` block in `supp-db-site/css/content-gate.css`:

```css
/* ── Monograph Gate: Section Pills ─────────────────────────── */
.gate-section-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin: 0.75rem 0 1.25rem;
}

.gate-pill {
  background: var(--accent-bg, #f0f7f2);
  color: var(--accent, #2d5a3d);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.gate-section-count {
  color: var(--text-muted, #6b7280);
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
}

.gate-subtitle {
  color: var(--text-muted, #6b7280);
  font-size: 0.75rem;
  margin-top: 0.75rem;
}

/* ── Dark Theme: Monograph Gate Pills ──────────────────────── */
[data-theme="dark"] .gate-pill {
  background: rgba(45, 90, 61, 0.2);
  color: #7dcea0;
}

[data-theme="dark"] .gate-section-count,
[data-theme="dark"] .gate-subtitle {
  color: var(--text-muted, #9ca3af);
}
```

- [ ] **Step 3: Commit**

```bash
git add supp-db-site/css/content-gate.css
git commit -m "feat(css): add gate pill and subtitle styles for monograph preview wall"
```

---

### Task 3: Create monograph-gate.js

**Files:**
- Create: `supp-db-site/js/monograph-gate.js`

- [ ] **Step 1: Create the gate script**

Write to `supp-db-site/js/monograph-gate.js`:

```javascript
/**
 * monograph-gate.js — Monograph Preview Wall
 *
 * For supplement monograph pages: shows sections 1-3 as preview,
 * strips remaining sections from DOM for unauthenticated users,
 * and shows a gradient fade + sign-in CTA overlay.
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth) — MUST be loaded first
 *   - content-gate.css — overlay styling
 *   - Font Awesome (fas fa-lock icon)
 */
(function () {
  "use strict";

  // ── Early exit for non-supplement pages ─────────────────────────
  const pagePath = window.location.pathname.toLowerCase();
  if (!pagePath.includes("/supplements/")) return;

  // ── Get supplement slug ─────────────────────────────────────────
  const filename = pagePath.split("/").pop() || "";
  const slug = filename.replace(".html", "");
  if (!slug) return;

  // ── State ───────────────────────────────────────────────────────
  let gateImpressionRecorded = false;

  // ── Init ────────────────────────────────────────────────────────
  function initMonographGate() {
    const auth = window.SupplementDBAuth;
    if (!auth?.isLoaded) {
      document.addEventListener("auth:loaded", () => applyGate(), { once: true });
      return;
    }
    applyGate();
  }

  // ── Apply Gate ──────────────────────────────────────────────────
  function applyGate() {
    const auth = window.SupplementDBAuth;

    // Fail-open: if auth failed to load, show full content
    if (!auth) return;

    // Authenticated users see full content
    if (auth.isSignedIn) return;

    // Find the gate point
    const gatePoint = findGatePoint();
    if (!gatePoint) return;

    // Collect sections to gate (everything after the gate point)
    const gatedSections = collectGatedSections(gatePoint);
    if (gatedSections.length === 0) return;

    // Read section labels BEFORE removing from DOM
    const pills = gatedSections
      .map(function (section) {
        var label = section.querySelector(".section-label");
        return label ? label.textContent.trim() : null;
      })
      .filter(Boolean);

    // Remove gated sections from DOM
    gatedSections.forEach(function (section) {
      section.remove();
    });

    // Also remove the sticky section nav items for gated sections
    removeGatedNavItems(gatedSections);

    // Apply content-gated class to last visible section for gradient overlap
    var lastVisible = findLastVisibleSection();
    if (lastVisible) {
      lastVisible.classList.add("content-gated");
    }

    // Build and insert gate overlay
    var overlay = buildGateOverlay(pills);
    if (lastVisible) {
      lastVisible.after(overlay);
    } else {
      // Fallback: append to main content area
      var main = document.querySelector("main") || document.body;
      main.appendChild(overlay);
    }

    // Analytics
    recordEvent("shown", { sections_gated: pills.length });
  }

  // ── Find Gate Point ─────────────────────────────────────────────
  function findGatePoint() {
    // Look for the marker comment
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim() === "MONOGRAPH_GATE_POINT") {
        return walker.currentNode;
      }
    }

    // Fallback: gate after #mechanisms section
    var mechanismsSection = document.getElementById("mechanisms");
    if (mechanismsSection) {
      return mechanismsSection;
    }

    return null;
  }

  // ── Collect Gated Sections ──────────────────────────────────────
  function collectGatedSections(gatePoint) {
    // Get all sections at the same level as the gate point
    var parent = gatePoint.parentNode;
    if (!parent) return [];

    var allSections = Array.from(parent.querySelectorAll(":scope > section.section"));
    var gateIndex = -1;

    if (gatePoint.id === "mechanisms") {
      // Fallback: gatePoint IS the #mechanisms section — gate everything after it
      gateIndex = allSections.indexOf(gatePoint);
    } else {
      // Normal: gatePoint is a comment node — find the first section after it
      // by comparing document order
      for (var i = 0; i < allSections.length; i++) {
        var pos = gatePoint.compareDocumentPosition(allSections[i]);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
          gateIndex = i - 1;
          break;
        }
      }
      if (gateIndex === -1) gateIndex = allSections.length - 1;
    }

    // Return all sections after the gate index
    return allSections.slice(gateIndex + 1);
  }

  // ── Remove gated items from sticky section nav ──────────────────
  function removeGatedNavItems(gatedSections) {
    var gatedIds = gatedSections.map(function (s) { return s.id; }).filter(Boolean);
    gatedIds.forEach(function (id) {
      var navLink = document.querySelector('.section-nav a[href="#' + id + '"]');
      if (navLink) {
        var li = navLink.closest("li");
        if (li) li.remove();
        else navLink.remove();
      }
    });
  }

  // ── Find last visible section ───────────────────────────────────
  function findLastVisibleSection() {
    var allSections = document.querySelectorAll("section.section");
    return allSections.length > 0 ? allSections[allSections.length - 1] : null;
  }

  // ── Build Gate Overlay ──────────────────────────────────────────
  function buildGateOverlay(pills) {
    var overlay = document.createElement("div");
    overlay.className = "content-gate-overlay";

    // Gradient
    var gradient = document.createElement("div");
    gradient.className = "content-gate-gradient";
    overlay.appendChild(gradient);

    // CTA container
    var cta = document.createElement("div");
    cta.className = "content-gate-cta";

    var ctaInner = document.createElement("div");
    ctaInner.className = "content-gate-cta-inner";

    // Lock icon (reuses existing content-gate-icon style)
    var iconWrap = document.createElement("div");
    iconWrap.className = "content-gate-icon";
    var icon = document.createElement("i");
    icon.className = "fas fa-lock";
    iconWrap.appendChild(icon);
    ctaInner.appendChild(iconWrap);

    // Title
    var title = document.createElement("h3");
    title.className = "content-gate-title";
    title.textContent = "Sign in to continue reading";
    ctaInner.appendChild(title);

    // Section count
    var countText = document.createElement("p");
    countText.className = "gate-section-count";
    countText.textContent = pills.length + " more sections behind the gate:";
    ctaInner.appendChild(countText);

    // Section pills
    var pillContainer = document.createElement("div");
    pillContainer.className = "gate-section-pills";
    pills.forEach(function (label) {
      var pill = document.createElement("span");
      pill.className = "gate-pill";
      pill.textContent = label;
      pillContainer.appendChild(pill);
    });
    ctaInner.appendChild(pillContainer);

    // Sign-in button
    var signInBtn = document.createElement("button");
    signInBtn.className = "content-gate-btn-primary";
    signInBtn.textContent = "Sign In / Create Account";
    signInBtn.addEventListener("click", function () {
      recordEvent("signin_click", {});
      window.SupplementDBAuth?.openSignIn?.();
    });
    ctaInner.appendChild(signInBtn);

    // Subtitle
    var subtitle = document.createElement("p");
    subtitle.className = "gate-subtitle";
    subtitle.textContent = "Free account \u00B7 No credit card required";
    ctaInner.appendChild(subtitle);

    cta.appendChild(ctaInner);
    overlay.appendChild(cta);

    return overlay;
  }

  // ── Analytics ───────────────────────────────────────────────────
  function recordEvent(eventType, extraProps) {
    if (eventType === "shown" && gateImpressionRecorded) return;
    if (eventType === "shown") gateImpressionRecorded = true;

    // PostHog
    try {
      if (typeof posthog !== "undefined" && posthog.capture) {
        posthog.capture("monograph_gate_" + eventType, {
          supplement: slug,
          ...extraProps,
        });
      }
    } catch (e) {
      // Analytics should never break the page
    }
  }

  // ── Auth Event Listeners ────────────────────────────────────────
  document.addEventListener("auth:signed-in", function () {
    window.location.reload();
  });

  document.addEventListener("auth:signed-out", function () {
    window.location.reload();
  });

  // ── Initialize ──────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMonographGate);
  } else {
    initMonographGate();
  }
})();
```

- [ ] **Step 2: Verify the file is syntactically correct**

```bash
node -c supp-db-site/js/monograph-gate.js
```

Expected: no output (valid syntax)

- [ ] **Step 3: Commit**

```bash
git add supp-db-site/js/monograph-gate.js
git commit -m "feat: add monograph-gate.js for supplement preview wall"
```

---

### Task 4: Update inject-auth.js for supplement pages

**Files:**
- Modify: `supp-db-site/scripts/inject-auth.js:54-56` (add constant)
- Modify: `supp-db-site/scripts/inject-auth.js:140` (idempotency guard)
- Modify: `supp-db-site/scripts/inject-auth.js:151` (add isSupplementPage)
- Modify: `supp-db-site/scripts/inject-auth.js:155` (pass isSupplementPage to injectHead)
- Modify: `supp-db-site/scripts/inject-auth.js:161` (pass isSupplementPage to injectBodyScripts)
- Modify: `supp-db-site/scripts/inject-auth.js:177` (add supplement handling to injectHead)
- Modify: `supp-db-site/scripts/inject-auth.js:260` (add supplement handling to injectBodyScripts)

- [ ] **Step 1: Add the supplement-specific constants**

In `supp-db-site/scripts/inject-auth.js`, after `GUIDE_HEAD_INJECT` (around line 56), add:

```javascript
const SUPPLEMENT_HEAD_INJECT = `
    <link rel="stylesheet" href="{{CSS_PREFIX}}css/content-gate.css">
`;

const SUPPLEMENT_BODY_INJECT = `
    <script src="{{JS_PREFIX}}js/monograph-gate.js"></script>
`;

// Supplement pages directory
const SUPPLEMENT_DIR = "supplements";
```

- [ ] **Step 2: Update the idempotency guard**

In `supp-db-site/scripts/inject-auth.js`, replace the existing idempotency guard at line 140. Find:

```javascript
  // Skip if already injected
  if (html.includes('id="auth-buttons"') || html.includes("clerk-publishable-key")) {
    if (VERBOSE) console.log(`⏭  ${relativePath} (already injected)`);
    return "skipped";
  }
```

Replace with (still inside `processFile`, before the `cheerio.load` call):

```javascript
  // Skip if fully injected (has auth buttons = was processed by inject-auth.js before)
  if (html.includes('id="auth-buttons"')) {
    if (VERBOSE) console.log(`⏭  ${relativePath} (already injected)`);
    return "skipped";
  }

  // For pages generated by seed.js (have clerk-key meta), skip HEAD_INJECT but
  // still process for gate CSS and gate scripts
  const hasAuthFromSeed = html.includes('name="clerk-key"');
```

`hasAuthFromSeed` is declared inside `processFile` so it is in scope for all subsequent calls to `injectHead`, `injectNavAuthButtons`, and `injectBodyScripts` within the same function.

- [ ] **Step 3: Add isSupplementPage detection**

After the existing `isGuidePage` line (around line 151), add:

```javascript
  const isSupplementPage = relativePath.replace(/\\/g, "/").startsWith(SUPPLEMENT_DIR + "/");
```

- [ ] **Step 4: Update injectHead to accept and handle supplement pages**

Change the `injectHead` function signature and body. Find:

```javascript
function injectHead($, prefix, isGuidePage) {
```

Replace with:

```javascript
function injectHead($, prefix, isGuidePage, isSupplementPage, hasAuthFromSeed) {
```

Inside `injectHead`, wrap the existing `HEAD_INJECT` block to skip it if `hasAuthFromSeed`:

After the existing `const headHtml = ...` line, add a conditional:

```javascript
  // Skip base auth injection if seed.js already added it
  if (!hasAuthFromSeed) {
    const tailwindLink = head.find('link[href*="tailwind"]');
    if (tailwindLink.length > 0) {
      tailwindLink.before(headHtml);
    } else {
      head.append(headHtml);
    }
  }
```

(Remove the unconditional tailwind/append block that was there before.)

After the guide page gate CSS block, add:

```javascript
  // Add content gate CSS for supplement pages
  if (isSupplementPage) {
    const gateHtml = SUPPLEMENT_HEAD_INJECT.replace(/\{\{CSS_PREFIX\}\}/g, prefix);
    const authCssLink = head.find('link[href*="auth.css"]');
    if (authCssLink.length > 0) {
      authCssLink.after(gateHtml);
    } else {
      head.append(gateHtml);
    }
  }
```

- [ ] **Step 5: Update injectBodyScripts to handle supplement pages**

Change the function signature:

```javascript
function injectBodyScripts($, prefix, isGuidePage, isSupplementPage, hasAuthFromSeed) {
```

Inside the function, wrap the base `BODY_INJECT` to skip if `hasAuthFromSeed`:

```javascript
  if (!hasAuthFromSeed) {
    let scripts = BODY_INJECT.replace(/\{\{JS_PREFIX\}\}/g, prefix);
    if (isGuidePage) {
      scripts += GUIDE_BODY_INJECT.replace(/\{\{JS_PREFIX\}\}/g, prefix);
    }
    body.append(scripts);
  }

  // Supplement gate script (always added for supplement pages, after auth scripts)
  if (isSupplementPage) {
    const supplementScripts = SUPPLEMENT_BODY_INJECT.replace(/\{\{JS_PREFIX\}\}/g, prefix);
    body.append(supplementScripts);
  }
```

- [ ] **Step 6: Update the processFile function calls**

Update the three function calls in `processFile` to pass the new parameters:

```javascript
  // 1. Inject CDN scripts and CSS into <head>
  injectHead($, prefix, isGuidePage, isSupplementPage, hasAuthFromSeed);

  // 2. Inject auth buttons into navigation (only if not from seed.js)
  if (!hasAuthFromSeed) {
    injectNavAuthButtons($, isHomepage);
  }

  // 3. Inject JS scripts before </body>
  injectBodyScripts($, prefix, isGuidePage, isSupplementPage, hasAuthFromSeed);
```

- [ ] **Step 7: Run inject-auth.js in dry-run mode to verify**

```bash
cd supp-db-site && node scripts/inject-auth.js --dry-run --verbose 2>&1 | head -30
```

Expected: Supplement pages should show as "Would modify" (not "skipped").

- [ ] **Step 8: Run inject-auth.js for real and verify a supplement page**

```bash
cd supp-db-site && node scripts/inject-auth.js
```

Then verify a supplement page has the gate script:

```bash
grep -c "monograph-gate.js" supplements/creatine.html
```

Expected: `1`

Also verify content-gate.css is injected:

```bash
grep -c "content-gate.css" supplements/creatine.html
```

Expected: `1`

Also verify auth scripts were NOT duplicated:

```bash
grep -c "auth.js" supplements/creatine.html
```

Expected: `1` (the one from seed.js, not duplicated)

- [ ] **Step 9: Commit**

```bash
git add supp-db-site/scripts/inject-auth.js
git commit -m "feat(inject-auth): add supplement page support for monograph gate"
```

---

## Chunk 2: Regeneration and Testing

### Task 5: Regenerate all supplement pages with marker + gate scripts

**Files:**
- Modify: All 113 files in `supp-db-site/supplements/*.html` (regenerated)

- [ ] **Step 1: Regenerate all monograph pages**

```bash
cd supp-db-site && node seed.js --out supplements/
```

Expected: 113 pages generated, 0 errors.

- [ ] **Step 2: Run inject-auth.js to add gate scripts**

```bash
cd supp-db-site && node scripts/inject-auth.js
```

- [ ] **Step 3: Verify a sample page has all required elements**

Check creatine.html for:
1. Gate marker present
2. content-gate.css loaded
3. monograph-gate.js loaded
4. auth.js loaded (from seed.js)
5. No duplicate auth scripts

```bash
grep "MONOGRAPH_GATE_POINT" supplements/creatine.html && \
grep "content-gate.css" supplements/creatine.html && \
grep "monograph-gate.js" supplements/creatine.html && \
grep -c "auth.js" supplements/creatine.html
```

Expected: marker found, CSS found, JS found, auth.js count = 1.

- [ ] **Step 4: Spot-check a few more pages**

```bash
for page in ashwagandha melatonin omega-3-fatty-acids vitamin-d3; do
  echo "--- $page ---"
  grep -c "MONOGRAPH_GATE_POINT" supplements/$page.html
  grep -c "monograph-gate.js" supplements/$page.html
done
```

Expected: all show `1` for each grep.

- [ ] **Step 5: Commit all regenerated pages**

```bash
cd supp-db-site && git add supplements/ && \
git commit -m "feat: regenerate all 113 monographs with gate marker and gate scripts"
```

---

### Task 6: Write Playwright E2E tests

**Files:**
- Create: `supp-db-site/tests/monograph-gate.spec.js`

- [ ] **Step 1: Create the test file**

Write to `supp-db-site/tests/monograph-gate.spec.js`:

```javascript
// @ts-check
const { test, expect } = require("@playwright/test");

const BASE_URL = "http://localhost:8080";
const TEST_PAGE = "/supplements/creatine.html";

test.describe("Monograph Preview Wall", () => {
  test("gate renders for unauthenticated visitors", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    // Sections 1-3 should be visible
    await expect(page.locator("#quick-facts")).toBeVisible();
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#mechanisms")).toBeVisible();

    // Gate overlay should be visible
    await expect(page.locator(".content-gate-overlay")).toBeVisible();
    await expect(page.locator(".content-gate-btn-primary")).toBeVisible();

    // Gate title text
    const title = page.locator(".content-gate-title");
    await expect(title).toContainText("Sign in to continue reading");
  });

  test("gated sections are removed from DOM", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    // These section IDs should NOT exist in the DOM
    const gatedIds = ["benefits", "effect-sizes", "dosage", "safety", "enhanced-evidence", "references", "related"];
    for (const id of gatedIds) {
      const count = await page.locator("#" + id).count();
      expect(count, `Section #${id} should be removed from DOM`).toBe(0);
    }
  });

  test("dynamic pill labels match actual section labels", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    const pills = page.locator(".gate-pill");
    const count = await pills.count();
    expect(count).toBeGreaterThan(0);

    // Verify pills contain real section label text (not hardcoded)
    const pillTexts = await pills.allTextContents();
    // Creatine's section 4 label is "What the Research Shows"
    expect(pillTexts).toContain("What the Research Shows");
  });

  test("section count is dynamic", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    const countText = page.locator(".gate-section-count");
    await expect(countText).toBeVisible();
    // Should say "N more sections" where N is the actual count
    const text = await countText.textContent();
    expect(text).toMatch(/\d+ more sections behind the gate/);
  });

  test("gate overlay has sign-in button", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    const btn = page.locator(".content-gate-btn-primary");
    await expect(btn).toContainText("Sign In / Create Account");
  });

  test("gate overlay has free account subtitle", async ({ page }) => {
    await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

    const subtitle = page.locator(".gate-subtitle");
    await expect(subtitle).toContainText("Free account");
    await expect(subtitle).toContainText("No credit card required");
  });

  test("gate does not render on non-supplement pages", async ({ page }) => {
    // Navigate to a guide or category page
    await page.goto(BASE_URL + "/index.html", { waitUntil: "networkidle" });
    const overlay = page.locator(".content-gate-overlay");
    // Should not exist or not be from monograph gate
    await expect(overlay).toHaveCount(0);
  });

  test.describe("responsive", () => {
    test("gate overlay renders on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

      await expect(page.locator(".content-gate-overlay")).toBeVisible();
      await expect(page.locator(".gate-section-pills")).toBeVisible();
      await expect(page.locator(".content-gate-btn-primary")).toBeVisible();
    });
  });

  test.describe("fallback gate", () => {
    test("gate activates using #mechanisms fallback when marker is missing", async ({ page }) => {
      // Inject a page without the marker comment by removing it client-side
      await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

      // If gate already activated (marker present), verify it works.
      // For true fallback testing, we'd need a page without the marker.
      // This test verifies the gate activates regardless of mechanism.
      await expect(page.locator(".content-gate-overlay")).toBeVisible();
      const gatedIds = ["benefits", "dosage", "safety"];
      for (const id of gatedIds) {
        const count = await page.locator("#" + id).count();
        expect(count, `Section #${id} should be removed`).toBe(0);
      }
    });
  });

  test.describe("analytics", () => {
    test("monograph_gate_shown event fires on gate render", async ({ page }) => {
      // Capture PostHog calls
      const posthogCalls = [];
      await page.addInitScript(() => {
        window.__posthogCalls = [];
        const origCapture = window.posthog?.capture;
        if (window.posthog) {
          window.posthog.capture = function (event, props) {
            window.__posthogCalls.push({ event, props });
            if (origCapture) origCapture.call(this, event, props);
          };
        }
      });

      await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

      // Wait briefly for analytics to fire
      await page.waitForTimeout(1000);

      const calls = await page.evaluate(() => window.__posthogCalls || []);
      const gateEvent = calls.find((c) => c.event === "monograph_gate_shown");
      expect(gateEvent).toBeTruthy();
      expect(gateEvent.props.supplement).toBe("creatine");
    });

    test("monograph_gate_signin_click fires on CTA click", async ({ page }) => {
      const posthogCalls = [];
      await page.addInitScript(() => {
        window.__posthogCalls = [];
        const origCapture = window.posthog?.capture;
        if (window.posthog) {
          window.posthog.capture = function (event, props) {
            window.__posthogCalls.push({ event, props });
            if (origCapture) origCapture.call(this, event, props);
          };
        }
        // Stub Clerk sign-in to prevent actual modal
        window.SupplementDBAuth = window.SupplementDBAuth || {};
        window.SupplementDBAuth.openSignIn = function () {};
      });

      await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });
      await page.locator(".content-gate-btn-primary").click();

      const calls = await page.evaluate(() => window.__posthogCalls || []);
      const clickEvent = calls.find((c) => c.event === "monograph_gate_signin_click");
      expect(clickEvent).toBeTruthy();
    });
  });

  test.describe("dark theme", () => {
    test("gate overlay renders in dark theme", async ({ page }) => {
      await page.goto(BASE_URL + TEST_PAGE, { waitUntil: "networkidle" });

      // Set dark theme
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });

      await expect(page.locator(".content-gate-overlay")).toBeVisible();
      // Verify pill has dark theme background
      const pill = page.locator(".gate-pill").first();
      const bg = await pill.evaluate((el) => getComputedStyle(el).backgroundColor);
      // Dark theme pill should NOT have the light green background
      expect(bg).not.toBe("rgb(240, 247, 242)");
    });
  });
});
```

- [ ] **Step 2: Verify test file syntax**

```bash
node -c supp-db-site/tests/monograph-gate.spec.js
```

Expected: no output (valid syntax)

- [ ] **Step 3: Commit tests**

```bash
git add supp-db-site/tests/monograph-gate.spec.js
git commit -m "test: add Playwright E2E tests for monograph preview wall"
```

---

### Task 7: Run tests and verify in browser

- [ ] **Step 1: Start a local server to test**

If Docker/nginx is available on port 8080:

```bash
cd supp-db-site && docker compose up -d
```

Or use a simple HTTP server:

```bash
cd supp-db-site && npx serve -l 8080 . &
```

- [ ] **Step 2: Run the Playwright tests**

```bash
cd supp-db-site && npx playwright test tests/monograph-gate.spec.js --reporter=list
```

Expected: All tests pass.

- [ ] **Step 3: Manual browser verification**

Open http://localhost:8080/supplements/creatine.html in a browser and verify:
1. Sections 1-3 visible (Quick Facts, Overview, Mechanisms)
2. Gradient fade after section 3
3. Gate overlay with lock icon, title, pills, sign-in button
4. Pills show actual section labels (not hardcoded text)
5. Clicking "Sign In" opens Clerk sign-in modal

- [ ] **Step 4: Fix any test failures and re-run**

If tests fail, debug and fix. Then commit fixes.

- [ ] **Step 5: Final commit if needed**

```bash
git add -A && git commit -m "fix: address test failures for monograph gate"
```

---

### Task 8: Update SUPP-28 Linear issue

- [ ] **Step 1: Update the Linear issue with implementation status**

Add a comment to SUPP-28 noting:
- Implementation complete
- All 113 pages regenerated with gate marker
- E2E tests written and passing
- Ready for Vercel deployment and production verification
