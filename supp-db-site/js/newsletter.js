/**
 * newsletter.js — Shared Newsletter Subscription Handler
 *
 * Replaces all duplicated inline newsletter handlers across HTML files.
 * Provides a single init() call that wires up form submission, Convex
 * mutation, localStorage dedup, and PostHog tracking.
 *
 * Dependencies:
 *   - convex-client.js (window.SupplementDB) — optional, graceful fallback
 *   - PostHog (window.posthog) — optional, analytics only
 *
 * Usage in HTML:
 *   <script src="js/newsletter.js"></script>
 *   <script>
 *     SupplementDBNewsletter.init("form-id", "input-id", "message-id", "homepage");
 *   </script>
 */
(function () {
  "use strict";

  var STORAGE_KEY = "sdb_newsletter";

  /**
   * Read stored emails from localStorage.
   */
  function getStoredEmails() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  /**
   * Save email to localStorage dedup list.
   */
  function storeEmail(email) {
    try {
      var stored = getStoredEmails();
      if (stored.indexOf(email) === -1) {
        stored.push(email);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    } catch (e) {
      // localStorage unavailable — continue silently
    }
  }

  /**
   * Show a message in the designated message element.
   */
  function showMessage(msgEl, text, isError) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.display = "block";
    if (isError) {
      msgEl.style.color = "#e11d48";
    } else {
      msgEl.style.color = "";
    }
  }

  /**
   * Track newsletter events in PostHog.
   */
  function trackEvent(source, email) {
    try {
      if (typeof posthog !== "undefined") {
        var eventName = source === "homepage"
          ? "newsletter_signup"
          : "guide_email_captured";
        posthog.capture(eventName, {
          email_domain: email.split("@")[1],
          source: source,
        });
      }
    } catch (e) {
      // Analytics should never block UI
    }
  }

  /**
   * Handle the subscription flow for a given email and source.
   */
  async function subscribe(email, source, msgEl) {
    email = email.trim().toLowerCase();
    if (!email) return;

    // Client-side localStorage dedup (preserves existing behavior)
    var stored = getStoredEmails();
    if (stored.indexOf(email) !== -1) {
      showMessage(msgEl, "You're already subscribed! Check your email for confirmation.");
      return;
    }

    // Try Convex mutation if available
    if (window.SupplementDB && window.SupplementDB.mutation) {
      try {
        var result = await window.SupplementDB.mutation(
          "newsletter:subscribe",
          { email: email, source: source }
        );

        if (result.status === "invalid_email") {
          showMessage(msgEl, "Please enter a valid email address.", true);
          return;
        } else if (result.status === "already_subscribed") {
          showMessage(msgEl, "You're already subscribed!");
        } else if (result.status === "already_pending") {
          showMessage(
            msgEl,
            "We already sent you a confirmation email. Check your inbox!"
          );
        } else {
          // status === "pending" — new subscription
          showMessage(
            msgEl,
            "Check your inbox to confirm your subscription!"
          );
        }
      } catch (err) {
        console.warn("Newsletter Convex error, falling back to localStorage:", err);
        showMessage(msgEl, "Thanks! You've been subscribed.");
      }
    } else {
      // Graceful fallback — localStorage only (Convex not loaded)
      showMessage(msgEl, "Thanks! You've been subscribed.");
    }

    // Always save to localStorage (dedup + offline fallback)
    storeEmail(email);

    // PostHog tracking (preserves existing events)
    trackEvent(source, email);
  }

  // ── Public API ─────────────────────────────────────────────

  window.SupplementDBNewsletter = {
    /**
     * Initialize a newsletter form.
     *
     * @param {string} formId     - ID of the <form> element
     * @param {string} inputId    - ID of the email <input> element
     * @param {string} messageId  - ID of the message display element
     * @param {string} source     - Source identifier (e.g., "homepage", "guide-sleep")
     */
    init: function (formId, inputId, messageId, source) {
      var form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.getElementById(inputId);
        var email = input ? input.value.trim() : "";
        var msgEl = document.getElementById(messageId);

        if (!email) {
          showMessage(msgEl, "Please enter your email address.", true);
          return;
        }

        subscribe(email, source, msgEl);
      });
    },

    /**
     * Programmatic subscribe (for use outside forms).
     */
    subscribe: subscribe,
  };
})();
