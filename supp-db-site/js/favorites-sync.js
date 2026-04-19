/**
 * favorites-sync.js — Cloud mirror for favorite supplements
 *
 * Keeps the existing localStorage-backed favorite toggle in app.js working
 * exactly as before, and — when a user is signed in via Clerk — mirrors every
 * toggle to the Convex `favorites` table. On sign-in, merges any pre-existing
 * localStorage favorites up to the cloud so users don't lose their list when
 * they first authenticate.
 *
 * Load order in HTML (must be BEFORE the authed pages call toggleFavorite):
 *     <script src="/js/auth.js" defer></script>
 *     <script src="/js/convex-client.js" defer></script>
 *     <script src="/js/favorites-sync.js" defer></script>
 *     <script src="/js/app.js" defer></script>
 *
 * Design notes
 * ─────────────
 * - Optimistic UI: localStorage writes are instant (already in app.js).
 *   Cloud sync happens async and never blocks the UI. If the cloud call
 *   fails, localStorage remains the source of truth for anonymous users
 *   and the change will re-sync on next sign-in via `syncFavorites`.
 * - Idempotency: `favorites:toggleFavorite` is an upsert — calling it twice
 *   with the same args is safe.
 * - Privacy: we only send the supplement ID + optional name. No PII.
 */
(function () {
  "use strict";

  // Guard against double-load.
  if (window.__SuppFavSyncLoaded__) return;
  window.__SuppFavSyncLoaded__ = true;

  const LS_KEY = "favorites";
  const LS_SYNCED_FLAG = "favorites:cloudSyncedAt";

  /** Read the favorite IDs that app.js wrote to localStorage. */
  function readLocalFavorites() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /** Does the global SupplementDBAuth think the current visitor is signed in? */
  function isSignedIn() {
    return !!(
      window.SupplementDBAuth &&
      window.SupplementDBAuth.isSignedIn === true
    );
  }

  /** Does the Convex client exist and look healthy? */
  function hasConvex() {
    return !!(
      window.SupplementDB &&
      typeof window.SupplementDB.mutation === "function"
    );
  }

  /**
   * Resolve the display name of a supplement ID — best-effort.
   * app.js keeps the full supplement array on `window.app.supplements`.
   */
  function resolveName(id) {
    try {
      const app = window.app;
      if (!app || !Array.isArray(app.supplements)) return undefined;
      const hit = app.supplements.find((s) => s.id === id);
      return hit && hit.name ? hit.name : undefined;
    } catch (e) {
      return undefined;
    }
  }

  /** Cloud-mirror a single toggle. No-ops if not signed in or Convex unavailable. */
  async function mirrorToggle(id) {
    if (!isSignedIn() || !hasConvex()) return;
    try {
      await window.SupplementDB.mutation("favorites:toggleFavorite", {
        supplementId: String(id),
        supplementName: resolveName(id),
      });
    } catch (err) {
      // Non-fatal: localStorage remains source of truth and we'll re-sync on
      // next sign-in via syncFavorites.
      console.warn("[favorites-sync] mirrorToggle failed:", err);
    }
  }

  /**
   * On sign-in, push the full localStorage favorites list to Convex via
   * `favorites:syncFavorites` (which is idempotent — skips entries that
   * already exist in the cloud). Runs once per browser per session.
   */
  async function syncOnSignIn() {
    if (!isSignedIn() || !hasConvex()) return;
    const locals = readLocalFavorites();
    if (locals.length === 0) {
      sessionStorage.setItem(LS_SYNCED_FLAG, String(Date.now()));
      return;
    }
    try {
      const payload = locals.map((id) => ({
        supplementId: String(id),
        supplementName: resolveName(id),
      }));
      const result = await window.SupplementDB.mutation(
        "favorites:syncFavorites",
        { favorites: payload }
      );
      sessionStorage.setItem(LS_SYNCED_FLAG, String(Date.now()));
      if (result && typeof result.synced === "number" && result.synced > 0) {
        console.info(
          `[favorites-sync] synced ${result.synced}/${result.total} favorites to cloud`
        );
      }
    } catch (err) {
      console.warn("[favorites-sync] syncOnSignIn failed:", err);
    }
  }

  /**
   * Wrap window.app.toggleFavorite so every call also mirrors to the cloud.
   * Retries until window.app exists (it is created by the main app bundle).
   */
  function installWrapper() {
    const app = window.app;
    if (!app || typeof app.toggleFavorite !== "function") return false;
    if (app.__favSyncWrapped__) return true;

    const original = app.toggleFavorite.bind(app);
    app.toggleFavorite = function wrappedToggleFavorite(id) {
      const ret = original(id);
      // Fire and forget — UI already updated by the original function.
      mirrorToggle(id);
      return ret;
    };
    app.__favSyncWrapped__ = true;
    return true;
  }

  /** Poll for window.app up to ~5s, then give up silently. */
  function waitForAppAndInstall() {
    let attempts = 0;
    const max = 50;
    const tick = () => {
      if (installWrapper()) return;
      attempts++;
      if (attempts < max) setTimeout(tick, 100);
    };
    tick();
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", waitForAppAndInstall);

  // Sync when a user signs in (covers both the "signed in on page load" case
  // via `auth:signed-in` with initial:true, and the "just signed in" case).
  // auth.js dispatches on `document`, NOT window — listen there or the
  // handler never fires.
  document.addEventListener("auth:signed-in", syncOnSignIn);

  // Expose a small API for the dashboard page.
  window.SupplementDBFavorites = {
    /** Ask Convex for the current user's favorites. Returns [] when signed out. */
    async listFromCloud() {
      if (!isSignedIn() || !hasConvex()) return [];
      try {
        const rows = await window.SupplementDB.query(
          "favorites:getUserFavorites",
          {}
        );
        return Array.isArray(rows) ? rows : [];
      } catch (err) {
        console.warn("[favorites-sync] listFromCloud failed:", err);
        return [];
      }
    },

    /** Local list as stored by app.js (array of supplement IDs). */
    listFromLocal() {
      return readLocalFavorites();
    },

    /** Remove a favorite by supplement ID — mirrors cloud and localStorage. */
    async remove(id) {
      // Local update — mirrors app.js semantics.
      const locals = readLocalFavorites();
      const idx = locals.indexOf(id);
      if (idx > -1) {
        locals.splice(idx, 1);
        localStorage.setItem(LS_KEY, JSON.stringify(locals));
      }
      if (isSignedIn() && hasConvex()) {
        try {
          await window.SupplementDB.mutation("favorites:removeFavorite", {
            supplementId: String(id),
          });
        } catch (err) {
          console.warn("[favorites-sync] remove failed:", err);
        }
      }
    },

    /** True when Clerk reports a signed-in user AND Convex client is ready. */
    canSyncCloud() {
      return isSignedIn() && hasConvex();
    },
  };
})();
