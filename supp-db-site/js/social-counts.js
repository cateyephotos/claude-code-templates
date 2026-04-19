/**
 * social-counts.js — "N saved" social-proof badges on supplement cards
 *
 * Decorates existing supplement cards and the monograph page with a subtle
 * count badge showing how many users have favorited each supplement. Lazy-
 * loads counts as cards scroll into view (IntersectionObserver) and batches
 * requests to the public Convex query `favorites:getSaveCountsForSupplements`.
 *
 * Privacy: the Convex query only returns counts ≥ 10. Below that threshold,
 * the badge is omitted entirely.
 *
 * Design notes
 * ────────────
 * - Decorator pattern: does NOT modify the main app.js render path. Finds
 *   existing cards via the `onclick="app.toggleFavorite(N)"` marker that
 *   app.js already emits, extracts the supplement ID, and appends a badge
 *   to the card's tier-pill row.
 * - Observer-driven: cards only trigger a network call when they become
 *   visible, so a 114-supplement grid doesn't make 114 round-trips on page
 *   load.
 * - Batched: IDs accumulated during a 150ms debounce window are combined
 *   into a single `getSaveCountsForSupplements` call.
 * - Idempotent: re-entering a card's observer (e.g., after app.js re-
 *   renders the grid) is a no-op once the badge is attached.
 * - Safe DOM only: no `.innerHTML` with data-derived values.
 */
(function () {
  "use strict";

  if (window.__SuppSocialCountsLoaded__) return;
  window.__SuppSocialCountsLoaded__ = true;

  // Don't run if Convex client isn't going to be available (e.g., tests).
  if (typeof window === "undefined") return;

  var DEBOUNCE_MS = 150;
  var MARKER_CLASS = "supp-saved-badge";
  var PENDING_CLASS = "supp-count-pending";
  var CARD_ATTR = "data-supp-count-id";

  // Cache ID → count so repeated decorations on re-render don't re-fetch.
  var countCache = new Map();

  // IDs that have been requested; no need to re-issue network calls for them.
  var inflight = new Set();

  // Pending IDs queued for the next batch flush.
  var pendingQueue = new Set();
  var debounceTimer = null;

  function hasConvex() {
    return !!(window.SupplementDB && typeof window.SupplementDB.query === "function");
  }

  /** Extract the supplement ID from a card's favorite-toggle onclick attribute. */
  function idFromToggleAttr(attr) {
    if (!attr) return null;
    var m = attr.match(/toggleFavorite\((\d+)\)/);
    return m ? m[1] : null;
  }

  /**
   * Walk the card upward looking for the best-fit anchor for the badge —
   * prefer the existing tier-pill container if we can find one, otherwise
   * fall back to the card root.
   */
  function findBadgeAnchor(card) {
    if (!card) return null;
    // Buttons the favorite toggle sits next to in app.js are in a row with
    // flex utility classes. Reasonable heuristic: any `.flex` ancestor
    // inside the card or the card itself.
    var parent = card.querySelector(".flex.items-center") ||
                 card.querySelector(".flex") ||
                 card;
    return parent;
  }

  /** Create the badge element (safe DOM). */
  function buildBadge(count) {
    var span = document.createElement("span");
    span.className = MARKER_CLASS;
    span.setAttribute("data-count", String(count));
    span.setAttribute("title", count + " people have saved this supplement");
    // Leading heart icon + text. FontAwesome is already loaded site-wide.
    var icon = document.createElement("i");
    icon.className = "fas fa-heart";
    icon.style.color = "#ef4444";
    icon.style.marginRight = "0.25rem";
    span.appendChild(icon);
    span.appendChild(document.createTextNode(formatCount(count) + " saved"));
    return span;
  }

  function formatCount(n) {
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  /** Attach the badge to a card (idempotent). */
  function attachBadge(card, count) {
    if (!card || !count || count < 10) return;
    if (card.querySelector("." + MARKER_CLASS)) return;
    var anchor = findBadgeAnchor(card);
    if (!anchor) return;
    anchor.appendChild(buildBadge(count));
  }

  /** Flush the pending queue as a single batched Convex query. */
  async function flushQueue() {
    debounceTimer = null;
    if (pendingQueue.size === 0) return;
    if (!hasConvex()) return;

    var ids = Array.from(pendingQueue);
    pendingQueue.clear();
    ids.forEach(function (id) { inflight.add(id); });

    var result;
    try {
      result = await window.SupplementDB.query(
        "favorites:getSaveCountsForSupplements",
        { supplementIds: ids }
      );
    } catch (err) {
      console.warn("[social-counts] batch query failed:", err);
      ids.forEach(function (id) { inflight.delete(id); });
      return;
    }

    if (!result || typeof result !== "object") {
      ids.forEach(function (id) { inflight.delete(id); });
      return;
    }

    // Cache + decorate every card currently in the DOM for these IDs.
    Object.keys(result).forEach(function (id) {
      var count = result[id] || 0;
      countCache.set(id, count);
      inflight.delete(id);
      if (count < 10) return;
      decorateCardsWithId(id, count);
    });
  }

  function queueId(id) {
    if (!id) return;
    if (countCache.has(id)) {
      // Already fetched — decorate immediately.
      decorateCardsWithId(id, countCache.get(id));
      return;
    }
    if (inflight.has(id)) return;
    pendingQueue.add(id);
    if (debounceTimer == null) {
      debounceTimer = setTimeout(flushQueue, DEBOUNCE_MS);
    }
  }

  function decorateCardsWithId(id, count) {
    if (count < 10) return;
    var nodes = document.querySelectorAll('[' + CARD_ATTR + '="' + id + '"]');
    nodes.forEach(function (card) { attachBadge(card, count); });
  }

  /**
   * Find all supplement cards on the page that haven't yet been tagged,
   * extract their IDs, tag them with a data-attribute for quick re-selection,
   * and hand them off to the observer.
   */
  function discoverCards(observer) {
    var candidates = document.querySelectorAll("[onclick*='toggleFavorite(']");
    candidates.forEach(function (btn) {
      var id = idFromToggleAttr(btn.getAttribute("onclick"));
      if (!id) return;
      // Walk up to the nearest card-like container — the button itself might
      // be inside deeply nested markup. Use the closest ancestor with a
      // class that looks like a card or supplement container.
      var card = btn.closest('[class*="supplement"]') ||
                 btn.closest('.supplement-card') ||
                 btn.closest('[class*="card"]') ||
                 btn.parentElement;
      if (!card) return;
      // Tag it. If multiple cards exist for the same ID (grid + modal etc.),
      // they all share the same attribute value and will be decorated together.
      var existing = card.getAttribute(CARD_ATTR);
      if (existing !== id) card.setAttribute(CARD_ATTR, id);
      if (!card.classList.contains(PENDING_CLASS)) {
        card.classList.add(PENDING_CLASS);
        observer.observe(card);
      }
    });
  }

  function monographId() {
    // The monograph template exposes the numeric supplement ID via body data-
    // attribute (legacy) or a hidden span in the share-bar section. Be
    // defensive — return null when nothing can be resolved.
    var body = document.body;
    if (body && body.dataset && body.dataset.supplementId) {
      return body.dataset.supplementId;
    }
    var meta = document.querySelector('meta[name="supplement-id"]');
    if (meta) return meta.getAttribute("content");
    return null;
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────

  function boot() {
    if (!("IntersectionObserver" in window)) {
      // Old browser — skip the feature rather than running unbounded queries.
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var id = entry.target.getAttribute(CARD_ATTR);
        queueId(id);
      });
    }, { rootMargin: "200px 0px" });

    // Decorate once on boot, then watch for app.js re-renders.
    discoverCards(observer);

    // app.js re-renders the grid on filters/search. Re-scan after any large
    // DOM mutation inside #database or the document body root.
    var mo = new MutationObserver(function () { discoverCards(observer); });
    var dbRoot = document.getElementById("database") || document.body;
    mo.observe(dbRoot, { childList: true, subtree: true });

    // Monograph page: there's only one supplement on the page, no card list.
    var mid = monographId();
    if (mid) queueId(mid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Tiny API for tests / manual nudging.
  window.SupplementDBSocialCounts = {
    queue: queueId,
    flush: flushQueue,
    cache: countCache
  };
})();
