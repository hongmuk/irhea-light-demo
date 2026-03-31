/**
 * Static Site Builder for GitHub Pages
 * Renders EJS templates to static HTML in docs/ directory
 */
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const BASE_PATH = process.env.BASE_PATH || '/irhea-light-demo';
const SRC = __dirname;
const DOCS = path.join(SRC, 'docs');

// Pages to render
const pages = [
  { page: 'dashboard', title: 'Spout Control', activeNav: 'dashboard', outPath: 'index.html' },
  { page: 'recipe-list', title: 'Recipes', activeNav: 'recipes', outPath: 'recipes/index.html' },
  { page: 'recipe-detail', title: 'Recipe Detail', activeNav: 'recipes', outDir: 'recipe', idRange: [1, 10] },
  { page: 'recipe-edit', title: 'Edit Recipe', activeNav: 'recipes', outDir: 'recipe-edit', idRange: [1, 10] },
  { page: 'brewing', title: 'Brewing', activeNav: 'brewing', outPath: 'brewing/index.html' },
  { page: 'brewing-complete', title: 'Brewing Complete', activeNav: 'brewing', outPath: 'brewing/complete/index.html' },
  { page: 'favorites', title: 'Favorites', activeNav: 'favorites', outPath: 'favorites/index.html' },
  { page: 'alarms', title: 'Alarms', activeNav: 'alarms', outPath: 'alarms/index.html' },
  { page: 'settings', title: 'Settings', activeNav: 'settings', outPath: 'settings/index.html' },
  { page: 'calibration', title: 'Calibration', activeNav: 'calibration', outPath: 'calibration/index.html' },
  { page: 'firmware', title: 'Firmware', activeNav: 'firmware', outPath: 'firmware/index.html' },
  { page: 'system-info', title: 'System Info', activeNav: 'system-info', outPath: 'system-info/index.html' },
  { page: 'usage', title: 'Usage History', activeNav: 'usage', outPath: 'usage/index.html' },
];

// ── Helpers ──────────────────────────────────────────────

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirSync(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function fixHtmlPaths(html, basePath) {
  // Fix href="/..." and src="/..." (but not external URLs like href="https://")
  html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
  // Fix any double slashes after base path
  const escaped = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`${escaped}//`, 'g'), `${basePath}/`);
  return html;
}

function injectConfig(html, basePath) {
  const configScript = `<script>window.BASE_PATH = "${basePath}";</script>`;
  return html.replace('<!-- Global JS -->', configScript + '\n  <!-- Global JS -->');
}

function renderEjs(data) {
  const layoutPath = path.join(SRC, 'views', 'layout.ejs');
  const template = fs.readFileSync(layoutPath, 'utf8');
  return ejs.render(template, data, {
    filename: layoutPath,
    root: path.join(SRC, 'views'),
  });
}

function writePage(outPath, pageData) {
  const outFile = path.join(DOCS, outPath);
  mkdirp(path.dirname(outFile));
  let html = renderEjs(pageData);
  html = fixHtmlPaths(html, BASE_PATH);
  html = injectConfig(html, BASE_PATH);
  fs.writeFileSync(outFile, html);
}

// ── Build ────────────────────────────────────────────────

console.log(`Building static site with BASE_PATH = "${BASE_PATH}"`);

// Clean
rmrf(DOCS);
mkdirp(DOCS);

// Render pages
let pageCount = 0;
for (const p of pages) {
  if (p.idRange) {
    for (let id = p.idRange[0]; id <= p.idRange[1]; id++) {
      const outPath = p.page === 'recipe-edit'
        ? `recipe/${id}/edit/index.html`
        : `recipe/${id}/index.html`;
      writePage(outPath, { page: p.page, title: p.title, activeNav: p.activeNav });
      pageCount++;
    }
  } else {
    writePage(p.outPath, { page: p.page, title: p.title, activeNav: p.activeNav });
    pageCount++;
  }
}

// Copy static assets
console.log('Copying static assets...');
copyDirSync(path.join(SRC, 'public', 'css'), path.join(DOCS, 'css'));
copyDirSync(path.join(SRC, 'public', 'js'), path.join(DOCS, 'js'));

// Copy mock data as API JSON files
console.log('Copying mock data as API endpoints...');
const apiDir = path.join(DOCS, 'api');
mkdirp(apiDir);
for (const file of fs.readdirSync(path.join(SRC, 'mock'))) {
  fs.copyFileSync(
    path.join(SRC, 'mock', file),
    path.join(apiDir, file)
  );
}

// Create 404.html (same as index for SPA-like behavior)
fs.copyFileSync(path.join(DOCS, 'index.html'), path.join(DOCS, '404.html'));

console.log(`Done! Built ${pageCount} pages to docs/`);
