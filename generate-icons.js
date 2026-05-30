/**
 * Génère les icônes PWA à partir de public/icon.png.
 * Usage : node generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourcePath = path.join(__dirname, 'public', 'icon.png');
const outputDir = path.join(__dirname, 'public', 'icons');

async function run() {
  const meta = await sharp(sourcePath).metadata();
  console.log(`Source : icon.png (${meta.width}x${meta.height})`);

  for (const size of sizes) {
    const outPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  console.log('\nIcones générées dans public/icons/');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
