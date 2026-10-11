-- mp-demo client: runs inside the real fivem-client runtime (fengari VM).
-- State is exposed as JSON through an export for harness assertions.
local state = { pongs = {}, bcasts = {}, cmdoks = {}, stateSeen = {}, isLoggedIn = nil, ownServerId = -1 }

RegisterNetEvent('mp-demo:client:pong', function(msg)
    state.pongs[#state.pongs + 1] = msg
end)

RegisterNetEvent('mp-demo:client:bcast', function(text)
    state.bcasts[#state.bcasts + 1] = text
end)

RegisterNetEvent('mp-demo:client:cmdok', function(msg)
    state.cmdoks[#state.cmdoks + 1] = msg
end)

AddStateBagChangeHandler('mpdemo', nil, function(bag, key, value)
    state.stateSeen[#state.stateSeen + 1] = { bag = bag, value = value }
end)

-- client -> server round trip: the reply carries our player name (identity),
-- and the server records the ping in MariaDB with our source id. The server
-- id is read DYNAMICALLY (the handshake completes right after boot).
CreateThread(function()
    Wait(400)
    state.ownServerId = GetPlayerServerId(PlayerId())
    TriggerServerEvent('mp-demo:server:ping', 'hello-from-' .. tostring(state.ownServerId))
end)

-- replicated statebag write from the owner client: server is authoritative,
-- stores it and replicates to every client (including back to us)
CreateThread(function()
    Wait(700)
    LocalPlayer.state:set('mpdemo', 'set-by-client-' .. tostring(GetPlayerServerId(PlayerId())), true)
end)

-- qb-core's real client flow: after loading, tell the server; qb-core replies
-- 'QBCore:Client:OnPlayerLoaded' and its own client handler sets
-- LocalPlayer.state.isLoggedIn (local-only statebag write).
CreateThread(function()
    Wait(1000)
    TriggerServerEvent('QBCore:Server:OnPlayerLoaded')
    Wait(250)
    state.isLoggedIn = LocalPlayer.state.isLoggedIn
end)

exports('getStateJson', function() return __jsonEncode(state) end)
exports('broadcast', function(text) TriggerServerEvent('mp-demo:server:broadcast', text) end)
