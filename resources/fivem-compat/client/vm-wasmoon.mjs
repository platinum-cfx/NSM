// Wasmoon VM adapter — Lua 5.4 in WebAssembly (same engine the server-side
// compat runtime uses). SAME adapter contract as vm-fengari.mjs.
//
// Role on the CLIENT: this is the FAST path. It is the default in the Node
// test harness (full fidelity with the server runtime) and can be enabled on
// the real alt:V client IF that client's JS sandbox permits WebAssembly +
// the emscripten environment (unverifiable in this sandbox — flagged in
// docs/CLIENT_COMPATIBILITY.md). fengari is the always-works baseline.

import wasmoonPkg from '../vendor/wasmoon/dist/index.cjs';
const { LuaFactory, LuaMultiReturn } = wasmoonPkg;

export function MULTIRETURN(values) {
  return LuaMultiReturn.of(...values);
}

// Convert wasmoon LuaTable proxies into plain JS (mirror of the server-side
// toPlain in cfx/runtime.js).
function toPlain(v, depth = 0) {
  if (v === null || v === undefined || depth > 6) return v;
  if (Array.isArray(v)) return v.map((x) => toPlain(x, depth + 1));
  if (typeof v === 'object') {
    // LuaTable proxy?
    if (typeof v.get === 'function' && typeof v.set === 'function') {
      const out = {};
      let hasVec = false;
      for (const k of ['x', 'y', 'z', 'w']) {
        try {
          const val = v.get(k);
          if (val !== null && val !== undefined) { out[k] = toPlain(val, depth + 1); hasVec = true; }
        } catch {}
      }
      if (hasVec) return out;
      if (typeof v.length === 'number') {
        const arr = [];
        for (let i = 1; i <= v.length; i++) {
          try { arr.push(toPlain(v.get(i), depth + 1)); } catch {}
        }
        return arr;
      }
      return out;
    }
    if (typeof v.length === 'number' && typeof v.call !== 'function') {
      const arr = [];
      for (let i = 0; i < v.length; i++) arr.push(toPlain(v[i], depth + 1));
      return arr;
    }
    const out = {};
    for (const k of Object.keys(v)) out[k] = toPlain(v[k], depth + 1);
    return out;
  }
  return v;
}

export function createWasmoonVM() {
  let engine = null;

  return {
    name: 'wasmoon',
    luaVersion: '5.4',

    async init() {
      const factory = new LuaFactory();
      engine = await factory.createEngine();
    },

    async doString(chunkName, source) {
      try {
        await engine.doString(source);
      } catch (e) {
        e.message = `${chunkName}: ${e.message}`;
        throw e;
      }
    },

    setGlobalFn(name, fn) {
      engine.global.set(name, (...args) => {
        const r = fn(...args.map((a) => toPlain(a)));
        if (r && r.__nsmMulti) return MULTIRETURN(r.values);
        // undefined pushes nil; null would CRASH wasmoon (its
        // PromiseTypeExtension does `null.then` on the default path)
        return r === null || r === undefined ? undefined : r;
      });
    },

    async callGlobal(name, ...args) {
      const fn = engine.global.get(name);
      if (typeof fn !== 'function') {
        throw new Error(`callGlobal: '${name}' is not a function`);
      }
      try {
        // NOTE: wasmoon LuaFunction extends Function, so fn.call(...) would
        // hit Function.prototype.call semantics and swallow the first arg
        // as `this`. Invoke directly instead.
        return toPlain(await fn(...args));
      } catch (e) {
        e.message = `${name}: ${e.message}`;
        throw e;
      }
    },

    toPlain(v) { return toPlain(v); },

    eval(source) { return this.doString('eval', source); },

    getGlobalValue(name) {
      return toPlain(engine.global.get(name));
    },
  };
}
