/**
 * auth.config.js — Convex authentication provider configuration.
 *
 * This file tells Convex which JWT issuers to trust for authentication.
 * Without this file, ctx.auth.getUserIdentity() always returns null,
 * causing every authenticated query/mutation to fail silently.
 *
 * Clerk integration:
 *   - CLERK_JWT_ISSUER_DOMAIN env var: Set this in Convex Dashboard →
 *     Settings → Environment Variables to your Clerk instance URL.
 *   - Format: https://<your-clerk-instance>.clerk.accounts.dev
 *     (dev) or https://<your-clerk-instance>.clerk.accounts.com (prod)
 *   - Falls back to the observed dev instance URL if not set.
 *
 * Also required (one-time Clerk Dashboard setup):
 *   1. JWT Templates → New template → name it exactly "convex"
 *      (Clerk has a built-in Convex template — select it)
 *   2. Webhooks → Add Endpoint → https://<your-convex-url>/clerk-webhook
 *      Events: user.created, user.updated, user.deleted
 */
export default {
  providers: [
    {
      // Clerk instance domain — used to verify JWT signatures.
      // This is a public URL (visible in browser network requests), not a secret.
      // To change: update this value to your Clerk instance URL and redeploy.
      // Dev:  https://<slug>.clerk.accounts.dev
      // Prod: https://<slug>.clerk.accounts.com
      domain: "https://usable-tarpon-30.clerk.accounts.dev",
      // Must match the JWT template audience ("aud" claim) in Clerk.
      // The built-in Convex JWT template uses "convex" as the audience.
      applicationID: "convex",
    },
  ],
};
