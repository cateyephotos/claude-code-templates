/**
 * rbac.js — Client-Side Role-Based Access Control
 *
 * Provides role checking functions used by content gating, admin dashboard,
 * and navigation rendering. Reads role from SupplementDBAuth.
 *
 * Role hierarchy: admin (3) > subscriber (2) > free (1)
 *
 * Dependencies: auth.js loaded before this script (window.SupplementDBAuth)
 */
(function () {
  "use strict";

  // Skip real initialization when test mock is active
  if (window.__CLERK_MOCK__) return;

  const ROLE_HIERARCHY = {
    admin: 3,
    subscriber: 2,
    free: 1,
  };

  window.SupplementDBRBAC = {
    /**
     * Get the current user's role.
     * @returns {"admin"|"subscriber"|"free"}
     */
    getRole() {
      return window.SupplementDBAuth?.role || "free";
    },

    /**
     * Check if the current user has at least the specified role.
     * @param {"admin"|"subscriber"|"free"} requiredRole
     * @returns {boolean}
     */
    hasRole(requiredRole) {
      const currentRole = this.getRole();
      return (
        (ROLE_HIERARCHY[currentRole] || 0) >=
        (ROLE_HIERARCHY[requiredRole] || 0)
      );
    },

    /**
     * Check if the current user is authenticated (any role).
     * @returns {boolean}
     */
    isAuthenticated() {
      return window.SupplementDBAuth?.isSignedIn || false;
    },

    /**
     * Check if the current user can access full guide content.
     * Requires subscriber or admin role.
     * @returns {boolean}
     */
    canAccessGuide() {
      return this.hasRole("subscriber");
    },

    /**
     * Check if the current user can access the admin dashboard.
     * Requires admin role.
     * @returns {boolean}
     */
    canAccessAdmin() {
      return this.hasRole("admin");
    },

    /**
     * Check if the current user is a subscriber (or higher).
     * @returns {boolean}
     */
    isSubscriber() {
      return this.hasRole("subscriber");
    },

    /**
     * Check if the current user is an admin.
     * @returns {boolean}
     */
    isAdmin() {
      return this.hasRole("admin");
    },

    /**
     * Enforce admin access — redirects non-admins to homepage.
     * Call this at the top of admin pages.
     * @returns {boolean} true if access granted
     */
    enforceAdmin() {
      if (!window.SupplementDBAuth?.isLoaded) {
        // Wait for auth to load before enforcing
        window.SupplementDBAuth?.whenLoaded().then(() => {
          if (!this.canAccessAdmin()) {
            window.location.href =
              window.location.origin + "/index.html";
          }
        });
        return false;
      }

      if (!this.canAccessAdmin()) {
        window.location.href =
          window.location.origin + "/index.html";
        return false;
      }

      return true;
    },

    /**
     * Enforce subscriber access — shows gate for free users.
     * Call this on gated guide pages.
     * @returns {boolean} true if full access granted
     */
    enforceSubscriber() {
      return this.canAccessGuide();
    },

    /**
     * Check if the current user can access a specific guide's premium content.
     * Returns true synchronously for role-based access (subscriber/admin),
     * or for free guides. One-off purchase check requires async Convex query
     * and is handled separately in content-gate.js.
     * @param {string} slug - Guide slug
     * @returns {boolean} true if immediate access (role-based or free guide)
     */
    canAccessSpecificGuide(slug) {
      const FREE_GUIDES = ["sleep"];
      if (FREE_GUIDES.includes(slug)) return true;
      return this.hasRole("subscriber");
    },

    /**
     * Get display label for the current role.
     * @returns {string}
     */
    getRoleLabel() {
      const labels = {
        admin: "Admin",
        subscriber: "Subscriber",
        free: "Free",
      };
      return labels[this.getRole()] || "Free";
    },

    /**
     * Get role badge HTML for display in the UI.
     * @returns {string} HTML string
     */
    getRoleBadge() {
      const role = this.getRole();
      const colors = {
        admin: "bg-red-100 text-red-800",
        subscriber: "bg-green-100 text-green-800",
        free: "bg-gray-100 text-gray-600",
      };
      const color = colors[role] || colors.free;
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}">${this.getRoleLabel()}</span>`;
    },
  };
})();
