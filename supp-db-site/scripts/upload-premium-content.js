#!/usr/bin/env node
/**
 * Upload premium guide content chunks to Convex.
 * Reads JSON files from data/premium-chunks/ and upserts each into the
 * premiumGuideContent table via the Convex HTTP API.
 *
 * Uses the Convex HTTP API at {CONVEX_URL}/api/run with deploy key auth,
 * which allows calling internal mutations directly without re-deploying.
 *
 * Required env vars:
 *   CONVEX_URL        — Convex deployment URL (e.g., https://robust-frog-754.convex.cloud)
 *   CONVEX_DEPLOY_KEY — Convex deploy key for admin/internal function access
 *
 * Usage: node scripts/upload-premium-content.js
 */

const fs = require('fs');
const path = require('path');

const CHUNKS_DIR = path.join(__dirname, '..', 'data', 'premium-chunks');
const SIZE_WARN_KB = 900;
const SIZE_ERROR_KB = 1024;

async function uploadChunk(convexUrl, deployKey, chunk, sizeKb) {
    const response = await fetch(`${convexUrl.replace(/\/$/, '')}/api/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Convex ${deployKey}`,
        },
        body: JSON.stringify({
            path: 'premiumGuideContent:upsertContent',
            args: {
                guideSlug: chunk.slug,
                htmlContent: chunk.htmlContent,
                version: chunk.version || new Date().toISOString().slice(0, 10),
                generatedAt: chunk.generatedAt || new Date().toISOString(),
            },
            format: 'json',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(result.errorMessage || 'Unknown Convex error');
    }

    return result;
}

async function main() {
    const convexUrl = process.env.CONVEX_URL;
    const deployKey = process.env.CONVEX_DEPLOY_KEY;

    if (!convexUrl) {
        console.error('ERROR: CONVEX_URL environment variable is required.');
        console.error('  Example: export CONVEX_URL=https://robust-frog-754.convex.cloud');
        process.exit(1);
    }
    if (!deployKey) {
        console.error('ERROR: CONVEX_DEPLOY_KEY environment variable is required.');
        console.error('  Obtain from: https://dashboard.convex.dev → Settings → Deploy Keys');
        process.exit(1);
    }

    if (!fs.existsSync(CHUNKS_DIR)) {
        console.error(`ERROR: Premium chunks directory not found: ${CHUNKS_DIR}`);
        console.error('Run "node scripts/generate-guide-pages.js" first to generate content chunks.');
        process.exit(1);
    }

    const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error('ERROR: No JSON files found in premium chunks directory.');
        console.error(`Directory checked: ${CHUNKS_DIR}`);
        process.exit(1);
    }

    console.log(`Convex URL: ${convexUrl}`);
    console.log(`Found ${files.length} premium content chunks to upload.\n`);

    let uploaded = 0;
    let warned = 0;
    let skipped = 0;

    for (const file of files) {
        const filePath = path.join(CHUNKS_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf8');

        let chunk;
        try {
            chunk = JSON.parse(raw);
        } catch (e) {
            console.error(`✗ ${file}: Invalid JSON — skipping (${e.message})`);
            skipped++;
            continue;
        }

        if (!chunk.slug || !chunk.htmlContent) {
            const missing = [!chunk.slug && 'slug', !chunk.htmlContent && 'htmlContent'].filter(Boolean).join(', ');
            console.error(`✗ ${file}: Missing required fields (${missing}) — skipping`);
            skipped++;
            continue;
        }

        const sizeKb = Buffer.byteLength(chunk.htmlContent, 'utf8') / 1024;

        if (sizeKb > SIZE_ERROR_KB) {
            console.error(`✗ ${file}: ${sizeKb.toFixed(1)}KB exceeds 1MB Convex document limit — skipping`);
            skipped++;
            continue;
        }

        if (sizeKb > SIZE_WARN_KB) {
            console.warn(`⚠ ${file}: ${sizeKb.toFixed(1)}KB approaching 1MB Convex document limit`);
            warned++;
        }

        try {
            await uploadChunk(convexUrl, deployKey, chunk, sizeKb);
            console.log(`✓ ${chunk.slug} (${sizeKb.toFixed(1)}KB)`);
            uploaded++;
        } catch (e) {
            console.error(`✗ ${chunk.slug}: Upload failed — ${e.message}`);
            skipped++;
        }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Uploaded:      ${uploaded}`);
    if (warned > 0) console.log(`Warned (>900KB): ${warned}`);
    if (skipped > 0) console.log(`Skipped/Failed: ${skipped}`);
    console.log(`Total:         ${files.length}`);

    if (skipped > 0) {
        console.error('\nOne or more chunks failed to upload. Review errors above.');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
