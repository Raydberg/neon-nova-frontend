const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', 'public', '_redirects'),
  path.join(__dirname, '..', 'src', '_redirects')
];

const outDir = path.join(__dirname, '..', 'dist', 'neon-nova');
const outFile = path.join(outDir, '_redirects');

let found = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    found = p;
    break;
  }
}

if (!found) {
  console.warn('No _redirects file found in public/ or src/. Skipping copy.');
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  console.warn('Output directory not found:', outDir);
  process.exit(0);
}

fs.copyFileSync(found, outFile);
console.log('Copied', found, '->', outFile);
