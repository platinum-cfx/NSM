-- NSM client-compat acceptance demo. Deliberately uses FiveM-fork syntax
-- (backtick table keys, compound assignment) to prove the transform runs
-- on client scripts too, plus the standard client API surface:
-- CreateThread/Wait, natives, net events, commands + key mapping,
-- NUI messages + callbacks, statebags, convars, exports.
local state = { ticks = 0, hudOpen = false }

-- backtick keys are the qb-core idiom (see qb-core shared/weapons.lua)
local cfg = { [`hud_title`] = 'NSM demo HUD', [`scale`] = 1.25 }
state.title = cfg.hud_title
state.scale = cfg.scale

local vec = vector3(10.5, 20.25, 30.125)
state.vecLen = #vec
state.convar = GetConvar('demo_convar', 'fallback')

AddEventHandler('onResourceStart', function(res)
  if res == GetCurrentResourceName() then
    state.sawOwnStart = true
  end
end)

CreateThread(function()
  while state.ticks < 6 do
    Wait(120)
    state.ticks += 1
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    if pos ~= nil then
      state.lastX = pos.x
      state.lastZ = pos.z
    end
  end
end)

CreateThread(function()
  -- multireturn native (bool + float), FiveM underscore spelling
  local ok, groundZ = GetGroundZFor_3dCoord(10.0, 20.0, 30.0, false)
  state.groundOk = ok
  state.groundZ = groundZ
  -- a native that exists on FiveM but is absent from the mock/alt module:
  -- must warn once and yield nil instead of crashing the resource
  state.sessionStarted = NetworkIsSessionStarted()
end)

RegisterNetEvent('client-demo:notify', function(msg)
  state.lastNotify = msg
  TriggerServerEvent('client-demo:ack', msg)
end)

RegisterCommand('demo_hud', function()
  state.hudOpen = not state.hudOpen
  SendNUIMessage({
    action = 'setVisible',
    visible = state.hudOpen,
    ticks = state.ticks,
    title = cfg.hud_title,
    pos = { x = vec.x, y = vec.y, z = vec.z },
  })
  SetNuiFocus(state.hudOpen, state.hudOpen)
end, false)

RegisterKeyMapping('demo_hud', 'Toggle the demo HUD', 'keyboard', 'F5')

RegisterNUICallback('nuiClosed', function(data, cb)
  state.hudOpen = false
  SetNuiFocus(false, false)
  state.libNotes = exports['client-demo-lib']:note('nui closed: ' .. tostring(data and data.reason))
  cb({ ok = true })
end)

AddStateBagChangeHandler('dead', nil, function(bag, key, value)
  state.sawDead = value
  state.sawDeadBag = bag
end)

exports('getState', function() return state end)
-- JSON view of the state for the acceptance harness (VM-agnostic channel)
exports('getStateJson', function() return __jsonEncode(state) end)
