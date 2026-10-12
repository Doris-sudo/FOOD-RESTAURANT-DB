/**
 * scripts/copyStandalone.js
 *
 * Next.js standalone output doesn't automatically include the static files.
 * This script copies them into the right place so the production server
 * can serve them correctly.
 *
 * Runs automatically after `next build` via the build script in package.json.
 */

const fs   = require('fs');
const path = require('path');

const root       = path.resolve(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');
const staticSrc  = path.join(root, '.next', 'static');
const staticDst  = path.join(standalone, '.next', 'static');
const publicSrc  = path.join(root, 'public');
const publicDst  = path.join(standalone, 'public');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

console.log('📦  Copying static assets into standalone output…');
copyDir(staticSrc, staticDst);
copyDir(publicSrc, publicDst);
console.log('✅  Done.');
