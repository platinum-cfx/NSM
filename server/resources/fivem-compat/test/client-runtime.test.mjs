// NSM FiveM CLIENT compatibility runtime — integration harness.
//
// What this proves (Part A + B, per VM):
//   the REAL server pipeline  (fxmanifest -> parse -> FiveM-fork transform
//   -> client payload)  feeds a REAL client runtime (Lua prelude + JS
//   bridges) which executes the demo resources' client scripts against a
//   mock alt:V client + mock natives module: threads/Wait, natives with
//   vector + multireturn marshalling, net events both directions, commands
//   + keybinds, NUI messages + callbacks + focus, statebags, convars,
//   cross-resource exports, warn-once missing natives.
//
// What this CANNOT prove (no GTA V / no real alt:V client in this sandbox):
//   actual native behavior, rendering, streaming, webview rendering, real
//   event transport. That is the on-device verification list in
//   docs/CLIENT_COMPATIBILITY.md.
//
// Part C tests the NUI in-page shim (the script injected into ui_page html
// at build time) against a mock window/alt.
import { CfxCompatRuntime } from '../cfx/runtime.js';
import { makeMockAlt } from './mock-alt.js';
import { createFiveMClientRuntime, installNuiCompatPage } from '../client/core.mjs';
import { createFengariVM } from '../client/vm-fengari.mjs';
import { createWasmoonVM } from '../client/vm-wasmoon.mjs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS: ${name}`); }
  else { failed++; console.error(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

// ---------------------------------------------------------------------------
// Part A: server-side payload pipeline (real runtime, mock server adapter)
// ---------------------------------------------------------------------------
console.log('== Part A: server pipeline builds the client payload ==');
{
  const mock = makeMockAlt();
  const rt = new CfxCompatRuntime(mock);
  await rt.init();
  await rt.loadResource('client-demo', path.join(ROOT, 'fivem_resources', 'client-demo'));
  await rt.loadResource('client-demo-lib', path.join(ROOT, 'fivem_resources', 'client-demo-lib'));

  check('A: client-demo loads server-side', rt.getResourceState('client-demo') === 'running');
  check('A: client scripts collected for the bundle',
    mock.logs.some((l) => l.includes('collected 1 client-side script(s)')));

  const payload = rt.buildClientPayload();
  const demo = payload.resources.find((r) => r.name === 'client-demo');
  const lib = payload.resources.find((r) => r.name === 'client-demo-lib');
  check('A: payload includes client-demo', !!demo);
  check('A: payload includes client-demo-lib', !!lib);
  check('A: ui_page captured', demo && demo.uiPage === 'html/index.html');
  check('A: files captured', demo && (demo.files || []).includes('html/index.html'));
  check('A: client script transformed (no backticks)',
    demo && !demo.scripts[0].source.includes('`'), demo && demo.scripts[0].source.slice(0, 80));
  check('A: compound assignment transformed',
    demo && demo.scripts[0].source.includes('state.ticks = state.ticks + (1)'));
  check('A: backtick table keys transformed',
    demo && demo.scripts[0].source.includes("['hud_title']") && !demo.scripts[0].source.includes('`'));
  check('A: chunk path preserved', demo && demo.scripts[0].path === 'client/main.lua');
}

// ---------------------------------------------------------------------------
// Part B: client runtime on both VMs
// ---------------------------------------------------------------------------
function makeMockNatives() {
  const calls = [];
  const nat = (name, fn) => (...args) => { calls.push({ name, args }); return fn(...args); };
  const natives = {
    playerPedId: nat('playerPedId', () => 42),
    getEntityCoords: nat('getEntityCoords', () => [1.5, 2.5, 3.5]),
    getGroundZFor3dCoord: nat('getGroundZFor3dCoord', () => [true, 12.5]),
    setEntityCoords: nat('setEntityCoords', () => true),
    drawRect: nat('drawRect', () => undefined),
    setEntityHeading: nat('setEntityHeading', () => undefined),
    // deliberately NO networkIsSessionStarted (warn-once path)
  };
  return { natives, calls };
}

function makeMockAltClient(natives) {
  const serverHandlers = {};   // onServer registrations
  const serverEmits = [];      // emitServer calls
  const keydownHandlers = [];
  const webviews = [];
  const logs = [];
  const errors = [];

  class MockWebView {
    constructor(url, isOverlay) {
      this.url = url;
      this.isOverlay = !!isOverlay;
      this.emits = [];
      this.listeners = {};
      this.focused = false;
      webviews.push(this);
    }
    emit(name, ...args) { this.emits.push([name, ...args]); }
    on(name, cb) { (this.listeners[name] = this.listeners[name] || []).push(cb); }
    focus() { this.focused = true; }
    unfocus() { this.focused = false; }
  }

  const alt = {
    log: (...a) => { logs.push(a.join(' ')); },
    logError: (...a) => { errors.push(a.join(' ')); },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    // NOTE: no everyTick -> exercises the setInterval(0) fallback path
    onServer: (name, cb) => { serverHandlers[name] = cb; },
    emitServer: (...args) => { serverEmits.push(args); },
    on: (name, cb) => { if (name === 'keydown') keydownHandlers.push(cb); },
    emit: (name, ...args) => { if (name === 'keydown') keydownHandlers.forEach((h) => h(args[0])); },
    WebView: MockWebView,
    KeyCode: { F5: 116, E: 69, G: 71 },
    showCursor: (b) => { alt.cursor = b; },
    // no Utils.Keybind -> exercises the keydown listener path
  };

  return { alt, serverHandlers, serverEmits, keydownHandlers, webviews, logs, errors };
}

async function buildPayloadForClientTest() {
  const mock = makeMockAlt();
  const rt = new CfxCompatRuntime(mock);
  await rt.init();
  await rt.loadResource('client-demo', path.join(ROOT, 'fivem_resources', 'client-demo'));
  await rt.loadResource('client-demo-lib', path.join(ROOT, 'fivem_resources', 'client-demo-lib'));
  return rt.buildClientPayload();
}

async function runClientSuite(vmFactory, vmName) {
  console.log(`== Part B: client runtime on ${vmName} ==`);
  const payload = await buildPayloadForClientTest();
  const preludeSrc = fs.readFileSync(path.join(ROOT, 'client/client-prelude.lua'), 'utf8');

  const { natives, calls } = makeMockNatives();
  const mockAlt = makeMockAltClient();
  const vm = vmFactory();
  const rt = createFiveMClientRuntime({
    vm,
    alt: mockAlt.alt,
    natives,
    payload,
    preludeSrc,
    config: { convars: { demo_convar: 'from-config' } },
    log: (...a) => mockAlt.logs.push(a.join(' ')),
    logError: (...a) => mockAlt.errors.push(a.join(' ')),
  });

  await rt.boot();
  await sleep(1100); // demo thread: 6 ticks x 120ms

  const getStateJson = async () => JSON.parse((await vm.callGlobal('__callExport', 'client-demo', 'getStateJson', '[]')) || '{}');

  check(`${vmName}: boot completes 2/2`, mockAlt.logs.some((l) => l.includes('boot complete: 2/2')));

  const st = await getStateJson();
  check(`${vmName}: thread loop ran to completion (Wait scheduler)`, st.ticks === 6, `ticks=${st.ticks}`);
  check(`${vmName}: onResourceStart fired for own resource`, st.sawOwnStart === true);
  check(`${vmName}: native getEntityCoords -> vector3 (.x/.z)`, st.lastX === 1.5 && st.lastZ === 3.5, `lastX=${st.lastX}`);
  check(`${vmName}: multireturn native spread (bool+float)`, st.groundOk === true && st.groundZ === 12.5, `ok=${st.groundOk} z=${st.groundZ}`);
  check(`${vmName}: convar from config`, st.convar === 'from-config', st.convar);
  check(`${vmName}: vector3 length (# operator)`, Math.abs(st.vecLen - Math.sqrt(10.5 ** 2 + 20.25 ** 2 + 30.125 ** 2)) < 1e-9, `len=${st.vecLen}`);
  check(`${vmName}: missing native returns nil (no crash)`, st.sessionStarted === null || st.sessionStarted === undefined, String(st.sessionStarted));
  check(`${vmName}: missing native warned exactly once`,
    mockAlt.errors.filter((l) => l.includes('NetworkIsSessionStarted')).length === 1);
  check(`${vmName}: natives actually invoked through the bridge`,
    calls.some((c) => c.name === 'playerPedId') && calls.some((c) => c.name === 'getEntityCoords'));

  // server -> client net event (and the client's ack back)
  mockAlt.serverHandlers['__fivem:net']('client-demo:notify', '["hello from server"]');
  await sleep(60);
  const st2 = await getStateJson();
  check(`${vmName}: net event handler ran`, st2.lastNotify === 'hello from server', String(st2.lastNotify));
  check(`${vmName}: TriggerServerEvent bridged`,
    mockAlt.serverEmits.some((e) => e[0] === '__fivem:net' && e[1] === 'client-demo:ack' && JSON.parse(e[2])[0] === 'hello from server'));

  // statebag push
  mockAlt.serverHandlers['__fivem:state']('player:7', 'dead', 'true');
  await sleep(40);
  const st3 = await getStateJson();
  check(`${vmName}: statebag change handler fired`, st3.sawDead === true && st3.sawDeadBag === '7', JSON.stringify(st3.sawDeadBag));

  // keybind -> command -> NUI open
  mockAlt.alt.emit('keydown', 116); // F5
  await sleep(60);
  const st4 = await getStateJson();
  check(`${vmName}: keybind executed the command (hud open)`, st4.hudOpen === true);
  check(`${vmName}: webview created lazily`, mockAlt.webviews.length === 1);
  const wv = mockAlt.webviews[0];
  check(`${vmName}: webview is an overlay on the ui_page`, wv.isOverlay === true && /ui\/client-demo\/index\.html$/.test(wv.url), wv.url);
  check(`${vmName}: SendNUIMessage reached the webview`, wv.emits.some((e) => e[0] === 'fivem:nui' && JSON.parse(e[1]).action === 'setVisible' && JSON.parse(e[1]).visible === true));
  check(`${vmName}: SetNuiFocus focused the webview`, wv.focused === true);
  check(`${vmName}: cursor shown`, mockAlt.alt.cursor === true);

  // NUI callback (page -> client -> response back to page)
  wv.listeners['fivem:nuiCb'].forEach((cb) => cb('nuiClosed', '{"reason":"clicked"}', 'client-demo:1'));
  await sleep(60);
  const st5 = await getStateJson();
  check(`${vmName}: NUI callback ran (hud closed)`, st5.hudOpen === false);
  check(`${vmName}: NUI focus released`, wv.focused === false);
  check(`${vmName}: callback response routed back to the page`,
    wv.emits.some((e) => e[0] === 'fivem:nuiResp:client-demo:1' && JSON.parse(e[1]).ok === true));
  check(`${vmName}: cross-resource client export called`, st5.libNotes === 1, `notes=${st5.libNotes}`);
  check(`${vmName}: callback body parsed in Lua`, st5.libNotes === 1 && mockAlt.errors.filter((l) => l.includes('nui')).length === 0);

  // second F5 press re-opens (command toggles)
  mockAlt.alt.emit('keydown', 116);
  await sleep(40);
  check(`${vmName}: keybind toggles again`, (await getStateJson()).hudOpen === true);
  mockAlt.alt.emit('keydown', 116);
  await sleep(40);
  check(`${vmName}: and closes`, (await getStateJson()).hudOpen === false);

  // script errors were isolated, not fatal
  check(`${vmName}: no unexpected script errors`,
    mockAlt.errors.filter((l) => !l.includes('NetworkIsSessionStarted')).length === 0,
    mockAlt.errors.filter((l) => !l.includes('NetworkIsSessionStarted')).join(' | '));
}

await runClientSuite(createFengariVM, 'fengari (ships to client)');
await runClientSuite(createWasmoonVM, 'wasmoon (cross-validation)');

// ---------------------------------------------------------------------------
// Part C: NUI in-page shim (injected into ui_page html at build time)
// ---------------------------------------------------------------------------
console.log('== Part C: NUI in-page compat shim ==');
{
  const pageMessages = [];
  const pageEmits = [];
  const pageListeners = {};
  const pageAlt = {
    on: (name, cb) => { (pageListeners[name] = pageListeners[name] || []).push(cb); },
    emit: (...args) => { pageEmits.push(args); },
  };
  class MockMessageEvent {
    constructor(type, opts) { this.type = type; this.data = opts.data; }
  }
  class MockResponse {
    constructor(body, opts) { this.body = body; this.status = (opts && opts.status) || 200; }
    json() { return Promise.resolve(JSON.parse(this.body)); }
  }
  let tokenSeq = 0;
  const win = {
    MessageEvent: MockMessageEvent,
    Response: MockResponse,
    dispatchEvent: (e) => { pageMessages.push(e); },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    addEventListener: () => {},
  };

  installNuiCompatPage(win, pageAlt, 'client-demo');

  check('C: GetParentResourceName injected', win.GetParentResourceName() === 'client-demo');

  // SendNUIMessage -> window 'message'
  (pageListeners['fivem:nui'] || []).forEach((cb) => cb('{"action":"setVisible","visible":true}'));
  check('C: SendNUIMessage -> message event with parsed data',
    pageMessages.length === 1 && pageMessages[0].data.action === 'setVisible' && pageMessages[0].data.visible === true);

  // fetch('https://client-demo/nuiClosed') -> alt event; response routed back
  const p = win.fetch('https://client-demo/nuiClosed', { method: 'POST', body: '{"reason":"clicked"}' });
  await sleep(20);
  check('C: NUI fetch bridged to alt event',
    pageEmits.some((e) => e[0] === 'fivem:nuiCb' && e[1] === 'nuiClosed' && e[2] === '{"reason":"clicked"}'));
  check('C: fetch still pending until response', pageMessages.length === 1);
  // discover the token the shim generated and answer it
  const cbEmit = pageEmits.find((e) => e[0] === 'fivem:nuiCb');
  const token = cbEmit[3];
  (pageListeners['fivem:nuiResp:' + token] || []).forEach((cb) => cb('{"ok":true}'));
  const resp = await p;
  check('C: fetch resolves with the callback response', resp.status === 200 && (await resp.json()).ok === true);

  // foreign resource URL falls through
  check('C: other-resource URLs untouched (no alt event)',
    !pageEmits.some((e) => e[0] === 'fivem:nuiCb' && e[1] === 'other'));
}

console.log(`\n==== CLIENT RUNTIME RESULTS: ${passed} passed, ${failed} failed ====`);
process.exit(failed > 0 ? 1 : 0);
