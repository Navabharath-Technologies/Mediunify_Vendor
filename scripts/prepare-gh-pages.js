const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
  // 1. Create .nojekyll so GitHub Pages won't ignore directories starting with underscore like _expo/
  const nojekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log('✓ Created dist/.nojekyll');

  // 2. Overwrite .gitignore in dist with an empty allow-all rule so git never ignores assets/node_modules/ (vector icons & fonts)
  const gitignorePath = path.join(distDir, '.gitignore');
  fs.writeFileSync(gitignorePath, '# Ensure all static export files are tracked on gh-pages\n!*\n');
  console.log('✓ Created dist/.gitignore (ensures assets/node_modules icons are included)');

  // 3. Copy index.html to 404.html for SPA client-side routing fallback on GitHub Pages
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Copied dist/index.html to dist/404.html (SPA fallback)');
  }
} else {
  console.warn('Warning: dist directory does not exist yet.');
}
