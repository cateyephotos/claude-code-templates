# Gap Analysis: Sleep Evidence Guide & Main Site Integration
**Date:** 2026-03-04
**Auditor:** Claude Code
**Site:** SupplementDB (supp-db-site)
**Scope:** Full UI audit of main site + Sleep Evidence Guide page

---

## Executive Summary

The Sleep Evidence Guide (`/guides/sleep.html`) is a fully-rendered 1,433-line page with 50 citation links (PMIDs + DOIs), 7 supplements across 3 evidence tiers, an email capture form, and PostHog analytics. The main database site serves 89 supplements with filtering, comparison, and modal detail views. **However, the guide page is completely disconnected from the main site.** There are zero navigation links, zero cross-references, and the `problems.js` data mapping is dead code.

---

## Supplement Rendering Status

| Metric | Status | Notes |
|--------|--------|-------|
| Total supplements in DB | 89 | All 89 present in `supplements.js` |
| Data file served | **200 OK** | `data/supplements.js` loads correctly |
| Rendering pipeline | **Working** | `app.js` → `createSupplementCard()` → `supplementGrid` |
| Enhanced citations | **Working** | `EnhancedCitationLoader.js` + 176 enhanced files |
| All JS modules | **200 OK** | All 8 JS files return 200 |
| Test suites | **Present** | 4 test files auto-load in dev mode |
| Sleep guide supplements | 7/7 | Melatonin, Magnesium, L-Theanine, Passionflower, Ashwagandha, 5-HTP, GABA |
| Sleep guide citations | 50 links | 16 unique PMIDs + DOIs, 50 `class="pmid-link"` anchors |

**Verdict: All supplements populate and render correctly.** No missing data or broken rendering.

---

## CRITICAL Issues (P0 — Must Fix)

### GAP-001: No Guide Links in Main Site Navigation
**Severity:** CRITICAL
**Location:** `index.html` lines 184-190 (nav bar)
**Description:** The main site `<nav>` has links to Database, Compare, Calculator, About — but **zero links** to Evidence Guides. The Sleep guide page is completely unreachable from the main site UI. Users can only access it by typing `/guides/sleep.html` directly.
**Impact:** Guide pages are invisible to all users. Zero organic traffic. Email capture form will never fire.
**Fix:** Add "Evidence Guides" dropdown or link to the nav bar with sub-items for each published guide.

### GAP-002: No Evidence Guides Section on Homepage
**Severity:** CRITICAL
**Location:** `index.html` (missing section entirely)
**Description:** There is no section on the homepage that promotes, previews, or links to the evidence guide pages. The Hero section has "Explore Database" and "Compare Supplements" CTAs but nothing for guides.
**Impact:** Primary content asset (guides) has zero discoverability. The entire problem-centered user journey is broken.
**Fix:** Add an "Evidence Guides" section below the Hero with cards for each guide topic (starting with Sleep).

### GAP-003: problems.js Is Dead Code — Not Loaded by Any Page
**Severity:** CRITICAL
**Location:** `data/problems.js` exists, served 200 OK, but not `<script>`-loaded anywhere
**Description:** The problem-to-supplement mapping database was created but never loaded by `index.html`, `sleep.html`, or any JS module. Neither page has a `<script src="data/problems.js">` tag.
**Impact:** The entire problem-centered architecture from the PRD is unrealized in the UI. Health domain → guide linking is impossible without this data.
**Fix:** Load `problems.js` in `index.html` and build the evidence guides section dynamically from this data.

---

## MODERATE Issues (P1 — Should Fix)

### GAP-004: Sleep Guide "Back to Database" Uses Relative Path
**Severity:** MODERATE
**Location:** `sleep.html` line 346
**Current:** `<a href="../index.html">`
**Issue:** Relative path works from `/guides/sleep.html` but breaks if Nginx clean URLs serve the page from `/guides/sleep` (the `../` resolves differently). Should use absolute path.
**Fix:** Change to `<a href="/">` or `<a href="/index.html">`.

### GAP-005: Email Capture Form Has No Backend Integration
**Severity:** MODERATE
**Location:** `sleep.html` line 1099
**Description:** Form `action="#" method="POST"` with localStorage fallback only. No API endpoint, no email service integration (Mailchimp, ConvertKit, etc.), no webhook.
**Impact:** Email addresses stored only in visitor's localStorage — invisible to site owner. PostHog tracks submission events but not the email values.
**Fix:** Integrate with email service API or add PostHog `$set` to capture email as person property.

### GAP-006: No Mobile Navigation Menu on Guide Page
**Severity:** MODERATE
**Location:** `sleep.html` line 355
**Description:** Desktop nav shows section links (Summary, Tier 1, etc.) via `hidden md:flex`. On mobile, these are completely hidden with no hamburger menu or alternative navigation.
**Impact:** Mobile users (likely 60%+ of traffic) cannot navigate between guide sections.
**Fix:** Add mobile dropdown or hamburger toggle for section navigation.

### GAP-007: Health Goals → Guide Page Connection Missing
**Severity:** MODERATE
**Location:** `index.html` lines 469-496 (Health Goals checkboxes)
**Description:** The Dosage Calculator section has health goal checkboxes (sleep, anxiety, stress, etc.) that only filter local data. When a guide page exists for that health goal, there's no CTA or link directing users to the deep-dive guide.
**Impact:** Missed conversion opportunity. Users checking "Sleep" in the calculator should see a "Read our Sleep Evidence Guide →" prompt.
**Fix:** Add conditional CTA that appears when a health goal has a corresponding published guide.

---

## MINOR Issues (P2 — Nice to Have)

### GAP-008: OG:URL Meta Tag Empty on Both Pages
**Severity:** MINOR
**Location:** `index.html` line 14, `sleep.html` line 14
**Description:** `<meta property="og:url" content="">` is empty on both pages. Social sharing will not work correctly.
**Fix:** Populate with canonical URLs once domain is configured.

### GAP-009: Clean URL Routing Only Works with Nginx
**Severity:** MINOR
**Location:** `nginx-supp-db.conf` line 25-28
**Description:** The `location /guides/ { try_files $uri $uri.html $uri/ =404; }` rule correctly handles `/guides/sleep` → `/guides/sleep.html`, but Python's SimpleHTTPServer (used for local dev) doesn't support this. `/guides/sleep.html` returns 301 redirect instead of content.
**Impact:** Dev testing without Docker shows routing anomalies.
**Fix:** Use Docker for all dev testing, or add a simple dev server script with proper routing.

### GAP-010: Tailwind Version Lock
**Severity:** MINOR
**Location:** Both pages load `tailwindcss@2.2.19`
**Description:** Tailwind 2.x is outdated (current is 4.x). The CDN version is pinned, which is good for stability but limits access to modern utilities.
**Impact:** No functional impact currently. Future features may need newer utilities.
**Fix:** Consider upgrade path when redesigning. Not urgent.

---

## Resolution Priority Matrix

| Priority | Gap ID | Description | Effort | Impact |
|----------|--------|-------------|--------|--------|
| **P0** | GAP-001 | Add guide links to nav bar | Small | CRITICAL |
| **P0** | GAP-002 | Add evidence guides section to homepage | Medium | CRITICAL |
| **P0** | GAP-003 | Load problems.js and wire to UI | Medium | CRITICAL |
| **P1** | GAP-004 | Fix relative back-link path | Trivial | Moderate |
| **P1** | GAP-005 | Wire email form to PostHog person $set | Small | Moderate |
| **P1** | GAP-006 | Add mobile nav to guide page | Small | Moderate |
| **P1** | GAP-007 | Add guide CTA to health goals | Small | Moderate |
| **P2** | GAP-008 | Populate OG:URL meta tags | Trivial | Minor |
| **P2** | GAP-009 | Dev server clean URL support | Small | Minor |
| **P2** | GAP-010 | Tailwind version assessment | N/A | Minor |

---

## Recommended Resolution Order

1. **GAP-001 + GAP-002 + GAP-003** — Main site integration (nav + section + data loading)
2. **GAP-004 + GAP-008** — Quick path fixes
3. **GAP-005 + GAP-006** — Guide page UX improvements
4. **GAP-007** — Cross-feature linking
