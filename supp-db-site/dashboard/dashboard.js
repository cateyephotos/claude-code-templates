/**
 * dashboard.js — SupplementDB user dashboard
 *
 * Renders the "Saved Supplements" panel by reading the current user's
 * favorites either from Convex (when signed in) or from localStorage
 * (anonymous fallback). Provides remove actions that flow through the
 * shared favorites-sync.js API.
 *
 * Safe DOM construction only — no .innerHTML with user-derived data,
 * matches the repo-wide security-hook policy (see CLAUDE.md "DOM
 * security hook").
 */
(function () {
  "use strict";

  // Elements
  const skeletonEl = document.getElementById("favorites-skeleton");
  const contentEl = document.getElementById("favorites-content");
  const emptyEl = document.getElementById("favorites-empty");
  const signinEl = document.getElementById("favorites-signin");
  const subtitleEl = document.getElementById("favorites-subtitle");
  const syncBadgeEl = document.getElementById("sync-badge");
  const signinBtn = document.getElementById("dashboard-signin-btn");

  // Expose supplement metadata lookup. Since the dashboard page doesn't
  // load the full supplements bundle, we fetch the lightweight
  // supplements.min.js data shim to resolve names/categories by ID.
  let supplementsIndex = null;

  async function loadSupplementsIndex() {
    if (supplementsIndex) return supplementsIndex;
    try {
      // The repo ships data/supplements.js which sets
      // window.supplements on load. Inject it on-demand so the
      // dashboard stays lightweight when the user is just visiting.
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "../data/supplements.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      if (Array.isArray(window.supplements)) {
        supplementsIndex = new Map();
        for (const supp of window.supplements) {
          supplementsIndex.set(String(supp.id), supp);
          if (supp.slug) supplementsIndex.set(supp.slug, supp);
          if (supp.name) supplementsIndex.set(slugify(supp.name), supp);
        }
      }
    } catch (e) {
      console.warn("[dashboard] Failed to load supplements index:", e);
    }
    return supplementsIndex;
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /** Safe DOM helper — creates an element with className + text content. */
  function mkEl(tag, cls, txt) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt != null) el.textContent = txt;
    return el;
  }

  /** Remove all children of an element. */
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /** Resolve a stored favorite row to display data (name, category, link). */
  function resolveDisplay(row) {
    const id = row.supplementId ?? row.id ?? row;
    const idStr = String(id);
    const fallbackName = row.supplementName || `Supplement #${idStr}`;
    const rec =
      supplementsIndex &&
      (supplementsIndex.get(idStr) ||
        (row.supplementName
          ? supplementsIndex.get(slugify(row.supplementName))
          : null));
    const name = rec && rec.name ? rec.name : fallbackName;
    const category =
      rec && rec.category
        ? rec.category
        : row.supplementName
        ? "Supplement"
        : "Saved";
    const href = rec && rec.slug
      ? `../supplements/${rec.slug}.html`
      : rec && rec.name
      ? `../supplements/${slugify(rec.name)}.html`
      : row.supplementName
      ? `../supplements/${slugify(row.supplementName)}.html`
      : `../index.html#supplement-${idStr}`;
    return { id, idStr, name, category, href };
  }

  /** Build a single favorite card (safe DOM). */
  function renderCard(entry) {
    const card = mkEl("article", "fav-card");
    card.appendChild(mkEl("div", "name", entry.name));
    card.appendChild(mkEl("div", "cat", entry.category));

    const actions = mkEl("div", "actions");
    const link = document.createElement("a");
    link.className = "open";
    link.href = entry.href;
    link.textContent = "Open monograph →";
    actions.appendChild(link);

    const removeBtn = mkEl("button", "remove", "Remove");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", async () => {
      removeBtn.disabled = true;
      removeBtn.textContent = "Removing…";
      try {
        if (window.SupplementDBFavorites && window.SupplementDBFavorites.remove) {
          await window.SupplementDBFavorites.remove(entry.id);
        } else {
          // Fallback: local-only removal.
          const locals = readLocal();
          const idx = locals.indexOf(entry.id);
          if (idx > -1) {
            locals.splice(idx, 1);
            localStorage.setItem("favorites", JSON.stringify(locals));
          }
        }
        // Refresh the dashboard.
        await render();
      } catch (err) {
        console.warn("[dashboard] remove failed:", err);
        removeBtn.disabled = false;
        removeBtn.textContent = "Remove";
      }
    });
    actions.appendChild(removeBtn);

    card.appendChild(actions);
    return card;
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem("favorites");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /** Main render — chooses cloud vs local source, then paints the grid. */
  async function render() {
    skeletonEl.style.display = "";
    contentEl.style.display = "none";
    emptyEl.style.display = "none";
    signinEl.style.display = "none";

    await loadSupplementsIndex();

    const canCloud =
      !!window.SupplementDBFavorites &&
      window.SupplementDBFavorites.canSyncCloud &&
      window.SupplementDBFavorites.canSyncCloud();

    let items = [];
    if (canCloud) {
      try {
        const rows = await window.SupplementDBFavorites.listFromCloud();
        items = rows.map((r) => ({
          supplementId: r.supplementId,
          supplementName: r.supplementName,
        }));
        updateSyncBadge("cloud");
        subtitleEl.textContent = `${items.length} saved supplement${items.length === 1 ? "" : "s"} — synced to your account.`;
      } catch (err) {
        console.warn("[dashboard] cloud fetch failed, falling back to local:", err);
        items = readLocal().map((id) => ({ supplementId: String(id) }));
        updateSyncBadge("local");
        subtitleEl.textContent = "Showing local favorites — cloud sync unavailable.";
      }
    } else {
      items = readLocal().map((id) => ({ supplementId: String(id) }));
      updateSyncBadge("local");
      subtitleEl.textContent = items.length
        ? `${items.length} saved on this device. Sign in to sync across devices.`
        : "No saved supplements yet.";
    }

    skeletonEl.style.display = "none";

    // Decide empty / signed-out / populated state.
    if (items.length === 0) {
      if (!canCloud) {
        // Show both an "empty" illustration and the sign-in CTA.
        emptyEl.style.display = "";
        signinEl.style.display = "";
      } else {
        emptyEl.style.display = "";
      }
      return;
    }

    // Render the grid.
    clear(contentEl);
    const grid = mkEl("div", "fav-grid");
    for (const row of items) {
      const entry = resolveDisplay(row);
      grid.appendChild(renderCard(entry));
    }
    contentEl.appendChild(grid);
    contentEl.style.display = "";
  }

  function updateSyncBadge(mode) {
    clear(syncBadgeEl);
    const icon = document.createElement("i");
    const label = document.createTextNode("");
    if (mode === "cloud") {
      syncBadgeEl.className = "sync-pill cloud";
      icon.className = "fas fa-cloud";
      label.textContent = " Synced to your account";
    } else {
      syncBadgeEl.className = "sync-pill local";
      icon.className = "fas fa-laptop";
      label.textContent = " This device";
    }
    syncBadgeEl.appendChild(icon);
    syncBadgeEl.appendChild(label);
  }

  // Sign-in button: use the shared auth UI if present, else navigate home.
  if (signinBtn) {
    signinBtn.addEventListener("click", () => {
      if (
        window.SupplementDBAuth &&
        typeof window.SupplementDBAuth.openSignIn === "function"
      ) {
        window.SupplementDBAuth.openSignIn();
      } else {
        window.location.href = "../index.html";
      }
    });
  }

  // ─── SUPP-251: Saved Stacks panel ─────────────────────────────────
  async function renderStacksPanel() {
    const skel = document.getElementById("stacks-skeleton");
    const content = document.getElementById("stacks-content");
    const empty = document.getElementById("stacks-empty");
    const signin = document.getElementById("stacks-signin");
    const subtitle = document.getElementById("stacks-subtitle");
    const countPill = document.getElementById("stacks-count-pill");
    const countEl = document.getElementById("stacks-count");
    if (!skel) return;

    skel.style.display = "";
    content.style.display = "none";
    empty.style.display = "none";
    signin.style.display = "none";
    countPill.style.display = "none";

    const signedIn = !!(window.SupplementDBAuth && window.SupplementDBAuth.isSignedIn);
    const hasConvex = !!(window.SupplementDB && typeof window.SupplementDB.query === "function");
    if (!signedIn || !hasConvex) {
      skel.style.display = "none";
      signin.style.display = "";
      subtitle.textContent = "Sign in to save stacks to your dashboard.";
      return;
    }

    let stacks = [];
    try {
      stacks = await window.SupplementDB.query("stacks:getUserStacks", {});
    } catch (err) {
      console.warn("[dashboard] getUserStacks failed:", err);
    }

    skel.style.display = "none";
    subtitle.textContent = stacks.length
      ? `${stacks.length} saved stack${stacks.length === 1 ? "" : "s"} — share any of them via /stacks/{slug}.`
      : "No saved stacks yet.";
    if (stacks.length === 0) {
      empty.style.display = "";
      return;
    }

    countPill.style.display = "";
    countEl.textContent = stacks.length + " saved";

    clear(content);
    const grid = mkEl("div", "fav-grid");
    for (const stack of stacks) {
      const card = mkEl("article", "fav-card stack-card");
      card.appendChild(mkEl("div", "name", stack.name));
      card.appendChild(mkEl("div", "count", stack.supplementCount + " supplement" + (stack.supplementCount === 1 ? "" : "s")));
      const dateStr = new Date(stack.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      card.appendChild(mkEl("div", "date", (stack.isPublic ? "Public · " : "Private · ") + "Saved " + dateStr));

      const actions = mkEl("div", "actions");
      const open = document.createElement("a");
      open.className = "open";
      open.href = "/stacks/" + stack.slug;
      open.textContent = "Open →";
      actions.appendChild(open);

      const rmBtn = mkEl("button", "secondary", "Delete");
      rmBtn.type = "button";
      rmBtn.addEventListener("click", async () => {
        if (!window.confirm("Delete the stack \"" + stack.name + "\"? This cannot be undone.")) return;
        rmBtn.disabled = true;
        rmBtn.textContent = "Deleting…";
        try {
          await window.SupplementDB.mutation("stacks:deleteStack", { slug: stack.slug });
          await renderStacksPanel();
        } catch (err) {
          console.warn("[dashboard] deleteStack failed:", err);
          rmBtn.disabled = false;
          rmBtn.textContent = "Delete";
        }
      });
      actions.appendChild(rmBtn);

      card.appendChild(actions);
      grid.appendChild(card);
    }
    content.appendChild(grid);
    content.style.display = "";
  }

  // ─── SUPP-252: Bookmarks panel ────────────────────────────────────
  async function renderBookmarksPanel() {
    const skel = document.getElementById("bookmarks-skeleton");
    const content = document.getElementById("bookmarks-content");
    const empty = document.getElementById("bookmarks-empty");
    const subtitle = document.getElementById("bookmarks-subtitle");
    const countPill = document.getElementById("bookmarks-count-pill");
    const countEl = document.getElementById("bookmarks-count");
    if (!skel) return;

    skel.style.display = "";
    content.style.display = "none";
    empty.style.display = "none";
    countPill.style.display = "none";

    const canCloud = window.SupplementDBBookmarks && window.SupplementDBBookmarks.canSyncCloud && window.SupplementDBBookmarks.canSyncCloud();

    let items = [];
    if (canCloud) {
      try {
        items = await window.SupplementDBBookmarks.listFromCloud();
      } catch (err) {
        console.warn("[dashboard] bookmark cloud fetch failed:", err);
      }
    } else {
      items = (window.SupplementDBBookmarks?.listFromLocal?.() || []).map((b) => ({
        guideSlug: b.guideSlug,
        guideName: b.guideName,
        createdAt: Date.now(),
        purchaseStatus: "not_purchased",
      }));
    }

    skel.style.display = "none";
    if (items.length === 0) {
      subtitle.textContent = canCloud
        ? "No bookmarks yet."
        : "Sign in to sync bookmarks across devices.";
      empty.style.display = "";
      return;
    }

    countPill.style.display = "";
    countEl.textContent = items.length + " bookmark" + (items.length === 1 ? "" : "s");
    subtitle.textContent = items.length
      + " bookmarked guide" + (items.length === 1 ? "" : "s")
      + " — " + items.filter((b) => b.purchaseStatus === "owned").length
      + " purchased.";

    clear(content);
    const grid = mkEl("div", "fav-grid");
    const statusLabel = {
      owned: "Purchased · PDF ready",
      pending: "Purchased · PDF processing",
      checkout: "Payment in progress",
      failed: "Payment failed",
      not_purchased: "Preview only",
    };
    for (const b of items) {
      const card = mkEl("article", "fav-card bookmark-card");
      card.appendChild(mkEl("div", "name", b.guideName || (b.guideSlug.charAt(0).toUpperCase() + b.guideSlug.slice(1)) + " Guide"));
      card.appendChild(mkEl("div", "cat", "Evidence guide"));
      const st = mkEl("span", "status " + b.purchaseStatus, statusLabel[b.purchaseStatus] || "Bookmarked");
      card.appendChild(st);

      const actions = mkEl("div", "actions");
      const open = document.createElement("a");
      open.className = "open";
      open.href = "../guides/" + b.guideSlug + ".html";
      open.textContent = b.purchaseStatus === "owned" ? "Open guide →" : "Open preview →";
      actions.appendChild(open);

      const rmBtn = mkEl("button", "remove", "Remove");
      rmBtn.type = "button";
      rmBtn.addEventListener("click", async () => {
        rmBtn.disabled = true;
        rmBtn.textContent = "Removing…";
        try {
          if (window.SupplementDBBookmarks?.remove) {
            await window.SupplementDBBookmarks.remove(b.guideSlug);
          }
          await renderBookmarksPanel();
        } catch (err) {
          console.warn("[dashboard] bookmark remove failed:", err);
          rmBtn.disabled = false;
          rmBtn.textContent = "Remove";
        }
      });
      actions.appendChild(rmBtn);

      card.appendChild(actions);
      grid.appendChild(card);
    }
    content.appendChild(grid);
    content.style.display = "";
  }

  // Wire optional stacks sign-in button.
  const stacksSigninBtn = document.getElementById("stacks-signin-btn");
  if (stacksSigninBtn) {
    stacksSigninBtn.addEventListener("click", () => {
      if (window.SupplementDBAuth && typeof window.SupplementDBAuth.openSignIn === "function") {
        window.SupplementDBAuth.openSignIn();
      } else {
        window.location.href = "../index.html";
      }
    });
  }

  function renderAll() {
    render();
    renderStacksPanel();
    renderBookmarksPanel();
  }

  // Re-render when auth state flips. auth.js dispatches on `document`, so
  // listen there (an earlier version listened on `window` and never fired).
  document.addEventListener("auth:signed-in", () => renderAll());
  document.addEventListener("auth:signed-out", () => renderAll());
  document.addEventListener("auth:loaded", () => renderAll());

  // Initial render (deferred slightly so auth + convex-client can attach).
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(renderAll, 50);
  });
})();
