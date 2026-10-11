// Smoke test: load REAL FiveM resources through the compat runtime (comma-separated, in order).
import { CfxCompatRuntime } from '../cfx/runtime.js';
import { makeMockAlt } from '../test/mock-alt.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const which = (process.argv[2] || 'qb-core').split(',');

const mock = makeMockAlt();
const rt = new CfxCompatRuntime(mock);
await rt.init();
for (const w of which) {
  try {
    await rt.loadResource(w.split('/').pop(), path.join(__dirname, '..', 'real_resources', ...w.split('/')));
    console.log(`>>> ${w}: LOADED OK`);
  } catch (e) {
    console.log(`>>> ${w}: LOAD FAILED — ${e && e.message ? e.message : e}`);
  }
}
process.exit(0);
