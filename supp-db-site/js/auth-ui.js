/**
 * auth-ui.js — Auth UI Components
 *
 * Renders sign-in/sign-up buttons (signed out) or user avatar button (signed in)
 * into the #auth-buttons container found in both nav patterns:
 *   - Homepage (sticky-header): light background
 *   - Subpages (legal-nav): dark background
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth)
 *   - rbac.js (window.SupplementDBRBAC)
 */
(function () {
  "use strict";

  // Skip real initialization when test mock is active
  if (window.__CLERK_MOCK__) return;

  // Detect nav theme based on page type
  function getNavTheme() {
    const nav = document.querySelector("nav");
    if (!nav) return "light";
    return nav.classList.contains("legal-nav") ? "dark" : "light";
  }

  // ── Render auth buttons ────────────────────────────────────────
  function renderAuthUI() {
    const container = document.getElementById("auth-buttons");
    if (!container) return;

    const auth = window.SupplementDBAuth;
    if (!auth || !auth.isLoaded) {
      // Show skeleton/placeholder while loading
      container.innerHTML = `
        <div class="auth-buttons-loading">
          <div class="auth-skeleton-btn"></div>
        </div>
      `;
      return;
    }

    const theme = getNavTheme();

    if (auth.isSignedIn) {
      renderSignedInUI(container, theme);
    } else {
      renderSignedOutUI(container, theme);
    }
  }

  function renderSignedOutUI(container, theme) {
    const isDark = theme === "dark";
    const textClass = isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-green-800";
    const btnClass = isDark
      ? "bg-white text-gray-900 hover:bg-gray-100"
      : "bg-accent text-white hover:bg-green-900";

    container.innerHTML = `
      <div class="auth-buttons-container flex items-center space-x-3">
        <button id="auth-signin-btn" class="${textClass} px-3 py-2 rounded-md text-sm font-medium transition-colors">
          Sign In
        </button>
        <button id="auth-signup-btn" class="${btnClass} px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Start Free
        </button>
      </div>
    `;

    document.getElementById("auth-signin-btn")?.addEventListener("click", () => {
      window.SupplementDBAuth.openSignIn();
    });

    document.getElementById("auth-signup-btn")?.addEventListener("click", () => {
      window.SupplementDBAuth.openSignUp();
    });
  }

  function renderSignedInUI(container, theme) {
    const user = window.SupplementDBAuth.user;
    const rbac = window.SupplementDBRBAC;
    const isDark = theme === "dark";

    // Avatar URL or fallback initials
    const avatarUrl = user?.imageUrl || user?.profileImageUrl;
    const initials = getInitials(user);
    const name = user?.firstName || user?.fullName || "User";

    let adminLink = "";
    if (rbac?.canAccessAdmin()) {
      const adminTextClass = isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-green-800";
      adminLink = `
        <a href="/admin/" class="${adminTextClass} px-3 py-2 rounded-md text-sm font-medium transition-colors hidden sm:inline-flex items-center">
          <i class="fas fa-chart-line mr-1"></i>Dashboard
        </a>
      `;
    }

    container.innerHTML = `
      <div class="auth-buttons-container flex items-center space-x-3">
        ${adminLink}
        <div id="auth-user-button" class="auth-user-button-wrapper"></div>
      </div>
    `;

    // Mount Clerk UserButton component
    const userBtnEl = document.getElementById("auth-user-button");
    if (userBtnEl) {
      try {
        window.SupplementDBAuth.mountUserButton(userBtnEl);
      } catch {
        // Fallback: render a simple avatar
        userBtnEl.innerHTML = `
          <button class="auth-avatar-fallback" title="${name}">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="${name}" class="auth-avatar-img" />`
                : `<span class="auth-avatar-initials">${initials}</span>`
            }
          </button>
        `;
      }
    }
  }

  function getInitials(user) {
    if (!user) return "?";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    if (first || last) return (first + last).toUpperCase();
    if (user.emailAddresses?.[0]) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase();
    }
    return "U";
  }

  // ── Event listeners ────────────────────────────────────────────
  document.addEventListener("auth:loaded", renderAuthUI);
  document.addEventListener("auth:signed-in", renderAuthUI);
  document.addEventListener("auth:signed-out", renderAuthUI);

  // Initial render attempt (in case auth already loaded)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAuthUI);
  } else {
    renderAuthUI();
  }
})();
