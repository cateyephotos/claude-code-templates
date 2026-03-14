#!/bin/sh
set -e

# docker-entrypoint.sh — Staging-based Environment Variable Substitution
#
# Copies all site files to a writable staging directory (/usr/share/nginx/html-dist),
# performs placeholder substitution there, then starts nginx serving from staging.
#
# This pattern works in ALL environments:
#   • Local dev with :ro volume mount — source is read-only, staging is always writable
#   • Production / Docker build — files baked into image, staging copy is still made
#
# Placeholders always replaced (with empty string if var unset):
#   __CLERK_PUBLISHABLE_KEY__  → CLERK_PUBLISHABLE_KEY env var
#   __CONVEX_URL__             → CONVEX_URL env var
#   __POSTHOG_KEY__            → POSTHOG_KEY env var
#   __SITE_URL__               → SITE_URL env var

SRC_DIR="/usr/share/nginx/html"
DIST_DIR="/usr/share/nginx/html-dist"

# find_and_replace PLACEHOLDER VALUE
# Replaces all occurrences of PLACEHOLDER with VALUE in *.html and *.js under DIST_DIR.
# Written as an inline function to avoid `eval` (which would misinterpret | as shell pipes).
find_and_replace() {
    # Exclude large data directories (data/, enhanced_citations/) — placeholders
    # only appear in HTML pages and top-level JS files, not in static data files.
    find "$DIST_DIR" -maxdepth 3 -type f \( -name '*.html' -o -name '*.js' \) \
        -not -path '*/node_modules/*' \
        -not -path '*/playwright-report/*' \
        -not -path '*/.playwright-mcp/*' \
        -not -path '*/test-results/*' \
        -not -path '*/data/*' \
        -not -path '*/reports/*' \
        -not -path '*/mockups/*' \
        -exec sed -i "s|${1}|${2}|g" {} +
}

echo "🔧 SupplementDB Docker Entrypoint"
echo "   Source:  $SRC_DIR"
echo "   Staging: $DIST_DIR"
echo ""

# ── Copy source files to writable staging directory ───────────────
# Always done regardless of :ro status — DIST_DIR is never mounted read-only.
echo "   Copying site files to staging directory..."
mkdir -p "$DIST_DIR"
cp -r "$SRC_DIR"/. "$DIST_DIR"/
echo "   ✅ Files copied to staging"
echo ""

# ── Environment variable substitution in DIST_DIR ────────────────
# Placeholders are ALWAYS replaced (using empty string if the var is unset).
# This ensures no literal __PLACEHOLDER__ tokens are ever served to the browser.
echo "   Substituting environment variables..."

# Clerk Publishable Key ── injected into <meta name="clerk-key"> in HTML
find_and_replace "__CLERK_PUBLISHABLE_KEY__" "${CLERK_PUBLISHABLE_KEY:-}"
if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
    echo "   ✅ CLERK_PUBLISHABLE_KEY injected"
else
    echo "   ⚠️  CLERK_PUBLISHABLE_KEY not set — Clerk auth will be unavailable"
    echo "      Add CLERK_PUBLISHABLE_KEY=pk_test_... to your .env and run:"
    echo "      docker-compose up --build supp-db"
fi

# Convex URL ── backend WebSocket endpoint
find_and_replace "__CONVEX_URL__" "${CONVEX_URL:-}"
if [ -n "$CONVEX_URL" ]; then
    echo "   ✅ CONVEX_URL injected"
else
    echo "   ⚠️  CONVEX_URL not set — using hardcoded default"
fi

# PostHog Key ── analytics
find_and_replace "__POSTHOG_KEY__" "${POSTHOG_KEY:-}"
if [ -n "$POSTHOG_KEY" ]; then
    echo "   ✅ POSTHOG_KEY injected"
else
    echo "   ⚠️  POSTHOG_KEY not set — PostHog analytics disabled"
fi

# Site URL ── used in Stripe checkout and email links
find_and_replace "__SITE_URL__" "${SITE_URL:-}"
if [ -n "$SITE_URL" ]; then
    echo "   ✅ SITE_URL injected"
else
    echo "   ⚠️  SITE_URL not set — using default (http://localhost:8080)"
fi

echo "   Environment substitution complete."
echo ""

# ── Build version cache-busting ───────────────────────────────────
# Appends ?v=TIMESTAMP to all local /js/ and /css/ src/href attributes in HTML.
# This invalidates browser caches on every container restart, preventing stale
# JS/CSS from being served after updates (especially when nginx used to send
# "Cache-Control: public, immutable" which persists across deployments).
BUILD_VERSION=$(date +%s)
echo "   🔨 Injecting build version: $BUILD_VERSION"

# Inject version into: src="../js/foo.js" → src="../js/foo.js?v=BUILD_VERSION"
# Handles: ../js/, ./js/, /js/ relative paths — stops at the closing quote.
# Skips URLs that already contain a query string (?) to avoid double-versioning.
find "$DIST_DIR" -maxdepth 5 -type f -name "*.html" \
    -not -path '*/node_modules/*' \
    -not -path '*/playwright-report/*' \
    -not -path '*/test-results/*' \
    -exec sed -i \
        -e 's|src="\([^"?]*\)\.js"|src="\1.js?v='"$BUILD_VERSION"'"|g' \
        -e 's|href="\([^"?]*\)\.css"|href="\1.css?v='"$BUILD_VERSION"'"|g' \
        {} +

echo "   ✅ Build version $BUILD_VERSION injected into JS/CSS URLs"
echo ""

# ── Hot-reload watcher for local dev (:ro volume mount) ──────────
# If source dir is :ro mounted, start an inotify watcher in the background.
# On any file change: re-copy source → staging, then re-run all substitutions.
# This gives hot-reload behavior without needing write access to the mounted dir.
if ! touch "$SRC_DIR/.write-test" 2>/dev/null; then
    echo "   🔄 Read-only volume detected — starting hot-reload watcher"
    echo "      Changes to supp-db-site/ will be reflected automatically"
    echo ""

    (
        while true; do
            inotifywait -r -e modify,create,delete,move "$SRC_DIR" 2>/dev/null || sleep 2
            echo "   🔄 [hot-reload] Change detected — resyncing staging..."
            cp -r "$SRC_DIR"/. "$DIST_DIR"/
            find_and_replace "__CLERK_PUBLISHABLE_KEY__" "${CLERK_PUBLISHABLE_KEY:-}" 2>/dev/null || true
            find_and_replace "__CONVEX_URL__"             "${CONVEX_URL:-}"            2>/dev/null || true
            find_and_replace "__POSTHOG_KEY__"            "${POSTHOG_KEY:-}"           2>/dev/null || true
            find_and_replace "__SITE_URL__"               "${SITE_URL:-}"              2>/dev/null || true
            echo "   ✅ [hot-reload] Staging synced and substitutions applied"
        done
    ) &
else
    rm -f "$SRC_DIR/.write-test"
fi

# ── Start nginx ────────────────────────────────────────────────────
echo "🚀 Starting nginx (serving from $DIST_DIR)..."
exec nginx -g "daemon off;"
