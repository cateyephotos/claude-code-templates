# Monograph Preview Wall — Design Spec

**Linear Issue:** [SUPP-28](https://linear.app/brooklyn-wedding/issue/SUPP-28/monograph-preview-wall-require-sign-in-to-view-full-supplement-pages)

**Goal:** Gate all 113 monograph/supplement pages behind a free Clerk account sign-in, showing sections 1–3 as a preview with a gradient fade + section-teaser CTA overlay. Architecture supports future upgrade to paid subscription gate.

**Tech Stack:** Clerk (via `SupplementDBAuth` wrapper in `auth.js`), existing `content-gate.css` (styling), new `monograph-gate.js` (gate logic), `inject-auth.js` (build-time injection), `seed.js` (marker insertion), PostHog (analytics)

---

## 1. User Experience

### Unauthenticated visitor

1. Page loads and renders the hero, sticky nav, and sections 1–3:
   - **Section 1:** Quick Facts ("At a Glance")
   - **Section 2:** Overview ("Background")
   - **Section 3:** Mechanisms ("How It Works")
2. After section 3, a gradient fade obscures the transition.
3. A gate overlay replaces sections 4–10 with:
   - Lock icon
   - "Sign in to continue reading"
   - Dynamic count + pill badges naming each gated section (read from `section-label` text before DOM removal — e.g., "What the Research Shows", "Quantified Outcomes", "How to Use", "Tolerability", "Deep Dive", "Citations", "Explore More")
   - Green "Sign In / Create Account" button (triggers `SupplementDBAuth.openSignIn()`)
   - "Free account · No credit card required" subtitle
4. Page scroll is not artificially locked — the user can scroll to the gate overlay but there is no content below it.

**Note:** The pill labels are dynamically read from each gated section's `.section-label` text, so they automatically reflect whatever `seed.js` generates. The count is also dynamic (number of sections actually removed).

### Authenticated visitor (free account)

Full monograph renders with all 10 sections. No gate, no overlay, no visual difference from the current experience.

### Future: Paid subscriber gate (Phase 2, out of scope)

Same gate UX but CTA changes to subscribe/purchase buttons. Content stripped server-side instead of client-side DOM removal.

---

## 2. Architecture

### Decision: Client-side DOM stripping (Phase 1)

Content is present in the HTML payload but removed from the DOM before first paint by `monograph-gate.js`. This is acceptable for Phase 1 because:
- The gate protects free content (sign-in required, not payment)
- Determined scrapers could extract content from source, but casual users cannot
- Significantly simpler than server-side stripping
- Clean upgrade path to server-side stripping for Phase 2

**Print behavior:** For unauthenticated users, gated sections are removed from the DOM and therefore not printable. This is acceptable for Phase 1 (free sign-in). For authenticated users, all content is in the DOM and prints normally.

### Decision: Separate JS file

`monograph-gate.js` is a new standalone file rather than extending `content-gate.js` because:
- Monograph gate reveals in-page content; guide gate fetches premium content from Convex
- Monograph gate checks `isSignedIn` only; guide gate checks subscriptions and purchases
- Avoids regression risk to existing guide gates
- `content-gate.js` is already 479 lines

### Decision: Gate cutoff after section 3

Sections 1–3 (Quick Facts, Overview, Mechanisms) provide enough value to hook the reader while keeping the most actionable content (benefits, dosing, safety) behind the gate.

---

## 3. Components

### 3.1 `js/monograph-gate.js` (new, ~150 lines)

**Responsibility:** Auth check, DOM stripping, overlay injection, analytics.

**Auth API:** Uses `window.SupplementDBAuth` (the Clerk wrapper exposed by `auth.js`), NOT the raw `window.Clerk` object. Key API surface:
- `SupplementDBAuth.isSignedIn` — boolean getter for auth state
- `SupplementDBAuth.isLoaded` — boolean, true after Clerk initialization
- `SupplementDBAuth.openSignIn()` — opens the Clerk sign-in modal
- Event `auth:loaded` — fired when Clerk finishes initializing
- Event `auth:signed-in` — fired when user signs in
- Event `auth:signed-out` — fired when user signs out

**Behavior:**
1. Wait for auth to initialize: check `SupplementDBAuth.isLoaded`, or listen for `auth:loaded` event
2. Check `SupplementDBAuth.isSignedIn`
3. If **not signed in:**
   - Find `<!-- MONOGRAPH_GATE_POINT -->` comment node in DOM (fall back to `document.getElementById('mechanisms')` and gate after it, if marker missing)
   - Collect all sibling `<section>` elements after the gate point
   - Read each gated section's `.section-label` text to build pill labels dynamically
   - Remove collected sections from DOM
   - Build gate overlay DOM (gradient + CTA with dynamic section pills)
   - Insert overlay after the last visible section
   - Fire `monograph_gate_shown` PostHog event with supplement slug and section count
4. If **signed in:** no-op
5. Listen for `auth:signed-in` event — reload page (`window.location.reload()`)
6. Listen for `auth:signed-out` event — reload page to re-gate

**Script loading order constraint:** `monograph-gate.js` MUST be loaded after `auth.js`, `convex-client.js`, and `rbac.js` (which are injected by `BODY_INJECT` in `inject-auth.js`). The gate script depends on `window.SupplementDBAuth` existing.

**Gate overlay DOM structure** (reuses `content-gate.css` classes):
```html
<!-- Inserted as a sibling AFTER the last visible section -->
<div class="content-gate-overlay">
  <div class="content-gate-gradient"></div>
  <div class="content-gate-cta">
    <div class="content-gate-cta-inner">
      <div class="content-gate-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h3>Sign in to continue reading</h3>
      <p class="gate-section-count">{N} more sections behind the gate:</p>
      <div class="gate-section-pills">
        <!-- Dynamically generated from section-label text -->
        <span class="gate-pill">{label from section-label}</span>
        ...
      </div>
      <button class="content-gate-btn-primary">
        Sign In / Create Account
      </button>
      <p class="gate-subtitle">Free account · No credit card required</p>
    </div>
  </div>
</div>
```

**Important DOM structure notes:**
- `.content-gate-overlay` is the top-level element, inserted as a direct sibling after the last visible section — NOT wrapped in `.content-gated`. This matches the existing CSS which uses `margin-top: -120px` on `.content-gate-overlay` to overlap with the preceding content for the gradient effect.
- `.content-gate-cta-inner` wraps the CTA content — this is required for the existing CSS card styles (`max-width: 480px`, `border-radius: 12px`, `box-shadow`, dark theme overrides at `content-gate.css` line 111).
- `.content-gate-icon` reuses the existing 56px circular gradient icon container (`content-gate.css` line 125) with a Font Awesome `fas fa-lock` icon — matching the existing guide gate pattern in `content-gate.js` line 180.
- The sign-in button uses `addEventListener` to call `SupplementDBAuth.openSignIn()` — NOT an inline `onclick` attribute (the auth object may not be ready at parse time).
- `.content-gated` class is applied to the last visible section to enable the `overflow: hidden` + gradient overlap effect.

**Pill generation:** Pills are built dynamically before DOM removal:
```javascript
// Before removing gated sections:
const pills = gatedSections.map(section => {
  const label = section.querySelector('.section-label');
  return label ? label.textContent.trim() : null;
}).filter(Boolean);
```

### 3.2 `css/content-gate.css` (existing, minor additions)

Reuse all existing gate overlay styles (`.content-gate-overlay`, `.content-gate-gradient`, `.content-gate-cta`, `.content-gate-cta-inner`, `.content-gate-icon`, `.content-gate-btn-primary`). Add only:
- `.gate-section-pills` — flex container for section name pills (`display: flex`, `flex-wrap: wrap`, `justify-content: center`, `gap: 6px`)
- `.gate-pill` — individual pill badge styling (background: `var(--accent-bg)`, color: `var(--accent)`, `border-radius: 12px`, `font-size: 0.75rem`, `padding: 3px 10px`)
- `.gate-section-count` — "N more sections" text styling (`color: var(--text-muted)`, `font-size: 0.875rem`)
- `.gate-subtitle` — "Free account" subtitle (`color: var(--text-muted)`, `font-size: 0.75rem`, `margin-top: 0.75rem`)

These additions follow the existing design token system (`--accent`, `--accent-bg`, etc.) and include `[data-theme="dark"]` variants.

### 3.3 `seed.js` (modify)

Insert a `<!-- MONOGRAPH_GATE_POINT -->` HTML comment after section 3 (`#mechanisms`) in the generated monograph HTML. This is a single-line addition to the template rendering logic.

### 3.4 `scripts/inject-auth.js` (modify)

Extend the page-type detection to recognize supplement pages:
```javascript
const isSupplementPage = relativePath.replace(/\\/g, "/").startsWith("supplements/");
```

**Idempotency consideration:** Existing supplement pages generated by `seed.js` already contain `<meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">` (set by `seed.js`). The current idempotency guard checks for `id="auth-buttons"` or `clerk-publishable-key"`. Since `seed.js` uses `name="clerk-key"` (not `name="clerk-publishable-key"`), supplement pages will NOT be skipped by the guard. However, this means `inject-auth.js` will inject a second set of Clerk/Convex CDN tags. Two approaches:

**Chosen approach:** Change the idempotency guard to only skip pages that have `id="auth-buttons"` (meaning `inject-auth.js` already fully processed them). For pages with `name="clerk-key"` (supplement pages generated by `seed.js`), detect them as `hasAuthFromSeed` and skip the base `HEAD_INJECT` and nav button injection (already present from `seed.js`), but still inject `content-gate.css` in `<head>` and `monograph-gate.js` before `</body>`. This is lower-risk than modifying `seed.js`'s auth injection and keeps the existing supplement generation pipeline unchanged.

For supplement pages, inject:
- `content-gate.css` in `<head>` (same pattern as guide pages)
- `monograph-gate.js` before `</body>`, AFTER the existing `BODY_INJECT` scripts (auth.js, convex-client.js, rbac.js)

---

## 4. Analytics

| Event | Payload | When |
|-------|---------|------|
| `monograph_gate_shown` | `{ slug, sections_gated: N }` | Gate overlay injected |
| `monograph_gate_signin_click` | `{ slug }` | User clicks sign-in CTA |

Events sent to PostHog via existing `analytics-enhanced.js` integration. Event names use `monograph_gate_` prefix (distinct from guide gate's `guide_gate_` prefix). Convex tracking optional for Phase 1.

---

## 5. Error Handling

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| Clerk CDN fails to load / `SupplementDBAuth` unavailable | Gate does NOT activate (fail-open) | Better to show content than block users |
| `<!-- MONOGRAPH_GATE_POINT -->` marker missing | Fall back to gating after `#mechanisms` section by element ID | Graceful degradation for un-regenerated pages |
| A supplement page has fewer than 4 sections | Gate does not activate (nothing to gate) | Avoid broken UX on edge-case pages |
| User signs in (`auth:signed-in` event) | Page reloads to reveal full content | Simplest approach — avoids complex DOM re-insertion |
| User signs out (`auth:signed-out` event) | Page reloads to re-gate | Consistent behavior |
| JavaScript disabled | Full content visible (no gate) | Acceptable for free-tier; server-side stripping solves this in Phase 2 |

---

## 6. Testing Strategy

### Playwright tests (`tests/monograph-gate.spec.js`)

1. **Gate renders for unauthenticated:** Navigate to a supplement page without auth, verify only 3 sections visible, gate overlay present with correct dynamic pills
2. **Content not in DOM:** Verify gated section IDs (`#benefits`, `#dosage`, etc.) are NOT in the DOM when gate is active
3. **Dynamic pill labels:** Verify pill text matches the actual `section-label` values from the page
4. **Sign-in reveals content:** Mock Clerk sign-in via `auth:signed-in` event, verify page reload reveals all 10 sections
5. **Dark theme:** Verify gate overlay renders correctly with `data-theme="dark"`
6. **Mobile responsive:** Verify gate overlay layout on mobile viewport (375px)
7. **Analytics — gate shown:** Verify `monograph_gate_shown` fires on gate render with correct slug and section count
8. **Analytics — sign-in click:** Verify `monograph_gate_signin_click` fires when CTA button is clicked
9. **Fallback:** Test a page without the marker comment — verify gate still activates using `#mechanisms` fallback

### Manual verification

- Print stylesheet: authenticated users see full content; unauthenticated users see only preview sections (gated content is removed from DOM, not just hidden)
- Gate CTA button opens Clerk sign-in modal via `SupplementDBAuth.openSignIn()`
- No regression to existing guide page gates
- Gate works on pages with varying section counts

---

## 7. Upgrade Path to Phase 2 (Paid Gate)

When paid subscriptions are added to monographs:

1. **`seed.js`:** Change `<!-- MONOGRAPH_GATE_POINT -->` to `<!-- PREMIUM_CONTENT_START -->` / `<!-- PREMIUM_CONTENT_END -->` marker pair (matching guide pattern)
2. **Server-side stripping:** Add a build-time or Edge Middleware step that strips content between markers for unauthenticated/non-subscribed requests. This follows the same marker-based approach used by guide pages (where `generate-guide-pages.js` inserts `PREMIUM_CONTENT_START/END` markers and `content-gate.js` handles the split at line 3132).
3. **`monograph-gate.js`:** Add subscription/purchase checks (adopt patterns from `content-gate.js` — RBAC check, Convex subscription query, one-off purchase query), update CTA to show subscribe/buy buttons with pricing
4. **Convex:** Add monograph access records (subscription or one-off purchase)

This upgrade is additive — Phase 1 code provides the foundation. The gate overlay UX, CSS, analytics, and `inject-auth.js` integration carry forward unchanged.

---

## 8. Files Changed Summary

| File | Change | Lines |
|------|--------|-------|
| `js/monograph-gate.js` | **Create** | ~150 |
| `css/content-gate.css` | **Modify** — add pill/subtitle styles + dark variants | ~40 |
| `seed.js` | **Modify** — insert gate marker comment after section 3 | ~5 |
| `scripts/inject-auth.js` | **Modify** — add supplement page detection, idempotency fix, gate CSS/JS injection | ~25 |
| `tests/monograph-gate.spec.js` | **Create** | ~120 |
