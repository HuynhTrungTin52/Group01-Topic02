const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');


const WHITELIST = new Set([
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'vite.config.js'),
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'package.json'),
  path.join(ROOT, 'postcss.config.cjs'),
  path.join(ROOT, 'tailwind.config.cjs'),
]);


const EXT = new Set(['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx', '.css', '.html', '.htm', '.svg']);

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dev-dist']);

let changed = [];

function shouldProcess(filePath) {
  const abs = path.resolve(filePath);
  if (WHITELIST.has(abs)) return false;
  const ext = path.extname(filePath).toLowerCase();
  if (!EXT.has(ext)) return false;
  return true;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name));
      continue;
    }
    const filePath = path.join(dir, e.name);
    if (!shouldProcess(filePath)) continue;
    try {
      let src = fs.readFileSync(filePath, 'utf8');
      const original = src;

      
      src = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

      
      src = src.replace(/(^|\s)\/\/[^\n\r]*/gm, (m, g1) => g1 || '');

      
      src = src.replace(/\/\*[\s\S]*?\*\//g, '');

      
      src = src.replace(//g, '');

      
      src = src.replace(/\n{3,}/g, '\n\n');

      if (src !== original) {
        fs.writeFileSync(filePath, src, 'utf8');
        changed.push(path.relative(ROOT, filePath));
      }
    } catch (err) {
      console.error('Failed to process', filePath, err.message);
    }
  }
}

walk(ROOT);

console.log('Strip comments run complete. Files changed:', changed.length);
changed.forEach(f => console.log('  -', f));
