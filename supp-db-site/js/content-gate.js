/**
 * content-gate.js — SEO-Preserving Soft Content Gate
 *
 * Applies a soft gate on guide pages for free/anonymous users.
 * Content stays in the DOM for SEO crawlers, but is visually hidden
 * behind a gradient overlay with a CTA to sign up.
 *
 * Gating strategy:
 *   - Free/anonymous: content cut at [data-gate-cutoff] marker (or fallback %)
 *   - Subscriber/admin: full content, no gate
 *   - Content stays in DOM (CSS-only hiding) — SEO preserved
 *
 * Gate placement:
 *   - If a [data-gate-cutoff] element exists inside the content, the gate
 *     is placed at that element's offsetTop (shows ~3-4 summary rows).
 *   - Otherwise falls back to VISIBLE_PERCENT of total height.
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth)
 *   - rbac.js (window.SupplementDBRBAC)
 *   - convex-client.js (window.SupplementDB) — for gate event tracking
 *
 * Affected pages: guides/{slug}.html (20 evidence guide pages), evidence/{domain}/{supplement}.html, tools/{slug}.html
 */
(function () {
  "use strict";

  // Only run on guide pages
  const path = window.location.pathname.toLowerCase();
  if ((!path.includes("/guides/") && !path.includes("/evidence/") && !path.includes("/tools/")) || path.includes("/admin/")) return;

  // ── Configuration ──────────────────────────────────────────────
  const VISIBLE_PERCENT = 15; // Fallback percentage if no cutoff marker found
  const GATE_ID = "content-gate-overlay";
  const GATED_CONTENT_SELECTOR = ".content-body, .guide-content, article, main, main .prose";
  const CUTOFF_MARKER_SELECTOR = "[data-gate-cutoff]";

  // ── State ──────────────────────────────────────────────────────
  let gateApplied = false;
  let gateImpressionRecorded = false;

  // ── Main logic ─────────────────────────────────────────────────
  function initContentGate() {
    // Wait for auth to load
    const auth = window.SupplementDBAuth;
    if (!auth?.isLoaded) {
      document.addEventListener("auth:loaded", checkAndApplyGate, { once: true });
      // Apply gate immediately (assume free) to prevent content flash
      applyGate();
      return;
    }
    checkAndApplyGate();
  }

  async function checkAndApplyGate() {
    const rbac = window.SupplementDBRBAC;

    // Primary check: RBAC (reads role from Clerk publicMetadata)
    if (rbac?.canAccessGuide()) {
      removeGate();
      return;
    }

    // Convex fallback for race condition:
    // Stripe webhook may have updated Convex DB subscription status
    // but Clerk JWT hasn't refreshed yet, so RBAC still reads "free".
    // Query Convex directly to check subscription status.
    const auth = window.SupplementDBAuth;
    if (auth?.isSignedIn && window.SupplementDB?.query) {
      try {
        const hasAccess = await window.SupplementDB.query(
          "subscriptions:hasActiveSubscription"
        );
        if (hasAccess) {
          removeGate();
          return;
        }
      } catch {
        // Convex query failed — fall through to apply gate
      }
    }

    applyGate();
  }

  function applyGate() {
    if (gateApplied) {
      // Gate CSS is already applied — just refresh the overlay content to reflect
      // the current auth state. This handles the case where the overlay was created
      // before auth loaded (showing anonymous CTA) and now needs to show the correct
      // signed-in CTA (e.g., "Upgrade to Pro" instead of "Start Free Account").
      const existingOverlay = document.getElementById(GATE_ID);
      if (existingOverlay) {
        existingOverlay.replaceWith(createGateOverlay());
      }
      return;
    }

    const contentEl = findContentElement();
    if (!contentEl) return;

    // Calculate height for visible portion.
    // Priority: use [data-gate-cutoff] marker position if present,
    // otherwise fall back to percentage of total height.
    let visibleHeight;
    const cutoffEl = contentEl.querySelector(CUTOFF_MARKER_SELECTOR);
    if (cutoffEl) {
      // offsetTop is relative to the content element's top
      visibleHeight = cutoffEl.offsetTop;
    } else {
      const fullHeight = contentEl.scrollHeight;
      visibleHeight = Math.max(300, (fullHeight * VISIBLE_PERCENT) / 100);
    }

    // Minimum height so the gate doesn't look broken
    visibleHeight = Math.max(250, visibleHeight);

    // Apply CSS gate
    contentEl.classList.add("content-gated");
    contentEl.style.maxHeight = visibleHeight + "px";

    // Insert gate overlay
    const overlay = createGateOverlay();
    contentEl.parentNode.insertBefore(overlay, contentEl.nextSibling);

    gateApplied = true;

    // Record impression
    recordGateEvent("impression");
  }

  function removeGate() {
    const contentEl = findContentElement();
    if (contentEl) {
      contentEl.classList.remove("content-gated");
      contentEl.style.maxHeight = "";
    }

    const overlay = document.getElementById(GATE_ID);
    if (overlay) {
      overlay.remove();
    }

    gateApplied = false;
  }

  function findContentElement() {
    const selectors = GATED_CONTENT_SELECTOR.split(",").map((s) => s.trim());
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // ── Gate Overlay HTML ──────────────────────────────────────────
  function createGateOverlay() {
    const guideSlug = getGuideSlug();
    const isSignedIn = window.SupplementDBAuth?.isSignedIn;
    const overlay = document.createElement("div");
    overlay.id = GATE_ID;
    overlay.className = "content-gate-overlay";

    if (isSignedIn) {
      // Signed-in free user — show upgrade CTA
      overlay.innerHTML = `
        <div class="content-gate-gradient"></div>
        <div class="content-gate-cta">
          <div class="content-gate-cta-inner">
            <div class="content-gate-icon">
              <i class="fas fa-crown"></i>
            </div>
            <h3 class="content-gate-title">Upgrade to Pro</h3>
            <p class="content-gate-description">
              Get full access to all 8 evidence guides with dosage protocols,
              mechanism analysis, interaction warnings, and clinical citations.
            </p>
            <a href="/pricing.html" id="gate-cta-upgrade" class="content-gate-btn-primary" style="text-decoration:none; display:inline-block; text-align:center;">
              View Plans &amp; Pricing
            </a>
            <p class="content-gate-trust">
              <i class="fas fa-shield-halved"></i>
              Cancel anytime &middot; Instant access
            </p>
          </div>
        </div>
      `;

      overlay.querySelector("#gate-cta-upgrade")?.addEventListener("click", () => {
        recordGateEvent("upgrade_click");
      });
    } else {
      // Anonymous user — show sign-up CTA
      overlay.innerHTML = `
        <div class="content-gate-gradient"></div>
        <div class="content-gate-cta">
          <div class="content-gate-cta-inner">
            <div class="content-gate-icon">
              <i class="fas fa-lock"></i>
            </div>
            <h3 class="content-gate-title">Unlock Full Evidence Guide</h3>
            <p class="content-gate-description">
              Get complete access to dosage protocols, mechanism analysis,
              interaction warnings, and all clinical citations.
            </p>
            <button id="gate-cta-signup" class="content-gate-btn-primary">
              Start Free Account
            </button>
            <p class="content-gate-signin">
              Already have an account?
              <button id="gate-cta-signin" class="content-gate-link">Sign in</button>
            </p>
            <p class="content-gate-trust">
              <i class="fas fa-shield-halved"></i>
              Trusted by researchers and practitioners
            </p>
          </div>
        </div>
      `;

      overlay.querySelector("#gate-cta-signup")?.addEventListener("click", () => {
        recordGateEvent("cta_click");
        if (window.SupplementDBAuth?.openSignUp) {
          recordGateEvent("sign_up_started");
          window.SupplementDBAuth.openSignUp();
        }
      });

      overlay.querySelector("#gate-cta-signin")?.addEventListener("click", () => {
        recordGateEvent("cta_click");
        if (window.SupplementDBAuth?.openSignIn) {
          window.SupplementDBAuth.openSignIn();
        }
      });
    }

    return overlay;
  }

  // ── Helpers ────────────────────────────────────────────────────
  function getGuideSlug() {
    const path = window.location.pathname;
    const filename = path.split("/").pop() || "";
    return filename.replace(".html", "");
  }

  function recordGateEvent(eventType) {
    // Deduplicate impressions
    if (eventType === "impression" && gateImpressionRecorded) return;
    if (eventType === "impression") gateImpressionRecorded = true;

    // Track via Convex
    try {
      if (window.SupplementDB?.mutation) {
        window.SupplementDB.mutation("analytics:recordGateEvent", {
          sessionId: window.SupplementDB.getSessionId(),
          userId: window.SupplementDBAuth?.user?.id || undefined,
          guideSlug: getGuideSlug(),
          eventType,
          scrollPercent: getScrollPercent(),
        }).catch(() => {});
      }
    } catch {
      // Analytics should never break the page
    }

    // Also track via PostHog if available
    try {
      if (typeof posthog !== "undefined") {
        posthog.capture("guide_gate_" + eventType, {
          guide: getGuideSlug(),
          scrollPercent: getScrollPercent(),
        });
      }
    } catch {
      // Silently fail
    }
  }

  function getScrollPercent() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    if (scrollHeight <= 0) return 0;
    return Math.round((scrollTop / scrollHeight) * 100);
  }

  // ── Listen for auth changes ────────────────────────────────────
  document.addEventListener("auth:signed-in", () => {
    // Re-check access after sign-in
    setTimeout(checkAndApplyGate, 500);
  });

  document.addEventListener("auth:signed-out", () => {
    applyGate();
  });

  // Listen for role changes (e.g., after successful Stripe checkout)
  document.addEventListener("auth:role-changed", () => {
    setTimeout(checkAndApplyGate, 300);
  });

  // ── Initialize ─────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContentGate);
  } else {
    initContentGate();
  }
})();
