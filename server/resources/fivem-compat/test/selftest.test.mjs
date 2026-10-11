// NSM ON-DEVICE SELFTEST — in-sandbox verification of the selftest resource
//
// fivem_resources/nsm-selftest is the resource the owner runs on the REAL
// Windows alt:V client (docs/WINDOWS_ONBOARDING.md). This harness proves the
// resource itself works by running it here against:
//   - the REAL server (index.js) with real qb-core + real MariaDB
//   - a REAL fengari client runtime (same as the bundle ships)
//   - a page-running webview stub: executes the REAL injected NUI shim and
//     the REAL page script from the resource, so the NUI round-trip check
//     (page fetch -> Lua callback -> page response) is exercised for real —
//     only CEF rendering is absent.
//
// Asserts the reported verdict: 0 failed, 0 skipped, >= 11 checks.
import * as fs from 'fs'; import * as os from 'os'; import * as path from 'path';
import { createFengariVM } from '../client/vm-fengari.mjs';
import { createFiveMClientRuntime } from '../client/core.mjs';
import { nuiCompatScriptFor } from '../client/core.mjs';

const ROOT = path.join(path.dirname(import.meta.url).replace('file://', ''), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra !== undefined ? ' — ' + String(extra) : ''}`); }
}
async function poll(fn, ms = 150, timeoutMs = 12000) {
  const start = Date.now();
  for (;;) {
    if (await fn()) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(ms);
  }
}

// ---------------------------------------------------------------- webview --
// Minimal "CEF": runs the injected shim + the page's <script> blocks with a
// DOM/fetch stub. Same contracts the real webview provides (alt.on/emit).
function makePageWebview(resourceDir) {
  return class PageWebview {
    constructor(url, isOverlay) {
      this.url = url;
      this.isOverlay = !!isOverlay;
      this.listeners = {};     // webview-side (core.mjs registers fivem:nuiCb)
      this.pageHandlers = {};  // page-side alt.on(...) — the shim's handlers
      const wv = this;

      // --- page-side alt object (transport between shim and the webview) ---
      const pageAlt = {
        on: (name, cb) => { (this.pageHandlers[name] = this.pageHandlers[name] || []).push(cb); },
        emit: (name, ...args) => {
          if (name === 'fivem:nuiCb') {
            // shim -> core.mjs: same event a real alt:V webview would emit
            for (const h of wv.listeners[name] || []) h(...args);
          }
          // fivem:nuiResp:<token> goes to the shim's own page handlers
          for (const h of wv.pageHandlers[name] || []) h(...args);
        },
      };

      // --- page window/document stubs ---
      const windowListeners = { load: [] };
      const window = {
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        clearTimeout: (id) => clearTimeout(id),
        addEventListener: (name, cb) => { (windowListeners[name] = windowListeners[name] || []).push(cb); },
        dispatchEvent: () => {},
        MessageEvent: class MessageEvent { constructor(type, opts) { this.type = type; this.data = opts && opts.data; } },
        Response: class Response { constructor(body) { this.body = body; } text() { return Promise.resolve(String(this.body)); } },
      };

      const document = {
        getElementById: () => ({ textContent: '' }),
      };
      const navigator = { userAgent: 'nsm-sandbox-page-webview' };

      // --- load the resource page + inject the shim (same as the build) ---
      const htmlPath = path.join(resourceDir, 'html', 'index.html');
      let html = fs.readFileSync(htmlPath, 'utf8');
      const shimScript = nuiCompatScriptFor(path.basename(resourceDir));
      html = html.replace(/<head[^>]*>/i, (m) => m + shimScript);

      // server -> page: webview.emit('fivem:nui', json) -> shim -> window
      this.emit = (name, ...args) => {
        for (const h of this.pageHandlers[name] || []) h(...args);
      };
      this.on = (name, cb) => { (this.listeners[name] = this.listeners[name] || []).push(cb); };
      this.focus = () => {}; this.unfocus = () => {};

      // run the shim + the page's inline scripts, then fire 'load'.
      // Real browsers expose window properties (fetch, GetParentResourceName)
      // as free-variable globals — mirror that for the page script (the shim
      // itself is written against its (window, alt, resource) parameters).
      const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
      for (const src of scripts) {
        try {
          new Function('window', 'document', 'navigator', 'alt', 'setTimeout',
            'clearTimeout', 'fetch', 'GetParentResourceName',
            src)
            .call({}, window, document, navigator, pageAlt, window.setTimeout,
              window.clearTimeout, window.fetch, window.GetParentResourceName);
        } catch (e) {
          console.error('  [page-webview] script error:', e.message);
        }
      }
      setTimeout(() => { for (const h of windowListeners.load || []) h(); }, 10);
    }
  };
}

// ------------------------------------------------------------------ setup --
const serverRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsm-st-'));
const fr = path.join(serverRoot, 'fivem_resources');
fs.mkdirSync(path.join(fr, 'oxmysql'), { recursive: true });
fs.writeFileSync(path.join(fr, 'oxmysql', 'fxmanifest.lua'), "fx_version 'cerulean'\ngame 'gta5'\n");
fs.symlinkSync(path.join(ROOT, '..', '..', 'resource_store', 'qb-core'), path.join(fr, 'qb-core'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'mp-demo'), path.join(fr, 'mp-demo'), 'dir');
fs.symlinkSync(path.join(ROOT, 'fivem_resources', 'nsm-selftest'), path.join(fr, 'nsm-selftest'), 'dir');
fs.writeFileSync(path.join(serverRoot, 'mysql.json'), JSON.stringify({ host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'fivem' }));

const nm = path.join(ROOT, 'node_modules', 'alt-server');
fs.mkdirSync(nm, { recursive: true });
fs.writeFileSync(path.join(nm, 'package.json'), '{"name":"alt-server","type":"module","main":"index.js"}');
fs.writeFileSync(path.join(nm, 'index.js'), `import { makeAltServerMock } from '../../test/mock-alt-server.js';
export const instance = makeAltServerMock();
export const log = instance.alt.log; export const logError = instance.alt.logError;
export const Player = instance.alt.Player; export const Vector3 = instance.alt.Vector3; export const Vehicle = instance.alt.Vehicle;
export const on = instance.alt.on; export const onClient = instance.alt.onClient; export const emitClient = instance.alt.emitClient; export const emitAllClients = instance.alt.emitAllClients;
`);

process.chdir(serverRoot);
const { ready } = await import(path.join(ROOT, 'index.js'));
const runtime = await ready;
check('server booted', !!runtime);
check('nsm-selftest RUNNING', runtime.getResourceState('nsm-selftest') === 'running');
check('qb-core RUNNING', runtime.getResourceState('qb-core') === 'running');

const { instance } = await import('alt-server');
const payload = runtime.buildClientPayload();
const preludeSrc = fs.readFileSync(path.join(ROOT, 'client/client-prelude.lua'), 'utf8');

const ep = instance.connectPlayer({ id: 1, name: 'austi', socialId: 'soc-st', hwidHash: 'hwid-st', ip: '127.0.0.1' });
const alt = instance.makeClientAlt(ep, {
  // real page-running webview instead of the no-op stub
  WebView: makePageWebview(path.join(ROOT, 'fivem_resources', 'nsm-selftest')),
  KeyCode: { F7: 118 },   // real alt:V exposes KeyCode names — the default stub is {}
});
const vm = createFengariVM();
const rt = createFiveMClientRuntime({
  vm, alt,
  natives: {
    playerPedId: () => 42,
    getEntityCoords: () => [1034.2, -3141.6, 13.4],
    networkIsSessionStarted: () => true,
    shutdownLoadingScreenNui: () => true,
  },
  payload, preludeSrc, config: { convars: {} },
  log: (m) => instance.logs.push(`[client 1] ${m}`),
  logError: (m) => instance.errors.push(`[client 1] ${m}`),
});
await rt.boot();
check('join handshake delivered', await poll(() => ep.delivered.some((d) => d.name === '__fivem:init')));

// the selftest auto-runs 1.5s after boot and reports to the server
let report = null;
check('selftest report arrived at the server (auto-run)',
  await poll(async () => {
    const r = await runtime.callExportJsonAsync('nsm-selftest', 'GetLatestReport', []);
    if (r.ok && r.value && r.value[0]) { report = r.value[0]; return true; }
    return false;
  }));

if (!report) {
  console.error('no report — aborting');
  process.exit(1);
}

const byName = {};
for (const c of report.checks || []) byName[c.name] = c;
console.log(`  (report: ${report.summary.pass} pass / ${report.summary.fail} fail / ${report.summary.skip} skip)`);

check('verdict: 0 failed', report.summary.fail === 0,
  JSON.stringify((report.checks || []).filter((c) => !c.ok && !c.skipped)));
check('verdict: 0 skipped (page-running webview covers NUI here)', report.summary.skip === 0,
  JSON.stringify((report.checks || []).filter((c) => c.skipped)));
check('all expected checks present', [
  'coroutine + Wait loop (3x10ms)',
  'json encode/decode round-trip',
  'PlayerPedId() returns a ped handle',
  'GetEntityCoords(ped) returns vector3',
  'RegisterCommand + ExecuteCommand (local)',
  'GetConvar fallback value',
  'net event round-trip (ping -> server -> pong)',
  'replicated statebag -> authoritative server store',
  'SendNUIMessage',
  'NUI callback round-trip (page fetch)',
  'qb-core GetCoreObject() from client',
  'exports cross-resource call (self)',
].every((n) => byName[n] !== undefined), JSON.stringify(Object.keys(byName)));

check('NUI round-trip actually completed (page -> Lua -> page)',
  byName['NUI callback round-trip (page fetch)'] && byName['NUI callback round-trip (page fetch)'].ok === true,
  JSON.stringify(byName['NUI callback round-trip (page fetch)']));
check('statebag write reached the authoritative server store',
  byName['replicated statebag -> authoritative server store'] && byName['replicated statebag -> authoritative server store'].ok === true,
  JSON.stringify(byName['replicated statebag -> authoritative server store']));

const unexpected = instance.errors.filter((e) => !/not implemented on NSM yet|native not found/.test(e));
check('no unexpected client errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | '));

console.log(`\n==== SELFTEST RESOURCE RESULTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed ? 1 : 0);
