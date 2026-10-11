-- ============ NSM FiveM CLIENT compatibility prelude ============
-- Runs once per Lua VM on the alt:V client (inside the fivem-client
-- resource's JS runtime). Provides the FiveM client-side Lua API surface
-- over a thin JS bridge layer installed by client/core.mjs:
--   __print/__logError, __setTimeoutRes, __native(name, ...),
--   __nativeLookup(name), __netEmitServer(name, json), __netDispatch,
--   __stateChange, __nuiSend/__nuiFocus/__nuiInvokeCb/__nuiRespond,
--   __registerKeybind, __executeCommand, __getConvar, __kvpGet/__kvpSet,
--   __joaat
-- Lua 5.3 compatible (runs on fengari; no FiveM-fork syntax in THIS file:
-- resource scripts are transformed to plain Lua before they get here).

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
    if c == ' ' or c == '\t' or c == '\n' or c == '\r' then i = i + 1 else break end
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
    if c == __BS then
      local e = s:sub(i+1, i+1)
      if e == 'n' then out[#out+1] = '\n'; i = i + 2
      elseif e == 't' then out[#out+1] = '\t'; i = i + 2
      elseif e == 'r' then out[#out+1] = '\r'; i = i + 2
      elseif e == 'u' then
        local hex = s:sub(i+2, i+5)
        local code = tonumber(hex, 16)
        if code and code < 128 then out[#out+1] = string.char(code)
        elseif code then
          -- utf-8 encode (basic plane)
          if code < 2048 then
            out[#out+1] = string.char(192 + math.floor(code / 64), 128 + code % 64)
          else
            out[#out+1] = string.char(224 + math.floor(code / 4096), 128 + math.floor(code / 64) % 64, 128 + code % 64)
          end
        else out[#out+1] = '?' end
        i = i + 6
      else out[#out+1] = e; i = i + 2 end
    else
      out[#out+1] = c; i = i + 1
    end
  end
  return nil, i
end

local function parseNumber(s, i)
  local j = i
  while j <= #s do
    local c = s:sub(j, j)
    if c:match('[%-%+%.eE0-9]') then j = j + 1 else break end
  end
  return tonumber(s:sub(i, j - 1)) or 0, j
end

parseValue = function(s, i)
  i = skipws(s, i)
  local c = s:sub(i, i)
  if c == '[' then
    i = skipws(s, i + 1)
    local t = {}
    if s:sub(i, i) == ']' then return t, i + 1 end
    while i <= #s do
      local val, nj = parseValue(s, i)
      t[#t+1] = val
      i = skipws(s, nj)
      local d = s:sub(i, i)
      if d == ',' then i = skipws(s, i + 1)
      elseif d == ']' then return t, i + 1
      else break end
    end
    return t, i
  elseif c == '{' then
    i = skipws(s, i + 1)
    local t = {}
    if s:sub(i, i) == '}' then return t, i + 1 end
    while i <= #s do
      i = skipws(s, i)
      if s:sub(i, i) == '"' then
        local key, ni = parseString(s, i)
        i = skipws(s, ni + 1) -- skip colon
        local val, nj = parseValue(s, i)
        t[key] = val
        i = skipws(s, nj)
      else
        local val, nj = parseValue(s, i)
        t[#t+1] = val
        i = skipws(s, nj)
      end
      local d = s:sub(i, i)
      if d == ',' then i = skipws(s, i + 1)
      elseif d == '}' then return t, i + 1
      else break end
    end
    return t, i
  elseif c == '"' then return parseString(s, i)
  elseif c == 't' then return true, i + 4
  elseif c == 'f' then return false, i + 5
  elseif c == 'n' then return nil, i + 4
  else return parseNumber(s, i) end
end

__jsonDecode = function(s)
  if type(s) ~= 'string' or #s == 0 then return nil end
  local v = parseValue(s, 1)
  return v
end

-- ---------- thread scheduler (same proven pattern as the server) ----------
__coResources = {}

local __schedule
local function __handleYield(co, yielded)
  if coroutine.status(co) ~= 'suspended' then return end
  if yielded == '__cfx_await__' then return end
  __schedule(co, tonumber(yielded) or 0)
end

__schedule = function(co, delay)
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
  local co = coroutine.create(fn)
  __coResources[co] = __currentResource or nil
  __schedule(co, 0)
end

function CitizenWait(ms) return coroutine.yield(ms or 0) end
Wait = CitizenWait
Citizen = { Wait = CitizenWait, CreateThread = CreateThread }

function SetTimeout(ms, fn)
  local co = coroutine.create(fn)
  __coResources[co] = __currentResource or nil
  __schedule(co, tonumber(ms) or 0)
  return 0
end
function ClearTimeout() end

-- ---------- vectors (FiveM vector3 semantics, table-based) ----------
local vmt
vmt = {
  __add = function(a, b) return vector3(a.x + b.x, a.y + b.y, a.z + b.z) end,
  __sub = function(a, b) return vector3(a.x - b.x, a.y - b.y, a.z - b.z) end,
  __mul = function(a, b)
    if type(a) == 'number' then return vector3(a * b.x, a * b.y, a * b.z) end
    if type(b) == 'number' then return vector3(a.x * b, a.y * b, a.z * b) end
    return vector3(a.x * b.x, a.y * b.y, a.z * b.z)
  end,
  __div = function(a, b)
    if type(b) == 'number' then return vector3(a.x / b, a.y / b, a.z / b) end
    return vector3(a.x / b.x, a.y / b.y, a.z / b.z)
  end,
  __unm = function(a) return vector3(-a.x, -a.y, -a.z) end,
  __eq = function(a, b) return a.x == b.x and a.y == b.y and a.z == b.z end,
  __len = function(a) return math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) end,
  __tostring = function(a) return 'vector3(' .. tostring(a.x) .. ', ' .. tostring(a.y) .. ', ' .. tostring(a.z) .. ')' end,
  __index = function(v, k)
    if k == 1 then return v.x end
    if k == 2 then return v.y end
    if k == 3 then return v.z end
  end,
}
function vector3(x, y, z) return setmetatable({ x = x or 0, y = y or 0, z = z or 0 }, vmt) end
function vector2(x, y) return setmetatable({ x = x or 0, y = y or 0 }, vmt) end
function vector4(x, y, z, w) return setmetatable({ x = x or 0, y = y or 0, z = z or 0, w = w or 0 }, vmt) end

-- ---------- natives: lazy proxy over the JS natives module ----------
-- alt:V exposes GTA natives in JS as lowerCamelCase; FiveM Lua uses
-- PascalCase. Resolution + caching happens here; invocation goes through
-- __native which marshals args/results (arrays become multiple returns).
local __nativeCache = {}
-- natives whose multi-return must be spread even though it is 3 numbers
-- (heuristic treats 3-number results as a vector3, FiveM-style)
__nativeSpread = {
  GetHudColour = true, GetHudColourName = true, GetRGBFromInt = true,
}

local function nativeCall(name, ...)
  local res = table.pack(__native(name, ...))
  local n = res.n
  if n == 0 then return end
  if n == 3 and type(res[1]) == 'number' and type(res[2]) == 'number'
      and type(res[3]) == 'number' and not __nativeSpread[name] then
    return vector3(res[1], res[2], res[3])
  end
  return table.unpack(res, 1, n)
end

setmetatable(_G, {
  __index = function(_, k)
    if type(k) ~= 'string' then return nil end
    local hit = __nativeCache[k]
    if hit ~= nil then return hit end
    if __nativeLookup(k) then
      local function fn(...) return nativeCall(k, ...) end
      __nativeCache[k] = fn
      rawset(_G, k, fn)
      return fn
    end
    return nil
  end,
})

-- ---------- misc FiveM globals ----------
function IsDuplicityVersion() return false end
function GetGameName() return 'fivem' end
function GetHashKey(s) return __joaat(s) end
function joaat(s) return __joaat(s) end
function GetResourceState(res) return __resourceState and __resourceState(res) or 'started' end
function GetInvokingResource() return __currentResource end
function LoadResourceFile(res, file) return __readResourceFile and __readResourceFile(res, file) or nil end
function HasStreamLoaded() return true end

-- ---------- events ----------
-- Lua-side registry: eventName -> { {res=..., fn=...}, ... }
__eventHandlers = {}

function AddEventHandler(evName, fn)
  if type(fn) ~= 'function' then return end
  __eventHandlers[evName] = __eventHandlers[evName] or {}
  __eventHandlers[evName][#__eventHandlers[evName] + 1] = { res = __currentResource, fn = fn }
end

function RegisterNetEvent(evName, fn)
  if fn ~= nil then AddEventHandler(evName, fn) end
end
RegisterServerEvent = RegisterNetEvent

function RemoveEventHandler() end

function TriggerEvent(evName, ...)
  local list = __eventHandlers[evName]
  if not list then return end
  for i = 1, #list do
    local ok, err = pcall(list[i].fn, ...)
    if not ok then __logError('[event] ' .. tostring(evName) .. ': ' .. tostring(err)) end
  end
end

function TriggerServerEvent(evName, ...)
  __netEmitServer(evName, jenc({ ... }))
end
TriggerLatentServerEvent = TriggerServerEvent

function CancelEvent() end
function WasEventCanceled() return false end

-- net dispatch: called by JS when the server sends us a FiveM event.
-- argsJson is a JSON array of arguments.
function __netDispatch(evName, argsJson)
  local args = __jsonDecode(argsJson) or {}
  local list = __eventHandlers[evName]
  if not list then return end
  for i = 1, #list do
    local ok, err = pcall(list[i].fn, table.unpack(args, 1, #args))
    if not ok then __logError('[net] ' .. tostring(evName) .. ': ' .. tostring(err)) end
  end
end

-- ---------- statebags (client-side read + change handlers) ----------
-- The server pushes __stateChange(target, key, json); the cache is local.
__stateCache = {}          -- target -> table
__stateHandlers = {}       -- { {keyFilter, filter, fn} }

local function stateTable(target)
  __stateCache[target] = __stateCache[target] or {}
  return __stateCache[target]
end

local function stateProxy(target)
  local proxy
  proxy = setmetatable({}, {
    __index = function(_, k) return stateTable(target)[k] end,
    __newindex = function(_, k, v)
      if k == '__set' then rawset(proxy, '__set', v) return end
      stateTable(target)[k] = v
      -- client writes replicate up in FiveM; here they stay local (documented gap)
    end,
  })
  return proxy
end

function Entity(handleOrNetId) return { state = stateProxy('entity:' .. tostring(handleOrNetId)) } end
function Player(serverId) return { state = stateProxy('player:' .. tostring(serverId)) } end
LocalPlayer = { state = stateProxy('local') }

function AddStateBagChangeHandler(keyFilter, filter, fn)
  if type(fn) ~= 'function' then
    fn = filter; filter = nil
  end
  __stateHandlers[#__stateHandlers + 1] = { keyFilter = keyFilter, filter = filter, fn = fn }
end

function __stateChange(target, key, valueJson)
  local v = __jsonDecode(valueJson)
  stateTable(target)[key] = v
  local bagName = target:match('^entity:(.+)$') or target:match('^player:(.+)$') or target
  for i = 1, #__stateHandlers do
    local h = __stateHandlers[i]
    if h.keyFilter == nil or h.keyFilter == '*' or h.keyFilter == key then
      if h.filter == nil or h.filter == bagName then
        local ok, err = pcall(h.fn, bagName, key, v, false)
        if not ok then __logError('[statebag] ' .. tostring(err)) end
      end
    end
  end
end

-- ---------- convars + kvp ----------
function GetConvar(k, default)
  local v = __getConvar(k)
  if v == false or v == nil then return default end
  return v
end
GetConvarReplicated = GetConvar
function GetResourceKvp(k) return __kvpGet(k) end
function SetResourceKvp(k, v) __kvpSet(k, v) end
function SetResourceKvpNoSync(k, v) __kvpSet(k, v) end

-- ---------- commands + key mapping ----------
-- client commands are LOCAL (invoked via keybinds / ExecuteCommand)
__commands = {}

function RegisterCommand(cmdName, fn, restricted)
  if type(fn) ~= 'function' then return end
  __commands[tostring(cmdName):lower()] = { res = __currentResource, fn = fn }
end

function RegisterKeyMapping(commandName, description, defaultMapper, defaultParameter)
  __registerKeybind(tostring(commandName), tostring(description or ''),
    tostring(defaultParameter or defaultMapper or ''))
end

function ExecuteCommand(cmd)
  __executeCommand(tostring(cmd))
end

function __execCommand(cmdName, argsJson)
  local entry = __commands[tostring(cmdName):lower()]
  if not entry then return false end
  local args = __jsonDecode(argsJson or '[]') or {}
  local prev = __currentResource
  __currentResource = entry.res
  local ok, err = pcall(entry.fn, 0, args, '')
  __currentResource = prev
  if not ok then __logError('[command] ' .. tostring(cmdName) .. ': ' .. tostring(err)) end
  return true
end

-- ---------- NUI callback registry ----------
-- resource/cbName -> Lua function (registered per-env via RegisterNUICallback)
__nuiRegister = {}

-- ---------- per-resource environment factory ----------
__envs = {}
__exportsRegistry = {}
__currentResource = nil

function __makeEnv(name)
  local env = {}
  setmetatable(env, { __index = _G })

  env.__resourceName = name
  env.source = 0

  env.GetCurrentResourceName = function() return name end
  env.GetInvokingResource = function() return name end
  env.GetParentResourceName = function() return name end

  env.print = function(...) __print('[' .. name .. ']', ...) end
  env.warn = function(...) __print('[' .. name .. '] [warn]', ...) end

  -- NUI (per resource: the webview belongs to the owning resource)
  env.SendNUIMessage = function(data) __nuiSend(name, jenc(data)) end
  env.SetNuiFocus = function(hasFocus, hasCursor) __nuiFocus(name, hasFocus == true, hasCursor == true) end
  env.SetNuiFocusKeepInput = function(keep) __nuiKeepInput(name, keep == true) end
  env.SetNuiFocusShapeEnterEnabled = function() end
  env.RegisterNUICallback = function(cbName, fn)
    __nuiRegister[name .. '/' .. tostring(cbName)] = fn
  end
  env.RegisterRawNuiCallback = env.RegisterNUICallback

  -- attributed threads
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

  -- exports (live, in-VM; same semantics as the server runtime)
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
            local results = table.pack(pcall(fn, table.unpack(a, 1, #a)))
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

  __envs[name] = env
  return env
end

-- load + run one already-transformed client script inside its resource env
function __loadClientScript(resName, chunkName, src)
  local env = __envs[resName] or __makeEnv(resName)
  local prev = __currentResource
  __currentResource = resName
  local chunk, err = load(src, chunkName, 't', env)
  if not chunk then
    __currentResource = prev
    __logError('[' .. resName .. '] failed to compile ' .. tostring(chunkName) .. ': ' .. tostring(err))
    return false
  end
  local ok, rerr = pcall(chunk)
  __currentResource = prev
  if not ok then
    __logError('[' .. resName .. '] error in ' .. tostring(chunkName) .. ': ' .. tostring(rerr))
    return false
  end
  -- FiveM fires onResourceStart on the client once the resource's scripts ran
  TriggerEvent('onResourceStart', resName)
  return true
end

-- test/interop helper: call a resource export from JS
function __callExport(resName, expName, argsJson)
  local args = __jsonDecode(argsJson or '[]') or {}
  local reg = __exportsRegistry[resName]
  local fn = reg and reg[expName]
  if not fn then return nil end
  local results = table.pack(pcall(fn, table.unpack(args, 1, #args)))
  if not results[1] then
    error('__callExport: ' .. tostring(results[2]), 2)
  end
  if results.n < 2 then return nil end
  return results[2]
end

-- NUI callback dispatch (JS calls this when the page posts a callback)
function __nuiInvokeCb(resName, cbName, bodyJson, token)
  local fn = __nuiRegister[resName .. '/' .. tostring(cbName)]
  if fn == nil then
    __nuiRespond(token, '{"__missing":true}')
    return
  end
  local body = __jsonDecode(bodyJson)
  local prev = __currentResource
  __currentResource = resName
  local ok, err = pcall(fn, body, function(resp)
    __nuiRespond(token, jenc(resp))
  end)
  __currentResource = prev
  if not ok then
    __logError('[nui] callback ' .. tostring(resName) .. '/' .. tostring(cbName) .. ': ' .. tostring(err))
    __nuiRespond(token, '{"__error":true}')
  end
end
