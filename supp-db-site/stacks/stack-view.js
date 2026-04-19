/**
 * stack-view.js — Public/owner render for /stacks/{slug} (SUPP-251)
 *
 * Reads the slug from the URL path, fetches from Convex via
 * stacks:getPublicStack (or stacks:getMyStackBySlug for the owner when the
 * public read returns null but the user is signed in), and renders the
 * stack's supplements + optional analysis snapshot. Safe DOM construction
 * throughout to match the repo-wide security hook policy.
 */
(function () {
  "use strict";

  // ─── Helpers ──────────────────────────────────────────────────────────
  function mkEl(tag, cls, txt) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt != null) el.textContent = txt;
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function slugFromLocation() {
    // URL shapes we accept:
    //   /stacks/{slug}            (via Vercel rewrite)
    //   /stacks/                  (no slug → show a helpful 404)
    //   /stacks/?slug={slug}      (fallback when rewrite is absent)
    const path = window.location.pathname.replace(/^\/+/, "");
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "stacks") {
      const raw = parts[1];
      if (raw && raw !== "index.html") return decodeURIComponent(raw).replace(/\.html$/, "");
    }
    const q = new URLSearchParams(window.location.search);
    const qSlug = q.get("slug");
    if (qSlug) return qSlug;
    return null;
  }

  function supplementsIndex() {
    if (window.__SUPP_INDEX__) return Promise.resolve(window.__SUPP_INDEX__);
    return new Promise(function (resolve) {
      const s = document.createElement("script");
      s.src = "../data/supplements.js";
      s.onload = function () {
        const idx = new Map();
        const list = (window.supplementDatabase && window.supplementDatabase.supplements) || [];
        for (const supp of list) {
          idx.set(String(supp.id), supp);
          if (supp.name) idx.set(supp.name.toLowerCase(), supp);
        }
        window.__SUPP_INDEX__ = idx;
        resolve(idx);
      };
      s.onerror = function () { resolve(new Map()); };
      document.head.appendChild(s);
    });
  }
  function slugify(str) {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // ─── Render ───────────────────────────────────────────────────────────
  async function render() {
    const slug = slugFromLocation();
    const loadingEl = document.getElementById("stack-loading");
    const notFoundEl = document.getElementById("stack-404");
    const contentEl = document.getElementById("stack-content");
    const nameEl = document.getElementById("stack-name");
    const metaEl = document.getElementById("stack-meta");
    const badgeRow = document.getElementById("stack-badges");
    const grid = document.getElementById("stack-supp-grid");
    const analysisPanel = document.getElementById("stack-analysis-panel");
    const analysisBody = document.getElementById("stack-analysis-body");
    const shareLink = document.getElementById("stack-share-link");
    const copyBtn = document.getElementById("stack-copy-btn");

    if (!slug) {
      loadingEl.style.display = "none";
      notFoundEl.style.display = "";
      nameEl.textContent = "Stack not found";
      return;
    }

    for (let i = 0; i < 40; i++) {
      if (window.SupplementDB && typeof window.SupplementDB.query === "function") break;
      await new Promise(function (r) { setTimeout(r, 100); });
    }

    let stack = null;
    try {
      stack = await window.SupplementDB.query("stacks:getPublicStack", { slug });
    } catch (err) {
      console.warn("[stack-view] public fetch failed:", err);
    }
    if (!stack) {
      const signedIn = !!(window.SupplementDBAuth && window.SupplementDBAuth.isSignedIn);
      if (signedIn) {
        try {
          stack = await window.SupplementDB.query("stacks:getMyStackBySlug", { slug });
        } catch (_) { /* ignore */ }
      }
    }

    if (!stack) {
      loadingEl.style.display = "none";
      notFoundEl.style.display = "";
      nameEl.textContent = "Stack not found";
      document.title = "Stack not found — SupplementDB";
      return;
    }

    nameEl.textContent = stack.name || "Untitled Stack";
    document.title = (stack.name || "Saved stack") + " — SupplementDB";
    const created = new Date(stack.createdAt || Date.now());
    metaEl.textContent = "Saved " + created.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });

    clear(badgeRow);
    const countBadge = mkEl("span", "stack-badge",
      stack.supplementIds.length + " supplement"
      + (stack.supplementIds.length === 1 ? "" : "s"));
    const ic = mkEl("i"); ic.className = "fas fa-pills"; countBadge.prepend(ic);
    badgeRow.appendChild(countBadge);
    if (stack.isPublic === false) {
      const privBadge = mkEl("span", "stack-badge");
      privBadge.style.background = "rgba(245,158,11,0.15)";
      privBadge.style.color = "#fbbf24";
      const ici = mkEl("i"); ici.className = "fas fa-lock"; privBadge.appendChild(ici);
      privBadge.appendChild(document.createTextNode(" Private (only you can see this)"));
      badgeRow.appendChild(privBadge);
    }

    const idx = await supplementsIndex();
    clear(grid);
    for (const rawId of stack.supplementIds) {
      const supp = idx.get(String(rawId)) || null;
      const card = document.createElement("a");
      card.className = "supp-card";
      if (supp && supp.name) {
        card.href = "../supplements/" + slugify(supp.name) + ".html";
      } else {
        card.href = "../index.html#database";
      }
      card.target = "_self";
      const name = mkEl("div", "name", supp ? supp.name : "Supplement #" + rawId);
      card.appendChild(name);
      if (supp) {
        const meta = mkEl("div", "meta");
        const tier = supp.evidenceTier ? "Tier " + supp.evidenceTier : null;
        const cat = supp.category || null;
        meta.textContent = [tier, cat].filter(Boolean).join(" · ");
        card.appendChild(meta);
      }
      grid.appendChild(card);
    }

    if (stack.analysisSnapshot) {
      const snap = stack.analysisSnapshot;
      const goals = snap.analysis && Array.isArray(snap.analysis.goals) ? snap.analysis.goals
                  : Array.isArray(snap.goals) ? snap.goals
                  : [];
      if (goals.length > 0) {
        analysisPanel.style.display = "";
        clear(analysisBody);
        for (const g of goals) {
          if (g.goalName) {
            const h = mkEl("h3");
            h.style.color = "#fff";
            h.style.fontWeight = "600";
            h.style.margin = "0.4rem 0 0.2rem";
            h.textContent = g.goalName;
            analysisBody.appendChild(h);
          }
          if (g.overallScore != null) {
            const score = mkEl("p", null,
              "Overall score: " + g.overallScore + "/100 · Evidence: " + (g.evidenceStrength || "—"));
            analysisBody.appendChild(score);
          }
          if (g.stackSummary) {
            analysisBody.appendChild(mkEl("p", null, g.stackSummary));
          }
        }
      }
    }

    const publicUrl = window.location.origin + "/stacks/" + stack.slug;
    shareLink.value = publicUrl;
    if (copyBtn) {
      copyBtn.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(publicUrl);
          copyBtn.textContent = "Copied!";
          setTimeout(function () {
            clear(copyBtn);
            const ic2 = mkEl("i"); ic2.className = "fas fa-copy"; copyBtn.appendChild(ic2);
            copyBtn.appendChild(document.createTextNode(" Copy link"));
          }, 1800);
          try {
            if (window.posthog && window.posthog.capture) {
              window.posthog.capture("stack_share_click", { slug: stack.slug });
            }
          } catch (_) {}
        } catch (err) {
          shareLink.select();
        }
      });
    }

    try {
      const canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute("href", publicUrl);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", publicUrl);
    } catch (_) {}

    loadingEl.style.display = "none";
    contentEl.style.display = "";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
