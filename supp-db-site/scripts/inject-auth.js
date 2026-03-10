#!/usr/bin/env node
/**
 * inject-auth.js — Batch HTML Injection Script
 *
 * Modifies all HTML files in the SupplementDB site to add:
 *   1. Clerk CDN + Convex CDN + auth CSS in <head>
 *   2. Auth buttons container in navigation
 *   3. Auth/Convex/RBAC JS scripts before </body>
 *   4. Content gate scripts on guide pages
 *
 * Usage: node scripts/inject-auth.js [--dry-run] [--verbose]
 *
 * Dependencies: cheerio
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// ── Configuration ────────────────────────────────────────────────
const ROOT_DIR = path.resolve(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

// Directories to skip
const SKIP_DIRS = new Set([
  "node_modules",
  "convex",
  "scripts",
  "archive",
  ".git",
  "tests",
  "admin", // admin page is manually created
]);

// Files to skip
const SKIP_FILES = new Set([
  "debug-page-content.html",
]);

// Guide pages that get content gating
const GUIDE_DIR = "guides";

// ── CDN Tags to inject ──────────────────────────────────────────
const HEAD_INJECT = `
    <!-- Clerk Auth CDN -->
    <meta name="clerk-publishable-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="https://robust-frog-754.convex.cloud">
    <script src="https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/convex@latest/dist/browser/index.global.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="{{CSS_PREFIX}}css/auth.css">
`;

const GUIDE_HEAD_INJECT = `
    <link rel="stylesheet" href="{{CSS_PREFIX}}css/content-gate.css">
`;

// Scripts injected before </body>
const BODY_INJECT = `
    <!-- Auth & Backend Scripts -->
    <script src="{{JS_PREFIX}}js/auth.js"></script>
    <script src="{{JS_PREFIX}}js/convex-client.js"></script>
    <script src="{{JS_PREFIX}}js/rbac.js"></script>
    <script src="{{JS_PREFIX}}js/auth-ui.js"></script>
    <script src="{{JS_PREFIX}}js/analytics-enhanced.js"></script>
`;

const GUIDE_BODY_INJECT = `
    <script src="{{JS_PREFIX}}js/content-gate.js"></script>
`;

// Auth buttons container
const AUTH_BUTTONS_HTML = '<div id="auth-buttons"></div>';

// ── Main ─────────────────────────────────────────────────────────
function main() {
  console.log("🔧 SupplementDB Auth Injection Script");
  console.log(`   Root: ${ROOT_DIR}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log("");

  const htmlFiles = findHtmlFiles(ROOT_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to process.\n`);

  let modified = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of htmlFiles) {
    try {
      const result = processFile(filePath);
      if (result === "modified") modified++;
      else if (result === "skipped") skipped++;
    } catch (err) {
      errors++;
      console.error(`❌ Error processing ${path.relative(ROOT_DIR, filePath)}: ${err.message}`);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`✅ Modified: ${modified}`);
  console.log(`⏭  Skipped:  ${skipped} (already injected or excluded)`);
  console.log(`❌ Errors:   ${errors}`);
  console.log("═".repeat(50));
}

// ── Find all HTML files recursively ──────────────────────────────
function findHtmlFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const dirName = entry.name;
        if (!SKIP_DIRS.has(dirName)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        if (!SKIP_FILES.has(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files.sort();
}

// ── Process a single HTML file ───────────────────────────────────
function processFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const html = fs.readFileSync(filePath, "utf-8");

  // Skip if already injected
  if (html.includes('id="auth-buttons"') || html.includes("clerk-publishable-key")) {
    if (VERBOSE) console.log(`⏭  ${relativePath} (already injected)`);
    return "skipped";
  }

  const $ = cheerio.load(html, { decodeEntities: false });

  // Calculate path prefix based on file depth
  const depth = relativePath.split(path.sep).length - 1;
  const prefix = depth > 0 ? "../".repeat(depth) : "";

  const isGuidePage = relativePath.replace(/\\/g, "/").startsWith(GUIDE_DIR + "/");
  const isHomepage = relativePath === "index.html";

  // 1. Inject CDN scripts and CSS into <head>
  injectHead($, prefix, isGuidePage);

  // 2. Inject auth buttons into navigation
  injectNavAuthButtons($, isHomepage);

  // 3. Inject JS scripts before </body>
  injectBodyScripts($, prefix, isGuidePage);

  // Write the modified file
  const output = $.html();

  if (DRY_RUN) {
    console.log(`📝 [DRY RUN] Would modify: ${relativePath}`);
  } else {
    fs.writeFileSync(filePath, output, "utf-8");
    console.log(`✅ ${relativePath}`);
  }

  return "modified";
}

// ── Inject into <head> ───────────────────────────────────────────
function injectHead($, prefix, isGuidePage) {
  const head = $("head");
  if (head.length === 0) return;

  // Find PostHog script or last <script> in head to inject before it
  const headHtml = HEAD_INJECT.replace(/\{\{CSS_PREFIX\}\}/g, prefix);

  // Inject before the closing </head> (after all existing content)
  // Insert before tailwind link for proper cascade
  const tailwindLink = head.find('link[href*="tailwind"]');
  if (tailwindLink.length > 0) {
    tailwindLink.before(headHtml);
  } else {
    head.append(headHtml);
  }

  // Add content gate CSS for guide pages
  if (isGuidePage) {
    const gateHtml = GUIDE_HEAD_INJECT.replace(/\{\{CSS_PREFIX\}\}/g, prefix);
    const authCssLink = head.find('link[href*="auth.css"]');
    if (authCssLink.length > 0) {
      authCssLink.after(gateHtml);
    } else {
      head.append(gateHtml);
    }
  }
}

// ── Inject auth buttons into navigation ──────────────────────────
function injectNavAuthButtons($, isHomepage) {
  if (isHomepage) {
    // Homepage: sticky-header nav — inject after the export button's parent div
    const stickyNav = $("nav.sticky-header");
    if (stickyNav.length > 0) {
      // Find the right-side div with buttons (favoritesBtn, exportBtn)
      const rightDiv = stickyNav.find(".flex.items-center.space-x-4").last();
      if (rightDiv.length > 0) {
        rightDiv.append(AUTH_BUTTONS_HTML);
      } else {
        // Fallback: append to the nav's inner container
        stickyNav.find("> div > div").last().append(AUTH_BUTTONS_HTML);
      }
    }
  } else {
    // Subpages: legal-nav or guide-nav — inject into the flex container
    const navEl = $("nav.legal-nav, nav.guide-nav");
    if (navEl.length > 0) {
      // Find the inner div with flex layout
      const flexDiv = navEl.find(".flex.items-center");
      if (flexDiv.length > 0) {
        // Look for the right-side container (space-x-4 or gap-5)
        const rightSide = navEl.find(".flex.items-center.space-x-4");
        if (rightSide.length > 0) {
          rightSide.append(AUTH_BUTTONS_HTML);
        } else {
          // For guide-nav: find the desktop nav links div and append there
          const desktopNav = navEl.find(".hidden.md\\:flex");
          if (desktopNav.length > 0) {
            desktopNav.append(AUTH_BUTTONS_HTML);
          } else {
            // Single link on right side — wrap it and add auth buttons
            const innerDiv = navEl.find("> div").first();
            if (innerDiv.length > 0) {
              // Find the last child (the link/buttons on the right)
              const children = innerDiv.children();
              if (children.length >= 2) {
                // The second child is typically the right-side link(s)
                const rightEl = children.last();
                // Wrap in a flex container
                rightEl.wrap('<div class="flex items-center space-x-4"></div>');
                rightEl.parent().append(AUTH_BUTTONS_HTML);
              } else {
                innerDiv.append(`<div class="flex items-center space-x-4">${AUTH_BUTTONS_HTML}</div>`);
              }
            }
          }
        }
      }
    }
  }
}

// ── Inject scripts before </body> ────────────────────────────────
function injectBodyScripts($, prefix, isGuidePage) {
  const body = $("body");
  if (body.length === 0) return;

  let scripts = BODY_INJECT.replace(/\{\{JS_PREFIX\}\}/g, prefix);

  if (isGuidePage) {
    scripts += GUIDE_BODY_INJECT.replace(/\{\{JS_PREFIX\}\}/g, prefix);
  }

  body.append(scripts);
}

// ── Run ──────────────────────────────────────────────────────────
main();
