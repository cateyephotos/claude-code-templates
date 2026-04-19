/**
 * bookmarks-sync.js — Cloud mirror + toggle for evidence-guide bookmarks
 *
 * Mirrors the favorites-sync.js pattern:
 *   - Anonymous users: bookmarks live in localStorage under "guideBookmarks"
 *   - Signed-in users: every toggle also fires the Convex
 *     `bookmarks:toggleGuide` mutation, and the localStorage state syncs
 *     up on sign-in via `bookmarks:syncBookmarks`
 *
 * Guide pages each include a standard bookmark button injected by the
 * generator (`scripts/generate-guide-pages.js`). The button carries a
 * `data-guide-slug` attribute so this module can find it by slug.
 *
 * Safe DOM only — no `.innerHTML` with data-derived content.
 */
(function () {
  "use strict";
  if (window.__SuppBookmarkSyncLoaded__) return;
  window.__SuppBookmarkSyncLoaded__ = true;

  const LS_KEY = "guideBookmarks";

  function readLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }
  function writeLocal(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (_) {}
  }
  function hasLocal(slug) { return readLocal().some((b) => b.guideSlug === slug); }
  function addLocal(slug, name) {
    const list = readLocal();
    if (list.some((b) => b.guideSlug === slug)) return list;
    list.push({ guideSlug: slug, guideName: name || undefined });
    writeLocal(list);
    return list;
  }
  function removeLocal(slug) {
    const list = readLocal().filter((b) => b.guideSlug !== slug);
    writeLocal(list);
    return list;
  }

  function isSignedIn() {
    return !!(window.SupplementDBAuth && window.SupplementDBAuth.isSignedIn === true);
  }
  function hasConvex() {
    return !!(window.SupplementDB && typeof window.SupplementDB.mutation === "function");
  }

  async function mirrorToggle(slug, name, desiredBookmarked) {
    if (!isSignedIn() || !hasConvex()) return;
    try {
      const fn = desiredBookmarked ? "bookmarks:toggleGuide" : "bookmarks:toggleGuide";
      await window.SupplementDB.mutation(fn, {
        guideSlug: slug,
        guideName: name || undefined,
      });
    } catch (err) {
      console.warn("[bookmarks-sync] mirrorToggle failed:", err);
    }
  }

  /** Merge local bookmarks up to Convex on first sign-in. */
  async function syncOnSignIn() {
    if (!isSignedIn() || !hasConvex()) return;
    const list = readLocal();
    if (list.length === 0) return;
    try {
      await window.SupplementDB.mutation("bookmarks:syncBookmarks", { bookmarks: list });
    } catch (err) {
      console.warn("[bookmarks-sync] syncOnSignIn failed:", err);
    }
  }

  function updateButtonState(btn, isBookmarked) {
    if (!btn) return;
    btn.setAttribute("aria-pressed", isBookmarked ? "true" : "false");
    btn.classList.toggle("is-bookmarked", !!isBookmarked);
    const icon = btn.querySelector("i.guide-bookmark-icon");
    if (icon) {
      icon.classList.remove("fa-solid", "fa-regular", "far", "fas", "fa-bookmark");
      icon.classList.add("fa-bookmark");
      icon.classList.add(isBookmarked ? "fas" : "far");
    }
    const label = btn.querySelector(".guide-bookmark-label");
    if (label) label.textContent = isBookmarked ? "Bookmarked" : "Bookmark";
  }

  function findButtons() {
    return Array.from(document.querySelectorAll("[data-guide-bookmark]"));
  }

  async function wireButton(btn) {
    const slug = btn.getAttribute("data-guide-bookmark");
    const name = btn.getAttribute("data-guide-name") || undefined;
    if (!slug || btn.__wired) return;
    btn.__wired = true;

    // Initial state — localStorage is always the instant answer; Convex
    // reads (if signed in) override once resolved.
    updateButtonState(btn, hasLocal(slug));

    if (isSignedIn() && hasConvex()) {
      try {
        const remote = await window.SupplementDB.query("bookmarks:isBookmarked", { guideSlug: slug });
        updateButtonState(btn, !!remote);
        if (remote && !hasLocal(slug)) addLocal(slug, name);
        else if (!remote && hasLocal(slug)) removeLocal(slug);
      } catch (err) {
        /* non-fatal */
      }
    }

    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      const wasBookmarked = btn.classList.contains("is-bookmarked");
      const nowBookmarked = !wasBookmarked;
      // Optimistic: toggle local immediately.
      if (nowBookmarked) addLocal(slug, name);
      else removeLocal(slug);
      updateButtonState(btn, nowBookmarked);
      // Mirror to Convex if signed in.
      await mirrorToggle(slug, name, nowBookmarked);
      try {
        if (window.posthog && window.posthog.capture) {
          window.posthog.capture("guide_bookmark_toggle", {
            guide_slug: slug,
            action: nowBookmarked ? "add" : "remove"
          });
        }
      } catch (_) {}
    });
  }

  function wireAll() { findButtons().forEach(wireButton); }

  function boot() {
    wireAll();
    // Re-wire if the page injects bookmark buttons later.
    const mo = new MutationObserver(wireAll);
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("auth:signed-in", syncOnSignIn);

  // Public API for the dashboard + other consumers.
  window.SupplementDBBookmarks = {
    async listFromCloud() {
      if (!isSignedIn() || !hasConvex()) return [];
      try {
        const rows = await window.SupplementDB.query("bookmarks:joinedUserBookmarks", {});
        return Array.isArray(rows) ? rows : [];
      } catch (err) {
        console.warn("[bookmarks-sync] listFromCloud failed:", err);
        return [];
      }
    },
    listFromLocal() { return readLocal(); },
    async remove(slug) {
      removeLocal(slug);
      if (isSignedIn() && hasConvex()) {
        try { await window.SupplementDB.mutation("bookmarks:removeBookmark", { guideSlug: slug }); }
        catch (err) { console.warn("[bookmarks-sync] remove failed:", err); }
      }
    },
    canSyncCloud() { return isSignedIn() && hasConvex(); }
  };
})();
