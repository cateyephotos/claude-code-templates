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
  // Only reload on real sign-in transitions (user used the modal),
  // NOT on initial page load where user is already signed in.
  // The initial event has { initial: true } in detail — skip it to prevent refresh loops.
  let reloadScheduled = false;

  document.addEventListener("auth:signed-in", function (e) {
    if (e.detail?.initial) return; // Already signed in on load — no reload needed
    if (reloadScheduled) return;
    reloadScheduled = true;
    window.location.reload();
  });

  document.addEventListener("auth:signed-out", function () {
    if (reloadScheduled) return;
    reloadScheduled = true;
    window.location.reload();
  });

  // ── Initialize ──────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMonographGate);
  } else {
    initMonographGate();
  }
})();
