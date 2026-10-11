/**
 * NSM FiveM compatibility runtime (server-side)
 * ---------------------------------------------
 * Runs FiveM-style Lua resources inside the alt:V JS module by embedding a real
 * Lua 5.4 VM (vendored wasmoon, MIT) and implementing the documented Cfx server
 * API on top of alt:V. Implemented from public Cfx API documentation — no
 * FiveM source code is used (FiveM's repo is under the Rockstar Creator
 * Platform License).
 *
 * What works: server-side Lua — events, net events, threads (Citizen.Wait),
 * commands, convars, a subset of server natives, fxmanifest.lua parsing.
 * What doesn't: client-side Lua (alt:V clients run JS, not this runtime),
 * C# resources, MySQL/oxmysql, statebags, OneSync server natives.
 */

import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';

const require = createRequire(import.meta.url);

function loadWasmoon() {
  return require('../vendor/wasmoon/dist/index.cjs');
}

// joaat — the GTA/FiveM string hash (GetHashKey)
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

// Lua-side environment: threads, events, natives, convars, manifest setters.
const PRELUDE = `
-- ============ NSM FiveM compatibility prelude ============

-- ---------- thread scheduler ----------
local function schedule(co, delay)
  __setTimeout(function()
    local ok, yielded = coroutine.resume(co)
    if not ok then
      __logError('[thread] ' .. tostring(yielded))
    elseif coroutine.status(co) == 'suspended' then
      schedule(co, tonumber(yielded) or 0)
    end
  end, delay or 0)
end

function CreateThread(fn)
  if type(fn) ~= 'function' then return end
  schedule(coroutine.create(fn), 0)
end

function CitizenWait(ms) return coroutine.yield(ms or 0) end
Wait = CitizenWait
Citizen = { Wait = CitizenWait, CreateThread = CreateThread }

function SetTimeout(ms, fn)
  local co = coroutine.create(fn)
  __setTimeout(function()
    local ok, err = coroutine.resume(co)
    if not ok then __logError('[setTimeout] ' .. tostring(err)) end
  end, ms or 0)
  return 0
end
function ClearTimeout() end
function SetInterval() __logError('SetInterval is not supported yet') end
function ClearInterval() end

-- ---------- events ----------
function AddEventHandler(name, fn) __registerHandler(name, fn, false) end
function RegisterNetEvent(name, fn)
  if type(fn) == 'function' then __registerHandler(name, fn, true)
  else __declareNetEvent(name) end
end
function on(name, fn) __registerHandler(name, fn, true) end
function TriggerEvent(name, ...) __triggerLocal(name, ...) end
function TriggerClientEvent(name, target, ...) __triggerClient(name, target, ...) end
function TriggerServerEvent() error('TriggerServerEvent can only be used on the client', 2) end
function CancelEvent() end
function WasEventCanceled() return false end

-- ---------- commands ----------
__commandFns = {}
function RegisterCommand(name, fn, restricted)
  __commandFns[tostring(name)] = fn
  __registerCommand(tostring(name))
end
function __dispatchCommand(name, src, argString)
  local fn = __commandFns[name]
  if not fn then return false end
  local args = {}
  for word in string.gmatch(argString or '', '%S+') do table.insert(args, word) end
  local prev = source
  source = src
  local ok, err = pcall(fn, src, args, ('/%s %s'):format(name, argString or ''))
  source = prev
  if not ok then __logError('[command /' .. tostring(name) .. '] ' .. tostring(err)) end
  return true
end

-- ---------- natives ----------
local function nativewrap(name)
  return function(...) return __native(name, ...) end
end
GetPlayerName = nativewrap('GetPlayerName')
DropPlayer = nativewrap('DropPlayer')
GetPlayerPed = function() return 0 end
GetPlayerFromServerId = function(src) return src end
GetPlayerCount = function() return __native('GetPlayerCount') end
GetNumPlayerIndices = GetPlayerCount

function GetPlayers()
  local n = __native('GetPlayerCount')
  local t = {}
  for i = 0, n - 1 do t[i + 1] = __native('GetPlayerIdByIndex', i) end
  return t
end

function GetPlayerIdentifiers(src)
  local n = __native('GetIdentifierCount', src)
  local t = {}
  for i = 0, n - 1 do t[i + 1] = __native('GetIdentifierByIndex', src, i) end
  return t
end

function GetEntityCoords() return vector3(0.0, 0.0, 0.0) end
function DoesEntityExist() return false end

-- ---------- convars ----------
function GetConvar(k, d)
  local v = __getConvar(k)
  if v == nil then return d or '' end
  return v
end
function GetConvarInt(k, d)
  local v = __getConvar(k)
  if v == nil or tonumber(v) == nil then return d or 0 end
  return math.floor(tonumber(v))
end
SetConvar = function(k, v) __setConvar(k, tostring(v)) end
SetReplicatedConvar = SetConvar
GetConvarReplicated = GetConvar

-- ---------- misc / identity ----------
function vector3(x, y, z) return { x = x or 0.0, y = y or 0.0, z = z or 0.0 } end
function vector4(x, y, z, w) return { x = x or 0.0, y = y or 0.0, z = z or 0.0, w = w or 0.0 } end
function IsDuplicityVersion() return true end
function GetCurrentResourceName() return __currentResource end
function GetInvokingResource() return __currentResource end
function GetGameName() return 'fivem' end
function GetHashKey(s) return __joaat(s) end
function GetResourceState(res) if __resourceExists(res) then return 'started' end return 'missing' end
function LoadResourceFile(res, file) return __readResourceFile(res, file) end
function print(...) __print(...) end
function warn(...) __print('[warn] ', ...) end
function GetInvokingResource() return __currentResource end

exports = setmetatable({}, {
  __index = function() error("exports are not supported yet in NSM cfx-compat", 2) end
})
MySQL = setmetatable({}, {
  __index = function() error("MySQL/oxmysql is not available in NSM cfx-compat", 2) end
})

-- ---------- fxmanifest parsing ----------
__manifest = { server_scripts = {}, client_scripts = {} }
local function addscript(key, v)
  if type(v) == 'table' then
    for _, s in ipairs(v) do table.insert(__manifest[key], tostring(s)) end
  else
    table.insert(__manifest[key], tostring(v))
  end
end
fx_version = function(v) __manifest.fx_version = v end
game = function(v) __manifest.game = v end
author = function(v) __manifest.author = v end
description = function(v) __manifest.description = v end
version = function(v) __manifest.version = v end
server_script = function(v) addscript('server_scripts', v) end
server_scripts = function(v) addscript('server_scripts', v) end
client_script = function(v) addscript('client_scripts', v) end
client_scripts = function(v) addscript('client_scripts', v) end

function __manifestSummary()
  local function ser(v)
    if type(v) == 'table' then
      local parts = {}
      for _, item in ipairs(v) do parts[#parts + 1] = string.format('%q', tostring(item)) end
      return '[' .. table.concat(parts, ',') .. ']'
    end
    return string.format('%q', tostring(v))
  end
  local out = {}
  for _, k in ipairs({ 'fx_version', 'game', 'author', 'version', 'description' }) do
    if __manifest[k] ~= nil then out[#out + 1] = string.format('%q:%s', k, ser(__manifest[k])) end
  end
  out[#out + 1] = string.format('%q:%s', 'server_scripts', ser(__manifest.server_scripts))
  out[#out + 1] = string.format('%q:%s', 'client_scripts', ser(__manifest.client_scripts))
  return '{' .. table.concat(out, ',') .. '}'
end
`;

function fmt(v) {
  if (v === null || v === undefined) return 'nil';
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}

// Convert LuaTable proxies into plain JS values (best effort) so they can be
// sent over alt:V events, which only serializes plain data.
function toPlain(v, depth = 0) {
  if (v === null || v === undefined || depth > 6) return v;
  if (Array.isArray(v)) return v.map((x) => toPlain(x, depth + 1));
  if (typeof v === 'object') {
    const out = {};
    let hasKeys = false;
    for (const k of ['x', 'y', 'z', 'w']) {
      if (typeof v.get === 'function') {
        try { const val = v.get(k); if (val !== null && val !== undefined) { out[k] = toPlain(val, depth + 1); hasKeys = true; } } catch {}
      }
    }
    if (hasKeys) return out;
    if (typeof v.length === 'number') {
      const arr = [];
      for (let i = 1; i <= v.length; i++) {
        try { arr.push(toPlain(v.get(i), depth + 1)); } catch {}
      }
      return arr;
    }
    if (typeof v.toObject === 'function') { try { return v.toObject(); } catch {} }
    if (typeof v.toJSON === 'function') { try { return v.toJSON(); } catch {} }
    for (const k of Object.keys(v)) out[k] = toPlain(v[k], depth + 1);
    return out;
  }
  return v;
}

export class CfxCompatRuntime {
  /**
   * @param adapter platform bindings:
   *   log(msg), logError(msg),
   *   onClient(name, cb(player, ...args)),
   *   emitClient(playerId, name, ...args), emitAllClients(name, ...args),
   *   findPlayer(src) -> {id, name, socialId, hwidHash, ip} | null,
   *   playerIds() -> [ids], dropPlayer(src, reason)
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.factory = null;
    this.engines = new Map();   // resource name -> { name, dir, lua }
    this.handlers = new Map();  // event name -> [{ resource, fn, isNet }]
    this.commands = new Map();  // command name -> resource name
    this.convars = new Map(Object.entries(adapter.convars || {}));
    this.wiredNet = new Set();
  }

  async init() {
    const { LuaFactory } = loadWasmoon();
    this.factory = new LuaFactory();
  }

  log(...a) { this.adapter.log(a.map(fmt).join(' ')); }
  logError(...a) { this.adapter.logError(a.map(fmt).join(' ')); }

  async loadResource(name, dir) {
    if (!this.factory) throw new Error('call init() first');
    const lua = await this.factory.createEngine();
    const res = { name, dir, lua };
    this.engines.set(name, res);

    const g = lua.global;

    // ---- JS bridges ----
    g.set('__print', (...a) => this.log(`[${name}]`, ...a));
    g.set('__logError', (...a) => this.logError(`[${name}]`, ...a));
    g.set('__setTimeout', (fn, ms) => setTimeout(() => { try { fn(); } catch (e) { this.logError('[timer]', e.message); } }, Number(ms) || 0));
    g.set('__registerHandler', (evName, fn, isNet) => {
      if (!this.handlers.has(evName)) this.handlers.set(evName, []);
      this.handlers.get(evName).push({ resource: res, fn, isNet: !!isNet });
      if (isNet) this.wireNet(evName);
    });
    g.set('__declareNetEvent', (evName) => this.wireNet(evName));
    g.set('__triggerLocal', (evName, ...args) => this.dispatchLocal(evName, args));
    g.set('__triggerClient', (evName, target, ...args) => this.dispatchClient(evName, target, args));
    g.set('__registerCommand', (cmdName) => { this.commands.set(String(cmdName).toLowerCase(), res); });
    g.set('__native', (nativeName, ...args) => this.callNative(res, nativeName, args));
    g.set('__getConvar', (k) => (this.convars.has(k) ? this.convars.get(k) : null));
    g.set('__setConvar', (k, v) => { this.convars.set(String(k), String(v)); });
    g.set('__joaat', joaat);
    g.set('__currentResource', name);
    g.set('__readResourceFile', (resName, file) => {
      const r = this.engines.get(resName);
      if (!r) return null;
      try { return fs.readFileSync(path.join(r.dir, String(file)), 'utf8'); } catch { return null; }
    });
    g.set('__resourceExists', (n) => this.engines.has(String(n)));

    await lua.doString(PRELUDE);

    // ---- fxmanifest.lua ----
    const manifestPath = path.join(dir, 'fxmanifest.lua');
    let manifest = { server_scripts: [], client_scripts: [] };
    if (fs.existsSync(manifestPath)) {
      await lua.doString(fs.readFileSync(manifestPath, 'utf8'));
      manifest = JSON.parse(lua.global.get('__manifestSummary')());
    } else {
      const fallback = path.join(dir, 'server.lua');
      if (fs.existsSync(fallback)) manifest.server_scripts = ['server.lua'];
    }

    if ((manifest.client_scripts || []).length > 0) {
      this.log(`has ${manifest.client_scripts.length} client script(s) — IGNORED (server-side compat only)`);
    }

    // ---- server scripts ----
    for (const rel of manifest.server_scripts || []) {
      const p = path.join(dir, rel);
      if (!fs.existsSync(p)) { this.logError(`missing server script: ${rel}`); continue; }
      await lua.doString(fs.readFileSync(p, 'utf8'));
    }

    this.log(`FiveM resource '${name}' loaded (${(manifest.server_scripts || []).length} server script(s), ${this.commands.size} command(s) total)`);
    return res;
  }

  wireNet(evName) {
    if (this.wiredNet.has(evName)) return;
    this.wiredNet.add(evName);
    this.adapter.onClient(evName, (player, ...args) => this.dispatchNet(evName, player, args));
  }

  invoke(h, args, sourceId) {
    const g = h.resource.lua.global;
    // FiveM convention: source is 0 (console) outside net event contexts.
    // (Also: wasmoon cannot push JS null/undefined as nil, so never do.)
    let prev = 0;
    try { const p = g.get('source'); if (p !== null && p !== undefined) prev = p; } catch {}
    g.set('source', (sourceId === null || sourceId === undefined) ? 0 : sourceId);
    try {
      h.fn(...args);
    } catch (e) {
      this.logError(`handler '${h.eventName || ''}' in '${h.resource.name}' failed: ${e && e.message ? e.message : e}`);
    } finally {
      g.set('source', prev);
    }
  }

  dispatchLocal(evName, args) {
    for (const h of this.handlers.get(evName) || []) {
      if (!h.isNet) { h.eventName = evName; this.invoke(h, args, null); }
    }
  }

  dispatchNet(evName, player, args) {
    const src = player && player.id !== undefined ? player.id : null;
    for (const h of this.handlers.get(evName) || []) {
      if (h.isNet) { h.eventName = evName; this.invoke(h, args, src); }
    }
  }

  dispatchClient(evName, target, args) {
    const plain = args.map((a) => toPlain(a));
    if (target === -1 || target === undefined || target === null) {
      this.adapter.emitAllClients(evName, ...plain);
    } else {
      this.adapter.emitClient(target, evName, ...plain);
    }
  }

  /** Run a chat command previously registered via RegisterCommand. */
  runCommand(player, text) {
    const stripped = String(text || '').replace(/^\//, '');
    const parts = stripped.split(/\s+/);
    const cmd = (parts.shift() || '').toLowerCase();
    const res = this.commands.get(cmd);
    if (!res) return false;
    const argString = parts.join(' ');
    const src = player && player.id !== undefined ? player.id : 0;
    try {
      const g = res.lua.global;
      g.set('__cmdName', cmd);
      g.set('__cmdSrc', src);
      g.set('__cmdArgs', argString);
      res.lua.doStringSync('__dispatchCommand(__cmdName, __cmdSrc, __cmdArgs)');
    } catch (e) {
      this.logError(`command '/${cmd}' failed: ${e && e.message ? e.message : e}`);
    }
    return true;
  }

  callNative(res, name, args) {
    const a = this.adapter;
    switch (name) {
      case 'GetPlayerName': {
        const p = a.findPlayer(args[0]);
        return p && p.name ? p.name : '**Invalid**';
      }
      case 'GetPlayerCount':
        return a.playerIds().length;
      case 'GetPlayerIdByIndex':
        return a.playerIds()[Number(args[0])] ?? -1;
      case 'GetIdentifierCount':
      case 'GetIdentifierByIndex': {
        const p = a.findPlayer(args[0]);
        const ids = p ? a.identifiers(p) : [];
        return name === 'GetIdentifierCount' ? ids.length : (ids[Number(args[1])] || null);
      }
      case 'DropPlayer': {
        const p = a.findPlayer(args[0]);
        if (p) a.dropPlayer(p, args[1] || 'Kicked');
        return true;
      }
      default:
        throw new Error(`native '${name}' is not implemented in NSM cfx-compat yet`);
    }
  }
}
