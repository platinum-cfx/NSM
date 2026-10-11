// Fengari VM adapter — pure-JS Lua 5.3 VM (https://fengari.io).
// This is the BASELINE client VM: it runs anywhere JS runs, with no
// WebAssembly and no filesystem, which is exactly what the alt:V client's
// sandboxed V8 guarantees. FiveM's own runtime is Lua 5.4; the 5.3 deltas
// that matter for resource code (to-be-closed vars, <const> in 5.4 — both
// rare) are documented in docs/CLIENT_COMPATIBILITY.md.
//
// Adapter contract (see vm-wasmoon.mjs for the same contract):
//   await vm.init()
//   vm.doString(chunkName, source)          — run a chunk in _G
//   vm.setGlobalFn(name, jsFn)              — expose a JS function to Lua
//   vm.callGlobal(name, ...plainJsArgs)     — call a global Lua function
//   vm.toPlain(v)                           — normalize a pushed value to plain JS
// Conventions:
//   - A JS function exposed to Lua receives plain JS args (Lua tables are
//     converted to plain objects/arrays; Lua functions to JS callables).
//   - If it returns a MULTIRETURN-wrapped array, the Lua caller sees
//     multiple return values; a plain array becomes a Lua table; other
//     values are pushed as single scalars.
//
// CRITICAL implementation note (bit us once, see git history): cfunctions
// called from inside a coroutine receive the COROUTINE's lua_State, not the
// main one. Every helper here therefore takes the state it operates on as
// an explicit parameter, and wrapJsFunction uses exactly the state Lua
// handed it for reading args and pushing results.

import fengari from '../vendor/fengari/src/fengari.js';

const { lua, lauxlib, lualib } = fengari;
const { to_luastring, to_jsstring } = fengari;

export function MULTIRETURN(values) {
  return { __nsmMulti: true, values };
}

export function createFengariVM() {
  const L = lauxlib.luaL_newstate(); // main state; cfunctions may run on others
  lualib.luaL_openlibs(L);

  const nextFnId = { n: 1 };

  // ---- Lua value (at stack index) -> plain JS ----
  function luaToJs(Ls, idx, depth = 0) {
    const t = lua.lua_type(Ls, idx);
    if (t === lua.LUA_TNIL) return null;
    if (t === lua.LUA_TNUMBER) return lua.lua_tonumber(Ls, idx);
    if (t === lua.LUA_TBOOLEAN) return lua.lua_toboolean(Ls, idx);
    if (t === lua.LUA_TSTRING) return to_jsstring(lua.lua_tolstring(Ls, idx));
    if (t === lua.LUA_TFUNCTION) {
      // keep a registry ref so JS can call back into Lua later; the callable
      // always invokes on the MAIN state (JS-initiated calls are serialized)
      lua.lua_pushvalue(Ls, idx);
      const ref = lauxlib.luaL_ref(Ls, lua.LUA_REGISTRYINDEX);
      nextFnId.n++;
      return (...args) => {
        lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, ref);
        for (const a of args) jsToLua(L, a);
        if (lua.lua_pcall(L, args.length, 1, 0) !== lua.LUA_OK) {
          const err = to_jsstring(lua.lua_tolstring(L, -1)) || 'lua error';
          lua.lua_pop(L, 1);
          throw new Error(err);
        }
        const r = luaToJs(L, -1);
        lua.lua_pop(L, 1);
        return r;
      };
    }
    if (t === lua.LUA_TTABLE) {
      if (depth > 6) return {};
      // lua_next needs an ABSOLUTE index: our pushes shift the top
      const abs = idx < 0 ? lua.lua_gettop(Ls) + 1 + idx : idx;
      const out = {};
      let n = 0;
      lua.lua_pushnil(Ls);
      while (lua.lua_next(Ls, abs) !== 0) {
        const key = luaToJs(Ls, -2, depth + 1);
        const val = luaToJs(Ls, -1, depth + 1);
        out[typeof key === 'number' ? String(key) : key] = val;
        n++;
        lua.lua_pop(Ls, 1); // pop value, keep key for lua_next
      }
      // if keys were exactly 1..n, return an array
      let isArray = n > 0;
      for (let i = 1; i <= n; i++) {
        if (out[String(i)] === undefined) { isArray = false; break; }
      }
      if (isArray) {
        const arr = [];
        for (let i = 1; i <= n; i++) arr.push(out[String(i)]);
        return arr;
      }
      return out;
    }
    return null; // userdata, thread, etc.
  }

  // ---- plain JS -> Lua value pushed on the stack ----
  function jsToLua(Ls, v, depth = 0) {
    if (v === null || v === undefined) { lua.lua_pushnil(Ls); return; }
    const t = typeof v;
    // Lua 5.3 integer subtype: push whole numbers as integers so ids/counts
    // behave like FiveM (tostring(7) == '7', not '7.0')
    if (t === 'number') {
      // fengari's lua_pushinteger is int32-checked; only small ints are safe.
      if (Number.isInteger(v) && Math.abs(v) <= 0x7fffffff) lua.lua_pushinteger(Ls, v);
      else lua.lua_pushnumber(Ls, v);
      return;
    }
    if (t === 'boolean') { lua.lua_pushboolean(Ls, v); return; }
    if (t === 'string') { lua.lua_pushliteral(Ls, v); return; }
    if (t === 'function') { lua.lua_pushcfunction(Ls, v); return; }
    if (Array.isArray(v)) {
      lua.lua_createtable(Ls, v.length, 0);
      v.forEach((item, i) => {
        jsToLua(Ls, item, depth + 1);
        lua.lua_rawseti(Ls, -2, i + 1);
      });
      return;
    }
    if (t === 'object') {
      if (depth > 6) { lua.lua_pushnil(Ls); return; }
      const keys = Object.keys(v);
      lua.lua_createtable(Ls, 0, keys.length);
      for (const k of keys) {
        if (v[k] === undefined) continue;
        lua.lua_pushliteral(Ls, k);
        jsToLua(Ls, v[k], depth + 1);
        lua.lua_rawset(Ls, -3);
      }
      return;
    }
    lua.lua_pushnil(Ls);
  }

  // push results of a JS bridge function; returns number of results
  function pushResult(Ls, r) {
    if (r === undefined || r === null) return 0;
    if (r && r.__nsmMulti) {
      for (const v of r.values) jsToLua(Ls, v);
      return r.values.length;
    }
    jsToLua(Ls, r);
    return 1;
  }

  function wrapJsFunction(fn) {
    const wrapped = (Lstate) => {
      const n = lua.lua_gettop(Lstate);
      const args = [];
      for (let i = 1; i <= n; i++) args.push(luaToJs(Lstate, i));
      try {
        const r = fn(...args);
        return pushResult(Lstate, r);
      } catch (e) {
        // surface JS errors as Lua errors
        lauxlib.luaL_error(Lstate, to_luastring(String((e && e.message) || e)));
        return 0;
      }
    };
    return wrapped;
  }

  return {
    name: 'fengari',
    luaVersion: '5.3',

    async init() { /* state created eagerly above */ },

    doString(chunkName, source) {
      const status = lauxlib.luaL_loadbuffer(L, to_luastring(source), null, to_luastring(chunkName));
      if (status !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || `load failed: ${chunkName}`;
        lua.lua_pop(L, 1);
        throw new Error(err);
      }
      if (lua.lua_pcall(L, 0, 0, 0) !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || `runtime error: ${chunkName}`;
        lua.lua_pop(L, 1);
        throw new Error(err);
      }
    },

    setGlobalFn(name, fn) {
      lua.lua_pushcfunction(L, wrapJsFunction(fn));
      lua.lua_setglobal(L, to_luastring(name));
    },

    callGlobal(name, ...args) {
      lua.lua_getglobal(L, to_luastring(name));
      if (lua.lua_type(L, -1) !== lua.LUA_TFUNCTION) {
        lua.lua_pop(L, 1);
        throw new Error(`callGlobal: '${name}' is not a function`);
      }
      for (const a of args) jsToLua(L, a);
      if (lua.lua_pcall(L, args.length, 1, 0) !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || 'lua error';
        lua.lua_pop(L, 1);
        throw new Error(`${name}: ${err}`);
      }
      const r = luaToJs(L, -1);
      lua.lua_pop(L, 1);
      return r;
    },

    // normalize a Lua-derived value that reached JS (already plain here)
    toPlain(v) { return v; },

    // eval helper for tests/debug
    eval(source) { return this.doString('eval', source); },

    // read a global variable's value (tests)
    getGlobalValue(name) {
      lua.lua_getglobal(L, to_luastring(name));
      const v = luaToJs(L, -1);
      lua.lua_pop(L, 1);
      return v;
    },
  };
}
