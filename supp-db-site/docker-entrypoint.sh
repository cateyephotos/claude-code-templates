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
#   __SITE_URL__               → SITE_URL env var (defaults to http://localhost:8080)

HTML_DIR="/usr/share/nginx/html"

echo "🔧 SupplementDB Docker Entrypoint"
echo "   Substituting environment variables..."

# ── Read-only filesystem detection ─────────────────────────────
# When mounted with :ro (local dev), skip sed substitution entirely.
# The HTML files already contain hardcoded values for local development.
if ! touch "$HTML_DIR/.write-test" 2>/dev/null; then
    echo "   ⚠️  Read-only filesystem detected — skipping env substitution"
    echo "   (HTML files use hardcoded values for local dev)"
    echo ""
else
    rm -f "$HTML_DIR/.write-test"

    # Limit find to top-level site files — skip node_modules, test artifacts, etc.
    FIND_OPTS="-maxdepth 3 -type f \( -name '*.html' -o -name '*.js' \) -not -path '*/node_modules/*' -not -path '*/playwright-report/*' -not -path '*/.playwright-mcp/*' -not -path '*/test-results/*'"

    # ── Clerk Publishable Key ──────────────────────────────────────
    if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
        # Substitute placeholder in <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
        # auth.js reads this and dynamically loads Clerk CDN only when it's a valid pk_ key
        eval find "$HTML_DIR" $FIND_OPTS -exec sed -i "s|__CLERK_PUBLISHABLE_KEY__|${CLERK_PUBLISHABLE_KEY}|g" {} +
        echo "   ✅ CLERK_PUBLISHABLE_KEY injected"
    else
        echo "   ⚠️  CLERK_PUBLISHABLE_KEY not set — auth features will be unavailable"
    fi

    # ── Convex URL ─────────────────────────────────────────────────
    if [ -n "$CONVEX_URL" ]; then
        eval find "$HTML_DIR" $FIND_OPTS -exec sed -i "s|__CONVEX_URL__|${CONVEX_URL}|g" {} +
        echo "   ✅ CONVEX_URL injected"
    else
        echo "   ⚠️  CONVEX_URL not set — using default (https://robust-frog-754.convex.cloud)"
    fi

    # ── PostHog Key ────────────────────────────────────────────────
    if [ -n "$POSTHOG_KEY" ]; then
        eval find "$HTML_DIR" $FIND_OPTS -exec sed -i "s|__POSTHOG_KEY__|${POSTHOG_KEY}|g" {} +
        echo "   ✅ POSTHOG_KEY injected"
    else
        echo "   ⚠️  POSTHOG_KEY not set — PostHog analytics will use hardcoded key"
    fi

    # ── Site URL ──────────────────────────────────────────────────
    if [ -n "$SITE_URL" ]; then
        eval find "$HTML_DIR" $FIND_OPTS -exec sed -i "s|__SITE_URL__|${SITE_URL}|g" {} +
        echo "   ✅ SITE_URL injected"
    else
        echo "   ⚠️  SITE_URL not set — using default (http://localhost:8080)"
    fi

    echo "   Environment substitution complete."
    echo ""
fi

# ── Start nginx ────────────────────────────────────────────────
echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"
