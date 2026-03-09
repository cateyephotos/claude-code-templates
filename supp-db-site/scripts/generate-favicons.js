#!/usr/bin/env node
/**
 * generate-favicons.js
 * Converts the SVG favicon into PNG variants at required sizes.
 * Requires: npm install sharp (in supp-db-site/)
 *
 * Output:
 *   assets/favicon-16x16.png
 *   assets/favicon-32x32.png
 *   assets/apple-touch-icon.png  (180x180)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'assets', 'favicon.svg');

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  const svgBuffer = fs.readFileSync(SVG_PATH);
  console.log(`[favicons] Read SVG source: ${SVG_PATH}`);

  for (const { name, size } of SIZES) {
    const outPath = path.join(ROOT, 'assets', name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`[favicons] Generated ${name} (${size}x${size})`);
  }

  console.log('[favicons] Done — all favicon variants generated.');
}

generate().catch(err => {
  console.error('[favicons] Error:', err.message);
  process.exit(1);
});
