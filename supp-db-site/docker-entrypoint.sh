#!/bin/sh
set -e

# docker-entrypoint.sh — Environment Variable Substitution
#
# Replaces placeholder tokens in HTML and JS files with actual
# environment variable values before starting nginx.
#
# Placeholders:
#   __CLERK_PUBLISHABLE_KEY__  → CLERK_PUBLISHABLE_KEY env var
#   __CONVEX_URL__             → CONVEX_URL env var (defaults to production URL)
#   __POSTHOG_KEY__            → POSTHOG_KEY env var

HTML_DIR="/usr/share/nginx/html"

echo "🔧 SupplementDB Docker Entrypoint"
echo "   Substituting environment variables..."

# ── Clerk Publishable Key ──────────────────────────────────────
if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
    find "$HTML_DIR" -type f \( -name "*.html" -o -name "*.js" \) \
        -exec sed -i "s|__CLERK_PUBLISHABLE_KEY__|${CLERK_PUBLISHABLE_KEY}|g" {} +
    echo "   ✅ CLERK_PUBLISHABLE_KEY injected"
else
    echo "   ⚠️  CLERK_PUBLISHABLE_KEY not set — auth features will be unavailable"
fi

# ── Convex URL ─────────────────────────────────────────────────
if [ -n "$CONVEX_URL" ]; then
    find "$HTML_DIR" -type f \( -name "*.html" -o -name "*.js" \) \
        -exec sed -i "s|__CONVEX_URL__|${CONVEX_URL}|g" {} +
    echo "   ✅ CONVEX_URL injected"
else
    echo "   ⚠️  CONVEX_URL not set — using default (https://robust-frog-754.convex.cloud)"
fi

# ── PostHog Key ────────────────────────────────────────────────
if [ -n "$POSTHOG_KEY" ]; then
    find "$HTML_DIR" -type f \( -name "*.html" -o -name "*.js" \) \
        -exec sed -i "s|__POSTHOG_KEY__|${POSTHOG_KEY}|g" {} +
    echo "   ✅ POSTHOG_KEY injected"
else
    echo "   ⚠️  POSTHOG_KEY not set — PostHog analytics will use hardcoded key"
fi

echo "   Environment substitution complete."
echo ""

# ── Start nginx ────────────────────────────────────────────────
echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"
