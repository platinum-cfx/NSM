// Standalone verification for the FiveM-Lua-fork → standard-Lua transformer.
import { transformFiveMLua } from '../cfx/lua-transform.js';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { LuaFactory } = require('../vendor/wasmoon/dist/index.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'real_resources', 'qb-core');
if (!fs.existsSync(path.join(root, 'fxmanifest.lua'))) {
  console.log('lua-fork-transform.test: SKIPPED — clone qb-core under real_resources/ to run');
  console.log('  git clone --depth 1 https://github.com/qbcore-framework/qb-core real_resources/qb-core');
  process.exit(0);
}
const factory = new LuaFactory();
const lua = await factory.createEngine();

let total = 0, ok = 0, failed = 0;
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(d, e.name));
    else if (e.name.endsWith('.lua')) {
      total++;
      const src = fs.readFileSync(path.join(d, e.name), 'utf8');
      const out = transformFiveMLua(src);
      // compile-only check (no execution)
      const r = lua.global.get('load')(out, '@' + e.name);
      if (r !== null && typeof r === 'function') ok++;
      else { failed++; console.log('COMPILE FAIL:', path.relative(root, path.join(d, e.name))); }
    }
  }
};
walk(root);
console.log(`qb-core .lua files: ${total}, compile OK after transform: ${ok}, failed: ${failed}`);
