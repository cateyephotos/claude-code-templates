/**
 * pricing.js — Pricing Page Logic
 *
 * Handles auth-aware CTA button states and Stripe Checkout flow.
 *
 * Button states by auth:
 *   - Anonymous: Free → openSignUp(), Paid → openSignUp() (then redirect back)
 *   - Signed-in free: Free → "Current Plan" (disabled), Paid → createCheckout(plan)
 *   - Subscriber: Current plan → "Current Plan" (disabled), others → "Manage Subscription"
 *   - Admin: Same as subscriber
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth)
 *   - convex-client.js (window.SupplementDB)
 *   - rbac.js (window.SupplementDBRBAC)
 */
(function () {
  "use strict";

  // ── DOM Elements ────────────────────────────────────────────
  const ctaFree = document.getElementById("cta-free");
  const ctaMonthly = document.getElementById("cta-monthly");
  const ctaAnnual = document.getElementById("cta-annual");
  const cancelledBanner = document.getElementById("cancelled-banner");
  const toastEl = document.getElementById("pricing-toast");

  // ── Toast Helper ────────────────────────────────────────────
  let toastTimeout = null;
  function showToast(message, duration) {
    duration = duration || 4000;
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove("show");
    }, duration);
  }

  // ── Button State Helpers ────────────────────────────────────
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span> Processing…';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || btn.textContent;
    }
  }

  function setButtonCurrent(btn) {
    if (!btn) return;
    btn.textContent = "Current Plan";
    btn.className = "plan-cta current";
    btn.disabled = true;
    btn.onclick = null;
  }

  function setButtonManage(btn) {
    if (!btn) return;
    btn.textContent = "Manage Subscription";
    btn.className = "plan-cta outline";
    btn.disabled = false;
    btn.onclick = function () {
      openPortal();
    };
  }

  // ── Stripe Actions ──────────────────────────────────────────
  async function createCheckout(plan) {
    var btn = plan === "monthly" ? ctaMonthly : ctaAnnual;
    setButtonLoading(btn, true);

    try {
      if (!window.SupplementDB || !window.SupplementDB.action) {
        throw new Error("Payment system is not ready. Please refresh and try again.");
      }

      var result = await window.SupplementDB.action("stripe:createCheckoutSession", {
        plan: plan,
      });

      if (result && result.url) {
        // Track checkout initiation
        try {
          if (typeof posthog !== "undefined") {
            posthog.capture("checkout_initiated", { plan: plan });
          }
        } catch (e) {
          // Analytics should never block checkout
        }
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create checkout session.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setButtonLoading(btn, false);
      showToast(err.message || "Something went wrong. Please try again.");
    }
  }

  async function openPortal() {
    try {
      if (!window.SupplementDB || !window.SupplementDB.action) {
        throw new Error("Payment system is not ready. Please refresh and try again.");
      }

      var result = await window.SupplementDB.action("stripe:createPortalSession");

      if (result && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Failed to open subscription management.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      showToast(err.message || "Could not open subscription management. Please try again.");
    }
  }

  // ── Update UI Based on Auth State ───────────────────────────
  async function updatePricingUI() {
    var auth = window.SupplementDBAuth;
    var rbac = window.SupplementDBRBAC;

    // State 1: Not signed in — show sign-up prompts
    if (!auth || !auth.isSignedIn) {
      if (ctaFree) {
        ctaFree.textContent = "Get Started Free";
        ctaFree.className = "plan-cta outline";
        ctaFree.disabled = false;
        ctaFree.onclick = function () {
          trackCTA("free", "signup");
          if (auth && auth.openSignUp) {
            auth.openSignUp();
          }
        };
      }
      if (ctaMonthly) {
        ctaMonthly.textContent = "Subscribe Monthly";
        ctaMonthly.className = "plan-cta primary";
        ctaMonthly.disabled = false;
        ctaMonthly.onclick = function () {
          trackCTA("monthly", "signup");
          if (auth && auth.openSignUp) {
            auth.openSignUp();
          }
        };
      }
      if (ctaAnnual) {
        ctaAnnual.textContent = "Subscribe Annually";
        ctaAnnual.className = "plan-cta dark";
        ctaAnnual.disabled = false;
        ctaAnnual.onclick = function () {
          trackCTA("annual", "signup");
          if (auth && auth.openSignUp) {
            auth.openSignUp();
          }
        };
      }
      return;
    }

    // Signed in — check subscription status
    var subscription = null;
    try {
      if (window.SupplementDB && window.SupplementDB.query) {
        subscription = await window.SupplementDB.query("subscriptions:getMySubscription");
      }
    } catch (err) {
      console.warn("Failed to fetch subscription:", err);
    }

    var isAdmin = rbac && rbac.isAdmin && rbac.isAdmin();
    var isSubscriber = rbac && rbac.isSubscriber && rbac.isSubscriber();

    // Also check Convex subscription as fallback
    var hasActiveSub = subscription &&
      (subscription.status === "active" || subscription.status === "trialing");

    // Show cancelled banner if applicable
    if (subscription && subscription.cancelAtPeriodEnd && hasActiveSub) {
      if (cancelledBanner) {
        var endDate = subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
          : "the end of your billing period";
        cancelledBanner.innerHTML =
          '<i class="fas fa-info-circle"></i> ' +
          "Your subscription is set to cancel on " + endDate + ". " +
          "You still have full access until then.";
        cancelledBanner.classList.add("show");
      }
    }

    // State 2: Subscriber or Admin — show current/manage
    if (isAdmin || isSubscriber || hasActiveSub) {
      var currentPlan = subscription ? subscription.plan : "monthly";

      // Free card — always current for subscribers (they have free features too)
      setButtonCurrent(ctaFree);

      if (currentPlan === "monthly") {
        setButtonCurrent(ctaMonthly);
        setButtonManage(ctaAnnual);
      } else if (currentPlan === "annual") {
        setButtonManage(ctaMonthly);
        setButtonCurrent(ctaAnnual);
      } else {
        // Fallback
        setButtonCurrent(ctaMonthly);
        setButtonManage(ctaAnnual);
      }
      return;
    }

    // State 3: Signed-in free user — show checkout buttons
    setButtonCurrent(ctaFree);

    if (ctaMonthly) {
      ctaMonthly.textContent = "Subscribe Monthly";
      ctaMonthly.className = "plan-cta primary";
      ctaMonthly.disabled = false;
      ctaMonthly.onclick = function () {
        trackCTA("monthly", "checkout");
        createCheckout("monthly");
      };
    }

    if (ctaAnnual) {
      ctaAnnual.textContent = "Subscribe Annually";
      ctaAnnual.className = "plan-cta dark";
      ctaAnnual.disabled = false;
      ctaAnnual.onclick = function () {
        trackCTA("annual", "checkout");
        createCheckout("annual");
      };
    }
  }

  // ── Analytics Tracking ──────────────────────────────────────
  function trackCTA(plan, action) {
    try {
      if (typeof posthog !== "undefined") {
        posthog.capture("pricing_cta_clicked", {
          plan: plan,
          action: action,
          is_signed_in: !!(window.SupplementDBAuth && window.SupplementDBAuth.isSignedIn),
        });
      }
    } catch (e) {
      // Never block UI for analytics
    }
  }

  // ── Initialize ──────────────────────────────────────────────
  function init() {
    var auth = window.SupplementDBAuth;
    if (!auth || !auth.isLoaded) {
      document.addEventListener("auth:loaded", function () {
        updatePricingUI();
      }, { once: true });
      // Show default state while auth loads
      return;
    }
    updatePricingUI();
  }

  // Re-update on auth changes
  document.addEventListener("auth:signed-in", function () {
    setTimeout(updatePricingUI, 500);
  });
  document.addEventListener("auth:signed-out", function () {
    setTimeout(updatePricingUI, 300);
  });
  document.addEventListener("auth:role-changed", function () {
    setTimeout(updatePricingUI, 300);
  });

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
