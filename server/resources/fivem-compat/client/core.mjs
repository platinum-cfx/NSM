// NSM FiveM client compatibility runtime — VM-agnostic core.
//
// This module hosts FiveM client-side Lua resources inside ANY JavaScript
// runtime that provides:
//   alt     — the alt:V client API object (real 'alt-client' module on the
//             player's machine, a mock in the Node test harness)
//   natives — the alt:V GTA natives module (real 'natives' module or mock)
//   vm      — a VM adapter (vm-fengari.mjs / vm-wasmoon.mjs)
//
// The Lua side (client-prelude.lua) provides the FiveM client API surface;
// this file provides the JS bridges the prelude calls into.
//
// Everything that touches a REAL game (rendering, streaming, actual native
// behavior) can only be verified on a real alt:V client — the harness tests
// the full logic pipeline (events, scheduling, marshalling, NUI routing)
// with mocks. See docs/CLIENT_COMPATIBILITY.md for the verification matrix.

// joaat — the GTA/FiveM string hash (duplicate of cfx/runtime.js; not
// imported from there because that module pulls in fs/path)

// cfx Lua transformer (pure module — no fs/path imports, so it is safe to
// pull in here; the client uses it via the __transformLua VM bridge)
import { transformFiveMLua } from '../cfx/lua-transform.js';
export function joaat(s) {
  s = String(s).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h += s.charCodeAt(i);
    h += h << 10; h |= 0;
    h ^= h >>> 6;
  }
  h += h << 3; h |= 0;
  h ^= h >>> 11;
  h += h << 15; h |= 0;
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// NUI page shim — injected BUILD-TIME into every ui_page html file.
// Runs inside the webview (CEF). Gives FiveM-style NUI pages:
//   - window 'message' events for SendNUIMessage
//   - fetch('https://<resource>/<callback>') for RegisterNUICallback
//   - GetParentResourceName()
// The webview's own 'alt' object (provided by alt:V) is the transport.
// ---------------------------------------------------------------------------
export function installNuiCompatPage(window, alt, resource) {
  const GETPARENT = function GetParentResourceName() { return resource; };
  if (!window.GetParentResourceName) window.GetParentResourceName = GETPARENT;

  // SendNUIMessage -> window 'message' event (FiveM semantics)
  alt.on('fivem:nui', (payloadJson) => {
    let data = payloadJson;
    try { data = JSON.parse(payloadJson); } catch (e) { /* pass through raw */ }
    window.dispatchEvent(new window.MessageEvent('message', { data: data }));
  });

  // RegisterNUICallback <- fetch('https://resource/name')
  const origFetch = window.fetch && window.fetch.bind(window);
  let nextToken = 1;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const m = /^https:\/\/([^\/]+)\/(.*)$/.exec(url);
    if (!m || m[1] !== resource) {
      return origFetch ? origFetch(input, init) : Promise.reject(new Error('fetch unavailable'));
    }
    const cbName = m[2];
    const token = resource + ':' + (nextToken++);
    const body = (init && init.body) || (input && input.body) || '';
    return new Promise(function (resolve, reject) {
      const timeout = window.setTimeout(function () {
        resolve(new window.Response('{}', { status: 200 }));
      }, 10000);
      alt.on('fivem:nuiResp:' + token, function (respJson) {
        window.clearTimeout(timeout);
        resolve(new window.Response(respJson === undefined || respJson === null ? '{}' : respJson, { status: 200 }));
      });
      alt.emit('fivem:nuiCb', cbName, typeof body === 'string' ? body : JSON.stringify(body || {}), token);
    });
  };
}

// Serialized form of the shim for build-time injection into html files.
export function nuiCompatScriptFor(resource) {
  return '<script>(' + installNuiCompatPage.toString() + ')(window, alt, ' + JSON.stringify(resource) + ');</script>';
}

// ---------------------------------------------------------------------------
// FiveM key strings (RegisterKeyMapping defaultParameter) -> alt KeyCode
// ---------------------------------------------------------------------------
const FIVEM_KEY_ALIASES = {
  'capslock': 'CapsLock', 'capital': 'CapsLock',
  'lshift': 'LShift', 'rshift': 'RShift', 'shift': 'LShift',
  'lctrl': 'LControl', 'lcontrol': 'LControl', 'rctrl': 'RControl', 'rcontrol': 'RControl', 'ctrl': 'LControl',
  'lalt': 'LAlt', 'lmenu': 'LAlt', 'ralt': 'RAlt', 'rmenu': 'RAlt', 'alt': 'LAlt',
  'grave': 'Backquote', 'tilde': 'Backquote',
  'enter': 'Enter', 'return': 'Enter',
  'backspace': 'Backspace', 'back': 'Backspace',
  'space': 'Space',
  'pageup': 'PageUp', 'prior': 'PageUp', 'pagedown': 'PageDown', 'next': 'PageDown',
  'insert': 'Insert', 'delete': 'Delete',
  'up': 'Up', 'down': 'Down', 'left': 'Left', 'right': 'Right',
  'scrolllock': 'ScrollLock', 'numlock': 'NumLock', 'pause': 'Pause',
};

// ---------------------------------------------------------------------------
// Core runtime
// ---------------------------------------------------------------------------
export function createFiveMClientRuntime({ vm, alt, natives, payload, preludeSrc, config = {}, log = console.log, logError = console.error }) {
  const state = {
    booted: false,
    webviews: new Map(),      // resource -> webview
    nuiTokens: 0,
    keybinds: [],             // { code, cmd }
    keydownWired: false,
    warnedNatives: new Set(),
    nativeIndex: null,        // lowercase name -> actual natives key
    kvp: new Map(),
    uiMissingWarned: new Set(),
  };

  function lowerIndex() {
    if (state.nativeIndex) return state.nativeIndex;
    const idx = new Map();
    for (const k of Object.keys(natives || {})) {
      const low = String(k).toLowerCase();
      if (!idx.has(low)) idx.set(low, k);
    }
    return (state.nativeIndex = idx);
  }

  // FiveM PascalCase (possibly with underscores, e.g. GetGroundZFor_3dCoord)
  // -> alt natives lowerCamelCase key
  function resolveNativeName(name) {
    const n = String(name);
    if (typeof natives[n] === 'function') return n;
    const stripped = n.replace(/_/g, '').toLowerCase();
    const hit = lowerIndex().get(stripped);
    if (hit && typeof natives[hit] === 'function') return hit;
    return null;
  }

  function timerFn(fn) {
    return () => { try { fn(); } catch (e) { logError('[fivem-client] timer:', (e && e.message) || e); } };
  }

  // scheduler bridge: delay 0 -> next tick; >0 -> timeout
  function setTimeoutRes(resName, fn, ms) {
    const wrapped = timerFn(fn);
    if (Number(ms) <= 0) {
      if (typeof alt.everyTick === 'function') {
        const id = alt.everyTick(() => { alt.clearEveryTick(id); wrapped(); });
        return id;
      }
      return (globalThis.setTimeout || alt.setTimeout)(wrapped, 0);
    }
    const set = typeof alt.setTimeout === 'function' ? alt.setTimeout : globalThis.setTimeout;
    return set(wrapped, Number(ms));
  }

  function getWebview(resName) {
    if (state.webviews.has(resName)) return state.webviews.get(resName);
    const res = (payload.resources || []).find((r) => r.name === resName);
    const uiPage = res && res.uiPage;
    let wv;
    if (!uiPage) {
      if (!state.uiMissingWarned.has(resName)) {
        state.uiMissingWarned.add(resName);
        logError(`[fivem-client] ${resName}: NUI used but fxmanifest has no ui_page — messages dropped`);
      }
      wv = { emit() {}, focus() {}, unfocus() {}, on() {} };
    } else {
      const base = String(uiPage).replace(/\\/g, '/').split('/').pop();
      const url = `http://resource/ui/${resName}/${base}`;
      wv = new alt.WebView(url, true);
      wv.on('fivem:nuiCb', (cbName, body, token) => {
        try {
          vm.callGlobal('__nuiInvokeCb', resName, String(cbName), String(body || '{}'), String(token));
        } catch (e) {
          logError(`[fivem-client] nui callback dispatch failed: ${(e && e.message) || e}`);
        }
      });
    }
    state.webviews.set(resName, wv);
    return wv;
  }

  function wireKeydown() {
    if (state.keydownWired) return;
    state.keydownWired = true;
    alt.on('keydown', (code) => {
      for (const kb of state.keybinds) {
        if (kb.code === code) {
          try { vm.callGlobal('__execCommand', kb.cmd, '[]'); }
          catch (e) { logError(`[fivem-client] keybind command failed: ${(e && e.message) || e}`); }
        }
      }
    });
  }

  function keyCodeFor(keyStr) {
    const raw = String(keyStr || '').trim();
    const up = raw.toUpperCase();
    const KC = alt.KeyCode || {};
    const tryNames = [];
    if (/^F\d{1,2}$/.test(up) || /^[A-Z0-9]$/.test(up)) tryNames.push(up);
    const alias = FIVEM_KEY_ALIASES[raw.toLowerCase()];
    if (alias) tryNames.push(alias);
    for (const n of tryNames) {
      if (typeof KC[n] === 'number') return KC[n];
    }
    return null;
  }

  function callNative(name, args) {
    const resolved = resolveNativeName(name);
    if (!resolved) {
      if (!state.warnedNatives.has(name)) {
        state.warnedNatives.add(name);
        logError(`[fivem-client] native not found in alt natives module: ${name} (returns nil; further calls silent)`);
      }
      return null;
    }
    // expand vector-ish plain objects into separate x,y,z args (FiveM behavior)
    const flat = [];
    for (const a of args) {
      if (a && typeof a === 'object' && !Array.isArray(a)
          && typeof a.x === 'number' && typeof a.y === 'number'
          && (a.z === undefined || typeof a.z === 'number')
          && (a.w === undefined || typeof a.w === 'number')) {
        flat.push(a.x, a.y, a.z || 0);
        if (typeof a.w === 'number') flat.push(a.w);
      } else {
        flat.push(a);
      }
    }
    try {
      const r = natives[resolved](...flat);
      if (Array.isArray(r)) return { __nsmMulti: true, values: r };
      return r === undefined ? null : r;
    } catch (e) {
      logError(`[fivem-client] native ${name} threw: ${(e && e.message) || e}`);
      return null;
    }
  }

  function installBridges() {
    vm.setGlobalFn('__print', (...a) => log(...a));
    vm.setGlobalFn('__logError', (...a) => logError(...a));
    vm.setGlobalFn('__setTimeoutRes', (resName, fn, ms) => setTimeoutRes(resName, fn, ms));
    vm.setGlobalFn('__native', (name, ...args) => callNative(name, args));
    vm.setGlobalFn('__nativeLookup', (name) => (resolveNativeName(name) ? true : false));
    vm.setGlobalFn('__joaat', (s) => joaat(s));
    vm.setGlobalFn('__netEmitServer', (evName, argsJson) => {
      alt.emitServer('__fivem:net', String(evName), String(argsJson || '[]'));
    });
    vm.setGlobalFn('__stateEmitServer', (key, valueJson) => {
      if (typeof alt.emitServer === 'function') {
        alt.emitServer('__fivem:stateSet', String(key), String(valueJson));
      }
    });
    vm.setGlobalFn('__nuiSend', (resName, json) => { getWebview(resName).emit('fivem:nui', String(json)); });
    vm.setGlobalFn('__nuiFocus', (resName, focus, cursor) => {
      const wv = getWebview(resName);
      try {
        if (focus) wv.focus(); else wv.unfocus();
        if (typeof alt.showCursor === 'function') alt.showCursor(!!cursor);
      } catch (e) { logError(`[fivem-client] nui focus failed: ${(e && e.message) || e}`); }
    });
    vm.setGlobalFn('__nuiKeepInput', (resName, keep) => {
      // stored; full keep-input needs per-frame control suppression (documented gap)
      state.keepInput = !!keep;
    });
    vm.setGlobalFn('__nuiRespond', (token, json) => {
      const resName = String(token).split(':')[0];
      const wv = state.webviews.get(resName);
      if (wv) wv.emit('fivem:nuiResp:' + token, String(json === undefined || json === null ? '{}' : json));
    });
    vm.setGlobalFn('__registerKeybind', (cmdName, desc, key) => {
      const code = keyCodeFor(key);
      if (code === null) {
        logError(`[fivem-client] keybind for '${cmdName}': unmapped FiveM key '${key}'`);
        return;
      }
      if (alt.Utils && typeof alt.Utils.Keybind === 'function') {
        try {
          new alt.Utils.Keybind(code, () => {
            try { vm.callGlobal('__execCommand', String(cmdName), '[]'); }
            catch (e) { logError(`[fivem-client] keybind command failed: ${(e && e.message) || e}`); }
          });
          return;
        } catch (e) { /* fall through to keydown listener */ }
      }
      wireKeydown();
      state.keybinds.push({ code, cmd: String(cmdName) });
    });
    vm.setGlobalFn('__executeCommand', (text) => {
      alt.emitServer('__fivem:cmd', String(text));
    });
    vm.setGlobalFn('__getConvar', (k) => {
      const v = (config.convars || {})[String(k)];
      return v === undefined ? false : v;
    });
    vm.setGlobalFn('__kvpGet', (k) => { const v = state.kvp.get(String(k)); return v === undefined ? null : v; });
    vm.setGlobalFn('__kvpSet', (k, v) => { state.kvp.set(String(k), v === undefined ? null : v); });
    vm.setGlobalFn('__resourceState', (n) => {
      const known = (payload.resources || []).some((r) => r.name === String(n));
      return known ? 'started' : 'missing';
    });
    vm.setGlobalFn('__readResourceFile', (resName, rel) => {
      const r = (payload.resources || []).find((x) => x.name === String(resName));
      const fc = r && r.fileContents;
      if (!fc) return null;
      const key = String(rel).replace(/\\/g, '/').replace(/^\/+/, '');
      return Object.prototype.hasOwnProperty.call(fc, key) ? fc[key] : null;
    });
    // cfx Lua 5.4 -> standard Lua transform (env.load in the prelude calls this
    // so resource-loaded chunks support #/pointer/integer literal extensions)
    vm.setGlobalFn('__transformLua', (src) => transformFiveMLua(String(src)));
  }

  async function boot() {
    if (state.booted) throw new Error('already booted');
    state.booted = true;
    log(`[fivem-client] boot starting (${vm.name})`);

    try {
      await vm.init();
    } catch (e) {
      logError(`[fivem-client] VM init failed: ${(e && e.message) || e}`);
      throw e;
    }
    installBridges();
    await vm.doString('client-prelude', preludeSrc);

    // server -> client FiveM events and statebag pushes
    if (typeof alt.onServer === 'function') {
      alt.onServer('__fivem:net', (evName, argsJson) => {
        try { vm.callGlobal('__netDispatch', String(evName), String(argsJson || '[]')); }
        catch (e) { logError(`[fivem-client] net dispatch failed: ${(e && e.message) || e}`); }
      });
      alt.onServer('__fivem:state', (target, key, valueJson) => {
        try { vm.callGlobal('__stateChange', String(target), String(key), String(valueJson)); }
        catch (e) { logError(`[fivem-client] state dispatch failed: ${(e && e.message) || e}`); }
      });
      // handshake: server tells us our FiveM server id + current GlobalState
      alt.onServer('__fivem:init', (serverId, globalStateJson) => {
        try {
          vm.callGlobal('__setOwnServerId', Number(serverId));
          let gs = {};
          try { gs = JSON.parse(String(globalStateJson || '{}')) || {}; } catch {}
          for (const [k, v] of Object.entries(gs)) {
            vm.callGlobal('__stateChange', 'global', String(k), JSON.stringify(v));
          }
          log(`[fivem-client] handshake complete (server id ${serverId})`);
        } catch (e) { logError(`[fivem-client] init failed: ${(e && e.message) || e}`); }
      });
    }

    const resources = payload.resources || [];
    log(`[fivem-client] booting with ${resources.length} resource(s) on ${vm.name} (Lua ${vm.luaVersion})`);
    let okCount = 0, failedScripts = 0;
    for (const res of resources) {
      for (const script of res.scripts || []) {
        // one broken script must never kill the whole client boot (that
        // previously stopped __fivem:ready from ever reaching the server)
        try {
          const r = await vm.callGlobal('__loadClientScript', res.name, `@${res.name}/${script.path}`, script.source);
          if (r === false) { failedScripts++; logError(`[fivem-client] ${res.name}: script failed: ${script.path}`); }
        } catch (e) {
          failedScripts++;
          logError(`[fivem-client] ${res.name}: script threw: ${script.path}: ${(e && e.message) || e}`);
        }
      }
      okCount++;
    }
    log(`[fivem-client] boot complete: ${okCount}/${resources.length} resources${failedScripts ? `, ${failedScripts} script error(s) — see above` : ' running'}`);

    // tell the server we are up; it answers with __fivem:init (our server id
    // + global state + every player statebag snapshot)
    if (typeof alt.emitServer === 'function') {
      try { alt.emitServer('__fivem:ready', true); } catch {}
    }
  }

  return {
    boot,
    state,
    callGlobal: (name, ...args) => vm.callGlobal(name, ...args),
    getWebview,
    // test/harness helpers
    _resolveNativeName: resolveNativeName,
    _callNative: callNative,
    _nuiNextToken: (res) => `${res}:${++state.nuiTokens}`,
  };
}
