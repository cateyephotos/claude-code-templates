/**
 * content-gate.js — Split-Content Paywall Gate
 *
 * For paid guides: premium content is absent from HTML. It's stored in Convex
 * and fetched only after server-side access verification. The page has a
 * <div id="premium-content" data-guide="{slug}"> placeholder.
 *
 * For free guides (sleep): full content is in the HTML. No gating applied.
 * For excluded pages (mechanisms, sleep-sales): no gating applied.
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth)
 *   - rbac.js (window.SupplementDBRBAC)
 *   - convex-client.js (window.SupplementDB) — for Convex queries/mutations
 */
(function () {
  "use strict";

  // ── Constants ──────────────────────────────────────────────────
  const FREE_GUIDES = ["sleep", "safety-interactions"];
  const EXCLUDED_PAGES = ["mechanisms", "sleep-sales"];
  const PREMIUM_CONTAINER_ID = "premium-content";

  // ── Early exit for non-guide pages ─────────────────────────────
  const pagePath = window.location.pathname.toLowerCase();
  if (!pagePath.includes("/guides/") || pagePath.includes("/admin/")) return;

  // ── Get guide slug ─────────────────────────────────────────────
  const filename = pagePath.split("/").pop() || "";
  const guideSlug = filename.replace(".html", "");

  // ── Skip free guides and excluded pages ────────────────────────
  if (FREE_GUIDES.includes(guideSlug) || EXCLUDED_PAGES.includes(guideSlug)) return;

  // ── State ──────────────────────────────────────────────────────
  let contentLoaded = false;
  let gateImpressionRecorded = false;

  // ── Init ───────────────────────────────────────────────────────
  function initContentGate() {
    const container = document.getElementById(PREMIUM_CONTAINER_ID);
    if (!container) return; // Not a split-content page

    // Show loading state immediately
    showLoadingState(container);

    const auth = window.SupplementDBAuth;
    if (!auth?.isLoaded) {
      document.addEventListener("auth:loaded", () => checkAccessAndLoad(container), { once: true });
      return;
    }
    checkAccessAndLoad(container);
  }

  // ── Access Check ───────────────────────────────────────────────
  async function checkAccessAndLoad(container) {
    if (contentLoaded) return;

    const rbac = window.SupplementDBRBAC;
    const auth = window.SupplementDBAuth;

    // 1. RBAC check (subscriber/admin via Clerk publicMetadata)
    if (rbac?.canAccessSpecificGuide?.(guideSlug) || rbac?.canAccessGuide?.()) {
      await loadPremiumContent(container);
      return;
    }

    // 2. Convex subscription fallback (race condition: Stripe updated DB but JWT not refreshed)
    if (auth?.isSignedIn && window.SupplementDB?.query) {
      try {
        const hasSub = await window.SupplementDB.query("subscriptions:hasActiveSubscription");
        if (hasSub) {
          await loadPremiumContent(container);
          return;
        }
      } catch {
        // Fall through
      }

      // 3. Convex one-off purchase check
      try {
        const hasAccess = await window.SupplementDB.query("guidePurchases:hasWebAccess", { guideSlug });
        if (hasAccess) {
          await loadPremiumContent(container);
          return;
        }
      } catch {
        // Fall through
      }
    }

    // 4. No access — show gate overlay
    showGateOverlay(container);
  }

  // ── Premium Content Loading ────────────────────────────────────
  async function loadPremiumContent(container) {
    if (contentLoaded) return;

    showLoadingState(container);

    try {
      const result = await window.SupplementDB.query("premiumGuideContent:getContent", { guideSlug });

      if (result?.htmlContent) {
        // Content comes from our own trusted Convex backend (admin-uploaded only)
        container.innerHTML = result.htmlContent; // eslint-disable-line no-unsanitized/property
        contentLoaded = true;

        // Trigger reveal animations on newly injected content
        container.querySelectorAll(".reveal").forEach(el => {
          el.classList.add("revealed");
        });

        // Re-initialize any interactive elements
        initInjectedContent(container);

        recordEvent("premium_content_loaded");
      } else {
        showEmptyState(container);
      }
    } catch (err) {
      console.error("Failed to load premium content:", err);
      showErrorState(container);
      recordEvent("premium_content_error");
    }
  }

  // ── Initialize interactive elements in injected content ────────
  function initInjectedContent(container) {
    // Re-initialize citation tabs if present
    const citeTabs = container.querySelectorAll(".cite-tab");
    if (citeTabs.length > 0 && typeof window.switchCiteTab === "function") {
      citeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
          const tabName = tab.getAttribute("data-tab");
          if (tabName) window.switchCiteTab(tabName);
        });
      });
    }

    // Trigger IntersectionObserver for reveal animations
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      container.querySelectorAll(".reveal:not(.revealed)").forEach(el => observer.observe(el));
    }
  }

  // ── Gate Overlay ───────────────────────────────────────────────
  function showGateOverlay(container) {
    const isSignedIn = window.SupplementDBAuth?.isSignedIn;

    // Build overlay using safe DOM methods
    const overlay = document.createElement("div");
    overlay.className = "content-gate-overlay";

    const gradient = document.createElement("div");
    gradient.className = "content-gate-gradient";
    overlay.appendChild(gradient);

    const cta = document.createElement("div");
    cta.className = "content-gate-cta";

    const ctaInner = document.createElement("div");
    ctaInner.className = "content-gate-cta-inner";

    // Icon
    const iconWrap = document.createElement("div");
    iconWrap.className = "content-gate-icon";
    const icon = document.createElement("i");
    icon.className = "fas fa-lock";
    iconWrap.appendChild(icon);
    ctaInner.appendChild(iconWrap);

    // Title
    const title = document.createElement("h3");
    title.className = "content-gate-title";
    title.textContent = "Unlock Full Evidence Guide";
    ctaInner.appendChild(title);

    // Description
    const desc = document.createElement("p");
    desc.className = "content-gate-description";
    desc.textContent = "Get complete evidence analysis with dosage protocols, mechanism breakdowns, interaction warnings, and clinical citations.";
    ctaInner.appendChild(desc);

    if (isSignedIn) {
      // Subscribe link (primary)
      const subLink = document.createElement("a");
      subLink.href = "/pricing.html";
      subLink.id = "gate-cta-subscribe";
      subLink.className = "content-gate-btn-primary";
      subLink.style.textDecoration = "none";
      subLink.style.display = "inline-block";
      subLink.style.textAlign = "center";
      subLink.textContent = "Subscribe \u2014 All Guides $9.99/mo";
      subLink.addEventListener("click", () => {
        recordEvent("gate_cta_clicked", { cta_type: "subscribe" });
      });
      ctaInner.appendChild(subLink);

      // One-off purchase (secondary)
      const secondaryP = document.createElement("p");
      secondaryP.className = "content-gate-secondary";
      secondaryP.textContent = "Just want this guide? ";
      const buyBtn = document.createElement("button");
      buyBtn.id = "gate-cta-buy";
      buyBtn.className = "content-gate-link";
      buyBtn.textContent = "Buy for $4.99";
      buyBtn.addEventListener("click", async () => {
        recordEvent("gate_cta_clicked", { cta_type: "buy_one_off" });
        try {
          const result = await window.SupplementDB.action("stripe:createGuideCheckoutSession", {
            guideSlug,
            accessType: "web",
          });
          if (result?.url) {
            window.location.href = result.url;
          }
        } catch (err) {
          console.error("Failed to create checkout session:", err);
          alert("Something went wrong. Please try again.");
        }
      });
      secondaryP.appendChild(buyBtn);
      ctaInner.appendChild(secondaryP);

      // Trust line
      const trust = document.createElement("p");
      trust.className = "content-gate-trust";
      const shieldIcon = document.createElement("i");
      shieldIcon.className = "fas fa-shield-halved";
      trust.appendChild(shieldIcon);
      trust.appendChild(document.createTextNode(" Cancel anytime \u00B7 Instant access"));
      ctaInner.appendChild(trust);
    } else {
      // Anonymous: subscribe button
      const subBtn = document.createElement("button");
      subBtn.id = "gate-cta-subscribe-anon";
      subBtn.className = "content-gate-btn-primary";
      subBtn.textContent = "Subscribe \u2014 All Guides $9.99/mo";
      subBtn.addEventListener("click", () => {
        recordEvent("gate_cta_clicked", { cta_type: "subscribe" });
        window.SupplementDBAuth?.openSignUp?.();
      });
      ctaInner.appendChild(subBtn);

      // Anonymous: buy button
      const buyBtn = document.createElement("button");
      buyBtn.id = "gate-cta-buy-anon";
      buyBtn.className = "content-gate-btn-secondary";
      buyBtn.textContent = "Buy Just This Guide \u2014 $4.99";
      buyBtn.addEventListener("click", () => {
        recordEvent("gate_cta_clicked", { cta_type: "buy_one_off" });
        window.SupplementDBAuth?.openSignUp?.();
      });
      ctaInner.appendChild(buyBtn);

      // Sign-in line
      const signinP = document.createElement("p");
      signinP.className = "content-gate-signin";
      signinP.textContent = "Already have an account? ";
      const signinBtn = document.createElement("button");
      signinBtn.id = "gate-cta-signin";
      signinBtn.className = "content-gate-link";
      signinBtn.textContent = "Sign in";
      signinBtn.addEventListener("click", () => {
        window.SupplementDBAuth?.openSignIn?.();
      });
      signinP.appendChild(signinBtn);
      ctaInner.appendChild(signinP);

      // Trust line
      const trust = document.createElement("p");
      trust.className = "content-gate-trust";
      const shieldIcon = document.createElement("i");
      shieldIcon.className = "fas fa-shield-halved";
      trust.appendChild(shieldIcon);
      trust.appendChild(document.createTextNode(" Trusted by researchers and practitioners"));
      ctaInner.appendChild(trust);
    }

    cta.appendChild(ctaInner);
    overlay.appendChild(cta);

    // Clear container and append overlay
    container.textContent = "";
    container.appendChild(overlay);

    recordEvent("gate_overlay_shown");
  }

  // ── State Displays ─────────────────────────────────────────────
  function showLoadingState(container) {
    container.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "max-width: 64rem; margin: 2rem auto; padding: 0 1rem;";

    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton-card";
      wrapper.appendChild(skeleton);
    }

    const loadingText = document.createElement("p");
    loadingText.style.cssText = "text-align: center; color: var(--text-muted, #888); font-size: 0.875rem; margin-top: 1rem;";
    loadingText.textContent = "Loading evidence analysis...";
    wrapper.appendChild(loadingText);

    container.appendChild(wrapper);
  }

  function showErrorState(container) {
    container.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "max-width: 48rem; margin: 3rem auto; padding: 2rem; text-align: center;";

    const iconDiv = document.createElement("div");
    iconDiv.style.cssText = "font-size: 2rem; margin-bottom: 1rem;";
    iconDiv.textContent = "\u26A0\uFE0F";
    wrapper.appendChild(iconDiv);

    const heading = document.createElement("h3");
    heading.style.cssText = "color: var(--text-bright, #fff); margin-bottom: 0.5rem;";
    heading.textContent = "Unable to load premium content.";
    wrapper.appendChild(heading);

    const msg = document.createElement("p");
    msg.style.cssText = "color: var(--text-muted, #888); margin-bottom: 1.5rem;";
    msg.textContent = "This may be a temporary issue.";
    wrapper.appendChild(msg);

    const retryBtn = document.createElement("button");
    retryBtn.id = "gate-retry-btn";
    retryBtn.className = "content-gate-btn-primary";
    retryBtn.style.maxWidth = "200px";
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", () => {
      contentLoaded = false;
      loadPremiumContent(container);
    });
    wrapper.appendChild(retryBtn);

    const supportP = document.createElement("p");
    supportP.style.cssText = "color: var(--text-muted, #888); font-size: 0.8rem; margin-top: 1rem;";
    supportP.textContent = "If the problem persists, contact ";
    const supportLink = document.createElement("a");
    supportLink.href = "mailto:support@supplementdb.co";
    supportLink.style.color = "var(--glow, #6366f1)";
    supportLink.textContent = "support@supplementdb.co";
    supportP.appendChild(supportLink);
    wrapper.appendChild(supportP);

    container.appendChild(wrapper);
  }

  function showEmptyState(container) {
    container.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "max-width: 48rem; margin: 3rem auto; padding: 2rem; text-align: center;";

    const iconDiv = document.createElement("div");
    iconDiv.style.cssText = "font-size: 2rem; margin-bottom: 1rem;";
    iconDiv.textContent = "\u2139\uFE0F";
    wrapper.appendChild(iconDiv);

    const heading = document.createElement("h3");
    heading.style.cssText = "color: var(--text-bright, #fff); margin-bottom: 0.5rem;";
    heading.textContent = "Content temporarily unavailable.";
    wrapper.appendChild(heading);

    const msg = document.createElement("p");
    msg.style.cssText = "color: var(--text-muted, #888);";
    msg.textContent = "Our team has been notified.";
    wrapper.appendChild(msg);

    const supportP = document.createElement("p");
    supportP.style.cssText = "color: var(--text-muted, #888); font-size: 0.8rem; margin-top: 1rem;";
    supportP.textContent = "Contact ";
    const supportLink = document.createElement("a");
    supportLink.href = "mailto:support@supplementdb.co";
    supportLink.style.color = "var(--glow, #6366f1)";
    supportLink.textContent = "support@supplementdb.co";
    supportP.appendChild(supportLink);
    supportP.appendChild(document.createTextNode(" for assistance"));
    wrapper.appendChild(supportP);

    container.appendChild(wrapper);
  }

  // ── Analytics ──────────────────────────────────────────────────
  function recordEvent(eventType, extraProps) {
    // Deduplicate impressions
    if (eventType === "gate_overlay_shown" && gateImpressionRecorded) return;
    if (eventType === "gate_overlay_shown") gateImpressionRecorded = true;

    // Track via Convex
    try {
      if (window.SupplementDB?.mutation) {
        window.SupplementDB.mutation("analytics:recordGateEvent", {
          sessionId: window.SupplementDB.getSessionId?.() || "unknown",
          userId: window.SupplementDBAuth?.user?.id || undefined,
          guideSlug,
          eventType,
          scrollPercent: getScrollPercent(),
        }).catch(() => {});
      }
    } catch {
      // Analytics should never break the page
    }

    // PostHog
    try {
      if (typeof posthog !== "undefined") {
        posthog.capture("guide_gate_" + eventType, {
          guide: guideSlug,
          scrollPercent: getScrollPercent(),
          ...extraProps,
        });
      }
    } catch {
      // Silently fail
    }
  }

  function getScrollPercent() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight <= 0) return 0;
    return Math.round((scrollTop / scrollHeight) * 100);
  }

  // ── Auth Event Listeners ───────────────────────────────────────
  document.addEventListener("auth:signed-in", () => {
    const container = document.getElementById(PREMIUM_CONTAINER_ID);
    if (container && !contentLoaded) {
      setTimeout(() => checkAccessAndLoad(container), 500);
    }
  });

  document.addEventListener("auth:signed-out", () => {
    contentLoaded = false;
    const container = document.getElementById(PREMIUM_CONTAINER_ID);
    if (container) {
      showGateOverlay(container);
    }
  });

  document.addEventListener("auth:role-changed", () => {
    const container = document.getElementById(PREMIUM_CONTAINER_ID);
    if (container && !contentLoaded) {
      setTimeout(() => checkAccessAndLoad(container), 300);
    }
  });

  // ── Handle ?purchased=true URL param ───────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("purchased") === "true") {
    // Clean URL
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);
  }

  // ── Initialize ─────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContentGate);
  } else {
    initContentGate();
  }
})();
