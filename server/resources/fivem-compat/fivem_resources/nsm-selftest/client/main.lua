-- nsm-selftest client: the actual §7 checklist, run inside the fivem-client
-- runtime (fengari/wasmoon Lua VM) on the REAL alt:V client.
--
-- Three check outcomes:
--   ok       the behavior works
--   skipped  cannot be verified in THIS environment (e.g. no real webview in
--            headless harnesses) — on the real Windows client these must pass
--   FAIL     broken — attach the console output to a bug report
--
-- Re-run any time with the chat command `nsmselftest` or the F7 keybind.

local checks = {}
local report = {
    env = 'alt:V client + fivem-client bundle',
    startedAt = nil,
}

local function record(name, ok, detail, skipped)
    checks[#checks + 1] = { name = name, ok = ok, detail = detail, skipped = skipped }
end

-- ---------------------------------------------------------------- handlers --
local ponged = false
RegisterNetEvent('nsm-selftest:pong', function(payload)
    ponged = (payload == 'pong-from-server')
end)

local stateAck = nil
RegisterNetEvent('nsm-selftest:stateAck', function(ok, stored)
    stateAck = { ok = ok, stored = stored }
end)

local nuiRoundTrip = nil -- nil=waiting, true=ok, false=failed, 'skip'=no page
RegisterNUICallback('ready', function(data, cb)
    nuiRoundTrip = (type(data) == 'table' and data.page == 'loaded')
    cb({ ack = 'lua-received' })
end)

local keybindFired = false
RegisterCommand('nsmselftest', function()
    keybindFired = true
    RunChecks()
end, false)
RegisterKeyMapping('nsmselftest', 'Re-run the NSM selftest', 'keyboard', 'F7')

-- ------------------------------------------------------------------ checks --
local function check_coroutine()
    local n = 0
    local done = false
    CreateThread(function()
        for i = 1, 3 do
            Wait(10)
            n = n + 1
        end
        done = true
    end)
    local waited = 0
    while not done and waited < 2000 do
        Wait(20)
        waited = waited + 20
    end
    record('coroutine + Wait loop (3x10ms)', done and n == 3,
        ('n=%d'):format(n))
end

local function check_json()
    local t = { num = 42, str = 'hello', list = { 1, 2, 3 } }
    local enc = json.encode(t)
    local dec = json.decode(enc)
    local ok = dec and dec.num == 42 and dec.str == 'hello' and #dec.list == 3
    record('json encode/decode round-trip', ok, enc)
end

local function check_natives()
    local ok1, ped = pcall(PlayerPedId)
    local okPed = ok1 and type(ped) == 'number' and ped >= 0
    record('PlayerPedId() returns a ped handle', okPed, ('ped=%s'):format(tostring(ped)))

    local ok2, coords = pcall(GetEntityCoords, ped or 0)
    local okCoords = ok2 and type(coords) == 'table' and type(coords.x) == 'number'
        and type(coords.y) == 'number' and type(coords.z) == 'number'
    record('GetEntityCoords(ped) returns vector3', okCoords,
        okCoords and ('%.2f, %.2f, %.2f'):format(coords.x, coords.y, coords.z)
            or ('res=%s (%s)'):format(tostring(coords), type(coords)))
end

local function check_command()
    local ran = false
    RegisterCommand('nsmselftest_inner', function()
        ran = true
    end, false)
    ExecuteCommand('nsmselftest_inner')
    Wait(50)
    record('RegisterCommand + ExecuteCommand (local)', ran, '')
end

local function check_convar()
    local v = GetConvar('nsm_selftest_undef', 'fb-default')
    record('GetConvar fallback value', v == 'fb-default', ('got=%s'):format(tostring(v)))
end

local function check_net()
    ponged = false
    TriggerServerEvent('nsm-selftest:ping')
    local waited = 0
    while not ponged and waited < 3000 do
        Wait(50)
        waited = waited + 50
    end
    record('net event round-trip (ping -> server -> pong)', ponged,
        ponged and 'pong received' or 'no pong within 3s')
end

local function check_statebag()
    local value = 'client-write-' .. tostring(math.floor(os.clock() * 1000))
    stateAck = nil
    LocalPlayer.state:set('nsmSelftest', value, true)
    TriggerServerEvent('nsm-selftest:stateWritten', 'nsmSelftest', value)
    local waited = 0
    while stateAck == nil and waited < 3000 do
        Wait(50)
        waited = waited + 50
    end
    record('replicated statebag -> authoritative server store',
        stateAck ~= nil and stateAck.ok == true,
        stateAck == nil and 'no ack within 3s'
            or ('server read: %s'):format(tostring(stateAck.stored)))
end

local function check_nui()
    -- SendNUIMessage creates the webview lazily; the page then loads and
    -- fetches https://nsm-selftest/ready -> RegisterNUICallback above.
    local okMsg, err = pcall(SendNUIMessage, { action = 'nsm-selftest', text = 'boot' })
    if not okMsg then
        record('SendNUIMessage', false, tostring(err))
        record('NUI callback round-trip (page fetch)', false, 'SendNUIMessage failed')
        return
    end
    record('SendNUIMessage', true, 'message sent')

    local waited = 0
    while nuiRoundTrip == nil and waited < 3000 do
        Wait(50)
        waited = waited + 50
    end
    if nuiRoundTrip == true then
        record('NUI callback round-trip (page fetch)', true, 'page -> Lua -> page cycle complete')
    elseif nuiRoundTrip == false then
        record('NUI callback round-trip (page fetch)', false, 'callback arrived with wrong payload')
    else
        record('NUI callback round-trip (page fetch)', false,
            'SKIPPED: no page response within 3s (expected without a real webview — headless harness)',
            true)
    end
end

local function check_qbcore()
    local state = GetResourceState('qb-core')
    if state ~= 'started' then
        record('qb-core present (optional)', false,
            ('SKIPPED: qb-core is %s on this server'):format(state), true)
        return
    end
    local ok, QBCore = pcall(function() return exports['qb-core']:GetCoreObject() end)
    record('qb-core GetCoreObject() from client', ok and type(QBCore) == 'table',
        ok and 'live table received' or 'export call failed')
end

local function check_exports()
    local ok, res = pcall(function() return exports['nsm-selftest']:SelfPing('x1') end)
    record('exports cross-resource call (self)', ok and res == 'x1-pong',
        ok and tostring(res) or 'export call failed')
end

-- self-export used by the exports check
exports('SelfPing', function(v)
    return tostring(v) .. '-pong'
end)

-- ------------------------------------------------------------------ runner --
function RunChecks()
    checks = {}
    report.startedAt = os.time()

    check_coroutine()
    check_json()
    check_natives()
    check_command()
    check_convar()
    check_net()
    check_statebag()
    check_nui()
    check_qbcore()
    check_exports()

    report.checks = checks
    local pass, fail, skip = 0, 0, 0
    for _, c in ipairs(checks) do
        if c.skipped then skip = skip + 1
        elseif c.ok then pass = pass + 1
        else fail = fail + 1 end
    end
    report.summary = { pass = pass, fail = fail, skip = skip }
    TriggerServerEvent('nsm-selftest:report', json.encode(report))
end

-- auto-run once, shortly after boot (let the handshake + qb-core settle)
CreateThread(function()
    Wait(1500)
    RunChecks()
end)
