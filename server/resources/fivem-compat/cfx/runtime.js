/**
 * NSM FiveM compatibility runtime (server-side) — v3 (single VM, live exports)
 * -------------------------------------------------------------------------
 * Runs FiveM-style Lua resources inside the alt:V JS module by embedding a real
 * Lua 5.4 VM (vendored wasmoon, MIT) and implementing the documented Cfx server
 * API on top of alt:V. Implemented from public Cfx API documentation — no FiveM
 * source code is used (FiveM's repo is under the Rockstar Creator Platform
 * License).
 *
 * v3 architecture (one VM):
 *   - ONE wasmoon engine for the whole server, created in init().
 *   - The FiveM prelude (scheduler, events, natives, MySQL, JSON, statebags)
 *     is installed once into the shared _G.
 *   - Each resource gets its own environment table:
 *         setmetatable({}, { __index = _G })
 *     Scripts run via load(code, name, 't', env) — writes stay in the env
 *     (two resources can both define `Config` without clashing), reads fall
 *     through to the shared prelude.
 *   - Resource-scoped APIs (GetCurrentResourceName, AddEventHandler, exports,
 *     RegisterCommand, print, load, fxmanifest directives, ...) are installed
 *     as per-env closures by __makeEnv(name) so they always know which
 *     resource is executing.
 *   - Cross-resource exports are DIRECT LIVE CALLS inside the same VM:
 *     exports['qb-core']:GetCoreObject() returns the actual live table
 *     (functions included), not a JSON copy.
 *   - loadAll() loads resources in dependency order (manifest `dependencies`
 *     + @resource/ imports), with cycle detection and clear warnings.
 *   - Unsupported fxmanifest directives are accepted but REPORTED
 *     (no silent no-ops, no fake success).
 *
 * v2 history: MySQL (mysql-async / oxmysql-style API, callback + .await),
 * statebags (synced meta), OneSync-style entity natives, fork-syntax load()
 * wrap (backticks / ?. / compound assignment handled by lua-transform.js).
 */

import { createRequire } from 'module';
import { transformFiveMLua } from './lua-transform.js';
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
// Runs ONCE into the shared _G. Resource-scoped pieces live in __makeEnv.
const PRELUDE = `
-- ============ NSM FiveM compatibility prelude (v3, one VM) ============

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
  -- empty tables encode as [] (FiveM json.encode behavior)
  return count == maxk
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

__JSONNULL = {}  -- sentinel: JSON null inside arrays (Lua can't store nil)

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
      -- null array elements must NOT compact the array (arg positions matter)
      if v == nil then v = __JSONNULL end
      n = n + 1
      t[n] = v
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
  if s == nil or s == false or s == 'null' then return nil end
  local v = parseValue(tostring(s), 1)
  return v
end

-- expand a decoded args array (with __JSONNULL sentinels) back into varargs,
-- preserving explicit nil positions: [null, 5] -> (nil, 5)
local function __argsToVarargs(t)
  local n = #t
  for i = 1, n do
    if t[i] == __JSONNULL then t[i] = nil end
  end
  return table.unpack(t, 1, n)
end

-- ---------- fork-syntax-safe load() (_G context) ----------
-- Resources that compile code themselves get the per-env load installed by
-- __makeEnv; this _G-level wrap only serves prelude/_G context.
local __rawload = load
function load(chunk, chunkname, mode, env)
  if type(chunk) == 'string' then chunk = __transformLua(chunk) end
  -- forward only the args actually given: wasmoon's load treats an explicitly
  -- passed nil env as a real nil environment (standard Lua would use _G)
  if env ~= nil then return __rawload(chunk, chunkname, mode, env) end
  if mode ~= nil then return __rawload(chunk, chunkname, mode) end
  if chunkname ~= nil then return __rawload(chunk, chunkname) end
  return __rawload(chunk)
end

-- ---------- json / msgpack engine globals (FiveM Lua has these built in) ----------
json = {}
json.encode = function(v) return jenc(v) end
json.decode = function(s) return __jsonDecode(s) end
json.stringify = json.encode
json.parse = json.decode
msgpack = {}
msgpack.pack = function(v) return jenc(v) end
msgpack.unpack = function(s) return __jsonDecode(s) end

-- ---------- thread scheduler with async await support ----------
__coroutines = {}
__nextCoId = __nextCoId or 0
-- coroutine -> resource name (attribution for stopResource cleanup).
-- false = the resource was stopped; pending resumes for it are dropped.
__coResources = {}

local __schedule
local function __handleYield(co, yielded)
  if coroutine.status(co) ~= 'suspended' then return end
  if yielded == '__cfx_await__' then return end
  if type(yielded) == 'table' and rawget(yielded, '__nsmPromise') ~= nil then
    yielded.__wait(function(...)
      if __coResources[co] == false then return end
      local ok2, y2 = coroutine.resume(co, ...)
      if not ok2 then __logError('[thread] ' .. tostring(y2)) return end
      __handleYield(co, y2)
    end)
    return
  end
  __schedule(co, tonumber(yielded) or 0)
end

__schedule = function(co, delay)
  -- attributed timers let stopResource cancel pending work; nil = internal
  __setTimeoutRes(__coResources[co], function()
    if __coResources[co] == false then return end
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

-- FiveM runs every event handler inside its own coroutine, so handlers may
-- Wait() / await. JS-side event dispatch enters Lua through here.
-- IMPORTANT: handler functions are NEVER passed through JS (wasmoon would
-- wrap them in a JS-mediated proxy whose C-call boundary breaks yields);
-- they live in __handlerIds and JS dispatches by integer id.
__handlerIds = {}
__nextHandlerId = 0

function __registerHandlerEntry(evName, fn, isNet, resName)
  __nextHandlerId = __nextHandlerId + 1
  local id = __nextHandlerId
  __handlerIds[id] = { fn = fn, resource = resName, eventName = evName }
  __registerHandlerJs(evName, id, isNet, resName)
  return id
end

-- Resource stop/restart cleanup: drop its handler registry entries.
function __dropHandlersForResource(resName)
  for id, h in pairs(__handlerIds) do
    if h.resource == resName then __handlerIds[id] = nil end
  end
end

function __dispatchHandlerById(id, source, ...)
  local h = __handlerIds[id]
  if not h then return end
  local env = __envs[h.resource]
  local co = coroutine.create(function(...)
    local prev = env and env.source or nil
    if env then env.source = source or 0 end
    local results = table.pack(pcall(h.fn, ...))
    if env then env.source = prev end
    if not results[1] then error(tostring(results[2]), 0) end
    return table.unpack(results, 2, results.n)
  end)
  local ok, yielded = coroutine.resume(co, ...)
  if not ok then error(tostring(yielded), 0) end
  __handleYield(co, yielded)
end

-- JS -> Lua callbacks (MySQL callback form, etc.) get the same coroutine
-- treatment so they may Wait/await too.
function __runJsCallback(fn, ...)
  local co = coroutine.create(fn)
  local ok, yielded = coroutine.resume(co, ...)
  if not ok then error(yielded, 0) end
  __handleYield(co, yielded)
end

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
  if __coResources[co] == false then return end
  local ok, yielded = coroutine.resume(co, payload)
  if not ok then
    __logError('[async] ' .. tostring(yielded))
    return
  end
  __handleYield(co, yielded)
end

-- ---------- events (trigger side is shared; registration is per-env) ----------
function TriggerEvent(name, ...) __triggerLocal(name, ...) end
function TriggerClientEvent(name, target, ...) __triggerClient(name, target, ...) end
function TriggerServerEvent() error('TriggerServerEvent can only be used on the client', 2) end
function CancelEvent() end
function WasEventCanceled() return false end

-- ---------- engine functions (not natives; FiveM provides these globally) ----------
function ExecuteCommand(cmd) return __executeCommand(tostring(cmd)) end

local __aceWarned = false
function IsPlayerAceAllowed(src, ace)
  if not __aceWarned then
    __aceWarned = true
    __print('[cfx-compat] IsPlayerAceAllowed: ACE permissions not implemented yet — allowing all (permissive stub)')
  end
  return true
end

function SaveResourceFile(res, file, data, len) return false end
SetMapName = function(n) end
SetGameType = function(t) end

-- GlobalState: server-wide statebag shared across resources (backed by the runtime)
GlobalState = setmetatable({}, {
  __index = function(_, k) return __jsonDecode(__globalStateGet(k)) end,
  __newindex = function(_, k, v) __globalStateSet(k, jenc(v)) end,
})
function StartResource(res) return true end
function StopResource(res) return true end
function RestartResource(res) return true end

-- ---------- promises + Citizen.Await (oxmysql / QBCore style) ----------
promise = {}
function promise.new()
  local p = { state = 'pending', waiters = {} }
  rawset(p, '__nsmPromise', true)
  -- self-aware: callable as p:resolve(v) (qb-core/FiveM method syntax, self
  -- arrives as arg 1) AND as p.resolve(v) / resolve(v) (dot/callback style)
  p.resolve = function(a, ...)
    if p.state ~= 'pending' then return end
    p.state = 'resolved'
    local vals = (a == p) and table.pack(...) or table.pack(a, ...)
    p.values = vals
    p.value = vals.n >= 1 and vals[1] or nil   -- FiveM promise: .value = first
    local ws = p.waiters
    p.waiters = {}
    for i = 1, #ws do ws[i](table.unpack(vals, 1, vals.n)) end
  end
  p.reject = function(a, ...)
    if p.state ~= 'pending' then return end
    p.state = 'rejected'
    local err = (a == p) and select(1, ...) or a
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

-- JS-side callbacks are registered LUA-side by id and delivered through
-- __deliverJsCallback — Lua functions are NEVER passed through JS (wasmoon
-- would wrap them in a JS-mediated proxy whose C boundary breaks yields).
__jsCallbacks = {}
local function __registerJsCallback(fn)
  __nextCoId = __nextCoId + 1
  local id = __nextCoId
  __jsCallbacks[id] = fn
  return id
end

function __deliverJsCallback(id, ...)
  local fn = __jsCallbacks[id]
  if not fn then return end
  __jsCallbacks[id] = nil
  local co = coroutine.create(fn)
  local ok, yielded = coroutine.resume(co, ...)
  if not ok then
    __logError('[js callback] ' .. tostring(yielded))
    return
  end
  __handleYield(co, yielded)
end

-- ---------- HTTP (PerformHttpRequest) ----------
function PerformHttpRequest(url, cb, method, data, headers)
  local id = __registerJsCallback(function(status, body, headersJson)
    cb(status, body, __jsonDecode(headersJson) or {})
  end)
  __httpRequest(id, url, method or 'GET', data, jenc(headers or {}))
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

-- ---------- commands (per-resource registration; one dispatch table) ----------
__commandEntries = {}
function __registerCommandEntry(cmdName, fn, restricted, resName)
  __commandEntries[cmdName] = { fn = fn, env = __envs[resName], res = resName }
  __registerCommand(cmdName, resName)
end
function __dispatchCommand(name, src, argString)
  local entry = __commandEntries[name]
  if entry == nil then return false end
  local args = {}
  for word in string.gmatch(argString or '', '%S+') do table.insert(args, word) end
  local prev = entry.env.source
  entry.env.source = src
  local ok, err = pcall(entry.fn, src, args, ('/%s %s'):format(name, argString or ''))
  entry.env.source = prev
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
  local id = __registerJsCallback(function(payload)
    local decoded = __jsonDecode(payload)
    if type(decoded) == 'table' and decoded.__cfxError then
      __logError('MySQL: ' .. tostring(decoded.message))
      -- oxmysql: on error, transaction callbacks get false, others get nil
      if kind == 'transaction' then cb(false) else cb(nil) end
      return true
    end
    cb(decoded)
    return true
  end)
  __asyncCallCallbackId(id, 'mysql:' .. kind, query, jenc(params or {}))
end

-- ready callbacks run in their own thread (they may .await — FiveM semantics)
MySQL.ready = function(cb) __mysqlReady(function() CreateThread(cb) end) end

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
-- oxmysql prepared statements (qb-core player load path uses MySQL.prepare.await)
MySQL.prepare = makeOp('prepare')
for _, k in ipairs({ 'query', 'execute', 'scalar', 'single', 'insert', 'prepare' }) do
  MySQL[k].sync = MySQL[k].await
end

-- MySQL.transaction(queries, cb?) / MySQL.transaction.await(queries) —
-- oxmysql bulk transaction; returns boolean. queries: array of
-- { query = '...', params/values = ... } (or plain strings)
MySQL.transaction = {
  await = function(queries)
    return qAwait('transaction', jenc(queries or {}), nil)
  end,
}
MySQL.transaction.sync = MySQL.transaction.await
setmetatable(MySQL.transaction, {
  __call = function(_, queries, cb)
    local payload = jenc(queries or {})
    if cb then
      qCb('transaction', payload, nil, cb)
    else
      return qAwait('transaction', payload, nil)
    end
  end,
})

MySQL.Async = {}
for _, k in ipairs({ 'query', 'execute', 'scalar', 'single', 'insert', 'update', 'prepare' }) do
  MySQL.Async[k] = function(query, params, cb) qCb(k, query, params, cb or function() end) end
end
MySQL.Async.fetchAll = MySQL.Async.query
MySQL.Async.fetchScalar = MySQL.Async.scalar
MySQL.Async.fetchSingle = MySQL.Async.single

-- ---------- exports: LIVE cross-resource calls (one VM) ----------
-- __exportsRegistry[res][exportName] = function  (registered by __makeEnv)
-- __envs[res] = that resource's environment table
__exportsRegistry = {}
__envs = {}

-- JS-side entry (adapter code calling a Lua export); resources themselves use
-- the per-env exports proxy which calls functions DIRECTLY (live tables).
function __callExportJson(resName, expName, argsJson)
  local reg = __exportsRegistry[resName]
  local fn = reg and reg[expName]
  local tenv = __envs[resName]
  if fn == nil or tenv == nil then return 'null' end
  local args = __jsonDecode(argsJson) or {}
  local prevSource = tenv.source
  tenv.source = 0
  local results = table.pack(pcall(fn, __argsToVarargs(args)))
  tenv.source = prevSource
  if not results[1] then
    __logError("export '" .. resName .. '.' .. expName .. "' failed: " .. tostring(results[2]))
    return 'null'
  end
  local out = {}
  for i = 2, results.n do out[#out + 1] = results[i] end
  return jenc(out)
end

-- Same as __callExportJson, but the export runs in its own coroutine so it may
-- Wait()/MySQL.await; the JSON result is delivered to JS via __exportDone(id).
function __callExportJsonCo(resName, expName, argsJson, cbId)
  local reg = __exportsRegistry[resName]
  local fn = reg and reg[expName]
  local tenv = __envs[resName]
  if fn == nil or tenv == nil then __exportDone(cbId, false, '[]') return end
  local args = __jsonDecode(argsJson) or {}
  local prevSource = tenv.source
  tenv.source = 0
  local co = coroutine.create(function()
    local results = table.pack(pcall(fn, __argsToVarargs(args)))
    local out = {}
    for i = 2, results.n do out[#out + 1] = results[i] end
    __exportDone(cbId, results[1], jenc(out))
  end)
  local ok, yielded = coroutine.resume(co)
  tenv.source = prevSource
  if not ok then
    __logError("export '" .. resName .. '.' .. expName .. "' failed: " .. tostring(yielded))
    __exportDone(cbId, false, '[]')
    return
  end
  __handleYield(co, yielded)
end

-- ---------- statebags (players + compat entities, via synced meta) ----------
local function stateProxy(getFn, setFn)
  local proxy = {}
  setmetatable(proxy, {
    __index = function(_, key)
      -- FiveM statebag method API: state:set(key, value, replicated)
      if key == 'set' then return function(_, k, v, _) setFn(k, jenc(v)) end end
      if key == 'get' then return function(_, k) return __jsonDecode(getFn(k)) end end
      return __jsonDecode(getFn(key))
    end,
    __newindex = function(_, key, value) setFn(key, jenc(value)) end,
  })
  return proxy
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

-- AddStateBagChangeHandler is per-env (needs resource identity) — see __makeEnv

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

function GetPlayerIdentifierByType(src, idtype)
  local prefix = tostring(idtype or '') .. ':'
  local idens = GetPlayerIdentifiers(src)
  for i = 1, #idens do
    if tostring(idens[i]):sub(1, #prefix) == prefix then return idens[i] end
  end
  return false
end

GetPlayerPed = function() return 0 end
GetPlayerFromServerId = function(src) return src end
-- FiveM artifact 10188+ native; es_extended's boot guard checks for it.
-- Entity ownership is the server module's job on alt:V — no-op here.
SetEntityOrphanMode = function() return true end
-- ms since epoch is a fine stand-in for FiveM's uptime timer (esx_lib seeds
-- math.randomseed with it)
GetGameTimer = function() return math.floor(os.time() * 1000) end

function GetConvarInt(k, default)
  local v = tonumber(__getConvar(k))
  if v == nil then return tonumber(default) or 0 end
  return v
end
function GetConvarBool(k, default)
  local v = __getConvar(k)
  if v == false or v == nil then return default and true or false end
  return v == true or v == 'true' or v == '1'
end

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
  if v == nil or v == false then return d or '' end
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
function GetGameName() return 'fxserver' end
function GetHashKey(s) return __joaat(s) end
function joaat(s) return __joaat(s) end
function GetResourceState(res) return __resourceState(res) end
function GetResourcePath(res) return __getResourcePath(res) end
function GetNumResources() return __numResources() end
function GetResourceByIndex(i) return __resourceByIndex(i) end
function GetResourceByFindIndex(i) return __resourceByIndex(i) end
-- manifest metadata (version/author/description/... — scalar manifest fields)
function GetNumResourceMetadata(res, key) return __resourceMetadataScalar(res, key) ~= false and 1 or 0 end
function GetResourceMetadata(res, key, idx)
  if idx ~= nil and tonumber(idx) > 0 then return nil end
  return __resourceMetadataScalar(res, key)
end
-- server-side resource KVPs (file-backed — migration flags survive restarts)
function GetResourceKvpString(k) return __kvpGet(k) end
function GetResourceKvpInt(k) local v = __kvpGet(k) if v == false then return 0 end return math.floor(tonumber(v) or 0) end
function GetResourceKvpFloat(k) local v = __kvpGet(k) if v == false then return 0.0 end return tonumber(v) or 0.0 end
function SetResourceKvp(k, v) __kvpSet(k, tostring(v)) end
function SetResourceKvpInt(k, v) __kvpSet(k, tostring(math.floor(tonumber(v) or 0))) end
function SetResourceKvpFloat(k, v) __kvpSet(k, tostring(tonumber(v) or 0.0)) end
function DeleteResourceKvp(k) __kvpDelete(k) end
function SetConvarServerInfo(k, v) __setConvar('serverinfo_' .. tostring(k), tostring(v)) end
function LoadResourceFile(res, file) return __readResourceFile(res, file) end
-- GetCurrentResourceName / GetInvokingResource are PER-ENV (see __makeEnv)

-- ============ per-resource environment factory ============
-- Everything a resource script sees that must answer "which resource am I?"
-- is installed here as a closure over the resource name.
function __makeEnv(name)
  local env = {}
  setmetatable(env, { __index = _G })

  env.source = 0
  env.__resourceName = name

  -- identity
  env.GetCurrentResourceName = function() return name end
  env.GetInvokingResource = function() return name end

  -- print with resource prefix (matches FiveM's [resname] console prefixing)
  env.print = function(...) __print('[' .. name .. ']', ...) end
  env.warn = function(...) __print('[' .. name .. '] [warn]', ...) end

  -- env-forwarding load(): code a resource compiles itself (esx_lib's
  -- require, es_extended's loader) inherits THIS resource's environment and
  -- gets the FiveM-fork syntax transform applied.
  env.load = function(chunk, chunkname, mode, envArg)
    if type(chunk) == 'string' then chunk = __transformLua(chunk) end
    return __rawload(chunk, chunkname, mode or 'bt', envArg or env)
  end

  -- attributed threads/timers: coroutines created here carry the resource
  -- name, so stopResource can cancel their pending timers and drop late
  -- async resumes (MySQL callbacks etc.)
  env.CreateThread = function(fn)
    if type(fn) ~= 'function' then return end
    local co = coroutine.create(fn)
    __coResources[co] = name
    __schedule(co, 0)
  end
  env.SetTimeout = function(ms, fn)
    if type(fn) ~= 'function' then return 0 end
    local co = coroutine.create(fn)
    __coResources[co] = name
    __schedule(co, tonumber(ms) or 0)
    return 0
  end

  -- events (register with resource identity so source and error
  -- attribution land in the right env)
  local function reg(evName, fn, isNet)
    __registerHandlerEntry(evName, fn, isNet, name)
  end
  env.AddEventHandler = function(n, f) reg(n, f, false) end
  env.on = function(n, f) reg(n, f, true) end
  env.RegisterNetEvent = function(n, f)
    __declareNetEvent(n)
    if f ~= nil then reg(n, f, true) end
  end
  env.RegisterServerEvent = env.RegisterNetEvent

  -- commands
  env.RegisterCommand = function(cmdName, fn, restricted)
    __registerCommandEntry(tostring(cmdName), fn, restricted, name)
  end

  -- statebag handlers
  env.AddStateBagChangeHandler = function(keyFilter, filter, fn)
    __registerStateHandler(keyFilter, filter, function(bag, key, valueJson)
      fn(bag, key, __jsonDecode(valueJson), false)
    end, name)
  end

  -- exports (FiveM server style) — LIVE calls inside the single VM.
  -- exports('name', fn) defines an export of THIS resource;
  -- exports['other']:method(...) calls other's export directly with live
  -- values (tables and functions pass by reference, mutations are shared).
  __exportsRegistry[name] = {}
  env.exports = setmetatable({}, {
    __index = function(t, resName)
      local proxy
      proxy = setmetatable({}, {
        __index = function(_, expName)
          return function(...)
            local a = { ... }
            if #a > 0 and a[1] == proxy then table.remove(a, 1) end
            local tenv = __envs[resName]
            if tenv == nil then
              error("exports: resource '" .. tostring(resName) .. "' is not loaded", 2)
            end
            local fn = __exportsRegistry[resName][expName]
            if fn == nil then
              error("exports: '" .. tostring(resName) .. "' has no export '" .. tostring(expName) .. "'", 2)
            end
            -- FiveM semantics: the callee sees the caller's source
            local prevSource = tenv.source
            tenv.source = env.source
            local results = table.pack(pcall(fn, table.unpack(a, 1, #a)))
            tenv.source = prevSource
            if not results[1] then
              error("export '" .. tostring(resName) .. '.' .. tostring(expName) .. "' failed: " .. tostring(results[2]), 2)
            end
            return table.unpack(results, 2, results.n)
          end
        end,
      })
      rawset(t, resName, proxy)
      return proxy
    end,
    __call = function(_, expName, fn)
      if type(expName) ~= 'string' or type(fn) ~= 'function' then
        error("usage: exports('exportName', function(...) end)", 2)
      end
      __exportsRegistry[name][expName] = fn
    end,
  })

  -- fxmanifest directives: collected into THIS resource's manifest table
  local manifest = {
    server_scripts = {}, client_scripts = {}, shared_scripts = {}, dependencies = {},
    files = {},
  }
  env.__manifest = manifest
  env.__manifestIgnored = {}
  local function addscript(key, v)
    if type(v) == 'table' then
      for _, s in ipairs(v) do table.insert(manifest[key], tostring(s)) end
    else
      table.insert(manifest[key], tostring(v))
    end
  end
  local function adddep(v)
    if type(v) == 'table' then
      for _, d in ipairs(v) do manifest.dependencies[#manifest.dependencies + 1] = tostring(d) end
    else
      manifest.dependencies[#manifest.dependencies + 1] = tostring(v)
    end
  end
  env.fx_version = function(v) manifest.fx_version = v end
  env.game = function(v) manifest.game = v end
  env.author = function(v) manifest.author = v end
  env.description = function(v) manifest.description = v end
  env.version = function(v) manifest.version = v end
  env.lua54 = function(v) manifest.lua54 = v end
  env.name = function(v) manifest.name = v end
  env.legacyversion = function(v) manifest.legacyversion = v end
  env.shared_script = function(v) addscript('shared_scripts', v) end
  env.shared_scripts = function(v) addscript('shared_scripts', v) end
  env.server_script = function(v) addscript('server_scripts', v) end
  env.server_scripts = function(v) addscript('server_scripts', v) end
  env.client_script = function(v) addscript('client_scripts', v) end
  env.client_scripts = function(v) addscript('client_scripts', v) end
  env.dependency = function(v) adddep(v) end
  env.dependencies = function(v) adddep(v) end
  -- files/ui_page matter for the CLIENT payload (NUI pages); the rest have
  -- no server-side meaning and are accepted, reported as ignored
  local function addfile(v)
    if type(v) == 'table' then
      for _, f in ipairs(v) do manifest.files[#manifest.files + 1] = tostring(f) end
    else
      manifest.files[#manifest.files + 1] = tostring(v)
    end
  end
  env.files = function(v) addfile(v) end
  env.file = function(v) addfile(v) end
  env.ui_page = function(v) manifest.ui_page = tostring(v) end
  for _, d in ipairs({
    'provide', 'replace_script', 'escrow_ignore',
    'use_experimental_fxv2_oal', 'is_master_manifest',
  }) do
    env[d] = function(v) end
  end

  env.__manifestSummary = function()
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
      if manifest[k] ~= nil then out[#out + 1] = string.format('%q:%s', k, ser(manifest[k])) end
    end
    out[#out + 1] = string.format('%q:%s', 'shared_scripts', ser(manifest.shared_scripts))
    out[#out + 1] = string.format('%q:%s', 'server_scripts', ser(manifest.server_scripts))
    out[#out + 1] = string.format('%q:%s', 'client_scripts', ser(manifest.client_scripts))
    out[#out + 1] = string.format('%q:%s', 'dependencies', ser(manifest.dependencies))
    if manifest.ui_page ~= nil then
      out[#out + 1] = string.format('%q:%s', 'ui_page', ser(manifest.ui_page))
    end
    out[#out + 1] = string.format('%q:%s', 'files', ser(manifest.files))
    local ig = {}
    for k in pairs(env.__manifestIgnored) do ig[#ig + 1] = k end
    table.sort(ig)
    out[#out + 1] = string.format('%q:%s', 'ignored_directives', ser(ig))
    return '{' .. table.concat(out, ',') .. '}'
  end

  __envs[name] = env
  return env
end

-- ============ JS entry points ============
-- NOTE: envs are never marshalled across the JS boundary (wasmoon turns them
-- into js_proxy tables); every helper below takes a resource NAME and looks
-- the env up inside Lua.

-- Tear down a stopped/failed resource's Lua-side state. Called only from JS
-- cleanupResource() AFTER onResourceStop handlers have run.
function __teardownResource(resName)
  for co, rn in pairs(__coResources) do
    if rn == resName then __coResources[co] = false end
  end
  __dropHandlersForResource(resName)
  __exportsRegistry[resName] = nil
  __envs[resName] = nil
end

-- Swap a resource's source value; returns the previous value.
function __setSource(resName, v)
  local env = __envs[resName]
  if env == nil then return 0 end
  local prev = env.source or 0
  env.source = v
  return prev
end

-- Read a global from a resource's env (testing/debug; raw values only).
function __envGet(resName, key)
  local env = __envs[resName]
  if env == nil then return nil end
  return rawget(env, key)
end

function __manifestSummaryOf(resName)
  local env = __envs[resName]
  if env == nil then return '{}' end
  return env.__manifestSummary()
end

-- Run one (already-transformed) script chunk inside a resource env.
-- Errors propagate to JS (loadResource catches, logs, continues).
function __runScript(resName, code, chunkname)
  local env = __envs[resName]
  if env == nil then error("runScript: resource '" .. tostring(resName) .. "' has no environment", 0) end
  local fn, err = __rawload(code, chunkname, 't', env)
  if fn == nil then error(tostring(err), 0) end
  -- Run the chunk in a coroutine (NOT pcall): resource scripts may yield
  -- while loading (MySQL .await in esx migrations, Wait) — a pcall inside
  -- the JS->Lua call frame turns that into "yield across a C-call boundary".
  -- Errors still surface: the synchronous raise below for immediate ones,
  -- __handleYield / __asyncResume log the deferred ones.
  local co = coroutine.create(fn)
  __coResources[co] = resName
  local ok, yielded = coroutine.resume(co)
  if not ok then error(tostring(yielded), 0) end
  __handleYield(co, yielded)
  return true
end

-- Execute a fxmanifest.lua inside a resource env. Unknown directives are
-- accepted as no-ops but RECORDED in env.__manifestIgnored (surfaced via
-- __manifestSummary -> "ignored_directives") so the loader can warn instead
-- of silently pretending everything is supported.
function __runManifest(resName, code, chunkname)
  local env = __envs[resName]
  if env == nil then error("runManifest: resource '" .. tostring(resName) .. "' has no environment", 0) end
  local fn, err = __rawload(__transformLua(code), chunkname, 't', env)
  if fn == nil then error(tostring(err), 0) end
  setmetatable(env, {
    __index = function(t, k)
      local v = _G[k]
      if v ~= nil then return v end
      env.__manifestIgnored[k] = true
      return function() end
    end,
  })
  local ok, rerr = pcall(fn)
  setmetatable(env, { __index = _G })
  if not ok then error(tostring(rerr), 0) end
  return true
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
    this.lua = null;            // the ONE engine (v3)
    this.engines = new Map();   // name -> { name, dir, env, lua }  (kept name for compat)
    this.handlers = new Map();  // eventName -> [{ resource, fn, isNet }]
    this.commands = new Map();  // cmd -> resourceName
    // Server convar defaults. `onesync` reports 'on' because this layer IS
    // the OneSync equivalent here — entity natives are backed by real alt:V
    // entities and statebags by synced meta. es_extended's playerConnecting
    // gate rejects every connection when it reads 'off'/'legacy'.
    this.convars = new Map(Object.entries({ onesync: 'on', ...Object(adapter.convars || {}) }));
    this.wiredNet = new Set();
    this.entities = new Map();  // compat handle -> { kind, ref }
    this.timers = new Map();    // resourceName -> Set<timeout id> (stop cancels them)
    this.nextHandle = 0x100000;
    this.stateHandlers = [];    // { keyFilter, filter, resource, fn }
    this.globalState = new Map();
    this._exportCbs = new Map();
    this._exportCbNext = 0;
    // server-side resource KVPs (esx migration flags etc.) — file-backed so
    // they survive restarts, exactly like FiveM's server resource storage
    this.kvp = new Map();
    this.kvpPath = (adapter && adapter.kvpPath) || path.join(process.cwd(), 'fivem-compat-kvp.json');
  }

  async init() {
    const { LuaFactory } = loadWasmoon();
    this.factory = new LuaFactory();
    this.lua = await this.factory.createEngine();
    this.installBridges();

    // hydrate the persistent KVP store (missing/corrupt file = fresh store)
    try {
      const raw = JSON.parse(fs.readFileSync(this.kvpPath, 'utf8'));
      if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw)) this.kvp.set(String(k), v);
    } catch { /* fresh store */ }

    await this.lua.doString(PRELUDE);

    // ---- native stubs (full 6.4k-name Cfx native set; hand-implemented ones win) ----
    try {
      const stubsSrc = fs.readFileSync(new URL('./natives-stubs.lua', import.meta.url), 'utf8');
      await this.lua.doString(`__stubCount = __installNativeStubs((function()\n${stubsSrc}\nend)())`);
      this.log(`native stubs installed: ${this.lua.global.get('__stubCount')}`);
    } catch (e) {
      this.logError(`native stub install failed: ${e && e.message ? e.message : e}`);
    }

    if (typeof this.adapter.onStateChange === 'function') {
      this.adapter.onStateChange((target, key, valueJson) => this.dispatchStateChange(target, key, valueJson));
    }
  }

  // JS bridges installed ONCE on the single engine. Resource identity is
  // passed explicitly from the per-env Lua closures.
  installBridges() {
    const g = this.lua.global;
    g.set('__print', (...a) => this.log(...a));
    g.set('__logError', (...a) => this.logError(...a));
    g.set('__setTimeout', (fn, ms) => setTimeout(() => { try { fn(); } catch (e) { this.logError('[timer]', e.message); } }, Number(ms) || 0));
    g.set('__setTimeoutRes', (resName, fn, ms) => this.setTimeoutFor(resName, fn, Number(ms) || 0));
    g.set('__resourceState', (n) => {
      const r = this.engines.get(String(n));
      if (!r) return 'missing';
      const s = r.status || 'stopped';
      if (s === 'running') return 'started';  // FiveM vocabulary
      if (s === 'failed') return 'stopped';   // a failed start leaves it stopped
      return s;                               // starting | stopped
    });
    g.set('__registerHandlerJs', (evName, handlerId, isNet, resName) => {
      const resource = this.engines.get(String(resName));
      if (!resource) { this.logError(`event handler for '${evName}' registered by unknown resource '${resName}'`); return; }
      if (!this.handlers.has(evName)) this.handlers.set(evName, []);
      this.handlers.get(evName).push({ resource, handlerId, isNet: !!isNet });
      if (isNet) this.wireNet(evName);
    });
    g.set('__declareNetEvent', (evName) => this.wireNet(evName));
    g.set('__triggerLocal', (evName, ...args) => this.dispatchLocal(evName, args));
    g.set('__triggerClient', (evName, target, ...args) => this.dispatchClient(evName, target, args));
    g.set('__registerCommand', (cmdName, resName) => { this.commands.set(String(cmdName).toLowerCase(), String(resName)); });
    g.set('__native', (nativeName, ...args) => this.callNative(nativeName, args));
    g.set('__exportDone', (cbId, ok, json) => {
      const cb = this._exportCbs.get(Number(cbId));
      if (!cb) return;
      this._exportCbs.delete(Number(cbId));
      let value = null;
      try { value = JSON.parse(String(json || '[]')); } catch {}
      cb({ ok: !!ok, value: Array.isArray(value) ? value : [], error: ok ? null : String(json) });
    });
    g.set('__getConvar', (k) => (this.convars.has(k) ? this.convars.get(k) : false));
    g.set('__setConvar', (k, v) => { this.convars.set(String(k), String(v)); });
    g.set('__joaat', joaat);
    g.set('__readResourceFile', (resName, file) => {
      const r = this.engines.get(resName);
      if (!r) return false;
      try { return fs.readFileSync(path.join(r.dir, String(file)), 'utf8'); } catch { return false; }
    });
    g.set('__getResourcePath', (n) => { const r = this.engines.get(String(n)); return r ? r.dir : false; });
    g.set('__numResources', () => this.engines.size);
    g.set('__resourceByIndex', (i) => {
      const names = [...this.engines.keys()].sort();
      return names[Number(i)] ?? false;
    });
    g.set('__resourceMetadataScalar', (n, key) => {
      const r = this.engines.get(String(n));
      const m = r && r.manifest;
      if (!m) return false;
      const v = m[String(key)];
      return v === undefined || v === null ? false : String(v);
    });
    const kvpSave = () => {
      try {
        const o = {}; for (const [k, v] of this.kvp) o[k] = v;
        fs.writeFileSync(this.kvpPath, JSON.stringify(o, null, 2));
      } catch (e) { this.logError(`kvp persist failed: ${e && e.message ? e.message : e}`); }
    };
    g.set('__kvpGet', (k) => (this.kvp.has(String(k)) ? this.kvp.get(String(k)) : false));
    g.set('__kvpSet', (k, v) => { this.kvp.set(String(k), v); kvpSave(); });
    g.set('__kvpDelete', (k) => { this.kvp.delete(String(k)); kvpSave(); });
    g.set('__executeCommand', (cmd) => { this.log('ExecuteCommand:', String(cmd)); return true; });
    g.set('__transformLua', (src) => transformFiveMLua(String(src)));
    g.set('__globalStateGet', (k) => { const v = this.globalState.get(String(k)); return v === undefined ? false : v; });
    g.set('__globalStateSet', (k, json) => {
      this.globalState.set(String(k), String(json));
      this.dispatchStateChange('global', String(k), String(json));
    });
    g.set('__httpRequest', (cbId, url, method, data, headersJson) => {
      const cb = (status, body, headersJson) => {
        try { this.lua.global.get('__deliverJsCallback')(Number(cbId), String(status), String(body), String(headersJson)); }
        catch (e) { this.logError('http callback:', e.message); }
      };
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

    // async ops (MySQL etc.) — resume target is the single engine now
    g.set('__asyncCall', (id, callName, ...args) => this.asyncCall(id, callName, args, null));
    g.set('__asyncCallCallbackId', (cbId, callName, ...args) => {
      this.asyncCall(0, callName, args, { __luaCallbackId: Number(cbId) });
    });
    g.set('__mysqlReady', (cb) => {
      if (this.adapter.mysql) setTimeout(() => { try { cb(); } catch (e) { this.logError('MySQL.ready cb:', e.message); } }, 0);
      else setTimeout(() => { this.log('MySQL.ready fired but no database is configured (see mysql.json)'); try { cb(); } catch (e) { this.logError('MySQL.ready cb:', e.message); } }, 0);
    });

    // statebags
    g.set('__playerStateGet', (src, key) => {
      if (!this.adapter.playerStateGet) return false;
      const v = this.adapter.playerStateGet(src, String(key));
      return v === undefined || v === null ? false : v;
    });
    g.set('__playerStateSet', (src, key, json) => {
      if (this.adapter.playerStateSet) this.adapter.playerStateSet(src, String(key), String(json));
    });
    g.set('__entityStateGet', (handle, key) => {
      const e = this.entities.get(Number(handle));
      if (!e || !this.adapter.entityStateGet) return false;
      const v = this.adapter.entityStateGet(e.ref, String(key));
      return v === undefined || v === null ? false : v;
    });
    g.set('__entityStateSet', (handle, key, json) => {
      const e = this.entities.get(Number(handle));
      if (e && this.adapter.entityStateSet) this.adapter.entityStateSet(e.ref, String(key), String(json));
    });
    g.set('__registerStateHandler', (keyFilter, filter, fn, resName) => {
      const resource = this.engines.get(String(resName));
      this.stateHandlers.push({ keyFilter: keyFilter || null, filter: filter || null, resource, fn });
    });
  }

  log(...a) { this.adapter.log(a.map(fmt).join(' ')); }
  logError(...a) { this.adapter.logError(a.map(fmt).join(' ')); }

  // ---------- resource loading ----------
  // Phase 1: create the env + parse the manifest (no scripts run yet).
  async prepareResource(name, dir) {
    if (!this.lua) throw new Error('call init() first');
    const g = this.lua.global;
    g.get('__makeEnv')(name);
    const res = { name, dir, lua: this.lua, status: 'starting' };
    this.engines.set(name, res);

    let manifest = { server_scripts: [], client_scripts: [], shared_scripts: [], dependencies: [] };
    const manifestPath = path.join(dir, 'fxmanifest.lua');
    if (fs.existsSync(manifestPath)) {
      g.get('__runManifest')(name, fs.readFileSync(manifestPath, 'utf8'), '@' + name + '/fxmanifest.lua');
      manifest = JSON.parse(g.get('__manifestSummaryOf')(name));
      const ignored = manifest.ignored_directives || [];
      if (ignored.length > 0) {
        this.log(`fxmanifest of '${name}': unsupported directive(s) ignored (not implemented by NSM cfx-compat): ${ignored.join(', ')}`);
      }
    } else {
      const fallback = path.join(dir, 'server.lua');
      if (fs.existsSync(fallback)) manifest.server_scripts = ['server.lua'];
    }
    res.manifest = manifest;
    return res;
  }

  // Phase 2: run the resource's scripts (shared first, then server).
  async runResource(res) {
    const { name, dir, manifest } = res;
    // Collect transformed client+shared scripts for the client bundle (the
    // fivem-client resource ships them to players; see client/core.mjs).
    res.clientScripts = [];
    for (const rel of [...(manifest.shared_scripts || []), ...(manifest.client_scripts || [])]) {
      const files = this.resolveScripts(name, dir, rel);
      if (files === null) {
        this.logError(`client bundle: missing script '${rel}' in '${name}' (skipped)`);
        continue;
      }
      for (const p of files) {
        try {
          res.clientScripts.push({
            path: path.relative(dir, p).split(path.sep).join('/'),
            source: transformFiveMLua(fs.readFileSync(p, 'utf8')),
          });
        } catch (e) {
          this.logError(`client bundle: error reading ${path.relative(dir, p)}: ${e && e.message ? e.message : e}`);
        }
      }
    }
    if (res.clientScripts.length > 0) {
      this.log(`collected ${res.clientScripts.length} client-side script(s) for the client bundle`);
    }

    const g = this.lua.global;
    let failed = false;
    for (const rel of [...(manifest.shared_scripts || []), ...(manifest.server_scripts || [])]) {
      if (failed) break;
      const files = this.resolveScripts(name, dir, rel);
      if (files === null) { failed = true; break; }   // missing script file
      for (const p of files) {
        try {
          const code = transformFiveMLua(fs.readFileSync(p, 'utf8'));
          g.get('__runScript')(name, code, '@' + name + '/' + rel);
        } catch (e) {
          // FiveM semantics: a script error at startup fails the resource
          this.logError(`error in ${path.relative(dir, p)}: ${e && e.message ? e.message : e}`);
          failed = true;
          break;
        }
      }
    }

    if (failed) {
      // A resource is NEVER reported as running when initialization failed:
      // tear down whatever partially registered, mark it failed.
      res.status = 'failed';
      this.cleanupResource(name);
      this.logError(`FiveM resource '${name}' FAILED to start — not running (fix the error above, then: res restart ${name})`);
      return res;
    }

    res.status = 'running';
    this.log(`FiveM resource '${name}' loaded (${(manifest.shared_scripts || []).length} shared + ${(manifest.server_scripts || []).length} server script(s))`);
    this.dispatchLocal('onResourceStart', [name]);
    return res;
  }

  // ---------- lifecycle: stop / start / restart ----------
  // Remove everything a resource registered. Used by stopResource and by the
  // failed-start path. onResourceStop handlers must run BEFORE this.
  cleanupResource(name) {
    const set = this.timers.get(name);
    if (set) { for (const t of set) clearTimeout(t); this.timers.delete(name); }
    for (const [ev, list] of [...this.handlers]) {
      const keep = list.filter((h) => h.resource && h.resource.name !== name);
      if (keep.length) this.handlers.set(ev, keep);
      else this.handlers.delete(ev);
    }
    for (const [cmd, rn] of [...this.commands]) if (rn === name) this.commands.delete(cmd);
    this.stateHandlers = this.stateHandlers.filter((h) => !h.resource || h.resource.name !== name);
    try { this.lua.global.get('__teardownResource')(name); } catch (e) { this.logError('teardown:', e.message); }
  }

  stopResource(name) {
    const res = this.engines.get(name);
    if (!res || res.status === 'stopped' || res.status === 'failed') return false;
    // the resource's own (and others') onResourceStop handlers run while the
    // resource is still fully alive
    this.dispatchLocal('onResourceStop', [name]);
    this.cleanupResource(name);
    res.status = 'stopped';
    this.log(`FiveM resource '${name}' stopped`);
    return true;
  }

  async startResource(name) {
    const res = this.engines.get(name);
    if (!res) throw new Error(`startResource: unknown resource '${name}'`);
    if (res.status === 'running' || res.status === 'starting') return res;
    const fresh = await this.prepareResource(name, res.dir);
    return this.runResource(fresh);
  }

  async restartResource(name) {
    const res = this.engines.get(name);
    if (!res) throw new Error(`restartResource: unknown resource '${name}'`);
    if (res.status === 'running' || res.status === 'starting') this.stopResource(name);
    return this.startResource(name);
  }

  listResources() {
    return [...this.engines.values()].map((r) => ({ name: r.name, status: r.status || 'stopped', dir: r.dir }));
  }

  getResourceState(name) {
    const r = this.engines.get(name);
    return r ? (r.status || 'stopped') : 'missing';
  }

  // Resource-management console command: res [list|status|stop|start|restart]
  // Permission model: console (src 0) or adapter.isAdmin(src) — never a
  // client-supplied flag.
  handleAdminCommand(player, text) {
    const stripped = String(text || '').replace(/^\//, '').trim();
    if ((stripped.split(/\s+/)[0] || '').toLowerCase() !== 'res') return false;
    const src = player && player.id !== undefined ? player.id : 0;
    const isAdmin = src === 0 || (typeof this.adapter.isAdmin === 'function' && !!this.adapter.isAdmin(src));
    if (!isAdmin) {
      this.logError(`'res' commands require console or admin (src ${src})`);
      return true;
    }
    const parts = stripped.split(/\s+/);
    const sub = (parts[1] || 'list').toLowerCase();
    const arg = parts[2];
    if (sub === 'list') {
      const list = this.listResources();
      this.log(`resources (${list.length}): ` + (list.map((r) => `${r.name}[${r.status}]`).join(' ') || '(none)'));
      return true;
    }
    if (sub === 'status') {
      if (!arg) { this.log('usage: res status <name>'); return true; }
      this.log(`resource '${arg}': ${this.getResourceState(arg)}`);
      return true;
    }
    if (sub === 'stop') {
      if (!arg) { this.log('usage: res stop <name>'); return true; }
      const ok = this.stopResource(String(arg));
      this.log(ok ? `stopped '${arg}'` : `could not stop '${arg}' (${this.getResourceState(arg)})`);
      return true;
    }
    if (sub === 'start' || sub === 'restart') {
      if (!arg) { this.log(`usage: res ${sub} <name>`); return true; }
      const op = sub === 'start' ? this.startResource(String(arg)) : this.restartResource(String(arg));
      op.catch((e) => this.logError(`${sub} '${arg}' failed: ${e && e.message ? e.message : e}`));
      return true;
    }
    this.log('usage: res [list|status <name>|stop <name>|start <name>|restart <name>]');
    return true;
  }

  // Timer that knows its resource: cancelled by stopResource; fires only
  // while the resource is live (backstop for races).
  setTimeoutFor(resName, fn, ms) {
    if (resName === null || resName === undefined) {
      return setTimeout(() => { try { fn(); } catch (e) { this.logError('[timer]', e.message); } }, ms);
    }
    const rn = String(resName);
    const t = setTimeout(() => {
      const set = this.timers.get(rn);
      if (set) { set.delete(t); if (!set.size) this.timers.delete(rn); }
      const res = this.engines.get(rn);
      if (!res || res.status !== 'running' && res.status !== 'starting') {
        this.log(`[timer] dropped for stopped resource '${rn}'`);
        return;
      }
      try { fn(); } catch (e) { this.logError('[timer]', e.message); }
    }, ms);
    if (!this.timers.has(rn)) this.timers.set(rn, new Set());
    this.timers.get(rn).add(t);
    return t;
  }

  // Load a single resource (prepare + run). Order is the caller's
  // responsibility — use loadAll() for dependency-ordered startup.
  async loadResource(name, dir) {
    const res = await this.prepareResource(name, dir);
    return this.runResource(res);
  }

  // Load many resources in dependency order. Dependencies come from manifest
  // `dependencies`/`dependency` directives and from @resource/ imports in
  // script lists. Cycles are reported, then broken by falling back to the
  // listed order for the resources involved.
  async loadAll(entries) {
    const prepared = [];
    for (const [name, dir] of entries) {
      try {
        prepared.push(await this.prepareResource(name, dir));
      } catch (e) {
        this.logError(`failed to load FiveM resource '${name}': ${e && e.message ? e.message : e}`);
      }
    }
    const ordered = this.orderResources(prepared);
    let running = 0, failedCount = 0;
    for (const res of ordered) {
      try {
        await this.runResource(res);
        if (res.status === 'running') running++;
        else failedCount++;
      } catch (e) {
        res.status = 'failed';
        this.logError(`failed to run FiveM resource '${res.name}': ${e && e.message ? e.message : e}`);
        failedCount++;
      }
    }
    this.log(`${running}/${prepared.length} FiveM resource(s) running` + (failedCount ? `, ${failedCount} FAILED` : ''));
    return ordered;
  }

  // Topological sort of prepared resources by their declared dependencies.
  orderResources(resources) {
    const byName = new Map(resources.map((r) => [r.name, r]));
    const deps = new Map(resources.map((r) => [r.name, new Set()]));
    for (const r of resources) {
      for (const d of (r.manifest && r.manifest.dependencies) || []) {
        const dn = String(d);
        if (byName.has(dn)) deps.get(r.name).add(dn);
        else this.log(`resource '${r.name}' depends on '${dn}' which is not loaded (continuing anyway)`);
      }
      for (const list of [r.manifest.shared_scripts, r.manifest.server_scripts]) {
        for (const rel of list || []) {
          const s = String(rel).trim();
          if (!s.startsWith('@')) continue;
          const slash = s.indexOf('/');
          const target = slash > 0 ? s.slice(1, slash) : s.slice(1);
          if (target === 'oxmysql' || target === 'mysql-async') continue; // native MySQL API
          if (byName.has(target)) deps.get(r.name).add(target);
        }
      }
    }
    const ordered = [];
    const done = new Set();
    let progress = true;
    while (ordered.length < resources.length && progress) {
      progress = false;
      for (const r of resources) {
        if (done.has(r.name)) continue;
        let ready = true;
        for (const d of deps.get(r.name)) {
          if (!done.has(d)) { ready = false; break; }
        }
        if (ready) { ordered.push(r); done.add(r.name); progress = true; }
      }
    }
    if (ordered.length < resources.length) {
      const cycle = resources.filter((r) => !done.has(r.name)).map((r) => r.name);
      this.logError(`dependency cycle detected between: ${cycle.join(', ')} — loading them in listed order`);
      for (const r of resources) if (!done.has(r.name)) ordered.push(r);
    }
    return ordered;
  }

  // Run an ad-hoc Lua chunk inside a resource's environment (testing/debug).
  async runLua(resName, code) {
    const res = this.engines.get(resName);
    if (!res) throw new Error(`runLua: resource '${resName}' is not loaded`);
    this.lua.global.get('__runScript')(resName, transformFiveMLua(code), '@runLua:' + resName);
    return true;
  }

  // Read a global from a resource's environment (testing/debug).
  envGet(resName, key) {
    return this.lua.global.get('__envGet')(String(resName), String(key));
  }

  // Client payload consumed by tools/build-client-bundle.mjs: everything the
  // alt:V-side fivem-client resource needs to host this server's FiveM
  // resources client-side (transformed scripts, ui_page, files list).
  buildClientPayload() {
    // `files` entries can be globs (esx_lib: 'imports/**/client.lua'), so the
    // concrete file list is expanded here AND small textual files are inlined
    // into fileContents — that is what LoadResourceFile() reads client-side.
    const MAX_FILE = 512 * 1024;
    const TEXTUAL = /\.(lua|js|json|txt|csv|xml|html?|css|yml|yaml)$/i;
    const resources = [];
    for (const [name, res] of this.engines) {
      if (res.status !== 'running') continue;
      const fileContents = {};
      for (const pat of (res.manifest && res.manifest.files) || []) {
        for (const rel of this.expandGlob(res.dir, pat)) {
          try {
            const p = path.join(res.dir, rel);
            const st = fs.statSync(p);
            if (!st.isFile() || st.size > MAX_FILE || !TEXTUAL.test(rel)) continue;
            fileContents[rel] = fs.readFileSync(p, 'utf8');
          } catch { /* unreadable — skip */ }
        }
      }
      resources.push({
        name,
        scripts: res.clientScripts || [],
        uiPage: (res.manifest && res.manifest.ui_page) || null,
        files: (res.manifest && res.manifest.files) || [],
        fileContents,
      });
    }
    return { resources };
  }

  // Expand a manifest `files`/script pattern to concrete RELATIVE paths:
  // `*` matches within one segment, `**` matches any number of directories
  // (FiveM fxmanifest semantics). Missing paths yield nothing.
  expandGlob(dir, rel) {
    rel = String(rel).trim().replace(/\\/g, '/').replace(/^\/+/, '');
    const segs = rel.split('/');
    const out = [];
    const walk = (base, i, acc) => {
      if (i >= segs.length) { out.push(acc); return; }
      const seg = segs[i];
      const isLast = i === segs.length - 1;
      if (seg === '**') {
        walk(base, i + 1, acc); // ** can match zero directories
        let subs = [];
        try { subs = fs.readdirSync(base, { withFileTypes: true }); } catch { return; }
        for (const e of subs) {
          if (e.isDirectory()) walk(path.join(base, e.name), i, acc ? acc + '/' + e.name : e.name);
        }
        return;
      }
      if (seg.includes('*')) {
        const rx = new RegExp('^' + seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
        let entries = [];
        try { entries = fs.readdirSync(base, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
          if (isLast ? (e.isFile() && rx.test(e.name)) : (e.isDirectory() && rx.test(e.name))) {
            walk(path.join(base, e.name), i + 1, acc + '/' + e.name);
          }
        }
        return;
      }
      const full = path.join(base, seg);
      try {
        const st = fs.statSync(full);
        if (isLast ? st.isFile() : st.isDirectory()) walk(full, i + 1, acc ? acc + '/' + seg : seg);
      } catch { /* missing — contributes nothing */ }
    };
    walk(dir, 0, '');
    return out.sort();
  }

  // Resolve a manifest script entry to actual files: expands * globs and
  // @resource/path imports (FiveM shared-lib pattern). @oxmysql's lib is
  // skipped because this runtime provides the MySQL API natively.
  resolveScripts(resName, dir, rel) {
    rel = String(rel).trim().replace(/\\/g, '/');
    if (rel.startsWith('@')) {
      const slash = rel.indexOf('/');
      const targetRes = rel.slice(1, slash);
      const targetPath = rel.slice(slash + 1);
      if (targetRes === 'oxmysql' || targetRes === 'mysql-async') {
        this.log(`@${targetRes} import '${targetPath}' skipped — native MySQL API is provided`);
        return [];
      }
      const r = this.engines.get(targetRes);
      if (!r) { this.logError(`@import '${rel}' failed — resource '${targetRes}' is not loaded`); return null; }
      const p = path.join(r.dir, targetPath);
      if (!fs.existsSync(p)) { this.logError(`@import '${rel}' failed — file not found`); return null; }
      return [p];
    }
    // glob expansion (* within a segment; ** across segments — e.g. es_extended
    // ships 'server/bridge/**/*.lua')
    if (rel.includes('*')) {
      if (rel.includes('**')) {
        return this.expandGlob(dir, rel).map((r) => path.join(dir, r));
      }
      const idx = rel.lastIndexOf('/');
      const dirPart = idx >= 0 ? rel.slice(0, idx) : '';
      const filePart = idx >= 0 ? rel.slice(idx + 1) : rel;
      const rx = new RegExp('^' + filePart.replace(/[.+^${}()|[\]]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
      const base = path.join(dir, dirPart);
      try {
        return fs.readdirSync(base, { withFileTypes: true })
          .filter((e) => e.isFile() && rx.test(e.name))
          .map((e) => path.join(base, e.name))
          .sort();
      } catch {
        return [];
      }
    }
    const p = path.join(dir, rel);
    if (!fs.existsSync(p)) { this.logError(`missing script: ${rel}`); return null; }
    return [p];
  }

  // ---------- async (MySQL) ----------
  asyncCall(id, callName, args, luaCallback) {
    const complete = (value) => {
      // ALWAYS defer: a synchronous adapter failure would otherwise resume a
      // coroutine while it is still running (and cross the JS C-boundary).
      // FiveM semantics: completions are always asynchronous.
      queueMicrotask(() => deliver(value));
    };
    const deliver = (value) => {
      const json = JSON.stringify(value === undefined ? null : value);
      if (luaCallback) {
        if (luaCallback.__luaCallbackId !== undefined) {
          try { this.lua.global.get('__deliverJsCallback')(luaCallback.__luaCallbackId, json); }
          catch (e) { this.logError('mysql callback:', e.message); }
        } else {
          try { luaCallback(json); } catch (e) { this.logError('mysql callback:', e.message); }
        }
        return;
      }
      try {
        this.lua.global.get('__asyncResume')(id, json);
      } catch (e) { this.logError('async resume:', e.message); }
    };
    const fail = (message) => complete({ __cfxError: true, message });

    if (!callName.startsWith('mysql:')) return fail(`unknown async op ${callName}`);
    const kind = callName.slice(6);
    if (!this.adapter.mysql) return fail('no database configured — copy mysql.json.example to mysql.json next to gtamp-server.exe and set your MariaDB credentials (see docs/QUICKSTART-FIVEM.md)');
    const sql = String(args[0]);
    let values;
    try { values = JSON.parse(String(args[1] || '{}')); } catch { values = {}; }

    if (kind === 'prepare') {
      // oxmysql MySQL.prepare: prepared path + documented unpacking —
      // "the SELECT statement will return a column, row, or array of rows
      //  depending on the number of columns and rows selected"
      // INSERT -> insertId, UPDATE/DELETE -> affectedRows.
      this.adapter.mysql.execute(sql, values)
        .then((result) => {
          const first = String(sql).trim().split(/\s+/)[0].toUpperCase();
          if (first === 'INSERT') return complete(result && result.insertId !== undefined ? result.insertId : null);
          if (first === 'UPDATE' || first === 'DELETE') return complete(result && result.affectedRows !== undefined ? result.affectedRows : null);
          if (Array.isArray(result) && result.length > 1) return complete(result); // array of rows
          const row = Array.isArray(result) ? result[0] : result;                  // 0 or 1 rows
          if (row && typeof row === 'object' && !Array.isArray(row)) {
            const keys = Object.keys(row);
            if (keys.length === 1) return complete(row[keys[0]]);                  // single column -> value
          }
          return complete(row === undefined ? null : row);
        })
        .catch((e) => fail(e && e.message ? e.message : String(e)));
      return;
    }
    if (kind === 'transaction') {
      let queries = null;
      try { queries = JSON.parse(sql); } catch { queries = null; }
      if (!Array.isArray(queries)) return fail('transaction expects an array of queries');
      if (typeof this.adapter.mysql.transaction !== 'function') {
        return fail('database adapter does not support transactions');
      }
      this.adapter.mysql.transaction(queries)
        .then((ok) => complete(ok === false ? false : true))
        .catch((e) => fail(e && e.message ? e.message : String(e)));
      return;
    }
    const op = kind === 'execute' ? 'execute' : 'query';
    this.adapter.mysql[op](sql, values)
      .then((result) => {
        if (kind === 'query') return complete(result);
        if (kind === 'execute') {
          // oxmysql parseResponse semantics for MySQL.execute:
          // INSERT -> insertId, UPDATE/DELETE -> affectedRows, else raw rows
          const first = String(sql).trim().split(/\s+/)[0].toUpperCase();
          if (first === 'INSERT') return complete(result && result.insertId !== undefined ? result.insertId : null);
          if (first === 'UPDATE' || first === 'DELETE') return complete(result && result.affectedRows !== undefined ? result.affectedRows : null);
          return complete(result);
        }
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
  // Resources call each other directly inside the VM (live values).
  // This is the JS-side entry for adapter code that needs to call a Lua export.
  callExportJson(resName, expName, args) {
    return this.lua.global.get('__callExportJson')(String(resName), String(expName), JSON.stringify(args || []));
  }

  // Await-capable export call: the export runs in its own Lua coroutine, so it
  // may MySQL.await / Wait; resolves with { ok, value, error } when done.
  callExportJsonAsync(resName, expName, args) {
    return new Promise((resolve) => {
      const id = ++this._exportCbNext;
      this._exportCbs.set(id, resolve);
      try {
        this.lua.global.get('__callExportJsonCo')(String(resName), String(expName), JSON.stringify(args || []), id);
      } catch (e) {
        this._exportCbs.delete(id);
        resolve({ ok: false, value: null, error: e && e.message ? e.message : String(e) });
      }
    });
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
    // Dispatch by integer id: the Lua-side registry owns the function (never
    // marshalled through JS), so handler coroutines can Wait/await freely.
    const src = (sourceId === null || sourceId === undefined) ? 0 : sourceId;
    try {
      this.lua.global.get('__dispatchHandlerById')(h.handlerId, src, ...args);
    } catch (e) {
      this.logError(`handler '${h.eventName || ''}' in '${h.resource.name}' failed: ${e && e.message ? e.message : e}`);
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
    const resName = this.commands.get(cmd);
    if (!resName) return false;
    const argString = parts.join(' ');
    const src = player && player.id !== undefined ? player.id : 0;
    try {
      this.lua.global.get('__dispatchCommand')(cmd, src, argString);
    } catch (e) {
      this.logError(`command '/${cmd}' failed: ${e && e.message ? e.message : e}`);
    }
    return true;
  }

  // ---------- natives ----------
  callNative(name, args) {
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
        return name === 'GetIdentifierCount' ? ids.length : (ids[Number(args[1])] || false);
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
