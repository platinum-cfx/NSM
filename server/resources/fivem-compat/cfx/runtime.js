/**
 * NSM FiveM compatibility runtime (server-side) — v2
 * ---------------------------------------------------
 * Runs FiveM-style Lua resources inside the alt:V JS module by embedding a real
 * Lua 5.4 VM (vendored wasmoon, MIT) and implementing the documented Cfx server
 * API on top of alt:V. Implemented from public Cfx API documentation — no FiveM
 * source code is used (FiveM's repo is under the Rockstar Creator Platform
 * License).
 *
 * v2 adds: MySQL (mysql-async / oxmysql-style API, callback + .await),
 * cross-resource exports, player/entity statebags (synced meta), OneSync-style
 * entity natives (CreateVehicle & friends), plus a JSON marshal layer.
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

// Lua-side environment: threads + async awaits, events, commands, natives,
// convars, MySQL, exports, statebags, fxmanifest parsing, JSON.
const PRELUDE = `
-- ============ NSM FiveM compatibility prelude (v2) ============

-- ---------- minimal JSON (encode/decode) ----------
local __BS = string.char(92)
local function jstr(s)
  local out = {}
  for i = 1, #s do
    local c = s:sub(i, i)
    local b = string.byte(c)
    if c == '"' then out[#out+1] = __BS .. '"'
    elseif c == __BS then out[#out+1] = __BS .. __BS
    elseif b == 10 then out[#out+1] = __BS .. 'n'
    elseif b == 13 then out[#out+1] = __BS .. 'r'
    elseif b == 9 then out[#out+1] = __BS .. 't'
    elseif b < 32 then out[#out+1] = string.format(__BS .. 'u%04x', b)
    else out[#out+1] = c end
  end
  return '"' .. table.concat(out) .. '"'
end

local function jisArray(t)
  local count, maxk = 0, 0
  for k in pairs(t) do
    if type(k) ~= 'number' or k < 1 or k % 1 ~= 0 then return false end
    count = count + 1
    if k > maxk then maxk = k end
  end
  return count == maxk and count > 0
end

local function jenc(v)
  if v == nil then return 'null' end
  local t = type(v)
  if t == 'boolean' then return tostring(v) end
  if t == 'number' then
    if v % 1 == 0 and math.abs(v) < 2 ^ 53 then return string.format('%d', v) end
    return string.format('%.14g', v)
  end
  if t == 'string' then return jstr(v) end
  if t == 'table' then
    if jisArray(v) then
      local parts = {}
      for i = 1, #v do parts[i] = jenc(v[i]) end
      return '[' .. table.concat(parts, ',') .. ']'
    end
    local parts = {}
    for k, val in pairs(v) do parts[#parts+1] = jstr(tostring(k)) .. ':' .. jenc(val) end
    return '{' .. table.concat(parts, ',') .. '}'
  end
  return 'null'
end

__jsonEncode = function(v) return jenc(v) end

local function skipws(s, i)
  while i <= #s do
    local c = s:sub(i, i)
    if c == ' ' or c == '\\t' or c == '\\n' or c == '\\r' then i = i + 1 else break end
  end
  return i
end

local parseValue

local function parseString(s, i)
  i = i + 1
  local out = {}
  while i <= #s do
    local c = s:sub(i, i)
    if c == '"' then return table.concat(out), i + 1 end
    if c == '\\\\' then
      local e = s:sub(i+1, i+1)
      if e == 'n' then out[#out+1] = '\\n'; i = i + 2
      elseif e == 't' then out[#out+1] = '\\t'; i = i + 2
      elseif e == 'r' then out[#out+1] = '\\r'; i = i + 2
      elseif e == 'b' then out[#out+1] = '\\b'; i = i + 2
      elseif e == 'f' then out[#out+1] = '\\f'; i = i + 2
      elseif e == 'u' then
        local code = tonumber(s:sub(i+2, i+5), 16)
        if code >= 0xD800 and code < 0xDC00 and s:sub(i+6, i+6) == '\\\\' and s:sub(i+7, i+7) == 'u' then
          local low = tonumber(s:sub(i+8, i+11), 16)
          code = 0x10000 + (code - 0xD800) * 0x400 + (low - 0xDC00)
          out[#out+1] = utf8.char(code)
          i = i + 12
        else
          out[#out+1] = utf8.char(code)
          i = i + 6
        end
      else out[#out+1] = e; i = i + 2 end
    else out[#out+1] = c; i = i + 1 end
  end
  error('unterminated json string')
end

parseValue = function(s, i)
  i = skipws(s, i)
  local c = s:sub(i, i)
  if c == '{' then
    local t = {}
    i = skipws(s, i + 1)
    if s:sub(i, i) == '}' then return t, i + 1 end
    while true do
      i = skipws(s, i)
      local k, v
      k, i = parseString(s, i)
      i = skipws(s, i)
      if s:sub(i, i) ~= ':' then error('json: expected :') end
      v, i = parseValue(s, i + 1)
      if v ~= nil then t[k] = v end
      i = skipws(s, i)
      local d = s:sub(i, i)
      if d == ',' then i = i + 1
      elseif d == '}' then return t, i + 1
      else error('json: expected , or }') end
    end
  elseif c == '[' then
    local t = {}
    local n = 0
    i = skipws(s, i + 1)
    if s:sub(i, i) == ']' then return t, i + 1 end
    while true do
      local v
      v, i = parseValue(s, i)
      if v ~= nil then n = n + 1; t[n] = v end
      i = skipws(s, i)
      local d = s:sub(i, i)
      if d == ',' then i = i + 1
      elseif d == ']' then return t, i + 1
      else error('json: expected , or ]') end
    end
  elseif c == '"' then
    return parseString(s, i)
  elseif s:sub(i, i+3) == 'true' then return true, i + 4
  elseif s:sub(i, i+4) == 'false' then return false, i + 5
  elseif s:sub(i, i+3) == 'null' then return nil, i + 4
  else
    local j = i
    while j <= #s do
      if s:sub(j, j):match('[%-%+%.0-9eE]') then j = j + 1 else break end
    end
    local n = tonumber(s:sub(i, j - 1))
    if n then return n, j end
    error('json: bad token at ' .. i)
  end
end

__jsonDecode = function(s)
  if s == nil or s == 'null' then return nil end
  local v = parseValue(tostring(s), 1)
  return v
end

-- ---------- thread scheduler with async await support ----------
__coroutines = {}
__nextCoId = __nextCoId or 0

local __schedule
local function __handleYield(co, yielded)
  if coroutine.status(co) ~= 'suspended' then return end
  if yielded == '__cfx_await__' then return end
  if type(yielded) == 'table' and rawget(yielded, '__nsmPromise') ~= nil then
    yielded.__wait(function(...)
      local ok2, y2 = coroutine.resume(co, ...)
      if not ok2 then __logError('[thread] ' .. tostring(y2)) return end
      __handleYield(co, y2)
    end)
    return
  end
  __schedule(co, tonumber(yielded) or 0)
end

__schedule = function(co, delay)
  __setTimeout(function()
    local ok, yielded = coroutine.resume(co)
    if not ok then
      __logError('[thread] ' .. tostring(yielded))
    else
      __handleYield(co, yielded)
    end
  end, delay or 0)
end

function CreateThread(fn)
  if type(fn) ~= 'function' then return end
__schedule(coroutine.create(fn), 0)
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

-- await an async JS operation; JS later calls __asyncResume(coId, payloadJson)
function __awaitJs(callName, ...)
  local co = coroutine.running()
  if co == nil then
    error(callName .. ': .await can only be used inside CreateThread (same rule as FiveM)', 2)
  end
  __nextCoId = __nextCoId + 1
  local id = __nextCoId
  __coroutines[id] = co
  __asyncCall(id, callName, ...)
  local payload = coroutine.yield('__cfx_await__')
  return payload
end

function __asyncResume(id, payload)
  local co = __coroutines[id]
  if not co then return end
  __coroutines[id] = nil
  local ok, yielded = coroutine.resume(co, payload)
  if not ok then
    __logError('[async] ' .. tostring(yielded))
  else
    __handleYield(co, yielded)
  end
end

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
RegisterServerEvent = RegisterNetEvent

-- ---------- promises + Citizen.Await (oxmysql / QBCore style) ----------
promise = {}
function promise.new()
  local p = { state = 'pending', waiters = {} }
  rawset(p, '__nsmPromise', true)
  p.resolve = function(...)
    if p.state ~= 'pending' then return end
    p.state = 'resolved'
    local vals = table.pack(...)
    p.values = vals
    local ws = p.waiters
    p.waiters = {}
    for i = 1, #ws do ws[i](table.unpack(vals, 1, vals.n)) end
  end
  p.reject = function(err)
    if p.state ~= 'pending' then return end
    p.state = 'rejected'
    p.err = err
    local ws = p.waiters
    p.waiters = {}
    for i = 1, #ws do ws[i]() end
  end
  p.__wait = function(fn) table.insert(p.waiters, fn) end
  return p
end

function Citizen.Await(p)
  if type(p) ~= 'table' or rawget(p, '__nsmPromise') == nil then
    error('Citizen.Await: expected a promise (promise.new())', 2)
  end
  if p.state == 'pending' then
    coroutine.yield(p)
  end
  if p.state == 'rejected' then
    error(tostring(p.err), 2)
  end
  local vals = p.values
  if vals == nil then return end
  return table.unpack(vals, 1, vals.n)
end

-- ---------- HTTP (PerformHttpRequest) ----------
function PerformHttpRequest(url, cb, method, data, headers)
  __httpRequest(function(status, body, headersJson)
    cb(status, body, __jsonDecode(headersJson) or {})
  end, url, method or 'GET', data, jenc(headers or {}))
end

-- ---------- auto-stubs for the full Cfx native set ----------
-- names come from natives-stubs.lua (generated from the Cfx.re natives repo,
-- the same definitions FiveM builds from). Hand-implemented natives above win.
__stubWarned = {}
local function makeNativeStub(name)
  return function(...)
    if not __stubWarned[name] then
      __stubWarned[name] = true
      __print('[cfx-compat] warning: native ' .. name .. ' is not implemented on NSM yet, returning nil')
    end
    return nil
  end
end
function __installNativeStubs(names)
  local n = 0
  for i = 1, #names do
    local name = names[i]
    if rawget(_G, name) == nil then
      _G[name] = makeNativeStub(name)
      n = n + 1
    end
  end
  return n
end

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

-- ---------- MySQL (mysql-async / oxmysql style) ----------
MySQL = {}

local function qAwait(kind, query, params)
  local payload = __awaitJs('mysql:' .. kind, query, jenc(params or {}))
  local decoded = __jsonDecode(payload)
  if type(decoded) == 'table' and decoded.__cfxError then
    error('MySQL: ' .. tostring(decoded.message), 2)
  end
  return decoded
end

local function qCb(kind, query, params, cb)
  __asyncCallCallback(function(payload)
    local decoded = __jsonDecode(payload)
    if type(decoded) == 'table' and decoded.__cfxError then
      __logError('MySQL: ' .. tostring(decoded.message))
    end
    cb(decoded)
    return true
  end, 'mysql:' .. kind, query, jenc(params or {}))
end

MySQL.ready = function(cb) __mysqlReady(cb) end

-- each op is a callable table (like oxmysql): MySQL.query(...) or MySQL.query.await(...)
local function makeOp(kind)
  return setmetatable({
    await = function(query, params) return qAwait(kind, query, params) end,
  }, {
    __call = function(_, query, params, cb)
      if cb then qCb(kind, query, params, cb) else return qAwait(kind, query, params) end
    end,
  })
end

MySQL.query = makeOp('query')
MySQL.execute = makeOp('execute')
MySQL.scalar = makeOp('scalar')
MySQL.single = makeOp('single')
MySQL.insert = makeOp('insert')
MySQL.update = MySQL.execute
for _, k in ipairs({ 'query', 'execute', 'scalar', 'single', 'insert' }) do
  MySQL[k].sync = MySQL[k].await
end

MySQL.Async = {}
for _, k in ipairs({ 'query', 'execute', 'scalar', 'single', 'insert', 'update' }) do
  MySQL.Async[k] = function(query, params, cb) qCb(k, query, params, cb or function() end) end
end
MySQL.Async.fetchAll = MySQL.Async.query
MySQL.Async.fetchScalar = MySQL.Async.scalar
MySQL.Async.fetchSingle = MySQL.Async.single

-- ---------- exports (FiveM server style) ----------
__registeredExports = {}
function __defineExport(name, fn) __registeredExports[name] = fn end

function __invokeExportJson(name, argsJson)
  local fn = __registeredExports[name]
  if not fn then return 'null' end
  local args = __jsonDecode(argsJson) or {}
  local results = table.pack(fn(table.unpack(args, 1, #args)))
  local out = {}
  for i = 1, results.n do out[i] = results[i] end
  return jenc(out)
end

__exportsProxy = setmetatable({}, {
  __index = function(t, resName)
    local proxy
    proxy = setmetatable({}, {
      __index = function(_, expName)
        return function(...)
          local a = { ... }
          if #a > 0 and a[1] == proxy then table.remove(a, 1) end
          local resultJson = __callExport(resName, expName, jenc(a))
          local decoded = __jsonDecode(resultJson)
          if decoded == nil then return end
          return table.unpack(decoded, 1, #decoded)
        end
      end
    })
    rawset(t, resName, proxy)
    return proxy
  end,
  __call = function(_, name, fn)
    if type(name) ~= 'string' or type(fn) ~= 'function' then
      error("usage: exports('exportName', function(...) end)", 2)
    end
    __defineExport(name, fn)
  end,
})
exports = __exportsProxy

-- ---------- statebags (players + compat entities, via synced meta) ----------
local function stateProxy(getFn, setFn)
  return setmetatable({}, {
    __index = function(_, key) return __jsonDecode(getFn(key)) end,
    __newindex = function(_, key, value) setFn(key, jenc(value)) end,
  })
end

Player = function(src)
  local p = { src = src }
  setmetatable(p, {
    __index = function(_, k)
      if k == 'state' then
        return stateProxy(
          function(key) return __playerStateGet(p.src, key) end,
          function(key, v) __playerStateSet(p.src, key, v) end
        )
      end
    end,
  })
  return p
end

Entity = function(handle)
  local e = { handle = handle }
  setmetatable(e, {
    __index = function(_, k)
      if k == 'state' then
        return stateProxy(
          function(key) return __entityStateGet(e.handle, key) end,
          function(key, v) __entityStateSet(e.handle, key, v) end
        )
      end
    end,
  })
  return e
end

function AddStateBagChangeHandler(keyFilter, filter, fn)
  __registerStateHandler(keyFilter, filter, function(bag, key, valueJson)
    fn(bag, key, __jsonDecode(valueJson), false)
  end)
end

-- ---------- natives ----------
local function nativewrap(name)
  return function(...) return __native(name, ...) end
end
GetPlayerName = nativewrap('GetPlayerName')
DropPlayer = nativewrap('DropPlayer')
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

GetPlayerPed = function() return 0 end
GetPlayerFromServerId = function(src) return src end

-- OneSync-style entity natives (compat handles, backed by alt:V entities)
CreateVehicle = function(model, x, y, z, heading, isNetwork, netMission, p7)
  return __native('CreateVehicle', model, x, y, z, heading or 0.0)
end
DeleteEntity = nativewrap('DeleteEntity')
DoesEntityExist = nativewrap('DoesEntityExist')
SetEntityHeading = nativewrap('SetEntityHeading')
GetEntityHeading = function(...) return __native('GetEntityHeading', ...) + 0.0 end
GetEntityModel = nativewrap('GetEntityModel')
SetVehicleNumberPlateText = nativewrap('SetVehicleNumberPlateText')
GetVehicleNumberPlateText = nativewrap('GetVehicleNumberPlateText')
NetworkGetNetworkIdFromEntity = function(ent) return ent end
GetEntityFromNetworkId = function(netId) return netId end
NetworkDoesNetworkIdExist = function(netId) return DoesEntityExist(netId) end

function GetEntityCoords(ent)
  local c = __jsonDecode(__native('GetEntityCoordsJson', ent))
  return vector3(c.x, c.y, c.z)
end

function SetEntityCoords(ent, x, y, z, axe, aye, aze, clearTasks)
  return __native('SetEntityCoords', ent, x, y, z)
end

function vector3(x, y, z) return { x = x or 0.0, y = y or 0.0, z = z or 0.0 } end
function vector4(x, y, z, w) return { x = x or 0.0, y = y or 0.0, z = z or 0.0, w = w or 0.0 } end

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
function IsDuplicityVersion() return true end
function GetCurrentResourceName() return __currentResource end
function GetInvokingResource() return __currentResource end
function GetGameName() return 'fivem' end
function GetHashKey(s) return __joaat(s) end
function GetResourceState(res) if __resourceExists(res) then return 'started' end return 'missing' end
function LoadResourceFile(res, file) return __readResourceFile(res, file) end
function print(...) __print(...) end
function warn(...) __print('[warn] ', ...) end

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
// sent over alt:V events, which only serialize plain data.
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
    for (const k of Object.keys(v)) out[k] = toPlain(v[k], depth + 1);
    return out;
  }
  return v;
}

export class CfxCompatRuntime {
  /**
   * @param adapter platform bindings:
   *   log, logError,
   *   onClient(name, cb(player, ...args)),
   *   emitClient(playerId, name, ...args), emitAllClients(name, ...args),
   *   findPlayer(src), playerIds(), dropPlayer(p, reason), identifiers(p),
   *   convars {},
   *   mysql?: { query(sql, values) -> Promise<rows>, execute(sql, values) -> Promise<result> },
   *   createVehicle(model, x, y, z, heading) -> entityRef,
   *   deleteEntity(ref), entityCoords(ref) -> {x,y,z},
   *   setEntityCoords(ref, x, y, z), setEntityHeading(ref, h), entityHeading(ref),
   *   entityModel(ref), setPlate(ref, text), plate(ref),
   *   playerStateGet(src, key) -> json|null, playerStateSet(src, key, json),
   *   entityStateGet(ref, key) -> json|null, entityStateSet(ref, key, json),
   *   onStateChange(cb(target, key, valueJson))   // e.g. from syncedMetaChange
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.factory = null;
    this.engines = new Map();
    this.handlers = new Map();
    this.commands = new Map();
    this.convars = new Map(Object.entries(adapter.convars || {}));
    this.wiredNet = new Set();
    this.entities = new Map();     // compat handle -> { kind, ref }
    this.nextHandle = 0x100000;
    this.stateHandlers = [];       // { keyFilter, filter, resource, fn }
  }

  async init() {
    const { LuaFactory } = loadWasmoon();
    this.factory = new LuaFactory();
    if (typeof this.adapter.onStateChange === 'function') {
      this.adapter.onStateChange((target, key, valueJson) => this.dispatchStateChange(target, key, valueJson));
    }
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
    g.set('__httpRequest', (cb, url, method, data, headersJson) => {
      let headers = {};
      try { headers = JSON.parse(String(headersJson || '{}')); } catch {}
      const doHttp = this.adapter.http || ((u, o) => fetch(u, o));
      const meth = String(method || 'GET').toUpperCase();
      const opts = { method: meth, headers };
      if (data !== null && data !== undefined && meth !== 'GET') opts.body = String(data);
      Promise.resolve()
        .then(() => doHttp(String(url), opts))
        .then(async (r) => {
          let body = '';
          try { body = typeof r.text === 'function' ? await r.text() : String(r.body === null || r.body === undefined ? '' : r.body); } catch {}
          let hj = '{}';
          try { hj = JSON.stringify(r.headers || {}); } catch {}
          try { cb(r.status, body, hj); } catch (e) { this.logError('PerformHttpRequest callback:', e.message); }
        })
        .catch((e) => {
          try { cb(0, String(e && e.message ? e.message : e), '{}'); } catch {}
        });
    });

    // async ops (MySQL etc.)
    g.set('__asyncCall', (id, callName, ...args) => this.asyncCall(res, id, callName, args, null));
    g.set('__asyncCallCallback', (cb, callName, ...args) => { this.asyncCall(res, 0, callName, args, cb); });
    g.set('__mysqlReady', (cb) => {
      if (this.adapter.mysql) setTimeout(() => { try { cb(); } catch (e) { this.logError('MySQL.ready cb:', e.message); } }, 0);
      else setTimeout(() => { this.log('MySQL.ready fired but no database is configured (see mysql.json)'); try { cb(); } catch (e) { this.logError('MySQL.ready cb:', e.message); } }, 0);
    });

    // exports
    g.set('__callExport', (resName, expName, argsJson) => this.callExport(String(resName), String(expName), String(argsJson)));

    // statebags
    g.set('__playerStateGet', (src, key) => {
      const v = this.adapter.playerStateGet ? this.adapter.playerStateGet(src, String(key)) : null;
      return v === undefined ? null : v;
    });
    g.set('__playerStateSet', (src, key, json) => {
      if (this.adapter.playerStateSet) this.adapter.playerStateSet(src, String(key), String(json));
    });
    g.set('__entityStateGet', (handle, key) => {
      const e = this.entities.get(Number(handle));
      if (!e || !this.adapter.entityStateGet) return null;
      const v = this.adapter.entityStateGet(e.ref, String(key));
      return v === undefined ? null : v;
    });
    g.set('__entityStateSet', (handle, key, json) => {
      const e = this.entities.get(Number(handle));
      if (e && this.adapter.entityStateSet) this.adapter.entityStateSet(e.ref, String(key), String(json));
    });
    g.set('__registerStateHandler', (keyFilter, filter, fn) => {
      this.stateHandlers.push({ keyFilter: keyFilter || null, filter: filter || null, resource: res, fn });
    });

    await lua.doString(PRELUDE);

    // ---- native stubs (full 6.4k-name Cfx native set; hand-implemented ones win) ----
    try {
      const stubsSrc = fs.readFileSync(new URL('./natives-stubs.lua', import.meta.url), 'utf8');
      await lua.doString(`__stubCount = __installNativeStubs((function()\n${stubsSrc}\nend)())`);
      this.log(`native stubs installed: ${lua.global.get('__stubCount')}`);
    } catch (e) {
      this.logError(`native stub install failed: ${e && e.message ? e.message : e}`);
    }

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

    for (const rel of manifest.server_scripts || []) {
      const p = path.join(dir, rel);
      if (!fs.existsSync(p)) { this.logError(`missing server script: ${rel}`); continue; }
      await lua.doString(fs.readFileSync(p, 'utf8'));
    }

    this.log(`FiveM resource '${name}' loaded (${(manifest.server_scripts || []).length} server script(s))`);
    return res;
  }

  // ---------- async (MySQL) ----------
  asyncCall(res, id, callName, args, luaCallback) {
    const complete = (value) => {
      const json = JSON.stringify(value === undefined ? null : value);
      if (luaCallback) {
        try { luaCallback(json); } catch (e) { this.logError('mysql callback:', e.message); }
        return;
      }
      try {
        const g = res.lua.global;
        g.set('__resumeId', id);
        g.set('__resumePayload', json);
        res.lua.doStringSync('__asyncResume(__resumeId, __resumePayload)');
      } catch (e) { this.logError('async resume:', e.message); }
    };
    const fail = (message) => complete({ __cfxError: true, message });

    if (!callName.startsWith('mysql:')) return fail(`unknown async op ${callName}`);
    const kind = callName.slice(6);
    if (!this.adapter.mysql) return fail('no database configured — create server/fivem_resources/mysql.json (see README)');
    const sql = String(args[0]);
    let values;
    try { values = JSON.parse(String(args[1] || '{}')); } catch { values = {}; }

    const op = kind === 'execute' ? 'execute' : 'query';
    this.adapter.mysql[op](sql, values)
      .then((result) => {
        if (kind === 'query') return complete(result);
        if (kind === 'execute') return complete(result);
        if (kind === 'insert') return complete(result && result.insertId !== undefined ? result.insertId : 0);
        if (kind === 'scalar') {
          const row = Array.isArray(result) ? result[0] : null;
          if (!row) return complete(null);
          const firstKey = Object.keys(row)[0];
          return complete(row[firstKey]);
        }
        if (kind === 'single') return complete(Array.isArray(result) ? (result[0] || null) : result);
        complete(result);
      })
      .catch((e) => fail(e && e.message ? e.message : String(e)));
  }

  // ---------- exports ----------
  callExport(resName, expName, argsJson) {
    const target = this.engines.get(resName);
    if (!target) throw new Error(`exports: resource '${resName}' is not loaded`);
    const g = target.lua.global;
    g.set('__expName', expName);
    g.set('__expArgs', argsJson);
    let resultJson = 'null';
    try {
      target.lua.doStringSync('__exportResult = __invokeExportJson(__expName, __expArgs)');
      resultJson = g.get('__exportResult');
    } catch (e) {
      this.logError(`export '${resName}.${expName}' failed: ${e && e.message ? e.message : e}`);
    }
    return resultJson === null || resultJson === undefined ? 'null' : String(resultJson);
  }

  // ---------- statebags ----------
  dispatchStateChange(target, key, valueJson) {
    for (const h of this.stateHandlers) {
      if (h.keyFilter && h.keyFilter !== key) continue;
      try { h.fn(target, key, valueJson); }
      catch (e) { this.logError(`state handler on '${key}' failed: ${e && e.message ? e.message : e}`); }
    }
  }

  // ---------- events ----------
  wireNet(evName) {
    if (this.wiredNet.has(evName)) return;
    this.wiredNet.add(evName);
    this.adapter.onClient(evName, (player, ...args) => this.dispatchNet(evName, player, args));
  }

  invoke(h, args, sourceId) {
    const g = h.resource.lua.global;
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

  // Server lifecycle events (playerDropped, playerConnecting, ...) reach both
  // plain and net handlers, with `source` set to the affected player.
  fireLifecycle(evName, player, args = []) {
    const src = player && player.id !== undefined ? player.id : 0;
    for (const h of this.handlers.get(evName) || []) {
      h.eventName = evName;
      this.invoke(h, args, src);
    }
  }

  dispatchLocal(evName, args) {
    for (const h of this.handlers.get(evName) || []) {
      if (!h.isNet) { h.eventName = evName; this.invoke(h, args, null); }
    }
  }

  dispatchNet(evName, player, args) {
    const src = player && player.id !== undefined ? player.id : 0;
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

  // ---------- natives ----------
  callNative(res, name, args) {
    const a = this.adapter;
    switch (name) {
      case 'GetPlayerName': {
        const p = a.findPlayer(args[0]);
        return p && p.name ? p.name : '**Invalid**';
      }
      case 'GetPlayerCount': return a.playerIds().length;
      case 'GetPlayerIdByIndex': return a.playerIds()[Number(args[0])] ?? -1;
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

      // ---- OneSync-style entity natives ----
      case 'CreateVehicle': {
        const handle = this.nextHandle++;
        const ref = a.createVehicle(String(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), Number(args[4] || 0));
        if (!ref) return 0;
        this.entities.set(handle, { kind: 'vehicle', ref });
        return handle;
      }
      case 'DeleteEntity': {
        const e = this.entities.get(Number(args[0]));
        if (e) { a.deleteEntity(e.ref); this.entities.delete(Number(args[0])); }
        return true;
      }
      case 'DoesEntityExist': return this.entities.has(Number(args[0]));
      case 'GetEntityCoordsJson': {
        const e = this.entities.get(Number(args[0]));
        if (!e) return '{"x":0,"y":0,"z":0}';
        const c = a.entityCoords(e.ref) || { x: 0, y: 0, z: 0 };
        return JSON.stringify({ x: c.x || 0, y: c.y || 0, z: c.z || 0 });
      }
      case 'SetEntityCoords': {
        const e = this.entities.get(Number(args[0]));
        if (e && a.setEntityCoords) a.setEntityCoords(e.ref, Number(args[1]), Number(args[2]), Number(args[3]));
        return true;
      }
      case 'SetEntityHeading': {
        const e = this.entities.get(Number(args[0]));
        if (e && a.setEntityHeading) a.setEntityHeading(e.ref, Number(args[1]));
        return true;
      }
      case 'GetEntityHeading': {
        const e = this.entities.get(Number(args[0]));
        return e && a.entityHeading ? Number(a.entityHeading(e.ref)) || 0 : 0;
      }
      case 'GetEntityModel': {
        const e = this.entities.get(Number(args[0]));
        return e && a.entityModel ? a.entityModel(e.ref) : 0;
      }
      case 'SetVehicleNumberPlateText': {
        const e = this.entities.get(Number(args[0]));
        if (e && a.setPlate) a.setPlate(e.ref, String(args[1] || ''));
        return true;
      }
      case 'GetVehicleNumberPlateText': {
        const e = this.entities.get(Number(args[0]));
        return e && a.plate ? String(a.plate(e.ref) || '') : '';
      }
      default:
        throw new Error(`native '${name}' is not implemented in NSM cfx-compat yet`);
    }
  }
}
