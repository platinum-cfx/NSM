const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, '..', 'altv-fix-source', 'data');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Build DEBUG version
console.log('Building DEBUG version...');
fs.copyFileSync(path.join(srcDir, 'AppDebug.svelte'), path.join(srcDir, 'App.svelte'));
execSync('npm run build', { stdio: 'inherit' });
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(dataDir, 'ui_index_debug.html'));

// 2. Build NODEBUG version
console.log('Building NODEBUG version...');
fs.copyFileSync(path.join(srcDir, 'AppNodebug.svelte'), path.join(srcDir, 'App.svelte'));
execSync('npm run build', { stdio: 'inherit' });
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(dataDir, 'ui_index_nodebug.html'));

// 3. Restore App.svelte to AppDebug.svelte so the dev environment is normal
fs.copyFileSync(path.join(srcDir, 'AppDebug.svelte'), path.join(srcDir, 'App.svelte'));

console.log('Both versions built and copied successfully.');
